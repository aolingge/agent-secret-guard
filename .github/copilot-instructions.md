# Copilot Instructions

- This repository is a TypeScript CLI and GitHub Action for local-first security scanning.
- Use Node.js 20+ and npm.
- Before proposing completion, run `npm run check` when possible.
- For scanner behavior changes, update tests in `tests/` and include safe plus unsafe fixtures.
- Never add real secrets, private URLs, cookies, private filesystem paths, or credential-store paths to fixtures, docs, issues, or PRs.
- Keep GitHub Actions permissions least-privilege and avoid broad write permissions.
- Treat publishing and workflow changes as security-sensitive; they require human review unless the change is a narrowly scoped Dependabot npm development patch update.
