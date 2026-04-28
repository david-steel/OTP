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
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function sendWelcomeEmail(email: string): Promise<void> {
  try {
    const templatePath = path.resolve(__dirname, '../../templates/emails/newsletter-welcome.ejs');
    const html = await ejs.renderFile(templatePath, { email });
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
  // GET /api/v1/newsletter/unsubscribe/:email
  // One-click unsubscribe (CAN-SPAM compliant)
  // ============================================================
  app.get<{ Params: { email: string } }>('/newsletter/unsubscribe/:email', async (request, reply) => {
    const email = decodeURIComponent(request.params.email).toLowerCase();

    await db.update(newsletterSubscribers)
      .set({ unsubscribedAt: new Date() })
      .where(eq(newsletterSubscribers.email, email));

    // Mirror to Resend Audience so broadcasts skip them. Best-effort.
    await markContactUnsubscribed(email);

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
