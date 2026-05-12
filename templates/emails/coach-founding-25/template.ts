// Coach Founding 25 email template — Option B (acknowledge upfront) + yellow/red palette.
// Single-column 600px, table-based HTML, inline styles, Outlook-safe.
// Personalization tokens are interpolated at render time from CoachEmailVars.

export interface CoachEmailVars {
  firstName: string;
  lastName: string;
  profileSlug: string;
  profileTagline?: string;
}

const BASE_URL = 'https://orgtp.com';
const MASCOT_URL = `${BASE_URL}/public/images/coach-mascot.png`;

// Palette — playful + image-led, matching OTP coach landing page brand voice
// (dark navy hero with mascot + sparkles, white card body)
const C = {
  bg: '#F5F5F0',           // near-white outer
  hero: '#0F1320',         // OTP dark navy hero (matches /coach page)
  heroAccent: '#1B2236',   // slightly lifted navy for sparkle backdrops
  card: '#FFFFFF',          // content cards
  accent: '#EF4444',        // red sparkle / CTA (matches OTP coach sparkle red)
  accentDark: '#B91C1C',
  accentBlue: '#0095FF',   // OTP coach sparkle blue
  accentGold: '#FFD84D',   // sparkle gold accent
  text: '#1A1A1A',          // charcoal primary
  textMuted: '#5A5A5A',
  border: '#E5E5DD',
  divider: '#EEEEE8',
  highlight: '#FFF1A8',     // soft yellow math block stays warm
  white: '#FFFFFF',
};

// 4-point sparkle SVG (matches /coach page sparkle, lucide "Sparkles" path).
// Wrapped in a span we can absolutely-position and animate.
// Sparkle + wave helpers. Use inline SVG inside positioned <span>/<td> wrappers.
// Rationale: Apple Mail (the majority of coach inboxes) renders inline SVG
// fine but strips position:absolute from inline-styled <img> tags. Gmail
// strips raw <svg> entirely, so Gmail users see no sparkles/waves — the
// mascot, layout, copy, and CTAs all still render. That's the right
// trade-off for now. Could swap to PNG sparkles later for full coverage.

const SPARKLE_PATH = 'M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z';

// Wavy transition strip — fluid curve dividing two background colors.
// direction='down': fillColor at top with wavy bottom edge (navy → white)
// direction='up':   fillColor at bottom with wavy top edge   (white → navy)
function waveTransition(fillColor: string, bgColor: string, direction: 'down' | 'up'): string {
  const path = direction === 'down'
    ? 'M0,0 L600,0 L600,28 C500,58 400,8 300,30 C200,52 100,8 0,28 Z'
    : 'M0,32 C100,8 200,52 300,30 C400,8 500,58 600,32 L600,60 L0,60 Z';
  return `<tr>
    <td style="background:${bgColor};padding:0;line-height:0;font-size:0;">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 60" width="600" height="60" preserveAspectRatio="none" style="display:block;width:100%;height:60px;">
        <path d="${path}" fill="${fillColor}"/>
      </svg>
    </td>
  </tr>`;
}

