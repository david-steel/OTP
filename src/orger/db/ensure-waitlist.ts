/**
 * Idempotent boot-time migration for orger_waitlist.
 * Same self-healing pattern as src/db/ensure-glossary-terms.ts.
 * Safe to run on every boot.
 *
 * On boot:
 *   1. CREATE TABLE IF NOT EXISTS (no-op if already exists)
 *   2. CREATE INDEX IF NOT EXISTS for lookups by email + created_at
 *
 * No seed rows. Waitlist starts empty by design.
 */
import { sql } from 'drizzle-orm';
import { db } from '../../config/database.js';

const DDL = [
  `CREATE TABLE IF NOT EXISTS "orger_waitlist" (
     "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
     "email" varchar(320) NOT NULL UNIQUE,
     "source" varchar(60) DEFAULT 'homepage' NOT NULL,
     "ip" varchar(64),
     "user_agent" text,
     "referrer" text,
     "notified_at" timestamp,
     "created_at" timestamp DEFAULT now() NOT NULL
   );`,

  `CREATE INDEX IF NOT EXISTS "ow_created_at_idx" ON "orger_waitlist" ("created_at" DESC);`,
  `CREATE INDEX IF NOT EXISTS "ow_source_idx" ON "orger_waitlist" ("source");`,
];

export async function ensureOrgerWaitlistTable(): Promise<void> {
  for (const stmt of DDL) {
    await db.execute(sql.raw(stmt));
  }
}

export interface OrgerWaitlistEntry {
  email: string;
  source?: string;
  ip?: string | null;
  user_agent?: string | null;
  referrer?: string | null;
}

export async function addToOrgerWaitlist(entry: OrgerWaitlistEntry): Promise<{ created: boolean }> {
  const result = await db.execute(sql`
    INSERT INTO "orger_waitlist" ("email", "source", "ip", "user_agent", "referrer")
    VALUES (
      ${entry.email.toLowerCase().trim()},
      ${entry.source ?? 'homepage'},
      ${entry.ip ?? null},
      ${entry.user_agent ?? null},
      ${entry.referrer ?? null}
    )
    ON CONFLICT ("email") DO NOTHING
    RETURNING "id";
  `);
  // @ts-expect-error drizzle execute return shape varies by driver
  return { created: (result?.rows?.length ?? result?.length ?? 0) > 0 };
}

export async function countOrgerWaitlist(): Promise<number> {
  const result = await db.execute(sql`SELECT COUNT(*)::int AS c FROM "orger_waitlist";`);
  // @ts-expect-error drizzle execute return shape varies by driver
  const row = result?.rows?.[0] ?? result?.[0];
  return Number(row?.c ?? 0);
}
