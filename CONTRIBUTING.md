# Contributing

Thanks for helping improve `agent-secret-guard`.

## Local Setup

```bash
npm install
npm test
npm run build
npm run lint
```

## Good First Contributions

- Add a focused detection rule for one risky AI-agent config pattern.
- Add a safe/unsafe fixture under `examples/`.
- Improve wording for a finding recommendation.
- Add documentation for a new workflow integration.

## Rule Guidelines

Rules should be:

- Specific enough to explain.
- Conservative enough to avoid noisy false positives.
- Paired with a fix recommendation and safe example.
- Covered by tests that show both unsafe and safe cases.

Do not add real tokens, cookies, private URLs, or private paths to fixtures.
