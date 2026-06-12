/**
 * schedule-gate.ts -- DB wiring for the autonomous-scheduling safety gate.
 *
 * Scheduling makes an org's wallet spend money on autopilot. Before we let an
 * org CREATE or ENABLE a schedule -- and AGAIN at every fire -- we require:
 *
 *   1. A funded OTP Wallet: an org_wallets row with balance_cents > 0.
 *   2. An active OTP API key: at least one api_keys row for the org that is
 *      neither revoked nor expired.
 *
 * "Active" API key is read straight off the api_keys columns: revoked_at IS NULL
 * AND (expires_at IS NULL OR expires_at > now()). The api_keys table has no
 * status column -- those two timestamps ARE the lifecycle.
 *
 * The pure decision logic lives in shared/schedule-gate-logic.ts (DB-free so it
 * is unit-testable); this module only supplies the real Postgres + env lookups.
 */
import { sql } from 'drizzle-orm';
import { db } from '../config/database.js';
import { getBalanceCents } from './wallet.js';
import { meteringEnabled } from './agent-runtime.js';
import { canScheduleWith } from '../shared/schedule-gate-logic.js';

export type {
  ScheduleGateReason,
  ScheduleGateResult,
  ScheduleGateDeps,
} from '../shared/schedule-gate-logic.js';
export { canScheduleWith } from '../shared/schedule-gate-logic.js';

/** True iff the org has at least one currently-active (not revoked/expired) key. */
async function hasActiveApiKey(orgId: string): Promise<boolean> {
  const rows = (await db.execute(sql`
    SELECT 1
    FROM api_keys
    WHERE org_id = ${orgId}
      AND revoked_at IS NULL
      AND (expires_at IS NULL OR expires_at > now())
    LIMIT 1
  `)).rows as unknown[];
  return rows.length > 0;
}

/** Production entry point: wires the real DB lookups + env metering flag. */
export async function canSchedule(orgId: string) {
  return canScheduleWith(orgId, {
    getBalanceCents,
    hasActiveApiKey,
    meteringOn: meteringEnabled,
  });
}