// Inline sparkle next to text (flows with the line)
function sparkleInline(size: number, color: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" style="display:inline-block;vertical-align:middle;">
<path d="${SPARKLE_PATH}"/>
</svg>`;
}

// Absolutely-positioned sparkle. The <span> wrapper carries position:absolute
// because Apple Mail strips position from inline-styled <img>/<svg> directly.
function sparkleAt(opts: {
  size: number; color: string; top: string; left?: string; right?: string;
  delay: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8; speed?: 'slow' | 'fast';
}): string {
  const { size, color, top, left, right, delay, speed } = opts;
  const pos = right !== undefined ? `right:${right};` : `left:${left};`;
  const speedClass = speed === 'slow' ? ' s-slow' : speed === 'fast' ? ' s-fast' : '';
  const glow = `filter: drop-shadow(0 0 8px ${color}aa) drop-shadow(0 0 16px ${color}55);`;
  return `<span class="sparkle s-d${delay}${speedClass}" style="position:absolute;top:${top};${pos}width:${size}px;height:${size}px;line-height:0;${glow}">
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" style="display:block;">
<path d="${SPARKLE_PATH}"/>
</svg>
</span>`;
}

export function renderCoachFoundingEmail(vars: CoachEmailVars): {
  subject: string;
  html: string;
  preheader: string;
} {
  const { firstName, profileSlug } = vars;
  const claimUrl = `${BASE_URL}/claim/${profileSlug}`;
  const publicProfileUrl = `${BASE_URL}/expert/${profileSlug}`;
  const takedownUrl = `${BASE_URL}/takedown/${profileSlug}`;

  const subject = `${firstName}, we saved you a spot. Claim or pass.`;
  const preheader = `Since you're in the EOS Worldwide® directory, we built a draft profile for you on OTP. Claim it, ignore it, or one-click remove. Founding 25 only.`;
  const unsubscribeUrl = `${BASE_URL}/unsubscribe?slug=${profileSlug}`;

  const html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
<meta charset="utf-8" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="format-detection" content="telephone=no,address=no,email=no,date=no" />
<meta name="color-scheme" content="light only" />
<meta name="supported-color-schemes" content="light" />
<title>${escapeHtml(subject)}</title>
<style>
  @media only screen and (max-width: 620px) {
    .container { width: 100% !important; }
    .px-mobile { padding-left: 24px !important; padding-right: 24px !important; }
    .h1 { font-size: 30px !important; line-height: 1.15 !important; letter-spacing: -0.5px !important; }
    .hero-pad { padding: 28px 20px 40px !important; }
    .hero-stage { height: auto !important; min-height: 280px !important; max-width: 92% !important; }
    .hero-mascot { width: 220px !important; max-width: 60% !important; margin-top: 8px !important; }
    .cta-btn { width: 100% !important; box-sizing: border-box; padding: 16px 24px !important; }
    .step-num { font-size: 52px !important; }
    .sparkle { transform: scale(0.65); }
  }
  /* Twinkle animation — Apple Mail, Gmail web, modern clients support it;
     Outlook desktop ignores and shows static sparkles (still good). */
  @keyframes twinkle {
    0%, 100% { opacity: 0.15; transform: scale(0.5) rotate(0deg); }
    50%      { opacity: 1;    transform: scale(1)   rotate(180deg); }
  }
  .sparkle {
    animation: twinkle 3.2s ease-in-out infinite;
    transform-origin: center;
  }
  .s-d0 { animation-delay: 0s; }
  .s-d1 { animation-delay: 0.3s; }
  .s-d2 { animation-delay: 0.6s; }
  .s-d3 { animation-delay: 0.9s; }
  .s-d4 { animation-delay: 1.2s; }
  .s-d5 { animation-delay: 1.5s; }
  .s-d6 { animation-delay: 1.8s; }
  .s-d7 { animation-delay: 2.1s; }
  .s-d8 { animation-delay: 2.4s; }
  .s-slow { animation-duration: 4.5s; }
  .s-fast { animation-duration: 2.4s; }
  ul, ol { padding-left: 20px; margin: 0 0 12px; }
  a { color: ${C.accent}; }
</style>
</head>
<body style="margin:0;padding:0;background:${C.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${C.text};-webkit-font-smoothing:antialiased;">

<!-- Preheader (hidden) -->
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${C.bg};">
  ${escapeHtml(preheader)}
</div>

<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${C.bg};">
  <tr>
    <td align="center" style="padding:24px 12px;">

      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="container" style="width:600px;max-width:600px;background:${C.card};border-radius:16px;overflow:hidden;border:1px solid ${C.border};">

        <!-- Header bar — dark navy, merges into the hero below -->
        <tr>
          <td class="px-mobile" style="padding:22px 32px 14px;background:${C.hero};">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="left" valign="middle">
                  <div style="font-family:Georgia,'Times New Roman',serif;font-weight:700;font-size:28px;line-height:1;letter-spacing:1px;color:#FFFFFF;">O T P</div>
                  <div style="font-size:9px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:#8B92A8;margin-top:5px;">Organizational Transport Protocol</div>
                </td>
                <td align="right" valign="middle">
                  <a href="${unsubscribeUrl}" target="_blank" rel="noopener noreferrer" style="font-size:11px;font-weight:600;letter-spacing:0.5px;color:#8B92A8;text-decoration:underline;">Unsubscribe</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Hero — dark navy stage with mascot as protagonist + scattered twinkling sparkles -->
        <tr>
          <td class="hero-pad" style="background:${C.hero};background-image:radial-gradient(ellipse 80% 60% at 50% 35%, ${C.heroAccent} 0%, ${C.hero} 70%);padding:16px 24px 48px;text-align:center;">

            <!-- Mascot stage: relative-positioned container with absolutely-scattered sparkles.
                 height fixed on desktop for sparkle positioning; collapses on mobile via media query. -->
            <div class="hero-stage" style="position:relative;width:440px;max-width:100%;margin:0 auto 28px;height:380px;">

              <!-- Sparkles scattered organically around the mascot.
                   12 sparkles, varied sizes, 3 colors, staggered animation delays. -->
              ${sparkleAt({ size: 24, color: C.accent,      top: '4%',  left: '14%', delay: 0 })}
              ${sparkleAt({ size: 16, color: C.accentBlue,  top: '18%', left: '4%',  delay: 4, speed: 'slow' })}
              ${sparkleAt({ size: 32, color: C.accentGold,  top: '42%', left: '-2%', delay: 2 })}
              ${sparkleAt({ size: 14, color: C.accentBlue,  top: '64%', left: '6%',  delay: 6, speed: 'fast' })}
              ${sparkleAt({ size: 20, color: C.accent,      top: '82%', left: '18%', delay: 3 })}
              ${sparkleAt({ size: 12, color: C.accentGold,  top: '90%', left: '42%', delay: 7, speed: 'fast' })}
              ${sparkleAt({ size: 18, color: C.accentBlue,  top: '85%', left: '70%', delay: 1 })}
              ${sparkleAt({ size: 26, color: C.accent,      top: '60%', left: '88%', delay: 5 })}
              ${sparkleAt({ size: 22, color: C.accentGold,  top: '34%', left: '92%', delay: 8, speed: 'slow' })}
              ${sparkleAt({ size: 14, color: C.accent,      top: '12%', left: '82%', delay: 4 })}
              ${sparkleAt({ size: 18, color: C.accentBlue,  top: '0%',  left: '54%', delay: 6 })}
              ${sparkleAt({ size: 16, color: C.accentGold,  top: '24%', left: '68%', delay: 2, speed: 'fast' })}

              <!-- Mascot centered. height:auto preserves aspect ratio on mobile -->
              <img src="${MASCOT_URL}" width="340" height="340" alt="OTP coach mascot, half human in red coach jersey with whistle and football, half AI circuit board with headset and playbook" class="hero-mascot" style="position:relative;display:block;width:340px;height:auto;max-width:78%;margin:20px auto 0;border:0;" />

            </div>

            <h1 class="h1" style="margin:0 0 14px;font-family:Georgia,'Times New Roman',serif;font-weight:700;font-size:42px;line-height:1.05;color:#FFFFFF;letter-spacing:-1px;">
              ${escapeHtml(firstName)}, we saved<br/>you a spot.
            </h1>

            <p style="margin:0 0 30px;font-size:16px;line-height:1.6;color:#CBD0DC;max-width:440px;margin-left:auto;margin-right:auto;">
              Since you're listed in the <strong style="color:#FFFFFF;">EOS Worldwide® public implementer directory</strong>, we built a draft profile for you on OTP. Claim it, ignore it, or have us remove it in one click.
            </p>

            <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;">
              <tr>
                <td bgcolor="${C.accent}" style="border-radius:999px;box-shadow:0 6px 0 ${C.accentDark};">
                  <a href="${claimUrl}" target="_blank" rel="noopener noreferrer"
                     class="cta-btn"
                     style="display:inline-block;padding:18px 40px;font-size:17px;font-weight:800;letter-spacing:0.3px;color:#FFFFFF;text-decoration:none;border-radius:999px;background:${C.accent};text-transform:uppercase;">
                    See your page →
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:22px 0 6px;font-size:12px;color:#8B92A8;font-weight:600;letter-spacing:0.3px;">
              No commitment. One click to claim, one click to remove.
            </p>
            <p style="margin:0;font-size:11px;color:#6B7390;letter-spacing:0.2px;">
              OTP is not affiliated with EOS® or EOS Worldwide®.
            </p>

          </td>
        </tr>

        ${waveTransition(C.hero, C.card, 'down')}

        <!-- Section: What this is -->
        <tr>
          <td class="px-mobile" style="padding:48px 48px 16px;text-align:center;">
            <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${C.accent};">What this is</p>
            <h2 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-weight:700;font-size:28px;line-height:1.2;color:${C.text};letter-spacing:-0.5px;">
              AI agents inside your client's org.<br/>Not just inside the meeting.
            </h2>
            <p style="margin:0;font-size:15px;line-height:1.65;color:${C.textMuted};max-width:480px;margin-left:auto;margin-right:auto;">
              Ninety and Bloom Growth use AI to help run the EOS® meeting. OTP is built different. We assume your clients will integrate AI agents across every part of their organization, sales, ops, finance, support, and they need a layer that holds those agents accountable.
            </p>
          </td>
        </tr>

        <!-- How it works -->
        <tr>
          <td style="padding:32px 0 16px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">

              <tr>
                <td class="px-mobile" style="padding:24px 48px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td width="76" valign="top" style="padding:0 8px 0 0;" class="step-num">
                        <div style="position:relative;display:inline-block;font-family:Georgia,'Times New Roman',serif;font-weight:700;font-size:64px;line-height:1;color:${C.accent};padding:6px 10px 6px 6px;">
                          1
                          ${sparkleAt({ size: 10, color: C.accentGold, top: '-2px', left: '-6px', delay: 0 })}
                          ${sparkleAt({ size: 8,  color: C.accentBlue, top: '26px', right: '-10px', delay: 4, speed: 'fast' })}
                          ${sparkleAt({ size: 12, color: C.accent,     top: '52px', left: '-12px', delay: 6, speed: 'slow' })}
                        </div>
                      </td>
                      <td valign="top" style="padding-left:8px;">
                        <h3 style="margin:0 0 6px;font-size:18px;font-weight:700;color:${C.text};">Look at the page we built.</h3>
                        <p style="margin:0;font-size:14px;line-height:1.65;color:${C.textMuted};">
                          We seeded it from your public EOS Worldwide® directory listing. Name, headline, tier, location. No invented bio, nothing pretending to be from you. Look at it. If it's wrong, you can fix it after claim or have us remove it entirely.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td class="px-mobile" style="padding:24px 48px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td width="76" valign="top" style="padding:0 8px 0 0;" class="step-num">
                        <div style="position:relative;display:inline-block;font-family:Georgia,'Times New Roman',serif;font-weight:700;font-size:64px;line-height:1;color:${C.accent};padding:6px 10px 6px 6px;">
                          2
                          ${sparkleAt({ size: 12, color: C.accentBlue, top: '-4px', right: '-10px', delay: 2 })}
                          ${sparkleAt({ size: 10, color: C.accent,     top: '18px', left: '-14px', delay: 5, speed: 'slow' })}
                          ${sparkleAt({ size: 8,  color: C.accentGold, top: '54px', right: '-8px',  delay: 7, speed: 'fast' })}
                        </div>
                      </td>
                      <td valign="top" style="padding-left:8px;">
                        <h3 style="margin:0 0 6px;font-size:18px;font-weight:700;color:${C.text};">Hold the AI in their org accountable.</h3>
                        <p style="margin:0 0 10px;font-size:14px;line-height:1.65;color:${C.textMuted};">Your clients are integrating AI across every part of their organization. Sales, ops, finance, support. Until now, no one has been watching whether those agents actually deliver. OTP is the accountability layer that does.</p>
                        <ul style="margin:0;padding-left:18px;color:${C.textMuted};font-size:14px;line-height:1.75;">
                          <li><strong style="color:${C.text};">Performance.</strong> Every agent and every human tracked against their numbers. Who is hitting. Who is drifting.</li>
                          <li><strong style="color:${C.text};">Breakdowns.</strong> When agents step on each other. When ownership gets lost between humans and bots. Surfaced before the next meeting.</li>
                          <li><strong style="color:${C.text};">Promised vs delivered.</strong> Each AI vendor told your client what their agent would do. OTP tracks whether it did.</li>
                        </ul>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td class="px-mobile" style="padding:24px 48px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td width="76" valign="top" style="padding:0 8px 0 0;" class="step-num">
                        <div style="position:relative;display:inline-block;font-family:Georgia,'Times New Roman',serif;font-weight:700;font-size:64px;line-height:1;color:${C.accent};padding:6px 10px 6px 6px;">
                          3
                          ${sparkleAt({ size: 10, color: C.accent,     top: '-4px', right: '-12px', delay: 1 })}
                          ${sparkleAt({ size: 14, color: C.accentGold, top: '22px', left: '-16px', delay: 3, speed: 'slow' })}
                          ${sparkleAt({ size: 8,  color: C.accentBlue, top: '56px', right: '-10px', delay: 8, speed: 'fast' })}
                        </div>
                      </td>
                      <td valign="top" style="padding-left:8px;">
                        <h3 style="margin:0 0 6px;font-size:18px;font-weight:700;color:${C.text};">Bring your clients. Free. Forever.</h3>
                        <p style="margin:0;font-size:14px;line-height:1.65;color:${C.textMuted};">
                          Every client you onboard runs OTP free for life. No seat fees. No tier upgrades. Even if they're already on Bloom Growth or Ninety, OTP is the agent layer on top, free.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

            </table>
          </td>
        </tr>

        <!-- The math block -->
        <tr>
          <td class="px-mobile" style="padding:8px 48px 48px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.highlight};border-radius:12px;">
              <tr>
                <td style="padding:28px 28px 26px;">
                  <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${C.text};opacity:0.65;">Why we can do this</p>
                  <p style="margin:0 0 14px;font-size:17px;line-height:1.5;color:${C.text};font-weight:700;">
                    Ninety and Bloom Growth charge $12-16 per seat per month. They have to. They're selling meeting software, and seats are how meeting software makes money.
                  </p>
                  <p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:${C.text};">
                    We're not selling seats. OTP is the accountability layer for AI agents in your client's org. That's a different layer of the stack with a different business model. They can't match free without killing their business. We can offer free because free is how an accountability layer reaches scale.
                  </p>
                  <p style="margin:0;font-size:15px;line-height:1.65;color:${C.text};">
                    <strong>The math:</strong> a 10-person leadership team pays roughly $1,920/year on Ninety. A coach with 20 clients sits on $38,400/year of client SaaS spend. OTP takes that to zero, and you become the coach who brought them better tools that cost less.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Founding 25 framing -->
        <tr>
          <td class="px-mobile" style="padding:0 48px 48px;text-align:center;">
            <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${C.accent};">Founding 25 coaches</p>
            <h2 style="margin:0 0 20px;font-family:Georgia,'Times New Roman',serif;font-weight:700;font-size:26px;line-height:1.25;color:${C.text};letter-spacing:-0.4px;">
              The first 25 coaches who claim get a real seat at the table.
            </h2>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 28px;text-align:left;">
              <tr>
                <td style="padding:18px 0;border-top:1px solid ${C.divider};">
                  <p style="margin:0 0 6px;font-size:15px;font-weight:700;color:${C.text};line-height:1.4;">Founding badge on your storefront.</p>
                  <p style="margin:0;font-size:14px;line-height:1.6;color:${C.textMuted};">
                    A visible mark on your OTP profile at orgtp.com/expert/${escapeHtml(profileSlug)}. Clients searching for an EOS® coach see it. The badge is permanent. Not granted to anyone after coach 25. As OTP grows, it only gains weight.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:18px 0;border-top:1px solid ${C.divider};">
                  <p style="margin:0 0 6px;font-size:15px;font-weight:700;color:${C.text};line-height:1.4;">Roadmap voting.</p>
                  <p style="margin:0;font-size:14px;line-height:1.6;color:${C.textMuted};">
                    Monthly cadence. You see the roadmap before anyone else, vote on what we ship next, and suggest features. What agent should we build to audit a sales bot. What integrations matter most. You are not in a focus group. You are shaping the product.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:18px 0;border-top:1px solid ${C.divider};">
                  <p style="margin:0 0 6px;font-size:15px;font-weight:700;color:${C.text};line-height:1.4;">Direct line to me.</p>
                  <p style="margin:0;font-size:14px;line-height:1.6;color:${C.textMuted};">
                    A founders' Slack channel where you can ping me directly, no gatekeepers. Replies to this email land in my inbox and I personally read every one. Plus a quarterly 30-minute call if you want one.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:18px 0;border-top:1px solid ${C.divider};border-bottom:1px solid ${C.divider};">
                  <p style="margin:0 0 6px;font-size:15px;font-weight:700;color:${C.text};line-height:1.4;">First dibs on the consultant marketplace.</p>
                  <p style="margin:0;font-size:14px;line-height:1.6;color:${C.textMuted};">
                    Long term, OTP becomes the place AI-aware companies come to find and pay coaches. Founding 25 are listed first, surface first in search, and get first inquiries. Per-seat SaaS platforms cannot build this. They sell software, not coaches. You are the first wave of paid coordination experts on OTP.
                  </p>
                </td>
              </tr>
            </table>

            <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;">
              <tr>
                <td bgcolor="${C.accent}" style="border-radius:999px;">
                  <a href="${claimUrl}" target="_blank" rel="noopener noreferrer"
                     class="cta-btn"
                     style="display:inline-block;padding:16px 36px;font-size:16px;font-weight:700;letter-spacing:0.2px;color:#FFFFFF;text-decoration:none;border-radius:999px;background:${C.accent};">
                    See your page →
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Sign-off — centered, signature treatment with sparkle bookends -->
        <tr>
          <td class="px-mobile" style="padding:8px 48px 36px;border-top:1px solid ${C.divider};text-align:center;">
            <p style="margin:32px 0 24px;font-size:15px;line-height:1.7;color:${C.text};font-style:italic;max-width:460px;margin-left:auto;margin-right:auto;">
              Built this because we needed it to run our own agency. Opening it to EOS® coaches first because EOS® is the operating model we believe in.
            </p>
            <table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 8px;">
              <tr>
                <td valign="middle" style="padding:0 12px 0 0;">${sparkleInline(16, C.accent)}</td>
                <td valign="middle" style="font-family:Georgia,'Times New Roman',serif;font-style:italic;font-weight:700;font-size:28px;color:${C.text};line-height:1;">David Steel</td>
                <td valign="middle" style="padding:0 0 0 12px;">${sparkleInline(16, C.accentBlue)}</td>
              </tr>
            </table>
            <p style="margin:0;font-size:11px;color:${C.textMuted};letter-spacing:1.5px;text-transform:uppercase;font-weight:700;">
              Founder, Sneeze It &nbsp;·&nbsp; Builder, OTP
            </p>
          </td>
        </tr>

        <!-- P.S. card — soft warm background, personal tone -->
        <tr>
          <td class="px-mobile" style="padding:8px 48px 40px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.bg};border:1px solid ${C.border};border-radius:14px;">
              <tr>
                <td style="padding:24px 28px 22px;">
                  <p style="margin:0 0 8px;font-size:13px;font-weight:800;color:${C.text};letter-spacing:0.5px;text-transform:uppercase;">P.S. Not interested?</p>
                  <p style="margin:0 0 16px;font-size:14px;line-height:1.65;color:${C.textMuted};">
                    No questions, no friction. Click below and we'll remove your profile from OTP within 24 hours. You'll never hear from us again.
                  </p>
                  <a href="${takedownUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:10px 20px;border:1px solid ${C.text};border-radius:8px;color:${C.text};text-decoration:none;font-size:13px;font-weight:700;background:${C.card};letter-spacing:0.2px;">
                    Remove me from OTP →
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        ${waveTransition(C.hero, C.card, 'up')}

        <!-- Footer — dark navy, bookends the header -->
        <tr>
          <td class="px-mobile" style="padding:36px 36px 32px;background:${C.hero};">

            <!-- OTP wordmark, matches header -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="center">
                  <div style="font-family:Georgia,'Times New Roman',serif;font-weight:700;font-size:24px;line-height:1;letter-spacing:1px;color:#FFFFFF;">O T P</div>
                  <div style="font-size:9px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:#8B92A8;margin-top:5px;">Organizational Transport Protocol</div>
                </td>
              </tr>
            </table>

            <!-- Subtle divider -->
            <table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0" style="margin:22px auto;">
              <tr>
                <td style="width:60px;height:1px;background:#2A3148;font-size:0;line-height:0;">&nbsp;</td>
              </tr>
            </table>

            <!-- Legal -->
            <p style="margin:0 0 12px;font-size:11px;line-height:1.7;color:#7A8198;">
              You're getting this because your coaching profile was seeded on OTP from the public EOS Worldwide® implementer directory.
            </p>
            <p style="margin:0 0 12px;font-size:11px;line-height:1.7;color:#7A8198;">
              <strong style="color:#A8AFC4;">OTP and Sneeze It are not affiliated with, endorsed by, or sponsored by EOS Worldwide®, Ninety, or Bloom Growth.</strong> References to these products are factual comparisons only. EOS®, EOS Worldwide®, EOS Implementer®, and related marks are trademarks of EOS Worldwide, LLC. Ninety and Bloom Growth are trademarks of their respective owners.
            </p>
            <p style="margin:0;font-size:11px;line-height:1.7;color:#7A8198;">
              Your public profile: <a href="${publicProfileUrl}" target="_blank" rel="noopener noreferrer" style="color:#A8AFC4;text-decoration:underline;">${escapeHtml(publicProfileUrl.replace('https://', ''))}</a>
            </p>

            <!-- Unsubscribe -->
            <table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0" style="margin:24px auto 0;">
              <tr>
                <td style="text-align:center;">
                  <a href="${unsubscribeUrl}" target="_blank" rel="noopener noreferrer" style="font-size:11px;font-weight:600;color:#8B92A8;text-decoration:underline;letter-spacing:0.3px;">
                    Unsubscribe from OTP emails
                  </a>
                </td>
              </tr>
            </table>

          </td>
        </tr>

      </table>

    </td>
  </tr>
</table>

</body>
</html>`;

  return { subject, html, preheader };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
