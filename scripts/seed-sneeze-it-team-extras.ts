// scripts/seed-sneeze-it-team-extras.ts
// One-shot data seed: populates MCPs, authority_level, and maturity_level
// for the Sneeze It agent army on its OTP team chart. Idempotent — re-running
// just re-applies the same values. Patches always land on the latest draft.
//
// Usage:
//   railway run --service otp-platform npx tsx scripts/seed-sneeze-it-team-extras.ts [--dry-run]
//
// Notes:
// - Skips entities that aren't in the org's OOS (logs them).
// - Tries multiple externalId guesses per agent (RADAR / Radar / radar...).
// - Does NOT publish. After running, review at /dashboard/team and publish.

import { db } from '../src/config/database.js';
import { organizations } from '../src/db/schema.js';
import { eq } from 'drizzle-orm';
import { getOrgTeamGraph, patchTeamEntity, type EntityType, type EntityPatch } from '../src/services/team-graph.js';

interface AgentSeed {
  name: string;
  idGuesses: string[];
  type: EntityType;
  patch: Partial<EntityPatch>;
}

// Sneeze It Agent Army — values derived from the live CLAUDE.md spec.
// Authority: view-only | recommend | execute-with-approval | autonomous
// Maturity: 1-8 (Bassim's L1 Tab Complete -> L8 Autonomous Agent Teams)
const SEEDS: AgentSeed[] = [
  {
    name: 'Radar',
    idGuesses: ['AGT_RADAR'],
    type: 'agent',
    patch: {
      authority_level: 'recommend',
      maturity_level: 6,
      mcps: ['slack', 'google-calendar', 'google-drive', 'todoist', 'gmail', 'obsidian', 'fireflies', 'proposify'],
    },
  },
  {
    name: 'Dan',
    idGuesses: ['AGT_DAN'],
    type: 'agent',
    patch: {
      authority_level: 'recommend',
      maturity_level: 4,
      mcps: ['obsidian', 'todoist'],
    },
  },
  {
    name: 'Dash',
    idGuesses: ['AGT_DASH'],
    type: 'agent',
    patch: {
      authority_level: 'view-only',
      maturity_level: 5,
      mcps: ['google-sheets', 'google-workspace', 'meta-ads', 'google-ads', 'obsidian'],
    },
  },
  {
    name: 'Pepper',
    idGuesses: ['AGT_PEPPER'],
    type: 'agent',
    patch: {
      authority_level: 'recommend',
      maturity_level: 5,
      mcps: ['gmail', 'google-workspace', 'slack', 'todoist', 'obsidian'],
    },
  },
  {
    name: 'Crystal',
    idGuesses: ['AGT_CRYSTAL'],
    type: 'agent',
    patch: {
      authority_level: 'recommend',
      maturity_level: 4,
      mcps: ['accelo', 'obsidian'],
    },
  },
  {
    name: 'Dirk',
    idGuesses: ['AGT_DIRK'],
    type: 'agent',
    patch: {
      authority_level: 'autonomous',
      maturity_level: 7,
      mcps: ['ghl', 'gmail', 'leadmagic', 'obsidian'],
    },
  },
  {
    name: 'Emery',
    idGuesses: ['AGT_EMERY'],
    type: 'agent',
    patch: {
      authority_level: 'execute-with-approval',
      maturity_level: 7,
      mcps: ['ghl', 'calendly', 'sendgrid', 'twilio', 'deepgram', 'anthropic'],
    },
  },
  {
    name: 'Pulse',
    idGuesses: ['AGT_PULSE'],
    type: 'agent',
    patch: {
      authority_level: 'recommend',
      maturity_level: 5,
      mcps: ['ghl', 'accelo', 'gmail', 'obsidian'],
    },
  },
  {
    name: 'Neil',
    idGuesses: ['AGT_NEIL'],
    type: 'agent',
    patch: {
      authority_level: 'execute-with-approval',
      maturity_level: 8,
      mcps: ['github', 'web-search', 'obsidian'],
    },
  },
  {
    name: 'Arin Darcan',
    idGuesses: ['AGT_ARINDARCAN'],
    type: 'agent',
    patch: {
      authority_level: 'recommend',
      maturity_level: 5,
      mcps: ['google-sheets', 'slack-david', 'obsidian'],
    },
  },
  {
    name: 'Bassim',
    idGuesses: ['AGT_BASSIM'],
    type: 'agent',
    patch: {
      authority_level: 'view-only',
      maturity_level: 6,
      mcps: ['obsidian'],
    },
  },
  {
    name: 'Steve',
    idGuesses: ['AGT_STEVE'],
    type: 'agent',
    patch: {
      authority_level: 'view-only',
      maturity_level: 5,
      mcps: ['mirofish'],
    },
  },
];

