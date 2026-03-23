import { tool } from "ai";
import { z } from "zod";
import { exec } from "child_process";

function run(
  command: string,
  timeout = 30000,
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  return new Promise((resolve) => {
    const proc = exec(
      command,
      { timeout, maxBuffer: 1024 * 1024 * 5 },
      (error, stdout, stderr) => {
        resolve({
          stdout: stdout?.toString().slice(0, 10000) ?? "",
          stderr: stderr?.toString().slice(0, 5000) ?? "",
          exitCode: error?.code ?? proc.exitCode ?? 0,
        });
      },
    );
  });
}

export function createTools(scope: string) {
  return {
    execute_command: tool({
      description: `Execute a shell command on the server. Use this for running security tools like nmap, curl, nikto, nuclei, gobuster, dig, whois, openssl, testssl, whatweb, subfinder, httpx, etc. The command runs in a sandboxed environment. Output is truncated to 10KB. Timeout: 60 seconds.`,
      parameters: z.object({
        command: z.string().describe("The shell command to execute"),
        timeout: z
          .number()
          .optional()
          .describe("Timeout in ms (default 30000, max 120000)"),
      }),
      execute: async ({ command, timeout }) => {
        const ms = Math.min(timeout ?? 30000, 120000);
        console.log(`[TOOL] execute_command: ${command}`);
        const result = await run(command, ms);
        return {
          stdout: result.stdout || "(no output)",
          stderr: result.stderr || "",
          exit_code: result.exitCode,
        };
      },
    }),

    http_request: tool({
      description: `Make an HTTP request to a URL. Use this for targeted security testing — injections, auth bypass, header manipulation, etc. Supports all HTTP methods and custom headers/body.`,
      parameters: z.object({
        url: z.string().describe("Full URL to request"),
        method: z
          .enum(["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"])
          .default("GET"),
        headers: z
          .record(z.string())
          .optional()
          .describe("Custom HTTP headers"),
        body: z
          .string()
          .optional()
          .describe("Request body (for POST/PUT/PATCH)"),
        follow_redirects: z.boolean().optional().default(true),
      }),
      execute: async ({ url, method, headers, body, follow_redirects }) => {
        console.log(`[TOOL] http_request: ${method} ${url}`);
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 15000);

          const resp = await fetch(url, {
            method,
            headers: headers ?? {},
            body: body ?? undefined,
            redirect: follow_redirects ? "follow" : "manual",
            signal: controller.signal,
          });

          clearTimeout(timer);

          const respHeaders: Record<string, string> = {};
          resp.headers.forEach((v, k) => {
            respHeaders[k] = v;
          });

          const text = await resp.text();

          return {
            status: resp.status,
            status_text: resp.statusText,
            headers: respHeaders,
            body: text.slice(0, 8000),
            body_length: text.length,
            redirected: resp.redirected,
            final_url: resp.url,
          };
        } catch (err) {
          return {
            error: err instanceof Error ? err.message : "Request failed",
            status: 0,
          };
        }
      },
    }),

    report_vulnerability: tool({
      description: `Report a discovered security vulnerability. Use this every time you find a security issue, no matter the severity. Include full details for the report.`,
      parameters: z.object({
        title: z.string().describe("Short vulnerability title"),
        severity: z
          .enum(["critical", "high", "medium", "low", "info"])
          .describe("Severity rating"),
        category: z
          .string()
          .describe("OWASP/WSTG category (e.g., WSTG-INPV-01, XSS, SQLi)"),
        description: z
          .string()
          .describe("Detailed description of the vulnerability"),
        affected_url: z.string().describe("The affected URL or endpoint"),
        evidence: z
          .string()
          .describe(
            "Proof — include the HTTP request/response, tool output, or payload used",
          ),
        reproduction_steps: z
          .string()
          .describe("Step-by-step instructions to reproduce"),
        remediation: z.string().describe("Recommended fix"),
        cvss_score: z
          .number()
          .optional()
          .describe("CVSS 3.1 score if applicable"),
        cwe_id: z.string().optional().describe("CWE ID (e.g., CWE-79)"),
      }),
      execute: async (finding) => {
        console.log(
          `[FINDING] ${finding.severity.toUpperCase()}: ${finding.title}`,
        );
        return {
          status: "reported",
          id: `VULN-${Date.now().toString(36).toUpperCase()}`,
          ...finding,
        };
      },
    }),
  };
}
