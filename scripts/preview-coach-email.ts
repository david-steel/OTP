// Renders the coach founding-25 email with a sample coach and writes to disk for browser preview.
// Run: npx tsx scripts/preview-coach-email.ts

import { renderCoachFoundingEmail } from '../templates/emails/coach-founding-25/template';
import * as fs from 'fs';

const out = renderCoachFoundingEmail({
  firstName: 'Brock',
  lastName: 'Beiersdoerfer',
  profileSlug: 'brock-beiersdoerfer',
  profileTagline: 'Guiding leadership teams through overcoming inefficiencies',
});

const outPath = '/tmp/coach-email-preview.html';
fs.writeFileSync(outPath, out.html);

console.log('Subject:', out.subject);
console.log('Preheader:', out.preheader);
console.log('Wrote:', outPath);
console.log('HTML length:', out.html.length, 'bytes');
console.log('');
console.log('Open in browser:');
console.log('  open ' + outPath);
