# OTP Meeting Scheduler — Build Spec

**Status:** DRAFT for David's review. No code until approved.
**Author:** Dan (Conatus) · 2026-05-28 (rev 2 — added Microsoft 365 + manual paste path)
**Trigger:** David wants to schedule L8/L10 meetings from OTP, push real
calendar invites to attendees' calendars, support recurring meetings,
edit/resend invites, and email the team a link to the OTP meeting plus a
video link (Google Meet or Microsoft Teams).

**Two requirements added this revision:**
1. A recurring meeting link can be **added to an existing meeting** by cutting
   and pasting it into a calendar invite the user already created in **Google
   Calendar OR Microsoft 365 (Outlook)**. This is the no-integration path: OTP
   gives you a copyable link block, you paste it into your own invite. Works
   for anyone, no OAuth.
2. The system must **account for attendees connecting with either a Microsoft
   365 account OR a Google account** (mixed-provider orgs). Both the
   connected-account path and the email/invite path are provider-agnostic.

---

## 1. Goal

There are **two ways** to get an OTP meeting onto people's calendars. They
serve different needs and ship in a different order.

### Path A — Manual paste link (no integration, ship first)

For an **existing** meeting, OTP shows a copyable "link block" the user pastes
into a calendar invite they create themselves in **Google Calendar OR
Microsoft 365 (Outlook)**:

1. Open any L8 meeting → "Add to calendar" → OTP shows a copyable block:
   - **Open in OTP:** `/l8/meeting/:id` (the live agenda / scorecard / IDS page).
   - Optional video link the user pasted in (their own Meet/Teams/Zoom URL).
2. The user creates the recurring invite in Google or Microsoft 365, sets the
   recurrence there, adds attendees there, and pastes the block into the
   invite body. Their own calendar tool owns the series and the notifications.
3. Anyone — Google or Microsoft 365 — can do this. No OAuth, no tokens, no
   org setup. This is the path that ships first because it unblocks David now.

This path is deliberately dumb: OTP is not the calendar, it just hands you a
link to embed in whatever calendar you already use.

### Path B — Connected calendar (OTP creates the event, auto video link)

For orgs that connect a calendar account, an authorized user can:

1. Pick a meeting (existing L8 meeting record) or create one.
2. Set date/time, duration, and optional recurrence (weekly / biweekly / monthly).
3. Choose attendees (auto-filled from the meeting's team; humans only).
4. Hit "Schedule + Invite" →
   - A calendar event is created on the connected account with a **real
     auto-generated video link** (Google Meet if the org connected Google;
     Microsoft Teams if it connected Microsoft 365) and all attendees added.
   - The calendar provider sends each attendee a native invite (lands on their
     calendar with accept/decline) — **regardless of whether the attendee is on
     Google or Microsoft 365**; calendar invites are interoperable via the
     iCalendar standard.
   - OTP also sends a branded email to the team with **(a)** the OTP meeting
     link (`/l8/meeting/:id`) and **(b)** the video link.
5. Edit the meeting later (time / attendees / recurrence) → the calendar
   event updates and the provider re-notifies.
6. Resend the invite to anyone who lost it.
7. Cancel → calendar event cancelled, attendees notified.

The "real video link" requirement is the load-bearing constraint for Path B:
Meet links can only be auto-created through the Google Calendar API, and Teams
links through the Microsoft Graph API. Both require OAuth. That drives the
architecture below. **Path A needs none of it** — that is the whole point of
shipping A first.

### Provider-agnostic by design

A Google-connected org inviting a Microsoft 365 attendee (or vice versa) just
works — the invite arrives as a standard calendar entry either way. The
provider only determines (a) which account OTP connects to *create* events and
(b) which video link type gets auto-generated (Meet vs Teams). The attendee's
own email/calendar provider never blocks them from receiving or accepting.

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

**For Path A (manual paste — ships first):**
- An "Add to calendar" surface on the meeting page that renders a copyable
  link block (OTP meeting link + an optional user-pasted video URL field).
- A small `meeting_links` / video-URL field so a pasted video link persists.
- Copy-to-clipboard UI + brief "paste this into your Google or Outlook invite"
  instructions.

**For Path B (connected calendar):**
- Calendar OAuth connection on the web-app side, for **both** Google
  (Calendar API) and Microsoft 365 (Graph API). None today.
- Recurrence, video link, and calendar-event-id fields on `meetings`.
- Event create / update / cancel / resend endpoints (provider-agnostic).
- Attendee email resolution (tile → org_member email).
- The recurrence UI + the team email template.

---

## 4. Key decisions for David (answer before build)

> **D0 — Ship Path A (manual paste) before Path B (connected)?**
> - Path A is small, needs no OAuth, and solves "I want this meeting on my
>   calendar" today for everyone regardless of provider.
> - Path B is the bigger build (OAuth for two providers, tokens, event sync).
> _Recommendation: yes — ship Path A first as its own release, then build B._

> **D1 — Which provider(s) for Path B, and whose account creates the events?**
> - **Providers:** Google (Calendar API → Meet) and Microsoft 365 (Graph API
>   → Teams). Both are real OAuth integrations. We can ship one first.
>   _Recommendation: build Google first (you already have a Google Cloud
>   project from Google Ads), add Microsoft 365 second. Make the connection
>   table provider-aware from day one so adding MS is additive, not a rewrite._
> - **(a) One org-connected account** (recommended): the org connects one
>   account (Google OR Microsoft 365) once; all OTP-scheduled meetings are
>   created there and that account is the organizer. One OAuth, one token to
>   maintain. Downside: every event organizer shows as that account.
> - **(b) Each scheduler's own account:** every manager connects their own
>   Google or Microsoft 365 account; meetings they schedule come from their
>   calendar. More natural ownership, but N OAuth connections and more failure
>   surface.
> _Recommendation: (a) for v1. Add (b) later if managers need it._

> **D2 — Calendar invites: rely on the provider's native send, or also OTP email?**
> - Google's `sendUpdates: 'all'` (or Graph's equivalent) makes the provider
>   email the calendar invite (with video link + accept/decline) automatically.
>   This reaches Google AND Microsoft 365 attendees — invites are interoperable.
> - You ALSO want an OTP-branded email with the `/l8/meeting/:id` link.
> _Recommendation: both. The provider handles the calendar mechanics; OTP sends
> one branded "Your L10 is scheduled" email containing both links. Clear which
> is which._

