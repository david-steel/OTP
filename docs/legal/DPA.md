# Data Processing Agreement (DPA)

> **DRAFT — pending legal review.** Prepared 2026-06-17 for review by Michael Ben Shimon (counsel). This is a starting template grounded in OTP's actual technical posture (see `/trust.yaml` and the public Trust page at orgtp.com/trust). It is not legal advice and is not effective until executed by both parties. Bracketed fields `[like this]` are to be completed per customer.

This Data Processing Agreement ("DPA") forms part of the Agreement between **OTP, LLC**, a New Jersey limited liability company with offices at Fairfield, NJ 07004, USA ("OTP", "Processor"), and **[Customer legal name]** ("Customer", "Controller") governing Customer's use of the OTP platform at orgtp.com (the "Service").

Where Customer acts as a processor on behalf of its own customers, OTP acts as a subprocessor and the obligations below apply accordingly.

## 1. Definitions

Terms such as "Personal Data", "Processing", "Controller", "Processor", "Data Subject", and "Supervisory Authority" have the meanings given in the EU General Data Protection Regulation 2016/679 ("GDPR") and, where applicable, the UK GDPR. "Applicable Data Protection Law" means all privacy and data protection laws applicable to the Processing of Personal Data under the Agreement.

## 2. Roles and scope

2.1 As between the parties, Customer is the Controller and OTP is the Processor of Personal Data Processed in connection with the Service.

2.2 OTP will Process Personal Data only (a) to provide the Service, (b) per Customer's documented instructions (including configuration choices within the Service, such as keeping an organization private or choosing what to publish to the network), and (c) as required by law, in which case OTP will inform Customer unless legally prohibited.

2.3 The subject matter, duration, nature and purpose of Processing, the types of Personal Data, and the categories of Data Subjects are set out in **Annex I**.

## 3. Network publication is controlled by Customer

3.1 By default, Customer's operational data (priorities, issues, to-dos, KPIs, meeting data, organization chart, and member identities) is private to Customer's organization and is not exposed on any cross-organization surface of the Service.

3.2 Personal Data or organizational content becomes visible to other organizations only where Customer takes an explicit publishing action (for example, publishing a learning or best practice, or marking a profile or KPI public). Customer is the Controller of any decision to publish.

3.3 Customer may designate its organization "private", which excludes it from all cross-organization surfaces of the Service regardless of any per-item setting.

## 4. Processor obligations

OTP will:

(a) Process Personal Data only on Customer's documented instructions;

(b) ensure persons authorized to Process Personal Data are bound by confidentiality;

(c) implement the technical and organizational security measures described in **Annex II**;

(d) respect the conditions in Section 5 for engaging Subprocessors;

(e) taking into account the nature of the Processing, assist Customer by appropriate measures, insofar as possible, to respond to Data Subject requests under Applicable Data Protection Law;

(f) assist Customer in ensuring compliance with security, breach notification, data protection impact assessment, and prior consultation obligations, taking into account the nature of Processing and information available to OTP;

(g) at Customer's choice, delete or return all Personal Data after the end of the provision of the Service, and delete existing copies unless storage is required by law (see Section 8);

(h) make available to Customer information necessary to demonstrate compliance with this DPA and allow for and contribute to audits as described in Section 9.

## 5. Subprocessors

5.1 Customer provides general authorization for OTP to engage the Subprocessors listed in **Annex III** to support delivery of the Service.

5.2 OTP imposes data protection obligations on each Subprocessor that are no less protective than those in this DPA, and remains liable for each Subprocessor's performance of its obligations.

5.3 OTP will give Customer at least **[30] days'** prior notice of the addition or replacement of a Subprocessor (by updating the public subprocessor list and, where Customer has subscribed, by email). Customer may object on reasonable data protection grounds within that period; the parties will work in good faith to resolve the objection, and if unresolved Customer may terminate the affected Service.

## 6. International transfers

6.1 Customer Personal Data is hosted in the European Union (Railway region europe-west4, Amsterdam, Netherlands).

6.2 Where a Subprocessor Processes Personal Data outside the EEA, such transfer is made under an appropriate transfer mechanism under Applicable Data Protection Law (for example, the EU Standard Contractual Clauses), which the parties agree to incorporate by reference where required.

## 7. Personal data breach

7.1 OTP will notify Customer without undue delay, and in any event within **3 hours** of confirming a Personal Data Breach affecting Customer's Personal Data.

