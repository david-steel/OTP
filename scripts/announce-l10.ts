// Announce the Weekly Meeting layer to active newsletter subscribers + David.
// Two modes:
//   --dry-run (default) -- prints recipient list + email body, sends nothing
//   --send             -- actually sends via Resend
//
// Usage:
//   railway run npx tsx scripts/announce-l10.ts            (dry-run)
//   railway run npx tsx scripts/announce-l10.ts --send     (live send)

import pg from 'pg';
import { Resend } from 'resend';

const url = process.env.DATABASE_URL!;
const apiKey = process.env.RESEND_API_KEY || '';
const SEND = process.argv.includes('--send');

const SUBJECT = 'You can now run your weekly leadership meeting from OTP';
const FROM = 'David Steel <notifications@mail.orgtp.com>';

function bodyHtml(name: string | null) {
  const greeting = name ? `Hey ${name.split(' ')[0]},` : 'Hey there,';
  return `<!doctype html><html><body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width:640px; margin:0 auto; padding:24px; color:#111827; line-height:1.55;">

<p>${greeting}</p>

<p>Quick note: OTP just got a real <strong>Weekly Leadership Meeting</strong> tool. Live now at <a href="https://orgtp.com/l10" style="color:#10b981;">orgtp.com/l10</a>.</p>

<p>If you've ever sat through a Monday leadership meeting where the scorecard is in one tab, the rocks are in a Google Doc, the issues are in someone's notebook, and the action items go to die in Slack -- this is for you. One page. One agenda. Built around the work your team is actually doing.</p>

<h3 style="margin-top:28px; font-size:16px;">What's in it</h3>

<ul style="padding-left:20px;">
  <li><strong>The 7-section agenda on one page</strong>: Checkin, Scorecard, Quarterly Priorities, Headlines, To-Dos, Issues, Conclude. Per-section timer that goes red when you go over.</li>
  <li><strong>Identify-Discuss-Solve workflow on issues</strong>. Solve an issue and it auto-creates a 7-day follow-up to-do for whoever owns it, then appends the resolution to a cascading recap that builds itself.</li>
  <li><strong>Scorecard with humans and AI agents side by side</strong>. Push KPIs from any source. See on-track / off-track at a glance.</li>
  <li><strong>Per-person accountability profiles</strong>. Click anyone on your org chart -- humans or agents -- and see what they own, what they've delivered, every meeting they've been in.</li>
</ul>

<h3 style="margin-top:28px; font-size:16px;">Why I built it</h3>

<p>I'm running Sneeze It's leadership meeting from this page on Tuesday. The first version of any tool I build for OTP starts as the thing I needed for my own team. Everything you see at <a href="https://orgtp.com/l10" style="color:#10b981;">orgtp.com/l10</a> is the version I'm betting my own meeting on.</p>

<p>The bigger thesis: most leadership-meeting software treats AI agents as outsiders. This one invites them in. They can own quarterly priorities, own to-dos, attend meetings, contribute to the cascading recap. If you're building an AI-augmented team, you need a meeting tool that knows agents exist.</p>

<h3 style="margin-top:28px; font-size:16px;">Try it</h3>

<p>Sign in at <a href="https://orgtp.com" style="color:#10b981;">orgtp.com</a>, click <strong>Team</strong>, then click the green <strong>Run Weekly Meeting</strong> button at the top right. Create a meeting, invite your team (humans and agents), start it. Takes about 90 seconds to set up.</p>

<p>Read the full What's New entry at <a href="https://orgtp.com/whats-new" style="color:#10b981;">orgtp.com/whats-new</a>.</p>

<p style="margin-top:28px;">As always, hit reply if anything breaks or feels wrong. I read every reply.</p>

<p>David<br>
<span style="color:#6b7280; font-size:13px;">Founder, OTP -- the coordination intelligence layer for AI-native organizations</span></p>

<p style="font-size:11px; color:#9ca3af; margin-top:32px; padding-top:16px; border-top:1px solid #e5e7eb;">
You're getting this because you signed up at orgtp.com or were added by David personally. Reply with "unsubscribe" if you want off the list.
</p>

</body></html>`;
}

async function main() {
  const c = new pg.Client({ connectionString: url });
  await c.connect();
  // Two cohorts: newsletter (pre-signups, founder-friend list) AND onboarding
  // (Clerk users who actually signed up). Dedup by lowercased email.
  const subs = await c.query(`SELECT email, name FROM newsletter_subscribers WHERE unsubscribed_at IS NULL ORDER BY subscribed_at DESC`);
  const users = await c.query(`SELECT email FROM onboarding_sequence WHERE unsubscribed_at IS NULL ORDER BY signup_at DESC`);
  await c.end();

  const seen = new Set<string>();
  const recipients: { email: string; name: string | null; source: string }[] = [];
  function add(email: string, name: string | null, source: string) {
    const key = email.trim().toLowerCase();
    if (!key || seen.has(key)) return;
    seen.add(key);
    recipients.push({ email: email.trim(), name, source });
  }
  for (const r of subs.rows as { email: string; name: string | null }[]) add(r.email, r.name, 'newsletter');
  for (const r of users.rows as { email: string }[]) add(r.email, null, 'signup');
  // Always include David himself.
  add('dsteel@sneeze.it', 'David Steel', 'self');

  console.log(`\n=== Recipients (${recipients.length}) ===`);
  for (const r of recipients) console.log(`  [${r.source.padEnd(9)}] ${r.email}${r.name ? ' (' + r.name + ')' : ''}`);
  console.log(`\nSubject: ${SUBJECT}`);
  console.log(`From   : ${FROM}`);

  if (!SEND) {
    console.log(`\n--- DRY RUN. Re-run with --send to actually send. ---\n`);
    console.log('=== Body preview (first recipient personalized) ===');
    console.log(bodyHtml(recipients[0]?.name || null).slice(0, 1200));
    console.log('... (truncated for preview)');
    return;
  }

  if (!apiKey) {
    console.error('RESEND_API_KEY not set in env. Cannot send.');
    process.exit(1);
  }
  const resend = new Resend(apiKey);

  let ok = 0, fail = 0;
  for (const r of recipients) {
    try {
      const { error } = await resend.emails.send({
        from: FROM,
        to: [r.email],
        subject: SUBJECT,
        html: bodyHtml(r.name),
      });
      if (error) { console.error(`  FAIL ${r.email}: ${error.message || JSON.stringify(error)}`); fail++; }
      else { console.log(`  sent ${r.email}`); ok++; }
    } catch (e: any) {
      console.error(`  ERROR ${r.email}: ${e.message}`); fail++;
    }
    await new Promise(r2 => setTimeout(r2, 500)); // gentle pacing
  }
  console.log(`\nDone. ${ok} sent, ${fail} failed.`);
}

main().catch(e => { console.error(e.message); process.exit(1); });
