# Privacy and Data Handling

`agent-secret-guard` is designed to be boring from a data-handling point of view: it scans local files and returns local findings.

## What the CLI does

- Reads matching files from the target directory.
- Applies local rules in the Node.js process.
- Writes text, JSON, or SARIF output when requested.
- Exits with a non-zero status when `--fail-on` matches the finding severity.

## What the CLI does not do

- It does not upload source files or findings to a remote service.
- It does not call provider APIs to verify whether a credential is live.
- It does not store raw secrets in a database.
- It does not phone home with telemetry.

## Treat reports as sensitive

The scanner tries to redact obvious secret values, but reports can still contain sensitive context:

- private file paths,
- MCP server names,
- nearby configuration text,
- workflow names,
- line numbers that point to sensitive files.

Do not paste full reports into public issues. When reporting a bug, replace real values with fake fixtures such as `npm_fake_example_token` or `pypi_fake_example_token`.

## Local CI behavior

When used in GitHub Actions, the scan runs in the workflow runner. If you upload SARIF to GitHub Code Scanning, the SARIF file is sent to GitHub as part of that workflow. This is useful for repository security alerts, but it means the SARIF file should be treated like any other security scan artifact.