7.2 The notification will describe, to the extent known, the nature of the breach, the categories and approximate number of Data Subjects and records concerned, likely consequences, and the measures taken or proposed. OTP will provide a written post-incident summary and reasonable cooperation to support Customer's own notification obligations. OTP's incident process is maintained in its internal incident-response runbook.

## 8. Deletion and return

8.1 On termination or expiry of the Agreement, or on Customer's earlier written request, OTP will delete or return Customer Personal Data per Section 4(g).

8.2 On a verified deletion or right-to-erasure request, OTP permanently removes the relevant Personal Data within **7 days**, subject to any retention required by law and to backup cycles, where backups are encrypted, access-controlled, and expire on the schedule in Annex II.

## 9. Audit

9.1 OTP will make available information reasonably necessary to demonstrate compliance with this DPA, including its current security documentation and, where available, third-party attestations of its infrastructure providers.

9.2 Customer may audit no more than once per year (or following a Personal Data Breach) on reasonable prior notice, during business hours, without unreasonable disruption, and subject to confidentiality. Provision of a current SOC 2 report (once available) or equivalent will be deemed to satisfy a routine audit request.

## 10. Liability and term

10.1 Each party's liability under this DPA is subject to the limitations and exclusions of liability in the Agreement.

10.2 This DPA takes effect on the effective date of the Agreement and continues until OTP has ceased Processing all Customer Personal Data.

10.3 This DPA is governed by the law and jurisdiction stated in the Agreement, except where Applicable Data Protection Law requires otherwise.

---

## Annex I — Details of Processing

| Item | Detail |
|------|--------|
| **Subject matter** | Provision of the OTP coordination platform. |
| **Duration** | The term of the Agreement plus the deletion period in Section 8. |
| **Nature and purpose** | Hosting, storing, and processing organizational operating data and account information to operate the Service and, at Customer's election, the cross-organization intelligence network. |
| **Types of Personal Data** | Account and member identity (name, email, display name, role), profile fields a user chooses to add, and any Personal Data Customer includes in operating content (priorities, issues, to-dos, KPIs, meetings, org chart, learnings). |
| **Special categories** | None requested or required. Customer should not enter special-category data into free-text fields. |
| **Categories of Data Subjects** | Customer's authorized users and personnel represented in Customer's organization (for example, on the org chart). |

## Annex II — Technical and Organizational Measures

These reflect OTP's posture as published at orgtp.com/trust and recorded in `/trust.yaml`.

- **Encryption in transit:** TLS on all connections.
- **Encryption at rest:** All customer data encrypted at rest at the storage layer by the hosting provider; service secrets carry an additional encryption layer.
- **Tenant isolation:** Multi-tenant design; every record is organization-scoped and every request is bound to one organization before data is read. Cross-organization reads pass through a single shared visibility control that hard-excludes private organizations.
- **Authentication:** Managed OAuth (Clerk); no passwords stored by OTP. API keys are stored hashed (SHA-256).
- **Signed tokens:** Application-issued tokens are signed with HMAC-SHA256 and verified in constant time.
- **Audit logging:** Organization-level actions recorded with actor and entity, retained 12 months.
- **Abuse protection:** Per-IP rate limiting.
- **Backups and recovery:** Daily encrypted backups (05:00 UTC), retained 30 days, EU storage; RPO 24h, RTO under 1 hour; restores logged and integrity-verified.
- **Deletion:** Soft-delete with audit trail; verified hard-delete within 7 days.
- **Infrastructure assurance:** Hosting provider (Railway) is SOC 2 Type II certified and HIPAA compliant; reports available on request. OTP is targeting its own SOC 2 Type II within six months.

## Annex III — Subprocessors

| Subprocessor | Purpose | Location |
|--------------|---------|----------|
| Railway | Cloud hosting and managed PostgreSQL | US company; data hosted in EU West (Amsterdam) |
| Clerk | Authentication | United States |
| Cloudflare R2 | File / object storage | Global edge |
| Resend | Transactional and newsletter email | United States |
| Stripe | Billing and payments | United States |
| Svix | Webhook delivery | United States |
| Anthropic | AI features (Ask AI, Rock AI); does not train on paid-API data | United States |
| Google Ads | Marketing conversion tracking on public pages only | United States |

*The current list is maintained at orgtp.com/trust.*
