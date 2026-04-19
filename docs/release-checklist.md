# Release Checklist

1. Run `npm run lint`.
2. Run `npm test`.
3. Run `npm run build`.
4. Run `node dist/cli.js scan examples/unsafe --fail-on critical` and confirm it exits non-zero.
5. Run `npm pack --dry-run`.
6. Create a signed or normal git tag such as `v0.1.0`.
7. Publish to npm with `npm publish --access public`.
8. Create a GitHub release with the changelog notes.
