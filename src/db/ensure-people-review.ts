/**
 * People layer Phase 2 -- Seat Fit, Values, People Review.
 *
 * Three tables plus the shared `seat_fit_rating` enum:
 *   - seat_fit_reviews  one row per (org, seat, period): Understands / Wants / Capacity
 *   - org_values        the organization's value list
 *   - value_reviews     one row per (org, seat, value, period): rating on that value
 *
 * DDL order matters: the enum and `org_values` must exist before
 * `value_reviews` (which references both). Drizzle migrate is not used --
 * this idempotent boot-time DDL is the migration mechanism.
 */
import { sql } from 'drizzle-orm';
import { db } from '../config/database.js';

const DDL: string[] = [
  // Shared rating enum (idempotent -- safe to re-run).
  `DO $$ BEGIN
     CREATE TYPE "seat_fit_rating" AS ENUM ('yes', 'partial', 'no');
   EXCEPTION WHEN duplicate_object THEN null; END $$;`,

  `CREATE TABLE IF NOT EXISTS "seat_fit_reviews" (
     "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
     "org_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
     "seat_external_id" varchar(120) NOT NULL,
     "period" varchar(20) NOT NULL,
     "understands" "seat_fit_rating",
     "wants" "seat_fit_rating",
     "capacity" "seat_fit_rating",
     "note" text,
     "rated_by" varchar(255),
     "created_at" timestamp NOT NULL DEFAULT now(),
     "updated_at" timestamp NOT NULL DEFAULT now()
   );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "seat_fit_org_seat_period_uk" ON "seat_fit_reviews" ("org_id", "seat_external_id", "period");`,
  `CREATE INDEX IF NOT EXISTS "seat_fit_org_idx" ON "seat_fit_reviews" ("org_id");`,

  `CREATE TABLE IF NOT EXISTS "org_values" (
     "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
     "org_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
     "name" varchar(120) NOT NULL,
     "description" text,
     "position" integer NOT NULL DEFAULT 0,
     "created_at" timestamp NOT NULL DEFAULT now()
   );`,
  `CREATE INDEX IF NOT EXISTS "org_values_org_idx" ON "org_values" ("org_id");`,

  `CREATE TABLE IF NOT EXISTS "value_reviews" (
     "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
     "org_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
     "seat_external_id" varchar(120) NOT NULL,
     "value_id" uuid NOT NULL REFERENCES "org_values"("id") ON DELETE CASCADE,
     "period" varchar(20) NOT NULL,
     "rating" "seat_fit_rating",
     "note" text,
     "rated_by" varchar(255),
     "created_at" timestamp NOT NULL DEFAULT now()
   );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "value_rev_org_seat_value_period_uk" ON "value_reviews" ("org_id", "seat_external_id", "value_id", "period");`,
  `CREATE INDEX IF NOT EXISTS "value_rev_org_idx" ON "value_reviews" ("org_id");`,
  `CREATE INDEX IF NOT EXISTS "value_rev_seat_idx" ON "value_reviews" ("seat_external_id");`,
];

export async function ensurePeopleReviewTables(): Promise<void> {
  for (const stmt of DDL) {
    await db.execute(sql.raw(stmt));
  }
}
