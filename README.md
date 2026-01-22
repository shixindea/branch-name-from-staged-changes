# Branch Name From Commit Message

GitHub 仓库：https://github.com/shixindea/branch-name-from-staged-changes

根据 **commit 文本** 自动生成一个分支名称，可选接入 Kimi 大模型，并自动复制到剪贴板。

## 功能简介

- 输入一段 commit 文本（如你准备提交的 commit message）
- 基于规则识别分支类型（feat / fix / refactor / test / chore）
- 从描述中提取最多三段关键词，生成形如 `feat/fix-login-bug` 的分支名
- 如果配置了 Kimi（Moonshot）API，则优先由大模型生成更自然的分支名
- 支持在 VS Code 命令面板中一键触发，并自动复制到剪贴板

典型生成示例：

- `feat/add-user-login`
- `fix/record-status-error`
- `refactor/audio-module`
- `feat/change`（没有明显关键词时的兜底方案）

## 使用方式

### 1. 打开项目

在 VS Code 中打开你的 Git 仓库所在的文件夹。

### 2. 可选：配置 Kimi 大模型（Moonshot）

如果你希望由 Kimi 来帮你生成更智能的分支名，可以在扩展根目录创建一个 `ap-config.js` 文件（该文件已被 `.gitignore` 忽略，不会提交到 Git）：

```js
module.exports = {
  AP_API_KEY: 'YOUR_KIMI_API_KEY',
  AP_API_URL: 'https://api.moonshot.cn/v1/chat/completions',
  AP_MODEL: 'moonshot-v1-8k'
};
```

不配置 `ap-config.js` 也可以正常使用，此时仅使用本地规则生成分支名。

### 3. 执行命令生成分支名

在 VS Code 中：

- 按 `Ctrl + Shift + P` 打开命令面板
- 输入：`根据 commit 文本生成分支名`
- 选择对应命令（ID: `branchNameFromStagedChanges.generate`）
- 输入本次提交的 commit 文本，例如：

  ```text
  fix: 修复录音结束后状态异常
  ```

扩展会：

- 尝试调用 Kimi（如已配置）生成一个分支名
- 如果调用失败或未配置，则使用内置规则生成分支名

### 4. 查看结果

生成分支名后，扩展会将分支名自动复制到系统剪贴板，并在右下角提示，例如：

> 大模型生成的分支名：`fix/record-status-error`，已复制到剪贴板

或：

> 规则生成的分支名：`fix/record-status-error`，已复制到剪贴板

你可以直接在终端中粘贴使用，例如：

```bash
git checkout -b fix/record-status-error
```
