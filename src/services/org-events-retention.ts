// Realtime sync (R0) -- org_events retention.
//
// The outbox is append-only and grows forever without pruning. Events older
// than the replay window are dead weight: no client reconnects 30 days back,
// and the audit_logs table is the durable record of record. Prune daily.
//
// Runs regardless of ORG_EVENTS_ENABLED -- if the flag is off the table is
// empty and the DELETE is a cheap no-op; if it was on and later flipped off,
// the prune still drains the backlog. Same node-cron + single-fire guard
// pattern as lifecycle-scheduler.ts.

import cron from 'node-cron';
import { sql } from 'drizzle-orm';
import { db } from '../config/database.js';

const DEFAULT_RETENTION_DAYS = 30;

function retentionDays(): number {
  const n = Number(process.env.ORG_EVENTS_RETENTION_DAYS);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_RETENTION_DAYS;
}

/** Delete events older than the retention window. Returns rows removed. */
export async function pruneOrgEvents(days: number = retentionDays()): Promise<number> {
  try {
    const res = await db.execute(
      sql.raw(`DELETE FROM "org_events" WHERE "created_at" < now() - interval '${days} days'`),
    );
    // node-postgres returns rowCount; drizzle surfaces it on the result.
    const count = (res as unknown as { rowCount?: number }).rowCount ?? 0;
    if (count > 0) console.log(`[org-events] retention prune removed ${count} events (> ${days}d)`);
    return count;
  } catch (err) {
    console.error('[org-events] retention prune failed:', (err as Error)?.message);
    return 0;
  }
}

let scheduled = false;
export function startOrgEventsRetention(): void {
  if (scheduled) return;
  scheduled = true;
  // Daily at 03:30 America/New_York (off-peak; well clear of the 10:00 lifecycle run).
  cron.schedule(
    '30 3 * * *',
    () => { void pruneOrgEvents(); },
    { timezone: 'America/New_York' },
  );
  console.log(`[org-events] retention scheduler started (daily 03:30 ET, ${retentionDays()}d window)`);
}
