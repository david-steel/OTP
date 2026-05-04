import type { FastifyInstance } from 'fastify';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../config/database.js';
import { partnerSignups } from '../../db/schema.js';
import { createRateLimiter } from '../../shared/rate-limiter.js';

const submitRateLimit = createRateLimiter({ windowMs: 60_000, maxRequests: 3 });

// Channel slugs the form will accept. Keep in sync with /partners page checkboxes.
const VALID_CHANNELS = [
  'eos_implementer',
  'scaling_up_coach',
  'pinnacle_petra',
  'okr_lattice',
  'agile_scrum',
  'vistage_chair',
  'ypo_facilitator',
  'eo_facilitator',
  'fractional_cio',
  'fractional_cto',
  'fractional_cmo',
  'fractional_cfo',
  'fractional_coo',
  'fractional_cro',
  'msp',
  'ai_consultancy',
  'systems_integrator',
  'dev_agency',
  'ai_builder',
  'agent_engineer',
  'automation_specialist',
  'mcp_developer',
  'business_coach',
  'management_consultant',
  'growth_coach',
  'strategy_consultant',
  'other',
] as const;

const submitSchema = z.object({
  companyName: z.string().min(1).max(255),
  fullName: z.string().min(1).max(200),
  email: z.string().email().max(255),
  title: z.string().max(255).optional().nullable(),
  linkedinUrl: z.string().max(500).optional().nullable(),
  channels: z.array(z.enum(VALID_CHANNELS)).min(1),
  otherChannel: z.string().max(500).optional().nullable(),
  clientCountRange: z.enum(['under_5', '5_to_20', '20_to_50', '50_plus']).optional().nullable(),
  fitNote: z.string().max(4000).optional().nullable(),
  source: z.string().max(50).optional(),
  // Honeypot — real users won't fill this. Bots will.
  website: z.string().optional(),
});

export default async function partnerSignupRoutes(app: FastifyInstance) {

  // ============================================================
  // POST /api/v1/partner-signup
  // Public, rate limited, honeypot-aware.
  // Inserts into partner_signups; admin reviews and assigns tier later.
  // ============================================================
  app.post('/partner-signup', async (request, reply) => {
    const ip = request.ip;
    if (!submitRateLimit(ip)) {
      return reply.status(429).send({
        error: { code: 'RATE_LIMITED', message: 'Too many applications. Try again in a minute.' },
      });
    }

    const parsed = submitSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: {
          code: 'INVALID_INPUT',
          message: 'Please check your form fields and try again.',
          details: parsed.error.flatten().fieldErrors,
        },
      });
    }

    const data = parsed.data;

    // Honeypot trip — silently accept and discard.
    if (data.website && data.website.trim() !== '') {
      return { message: 'Application received.' };
    }

    const email = data.email.toLowerCase().trim();
    const companyName = data.companyName.trim();

    // Update-or-insert: same (email, company_name) pair updates the existing row
    // so a partner can refine their answers without creating duplicates.
    const [existing] = await db.select()
      .from(partnerSignups)
      .where(and(eq(partnerSignups.email, email), eq(partnerSignups.companyName, companyName)))
      .limit(1);

    if (existing) {
      await db.update(partnerSignups)
        .set({
          fullName: data.fullName.trim(),
          title: data.title?.trim() || null,
          linkedinUrl: data.linkedinUrl?.trim() || null,
          channels: data.channels,
          otherChannel: data.otherChannel?.trim() || null,
          clientCountRange: data.clientCountRange || null,
          fitNote: data.fitNote?.trim() || null,
          source: data.source?.trim() || existing.source,
          updatedAt: new Date(),
        })
        .where(eq(partnerSignups.id, existing.id));

      return {
        message: "Your application has been updated. We'll be in touch.",
        applicationId: existing.id,
      };
    }

    const [inserted] = await db.insert(partnerSignups).values({
      companyName,
      fullName: data.fullName.trim(),
      email,
      title: data.title?.trim() || null,
      linkedinUrl: data.linkedinUrl?.trim() || null,
      channels: data.channels,
      otherChannel: data.otherChannel?.trim() || null,
      clientCountRange: data.clientCountRange || null,
      fitNote: data.fitNote?.trim() || null,
      source: data.source?.trim() || 'partners-page',
    }).returning();

    return {
      message: "Application received. David personally reviews every partner application -- expect to hear back within 3 business days.",
      applicationId: inserted.id,
    };
  });
}
