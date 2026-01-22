# Branch Name From Staged Changes

GitHub 仓库：https://github.com/shixindea/branch-name-from-staged-changes

根据当前 Git 暂存区的更改自动生成一个分支名称，并一键复制到剪贴板。

## 功能简介

- 扫描当前工作区 Git 仓库中的 **暂存区**（`git diff --cached --name-only`）
- 基于暂存文件的 **路径** 和 **文件名** 推断一个简洁的分支名
- 分支名自动复制到剪贴板，避免手动想名字、复制粘贴
- 支持在 VS Code 命令面板中一键触发

典型生成示例（具体取决于你的文件结构）：

- `feat/src-user-profile`
- `feat/api-user-login`
- `feat/change`（没有明显关键词时的兜底方案）

## 使用方式

1. **打开项目**

   在 VS Code 中打开你的 Git 仓库所在的文件夹。

2. **暂存改动**

   使用以下任一方式将需要作为“本次分支主题”的改动加入暂存区：

   - 在终端中执行：

     ```bash
     git add <文件路径>
     ```

   - 或在 VS Code 源码管理视图中，点选需要暂存的文件。

3. **执行命令生成分支名**

   在 VS Code 中：

   - 按 `Ctrl + Shift + P` 打开命令面板
   - 输入：`生成基于暂存更改的分支名`
   - 回车执行

4. **查看结果**

   - 插件会读取当前暂存区文件，并生成一个分支名
   - 生成的分支名会：
     - 自动复制到系统剪贴板
     - 并在右下角弹出提示，例如：

       > 已根据暂存区更改生成分支名并复制到剪贴板: `feat/src-user-profile`

   你可以直接在终端中粘贴使用，例如：

   ```bash
   git checkout -b feat/src-user-profile
