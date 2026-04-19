import { describe, expect, test } from "vitest";
import { formatJsonReport, formatTextReport, shouldFailForSeverity } from "../src/reporters.js";
import type { ScanResult } from "../src/types.js";

const result: ScanResult = {
  scannedFiles: 1,
  findings: [
    {
      ruleId: "mcp-token-in-args",
      severity: "critical",
      filePath: ".mcp.json",
      line: 4,
      title: "MCP token passed through args",
      evidence: "sk-t...cdef",
      why: "Command-line args are visible.",
      recommendation: "Move it to environment injection.",
      safeExample: "\"env\": { \"SERVICE_TOKEN\": \"${SERVICE_TOKEN}\" }"
    }
  ]
};

describe("reporters", () => {
  test("formats a human-readable report with fix guidance", () => {
    const report = formatTextReport(result);

    expect(report).toContain("1 critical");
    expect(report).toContain(".mcp.json:4");
    expect(report).toContain("Why:");
    expect(report).toContain("Fix:");
    expect(report).toContain("Safe example:");
  });

  test("formats json report without losing finding fields", () => {
    const report = JSON.parse(formatJsonReport(result)) as ScanResult;

    expect(report.findings[0]).toMatchObject({
      ruleId: "mcp-token-in-args",
      severity: "critical",
      filePath: ".mcp.json"
    });
  });

  test("compares fail-on severity thresholds", () => {
    expect(shouldFailForSeverity(result, "critical")).toBe(true);
    expect(shouldFailForSeverity(result, "high")).toBe(true);
    expect(shouldFailForSeverity({ ...result, findings: [] }, "low")).toBe(false);
  });
});
