# Backlog

This file tracks low-risk maintenance candidates for `agent-secret-guard`.

## Ready

- Review open PR #16 (file read race fix) before touching scanner IO behavior.
- Keep draft PR #17 rebased before review; it is currently behind `main`.
- Recheck Dependabot PR #18 manually because the auto-merge job failed while CI, scan, and CodeQL passed.
- Add a short regression fixture for each new detector rule before changing scanner behavior.
- Keep README examples aligned with the Marketplace Action version in `action.yml`.
- Refresh release notes after any docs, examples, or scanner behavior changes.

## Later

- Add a compact troubleshooting section for common Windows shell and path findings.
- Document a minimal Gitee mirror verification path for docs-only maintenance pushes.
- Review localized README files after the main README changes.

## Parking Lot

- Evaluate whether SARIF examples should include a redacted sample artifact.
- Consider a docs-only checklist for service-offer pages before each public update.
