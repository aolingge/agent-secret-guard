# Launch Kit

This file gives maintainers copy-paste launch material for a new release. Keep the public message narrow: `agent-secret-guard` is a safety check for AI agent, MCP, and local automation repos.

## One-line positioning

`agent-secret-guard` scans AI coding agent, MCP, and local automation repos for dangerous config, hardcoded tokens, broad permissions, browser profile exposure, and risky GitHub Actions workflows.

## GitHub Release Notes

Title:

```text
agent-secret-guard vNEXT: clearer launch docs, privacy notes, and remediation guides
```

Body:

````markdown
This release improves the public project packaging around agent-secret-guard.

New docs:

- Privacy and data-handling model.
- Remediation guide for common findings.
- Comparison with GitHub Secret Scanning, gitleaks, TruffleHog, detect-secrets, and secretlint.
- Launch copy for X, LinkedIn, Reddit, and Show HN.

The scanner behavior is unchanged from v0.2.1. This is a documentation and launch-readiness release.

Install:

```bash
npx agent-secret-guard scan . --fail-on high
```
````

## X Post

```text
I built agent-secret-guard: a small CLI + GitHub Action that scans AI coding agent, MCP, and local automation repos for risky config.

It catches things normal secret scans often miss:
- tokens in MCP args
- broad filesystem access
- browser profile exposure
- credential store paths
- risky GitHub Actions permissions

npx agent-secret-guard scan . --fail-on high

https://github.com/aolingge/agent-secret-guard
https://github.com/marketplace/actions/agent-secret-guard
```

## X Thread

```text
1/ AI coding agents and MCP servers are powerful, but they also move secrets into new places.

I built agent-secret-guard to scan the weird edge of modern dev repos: .mcp.json, AGENTS.md, CLAUDE.md, Cursor rules, local automation notes, and GitHub Actions.

2/ It looks for:
- MCP tokens in args
- hardcoded package/API tokens
- broad filesystem access
- browser profile and cookie paths
- credential store exposure
- dangerous shell commands
- over-permissive GitHub Actions

3/ It is meant to complement, not replace, GitHub Secret Scanning, gitleaks, TruffleHog, detect-secrets, or secretlint.

Those are great. This focuses on agent-specific config mistakes.

4/ Quick start:

npx agent-secret-guard scan . --fail-on high

It also supports JSON and SARIF for GitHub Code Scanning.

5/ Repo:
https://github.com/aolingge/agent-secret-guard

Marketplace:
https://github.com/marketplace/actions/agent-secret-guard

Feedback and rule requests are welcome, especially for MCP clients and AI coding workflows I have not covered yet.
```

## LinkedIn Post

```text
AI coding agents and MCP servers are changing what "secret scanning" needs to cover.

The risky values are not always in source code anymore. They can be in MCP command args, agent instruction files, local automation notes, browser profile paths, credential store references, or GitHub Actions permissions.

I built agent-secret-guard as a small open-source CLI for that layer.

It checks common AI-agent-era files such as .mcp.json, AGENTS.md, CLAUDE.md, Cursor rules, Codex config, .env files, docker-compose files, and GitHub Actions workflows.

It supports:
- local CLI scanning
- GitHub Action usage
- pre-commit hooks
- JSON output
- SARIF output for GitHub Code Scanning

Quick start:

npx agent-secret-guard scan . --fail-on high

The project is designed to complement established scanners such as GitHub Secret Scanning, gitleaks, TruffleHog, detect-secrets, and secretlint.

Repo:
https://github.com/aolingge/agent-secret-guard

GitHub Action:
https://github.com/marketplace/actions/agent-secret-guard
```

## Reddit / Show HN

Title:

```text
agent-secret-guard: scan AI agent and MCP repos for risky config and leaked secrets
```

Body:

````markdown
I built a small open-source CLI for a problem I kept running into while working with AI coding agents and MCP configs: risky secrets and permissions often live outside normal app code.

It scans files like `.mcp.json`, `mcp.json`, `AGENTS.md`, `CLAUDE.md`, Cursor rules, Codex config, `.env`, `.npmrc`, `.pypirc`, Docker Compose, and GitHub Actions workflows.

It looks for:

- tokens passed through MCP `args`
- hardcoded package/API tokens
- broad filesystem access
- browser profile/cookie exposure
- credential store paths
- dangerous shell commands
- over-permissive GitHub Actions

Install/run:

```bash
npx agent-secret-guard scan . --fail-on high
```

It also supports JSON and SARIF output, so it can be wired into GitHub Code Scanning.

This is meant to complement tools like GitHub Secret Scanning, gitleaks, TruffleHog, detect-secrets, and secretlint, not replace them. The narrow goal is catching agent/MCP/local-automation config mistakes before a repo is published.

Feedback and rule requests are very welcome:
https://github.com/aolingge/agent-secret-guard

GitHub Action:
https://github.com/marketplace/actions/agent-secret-guard
````

## 60-second demo script

```text
Opening: "AI coding agents are useful, but they create a new kind of secret leak: config files and agent instructions."

Show unsafe .mcp.json with a fake token in args.

Run:
npx agent-secret-guard scan examples/unsafe --fail-on high

Point out the finding: severity, file, reason, safer fix.

Show safer config using an environment variable.

Run the scan again on the safe repo.

Close: "It is not a replacement for gitleaks or GitHub Secret Scanning. It is a small guardrail for AI agent, MCP, and local automation repos."
```

## Repository topics

Recommended GitHub topics:

```text
ai-agent, mcp, mcp-server, secret-scanning, security-tools, github-actions, sarif, cli, developer-tools, codex, claude-code
```