> **D3 — Fallback when no calendar is connected?**
> - Path A (manual paste link) IS the always-available fallback — no calendar
>   connection required, works for Google and Microsoft 365 users alike.
> - Optionally also generate an **.ics email** (calendar attachment, opens in
>   any calendar app) so attendees get a one-click add even without Path B.
> _Recommendation: Path A is the floor; scheduling never hard-blocks. Add .ics
> later as a nicety._

> **D4 — Time zone.** Default org TZ = America/New_York (matches the rest of
> OTP). Confirm, or make it a per-org setting.

> **D5 — Duration.** Meetings need an end time for the calendar. Default
> 90 min for L10, 60 min otherwise? Or always prompt.

---

## 5. Data model changes

Add to `meetings` (provider-agnostic field names so Google and Microsoft 365
share the same columns):

| Column | Type | Purpose |
|---|---|---|
| `duration_minutes` | int, default 90 | event end = scheduledAt + duration |
| `recurrence_rule` | varchar(255) null | iCal RRULE, null = one-time |
| `video_link` | varchar null | user-pasted (Path A) or auto-generated Meet/Teams URL (Path B) |
| `calendar_provider` | enum null | `google` / `microsoft` — which provider created the synced event (null for Path A) |
| `calendar_event_id` | varchar null | the synced provider event id (Google event id or Graph event id) |
| `calendar_html_link` | varchar null | the provider's event page URL |
| `invite_last_sent_at` | timestamp null | for resend tracking |

`video_link` does double duty: in Path A it holds whatever URL the user pasted
in; in Path B it holds the auto-generated Meet or Teams link.

New table `calendar_connections` (org-level, per D1a) — one row per connected
account, provider-aware so Google and Microsoft 365 coexist:

| Column | Type |
|---|---|
| `org_id` | uuid FK |
| `provider` | enum: `google` / `microsoft` |
| `connected_by_member_id` | uuid FK |
| `account_email` | varchar (the Google or Microsoft 365 address) |
| `access_token` | text (encrypted at rest, AES-256-GCM — same pattern as Emery PII) |
| `refresh_token` | text (encrypted) |
| `token_expiry` | timestamp |
| `scopes` | text |
| `connected_at` | timestamp |
| `status` | enum: active / revoked / error |

**Security:** tokens encrypted at rest, never logged, never returned to the
client. One connection per org (v1) — but the `provider` column means we can
relax that to one-per-provider later without a migration. Disconnect deletes
the row + revokes at the provider (Google or Microsoft).

---

