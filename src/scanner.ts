import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative } from "node:path";
import { scanFileWithRules } from "./rules.js";
import type { Finding, ScanFile, ScanResult, ScanTargetInput } from "./types.js";

const DEFAULT_INCLUDE_PATTERNS = [
  /(^|[\\/])\.env(?:\..*)?$/i,
  /(^|[\\/])\.mcp\.json$/i,
  /(^|[\\/])mcp\.json$/i,
  /(^|[\\/])settings\.json$/i,
  /(^|[\\/])AGENTS\.md$/i,
  /(^|[\\/])CLAUDE\.md$/i,
  /(^|[\\/])README(?:\.[a-z0-9]+)?$/i,
  /(^|[\\/])docker-compose\.ya?ml$/i,
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
  const files = input.files ?? (await collectFiles(input.root ?? process.cwd()));
  const findings = files.flatMap((file) => toFindings(file));

  return {
    scannedFiles: files.length,
    findings: findings.sort(compareFindings)
  };
}

export async function collectFiles(root: string): Promise<ScanFile[]> {
  const files: ScanFile[] = [];
  await walk(root, root, files);
  return files;
}

function toFindings(file: ScanFile): Finding[] {
  return scanFileWithRules(file).map((match) => ({
    ...match,
    filePath: file.path,
    line: match.line ?? 1
  }));
}

async function walk(root: string, current: string, files: ScanFile[]): Promise<void> {
  const entries = await readdir(current, { withFileTypes: true });

  for (const entry of entries) {
    const absolutePath = join(current, entry.name);
    const relativePath = normalizePath(relative(root, absolutePath));

    if (entry.isDirectory()) {
      if (!DEFAULT_IGNORE_DIRS.has(entry.name)) {
        await walk(root, absolutePath, files);
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
