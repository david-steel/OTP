// Renders a lifecycle email (from email-series.ts) to HTML.
// Mirrors the brand shell prototyped in .preview/email-series/generate.py:
// deep-green header with the OTP lockup, Orgy mascot, "why this exists" body,
// one CTA, optional cards / did-you-know / secondary line, footer + unsubscribe.
//
// Images are absolute production URLs so they render in every email client.
// PNG (not webp) for Outlook-desktop support.

import type { LifecycleEmail, LifecycleCard } from '../data/email-series.js';

const IMG = 'https://orgtp.com/images';
const GREEN = '#A8E63A';
const GREEN_DEEP = '#8BC42A';
const INK = '#1a2e05';
const BG = '#F5F7FA';
const LINK = '#5a7d1f';

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function header(): string {
  return `<tr><td style="background:${INK};padding:18px 28px 16px 28px;">`
    + `<a href="https://orgtp.com" style="text-decoration:none;">`
    + `<img src="${IMG}/otp-lockup-white-2x.png" height="22" alt="OTP" style="height:22px;width:auto;display:block;border:0;"></a>`
    + `<div style="font-size:11px;font-weight:700;color:${GREEN};margin-top:8px;letter-spacing:0.06em;text-transform:uppercase;">The Organization Operating System</div>`
    + `</td></tr>`;
}

function footer(email: string): string {
  const unsub = `https://orgtp.com/api/v1/newsletter/unsubscribe/${encodeURIComponent(email)}`;
  return `<tr><td style="padding:0 32px 28px 32px;"><div style="border-top:1px solid #ECEFF3;margin-bottom:16px;"></div>`
    + `<p style="font-size:13px;color:#999;margin:0 0 6px 0;">You're receiving this because you signed up at `
    + `<a href="https://orgtp.com" style="color:#999;font-weight:600;">orgtp.com</a>.</p>`
    + `<p style="font-size:13px;color:#999;margin:0;"><a href="${unsub}" style="color:#999;">Unsubscribe</a></p></td></tr>`;
}

function ctaButton(label: string, url: string): string {
  return `<tr><td align="center" style="padding:0 32px 24px 32px;">`
    + `<a href="${url}" style="display:inline-block;padding:14px 30px;background:${GREEN};color:${INK};border-radius:10px;`
    + `font-size:16px;font-weight:800;text-decoration:none;border:1px solid ${GREEN_DEEP};">${esc(label)} &rarr;</a></td></tr>`;
}

function didYouKnow(d: { text: string; linkLabel?: string; linkUrl?: string }): string {
  const link = d.linkUrl
    ? ` <a href="${d.linkUrl}" style="color:${GREEN};font-weight:700;text-decoration:none;">${esc(d.linkLabel || 'Learn more')} &rarr;</a>`
    : '';
  return `<tr><td style="padding:0 32px 20px 32px;">`
    + `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${INK};border-radius:12px;"><tr>`
    + `<td width="56" valign="middle" style="padding:16px 0 16px 18px;"><img src="${IMG}/orgy-magnify.png" width="40" alt="" style="width:40px;height:auto;display:block;"></td>`
    + `<td valign="middle" style="padding:16px 18px 16px 12px;">`
    + `<p style="margin:0 0 2px 0;font-size:12px;font-weight:800;letter-spacing:0.08em;color:${GREEN};text-transform:uppercase;">Did you know</p>`
    + `<p style="margin:0;font-size:14px;color:#eaf5d8;">${d.text}${link}</p></td></tr></table></td></tr>`;
}

function card(c: LifecycleCard): string {
  return `<tr><td style="padding:0 32px 14px 32px;">`
    + `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7FBEF;border:1px solid #E4F2C8;border-radius:12px;"><tr>`
    + `<td width="64" valign="top" style="padding:16px 0 16px 16px;"><img src="${IMG}/${c.mascot}" width="48" alt="" style="width:48px;height:auto;display:block;"></td>`
    + `<td valign="top" style="padding:16px 16px 16px 12px;">`
    + `<p style="margin:0 0 4px 0;font-size:15px;font-weight:800;">${esc(c.title)}</p>`
    + `<p style="margin:0 0 8px 0;font-size:14px;color:#444;"><strong>Why it exists:</strong> ${c.why}</p>`
    + `<a href="${c.linkUrl}" style="font-size:14px;font-weight:700;color:${LINK};text-decoration:none;">${esc(c.linkLabel)} &rarr;</a>`
    + `</td></tr></table></td></tr>`;
}

/** Renders a lifecycle email to a full HTML document. firstName falls back to "there". */
export function renderLifecycleEmail(e: LifecycleEmail, firstName: string | null, email: string): string {
  const name = firstName && firstName.trim() ? firstName.trim() : 'there';
  const sub = (s: string) => s.replace(/\{\{firstName\}\}/g, name);

  const parts: string[] = [
    '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    `<title>${esc(e.subject)}</title></head>`,
    `<body style="margin:0;padding:0;background:${BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1a1a1a;line-height:1.6;">`,
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG};"><tr><td align="center" style="padding:32px 16px;">`,
    '<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #ECEFF3;">',
    header(),
    `<tr><td align="center" style="padding:28px 28px 4px 28px;"><img src="${IMG}/${e.mascot}" width="120" alt="Orgy" style="width:120px;height:auto;display:block;"></td></tr>`,
    '<tr><td style="padding:8px 32px 0 32px;">',
  ];
  if (e.eyebrow) {
    parts.push(`<p style="margin:0 0 6px 0;font-size:12px;font-weight:800;letter-spacing:0.08em;color:${GREEN_DEEP};text-transform:uppercase;">${esc(e.eyebrow)}</p>`);
  }
  parts.push(`<h1 style="font-size:24px;font-weight:800;letter-spacing:-0.02em;margin:0 0 16px 0;line-height:1.25;">${esc(e.headline)}</h1>`);
  parts.push(`<p style="margin:0 0 16px 0;font-size:16px;">Hi ${esc(name)},</p>`);
  for (const p of e.body) parts.push(`<p style="margin:0 0 16px 0;font-size:16px;">${sub(p)}</p>`);
  parts.push('</td></tr>');
  parts.push(ctaButton(e.cta.label, e.cta.url));
  if (e.cards && e.cards.length) {
    parts.push(`<tr><td style="padding:8px 32px 4px 32px;"><p style="margin:0 0 14px 0;font-size:12px;font-weight:800;letter-spacing:0.08em;color:${GREEN_DEEP};text-transform:uppercase;">While you wait, here's what's inside</p></td></tr>`);
    for (const c of e.cards) parts.push(card(c));
  }
  if (e.didYouKnow) parts.push(didYouKnow(e.didYouKnow));
  if (e.secondary) parts.push(`<tr><td style="padding:0 32px 8px 32px;"><p style="margin:0 0 16px 0;font-size:15px;color:#555;">${e.secondary}</p></td></tr>`);
  parts.push('<tr><td style="padding:0 32px 8px 32px;"><p style="margin:0 0 28px 0;font-size:16px;font-weight:600;">David</p></td></tr>');
  parts.push(footer(email));
  parts.push('</table></td></tr></table></body></html>');
  return parts.join('\n');
}
