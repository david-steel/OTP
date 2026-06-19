// One-off: send David's personal reply to Joel Swanson's first inbound.
// Plain-styled HTML so it reads like a real reply, not a campaign email.
//
// Usage:
//   npx tsx scripts/send-joel-reply.ts --dry-run    # render to stdout, do not send
//   npx tsx scripts/send-joel-reply.ts              # live send
import { sendEmail } from '../src/config/email.js';

const DRY_RUN = process.argv.includes('--dry-run');

const TO = 'Joel.Swanson@eosworldwide.com';
const FROM = 'David Steel <david@mail.orgtp.com>';
const REPLY_TO = 'David Steel <dsteel@sneeze.it>';
const SUBJECT = 'Welcome to the Founding 25, Joel — your 101';

// Light HTML — plain font, bold section headers, no campaign branding.
// Goal: reads like a personal reply, not a marketing send.
const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color:#1a1a1a; max-width: 640px; margin: 0; padding: 24px; line-height: 1.55; font-size: 15px;">
<p>Joel — exactly the feedback I needed. Plain English answers, in your order.</p>

<p><strong>WHO I AM</strong><br/>
David Steel. I built OTP for my own use first — I needed a way to put AI and humans on one accountability chart without the chart falling apart. A few other operators saw it, asked to use it, and that turned into a Founding 25 cohort. EOS coaches were a natural fit because the structure your clients already use (accountability chart, scorecard, SOPs, L10) is exactly the structure OTP needs.</p>

<p><strong>WHAT OTP IS</strong><br/>
At the surface: an accountability chart with AI seats sitting next to human seats. Each seat — AI or human — has a name, a role, a KPI, and an SOP. Click an AI seat: you see what it does, the number it hits, who it reports to. Click a human seat: same.</p>

<p>Under the hood it does more (carries SOPs into the AI runtime so they don't drift, lets agents talk to each other without you in the middle), but the surface is the chart.</p>

<p><strong>WHY AN EOS COACH SHOULD CARE</strong><br/>
Your clients are starting to add AI to their teams. Right now it lives scattered across Notion docs, Zaps, ChatGPT tabs, and Mike-the-IT-guy's head. It's becoming a People and Process issue — except the EOS toolkit doesn't have a seat type for "AI agent" yet.</p>

<p>OTP fills that gap using tools your clients already speak fluently: accountability chart, scorecard, SOP. We just add the AI seats.</p>

<p><strong>WHAT YOU GET AS A FOUNDING 25 COACH</strong><br/>
Your own coach view. Every leadership team you work with shows up in one place — their chart, their AI footprint, their KPIs. Side-by-side. The patterns get visible:</p>
<ul style="margin: 8px 0 12px 20px; padding: 0;">
  <li>Client A has 5 AI tools and nobody owns them. Client B has them all on one chart and is humming.</li>
  <li>Client C's KPIs went red the same week they added an agent.</li>
</ul>

<p>You'll catch things across your whole book of business that today live in your head and last week's session notes. The breakthrough Client A had on Tuesday is visible when you walk into Client B on Thursday. Your coaching sharpens with every client you onboard.</p>

<p>Each client's data stays private to them in their own workspace — you have visibility because you're their coach.</p>

<p>Plus: Founding 25 badge on your public profile, monthly roadmap voting, and a direct line to me.</p>

<p><strong>WHAT'S NEXT</strong><br/>
Two options — pick whichever fits your week:</p>
<ol style="margin: 8px 0 12px 20px; padding: 0;">
  <li>I cut a 5-min walkthrough video and send it.</li>
  <li>We do a 15-min call — I show you live, you tell me what would actually matter for your clients.</li>
</ol>

<p>Reply "video", "call", or both.</p>

<p>— David</p>
</body></html>`;

async function main() {
  console.log(`\n=== Send Joel reply ${DRY_RUN ? '(DRY RUN)' : ''} ===`);
  console.log(`To:       ${TO}`);
  console.log(`From:     ${FROM}`);
  console.log(`Reply-To: ${REPLY_TO}`);
  console.log(`Subject:  ${SUBJECT}`);
  console.log(`HTML:     ${html.length} bytes\n`);
  if (DRY_RUN) {
    console.log('--- BODY PREVIEW (HTML) ---\n');
    console.log(html);
    return;
  }
  const id = await sendEmail({
    to: TO,
    subject: SUBJECT,
    html,
    from: FROM,
    replyTo: REPLY_TO,
    tags: [
      { name: 'campaign', value: 'founding_25_personal_reply' },
      { name: 'slug', value: 'joel-swanson' },
    ],
  });
  if (id) {
    console.log(`\n✓ Sent. messageId=${id}`);
  } else {
    console.error('\n✗ sendEmail returned null. Check RESEND_API_KEY in env.');
    process.exit(1);
  }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
