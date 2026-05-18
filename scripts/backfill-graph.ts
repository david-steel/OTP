// scripts/backfill-graph.ts
//
// Backfills graph_nodes / graph_edges for published OOS files that have none,
// then refreshes the coordination_patterns materialized view.
//
// Why this exists: get_patterns reads the coordination_patterns matview, which
// rolls up graph_nodes/graph_edges. Seed and template OOS were bulk-inserted
// straight into oos_files and never went through the publish route that builds
// the graph, so their graph rows were missing. This script builds them using
// the same extractGraph() the publish route uses, then refreshes the matview.
//
// Idempotent: skips OOS that already have graph rows. Use --force to rebuild all.
//
// Usage (local):  node --env-file=.env --import tsx scripts/backfill-graph.ts
//        (prod):  railway run --service otp-platform node --import tsx scripts/backfill-graph.ts

import { Pool } from 'pg';
import { extractGraph } from '../src/graph/graph-extractor.js';

const FORCE = process.argv.includes('--force');

async function run() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const pool = new Pool({ connectionString });
  const client = await pool.connect();

  let built = 0;
  let skipped = 0;
  let failed = 0;
  let nodesTotal = 0;
  let edgesTotal = 0;

  try {
    const { rows: files } = await client.query(`
      SELECT f.id, f.org_id, f.frontmatter,
             o.name AS org_name, o.pseudonym AS org_pseudonym
      FROM oos_files f
      JOIN organizations o ON f.org_id = o.id
      WHERE f.status = 'published'
      ORDER BY f.published_at
    `);
    console.log(`Found ${files.length} published OOS files. force=${FORCE}`);

    for (const f of files) {
      const has = await client.query(
        `SELECT 1 FROM graph_nodes WHERE oos_file_id = $1 LIMIT 1`,
        [f.id],
      );
      if (has.rowCount && !FORCE) {
        skipped++;
        continue;
      }

      const { rows: claimRows } = await client.query(
        `SELECT claim_id, section, rule, why, confidence, evidence
         FROM claims WHERE oos_file_id = $1`,
        [f.id],
      );

      const entities = (f.frontmatter && f.frontmatter.entities) || null;
      const graph = extractGraph(
        f.id,
        f.org_id,
        entities,
        claimRows.map((c: any) => ({
          claim_id: c.claim_id,
          section: c.section,
          rule: c.rule,
          why: c.why,
          confidence: c.confidence,
          evidence: c.evidence,
        })),
        f.org_pseudonym || f.org_name,
      );

      const label = f.org_pseudonym || f.org_name;
      await client.query('BEGIN');
      try {
        // Delete-then-insert so --force rebuilds cleanly and partial runs are safe.
        await client.query(`DELETE FROM graph_edges WHERE oos_file_id = $1`, [f.id]);
        await client.query(`DELETE FROM graph_nodes WHERE oos_file_id = $1`, [f.id]);

        // external_id -> uuid, resolved the same way the publish route does.
        const idMap = new Map<string, string>();
        for (const node of graph.nodes) {
          const props: any = node.properties || {};
          const externalId =
            node.type === 'organization'
              ? 'ORG'
              : node.type === 'knowledge_claim'
                ? props.claimId || 'UNKNOWN'
                : props.externalId || 'UNKNOWN';
          const ins = await client.query(
            `INSERT INTO graph_nodes (external_id, type, label, properties, oos_file_id, org_id)
             VALUES ($1, $2::graph_node_type, $3, $4::jsonb, $5, $6)
             RETURNING id`,
            [externalId, node.type, node.label, JSON.stringify(node.properties), node.oosFileId, node.orgId],
          );
          const newId = ins.rows[0]?.id;
          if (newId) idMap.set(externalId, newId);
        }

        let edgesInserted = 0;
        for (const edge of graph.edges) {
          const sourceUuid = idMap.get(edge.sourceId);
          const targetUuid = idMap.get(edge.targetId);
          if (!sourceUuid || !targetUuid) continue;
          await client.query(
            `INSERT INTO graph_edges (source_id, target_id, type, properties, oos_file_id, weight)
             VALUES ($1, $2, $3::graph_edge_type, $4::jsonb, $5, $6)`,
            [sourceUuid, targetUuid, edge.type, JSON.stringify(edge.properties), f.id, edge.weight],
          );
          edgesInserted++;
        }

        await client.query('COMMIT');
        built++;
        nodesTotal += graph.nodes.length;
        edgesTotal += edgesInserted;
        console.log(`  built ${label} (${f.id}): ${graph.nodes.length} nodes, ${edgesInserted} edges`);
      } catch (e) {
        await client.query('ROLLBACK');
        failed++;
        console.error(`  FAILED ${label} (${f.id}):`, (e as Error).message);
      }
    }

    console.log(`\nBackfill complete: built ${built}, skipped ${skipped}, failed ${failed}.`);
    console.log(`Inserted ${nodesTotal} nodes, ${edgesTotal} edges total.`);

    console.log('Refreshing coordination_patterns materialized view...');
    await client.query(`REFRESH MATERIALIZED VIEW coordination_patterns`);
    const pat = await client.query(`SELECT count(*)::int AS n FROM coordination_patterns`);
    console.log(`OK: coordination_patterns now has ${pat.rows[0].n} rows.`);
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});
