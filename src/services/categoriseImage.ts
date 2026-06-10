import { z } from "zod/v4";
import { forcedVisionToolCall } from "./anthropic";

/**
 * Categorises a voucher/gift-card image using Claude vision and extracts
 * structured fields (brand, value, ref ID) plus a short display name and tags.
 *
 * Card numbers and PINs are deliberately NOT requested.
 */

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
  const input = await forcedVisionToolCall({
    system:
      "You catalogue gift cards and vouchers. Read the image and record the " +
      "requested fields exactly as shown. Use null for anything not visible. " +
      "Do not invent values. For brand, pick the single best match from the " +
      "allowed list, ignoring differences in apostrophes, spacing and case " +
      "(e.g. a card reading \"Sainsbury's\" matches the option \"Sainsbury's\"). " +
      'If none clearly matches, use "Uncategorised". Do NOT record card ' +
      "numbers or PINs — ignore those sensitive codes entirely.",
    toolName: "record_voucher",
    toolDescription: "Record the catalogued voucher details.",
    inputSchema: toolInputSchema(brandNames),
    bytes,
    mimeType,
    promptText:
      "Catalogue this voucher: a short display name, brand, value, reference ID, and a few keyword tags. Do not include the card number or PIN.",
  });

  return VoucherSchema.parse(input);
}
