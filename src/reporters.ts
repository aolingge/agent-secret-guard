import type { ScanResult, Severity } from "./types.js";

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
