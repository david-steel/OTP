// One-time: bulk-insert all open follow-up items from the 2026-05-14
// Coach Ecosystem session into the improvements table so David can work
// through them via /admin/improvements this week.
//
// Idempotent on title -- skips items that already exist with the same title.
// Run: railway run --service otp-platform npx tsx scripts/seed-followups-2026-05-14.ts
import { db } from '../src/config/database.js';
import { improvements } from '../src/db/schema.js';
import { eq } from 'drizzle-orm';

type Status = 'idea' | 'in_progress' | 'completed';
type Priority = 'low' | 'medium' | 'high';

interface FollowupItem {
  title: string;
  description: string;
  priority: Priority;
  source: string;
}

const SOURCE = '2026-05-14 coach-ecosystem session';

const ITEMS: FollowupItem[] = [
  // ── HIGH ────────────────────────────────────────────────────────────
  {
    title: 'Pull Resend open/click data from today\'s cold-email batches',
    description: 'Tracking went live this morning. Filter the Resend dashboard by tag campaign=founding_25_coach to see the first real engagement data on the 159 cold sends across May 13 + May 14. This is the first measurement run since tracking was enabled -- look for open rate (with Apple-Mail-noise asterisk) and click rate. Decides whether to keep sending or refine the message.',
    priority: 'high',
    source: SOURCE,
  },
  {
    title: 'Make two phone calls: Mark Brandenburg + Kris Goodrich',
    description: 'Mark is the ONE external signup who actually returned (claimed Apr 29, came back May 6). Kris is the supposed evangelist who hasn\'t logged in since Apr 27 -- 17+ days silent. These two calls are worth more than 100 more cold emails. Three questions per call: what problem did you sign up to solve / what happened in your first 5 minutes / what would make you log in again this week?',
    priority: 'high',
    source: SOURCE,
  },
  {
    title: 'Test the full claim → invite → /welcome loop in browser',
    description: 'Sixteen commits shipped today without David testing any of them. Walk through: /coach → claim profile → /dashboard/practice → copy share link → open incognito and paste → /join/{token} → accept → /welcome → start mapping seats. Anything wrong-shaped needs to be caught before more building.',
    priority: 'high',
    source: SOURCE,
  },
  {
    title: 'Cut the 5-minute walkthrough video promised to Joel Swanson',
    description: 'Joel\'s reply said "If you have that kind of info I\'d be happy to read/watch it." David replied offering either a video or a 15-min call. Record a screen-share of the Sneeze It chart in /dashboard/team showing the 14 AI agents next to humans. Send the link to Joel. Doubles as the video for future coach onboarding.',
    priority: 'high',
    source: SOURCE,
  },
  {
    title: 'Gate /claim/:slug/done route before Wave 2',
    description: 'Currently anyone can hit /claim/{any-slug}/done and see that coach\'s invite token. For the Founding 25 cohort this is acceptable (small known group, unguessable tokens), but before opening to Wave 2 it needs an auth gate so only the coach themselves (or super-admin) can see their share link.',
    priority: 'high',
    source: SOURCE,
  },

  // ── MEDIUM ──────────────────────────────────────────────────────────
  {
    title: 'Build deep read-only client views (/dashboard/practice/client/:id v0.5)',
    description: 'Today\'s v0.4 ships only counts (members, KPIs, OOS files, agents). Coach needs to actually SEE the client\'s chart, KPIs, and OOS without switching active-org context. Risk: touches the resolve-request-org logic that every dashboard page depends on. Safer pattern: dedicated read-only routes like /dashboard/practice/client/:id/chart that re-query data with the access-gate check inline.',
    priority: 'medium',
    source: SOURCE,
  },
  {
    title: 'Pattern detection on /dashboard/practice',
    description: 'Surface coach-actionable patterns across their book of business. Examples: "3 of your 5 clients haven\'t added their first KPI yet", "Client X\'s KPIs went red the same week they added an AI agent", "2 clients are running similar agents -- consider a coach-led SOP template". Even one pattern per coach per week is high-value if it\'s real.',
    priority: 'medium',
    source: SOURCE,
  },
  {
    title: 'Friday digest email — weekly coach summary',
    description: 'Cron-driven email to each claimed coach every Friday morning: "Here\'s what happened in your clients\' workspaces this week." Pulls from coach_client_access + recent activity tables. Brings coaches back to /dashboard/practice on a cadence. Needs cron infrastructure (verify if existing or new).',
    priority: 'medium',
    source: SOURCE,
  },
  {
    title: 'Per-coach dynamic OG image (satori + resvg-js)',
    description: 'Today\'s OG images are static. When a coach pastes their /join/{token} link in LinkedIn, the preview should show THEIR name + photo, not a generic card. Requires runtime SVG-to-PNG rendering (satori for layout, resvg-js for raster). Big preview upgrade. Worth ~1.5hr next session.',
    priority: 'medium',
    source: SOURCE,
  },
  {
    title: 'Discoverability: add /settings/coaches link for clients',
    description: 'Clients can revoke a coach\'s access at /settings/coaches but there\'s no nav link or banner pointing them there. Options: add a banner on /dashboard for clients with 1+ active coaches, OR add a "My Coaches" item to the user dropdown menu. Without discoverability the page only matters if a coach goes rogue and a client looks for it.',
    priority: 'medium',
    source: SOURCE,
  },
  {
    title: 'Add /coaches + /welcome to sitemap.xml',
    description: '/coaches is a public marketing page that should be Google-indexable. /welcome is noindex (client onboarding) so leave that one out. Verify the sitemap generator picks up the new public routes.',
    priority: 'medium',
    source: SOURCE,
  },
  {
    title: 'Pre-populate first chart seat on /join accept (friction-removal experiment)',
    description: 'When a client accepts a coach\'s invite, auto-create their CEO/founder seat from their Clerk profile (name, email). Removes the "blank chart" friction Joel described. They land on /welcome with seat 1 already done, two cards to go. Could lift activation 2-3x but needs careful empty-state handling.',
    priority: 'medium',
    source: SOURCE,
  },
  {
    title: 'Improve name-match heuristic on cold outreach',
    description: 'Today\'s 49-candidate batch had 24% name-mismatch rate skipped. Examples: "khandy29@gmail.com" matched-but-skipped for Mark Waters because no name overlap. Some skipped emails are genuinely shared family emails (timandkirsten, bridgetdonnelly7). Audit the heuristic -- maybe relax to allow last-name-only match OR add a confidence score.',
    priority: 'medium',
    source: SOURCE,
  },
  {
    title: 'Send the next batch of 50 — rows 502-651',
    description: 'EOS Implementers tab has ~150 untouched rows. After today\'s data populates from the 159 sends, decide whether to keep going on this tab or move to the other 4 cohorts (Scaling Up, Cultivate, Strategic Coach, Working Genius). The Founding 25 framing may shift once we have 5-10 real claims.',
    priority: 'medium',
    source: SOURCE,
  },
  {
    title: 'Audit /coach copy: Play 3 "Mike-the-IT-guy" line + folksy tone',
    description: 'After fixing Play 1 (proof-led not founder-as-product) and the "Direct line to David" replacements, Play 3 still uses "Mike-the-IT-guy\'s head" which may read too folksy/cute. Joel didn\'t complain about it but it\'s the kind of thing that can undercut credibility with senior coaches. Review against the Joel persona.',
    priority: 'medium',
    source: SOURCE,
  },

  // ── LOW ─────────────────────────────────────────────────────────────
  {
    title: 'Apology emails to Jake Wells + Brian Blatchley (takedown delay)',
    description: 'Both clicked the takedown link on yesterday\'s emails. Their profiles stayed visible for ~12+ hours before David caught the bug and shipped the auto-unpublish fix. Optional courtesy follow-up: "Apologies for the delay -- your profile was removed today, we\'ve fixed the bug so future takedowns are immediate."',
    priority: 'low',
    source: SOURCE,
  },
  {
    title: 'Pre-generate Joel + Brock invite tokens (currently lazy)',
    description: 'Existing claimed coaches predate the invite_token column. Tokens generate lazily on their first /claim/:slug/done visit. Not broken, but pre-generating cleans the data and means tokens exist before they\'re needed.',
    priority: 'low',
    source: SOURCE,
  },
  {
    title: 'Expose coach attribution + client list via the OTP MCP server',
    description: 'The MCP server (npx -y @orgtp/mcp-server) is the network surface that AI assistants query. Adding a get_my_coach_clients or list_coach_attributions tool means coaches running Claude Desktop / Cursor / Cline can query their practice without opening the browser. Future-proofing the protocol claim.',
    priority: 'low',
    source: SOURCE,
  },
  {
    title: 'Update README / docs after the Coach Ecosystem ship',
    description: 'Today added: coach_client_attribution + coach_client_access tables, invite_token column, /dashboard/practice, /coaches, /welcome, /settings/coaches, /join/:token, Founder badge integration, coach-status preHandler. README should reflect the new surface area. CONTRIBUTING note about the access-vs-attribution mutability distinction.',
    priority: 'low',
    source: SOURCE,
  },
  {
    title: 'Audit /partners "Direct line to David Steel" copy',
    description: 'Five coach-facing instances of "Direct line to David" were replaced today. /partners.ejs still has one ("Direct line to David Steel for strategic conversations. A private Slack for partners..."). Decide whether the partners tier is meaningfully different from the coach tier (justifying the founder-access framing) or if it should be consolidated to the same "roadmap shaping rights" language.',
    priority: 'low',
    source: SOURCE,
  },
];

async function main() {
  console.log(`\n=== Seeding ${ITEMS.length} follow-ups into /admin/improvements ===\n`);
  let inserted = 0;
  let skipped = 0;

  for (const item of ITEMS) {
    const existing = await db
      .select({ id: improvements.id })
      .from(improvements)
      .where(eq(improvements.title, item.title))
      .limit(1);

    if (existing.length > 0) {
      skipped += 1;
      console.log(`  [skip-exists] ${item.title.substring(0, 80)}`);
      continue;
    }

    await db.insert(improvements).values({
      title: item.title,
      description: item.description,
      priority: item.priority,
      status: 'idea',
      source: item.source,
    });
    inserted += 1;
    console.log(`  [${item.priority.padEnd(6)}]    ${item.title.substring(0, 80)}`);
  }

  console.log(`\n=== Summary ===`);
  console.log(`  Inserted:   ${inserted}`);
  console.log(`  Already existed (skipped): ${skipped}`);
  console.log(`\nView at https://orgtp.com/admin/improvements`);
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
