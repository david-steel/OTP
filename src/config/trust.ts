// =============================================================================
// OTP Trust Center — render data for the public /trust page.
//
// SOURCE OF TRUTH / AUDIT TRAIL: /trust.yaml at the repo root carries the same
// claims WITH `# source:` code citations for legal review. This file is the
// build-safe render copy (tsc emits it into dist/; a root .yaml would not ship
// in the prod image). Keep the two in sync when claims change.
//
// Every claim here is grounded in code or confirmed by David/Railway 2026-06-17.
// Do not add a claim you cannot back with an artifact. Underclaiming is safe.
// =============================================================================

export interface TrustData {
  company: {
    name: string;
    legalEntity: string;
    tagline: string;
    description: string;
    website: string;
    headquarters: string;
    trustLead: string;
  };
  hero: { statusMessage: string; lastUpdate: string; commitments: string[] };
  network: {
    defaultPosture: string;
    isolationMechanism: string;
    isolationCaveat: string;
    staysPrivate: string[];
    canBecomeVisible: { item: string; condition: string }[];
    privatePlan: { name: string; description: string; mechanism: string; limitation: string };
  };
  infrastructure: {
    hosting: string;
    dataResidency: string;
    encryption: string;
    retention: string;
    backups: string;
  };
  dataHandling: { deletion: string; export: string; aiProcessing: string; rateLimiting: string };
  policies: { name: string; coverage: string }[];
  compliance: { name: string; status: string; scope: string }[];
  subprocessors: { name: string; category: string; location: string; description: string }[];
  monitoring: { responseCommitment: string; incidentHistory: string };
  faqs: { question: string; answer: string }[];
  contacts: { email: string; sla: string };
  documents: { name: string; description: string; access: string }[];
}

