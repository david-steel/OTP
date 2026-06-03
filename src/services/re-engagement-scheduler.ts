// src/services/re-engagement-scheduler.ts
// Daily scheduler for the re-engagement nudge service.
//
// Fires runReEngagement() once per day at 9:00 AM America/New_York.
// Service-internal frequency cap (max 4 per 30d, >=7d between) handles
// re-eligibility, so the only job here is: ask once a day, send if eligible.
//
// Wired in src/server.ts next to startOnboardingScheduler.

import cron from 'node-cron';
import { runReEngagement } from './re-engagement.js';

async function runReEngagementTick(): Promise<void> {
  try {
    console.log('[reengage-scheduler] tick start');
    const result = await runReEngagement({});
    console.log(
      `[reengage-scheduler] tick complete. candidates=${result.candidatesFound} ` +
        `attempted=${result.attempted} sent=${result.sent} failed=${result.failed} ` +
        `capped=${result.capped} pre_signup=${result.bySegment.pre_signup} ` +
        `clerk_pre_oos=${result.bySegment.clerk_pre_oos} ` +
        `clerk_post_oos=${result.bySegment.clerk_post_oos}`,
    );
    if (result.failures.length > 0) {
      for (const f of result.failures) {
        console.error(`[reengage-scheduler] failure ${f.email}: ${f.error}`);
      }
    }
  } catch (err) {
    console.error('[reengage-scheduler] tick failed:', err);
  }
}

let scheduled = false;
export function startReEngagementScheduler(): void {
  if (scheduled) return;
  scheduled = true;

  // M-F only (no weekend sends) per David 2026-06-03. Cron day-of-week 1-5 = Mon-Fri.
  cron.schedule(
    '0 9 * * 1-5',
    () => {
      void runReEngagementTick();
    },
    { timezone: 'America/New_York' },
  );

  console.log('[reengage-scheduler] started (runs weekdays at 9:00 AM America/New_York)');
}