async function findSneezeItOrg() {
  // Try by name first; fall back to clerk org id env var if name lookup fails.
  const candidates = await db.select().from(organizations).where(eq(organizations.name, 'Sneeze It'));
  if (candidates.length === 1) return candidates[0];

  // Loose match: name contains 'Sneeze'
  const all = await db.select().from(organizations);
  const loose = all.filter(o => /sneeze/i.test(o.name || ''));
  if (loose.length === 1) return loose[0];

  throw new Error(
    `Could not uniquely identify Sneeze It org. Found ${candidates.length} exact match, ${loose.length} loose match. ` +
    `Available orgs: ${all.map(o => o.name).join(', ')}`,
  );
}

async function run() {
  const dryRun = process.argv.includes('--dry-run');
  console.log(`[seed] mode=${dryRun ? 'DRY RUN' : 'WRITE'}`);

  const org = await findSneezeItOrg();
  console.log(`[seed] org: ${org.name} (${org.id})`);

  const team = await getOrgTeamGraph(org.id, org.name || 'Sneeze It');
  const existingIds = new Set(team.nodes.map(n => n.externalId));
  console.log(`[seed] team has ${team.nodes.length} entities currently`);

  let patched = 0;
  let skippedNotFound = 0;
  let skippedDryRun = 0;
  const failures: Array<{ name: string; error: string }> = [];

  for (const seed of SEEDS) {
    const matchedId = seed.idGuesses.find(id => existingIds.has(id));
    if (!matchedId) {
      console.log(`[seed] SKIP  ${seed.name.padEnd(20)} (none of ${seed.idGuesses.join(', ')} in team graph)`);
      skippedNotFound += 1;
      continue;
    }
    if (dryRun) {
      console.log(`[seed] DRY   ${seed.name.padEnd(20)} -> ${matchedId} would patch ${JSON.stringify(seed.patch)}`);
      skippedDryRun += 1;
      continue;
    }
    try {
      await patchTeamEntity(org.id, seed.type, matchedId, seed.patch);
      console.log(`[seed] OK    ${seed.name.padEnd(20)} -> ${matchedId} authority=${seed.patch.authority_level} maturity=L${seed.patch.maturity_level} mcps=${seed.patch.mcps?.length || 0}`);
      patched += 1;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.log(`[seed] FAIL  ${seed.name.padEnd(20)} -> ${matchedId} ${msg}`);
      failures.push({ name: seed.name, error: msg });
    }
  }

  console.log('---');
  console.log(`[seed] Patched:        ${patched}`);
  console.log(`[seed] Skipped (not in graph): ${skippedNotFound}`);
  if (dryRun) console.log(`[seed] Dry-runs:       ${skippedDryRun}`);
  console.log(`[seed] Failed:         ${failures.length}`);
  if (failures.length > 0) {
    for (const f of failures) console.log(`  - ${f.name}: ${f.error}`);
  }
  console.log('[seed] Done. ' + (dryRun ? 'No changes written.' : 'Changes are in the latest DRAFT — review at /dashboard/team and Publish when ready.'));
}

run().catch(err => {
  console.error('[seed] Fatal:', err);
  process.exit(1);
});
