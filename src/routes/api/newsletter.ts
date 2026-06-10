import type { FastifyInstance } from 'fastify';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import path from 'path';
import { fileURLToPath } from 'url';
import ejs from 'ejs';
import { db } from '../../config/database.js';
import { newsletterSubscribers, practiceVotes, bestPractices } from '../../db/schema.js';
import { createRateLimiter } from '../../shared/rate-limiter.js';
import { sendEmail } from '../../config/email.js';
import { addContactToAudience, markContactUnsubscribed } from '../../services/resend-audience.js';
import { unsubscribeUrl, verifyUnsubscribeToken } from '../../services/unsubscribe-token.js';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function sendWelcomeEmail(email: string): Promise<void> {
  try {
    const templatePath = path.resolve(__dirname, '../../templates/emails/newsletter-welcome.ejs');
    const html = await ejs.renderFile(templatePath, { email, unsubUrl: unsubscribeUrl(email) });
    await sendEmail({
      to: email,
      subject: "You're in -- welcome to OTP",
      html,
      from: 'David Steel <notifications@mail.orgtp.com>',
    });
  } catch (err) {
    console.error('[newsletter] Welcome email failed to send:', err);
  }
}

const subscribeRateLimit = createRateLimiter({ windowMs: 60000, maxRequests: 3 });
const voteRateLimit = createRateLimiter({ windowMs: 60000, maxRequests: 30 });

const subscribeSchema = z.object({
  email: z.string().email().max(255),
  source: z.string().max(50).default('homepage'),
});

const voteSchema = z.object({
  bestPracticeId: z.string().uuid(),
  vote: z.number().int().min(-1).max(1),
});

