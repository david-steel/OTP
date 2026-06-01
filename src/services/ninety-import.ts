// Ninety.io -> OTP import: PURE parsing + reconstruction logic.
//
// Deliberately DB-FREE so it can be unit-tested without DATABASE_URL (see
// feedback_otp_pure_logic_needs_db_free_module). It takes raw uploaded file
// buffers (XLSX or CSV exported from Ninety) and produces a structured preview:
// per-module record counts plus a reconstructed roster built from the OWNER
// columns that every clean Ninety export carries.
//
// The strategic point: Ninety has no structured Accountability Chart export
// (PDF only). But Rocks/To-Dos/Issues/Headlines/Scorecard all carry an owner
// name, so we rebuild the chart from who-owns-what instead of from Ninety's
// chart. This module is that reconstruction. It writes nothing.
import * as XLSX from 'xlsx';

export type NinetyModule = 'rocks' | 'todos' | 'issues' | 'headlines' | 'scorecard' | 'unknown';

export const CLEAN_MODULES: NinetyModule[] = ['rocks', 'todos', 'issues', 'headlines', 'scorecard'];

export interface NormalizedRecord {
  module: NinetyModule;
  title: string;
  owner: string | null;
  extra: Record<string, unknown>;
}

export interface ParsedSheet {
  filename: string;
  sheetName: string;
  module: NinetyModule;
  rowCount: number;
  records: NormalizedRecord[];
  warnings: string[];
}

export interface RosterMember {
  name: string;
  rocks: number;
  todos: number;
  issues: number;
  headlines: number;
  kpis: number;
  total: number;
}

export interface ImportPreview {
  files: Array<{ filename: string; sheets: Array<{ sheetName: string; module: NinetyModule; rowCount: number }>; warnings: string[] }>;
  counts: Record<NinetyModule, number>;
  totalRecords: number;
  roster: RosterMember[];
  unassigned: number;
  unmappedSheets: number;
  warnings: string[];
}

// ---- header / value helpers ------------------------------------------------

const norm = (s: unknown): string => String(s ?? '').trim().toLowerCase().replace(/\s+/g, ' ');

// First value in `row` whose header matches any candidate (exact or contains).
function pick(row: Record<string, unknown>, candidates: string[]): { key: string; value: string } | null {
  const keys = Object.keys(row);
  // exact match first, then "contains"
  for (const cand of candidates) {
    const hit = keys.find(k => norm(k) === cand);
    if (hit && String(row[hit] ?? '').trim()) return { key: hit, value: String(row[hit]).trim() };
  }
  for (const cand of candidates) {
    const hit = keys.find(k => norm(k).includes(cand));
    if (hit && String(row[hit] ?? '').trim()) return { key: hit, value: String(row[hit]).trim() };
  }
  return null;
}

const OWNER_HEADERS = ['owner', 'owner name', 'accountable', 'who', 'assigned to', 'assignee', 'responsible', 'created by', 'author', 'user', 'attendee'];
const TITLE_HEADERS = ['title', 'name', 'rock', 'to-do', 'todo', 'to do', 'issue', 'headline', 'kpi', 'measurable', 'metric', 'description', 'subject'];

function resolveOwner(row: Record<string, unknown>): string | null {
  const hit = pick(row, OWNER_HEADERS);
  if (!hit) return null;
  // Ninety sometimes stores "First Last (email)" -- keep the human name.
  return hit.value.replace(/\s*\([^)]*@[^)]*\)\s*$/, '').trim() || null;
}

function resolveTitle(row: Record<string, unknown>): string {
  const hit = pick(row, TITLE_HEADERS);
  return hit ? hit.value : '';
}

// A header that looks like a scorecard period column (a date or week label).
const DATE_HEADER_RE = /(\d{1,2}[\/\-]\d{1,2})|(\d{4})|(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)|(week|wk|w\/e|w\/c)/i;

function looksLikeScorecard(headers: string[]): boolean {
  const dateCols = headers.filter(h => DATE_HEADER_RE.test(h)).length;
  const hasMeasurable = headers.some(h => /kpi|measurable|metric|scorecard/i.test(h));
  const hasGoal = headers.some(h => /goal|target/i.test(h));
  return hasMeasurable || (dateCols >= 3 && hasGoal) || dateCols >= 4;
}

// Decide which Ninety module a sheet is, from sheet name + filename + headers.
export function detectModule(sheetName: string, filename: string, headers: string[]): NinetyModule {
  const hay = `${norm(sheetName)} ${norm(filename)}`;
  const h = headers.map(norm);
  const hasHeader = (re: RegExp) => h.some(x => re.test(x));

  if (/scorecard|measurable|kpi|metric/.test(hay) || looksLikeScorecard(headers)) return 'scorecard';
  if (/milestone/.test(hay)) return 'rocks'; // rocks export ships a Milestones tab
  if (/\brock/.test(hay) || hasHeader(/^rock\b/)) return 'rocks';
  if (/headline/.test(hay) || hasHeader(/headline/)) return 'headlines';
  if (/issue|short[- ]term|long[- ]term|ids/.test(hay) || hasHeader(/^issue/)) return 'issues';
  if (/to[- ]?do|todo|task/.test(hay) || hasHeader(/to[- ]?do/)) return 'todos';
  return 'unknown';
}

