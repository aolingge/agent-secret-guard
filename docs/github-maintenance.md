# GitHub Maintenance Runbook

This repository is designed to use GitHub-native automation first, then a narrow amount of custom scripting where GitHub does not expose a repository file for the setting.

## What Is Automated in the Repository

- `CI` runs lint, tests, build, safe self-scan, full repository self-scan, unsafe fixture failure checks, and SARIF generation checks on pull requests and `main`.
- `Agent Secret Guard` runs the local GitHub Action against the safe fixture.
- `Security` runs OSV Scanner and OpenSSF Scorecard.
- `CodeQL` runs JavaScript/TypeScript static analysis with `security-extended` queries.
- `Dependabot Auto-Merge` can approve and enable auto-merge only for Dependabot npm development patch updates, and only after branch protection has required status checks.
- `Maintenance Digest` opens or updates one issue only when stale PRs, open bug/security issues, failed default-branch or scheduled workflows, Dependabot alerts, or CodeQL alerts need attention.

## Recommended GitHub Repository Settings

Run the helper after authenticating GitHub CLI or exporting a token with repository admin permissions:

```bash
gh auth login
npm run github:governance -- --apply
```

The script configures:

- Auto-merge: enabled.
- Delete head branches after merge: enabled.
- Merge methods: squash and rebase enabled; merge commits disabled.
- Actions default workflow token: read-only.
- Actions can approve pull requests: enabled, so the Dependabot patch workflow can satisfy the review gate.
- Labels used by automation and issue templates.
- Dependabot alerts and security updates where the GitHub API allows enabling them.
- `main` branch protection with required status checks.

If you prefer to click through GitHub UI instead, use these settings:

- General: enable auto-merge and automatic branch deletion.
- Actions > General: set workflow permissions to read-only and allow GitHub Actions to create and approve pull requests.
- Branches > `main`: require pull request before merging, require one approval, dismiss stale approvals, require status checks to pass, require branch to be up to date, require conversation resolution, require linear history, block force pushes, and block deletions.
- Required checks: `test (20)`, `test (22)`, `test (24)`, `scan`, and `analyze`.
- Security and analysis: enable Dependabot alerts, Dependabot security updates, secret scanning, push protection, private vulnerability reporting, and CodeQL default setup if available for the account. The repository also has an explicit CodeQL workflow.

## Auto-Merge Policy

Automatic merge is deliberately narrow:

- Allowed: Dependabot PRs for direct npm development dependency patch updates.
- Required first: branch protection with required status checks.
- Required checks: CI matrix, local action scan, and CodeQL.
- Not auto-merged: GitHub Actions updates, major or minor dependency updates, production dependency updates, workflow changes, publishing changes, and any human-authored pull request.

This keeps maintenance quiet without letting automation bypass security-sensitive review.

## Issue-to-Agent Workflow

Use the `Agent task` issue template for work that should be handed to a coding agent. A good agent issue has:

- one clear goal,
- explicit constraints,
- acceptance checks,
- no secrets or private paths.

After the issue is ready, assign it to GitHub Copilot coding agent from GitHub, or use the GitHub CLI agent command if available:

```bash
gh agent-task create --repo aolingge/agent-secret-guard "Implement the task described in issue #ISSUE_NUMBER. Run npm run check and open a PR."
```

Keep security reports in GitHub private vulnerability reporting instead of public agent tasks.

## Notification Model

- Watch the repository for releases, security alerts, Actions failures, and issue/PR activity.
- Let failed required checks block merges.
- Let `Maintenance Digest` create one issue only when maintainer attention is needed.
- Treat digest issues as the inbox for repository health follow-up.

## Verification

Before merging automation changes:

```bash
npm run check
node dist/cli.js scan . --fail-on high
npm run github:governance
```

The final command is a dry run unless `-- --apply` is included.
