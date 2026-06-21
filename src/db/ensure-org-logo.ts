/**
 * Idempotent boot-time migration for the Organization Logo feature.
 *
 * organizations.logo_url holds a `data:image/...;base64,...` data-URI (capped
 * ~150KB at the upload route). The left-sidebar header renders it in place of
 * the org name; Company Settings lets owners/admins upload or remove it. Same
 * self-heal pattern as ensure-org-sidebar.ts (Drizzle migrate is broken).
 */
import { sql } from 'drizzle-orm';
import { db } from '../config/database.js';

const DDL = [
  `ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "logo_url" text;`,
];

export async function ensureOrgLogoColumn(): Promise<void> {
  for (const stmt of DDL) {
    await db.execute(sql.raw(stmt));
  }
}
