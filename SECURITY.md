# Security Policy

## Reporting a Vulnerability

Please do not open a public issue for a suspected vulnerability that includes real secrets, private paths, tokens, cookies, or internal infrastructure details.

Use GitHub private vulnerability reporting if it is available on the repository. If not, open a minimal public issue that says you have a security report to share, but do not include sensitive details.

## Handling Scan Output

`agent-secret-guard` tries to redact evidence, but security tools can still surface private file names, local paths, and contextual strings. Treat scan output as sensitive until reviewed.

If a real secret was committed:

1. Revoke or rotate it first.
2. Remove it from config and history where appropriate.
3. Replace it with an environment variable or secret-manager reference.
4. Add a regression test or CI scan so it does not return.
