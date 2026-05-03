// Seed Sneeze It Q2 rocks, leadership scorecard KPIs, open IDS issues, and the
// May 5 2026 Tuesday Leadership L10 meeting into the local OTP DB so /l10 has
// real data to render. Idempotent: skips items that already exist by title.
//
// Usage: set -a && source .env && set +a && npx tsx scripts/seed-sneeze-l10.ts

import { eq, and } from 'drizzle-orm';
import { db } from '../src/config/database.js';
import { organizations, rocks, tickets, kpis, kpiValues, meetings } from '../src/db/schema.js';

const SNEEZE_CLERK_ORG_ID = 'sneeze-it-001';
const CREATED_BY = 'seed:l10';

async function main() {
  const [org] = await db.select().from(organizations).where(eq(organizations.clerkOrgId, SNEEZE_CLERK_ORG_ID)).limit(1);
  if (!org) {
    throw new Error(`Sneeze It org not found (clerk_org_id=${SNEEZE_CLERK_ORG_ID}). Run db:init first.`);
  }
  console.log(`Org: ${org.name} (${org.id})`);

  // ---------- Rocks ----------
  const ROCKS = [
    {
      title: 'Move to Trello -- full Accelo decommission',
      description: 'Full operational cutover off Accelo onto Trello. Includes team training, workflow redesign, Accelo decommission, client-facing reporting redesign. Crystal sync went live Apr 14.',
      ownerEntityType: 'human' as const,
      ownerExternalId: 'bogdan',
      ownerName: 'Bogdan Tabaka',
      quarter: '2026-Q2',
      dueDate: new Date('2026-06-30T23:59:59Z'),
      onTrack: true,
      statusNote: 'IMMEDIATE START Apr 14. Crystal daily sync live. Bogdan adoption window open.',
    },
    {
      title: 'Removal of TapClicks, move to Looker Studio',
      description: 'Inventory every TapClicks dashboard, rebuild in Looker Studio, verify data fidelity, cancel TapClicks subscription on contract anniversary. Cost-reduction play.',
      ownerEntityType: 'human' as const,
      ownerExternalId: 'dsteel',
      ownerName: 'David Steel',
      quarter: '2026-Q2',
      dueDate: new Date('2026-06-30T23:59:59Z'),
      onTrack: true,
      statusNote: 'IMMEDIATE START Apr 14. Need parallel-run period before client cutover.',
    },
    {
      title: 'Crystal (Accelo MCP) scoping complete -- carryover from Q1',
      description: '3 parts: (1) clean Accelo DB, (2) document Crystal day-to-day workflow, (3) prioritized automation list. Carries from Q1 (was OFF TRACK at quarter close).',
      ownerEntityType: 'human' as const,
      ownerExternalId: 'dsteel',
      ownerName: 'David Steel',
      quarter: '2026-Q2',
      dueDate: new Date('2026-05-31T23:59:59Z'),
      onTrack: false,
      statusNote: '0/3 parts complete at Q1 close. Now superseded in part by the Trello rock above.',
    },
  ];

  let rocksInserted = 0;
  for (const r of ROCKS) {
    const existing = await db.select().from(rocks)
      .where(and(eq(rocks.organizationId, org.id), eq(rocks.title, r.title)))
      .limit(1);
    if (existing[0]) { console.log(`  rock skipped (exists): ${r.title}`); continue; }
    await db.insert(rocks).values({
      organizationId: org.id,
      ownerEntityType: r.ownerEntityType,
      ownerExternalId: r.ownerExternalId,
      ownerName: r.ownerName,
      title: r.title,
      description: r.description,
      quarter: r.quarter,
      dueDate: r.dueDate,
      onTrack: r.onTrack,
      statusNote: r.statusNote,
      statusUpdatedAt: new Date(),
      createdBy: CREATED_BY,
    });
    rocksInserted++;
    console.log(`  rock inserted: ${r.title}`);
  }

  // ---------- KPIs (David's leadership scorecard) ----------
  const KPI_DEFS = [
    // Leadership Scorecard (humans)
    { title: 'Qualified Sales Calls',                       ownerEntityType: 'human' as const, ownerExternalId: 'dsteel', group: 'Leadership Scorecard', goalOperator: 'gte' as const, goalValue: 5,     unit: 'calls/wk', latest: 3 },
    { title: 'Recurring Monthly Revenue (closed in 30d)',   ownerEntityType: 'human' as const, ownerExternalId: 'dsteel', group: 'Leadership Scorecard', goalOperator: 'gte' as const, goalValue: 30000, unit: 'usd',      latest: 18500 },
    { title: 'Lead-to-Client Conversion %',                 ownerEntityType: 'human' as const, ownerExternalId: 'dsteel', group: 'Leadership Scorecard', goalOperator: 'gte' as const, goalValue: 20,    unit: '%',        latest: 14 },
    // Agent Scorecard (agents -- one row per agent for the L8 demo)
    { title: 'Dirk -- Cold emails sent',                    ownerEntityType: 'agent' as const, ownerExternalId: 'dirk',    group: 'Agent Scorecard',     goalOperator: 'gte' as const, goalValue: 150,   unit: 'emails/wk', latest: 95 },
    { title: 'Dirk -- Real live proposals (closable)',      ownerEntityType: 'agent' as const, ownerExternalId: 'dirk',    group: 'Agent Scorecard',     goalOperator: 'gte' as const, goalValue: 20,    unit: 'proposals/wk', latest: 7 },
    { title: 'Pepper -- Email drafts produced',             ownerEntityType: 'agent' as const, ownerExternalId: 'pepper',  group: 'Agent Scorecard',     goalOperator: 'gte' as const, goalValue: 35,    unit: 'drafts/wk', latest: 41 },
    { title: 'Crafter -- Personalized outreach sent',       ownerEntityType: 'agent' as const, ownerExternalId: 'crafter', group: 'Agent Scorecard',     goalOperator: 'gte' as const, goalValue: 50,    unit: 'sent/wk',   latest: 38 },
    { title: 'Aio -- AI-search visibility content shipped', ownerEntityType: 'agent' as const, ownerExternalId: 'aio',     group: 'Agent Scorecard',     goalOperator: 'gte' as const, goalValue: 7,     unit: 'pieces/wk', latest: 4 },
    { title: 'Listener -- Mentions/replies surfaced',       ownerEntityType: 'agent' as const, ownerExternalId: 'listener',group: 'Agent Scorecard',     goalOperator: 'gte' as const, goalValue: 25,    unit: 'items/wk',  latest: 18 },
    { title: 'Tally -- KPI pushes to scorecard',            ownerEntityType: 'agent' as const, ownerExternalId: 'tally',   group: 'Agent Scorecard',     goalOperator: 'gte' as const, goalValue: 20,    unit: 'pushes/wk', latest: 22 },
    // OTP Scorecard (the second business)
    { title: 'OTP -- Real signups',                         ownerEntityType: 'human' as const, ownerExternalId: 'dsteel',  group: 'OTP Scorecard',       goalOperator: 'gte' as const, goalValue: 50,    unit: 'users',     latest: 3 },
  ];

  let kpisInserted = 0;
  for (const k of KPI_DEFS) {
    const existing = await db.select().from(kpis)
      .where(and(eq(kpis.organizationId, org.id), eq(kpis.title, k.title)))
      .limit(1);
    let kpiId: string;
    if (existing[0]) {
      kpiId = existing[0].id;
      console.log(`  kpi skipped (exists): ${k.title}`);
    } else {
      const [inserted] = await db.insert(kpis).values({
        organizationId: org.id,
        ownerEntityType: k.ownerEntityType,
        ownerExternalId: k.ownerExternalId,
        title: k.title,
        groupName: k.group,
        goalOperator: k.goalOperator,
        goalValue: k.goalValue,
        unit: k.unit,
        timeGrain: 'weekly',
        aggregationMethod: 'last',
        createdBy: CREATED_BY,
      }).returning();
      kpiId = inserted.id;
      kpisInserted++;
      console.log(`  kpi inserted: ${k.title}`);
    }
    // Always upsert this week's value so the L10 page has something to show.
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setUTCHours(0, 0, 0, 0);
    weekStart.setUTCDate(weekStart.getUTCDate() - weekStart.getUTCDay()); // Sunday
    const weekEnd = new Date(weekStart);
    weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);

    const existingValue = await db.select().from(kpiValues)
      .where(and(eq(kpiValues.kpiId, kpiId), eq(kpiValues.periodStart, weekStart)))
      .limit(1);
    if (!existingValue[0]) {
      await db.insert(kpiValues).values({
        kpiId,
        periodStart: weekStart,
        periodEnd: weekEnd,
        value: k.latest,
        source: 'manual',
        enteredBy: CREATED_BY,
      });
      console.log(`    value seeded for week of ${weekStart.toISOString().slice(0,10)}: ${k.latest}`);
    }
  }

  // ---------- Issues (open IDS items as tickets) ----------
  const ISSUES = [
    { title: 'Trust death spiral -- David pulls back, team disengages, repeat', source: 'Tony coaching 2026-02-13', priority: 'high' as const },
    { title: 'Zeynep (Ops) -- David has not told her what he needs clearly', source: 'Tony coaching 2026-02-13', priority: 'medium' as const },
    { title: 'Bogdan (COO) skews information -- David spending energy finding truth', source: 'Tony coaching 2026-02-13', priority: 'high' as const },
    { title: 'CCM data staleness -- no way to detect if sheet was not updated', source: 'Dan audit 2026-02-14', priority: 'medium' as const },
    { title: 'Crystal Accelo ticket assignment permissions bug -- blocks Stage 2', source: 'Dan structural audit 2026-02-21', priority: 'medium' as const },
    { title: 'Dash-to-Dirk data handoff not designed -- expansion picks have no performance context', source: 'Dan structural audit 2026-02-21', priority: 'medium' as const },
    { title: 'Dirk-to-Ledger revenue interface undefined -- two agents may track different numbers', source: 'Dan structural audit 2026-02-21', priority: 'medium' as const },
    { title: 'Mo role: hired for API integration, may be doing Zap building -- seat misalignment?', source: 'Dan 1-on-1 2026-02-23', priority: 'medium' as const },
    { title: 'Web team revenue but no clear line to client outcomes -- long-term seat justification?', source: 'Dan 1-on-1 2026-02-23', priority: 'medium' as const },
    { title: 'Mykola: what is he doing? 12-month Accelo gap = no paper trail', source: 'Bogdan 1-on-1 2026-02-23', priority: 'high' as const },
    { title: 'Team Havok communication -- 1-3 hrs/day per member. Legitimate or padding?', source: 'Bogdan 1-on-1 2026-02-23', priority: 'medium' as const },
    { title: 'Yehor: 8+ days no Accelo time logging. Havok utilization dropped to 43% client', source: 'Crystal scan 2026-03-14', priority: 'high' as const },
    { title: 'Q2 leadership rock owners + due dates still TBD (Trello + TapClicks)', source: 'Radar 2026-04-14', priority: 'high' as const },
    { title: 'Web/tech/automation coverage gap after Apr 18 -- no internal owner', source: 'Radar 2026-04-14', priority: 'critical' as const },
    { title: 'Havok/Zeynep utilization visibility blocking Rock 4 + Ad Choo mapping', source: 'L10 2026-04-20', priority: 'high' as const },
    { title: 'Pipeline data gap -- Dirk GHL undercounts vs David live pipeline (Empire/Crunch/Villa Sport)', source: 'L10 2026-04-20', priority: 'high' as const },
    { title: 'GEO unbilled revenue -- 13+ agencies billing $3K-$8K/mo, we are not. Dirk pitch 5 clients', source: 'Neil scan #6 2026-04-06', priority: 'high' as const },
    { title: 'Replify competitive threat -- David must evaluate (partner vs compete vs adopt)', source: 'Neil scan #6 2026-04-06', priority: 'high' as const },
    { title: 'Arin data quality -- system bookings counted as agent, deleted leads flagged, text invisible', source: 'David / Arin 2026-03-27', priority: 'high' as const },
    { title: 'Arin stale data problem -- already-sent Slack drafts re-presented as new', source: 'Radar 2026-03-17', priority: 'medium' as const },
  ];

  let ticketsInserted = 0;
  for (const i of ISSUES) {
    const existing = await db.select().from(tickets)
      .where(and(eq(tickets.orgId, org.id), eq(tickets.title, i.title)))
      .limit(1);
    if (existing[0]) { console.log(`  issue skipped (exists): ${i.title.slice(0, 60)}...`); continue; }
    await db.insert(tickets).values({
      orgId: org.id,
      title: i.title,
      description: `Source: ${i.source}`,
      status: 'open',
      priority: i.priority,
      category: 'other',
      idsStatus: 'open',
    });
    ticketsInserted++;
  }
  console.log(`  issues inserted: ${ticketsInserted}`);

  // ---------- Tuesday May 5 Leadership L10 ----------
  const meetingTitle = 'Leadership L10 -- 2026-05-05';
  const existingMeeting = await db.select().from(meetings)
    .where(and(eq(meetings.organizationId, org.id), eq(meetings.title, meetingTitle)))
    .limit(1);
  let meetingId: string;
  if (existingMeeting[0]) {
    meetingId = existingMeeting[0].id;
    console.log(`  meeting skipped (exists): ${meetingTitle}`);
  } else {
    const [m] = await db.insert(meetings).values({
      organizationId: org.id,
      meetingType: 'leadership',
      title: meetingTitle,
      scheduledAt: new Date('2026-05-05T13:00:00Z'), // 9am ET Tuesday
      attendees: [
        { entityType: 'human', externalId: 'dsteel', name: 'David Steel' },
        { entityType: 'human', externalId: 'bogdan', name: 'Bogdan Tabaka' },
        { entityType: 'human', externalId: 'kristen', name: 'Kristen Giessuebel' },
        { entityType: 'human', externalId: 'nate', name: 'Nate Foss' },
        { entityType: 'human', externalId: 'janine', name: 'Janine' },
      ],
      createdBy: CREATED_BY,
    }).returning();
    meetingId = m.id;
    console.log(`  meeting inserted: ${meetingTitle} -> ${m.id}`);
  }

  // ---------- Test meeting (today) so David can run a dogfood L10 right now ----------
  const testTitle = 'Dogfood L10 -- ' + new Date().toISOString().slice(0,10);
  const existingTest = await db.select().from(meetings)
    .where(and(eq(meetings.organizationId, org.id), eq(meetings.title, testTitle)))
    .limit(1);
  if (!existingTest[0]) {
    const [t] = await db.insert(meetings).values({
      organizationId: org.id,
      meetingType: 'leadership',
      title: testTitle,
      scheduledAt: new Date(),
      attendees: [
        { entityType: 'human', externalId: 'dsteel', name: 'David Steel' },
        { entityType: 'agent', externalId: 'dan', name: 'Dan (strategic co-founder)' },
      ],
      createdBy: CREATED_BY,
    }).returning();
    console.log(`  test meeting inserted: ${testTitle} -> ${t.id}`);
  } else {
    console.log(`  test meeting skipped (exists): ${testTitle}`);
  }

  console.log(`\nSummary: ${rocksInserted} rocks, ${kpisInserted} KPIs, ${ticketsInserted} issues seeded.`);
  console.log(`\nGo to: http://localhost:3000/l10?orgId=${SNEEZE_CLERK_ORG_ID}`);

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
