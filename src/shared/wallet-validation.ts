/**
 * wallet-validation.ts -- Zod schemas for wallet API bodies. Pure + DB-free so
 * they're unit-tested directly. MONEY-SENSITIVE: integer cents, strict min/max,
 * no float, no extra keys (.strict()).
 */
import { z } from 'zod';

// Top-up bounds (cents): min $5.00, max $1,000.00 per single top-up.
export const TOPUP_MIN_CENTS = 500;
export const TOPUP_MAX_CENTS = 100_000;

export const topupSchema = z
  .object({
    amountCents: z
      .number()
      .int('amountCents must be an integer (cents, no fractions)')
      .min(TOPUP_MIN_CENTS, `Minimum top-up is ${TOPUP_MIN_CENTS} cents`)
      .max(TOPUP_MAX_CENTS, `Maximum top-up is ${TOPUP_MAX_CENTS} cents`),
  })
  .strict();

export type TopupBody = z.infer<typeof topupSchema>;

// Auto-recharge config. When enabled, both threshold and amount are required and
// must be valid integer-cent amounts within the same top-up bounds.
export const autoRechargeSchema = z
  .object({
    enabled: z.boolean(),
    thresholdCents: z
      .number()
      .int('thresholdCents must be an integer')
      .min(0, 'thresholdCents must be >= 0')
      .max(TOPUP_MAX_CENTS, `thresholdCents must be <= ${TOPUP_MAX_CENTS}`)
      .optional(),
    amountCents: z
      .number()
      .int('amountCents must be an integer')
      .min(TOPUP_MIN_CENTS, `Minimum recharge amount is ${TOPUP_MIN_CENTS} cents`)
      .max(TOPUP_MAX_CENTS, `Maximum recharge amount is ${TOPUP_MAX_CENTS} cents`)
      .optional(),
  })
  .strict()
  .refine((v) => !v.enabled || (typeof v.thresholdCents === 'number' && typeof v.amountCents === 'number'), {
    message: 'thresholdCents and amountCents are required when auto-recharge is enabled',
  });

export type AutoRechargeBody = z.infer<typeof autoRechargeSchema>;
