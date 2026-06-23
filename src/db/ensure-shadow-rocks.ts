/**
 * rocks.shadow_owner_only -- "shadow rock" privacy flag. When true, the rock is
 * visible ONLY to its owner (matched on owner_entity_type + owner_external_id),
 * and hidden from every other member of the org, INCLUDING owners/admins. This
 * is a true private priority -- the failure mode is a leak of the one thing the
 * flag exists to hide, so the visibility predicate lives in one place
 * (shared/rock-visibility.ts) and must be applied in every rock read path.
 *
 * Drizzle migrate is broken on this project (schema drift), so the column
 * self-heals on boot. Mirrors ensure-smart-rocks.ts.
 */
import { sql } from 'drizzle-orm';
import { db } from '../config/database.js';

const DDL: string[] = [
  `ALTER TABLE "rocks" ADD COLUMN IF NOT EXISTS "shadow_owner_only" boolean NOT NULL DEFAULT false;`,
];

export async function ensureShadowRocksColumn(): Promise<void> {
  for (const stmt of DDL) {
    await db.execute(sql.raw(stmt));
  }
}
