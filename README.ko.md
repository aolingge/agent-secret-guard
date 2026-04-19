# agent-secret-guard

Read this in your language: [English](README.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md) | [日本語](README.ja.md) | 한국어 | [Español](README.es.md) | [Français](README.fr.md) | [Deutsch](README.de.md) | [Português](README.pt.md) | [Русский](README.ru.md) | [العربية](README.ar.md) | [हिन्दी](README.hi.md) | [Bahasa Indonesia](README.id.md)

AI coding agent, MCP, 로컬 자동화 프로젝트를 위한 위험 설정과 secret 스캐너입니다.

`agent-secret-guard`는 5분 안에 실행할 수 있는 안전 점검 CLI입니다. 일반 secret scanner가 놓치기 쉬운 MCP 명령 인자, AI coding 규칙, 로컬 자동화 메모, 브라우저 profile 경로, credential store 참조, 과도한 GitHub Actions workflow 권한을 확인합니다.

## 왜 필요한가

AI coding agent와 MCP server는 로컬 자동화를 빠르게 만들지만, secret이 새로운 위치로 이동하게 만듭니다.

- MCP 설정은 token을 `args`에 직접 넣을 수 있고, 이 값은 프로세스 목록, 로그, shell history에 노출될 수 있습니다.
- Agent 지시 파일에는 위험한 shell 명령, 로컬 private path, 임시 디버깅 메모가 남을 수 있습니다.
- 브라우저 profile과 credential store는 저장소 밖의 계정 세션까지 열 수 있습니다.
- GitHub Actions workflow가 배포 작업에 너무 넓은 쓰기 권한을 줄 수 있습니다.

## Quick Start

```bash
npx agent-secret-guard scan
```

CI에서 high 또는 critical finding이 있으면 실패시키기:

```bash
npx agent-secret-guard scan . --fail-on high
```

GitHub Code Scanning용 SARIF 생성:

```bash
npx agent-secret-guard scan . --format sarif --output agent-secret-guard.sarif --fail-on high
```

## 감지하는 항목

- MCP `args` 안의 token 또는 API key.
- npm, PyPI, GitHub, GitLab, Hugging Face, Stripe, OpenAI, Anthropic 형태의 하드코딩된 token.
- `/`, `C:\`, `/Users`, `C:\Users` 같은 과도한 filesystem access.
- 원격 script를 shell로 pipe하는 명령, 재귀 삭제, `chmod 777`, Docker socket 노출.
- 브라우저 profile, cookie, credential store 경로.
- GitHub Actions의 `permissions: write-all` 및 `@main`, `@latest` 같은 mutable action ref.

## 다른 도구와의 관계

GitHub Secret Scanning, gitleaks, TruffleHog, detect-secrets, secretlint를 대체하지 않습니다. 함께 사용하는 것을 권장합니다.

`agent-secret-guard`는 AI agent / MCP / 로컬 자동화 설정 계층에 집중합니다. 특히 MCP 인자, 브라우저 profile, credential store, 로컬 규칙 파일, GitHub Actions 권한을 확인합니다.

## Privacy

CLI는 로컬 파일을 로컬에서 스캔합니다. 코드나 보고서를 업로드하지 않고, token을 원격으로 검증하지도 않습니다. 다만 보고서에는 private path나 주변 문맥이 포함될 수 있으므로 SARIF, JSON, text report를 민감한 아티팩트로 취급하세요.

## Links

- [Full English README](README.md)
- [Remediation guide](docs/remediation.md)
- [Privacy and data handling](docs/privacy.md)
- [Comparison](docs/comparison.md)

