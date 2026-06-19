/**
 * Idempotent boot-time migration for the BYOK AI-key feature + enterprise tier.
 *
 * organizations.plan_tier gates plan-level features ('standard' | 'enterprise').
 * org_ai_keys holds bring-your-own-key AI provider credentials, one active per
 * org (enforced by a partial unique index on org_id WHERE status = 'active').
 * encrypted_key is packed ciphertext; key_last4 is the masked display suffix.
 * Same pattern as ensure-portfolio.ts (Drizzle migrate is broken).
 */
import { sql } from 'drizzle-orm';
import { db } from '../config/database.js';

const DDL = [
  `ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "plan_tier" varchar(20) NOT NULL DEFAULT 'standard';`,

  `CREATE TABLE IF NOT EXISTS "org_ai_keys" (
     "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
     "org_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
     "provider" varchar(20) NOT NULL,
     "encrypted_key" text NOT NULL,
     "key_last4" varchar(8),
     "status" varchar(20) NOT NULL DEFAULT 'active',
     "last_rotated_at" timestamp,
     "created_at" timestamp NOT NULL DEFAULT now(),
     "updated_at" timestamp NOT NULL DEFAULT now()
   );`,

  `CREATE UNIQUE INDEX IF NOT EXISTS "org_ai_keys_one_active_idx" ON "org_ai_keys" ("org_id") WHERE "status" = 'active';`,
  `CREATE INDEX IF NOT EXISTS "org_ai_keys_org_idx" ON "org_ai_keys" ("org_id");`,
];

export async function ensureAiKeysSchema(): Promise<void> {
  for (const stmt of DDL) {
    await db.execute(sql.raw(stmt));
  }
}