## 6. OAuth flows (Path B only — Path A needs no OAuth)

Both providers follow the same shape: connect → callback → store encrypted
tokens → refresh helper → disconnect. The route segment carries the provider
(`/google/` or `/microsoft/`) and the handler branches on it.

### 6a. Google

1. `GET /dashboard/integrations/google/connect` (owner/admin only) → redirect
   to Google consent, scope `https://www.googleapis.com/auth/calendar.events`,
   `access_type=offline` (to get a refresh token), `prompt=consent`.
2. `GET /api/v1/integrations/google/callback` → exchange code for tokens,
   encrypt + store in `calendar_connections` with `provider='google'`, redirect
   back to a "Connected ✓" state.
3. Token refresh: a helper refreshes the access token from the refresh token
   when expired, before any Calendar API call.
4. `POST /api/v1/integrations/google/disconnect` → revoke + delete.

**Infra need:** a Google Cloud project with Calendar API enabled + OAuth client
(client id/secret in env). One-time setup. (You likely already have a Google
Cloud project from the Google Ads work — can reuse it, new OAuth client +
consent screen scopes.)

### 6b. Microsoft 365 (Graph API)

1. `GET /dashboard/integrations/microsoft/connect` (owner/admin only) →
   redirect to Microsoft identity consent, scopes
   `Calendars.ReadWrite OnlineMeetings.ReadWrite offline_access`.
2. `GET /api/v1/integrations/microsoft/callback` → exchange code for tokens,
   encrypt + store in `calendar_connections` with `provider='microsoft'`.
3. Token refresh: same helper pattern, against the Microsoft token endpoint.
4. `POST /api/v1/integrations/microsoft/disconnect` → revoke + delete.

**Infra need:** an Azure AD app registration (Entra ID) with delegated Graph
permissions for Calendars + OnlineMeetings, a client id/secret in env, and the
redirect URI registered. One-time setup, separate from the Google project.

**Teams link:** create the Graph calendar event with `isOnlineMeeting: true`
and `onlineMeetingProvider: teamsForBusiness`; Graph returns the join URL,
which we store in `meetings.video_link` (mirror of how Google returns the Meet
link via `conferenceData`).

---

## 7. Endpoints

**Path A (manual paste):**

| Method | Path | Does |
|---|---|---|
| PUT | `/api/v1/meetings/:id/video-link` | Save the user-pasted video URL to `meetings.video_link` so the copyable block can show it |

(The copyable block itself is rendered server-side on the meeting page — no
event creation, no provider call.)

**Path B (connected calendar) — provider-agnostic; handler reads
`calendar_connections.provider` and branches to the Google or Graph client:**

| Method | Path | Does |
|---|---|---|
| POST | `/api/v1/meetings/:id/schedule` | Create the provider event (Meet/Teams link, attendees, RRULE, send-updates=all), store `calendar_provider` + `calendar_event_id` + `video_link`, send the OTP branded email |
| PUT | `/api/v1/meetings/:id/schedule` | Patch the provider event (time / attendees / recurrence), provider re-notifies |
| POST | `/api/v1/meetings/:id/schedule/resend` | Re-send invite to all or one attendee |
| DELETE | `/api/v1/meetings/:id/schedule` | Cancel the provider event, notify attendees, clear the synced fields |

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
- **Path B:** pass RRULE straight to the provider's recurrence field — Google's
  event `recurrence` array, or Graph's `recurrence` pattern object (Graph wants
  a structured pattern, so we map RRULE → Graph shape in the MS client). The
  provider manages the series; OTP stores the rule for display + edit.
- **Path A:** OTP does not manage recurrence — the user sets it in their own
  Google/Outlook invite. OTP just stores `recurrence_rule` for display so the
  meeting page can say "Every Tuesday 2:15 PM ET."
