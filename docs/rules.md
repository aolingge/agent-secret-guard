# Detection Rules

## `hardcoded-secret`

Looks for common token shapes and named secret assignments. Safe references such as `${API_KEY}` and `${{ secrets.API_KEY }}` are ignored.

## `mcp-token-in-args`

Looks for MCP server `args` that pass tokens with flags such as `--token`, `--api-key`, `--access-token`, or inline `--token=value`.

## `broad-filesystem-access`

Looks for broad filesystem roots in MCP config, including `/`, `C:\`, `/Users`, `/home`, and `C:\Users`.

## `dangerous-shell-command`

Looks for automation instructions that pipe remote downloads into shells, run destructive recursive deletes, use recursive `chmod 777`, or mount Docker sockets.

## `browser-profile-exposure`

Looks for personal browser profile paths and cookie store references.

## `credential-store-exposure`

Looks for OS credential stores and sensitive token files such as `.git-credentials` and `.aws/credentials`.

## `github-actions-write-all`

Looks for GitHub Actions workflows that grant `permissions: write-all`. This is especially risky in release and package-publishing workflows.

## `github-actions-mutable-ref`

Looks for GitHub Actions that use mutable refs such as `@main`, `@master`, or `@latest`.

## Package Registry Tokens

The `hardcoded-secret` rule also looks for npm, PyPI, GitHub, GitLab, Hugging Face, Slack, AWS, Google API, Stripe, OpenAI, and Anthropic-style token shapes. Fake fixtures should use obviously fake values and never real credentials.
