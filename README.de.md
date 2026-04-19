# agent-secret-guard

Read this in your language: [English](README.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Español](README.es.md) | [Français](README.fr.md) | Deutsch | [Português](README.pt.md) | [Русский](README.ru.md) | [العربية](README.ar.md) | [हिन्दी](README.hi.md) | [Bahasa Indonesia](README.id.md)

Scanner für gefährliche Konfigurationen und Secrets in AI-coding-agent-, MCP- und lokalen Automatisierungsprojekten.

`agent-secret-guard` ist ein 5-Minuten-Sicherheitscheck für Agent-Ära-Repositories. Er sucht an Stellen, die normale Secret Scanner leicht übersehen: MCP-Kommandoargumente, AI-coding-Regeln, lokale Automatisierungsnotizen, Browser-Profile-Pfade, Credential-Store-Verweise und zu weit gefasste GitHub-Actions-Workflows.

## Warum es existiert

AI coding agents und MCP servers beschleunigen lokale Automatisierung, verschieben Secrets aber auch an neue Stellen.

- MCP-Konfigurationen können Tokens in `args` übergeben, wo sie in Prozesslisten, Logs oder Shell-History auftauchen können.
- Agent-Anweisungsdateien können gefährliche Shell-Befehle, private lokale Pfade oder temporäre Debug-Notizen enthalten.
- Browser profiles und credential stores können Sitzungen außerhalb des Repositories öffnen.
- GitHub Actions kann Publishing-Jobs zu breite Schreibrechte geben.

## Quick Start

```bash
npx agent-secret-guard scan
```

CI bei high- oder critical-Findings fehlschlagen lassen:

```bash
npx agent-secret-guard scan . --fail-on high
```

SARIF für GitHub Code Scanning erzeugen:

```bash
npx agent-secret-guard scan . --format sarif --output agent-secret-guard.sarif --fail-on high
```

## Was erkannt wird

- Tokens oder API keys in MCP `args`.
- Hardcodierte npm-, PyPI-, GitHub-, GitLab-, Hugging-Face-, Stripe-, OpenAI- und Anthropic-Tokens.
- Zu breiter filesystem access wie `/`, `C:\`, `/Users` oder `C:\Users`.
- Gefährliche Shell-Befehle, Remote-Scripts direkt in shell, rekursives Löschen, `chmod 777` oder Docker-socket-Exposition.
- Browser-profile-, cookie- und credential-store-Pfade.
- GitHub Actions `permissions: write-all` und mutable refs wie `@main` oder `@latest`.

## Verhältnis zu anderen Tools

Es ersetzt nicht GitHub Secret Scanning, gitleaks, TruffleHog, detect-secrets oder secretlint. Nutze diese Tools zusätzlich.

`agent-secret-guard` konzentriert sich auf die Konfigurationsschicht von AI agents, MCP und lokaler Automatisierung: MCP-Argumente, browser profiles, credential stores, lokale Regeldateien und GitHub-Actions-Berechtigungen.

## Datenschutz

Die CLI scannt lokale Dateien und erzeugt lokale Berichte. Sie lädt keinen Code oder Findings hoch und verifiziert Tokens nicht gegen Remote-Provider. Berichte können trotzdem private Pfade oder Kontext enthalten; behandle SARIF-, JSON- und Textberichte daher als sensible Artefakte.

## Links

- [Vollständiges englisches README](README.md)
- [Remediation guide](docs/remediation.md)
- [Privacy and data handling](docs/privacy.md)
- [Comparison](docs/comparison.md)

