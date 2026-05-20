---
type: plan
date: 2026-05-20
status: ready
agent: conatus
related: [google-ads-campaign-launch, clerk-webhook, conversion-tracking]
---

# Google Ads Server-Side SIGNUP Conversions

## Problem

The current Google Ads `SIGNUP` conversion (action id `7612278408`, primary for goal) is firing without a real Clerk user being created. May 19 logged 1 conversion in `Radar Competitors`; Clerk recorded 0 new users in the last 48 hours. The most likely cause is a client-side tag that fires on a page view (added in commit `10c844a`, "Add EOS positioning and Google Ads tracking to homepage" / `ea04289`, "Move conversion_event_signup to onboarding Step 1") rather than on a confirmed Clerk user creation.

Page-view tags fire on test visits, double loads, partial onboarding, and direct route hits. They will keep over-counting and they corrupt the Maximize Conversions signal.

## Goal

Fire the `SIGNUP` conversion exactly when Clerk creates a user, attributed to the original ad click via `gclid`. Server-side. No client tag.

## Architecture

```
1. Ad click on Google           orgtp.com/?gclid=XYZ
2. Landing middleware           capture ?gclid= → set httpOnly cookie (90d)
3. Visitor signs up via Clerk
4. Post-Clerk session handler   read cookie → clerkClient.users.updateUser(id,
                                  { publicMetadata: { gclid, gclidTs }})
5. Clerk fires user.created     → POST /clerk/webhook
6. Existing webhook handler     read publicMetadata.gclid, if present:
                                  POST to Google Ads ConversionUploadService
                                  with the SIGNUP action id + gclid + value
7. Google Ads logs offline
   conversion against that
   exact click                  (visible in reports ~3h later)
```

Server-side firing eliminates every false-positive shape: anonymous views, repeat loads, internal tests, partial signups. Also opens Enhanced Conversions for Leads (hashed email) in Phase 2 so attribution survives ad-block and ITP.

## Files

### NEW

- **`src/lib/google-ads-conversions.ts`** — wrapper around Google Ads `ConversionUploadService`.
  - `uploadSignupConversion({ gclid, when, value?, email? }): Promise<{ status, raw }>`
  - Handles OAuth token refresh, the developer-token + login-customer-id headers, and the v20 `customers/{id}:uploadClickConversions` POST.
  - Reads conversion-action resource name from env so we never hard-code the id in code.

