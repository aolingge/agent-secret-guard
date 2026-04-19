#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, join } from "node:path";
import { pathToFileURL } from "node:url";
import {
  formatJsonReport,
  formatSarifReport,
  formatTextReport,
  isSeverity,
  shouldFailForSeverity
} from "./reporters.js";
import { scanTarget } from "./scanner.js";
import type { OutputFormat, Severity } from "./types.js";

interface CliIo {
  stdout: (value: string) => void;
  stderr: (value: string) => void;
}

interface CliOptions {
  command: "scan" | "help" | "version";
  root: string;
  format: OutputFormat;
  excludePatterns: string[];
  failOn?: Severity;
  config?: string;
  output?: string;
}

interface ConfigFile {
  exclude?: string[];
}

const VERSION = readPackageVersion();

export async function runCli(argv: string[], io: CliIo = defaultIo): Promise<number> {
  const parsed = parseArgs(argv);

  if (parsed instanceof Error) {
    io.stderr(`${parsed.message}\n\n${helpText()}`);
    return 2;
  }

  if (parsed.command === "help") {
    io.stdout(helpText());
    return 0;
  }

  if (parsed.command === "version") {
    io.stdout(`${VERSION}\n`);
    return 0;
  }

  const config = await loadConfig(parsed.root, parsed.config);
  const result = await scanTarget({
    root: parsed.root,
    excludePatterns: [...(config.exclude ?? []), ...parsed.excludePatterns]
  });
  const report = formatReport(result, parsed.format);

  if (parsed.output) {
    await writeReportFile(parsed.output, report);
    io.stdout(`Wrote ${parsed.format} report to ${parsed.output}\n`);
  } else {
    io.stdout(report);
  }

  if (parsed.failOn && shouldFailForSeverity(result, parsed.failOn)) {
    return 1;
  }

  return 0;
}

function parseArgs(argv: string[]): CliOptions | Error {
  if (argv.length === 0 || argv.includes("--help") || argv.includes("-h")) {
    return { command: "help", root: process.cwd(), format: "text", excludePatterns: [] };
  }

  if (argv.includes("--version") || argv.includes("-v")) {
    return { command: "version", root: process.cwd(), format: "text", excludePatterns: [] };
  }

  const [command, ...rest] = argv;
  if (command !== "scan") {
    return new Error(`Unknown command: ${command}`);
  }

  const options: CliOptions = {
    command: "scan",
    root: process.cwd(),
    format: "text",
    excludePatterns: []
  };

  for (let index = 0; index < rest.length; index += 1) {
    const arg = rest[index];

    if (arg === "--format") {
      const value = rest[index + 1];
      if (!isOutputFormat(value)) {
        return new Error("--format must be text, json, or sarif");
      }
      options.format = value;
      index += 1;
      continue;
    }

    if (arg === "--output" || arg === "-o") {
      const value = rest[index + 1];
      if (!value || value.startsWith("-")) {
        return new Error("--output requires a file path");
      }
      options.output = value;
      index += 1;
      continue;
    }

    if (arg === "--exclude") {
      const value = rest[index + 1];
      if (!value || value.startsWith("-")) {
        return new Error("--exclude requires a path pattern");
      }
      options.excludePatterns.push(value);
      index += 1;
      continue;
    }

    if (arg === "--config") {
      const value = rest[index + 1];
      if (!value || value.startsWith("-")) {
        return new Error("--config requires a file path");
      }
      options.config = value;
      index += 1;
      continue;
    }

    if (arg === "--fail-on") {
      const value = rest[index + 1];
      if (!value || !isSeverity(value)) {
        return new Error("--fail-on must be one of low, medium, high, critical");
      }
      options.failOn = value;
      index += 1;
      continue;
    }

    if (arg.startsWith("-")) {
      return new Error(`Unknown option: ${arg}`);
    }

    options.root = arg;
  }

  return options;
}

function formatReport(result: Awaited<ReturnType<typeof scanTarget>>, format: OutputFormat): string {
  if (format === "json") {
    return formatJsonReport(result);
  }
  if (format === "sarif") {
    return formatSarifReport(result);
  }
  return formatTextReport(result);
}

async function writeReportFile(filePath: string, content: string): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, content, "utf8");
}

function isOutputFormat(value: string | undefined): value is OutputFormat {
  return value === "text" || value === "json" || value === "sarif";
}

async function loadConfig(root: string, configPath?: string): Promise<ConfigFile> {
  const filePath = configPath
    ? isAbsolute(configPath)
      ? configPath
      : join(root, configPath)
    : join(root, ".agent-secret-guard.json");

  try {
    const parsed = JSON.parse(await readFile(filePath, "utf8")) as ConfigFile;
    if (parsed.exclude && !Array.isArray(parsed.exclude)) {
      throw new Error("Config field 'exclude' must be an array of path patterns");
    }
    return parsed;
  } catch (error: unknown) {
    if (isMissingFileError(error) && !configPath) {
      return {};
    }
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Could not read config ${filePath}: ${message}`);
  }
}

function isMissingFileError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "ENOENT"
  );
}

function readPackageVersion(): string {
  try {
    const packageJson = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")) as {
      version?: string;
    };
    return packageJson.version ?? "0.0.0";
  } catch {
    return "0.0.0";
  }
}

function helpText(): string {
  return `agent-secret-guard

Dangerous config and secret scanner for AI coding agents, MCP, and local automation projects.

Usage:
  agent-secret-guard scan [path] [--format text|json|sarif] [--output report.sarif] [--exclude examples/unsafe/**] [--fail-on low|medium|high|critical]
  agent-secret-guard --version
  agent-secret-guard --help

Examples:
  npx agent-secret-guard scan
  npx agent-secret-guard scan . --fail-on high
  npx agent-secret-guard scan . --format json
  npx agent-secret-guard scan . --format sarif --output agent-secret-guard.sarif
  npx agent-secret-guard scan . --exclude examples/unsafe/**
`;
}

const defaultIo: CliIo = {
  stdout: (value) => process.stdout.write(value),
  stderr: (value) => process.stderr.write(value)
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCli(process.argv.slice(2))
    .then((code) => {
      process.exitCode = code;
    })
    .catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      process.stderr.write(`${message}\n`);
      process.exitCode = 2;
    });
}
