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
}

export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  const client = getResendClient();
  if (!client) {
    console.warn('[email] Skipping email send -- no Resend client available');
    return false;
  }

  try {
    const { error } = await client.emails.send({
      from: options.from || 'OTP <notifications@mail.orgtp.com>',
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      replyTo: options.replyTo,
    });

    if (error) {
      console.error('[email] Resend API error:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[email] Failed to send email:', err);
    return false;
  }
}
