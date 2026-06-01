// Standalone verifier for the Ninety import service. Generates synthetic
// Ninety-style exports (XLSX with realistic headers + a CSV scorecard), runs
// previewNinetyImport over the buffers, and asserts the reconstruction.
// Run: npx tsx scripts/verify-ninety-import.ts
import * as XLSX from 'xlsx';
import { previewNinetyImport, detectModule } from '../src/services/ninety-import.js';

function xlsxBuf(sheets: Record<string, Record<string, unknown>[]>): Buffer {
  const wb = XLSX.utils.book_new();
  for (const [name, rows] of Object.entries(sheets)) {
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), name);
  }
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
}
function csvBuf(rows: Record<string, unknown>[]): Buffer {
  const ws = XLSX.utils.json_to_sheet(rows);
  return Buffer.from(XLSX.utils.sheet_to_csv(ws), 'utf8');
}

// --- synthetic Ninety exports ---
const rocks = xlsxBuf({
  Rocks: [
    { Title: 'Launch new website', Owner: 'David Steel', 'Due Date': '2026-06-30', Status: 'On Track' },
    { Title: 'Hire 2 setters', Owner: 'Bogdan Tabaka', 'Due Date': '2026-06-30', Status: 'Off Track' },
    { Title: 'Close Q2 books', Owner: 'Janine', 'Due Date': '2026-06-30', Status: 'On Track' },
  ],
  Milestones: [
    { Title: 'Wireframes done', Owner: 'David Steel', 'Due Date': '2026-05-15' },
  ],
});
const todos = xlsxBuf({
  'To-Dos': [
    { 'To-Do': 'Send proposal to Acme', Owner: 'David Steel', 'Due Date': '2026-06-05', Completed: 'No' },
    { 'To-Do': 'Update scorecard', Owner: 'Bogdan Tabaka', 'Due Date': '2026-06-02', Completed: 'Yes' },
    { 'To-Do': 'Review payroll', Owner: 'Janine', 'Due Date': '2026-06-03', Completed: 'No' },
  ],
});
const issues = xlsxBuf({
  'Short Term': [
    { Issue: 'Slow lead response time', 'Created By': 'Bogdan Tabaka' },
    { Issue: 'Website conversion dropped', 'Created By': 'David Steel' },
  ],
  'Long Term': [
    { Issue: 'Need a CRM migration plan', 'Created By': 'David Steel' },
  ],
});
const headlines = xlsxBuf({
  Headlines: [
    { Headline: 'Client X renewed for 12 months', Owner: 'David Steel', Type: 'Customer' },
    { Headline: 'New hire started Monday', Owner: 'Janine', Type: 'Employee' },
  ],
});
// scorecard CSV: measurable + owner + goal + weekly date columns
const scorecard = csvBuf([
  { Measurable: 'Qualified calls', Owner: 'David Steel', Goal: '> 10', '06/01/2026': '12', '06/08/2026': '9', '06/15/2026': '14' },
  { Measurable: 'Cash balance', Owner: 'Janine', Goal: '> 50000', '06/01/2026': '61000', '06/08/2026': '58000', '06/15/2026': '63000' },
]);

const preview = previewNinetyImport([
  { filename: 'Rocks.xlsx', buffer: rocks },
  { filename: 'To-Dos.xlsx', buffer: todos },
  { filename: 'Issues.xlsx', buffer: issues },
  { filename: 'Headlines.xlsx', buffer: headlines },
  { filename: 'Scorecard.csv', buffer: scorecard },
]);

console.log('\n=== detectModule spot checks ===');
console.log('Rocks sheet ->', detectModule('Rocks', 'Rocks.xlsx', ['Title', 'Owner', 'Due Date', 'Status']));
console.log('Milestones  ->', detectModule('Milestones', 'Rocks.xlsx', ['Title', 'Owner', 'Due Date']));
console.log('Short Term  ->', detectModule('Short Term', 'Issues.xlsx', ['Issue', 'Created By']));
console.log('Scorecard   ->', detectModule('Sheet1', 'Scorecard.csv', ['Measurable', 'Owner', 'Goal', '06/01/2026', '06/08/2026', '06/15/2026']));

console.log('\n=== counts ===');
console.log(preview.counts);
console.log('totalRecords:', preview.totalRecords, '| unassigned:', preview.unassigned, '| unmappedSheets:', preview.unmappedSheets);

console.log('\n=== reconstructed roster (from owner columns) ===');
for (const m of preview.roster) {
  console.log(`${m.name.padEnd(16)} total=${m.total}  rocks=${m.rocks} todos=${m.todos} issues=${m.issues} headlines=${m.headlines} kpis=${m.kpis}`);
}

console.log('\n=== warnings ===');
preview.warnings.forEach(w => console.log('-', w));

// --- assertions ---
const errs: string[] = [];
const c = preview.counts;
if (c.rocks !== 4) errs.push(`rocks expected 4 got ${c.rocks}`); // 3 rocks + 1 milestone
if (c.todos !== 3) errs.push(`todos expected 3 got ${c.todos}`);
if (c.issues !== 3) errs.push(`issues expected 3 got ${c.issues}`);
if (c.headlines !== 2) errs.push(`headlines expected 2 got ${c.headlines}`);
if (c.scorecard !== 2) errs.push(`scorecard expected 2 got ${c.scorecard}`);
if (c.unknown !== 0) errs.push(`unknown expected 0 got ${c.unknown}`);
const david = preview.roster.find(m => m.name === 'David Steel');
if (!david) errs.push('David Steel missing from roster');
else {
  if (david.rocks !== 2) errs.push(`David rocks expected 2 got ${david.rocks}`); // 1 rock + 1 milestone
  if (david.kpis !== 1) errs.push(`David kpis expected 1 got ${david.kpis}`);
}
if (preview.roster.length !== 3) errs.push(`roster size expected 3 got ${preview.roster.length}`);

if (errs.length) {
  console.error('\nFAILED:\n' + errs.map(e => '  - ' + e).join('\n'));
  process.exit(1);
}
console.log('\nALL ASSERTIONS PASSED');
