/**
 * seat_responsibilities -- structured role accountabilities per chart seat.
 *
 * A chart seat is an entity/tile on the org chart, identified by its
 * `externalId`. This table holds the ordered list of accountabilities
 * for that seat as a jsonb string[] so the chart UI can render and edit
 * a seat's responsibilities independently of the OOS YAML source.
 *
 * One row per (orgId, seatExternalId); the unique index enforces that.
 */
import { sql } from 'drizzle-orm';
import { db } from '../config/database.js';

const DDL: string[] = [
  `CREATE TABLE IF NOT EXISTS "seat_responsibilities" (
     "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
     "org_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
     "seat_external_id" varchar(120) NOT NULL,
     "responsibilities" jsonb NOT NULL DEFAULT '[]'::jsonb,
     "updated_by" varchar(255),
     "created_at" timestamp NOT NULL DEFAULT now(),
     "updated_at" timestamp NOT NULL DEFAULT now()
   );`,

  `CREATE UNIQUE INDEX IF NOT EXISTS "seat_resp_org_seat_uk" ON "seat_responsibilities" ("org_id", "seat_external_id");`,
  `CREATE INDEX IF NOT EXISTS "seat_resp_org_idx" ON "seat_responsibilities" ("org_id");`,
];

export async function ensureSeatResponsibilitiesTable(): Promise<void> {
  for (const stmt of DDL) {
    await db.execute(sql.raw(stmt));
  }
}
