# Agent Surface Inventory

An agent surface inventory is a short list of the places an AI agent, MCP server, workflow, or local automation can reach.

Use it before you:

- publish an agent repo
- share setup notes with a teammate
- add a GitHub Action that handles secrets
- let an AI coding agent work near a real browser profile or credential store

The goal is simple: write down the assets an agent can touch before those assets leak into prompts, logs, commits, or CI output.

## What to Inventory

Start with the places `agent-secret-guard` already checks:

| Surface | Typical risky value | Safer default |
| --- | --- | --- |
| MCP command args | `--token`, `--api-key`, copied secrets | Move secrets to `env` or a secret manager |
| Filesystem scope | `/`, `C:\`, `/Users`, `C:\Users` | Point tools at one project folder |
| Browser access | personal Chrome/Edge profile paths | Use a separate low-privilege test profile |
| Credential stores | `.git-credentials`, `.aws/credentials`, token files | Keep secrets in OS credential managers |
| Agent instructions | copied shell commands, private setup notes | keep only repo-safe commands and placeholders |
| GitHub Actions | `permissions: write-all`, broad secrets exposure | default to `contents: read`, add only needed writes |

## 5-Minute Inventory Template

Copy this into an issue, PR description, design doc, or local review note:

```md
## Agent Surface Inventory

| Surface | Current path/value | Why it is exposed | Safer target |
| --- | --- | --- | --- |
| MCP config | `.mcp.json` uses `--token` in `args` | leaks to logs/process list | move token to `env` |
| Workspace scope | `C:\Users\aolin` | agent can read unrelated files | narrow to project root |
| Browser profile | `C:\Users\aolin\AppData\Local\Microsoft\Edge\User Data\Default` | real sessions/cookies | use a dedicated test profile |
| CI workflow | `permissions: write-all` | compromised step gets repo write access | reduce to explicit minimum |
```

If a row feels uncomfortable to write down, it is usually a good sign that the value should not be there.

## Example

Unsafe setup:

```json
{
  "mcpServers": {
    "demo": {
      "command": "npx",
      "args": ["demo-mcp", "--token", "real_token_here"],
      "env": {
        "BROWSER_PROFILE": "C:\\Users\\alice\\AppData\\Local\\Microsoft\\Edge\\User Data\\Default"
      }
    }
  }
}
```

Safer setup:

```json
{
  "mcpServers": {
    "demo": {
      "command": "npx",
      "args": ["demo-mcp"],
      "env": {
        "DEMO_API_KEY": "${DEMO_API_KEY}",
        "BROWSER_PROFILE": "E:\\browser-profiles\\agent-test"
      }
    }
  }
}
```

## How to Use With agent-secret-guard

1. Write the inventory first.
2. Run `npx agent-secret-guard scan . --fail-on high`.
3. Compare findings with the inventory rows.
4. Remove any surface that is broader than the job needs.
5. Re-run the scan and keep the safer version in the repo.

The inventory helps with prevention. The scanner helps with verification.
