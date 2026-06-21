/**
 * org-logo.ts -- organization logo upload / remove / status.
 *
 * The logo is stored as a `data:<mime>;base64,<b64>` data-URI in
 * organizations.logo_url (capped ~150KB). Keeping it in the DB means the
 * sidebar gets the logo in the same read as the org name (no per-pageview R2
 * fetch). The left-sidebar header renders it in place of the org NAME (never
 * "Workspace"); Company Settings drives upload/remove.
 *
 * Routes (registered under /api/v1 in server.ts):
 *   POST   /api/v1/org/logo   (multipart, owner/admin) -- set the logo
 *   DELETE /api/v1/org/logo   (owner/admin)            -- clear the logo
 *   GET    /api/v1/org/logo   (any member)             -- { hasLogo }
 *
 * Never logs file bytes.
 */
import type { FastifyInstance, FastifyRequest } from 'fastify';
import { eq } from 'drizzle-orm';
import { db } from '../../config/database.js';
import { organizations } from '../../db/schema.js';
import { getAuthOrg } from '../../middleware/auth-helpers.js';
import { canEditOrgSettings } from '../../middleware/permissions.js';
import type { Role } from '../../services/membership.js';

// ~150KB cap on the raw image bytes (the data-URI is ~33% larger once base64'd).
const MAX_LOGO_BYTES = 150 * 1024;
const ALLOWED_MIMES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'image/gif']);

// Owner/admin-style gate, mirroring billing.ts / labs.ts: a legacy founder with
// no member row owns their own org and may edit settings; otherwise require a
// role that canEditOrgSettings.
function callerCanEditSettings(request: FastifyRequest): boolean {
  const member = (request as unknown as { orgMember?: { role?: string } | null }).orgMember;
  const role = (member?.role || '') as Role;
  if (canEditOrgSettings(role)) return true;
  if (!member?.role) return true;
  return false;
}

export default async function orgLogoRoutes(app: FastifyInstance) {
  // GET /api/v1/org/logo -- whether a logo is set. Any member. The sidebar
  // gets the actual data-URI via view locals (server.ts), not here.
  app.get('/org/logo', async (request, reply) => {
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in required' } });
    const [row] = await db
      .select({ logoUrl: organizations.logoUrl })
      .from(organizations)
      .where(eq(organizations.id, org.id))
      .limit(1);
    return { hasLogo: !!(row && row.logoUrl) };
  });

  // POST /api/v1/org/logo -- multipart upload. Owner/admin only.
  app.post('/org/logo', async (request, reply) => {
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in required' } });
    if (!callerCanEditSettings(request)) {
      return reply.status(403).send({ error: { code: 'FORBIDDEN', message: 'You do not have permission to change the company logo.' } });
    }
    if (!(request as any).isMultipart || !(request as any).isMultipart()) {
      return reply.status(400).send({ error: { code: 'NOT_MULTIPART', message: 'Upload the logo as multipart/form-data.' } });
    }

    let file: { mimetype: string; buffer: Buffer } | null = null;
    try {
      const part = await (request as any).file();
      if (!part) {
        return reply.status(400).send({ error: { code: 'NO_FILE', message: 'No file received.' } });
      }
      const buffer = await part.toBuffer();
      file = { mimetype: String(part.mimetype || ''), buffer };
    } catch (err: any) {
      const tooBig = String(err?.code || '').includes('FST_') || /limit/i.test(String(err?.message));
      return reply.status(tooBig ? 413 : 400).send({
        error: { code: tooBig ? 'FILE_TOO_LARGE' : 'UPLOAD_FAILED', message: tooBig ? 'That logo is too large. Keep it under 150 KB.' : 'Could not read the uploaded file.' },
      });
    }

    if (!file || file.buffer.length === 0) {
      return reply.status(400).send({ error: { code: 'NO_FILE', message: 'No file received.' } });
    }
    const mime = file.mimetype.toLowerCase().split(';')[0].trim();
    if (!ALLOWED_MIMES.has(mime)) {
      return reply.status(400).send({ error: { code: 'BAD_MIME', message: 'Logo must be a PNG, JPEG, WebP, SVG, or GIF image.' } });
    }
    if (file.buffer.length > MAX_LOGO_BYTES) {
      return reply.status(413).send({ error: { code: 'FILE_TOO_LARGE', message: 'That logo is too large. Keep it under 150 KB.' } });
    }

    const logoUrl = `data:${mime};base64,${file.buffer.toString('base64')}`;
    await db.update(organizations).set({ logoUrl }).where(eq(organizations.id, org.id));
    return { ok: true };
  });

  // DELETE /api/v1/org/logo -- clear the logo. Owner/admin only.
  app.delete('/org/logo', async (request, reply) => {
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in required' } });
    if (!callerCanEditSettings(request)) {
      return reply.status(403).send({ error: { code: 'FORBIDDEN', message: 'You do not have permission to change the company logo.' } });
    }
    await db.update(organizations).set({ logoUrl: null }).where(eq(organizations.id, org.id));
    return { ok: true };
  });
}
