// Realtime sync -- the org_events writer (R0) + live-bus relay & replay (R1).
//
// Two call patterns, matching how the codebase already writes:
//
//   emitOrgEvent(tx, input)      -- inside an existing db.transaction(): the
//                                   event is part of the mutation's atomic unit.
//                                   If the mutation rolls back, so does the
//                                   event. Errors PROPAGATE (a failed event
//                                   insert rolls the whole tx back -- correct
//                                   for a same-tx write). Returns the inserted
//                                   envelope (or null) but does NOT publish to
//                                   the live bus -- the row isn't committed yet,
//                                   so the caller publishes AFTER the tx (see
//                                   the oos publish path).
//
//   emitOrgEventSafe(input)      -- beside a bare insert (the common case;
//                                   e.g. rocks.ts writes the row then an
//                                   audit_logs row with no surrounding tx).
//                                   Best-effort: caught + logged, NEVER throws,
//                                   so a sync-log hiccup can't break the user's
//                                   write. Publishes to the live bus once the
//                                   row is committed.
//
// EVERYTHING here is gated by ORG_EVENTS_ENABLED (default OFF). Until David
// flips it in prod, every emit is a no-op: zero behaviour change ships. The
// live bus (event-bus.ts) is separately gated at the stream endpoint by
// REALTIME_STREAM_ENABLED; publishing to a bus with no subscribers is a cheap
// no-op, so the two flags are independent.

import { and, asc, eq, gt, inArray } from 'drizzle-orm';
import { db } from '../config/database.js';
import { orgEvents } from '../db/schema.js';
import { buildOrgEvent, type OrgEventInput } from '../shared/org-event-types.js';
import { publishOrgEvent, type OrgEventEnvelope } from './event-bus.js';

// Any Drizzle executor with .insert() -- the root `db` or a transaction handle.
// Kept loose to avoid importing the concrete pg transaction type (it varies
// across drizzle minor versions), same approach as services/wallet.ts.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Executor = any;

export function isOrgEventsEnabled(): boolean {
  return process.env.ORG_EVENTS_ENABLED === 'true';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toEnvelope(row: any): OrgEventEnvelope {
  return {
    id: Number(row.id),
    orgId: row.orgId,
    topic: row.topic,
    teamId: row.teamId ?? null,
    entityType: row.entityType,
    entityId: row.entityId ?? null,
    action: row.action,
    at: (row.createdAt instanceof Date ? row.createdAt : new Date(row.createdAt)).toISOString(),
  };
}

/**
 * Insert one org_events row using the given executor (db or tx). No-op (returns
 * null) when the flag is off or the event is malformed. Throws if the insert
 * fails -- intended for use INSIDE a transaction, where a failure should roll
 * the mutation back with it. Returns the inserted envelope so a transactional
 * caller can publish it to the live bus AFTER the tx commits. Does NOT publish
 * itself. For the non-transactional path use emitOrgEventSafe.
 */
export async function emitOrgEvent(executor: Executor, input: OrgEventInput): Promise<OrgEventEnvelope | null> {
  if (!isOrgEventsEnabled()) return null;
  const { row, error } = buildOrgEvent(input);
  if (!row) {
    // Malformed event: never abort the caller's tx over a logging defect.
    console.error('[org-events] dropped malformed event:', error, input);
    return null;
  }
  const [inserted] = await (executor || db).insert(orgEvents).values(row).returning();
  return inserted ? toEnvelope(inserted) : null;
}

/**
 * Best-effort emit beside a bare (non-transactional) write. Defaults to the
 * root `db`. Swallows + logs any error. Publishes the committed event to the
 * live bus. Use this in routes that don't wrap their mutation in
 * db.transaction().
 */
export async function emitOrgEventSafe(input: OrgEventInput, executor?: Executor): Promise<void> {
  if (!isOrgEventsEnabled()) return;
  try {
    const env = await emitOrgEvent(executor || db, input);
    if (env) publishOrgEvent(env);
  } catch (err) {
    console.error('[org-events] emit failed (mutation unaffected):', (err as Error)?.message, {
      orgId: input.orgId, topic: input.topic, action: input.action,
    });
  }
}

/**
 * Replay source for SSE reconnect (Last-Event-ID). Returns committed events for
 * `orgId` with id > sinceId, in cursor order, optionally filtered to `topics`.
 * If MORE than `limit` events are pending, returns `overflow: true` and no
 * events -- the client should do a full refetch (resync) rather than receive a
 * truncated, misleading slice.
 */
export async function getOrgEventsSince(
  orgId: string,
  sinceId: number,
  limit: number,
  topics?: Set<string> | null,
): Promise<{ events: OrgEventEnvelope[]; overflow: boolean }> {
  const conds = [eq(orgEvents.orgId, orgId), gt(orgEvents.id, sinceId)];
  if (topics && topics.size > 0) conds.push(inArray(orgEvents.topic, [...topics]));
  // Fetch one extra to detect overflow without a separate COUNT.
  const rows = await db
    .select()
    .from(orgEvents)
    .where(and(...conds))
    .orderBy(asc(orgEvents.id))
    .limit(limit + 1);
  if (rows.length > limit) return { events: [], overflow: true };
  return { events: rows.map(toEnvelope), overflow: false };
}
