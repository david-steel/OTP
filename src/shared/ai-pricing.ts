/**
 * ai-pricing.ts -- pure, unit-tested AI cost computation. DB-free, no I/O.
 *
 * MONEY-SENSITIVE. All math is in integer CENTS at the output boundary; raw
 * rates are carried as cents-per-million-tokens to keep precision until the
 * final round. Floats are used ONLY for the intermediate per-token arithmetic
 * and are always rounded UP to a whole cent (>= 1) at the end -- a billable AI
 * call never debits 0.
 *
 * computeDebitCents() returns: ceil( raw_cost_cents * markupMultiple ), min 1.
 */

// Per-MILLION-token rates, in USD CENTS. (e.g. $5/MTok = 500 cents/MTok.)
// Source: published Claude API list prices. Update here when prices change.
export type ModelRate = { inputCentsPerMTok: number; outputCentsPerMTok: number };

export const MODEL_RATES: Record<string, ModelRate> = {
  // Opus 4.8: $5 / MTok input, $25 / MTok output.
  'claude-opus-4-8': { inputCentsPerMTok: 500, outputCentsPerMTok: 2500 },
  // Sonnet 4.6: $3 / $15.
  'claude-sonnet-4-6': { inputCentsPerMTok: 300, outputCentsPerMTok: 1500 },
  // Haiku 4.5: $1 / $5.
  'claude-haiku-4-5': { inputCentsPerMTok: 100, outputCentsPerMTok: 500 },
};

// Unknown models default to Opus 4.8 rates (the most expensive of the set) so
// we never UNDER-charge for a model we don't recognize -- fail closed on margin.
export const DEFAULT_MODEL_RATE: ModelRate = MODEL_RATES['claude-opus-4-8'];

// Prompt-cache multipliers applied to the INPUT rate (approximate, documented):
//   - cache READS cost ~0.1x the input rate (cheap to reuse a cached prefix).
//   - cache WRITES cost ~1.25x the input rate (a premium to populate the cache).
export const CACHE_READ_MULTIPLIER = 0.1;
export const CACHE_WRITE_MULTIPLIER = 1.25;

export function rateForModel(model: string | null | undefined): ModelRate {
  if (!model) return DEFAULT_MODEL_RATE;
  return MODEL_RATES[model] || DEFAULT_MODEL_RATE;
}

export type DebitInput = {
  model: string;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens?: number;
  cacheWriteTokens?: number;
};

/**
 * Compute the wallet debit in integer cents for one AI call.
 *
 * raw cost = (input × inputRate) + (output × outputRate)
 *          + (cacheRead × inputRate × 0.1) + (cacheWrite × inputRate × 1.25)
 * (all per-MTok). Multiply by markupMultiple, round UP to a whole cent, min 1.
 *
 * markupMultiple is the gross-margin lever (env WALLET_AI_MARKUP_MULTIPLE,
 * default 2.0 -- supplied by the caller). Negative / non-finite token counts
 * are clamped to 0.
 */
export function computeDebitCents(input: DebitInput, markupMultiple: number): number {
  const rate = rateForModel(input.model);

  const clamp = (n: number | undefined): number =>
    typeof n === 'number' && Number.isFinite(n) && n > 0 ? n : 0;

  const inTok = clamp(input.inputTokens);
  const outTok = clamp(input.outputTokens);
  const cacheRead = clamp(input.cacheReadTokens);
  const cacheWrite = clamp(input.cacheWriteTokens);

  const PER_MTOK = 1_000_000;
  const rawCents =
    (inTok * rate.inputCentsPerMTok) / PER_MTOK +
    (outTok * rate.outputCentsPerMTok) / PER_MTOK +
    (cacheRead * rate.inputCentsPerMTok * CACHE_READ_MULTIPLIER) / PER_MTOK +
    (cacheWrite * rate.inputCentsPerMTok * CACHE_WRITE_MULTIPLIER) / PER_MTOK;

  const markup = Number.isFinite(markupMultiple) && markupMultiple > 0 ? markupMultiple : 1;
  const withMarkup = rawCents * markup;

  // Round UP to a whole cent, and never bill 0 for a billable call.
  return Math.max(1, Math.ceil(withMarkup));
}

/** Resolve the markup multiple from env, defaulting to 2.0. */
export function markupMultipleFromEnv(): number {
  const raw = process.env.WALLET_AI_MARKUP_MULTIPLE;
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) && n > 0 ? n : 2.0;
}
