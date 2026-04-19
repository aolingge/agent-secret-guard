# agent-secret-guard

Read this in your language: [English](README.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Español](README.es.md) | [Français](README.fr.md) | [Deutsch](README.de.md) | [Português](README.pt.md) | [Русский](README.ru.md) | العربية | [हिन्दी](README.hi.md) | [Bahasa Indonesia](README.id.md)

ماسح للإعدادات الخطرة و secrets في مشاريع AI coding agents و MCP والأتمتة المحلية.

`agent-secret-guard` هو فحص أمان سريع لمدة 5 دقائق لمستودعات عصر الوكلاء. يبحث في الأماكن التي قد تتجاوزها أدوات secret scanner العادية: وسائط أوامر MCP، قواعد AI coding، ملاحظات الأتمتة المحلية، مسارات browser profile، مراجع credential stores، و GitHub Actions workflows ذات الصلاحيات الواسعة.

## لماذا نحتاجه

تجعل AI coding agents و MCP servers الأتمتة المحلية أسرع، لكنها تنقل secrets إلى أماكن جديدة.

- قد تمرر إعدادات MCP tokens داخل `args`، وقد تظهر هذه القيم في قوائم العمليات أو logs أو shell history.
- قد تحتوي ملفات تعليمات agent على أوامر shell خطرة، أو مسارات خاصة، أو ملاحظات مؤقتة.
- قد تكشف browser profiles و credential stores جلسات وحسابات خارج المستودع.
- قد تمنح GitHub Actions مهام النشر صلاحيات كتابة واسعة جدًا.

## Quick Start

```bash
npx agent-secret-guard scan
```

اجعل CI يفشل عند وجود findings بدرجة high أو critical:

```bash
npx agent-secret-guard scan . --fail-on high
```

إنشاء SARIF لاستخدامه مع GitHub Code Scanning:

```bash
npx agent-secret-guard scan . --format sarif --output agent-secret-guard.sarif --fail-on high
```

## ما الذي يكتشفه

- tokens أو API keys داخل MCP `args`.
- tokens مكتوبة مباشرة لخدمات npm و PyPI و GitHub و GitLab و Hugging Face و Stripe و OpenAI و Anthropic.
- وصول واسع جدًا إلى filesystem مثل `/` أو `C:\` أو `/Users` أو `C:\Users`.
- أوامر shell خطرة مثل تشغيل remote scripts مباشرة عبر shell، أو الحذف التكراري، أو `chmod 777`، أو كشف Docker socket.
- مسارات browser profile و cookies و credential stores.
- `permissions: write-all` ومراجع mutable مثل `@main` أو `@latest` في GitHub Actions.

## علاقته بالأدوات الأخرى

لا يستبدل GitHub Secret Scanning أو gitleaks أو TruffleHog أو detect-secrets أو secretlint. استخدمها معه.

يركز `agent-secret-guard` على طبقة إعدادات AI agents و MCP والأتمتة المحلية: وسائط MCP، و browser profiles، و credential stores، وملفات القواعد المحلية، وصلاحيات GitHub Actions.

## الخصوصية

يفحص CLI الملفات محليًا وينتج تقارير محلية. لا يرفع الكود أو findings، ولا يتحقق من tokens عبر خدمات بعيدة. ومع ذلك قد تحتوي التقارير على مسارات خاصة أو سياق حساس، لذلك تعامل مع تقارير SARIF و JSON والنصوص كملفات حساسة.

## روابط

- [Full English README](README.md)
- [Remediation guide](docs/remediation.md)
- [Privacy and data handling](docs/privacy.md)
- [Comparison](docs/comparison.md)

