#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { delimiter, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const npmCli = process.env.npm_execpath;

if (!npmCli) {
  throw new Error("npm_execpath is required. Run this script through npm.");
}

const pathKey = Object.keys(process.env).find((key) => key.toLowerCase() === "path") ?? "PATH";
const currentPath = process.env[pathKey] ?? "";
const packedPath = [
  resolve(root, "node_modules", ".bin"),
  dirname(process.execPath),
  currentPath
].join(delimiter);

const env = {
  ...process.env,
  PATH: packedPath,
  Path: packedPath,
  [pathKey]: packedPath
};

if (process.platform === "win32") {
  env.npm_config_script_shell = "powershell";
}

const result = spawnSync(process.execPath, [npmCli, "pack", "--dry-run", "--ignore-scripts", "--json"], {
  cwd: root,
  env,
  encoding: "utf8"
});

if (result.stderr) {
  process.stderr.write(result.stderr);
}

if (result.status !== 0) {
  if (result.stdout) {
    process.stdout.write(result.stdout);
  }
  process.exit(result.status ?? 1);
}

let packs;
try {
  packs = JSON.parse(result.stdout);
} catch (error) {
  process.stderr.write("Failed to parse npm pack --json output.\n");
  process.stderr.write(String(error));
  process.stderr.write("\n");
  process.stdout.write(result.stdout);
  process.exit(1);
}

const [pack] = packs;
const files = pack?.files?.map((file) => file.path) ?? [];
const blockedPatterns = [
  /(^|\/)[^/]+~\d*$/,
  /(^|\/)\.npmignore$/,
  /(^|\/)npm-debug\.log/,
  /(^|\/)pnpm-debug\.log/,
  /(^|\/)yarn-debug\.log/,
  /(^|\/)yarn-error\.log/
];
const blockedFiles = files.filter((file) => blockedPatterns.some((pattern) => pattern.test(file)));

if (blockedFiles.length > 0) {
  process.stderr.write("npm pack dry-run included temporary or control files:\n");
  for (const file of blockedFiles) {
    process.stderr.write(`- ${file}\n`);
  }
  process.exit(1);
}

process.stdout.write(`npm pack dry-run ok: ${pack.entryCount} files, ${pack.size} bytes\n`);
