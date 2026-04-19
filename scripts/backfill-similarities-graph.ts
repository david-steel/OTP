/**
 * Backfills similarity computation and graph extraction for all published OOS files
 * that are missing similarities or graph data.
 *
 * Usage: DATABASE_URL="..." npx tsx scripts/backfill-similarities-graph.ts
 */

import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq, sql, and } from 'drizzle-orm';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

// Import platform services
const { computeAllSimilarities } = await import('../src/services/similarity.js');
const { extractGraph } = await import('../src/graph/graph-extractor.js');
const { claims, claimSimilarities, oosFiles, organizations } = await import('../src/db/schema.js');

async function run() {
  // Get all published OOS files
  const publishedOos = await db.select({
    id: oosFiles.id,
    orgId: oosFiles.orgId,
    template: oosFiles.template,
    frontmatter: oosFiles.frontmatter,
  }).from(oosFiles).where(eq(oosFiles.status, 'published'));

  console.log(`Found ${publishedOos.length} published OOS files`);

  // Get all claims grouped by OOS file
  const allClaims = await db.select().from(claims);
  const claimsByOos = new Map<string, typeof allClaims>();
  for (const c of allClaims) {
    if (!claimsByOos.has(c.oosFileId)) claimsByOos.set(c.oosFileId, []);
    claimsByOos.get(c.oosFileId)!.push(c);
  }

  // Get all orgs
  const allOrgs = await db.select().from(organizations);
  const orgMap = new Map(allOrgs.map(o => [o.id, o]));

  let simTotal = 0;
  let graphNodesTotal = 0;
  let graphEdgesTotal = 0;

  for (const oos of publishedOos) {
    const oosClaims = claimsByOos.get(oos.id) || [];
    if (oosClaims.length === 0) {
      console.log(`SKIP: ${oos.id} -- no claims`);
      continue;
    }

    const org = orgMap.get(oos.orgId);
    if (!org) {
      console.log(`SKIP: ${oos.id} -- org not found`);
      continue;
    }

    // --- Similarity computation ---
    // Check if similarities already exist for this OOS
    const existingSims = await db.select({ count: sql<number>`count(*)` })
      .from(claimSimilarities)
      .where(sql`${claimSimilarities.oosAId} = ${oos.id} OR ${claimSimilarities.oosBId} = ${oos.id}`);

    const simCount = Number(existingSims[0]?.count || 0);

    if (simCount === 0) {
      // Compute similarities
      const newClaims = oosClaims.map(c => ({
        dbId: c.id,
        claimId: c.claimId,
        section: c.section,
        displayOrder: c.displayOrder,
        rule: c.rule,
        why: c.why,
        failureMode: c.failureMode,
        confidence: c.confidence as any,
        evidence: c.evidence as any,
        scope: c.scope,
      }));

      const otherClaims = allClaims
        .filter(c => c.oosFileId !== oos.id)
        .map(c => ({
          dbId: c.id,
          oosFileId: c.oosFileId,
          claimId: c.claimId,
          section: c.section,
          displayOrder: c.displayOrder,
          rule: c.rule,
          why: c.why,
          failureMode: c.failureMode,
          confidence: c.confidence as any,
          evidence: c.evidence as any,
          scope: c.scope,
        }));

      const simPairs = computeAllSimilarities(newClaims, oos.id, otherClaims);

      if (simPairs.length > 0) {
        // Batch insert in chunks of 500 to avoid parameter limit
        const BATCH_SIZE = 500;
        for (let i = 0; i < simPairs.length; i += BATCH_SIZE) {
          const batch = simPairs.slice(i, i + BATCH_SIZE);
          await db.insert(claimSimilarities).values(
            batch.map((p: any) => ({
              claimAId: p.claimAId,
              claimBId: p.claimBId,
              oosAId: p.oosAId,
              oosBId: p.oosBId,
              similarityScore: p.score,
              classification: p.classification,
              sectionMatch: p.sectionMatch,
            }))
          );
        }
        simTotal += simPairs.length;
        console.log(`SIM: ${org.name} -- ${simPairs.length} pairs`);
      } else {
        console.log(`SIM: ${org.name} -- 0 pairs (no matches)`);
      }
    } else {
      console.log(`SIM: ${org.name} -- already has ${simCount} pairs, skipping`);
    }

    // --- Graph extraction ---
    // Check if graph nodes exist for this OOS
    const existingNodes = await db.execute(
      sql`SELECT count(*) as c FROM graph_nodes WHERE oos_file_id = ${oos.id}`
    );
    const nodeCount = Number((existingNodes.rows as any[])[0]?.c || 0);

    if (nodeCount === 0) {
      const entities = (oos.frontmatter as any)?.entities || null;
      const graphData = extractGraph(oos.id, oos.orgId, entities, oosClaims.map(c => ({
        claim_id: c.claimId,
        section: c.section,
        rule: c.rule,
        why: c.why,
        confidence: c.confidence,
        evidence: c.evidence,
      })), org.pseudonym || org.name);

      // Insert graph nodes
      const externalIdToUuid = new Map<string, string>();
      for (const node of graphData.nodes) {
        let externalId: string;
        if (node.type === 'organization') {
          externalId = 'ORG';
        } else if (node.type === 'knowledge_claim') {
          externalId = (node.properties as any).claimId || 'UNKNOWN';
        } else {
          externalId = ((node.properties as any).externalId || 'UNKNOWN') as string;
        }

        const insertResult = await db.execute(sql`
          INSERT INTO graph_nodes (external_id, type, label, properties, oos_file_id, org_id)
          VALUES (${externalId}, ${node.type}::graph_node_type, ${node.label}, ${JSON.stringify(node.properties)}::jsonb, ${node.oosFileId}, ${node.orgId})
          RETURNING id
        `);
        const insertedId = (insertResult.rows as any[])[0]?.id;
        if (insertedId) {
          externalIdToUuid.set(externalId, insertedId);
        }
      }

      // Insert graph edges
      let edgeCount = 0;
      for (const edge of graphData.edges) {
        const sourceUuid = externalIdToUuid.get(edge.sourceId);
        const targetUuid = externalIdToUuid.get(edge.targetId);
        if (!sourceUuid || !targetUuid) continue;

        await db.execute(sql`
          INSERT INTO graph_edges (source_id, target_id, type, properties, oos_file_id, weight)
          VALUES (${sourceUuid}, ${targetUuid}, ${edge.type}::graph_edge_type, ${JSON.stringify(edge.properties)}::jsonb, ${oos.id}, ${edge.weight})
        `);
        edgeCount++;
      }

      graphNodesTotal += graphData.nodes.length;
      graphEdgesTotal += edgeCount;
      console.log(`GRAPH: ${org.name} -- ${graphData.nodes.length} nodes, ${edgeCount} edges`);
    } else {
      console.log(`GRAPH: ${org.name} -- already has ${nodeCount} nodes, skipping`);
    }
  }

  console.log(`\nDone. Similarities: ${simTotal} pairs. Graph: ${graphNodesTotal} nodes, ${graphEdgesTotal} edges.`);

  await pool.end();
}

run().catch(err => { console.error(err); process.exit(1); });
