/**
 * rocks.smart_data -- SMART Rock enrichment (free, Phase 1 of the monetization
 * roadmap). One nullable jsonb column holding the SMART ROCK Planner fields:
 * the five free-text SMART answers, a finish-line description, and the
 * resources / obstacles string lists. Shape lives in shared/smart-rock.ts.
 *
 * Queried by rock id (not into the jsonb), so NO GIN index -- a plain nullable
 * column keeps it simple. null = "not built yet".
 *
 * Drizzle migrate is broken on this project (schema drift), so the column
 * self-heals on boot. Mirrors ensure-rock-milestones.ts.
 */
import { sql } from 'drizzle-orm';
import { db } from '../config/database.js';

const DDL: string[] = [
  `ALTER TABLE "rocks" ADD COLUMN IF NOT EXISTS "smart_data" jsonb;`,
];

export async function ensureSmartRocksColumn(): Promise<void> {
  for (const stmt of DDL) {
    await db.execute(sql.raw(stmt));
  }
}
