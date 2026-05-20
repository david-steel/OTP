/**
 * Google Ads server-side conversion upload.
 *
 * Replaces the client-side page-view tag in /onboarding/profile that was
 * over-counting (1 conversion logged with 0 Clerk users created on
 * 2026-05-19). The fire-once decision is made server-side from the
 * /onboarding/profile route (see src/routes/pages/onboarding.ts) when
 * (a) a brand-new Clerk user has just landed (no org yet),
 * (b) we have a captured gclid (or gbraid/wbraid) from the original ad click.
 *
 * The Clerk user.created webhook stays focused on email + onboarding row
 * creation; it does NOT fire conversions, because at webhook time the
 * gclid has not yet been bridged from the cookie into Clerk metadata
 * (the user is mid-redirect to /onboarding/profile).
 *
 * Env vars required (all on Railway):
 *   GOOGLE_ADS_DEVELOPER_TOKEN
 *   GOOGLE_ADS_OAUTH_CLIENT_ID
 *   GOOGLE_ADS_OAUTH_CLIENT_SECRET
 *   GOOGLE_ADS_OAUTH_REFRESH_TOKEN
 *   GOOGLE_ADS_CUSTOMER_ID                  -- 7543766419 (Orger.ai)
 *   GOOGLE_ADS_LOGIN_CUSTOMER_ID            -- 7543766419 (account is outside the Sneeze It MCC)
 *   GOOGLE_ADS_SIGNUP_CONVERSION_ACTION_ID  -- 7612278408
 *   GOOGLE_ADS_CONVERSION_DEFAULT_VALUE     -- '1' (placeholder USD)
 *   ENABLE_GOOGLE_ADS_CONVERSIONS=true      -- kill-switch
 *
 * Access tokens are cached in-process (memory), refreshed ~60s before
 * expiry. Volume is a few signups/day, so per-instance caching is fine.
 */
import crypto from 'crypto';

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const API_VERSION = 'v20';

interface CachedToken {
  accessToken: string;
  expiresAt: number; // epoch ms
}
let tokenCache: CachedToken | null = null;

async function getAccessToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiresAt - 60_000) {
    return tokenCache.accessToken;
  }
  const clientId = process.env.GOOGLE_ADS_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_ADS_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_ADS_OAUTH_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      'google-ads-conversions: OAuth env vars not set (GOOGLE_ADS_OAUTH_CLIENT_ID / _CLIENT_SECRET / _REFRESH_TOKEN)',
    );
  }
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
  });
  const res = await fetch(TOKEN_URL, { method: 'POST', body });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`google-ads-conversions: token refresh failed ${res.status}: ${text}`);
  }
  const json = (await res.json()) as { access_token: string; expires_in: number };
  tokenCache = {
    accessToken: json.access_token,
    expiresAt: Date.now() + json.expires_in * 1000,
  };
  return json.access_token;
}

/** Format a Date as Google Ads expects: "YYYY-MM-DD HH:MM:SS+00:00" (UTC). */
function formatConversionDateTime(d: Date): string {
  const iso = d.toISOString(); // 2026-05-20T15:43:21.123Z
  return iso.slice(0, 10) + ' ' + iso.slice(11, 19) + '+00:00';
}

/** SHA-256 hex of lowercased + trimmed input, per Enhanced Conversions spec. */
function sha256Lower(s: string): string {
  return crypto.createHash('sha256').update(s.trim().toLowerCase()).digest('hex');
}

export interface UploadSignupOptions {
  /** Original ad-click identifier captured from the landing URL. */
  gclid: string;
  /** When the signup actually happened. Defaults to now. */
  when?: Date;
  /** Email -- used hashed for Enhanced Conversions; never sent in clear. */
  email?: string | null;
  /** Override the env-default conversion value. */
  value?: number;
}

export interface UploadSignupResult {
  status: 'success' | 'partial' | 'failed' | 'disabled';
  errorMessage?: string;
  raw?: unknown;
}

/**
 * Upload a single SIGNUP click conversion to Google Ads.
 *
 * Failure modes return a result object rather than throwing -- callers
 * are responsible for never letting an upload failure break the signup
 * flow. All outcomes (success, partial, failed, disabled) should be
 * logged to conversion_log for retry/audit.
 */
export async function uploadSignupConversion(opts: UploadSignupOptions): Promise<UploadSignupResult> {
  if (process.env.ENABLE_GOOGLE_ADS_CONVERSIONS !== 'true') {
    return { status: 'disabled', errorMessage: 'ENABLE_GOOGLE_ADS_CONVERSIONS != true' };
  }

  const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
  const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID;
  const loginCustomerId = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID || customerId;
  const actionId = process.env.GOOGLE_ADS_SIGNUP_CONVERSION_ACTION_ID;
  if (!developerToken || !customerId || !actionId) {
    return {
      status: 'failed',
      errorMessage:
        'google-ads-conversions: missing GOOGLE_ADS_DEVELOPER_TOKEN / CUSTOMER_ID / SIGNUP_CONVERSION_ACTION_ID',
    };
  }

  const value =
    typeof opts.value === 'number'
      ? opts.value
      : Number(process.env.GOOGLE_ADS_CONVERSION_DEFAULT_VALUE ?? '1');

  const conversion: Record<string, unknown> = {
    gclid: opts.gclid,
    conversionAction: `customers/${customerId}/conversionActions/${actionId}`,
    conversionDateTime: formatConversionDateTime(opts.when ?? new Date()),
    conversionValue: value,
    currencyCode: 'USD',
  };
  if (opts.email) {
    conversion.userIdentifiers = [{ hashedEmail: sha256Lower(opts.email) }];
  }

  let token: string;
  try {
    token = await getAccessToken();
  } catch (err) {
    return { status: 'failed', errorMessage: (err as Error).message };
  }

  const url = `https://googleads.googleapis.com/${API_VERSION}/customers/${customerId}:uploadClickConversions`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'developer-token': developerToken,
        'login-customer-id': String(loginCustomerId),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        conversions: [conversion],
        partialFailure: true,
        validateOnly: false,
      }),
    });
  } catch (err) {
    return { status: 'failed', errorMessage: `network: ${(err as Error).message}` };
  }

  const raw = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { status: 'failed', errorMessage: `http ${res.status}`, raw };
  }
  const partialFailureError = (raw as { partialFailureError?: { message?: string } })
    ?.partialFailureError;
  if (partialFailureError && Object.keys(partialFailureError).length > 0) {
    return {
      status: 'partial',
      errorMessage: partialFailureError.message ?? 'partial failure',
      raw,
    };
  }
  return { status: 'success', raw };
}
