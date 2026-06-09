/**
 * Idempotent boot-time migration: claim provenance (merge execution, Phase 2).
 *
 * When a claim is imported into your OOS from another organization via the
 * merge engine, we record WHERE it came from. This is the provenance the
 * merge protocol promised ("preserve provenance") but never implemented.
 *
 * Columns added to `claims`:
 *   - source_org_id   uuid  -- the org the claim was imported FROM (null = native)
 *   - source_claim_id uuid  -- the originating claim's row id (soft ref, no FK so
 *                              provenance survives even if the source claim is deleted)
 *   - source_oos_id   uuid  -- the originating OOS version
 *   - provenance      jsonb -- durable snapshot: original confidence/evidence,
 *                              original claim id, source org name at merge time,
 *                              similarity score, decision, merged_at
 *
 * Deliberately NO foreign keys: claims FKs cascade-delete, and provenance must
 * outlive the source. The jsonb snapshot is the system of record if the source
 * row ever disappears; the uuid columns are for queryable joins while it exists.
 *
 * Same pattern as ensure-coach-clients.ts. Safe to run on every boot.
 */
import { sql } from 'drizzle-orm';
import { db } from '../config/database.js';

const DDL = [
  `ALTER TABLE "claims" ADD COLUMN IF NOT EXISTS "source_org_id" uuid;`,
  `ALTER TABLE "claims" ADD COLUMN IF NOT EXISTS "source_claim_id" uuid;`,
  `ALTER TABLE "claims" ADD COLUMN IF NOT EXISTS "source_oos_id" uuid;`,
  `ALTER TABLE "claims" ADD COLUMN IF NOT EXISTS "provenance" jsonb;`,
  // "Where did my imported intelligence come from?" -- only index non-native rows.
  `CREATE INDEX IF NOT EXISTS "claims_source_org_idx" ON "claims" ("source_org_id") WHERE "source_org_id" IS NOT NULL;`,
];

export async function ensureClaimProvenance(): Promise<void> {
  for (const stmt of DDL) {
    await db.execute(sql.raw(stmt));
  }
}