// ---- parsing ---------------------------------------------------------------

function parseSheet(filename: string, sheetName: string, rows: Record<string, unknown>[]): ParsedSheet {
  const warnings: string[] = [];
  const headers = rows.length ? Object.keys(rows[0]) : [];
  const module = detectModule(sheetName, filename, headers);

  const records: NormalizedRecord[] = [];
  for (const row of rows) {
    const title = resolveTitle(row);
    const owner = resolveOwner(row);
    if (!title && !owner) continue; // skip blank/spacer rows
    records.push({ module, title: title || '(untitled)', owner, extra: {} });
  }

  if (module === 'issues' && headers.some(k => /comment/i.test(k)) === false) {
    // documented Ninety gap, surfaced so the user knows discussion history is lossy
  }
  if (module === 'unknown' && records.length) {
    warnings.push(`Could not match "${sheetName}" to a known Ninety module. ${records.length} rows skipped from the roster.`);
  }

  return { filename, sheetName, module, rowCount: records.length, records, warnings };
}

// Parse one uploaded file (XLSX with N sheets, or a single-sheet CSV).
export function parseNinetyFile(buffer: Buffer, filename: string): ParsedSheet[] {
  let wb: XLSX.WorkBook;
  try {
    wb = XLSX.read(buffer, { type: 'buffer', cellDates: false });
  } catch (err) {
    return [{ filename, sheetName: '(unreadable)', module: 'unknown', rowCount: 0, records: [],
      warnings: [`Could not read "${filename}" as XLSX or CSV: ${(err as Error).message}`] }];
  }
  const out: ParsedSheet[] = [];
  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: null, raw: false });
    if (!rows.length) continue;
    out.push(parseSheet(filename, sheetName, rows));
  }
  if (!out.length) {
    out.push({ filename, sheetName: '(empty)', module: 'unknown', rowCount: 0, records: [],
      warnings: [`"${filename}" had no readable rows.`] });
  }
  return out;
}

// ---- reconstruction --------------------------------------------------------

function rosterBucket(member: RosterMember, module: NinetyModule): void {
  if (module === 'rocks') member.rocks++;
  else if (module === 'todos') member.todos++;
  else if (module === 'issues') member.issues++;
  else if (module === 'headlines') member.headlines++;
  else if (module === 'scorecard') member.kpis++;
}

// Build the full preview (counts + reconstructed roster) from parsed sheets.
export function buildPreview(sheets: ParsedSheet[]): ImportPreview {
  const counts: Record<NinetyModule, number> = { rocks: 0, todos: 0, issues: 0, headlines: 0, scorecard: 0, unknown: 0 };
  const byOwner = new Map<string, RosterMember>();
  let unassigned = 0;
  let totalRecords = 0;
  let unmappedSheets = 0;
  const warnings: string[] = [];

  // group sheets back under their file for the response
  const fileMap = new Map<string, { filename: string; sheets: Array<{ sheetName: string; module: NinetyModule; rowCount: number }>; warnings: string[] }>();

  for (const sheet of sheets) {
    if (!fileMap.has(sheet.filename)) fileMap.set(sheet.filename, { filename: sheet.filename, sheets: [], warnings: [] });
    const f = fileMap.get(sheet.filename)!;
    f.sheets.push({ sheetName: sheet.sheetName, module: sheet.module, rowCount: sheet.rowCount });
    f.warnings.push(...sheet.warnings);
    warnings.push(...sheet.warnings);
    if (sheet.module === 'unknown') unmappedSheets++;

    for (const rec of sheet.records) {
      counts[rec.module]++;
      if (rec.module === 'unknown') continue;
      totalRecords++;
      const name = rec.owner;
      if (!name) { unassigned++; continue; }
      const key = norm(name);
      if (!byOwner.has(key)) byOwner.set(key, { name, rocks: 0, todos: 0, issues: 0, headlines: 0, kpis: 0, total: 0 });
      rosterBucket(byOwner.get(key)!, rec.module);
    }
  }

  const roster = [...byOwner.values()]
    .map(m => ({ ...m, total: m.rocks + m.todos + m.issues + m.headlines + m.kpis }))
    .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));

  if (counts.issues > 0) warnings.push('Ninety drops Issue comments on export, so discussion history will not transfer. Titles and owners do.');
  if (counts.scorecard > 0) warnings.push('Scorecard history is bounded by the date range set in Ninety at export time. Widen it before exporting to capture full history.');

  return {
    files: [...fileMap.values()],
    counts,
    totalRecords,
    roster,
    unassigned,
    unmappedSheets,
    warnings: [...new Set(warnings)],
  };
}

// Top-level: parse many uploaded files into one preview.
export function previewNinetyImport(uploads: Array<{ filename: string; buffer: Buffer }>): ImportPreview {
  const sheets: ParsedSheet[] = [];
  for (const u of uploads) sheets.push(...parseNinetyFile(u.buffer, u.filename));
  return buildPreview(sheets);
}
