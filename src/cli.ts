#!/usr/bin/env node
import { pathToFileURL } from "node:url";
import { formatJsonReport, formatTextReport, isSeverity, shouldFailForSeverity } from "./reporters.js";
import { scanTarget } from "./scanner.js";
import type { Severity } from "./types.js";

interface CliIo {
  stdout: (value: string) => void;
  stderr: (value: string) => void;
}

interface CliOptions {
  command: "scan" | "help" | "version";
  root: string;
  format: "text" | "json";
  failOn?: Severity;
}

const VERSION = "0.1.0";

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

  const result = await scanTarget({ root: parsed.root });
  io.stdout(parsed.format === "json" ? formatJsonReport(result) : formatTextReport(result));

  if (parsed.failOn && shouldFailForSeverity(result, parsed.failOn)) {
    return 1;
  }

  return 0;
}

function parseArgs(argv: string[]): CliOptions | Error {
  if (argv.length === 0 || argv.includes("--help") || argv.includes("-h")) {
    return { command: "help", root: process.cwd(), format: "text" };
  }

  if (argv.includes("--version") || argv.includes("-v")) {
    return { command: "version", root: process.cwd(), format: "text" };
  }

  const [command, ...rest] = argv;
  if (command !== "scan") {
    return new Error(`Unknown command: ${command}`);
  }

  const options: CliOptions = {
    command: "scan",
    root: process.cwd(),
    format: "text"
  };

  for (let index = 0; index < rest.length; index += 1) {
    const arg = rest[index];

    if (arg === "--format") {
      const value = rest[index + 1];
      if (value !== "text" && value !== "json") {
        return new Error("--format must be text or json");
      }
      options.format = value;
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

function helpText(): string {
  return `agent-secret-guard

Dangerous config and secret scanner for AI coding agents, MCP, and local automation projects.

Usage:
  agent-secret-guard scan [path] [--format text|json] [--fail-on low|medium|high|critical]
  agent-secret-guard --version
  agent-secret-guard --help

Examples:
  npx agent-secret-guard scan
  npx agent-secret-guard scan . --fail-on high
  npx agent-secret-guard scan . --format json
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
