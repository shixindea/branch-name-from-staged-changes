# Branch Name From Commit Message

根据 commit 文本生成 Git 分支名称的 VS Code 插件，支持中文与英文描述，可选接入 Kimi（Moonshot）大模型。

GitHub 仓库：https://github.com/shixindea/branch-name-from-staged-changes

---

## 使用方法

### 1. 打开要操作的项目

在 VS Code 中打开你的 Git 仓库所在文件夹即可，无需额外激活操作。

### 2. 通过命令面板生成分支名

1. 按 `Ctrl + Shift + P` 打开命令面板；
2. 输入命令名称：`根据 commit 文本生成分支名`；
3. 选择该命令（ID：`branchNameFromStagedChanges.generate`）；
4. 在输入框中填写本次提交的 commit 文本，例如：

   ```text
   fix: 修复录音结束后状态异常
   ```

5. 回车确认后，插件会自动生成一个分支名。

### 3. 查看与使用结果

- 插件会将生成好的分支名写入系统剪贴板；
- VS Code 右下角会弹出信息提示，例如：

  - `大模型生成的分支名：fix/record-status-error，已复制到剪贴板`
  - `规则生成的分支名：fix/record-status-error，已复制到剪贴板`

你可以直接在终端中粘贴使用，例如：

```bash
git checkout -b fix/record-status-error
```

或在图形化 Git 工具中粘贴到“新建分支”输入框中。

---

## 行为细节与限制

- 插件当前只提供一个命令：`branchNameFromStagedChanges.generate`；
- 不依赖当前暂存文件或 diff 内容，仅基于你输入的 commit 文本工作；
- 目前未在界面中提供额外设置项，所有高级配置均通过 `ap-config.js` 完成；
- 若网络状况不佳或 Kimi 接口异常，插件会静默退回本地规则生成，不会中断你的操作。

---

## 常见问题（FAQ）

- Q：必须配置 Kimi（Moonshot）才能用吗？  
  A：不需要。不配置 `ap-config.js` 时，插件使用本地规则生成分支名，依然完全可用。

- Q：支持中文 commit 吗？  
  A：支持。插件会从中文描述中提取关键词，并做简单英文化/符号转换后拼接成分支名。

- Q：生成分支名不满意怎么办？  
  A：你可以修改输入的 commit 文本（例如更加精炼或突出关键词），再次运行命令，或者直接手动编辑生成的分支名。

- Q：会不会上传代码或其它敏感信息？  
  A：插件仅会将你在输入框中填写的 commit 文本发送给 Kimi 接口（在你配置了 `ap-config.js` 且网络可用的情况下）。不读取本地仓库内容，也不会上传代码 diff。

---


## 反馈与贡献

- Bug 反馈与功能建议：请在 GitHub 仓库提 Issue
- 欢迎通过 PR 贡献：
  - 新的分支类型识别规则
  - 关键词提取策略优化
  - 更多大模型或 API 的适配

你的反馈可以帮助这个小工具在实际工作流中变得更好用。
