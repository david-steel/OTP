/**
 * POST /api/v1/lead-signup
 *
 * Lightweight cross-product lead capture. Writes to partner_signups
 * (same table as the full /partners application) but only requires
 * { email, source }. Optional name + company can be passed if collected.
 *
 * Source tag is the discriminator — orger.ai sends source="orger.ai",
 * future products use their own source value (mike.ai, ledger.ai, etc).
 *
 * Public, rate-limited, honeypot-protected. Same shape as partner-signup
 * but with a friction-free schema.
 */
import type { FastifyInstance } from 'fastify';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../config/database.js';
import { partnerSignups } from '../../db/schema.js';
import { createRateLimiter } from '../../shared/rate-limiter.js';

// Slightly looser than partner-signup: 5 attempts/min/IP. Lead capture is
// expected to be one-shot per visitor, but a few retries are fine.
const submitRateLimit = createRateLimiter({ windowMs: 60_000, maxRequests: 5 });

const submitSchema = z.object({
  email: z.string().email().max(255),
  // Required — distinguishes orger.ai from mike.ai from partners-page etc.
  source: z.string().min(1).max(50),
  // Optional — passed if the originating product collected them
  name: z.string().max(200).optional().nullable(),
  company: z.string().max(255).optional().nullable(),
  fitNote: z.string().max(2000).optional().nullable(),
  // Honeypot — real users won't fill this
  website: z.string().optional(),
});

export default async function leadSignupRoutes(app: FastifyInstance) {
  app.post('/lead-signup', async (request, reply) => {
    const ip = request.ip;
    if (!submitRateLimit(ip)) {
      return reply.status(429).send({
        error: { code: 'RATE_LIMITED', message: 'Too many signups. Try again in a minute.' },
      });
    }

    const parsed = submitSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: {
          code: 'INVALID_INPUT',
          message: 'Please check your input and try again.',
          details: parsed.error.flatten().fieldErrors,
        },
      });
    }

    const data = parsed.data;

    // Honeypot trip — silently pretend to accept
    if (data.website && data.website.trim() !== '') {
      return { ok: true, duplicate: false };
    }

    const email = data.email.toLowerCase().trim();
    const source = data.source.trim();
    const company = data.company?.trim() || null;
    const name = data.name?.trim() || null;
    const fitNote = data.fitNote?.trim() || null;

    // Dedupe by (email, source). A user can sign up to multiple products
    // with the same email — that's fine, each product gets its own row.
    // But the same product+email is treated as already-registered.
    // We can't use ps_email_company_idx (requires company_name) so we
    // do a manual SELECT first.
    const [existing] = await db.select()
      .from(partnerSignups)
      .where(and(eq(partnerSignups.email, email), eq(partnerSignups.source, source)))
      .limit(1);

    if (existing) {
      // If they're submitting again with new optional info, refresh the row
      if (name || company || fitNote) {
        await db.update(partnerSignups)
          .set({
            ...(name ? { fullName: name } : {}),
            ...(company ? { companyName: company } : {}),
            ...(fitNote ? { fitNote } : {}),
            updatedAt: new Date(),
          })
          .where(eq(partnerSignups.id, existing.id));
      }
      return { ok: true, duplicate: true, applicationId: existing.id };
    }

    const [inserted] = await db.insert(partnerSignups).values({
      email,
      source,
      fullName: name,
      companyName: company,
      fitNote,
      // channels stays empty default (lead capture, not partner application)
    }).returning();

    request.log.info(
      { email, source, applicationId: inserted?.id },
      '[lead-signup] new lead captured',
    );

    return { ok: true, duplicate: false, applicationId: inserted?.id };
  });
}