export const trust: TrustData = {
  company: {
    name: 'OTP',
    legalEntity: 'OrgTP, LLC',
    tagline: 'The coordination intelligence layer for operating teams.',
    description:
      'OTP helps organizations run their operating system (priorities, issues, to-dos, KPIs, meetings, org chart) and, only when they choose to, learn from an opt-in cross-organization intelligence network. This page documents exactly what data OTP touches, how it is protected, and what stays private to your organization versus what becomes visible to the network.',
    website: 'https://orgtp.com',
    headquarters: 'Fairfield, NJ 07004, USA',
    trustLead: 'David Steel, CEO — security@orgtp.com',
  },

  hero: {
    statusMessage:
      'OTP is pre-SOC 2 and targeting SOC 2 Type II within six months. We document our controls openly here rather than hide behind a badge we have not yet earned. Our infrastructure runs on Railway, which is SOC 2 Type II certified and HIPAA compliant.',
    lastUpdate: 'June 17, 2026',
    commitments: [
      'Your operating data is private to your organization by default.',
      'Nothing joins the cross-org network unless you explicitly publish it.',
      'Customer data is hosted in the EU (Amsterdam) and encrypted at rest.',
      'All traffic is encrypted in transit (TLS).',
      'Every organization-level action is written to an audit log.',
      'We notify affected organizations within 3 hours of a confirmed breach.',
    ],
  },

  network: {
    defaultPosture:
      'Private by default. Your operational data is scoped to your organization and is never exposed on any cross-org surface unless you take an explicit action to publish it.',
    isolationMechanism:
      'Multi-tenant by design. Every record (priorities, to-dos, KPIs, meetings, org chart, learnings) carries an organization ID, and every request is bound to one organization before any data is read.',
    isolationCaveat:
      'Tenant scoping is enforced in the application layer on every route, and every cross-org read additionally passes through one shared visibility control. We disclose plainly that isolation is enforced in the application, not via database row-level security.',
    staysPrivate: [
      'Quarterly priorities / Rocks',
      'Issues and To-Dos',
      'KPIs and scorecard values',
      'Meeting data (leadership / L10)',
      'Org chart',
      'Member identities and profiles',
    ],
    canBecomeVisible: [
      { item: 'Published learnings', condition: 'Only after you explicitly publish a learning to the network.' },
      { item: 'Best practices', condition: 'Only practices your organization chooses to publish.' },
      { item: 'Coordination patterns', condition: 'Derived only from published learnings, never from private data.' },
      { item: 'Org profile and chart', condition: 'Only if you set the organization profile to public.' },
      { item: 'KPIs', condition: 'Only KPIs you explicitly mark public.' },
    ],
    privatePlan: {
      name: 'Private organizations',
      description:
        'Organizations flagged private are hard-excluded from every cross-org surface — browse, search, the intelligence graph, recommendations, published best-practices listings, and the network API — regardless of any per-item publish setting.',
      mechanism:
        'Enforced through a single shared control so the rule cannot drift between surfaces. A boot-time check rebuilds the network data view to include the same exclusion.',
      limitation:
        'Privacy is all-or-nothing at the organization level; there is no per-item private override.',
    },
  },

  infrastructure: {
    hosting:
      'Application and managed PostgreSQL 16 run on Railway. File storage on Cloudflare R2. Railway is SOC 2 Type II certified and HIPAA compliant; its SOC 2 report, BAAs, and penetration-test reports are available from Railway on request (trust.railway.com).',
    dataResidency: 'EU West — Amsterdam, Netherlands (Railway region europe-west4).',
    encryption:
      'In transit, all connections use TLS. At rest, all customer data is encrypted at the storage layer by Railway, and service secrets carry an additional layer of encryption, decrypted only when needed. Application-issued tokens (demo access, email unsubscribe, admin impersonation) are signed with HMAC-SHA256 and verified in constant time. There is no application-level column encryption.',
    retention:
      'The realtime sync event log is pruned daily and retained 30 days. Audit logs are retained for 12 months. Most records use soft-delete (rows retained with a deletion timestamp for audit) until a hard-delete request is processed.',
    backups:
      'Daily automated PostgreSQL backups at 05:00 UTC, retained 30 days, stored in Railway-managed backup storage (EU West) and encrypted at rest. Recovery Point Objective 24 hours; Recovery Time Objective under 1 hour. Restores are performed and integrity-verified via the Railway dashboard, and restore operations are logged.',
  },

  dataHandling: {
    deletion:
      'Day-to-day deletes are logical (soft-delete) so data can be recovered and audit trails preserved. On a verified deletion or right-to-be-forgotten request, personal data is permanently removed within 7 days.',
    export:
      'OTP imports from Ninety.io and Bloom Growth exports. Customers may request a copy of their data; a self-serve export endpoint is on the roadmap.',
    aiProcessing:
      "Some features (Ask AI, Rock AI) send the relevant organization content for that request to Anthropic's Claude API to generate a response. Anthropic does not train its models on data submitted through its paid API. OTP sends only the content needed for the requested feature, not your full data set.",
    rateLimiting:
      'Abuse protection via per-IP rate limiting (100 requests/minute globally, with tighter limits on sensitive endpoints such as newsletter signup).',
  },

  policies: [
    { name: 'Authentication', coverage: 'Clerk-managed OAuth. OTP stores no passwords.' },
    { name: 'API access control', coverage: 'API keys are hashed (SHA-256) at rest and presented as bearer tokens.' },
    { name: 'Tenant isolation', coverage: 'Every request is bound to one organization before any data is read.' },
    { name: 'Privileged access', coverage: 'Admin "view-as" uses a signed cookie that binds the action to the acting admin for audit.' },
    { name: 'Audit logging', coverage: 'Organization registration, publishing, and key actions are recorded with actor and entity, retained 12 months.' },
    { name: 'Webhook verification', coverage: 'Inbound webhooks are verified via signature on the raw request body.' },
  ],

  compliance: [
    { name: 'SOC 2 Type II', status: 'In progress', scope: 'OTP application — targeting Q4 2026.' },
    { name: 'GDPR', status: 'Supported', scope: 'Customer data hosted in the EU (Amsterdam). DPA available on request.' },
    { name: 'Infrastructure (Railway)', status: 'SOC 2 Type II · HIPAA', scope: 'Hosting and managed database. Reports available from Railway on request.' },
    { name: 'Penetration testing', status: 'Planned', scope: 'Infrastructure provider (Railway) is penetration tested; OTP application test planned alongside SOC 2.' },
  ],

  subprocessors: [
    { name: 'Railway', category: 'Cloud hosting & managed PostgreSQL', location: 'US company; data hosted in EU West (Amsterdam)', description: 'Runs the OTP application and primary database. SOC 2 Type II, HIPAA.' },
    { name: 'Clerk', category: 'Authentication', location: 'United States', description: 'User authentication and session management. OTP stores no passwords.' },
    { name: 'Cloudflare R2', category: 'File / object storage', location: 'Global edge', description: 'Stores uploaded files and assets.' },
    { name: 'Resend', category: 'Transactional & newsletter email', location: 'United States', description: 'Delivers account, notification, and newsletter email.' },
    { name: 'Stripe', category: 'Billing & payments', location: 'United States', description: 'Processes subscription billing. Card data is handled by Stripe, not OTP.' },
    { name: 'Svix', category: 'Webhook delivery', location: 'United States', description: 'Webhook relay and signature verification.' },
    { name: 'Anthropic', category: 'AI processing', location: 'United States', description: 'Powers Ask AI and Rock AI. Receives only the content needed for a given request. Does not train on data submitted via its paid API.' },
    { name: 'Google Ads', category: 'Marketing conversion tracking', location: 'United States', description: 'Conversion measurement on public marketing pages only. Does not touch customer operational data inside the app.' },
  ],

  monitoring: {
    responseCommitment:
      'On confirming a security incident affecting customer data, we contain it and notify affected organizations within 3 hours, followed by a written post-incident summary.',
    incidentHistory: 'No reportable security incidents to date.',
  },

  faqs: [
    {
      question: 'If I publish to OTP, who can see my data?',
      answer:
        'By default, nothing. Your operating data stays private to your organization. Only items you explicitly publish (learnings, selected best practices, or a profile or KPIs you mark public) appear on the network.',
    },
    {
      question: 'Is my operational data (priorities, KPIs, meetings) ever shared?',
      answer: 'No. Those are private to your organization and never appear on any cross-org surface.',
    },
    {
      question: 'Can I keep my whole organization off the network?',
      answer: 'Yes. A private organization is hard-excluded from every cross-org surface through a single enforced control.',
    },
    {
      question: 'Where is my data stored?',
      answer: "In the EU, in Railway's Amsterdam region, encrypted at rest, with daily encrypted backups retained 30 days.",
    },
    {
      question: 'Do you use my data to train AI models?',
      answer:
        "No. AI features send only the content needed for that request to Anthropic's Claude API to generate your response, and Anthropic does not train on data submitted through its paid API.",
    },
    {
      question: 'Can I delete or export my data?',
      answer:
        'Yes. On a verified deletion request, personal data is permanently removed within 7 days. You can request a copy of your data, and a self-serve export is on the roadmap.',
    },
    {
      question: 'Are you SOC 2 or GDPR compliant?',
      answer:
        'We are pre-SOC 2 and targeting SOC 2 Type II within six months; our infrastructure already runs on SOC 2 Type II, HIPAA-compliant Railway. For GDPR, customer data is hosted in the EU and a DPA is available on request.',
    },
  ],

  contacts: {
    email: 'security@orgtp.com',
    sla: 'We respond to security inquiries within 1 business day.',
  },

  documents: [
    { name: 'Data Processing Agreement (DPA)', description: 'Our standard DPA for customers processing personal data through OTP.', access: 'request' },
  ],
};

export default trust;
