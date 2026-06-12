/**
 * schedule-gate-logic.ts -- the PURE decision logic for the scheduling gate.
 *
 * DB-free on purpose: src/config/database.ts throws at import if DATABASE_URL is
 * unset, so unit tests cannot import anything whose chain reaches it. The
 * predicate lives here over injected lookups; the DB wiring lives in
 * services/schedule-gate.ts which calls into this. See
 * feedback_otp_pure_logic_needs_db_free_module.md.
 *
 * The gate requires BOTH (a funded wallet + an active API key) before an org may
 * create/enable a schedule, and is RE-CHECKED at every fire. The
 * WALLET_METERING_ENABLED flag does NOT relax the gate (autopilot must never
 * start on an empty wallet or a revoked key); metering state is only surfaced.
 */

export type ScheduleGateReason = 'NO_WALLET' | 'NO_API_KEY' | 'METERING_OFF';

export interface ScheduleGateResult {
  ok: boolean;
  reason?: ScheduleGateReason;
  /** Diagnostics for the UI / logs. */
  balanceCents?: number;
  hasActiveKey?: boolean;
  meteringOn?: boolean;
}

/** Injectable lookups so the predicate is unit-testable without a DB. */
export interface ScheduleGateDeps {
  getBalanceCents: (orgId: string) => Promise<number>;
  hasActiveApiKey: (orgId: string) => Promise<boolean>;
  meteringOn: () => boolean;
}

/**
 * The gate. Pure decision logic over injected lookups so tests can drive every
 * branch (no wallet -> NO_WALLET; funded but no key -> NO_API_KEY; both -> ok).
 * Order: wallet first (the money), then the key.
 */
export async function canScheduleWith(
  orgId: string,
  deps: ScheduleGateDeps,
): Promise<ScheduleGateResult> {
  const meteringOn = deps.meteringOn();
  const balanceCents = await deps.getBalanceCents(orgId);
  if (!(balanceCents > 0)) {
    return { ok: false, reason: 'NO_WALLET', balanceCents, meteringOn };
  }
  const hasActiveKey = await deps.hasActiveApiKey(orgId);
  if (!hasActiveKey) {
    return { ok: false, reason: 'NO_API_KEY', balanceCents, hasActiveKey, meteringOn };
  }
  return { ok: true, balanceCents, hasActiveKey, meteringOn };
}
