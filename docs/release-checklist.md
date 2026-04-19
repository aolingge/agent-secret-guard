# Release Checklist

1. Confirm `CHANGELOG.md` has notes for the release.
2. Run `npm run check`.
3. Run `node dist/cli.js scan examples/safe --fail-on high`.
4. Run `node dist/cli.js scan . --fail-on high` and confirm the repository self-scan is clean.
5. Run `node dist/cli.js scan examples/unsafe --fail-on critical --exclude never-match` and confirm it exits with code 1.
6. Run `node dist/cli.js scan examples/unsafe --format sarif --output reports/agent-secret-guard.sarif --fail-on critical --exclude never-match` and confirm a SARIF file is written.
7. Run `npm pack --dry-run`.
8. Create a signed or normal git tag such as `v0.2.0`.
9. Push `main` and the version tag.
10. Confirm the `Publish npm` workflow publishes from GitHub Actions.
11. Create or update the GitHub release with the changelog notes.

Prefer npm Trusted Publishing over long-lived npm tokens. Once Trusted Publishing is verified for this package, restrict traditional token publishing on npm and revoke automation tokens that are no longer needed.
