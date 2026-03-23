"use client";

import { useState } from "react";

type Agent = "cyberstrike" | "web-application";

type Props = {
  onScan: (target: string, scope: string, agent: Agent) => void;
  isRunning: boolean;
};

const inputStyle = {
  backgroundColor: "var(--bg)",
  border: "1px solid var(--border)",
  color: "var(--fg)",
  fontFamily: "var(--font-jetbrains), monospace",
  borderRadius: "4px",
  padding: "8px 12px",
  fontSize: "13px",
  width: "100%",
  display: "block",
  transition: "border-color 0.15s",
};

const labelStyle = {
  display: "block",
  fontFamily: "var(--font-jetbrains), monospace",
  color: "var(--muted)",
  fontSize: "10px",
  letterSpacing: "0.1em",
  textTransform: "uppercase" as const,
  marginBottom: "6px",
};

export default function ScanForm({ onScan, isRunning }: Props) {
  const [target, setTarget] = useState("");
  const [scope, setScope] = useState("");
  const [agent, setAgent] = useState<Agent>("cyberstrike");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!target.trim() || isRunning) return;
    onScan(target.trim(), scope.trim(), agent);
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "6px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "12px 16px",
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
          }}
        >
          Scan Configuration
        </span>
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            backgroundColor: isRunning ? "var(--accent)" : "var(--border)",
            display: "inline-block",
            transition: "background-color 0.3s",
          }}
        />
      </div>

      <div
        style={{
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <div>
          <label style={labelStyle} htmlFor="target">
            Target URL
          </label>
          <input
            id="target"
            type="text"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="https://example.com"
            required
            disabled={isRunning}
            autoComplete="off"
            spellCheck={false}
            style={{
              ...inputStyle,
              opacity: isRunning ? 0.5 : 1,
              cursor: isRunning ? "not-allowed" : "text",
            }}
          />
        </div>

        <div>
          <label style={labelStyle} htmlFor="scope">
            Scope Notes
            <span
              style={{
                marginLeft: "6px",
                color: "#444",
                textTransform: "none",
                letterSpacing: 0,
                fontSize: "10px",
              }}
            >
              optional
            </span>
          </label>
          <textarea
            id="scope"
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            placeholder={
              "Leave blank to use target URL as scope...\n\nExamples:\n  - All subdomains of example.com\n  - Only /api/* endpoints\n  - Exclude /admin/*"
            }
            disabled={isRunning}
            rows={6}
            style={{
              ...inputStyle,
              resize: "vertical",
              lineHeight: "1.5",
              opacity: isRunning ? 0.5 : 1,
              cursor: isRunning ? "not-allowed" : "text",
            }}
          />
        </div>

        <div>
          <label style={labelStyle} htmlFor="agent">
            Agent Type
          </label>
          <div style={{ position: "relative" }}>
            <select
              id="agent"
              value={agent}
              onChange={(e) => setAgent(e.target.value as Agent)}
              disabled={isRunning}
              style={{
                ...inputStyle,
                paddingRight: "32px",
                appearance: "none",
                WebkitAppearance: "none",
                cursor: isRunning ? "not-allowed" : "pointer",
                opacity: isRunning ? 0.5 : 1,
              }}
            >
              <option value="cyberstrike">cyberstrike</option>
              <option value="web-application">web-application</option>
            </select>
            <span
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--muted)",
                pointerEvents: "none",
                fontSize: "10px",
              }}
            >
              ▾
            </span>
          </div>
          <p
            style={{
              marginTop: "5px",
              fontFamily: "var(--font-jetbrains), monospace",
              color: "var(--muted)",
              fontSize: "10px",
              lineHeight: "1.4",
            }}
          >
            {agent === "cyberstrike"
              ? "Full-spectrum: recon, enumeration, exploitation"
              : "Web-focused: OWASP Top 10, API, auth testing"}
          </p>
        </div>

        <button
          type="submit"
          disabled={!target.trim() || isRunning}
          style={{
            backgroundColor: isRunning ? "transparent" : "var(--accent)",
            color: isRunning ? "var(--accent)" : "#000",
            border: "1px solid var(--accent)",
            borderRadius: "4px",
            fontFamily: "var(--font-jetbrains), monospace",
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            padding: "10px 0",
            width: "100%",
            cursor: !target.trim() || isRunning ? "not-allowed" : "pointer",
            opacity: !target.trim() ? 0.35 : 1,
            transition: "all 0.15s",
          }}
        >
          {isRunning ? "Scanning..." : "Launch Scan"}
        </button>
      </div>
    </form>
  );
}
