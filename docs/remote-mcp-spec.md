# Spec: Remote MCP Endpoint ("Connect OTP to your AI")

**Status:** Draft for review
**Owner:** David / OTP eng
**Date:** 2026-06-20
**Goal:** Let any org connect OTP to Claude (desktop/web), Cursor, Windsurf, Cline, etc. with a hosted URL — no `npx`, no local install. Instructions live in `/settings/api`, the `/mcp` hub, and `/guide`.

---

## 1. Why

Today the only way to wire OTP into an agent is the **local stdio** server:

```json
{ "mcpServers": { "otp": { "command": "npx", "args": ["-y", "otp-mcp-server"],
  "env": { "OTP_API_KEY": "otp_..." } } } }
```

That requires Node, a terminal, editing a JSON file, and a published npm package. It blocks the people we most want connecting — non-technical operators running EOS in Claude. Anthropic's "Add custom connector" dialog (and every other MCP client) wants one thing: a **Remote MCP server URL**. We don't expose one. This spec adds it.

**Outcome:** a customer pastes `https://orgtp.com/api/mcp/<their-token>` into the connector dialog (Phase 1), or clicks "Connect" and logs in with Clerk (Phase 2), and OTP's 31 tools appear — scoped to their org.

---

## 2. Current state (grounded)

| Piece | Where | Note |
|---|---|---|
| MCP server (stdio) | `mcp-server/src/index.ts` | 31 tools. `StdioServerTransport` only. |
| Tool → REST call | `mcp-server/src/index.ts:7-29` | `otpFetch()` → `${OTP_BASE_URL}/api/v1${path}`, `Authorization: Bearer <key>` |
| API key auth | `src/middleware/api-key-auth.ts:26-63` | `resolveApiKey(request)` → `{ orgId, keyId, scopes }` |
| Key schema | `src/db/schema.ts:195-210` | `api_keys`: orgId, keyHash (SHA256), keyPrefix, scopes[], expiresAt, revokedAt |
| Universal org resolver | `src/middleware/auth-helpers.ts:50-58` | `getAuthOrg()` — Clerk → API key → service → demo |
| Fastify bootstrap | `src/server.ts:859-941` | API routes register under `/api/v1` prefix |
| Existing OAuth provider | — | **None.** OTP is an OAuth *consumer* (Google Ads, Composio) only. |

The 19 authed tools are thin wrappers over `/api/v1/*` REST endpoints that already enforce org scoping. **We are not rebuilding business logic — only adding a transport and a per-request auth shim.**

---

## 3. Target connection UX

Three clients matter, in priority order:

1. **Claude desktop + web** — Settings → Connectors → "Add custom connector" → paste URL. If the server advertises OAuth, Claude runs the OAuth flow; otherwise it connects to the URL as-is (token-in-URL).
2. **Cursor / Windsurf / Cline** — `mcpServers` JSON entry with a `url` field (Streamable HTTP) instead of `command`.
3. **Claude Code** — `claude mcp add --transport http otp https://orgtp.com/api/mcp/<token>`.

All three speak **Streamable HTTP** (the current MCP remote transport, superseding HTTP+SSE).

---

## 4. Architecture

### 4.1 Shared tool registry (prerequisite refactor)

Right now tool definitions + handlers live inside `mcp-server/src/index.ts` and read a **global** `OTP_API_KEY` env var. For a multi-tenant HTTP server, auth must be **per request**, not per process.

**Refactor:** extract the tool list + handlers into a transport-agnostic module that takes an auth context as an argument.

```
mcp-server/src/tools.ts        // export const TOOLS = [...]; export async function callTool(name, args, ctx)
                               // ctx = { baseUrl, apiKey | bearerToken, orgId, scopes }
mcp-server/src/index.ts        // stdio transport → builds ctx from env, calls shared registry
src/routes/api/mcp.ts          // HTTP transport → builds ctx from request token, calls shared registry
```

Both transports import the same `TOOLS`/`callTool`. One source of truth; the stdio package keeps working unchanged for existing users.

### 4.2 Transport