- Editing a recurring meeting (Path B): v1 edits the whole series ("this and
  following" is a later refinement, on both providers).

---

## 9. The team email (branded, via sendEmail)

Subject: `<Meeting title> — scheduled for <date>`
Body:
- One line: when + recurrence ("Every Tuesday 2:15 PM ET").
- **Join the meeting:** the video link (Meet or Teams).
- **Open in OTP:** `/l8/meeting/:id` (the live agenda / scorecard / IDS page).
- "You'll also get a calendar invite" note (Path B only).
- No em dashes, plain and human (per the global writing rule).

In Path B the provider's native calendar invite handles accept/decline + the
calendar entry (reaching Google and Microsoft 365 attendees alike); this email
is the OTP-branded layer that points people at the OTP meeting page, which is
the actual product surface. In Path A this email is optional — the user's own
calendar invite already carries the pasted OTP + video links.

---

## 10. UI surfaces

**Path A — "Add to calendar" (ships first):**
- An **"Add to calendar"** button on the L8 meeting page. Opens a small panel
  with a copyable link block (OTP meeting link + an optional "paste your video
  link" field that saves to `video_link`) and one line of instructions:
  "Create your recurring invite in Google Calendar or Outlook, then paste this
  in." A copy-to-clipboard button on the block.
- Provider-neutral copy — never assume Google or Microsoft.

**Path B — "Schedule + Invite" (later):**
- **Where:** a "Schedule" button on the L8 meeting page (`/l8/meeting/:id`)
  and/or on the `/l8` list next to each meeting. Opens a scheduling panel:
  date/time, duration, recurrence, attendee checklist (pre-checked from the
  team), "Schedule + Invite" button.
- **Connected state:** if no calendar is connected, the panel shows "Connect
  Google Calendar or Microsoft 365 to send invites" → the relevant OAuth flow
  (owner/admin). If the org would rather not connect, it falls back to Path A.
- **After scheduling:** the meeting page shows the video link (Meet or Teams),
  the recurrence, "Resend invite," and "Edit / Cancel."

---

## 11. Build phases (sequenced, each independently shippable)

0. **Path A — manual paste link** — "Add to calendar" panel, `video_link`
   field + save endpoint, copyable block, copy-to-clipboard, instructions.
   No OAuth, no provider calls. **Ships first — unblocks David now.**
1. **Google OAuth connection** — Google Cloud OAuth client, connect/callback/
   disconnect, encrypted token storage in `calendar_connections`
   (`provider='google'`), refresh helper. (Path B foundation.)
2. **Schedule one-time meeting (Google)** — create Google event with Meet link
   + attendees + sendUpdates, store synced fields, send OTP email. (Core value.)
3. **Recurrence (Google)** — RRULE UI + pass-through.
4. **Edit / cancel / resend (Google).**
5. **Microsoft 365 provider** — Azure app registration, `/microsoft/` OAuth
   flow, Graph client (create/update/cancel events, Teams link, RRULE→pattern
   mapping). Reuses the same endpoints + token/refresh pattern; branches on
   `provider`. This is the dual-provider unlock.
6. **.ics attachment** as an extra one-click add (optional, per D3).

Phase 0 delivers value with zero integration. Phases 1-2 deliver the headline
feature on Google (real invites + Meet link). Phase 5 adds Microsoft 365 so
either-provider orgs are fully covered.

---

## 12. Risks / watch-items

- **Token security** — encrypted at rest, never client-exposed, revoke on
  disconnect. This is the highest-sensitivity new surface; treat like the
  Emery PII encryption.
- **Refresh-token loss** — Google only returns a refresh token on first
  consent with `prompt=consent` + `access_type=offline`; Microsoft needs
  `offline_access` in scopes. Get both right once.
- **Two OAuth providers = two surfaces to keep working** — Google and Microsoft
  have different consent UX, token endpoints, and event shapes (Graph wants a
  structured recurrence pattern, not a raw RRULE). Build the provider client
  behind one interface so the endpoints stay provider-agnostic.
- **Attendee email gaps** — many chart tiles may not have an email yet
  (same gap that blocks invites elsewhere). Surface "no email" clearly
  rather than silently dropping someone from the invite.
- **Scheduling permission** — must use the impersonation-aware role check,
  not `resolveOrgForUser(auth.userId)`. The whole multi-tenant lesson from
  2026-05-26/27 applies here too.
- **Quota** — Calendar API and Graph both have generous quotas; one org won't
  hit them.

---

## 13. Open questions back to David

1. D0–D5 above.
2. Is there an existing Google Cloud project (from Google Ads) we should
   reuse for the OAuth client, or stand up a fresh one?
3. For Microsoft 365: do we have an Azure AD / Entra tenant to register the
   app in, or does that need to be set up?
4. Should "Add to calendar" / "Schedule" live on the L8 meeting page, the /l8
   list, or both?
5. For v1, is editing-the-whole-series acceptable (vs per-occurrence edits)?

---

_Next step: David answers D0–D5 + the open questions. Recommended sequence:
ship Phase 0 (manual paste link — no OAuth) first, then Phase 1-2 (Google),
then Phase 5 (Microsoft 365) for full dual-provider coverage._
