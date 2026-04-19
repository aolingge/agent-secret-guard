# agent-secret-guard

Read this in your language: [English](README.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | Español | [Français](README.fr.md) | [Deutsch](README.de.md) | [Português](README.pt.md) | [Русский](README.ru.md) | [العربية](README.ar.md) | [हिन्दी](README.hi.md) | [Bahasa Indonesia](README.id.md)

Escáner de configuración peligrosa y secrets para proyectos de AI coding agents, MCP y automatización local.

`agent-secret-guard` es una comprobación de seguridad de 5 minutos para repositorios de la era de los agentes. Busca lugares que los secret scanners normales suelen pasar por alto: argumentos de comandos MCP, reglas de AI coding, notas de automatización local, rutas de browser profiles, referencias a credential stores y workflows de GitHub Actions con permisos demasiado amplios.

## Por qué existe

Los AI coding agents y los MCP servers aceleran la automatización local, pero también mueven secrets a lugares nuevos.

- Las configuraciones MCP pueden pasar tokens en `args`, donde pueden filtrarse en listados de procesos, logs o historial del shell.
- Los archivos de instrucciones de agentes pueden contener comandos shell peligrosos, rutas privadas o notas temporales.
- Los browser profiles y credential stores pueden desbloquear sesiones fuera del repositorio.
- GitHub Actions puede dar permisos de escritura demasiado amplios a jobs de publicación.

## Quick Start

```bash
npx agent-secret-guard scan
```

Fallar CI si hay findings high o critical:

```bash
npx agent-secret-guard scan . --fail-on high
```

Generar SARIF para GitHub Code Scanning:

```bash
npx agent-secret-guard scan . --format sarif --output agent-secret-guard.sarif --fail-on high
```

## Qué detecta

- Tokens o API keys dentro de MCP `args`.
- Tokens hardcoded de npm, PyPI, GitHub, GitLab, Hugging Face, Stripe, OpenAI y Anthropic.
- Acceso demasiado amplio al filesystem como `/`, `C:\`, `/Users` o `C:\Users`.
- Comandos shell peligrosos, como scripts remotos enviados directamente a shell, borrados recursivos, `chmod 777` o exposición del Docker socket.
- Rutas de browser profile, cookies y credential stores.
- `permissions: write-all` y referencias mutables como `@main` o `@latest` en GitHub Actions.

## Relación con otras herramientas

No reemplaza a GitHub Secret Scanning, gitleaks, TruffleHog, detect-secrets ni secretlint. Úsalas también.

`agent-secret-guard` se enfoca en la capa de configuración de AI agents, MCP y automatización local: argumentos MCP, browser profiles, credential stores, archivos de reglas locales y permisos de GitHub Actions.

## Privacidad

La CLI escanea archivos locales y produce reportes locales. No sube código ni findings, y no verifica tokens contra servicios remotos. Aun así, los reportes pueden incluir rutas privadas o contexto sensible, así que trata SARIF, JSON y texto como artefactos sensibles.

## Enlaces

- [README completo en inglés](README.md)
- [Guía de remediación](docs/remediation.md)
- [Privacidad y manejo de datos](docs/privacy.md)
- [Comparación](docs/comparison.md)

