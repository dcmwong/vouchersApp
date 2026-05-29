import { z } from "zod/v4";

/**
 * Categorises a voucher/gift-card image using Claude vision and extracts
 * structured fields (brand, value, ref ID) plus a short display name and tags.
 *
 * Card numbers and PINs are deliberately NOT requested.
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
const MODEL = "claude-haiku-4-5";

const ANTHROPIC_MEDIA_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const VoucherSchema = z.object({
  name: z.string(),
  brand: z.string().nullable(),
  value: z.string().nullable(),
  refId: z.string().nullable(),
  tags: z.array(z.string()),
});

export type Categorisation = z.infer<typeof VoucherSchema>;

// Base JSON Schema for the forced tool call; `brand` is added per-request with
// an enum of the allowed vocabulary (see toolInputSchema).
const BASE_TOOL_PROPERTIES = {
  type: "object",
  properties: {
    name: {
      type: "string",
      description:
        'A short display name, e.g. "Tesco £100 Gift Card" or "Amazon Voucher".',
    },
    value: {
      type: ["string", "null"],
      description: 'The face value including currency, e.g. "£100.00", or null.',
    },
    refId: {
      type: ["string", "null"],
      description: "Any reference / order ID shown, or null.",
    },
    tags: {
      type: "array",
      items: { type: "string" },
      description: "3-5 short lowercase keyword tags.",
    },
  },
  required: ["name", "value", "refId", "tags"],
  additionalProperties: false,
} as const;

/** Builds the tool schema, constraining `brand` to the supplied vocabulary. */
function toolInputSchema(brandNames: string[]) {
  return {
    ...BASE_TOOL_PROPERTIES,
    properties: {
      ...BASE_TOOL_PROPERTIES.properties,
      brand: {
        type: "string",
        enum: brandNames,
        description:
          'The brand, chosen from the allowed list. Use "Uncategorised" if none clearly matches.',
      },
    },
    required: [...BASE_TOOL_PROPERTIES.required, "brand"],
  };
}

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
 * Returns structured voucher details for the given image bytes.
 *
 * Throws if the AI service is misconfigured/unreachable or returns no structured
 * output — callers decide whether to require categorisation or fall back.
 */
export async function categoriseImage(
  bytes: Uint8Array,
  mimeType: string,
  brandNames: string[],
): Promise<Categorisation> {
  const apiKey = env("ANTHROPIC_API_KEY");
  const mediaType = ANTHROPIC_MEDIA_TYPES.has(mimeType) ? mimeType : "image/png";

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      system:
        "You catalogue gift cards and vouchers. Read the image and record the " +
        "requested fields exactly as shown. Use null for anything not visible. " +
        "Do not invent values. For brand, pick the single best match from the " +
        "allowed list, ignoring differences in apostrophes, spacing and case " +
        "(e.g. a card reading \"Sainsbury's\" matches the option \"Sainsbury's\"). " +
        'If none clearly matches, use "Uncategorised". Do NOT record card ' +
        "numbers or PINs — ignore those sensitive codes entirely.",
      tools: [
        {
          name: "record_voucher",
          description: "Record the catalogued voucher details.",
          input_schema: toolInputSchema(brandNames),
        },
      ],
      tool_choice: { type: "tool", name: "record_voucher" },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: toBase64(bytes),
              },
            },
            {
              type: "text",
              text: "Catalogue this voucher: a short display name, brand, value, reference ID, and a few keyword tags. Do not include the card number or PIN.",
            },
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

  return VoucherSchema.parse(toolUse.input);
}
