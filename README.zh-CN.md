# agent-secret-guard

阅读语言：[English](README.md) | 简体中文 | [繁體中文](README.zh-TW.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Español](README.es.md) | [Français](README.fr.md) | [Deutsch](README.de.md) | [Português](README.pt.md) | [Русский](README.ru.md) | [العربية](README.ar.md) | [हिन्दी](README.hi.md) | [Bahasa Indonesia](README.id.md)

面向 AI coding agent、MCP 和本地自动化项目的危险配置与 secret 扫描器。

`agent-secret-guard` 是一个 5 分钟安全检查工具，用来扫描普通 secret scanner 容易漏掉的位置：MCP 命令参数、AI coding 规则、本地自动化说明、浏览器 profile 路径、credential store 引用，以及权限过宽的 GitHub Actions workflow。

## 为什么需要它

AI coding agent 和 MCP server 让本地自动化更快，但也把 secret 带到了新的位置：

- MCP 配置可能把 token 直接写进 `args`，然后泄露到进程列表、日志或 shell 历史里。
- Agent 指令文件可能包含危险 shell 命令、本机私有路径或临时调试信息。
- 浏览器 profile 和 credential store 可能解锁项目之外的账号会话。
- GitHub Actions 可能给发布任务过大的写权限。

## 快速开始

```bash
npx agent-secret-guard scan
```

在 CI 里遇到 high 或 critical 风险时失败：

```bash
npx agent-secret-guard scan . --fail-on high
```

生成 GitHub Code Scanning 可用的 SARIF：

```bash
npx agent-secret-guard scan . --format sarif --output agent-secret-guard.sarif --fail-on high
```

## 能发现什么

- MCP `args` 里的 token 或 API key。
- 硬编码的 npm、PyPI、GitHub、GitLab、Hugging Face、Stripe、OpenAI、Anthropic 等 token。
- `/`、`C:\`、`/Users`、`C:\Users` 这类过宽文件系统访问。
- 危险 shell 命令，例如远程脚本直接 pipe 到 shell、递归删除、`chmod 777`、Docker socket 暴露。
- 浏览器 profile、cookie、credential store 路径。
- GitHub Actions 的 `permissions: write-all` 和 `@main`、`@latest` 等可变 action 引用。

## 和其他工具的关系

它不是 GitHub Secret Scanning、gitleaks、TruffleHog、detect-secrets 或 secretlint 的替代品。建议一起使用。

`agent-secret-guard` 的重点是 AI agent / MCP / 本地自动化配置层，特别是 MCP 参数、浏览器 profile、credential store、本机规则文件和 GitHub Actions 权限。

## 隐私

CLI 在本地扫描文件，不上传代码、不上传报告，也不远程验证 token。报告仍可能包含私有路径或上下文，所以请把 SARIF、JSON 和文本报告当作敏感工件处理。

## 更多文档

- [完整英文 README](README.md)
- [修复指南](docs/remediation.md)
- [隐私与数据处理](docs/privacy.md)
- [同类工具对比](docs/comparison.md)
- [中文发布包](docs/launch-kit.zh-CN.md)

