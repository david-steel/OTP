// Read-only diagnostic for the two publish-all failures (2026-06-10).
import { and, desc, eq, sql } from 'drizzle-orm';
import { db } from '../src/config/database.js';
import { kpis, oosFiles, claims } from '../src/db/schema.js';

const prefixes = ['34c442d0', 'bee3b10f'];
for (const p of prefixes) {
  const rows = await db.execute(sql`
    SELECT id, organization_id, title, owner_external_id, owner_entity_type,
           length(owner_external_id) AS owner_len,
           archived_at, deleted_at, is_published, claim_id, group_name, shared_group_id
    FROM kpis WHERE id::text LIKE ${p + '%'}`);
  for (const r of rows.rows as any[]) {
    console.log(`--- KPI ${p}: "${r.title}" ---`);
    console.log(`  owner=${r.owner_external_id} (len=${r.owner_len}, type=${r.owner_entity_type}) group=${r.group_name}`);
    console.log(`  archived_at=${r.archived_at} deleted_at=${r.deleted_at} is_published=${r.is_published} claim_id=${r.claim_id}`);
    const claimShort = 'k' + String(r.id).replace(/-/g, '').slice(0, 9);
    const [oos] = (await db.select({ id: oosFiles.id }).from(oosFiles)
      .where(and(eq(oosFiles.orgId, r.organization_id), eq(oosFiles.status, 'published')))
      .orderBy(desc(oosFiles.createdAt)).limit(1));
    console.log(`  published oosFile=${oos?.id ?? 'NONE'}; computed claimIdShort=${claimShort}`);
    if (oos) {
      const ex = await db.select({ id: claims.id, source: claims.source, section: claims.section })
        .from(claims).where(and(eq(claims.oosFileId, oos.id), eq(claims.claimId, claimShort)));
      console.log(`  existing claim in that file: ${JSON.stringify(ex)}`);
    }
  }
  if ((rows.rows as any[]).length === 0) console.log(`--- KPI ${p}: NOT FOUND in kpis table ---`);
}
process.exit(0);
