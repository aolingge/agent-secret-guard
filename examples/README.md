# Examples

These fixtures show the two most common ways to use `agent-secret-guard` while keeping real credentials out of the repository.

## Safe MCP config

[`safe/.mcp.json`](safe/.mcp.json) keeps the token in an environment variable and limits filesystem access to a project workspace:

```bash
node dist/cli.js scan examples/safe --fail-on high
```

Expected result: exit code `0`.

## Unsafe MCP and agent instructions

[`unsafe/.mcp.json`](unsafe/.mcp.json) and [`unsafe/AGENTS.md`](unsafe/AGENTS.md) intentionally contain dangerous patterns: a token-like MCP arg, broad filesystem access, remote shell execution, browser profile exposure, and credential store exposure.

The root `.agent-secret-guard.json` excludes this fixture from normal repository scans. To verify the failure path explicitly:

```bash
node dist/cli.js scan examples/unsafe --fail-on critical --exclude never-match
```

Expected result: exit code `1`.

## GitHub Actions

[`ci/agent-secret-guard.yml`](ci/agent-secret-guard.yml) is a copyable workflow for projects that want the scan to run on pull requests and pushes.
