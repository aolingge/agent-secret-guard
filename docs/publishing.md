# Publishing

This package is intended to use npm Trusted Publishing for future releases.

Trusted Publishing lets GitHub Actions publish through short-lived OIDC credentials. It avoids long-lived npm tokens and avoids manual local 2FA prompts for every release.

The publish workflow uses Node 24 and npm 11 because npm Trusted Publishing requires npm 11.5.1 or newer and Node 22.14.0 or newer.

## One-time npm Setup

Open the package settings on npm:

```text
https://www.npmjs.com/package/agent-secret-guard/access
```

Then configure Trusted Publishing:

- Provider: GitHub Actions
- Organization or user: `aolingge`
- Repository: `agent-secret-guard`
- Workflow filename: `publish.yml`
- Environment name: leave empty unless a GitHub deployment environment is added later

After the trusted publisher is verified, use the package access settings to prefer trusted publishing and reduce token exposure:

- Publishing access: require two-factor authentication and disallow tokens.
- Keep local manual publishing only as an emergency fallback.
- Revoke automation tokens that are no longer needed.

After the trusted publisher is configured, future releases can be published by pushing a version tag:

```bash
npm version patch
git push origin main --follow-tags
```

The `.github/workflows/publish.yml` workflow will run tests, build the package, and publish to npm without a local OTP prompt.

Trusted publishing from a public GitHub repository also gives npm package provenance automatically, so consumers can see where the package was built.

## Manual Fallback

If Trusted Publishing is not configured yet, publish locally with an interactive 2FA prompt:

```bash
npm publish --access public
```

If npm asks for an OTP, complete the browser/security-key prompt or pass a valid OTP if your account has one.
