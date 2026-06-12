// Render harness for the Quarterly Priorities hub (rocks-hub.ejs) on both
// dual-render paths. DB-free -- rendered directly with ejs, no Fastify, no
// DATABASE_URL. Mirrors rock-smart-render.test.ts / guide-render.test.ts.
import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'node:url';
import ejs from 'ejs';

const VIEWS = fileURLToPath(new URL('.', import.meta.url));
const ROCKS_HUB = `${VIEWS}pages/rocks-hub.ejs`;
const V7 = `${VIEWS}layouts/v7.ejs`;

const SMART_ROCK = {
  id: '11111111-1111-1111-1111-111111111111',
  title: 'Hit 20% close rate',
  ownerExternalId: 'HUM_DAVID',
  ownerName: 'David',
  onTrack: true,
  completedAt: null,
  dueDate: new Date('2026-09-30T00:00:00.000Z'),
  smartData: { specific: 'Close 20% of qualified leads' },
};
const PLAIN_ROCK = {
  id: '22222222-2222-2222-2222-222222222222',
  title: 'Ship the new onboarding',
  ownerExternalId: 'HUM_DAVID',
  ownerName: 'David',
  onTrack: false,
  completedAt: null,
  dueDate: new Date('2020-01-01T00:00:00.000Z'), // past -> overdue
  smartData: null,
};

const baseLocals = {
  title: 'Quarterly Priorities - OTP',
  description: 'desc',
  canonical: 'https://orgtp.com/rocks',
  breadcrumbs: [{ name: 'Home', url: 'https://orgtp.com/' }],
  rocks: [SMART_ROCK, PLAIN_ROCK],
  milestoneCounts: { [SMART_ROCK.id]: { done: 1, total: 3 } },
  quarter: '2026-Q3',
  canEdit: true,
  meOwnerId: 'HUM_DAVID',
};

describe('rocks-hub.ejs (Quarterly Priorities hub)', () => {
  it('renders the authed in-shell body with the nav-pad trim', async () => {
    const body = await ejs.renderFile(ROCKS_HUB, { ...baseLocals, authUserId: 'user_test' });
    expect(body).toContain('style="padding-top:56px;"');
  });

  it('renders the v7 signed-out compose (page body + v7 layout)', async () => {
    const ctx = { clerkPubKey: '', clerkInstance: '', assetVersion: 'test', ...baseLocals };
    const inner = await ejs.renderFile(ROCKS_HUB, ctx);
    const html = await ejs.renderFile(V7, { ...ctx, body: inner });
    expect(html).toContain('Quarterly Priorities');
  });

  it('renders the hero + the current quarter', async () => {
    const body = await ejs.renderFile(ROCKS_HUB, { ...baseLocals, authUserId: 'u' });
    expect(body).toContain('Quarterly Priorities');
    expect(body).toContain('Your SMART Rocks for this quarter');
    expect(body).toContain('2026-Q3');
  });

  it('shows the create button for editors', async () => {
    const body = await ejs.renderFile(ROCKS_HUB, { ...baseLocals, authUserId: 'u' });
    expect(body).toContain('id="qp-new"');
    expect(body).toContain('New SMART Rock');
    // create-then-route flow is wired in the inline script
    expect(body).toContain("api('POST', '/rocks'");
    expect(body).toContain("window.location.href = '/rocks/' + id + '/smart'");
  });

  it('hides the create button + script for read-only roles', async () => {
    const body = await ejs.renderFile(ROCKS_HUB, { ...baseLocals, authUserId: 'u', canEdit: false });
    expect(body).not.toContain('id="qp-new"');
    expect(body).not.toContain("api('POST', '/rocks'");
    // but the list is still shown
    expect(body).toContain('Hit 20% close rate');
  });

  it('renders a rock card linking to its /rocks/:id/smart planner', async () => {
    const body = await ejs.renderFile(ROCKS_HUB, { ...baseLocals, authUserId: 'u' });
    expect(body).toContain(`href="/rocks/${SMART_ROCK.id}/smart"`);
    expect(body).toContain('Hit 20% close rate');
  });

  it('renders the SMART badge only when smart_data is populated', async () => {
    const body = await ejs.renderFile(ROCKS_HUB, { ...baseLocals, authUserId: 'u' });
    // only one rock (SMART_ROCK) carries smartData. Count rendered badge
    // spans, not the CSS rule (which also names the class).
    const smartBadges = body.match(/qp-badge qp-badge-smart/g) || [];
    expect(smartBadges.length).toBe(1);
    // PLAIN_ROCK (no smartData) must not get a badge
    const plainOnly = await ejs.renderFile(ROCKS_HUB, { ...baseLocals, authUserId: 'u', rocks: [PLAIN_ROCK], milestoneCounts: {} });
    expect(plainOnly.match(/qp-badge qp-badge-smart/g) || []).toHaveLength(0);
  });

  it('renders status badges, milestone chip, and overdue styling', async () => {
    const body = await ejs.renderFile(ROCKS_HUB, { ...baseLocals, authUserId: 'u' });
    expect(body).toContain('On track');   // SMART_ROCK
    expect(body).toContain('Off track');  // PLAIN_ROCK
    expect(body).toContain('1/3 milestones');
    expect(body).toContain('(overdue)');  // PLAIN_ROCK due in the past
  });

  it('renders the empty state with a create button when no rocks', async () => {
    const body = await ejs.renderFile(ROCKS_HUB, { ...baseLocals, authUserId: 'u', rocks: [], milestoneCounts: {} });
    expect(body).toContain('No quarterly priorities yet');
    expect(body).toContain('id="qp-new-empty"');
  });

  it('empty state for read-only roles shows no create button', async () => {
    const body = await ejs.renderFile(ROCKS_HUB, { ...baseLocals, authUserId: 'u', rocks: [], milestoneCounts: {}, canEdit: false });
    expect(body).toContain('No quarterly priorities yet');
    expect(body).not.toContain('id="qp-new-empty"');
  });

  it('escapes hostile rock titles (no markup breakout)', async () => {
    const evil = { ...PLAIN_ROCK, title: '<img src=x onerror=alert(1)>' };
    const body = await ejs.renderFile(ROCKS_HUB, { ...baseLocals, authUserId: 'u', rocks: [evil], milestoneCounts: {} });
    expect(body).not.toContain('<img src=x onerror=alert(1)>');
    expect(body).toContain('&lt;img src=x onerror=alert(1)&gt;');
  });
});
