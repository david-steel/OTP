/**
 * schedule-runner.ts -- the in-process tick that fires due autonomous schedules.
 *
 * ============================ THE #1 SAFETY RULE ============================
 * This poller spends an org's wallet on AUTOPILOT. It is DORMANT behind a master
 * kill switch. startScheduleRunner() does NOTHING -- no setInterval, no query,
 * no fire -- unless AGENT_SCHEDULER_ENABLED is truthy (1/true/yes/on). Default
 * OFF. Schedule CRUD + UI can ship and work (users create schedules) while this
 * stays off; flipping the flag is the single, deliberate act that arms autopilot.
 * ===========================================================================
 *
 * When ARMED, every 60s it:
 *   1. Selects due schedules (enabled AND next_run_at <= now()).
 *   2. ATOMICALLY CLAIMS each (UPDATE ... WHERE id AND enabled AND due RETURNING)
 *      -- only the instance that wins the row proceeds, so multiple app instances
 *      never double-fire the same schedule.
 *   3. RE-CHECKS the gate (funded wallet + active key) at fire time. If it now
 *      fails (wallet drained / key revoked), it auto-disables the schedule + logs
 *      and does NOT run.
 *   4. Enforces a per-org daily cap on scheduled runs (SCHEDULED_RUN_DAILY_CAP,
 *      default 50) -- a runaway can't drain a wallet in one day.
 *   5. Resolves the SOP live from the chart. If the SOP is gone, disables + logs.
 *   6. Fires runAgent({ trigger:'scheduled', scheduleId, sop }) -- the SAME entry
 *      point manual runs use, so metering + agent_runs logging are identical. Its
 *      gated metering pre-check is the LAST line of defense on an empty wallet.
 *   7. Catches per-schedule errors so one bad schedule never kills the loop, and
 *      wraps the whole tick in try/catch so the tick never crashes the process.
 */
import type { FastifyInstance } from 'fastify';
import { sql } from 'drizzle-orm';
import { db } from '../config/database.js';
import { runAgent } from './agent-runtime.js';
import { canSchedule } from './schedule-gate.js';
import { getOrgTeamGraph } from './team-graph.js';
import { resolveSopFromNode } from '../routes/api/agents.js';
import { nextRunAt, cronToCadence } from '../shared/schedule-cadence.js';

const TICK_MS = 60_000;

/** Master kill switch. Truthy (1/true/yes/on) ARMS the poller. Default OFF. */
export function schedulerEnabled(): boolean {
  const v = process.env.AGENT_SCHEDULER_ENABLED;
  return v === '1' || v === 'true' || v === 'yes' || v === 'on';
}

function dailyCap(): number {
  const n = parseInt(process.env.SCHEDULED_RUN_DAILY_CAP || '50', 10);
  return Number.isFinite(n) && n > 0 ? n : 50;
}

interface DueSchedule {
  id: string;
  org_id: string;
  agent_external_id: string;
  cron: string;
  timezone: string;
  sop_id: string | null;
  sop_title: string | null;
}

/** Disable a schedule (auto-disable on gate fail / missing SOP / bad cron). */
async function disableSchedule(id: string, reason: string, log: FastifyInstance['log']): Promise<void> {
  await db.execute(sql`UPDATE agent_schedules SET enabled = false, updated_at = now() WHERE id = ${id}`);
  log.warn({ scheduleId: id, reason }, '[schedule-runner] auto-disabled schedule');
}

/**
 * Process ONE due schedule that this instance already CLAIMED. Exported for
 * targeted testing. Returns a short status string for logging.
 */
