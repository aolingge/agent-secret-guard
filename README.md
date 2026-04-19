# agent-secret-guard

Dangerous config and secret scanner for AI coding agents, MCP, and local automation projects.

![agent-secret-guard terminal demo](docs/demo.svg)

`agent-secret-guard` is a small CLI that looks for risky agent-era configuration: secrets in MCP args, hardcoded API keys, over-broad filesystem access, dangerous shell commands, browser profile exposure, and credential store leaks.

It is built for repositories that contain files like `.mcp.json`, `mcp.json`, `AGENTS.md`, `CLAUDE.md`, `.env`, `settings.json`, `docker-compose.yml`, and GitHub Actions workflows.

## Quick Start

```bash
npx agent-secret-guard scan
```

Fail CI when high or critical findings are present:

```bash
npx agent-secret-guard scan . --fail-on high
```

Print machine-readable output:

```bash
npx agent-secret-guard scan . --format json
```

## What It Catches

| Risk | Why it matters |
| --- | --- |
| MCP tokens in `args` | Command-line args can leak through process listings, logs, shell history, and agent transcripts. |
| Hardcoded API keys | Agent context, commits, package tarballs, and logs can spread the value further. |
| Broad filesystem roots | Giving an agent `/`, `C:\`, `/Users`, or `C:\Users` makes accidental data exposure more likely. |
| Dangerous shell commands | Agents may run copied setup commands without human-level caution. |
| Browser profile exposure | Personal profiles can contain cookies, sessions, history, and autofill data. |
| Credential store exposure | Local token stores can unlock services far outside the project. |

## Example

Unsafe MCP config:

```json
{
  "mcpServers": {
    "demo": {
      "command": "npx",
      "args": ["demo-mcp", "--token", "sk-test_1234567890abcdef1234567890abcdef"]
    }
  }
}
```

Safer config:

```json
{
  "mcpServers": {
    "demo": {
      "command": "npx",
      "args": ["demo-mcp"],
      "env": {
        "DEMO_API_KEY": "${DEMO_API_KEY}"
      }
    }
  }
}
```

## GitHub Action

Create `.github/workflows/agent-secret-guard.yml`:

```yaml
name: Agent Secret Guard

on:
  pull_request:
  push:
    branches: [main]

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: aolingge/agent-secret-guard@v0.1.0
        with:
          fail-on: high
```

## Pre-commit

Install [pre-commit](https://pre-commit.com/) and add this to `.pre-commit-config.yaml`:

```yaml
repos:
  - repo: https://github.com/aolingge/agent-secret-guard
    rev: v0.1.0
    hooks:
      - id: agent-secret-guard
```

Then run:

```bash
pre-commit install
```

## Files Scanned

By default, the CLI scans:

- `.env`, `.env.*`
- `.mcp.json`, `mcp.json`, `settings.json`
- `AGENTS.md`, `CLAUDE.md`, `README.md`
- `docker-compose.yml`, `docker-compose.yaml`
- `.github/workflows/*.yml`, `.github/workflows/*.yaml`

It skips common generated folders such as `.git`, `node_modules`, `dist`, `coverage`, `.next`, `.turbo`, and `.cache`.

## How It Compares

`agent-secret-guard` is not a replacement for GitHub Secret Scanning, GitGuardian, gitleaks, or TruffleHog. Use those too.

This tool focuses on agent-specific configuration risks that are easy to miss in normal secret scanning: MCP command args, browser profile exposure, credential store paths, broad filesystem roots, and dangerous automation instructions.

## Development

```bash
npm install
npm test
npm run build
npm run lint
```

Run the local build:

```bash
npm run build
node dist/cli.js scan examples/unsafe --fail-on high
```

## Publishing

Future npm releases are designed to run through GitHub Actions Trusted Publishing, so maintainers do not need to keep entering local npm 2FA prompts. See [docs/publishing.md](docs/publishing.md).

## Roadmap

- More MCP client formats and schema-aware checks.
- SARIF output for GitHub code scanning.
- Rule suppression with inline justification.
- A small website with before/after examples.
- More language packs for report text.

## Security

This tool reports suspicious values and tries to redact secret evidence. Do not paste full scan output into public issues if it contains private paths or unredacted material. See [SECURITY.md](SECURITY.md).

## License

MIT
