import cron from 'node-cron';
import { and, eq, isNull, isNotNull, lte, sql } from 'drizzle-orm';
import path from 'path';
import { fileURLToPath } from 'url';
import ejs from 'ejs';
import { db } from '../config/database.js';
import { onboardingSequence } from '../db/schema.js';
import { sendEmail } from '../config/email.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EMAIL_2_DELAY_DAYS = 3;
const EMAIL_3_DELAY_DAYS = 7;

interface EmailTemplate {
  templateFile: string;
  subject: string;
}

const EMAIL_2: EmailTemplate = {
  templateFile: 'onboarding-day-3.ejs',
  subject: 'What another org already figured out',
};

const EMAIL_3: EmailTemplate = {
  templateFile: 'onboarding-day-7.ejs',
  subject: 'Your turn -- publish your first OOS',
};

async function renderAndSend(email: string, tpl: EmailTemplate): Promise<boolean> {
  try {
    const templatePath = path.resolve(__dirname, '../templates/emails', tpl.templateFile);
    const html = await ejs.renderFile(templatePath, { email });
    return await sendEmail({
      to: email,
      subject: tpl.subject,
      html,
      from: 'David Steel <notifications@orgtp.com>',
    });
  } catch (err) {
    console.error(`[onboarding-scheduler] Failed to render/send ${tpl.templateFile}:`, err);
    return false;
  }
}

async function sendEmail2Batch(): Promise<{ sent: number; failed: number }> {
  const threshold = new Date(Date.now() - EMAIL_2_DELAY_DAYS * 24 * 60 * 60 * 1000);

  const rows = await db
    .select()
    .from(onboardingSequence)
    .where(
      and(
        isNotNull(onboardingSequence.email1SentAt),
        isNull(onboardingSequence.email2SentAt),
        isNull(onboardingSequence.unsubscribedAt),
        lte(onboardingSequence.signupAt, threshold),
      ),
    )
    .limit(200);

  let sent = 0;
  let failed = 0;
  for (const row of rows) {
    const ok = await renderAndSend(row.email, EMAIL_2);
    if (ok) {
      await db
        .update(onboardingSequence)
        .set({ email2SentAt: new Date() })
        .where(eq(onboardingSequence.id, row.id));
      sent++;
      console.log(`[onboarding-scheduler] email #2 sent to ${row.email}`);
    } else {
      failed++;
    }
  }
  return { sent, failed };
}

async function sendEmail3Batch(): Promise<{ sent: number; failed: number }> {
  const threshold = new Date(Date.now() - EMAIL_3_DELAY_DAYS * 24 * 60 * 60 * 1000);

  const rows = await db
    .select()
    .from(onboardingSequence)
    .where(
      and(
        isNotNull(onboardingSequence.email2SentAt),
        isNull(onboardingSequence.email3SentAt),
        isNull(onboardingSequence.unsubscribedAt),
        lte(onboardingSequence.signupAt, threshold),
      ),
    )
    .limit(200);

  let sent = 0;
  let failed = 0;
  for (const row of rows) {
    const ok = await renderAndSend(row.email, EMAIL_3);
    if (ok) {
      await db
        .update(onboardingSequence)
        .set({ email3SentAt: new Date() })
        .where(eq(onboardingSequence.id, row.id));
      sent++;
      console.log(`[onboarding-scheduler] email #3 sent to ${row.email}`);
    } else {
      failed++;
    }
  }
  return { sent, failed };
}

export async function runOnboardingTick(): Promise<void> {
  try {
    const r2 = await sendEmail2Batch();
    const r3 = await sendEmail3Batch();
    if (r2.sent + r3.sent + r2.failed + r3.failed > 0) {
      console.log(
        `[onboarding-scheduler] tick complete. email2: sent=${r2.sent} failed=${r2.failed}. email3: sent=${r3.sent} failed=${r3.failed}.`,
      );
    }
  } catch (err) {
    console.error('[onboarding-scheduler] tick failed:', err);
  }
}

let scheduled = false;
export function startOnboardingScheduler(): void {
  if (scheduled) return;
  scheduled = true;

  cron.schedule('15 * * * *', () => {
    void runOnboardingTick();
  });

  console.log('[onboarding-scheduler] started (runs at :15 every hour)');
}
