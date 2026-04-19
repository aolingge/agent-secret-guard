# Comparison

Use `agent-secret-guard` alongside established secret scanners. The goal is not to replace them; the goal is to cover the agent-specific configuration layer they may not prioritize.

| Tool | Best at | Use with `agent-secret-guard` when |
| --- | --- | --- |
| GitHub Secret Scanning | Provider-backed secret detection in GitHub repositories | You want GitHub-native alerts plus local agent config checks. |
| gitleaks | Fast repo scanning with mature rule sets and SARIF output | You want broad secret coverage plus MCP and AI-agent-specific guardrails. |
| TruffleHog | Finding and verifying leaked credentials across many sources | You need credential verification and deeper secret analysis. |
| detect-secrets | Baseline-driven enterprise workflows and pre-commit checks | You want an auditable baseline plus agent config checks. |
| secretlint | Pluggable linting rules for credentials in text files | You want a Node-based linting ecosystem plus MCP/browser/workflow risk checks. |

## What this project focuses on

- MCP `args` that pass tokens directly.
- Broad filesystem roots in agent or MCP configuration.
- Browser profile and cookie store exposure.
- Local credential store paths in agent-visible files.
- Dangerous shell instructions in agent docs and automation files.
- GitHub Actions over-permission and mutable action refs.

## What this project does not try to be

- A full credential verification engine.
- A historical Git scanner for deleted commits.
- A commercial secret management platform.
- A replacement for provider-native secret scanning.

## Recommended stack

For a public AI agent or MCP repository:

1. Enable GitHub Secret Scanning and Dependabot.
2. Run `agent-secret-guard` in pull requests.
3. Add gitleaks or TruffleHog if you need broader historical or verified-secret scanning.
4. Upload SARIF to GitHub Code Scanning when you want findings visible in the Security tab.