- **`src/middleware/gclid-capture.ts`** — Fastify `onRequest` hook.
  - Reads `request.query.gclid` (and `gbraid`, `wbraid` for iOS/SKAN attribution).
  - Sets cookie `otp_gclid=<value>;Max-Age=7776000;Path=/;SameSite=Lax;Secure;HttpOnly`.
  - Also writes `otp_gclid_ts=<ISO>` so we have a click timestamp.
  - Skips if cookie already set (don't overwrite older click on same browser unless explicit new gclid present).

- **`src/db/migrations/000X_conversion_log.sql`** (or matching ensure-X self-heal per `feedback_otp_schema_must_self_heal.md`):
  ```
  conversion_log:
    id pk, created_at, gclid, clerk_user_id, conversion_action_id,
    value, currency, status (queued|success|failed),
    error_message, raw_response jsonb
  ```
  Used for audit + retry. Required before launching paid traffic.

### EXTEND

- **`src/routes/api/clerk-webhook.ts`** — inside the existing `user.created` branch, after the email path runs and the `onboardingSequence` row is created/checked, add:
  ```ts
  const meta = (user as any).public_metadata ?? {};
  if (meta.gclid) {
    const result = await uploadSignupConversion({
      gclid: meta.gclid,
      when: new Date(),
      email,           // for Enhanced Conversions, Phase 2
    });
    await db.insert(conversionLog).values({
      gclid: meta.gclid,
      clerkUserId: user.id,
      conversionActionId: process.env.GOOGLE_ADS_SIGNUP_CONVERSION_ACTION_ID!,
      status: result.status,
      rawResponse: result.raw,
    });
  }
  ```
  Wrap in try/catch. **An upload failure must not break the webhook** — log and continue. Failed rows can be retried (Google accepts offline conversions for 90 days).

- **`src/routes/pages/onboarding.ts`** (or whichever route is hit immediately after Clerk auth) — add cookie → publicMetadata write:
  ```ts
  const gclid = request.cookies.otp_gclid;
  const gclidTs = request.cookies.otp_gclid_ts;
  if (gclid && !user.publicMetadata?.gclid) {
    await clerkClient.users.updateUser(user.id, {
      publicMetadata: { ...user.publicMetadata, gclid, gclidTs },
    });
  }
  ```
  This is what makes the gclid travel from cookie to Clerk to the webhook.

### REMOVE / GUARD

- The client-side tag added in `10c844a` / `ea04289`. Find it (likely in `src/views/layouts/main.ejs` or one of the home/onboarding EJS templates) and delete it. Replace with nothing — server-side fires the conversion now.

## Env vars (Railway)

OAuth credentials live locally in `~/.claude/mcp-google-ads/google_ads_token.json`. Extract and add to Railway:

```
GOOGLE_ADS_DEVELOPER_TOKEN=sHU5QyTsy0X8QbPqvuW3BQ
GOOGLE_ADS_OAUTH_CLIENT_ID=<from google_ads_token.json>
GOOGLE_ADS_OAUTH_CLIENT_SECRET=<from google_ads_token.json>
GOOGLE_ADS_OAUTH_REFRESH_TOKEN=<from google_ads_token.json>
GOOGLE_ADS_CUSTOMER_ID=7543766419
GOOGLE_ADS_LOGIN_CUSTOMER_ID=7543766419   # outside Sneeze It MCC, login-customer-id = self
GOOGLE_ADS_SIGNUP_CONVERSION_ACTION_ID=7612278408
GOOGLE_ADS_CONVERSION_DEFAULT_VALUE=1     # placeholder so Maximize Conversions has a value to optimize
ENABLE_GOOGLE_ADS_CONVERSIONS=true        # kill-switch for rollback
```

`LOGIN_CUSTOMER_ID = 7543766419` is the same as the customer id because per `project_orger_google_ads_outside_mcc.md` this account is outside the Sneeze It MCC.

## Implementation order

1. Build `src/lib/google-ads-conversions.ts` standalone. Unit-test against a synthetic gclid in dev (uploads with a `validateOnly: true` flag first if available).
2. Add `gclid-capture` middleware. Verify cookie appears on a visit with `?gclid=test123`.
3. Add cookie → Clerk publicMetadata bridge in the post-signup route.
4. Extend `clerk-webhook.ts` user.created handler with the conversion upload + log insert.
5. Add `conversion_log` schema (ensure-X self-heal pattern).
6. Add all env vars to Railway.
7. Push Clerk webhook subscription verification (already enabled per existing handler, but confirm `user.created` event is in the subscription).
8. **Remove the client-side tag** as a final step, after the server side has fired at least one real conversion in test.

## Verification

- **Tag-fire test**: hit `https://orgtp.com/?gclid=test_abc123`, signup as a fresh test user, check that:
  - Cookie `otp_gclid=test_abc123` was set
  - The Clerk user's `publicMetadata.gclid` is `test_abc123` after signup
  - `conversion_log` row appears with `status=success`
  - Google Ads `conversion_action_view` shows the synthetic conversion within ~3 hours (filter to the gclid via the click view)
- **Steady-state**: one week after launch, daily Clerk user count should equal Google Ads `SIGNUP` conversions for users who arrived with a gclid. Organic signups (no gclid) will not show up in Google Ads, which is correct.

## Rollback

- Webhook misbehaves: disable in Clerk Dashboard.
- Upload library throws: set `ENABLE_GOOGLE_ADS_CONVERSIONS=false`, the upload becomes a no-op, `conversion_log` rows still capture intent for later replay.
- Bad conversion data already sent: Google Ads supports `adjustOfflineConversions` to retract/correct conversions within 90 days.

## Phase 2 (Enhanced Conversions for Leads)

After basics are stable, add hashed email to the upload payload:

```ts
userIdentifiers: [{
  hashedEmail: sha256(email.trim().toLowerCase()),
}],
```

This recovers attribution for clicks where the gclid cookie was missing or cleared. Material lift in attribution on mobile and on browsers with ITP. Single additional field, no extra infrastructure.

## Open questions

1. **Where is the current client-side tag actually wired?** Need to read commits `10c844a` and `ea04289` to find the exact file. Once found, that's the file to gut in step 8.
2. **Does Clerk signup round-trip through a server route I can hook for the cookie → metadata write,** or is it pure client-side ending in a Clerk-hosted return URL? If pure client-side, the cookie → metadata write goes in the first server-rendered onboarding page instead.
3. **Conversion value.** Free signup, so the strict value is $0. But Maximize Conversions optimizes on count, not value, so $0 is fine. Using $1 placeholder costs nothing and keeps the door open to value-based bidding later (e.g., differentiating signup → activated user with different values).
4. **Multi-touch.** If the same browser clicks multiple ads before signing up, we keep the most recent gclid (don't overwrite with older). Reasonable default for short funnels.

## Notes

- Per `feedback_otp_schema_must_self_heal.md`: the `conversion_log` table should be created via an `ensure-conversion-log.ts` self-healing pattern, not a one-shot drizzle migration that can drift.
- Per `feedback_lock_audience_before_landing_copy.md`: gclid capture runs on all landing pages, but the conversion only fires once per Clerk user creation. Re-signing-in does not re-fire.
- Per `project_orger_google_ads_outside_mcc.md`: the API call must include `login-customer-id: 7543766419` (same as customer id), not the Sneeze It MCC.
