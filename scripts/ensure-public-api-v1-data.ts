#!/usr/bin/env tsx
/**
 * ensure-public-api-v1-data.ts — Idempotent. Two phases:
 *   Phase A (autocommit): add columns chart/description/website if missing.
 *   Phase B (transactional): rename + flip Sneeze It / OTP, upsert Clear Skies.
 */

import { Client } from 'pg';
import { readFileSync } from 'fs';
import { randomUUID } from 'crypto';

function readDatabaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const env = readFileSync('.env', 'utf8');
  const m = env.match(/^DATABASE_URL=(.+)$/m);
  if (!m) throw new Error('DATABASE_URL not found');
  return m[1].trim().replace(/^['"]|['"]$/g, '');
}

const SNEEZE_IT_CHART = {
  leader: { name: 'David Steel', role: 'CEO', type: 'human' as const },
  seats: [
    { name: 'Radar', role: 'Chief of Staff', type: 'agent', color: 'olive' },
    { name: 'Dan', role: 'Strategic Co-Founder', type: 'agent', color: 'purple' },
    { name: 'Dash', role: 'Customer Performance Analyst', type: 'agent', color: 'cyan' },
    { name: 'Pepper', role: 'Executive Assistant', type: 'agent', color: 'red' },
    { name: 'Crystal', role: 'Project Manager', type: 'agent', color: 'silver' },
    { name: 'Dirk', role: 'Chief Revenue Operator', type: 'agent', color: 'gold' },
    { name: 'Pulse', role: 'Client Retention', type: 'agent', color: 'blue' },
    { name: 'Neil', role: 'Chief Learning Officer', type: 'agent', color: 'teal' },
    { name: 'Bassim', role: 'Agentic Maturity Evaluator', type: 'agent', color: 'slate' },
    { name: 'Arin', role: 'Call Center Manager', type: 'agent', color: 'orange' },
    { name: 'Tally', role: 'Scorecard Agent', type: 'agent', color: 'pink' },
    { name: 'Steve', role: 'Focus Group Simulator', type: 'agent', color: 'coral' },
    { name: 'Bogdan Tabaka', role: 'COO', type: 'human' },
    { name: 'Janine', role: 'Accounting', type: 'human' },
    { name: 'Kristen Giessuebel', role: 'Creative Director', type: 'human' },
    { name: 'Nate Foss', role: 'Web & Technology', type: 'human' },
    { name: 'Riya Sathwara', role: 'Asst Strategy Mgr', type: 'human' },
    { name: 'Amanda Zuze', role: 'Setter', type: 'human' },
    { name: 'Erica Muzwidzwa', role: 'Setter / CC Manager', type: 'human' },
  ],
  note: 'Humans and agents share one chart, one scorecard, one accountability layer.',
};

const OTP_CHART = {
  leader: { name: 'David Steel', role: 'Founder', type: 'human' as const },
  seats: [
    { name: 'Scout', role: 'OTP Publisher Sourcing', type: 'agent', color: 'green' },
    { name: 'Crafter', role: 'OTP Outreach Voice', type: 'agent', color: 'amber' },
  ],
  note: 'OTP is bootstrapped by a small founding agent crew.',
};

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
    // ---- Phase A: column adds (autocommit each) ----
    if (!(await columnExists(client, 'organizations', 'chart'))) {
      console.log('+ Adding organizations.chart');
      await client.query(`ALTER TABLE organizations ADD COLUMN chart jsonb NOT NULL DEFAULT '{}'::jsonb`);
    } else {
      console.log('✓ organizations.chart');
    }
    if (!(await columnExists(client, 'organizations', 'description'))) {
      console.log('+ Adding organizations.description');
      await client.query(`ALTER TABLE organizations ADD COLUMN description text`);
    } else {
      console.log('✓ organizations.description');
    }
    if (!(await columnExists(client, 'organizations', 'website'))) {
      console.log('+ Adding organizations.website');
      await client.query(`ALTER TABLE organizations ADD COLUMN website text`);
    } else {
      console.log('✓ organizations.website');
    }

    // ---- Phase B: data (transactional) ----
    await client.query('BEGIN');

    console.log('Sneeze It rename + flip + chart');
    await client.query(`
      UPDATE organizations
         SET name = 'Sneeze It',
             slug = 'sneeze-it',
             "public" = true,
             description = COALESCE(description, $2),
             website = COALESCE(website, 'https://sneeze.it'),
             chart = $1::jsonb
       WHERE name IN ('Sneeze It Digital Agency', 'Sneeze It')
    `, [
      JSON.stringify(SNEEZE_IT_CHART),
      'Performance marketing agency running an AI agent army across operations, sales, ad performance, retention, and learning.',
    ]);

    console.log('OTP rename + flip + chart');
    await client.query(`
      UPDATE organizations
         SET name = 'OTP',
             slug = 'otp',
             "public" = true,
             description = COALESCE(description, $2),
             website = COALESCE(website, 'https://orgtp.com'),
             chart = $1::jsonb
       WHERE slug IN ('otp-organization-transfer-protocol', 'otp')
          OR name IN ('OTP (Organization Transfer Protocol)', 'OTP')
    `, [
      JSON.stringify(OTP_CHART),
      'Organization Transport Protocol — coordination intelligence layer for AI-augmented organizations.',
    ]);

    console.log('Clear Skies upsert');
    const existing = await client.query(`SELECT id FROM organizations WHERE slug = 'clear-skies' OR name = 'Clear Skies Title Agency'`);
    if ((existing.rowCount ?? 0) === 0) {
      await client.query(`
        INSERT INTO organizations (name, industry, size, clerk_org_id, slug, "public", description, website, chart)
        VALUES (
          'Clear Skies Title Agency',
          'Real Estate Services',
          'small',
          $1,
          'clear-skies',
          true,
          'Title agency exploring AI-augmented operations. First external OTP publisher.',
          'https://clearskiestitle.com',
          $2::jsonb
        )
      `, [
        `org_demo_clearskies_${randomUUID().slice(0, 8)}`,
        JSON.stringify({
          leader: { name: 'Kris Goodrich', role: 'Founder', type: 'human' },
          seats: [],
          note: 'Public roster being assembled.',
        }),
      ]);
      console.log('  + inserted');
    } else {
      await client.query(`
        UPDATE organizations
           SET "public" = true,
               slug = COALESCE(slug, 'clear-skies'),
               description = COALESCE(description, 'Title agency exploring AI-augmented operations. First external OTP publisher.'),
               website = COALESCE(website, 'https://clearskiestitle.com')
         WHERE slug = 'clear-skies' OR name = 'Clear Skies Title Agency'
      `);
      console.log('  ✓ already present');
    }

    await client.query('COMMIT');

    const r = await client.query(`
      SELECT name, slug, "public", website,
             jsonb_array_length(COALESCE(chart->'seats','[]'::jsonb)) AS seats
        FROM organizations
       WHERE "public" = true
       ORDER BY name
    `);
    console.log('\n✅ ensure-public-api-v1-data: success\n');
    console.table(r.rows);
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('❌ rollback:', err);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main();
