"use client";

import { useState, useCallback } from "react";
import ScanForm from "@/components/scan-form";
import ScanOutput from "@/components/scan-output";

export type OutputItem = {
  id: string;
  type: "text" | "tool_call" | "tool_result" | "error";
  content: string;
  label?: string;
};

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
};

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export default function Home() {
  const [items, setItems] = useState<OutputItem[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [scanId, setScanId] = useState<string | null>(null);

  const startScan = useCallback(
    async (target: string, scope: string, agent: string) => {
      setIsRunning(true);
      setItems([]);
      setFindings([]);
      setScanId(null);

      const toolCallNames: Record<string, string> = {};
      let currentTextId: string | null = null;

      try {
        const resp = await fetch(`${API_URL}/scan`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ target, scope: scope || target, agent }),
        });

        const sid = resp.headers.get("x-scan-id");
        if (sid) setScanId(sid);

        if (!resp.ok || !resp.body) {
          const errText = await resp.text().catch(() => resp.statusText);
          setItems([
            {
              id: uid(),
              type: "error",
              content: `HTTP ${resp.status}: ${errText}`,
            },
          ]);
          return;
        }

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            const colonIdx = trimmed.indexOf(":");
            if (colonIdx === -1) continue;

            const prefix = trimmed.slice(0, colonIdx);
            const rest = trimmed.slice(colonIdx + 1);

            try {
              if (prefix === "0") {
                const chunk: string = JSON.parse(rest);
                if (currentTextId) {
                  setItems((prev) =>
                    prev.map((item) =>
                      item.id === currentTextId
                        ? { ...item, content: item.content + chunk }
                        : item,
                    ),
                  );
                } else {
                  const newId = uid();
                  currentTextId = newId;
                  setItems((prev) => [
                    ...prev,
                    { id: newId, type: "text", content: chunk },
                  ]);
                }
              } else if (prefix === "9") {
                const tc = JSON.parse(rest) as {
                  toolCallId: string;
                  toolName: string;
                  args: unknown;
                };
                toolCallNames[tc.toolCallId] = tc.toolName;
                currentTextId = null;
                setItems((prev) => [
                  ...prev,
                  {
                    id: uid(),
                    type: "tool_call",
                    label: tc.toolName,
                    content: JSON.stringify(tc.args, null, 2),
                  },
                ]);
              } else if (prefix === "a") {
                const tr = JSON.parse(rest) as {
                  toolCallId: string;
                  result: unknown;
                };
                const toolName = toolCallNames[tr.toolCallId] ?? "unknown";
                currentTextId = null;
                setItems((prev) => [
                  ...prev,
                  {
                    id: uid(),
                    type: "tool_result",
                    label: toolName,
                    content: JSON.stringify(tr.result, null, 2),
                  },
                ]);
                if (toolName === "report_vulnerability") {
                  const result = tr.result as Finding;
                  if (result?.title) setFindings((prev) => [...prev, result]);
                }
              } else if (prefix === "3") {
                const errMsg: string = JSON.parse(rest);
                currentTextId = null;
                setItems((prev) => [
                  ...prev,
                  { id: uid(), type: "error", content: errMsg },
                ]);
              } else if (prefix === "e" || prefix === "d") {
                currentTextId = null;
              }
            } catch {}
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        setItems((prev) => [
          ...prev,
          { id: uid(), type: "error", content: msg },
        ]);
      } finally {
        setIsRunning(false);
      }
    },
    [],
  );

  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <header
        style={{
          borderBottom: "1px solid var(--border)",
          padding: "0 24px",
          height: "52px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          backgroundColor: "var(--bg)",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span
            className="accent-glow"
            style={{
              fontFamily: "var(--font-jetbrains), monospace",
              color: "var(--accent)",
              fontSize: "18px",
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            AIPentest
          </span>
          <span
            style={{
              fontFamily: "var(--font-jetbrains), monospace",
              color: "var(--muted)",
              fontSize: "11px",
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "3px",
              padding: "1px 6px",
            }}
          >
            v0.1
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {scanId && (
            <span
              style={{
                fontFamily: "var(--font-jetbrains), monospace",
                color: "var(--muted)",
                fontSize: "11px",
              }}
            >
              {scanId}
            </span>
          )}
          {isRunning && (
            <span
              style={{
                fontFamily: "var(--font-jetbrains), monospace",
                color: "var(--accent)",
                fontSize: "11px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: "var(--accent)",
                  display: "inline-block",
                  animation: "pulse-accent 1.5s ease-in-out infinite",
                }}
              />
              SCANNING
            </span>
          )}
          {findings.length > 0 && (
            <span
              style={{
                fontFamily: "var(--font-jetbrains), monospace",
                color: "#ff8c00",
                fontSize: "11px",
                backgroundColor: "rgba(255, 140, 0, 0.08)",
                border: "1px solid rgba(255, 140, 0, 0.2)",
                borderRadius: "3px",
                padding: "1px 8px",
              }}
            >
              {findings.length} {findings.length === 1 ? "FINDING" : "FINDINGS"}
            </span>
          )}
        </div>
      </header>

      <main
        style={{
          flex: 1,
          display: "flex",
          gap: "16px",
          padding: "20px 24px",
          minHeight: 0,
        }}
      >
        <aside style={{ width: "300px", flexShrink: 0 }}>
          <ScanForm onScan={startScan} isRunning={isRunning} />
        </aside>
        <section style={{ flex: 1, minWidth: 0 }}>
          <ScanOutput items={items} findings={findings} isRunning={isRunning} />
        </section>
      </main>
    </div>
  );
}
