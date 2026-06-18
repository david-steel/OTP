/**
 * transcript-extract.ts -- pull plain text out of an uploaded transcript file.
 *
 * Notetakers export transcripts in many shapes (Plaud/Fireflies/Gemini PDFs,
 * Word .docx, .srt/.vtt captions, .csv/.json exports, plain .txt). The browser
 * can read text formats itself, but PDF and DOCX are binary -- they must be
 * parsed server-side. This module is the one place that does that, so the route
 * stays thin.
 */

/** Max decoded upload we'll try to parse (10 MB). Transcripts are text-heavy
 *  but a scanned-image PDF can be large; cap so a giant upload can't OOM us. */
export const MAX_TRANSCRIPT_BYTES = 10 * 1024 * 1024;

function ext(filename: string): string {
  const m = /\.([a-z0-9]+)$/i.exec((filename || '').trim());
  return m ? m[1].toLowerCase() : '';
}

/**
 * Extract plain text from a transcript file buffer. PDF + DOCX are parsed;
 * everything else is treated as UTF-8 text. Returns trimmed text (possibly
 * empty if the file had no extractable text, e.g. a scanned-image PDF).
 */
export async function extractTranscriptText(buffer: Buffer, filename: string): Promise<string> {
  const e = ext(filename);
  if (e === 'pdf') {
    // Import the INNER lib, not the package root. pdf-parse's index.js runs a
    // debug harness on `!module.parent` -- true under an ESM dynamic import --
    // which readFileSync's a bundled test PDF relative to cwd and throws ENOENT
    // in production. The lib entry is just the parser, no harness. (Variable
    // specifier so TS doesn't try to type-resolve the subpath.)
    const pdfSpec = 'pdf-parse/lib/pdf-parse.js';
    const mod: any = await import(pdfSpec);
    const pdfParse = mod.default || mod;
    const data = await pdfParse(buffer);
    return String(data?.text || '').trim();
  }
  if (e === 'docx') {
    const mod: any = await import('mammoth');
    const mammoth = mod.default || mod;
    const r = await mammoth.extractRawText({ buffer });
    return String(r?.value || '').trim();
  }
  // txt, vtt, srt, md, csv, json, or anything else: decode as UTF-8 text.
  return buffer.toString('utf8').trim();
}
