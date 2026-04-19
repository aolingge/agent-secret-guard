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

Looks for OS credential stores and common token files such as `.git-credentials`, `.aws/credentials`, and `.npmrc`.
