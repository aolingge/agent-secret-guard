# agent-secret-guard

Read this in your language: [English](README.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Español](README.es.md) | Français | [Deutsch](README.de.md) | [Português](README.pt.md) | [Русский](README.ru.md) | [العربية](README.ar.md) | [हिन्दी](README.hi.md) | [Bahasa Indonesia](README.id.md)

Scanner de configurations dangereuses et de secrets pour les projets AI coding agents, MCP et automatisation locale.

`agent-secret-guard` est une vérification de sécurité en 5 minutes pour les dépôts de l'ère des agents. Il cherche les endroits que les secret scanners classiques peuvent manquer : arguments de commande MCP, règles d'AI coding, notes d'automatisation locale, chemins de browser profile, références aux credential stores et workflows GitHub Actions trop permissifs.

## Pourquoi ce projet existe

Les AI coding agents et les MCP servers accélèrent l'automatisation locale, mais déplacent aussi les secrets vers de nouveaux endroits.

- Les configurations MCP peuvent passer des tokens dans `args`, visibles dans les listes de processus, les logs ou l'historique shell.
- Les fichiers d'instructions d'agents peuvent contenir des commandes shell dangereuses, des chemins privés ou des notes temporaires.
- Les browser profiles et credential stores peuvent ouvrir des sessions au-delà du dépôt.
- GitHub Actions peut donner des permissions d'écriture trop larges aux jobs de publication.

## Quick Start

```bash
npx agent-secret-guard scan
```

Faire échouer CI avec des findings high ou critical :

```bash
npx agent-secret-guard scan . --fail-on high
```

Générer du SARIF pour GitHub Code Scanning :

```bash
npx agent-secret-guard scan . --format sarif --output agent-secret-guard.sarif --fail-on high
```

## Ce qu'il détecte

- Tokens ou API keys dans les MCP `args`.
- Tokens hardcodés npm, PyPI, GitHub, GitLab, Hugging Face, Stripe, OpenAI et Anthropic.
- Accès filesystem trop large comme `/`, `C:\`, `/Users` ou `C:\Users`.
- Commandes shell dangereuses, scripts distants pipés vers shell, suppression récursive, `chmod 777` ou exposition du Docker socket.
- Chemins de browser profile, cookies et credential stores.
- `permissions: write-all` et références mutables comme `@main` ou `@latest` dans GitHub Actions.

## Relation avec les autres outils

Il ne remplace pas GitHub Secret Scanning, gitleaks, TruffleHog, detect-secrets ou secretlint. Utilisez-les aussi.

`agent-secret-guard` se concentre sur la couche de configuration AI agent / MCP / automatisation locale : arguments MCP, browser profiles, credential stores, fichiers de règles locales et permissions GitHub Actions.

## Confidentialité

La CLI scanne les fichiers localement et produit des rapports locaux. Elle n'envoie pas le code ni les findings, et ne vérifie pas les tokens auprès de services distants. Les rapports peuvent toutefois contenir des chemins privés ou du contexte sensible ; traitez donc les rapports SARIF, JSON et texte comme des artefacts sensibles.

## Liens

- [README complet en anglais](README.md)
- [Guide de remédiation](docs/remediation.md)
- [Confidentialité et données](docs/privacy.md)
- [Comparaison](docs/comparison.md)

