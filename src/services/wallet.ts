/**
 * wallet.ts -- the prepaid wallet service. MONEY-SENSITIVE; correctness first.
 *
 * Atomicity + race-safety contract (every mutation):
 *   1. Open a DB transaction.
 *   2. SELECT ... FOR UPDATE the org's wallet row (creating it first if absent).
 *      The row lock serializes concurrent debits/credits so two requests can
 *      never read the same balance and both spend it (no double-spend).
 *   3. If an idempotency_key was supplied AND a ledger row with that key already
 *      exists, return the PRIOR result -- never apply twice (Stripe webhook
 *      retries, per-request AI debits).
 *   4. For a debit: if balance < amount, return INSUFFICIENT_BALANCE and mutate
 *      NOTHING. For a credit: always proceeds.
 *   5. Insert the ledger row (with balance_after_cents) + update the cached
 *      wallet.balance_cents + write an audit row, all inside the same tx.
 *
 * All amountCents MUST be a positive integer. Direction conveys sign; the stored
 * amount_cents is always positive.
 */
import { eq, and } from 'drizzle-orm';
import { db } from '../config/database.js';
import { orgWallets, walletLedger, auditLogs } from '../db/schema.js';
import { createAuditEntry, AUDIT_ACTIONS } from './audit-logger.js';

export type WalletReason = 'topup' | 'ai_usage' | 'addon_charge' | 'refund' | 'promo' | 'adjustment';

export type WalletMutationOpts = {
  idempotencyKey?: string;
  metadata?: Record<string, unknown>;
  createdBy?: string;
};

export type WalletResult =
  | { ok: true; balanceCents: number; ledgerId: string; idempotentReplay?: boolean }
  | { ok: false; code: 'INSUFFICIENT_BALANCE'; balanceCents: number }
  | { ok: false; code: 'INVALID_AMOUNT'; balanceCents: number };

// Any Drizzle transaction handle. Kept loose to avoid importing the concrete
// pg transaction type (which varies across drizzle minor versions).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Tx = any;

/** Get the org's wallet, creating a zero-balance row if it doesn't exist yet. */
export async function getOrCreateWallet(orgId: string) {
  const existing = await db.select().from(orgWallets).where(eq(orgWallets.orgId, orgId)).limit(1);
  if (existing[0]) return existing[0];

  await db.insert(orgWallets).values({ orgId }).onConflictDoNothing({ target: orgWallets.orgId });
  const after = await db.select().from(orgWallets).where(eq(orgWallets.orgId, orgId)).limit(1);
  return after[0];
}

/** Current cached balance in cents (creates the wallet if missing). */
export async function getBalanceCents(orgId: string): Promise<number> {
  const wallet = await getOrCreateWallet(orgId);
  return wallet?.balanceCents ?? 0;
}

/**
 * Lock + read the wallet row inside a transaction, creating it first if needed.
 * The FOR UPDATE lock is the heart of the no-double-spend guarantee.
 */
async function lockWallet(tx: Tx, orgId: string): Promise<{ id: string; balanceCents: number }> {
  // Ensure the row exists (outside-lock create is fine; the lock below is what
  // serializes the balance read/write). ON CONFLICT keeps it race-safe.
  await tx.insert(orgWallets).values({ orgId }).onConflictDoNothing({ target: orgWallets.orgId });

  const locked = await tx
    .select({ id: orgWallets.id, balanceCents: orgWallets.balanceCents })
    .from(orgWallets)
    .where(eq(orgWallets.orgId, orgId))
    .for('update')
    .limit(1);

  return locked[0];
}

/** If this idempotency key was already applied, return its prior ledger row. */
async function findByIdempotencyKey(tx: Tx, orgId: string, key: string) {
  const prior = await tx
    .select({ id: walletLedger.id, balanceAfterCents: walletLedger.balanceAfterCents })
    .from(walletLedger)
    .where(and(eq(walletLedger.orgId, orgId), eq(walletLedger.idempotencyKey, key)))
    .limit(1);
  return prior[0];
}

async function applyMutation(
  orgId: string,
  direction: 'credit' | 'debit',
  amountCents: number,
  reason: WalletReason,
  opts: WalletMutationOpts,
): Promise<WalletResult> {
  // Guard: positive integer cents only.
  if (!Number.isInteger(amountCents) || amountCents <= 0) {
    return { ok: false, code: 'INVALID_AMOUNT', balanceCents: await getBalanceCents(orgId) };
  }

  return db.transaction(async (tx: Tx) => {
    const wallet = await lockWallet(tx, orgId);
    const balanceBefore = wallet.balanceCents;

    // Idempotency: if we already applied this key, return the prior result and
    // do NOT mutate again.
    if (opts.idempotencyKey) {
      const prior = await findByIdempotencyKey(tx, orgId, opts.idempotencyKey);
      if (prior) {
        return { ok: true, balanceCents: prior.balanceAfterCents, ledgerId: prior.id, idempotentReplay: true };
      }
    }

    if (direction === 'debit' && balanceBefore < amountCents) {
      // Insufficient funds: mutate nothing, surface the current balance.
      return { ok: false, code: 'INSUFFICIENT_BALANCE', balanceCents: balanceBefore };
    }

    const balanceAfter = direction === 'credit' ? balanceBefore + amountCents : balanceBefore - amountCents;

    const [ledgerRow] = await tx
      .insert(walletLedger)
      .values({
        orgId,
        direction,
        amountCents,
        balanceAfterCents: balanceAfter,
        reason,
        idempotencyKey: opts.idempotencyKey ?? null,
        metadata: opts.metadata ?? null,
        createdBy: opts.createdBy ?? null,
      })
      .returning({ id: walletLedger.id });

    await tx
      .update(orgWallets)
      .set({ balanceCents: balanceAfter, updatedAt: new Date() })
      .where(eq(orgWallets.orgId, orgId));

    // Audit row (same tx, so it commits/rolls back atomically with the money).
    const action =
      reason === 'topup'
        ? AUDIT_ACTIONS.WALLET_TOPUP
        : direction === 'credit'
          ? AUDIT_ACTIONS.WALLET_CREDIT
          : AUDIT_ACTIONS.WALLET_DEBIT;
    await tx.insert(auditLogs).values(
      createAuditEntry(action, 'wallet_ledger', {
        orgId,
        actorType: 'system',
        entityId: ledgerRow.id,
        details: {
          direction,
          reason,
          amountCents,
          balanceBeforeCents: balanceBefore,
          balanceAfterCents: balanceAfter,
          ...(opts.metadata ? { metadata: opts.metadata } : {}),
        },
      }),
    );

    return { ok: true, balanceCents: balanceAfter, ledgerId: ledgerRow.id };
  });
}

/** Add funds to the wallet. amountCents must be a positive integer. */
export function creditWallet(
  orgId: string,
  amountCents: number,
  reason: WalletReason,
  opts: WalletMutationOpts = {},
): Promise<WalletResult> {
  return applyMutation(orgId, 'credit', amountCents, reason, opts);
}

/**
 * Spend from the wallet. Returns INSUFFICIENT_BALANCE (and mutates nothing) when
 * the balance is short. amountCents must be a positive integer.
 */
export function debitWallet(
  orgId: string,
  amountCents: number,
  reason: WalletReason,
  opts: WalletMutationOpts = {},
): Promise<WalletResult> {
  return applyMutation(orgId, 'debit', amountCents, reason, opts);
}
