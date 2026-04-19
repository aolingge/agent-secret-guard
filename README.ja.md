# agent-secret-guard

Read this in your language: [English](README.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md) | 日本語 | [한국어](README.ko.md) | [Español](README.es.md) | [Français](README.fr.md) | [Deutsch](README.de.md) | [Português](README.pt.md) | [Русский](README.ru.md) | [العربية](README.ar.md) | [हिन्दी](README.hi.md) | [Bahasa Indonesia](README.id.md)

AI coding agent、MCP、ローカル自動化プロジェクト向けの危険な設定と secret のスキャナーです。

`agent-secret-guard` は、5 分で使える安全チェック用 CLI です。通常の secret scanner が見落としやすい MCP のコマンド引数、AI coding ルール、ローカル自動化メモ、ブラウザ profile のパス、credential store の参照、権限が広すぎる GitHub Actions workflow を確認します。

## なぜ必要か

AI coding agent と MCP server はローカル自動化を速くしますが、secret が新しい場所に入り込みます。

- MCP 設定では token が `args` に直接入り、プロセス一覧、ログ、shell history に出る可能性があります。
- Agent 指示ファイルには危険な shell コマンド、ローカルの private path、デバッグ用メモが残ることがあります。
- ブラウザ profile や credential store は、リポジトリ外のアカウントセッションまで開いてしまう可能性があります。
- GitHub Actions の公開 workflow が広すぎる書き込み権限を持つことがあります。

## Quick Start

```bash
npx agent-secret-guard scan
```

CI で high または critical の finding があれば失敗させる：

```bash
npx agent-secret-guard scan . --fail-on high
```

GitHub Code Scanning 用の SARIF を生成する：

```bash
npx agent-secret-guard scan . --format sarif --output agent-secret-guard.sarif --fail-on high
```

## 検出するもの

- MCP `args` 内の token や API key。
- npm、PyPI、GitHub、GitLab、Hugging Face、Stripe、OpenAI、Anthropic などのハードコードされた token。
- `/`、`C:\`、`/Users`、`C:\Users` のような広すぎる filesystem access。
- リモート script を shell に pipe する、再帰削除、`chmod 777`、Docker socket 公開などの危険な shell command。
- ブラウザ profile、cookie、credential store のパス。
- GitHub Actions の `permissions: write-all` や `@main`、`@latest` のような可変 action 参照。

## 他のツールとの関係

GitHub Secret Scanning、gitleaks、TruffleHog、detect-secrets、secretlint の代替ではありません。併用をおすすめします。

`agent-secret-guard` は AI agent / MCP / ローカル自動化の設定層に特化しています。特に MCP 引数、ブラウザ profile、credential store、ローカルルールファイル、GitHub Actions の権限を見ます。

## Privacy

CLI はローカルファイルをローカルでスキャンします。コードやレポートをアップロードせず、token の遠隔検証もしません。ただしレポートには private path や文脈が含まれる場合があるため、SARIF、JSON、text report は機密アーティファクトとして扱ってください。

## Links

- [Full English README](README.md)
- [Remediation guide](docs/remediation.md)
- [Privacy and data handling](docs/privacy.md)
- [Comparison](docs/comparison.md)

