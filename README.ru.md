# agent-secret-guard

Read this in your language: [English](README.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Español](README.es.md) | [Français](README.fr.md) | [Deutsch](README.de.md) | [Português](README.pt.md) | Русский | [العربية](README.ar.md) | [हिन्दी](README.hi.md) | [Bahasa Indonesia](README.id.md)

Сканер опасных конфигураций и secrets для проектов AI coding agents, MCP и локальной автоматизации.

`agent-secret-guard` — это 5-минутная проверка безопасности для репозиториев эпохи AI agents. Он ищет места, которые обычные secret scanners могут пропустить: аргументы команд MCP, правила AI coding, заметки локальной автоматизации, пути к browser profiles, ссылки на credential stores и слишком широкие permissions в GitHub Actions workflows.

## Зачем это нужно

AI coding agents и MCP servers ускоряют локальную автоматизацию, но secrets начинают появляться в новых местах.

- MCP-конфигурации могут передавать tokens через `args`, где они могут попасть в список процессов, logs или shell history.
- Файлы инструкций для agent могут содержать опасные shell-команды, приватные локальные пути или временные заметки.
- Browser profiles и credential stores могут открывать сессии за пределами репозитория.
- GitHub Actions может дать publish jobs слишком широкие права на запись.

## Quick Start

```bash
npx agent-secret-guard scan
```

Завершить CI с ошибкой при high или critical findings:

```bash
npx agent-secret-guard scan . --fail-on high
```

Создать SARIF для GitHub Code Scanning:

```bash
npx agent-secret-guard scan . --format sarif --output agent-secret-guard.sarif --fail-on high
```

## Что он находит

- Tokens или API keys в MCP `args`.
- Hardcoded tokens для npm, PyPI, GitHub, GitLab, Hugging Face, Stripe, OpenAI и Anthropic.
- Слишком широкий filesystem access, например `/`, `C:\`, `/Users` или `C:\Users`.
- Опасные shell-команды, remote scripts напрямую в shell, recursive delete, `chmod 777` или открытый Docker socket.
- Пути к browser profile, cookies и credential stores.
- GitHub Actions `permissions: write-all` и mutable refs вроде `@main` или `@latest`.

## Связь с другими инструментами

Это не замена GitHub Secret Scanning, gitleaks, TruffleHog, detect-secrets или secretlint. Используйте их тоже.

`agent-secret-guard` фокусируется на конфигурационном слое AI agents, MCP и локальной автоматизации: MCP arguments, browser profiles, credential stores, локальные rule files и GitHub Actions permissions.

## Privacy

CLI сканирует локальные файлы и создает локальные отчеты. Он не загружает код или findings и не проверяет tokens через удаленные provider APIs. Но отчеты могут содержать private paths или контекст, поэтому SARIF, JSON и text reports нужно считать чувствительными артефактами.

## Links

- [Full English README](README.md)
- [Remediation guide](docs/remediation.md)
- [Privacy and data handling](docs/privacy.md)
- [Comparison](docs/comparison.md)

