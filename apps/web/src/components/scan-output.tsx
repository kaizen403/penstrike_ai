"use client";

import { useEffect, useRef } from "react";
import type { OutputItem, Finding } from "@/app/page";

type Props = {
  items: OutputItem[];
  findings: Finding[];
  isRunning: boolean;
};

const SEVERITY_COLOR: Record<string, string> = {
  critical: "#ff3b3b",
  high: "#ff8c00",
  medium: "#ffd700",
  low: "#4a9eff",
  info: "#888888",
};

const SEVERITY_BG: Record<string, string> = {
  critical: "rgba(255, 59, 59, 0.07)",
  high: "rgba(255, 140, 0, 0.07)",
  medium: "rgba(255, 215, 0, 0.07)",
  low: "rgba(74, 158, 255, 0.07)",
  info: "rgba(136, 136, 136, 0.07)",
};

function ToolCallBlock({ item }: { item: OutputItem }) {
  let parsed: unknown = null;
  try {
    parsed = JSON.parse(item.content);
  } catch {
    parsed = item.content;
  }
  const isVuln = item.label === "report_vulnerability";

  return (
    <div
      style={{
        margin: "10px 0",
        borderLeft: `2px solid ${isVuln ? "#ff8c00" : "#4a9eff"}`,
        paddingLeft: "12px",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-jetbrains), monospace",
          color: isVuln ? "#ff8c00" : "#4a9eff",
          fontSize: "10px",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginBottom: "4px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <span style={{ opacity: 0.6 }}>&gt;</span>
        {item.label}
      </div>
      <pre
        style={{
          fontFamily: "var(--font-jetbrains), monospace",
          color: "var(--muted)",
          fontSize: "11px",
          whiteSpace: "pre-wrap",
          wordBreak: "break-all",
          margin: 0,
          lineHeight: "1.5",
          maxHeight: "200px",
          overflowY: "auto",
        }}
      >
        {typeof parsed === "object"
          ? JSON.stringify(parsed, null, 2)
          : String(parsed)}
      </pre>
    </div>
  );
}

function ToolResultBlock({ item }: { item: OutputItem }) {
  if (item.label === "report_vulnerability") return null;
  let parsed: unknown = null;
  try {
    parsed = JSON.parse(item.content);
  } catch {
    parsed = item.content;
  }

  return (
    <div
      style={{
        margin: "6px 0 10px",
        borderLeft: "2px solid var(--border)",
        paddingLeft: "12px",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-jetbrains), monospace",
          color: "var(--muted)",
          fontSize: "10px",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginBottom: "4px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <span style={{ opacity: 0.5 }}>&#8629;</span>
        {item.label} result
      </div>
      <pre
        style={{
          fontFamily: "var(--font-jetbrains), monospace",
          color: "#555",
          fontSize: "11px",
          whiteSpace: "pre-wrap",
          wordBreak: "break-all",
          margin: 0,
          lineHeight: "1.5",
          maxHeight: "160px",
          overflowY: "auto",
        }}
      >
        {typeof parsed === "object"
          ? JSON.stringify(parsed, null, 2)
          : String(parsed)}
      </pre>
    </div>
  );
}

function FindingCard({ finding }: { finding: Finding }) {
  const color = SEVERITY_COLOR[finding.severity] ?? "#888";
  const bg = SEVERITY_BG[finding.severity] ?? "transparent";

  return (
    <div
      style={{
        backgroundColor: bg,
        border: `1px solid ${color}22`,
        borderRadius: "4px",
        padding: "12px",
        fontFamily: "var(--font-jetbrains), monospace",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "8px",
          marginBottom: "6px",
        }}
      >
        <span
          style={{
            color: "var(--fg)",
            fontSize: "13px",
            fontWeight: 600,
            lineHeight: "1.3",
          }}
        >
          {finding.title}
        </span>
        <span
          style={{
            color,
            backgroundColor: `${color}18`,
            border: `1px solid ${color}40`,
            borderRadius: "3px",
            fontSize: "9px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            padding: "2px 7px",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {finding.severity}
        </span>
      </div>

      <div
        style={{
          color: "var(--muted)",
          fontSize: "10px",
          marginBottom: "4px",
          letterSpacing: "0.04em",
        }}
      >
        {finding.category}
      </div>
      <div
        style={{
          color: "#555",
          fontSize: "11px",
          wordBreak: "break-all",
          marginBottom: "4px",
        }}
      >
        {finding.affected_url}
      </div>

      {(finding.cvss_score !== undefined || finding.cwe_id) && (
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "6px",
            fontSize: "10px",
            color: "var(--muted)",
          }}
        >
          {finding.cvss_score !== undefined && (
            <span>CVSS {finding.cvss_score.toFixed(1)}</span>
          )}
          {finding.cwe_id && <span>{finding.cwe_id}</span>}
        </div>
      )}

      <details style={{ marginTop: "8px" }}>
        <summary
          style={{
            color: "var(--muted)",
            fontSize: "10px",
            cursor: "pointer",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            userSelect: "none",
          }}
        >
          Details
        </summary>
        <div
          style={{
            marginTop: "8px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          {[
            { label: "Description", value: finding.description },
            { label: "Remediation", value: finding.remediation },
          ].map(({ label, value }) => (
            <div key={label}>
              <div
                style={{
                  color: "var(--muted)",
                  fontSize: "10px",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "3px",
                }}
              >
                {label}
              </div>
              <p
                style={{
                  color: "#aaa",
                  fontSize: "11px",
                  margin: 0,
                  lineHeight: "1.5",
                }}
              >
                {value}
              </p>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}

export default function ScanOutput({ items, findings, isRunning }: Props) {
  const termRef = useRef<HTMLDivElement>(null);
  const hasContent = items.length > 0;

  useEffect(() => {
    if (termRef.current && items.length > 0) {
      termRef.current.scrollTop = termRef.current.scrollHeight;
    }
  }, [items]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        height: "100%",
      }}
    >
      <div
        ref={termRef}
        style={{
          backgroundColor: "var(--surface)",
          border: `1px solid ${isRunning ? "rgba(0,255,65,0.25)" : "var(--border)"}`,
          borderRadius: "6px",
          padding: "16px",
          fontFamily: "var(--font-jetbrains), monospace",
          overflowY: "auto",
          minHeight: "420px",
          maxHeight: "calc(100vh - 240px)",
          transition: "border-color 0.3s",
        }}
      >
        {!hasContent && !isRunning && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              paddingTop: "8px",
            }}
          >
            <div
              style={{
                color: "var(--accent)",
                fontSize: "10px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: "12px",
              }}
            >
              Terminal Ready
            </div>
            {[
              "Configure a target and launch a scan.",
              "",
              "The AI agent will autonomously:",
              "  - Enumerate the attack surface",
              "  - Test for OWASP Top 10 vulnerabilities",
              "  - Execute security tools (nmap, nuclei, etc.)",
              "  - Report findings with evidence and PoC",
              "",
              "All findings appear in the panel below.",
            ].map((text, i) => (
              <div
                key={i}
                style={{
                  color: text === "" ? "transparent" : "var(--muted)",
                  fontSize: "12px",
                  lineHeight: "1.6",
                  height: text === "" ? "8px" : "auto",
                }}
              >
                {text || "\u00a0"}
              </div>
            ))}
          </div>
        )}

        {isRunning && !hasContent && (
          <span
            className="terminal-cursor"
            style={{ color: "var(--accent)", fontSize: "13px" }}
          >
            Initializing
          </span>
        )}

        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;

          if (item.type === "text") {
            return (
              <pre
                key={item.id}
                style={{
                  color: "var(--fg)",
                  fontSize: "13px",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  margin: 0,
                  lineHeight: "1.65",
                  fontFamily: "var(--font-jetbrains), monospace",
                }}
              >
                {item.content}
                {isRunning && isLast && <span className="terminal-cursor" />}
              </pre>
            );
          }

          if (item.type === "tool_call")
            return <ToolCallBlock key={item.id} item={item} />;
          if (item.type === "tool_result")
            return <ToolResultBlock key={item.id} item={item} />;

          if (item.type === "error") {
            return (
              <div
                key={item.id}
                style={{
                  color: "#ff3b3b",
                  fontSize: "12px",
                  fontFamily: "var(--font-jetbrains), monospace",
                  margin: "8px 0",
                  padding: "8px 12px",
                  backgroundColor: "rgba(255,59,59,0.07)",
                  border: "1px solid rgba(255,59,59,0.2)",
                  borderRadius: "3px",
                }}
              >
                [ERROR] {item.content}
              </div>
            );
          }

          return null;
        })}
      </div>

      {findings.length > 0 && (
        <div
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "6px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "10px 16px",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-jetbrains), monospace",
                color: "var(--accent)",
                fontSize: "10px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontWeight: 700,
              }}
            >
              Findings
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {(["critical", "high", "medium", "low", "info"] as const).map(
                (sev) => {
                  const count = findings.filter(
                    (f) => f.severity === sev,
                  ).length;
                  if (count === 0) return null;
                  return (
                    <span
                      key={sev}
                      style={{
                        fontFamily: "var(--font-jetbrains), monospace",
                        color: SEVERITY_COLOR[sev],
                        fontSize: "10px",
                        backgroundColor: SEVERITY_BG[sev],
                        border: `1px solid ${SEVERITY_COLOR[sev]}33`,
                        borderRadius: "3px",
                        padding: "1px 6px",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {count} {sev}
                    </span>
                  );
                },
              )}
            </div>
          </div>

          <div
            style={{
              padding: "12px 16px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              maxHeight: "480px",
              overflowY: "auto",
            }}
          >
            {findings.map((finding, i) => (
              <FindingCard key={finding.id ?? i} finding={finding} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
