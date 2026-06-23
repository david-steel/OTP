/**
 * Shadow-rock visibility -- the SINGLE source of truth for who may see a rock.
 *
 * A "shadow rock" (rocks.shadow_owner_only = true) is visible ONLY to its owner.
 * It is hidden from every other member of the org, INCLUDING owners and admins.
 * There is deliberately no founder/admin override: the whole point is a private
 * priority that nobody else can read.
 *
 * Because the failure mode is a privacy leak, do NOT hand-roll this check at a
 * call site. AND one of these predicates into the WHERE clause of EVERY query
 * that returns rock rows:
 *
 *   - rockVisibilityForSeats(seatIds)  -- owner-facing surfaces (a viewer's own
 *     dashboard, the meeting Rock Review they attend). Shows non-shadow rocks
 *     plus shadow rocks owned by one of the viewer's seats. Resolve seatIds with
 *     resolveViewerSeatIds() so the identity matches how "mine" is computed.
 *
 *   - noShadowRocks()  -- every other surface (org-wide / leader / another
 *     person's profile / the generic API / aggregates). Fails CLOSED: shadow
 *     rocks never appear. Use this whenever you cannot positively identify the
 *     viewer as the owner.
 */
import { and, eq, inArray, or, type SQL } from 'drizzle-orm';
import { rocks } from '../db/schema.js';

/** Hide all shadow rocks. The safe default for any non-owner / aggregate read. */
export function noShadowRocks(): SQL {
  return eq(rocks.shadowOwnerOnly, false) as SQL;
}

/**
 * Visible to this viewer: every non-shadow rock, PLUS shadow rocks owned by one
 * of the viewer's seats. With no seats (unidentified viewer / API key), this
 * collapses to noShadowRocks() -- fail closed.
 */
export function rockVisibilityForSeats(seatIds: string[] | null | undefined): SQL {
  const seats = (seatIds || []).filter((s): s is string => typeof s === 'string' && s.length > 0);
  if (seats.length === 0) return noShadowRocks();
  return or(
    eq(rocks.shadowOwnerOnly, false),
    and(eq(rocks.shadowOwnerOnly, true), inArray(rocks.ownerExternalId, seats)),
  ) as SQL;
}
