// Realtime sync (R0) -- the org_events writer.
//
// Two call patterns, matching how the codebase already writes:
//
//   emitOrgEvent(tx, input)      -- inside an existing db.transaction(): the
//                                   event is part of the mutation's atomic unit.
//                                   If the mutation rolls back, so does the
//                                   event. Errors PROPAGATE (a failed event
//                                   insert rolls the whole tx back -- correct
//                                   for a same-tx write).
//
//   emitOrgEventSafe(input)      -- beside a bare insert (the common case;
//                                   e.g. rocks.ts writes the row then an
//                                   audit_logs row with no surrounding tx).
//                                   Best-effort: caught + logged, NEVER throws,
//                                   so a sync-log hiccup can't break the user's
//                                   write. Identical durability to the audit row
//                                   it sits next to.
//
// EVERYTHING here is gated by ORG_EVENTS_ENABLED (default OFF). Until David
// flips it in prod, every emit is a no-op: zero behaviour change ships.

import { db } from '../config/database.js';
import { orgEvents } from '../db/schema.js';
import { buildOrgEvent, type OrgEventInput } from '../shared/org-event-types.js';

// Any Drizzle executor with .insert() -- the root `db` or a transaction handle.
// Kept loose to avoid importing the concrete pg transaction type (it varies
// across drizzle minor versions), same approach as services/wallet.ts.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Executor = any;

export function isOrgEventsEnabled(): boolean {
  return process.env.ORG_EVENTS_ENABLED === 'true';
}

/**
 * Insert one org_events row using the given executor (db or tx). No-op when the
 * flag is off. Throws if the insert fails -- intended for use INSIDE a
 * transaction, where a failure should roll the mutation back with it. For the
 * non-transactional path use emitOrgEventSafe.
 */
export async function emitOrgEvent(executor: Executor, input: OrgEventInput): Promise<void> {
  if (!isOrgEventsEnabled()) return;
  const { row, error } = buildOrgEvent(input);
  if (!row) {
    // Malformed event: never abort the caller's tx over a logging defect.
    console.error('[org-events] dropped malformed event:', error, input);
    return;
  }
  await (executor || db).insert(orgEvents).values(row);
}

/**
 * Best-effort emit beside a bare (non-transactional) write. Defaults to the
 * root `db`. Swallows + logs any error. Use this in routes that don't wrap
 * their mutation in db.transaction().
 */
export async function emitOrgEventSafe(input: OrgEventInput, executor?: Executor): Promise<void> {
  if (!isOrgEventsEnabled()) return;
  try {
    await emitOrgEvent(executor || db, input);
  } catch (err) {
    console.error('[org-events] emit failed (mutation unaffected):', (err as Error)?.message, {
      orgId: input.orgId, topic: input.topic, action: input.action,
    });
  }
}