Use the MCP TypeScript SDK `StreamableHTTPServerTransport` mounted in Fastify.

- Route group: `src/routes/api/mcp.ts`, registered in `src/server.ts` alongside the other `/api/v1` registrations (but at `/api/mcp`, **outside** the Clerk-required scope so token auth can run first).
- `POST /api/mcp/:token` — JSON-RPC requests (initialize, tools/list, tools/call).
- `GET /api/mcp/:token` — server→client SSE stream (notifications).
- `DELETE /api/mcp/:token` — session teardown.
- Enable the SDK's `enableDnsRebindingProtection` + `allowedHosts: ['orgtp.com']` and validate `Origin`. (DNS-rebinding is the headline Streamable-HTTP attack.)
- Handle `Mcp-Session-Id` header per SDK; keep sessions in memory (stateless-friendly — a re-init rebuilds context).

### 4.3 Auth — two phases

**Phase 1 — token-in-URL (ship first).** The `:token` path segment is an OTP API key (or a new MCP-scoped token; see §6). On each request:

1. `resolveMcpToken(token)` — SHA256 → look up `api_keys` by hash, check not revoked/expired → `{ orgId, scopes }`. (Mirrors `resolveApiKey`, but reads the token from the path, not the `Authorization` header.)
2. Build `ctx = { orgId, scopes }`, hand to `callTool`.
3. Public-read tools work even with no/invalid token (degrade to anonymous reads, matching today's behavior). Authed tools 401 without a valid token.

This works **today** with the dialog David screenshotted — paste the URL, done. No OAuth needed.

**Phase 2 — OAuth 2.1 + Dynamic Client Registration (the "Connect" button).** Net-new, makes it one-click and tokenless in the URL. Implement the discovery + flow the MCP spec requires:

- `GET /.well-known/oauth-protected-resource` (RFC 9728) — points at our auth server.
- `GET /.well-known/oauth-authorization-server` (RFC 8414) — advertises endpoints + PKCE.
- `POST /api/mcp/oauth/register` (RFC 7591 DCR) — clients self-register.
- `GET /api/mcp/oauth/authorize` — **bridge to Clerk**: if no Clerk session, redirect to OTP login; on return, the logged-in user picks an org, we mint an auth code.
- `POST /api/mcp/oauth/token` — exchange code (PKCE) → short-lived access token (+ refresh). Access token encodes `{ orgId, scopes }`, validated like an API key.

Phase 2 reuses Clerk for the human login and the `api_keys`/scope model for the resulting machine token — so it's a thin OAuth shell over auth we already have, not a new identity system.

---

## 5. Tool scoping & safety

- Reuse `requireScope(ctx, 'write')` (`api-key-auth.ts:65`). Map each tool to `read` or `write`; the 12 public-read tools need no token, the 19 authed tools enforce scope.
- **Org isolation is the #1 risk.** Every `callTool` path must derive org *only* from the validated token's `orgId` — never from a tool argument. Add a test that a token for org A cannot read/write org B (the kind of tenant-leak bug we've hit before — see `getAuthOrg` discipline).
- Rate-limit `/api/mcp/*` with `@fastify/rate-limit` (reuse the public-API limiter, ~60/min/token).
- Write tools (`publish_oos`, `capture_learning`, `update_kpi`, `add_rock`, todos, meeting lifecycle) are real mutations — log to the existing audit log with `source: 'mcp-remote'`.
- Token in URL is a bearer secret: serve only over HTTPS, never log full URLs (mask to prefix), and make tokens revocable from `/settings/api` (they already are).

---

## 6. Data model

Phase 1 reuses `api_keys` as-is — a key already maps to `{ orgId, scopes }`. **Recommended addition:** a `kind` column (`'api' | 'mcp'`) so MCP tokens are listed/managed separately in the UI and can carry their own default scopes/limits. One Drizzle migration:

```ts
// src/db/schema.ts  api_keys
kind: varchar('kind', { length: 16 }).notNull().default('api'),
```

Phase 2 adds two small tables: `oauth_clients` (DCR registrations) and `oauth_codes`/`oauth_tokens` (short-lived grants) — or store grants in `api_keys` with `kind: 'oauth'` + `expiresAt` and skip a table.

---

## 7. Docs & help surfaces (the deliverable David asked for)

| Surface | File | Change |
|---|---|---|
| **Settings → MCP / API keys** (primary, authed) | `src/views/pages/settings-api.ejs:85-101` | Add **"Connect via Remote MCP"** block above the npx config: the user's personalized `https://orgtp.com/api/mcp/<token>` with a copy button, a one-line "paste this into Claude → Settings → Connectors", and per-client snippets (Claude, Cursor, Windsurf, Claude Code). |
| **MCP Hub** (marketing) | `src/views/pages/mcp-hub.ejs:124-165` | Add a **"Remote (hosted)"** tab next to the existing "Local (npx)" Quick Start. Remote tab is the recommended default. |
| **Connect Your Agent guide** | `src/views/pages/guide-connect-agent.ejs:186-253` | Add a "Path 4: Remote MCP (no install)" with step-by-step + screenshots for the connector dialog. |
| **User Guide section** | `src/data/guide-content.ts` | New searchable `GuideSection` — "Connect your AI agent via MCP" — so it surfaces in `/guide` search + the navbar help box. |
| **FAQ** | `src/routes/pages/pages.ts:1263` | Add Q: "How do I connect OTP to Claude / Cursor / Windsurf?" → links to `/settings/api`. |
| **Changelog** | `src/data/changelog.ts` | Launch entry tagged `['Major','Integrations']` — feeds `/whats-new` + the weekly digest. |

Copy guidance: lead with the **remote** path everywhere; demote the npx/local path to "advanced / self-hosted". The hosted URL is the funnel.

**Implementer gotchas (from prior incidents):** EJS partial includes use `../partials/x`; if you touch `/public/*` CSS, version the asset URL (`?v=`) or it won't show; `orgy-*`/`ollie` palette classes need the palette partial included.

---

## 8. Rollout

Per OTP convention, **new features ship through Labs first.** Register an `mcp_remote` flag in `src/config/lab-features.ts` (benefit-led description + whyNow), gate the `/settings/api` block and the `/api/mcp` route behind it, default **OFF**. Dogfood on our own org, then enable for a few design-partner orgs, then GA + changelog.

**Suggested sequence:**
1. Shared tool-registry refactor (`tools.ts`) — no behavior change, unblocks everything.
2. Phase 1 endpoint + token-in-URL + `/settings/api` block, behind Labs `mcp_remote`.
3. Dogfood (connect this very desktop app to the hosted URL instead of npx).
4. `/mcp` hub + guide + FAQ + changelog.
5. GA. Phase 2 (OAuth) as a fast-follow once demand is proven.

---

## 9. Decisions to make

1. **Phase 1 only, or wait for OAuth?** Recommendation: ship Phase 1 token-in-URL now (works with the dialog today, ~1–2 days), OAuth as fast-follow. Don't block the funnel on OAuth.
2. **Free or paid/metered?** Remote MCP is a strong candidate for a paid/Pro gate (it's the "real integration"). Per our paid-tool convention, build it paywalled-and-ready even if the gate is open at launch. Decide before the `/settings/api` copy is written.
3. **`/api/mcp/<token>` vs `/api/mcp` + `Authorization` header?** Path-token works in the most clients (incl. the Claude dialog, which has no header field). Header-only is cleaner but fails the screenshotted dialog. Recommendation: support both; document the path-token form.
4. **New `mcp` token kind, or reuse `api` keys?** Recommendation: add `kind` column — cheap, and lets us show "MCP connections" distinctly and revoke independently.

---

## 10. Effort estimate

- Shared `tools.ts` refactor: ~0.5 day
- Phase 1 HTTP transport + token auth + Labs gate: ~1 day
- `/settings/api` + `/mcp` + guide/FAQ/changelog copy: ~0.5–1 day
- Phase 2 OAuth 2.1 + DCR + Clerk bridge: ~2–3 days (separate)

**Phase 1 GA: ~2–3 days. Full OAuth: +2–3 days.**
