import { z } from "zod/v4";
import { forcedVisionToolCall } from "./anthropic";

/**
 * Reads the remaining gift-card balance from a photo of a till receipt or
 * balance-enquiry slip using Claude vision.
 *
 * Card numbers and PINs are deliberately NOT requested — only the balance.
 * The forced tool call always fires, so "no balance visible" is represented
 * by `found: false` inside the tool input rather than a missing call.
 */

const BalanceSchema = z.object({
  found: z.boolean(),
  balance: z.number().nullable(),
  currency: z.string().nullable(),
});

export type BalanceExtraction = z.infer<typeof BalanceSchema>;

const TOOL_INPUT_SCHEMA = {
  type: "object",
  properties: {
    found: {
      type: "boolean",
      description:
        "True only if a remaining/closing gift-card balance is clearly visible. False otherwise.",
    },
    balance: {
      type: ["number", "null"],
      description:
        "The remaining balance as a plain decimal number, e.g. 23.50. Null when found is false.",
    },
    currency: {
      type: ["string", "null"],
      description:
        'The currency symbol or code exactly as shown, e.g. "£" or "GBP". Null if not shown.',
    },
  },
  required: ["found", "balance", "currency"],
  additionalProperties: false,
} as const;

/**
 * Returns the balance read from the receipt image, or `found: false` when no
 * remaining balance is clearly shown. Throws if the AI service is
 * misconfigured/unreachable or returns no structured output.
 */
export async function extractBalance(
  bytes: Uint8Array,
  mimeType: string,
): Promise<BalanceExtraction> {
  const input = await forcedVisionToolCall({
    system:
      "You read till receipts and balance-enquiry slips for gift cards. Find " +
      "the REMAINING balance on the card (often labelled 'balance', " +
      "'remaining', 'card balance', or shown after a purchase line). Prefer a " +
      "closing/remaining balance over an opening balance or transaction " +
      "amount. If no remaining balance is clearly shown, set found to false — " +
      "do not guess. Do NOT record card numbers or PINs — ignore those " +
      "sensitive codes entirely.",
    toolName: "record_receipt_balance",
    toolDescription:
      "Record the remaining gift-card balance shown on the receipt or balance-enquiry slip.",
    inputSchema: TOOL_INPUT_SCHEMA,
    bytes,
    mimeType,
    promptText:
      "Extract the remaining gift-card balance from this receipt. Do not include the card number or PIN.",
  });

  const result = BalanceSchema.parse(input);

  // A "found" balance must be a usable non-negative number.
  if (
    result.found &&
    (result.balance === null ||
      result.balance < 0 ||
      !Number.isFinite(result.balance))
  ) {
    return { found: false, balance: null, currency: null };
  }

  return result;
}
