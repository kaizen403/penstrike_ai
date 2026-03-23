import { Router } from "express";
import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { Readable } from "stream";
import { buildSystemPrompt } from "../lib/prompts.js";
import { createTools } from "../lib/tools.js";
import { createScan } from "../lib/store.js";

export const scanRouter = Router();

function getModel() {
  const provider = process.env.AI_PROVIDER ?? "anthropic";
  const modelId = process.env.AI_MODEL ?? "claude-sonnet-4-20250514";
  if (provider === "openai") return openai(modelId);
  return anthropic(modelId);
}

scanRouter.post("/", async (req, res) => {
  const target: string = req.body.target;
  const scope: string = req.body.scope ?? target;
  const agent: "cyberstrike" | "web-application" =
    req.body.agent ?? "cyberstrike";

  if (!target) {
    res.status(400).json({ error: "target is required" });
    return;
  }

  const scan = createScan({ target, scope, agent });

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Transfer-Encoding", "chunked");
  res.setHeader("X-Scan-ID", scan.id);
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("X-Accel-Buffering", "no");

  const result = streamText({
    model: getModel(),
    system: buildSystemPrompt(agent),
    tools: createTools(scope),
    maxSteps: 75,
    messages: [
      {
        role: "user",
        content: `## TARGET\n${target}\n\n## SCOPE\n${scope}\n\n## INSTRUCTIONS\nBegin the authorized penetration test now. Start with reconnaissance of the target, then systematically test for vulnerabilities following OWASP WSTG methodology. Report every finding using the report_vulnerability tool. Be thorough and autonomous — complete the full assessment without waiting for further instructions.`,
      },
    ],
  });

  try {
    const dataStream = result.toDataStream();
    const nodeStream = Readable.fromWeb(
      dataStream as Parameters<typeof Readable.fromWeb>[0],
    );
    nodeStream.pipe(res);
    nodeStream.on("error", () => res.end());
  } catch {
    res.end();
  }
});
