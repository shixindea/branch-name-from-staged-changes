const vscode = require("vscode");
const path = require("path");
const util = require("util");
const childProcess = require("child_process");

const execAsync = util.promisify(childProcess.exec);

async function getWorkspaceRoot() {
  const folders = vscode.workspace.workspaceFolders;
  if (!folders || folders.length === 0) {
    return undefined;
  }
  return folders[0].uri.fsPath;
}

async function isInsideGitRepository(cwd) {
  try {
    const result = await execAsync("git rev-parse --is-inside-work-tree", {
      cwd,
    });
    return result.stdout.trim() === "true";
  } catch (_) {
    return false;
  }
}

async function getStagedFiles(cwd) {
  const result = await execAsync("git diff --cached --name-only", {
    cwd,
  });
  return result.stdout
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function inferScopeFromFiles(files) {
  const counts = new Map();
  for (const file of files) {
    const segments = file.split(/[\\/]/);
    if (segments.length === 0) {
      continue;
    }
    const scope = segments[0].toLowerCase();
    const value = counts.get(scope) || 0;
    counts.set(scope, value + 1);
  }
  if (counts.size === 0) {
    return undefined;
  }
  let bestScope = undefined;
  let bestCount = -1;
  for (const [scope, count] of counts.entries()) {
    if (count > bestCount) {
      bestScope = scope;
      bestCount = count;
    }
  }
  return bestScope;
}

function extractKeywordsFromFiles(files) {
  const tokens = [];
  for (const file of files) {
    const base = path.basename(file, path.extname(file));
    const replaced = base.replace(/[_\.]+/g, " ");
    const split = replaced.split(/[^a-zA-Z0-9]+/);
    for (const raw of split) {
      const t = raw.toLowerCase();
      if (!t) {
        continue;
      }
      if (t.length < 3) {
        continue;
      }
      tokens.push(t);
    }
  }
  const unique = [];
  const seen = new Set();
  for (const t of tokens) {
    if (!seen.has(t)) {
      seen.add(t);
      unique.push(t);
    }
    if (unique.length >= 4) {
      break;
    }
  }
  if (unique.length === 0) {
    return ["change"];
  }
  return unique;
}

function sanitizeBranchName(name) {
  let result = name.toLowerCase();
  result = result.replace(/[^a-z0-9/_-]+/g, "-");
  result = result.replace(/-+/g, "-");
  result = result.replace(/\/+/g, "/");
  result = result.replace(/^[-/]+/, "");
  result = result.replace(/[-/]+$/, "");
  if (result.length === 0) {
    return "feat/change";
  }
  if (result.length > 60) {
    result = result.slice(0, 60);
    result = result.replace(/[-/]+$/, "");
  }
  return result;
}

function generateBranchNameFromFiles(files) {
  const scope = inferScopeFromFiles(files);
  const keywords = extractKeywordsFromFiles(files);
  const scopePart = scope ? `${scope}-` : "";
  const keywordPart = keywords.join("-");
  const raw = `feat/${scopePart}${keywordPart}`;
  return sanitizeBranchName(raw);
}

async function generateBranchNameCommand() {
  const root = await getWorkspaceRoot();
  if (!root) {
    vscode.window.showErrorMessage("未找到工作区，无法生成分支名");
    return;
  }
  const insideGit = await isInsideGitRepository(root);
  if (!insideGit) {
    vscode.window.showErrorMessage("当前工作区不是 Git 仓库");
    return;
  }
  const files = await getStagedFiles(root);
  if (!files.length) {
    vscode.window.showInformationMessage("当前没有任何暂存的更改");
    return;
  }
  const branchName = generateBranchNameFromFiles(files);
  await vscode.env.clipboard.writeText(branchName);
  vscode.window.showInformationMessage(
    `已根据暂存区更改生成分支名并复制到剪贴板: ${branchName}`
  );
}

function activate(context) {
  const disposable = vscode.commands.registerCommand(
    "branchNameFromStagedChanges.generate",
    generateBranchNameCommand
  );
  context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};

