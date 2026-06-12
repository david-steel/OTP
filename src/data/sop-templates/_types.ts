// Shared contract for the free Process Library (/process-templates).
// Each category file under this dir exports an array of SopTemplate.
// The barrel src/data/sop-templates.ts concatenates them into SOP_TEMPLATES
// and also derives the back-compat SOP_TEMPLATE_GROUPS shape the /processes
// hub + /dashboard/team picker consume.
//
// All content is AUTHORED + ORIGINAL (no third-party SOP text). Keep every
// object BYTE-STABLE (no Date.now, no randomness) so it can be cached/diffed.
// A library SOP carries the same runtime fields a per-seat SOP does
// (trigger/steps/outputs/tools), so it is directly agent-runnable + insertable.

export interface SopTemplate {
  id: string;            // stable id (insertion gives the SOP a fresh runtime id)
  slug: string;          // kebab url slug, unique, [a-z0-9-]+, used in the public URL
  title: string;         // page H1 / <title> base, e.g. "Daily Inbox Triage SOP"
  category: string;      // category key (see SOP_CATEGORY_LABELS in the barrel)
  shortName?: string;    // optional display name without "SOP"
  description: string;   // 1-2 sentence SEO summary / meta description
  whenToUse: string;     // a sentence on when this process applies
  trigger: string;       // runtime trigger (event/cadence) -- agent-runnable field
  steps: string[];       // the numbered procedure -- drives HowTo schema + render
  outputs: string[];     // concrete artifacts produced
  tools: string[];       // realistic tools used
  tips?: string[];       // optional do-this-not-that pointers
  notes?: string;        // optional single load-bearing note
  keywords: string[];    // SEO keywords people search
}

// Lowercased search blob for the client-side filter on /process-templates.
// Pure + deterministic.
export function sopSearchText(s: SopTemplate): string {
  return [
    s.title, s.shortName || '', s.description, s.whenToUse, s.category,
    s.trigger, s.keywords.join(' '),
    s.steps.join(' '), s.outputs.join(' '), s.tools.join(' '),
    (s.tips || []).join(' '), s.notes || '',
  ].join(' ').toLowerCase();
}

// Slim projection used by the index cards + embedded client search.
export interface SopSearchEntry {
  slug: string;
  title: string;
  shortName: string;
  description: string;
  category: string;
  stepCount: number;
  trigger: string;
  search: string;
}
