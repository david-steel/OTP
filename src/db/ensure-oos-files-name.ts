/**
 * Idempotent boot-time migration: add the `name` column to oos_files.
 *
 * The Drizzle schema declares oos_files.name (varchar 255, nullable), but the
 * column drifted out of the live table (Drizzle migrate is broken; we self-heal
 * on boot instead). Without it, team-graph's published -> draft roll-forward
 * (getOrCreateEditableDraftForChart, which inserts `name: published.name`)
 * throws `column "name" does not exist`. That blocks ANY chart edit for an org
 * sitting in a published-with-no-draft state -- adding a seat, the Ninety
 * importer seeding people, etc. Surfaced 2026-06-01 by a live Ninety import
 * test against the OTP self-org.
 *
 * Safe to run on every boot.
 */
import { sql } from 'drizzle-orm';
import { db } from '../config/database.js';

export async function ensureOosFilesName(): Promise<void> {
  await db.execute(sql.raw(
    `DO $$ BEGIN
       ALTER TABLE "oos_files" ADD COLUMN "name" varchar(255);
     EXCEPTION WHEN duplicate_column THEN null; END $$;`,
  ));
}
