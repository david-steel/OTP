/**
 * Idempotent boot-time migration: sidebar_config column on organizations.
 * Same self-healing pattern as ensure-meeting-auto-end.ts (Drizzle migrate is
 * broken in this repo). Safe to run on every boot.
 *
 * sidebar_config backs the owner-controlled "Customize sidebar" feature
 * (Labs: sidebar_customize): { order: string[], hidden: string[] } of nav hrefs.
 */
import { sql } from 'drizzle-orm';
import { db } from '../config/database.js';

const DDL = [
  `ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "sidebar_config" jsonb;`,
];

export async function ensureOrgSidebarColumn(): Promise<void> {
  for (const stmt of DDL) {
    await db.execute(sql.raw(stmt));
  }
}
