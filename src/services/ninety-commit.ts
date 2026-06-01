// Ninety.io -> OTP import: COMMIT step (increment 2). Writes parsed Ninety
// records into a caller's org. This module touches the DB (kept separate from
// the pure ninety-import.ts so that parser stays unit-testable).
//
// Safety properties:
//  - IDEMPOTENT: dedupes on write by (org,title) for rocks/todos/issues and by
//    (owner,title) for KPIs, so re-running an import never duplicates.
//  - RESILIENT: if the org has no chart yet (NO_OOS), it predicts owner
//    externalIds deterministically and warns, instead of failing the import.
//  - NON-FATAL per record: a bad row is skipped with a warning, not a 500.
// Headlines are intentionally not imported here (Ninety's headline rows need a
// meeting FK in OTP; deferred to a later increment).
import { and, eq, isNull } from 'drizzle-orm';
import { db } from '../config/database.js';
import { rocks, todos, tickets, teams, auditLogs } from '../db/schema.js';
import { createAuditEntry } from './audit-logger.js';
import { bulkImportHumans, getOrgTeamGraph } from './team-graph.js';
import { createKpi, writeKpiValue } from './kpi.js';
import type { ParsedSheet } from './ninety-import.js';

export interface CommitResult {
  created: { humans: number; rocks: number; todos: number; issues: number; kpis: number; kpiValues: number };
  skipped: { rocks: number; todos: number; issues: number; kpis: number };
  people: number;
  warnings: string[];
}

