# Sample AI Agent Repo Safety Audit

Client: Example project  
Repo: `example/agent-workflow-demo`  
Date: 2026-04-26  
Reviewer: Aolingge

## Executive Summary

The repository is close to publishable, but it should fix two high-priority release risks first: a sample MCP config passes a token through command args, and a GitHub Actions workflow grants broad write permissions to every job. The fixes are small and can be completed before launch.

## Finding Counts

| Severity | Count |
| --- | ---: |
| Critical | 0 |
| High | 2 |
| Medium | 3 |
| Low | 2 |

## Findings

### HIGH: MCP Token Passed Through Command Args

- File: `.mcp.json`
- Evidence: sample config uses `--token` in an `args` array.
- Why it matters: command-line args can leak through process listings, shell history, logs, and agent transcripts.
- Recommended fix: move the value into an environment variable or local secret store.

Safer example:

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

### HIGH: GitHub Actions Workflow Grants Broad Write Access

- File: `.github/workflows/release.yml`
- Evidence: workflow uses `permissions: write-all`.
- Why it matters: if any step is compromised, the job can write far more than the release needs.
- Recommended fix: grant only the required permissions per job.

Safer example:

```yaml
permissions:
  contents: read

jobs:
  release:
    permissions:
      contents: write
      id-token: write
```

### MEDIUM: Agent Instructions Mention Local Browser Profile Paths

- File: `AGENTS.md`
- Evidence: setup notes mention a real browser profile location.
- Why it matters: browser profiles can contain cookies, history, autofill data, and authenticated sessions.
- Recommended fix: replace the real path with a generic placeholder and document how to create an isolated profile.

### MEDIUM: Release Notes Ask Users To Paste Full Scan Output

- File: `docs/release.md`
- Evidence: troubleshooting section asks users to paste full logs.
- Why it matters: scan output may contain private file paths or surrounding evidence.
- Recommended fix: ask users to redact paths and attach only the relevant finding IDs.

## Fix Priority

1. Move secrets out of MCP command args.
2. Narrow GitHub Actions permissions.
3. Replace browser profile paths with placeholders.
4. Add a short privacy note for scan reports.
5. Add the CI workflow below.

## Suggested GitHub Action

```yaml
name: Agent Secret Guard

on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: aolingge/agent-secret-guard-action@v0.1.5
        with:
          path: .
          fail-on: high
```

## Delivery Note

This was a focused publish-readiness review for AI agent, MCP, and automation repository risks. It is not a full penetration test and does not guarantee every issue has been found.

