# AI Agent Repo Safety Audit

`agent-secret-guard` is local-first software. If you want a human review before you publish an AI agent, MCP server, GitHub Action, or local automation repo, I offer a focused launch-readiness audit.

## What I Check

- MCP tokens or API keys passed through command args.
- Agent instruction files that expose local paths, credential stores, browser profiles, or unsafe setup commands.
- `.env`, `.npmrc`, `.pypirc`, workflow examples, screenshots, and docs that may reveal sensitive setup details.
- GitHub Actions workflows with broad permissions, mutable action refs, or publishing jobs that are too easy to misuse.
- Public README, release notes, and examples that need safer copy before launch.

## Packages

| Package | Price | Scope | Delivery |
| --- | ---: | --- | --- |
| Intro Audit | $49 | 1 public repo | 24h Markdown risk summary and fix priorities |
| Standard Audit | $149 | 1 repo | Full report, safer config examples, and GitHub Actions setup |
| Fix PR | $299+ | 1 repo | Audit report plus a focused pull request for agreed fixes |

Intro pricing is meant for the first five early customers. Prices may change after there are enough public samples and testimonials.

## Deliverables

Each audit is delivered as a small, readable package:

```text
repo-safety-audit/
  01-risk-summary.md
  02-fix-plan.md
  03-ci-example.yml
  04-scan-output.json
  05-delivery-note.md
```

See [sample-audit-report.md](sample-audit-report.md) for the report format.

## How To Start

Send:

- the public repository URL, or a sanitized archive;
- the launch goal, such as open source release, client handoff, or internal review;
- the preferred package.

Contact:

- Email: <153434584+aolingge@users.noreply.github.com>
- GitHub: <https://github.com/aolingge>
- Payment link: coming soon. Email a public repo link first to book the intro audit.

Do not send real production secrets, cookies, private keys, or live credentials. If a private repo is required, use the smallest read-only access that works for the audit.

## Boundaries

This is a focused publish-readiness review, not a penetration test. I do not promise to find every possible vulnerability. The goal is to catch the AI-agent-specific repo risks that are easy to miss before public release or client delivery.

## Good Fit

- You are launching an AI agent, MCP server, agent workflow, or automation toolkit.
- Your repo contains `.mcp.json`, Claude/Codex/Cursor instructions, `.github/workflows`, n8n/Make/Zapier examples, or local setup scripts.
- You want a short report and fix plan before asking users to run your tool.

## Not A Good Fit

- You need a full compliance audit, penetration test, or legal certification.
- You want someone to handle real production credentials.
- You need exploit development, bypasses, account access, or unsafe security work.
