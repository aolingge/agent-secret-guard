# agent-secret-guard

Read this in your language: [English](README.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Español](README.es.md) | [Français](README.fr.md) | [Deutsch](README.de.md) | Português | [Русский](README.ru.md) | [العربية](README.ar.md) | [हिन्दी](README.hi.md) | [Bahasa Indonesia](README.id.md)

Scanner de configurações perigosas e secrets para projetos de AI coding agents, MCP e automação local.

`agent-secret-guard` é uma verificação de segurança de 5 minutos para repositórios da era dos agentes. Ele procura lugares que secret scanners comuns podem deixar passar: argumentos de comando MCP, regras de AI coding, notas de automação local, caminhos de browser profile, referências a credential stores e workflows do GitHub Actions com permissões amplas demais.

## Por que existe

AI coding agents e MCP servers aceleram a automação local, mas também movem secrets para novos lugares.

- Configurações MCP podem passar tokens em `args`, onde eles podem aparecer em listas de processos, logs ou histórico do shell.
- Arquivos de instrução de agentes podem conter comandos shell perigosos, caminhos privados ou notas temporárias.
- Browser profiles e credential stores podem desbloquear sessões fora do repositório.
- GitHub Actions pode dar permissões de escrita amplas demais a jobs de publicação.

## Quick Start

```bash
npx agent-secret-guard scan
```

Falhar CI quando houver findings high ou critical:

```bash
npx agent-secret-guard scan . --fail-on high
```

Gerar SARIF para GitHub Code Scanning:

```bash
npx agent-secret-guard scan . --format sarif --output agent-secret-guard.sarif --fail-on high
```

## O que ele detecta

- Tokens ou API keys em MCP `args`.
- Tokens hardcoded de npm, PyPI, GitHub, GitLab, Hugging Face, Stripe, OpenAI e Anthropic.
- Acesso amplo demais ao filesystem, como `/`, `C:\`, `/Users` ou `C:\Users`.
- Comandos shell perigosos, scripts remotos enviados direto para shell, exclusão recursiva, `chmod 777` ou exposição do Docker socket.
- Caminhos de browser profile, cookies e credential stores.
- `permissions: write-all` e refs mutáveis como `@main` ou `@latest` no GitHub Actions.

## Relação com outras ferramentas

Ele não substitui GitHub Secret Scanning, gitleaks, TruffleHog, detect-secrets ou secretlint. Use essas ferramentas também.

`agent-secret-guard` foca na camada de configuração de AI agents, MCP e automação local: argumentos MCP, browser profiles, credential stores, arquivos de regras locais e permissões do GitHub Actions.

## Privacidade

A CLI escaneia arquivos locais e gera relatórios locais. Ela não envia código nem findings e não verifica tokens contra provedores remotos. Mesmo assim, relatórios podem conter caminhos privados ou contexto sensível, então trate SARIF, JSON e texto como artefatos sensíveis.

## Links

- [README completo em inglês](README.md)
- [Guia de remediação](docs/remediation.md)
- [Privacidade e dados](docs/privacy.md)
- [Comparação](docs/comparison.md)

