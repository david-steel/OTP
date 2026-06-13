// Realtime sync (R0) -- DB-free types + pure builder for org_events rows.
//
// Lives in src/shared/ (NOT src/services/) on purpose: nothing here imports
// config/database.ts, so unit tests can import and exercise the builder without
// DATABASE_URL set (that module throws at load otherwise -- a hard repo
// constraint). The DB writer lives in src/services/org-events.ts.

export const ORG_EVENT_TOPICS = [
  'claim',    // OOS claims, corrections, successes
  'chart',    // org chart / team / seats / members
  'kpi',      // scorecard measurables + values
  'rock',     // quarterly priorities + milestones
  'todo',     // personal + L10 to-dos
  'issue',    // tickets / IDS
  'meeting',  // meeting lifecycle, headlines, ratings, segment notes
  'network',  // cross-org learnings (R5; emitted only through the privacy chokepoint)
] as const;

export type OrgEventTopic = (typeof ORG_EVENT_TOPICS)[number];

// Mirrors the ActorType set in src/shared/enums.ts without importing it
// (keeps this module dependency-free); stored as varchar, not an enum.
export type OrgEventActorType = 'user' | 'system' | 'agent';

export interface OrgEventInput {
  orgId: string;
  topic: OrgEventTopic;
  entityType: string;
  /** uuid or external/claim id; optional for org-wide events. */
  entityId?: string | null;
  action: string;
  /** Team scope for team-scoped data; omit/null for org-wide events. */
  teamId?: string | null;
  actorType?: OrgEventActorType;
  /** Clerk user id, agent external id, 'api_key', etc. */
  actorId?: string | null;
  /** THIN hint only -- ids/labels, never full records. Clients refetch. */
  payload?: Record<string, unknown> | null;
}

/** Shape inserted into org_events (id + created_at are DB-defaulted). */
export interface OrgEventRow {
  orgId: string;
  topic: string;
  teamId: string | null;
  entityType: string;
  entityId: string | null;
  action: string;
  actorType: OrgEventActorType;
  actorId: string | null;
  payload: Record<string, unknown> | null;
}

const ENTITY_ID_MAX = 120;

/**
 * Normalize an event input into the row we persist. Pure + total: it never
 * throws on malformed-but-present data, it coerces. Invariants the caller must
 * satisfy (orgId, topic, entityType, action non-empty) are validated and
 * surfaced via the returned `error` so the writer can decide to drop+log
 * rather than insert a junk row.
 */
export function buildOrgEvent(input: OrgEventInput): { row: OrgEventRow | null; error: string | null } {
  const orgId = (input.orgId || '').trim();
  const topic = (input.topic || '').trim();
  const entityType = (input.entityType || '').trim();
  const action = (input.action || '').trim();

  if (!orgId) return { row: null, error: 'org-event: missing orgId' };
  if (!topic) return { row: null, error: 'org-event: missing topic' };
  if (!entityType) return { row: null, error: 'org-event: missing entityType' };
  if (!action) return { row: null, error: 'org-event: missing action' };

  // entity_id is varchar(120); truncate defensively so a long external id can
  // never error the insert (and break the mutation it rides alongside).
  let entityId: string | null = input.entityId ? String(input.entityId) : null;
  if (entityId && entityId.length > ENTITY_ID_MAX) entityId = entityId.slice(0, ENTITY_ID_MAX);

  return {
    row: {
      orgId,
      topic,
      teamId: input.teamId ?? null,
      entityType,
      entityId,
      action,
      actorType: input.actorType ?? 'system',
      actorId: input.actorId ?? null,
      payload: input.payload ?? null,
    },
    error: null,
  };
}

export function isKnownTopic(topic: string): topic is OrgEventTopic {
  return (ORG_EVENT_TOPICS as readonly string[]).includes(topic);
}
