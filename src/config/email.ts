import { Resend } from 'resend';

let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  if (resendClient) return resendClient;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[email] RESEND_API_KEY not set -- email sending disabled');
    return null;
  }

  resendClient = new Resend(apiKey);
  return resendClient;
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  /** Address(es) the recipient's "Reply" button should target. Critical for
   *  any campaign sent from notifications@mail.orgtp.com — without it, replies
   *  bounce because the sending domain has no MX records. */
  replyTo?: string | string[];
  /** Resend tags — used for filtering in the Resend dashboard and grouping
   *  open/click/bounce analytics by campaign + per-recipient. Values must
   *  be ASCII letters/digits/underscores/dashes. */
  tags?: Array<{ name: string; value: string }>;
  /** Resend scheduled send. ISO 8601 (e.g. '2026-06-16T14:00:00Z') or natural
   *  language (e.g. 'in 1 hour'). Up to ~72h out. Omit to send immediately.
   *  Scheduled sends can be cancelled in the Resend dashboard before they fire. */
  scheduledAt?: string;
}

/** Sends an email via Resend. Returns the Resend email ID on success (a UUID),
 *  null on failure. Callers that previously did `if (!ok)` still work because
 *  null is falsy. New callers can capture the ID for correlation with Resend
 *  analytics (opens, clicks, bounces). */
export async function sendEmail(options: SendEmailOptions): Promise<string | null> {
  const client = getResendClient();
  if (!client) {
    console.warn('[email] Skipping email send -- no Resend client available');
    return null;
  }

  try {
    const { data, error } = await client.emails.send({
      from: options.from || 'OTP <notifications@mail.orgtp.com>',
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      replyTo: options.replyTo,
      tags: options.tags,
      ...(options.scheduledAt ? { scheduledAt: options.scheduledAt } : {}),
    });

    if (error) {
      console.error('[email] Resend API error:', error);
      return null;
    }

    return data?.id || null;
  } catch (err) {
    console.error('[email] Failed to send email:', err);
    return null;
  }
}
