# agent-secret-guard

閱讀語言：[English](README.md) | [简体中文](README.zh-CN.md) | 繁體中文 | [日本語](README.ja.md) | [한국어](README.ko.md) | [Español](README.es.md) | [Français](README.fr.md) | [Deutsch](README.de.md) | [Português](README.pt.md) | [Русский](README.ru.md) | [العربية](README.ar.md) | [हिन्दी](README.hi.md) | [Bahasa Indonesia](README.id.md)

面向 AI coding agent、MCP 與本地自動化專案的危險設定與 secret 掃描器。

`agent-secret-guard` 是一個 5 分鐘安全檢查工具，用來掃描一般 secret scanner 容易漏掉的位置：MCP 命令參數、AI coding 規則、本地自動化說明、瀏覽器 profile 路徑、credential store 參照，以及權限過寬的 GitHub Actions workflow。

## 為什麼需要它

AI coding agent 和 MCP server 讓本地自動化更快，但也把 secret 帶到了新的位置：

- MCP 設定可能把 token 直接寫進 `args`，然後洩漏到行程列表、日誌或 shell 歷史裡。
- Agent 指令檔可能包含危險 shell 命令、本機私有路徑或臨時除錯資訊。
- 瀏覽器 profile 和 credential store 可能解鎖專案之外的帳號工作階段。
- GitHub Actions 可能給發布任務過大的寫入權限。

## 快速開始

```bash
npx agent-secret-guard scan
```

在 CI 裡遇到 high 或 critical 風險時失敗：

```bash
npx agent-secret-guard scan . --fail-on high
```

產生 GitHub Code Scanning 可用的 SARIF：

```bash
npx agent-secret-guard scan . --format sarif --output agent-secret-guard.sarif --fail-on high
```

## 能發現什麼

- MCP `args` 裡的 token 或 API key。
- 硬編碼的 npm、PyPI、GitHub、GitLab、Hugging Face、Stripe、OpenAI、Anthropic 等 token。
- `/`、`C:\`、`/Users`、`C:\Users` 這類過寬檔案系統存取。
- 危險 shell 命令，例如遠端腳本直接 pipe 到 shell、遞迴刪除、`chmod 777`、Docker socket 暴露。
- 瀏覽器 profile、cookie、credential store 路徑。
- GitHub Actions 的 `permissions: write-all` 和 `@main`、`@latest` 等可變 action 參照。

## 和其他工具的關係

它不是 GitHub Secret Scanning、gitleaks、TruffleHog、detect-secrets 或 secretlint 的替代品。建議一起使用。

`agent-secret-guard` 的重點是 AI agent / MCP / 本地自動化設定層，特別是 MCP 參數、瀏覽器 profile、credential store、本機規則檔和 GitHub Actions 權限。

## 隱私

CLI 在本地掃描檔案，不上傳程式碼、不上傳報告，也不遠端驗證 token。報告仍可能包含私有路徑或上下文，所以請把 SARIF、JSON 和文字報告當作敏感工件處理。

## 更多文件

- [完整英文 README](README.md)
- [修復指南](docs/remediation.md)
- [隱私與資料處理](docs/privacy.md)
- [同類工具對比](docs/comparison.md)
- [中文發布包](docs/launch-kit.zh-CN.md)

