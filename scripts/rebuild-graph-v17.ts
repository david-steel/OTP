// scripts/rebuild-graph-v17.ts
// One-shot recovery for Sneeze It's published OOS v17 whose graph_nodes /
// graph_edges were left half-built when the original publish 500'd on the
// old varchar(20) overflow. Re-runs extractGraph + DELETE+INSERT inside a
// transaction so the rebuild is atomic.

import { db } from '../src/config/database.js';
import { organizations, oosFiles } from '../src/db/schema.js';
import { eq, and, desc, sql } from 'drizzle-orm';
import { parseOOS } from '../src/services/claim-parser.js';
import { extractGraph } from '../src/graph/graph-extractor.js';

async function run() {
  const all = await db.select().from(organizations);
  const org = all.find(o => o.name === 'Sneeze It');
  if (!org) throw new Error('Sneeze It not found');

  const [oos] = await db
    .select()
    .from(oosFiles)
    .where(and(eq(oosFiles.orgId, org.id), eq(oosFiles.status, 'published')))
    .orderBy(desc(oosFiles.version))
    .limit(1);
  if (!oos) throw new Error('No published OOS for Sneeze It');
  console.log(`Rebuilding graph for OOS ${oos.id} v${oos.version}`);

  const parsed = parseOOS(oos.rawContent, oos.template as any);
  const entities = (oos.frontmatter as any)?.entities || null;
  const graphData = extractGraph(oos.id, org.id, entities, parsed.claims.map(c => ({
    claim_id: c.claimId,
    section: c.section,
    rule: c.rule,
    why: c.why,
    confidence: c.confidence,
    evidence: c.evidence,
  })), org.pseudonym || org.name);

  console.log(`Computed: ${graphData.nodes.length} nodes, ${graphData.edges.length} edges`);

  const result = await db.transaction(async (tx) => {
    await tx.execute(sql`DELETE FROM graph_edges WHERE oos_file_id = ${oos.id}`);
    await tx.execute(sql`DELETE FROM graph_nodes WHERE oos_file_id = ${oos.id}`);

    const externalIdToUuid = new Map<string, string>();
    for (const node of graphData.nodes) {
      let externalId: string;
      if (node.type === 'organization') externalId = 'ORG';
      else if (node.type === 'knowledge_claim') externalId = (node.properties as any).claimId || 'UNKNOWN';
      else externalId = ((node.properties as any).externalId || 'UNKNOWN') as string;

      const insertResult = await tx.execute(sql`
        INSERT INTO graph_nodes (external_id, type, label, properties, oos_file_id, org_id)
        VALUES (${externalId}, ${node.type}::graph_node_type, ${node.label}, ${JSON.stringify(node.properties)}::jsonb, ${node.oosFileId}, ${node.orgId})
        RETURNING id
      `);
      const insertedId = (insertResult.rows as any[])[0]?.id;
      if (insertedId) externalIdToUuid.set(externalId, insertedId);
    }

    let edgesInserted = 0;
    for (const edge of graphData.edges) {
      const sourceUuid = externalIdToUuid.get(edge.sourceId);
      const targetUuid = externalIdToUuid.get(edge.targetId);
      if (!sourceUuid || !targetUuid) continue;
      await tx.execute(sql`
        INSERT INTO graph_edges (source_id, target_id, type, properties, oos_file_id, weight)
        VALUES (${sourceUuid}, ${targetUuid}, ${edge.type}::graph_edge_type, ${JSON.stringify(edge.properties)}::jsonb, ${oos.id}, ${edge.weight})
      `);
      edgesInserted += 1;
    }

    return { nodesInserted: externalIdToUuid.size, edgesInserted };
  });

  console.log(`Inserted: ${result.nodesInserted} nodes, ${result.edgesInserted} edges`);
  console.log('Done.');
}

run().catch(e => { console.error('Failed:', e); process.exit(1); });
