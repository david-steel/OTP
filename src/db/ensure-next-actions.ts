/**
 * Idempotent boot-time migration: add `next_action` text + a
 * `next_action_set_at` timestamp to the entities that participate
 * in the GTD-style Next Action layer on /dashboard.
 *
 * Phase 1 scope: rocks + tickets (issues). KPIs + execution items
 * stay as a Phase 1.5 follow-up -- those are less direct daily-action
 * shape and the value/effort ratio for adding them in the same push is
 * lower.
 *
 * Why the timestamp: the L8 weekly-review prompt flags Next Actions
 * that are >14 days old as "still right?" so they don't quietly turn
 * stale. A bare text column would lose that signal.
 *
 * Safe to run on every boot.
 */
import { sql } from 'drizzle-orm';
import { db } from '../config/database.js';

const DDL = [
  // rocks
  `DO $$ BEGIN
     ALTER TABLE "rocks"
       ADD COLUMN "next_action" text;
   EXCEPTION WHEN duplicate_column THEN null; END $$;`,

  `DO $$ BEGIN
     ALTER TABLE "rocks"
       ADD COLUMN "next_action_set_at" timestamp;
   EXCEPTION WHEN duplicate_column THEN null; END $$;`,

  // tickets (the "issues" table in OTP -- naming is legacy)
  `DO $$ BEGIN
     ALTER TABLE "tickets"
       ADD COLUMN "next_action" text;
   EXCEPTION WHEN duplicate_column THEN null; END $$;`,

  `DO $$ BEGIN
     ALTER TABLE "tickets"
       ADD COLUMN "next_action_set_at" timestamp;
   EXCEPTION WHEN duplicate_column THEN null; END $$;`,
];

export async function ensureNextActionColumns(): Promise<void> {
  for (const stmt of DDL) {
    await db.execute(sql.raw(stmt));
  }
}
