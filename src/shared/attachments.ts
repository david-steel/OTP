// Attachment validation + pure helpers, shared by the attachments API and
// its unit tests.
//
// DB-free by design: nothing in this module's import chain may reach
// config/database.ts (which throws at load time without DATABASE_URL).
// See dashboard-preferences.ts for the same pattern.
import { z } from 'zod';

/** Hard cap on a decoded attachment blob (5 MB). */
export const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;

/** Entities an attachment can be linked to. 'issue' rows live in `tickets`. */
export const attachmentEntityTypes = ['todo', 'issue', 'rock', 'meeting'] as const;
export type AttachmentEntityType = (typeof attachmentEntityTypes)[number];
export const attachmentEntityTypeSchema = z.enum(attachmentEntityTypes);

export const attachmentLinkTargetSchema = z.object({
  entityType: attachmentEntityTypeSchema,
  entityId: z.string().uuid(),
}).strict();

export const createAttachmentSchema = z.object({
  filename: z.string().min(1).max(255),
  // Permissive on type (we never trust it at serve time -- see
  // responseMimeFor / Content-Disposition below), strict on shape.
  mimeType: z.string().min(1).max(120).regex(/^[\w.+-]+\/[\w.+-]+$/, 'mimeType must look like type/subtype'),
  dataBase64: z.string().min(1),
  link: attachmentLinkTargetSchema,
}).strict();

export const linkAttachmentSchema = attachmentLinkTargetSchema;

/**
 * Decoded byte size of a base64 string WITHOUT decoding it (so the 5 MB cap
 * can be enforced before allocating a Buffer). Tolerates whitespace and
 * data-URL prefixes are NOT handled here -- strip those client-side.
 * Returns -1 when the string can't be valid base64.
 */
export function decodedBase64Size(b64: string): number {
  const compact = b64.replace(/\s+/g, '');
  if (compact.length === 0) return 0;
  if (compact.length % 4 !== 0) return -1;
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(compact)) return -1;
  let padding = 0;
  if (compact.endsWith('==')) padding = 2;
  else if (compact.endsWith('=')) padding = 1;
  return (compact.length / 4) * 3 - padding;
}

/**
 * Server-side filename sanitizer. Defense against path tricks and header
 * injection:
 *  - basename only (strips both / and \ path segments)
 *  - control chars, quotes, CR/LF removed (Content-Disposition safety)
 *  - leading dots stripped (no hidden/parent-dir names)
 *  - capped at 255 chars, falls back to "attachment" when nothing survives
 */
export function sanitizeFilename(raw: string): string {
  const base = String(raw).split(/[/\\]/).pop() || '';
  let clean = base
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f"\r\n;]/g, '')
    .trim()
    .replace(/^\.+/, '');
  if (clean.length > 255) clean = clean.slice(0, 255);
  return clean || 'attachment';
}

/**
 * Mime types that are safe to serve with their declared Content-Type
 * (still always Content-Disposition: attachment). Everything else --
 * notably text/html, image/svg+xml, anything scriptable -- is forced to
 * application/octet-stream so a stored upload can never execute as a page.
 */
const INLINE_SAFE_MIMES = new Set([
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'application/pdf',
]);

export function responseMimeFor(storedMime: string): string {
  const norm = String(storedMime).toLowerCase().split(';')[0].trim();
  return INLINE_SAFE_MIMES.has(norm) ? norm : 'application/octet-stream';
}

/** Build a header-safe Content-Disposition for a stored filename. */
export function contentDispositionFor(storedFilename: string): string {
  const safe = sanitizeFilename(storedFilename);
  // ASCII fallback for the quoted form; RFC 5987 filename* carries the rest.
  // eslint-disable-next-line no-control-regex
  const ascii = safe.replace(/[^ -~]/g, '_');
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(safe)}`;
}
