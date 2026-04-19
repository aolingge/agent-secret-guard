# Changelog

## 0.2.2 - 2026-04-20

- Improve README positioning, quick-start output, privacy notes, comparison guidance, and remediation links.
- Add English and Chinese launch kits with release notes, X/LinkedIn/Reddit copy, Chinese community copy, demo scripts, and recommended GitHub topics.
- Add privacy, remediation, and comparison docs to make the project easier to evaluate and share.
- Harden issue templates so users are reminded not to paste real secrets into public reports.

## 0.2.1 - 2026-04-20

- Align the release tag with the final hardened repository state.
- Fix the OSV-Scanner workflow reference and refresh GitHub Actions versions.
- Keep npm package behavior unchanged from 0.2.0.

## 0.2.0 - 2026-04-20

- Add SARIF output for GitHub Code Scanning.
- Add `--output`, `--exclude`, and `.agent-secret-guard.json` for writing reports and excluding known fixtures.
- Expand default scan coverage for Cursor, VS Code MCP, Claude, Codex, npm, and PyPI config files.
- Detect npm, PyPI, GitLab, Hugging Face, Google API, Stripe, and GitHub fine-grained token shapes.
- Detect broad GitHub Actions workflow permissions and mutable action refs.
- Add CI matrix coverage, Dependabot, OpenSSF Scorecard, and OSV-Scanner workflows.

## 0.1.0 - 2026-04-19

- Initial MVP CLI scanner.
- Detects MCP tokens in args, hardcoded secrets, dangerous shell commands, broad filesystem access, browser profile exposure, and credential store exposure.
- Adds text and JSON reports, `--fail-on`, GitHub Action usage, and pre-commit hook metadata.
