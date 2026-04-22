import type { FastifyInstance } from 'fastify';
import { Webhook } from 'svix';
import path from 'path';
import { fileURLToPath } from 'url';
import ejs from 'ejs';
import { eq } from 'drizzle-orm';
import { db } from '../../config/database.js';
import { onboardingSequence } from '../../db/schema.js';
import { sendEmail } from '../../config/email.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ClerkEmailAddress {
  id: string;
  email_address: string;
}

interface ClerkUserCreatedData {
  id: string;
  email_addresses: ClerkEmailAddress[];
  primary_email_address_id: string | null;
}

interface ClerkWebhookEvent {
  type: string;
  data: ClerkUserCreatedData;
}

function getPrimaryEmail(user: ClerkUserCreatedData): string | null {
  if (!user.email_addresses?.length) return null;
  const primary = user.email_addresses.find(e => e.id === user.primary_email_address_id);
  return primary?.email_address || user.email_addresses[0]?.email_address || null;
}

export async function sendOnboardingEmail1(email: string): Promise<boolean> {
  try {
    const templatePath = path.resolve(__dirname, '../../templates/emails/newsletter-welcome.ejs');
    const html = await ejs.renderFile(templatePath, { email });
    return await sendEmail({
      to: email,
      subject: "You're in -- welcome to OTP",
      html,
      from: 'David Steel <notifications@mail.orgtp.com>',
    });
  } catch (err) {
    console.error('[clerk-webhook] Email #1 render/send failed:', err);
    return false;
  }
}

export default async function clerkWebhookRoutes(app: FastifyInstance) {
  app.addContentTypeParser(
    'application/json',
    { parseAs: 'string' },
    (req, body, done) => {
      const raw = body as string;
      try {
        const parsed = raw.length ? JSON.parse(raw) : {};
        (req as unknown as { rawBody: string }).rawBody = raw;
        done(null, parsed);
      } catch (err) {
        done(err as Error, undefined);
      }
    },
  );

  app.post('/clerk/webhook', async (request, reply) => {
    const secret = process.env.CLERK_WEBHOOK_SECRET;
    if (!secret) {
      console.error('[clerk-webhook] CLERK_WEBHOOK_SECRET not configured');
      return reply.status(500).send({ error: 'webhook_not_configured' });
    }

    const rawBody = (request as unknown as { rawBody?: string }).rawBody;
    if (!rawBody) {
      return reply.status(400).send({ error: 'missing_raw_body' });
    }

    const svixId = request.headers['svix-id'];
    const svixTimestamp = request.headers['svix-timestamp'];
    const svixSignature = request.headers['svix-signature'];

    if (!svixId || !svixTimestamp || !svixSignature) {
      return reply.status(400).send({ error: 'missing_svix_headers' });
    }

    let event: ClerkWebhookEvent;
    try {
      const wh = new Webhook(secret);
      event = wh.verify(rawBody, {
        'svix-id': Array.isArray(svixId) ? svixId[0] : svixId,
        'svix-timestamp': Array.isArray(svixTimestamp) ? svixTimestamp[0] : svixTimestamp,
        'svix-signature': Array.isArray(svixSignature) ? svixSignature[0] : svixSignature,
      }) as ClerkWebhookEvent;
    } catch (err) {
      console.error('[clerk-webhook] Signature verification failed:', err);
      return reply.status(401).send({ error: 'invalid_signature' });
    }

    if (event.type !== 'user.created') {
      return { ok: true, ignored: event.type };
    }

    const user = event.data;
    const email = getPrimaryEmail(user);
    if (!email) {
      console.warn(`[clerk-webhook] user.created without email: ${user.id}`);
      return { ok: true, warning: 'no_email' };
    }

    const [existing] = await db
      .select()
      .from(onboardingSequence)
      .where(eq(onboardingSequence.clerkUserId, user.id))
      .limit(1);

    if (existing) {
      console.log(`[clerk-webhook] Onboarding row already exists for ${user.id}, skipping`);
      return { ok: true, duplicate: true };
    }

    await db.insert(onboardingSequence).values({
      clerkUserId: user.id,
      email: email.toLowerCase(),
    });

    const sent = await sendOnboardingEmail1(email);
    if (sent) {
      await db
        .update(onboardingSequence)
        .set({ email1SentAt: new Date() })
        .where(eq(onboardingSequence.clerkUserId, user.id));
      console.log(`[clerk-webhook] Welcome email sent to ${email}`);
    } else {
      console.error(`[clerk-webhook] Welcome email failed to send to ${email}`);
    }

    return { ok: true, sent };
  });
}
