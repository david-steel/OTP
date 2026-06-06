import type { FastifyReply } from 'fastify';

/**
 * Standard error envelope per ENDPOINTS.md.
 * Keep response shape stable: { error: { code, message, details? } }.
 */
export function errorEnvelope(
  reply: FastifyReply,
  status: number,
  code: string,
  message: string,
  details?: Record<string, unknown>,
): FastifyReply {
  const body: { error: { code: string; message: string; details?: Record<string, unknown> } } = {
    error: { code, message },
  };
  if (details) body.error.details = details;
  return reply.code(status).send(body);
}

/**
 * Wrap a list result in the public-API standard envelope.
 * { count, results, ...extras } — `extras` lets endpoints add fields like `query` or `since_days`.
 */
export function listEnvelope<T>(
  results: T[],
  extras: Record<string, unknown> = {},
): { count: number; results: T[] } & Record<string, unknown> {
  return { ...extras, count: results.length, results };
}

/**
 * Clamp a numeric limit query param to [1, max], with a default.
 * Accepts string | number | undefined (Fastify gives strings from querystring).
 */
export function clampLimit(raw: unknown, def: number, max: number): number {
  const n = typeof raw === 'string' ? parseInt(raw, 10) : typeof raw === 'number' ? raw : NaN;
  if (!Number.isFinite(n) || n <= 0) return def;
  return Math.min(Math.floor(n), max);
}

/**
 * Trim and lowercase a slug-like string. Returns null if blank or invalid.
 */
export function normalizeSlug(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const s = raw.trim().toLowerCase();
  if (!s || !/^[a-z0-9][a-z0-9-]{0,99}$/.test(s)) return null;
  return s;
}
