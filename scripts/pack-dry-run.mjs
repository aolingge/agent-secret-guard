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

const result = spawnSync(process.execPath, [npmCli, "pack", "--dry-run"], {
  cwd: root,
  env,
  stdio: "inherit"
});

process.exit(result.status ?? 1);
