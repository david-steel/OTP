import { db } from '../src/config/database.js';
import { oosFiles, organizations } from '../src/db/schema.js';
import { eq } from 'drizzle-orm';
import { autoFixOOS } from '../src/services/auto-fixer.js';

async function debug() {
  const [oos] = await db.select({ rawContent: oosFiles.rawContent, frontmatter: oosFiles.frontmatter })
    .from(oosFiles).innerJoin(organizations, eq(oosFiles.orgId, organizations.id))
    .where(eq(organizations.name, 'Sneeze It Digital Agency')).limit(1);

  console.log('Has claude in raw:', oos.rawContent.toLowerCase().includes('claude'));
  console.log('Has Slack in raw:', oos.rawContent.includes('Slack'));
  console.log('Has google ads in raw:', oos.rawContent.toLowerCase().includes('google ads'));
  console.log('Has Meta in raw:', oos.rawContent.includes('Meta'));
  console.log();

  const result = autoFixOOS(oos.rawContent);
  const allFixes = result.fixes;
  console.log('All fixes (' + allFixes.length + '):');
  allFixes.forEach(f => console.log('  [' + f.code + '] ' + f.description));
  console.log();
  console.log('Result platforms:', (result.frontmatter as any)?.platforms);
  console.log('Result mcp_servers:', (result.frontmatter as any)?.mcp_servers);

  process.exit(0);
}
debug().catch(e => { console.error(e); process.exit(1); });
