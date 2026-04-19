import { createHash } from "node:crypto";
import type { Finding, ScanResult, Severity } from "./types.js";

const SEVERITY_ORDER: Record<Severity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3
};

export function formatTextReport(result: ScanResult): string {
  const lines: string[] = [];
  const counts = countBySeverity(result);

  lines.push("agent-secret-guard scan report");
  lines.push(`Scanned files: ${result.scannedFiles}`);
  lines.push(
    `Findings: ${result.findings.length} (${counts.critical} critical, ${counts.high} high, ${counts.medium} medium, ${counts.low} low)`
  );

  if (result.findings.length === 0) {
    lines.push("");
    lines.push("No risky agent, MCP, or automation config was found in the scanned files.");
    return `${lines.join("\n")}\n`;
  }

  for (const finding of result.findings) {
    lines.push("");
    lines.push(`[${finding.severity.toUpperCase()}] ${finding.title}`);
    lines.push(`Rule: ${finding.ruleId}`);
    lines.push(`Location: ${finding.filePath}:${finding.line}`);
    lines.push(`Evidence: ${finding.evidence}`);
    lines.push(`Why: ${finding.why}`);
    lines.push(`Fix: ${finding.recommendation}`);
    if (finding.safeExample) {
      lines.push(`Safe example: ${finding.safeExample}`);
    }
  }

  return `${lines.join("\n")}\n`;
}

export function formatJsonReport(result: ScanResult): string {
  return `${JSON.stringify(result, null, 2)}\n`;
}

export function formatSarifReport(result: ScanResult): string {
  const rules = [...new Map(result.findings.map((finding) => [finding.ruleId, sarifRuleForFinding(finding)])).values()];

  return `${JSON.stringify(
    {
      version: "2.1.0",
      $schema: "https://json.schemastore.org/sarif-2.1.0.json",
      runs: [
        {
          tool: {
            driver: {
              name: "agent-secret-guard",
              informationUri: "https://github.com/aolingge/agent-secret-guard",
              rules
            }
          },
          results: result.findings.map(toSarifResult)
        }
      ]
    },
    null,
    2
  )}\n`;
}

export function shouldFailForSeverity(result: ScanResult, threshold: Severity): boolean {
  return result.findings.some((finding) => SEVERITY_ORDER[finding.severity] <= SEVERITY_ORDER[threshold]);
}

export function isSeverity(value: string): value is Severity {
  return value === "critical" || value === "high" || value === "medium" || value === "low";
}

function countBySeverity(result: ScanResult): Record<Severity, number> {
  return result.findings.reduce<Record<Severity, number>>(
    (counts, finding) => {
      counts[finding.severity] += 1;
      return counts;
    },
    { critical: 0, high: 0, medium: 0, low: 0 }
  );
}

function sarifRuleForFinding(finding: Finding) {
  return {
    id: finding.ruleId,
    name: finding.ruleId,
    shortDescription: {
      text: finding.title
    },
    fullDescription: {
      text: finding.why
    },
    help: {
      text: [finding.why, finding.recommendation, finding.safeExample ? `Safe example: ${finding.safeExample}` : ""]
        .filter(Boolean)
        .join("\n\n")
    },
    properties: {
      tags: ["security", "ai-agent", "mcp"],
      precision: "medium",
      "security-severity": securitySeverity(finding.severity)
    }
  };
}

function toSarifResult(finding: Finding) {
  return {
    ruleId: finding.ruleId,
    level: sarifLevel(finding.severity),
    message: {
      text: `${finding.title}: ${finding.recommendation}`
    },
    locations: [
      {
        physicalLocation: {
          artifactLocation: {
            uri: finding.filePath
          },
          region: {
            startLine: Math.max(finding.line, 1)
          }
        }
      }
    ],
    partialFingerprints: {
      primaryLocationLineHash: stableFingerprint(finding)
    },
    properties: {
      severity: finding.severity,
      evidence: finding.evidence
    }
  };
}

function sarifLevel(severity: Severity): "error" | "warning" | "note" {
  if (severity === "critical" || severity === "high") {
    return "error";
  }
  if (severity === "medium") {
    return "warning";
  }
  return "note";
}

function securitySeverity(severity: Severity): string {
  const values: Record<Severity, string> = {
    critical: "9.0",
    high: "7.0",
    medium: "5.0",
    low: "3.0"
  };
  return values[severity];
}

function stableFingerprint(finding: Finding): string {
  return createHash("sha256")
    .update([finding.ruleId, finding.filePath, String(finding.line), finding.evidence].join("\0"))
    .digest("hex");
}
