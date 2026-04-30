// scripts/list-sneeze-it-entities.ts
// Quick inspection: prints every entity (agent + human) in Sneeze It's team
// graph with externalId + name + type.

import { db } from '../src/config/database.js';
import { organizations } from '../src/db/schema.js';
import { eq } from 'drizzle-orm';
import { getOrgTeamGraph } from '../src/services/team-graph.js';

async function run() {
  const all = await db.select().from(organizations);
  const sneezeMatches = all.filter(o => /sneeze/i.test(o.name || ''));
  console.log(`Found ${sneezeMatches.length} Sneeze-matching orgs:`);
  for (const o of sneezeMatches) console.log(`  - ${o.name} (${o.id})`);
  console.log('---');

  // Prefer exact 'Sneeze It', else first match
  const sneezeIt = sneezeMatches.find(o => o.name === 'Sneeze It') || sneezeMatches[0];
  if (!sneezeIt) throw new Error('Sneeze It org not found');
  console.log(`Using: ${sneezeIt.name} (${sneezeIt.id})`);

  const team = await getOrgTeamGraph(sneezeIt.id, sneezeIt.name || 'Sneeze It');
  console.log(`${team.nodes.length} entities`);
  console.log('---');
  team.nodes
    .sort((a, b) => (a.type === b.type ? a.externalId.localeCompare(b.externalId) : a.type.localeCompare(b.type)))
    .forEach(n => {
      console.log(`${n.type.padEnd(6)} ${n.externalId.padEnd(40)} ${n.label}`);
    });
}

run().catch(e => { console.error(e); process.exit(1); });
