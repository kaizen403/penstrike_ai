export type ScanStatus = "idle" | "running" | "completed" | "error";

export type Finding = {
  id: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  category: string;
  description: string;
  affected_url: string;
  evidence: string;
  reproduction_steps: string;
  remediation: string;
  cvss_score?: number;
  cwe_id?: string;
  timestamp: number;
};

export type Scan = {
  id: string;
  target: string;
  scope: string;
  agent: "cyberstrike" | "web-application";
  status: ScanStatus;
  findings: Finding[];
  started_at: number;
  completed_at?: number;
};

const scans = new Map<string, Scan>();

export function createScan(input: {
  target: string;
  scope: string;
  agent: "cyberstrike" | "web-application";
}): Scan {
  const id = `scan_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
  const scan: Scan = {
    id,
    target: input.target,
    scope: input.scope,
    agent: input.agent,
    status: "running",
    findings: [],
    started_at: Date.now(),
  };
  scans.set(id, scan);
  return scan;
}

export function getScan(id: string) {
  return scans.get(id);
}

export function addFinding(scanId: string, finding: Finding) {
  const scan = scans.get(scanId);
  if (!scan) return;
  scan.findings.push(finding);
}

export function completeScan(scanId: string) {
  const scan = scans.get(scanId);
  if (!scan) return;
  scan.status = "completed";
  scan.completed_at = Date.now();
}
