// What's New (changelog) API for the nav megaphone.
//   GET  /api/v1/whats-new/unread -> { ok, unread, entries } latest changelog entries + unread count
//   POST /api/v1/whats-new/seen   -> stamps preferences.whatsNewSeenAt for the current member
//
// Per-member seen state lives at the TOP level of org_members.preferences
// (sibling of the dashboard key). Writes follow the tenant-safety rule:
// target request.orgMember.id (impersonation-aware), NEVER auth.userId. A
// legacy founder with no org_members row gets entries with unread 0 on GET
// and a no-op on POST (there is no row to write to).
import type { FastifyInstance } from 'fastify';
import { eq } from 'drizzle-orm';
import { db } from '../../config/database.js';
import { orgMembers } from '../../db/schema.js';
import { getAuthOrg } from '../../middleware/auth-helpers.js';
import { createRateLimiter } from '../../shared/rate-limiter.js';
import { changelog } from '../../data/changelog.js';

const checkRateLimit = createRateLimiter({ windowMs: 60_000, maxRequests: 120 });

const ENTRY_LIMIT = 8;
const FIRST_VISIT_WINDOW_DAYS = 30;

function latestEntries() {
  return [...changelog]
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
    .slice(0, ENTRY_LIMIT)
    .map(({ date, tags, title, summary }) => ({ date, tags, title, summary }));
}

function seenAtFrom(preferences: unknown): string | null {
  if (!preferences || typeof preferences !== 'object' || Array.isArray(preferences)) return null;
  const seenAt = (preferences as Record<string, unknown>).whatsNewSeenAt;
  return typeof seenAt === 'string' && seenAt ? seenAt : null;
}

// Head marker: "<date>\n<title>" of the newest entry at seen time. Entries
// carry only a date, so a date-granularity compare can never flag same-day
// publishes after the member already opened the panel; matching the exact
// head entry can.
function seenHeadFrom(preferences: unknown): { date: string; title: string } | null {
  if (!preferences || typeof preferences !== 'object' || Array.isArray(preferences)) return null;
  const head = (preferences as Record<string, unknown>).whatsNewSeenHead;
  if (typeof head !== 'string' || !head.includes('\n')) return null;
  const idx = head.indexOf('\n');
  return { date: head.slice(0, idx), title: head.slice(idx + 1) };
}

export default async function whatsNewRoutes(app: FastifyInstance) {
  app.get('/whats-new/unread', async (request, reply) => {
    if (!checkRateLimit(request.ip)) {
      return reply.status(429).send({ error: { code: 'RATE_LIMITED', message: 'Too many requests' } });
    }
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    const entries = latestEntries();
    const member = request.orgMember;
    if (!member) return { ok: true, unread: 0, entries };

    const seenAt = seenAtFrom(member.preferences);
    const seenHead = seenHeadFrom(member.preferences);
    const headIndex = seenHead
      ? entries.findIndex((e) => e.date === seenHead.date && e.title === seenHead.title)
      : -1;
    let unread: number;
    if (headIndex >= 0) {
      // Everything newer than the exact entry that topped the list last look.
      unread = headIndex;
    } else if (seenAt) {
      // Legacy seen-state without a head marker (pre-marker members). Count
      // the seen day inclusively: date-only granularity can't tell same-day
      // publishes from already-seen entries, and undercounting hides real
      // news while overcounting self-heals — the next panel open stores the
      // head marker and the exact path takes over for good.
      const seenDate = seenAt.slice(0, 10);
      unread = entries.filter((e) => e.date >= seenDate).length;
    } else {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - FIRST_VISIT_WINDOW_DAYS);
      const cutoffStr = cutoff.toISOString().slice(0, 10);
      unread = entries.filter((e) => e.date >= cutoffStr).length;
    }
    return { ok: true, unread, entries };
  });

  app.post('/whats-new/seen', async (request, reply) => {
    if (!checkRateLimit(request.ip)) {
      return reply.status(429).send({ error: { code: 'RATE_LIMITED', message: 'Too many requests' } });
    }
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    const member = request.orgMember;
    if (!member) return { ok: true };

    // Re-read the row so a concurrent update between the decorator's load and
    // this write doesn't get clobbered with stale prefs.
    const [row] = await db.select({ preferences: orgMembers.preferences })
      .from(orgMembers)
      .where(eq(orgMembers.id, member.id))
      .limit(1);
    if (!row) return { ok: true };

    const currentPreferences = (row.preferences && typeof row.preferences === 'object' && !Array.isArray(row.preferences))
      ? (row.preferences as Record<string, unknown>)
      : {};

    const head = latestEntries()[0];
    await db.update(orgMembers)
      .set({
        preferences: {
          ...currentPreferences,
          whatsNewSeenAt: new Date().toISOString(),
          ...(head ? { whatsNewSeenHead: head.date + '\n' + head.title } : {}),
        },
        updatedAt: new Date(),
      })
      .where(eq(orgMembers.id, member.id));

    return { ok: true };
  });
}
