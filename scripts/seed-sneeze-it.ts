import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const client = await pool.connect();
  try {
    const existing = await client.query("SELECT id FROM organizations WHERE name = 'Sneeze It Digital Agency'");
    if (existing.rows.length > 0) {
      console.log('Sneeze It already exists, skipping');
      return;
    }

    const orgRes = await client.query(`
      INSERT INTO organizations (name, industry, size, clerk_org_id, badge, quality_tier)
      VALUES ('Sneeze It Digital Agency', 'digital_marketing_agency', 'small', 'sneeze-it-001', 'founding', 'platinum')
      RETURNING id
    `);
    const orgId = orgRes.rows[0].id;
    console.log('Created org:', orgId);

    const content = fs.readFileSync(path.join(__dirname, '..', 'src', 'protocol', 'sneeze-it.oos.md'), 'utf8');

    const oosRes = await client.query(`
      INSERT INTO oos_files (org_id, template, version, status, visibility_default, word_count, claim_count, raw_content, frontmatter, confidence_distribution, evidence_distribution, published_at)
      VALUES ($1, 'agent_army', 1, 'published', 'free', 2890, 24, $2, $3, $4, $5, NOW())
      RETURNING id
    `, [
      orgId, content,
      JSON.stringify({ oos_version: '1.0', org_pseudonym: 'Sneeze It Digital Agency', industry: 'digital_marketing_agency', template: 'agent_army', agent_count: 14, platforms: ['claude'] }),
      JSON.stringify({ high: 10, medium: 10, low: 4 }),
      JSON.stringify({ human_defined_rule: 5, observed_once: 2, observed_repeatedly: 9, measured_result: 5, inference: 2, speculation: 1 })
    ]);
    const oosId = oosRes.rows[0].id;
    console.log('Created OOS:', oosId);

    const claims: [string,string,number,string,string,string,string,string][] = [
      ['C001','core_operating_rules',0,'One seat, one owner. No agent shares responsibility with another agent.','Shared responsibilities create blame diffusion and tuning conflicts.','Two agents both handle client performance. Tuning one breaks the other.','HIGH','OBSERVED_REPEATEDLY'],
      ['C002','core_operating_rules',1,'Every agent writes to its own shared state file. No agent reads data sources directly.','Pre-computed shared state decouples scan timing from compile timing.','Orchestrator silently re-queries sources. Cannot tell what version of reality it saw.','HIGH','OBSERVED_REPEATEDLY'],
      ['C003','core_operating_rules',2,'All external communications require founder approval before sending.','Reputational damage from bad messages is hard to reverse.','Agent sends email with incorrect performance numbers. Client loses trust.','HIGH','HUMAN_DEFINED_RULE'],
      ['C004','core_operating_rules',3,'File-based state is authoritative over AI memory.','AI memory drifts. Files do not.','Agent acts on stale memory instead of canonical file. Wrong decisions.','HIGH','OBSERVED_REPEATEDLY'],
      ['C005','core_operating_rules',4,'Performance Analyst reports patterns but never recommends actions.','Recommendations without client context were ignored.','Analyst recommends budget increase for cash-strapped client.','HIGH','OBSERVED_REPEATEDLY'],
      ['C006','core_operating_rules',5,'Retention agent overrides Sales agent when client is at risk.','Sales expansion to at-risk client accelerates churn.','Sales proposes upsell to declining client. Client cancels.','HIGH','OBSERVED_REPEATEDLY'],
      ['C007','core_operating_rules',6,'Only one agent (EA) has authority to send external communications.','Multiple senders create duplicate and inconsistent messages.','Sales and Retention both email same client with contradictory messages.','HIGH','OBSERVED_REPEATEDLY'],
      ['C008','agent_roles_and_authority',7,'Each agent has documented role, ownership, and explicit non-ownership boundaries.','Without boundaries, agents drift into overlapping responsibilities.','Two agents both track project status with conflicting updates.','HIGH','OBSERVED_REPEATEDLY'],
      ['C009','agent_roles_and_authority',8,'AI Call Center Manager manages 3 humans via daily data-driven Slack coaching.','Data-driven daily coaching was not possible with a human manager at this scale.','If messages sound generic, human employees disengage within 3 days.','HIGH','MEASURED_RESULT'],
      ['C010','agent_roles_and_authority',9,'Evaluator agent scores maturity. Learning agent implements. Evaluator re-scores.','Self-improvement requires separated diagnosis and action.','Evaluator diagnoses correctly but implementer fails. Score stagnates.','MEDIUM','OBSERVED_REPEATEDLY'],
      ['C011','coordination_patterns',10,'17 overnight agents pre-compute data. Morning briefing reads cached results.','Eliminates 30+ min serial latency during founders most valuable hours.','Founder starts the day waiting for scans instead of acting.','HIGH','MEASURED_RESULT'],
      ['C012','coordination_patterns',11,'Agents coordinate via structured message bus with 5 message types and 3-exchange limit.','Structured messaging makes coordination visible and bounded.','Without structure, agents coordinate through undocumented side channels.','MEDIUM','OBSERVED_ONCE'],
      ['C013','coordination_patterns',12,'Critical alerts auto-escalate: founder, then COO after 48h, then Strategic agent.','Unanswered critical alerts create financial risk.','Agent detects +139% overspend. Alert unanswered 16 days. Client overspends $1,348.','MEDIUM','MEASURED_RESULT'],
      ['C014','coordination_patterns',13,'Morning briefing compiles 10 parallel scanners into one unified document.','10 data sources cannot be queried sequentially in under 5 minutes.','One scanner failure blocks entire briefing without fault-tolerant architecture.','HIGH','MEASURED_RESULT'],
      ['C015','operational_heuristics',14,'If data is stale, flag it visibly. Never silently present old info as current.','Stale data presented as current causes wrong decisions.','Briefing shows yesterdays spend as todays. Wrong budget decisions.','HIGH','OBSERVED_REPEATEDLY'],
      ['C016','operational_heuristics',15,'If 3+ tasks from one person are overdue, flag as capacity pattern.','Individual overdue = forgotten. Pattern = overwhelmed.','Manager assumes laziness. Actual problem is capacity. Problem worsens.','MEDIUM','OBSERVED_REPEATEDLY'],
      ['C017','failure_patterns',16,'Gave analyst write access to campaigns. Optimized for wrong metrics.','Lacked client context. Technically correct, strategically wrong.','Decreased spend on clients strategic brand campaign. Client frustrated.','HIGH','OBSERVED_ONCE'],
      ['C018','failure_patterns',17,'Single shared state file caused 12 corruption events in month one.','Concurrent writes from multiple agents created data races.','Two agents wrote simultaneously. One update lost. Manual cleanup required.','HIGH','MEASURED_RESULT'],
      ['C019','failure_patterns',18,'Built message bus without embedding triggers in workflows. Zero transactions.','Protocol described communication. No workflow included steps to use it.','13 inbox files deployed. All empty. Dead infrastructure.','HIGH','MEASURED_RESULT'],
      ['C020','failure_patterns',19,'Agent reported escalation overdue for 17 days without executing it.','Spec treated as documentation, not executable logic.','Critical overspend detected. Escalation specified. Never executed. 17 days.','HIGH','MEASURED_RESULT'],
      ['C021','failure_patterns',20,'Negative constraints improve AI message quality. Structural requirements degrade it.','Telling AI what NOT to do produces natural variation.','Added example messages: quality dropped 8.4 to 8.2. Added ban rules: quality rose to 8.8.','MEDIUM','MEASURED_RESULT'],
      ['C022','human_ai_boundary_conditions',21,'All external comms, pricing, contracts, hiring, firing are founder-only.','Legal, financial, and relationship consequences AI cannot fully assess.','Agent agrees to terms violating margin floors. Agent sends wrong positioning.','HIGH','HUMAN_DEFINED_RULE'],
      ['C023','human_ai_boundary_conditions',22,'Emotional and relational domains remain human.','AI cannot substitute for human connection, empathy, or presence.','AI-managed employee feels managed by a system. Engagement drops.','MEDIUM','INFERENCE'],
      ['C024','human_ai_boundary_conditions',23,'AI writing must not sound like AI. No em dashes, no filler, no hedging.','AI-sounding writing destroys trust with clients, team, and prospects.','Coaching message with ChatGPT patterns. Employee realizes manager is AI.','MEDIUM','OBSERVED_REPEATEDLY'],
    ];

    for (const c of claims) {
      await client.query(
        'INSERT INTO claims (oos_file_id, claim_id, section, display_order, rule, why, failure_mode, confidence, evidence, scope) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',
        [oosId, c[0], c[1], c[2], c[3], c[4], c[5], c[6], c[7], 'Organization-wide']
      );
    }
    console.log('Seeded', claims.length, 'claims');

    await client.query(
      "INSERT INTO audit_logs (org_id, actor_type, action, entity_type, entity_id, details) VALUES ($1, 'system', 'oos.published', 'oos_file', $2, '{\"seeded\": true, \"source\": \"cataclysm_backup\"}')",
      [orgId, oosId]
    );

    console.log('Sneeze It OOS published as Publisher #3');
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(err => { console.error(err); process.exit(1); });
