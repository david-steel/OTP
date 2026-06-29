// Shared contract for the meeting-template library (/templates).
// Each category file under this dir exports an array of MeetingTemplate.
// The barrel src/data/meeting-templates.ts concatenates them.
//
// All content is AUTHORED (trusted) — bodyHtml renders via <%- %>. Never
// interpolate user data here. Keep every object BYTE-STABLE (no Date.now,
// no randomness) so it can be cached and diffed.

export interface TemplateStep {
  name: string;       // agenda section name, e.g. "Check-in / Segue"
  minutes?: number;   // timebox for this section (optional)
  text: string;       // plain-text description (used for HowTo JSON-LD + markdown)
}

export interface MeetingTemplate {
  slug: string;            // kebab url slug, unique, e.g. "level-10-meeting"
  title: string;           // page H1 / <title> base, e.g. "Level 10 Meeting Template"
  shortName: string;       // display name without "Template", e.g. "Level 10 Meeting"
  description: string;     // 140-160 char keyword-rich meta description
  category: string;        // category key (see CATEGORY_LABELS in the barrel)
  methodology: string;     // "EOS" | "Scaling Up" | "Agile / Scrum" | "General" | "OKR" | "Design Thinking" | ...
  minutes: number;         // total duration in minutes
  cadence: string;         // "Weekly" | "Quarterly" | "Monthly" | "As needed" | "Daily" | ...
  participants: string;    // who attends, e.g. "Leadership team (3-10 people)"
  keywords: string[];      // SEO keywords people search (incl. "<type> template", "<type> agenda", etc.)
  steps: TemplateStep[];   // the timeboxed agenda — drives HowTo schema + the agenda render
  bodyHtml: string;        // full authored page body (intro, when-to-use, attendees, tips, mistakes); the agenda is rendered separately from steps
  downloadMarkdown: string;// the .md a user downloads (clean, AI-importable)
  guideHtml?: string;      // optional long-form SEO guide, rendered below the download section on the detail page
}

// Build the lowercased search blob a client-side filter matches against.
// Pure + deterministic.
export function templateSearchText(t: MeetingTemplate): string {
  const stepText = t.steps.map((s) => s.name + ' ' + s.text).join(' ');
  return [
    t.title, t.shortName, t.description, t.methodology, t.category,
    t.cadence, t.participants, t.keywords.join(' '), stepText,
  ].join(' ').toLowerCase();
}
