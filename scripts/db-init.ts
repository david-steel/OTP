// Database initialization script
// Runs migrations, loads protocol schemas, seeds example data
// Usage: npx tsx scripts/db-init.ts

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable required');
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: DATABASE_URL });

async function run() {
  const client = await pool.connect();

  try {
    console.log('--- OTP Database Initialization ---\n');

    // Step 1: Run migrations
    console.log('1. Running migrations...');
    const migrationsDir = path.join(__dirname, '..', 'src', 'db', 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const file of migrationFiles) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      console.log(`   Applying ${file}...`);
      try {
        await client.query(sql);
        console.log(`   OK: ${file}`);
      } catch (e: any) {
        // Skip if already exists (idempotent)
        if (e.message.includes('already exists')) {
          console.log(`   SKIP: ${file} (already applied)`);
        } else {
          throw e;
        }
      }
    }

    // Step 2: Verify tables
    console.log('\n2. Verifying tables...');
    const tables = await client.query(`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);
    console.log(`   Tables: ${tables.rows.map(r => r.tablename).join(', ')}`);

    // Step 3: Seed example data
    console.log('\n3. Seeding example data...');
    await seedExampleData(client);

    console.log('\n--- Database initialization complete ---');
    console.log(`Tables: ${tables.rows.length}`);

  } finally {
    client.release();
    await pool.end();
  }
}

async function seedExampleData(client: pg.PoolClient) {
  // Check if seed data already exists
  const existing = await client.query('SELECT COUNT(*) AS c FROM organizations');
  if (parseInt(existing.rows[0].c) > 0) {
    console.log('   SKIP: Data already exists');
    return;
  }

  // Create OTP as the first organization (Publisher #1)
  const orgResult = await client.query(`
    INSERT INTO organizations (name, industry, size, clerk_org_id, badge, quality_tier)
    VALUES ('OTP (Organization Transfer Protocol)', 'infrastructure_technology', 'solo', 'otp-self-001', 'founding', 'gold')
    RETURNING id
  `);
  const orgId = orgResult.rows[0].id;
  console.log(`   Created org: OTP (${orgId})`);

  // Load OTP's own OOS file
  const oosContent = fs.readFileSync(
    path.join(__dirname, '..', 'src', 'protocol', 'otp-self.oos.md'),
    'utf8'
  );

  const oosResult = await client.query(`
    INSERT INTO oos_files (org_id, template, version, status, visibility_default, word_count, claim_count, raw_content, frontmatter, confidence_distribution, evidence_distribution, published_at)
    VALUES ($1, 'agent_army', 1, 'published', 'free', 2650, 18, $2, $3, $4, $5, NOW())
    RETURNING id
  `, [
    orgId,
    oosContent,
    JSON.stringify({
      oos_version: '1.0',
      org_pseudonym: 'OTP (Organization Transfer Protocol)',
      industry: 'infrastructure_technology',
      org_size: 'solo',
      template: 'agent_army',
      agent_count: 3,
      platforms: ['claude'],
    }),
    JSON.stringify({ high: 5, medium: 9, low: 4 }),
    JSON.stringify({
      human_defined_rule: 6, observed_once: 1, observed_repeatedly: 2,
      measured_result: 1, inference: 5, speculation: 3,
    }),
  ]);
  const oosId = oosResult.rows[0].id;
  console.log(`   Created OOS file: v1 (${oosId})`);

  // Seed the 18 claims from OTP's OOS
  const claimsData = [
    { id: 'C001', section: 'core_operating_rules', order: 0, rule: 'Every agent writes to its own shared state file. No agent reads another agent\'s working memory directly.', why: 'Shared state files create visible, auditable coordination.', failure: 'Agent A acts on stale data from Agent B.', confidence: 'HIGH', evidence: 'HUMAN_DEFINED_RULE', scope: 'All agents.' },
    { id: 'C002', section: 'core_operating_rules', order: 1, rule: 'All external communications require founder approval before sending.', why: 'AI-drafted communications may be tonally wrong or strategically misaligned.', failure: 'Agent sends outreach with incorrect positioning.', confidence: 'HIGH', evidence: 'HUMAN_DEFINED_RULE', scope: 'All external communications.' },
    { id: 'C003', section: 'core_operating_rules', order: 2, rule: 'Spec changes require founder approval within 1 business day.', why: 'The protocol is the most important asset.', failure: 'Protocol Steward ships a breaking change.', confidence: 'HIGH', evidence: 'HUMAN_DEFINED_RULE', scope: 'All OOS schema changes.' },
    { id: 'C004', section: 'core_operating_rules', order: 3, rule: 'Decisions affecting pricing, legal, or partnerships are human-only.', why: 'Financial and legal consequences agents cannot assess.', failure: 'Agent commits to unapproved partnership terms.', confidence: 'HIGH', evidence: 'HUMAN_DEFINED_RULE', scope: 'All financial and legal decisions.' },
    { id: 'C005', section: 'core_operating_rules', order: 4, rule: 'Tuesday evening is the protected build block. Only coding.', why: 'Build velocity depends on uninterrupted focus time.', failure: 'Build session interrupted. Code does not ship. Timeline slips.', confidence: 'HIGH', evidence: 'OBSERVED_REPEATEDLY', scope: 'Tuesday 8-10 PM.' },
    { id: 'C006', section: 'agent_roles_and_authority', order: 5, rule: 'Protocol Steward owns format spec, merge protocol, and architecture.', why: 'Protocol needs a dedicated guardian for consistency.', failure: 'Format quality drifts. Schema bloats.', confidence: 'MEDIUM', evidence: 'INFERENCE', scope: 'All OOS format decisions.' },
    { id: 'C007', section: 'agent_roles_and_authority', order: 6, rule: 'Market Intelligence owns competitive scanning and content drafting. Cannot send without approval.', why: 'Market awareness must be continuous. External comms must be approved.', failure: 'Competitive threats go undetected, or wrong messages reach prospects.', confidence: 'MEDIUM', evidence: 'INFERENCE', scope: 'All market intelligence.' },
    { id: 'C008', section: 'agent_roles_and_authority', order: 7, rule: 'Revenue Analyst activates only when revenue exists (Phase 3).', why: 'Nothing to track until revenue exists.', failure: 'Premature activation produces meaningless reports.', confidence: 'MEDIUM', evidence: 'HUMAN_DEFINED_RULE', scope: 'Phase 3 activation only.' },
    { id: 'C009', section: 'coordination_patterns', order: 8, rule: 'Agents coordinate via INFORM and CHALLENGE messages. No ad-hoc coordination.', why: 'Structured messaging creates auditable coordination.', failure: 'Undocumented side channels. Coordination failures are invisible.', confidence: 'MEDIUM', evidence: 'INFERENCE', scope: 'All inter-agent coordination.' },
    { id: 'C010', section: 'coordination_patterns', order: 9, rule: 'Spec changes trigger INFORM to Market Intelligence for positioning update.', why: 'Spec changes affect market positioning.', failure: 'Marketing claims diverge from product reality.', confidence: 'MEDIUM', evidence: 'INFERENCE', scope: 'Every spec change.' },
    { id: 'C011', section: 'coordination_patterns', order: 10, rule: 'Competitive threats trigger INFORM to Protocol Steward for format evaluation.', why: 'Competitive moves may require protocol evolution.', failure: 'Protocol falls behind market needs.', confidence: 'MEDIUM', evidence: 'INFERENCE', scope: 'Competitive intelligence with protocol implications.' },
    { id: 'C012', section: 'coordination_patterns', order: 11, rule: 'Unresolved CHALLENGE messages escalate to founder within 24 hours.', why: 'Stalled disagreements block progress.', failure: 'Two agents disagree. Neither yields. Question hangs for a week.', confidence: 'MEDIUM', evidence: 'HUMAN_DEFINED_RULE', scope: 'All CHALLENGE messages.' },
    { id: 'C013', section: 'operational_heuristics', order: 12, rule: 'If founder has fewer than 3 OTP hours in a week, defer all non-build work.', why: 'Low-availability weeks must protect build above everything.', failure: 'Low-availability week spent on outreach delays timeline by 2 weeks.', confidence: 'MEDIUM', evidence: 'OBSERVED_ONCE', scope: 'Weeks below 3 hours.' },
    { id: 'C014', section: 'failure_patterns', order: 13, rule: 'All three agents activated from day one. Only Protocol Steward had meaningful work. Others generated noise.', why: 'Agents without data produce low-value output.', failure: 'Founder reads noise. Loses trust. Stops reading agent outputs.', confidence: 'MEDIUM', evidence: 'OBSERVED_ONCE', scope: 'All planned agents.' },
    { id: 'C015', section: 'failure_patterns', order: 14, rule: 'Daily agent review consumed build time. Weekly batching loses nothing.', why: 'Daily reviews felt productive but were not.', failure: '20-35% of OTP time spent on review instead of building.', confidence: 'LOW', evidence: 'SPECULATION', scope: 'Pre-launch phase.' },
    { id: 'C016', section: 'failure_patterns', order: 15, rule: 'Designed 14-agent architecture before shipping code. Only 3 needed now. Planning addiction.', why: 'Designing agents is enjoyable. Building platform is hard.', failure: '170 vault files. Zero production code.', confidence: 'LOW', evidence: 'MEASURED_RESULT', scope: 'Pre-launch phase.' },
    { id: 'C017', section: 'human_ai_boundary_conditions', order: 16, rule: 'Founder has unlimited override authority over all agents.', why: 'A human must always be able to stop any AI action.', failure: 'Agent publishes unapproved spec change. No way to reverse.', confidence: 'HIGH', evidence: 'HUMAN_DEFINED_RULE', scope: 'All agents. Non-negotiable.' },
    { id: 'C018', section: 'human_ai_boundary_conditions', order: 17, rule: 'IP strategist has kill authority on the entire venture.', why: 'External kill authority prevents sunk-cost fallacy.', failure: 'Market thesis invalidated but founder keeps building.', confidence: 'LOW', evidence: 'SPECULATION', scope: 'Venture-level decision.' },
  ];

  for (const claim of claimsData) {
    await client.query(`
      INSERT INTO claims (oos_file_id, claim_id, section, display_order, rule, why, failure_mode, confidence, evidence, scope)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [oosId, claim.id, claim.section, claim.order, claim.rule, claim.why, claim.failure, claim.confidence, claim.evidence, claim.scope]);
  }
  console.log(`   Seeded ${claimsData.length} claims`);

  // Create example org #2 (Acme Digital Agency)
  const org2Result = await client.query(`
    INSERT INTO organizations (name, industry, size, clerk_org_id, badge, quality_tier)
    VALUES ('Acme Digital Agency', 'digital_marketing_agency', 'small', 'acme-001', 'founding', 'gold')
    RETURNING id
  `);
  const org2Id = org2Result.rows[0].id;

  const exampleContent = fs.readFileSync(
    path.join(__dirname, '..', 'src', 'protocol', 'example.oos.md'),
    'utf8'
  );

  const oos2Result = await client.query(`
    INSERT INTO oos_files (org_id, template, version, status, visibility_default, word_count, claim_count, raw_content, frontmatter, confidence_distribution, evidence_distribution, published_at)
    VALUES ($1, 'agent_army', 1, 'published', 'free', 2100, 14, $2, $3, $4, $5, NOW())
    RETURNING id
  `, [
    org2Id,
    exampleContent,
    JSON.stringify({ oos_version: '1.0', org_pseudonym: 'Acme Digital Agency', industry: 'digital_marketing_agency', template: 'agent_army', agent_count: 8 }),
    JSON.stringify({ high: 5, medium: 6, low: 3 }),
    JSON.stringify({ human_defined_rule: 3, observed_once: 2, observed_repeatedly: 4, measured_result: 3, inference: 1, speculation: 1 }),
  ]);
  const oos2Id = oos2Result.rows[0].id;

  // Seed Acme's 14 claims (abbreviated)
  const acmeClaims = [
    { id: 'C001', section: 'core_operating_rules', rule: 'Every agent writes to a shared state file. No agent reads data sources directly.', why: 'Race conditions from direct access.', failure: 'Two agents get different results from same source.', confidence: 'HIGH', evidence: 'MEASURED_RESULT' },
    { id: 'C002', section: 'core_operating_rules', rule: 'Only one agent has authority to send external communications.', why: 'Multiple senders create duplicate client emails.', failure: 'Client receives contradictory information.', confidence: 'HIGH', evidence: 'OBSERVED_REPEATEDLY' },
    { id: 'C003', section: 'core_operating_rules', rule: 'Analytics agent reports patterns but never recommends actions.', why: 'Recommendations without client context were ignored.', failure: 'Agent recommends budget increase for cash-strapped client.', confidence: 'HIGH', evidence: 'OBSERVED_REPEATEDLY' },
    { id: 'C004', section: 'core_operating_rules', rule: 'Retention agent overrides sales agent when client is at risk.', why: 'Expansion to at-risk client accelerates churn.', failure: 'Upsell to declining client. Client cancels.', confidence: 'HIGH', evidence: 'OBSERVED_ONCE' },
    { id: 'C005', section: 'core_operating_rules', rule: 'All agent output logged to audit trail before action.', why: 'Without logs, debugging takes hours.', failure: 'Error with no trace. Team guesses.', confidence: 'HIGH', evidence: 'MEASURED_RESULT' },
    { id: 'C006', section: 'agent_roles_and_authority', rule: 'Each agent has written role statement and authorized actions.', why: 'Without boundaries, agents overlap.', failure: 'Two agents update same project status.', confidence: 'MEDIUM', evidence: 'OBSERVED_REPEATEDLY' },
    { id: 'C007', section: 'agent_roles_and_authority', rule: 'No agent modifies another agents shared state file.', why: 'Single-writer prevents data races.', failure: 'Two agents write to same file. One overwrites other.', confidence: 'HIGH', evidence: 'MEASURED_RESULT' },
    { id: 'C008', section: 'coordination_patterns', rule: 'Agents coordinate through shared state files, not direct messaging.', why: 'Direct messaging creates hidden dependencies.', failure: 'Unlogged message causes invisible failure.', confidence: 'MEDIUM', evidence: 'INFERENCE' },
    { id: 'C009', section: 'coordination_patterns', rule: 'Cross-agent workflows use pub-sub through shared state.', why: 'Pub-sub decouples agents.', failure: 'Tightly coupled agents cascade failures.', confidence: 'MEDIUM', evidence: 'OBSERVED_REPEATEDLY' },
    { id: 'C010', section: 'operational_heuristics', rule: 'Unresolvable errors: log and stop. No automatic retry.', why: 'Retries on unresolvable errors create noise.', failure: 'Agent retries 100 times, consumes rate limits.', confidence: 'MEDIUM', evidence: 'OBSERVED_ONCE' },
    { id: 'C011', section: 'failure_patterns', rule: 'Gave analytics agent write access to campaigns. It optimized for wrong metrics.', why: 'Lacked client context.', failure: 'Decreased spend on strategic brand campaign.', confidence: 'HIGH', evidence: 'OBSERVED_ONCE' },
    { id: 'C012', section: 'failure_patterns', rule: 'Single shared state file became bottleneck and corruption source.', why: 'Concurrent writes caused data races.', failure: 'Two agents update simultaneously. One update lost.', confidence: 'HIGH', evidence: 'MEASURED_RESULT' },
    { id: 'C013', section: 'human_ai_boundary_conditions', rule: 'All external communications require human approval.', why: 'AI comms can be wrong.', failure: 'Email with incorrect numbers. Client loses trust.', confidence: 'HIGH', evidence: 'HUMAN_DEFINED_RULE' },
    { id: 'C014', section: 'human_ai_boundary_conditions', rule: 'Pricing and financial commitments require human decision.', why: 'Legal and relationship implications.', failure: 'Agent applies discount violating margin floors.', confidence: 'LOW', evidence: 'SPECULATION' },
  ];

  for (let i = 0; i < acmeClaims.length; i++) {
    const c = acmeClaims[i];
    await client.query(`
      INSERT INTO claims (oos_file_id, claim_id, section, display_order, rule, why, failure_mode, confidence, evidence, scope)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Organization-wide')
    `, [oos2Id, c.id, c.section, i, c.rule, c.why, c.failure, c.confidence, c.evidence]);
  }
  console.log(`   Seeded Acme Agency with ${acmeClaims.length} claims`);

  // Create audit log entries
  await client.query(`INSERT INTO audit_logs (org_id, actor_type, action, entity_type, entity_id, details) VALUES ($1, 'system', 'oos.published', 'oos_file', $2, '{"seeded": true}')`, [orgId, oosId]);
  await client.query(`INSERT INTO audit_logs (org_id, actor_type, action, entity_type, entity_id, details) VALUES ($1, 'system', 'oos.published', 'oos_file', $2, '{"seeded": true}')`, [org2Id, oos2Id]);
  console.log('   Audit logs created');

  console.log(`\n   Seed complete: 2 orgs, 2 OOS files, 32 claims`);
}

run().catch(err => {
  console.error('Database initialization failed:', err);
  process.exit(1);
});
