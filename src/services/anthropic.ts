/**
 * Shared transport for Claude vision calls.
 *
 * Implemented with a direct call to the Anthropic Messages REST API (rather than
 * @anthropic-ai/sdk) so it bundles for the Cloudflare Pages edge runtime — the
 * SDK statically imports Node built-ins (node:fs, node:crypto, …) that the edge
 * bundler rejects. We force a single tool call to guarantee structured output.
 *
 * Requires ANTHROPIC_API_KEY (see .env.example).
 */

// Haiku 4.5: fast and cost-effective, plenty capable for OCR-style voucher
// extraction. Swap to "claude-opus-4-8" for maximum extraction quality.
export const MODEL = "claude-haiku-4-5";

const ANTHROPIC_MEDIA_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function env(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable ${name}. See .env.example.`,
    );
  }
  return value;
}

/** Base64-encodes image bytes; works under both Node (`next dev`) and edge. */
function toBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64");
  }
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

interface AnthropicResponse {
  stop_reason?: string;
  content?: { type: string; name?: string; input?: unknown }[];
  error?: { message?: string };
}

/**
 * Sends an image to Claude with a single forced tool call and returns the
 * tool's input (the structured output). Throws if the AI service is
 * misconfigured/unreachable or returns no structured output.
 */
export async function forcedVisionToolCall(opts: {
  system: string;
  toolName: string;
  toolDescription: string;
  inputSchema: Record<string, unknown>;
  bytes: Uint8Array;
  mimeType: string;
  promptText: string;
  maxTokens?: number;
}): Promise<unknown> {
  const apiKey = env("ANTHROPIC_API_KEY");
  const mediaType = ANTHROPIC_MEDIA_TYPES.has(opts.mimeType)
    ? opts.mimeType
    : "image/png";

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: opts.maxTokens ?? 1024,
      system: opts.system,
      tools: [
        {
          name: opts.toolName,
          description: opts.toolDescription,
          input_schema: opts.inputSchema,
        },
      ],
      tool_choice: { type: "tool", name: opts.toolName },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: toBase64(opts.bytes),
              },
            },
            { type: "text", text: opts.promptText },
          ],
        },
      ],
    }),
  });

  const body = (await res.json()) as AnthropicResponse;

  if (!res.ok) {
    throw new Error(
      `Anthropic request failed: ${body.error?.message ?? res.statusText}`,
    );
  }

  const toolUse = body.content?.find((b) => b.type === "tool_use");
  if (!toolUse) {
    throw new Error(
      `Claude did not return structured output (stop_reason: ${body.stop_reason}).`,
    );
  }

  return toolUse.input;
}
