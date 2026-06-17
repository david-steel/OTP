# OTP Incident Response Runbook

> Internal. Owner: David Steel (CEO), security@orgtp.com. Last updated 2026-06-17. This runbook backs the public commitment on orgtp.com/trust: on a confirmed security incident affecting customer data, we contain it and notify affected organizations **within 3 hours**.

The point of this document is that the 3-hour promise is a process, not a slogan. Keep it short enough to actually follow under pressure.

## Roles

| Role | Who | Responsibility |
|------|-----|----------------|
| Incident Lead | David Steel (default) | Owns the incident end to end, makes the containment and notification calls. |
| Engineering | On-call engineer | Investigates, contains, eradicates, recovers. |
| Comms | Incident Lead or delegate | Drafts and sends customer notifications; single source of external truth. |

For a solo or small team, one person may hold multiple roles. The Incident Lead role is never unassigned.

## Severity

| Sev | Definition | Examples |
|-----|------------|----------|
| **SEV-1** | Confirmed exposure or loss of customer Personal Data, or active unauthorized access. | Cross-tenant data leak, database exfiltration, leaked production secret in use. |
| **SEV-2** | Security control failure with no confirmed data exposure yet. | Auth bypass found in code, exposed secret rotated before use, vulnerable dependency under active exploit. |
| **SEV-3** | Low-impact or potential issue. | Reported vulnerability needing validation, suspicious but unconfirmed activity. |

The 3-hour customer notification clock applies to **SEV-1** (confirmed Personal Data Breach). SEV-2/3 are handled on a best-effort timeline and escalated if they become SEV-1.

## Detection sources

- Application logs (Fastify logger) and the `audit_logs` table (actor, action, entity).
- Railway platform alerts and metrics.
- Stripe / Clerk / provider security notices.
- Inbound reports to security@orgtp.com (monitored; 1 business day SLA for inquiries, immediate for suspected incidents).
- Rate-limiter signals on sensitive endpoints.

**Roadmap gap (track until closed):** there is no external error-monitoring/APM (e.g. Sentry) yet. Add it to shorten time-to-detect. Until then, detection leans on logs, provider alerts, and inbound reports.

## The process

### 1. Detect and declare (clock starts at confirmation)
- Anyone who suspects an incident contacts the Incident Lead immediately.
- Incident Lead confirms it is a real incident and assigns severity. For SEV-1, the 3-hour notification clock starts now.
- Open an incident record: timestamp, what is known, severity, who is involved.

### 2. Triage (first ~30 min)
- Scope it: what data, which organizations, what time window, still ongoing?
- Preserve evidence: capture relevant logs and `audit_logs` rows before any change that could overwrite them.
- Do not tip off an active attacker before containment is ready.

### 3. Contain
- Stop the bleed: rotate the implicated secret, revoke the session or API key, disable the affected endpoint or feature flag, or take the surface offline.
- Secrets live as Railway service variables; rotate there and redeploy. Clerk sessions and OTP API keys can be revoked.
- Confirm containment held before moving on.

### 4. Eradicate and recover
- Remove the root cause (patch the code path, close the access, fix the misconfiguration).
- Restore integrity: if data was altered or lost, restore from the daily encrypted backup (RPO 24h, RTO under 1 hour) via the Railway dashboard, then verify integrity.
- Watch for recurrence before declaring recovered.

### 5. Notify (SEV-1: within 3 hours of confirmation)
- Identify affected organizations (use org-scoping and `audit_logs` to bound the set).
- Send the initial notification to each affected organization's primary contact. Use the template below. It is better to send a complete-as-of-now notice within the window than a perfect one late.
- Honor any contractual notice terms in a customer's DPA (the standard DPA commits to the same 3-hour window).
- If the incident triggers regulatory obligations (e.g. GDPR 72-hour authority notification where OTP is controller, or assisting a customer-controller), the Incident Lead coordinates with counsel (Michael Ben Shimon).

### 6. Post-incident review (within 5 business days)
- Write a short post-incident summary: timeline, root cause, impact, what was done, and concrete follow-ups with owners and dates.
- Send the written post-incident summary to affected customers.
- File follow-ups (detection gaps, control fixes) and track them to done.

## Customer notification template (initial)

> Subject: Security notice regarding your OTP account
>
> Hi [name],
>
> We are writing to inform you of a security incident that may affect your organization's data in OTP.
>
> What happened: [plain-language description].
> When: [time window, with timezone].
> What data was involved: [specific categories, or "we are still determining the full scope"].
> What we have done: [containment and remediation steps taken so far].
> What you should do: [actions, if any, e.g. rotate API keys].
>
> We take this seriously and will follow up with a written summary as our investigation completes. Questions: security@orgtp.com.
>
> [Name], OTP

## Key contacts

| Need | Contact |
|------|---------|
| Incident Lead | David Steel — security@orgtp.com |
| Hosting / DB / secrets | Railway dashboard; status.railway.com |
| Auth | Clerk dashboard |
| Payments | Stripe dashboard |
| Legal | Michael Ben Shimon (counsel) |
