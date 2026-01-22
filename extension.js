const vscode = require('vscode');
const util = require('util');
const childProcess = require('child_process');
const https = require('https');

const execAsync = util.promisify(childProcess.exec);

let apConfig = null;
try {
  // eslint-disable-next-line global-require, import/no-unresolved
  apConfig = require('./ap-config');
} catch (e) {}

/**
 * 1️⃣ 判断分支类型
 */
function detectBranchType(message) {
  const msg = message.toLowerCase();

  if (/^feat[:(]|新增|支持|增加|实现/.test(msg)) return 'feat';
  if (/^fix[:(]|修复|解决|bug|问题|异常/.test(msg)) return 'fix';
  if (/^refactor[:(]|重构|整理|拆分|优化结构/.test(msg)) return 'refactor';
  if (/^test[:(]|测试/.test(msg)) return 'test';
  if (/^chore[:(]|配置|依赖|脚本|ci|构建/.test(msg)) return 'chore';

  return 'feat';
}

/**
 * 2️⃣ 提取描述关键词（不看路径）
 */
function extractKeywords(text) {
  const cleaned = text
    .replace(/^(feat|fix|refactor|test|chore)(\(.+\))?:?/i, '')
    .toLowerCase();

  const words = cleaned
    .replace(/[_./]/g, ' ')
    .split(/[^a-z0-9\u4e00-\u9fa5]+/)
    .filter(w => w.length >= 2);

  const result = [];
  const seen = new Set();

  for (const w of words) {
    if (!seen.has(w)) {
      seen.add(w);
      result.push(w);
    }
    if (result.length >= 3) break;
  }

  return result.length ? result.join('-') : 'change';
}

function sanitize(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9/_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/\/+/g, '/')
    .replace(/^[-/]+|[-/]+$/g, '')
    .slice(0, 60);
}

function limitDescWords(desc) {
  const parts = String(desc || '')
    .split('-')
    .filter(Boolean);
  const limited = parts.slice(0, 3);
  return limited.length ? limited.join('-') : 'change';
}

/**
 * 4️⃣ 生成分支名
 */
function generateBranchName(message) {
  const type = detectBranchType(message);
  const desc = limitDescWords(extractKeywords(message));
  return sanitize(`${type}/${desc}`);
}

async function generateBranchNameFromAp(message) {
  if (
    !apConfig ||
    !apConfig.AP_API_KEY ||
    !apConfig.AP_API_URL ||
    !apConfig.AP_MODEL
  ) {
    return null;
  }

  const payload = JSON.stringify({
    model: apConfig.AP_MODEL,
    messages: [
      {
        role: 'system',
        content:
          '你是一个 Git 分支命名助手，只返回一个分支名，格式类似 feat/xxx，不要输出多余解释。'
      },
      {
        role: 'user',
        content: message
      }
    ],
    temperature: 0.2,
    max_tokens: 20
  });

  const url = new URL(apConfig.AP_API_URL);
  const options = {
    method: 'POST',
    hostname: url.hostname,
    path: url.pathname + url.search,
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
      Authorization: `Bearer ${apConfig.AP_API_KEY}`
    }
  };

  return new Promise(resolve => {
    const req = https.request(options, res => {
      let data = '';

      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const content =
            json &&
            json.choices &&
            json.choices[0] &&
            json.choices[0].message &&
            json.choices[0].message.content;

          if (!content) {
            resolve(null);
            return;
          }

          const raw = String(content).trim();
          const sanitized = sanitize(raw);

          const parts = sanitized.split('/');
          if (parts.length < 2) {
            const limitedOnly = limitDescWords(sanitized);
            resolve(limitedOnly || null);
            return;
          }

          const type = parts[0] || detectBranchType(raw);
          const desc = parts.slice(1).join('-');
          const limitedDesc = limitDescWords(desc);
          const finalName = sanitize(`${type}/${limitedDesc}`);

          resolve(finalName || null);
        } catch (err) {
          resolve(null);
        }
      });
    });

    req.on('error', () => {
      resolve(null);
    });

    req.write(payload);
    req.end();
  });
}

/**
 * 命令入口
 */
async function generateBranchCommand() {
  const message = await vscode.window.showInputBox({
    prompt: '输入 commit message（用于生成分支名）',
    placeHolder: '例如：fix: 修复录音结束后状态异常'
  });

  if (!message) return;

  const ruleBranchName = generateBranchName(message);
  const aiBranchName = await generateBranchNameFromAp(message);
  const branchName = aiBranchName || ruleBranchName;
  const from = aiBranchName ? '大模型生成的分支名：' : '规则生成的分支名：';

  await vscode.env.clipboard.writeText(branchName);
  vscode.window.showInformationMessage(`${from}${branchName}，已复制到剪贴板`);
}

/**
 * VSCode 生命周期
 */
function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'branchNameFromStagedChanges.generate',
      generateBranchCommand
    )
  );
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
