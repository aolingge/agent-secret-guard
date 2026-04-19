import type { RuleMatch, ScanFile } from "./types.js";

const SECRET_VALUE_PATTERN =
  /(?:sk-[A-Za-z0-9_-]{20,}|sk-ant-[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9_]{20,}|xox[baprs]-[A-Za-z0-9-]{20,}|AKIA[0-9A-Z]{16})/g;

const NAMED_SECRET_PATTERN =
  /\b(?:api[_-]?key|access[_-]?token|auth[_-]?token|secret|password)\b\s*[:=]\s*["']?([^"'\s,#}]{12,})/gi;

const ENV_PLACEHOLDER_PATTERN =
  /^(?:\$\{?[A-Z0-9_]+\}?|process\.env\.[A-Z0-9_]+|env\.[A-Z0-9_]+|\{\{\s*secrets\.[A-Z0-9_]+\s*\}\})$/i;

const DANGEROUS_SHELL_PATTERNS = [
  /\b(?:curl|wget)\b[^|\n]*(?:\||\s+-o\s+-)[^\n]*\b(?:bash|sh|zsh|pwsh|powershell)\b/gi,
  /\bInvoke-WebRequest\b[^\n|]*\|\s*(?:iex|Invoke-Expression)\b/gi,
  /\brm\s+-rf\s+(?:\/|\$HOME|~)\b/gi,
  /\bchmod\s+-R\s+777\b/gi,
  /(?:\/var\/run\/docker\.sock|docker\.sock):/gi
];

const BROWSER_PROFILE_PATTERN =
  /(?:Chrome\\User Data|Google[\\/]+Chrome[\\/]+User Data|Microsoft[\\/]+Edge[\\/]+User Data|Firefox[\\/]+Profiles|Cookies(?:\s|$)|Network[\\/]+Cookies)/i;

const CREDENTIAL_STORE_PATTERN =
  /(?:Windows Credential Manager|Credential Manager|Keychain|\.git-credentials|\.aws[\\/]+credentials|\.npmrc|_authToken)/i;

const BROAD_FS_PATTERN =
  /(?:["'\s](?:\/|C:\\|C:\/|\/Users|\/home|C:\\Users|C:\/Users)["'\s,]|--root\s+(?:\/|C:\\|C:\/)|--allow\s+(?:\/|C:\\|C:\/))/gi;

const MCP_FILE_PATTERN = /(?:^|[\\/])(?:\.mcp\.json|mcp\.json|settings\.json)$/i;

export function scanFileWithRules(file: ScanFile): RuleMatch[] {
  const matches: RuleMatch[] = [];
  const content = file.content;

  matches.push(...findHardcodedSecrets(content));

  if (MCP_FILE_PATTERN.test(file.path)) {
    matches.push(...findMcpTokenArgs(file));
    matches.push(...findBroadFilesystemAccess(content));
  }

  matches.push(...findDangerousShellCommands(content));
  matches.push(...findBrowserProfileExposure(content));
  matches.push(...findCredentialStoreExposure(content));

  return dedupeMatches(matches);
}

function findHardcodedSecrets(content: string): RuleMatch[] {
  const matches: RuleMatch[] = [];
  for (const match of content.matchAll(SECRET_VALUE_PATTERN)) {
    const evidence = match[0];
    if (isSafeReference(evidence)) {
      continue;
    }
    matches.push({
      ruleId: "hardcoded-secret",
      severity: "critical",
      title: "Hardcoded secret",
      evidence: redact(evidence),
      why: "A real-looking token in project files can be copied into prompts, logs, commits, or agent context.",
      recommendation: "Revoke the exposed value, move it to a secret manager or environment variable, and reference the variable name from config.",
      safeExample: "env: { OPENAI_API_KEY: \"${OPENAI_API_KEY}\" }",
      line: lineForIndex(content, match.index ?? 0)
    });
  }

  for (const match of content.matchAll(NAMED_SECRET_PATTERN)) {
    const value = match[1];
    if (isSafeReference(value) || isObviouslyPlaceholder(value)) {
      continue;
    }
    matches.push({
      ruleId: "hardcoded-secret",
      severity: "critical",
      title: "Hardcoded secret-like value",
      evidence: redact(value),
      why: "A named secret value is stored directly in a repository file instead of being injected at runtime.",
      recommendation: "Keep only the variable name in version control and provide the value through local environment or CI secrets.",
      safeExample: "API_KEY=${API_KEY}",
      line: lineForIndex(content, match.index ?? 0)
    });
  }

  return matches;
}

function findMcpTokenArgs(file: ScanFile): RuleMatch[] {
  const matches: RuleMatch[] = [];

  try {
    const parsed = JSON.parse(file.content) as unknown;
    visitJson(parsed, (value, keyPath) => {
      if (!Array.isArray(value) || keyPath.at(-1) !== "args") {
        return;
      }

      for (let index = 0; index < value.length; index += 1) {
        const arg = String(value[index] ?? "");
        const next = String(value[index + 1] ?? "");

        if (isTokenFlag(arg) && next && !isSafeReference(next) && !isObviouslyPlaceholder(next)) {
          matches.push(mcpTokenFinding(next, file.content.indexOf(next)));
        }

        const inlineToken = arg.match(/--(?:api[-_]?key|token|access[-_]?token|secret)=(.+)$/i);
        if (inlineToken && !isSafeReference(inlineToken[1]) && !isObviouslyPlaceholder(inlineToken[1])) {
          matches.push(mcpTokenFinding(inlineToken[1], file.content.indexOf(inlineToken[1])));
        }

        if (SECRET_VALUE_PATTERN.test(arg)) {
          matches.push(mcpTokenFinding(arg, file.content.indexOf(arg)));
        }
        SECRET_VALUE_PATTERN.lastIndex = 0;
      }
    });
  } catch {
    for (const match of file.content.matchAll(/--(?:api[-_]?key|token|access[-_]?token|secret)(?:=|\s+)([^"'\s,\]]{8,})/gi)) {
      if (!isSafeReference(match[1]) && !isObviouslyPlaceholder(match[1])) {
        matches.push(mcpTokenFinding(match[1], match.index ?? 0));
      }
    }
  }

  return matches;

  function mcpTokenFinding(value: string, index: number): RuleMatch {
    return {
      ruleId: "mcp-token-in-args",
      severity: "critical",
      title: "MCP token passed through args",
      evidence: redact(value),
      why: "Command-line args are visible to process listings, shell history, logs, and agent transcripts.",
      recommendation: "Move the value into environment injection and pass only a variable reference in MCP config.",
      safeExample: "\"env\": { \"SERVICE_TOKEN\": \"${SERVICE_TOKEN}\" }",
      line: lineForIndex(file.content, Math.max(index, 0))
    };
  }
}

function findBroadFilesystemAccess(content: string): RuleMatch[] {
  const matches: RuleMatch[] = [];
  for (const match of content.matchAll(BROAD_FS_PATTERN)) {
    matches.push({
      ruleId: "broad-filesystem-access",
      severity: "high",
      title: "Over-broad filesystem access",
      evidence: match[0].trim(),
      why: "Giving an agent broad filesystem roots makes accidental data exposure and destructive actions much more likely.",
      recommendation: "Limit filesystem access to the project folder or a purpose-built scratch directory.",
      safeExample: "\"args\": [\"--root\", \"./workspace\"]",
      line: lineForIndex(content, match.index ?? 0)
    });
  }
  return matches;
}

function findDangerousShellCommands(content: string): RuleMatch[] {
  const matches: RuleMatch[] = [];
  for (const pattern of DANGEROUS_SHELL_PATTERNS) {
    for (const match of content.matchAll(pattern)) {
      matches.push({
        ruleId: "dangerous-shell-command",
        severity: "high",
        title: "Dangerous shell command",
        evidence: match[0].trim(),
        why: "Agents may execute copied setup commands without the same caution a human would apply.",
        recommendation: "Pin downloads, verify checksums, avoid piping remote scripts into shells, and require explicit confirmation for destructive commands.",
        safeExample: "curl -fsSLO https://example.com/install.sh && shasum -a 256 install.sh",
        line: lineForIndex(content, match.index ?? 0)
      });
    }
  }
  return matches;
}

function findBrowserProfileExposure(content: string): RuleMatch[] {
  const match = content.match(BROWSER_PROFILE_PATTERN);
  if (!match) {
    return [];
  }
  return [
    {
      ruleId: "browser-profile-exposure",
      severity: "high",
      title: "Browser profile exposure",
      evidence: match[0],
      why: "Browser profiles can contain cookies, session tokens, history, autofill data, and logged-in app state.",
      recommendation: "Use a dedicated throwaway browser profile for automation and never mount a personal profile into agents or containers.",
      safeExample: "AGENT_BROWSER_PROFILE=./.agent-browser-profile",
      line: lineForIndex(content, match.index ?? 0)
    }
  ];
}

function findCredentialStoreExposure(content: string): RuleMatch[] {
  const match = content.match(CREDENTIAL_STORE_PATTERN);
  if (!match) {
    return [];
  }
  return [
    {
      ruleId: "credential-store-exposure",
      severity: "high",
      title: "Credential store exposure",
      evidence: match[0],
      why: "Credential stores and token files can unlock many services beyond the project being scanned.",
      recommendation: "Use scoped project tokens, CI secrets, or OS credential APIs instead of exposing the credential store path.",
      safeExample: "Use GITHUB_TOKEN from CI secrets with least required permissions.",
      line: lineForIndex(content, match.index ?? 0)
    }
  ];
}

function visitJson(value: unknown, visitor: (value: unknown, keyPath: string[]) => void, keyPath: string[] = []): void {
  visitor(value, keyPath);
  if (Array.isArray(value)) {
    value.forEach((item, index) => visitJson(item, visitor, [...keyPath, String(index)]));
  } else if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      visitJson(child, visitor, [...keyPath, key]);
    }
  }
}

function isTokenFlag(value: string): boolean {
  return /^--(?:api[-_]?key|token|access[-_]?token|secret)$/i.test(value);
}

function isSafeReference(value: string): boolean {
  return ENV_PLACEHOLDER_PATTERN.test(value.trim());
}

function isObviouslyPlaceholder(value: string): boolean {
  return /^(?:changeme|change-me|example|placeholder|your[_-]?(?:token|key|secret)|xxx+|test)$/i.test(value.trim());
}

function lineForIndex(content: string, index: number): number {
  return content.slice(0, index).split(/\r?\n/).length;
}

function redact(value: string): string {
  if (value.length <= 10) {
    return "[redacted]";
  }
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

function dedupeMatches(matches: RuleMatch[]): RuleMatch[] {
  const seen = new Set<string>();
  return matches.filter((match) => {
    const key = `${match.ruleId}:${match.line}:${match.evidence}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}
