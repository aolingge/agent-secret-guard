# 中文发布包

这份文档给维护者准备中文渠道的发布文案。核心表达要窄：`agent-secret-guard` 不是“大而全安全平台”，而是给 AI coding agent、MCP、本地自动化项目用的危险配置和 secret 扫描器。

## 一句话定位

`agent-secret-guard` 可以扫描 AI coding agent、MCP、本地自动化仓库里的危险配置、硬编码 token、过宽权限、浏览器 profile 暴露和 GitHub Actions 风险。

## 小红书/即刻短文

```text
我做了一个小工具：agent-secret-guard。

它解决的问题很窄，但很真实：

现在很多人会把 AI coding agent、MCP、本地自动化脚本放到 GitHub。问题是，危险配置不一定只藏在代码里，也可能藏在：

- .mcp.json
- AGENTS.md / CLAUDE.md
- Cursor rules
- .env / .npmrc / .pypirc
- docker-compose.yml
- GitHub Actions

它会检查：

- MCP args 里直接写 token
- API key / npm token / PyPI token 硬编码
- 给 agent 开了过宽的文件系统权限
- 暴露浏览器 profile / cookie 路径
- 暴露本机 credential store
- GitHub Actions 权限太大

用法：

npx agent-secret-guard scan . --fail-on high

这个工具不是替代 gitleaks、TruffleHog 或 GitHub Secret Scanning，而是补它们不一定重点看的 AI agent / MCP 配置层。

项目地址：
https://github.com/aolingge/agent-secret-guard
```

## B 站 60 秒口播

```text
开头：
现在很多人用 AI coding agent 和 MCP，但有一个新问题：secret 不一定只泄露在代码里，也会泄露在配置和 agent 指令里。

展示：
这里有一个 .mcp.json，里面把 token 直接放到了 args。

命令：
npx agent-secret-guard scan examples/unsafe --fail-on high

解释：
工具会告诉你风险等级、在哪个文件、为什么危险、应该怎么改。

展示安全写法：
不要把 token 写进 args，改成环境变量，比如 DEMO_API_KEY。

再补一句：
它还会扫 AGENTS.md、CLAUDE.md、Cursor rules、.env、.npmrc、.pypirc、docker-compose 和 GitHub Actions。

结尾：
这不是替代 gitleaks 或 TruffleHog，而是专门补 AI agent / MCP 项目的危险配置扫描。

项目叫 agent-secret-guard，已经开源。
```

## 中文技术社区标题

```text
我做了一个 AI Agent / MCP 危险配置扫描器：agent-secret-guard
```

备选标题：

```text
别把 MCP token 和浏览器 profile 一起发到 GitHub：我做了个小扫描器
```

```text
AI coding agent 项目发布前，我现在会先跑这条命令
```

## 公众号/博客开头

```text
最近 AI coding agent 和 MCP 项目越来越多，但我发现一个很容易被忽略的问题：很多风险不在业务代码里，而在配置文件和自动化说明里。

比如 `.mcp.json` 里直接把 token 写进 `args`，`AGENTS.md` 里复制了危险 shell 命令，Cursor rules 里写了本机私有路径，GitHub Actions 给了 `write-all` 权限。

这些东西不一定会被传统 secret scanner 当成重点，所以我做了一个很窄的小工具：agent-secret-guard。
```

## 评论区回复模板

有人问“和 gitleaks / TruffleHog 有什么区别”：

```text
不是替代关系。gitleaks / TruffleHog 更适合广泛 secret 扫描和历史扫描，agent-secret-guard 主要补 AI agent / MCP / 本地自动化配置层，比如 MCP args、浏览器 profile、credential store、本地规则文件和 GitHub Actions 权限。
```

有人问“会不会上传我的 secret”：

```text
不会。CLI 是本地扫描，不上传文件，也不调用远程服务验证 token。但报告里可能包含私有路径或上下文，所以不要把完整报告贴到公开 issue。
```

有人问“适合什么时候用”：

```text
适合在发布 AI agent / MCP / 自动化项目之前跑一遍，也适合放到 pre-commit 或 GitHub Actions 里，防止危险配置被提交。
```