export async function fireClaimedSchedule(s: DueSchedule, log: FastifyInstance['log']): Promise<string> {
  // Defensive: never fire a cron we cannot interpret as a known cadence.
  if (!cronToCadence(s.cron)) {
    await disableSchedule(s.id, 'unknown-cron', log);
    return 'disabled:unknown-cron';
  }

  // Per-org daily cap on SCHEDULED runs.
  const cap = dailyCap();
  const capRows = (await db.execute(sql`
    SELECT count(*)::int AS c FROM agent_runs
    WHERE org_id = ${s.org_id} AND trigger = 'scheduled' AND created_at > now() - interval '24 hours'
  `)).rows as { c: number }[];
  if ((capRows[0]?.c ?? 0) >= cap) {
    log.warn({ scheduleId: s.id, orgId: s.org_id, cap }, '[schedule-runner] per-org daily cap reached; skipping fire');
    return 'skipped:daily-cap';
  }

  // RE-CHECK the gate at fire time (wallet may be drained / key revoked).
  const gate = await canSchedule(s.org_id);
  if (!gate.ok) {
    await disableSchedule(s.id, `gate:${gate.reason}`, log);
    return `disabled:gate:${gate.reason}`;
  }

  // Resolve the SOP live from the chart. Gone -> disable.
  let sop = null;
  try {
    const graph = await getOrgTeamGraph(s.org_id, '');
    const node = graph.nodes.find(n => n.externalId === s.agent_external_id && n.type === 'agent');
    if (!node) {
      await disableSchedule(s.id, 'agent-gone', log);
      return 'disabled:agent-gone';
    }
    sop = resolveSopFromNode((node.properties as any)?.sops, {
      sopId: s.sop_id || undefined,
      sopTitle: s.sop_title || undefined,
    });
  } catch (e) {
    log.error({ scheduleId: s.id, err: e }, '[schedule-runner] graph/SOP resolution failed; skipping this tick');
    return 'skipped:graph-error';
  }
  if (!sop) {
    await disableSchedule(s.id, 'sop-gone', log);
    return 'disabled:sop-gone';
  }

  // Fire via the SAME runAgent path manual runs use. Its gated metering pre-check
  // is the final guard against spending on an empty wallet.
  const result = await runAgent({
    orgId: s.org_id,
    externalId: s.agent_external_id,
    sop,
    scheduleId: s.id,
    trigger: 'scheduled',
    triggeredByUserId: null,
  });
  return `fired:${result.status}`;
}

/** One tick: claim + fire all due schedules. Never throws. */
async function tick(log: FastifyInstance['log']): Promise<void> {
  try {
    // Candidate due schedules. We then CLAIM each individually (the claim UPDATE
    // is the real race guard; this SELECT just bounds the work).
    const due = (await db.execute(sql`
      SELECT id, org_id, agent_external_id, cron, timezone, sop_id, sop_title
      FROM agent_schedules
      WHERE enabled = true AND next_run_at IS NOT NULL AND next_run_at <= now()
      ORDER BY next_run_at ASC
      LIMIT 100
    `)).rows as unknown as DueSchedule[];

    for (const s of due) {
      try {
        // ATOMIC CLAIM: advance next_run_at + stamp last_run_at in the SAME
        // UPDATE, conditioned on the row still being due+enabled. Only the
        // instance that gets a returned row proceeds -> no double-fire.
        const computedNext = nextRunAt(s.cron, s.timezone, new Date());
        const claimed = (await db.execute(sql`
          UPDATE agent_schedules
          SET last_run_at = now(), next_run_at = ${computedNext}, updated_at = now()
          WHERE id = ${s.id} AND enabled = true AND next_run_at IS NOT NULL AND next_run_at <= now()
          RETURNING id
        `)).rows as { id: string }[];
        if (claimed.length === 0) continue; // another instance won the claim

        const status = await fireClaimedSchedule(s, log);
        log.info({ scheduleId: s.id, orgId: s.org_id, agent: s.agent_external_id, status }, '[schedule-runner] processed schedule');
      } catch (e) {
        // One bad schedule must never stop the loop.
        log.error({ scheduleId: s.id, err: e }, '[schedule-runner] schedule fire failed (continuing)');
      }
    }
  } catch (e) {
    log.error({ err: e }, '[schedule-runner] tick failed (will retry next interval)');
  }
}

let started = false;

/**
 * Start the poller. NO-OP when AGENT_SCHEDULER_ENABLED is falsy (the kill
 * switch). Idempotent. Returns the interval handle when armed, else null.
 */
export function startScheduleRunner(app: FastifyInstance): ReturnType<typeof setInterval> | null {
  if (!schedulerEnabled()) {
    app.log.info('[schedule-runner] DISABLED (AGENT_SCHEDULER_ENABLED is off) -- poller did NOT start; no scheduled runs will fire.');
    return null;
  }
  if (started) {
    app.log.info('[schedule-runner] already started; skipping duplicate start.');
    return null;
  }
  started = true;
  app.log.info(`[schedule-runner] ENABLED -- poller started (tick every ${TICK_MS / 1000}s, daily cap ${dailyCap()}/org).`);
  const handle = setInterval(() => { void tick(app.log); }, TICK_MS);
  // Don't hold the event loop open on shutdown.
  if (typeof handle.unref === 'function') handle.unref();
  return handle;
}
