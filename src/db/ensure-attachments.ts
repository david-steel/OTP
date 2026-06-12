/**
 * attachments + attachment_links -- file attachments on to-dos, carryable
 * onto Issues (tickets) and Quarterly Priorities (rocks).
 *
 * The blob is stored once in attachments.data (bytea, 5MB API cap);
 * attachment_links maps it onto any number of entities. Carry = a second
 * link row, never a second blob. Unlinking the last link deletes the
 * attachment row (enforced in routes/api/attachments.ts).
 *
 * Drizzle migrate is broken on this project (schema drift), so the tables
 * self-heal on boot. Mirrors ensure-meeting-headlines.ts.
 */
import { sql } from 'drizzle-orm';
import { db } from '../config/database.js';

const DDL: string[] = [
  `CREATE TABLE IF NOT EXISTS "attachments" (
     "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
     "organization_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
     "filename" varchar(255) NOT NULL,
     "mime_type" varchar(120) NOT NULL,
     "size_bytes" integer NOT NULL,
     "data" bytea NOT NULL,
     "uploaded_by" varchar(255) NOT NULL,
     "created_at" timestamp NOT NULL DEFAULT now()
   );`,

  `CREATE INDEX IF NOT EXISTS "attachments_org_idx" ON "attachments" ("organization_id");`,

  `CREATE TABLE IF NOT EXISTS "attachment_links" (
     "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
     "organization_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
     "attachment_id" uuid NOT NULL REFERENCES "attachments"("id") ON DELETE CASCADE,
     "entity_type" varchar(20) NOT NULL,
     "entity_id" uuid NOT NULL,
     "created_at" timestamp NOT NULL DEFAULT now()
   );`,

  `CREATE UNIQUE INDEX IF NOT EXISTS "attachment_links_unique_idx" ON "attachment_links" ("attachment_id", "entity_type", "entity_id");`,
  `CREATE INDEX IF NOT EXISTS "attachment_links_org_idx" ON "attachment_links" ("organization_id");`,
  `CREATE INDEX IF NOT EXISTS "attachment_links_entity_idx" ON "attachment_links" ("entity_type", "entity_id");`,
];

export async function ensureAttachmentTables(): Promise<void> {
  for (const stmt of DDL) {
    await db.execute(sql.raw(stmt));
  }
}
