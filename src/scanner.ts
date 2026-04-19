import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative } from "node:path";
import { scanFileWithRules } from "./rules.js";
import type { Finding, ScanFile, ScanResult, ScanTargetInput } from "./types.js";

const DEFAULT_INCLUDE_PATTERNS = [
  /(^|[\\/])\.env(?:\..*)?$/i,
  /(^|[\\/])\.mcp\.json$/i,
  /(^|[\\/])\.npmrc$/i,
  /(^|[\\/])\.pypirc$/i,
  /(^|[\\/])\.cursorrules$/i,
  /(^|[\\/])\.windsurfrules$/i,
  /(^|[\\/])\.aider(?:\.[^\\/]+)?\.ya?ml$/i,
  /(^|[\\/])mcp\.json$/i,
  /(^|[\\/])settings\.json$/i,
  /(^|[\\/])GEMINI\.md$/i,
  /(^|[\\/])CODEX\.md$/i,
  /(^|[\\/])AGENTS\.md$/i,
  /(^|[\\/])CLAUDE\.md$/i,
  /(^|[\\/])README(?:\.[a-z0-9]+)?$/i,
  /(^|[\\/])docker-compose\.ya?ml$/i,
  /(^|[\\/])\.cursor[\\/](?:mcp\.json|rules[\\/][^\\/]+\.mdc?)$/i,
  /(^|[\\/])\.vscode[\\/]mcp\.json$/i,
  /(^|[\\/])\.claude[\\/]settings\.json$/i,
  /(^|[\\/])\.codex[\\/]config\.toml$/i,
  /(^|[\\/])\.github[\\/]workflows[\\/][^\\/]+\.ya?ml$/i
];

const DEFAULT_IGNORE_DIRS = new Set([
  ".git",
  "node_modules",
  "dist",
  "coverage",
  ".next",
  ".turbo",
  ".cache"
]);

const MAX_FILE_BYTES = 1024 * 1024;

export async function scanTarget(input: ScanTargetInput = {}): Promise<ScanResult> {
  const files = input.files ?? (await collectFiles(input.root ?? process.cwd(), input.excludePatterns ?? []));
  const findings = files.flatMap((file) => toFindings(file));

  return {
    scannedFiles: files.length,
    findings: findings.sort(compareFindings)
  };
}

export async function collectFiles(root: string, excludePatterns: string[] = []): Promise<ScanFile[]> {
  const files: ScanFile[] = [];
  await walk(root, root, files, excludePatterns.map(normalizePath));
  return files;
}

function toFindings(file: ScanFile): Finding[] {
  return scanFileWithRules(file).map((match) => ({
    ...match,
    filePath: file.path,
    line: match.line ?? 1
  }));
}

async function walk(root: string, current: string, files: ScanFile[], excludePatterns: string[]): Promise<void> {
  const entries = await readdir(current, { withFileTypes: true });

  for (const entry of entries) {
    const absolutePath = join(current, entry.name);
    const relativePath = normalizePath(relative(root, absolutePath));

    if (isExcluded(relativePath, excludePatterns)) {
      continue;
    }

    if (entry.isDirectory()) {
      if (!DEFAULT_IGNORE_DIRS.has(entry.name)) {
        await walk(root, absolutePath, files, excludePatterns);
      }
      continue;
    }

    if (!entry.isFile() || !shouldScan(relativePath)) {
      continue;
    }

    const fileStat = await stat(absolutePath);
    if (fileStat.size > MAX_FILE_BYTES) {
      continue;
    }

    const content = await readFile(absolutePath, "utf8");
    files.push({ path: relativePath, content });
  }
}

function shouldScan(path: string): boolean {
  return DEFAULT_INCLUDE_PATTERNS.some((pattern) => pattern.test(path));
}

function compareFindings(left: Finding, right: Finding): number {
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  return (
    severityOrder[left.severity] - severityOrder[right.severity] ||
    left.filePath.localeCompare(right.filePath) ||
    left.line - right.line ||
    left.ruleId.localeCompare(right.ruleId)
  );
}

function normalizePath(path: string): string {
  return path.replace(/\\/g, "/");
}

function isExcluded(path: string, patterns: string[]): boolean {
  return patterns.some((pattern) => matchesPattern(path, pattern));
}

function matchesPattern(path: string, pattern: string): boolean {
  if (!pattern) {
    return false;
  }

  const normalizedPattern = normalizePath(pattern).replace(/^\.\//, "");
  if (normalizedPattern.endsWith("/**")) {
    const prefix = normalizedPattern.slice(0, -3);
    return path === prefix || path.startsWith(`${prefix}/`);
  }

  if (normalizedPattern.includes("*")) {
    return globToRegExp(normalizedPattern).test(path);
  }

  return path === normalizedPattern || path.startsWith(`${normalizedPattern}/`);
}

function globToRegExp(pattern: string): RegExp {
  let source = "^";
  for (let index = 0; index < pattern.length; index += 1) {
    const char = pattern[index];
    const next = pattern[index + 1];

    if (char === "*" && next === "*") {
      source += ".*";
      index += 1;
      continue;
    }

    if (char === "*") {
      source += "[^/]*";
      continue;
    }

    source += char.replace(/[|\\{}()[\]^$+?.]/g, "\\$&");
  }

  source += "$";
  return new RegExp(source);
}
