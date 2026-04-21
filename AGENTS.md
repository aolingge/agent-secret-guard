# Repository Agent Instructions

## Project Context

`agent-secret-guard` is a TypeScript CLI and GitHub Action for finding risky AI-agent, MCP, local automation, and GitHub Actions configuration patterns.

The project should stay local-first: scanning must not upload user files, secrets, paths, or reports to external services.

## Development Workflow

- Use Node.js 20 or newer and npm.
- Install dependencies with `npm ci` in automation and `npm install` for local development.
- Run `npm run check` before opening or merging a pull request.
- For scanner behavior changes, add or update tests in `tests/` with both unsafe and safe fixtures.
- Keep detection rules conservative enough to avoid noisy false positives.
- Keep public docs and examples free of real secrets, private URLs, private filesystem paths, cookies, and credential-store paths.

## Pull Requests

- Prefer small, focused changes.
- Include verification commands in the PR body.
- Do not merge code, rule, workflow, or publishing changes unless CI and security checks pass.
- Low-risk Dependabot npm development patch updates may be auto-approved and auto-merged only after branch protection and required checks are enabled.
- GitHub Actions dependency updates, major dependency updates, publishing changes, and security-sensitive changes require human review.

## Release Safety

- Follow `docs/release-checklist.md`.
- Prefer npm Trusted Publishing over long-lived npm tokens.
- Do not add package-publishing credentials to the repository, docs, issue comments, PR comments, or agent notes.
