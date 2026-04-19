export type Severity = "low" | "medium" | "high" | "critical";
export type OutputFormat = "text" | "json" | "sarif";

export interface ScanFile {
  path: string;
  content: string;
}

export interface Finding {
  ruleId: string;
  severity: Severity;
  filePath: string;
  line: number;
  title: string;
  evidence: string;
  why: string;
  recommendation: string;
  safeExample?: string;
}

export interface ScanTargetInput {
  root?: string;
  files?: ScanFile[];
  excludePatterns?: string[];
}

export interface ScanResult {
  scannedFiles: number;
  findings: Finding[];
}

export interface RuleMatch {
  ruleId: string;
  severity: Severity;
  title: string;
  evidence: string;
  why: string;
  recommendation: string;
  safeExample?: string;
  line?: number;
}
