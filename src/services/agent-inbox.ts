// Delivery into the local L8 agent message bus.
//
// When an OTP meeting cascades its summary, each AI-agent attendee should
// receive the message as an INFORM block appended to a per-agent markdown
// file at `~/.claude/agent-inbox/{agent}.md`.
//
// This only works on a machine that actually has that directory (local/dev).
// In the cloud it must fail gracefully -- never throw. Callers treat a
// `{ delivered: false }` result as "this environment has no local bus".

import { mkdir, appendFile } from 'fs/promises';
import path from 'path';
import os from 'os';

export interface InboxDeliveryResult {
  delivered: boolean;
  path: string;
  error?: string;
}

/** Resolve the agent-inbox directory, honoring an explicit override. */
function resolveInboxDir(): string {
  const override = process.env.AGENT_INBOX_DIR;
  if (override && override.trim()) return override;
  return path.join(os.homedir(), '.claude', 'agent-inbox');
}

/**
 * Sanitize an agent id into a safe filename stem: lowercase, keep only
 * `[a-z0-9_-]`, collapse every other run of characters to a single `-`.
 * Returns an empty string if nothing usable remains -- this is the
 * path-traversal guard (no `/`, `.`, `..` can survive).
 */
function sanitizeAgentId(agentId: string): string {
  return String(agentId ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Append a structured INFORM block to an AI agent's local inbox file.
 *
 * Never throws -- any filesystem failure is returned as
 * `{ delivered: false, path, error }` so meeting cascades stay resilient
 * in environments without the local agent bus (e.g. cloud deployments).
 */
export async function deliverToAgentInbox(
  agentId: string,
  title: string,
  body: string,
): Promise<InboxDeliveryResult> {
  const safeAgentId = sanitizeAgentId(agentId);
  if (!safeAgentId) {
    return { delivered: false, path: '', error: 'invalid agent id' };
  }

  const dir = resolveInboxDir();
  const filePath = path.join(dir, `${safeAgentId}.md`);

  try {
    await mkdir(dir, { recursive: true });

    const timestamp = new Date().toISOString();
    const block =
      `## INFORM — ${title} — ${timestamp}\n` +
      `Source: OTP meeting cascade\n\n` +
      `${body}\n\n` +
      `---\n`;

    await appendFile(filePath, block, 'utf8');
    return { delivered: true, path: filePath };
  } catch (err) {
    return { delivered: false, path: filePath, error: String(err) };
  }
}
