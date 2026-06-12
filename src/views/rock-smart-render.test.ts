// Render harness for the SMART Rock Planner page (rock-smart.ejs) on both
// dual-render paths. DB-free -- rendered directly with ejs, no Fastify, no
// DATABASE_URL. Mirrors guide-render.test.ts.
import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'node:url';
import ejs from 'ejs';

const VIEWS = fileURLToPath(new URL('.', import.meta.url));
const ROCK_SMART = `${VIEWS}pages/rock-smart.ejs`;
const V7 = `${VIEWS}layouts/v7.ejs`;

const stubRock = {
  id: '11111111-1111-1111-1111-111111111111',
  title: 'Hit 20% close rate',
  description: 'Lift qualified-lead close rate to 20% by quarter end.',
  ownerExternalId: 'HUM_DAVID',
  ownerName: 'David',
  dueDate: new Date('2026-09-30T00:00:00.000Z'),
  smartData: {
    specific: 'Close 20% of qualified leads',
    measurable: 'Weekly close-rate report',
    attainable: 'Yes with the new SDR',
    relevant: 'Serves the revenue plan',
    timeFramed: 'By Sep 30; mid-quarter checkpoint',
    finishLine: 'Three months sustained at 20%+',
    resources: ['SDR hire', 'CRM dashboard'],
    obstacles: ['Hiring lag'],
  },
};
const stubMilestones = [
  { id: 'aaaaaaa1-1111-1111-1111-111111111111', title: 'First step: define qualified', dueDate: '2026-07-15', completedAt: null },
  { id: 'aaaaaaa2-1111-1111-1111-111111111111', title: 'Mid step: SDR onboarded', dueDate: '2026-08-15', completedAt: '2026-08-10T00:00:00.000Z' },
];
const stubPeople = [
  { entityType: 'human', externalId: 'HUM_DAVID', name: 'David' },
  { entityType: 'agent', externalId: 'AGT_DIRK', name: 'Dirk' },
];

const baseLocals = {
  title: 'SMART Rock Planner - OTP',
  description: 'desc',
  canonical: 'https://orgtp.com/rocks/x/smart',
  breadcrumbs: [{ name: 'Home', url: 'https://orgtp.com/' }],
  rock: stubRock,
  milestones: stubMilestones,
  assignablePeople: stubPeople,
  canEdit: true,
};

describe('rock-smart.ejs (SMART Rock Planner)', () => {
  it('renders the authed in-shell body with the nav-pad trim', async () => {
    const body = await ejs.renderFile(ROCK_SMART, { ...baseLocals, authUserId: 'user_test' });
    expect(body).toContain('style="padding-top:56px;"');
  });

  it('renders the v7 signed-out compose (page body + v7 layout)', async () => {
    const ctx = { clerkPubKey: '', clerkInstance: '', assetVersion: 'test', ...baseLocals };
    const inner = await ejs.renderFile(ROCK_SMART, ctx);
    const html = await ejs.renderFile(V7, { ...ctx, body: inner });
    expect(html).toContain('SMART Rock Planner');
  });

  it('renders the five SMART prompt fields + the description', async () => {
    const body = await ejs.renderFile(ROCK_SMART, { ...baseLocals, authUserId: 'u' });
    for (const id of ['sr-specific', 'sr-measurable', 'sr-attainable', 'sr-relevant', 'sr-timeFramed']) {
      expect(body).toContain(`id="${id}"`);
    }
    expect(body).toContain('id="sr-description"');
    // the prefilled answers actually land on the page
    expect(body).toContain('Close 20% of qualified leads');
    expect(body).toContain('Lift qualified-lead close rate');
  });

  it('renders the finish line, resources, and obstacles surfaces', async () => {
    const body = await ejs.renderFile(ROCK_SMART, { ...baseLocals, authUserId: 'u' });
    expect(body).toContain('id="sr-finishLine"');
    expect(body).toContain('Three months sustained at 20%+');
    expect(body).toContain('id="sr-resources"');
    expect(body).toContain('id="sr-obstacles"');
    // lists are hydrated client-side from the embedded bootstrap blob
    expect(body).toContain('var RESOURCES =');
    expect(body).toContain('var OBSTACLES =');
    expect(body).toContain('SDR hire');
    expect(body).toContain('Hiring lag');
  });

  it('renders the milestone surface + the milestone bootstrap', async () => {
    const body = await ejs.renderFile(ROCK_SMART, { ...baseLocals, authUserId: 'u' });
    expect(body).toContain('id="sr-ms-list"');
    expect(body).toContain('id="sr-ms-add"');
    expect(body).toContain('var MILESTONES =');
    expect(body).toContain('First step: define qualified');
  });

  it('renders Save + Print buttons when editable', async () => {
    const body = await ejs.renderFile(ROCK_SMART, { ...baseLocals, authUserId: 'u' });
    expect(body).toContain('id="sr-save"');
    expect(body).toContain('id="sr-print"');
    expect(body).toContain('window.print()');
  });

  it('includes scoped print CSS (no-print + @media print)', async () => {
    const body = await ejs.renderFile(ROCK_SMART, { ...baseLocals, authUserId: 'u' });
    expect(body).toContain('@media print');
    expect(body).toContain('.no-print');
  });

  it('hides Save and disables inputs for read-only roles', async () => {
    const body = await ejs.renderFile(ROCK_SMART, { ...baseLocals, authUserId: 'u', canEdit: false });
    expect(body).not.toContain('id="sr-save"');
    // SMART fields rendered disabled
    expect(body).toContain('view-only access');
    expect(body).toMatch(/id="sr-specific"[^>]*disabled/);
  });

  it('escapes user content via jsonForScript (no </script> breakout)', async () => {
    const evilRock = { ...stubRock, smartData: { ...stubRock.smartData, resources: ['</script><script>alert(1)</script>'] } };
    const body = await ejs.renderFile(ROCK_SMART, { ...baseLocals, rock: evilRock, authUserId: 'u' });
    expect(body).toContain('\\u003c/script\\u003e');
    const scriptBody = body.slice(body.indexOf('var RESOURCES ='));
    expect(scriptBody).not.toContain('</script><script>alert(1)');
  });
});
