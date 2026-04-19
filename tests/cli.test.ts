import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { runCli } from "../src/cli.js";

describe("runCli", () => {
  test("returns non-zero when findings meet fail-on threshold", async () => {
    const root = await mkdtemp(join(tmpdir(), "agent-secret-guard-"));
    await writeFile(
      join(root, ".mcp.json"),
      JSON.stringify({
        mcpServers: {
          demo: {
            command: "npx",
            args: ["demo-mcp", "--token", "sk-test_1234567890abcdef1234567890abcdef"]
          }
        }
      })
    );

    const writes: string[] = [];
    const exitCode = await runCli(["scan", root, "--fail-on", "high"], {
      stdout: (value) => writes.push(value),
      stderr: (value) => writes.push(value)
    });

    expect(exitCode).toBe(1);
    expect(writes.join("")).toContain("mcp-token-in-args");
  });

  test("prints json when requested", async () => {
    const root = await mkdtemp(join(tmpdir(), "agent-secret-guard-"));
    await writeFile(join(root, "AGENTS.md"), "No risky config here.");

    const writes: string[] = [];
    const exitCode = await runCli(["scan", root, "--format", "json"], {
      stdout: (value) => writes.push(value),
      stderr: (value) => writes.push(value)
    });

    expect(exitCode).toBe(0);
    expect(JSON.parse(writes.join(""))).toMatchObject({ scannedFiles: 1, findings: [] });
  });
});
