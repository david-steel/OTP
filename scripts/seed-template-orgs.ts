/**
 * Seeds 25 template organizations into OTP for network density.
 * Reads OOS files from /tmp/otp-seeds/, parses claims using the platform's parser,
 * and inserts org + oos_file + claims into the database.
 *
 * Usage: DATABASE_URL="postgresql://..." npx tsx scripts/seed-template-orgs.ts
 *
 * To run against production:
 *   DATABASE_URL="postgresql://postgres:HbBbFblNwLUoNCCuFMhBKRyEOMAXglvy@shortline.proxy.rlwy.net:15335/railway" npx tsx scripts/seed-template-orgs.ts
 *
 * To preview without writing:
 *   DATABASE_URL="..." npx tsx scripts/seed-template-orgs.ts --dry-run
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SEEDS_DIR = '/tmp/otp-seeds';
const DRY_RUN = process.argv.includes('--dry-run');

// Import the platform's OOS parser
const { parseOOS } = await import('../src/services/claim-parser.js');

interface OrgMeta {
  file: string;
  name: string;
  industry: string;
  size: string;
  template: 'agent_army' | 'value_chain' | 'org_chart';
  clerkId: string;
  agenticLevel: number;
}

const ORGS: OrgMeta[] = [
  { file: '01-meridian-growth.md', name: 'Meridian Growth Partners', industry: 'digital_marketing', size: 'medium', template: 'agent_army', clerkId: 'template_meridian_growth', agenticLevel: 6 },
  { file: '02-sightline-digital.md', name: 'Sightline Digital', industry: 'digital_marketing', size: 'small', template: 'agent_army', clerkId: 'template_sightline_digital', agenticLevel: 5 },
  { file: '03-amplify-collective.md', name: 'Amplify Collective', industry: 'digital_marketing', size: 'medium', template: 'agent_army', clerkId: 'template_amplify_collective', agenticLevel: 7 },
  { file: '04-candor-labs.md', name: 'Candor Labs', industry: 'saas', size: 'solo', template: 'agent_army', clerkId: 'template_candor_labs', agenticLevel: 3 },
  { file: '05-stackwise.md', name: 'Stackwise', industry: 'saas', size: 'small', template: 'agent_army', clerkId: 'template_stackwise', agenticLevel: 5 },
  { file: '06-clearpoint-advisory.md', name: 'Clearpoint Advisory Group', industry: 'consulting', size: 'medium', template: 'value_chain', clerkId: 'template_clearpoint_advisory', agenticLevel: 7 },
  { file: '07-novus-strategy.md', name: 'Novus Strategy', industry: 'consulting', size: 'solo', template: 'value_chain', clerkId: 'template_novus_strategy', agenticLevel: 4 },
  { file: '08-threadline-commerce.md', name: 'Threadline Commerce', industry: 'ecommerce', size: 'small', template: 'agent_army', clerkId: 'template_threadline_commerce', agenticLevel: 5 },
  { file: '09-vetted-goods.md', name: 'Vetted Goods', industry: 'ecommerce', size: 'medium', template: 'agent_army', clerkId: 'template_vetted_goods', agenticLevel: 6 },
  { file: '10-kinwell-health.md', name: 'Kinwell Health Partners', industry: 'healthcare', size: 'small', template: 'org_chart', clerkId: 'template_kinwell_health', agenticLevel: 4 },
  { file: '11-summit-primary.md', name: 'Summit Primary Care', industry: 'healthcare', size: 'small', template: 'org_chart', clerkId: 'template_summit_primary', agenticLevel: 3 },
  { file: '12-hargrove-law.md', name: 'Hargrove Law Group', industry: 'legal', size: 'small', template: 'value_chain', clerkId: 'template_hargrove_law', agenticLevel: 4 },
  { file: '13-atticus-legal.md', name: 'Atticus Legal', industry: 'legal', size: 'solo', template: 'value_chain', clerkId: 'template_atticus_legal', agenticLevel: 3 },
  { file: '14-keystone-realty.md', name: 'Keystone Realty Partners', industry: 'real_estate', size: 'small', template: 'agent_army', clerkId: 'template_keystone_realty', agenticLevel: 5 },
  { file: '15-lattice-properties.md', name: 'Lattice Properties', industry: 'real_estate', size: 'small', template: 'agent_army', clerkId: 'template_lattice_properties', agenticLevel: 4 },
  { file: '16-corefit-athletics.md', name: 'CoreFit Athletics', industry: 'fitness', size: 'small', template: 'agent_army', clerkId: 'template_corefit_athletics', agenticLevel: 5 },
  { file: '17-apex-performance.md', name: 'Apex Performance Studios', industry: 'fitness', size: 'medium', template: 'agent_army', clerkId: 'template_apex_performance', agenticLevel: 6 },
  { file: '18-greenline-financial.md', name: 'Greenline Financial', industry: 'fintech', size: 'small', template: 'agent_army', clerkId: 'template_greenline_financial', agenticLevel: 6 },
  { file: '19-upside-capital.md', name: 'Upside Capital', industry: 'fintech', size: 'small', template: 'agent_army', clerkId: 'template_upside_capital', agenticLevel: 5 },
  { file: '20-prism-creative.md', name: 'Prism Creative', industry: 'creative_agency', size: 'small', template: 'agent_army', clerkId: 'template_prism_creative', agenticLevel: 5 },
  { file: '21-artifact-studios.md', name: 'Artifact Studios', industry: 'creative_agency', size: 'small', template: 'agent_army', clerkId: 'template_artifact_studios', agenticLevel: 4 },
  { file: '22-brightpath-academy.md', name: 'Brightpath Academy', industry: 'education', size: 'solo', template: 'org_chart', clerkId: 'template_brightpath_academy', agenticLevel: 3 },
  { file: '23-learnwell-ed.md', name: 'Learnwell', industry: 'edtech', size: 'small', template: 'org_chart', clerkId: 'template_learnwell', agenticLevel: 5 },
  { file: '24-devforge.md', name: 'DevForge', industry: 'developer_tools', size: 'solo', template: 'agent_army', clerkId: 'template_devforge', agenticLevel: 6 },
  { file: '25-synthwave-labs.md', name: 'Synthwave Labs', industry: 'ai_tools', size: 'small', template: 'agent_army', clerkId: 'template_synthwave_labs', agenticLevel: 8 },
];

// Quality tier based on agentic level
function qualityTier(level: number): string {
  if (level >= 7) return 'gold';
  if (level >= 5) return 'silver';
  return 'bronze';
}

async function run() {
  if (!fs.existsSync(SEEDS_DIR)) {
    console.error(`Seeds directory not found: ${SEEDS_DIR}`);
    console.error('Generate OOS files first, then run this script.');
    process.exit(1);
  }

  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  let created = 0;
  let skipped = 0;
  let failed = 0;

  try {
    for (const org of ORGS) {
      const filePath = path.join(SEEDS_DIR, org.file);

      if (!fs.existsSync(filePath)) {
        console.log(`SKIP: ${org.name} -- file not found: ${org.file}`);
        skipped++;
        continue;
      }

      // Check if org already exists
      const existing = await client.query(
        'SELECT id FROM organizations WHERE clerk_org_id = $1',
        [org.clerkId]
      );

      if (existing.rows.length > 0) {
        console.log(`SKIP: ${org.name} -- already exists`);
        skipped++;
        continue;
      }

      const content = fs.readFileSync(filePath, 'utf8');
      const parsed = parseOOS(content, org.template);

      if (parsed.claims.length < 10) {
        console.log(`WARN: ${org.name} -- only ${parsed.claims.length} claims parsed (min 10). Proceeding anyway.`);
      }

      if (DRY_RUN) {
        console.log(`DRY RUN: ${org.name} | ${org.industry} | ${org.size} | ${parsed.claims.length} claims | ${parsed.wordCount} words`);
        created++;
        continue;
      }

      try {
        await client.query('BEGIN');

        // Create org
        const orgRes = await client.query(`
          INSERT INTO organizations (name, industry, size, clerk_org_id, badge, quality_tier, agentic_level)
          VALUES ($1, $2, $3, $4, NULL, $5, $6)
          RETURNING id
        `, [org.name, org.industry, org.size, org.clerkId, qualityTier(org.agenticLevel), org.agenticLevel]);
        const orgId = orgRes.rows[0].id;

        // Create published OOS file
        const confDist = parsed.claims.reduce((acc: Record<string, number>, c: any) => {
          const key = c.confidence.toLowerCase();
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {});

        const evidDist = parsed.claims.reduce((acc: Record<string, number>, c: any) => {
          const key = c.evidence.toLowerCase();
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {});

        const oosRes = await client.query(`
          INSERT INTO oos_files (org_id, template, version, status, visibility_default, word_count, claim_count, raw_content, frontmatter, confidence_distribution, evidence_distribution, published_at)
          VALUES ($1, $2, 1, 'published', 'free', $3, $4, $5, $6, $7, $8, NOW())
          RETURNING id
        `, [
          orgId, org.template, parsed.wordCount, parsed.claims.length, content,
          JSON.stringify(parsed.frontmatter || {}),
          JSON.stringify(confDist),
          JSON.stringify(evidDist),
        ]);
        const oosId = oosRes.rows[0].id;

        // Insert claims
        for (const c of parsed.claims) {
          await client.query(
            'INSERT INTO claims (oos_file_id, claim_id, section, display_order, rule, why, failure_mode, confidence, evidence, scope) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',
            [oosId, c.claimId, c.section, c.displayOrder, c.rule, c.why || '', c.failureMode || '', c.confidence, c.evidence, c.scope || 'Organization-wide']
          );
        }

        // Audit log
        await client.query(
          "INSERT INTO audit_logs (org_id, actor_type, action, entity_type, entity_id, details) VALUES ($1, 'system', 'oos.published', 'oos_file', $2, $3)",
          [orgId, oosId, JSON.stringify({ seeded: true, source: 'seed-template-orgs', template: true })]
        );

        await client.query('COMMIT');
        console.log(`OK: ${org.name} | ${org.industry} | ${org.size} | L${org.agenticLevel} | ${parsed.claims.length} claims | ${qualityTier(org.agenticLevel)}`);
        created++;

      } catch (err: any) {
        await client.query('ROLLBACK');
        console.error(`FAIL: ${org.name} -- ${err.message}`);
        failed++;
      }
    }

    console.log(`\nDone. Created: ${created}, Skipped: ${skipped}, Failed: ${failed}`);

  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(err => { console.error(err); process.exit(1); });
