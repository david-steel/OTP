/**
 * Idempotent boot-time migration + seed for glossary_terms.
 * Same pattern as ensure-improvements.ts. Safe to run on every boot.
 *
 * On boot:
 *   1. CREATE TABLE IF NOT EXISTS (no-op if already exists)
 *   2. INSERT ... ON CONFLICT (slug) DO NOTHING for every seed term
 *      → adding new terms to glossary-seed.ts ships them on next boot
 *      → editing existing terms in seed file does NOT overwrite the row
 *        (use a separate migration if you need to update copy in place)
 */
import { sql } from 'drizzle-orm';
import { db } from '../config/database.js';
import { GLOSSARY_SEED } from '../data/glossary-seed.js';

const DDL = [
  `CREATE TABLE IF NOT EXISTS "glossary_terms" (
     "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
     "slug" varchar(200) NOT NULL UNIQUE,
     "name" varchar(300) NOT NULL,
     "definition" text NOT NULL,
     "why_it_matters" text,
     "framework" varchar(80),
     "related_slugs" text[],
     "aliases" text[],
     "public" boolean DEFAULT true NOT NULL,
     "created_at" timestamp DEFAULT now() NOT NULL,
     "updated_at" timestamp DEFAULT now() NOT NULL
   );`,

  `CREATE INDEX IF NOT EXISTS "gt_framework_idx" ON "glossary_terms" ("framework");`,
  `CREATE INDEX IF NOT EXISTS "gt_public_idx" ON "glossary_terms" ("public");`,
];

export async function ensureGlossaryTermsTable(): Promise<void> {
  for (const stmt of DDL) {
    await db.execute(sql.raw(stmt));
  }

  for (const term of GLOSSARY_SEED) {
    await db.execute(sql`
      INSERT INTO glossary_terms (slug, name, definition, why_it_matters, framework, related_slugs, aliases)
      VALUES (
        ${term.slug},
        ${term.name},
        ${term.definition},
        ${term.whyItMatters ?? null},
        ${term.framework ?? null},
        ${term.relatedSlugs && term.relatedSlugs.length ? term.relatedSlugs : null},
        ${term.aliases && term.aliases.length ? term.aliases : null}
      )
      ON CONFLICT (slug) DO NOTHING
    `);
  }
}
