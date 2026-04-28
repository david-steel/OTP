// Resend Audience sync for OTP newsletter subscribers.
// Pushes contacts into the configured Resend Audience so broadcasts can fan out.
//
// Environment:
//   RESEND_API_KEY            -- shared with src/config/email.ts
//   OTP_RESEND_AUDIENCE_ID    -- created once via scripts/resend-audience-setup.ts
//
// All calls are best-effort: a Resend hiccup never blocks a DB insert. Failures log and return null.

import { Resend } from 'resend';

let resendClient: Resend | null = null;

function getClient(): Resend | null {
  if (resendClient) return resendClient;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[resend-audience] RESEND_API_KEY not set -- audience sync disabled');
    return null;
  }
  resendClient = new Resend(apiKey);
  return resendClient;
}

function getAudienceId(): string | null {
  const id = process.env.OTP_RESEND_AUDIENCE_ID;
  if (!id) {
    console.warn('[resend-audience] OTP_RESEND_AUDIENCE_ID not set -- run scripts/resend-audience-setup.ts');
    return null;
  }
  return id;
}

function splitName(name: string | null | undefined): { firstName?: string; lastName?: string } {
  if (!name) return {};
  const trimmed = name.trim();
  if (!trimmed) return {};
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0] };
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
}

export interface AudienceContactInput {
  email: string;
  name?: string | null;
  unsubscribed?: boolean;
}

// Adds (or refreshes) a contact in the OTP audience. Returns the Resend contact ID.
export async function addContactToAudience(
  input: AudienceContactInput,
): Promise<string | null> {
  const client = getClient();
  const audienceId = getAudienceId();
  if (!client || !audienceId) return null;

  const { firstName, lastName } = splitName(input.name);

  try {
    const result = await client.contacts.create({
      audienceId,
      email: input.email.toLowerCase(),
      firstName,
      lastName,
      unsubscribed: input.unsubscribed ?? false,
    });

    if (result.error) {
      // Resend returns a 422-ish if the contact already exists. Fall through to update.
      const message = String(result.error.message || '');
      if (/already exist/i.test(message)) {
        return await updateContactInAudience(input);
      }
      console.error('[resend-audience] contacts.create error:', result.error);
      return null;
    }

    return result.data?.id ?? null;
  } catch (err) {
    console.error('[resend-audience] contacts.create threw:', err);
    return null;
  }
}

export async function updateContactInAudience(
  input: AudienceContactInput,
): Promise<string | null> {
  const client = getClient();
  const audienceId = getAudienceId();
  if (!client || !audienceId) return null;

  const { firstName, lastName } = splitName(input.name);

  try {
    const result = await client.contacts.update({
      audienceId,
      email: input.email.toLowerCase(),
      firstName,
      lastName,
      unsubscribed: input.unsubscribed,
    });

    if (result.error) {
      console.error('[resend-audience] contacts.update error:', result.error);
      return null;
    }

    return result.data?.id ?? null;
  } catch (err) {
    console.error('[resend-audience] contacts.update threw:', err);
    return null;
  }
}

export async function markContactUnsubscribed(email: string): Promise<boolean> {
  const id = await updateContactInAudience({ email, unsubscribed: true });
  return id !== null;
}
