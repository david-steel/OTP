/**
 * Meeting follow-ups extraction -- PURE logic, no DB / no SDK import.
 *
 * The AI wizard (POST /meetings/:id/ai/followups) sends a transcript to the
 * model and gets back JSON describing the follow-ups to propose. The prompt,
 * the output schema, and the response parser live here so they are unit-testable
 * without a DATABASE_URL or an ANTHROPIC_API_KEY. The route does the LLM call.
 */
import { z } from 'zod';

export const followupsSchema = z.object({
  summary: z.string().max(4000).default(''),
  todos: z.array(z.object({
    title: z.string().min(1).max(500),
    // Suggested owner NAME if the transcript names one; free text, the review
    // UI maps it to a real seat. Omitted when unclear.
    owner: z.string().max(255).optional(),
  })).default([]),
  issues: z.array(z.object({
    title: z.string().min(1).max(500),
    description: z.string().max(4000).default(''),
  })).default([]),
  headlines: z.array(z.object({
    body: z.string().min(1).max(2000),
    kind: z.enum(['customer', 'employee', 'other']).default('other'),
  })).default([]),
});

export type MeetingFollowups = z.infer<typeof followupsSchema>;

// Byte-stable system prompt (lets Anthropic prompt-cache the prefix).
export const FOLLOWUPS_SYSTEM_PROMPT = [
  'You extract follow-ups from the transcript of a leadership team meeting run on the EOS / Level 10 model.',
  'Read the transcript and return ONLY a JSON object (no prose, no markdown fences) with exactly these keys:',
  '{',
  '  "summary": string,        // <= 120 words, plain text, what was decided and what happens next',
  '  "todos": [{ "title": string, "owner"?: string }],   // concrete action items; owner = the name assigned, omit if unclear',
  '  "issues": [{ "title": string, "description": string }],  // unresolved problems/blockers to add to the IDS issues list',
  '  "headlines": [{ "body": string, "kind": "customer"|"employee"|"other" }]  // notable wins/news worth sharing',
  '}',
  'Rules: only include items genuinely supported by the transcript -- do not invent. A to-do is a clear next action somebody owns. An issue is a problem that was raised but not resolved. A headline is good news (a customer win = "customer", a people/team win = "employee", else "other"). If a category has nothing, return an empty array. Keep titles short and specific. Output JSON only.',
].join('\n');

export function buildFollowupsUserMessage(opts: {
  transcript: string;
  meetingTitle?: string | null;
  attendees?: string[];
}): string {
  const head: string[] = [];
  if (opts.meetingTitle) head.push(`Meeting: ${opts.meetingTitle}`);
  if (opts.attendees && opts.attendees.length) head.push(`Attendees: ${opts.attendees.join(', ')}`);
  const prefix = head.length ? head.join('\n') + '\n\n' : '';
  return `${prefix}Transcript:\n"""\n${opts.transcript}\n"""`;
}

/**
 * Parse the model's reply into validated follow-ups. Tolerates markdown code
 * fences and leading/trailing prose around the JSON object. Throws on anything
 * that is not a usable JSON object (the route retries once, then 502s).
 */
export function parseFollowups(raw: string): MeetingFollowups {
  let text = String(raw || '').trim();
  // Strip a leading ```json / ``` fence and trailing ``` if present.
  text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  // If there is prose around it, grab the outermost {...}.
  if (text[0] !== '{') {
    const first = text.indexOf('{');
    const last = text.lastIndexOf('}');
    if (first === -1 || last === -1 || last <= first) throw new Error('No JSON object in model response');
    text = text.slice(first, last + 1);
  }
  const obj = JSON.parse(text);
  return followupsSchema.parse(obj);
}
