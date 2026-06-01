// Ninety.io importer -- PREVIEW endpoint (increment 1).
//
// POST /api/v1/import/ninety/preview  (multipart/form-data, field "files")
//
// Public + write-free by design: it parses the uploaded Ninety exports in
// memory, reconstructs a roster from the owner columns, returns a structured
// preview, and persists NOTHING. No auth gate so a prospect can try it before
// signing up (this is a top-of-funnel migration tool). Rate-limited per IP.
//
// A later increment will add an authed POST /import/ninety/commit that writes
// the parsed records into the caller's org (rocks/todos/tickets/headlines/kpis)
// and seeds the chart from the roster. This file does not write.
import type { FastifyInstance } from 'fastify';
import { getAuth } from '@clerk/fastify';
import { createRateLimiter } from '../../shared/rate-limiter.js';
import { previewNinetyImport, parseNinetyUploads } from '../../services/ninety-import.js';
import { commitNinetyImport } from '../../services/ninety-commit.js';
import { getAuthOrg } from '../../middleware/auth-helpers.js';

const rl = createRateLimiter({ windowMs: 60_000, maxRequests: 20 });
const commitRl = createRateLimiter({ windowMs: 60_000, maxRequests: 6 });

// Read uploaded multipart files into in-memory buffers. Returns null after
// sending an error response (caller does `if (!uploads) return`).
async function readUploads(request: any, reply: any): Promise<Array<{ filename: string; buffer: Buffer }> | null> {
  if (!request.isMultipart()) {
    reply.status(400).send({ error: { code: 'NOT_MULTIPART', message: 'Upload your Ninety export files as multipart/form-data.' } });
    return null;
  }
  const uploads: Array<{ filename: string; buffer: Buffer }> = [];
  try {
    for await (const part of request.parts()) {
      if (part.type !== 'file') continue;
      const buffer = await part.toBuffer();
      if (buffer.length > 0) uploads.push({ filename: part.filename || 'upload', buffer });
    }
  } catch (err: any) {
    const tooBig = String(err?.code || '').includes('FST_') || /limit/i.test(String(err?.message));
    reply.status(tooBig ? 413 : 400).send({
      error: { code: tooBig ? 'FILE_TOO_LARGE' : 'UPLOAD_FAILED', message: tooBig ? 'A file exceeded the 8MB limit, or too many files were sent (max 12).' : 'Could not read the uploaded files.' },
    });
    return null;
  }
  if (!uploads.length) {
    reply.status(400).send({ error: { code: 'NO_FILES', message: 'No files received. Export your Rocks, To-Dos, Issues, Headlines, and Scorecard from your EOS tool, then drop the files here.' } });
    return null;
  }
  return uploads;
}

// PREVIEW -- public, write-free. Source-agnostic (Ninety + Bloom Growth).
async function previewHandler(request: any, reply: any) {
  if (!rl(request.ip)) {
    return reply.status(429).send({ error: { code: 'RATE_LIMITED', message: 'Too many requests' } });
  }
  const uploads = await readUploads(request, reply);
  if (!uploads) return;
  return reply.status(200).send({ preview: previewNinetyImport(uploads) });
}

// COMMIT -- authed. Writes the parsed records into the caller's org. Re-parses
// server-side (never trusts client-sent parse output). Idempotent on re-run.
async function commitHandler(request: any, reply: any) {
  if (!commitRl(request.ip)) {
    return reply.status(429).send({ error: { code: 'RATE_LIMITED', message: 'Too many requests' } });
  }
  const org = await getAuthOrg(request);
  if (!org) {
    return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Create your OTP workspace and sign in to import.' } });
  }
  const uploads = await readUploads(request, reply);
  if (!uploads) return;

  const sheets = parseNinetyUploads(uploads);
  const createdBy = getAuth(request).userId || 'import:eos';
  const result = await commitNinetyImport(org.id, org.name, sheets, createdBy);
  return reply.status(200).send({ result });
}

export default async function ninetyImportRoutes(app: FastifyInstance) {
  // Same handlers under a Ninety-named path (front-and-center funnel) and a
  // source-neutral /import/eos path (used by the secondary Bloom Growth page).
  // The parser is source-agnostic; the URL is cosmetic.
  app.post('/import/ninety/preview', previewHandler);
  app.post('/import/ninety/commit', commitHandler);
  app.post('/import/eos/preview', previewHandler);
  app.post('/import/eos/commit', commitHandler);
}
