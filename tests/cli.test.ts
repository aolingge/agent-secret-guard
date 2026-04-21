import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { runCli } from "../src/cli.js";

describe("runCli", () => {
  test("prints the package version", async () => {
    const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8")) as {
      version: string;
    };
    const writes: string[] = [];
    const exitCode = await runCli(["--version"], {
      stdout: (value) => writes.push(value),
      stderr: (value) => writes.push(value)
    });

    expect(exitCode).toBe(0);
    expect(writes.join("")).toBe(`${packageJson.version}\n`);
  });

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

  test("writes sarif output to a file", async () => {
    const root = await mkdtemp(join(tmpdir(), "agent-secret-guard-"));
    const output = join(root, "reports", "agent-secret-guard.sarif");
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
    const exitCode = await runCli(["scan", root, "--format", "sarif", "--output", output, "--fail-on", "critical"], {
      stdout: (value) => writes.push(value),
      stderr: (value) => writes.push(value)
    });

    const report = JSON.parse(await readFile(output, "utf8")) as { version: string };
    expect(exitCode).toBe(1);
    expect(writes.join("")).toContain("Wrote sarif report");
    expect(report.version).toBe("2.1.0");
  });

  test("loads default config excludes", async () => {
    const root = await mkdtemp(join(tmpdir(), "agent-secret-guard-"));
    await writeFile(join(root, ".agent-secret-guard.json"), JSON.stringify({ exclude: ["fixtures/unsafe/**"] }));
    await writeFile(join(root, "README.md"), "No risky config here.");
    await mkdir(join(root, "fixtures", "unsafe"), { recursive: true });
    await writeFile(
      join(root, "fixtures", "unsafe", ".mcp.json"),
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
    const exitCode = await runCli(["scan", root, "--format", "json", "--fail-on", "critical"], {
      stdout: (value) => writes.push(value),
      stderr: (value) => writes.push(value)
    });

    expect(exitCode).toBe(0);
    expect(JSON.parse(writes.join(""))).toMatchObject({ scannedFiles: 1, findings: [] });
  });

  test("keeps the safe examples clean", async () => {
    const writes: string[] = [];
    const exitCode = await runCli(["scan", "examples/safe", "--format", "json", "--fail-on", "high"], {
      stdout: (value) => writes.push(value),
      stderr: (value) => writes.push(value)
    });

    expect(exitCode).toBe(0);
    expect(JSON.parse(writes.join(""))).toMatchObject({ findings: [] });
  });

  test("keeps the unsafe examples covered by the scanner", async () => {
    const writes: string[] = [];
    const exitCode = await runCli(["scan", "examples/unsafe", "--fail-on", "critical", "--exclude", "never-match"], {
      stdout: (value) => writes.push(value),
      stderr: (value) => writes.push(value)
    });

    expect(exitCode).toBe(1);
    expect(writes.join("")).toContain("mcp-token-in-args");
  });
});
