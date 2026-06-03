# OTP 90-Day Email Series — Automation Plan

How the 30-email lifecycle + behavioral re-engagement go from previews to live sends.
Nothing here touches production until each step is built and approved.

## What exists today
- **`series.json`** — single source of truth: 30 time-based emails + 1 behavioral. Edit here (or the Google Sheet) and regenerate.
- **`generate.py`** — renders every email to `out/` from one shared brand shell. Run `python3 generate.py`.
- **Google Sheet** — https://docs.google.com/spreadsheets/d/1ULEMJ-d4JpZ1Ygs5wdia80CqogmEbwztTXadz5M2Cc0 — the human-readable registry with every subject, CTA, and preview file.
- **Mascot PNGs** — 12 Orgy poses converted webp→png in `public/images/` for email-client support.

## Build steps to go live

### 1. Deploy the image assets
Push the converted PNGs (`onboarding-orgy-*.png`, `orgy-*.png`, `otp-lockup-white-2x.png`) to prod `/public/images/`. Production emails reference absolute `https://orgtp.com/images/<name>.png`.

### 2. Port the shell into production EJS
The current `src/templates/emails/` holds individual `.ejs` files. Convert the `generate.py` shell into **one** `lifecycle-layout.ejs` + render each email from `series.json` at send time. One template, 30 data rows — no 30 hand-maintained files.

### 3. Track sends with one table (not 30 columns)
The existing `onboarding_sequence` table only has 3 email columns. Replace/supplement with a generic log:
```
lifecycle_sends(clerk_user_id, email_n, sent_at, UNIQUE(clerk_user_id, email_n))
```
One row per email actually sent. Idempotent: never double-send the same rung.

### 4. The daily scheduler (M–F only)
A cron that runs **weekdays only** (skip Sat/Sun — either a `1-5` cron day field, or check weekday and exit). For each active, non-unsubscribed signup:
1. Compute **business-days since signup**.
2. Find the rung whose `day` is due and **not yet in `lifecycle_sends`**.
3. **Skip-gate:** if that rung has a `skipIf` milestone already met, mark it skipped and advance to the next due rung. The checks (all indexed):
   - `members>1` → `count(org_members where org_id=…) > 1`
   - `meeting exists` → `exists(meetings where organization_id=…)`
   - `goal exists` / `kpi exists` / `agent exists` → same pattern on their tables
4. Send the one due email, log it.
> Send at most one lifecycle email per person per day. Weekends never send; the day-count is business days so the 90-day arc lands correctly.

### 5. The inactivity re-engagement (separate, behavioral)
A second weekday cron:
1. Pull each user's `last_sign_in_at` from Clerk.
2. If **> 3 days** since last login AND no re-engage sent in the last ~7 days AND not unsubscribed → send `reengage-inactive`.
3. M–F only. Log the send so it doesn't repeat daily.
> This is independent of the 30-rung ladder. It can fire to anyone, at any point in their 90 days, when they go quiet.

### 6. Guardrails
- Respect `unsubscribed_at` everywhere (one unsubscribe kills all lifecycle + re-engage mail).
- Suppress lifecycle sends to a user the same day they got a re-engage (don't double-tap).
- Existing `sendEmail()` in `src/config/email.ts` is the send path.

## Routes still to finalize (flagged `routeVerified: FALSE` in the data, 6 of them)
scorecard (#12), view-as-member (#17), capture-learning (#19), publisher profile (#24 — `/dashboard/publisher` likely right), refer (#28). Each currently points at the closest **real** page (`/dashboard` or `/browse`) so no link is broken; confirm the exact destination before launch.

## Open brand decision
Repo `DESIGN.md` documents a different North Star ("Departure Board" — amber on ink). These emails use the Orgy / lime-green onboarding brand. Confirm the Orgy look is the lifecycle-email brand, or reconcile against DESIGN.md.