const norm = (s: unknown) => String(s ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
const MAX_RECORDS = 5000; // abuse guard

// Mirror team-graph's deterministic externalId rule, used only as a fallback
// when chart seeding is unavailable (NO_OOS) so owner refs stay consistent.
function predictExternalId(name: string): string {
  return 'HUM_' + name.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
}

function currentQuarter(d: Date): { label: string; end: Date } {
  const q = Math.floor(d.getMonth() / 3); // 0..3
  const label = `${d.getFullYear()}-Q${q + 1}`;
  const end = new Date(Date.UTC(d.getFullYear(), q * 3 + 3, 0)); // last day of quarter
  return { label, end };
}
function quarterForDate(iso: string | null): { label: string; due: Date } {
  const d = iso ? new Date(iso) : new Date();
  const { label, end } = currentQuarter(d);
  return { label, due: iso ? new Date(iso) : end };
}

export async function commitNinetyImport(
  orgId: string,
  orgName: string,
  sheets: ParsedSheet[],
  createdBy: string,
): Promise<CommitResult> {
  const warnings: string[] = [];
  const created = { humans: 0, rocks: 0, todos: 0, issues: 0, kpis: 0, kpiValues: 0 };
  const skipped = { rocks: 0, todos: 0, issues: 0, kpis: 0 };

  // Flatten records, capping total volume.
  const records = sheets.flatMap(s => s.records).filter(r => r.module !== 'unknown');
  if (records.length > MAX_RECORDS) {
    warnings.push(`Import capped at ${MAX_RECORDS} records; ${records.length - MAX_RECORDS} were skipped.`);
    records.length = MAX_RECORDS;
  }

  // 1. Roster: distinct owner names across all clean modules.
  const ownerNames = [...new Set(records.map(r => r.owner).filter((n): n is string => !!n))];

  // 2. Seed people into the chart (idempotent add). Tolerate NO_OOS.
  let chartSeeded = false;
  if (ownerNames.length) {
    try {
      const res = await bulkImportHumans(orgId, ownerNames.map(name => ({ name })), 'addition');
      created.humans = res.created ?? 0;
      chartSeeded = true;
      if (res.warnings?.length) warnings.push(...res.warnings.map((w: any) => typeof w === 'string' ? w : (w?.message || w?.reason || JSON.stringify(w))));
    } catch (err: any) {
      if (err?.code === 'NO_OOS') {
        warnings.push('Your workspace has no chart yet, so people were attached by id but not drawn. Create your chart to see them as seats.');
      } else {
        warnings.push(`Could not seed people into the chart: ${err?.message || 'unknown error'}.`);
      }
    }
  }

  // 3. Resolve each owner name -> seat externalId (authoritative from the graph
  //    if seeded, else predicted).
  const idByName = new Map<string, string>();
  if (chartSeeded) {
    try {
      const graph = await getOrgTeamGraph(orgId, orgName);
      for (const n of graph.nodes) if (n.type === 'human') idByName.set(norm(n.label), n.externalId);
    } catch { /* fall through to prediction */ }
  }
  const ownerIdFor = (name: string | null): { id: string; name: string } | null => {
    if (!name) return null;
    return { id: idByName.get(norm(name)) || predictExternalId(name), name };
  };

  // 4. Default team (leadership) for L10 items; null is acceptable everywhere.
  let teamId: string | null = null;
  try {
    const [t] = await db.select({ id: teams.id }).from(teams)
      .where(and(eq(teams.orgId, orgId), eq(teams.slug, 'leadership'))).limit(1);
    teamId = t?.id ?? null;
  } catch { /* teamId stays null */ }

  // 5. Pre-fetch existing titles for dedupe (idempotent re-import).
  const existingRockTitles = new Set(
    (await db.select({ t: rocks.title }).from(rocks).where(and(eq(rocks.organizationId, orgId), isNull(rocks.deletedAt)))).map(r => norm(r.t)),
  );
  const existingTodoTitles = new Set(
    (await db.select({ t: todos.title }).from(todos).where(and(eq(todos.organizationId, orgId), isNull(todos.deletedAt)))).map(r => norm(r.t)),
  );
  const existingIssueTitles = new Set(
    (await db.select({ t: tickets.title }).from(tickets).where(and(eq(tickets.orgId, orgId), isNull(tickets.deletedAt)))).map(r => norm(r.t)),
  );
  const existingKpiKeys = new Set<string>(); // owner|title, filled as we go

  const audit: any[] = [];

  // 6. Write records by module.
  for (const rec of records) {
    const owner = ownerIdFor(rec.owner);
    try {
      if (rec.module === 'rocks') {
        if (existingRockTitles.has(norm(rec.title))) { skipped.rocks++; continue; }
        const q = quarterForDate((rec.extra.dueDate as string) || null);
        const [row] = await db.insert(rocks).values({
          organizationId: orgId,
          ownerEntityType: 'human',
          ownerExternalId: owner?.id || predictExternalId('Unassigned'),
          ownerName: owner?.name || null,
          title: rec.title.slice(0, 500),
          description: (rec.extra.description as string) || null,
          quarter: q.label,
          dueDate: q.due,
          onTrack: rec.extra.onTrack !== false,
          teamId,
          createdBy,
        }).returning();
        existingRockTitles.add(norm(rec.title));
        created.rocks++;
        audit.push(createAuditEntry('rock.created', 'rock', { orgId, actorType: 'system', entityId: row.id, details: { title: row.title, source: 'ninety-import' } }));
      } else if (rec.module === 'todos') {
        if (existingTodoTitles.has(norm(rec.title))) { skipped.todos++; continue; }
        const due = (rec.extra.dueAt as string) || null;
        const done = rec.extra.done === true;
        const [row] = await db.insert(todos).values({
          organizationId: orgId,
          kind: teamId ? 'l10' : 'personal',
          priority: 'p3',
          teamId,
          ownerEntityType: 'human',
          ownerExternalId: owner?.id || predictExternalId('Unassigned'),
          ownerName: owner?.name || null,
          title: rec.title.slice(0, 500),
          description: (rec.extra.description as string) || null,
          dueAt: due ? new Date(due) : null,
          doneAt: done ? (due ? new Date(due) : new Date()) : null,
          createdBy,
        }).returning();
        existingTodoTitles.add(norm(rec.title));
        created.todos++;
        audit.push(createAuditEntry('todo.created', 'todo', { orgId, actorType: 'system', entityId: row.id, details: { title: row.title, source: 'ninety-import' } }));
      } else if (rec.module === 'issues') {
        if (existingIssueTitles.has(norm(rec.title))) { skipped.issues++; continue; }
        const [row] = await db.insert(tickets).values({
          orgId,
          teamId,
          title: rec.title.slice(0, 500),
          description: ((rec.extra.description as string) || rec.title || '(imported from Ninety)').slice(0, 10000),
          priority: 'medium',
          category: 'other',
          ownerEntityType: owner ? 'human' : null,
          ownerExternalId: owner?.id || null,
          ownerName: owner?.name || null,
        }).returning();
        existingIssueTitles.add(norm(rec.title));
        created.issues++;
        audit.push(createAuditEntry('ticket.created', 'ticket', { orgId, actorType: 'system', entityId: row.id, details: { title: row.title, source: 'ninety-import' } }));
      } else if (rec.module === 'scorecard') {
        const key = `${owner?.id || ''}|${norm(rec.title)}`;
        if (existingKpiKeys.has(key)) { skipped.kpis++; continue; }
        const kpi = await createKpi(orgId, {
          ownerEntityType: 'human',
          ownerExternalId: owner?.id || predictExternalId('Unassigned'),
          title: rec.title.slice(0, 255),
          goalOperator: (rec.extra.goalOperator as any) ?? null,
          goalValue: (rec.extra.goalValue as number) ?? null,
          unit: (rec.extra.unit as string) ?? null,
          timeGrain: 'weekly',
          teamId,
        }, createdBy);
        existingKpiKeys.add(key);
        created.kpis++;
        const values = (rec.extra.values as Array<{ periodStart: string; value: number }>) || [];
        for (const v of values) {
          try {
            await writeKpiValue(orgId, kpi.id, { periodStart: new Date(v.periodStart), value: v.value, source: 'api' }, createdBy);
            created.kpiValues++;
          } catch { /* skip a bad period cell */ }
        }
      }
    } catch (err: any) {
      warnings.push(`Skipped a ${rec.module} ("${rec.title}"): ${err?.message || 'write failed'}.`);
    }
  }

  // 7. Best-effort audit write (never fail the import on audit).
  if (audit.length) { try { await db.insert(auditLogs).values(audit); } catch { /* ignore */ } }

  return { created, skipped, people: ownerNames.length, warnings: [...new Set(warnings)] };
}
