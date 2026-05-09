#!/usr/bin/env tsx
/**
 * ensure-public-api-v1.ts
 *
 * Self-healing schema apply for the public API v1 surface.
 *
 * Drizzle's migrate path is broken on this codebase due to migration-history
 * drift. Per the OTP convention, schema changes that the public API depends on
 * are applied via idempotent ensure-X scripts that can run on every boot.
 *
 * This script adds:
 *   - organizations.slug      (text, unique, nullable)
 *   - organizations.public    (boolean, default false, not null)
 *   - best_practices.public   (boolean, default false, not null)
 *   - claims.public           (boolean, default false, not null)
 *   - claims.roles            (text[], default '{}', not null)
 *   - kpis.public             (boolean, default false, not null)
 *
 * Backfills:
 *   - organizations.slug from kebab-cased lower(name) where slug IS NULL
 *   - organizations.public = true for ('Sneeze It', 'Clear Skies Title Agency')
 *
 * Run via: tsx scripts/ensure-public-api-v1.ts
 */

import { Client } from 'pg';
import { readFileSync } from 'fs';

function readDatabaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const env = readFileSync('.env', 'utf8');
  const m = env.match(/^DATABASE_URL=(.+)$/m);
  if (!m) throw new Error('DATABASE_URL not found in env or .env file');
  return m[1].trim().replace(/^['"]|['"]$/g, '');
}

interface ColumnAdd {
  table: string;
  column: string;
  ddl: string;
}

const ADDITIONS: ColumnAdd[] = [
  {
    table: 'organizations',
    column: 'slug',
    ddl: `ALTER TABLE organizations ADD COLUMN slug text;
          DO $$ BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM pg_constraint WHERE conname = 'organizations_slug_unique'
            ) THEN
              ALTER TABLE organizations ADD CONSTRAINT organizations_slug_unique UNIQUE (slug);
            END IF;
          END $$;`,
  },
  {
    table: 'organizations',
    column: 'public',
    ddl: `ALTER TABLE organizations ADD COLUMN "public" boolean DEFAULT false NOT NULL`,
  },
  {
    table: 'best_practices',
    column: 'public',
    ddl: `ALTER TABLE best_practices ADD COLUMN "public" boolean DEFAULT false NOT NULL`,
  },
  {
    table: 'claims',
    column: 'public',
    ddl: `ALTER TABLE claims ADD COLUMN "public" boolean DEFAULT false NOT NULL`,
  },
  {
    table: 'claims',
    column: 'roles',
    ddl: `ALTER TABLE claims ADD COLUMN roles text[] DEFAULT '{}'::text[] NOT NULL`,
  },
  {
    table: 'kpis',
    column: 'public',
    ddl: `ALTER TABLE kpis ADD COLUMN "public" boolean DEFAULT false NOT NULL`,
  },
  {
    table: 'claims',
    column: 'source_url',
    ddl: `ALTER TABLE claims ADD COLUMN source_url text`,
  },
  {
    table: 'claims',
    column: 'agent_name',
    ddl: `ALTER TABLE claims ADD COLUMN agent_name varchar(100)`,
  },
];

async function columnExists(c: Client, table: string, column: string): Promise<boolean> {
  const r = await c.query(
    `SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2`,
    [table, column],
  );
  return (r.rowCount ?? 0) > 0;
}

async function main(): Promise<void> {
  const url = readDatabaseUrl();
  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    await client.query('BEGIN');

    for (const a of ADDITIONS) {
      const exists = await columnExists(client, a.table, a.column);
      if (exists) {
        console.log(`✓ ${a.table}.${a.column} already exists, skipping`);
        continue;
      }
      console.log(`+ Adding ${a.table}.${a.column}`);
      await client.query(a.ddl);
    }

    console.log('Backfilling organizations.slug...');
    const slugRes = await client.query(
      `UPDATE organizations
          SET slug = lower(regexp_replace(regexp_replace(name, '[^a-zA-Z0-9 -]', '', 'g'), '\\s+', '-', 'g'))
        WHERE slug IS NULL`,
    );
    console.log(`  ${slugRes.rowCount ?? 0} rows backfilled`);

    console.log('Marking Sneeze It and Clear Skies as public...');
    const pubRes = await client.query(
      `UPDATE organizations
          SET "public" = true
        WHERE name IN ('Sneeze It', 'Clear Skies Title Agency')`,
    );
    console.log(`  ${pubRes.rowCount ?? 0} rows flipped public`);

    await client.query('COMMIT');
    console.log('\n✅ ensure-public-api-v1: success');

    const summary = await client.query(
      `SELECT name, slug, "public" FROM organizations
         WHERE "public" = true OR name IN ('Sneeze It','Clear Skies Title Agency')
         ORDER BY "public" DESC, name`,
    );
    console.log('\nPublic-flagged orgs:');
    for (const row of summary.rows) {
      console.log(`  - ${row.name}  slug=${row.slug}  public=${row.public}`);
    }
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ ensure-public-api-v1: rollback', err);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main();
