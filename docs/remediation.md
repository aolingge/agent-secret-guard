# Remediation Guide

This guide explains what to do after `agent-secret-guard` finds a risky pattern.

## First response

1. Do not paste the raw finding into a public issue or chat.
2. If a real token may have been exposed, rotate or revoke it first.
3. Replace the unsafe config with an environment variable, secret manager, or narrower permission.
4. Re-run the scan and commit the safe version only.

## MCP token in args

Risk: command-line arguments can appear in process listings, shell history, task logs, or agent transcripts.

Unsafe:

```json
{
  "args": ["demo-mcp", "--token", "real_token_here"]
}
```

Safer:

```json
{
  "args": ["demo-mcp"],
  "env": {
    "DEMO_API_KEY": "${DEMO_API_KEY}"
  }
}
```

Then store `DEMO_API_KEY` in your local shell, CI secret store, or platform secret manager.

## Hardcoded package or API token

Risk: package tokens and API keys can leak through commits, npm tarballs, logs, screenshots, and AI context.

Recommended fix:

```bash
# 1. Revoke or rotate the token in the provider UI.
# 2. Remove the value from the repository.
# 3. Add a safe placeholder.
```

Example placeholder:

```text
NPM_TOKEN=${NPM_TOKEN}
PYPI_API_TOKEN=${PYPI_API_TOKEN}
```

## Broad filesystem access

Risk: giving an agent `/`, `C:\`, `/Users`, or `C:\Users` increases the chance that private files enter tool context.

Safer pattern: point the agent at a project-specific directory.

```json
{
  "workspace": "E:\\codemain\\github\\agent-secret-guard"
}
```

## Dangerous shell command

Risk: copied install commands can execute remote code, delete too much, or expose Docker control sockets.

Safer pattern:

- Download scripts before running them.
- Inspect the script.
- Pin versions.
- Avoid mounting `/var/run/docker.sock` into untrusted containers.

## Browser profile or credential store exposure

Risk: browser profiles and credential stores can contain cookies, sessions, autofill data, and service tokens.

Safer pattern:

- Create a separate testing browser profile.
- Use a dedicated low-privilege account.
- Do not mount real browser profile folders into agents or containers.
- Use OS credential managers instead of copying token files into repos.

## GitHub Actions permissions

Risk: `permissions: write-all` gives the workflow broad repository write access.

Safer default:

```yaml
permissions:
  contents: read
```

For SARIF upload:

```yaml
permissions:
  contents: read
  security-events: write
```

For npm Trusted Publishing:

```yaml
permissions:
  contents: read
  id-token: write
```

Also pin third-party actions to stable version tags or commit SHAs instead of `@main`, `@master`, or `@latest`.

