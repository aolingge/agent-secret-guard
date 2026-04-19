# agent-secret-guard

Read this in your language: [English](README.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Español](README.es.md) | [Français](README.fr.md) | [Deutsch](README.de.md) | [Português](README.pt.md) | [Русский](README.ru.md) | [العربية](README.ar.md) | [हिन्दी](README.hi.md) | Bahasa Indonesia

Scanner untuk konfigurasi berbahaya dan secrets pada proyek AI coding agents, MCP, dan otomatisasi lokal.

`agent-secret-guard` adalah pemeriksaan keamanan 5 menit untuk repo era agent. Tool ini mencari area yang sering terlewat oleh secret scanner biasa: argumen command MCP, aturan AI coding, catatan otomatisasi lokal, path browser profile, referensi credential store, dan workflow GitHub Actions dengan permission terlalu luas.

## Kenapa ini ada

AI coding agents dan MCP servers membuat otomatisasi lokal lebih cepat, tetapi juga memindahkan secrets ke tempat baru.

- Konfigurasi MCP dapat menaruh token langsung di `args`, sehingga bisa muncul di process list, logs, atau shell history.
- File instruksi agent bisa berisi command shell berbahaya, path privat lokal, atau catatan debugging sementara.
- Browser profiles dan credential stores dapat membuka sesi akun di luar repo.
- GitHub Actions dapat memberi job publishing permission tulis yang terlalu luas.

## Quick Start

```bash
npx agent-secret-guard scan
```

Gagalkan CI saat ada finding high atau critical:

```bash
npx agent-secret-guard scan . --fail-on high
```

Buat SARIF untuk GitHub Code Scanning:

```bash
npx agent-secret-guard scan . --format sarif --output agent-secret-guard.sarif --fail-on high
```

## Yang dideteksi

- Token atau API key di MCP `args`.
- Token hardcoded untuk npm, PyPI, GitHub, GitLab, Hugging Face, Stripe, OpenAI, dan Anthropic.
- Akses filesystem terlalu luas seperti `/`, `C:\`, `/Users`, atau `C:\Users`.
- Command shell berbahaya, remote script langsung ke shell, recursive delete, `chmod 777`, atau Docker socket exposure.
- Path browser profile, cookie, dan credential store.
- GitHub Actions `permissions: write-all` dan mutable refs seperti `@main` atau `@latest`.

## Hubungan dengan tool lain

Ini bukan pengganti GitHub Secret Scanning, gitleaks, TruffleHog, detect-secrets, atau secretlint. Gunakan bersama tool tersebut.

`agent-secret-guard` fokus pada layer konfigurasi AI agent / MCP / otomatisasi lokal: argumen MCP, browser profiles, credential stores, file aturan lokal, dan permission GitHub Actions.

## Privasi

CLI memindai file lokal dan menghasilkan laporan lokal. Tool ini tidak mengunggah code atau findings, dan tidak memverifikasi token ke provider remote. Namun laporan masih bisa berisi path privat atau konteks sensitif, jadi perlakukan SARIF, JSON, dan text reports sebagai artefak sensitif.

## Links

- [Full English README](README.md)
- [Remediation guide](docs/remediation.md)
- [Privacy and data handling](docs/privacy.md)
- [Comparison](docs/comparison.md)