export default async function newsletterRoutes(app: FastifyInstance) {
  // NOTE: the unsubscribe confirm page posts as a plain HTML form; the global
  // application/x-www-form-urlencoded parser in server.ts:47 handles it.

  // ============================================================
  // POST /api/v1/newsletter/subscribe
  // Public, rate limited, honeypot-aware
  // ============================================================
  app.post('/newsletter/subscribe', async (request, reply) => {
    const ip = request.ip;
    if (!subscribeRateLimit(ip)) {
      return reply.status(429).send({
        error: { code: 'RATE_LIMITED', message: 'Too many signup attempts. Try again in a minute.' },
      });
    }

    const parsed = subscribeSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: { code: 'INVALID_INPUT', message: 'Please enter a valid email address.' },
      });
    }

    const { email, source } = parsed.data;

    // Check for existing subscriber
    const [existing] = await db.select()
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.email, email.toLowerCase()))
      .limit(1);

    if (existing) {
      if (existing.unsubscribedAt) {
        // Re-subscribe (single opt-in, welcome email)
        await db.update(newsletterSubscribers)
          .set({
            unsubscribedAt: null,
            doubleOptInConfirmed: true,
            confirmToken: null,
            tokenExpiresAt: null,
          })
          .where(eq(newsletterSubscribers.id, existing.id));
        await sendWelcomeEmail(email.toLowerCase());

        // Resync to Resend Audience (clears unsubscribed flag if it existed there).
        const resendId = await addContactToAudience({
          email: email.toLowerCase(),
          name: existing.name,
          unsubscribed: false,
        });
        if (resendId && resendId !== existing.resendContactId) {
          await db.update(newsletterSubscribers)
            .set({ resendContactId: resendId })
            .where(eq(newsletterSubscribers.id, existing.id));
        }

        return { message: "Welcome back -- check your inbox." };
      }
      return { message: "You're already subscribed." };
    }

    const [inserted] = await db.insert(newsletterSubscribers).values({
      email: email.toLowerCase(),
      source,
      doubleOptInConfirmed: true,
      confirmToken: null,
      tokenExpiresAt: null,
    }).returning();

    await sendWelcomeEmail(email.toLowerCase());

    // Push to Resend Audience for broadcasts. Best-effort: failure logs and continues.
    const resendId = await addContactToAudience({ email: email.toLowerCase() });
    if (resendId) {
      await db.update(newsletterSubscribers)
        .set({ resendContactId: resendId })
        .where(eq(newsletterSubscribers.id, inserted.id));
    }

    return { message: "You're in -- check your inbox." };
  });

  // ============================================================
  // GET /api/v1/newsletter/confirm/:token
  // Double opt-in confirmation
  // ============================================================
  app.get<{ Params: { token: string } }>('/newsletter/confirm/:token', async (request, reply) => {
    const { token } = request.params;

    const [subscriber] = await db.select()
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.confirmToken, token))
      .limit(1);

    if (!subscriber) {
      return reply.status(404).send({
        error: { code: 'INVALID_TOKEN', message: 'Invalid or expired confirmation link.' },
      });
    }

    if (subscriber.tokenExpiresAt && subscriber.tokenExpiresAt < new Date()) {
      return reply.status(410).send({
        error: { code: 'TOKEN_EXPIRED', message: 'This confirmation link has expired. Please subscribe again.' },
      });
    }

    await db.update(newsletterSubscribers)
      .set({
        doubleOptInConfirmed: true,
        confirmToken: null,
        tokenExpiresAt: null,
      })
      .where(eq(newsletterSubscribers.id, subscriber.id));

    return reply.redirect('/?confirmed=1');
  });

  // ============================================================
  // GET /api/v1/newsletter/unsubscribe/:email?t=<hmac>
  // One-click unsubscribe (CAN-SPAM compliant).
  //
  // With a valid signed token (all emails sent after 2026-06-10): one click,
  // done. Without one (legacy links in already-delivered emails, or someone
  // typing an arbitrary email into the URL): show a confirm page instead of
  // mutating on GET -- this is what stops link-prefetching bots and drive-by
  // unsubscribes of other people's addresses.
  // ============================================================
  async function performUnsubscribe(email: string) {
    await db.update(newsletterSubscribers)
      .set({ unsubscribedAt: new Date() })
      .where(eq(newsletterSubscribers.email, email));
    // Mirror to Resend Audience so broadcasts skip them. Best-effort.
    await markContactUnsubscribed(email);
  }

  app.get<{ Params: { email: string }; Querystring: { t?: string } }>(
    '/newsletter/unsubscribe/:email',
    async (request, reply) => {
      const email = decodeURIComponent(request.params.email).toLowerCase();

      if (verifyUnsubscribeToken(email, request.query.t)) {
        await performUnsubscribe(email);
        return reply.redirect('/?unsubscribed=1');
      }

      // Legacy / untokened link: confirm before mutating.
      return reply.type('text/html').send(`<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>Unsubscribe - OTP</title></head>
<body style="font-family:-apple-system,Segoe UI,sans-serif;background:#faf8f5;margin:0;padding:48px 20px;">
<div style="max-width:420px;margin:0 auto;background:#fff;border:1px solid #e8e4dd;border-radius:12px;padding:32px;text-align:center;">
<h1 style="font-size:20px;margin:0 0 12px 0;color:#14161c;">Unsubscribe from OTP emails?</h1>
<p style="font-size:14px;color:#666;margin:0 0 24px 0;">${email.replace(/</g, '&lt;')} will stop receiving updates from orgtp.com.</p>
<form method="POST" action="/api/v1/newsletter/unsubscribe">
<input type="hidden" name="email" value="${email.replace(/"/g, '&quot;')}">
<button type="submit" style="background:#14161c;color:#fff;border:0;border-radius:8px;padding:12px 28px;font-size:15px;font-weight:600;cursor:pointer;">Unsubscribe</button>
</form>
<p style="font-size:12px;color:#aaa;margin:20px 0 0 0;"><a href="https://orgtp.com" style="color:#aaa;">Keep my subscription</a></p>
</div></body></html>`);
    },
  );

  // POST confirm path for legacy links (the form above). Rate limited.
  app.post<{ Body: { email?: string } }>('/newsletter/unsubscribe', async (request, reply) => {
    if (!subscribeRateLimit(request.ip)) {
      return reply.status(429).send({ error: { code: 'RATE_LIMITED', message: 'Try again in a minute.' } });
    }
    const email = String((request.body as any)?.email || '').trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return reply.status(400).send({ error: { code: 'INVALID_INPUT', message: 'Valid email required.' } });
    }
    await performUnsubscribe(email);
    return reply.redirect('/?unsubscribed=1');
  });

  // ============================================================
  // POST /api/v1/public/practices/vote
  // Public voting on practices (rate limited)
  // ============================================================
  app.post('/public/practices/vote', async (request, reply) => {
    const ip = request.ip;
    if (!voteRateLimit(ip)) {
      return reply.status(429).send({
        error: { code: 'RATE_LIMITED', message: 'Slow down! Try again in a minute.' },
      });
    }

    const parsed = voteSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: { code: 'INVALID_INPUT', message: 'Invalid vote data.' },
      });
    }

    const { bestPracticeId, vote } = parsed.data;

    // Verify practice exists
    const [practice] = await db.select({ id: bestPractices.id })
      .from(bestPractices)
      .where(eq(bestPractices.id, bestPracticeId))
      .limit(1);

    if (!practice) {
      return reply.status(404).send({
        error: { code: 'NOT_FOUND', message: 'Practice not found.' },
      });
    }

    // Upsert vote (one vote per IP per practice)
    await db.execute(sql`
      INSERT INTO practice_votes (best_practice_id, voter_ip, vote)
      VALUES (${bestPracticeId}, ${ip}, ${vote})
      ON CONFLICT (best_practice_id, voter_ip) DO UPDATE SET vote = ${vote}, created_at = NOW()
    `);

    // Return updated score
    const [scoreResult] = await db.select({
      score: sql<number>`COALESCE(SUM(vote), 0)`,
    })
      .from(practiceVotes)
      .where(eq(practiceVotes.bestPracticeId, bestPracticeId));

    return { score: Number(scoreResult?.score || 0) };
  });
}
