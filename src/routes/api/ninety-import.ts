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
import { createRateLimiter } from '../../shared/rate-limiter.js';
import { previewNinetyImport } from '../../services/ninety-import.js';

const rl = createRateLimiter({ windowMs: 60_000, maxRequests: 20 });

export default async function ninetyImportRoutes(app: FastifyInstance) {
  app.post('/import/ninety/preview', async (request, reply) => {
    if (!rl(request.ip)) {
      return reply.status(429).send({ error: { code: 'RATE_LIMITED', message: 'Too many requests' } });
    }
    if (!request.isMultipart()) {
      return reply.status(400).send({ error: { code: 'NOT_MULTIPART', message: 'Upload your Ninety export files as multipart/form-data.' } });
    }

    const uploads: Array<{ filename: string; buffer: Buffer }> = [];
    try {
      for await (const part of request.parts()) {
        if (part.type !== 'file') continue;
        const buffer = await part.toBuffer(); // bounded by the 8MB/file limit in server.ts
        if (buffer.length > 0) uploads.push({ filename: part.filename || 'upload', buffer });
      }
    } catch (err: any) {
      // @fastify/multipart throws on limit breaches (file too big / too many files)
      const tooBig = String(err?.code || '').includes('FST_') || /limit/i.test(String(err?.message));
      return reply.status(tooBig ? 413 : 400).send({
        error: { code: tooBig ? 'FILE_TOO_LARGE' : 'UPLOAD_FAILED', message: tooBig ? 'A file exceeded the 8MB limit, or too many files were sent (max 12).' : 'Could not read the uploaded files.' },
      });
    }

    if (!uploads.length) {
      return reply.status(400).send({ error: { code: 'NO_FILES', message: 'No files received. Export Rocks, To-Dos, Issues, Headlines, and your Scorecard from Ninety, then drop them here.' } });
    }

    const preview = previewNinetyImport(uploads);
    return reply.status(200).send({ preview });
  });
}
