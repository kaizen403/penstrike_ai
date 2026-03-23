import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { buildSystemPrompt } from "@/lib/prompts";
import { createTools } from "@/lib/tools";
import { createScan } from "@/lib/store";

function getModel() {
  const provider = process.env.AI_PROVIDER ?? "anthropic";
  const modelId = process.env.AI_MODEL ?? "claude-sonnet-4-20250514";

  if (provider === "openai") return openai(modelId);
  return anthropic(modelId);
}

export async function POST(req: Request) {
  const body = await req.json();
  const target: string = body.target;
  const scope: string = body.scope ?? target;
  const agent: "cyberstrike" | "web-application" = body.agent ?? "cyberstrike";

  if (!target) {
    return new Response(JSON.stringify({ error: "target is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const scan = createScan({ target, scope, agent });
  const system = buildSystemPrompt(agent);
  const tools = createTools(scope);

  const result = streamText({
    model: getModel(),
    system,
    tools,
    maxSteps: 75,
    messages: [
      {
        role: "user",
        content: `## TARGET
${target}

## SCOPE
${scope}

## INSTRUCTIONS
Begin the authorized penetration test now. Start with reconnaissance of the target, then systematically test for vulnerabilities following OWASP WSTG methodology. Report every finding using the report_vulnerability tool. Be thorough and autonomous — complete the full assessment without waiting for further instructions.`,
      },
    ],
  });

  return result.toDataStreamResponse({
    headers: {
      "X-Scan-ID": scan.id,
    },
  });
}
