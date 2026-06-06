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

const DUE_HEADERS = ['due date', 'due', 'deadline', 'due on', 'target date'];
const STATUS_HEADERS = ['on track', 'on-track', 'status', 'progress'];
const DONE_HEADERS = ['completed', 'complete', 'is complete', 'done'];
const DESC_HEADERS = ['description', 'details', 'notes', 'detail'];
const GOAL_HEADERS = ['goal', 'target'];
const UNIT_HEADERS = ['unit', 'units'];

// Parse a loose date string (header or cell) to an ISO date (YYYY-MM-DD), or null.
export function parseDateLoose(s: unknown): string | null {
  const raw = String(s ?? '').trim();
  if (!raw) return null;
  let d = new Date(raw);
  if (isNaN(d.getTime())) {
    const m = raw.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/); // dig a date out of "Week of 6/1/2026"
    if (m) d = new Date(`${m[3].length === 2 ? '20' + m[3] : m[3]}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}`);
  }
  if (isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

// Parse the first number out of a cell ("$61,000" -> 61000, "12%" -> 12), or null.
export function parseNumber(s: unknown): number | null {
  const m = String(s ?? '').replace(/,/g, '').match(/-?\d+(\.\d+)?/);
  return m ? Number(m[0]) : null;
}

export type GoalOp = 'gte' | 'lte' | 'gt' | 'lt' | 'eq';
// Parse a Ninety goal string ("> 10", ">= 50,000", "= 100", "10") into operator+value.
// createKpi requires operator and value to be BOTH set or BOTH null, so we only
// return a pair when a number is present.
export function parseGoal(s: unknown): { operator: GoalOp; value: number } | null {
  const raw = String(s ?? '').trim();
  if (!raw) return null;
  const value = parseNumber(raw);
  if (value == null) return null;
  let operator: GoalOp = 'gte';
  if (/>=|≥/.test(raw)) operator = 'gte';
  else if (/<=|≤/.test(raw)) operator = 'lte';
  else if (/>/.test(raw)) operator = 'gt';
  else if (/</.test(raw)) operator = 'lt';
  else if (/=/.test(raw)) operator = 'eq';
  return { operator, value };
}

function truthy(s: unknown): boolean {
  return /^(yes|y|true|done|complete|completed|1|on track|on-track|green)$/i.test(String(s ?? '').trim());
}
function offTrack(s: unknown): boolean {
  return /(off|behind|at risk|red|late|overdue)/i.test(String(s ?? '').trim());
}

// Build the module-specific `extra` payload that the commit step needs to write.
function extractExtra(module: NinetyModule, row: Record<string, unknown>): Record<string, unknown> {
  if (module === 'rocks') {
    const status = pick(row, STATUS_HEADERS)?.value ?? '';
    return {
      dueDate: parseDateLoose(pick(row, DUE_HEADERS)?.value),
      onTrack: !offTrack(status), // default true unless clearly off track
      description: pick(row, DESC_HEADERS)?.value ?? null,
    };
  }
  if (module === 'todos') {
    const done = pick(row, DONE_HEADERS)?.value ?? '';
    return {
      dueAt: parseDateLoose(pick(row, DUE_HEADERS)?.value),
      done: truthy(done),
      description: pick(row, DESC_HEADERS)?.value ?? null,
    };
  }
  if (module === 'issues') {
    return { description: pick(row, DESC_HEADERS)?.value ?? null };
  }
  if (module === 'scorecard') {
    const goal = parseGoal(pick(row, GOAL_HEADERS)?.value);
    const reserved = new Set([...OWNER_HEADERS, ...TITLE_HEADERS, ...GOAL_HEADERS, ...UNIT_HEADERS].map(norm));
    const values: Array<{ periodStart: string; value: number }> = [];
    for (const key of Object.keys(row)) {
      if (reserved.has(norm(key)) || !DATE_HEADER_RE.test(key)) continue;
      const periodStart = parseDateLoose(key);
      const value = parseNumber(row[key]);
      if (periodStart && value != null) values.push({ periodStart, value });
    }
    return {
      goalOperator: goal?.operator ?? null,
      goalValue: goal?.value ?? null,
      unit: pick(row, UNIT_HEADERS)?.value ?? null,
      values,
    };
  }
  return {};
}

// A header that looks like a scorecard period column (a date or week label).
const DATE_HEADER_RE = /(\d{1,2}[/-]\d{1,2})|(\d{4})|(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)|(week|wk|w\/e|w\/c)/i;

function looksLikeScorecard(headers: string[]): boolean {
  const dateCols = headers.filter(h => DATE_HEADER_RE.test(h)).length;
  const hasMeasurable = headers.some(h => /kpi|measurable|metric|scorecard/i.test(h));
  const hasGoal = headers.some(h => /goal|target/i.test(h));
  return hasMeasurable || (dateCols >= 3 && hasGoal) || dateCols >= 4;
}

// Decide which EOS module a sheet is, from sheet name + filename + headers.
// Works across tools: Ninety (Rocks/To-Dos/Issues/Headlines/Scorecard) and
// Bloom Growth (Quarterly Priorities (Goals) / To-Dos (KPI (Metrics)) /
// O&O (Issues) / Headlines / KPI (Metrics)).
//
// Order matters: explicit module names are matched FIRST, and the scorecard
// check runs LAST because it is the fuzziest (date-column heuristic) and
// because Bloom's To-Dos file is literally named "To-Dos (KPI (Metrics))" --
// the "kpi" substring must NOT make it a scorecard.
export function detectModule(sheetName: string, filename: string, headers: string[]): NinetyModule {
  const hay = `${norm(sheetName)} ${norm(filename)}`;
  const h = headers.map(norm);
  const hasHeader = (re: RegExp) => h.some(x => re.test(x));

  if (/to[- ]?do|todo|task/.test(hay) || hasHeader(/to[- ]?do/)) return 'todos';
  if (/headline/.test(hay) || hasHeader(/headline/)) return 'headlines';
  if (/o&o|issue|short[- ]term|long[- ]term|\bids\b/.test(hay) || hasHeader(/^issue/)) return 'issues';
  if (/\brock|milestone|quarterly priorit|\bgoals?\b/.test(hay) || hasHeader(/^rock\b/)) return 'rocks';
  if (/scorecard|measurable|kpi|metric/.test(hay) || looksLikeScorecard(headers)) return 'scorecard';
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
    records.push({ module, title: title || '(untitled)', owner, extra: extractExtra(module, row) });
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

// Parse many uploaded files into normalized sheets (shared by preview + commit).
export function parseNinetyUploads(uploads: Array<{ filename: string; buffer: Buffer }>): ParsedSheet[] {
  const sheets: ParsedSheet[] = [];
  for (const u of uploads) sheets.push(...parseNinetyFile(u.buffer, u.filename));
  return sheets;
}

// Top-level: parse many uploaded files into one preview.
export function previewNinetyImport(uploads: Array<{ filename: string; buffer: Buffer }>): ImportPreview {
  return buildPreview(parseNinetyUploads(uploads));
}
