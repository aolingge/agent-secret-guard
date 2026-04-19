# agent-secret-guard

Read this in your language: [English](README.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Español](README.es.md) | [Français](README.fr.md) | [Deutsch](README.de.md) | [Português](README.pt.md) | [Русский](README.ru.md) | [العربية](README.ar.md) | हिन्दी | [Bahasa Indonesia](README.id.md)

AI coding agents, MCP और local automation projects के लिए dangerous config और secrets scanner.

`agent-secret-guard` agent-era repositories के लिए 5-minute safety check है। यह उन जगहों को देखता है जिन्हें सामान्य secret scanners अक्सर छोड़ देते हैं: MCP command args, AI coding rules, local automation notes, browser profile paths, credential store references और बहुत अधिक permissions वाले GitHub Actions workflows.

## यह क्यों ज़रूरी है

AI coding agents और MCP servers local automation को तेज़ बनाते हैं, लेकिन secrets को नई जगहों पर भी ले जाते हैं।

- MCP config token को सीधे `args` में डाल सकता है, जहाँ वह process list, logs या shell history में दिख सकता है।
- Agent instruction files में dangerous shell commands, private local paths या temporary debug notes रह सकते हैं।
- Browser profiles और credential stores repository से बाहर के account sessions खोल सकते हैं।
- GitHub Actions publishing jobs को बहुत broad write permissions दे सकता है।

## Quick Start

```bash
npx agent-secret-guard scan
```

CI को high या critical findings पर fail करें:

```bash
npx agent-secret-guard scan . --fail-on high
```

GitHub Code Scanning के लिए SARIF बनाएँ:

```bash
npx agent-secret-guard scan . --format sarif --output agent-secret-guard.sarif --fail-on high
```

## यह क्या पकड़ता है

- MCP `args` में tokens या API keys.
- npm, PyPI, GitHub, GitLab, Hugging Face, Stripe, OpenAI और Anthropic के hardcoded tokens.
- `/`, `C:\`, `/Users`, `C:\Users` जैसे बहुत broad filesystem access.
- Dangerous shell commands, जैसे remote scripts को सीधे shell में pipe करना, recursive delete, `chmod 777`, या Docker socket exposure.
- Browser profile, cookie और credential store paths.
- GitHub Actions में `permissions: write-all` और `@main`, `@latest` जैसे mutable action refs.

## दूसरे tools से संबंध

यह GitHub Secret Scanning, gitleaks, TruffleHog, detect-secrets या secretlint का replacement नहीं है। इन्हें भी इस्तेमाल करें।

`agent-secret-guard` AI agent / MCP / local automation config layer पर focus करता है: MCP args, browser profiles, credential stores, local rule files और GitHub Actions permissions.

## Privacy

CLI local files को local machine पर scan करता है। यह code या findings upload नहीं करता और tokens को remote providers से verify नहीं करता। फिर भी reports में private paths या context हो सकता है, इसलिए SARIF, JSON और text reports को sensitive artifacts की तरह रखें।

## Links

- [Full English README](README.md)
- [Remediation guide](docs/remediation.md)
- [Privacy and data handling](docs/privacy.md)
- [Comparison](docs/comparison.md)

