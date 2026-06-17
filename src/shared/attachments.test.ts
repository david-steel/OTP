import { describe, it, expect } from 'vitest';
// DB-free by design: this import chain must never reach config/database.ts
// (which throws at load time without DATABASE_URL). If someone adds a DB
// import to attachments.ts, this whole file fails at collection.
import {
  MAX_ATTACHMENT_BYTES,
  attachmentEntityTypeSchema,
  createAttachmentSchema,
  linkAttachmentSchema,
  decodedBase64Size,
  sanitizeFilename,
  responseMimeFor,
  contentDispositionFor,
} from './attachments.js';

const UUID = '6f1f6f1f-1111-4222-8333-444455556666';

describe('decodedBase64Size', () => {
  it('computes exact size of unpadded data', () => {
    // 'aaaa' -> 3 bytes
    expect(decodedBase64Size('aaaa')).toBe(3);
  });

  it('accounts for single padding', () => {
    const b64 = Buffer.from('hello12!').toString('base64'); // 8 bytes
    expect(decodedBase64Size(b64)).toBe(8);
  });

  it('accounts for double padding', () => {
    const b64 = Buffer.from('hellos!').toString('base64'); // 7 bytes
    expect(decodedBase64Size(b64)).toBe(7);
  });

  it('matches Buffer.byteLength across sizes', () => {
    for (const n of [0, 1, 2, 3, 4, 100, 1024]) {
      const b64 = Buffer.alloc(n, 7).toString('base64');
      expect(decodedBase64Size(b64)).toBe(n);
    }
  });

  it('tolerates whitespace/newlines', () => {
    const b64 = Buffer.from('abcdef').toString('base64');
    const wrapped = b64.slice(0, 4) + '\n' + b64.slice(4);
    expect(decodedBase64Size(wrapped)).toBe(6);
  });

  it('returns 0 for an empty string', () => {
    expect(decodedBase64Size('')).toBe(0);
  });

  it('returns -1 for invalid base64', () => {
    expect(decodedBase64Size('not base64 at all!!')).toBe(-1);
    expect(decodedBase64Size('abc')).toBe(-1); // wrong length
    expect(decodedBase64Size('a===')).toBe(-1); // bad padding
  });

  it('flags blobs over the 5MB cap, accepts at-cap blobs', () => {
    const over = Buffer.alloc(MAX_ATTACHMENT_BYTES + 1).toString('base64');
    expect(decodedBase64Size(over)).toBe(MAX_ATTACHMENT_BYTES + 1);
    const atCap = Buffer.alloc(MAX_ATTACHMENT_BYTES).toString('base64');
    expect(decodedBase64Size(atCap)).toBe(MAX_ATTACHMENT_BYTES);
  });
});

describe('sanitizeFilename', () => {
  it('passes through a normal filename', () => {
    expect(sanitizeFilename('report Q2.pdf')).toBe('report Q2.pdf');
  });

  it('strips path components (unix and windows)', () => {
    expect(sanitizeFilename('../../etc/passwd')).toBe('passwd');
    expect(sanitizeFilename('C:\\Users\\x\\evil.exe')).toBe('evil.exe');
  });

  it('removes quotes, CR/LF, semicolons (header injection)', () => {
    expect(sanitizeFilename('a";\r\nSet-Cookie: x=1.pdf')).toBe('aSet-Cookie: x=1.pdf');
  });

  it('strips leading dots', () => {
    expect(sanitizeFilename('...hidden')).toBe('hidden');
  });

  it('falls back to "attachment" when nothing survives', () => {
    expect(sanitizeFilename('"""')).toBe('attachment');
    expect(sanitizeFilename('')).toBe('attachment');
    expect(sanitizeFilename('a/b/')).toBe('attachment');
  });

  it('caps length at 255', () => {
    expect(sanitizeFilename('x'.repeat(400)).length).toBe(255);
  });
});

describe('responseMimeFor', () => {
  it('keeps inline-safe types', () => {
    expect(responseMimeFor('image/png')).toBe('image/png');
    expect(responseMimeFor('application/pdf')).toBe('application/pdf');
    expect(responseMimeFor('IMAGE/JPEG')).toBe('image/jpeg');
  });

  it('forces octet-stream for scriptable/unknown types (stored-XSS guard)', () => {
    expect(responseMimeFor('text/html')).toBe('application/octet-stream');
    expect(responseMimeFor('image/svg+xml')).toBe('application/octet-stream');
    expect(responseMimeFor('application/javascript')).toBe('application/octet-stream');
    expect(responseMimeFor('whatever/nonsense')).toBe('application/octet-stream');
  });

  it('ignores mime parameters', () => {
    expect(responseMimeFor('image/png; charset=utf-8')).toBe('image/png');
  });
});

describe('contentDispositionFor', () => {
  it('always starts with attachment;', () => {
    expect(contentDispositionFor('x.html')).toMatch(/^attachment; /);
  });

  it('produces a header-safe quoted filename', () => {
    const v = contentDispositionFor('we"ird\r\nname.pdf');
    expect(v).not.toMatch(/[\r\n]/);
    // quoted part must not contain a raw double-quote inside
    const m = v.match(/filename="([^"]*)"/);
    expect(m).toBeTruthy();
  });

  it('encodes non-ascii via RFC 5987 and underscores the ascii fallback', () => {
    const v = contentDispositionFor('résumé.pdf');
    expect(v).toContain("filename*=UTF-8''r%C3%A9sum%C3%A9.pdf");
    expect(v).toContain('filename="r_sum_.pdf"');
  });
});

describe('schemas', () => {
  it('entity type enum accepts todo/issue/rock/meeting', () => {
    expect(attachmentEntityTypeSchema.safeParse('todo').success).toBe(true);
    expect(attachmentEntityTypeSchema.safeParse('issue').success).toBe(true);
    expect(attachmentEntityTypeSchema.safeParse('rock').success).toBe(true);
    expect(attachmentEntityTypeSchema.safeParse('meeting').success).toBe(true);
    expect(attachmentEntityTypeSchema.safeParse('nope').success).toBe(false);
  });

  it('createAttachmentSchema accepts a valid payload', () => {
    const r = createAttachmentSchema.safeParse({
      filename: 'notes.pdf',
      mimeType: 'application/pdf',
      dataBase64: Buffer.from('hi').toString('base64'),
      link: { entityType: 'todo', entityId: UUID },
    });
    expect(r.success).toBe(true);
  });

  it('createAttachmentSchema is strict (unknown keys rejected)', () => {
    const r = createAttachmentSchema.safeParse({
      filename: 'a.txt',
      mimeType: 'text/plain',
      dataBase64: 'aGk=',
      link: { entityType: 'todo', entityId: UUID },
      extra: true,
    });
    expect(r.success).toBe(false);
  });

  it('rejects malformed mime types and bad uuids', () => {
    expect(createAttachmentSchema.safeParse({
      filename: 'a.txt', mimeType: 'not a mime', dataBase64: 'aGk=',
      link: { entityType: 'todo', entityId: UUID },
    }).success).toBe(false);
    expect(linkAttachmentSchema.safeParse({ entityType: 'rock', entityId: 'nope' }).success).toBe(false);
  });
});
