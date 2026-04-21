# Growth Checklist

Use this checklist before sharing a release on GitHub, npm, Hacker News, Product Hunt, Reddit, DEV, X, LinkedIn, or Chinese developer communities.

The goal is not to make the project sound bigger than it is. The goal is to make the narrow value obvious in under 30 seconds:

```text
agent-secret-guard is a 5-minute safety check for AI agent, MCP, and local automation repositories.
```

## Repository Page

- README first screen says who it is for and what risk it catches.
- Quick Start is copyable and works from a clean checkout.
- The demo image or video shows an unsafe config, a finding, and a safer replacement.
- Badges link to npm, CI, security workflow, and license.
- Topics include `ai-agent`, `mcp`, `secret-scanning`, `security-tools`, `github-actions`, `sarif`, `cli`, `developer-tools`, `codex`, and `claude-code`.
- GitHub repo homepage points to the best current conversion page: `https://aolingge.dev/agent-secret-guard/`.
- GitHub Marketplace page is live for the action wrapper: `https://github.com/marketplace/actions/agent-secret-guard`.
- Community files exist: `LICENSE`, `SECURITY.md`, `CONTRIBUTING.md`, issue templates, pull request template, support notes, and code of conduct.

## Package Page

- `package.json` description matches the README first screen.
- Keywords cover the search terms a developer would try: AI agent security, MCP security, secret scanning, GitHub Actions, SARIF, CLI, and developer tools.
- `files` includes the README, docs, examples, license, security policy, and support files.
- `npm pack --dry-run` shows no private notes, logs, tokens, local paths, or browser profile references.

## Demo Path

Use this sequence for a short video, GIF, or screenshot thread:

1. Show `examples/unsafe/.mcp.json` with a fake token in MCP `args`.
2. Run `npx agent-secret-guard scan examples/unsafe --fail-on high --exclude never-match`.
3. Point at the file, severity, and safer replacement.
4. Show `examples/safe/.mcp.json`.
5. Run `npx agent-secret-guard scan examples/safe --fail-on high`.

Keep the demo under 60 seconds and avoid real secrets or private paths.

## Launch Copy

- GitHub Release notes are in `docs/launch-kit.md`.
- English social and community copy is in `docs/launch-kit.md`.
- Chinese community copy is in `docs/launch-kit.zh-CN.md`.
- Show HN title should start with `Show HN:` and link to a usable project, not just a landing page.
- Product Hunt copy should focus on feedback, comments, and traffic, not asking people to upvote.
- Reddit posts should be rewritten per community. Do not paste the same promotional text everywhere.

## Weekly Review

Track only a few signals:

- GitHub stars and issue quality.
- npm downloads.
- Comments or rule requests from developers.
- Failed install or quick-start feedback.
- One small packaging improvement for the next week.
