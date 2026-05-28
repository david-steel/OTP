# OTP Meeting Scheduler — Build Spec

**Status:** DRAFT for David's review. No code until approved.
**Author:** Dan (Conatus) · 2026-05-28
**Trigger:** David wants to schedule L8/L10 meetings from OTP, push real
calendar invites to attendees' calendars, support recurring meetings,
edit/resend invites, and email the team a link to the OTP meeting plus a
Google Meet link.

---

## 1. Goal

From the OTP meeting (or a new "Schedule" surface), an authorized user can:

1. Pick a meeting (existing L8 meeting record) or create one.
2. Set date/time, duration, and optional recurrence (weekly / biweekly / monthly).
3. Choose attendees (auto-filled from the meeting's team; humans only).
4. Hit "Schedule + Invite" →
   - A Google Calendar event is created with a **real auto-generated Google
     Meet link** and all attendees added.
   - Google sends each attendee a native calendar invite (lands on their
     calendar with accept/decline).
   - OTP also sends a branded email to the team with **(a)** the OTP meeting
     link (`/l8/meeting/:id`) and **(b)** the Meet link.
5. Edit the meeting later (time / attendees / recurrence) → the calendar
   event updates and Google re-notifies.
6. Resend the invite to anyone who lost it.
7. Cancel → calendar event cancelled, attendees notified.

The "real Meet link" requirement is the load-bearing constraint: Meet links
can only be auto-created through the Google Calendar API, which requires
OAuth. That drives the whole architecture below.

---

## 2. What exists today (build on, don't rebuild)

- **`meetings` table:** `id, organizationId, teamId, meetingType, title,
  status, scheduledAt, attendees (jsonb), …`. Has the meeting record and
  the attendee list already.
- **`org_members`:** has `email` per member and `claimedEntityId(s)` linking
  a person to a chart tile. This is how we resolve attendee → email.
- **`team_memberships`:** who's on which team (attendee auto-fill source).
- **`sendEmail`** (`src/config/email.ts`): OTP can already send branded email.
- **Auth:** Clerk; `request.orgMember` is the impersonation-aware viewer
  (use it for the "can this person schedule?" gate — per
  `feedback_otp_orgmember_not_resolveorgforuser`).
- **Chart-permissions tier:** owner / admin / implementer = full; manager /
  integrator / visionary = their cone. Scheduling rights should follow this.

## 3. What's missing (the build)

- Google Calendar OAuth connection on the web-app side (none today).
- Recurrence, Meet link, and calendar-event-id fields on `meetings`.
- Event create / update / cancel / resend endpoints.
- Attendee email resolution (tile → org_member email).
- The recurrence UI + the team email template.

---

## 4. Key decisions for David (answer before build)

> **D1 — Whose Google account creates the events?**
> - **(a) One org-connected account** (recommended): you connect your Google
>   account once at the org level; all OTP-scheduled meetings are created on
>   your calendar and you're the organizer. Simplest, one OAuth, one token to
>   maintain. Downside: every event organizer shows as you.
> - **(b) Each scheduler's own account:** every manager connects their own
>   Google account; meetings they schedule come from their calendar. More
>   natural ownership, but N OAuth connections to maintain and more failure
>   surface.
> _Recommendation: (a) for v1. Add (b) later if managers need it._

> **D2 — Calendar invites: rely on Google's native send, or also OTP email?**
> - Google's `sendUpdates: 'all'` makes Google email the calendar invite
>   (with Meet link + accept/decline) automatically.
> - You ALSO want an OTP-branded email with the `/l8/meeting/:id` link.
> _Recommendation: both. Google handles the calendar mechanics; OTP sends one
> branded "Your L10 is scheduled" email containing both links. Clear which is
> which._

> **D3 — Fallback when Google isn't connected?**
> - If the org hasn't connected Google, fall back to **.ics email**
>   (calendar attachment, works everywhere) with a Meet link you paste, OR
>   block scheduling until connected.
> _Recommendation: soft fallback to .ics so scheduling never hard-blocks._

> **D4 — Time zone.** Default org TZ = America/New_York (matches the rest of
> OTP). Confirm, or make it a per-org setting.

> **D5 — Duration.** Meetings need an end time for the calendar. Default
> 90 min for L10, 60 min otherwise? Or always prompt.

---

## 5. Data model changes

Add to `meetings`:

| Column | Type | Purpose |
|---|---|---|
| `duration_minutes` | int, default 90 | event end = scheduledAt + duration |
| `recurrence_rule` | varchar(255) null | iCal RRULE, null = one-time |
| `google_calendar_event_id` | varchar null | the synced Google event id |
| `google_meet_link` | varchar null | auto-generated Meet URL |
| `calendar_html_link` | varchar null | Google's event page URL |
| `invite_last_sent_at` | timestamp null | for resend tracking |

New table `google_calendar_connections` (org-level, per D1a):

| Column | Type |
|---|---|
| `org_id` | uuid FK |
| `connected_by_member_id` | uuid FK |
| `google_email` | varchar |
| `access_token` | text (encrypted at rest, AES-256-GCM — same pattern as Emery PII) |
| `refresh_token` | text (encrypted) |
| `token_expiry` | timestamp |
| `scopes` | text |
| `connected_at` | timestamp |
| `status` | enum: active / revoked / error |

**Security:** tokens encrypted at rest, never logged, never returned to the
client. One connection per org (v1). Disconnect deletes the row + revokes
at Google.

---

## 6. Google OAuth flow

1. `GET /dashboard/integrations/google/connect` (owner/admin only) → redirect
   to Google consent, scope `https://www.googleapis.com/auth/calendar.events`,
   `access_type=offline` (to get a refresh token), `prompt=consent`.
2. `GET /api/v1/integrations/google/callback` → exchange code for tokens,
   encrypt + store in `google_calendar_connections`, redirect back to a
   "Connected ✓" state.
3. Token refresh: a helper refreshes the access token from the refresh token
   when expired, before any Calendar API call.
4. `POST /api/v1/integrations/google/disconnect` → revoke + delete.

**Infra need:** a Google Cloud project with Calendar API enabled + OAuth
client (client id/secret in env). One-time setup. (You likely already have a
Google Cloud project from the Google Ads work — can reuse the project, new
OAuth client + consent screen scopes.)

---

## 7. Endpoints

| Method | Path | Does |
|---|---|---|
| POST | `/api/v1/meetings/:id/schedule` | Create the Google event (Meet link, attendees, RRULE, sendUpdates=all), store event id + meet link on the meeting, send the OTP branded email |
| PUT | `/api/v1/meetings/:id/schedule` | Patch the Google event (time / attendees / recurrence), Google re-notifies |
| POST | `/api/v1/meetings/:id/schedule/resend` | Re-send invite to all or one attendee |
| DELETE | `/api/v1/meetings/:id/schedule` | Cancel the Google event, notify attendees, clear the synced fields |

All gated by the impersonation-aware role check (manager+ on the meeting's
team, or admin-like). Reuse `request.orgMember` + chart-permissions.

**Attendee → email resolution:** for each human attendee on the meeting,
find the `org_member` whose `claimedEntityId(s)` matches the attendee's
`externalId`; use that member's `email`. Skip agents. Skip attendees with no
resolvable email (surface them as "couldn't invite — no email on file").

---

## 8. Recurrence

- UI: a simple selector — None / Weekly / Every other week / Monthly, plus a
  day-of-week picker for weekly. Maps to RRULE:
  - Weekly Tue → `FREQ=WEEKLY;BYDAY=TU`
  - Biweekly Tue → `FREQ=WEEKLY;INTERVAL=2;BYDAY=TU`
  - Monthly → `FREQ=MONTHLY`
- Pass RRULE straight to Google's event `recurrence` field; Google manages
  the series. OTP stores the rule for display + edit.
- Editing a recurring meeting: v1 edits the whole series (Google's "this and
  following" is a later refinement).

---

## 9. The team email (branded, via sendEmail)

Subject: `<Meeting title> — scheduled for <date>`
Body:
- One line: when + recurrence ("Every Tuesday 2:15 PM ET").
- **Join the meeting:** the Google Meet link.
- **Open in OTP:** `/l8/meeting/:id` (the live agenda / scorecard / IDS page).
- "You'll also get a calendar invite from Google" note.
- No em dashes, plain and human (per the global writing rule).

Google's native calendar invite handles accept/decline + the calendar entry;
this email is the OTP-branded layer that points people at the OTP meeting
page, which is the actual product surface.

---

## 10. UI surfaces

- **Where:** a "Schedule" button on the L8 meeting page (`/l8/meeting/:id`)
  and/or on the `/l8` list next to each meeting. Opens a scheduling panel:
  date/time, duration, recurrence, attendee checklist (pre-checked from the
  team), "Schedule + Invite" button.
- **Connected state:** if Google isn't connected, the panel shows "Connect
  Google Calendar to send invites" → the OAuth flow (owner/admin), or the
  .ics fallback per D3.
- **After scheduling:** the meeting page shows the Meet link, the recurrence,
  "Resend invite," and "Edit / Cancel."

---

## 11. Build phases (sequenced, each independently shippable)

1. **OAuth connection** — Google Cloud OAuth client, connect/callback/
   disconnect, encrypted token storage, refresh helper. (Foundation.)
2. **Schedule one-time meeting** — create Google event with Meet link +
   attendees + sendUpdates, store synced fields, send OTP email. (Core value.)
3. **Recurrence** — RRULE UI + pass-through.
4. **Edit / cancel / resend.**
5. **.ics fallback** for orgs without Google connected (optional, per D3).

Phases 1-2 deliver the headline feature (real invites + Meet link). 3-5 are
refinements.

---

## 12. Risks / watch-items

- **Token security** — encrypted at rest, never client-exposed, revoke on
  disconnect. This is the highest-sensitivity new surface; treat like the
  Emery PII encryption.
- **Refresh-token loss** — Google only returns a refresh token on first
  consent with `prompt=consent` + `access_type=offline`. Get it right once.
- **Attendee email gaps** — many chart tiles may not have an email yet
  (same gap that blocks invites elsewhere). Surface "no email" clearly
  rather than silently dropping someone from the invite.
- **Scheduling permission** — must use the impersonation-aware role check,
  not `resolveOrgForUser(auth.userId)`. The whole multi-tenant lesson from
  2026-05-26/27 applies here too.
- **Quota** — Calendar API has generous quotas; one org won't hit them.

---

## 13. Open questions back to David

1. D1–D5 above.
2. Is there an existing Google Cloud project (from Google Ads) we should
   reuse for the OAuth client, or stand up a fresh one?
3. Should "Schedule" live on the L8 meeting page, the /l8 list, or both?
4. For v1, is editing-the-whole-series acceptable (vs per-occurrence edits)?

---

_Next step: David answers D1–D5 + the open questions, then we execute
Phase 1 (OAuth) as the first focused build._
