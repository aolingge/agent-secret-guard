# GitHub Actions Marketplace Plan

The main `agent-secret-guard` repository is optimized for the npm CLI package. It also includes a composite action so users can run the scanner directly in GitHub Actions:

```yaml
- uses: aolingge/agent-secret-guard@v0.2.3
  with:
    path: .
    fail-on: high
```

For GitHub Actions Marketplace, keep this repository as the CLI source of truth and create a thin wrapper repository named `agent-secret-guard-action`.

## Why a Wrapper Repository

A wrapper keeps the Marketplace surface focused:

- The action README can be short and CI-focused.
- The action metadata can use action-specific branding and inputs.
- The CLI repository can keep npm, docs, examples, tests, and release notes without becoming a marketplace-only package.
- Releases can point back to the npm package and this repository.

## Wrapper Repository Layout

```text
agent-secret-guard-action/
  action.yml
  README.md
  LICENSE
  SECURITY.md
  .github/
    workflows/
      ci.yml
```

## Action Metadata

Use a composite action that installs and runs the published npm package:

```yaml
name: Agent Secret Guard
description: Scan AI agent, MCP, and local automation repos for risky secrets and permissions.
branding:
  icon: shield
  color: red
inputs:
  path:
    description: Path to scan.
    required: false
    default: .
  fail-on:
    description: "Lowest severity that should fail the action: low, medium, high, or critical."
    required: false
    default: high
runs:
  using: composite
  steps:
    - shell: bash
      run: npx agent-secret-guard scan "${{ inputs.path }}" --fail-on "${{ inputs.fail-on }}"
```

Pin the npm package version in the first Marketplace release if reproducibility matters more than always using the newest scanner:

```bash
npx agent-secret-guard@0.2.3 scan ...
```

## Marketplace Release Checklist

1. Create the wrapper repository as public.
2. Add action metadata with `branding`.
3. Add README with a 5-line Quick Start and link back to this CLI repository.
4. Add `LICENSE` and `SECURITY.md`.
5. Tag the first release.
6. Draft GitHub Marketplace listing copy:
   - Category: Security.
   - One-liner: Scan AI agent, MCP, and local automation repos for risky secrets and permissions.
   - Primary link: `https://github.com/aolingge/agent-secret-guard`.
7. After publishing, add the Marketplace link to this repository README and `docs/growth-checklist.md`.

