import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  bigserial,
  real,
  boolean,
  timestamp,
  date,
  jsonb,
  pgEnum,
  uniqueIndex,
  index,
  customType,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// ---- Enums ----

export const orgSizeEnum = pgEnum('org_size', ['solo', 'small', 'medium', 'large', 'enterprise']);
export const templateEnum = pgEnum('template_type', ['agent_army', 'value_chain', 'org_chart']);
export const oosStatusEnum = pgEnum('oos_status', ['draft', 'published', 'archived']);
export const visibilityEnum = pgEnum('visibility', ['free', 'paid', 'premium']);
export const badgeEnum = pgEnum('badge_type', ['founding', 'early']);
export const qualityTierEnum = pgEnum('quality_tier', ['platinum', 'gold', 'silver', 'bronze']);
export const confidenceEnum = pgEnum('confidence_level', ['HIGH', 'MEDIUM', 'LOW']);
export const evidenceEnum = pgEnum('evidence_type', [
  'HUMAN_DEFINED_RULE',
  'OBSERVED_ONCE',
  'OBSERVED_REPEATEDLY',
  'MEASURED_RESULT',
  'INFERENCE',
  'SPECULATION',
]);
export const similarityClassEnum = pgEnum('similarity_class', ['SIMILAR', 'DUPLICATE']);
export const actorTypeEnum = pgEnum('actor_type', ['user', 'system', 'agent']);

// ---- Tables ----

export const ticketStatusEnum = pgEnum('ticket_status', ['open', 'in_progress', 'resolved', 'closed']);
export const ticketPriorityEnum = pgEnum('ticket_priority', ['low', 'medium', 'high', 'critical']);
export const ticketCategoryEnum = pgEnum('ticket_category', ['bug', 'feature', 'question', 'other']);
// IDS lifecycle (EOS) and ownerEntityType are declared here so the tickets table can reference them.
// The full L8 schema (rocks, todos, meetings) lives at the bottom of this file.
export const idsStatusEnum = pgEnum('ids_status', ['open', 'identified', 'discussed', 'solved']);
export const ownerEntityTypeEnum = pgEnum('owner_entity_type', ['agent', 'human']);
export const todoKindEnum = pgEnum('todo_kind', ['personal', 'l10']);
export const todoPriorityEnum = pgEnum('todo_priority', ['p1', 'p2', 'p3', 'p4']);

export const organizations = pgTable('organizations', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  pseudonym: varchar('pseudonym', { length: 255 }),
  industry: varchar('industry', { length: 255 }).notNull(),
  size: orgSizeEnum('size').notNull(),
  clerkOrgId: varchar('clerk_org_id', { length: 255 }).notNull().unique(),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  badge: badgeEnum('badge'),
  qualityTier: qualityTierEnum('quality_tier'),
  // Plan tier gating (BYOK + enterprise). Values: 'standard' | 'enterprise'.
  // Column added by ensure-ai-keys.ts on boot (Drizzle migrate is broken).
  planTier: varchar('plan_tier', { length: 20 }).default('standard').notNull(),
  agenticLevel: integer('agentic_level'),
  slug: text('slug').unique(),
  // Portfolio support: an org can be a normal org ('standard') or a portfolio
  // ('portfolio') composed of member orgs (see portfolio_members). Column added
  // by ensure-portfolio.ts on boot (Drizzle migrate is broken).
  kind: varchar('kind', { length: 20 }).default('standard').notNull(),
  public: boolean('public').default(false).notNull(),
  // Private-plan enforcement (2026-06-11): hard, additive cross-org exclusion.
  // When true, this org's data NEVER appears in any cross-org read surface
  // (browse, search, /org/:id, graph, intelligence, recommendations, public
  // best-practices, MCP). Distinct from `public`: `public` is opt-IN to public
  // listing; `is_private` is opt-OUT of the entire network. Authed members of
  // the org still see their own data. Enforcement chokepoint + the full call-
  // site registry live in src/shared/org-visibility.ts -- AND excludePrivateOrgs()
  // into every cross-org query. Default false => no change for existing orgs.
  isPrivate: boolean('is_private').default(false).notNull(),
  description: text('description'),
  website: text('website'),
  chart: jsonb('chart'),
  // Owner-controlled sidebar customization (Labs: sidebar_customize). Shape:
  // { order: string[] (hrefs in desired order), hidden: string[] (hrefs to hide) }.
  sidebarConfig: jsonb('sidebar_config'),
  // Portfolio-level preset defaults that member orgs inherit. Shape roughly:
  // { sidebar?: any, settings?: any, locked?: string[] }. Added by
  // ensure-portfolio.ts on boot (Drizzle migrate is broken).
  portfolioPresets: jsonb('portfolio_presets'),
  // Organization logo, stored as a `data:image/...;base64,...` string (capped
  // ~150KB). Renders in the left-sidebar header in place of the org name.
  // Column added by ensure-org-logo.ts on boot (Drizzle migrate is broken).
  logoUrl: text('logo_url'),
  // Two-phase hard delete. deletionRequestedAt = when a delete was initiated;
  // null = active. While set, the org is hidden/blocked everywhere (see
  // getAuthOrg). It is restorable for 7 days; after that the purge job
  // (services/org-purge.ts) permanently deletes the org and ALL its data.
  // Columns added by ensure-org-deletion.ts on boot (Drizzle migrate is broken).
  deletionRequestedAt: timestamp('deletion_requested_at'),
  deletionRequestedBy: varchar('deletion_requested_by', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  clerkIdx: uniqueIndex('org_clerk_idx').on(table.clerkOrgId),
  // Hot path: every cross-org query ANDs `is_private = false`. Index it.
  isPrivateIdx: index('org_is_private_idx').on(table.isPrivate),
}));

// Phase C: multi-chart support. One org can hold N charts; each chart is
// backed by its own oos_file lineage. Backfill (in ensure-charts.ts) gives
// every legacy org a "Main" chart marked is_primary=true.
export const charts = pgTable('charts', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  isPrimary: boolean('is_primary').notNull().default(false),
  createdByClerkUserId: varchar('created_by_clerk_user_id', { length: 255 }),
  shareToken: varchar('share_token', { length: 64 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  orgIdx: index('charts_org_idx').on(table.orgId),
  // Note: the (org_id) WHERE is_primary partial unique index and the
  // share_token partial unique index are created by ensure-charts.ts since
  // Drizzle's uniqueIndex doesn't support WHERE clauses.
}));

export const oosFiles = pgTable('oos_files', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id).notNull(),
  chartId: uuid('chart_id').references(() => charts.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }),
  template: templateEnum('template').notNull(),
  version: integer('version').notNull().default(1),
  status: oosStatusEnum('status').notNull().default('draft'),
  visibilityDefault: visibilityEnum('visibility_default').notNull().default('free'),
  wordCount: integer('word_count').notNull(),
  claimCount: integer('claim_count').notNull().default(0),
  rawContent: text('raw_content').notNull(),
  frontmatter: jsonb('frontmatter').notNull(),
  confidenceDistribution: jsonb('confidence_distribution'),
  evidenceDistribution: jsonb('evidence_distribution'),
  sourceDocumentId: uuid('source_document_id'),
  workspaceId: uuid('workspace_id'),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  orgVersionIdx: uniqueIndex('oos_org_version_idx').on(table.orgId, table.version),
  statusIdx: index('oos_status_idx').on(table.status),
  chartIdx: index('oos_files_chart_idx').on(table.chartId),
}));

export const claims = pgTable('claims', {
  id: uuid('id').defaultRandom().primaryKey(),
  oosFileId: uuid('oos_file_id').references(() => oosFiles.id, { onDelete: 'cascade' }).notNull(),
  claimId: varchar('claim_id', { length: 10 }).notNull(),
  section: varchar('section', { length: 100 }).notNull(),
  displayOrder: integer('display_order').notNull(),
  rule: text('rule').notNull(),
  why: text('why').notNull(),
  failureMode: text('failure_mode').notNull(),
  confidence: confidenceEnum('confidence').notNull(),
  evidence: evidenceEnum('evidence').notNull(),
  scope: text('scope').notNull(),
  visibilityOverride: visibilityEnum('visibility_override'),
  isCanonical: boolean('is_canonical').default(false),
  source: varchar('source', { length: 50 }).default('oos_publish'),
  sourceUrl: text('source_url'),
  agentName: varchar('agent_name', { length: 100 }),
  public: boolean('public').default(false).notNull(),
  roles: text('roles').array().default(sql`'{}'::text[]`).notNull(),
  // search_vector is managed by a database trigger, not Drizzle
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  oosClaimIdx: uniqueIndex('claim_oos_claim_idx').on(table.oosFileId, table.claimId),
  oosOrderIdx: index('claim_oos_order_idx').on(table.oosFileId, table.displayOrder),
  confidenceIdx: index('claim_confidence_idx').on(table.confidence),
  evidenceIdx: index('claim_evidence_idx').on(table.evidence),
}));

export const claimSimilarities = pgTable('claim_similarities', {
  id: uuid('id').defaultRandom().primaryKey(),
  claimAId: uuid('claim_a_id').references(() => claims.id, { onDelete: 'cascade' }).notNull(),
  claimBId: uuid('claim_b_id').references(() => claims.id, { onDelete: 'cascade' }).notNull(),
  oosAId: uuid('oos_a_id').references(() => oosFiles.id, { onDelete: 'cascade' }).notNull(),
  oosBId: uuid('oos_b_id').references(() => oosFiles.id, { onDelete: 'cascade' }).notNull(),
  similarityScore: real('similarity_score').notNull(),
  classification: similarityClassEnum('classification').notNull(),
  sectionMatch: boolean('section_match').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  oosPairIdx: index('sim_oos_pair_idx').on(table.oosAId, table.oosBId),
  scoreIdx: index('sim_score_idx').on(table.similarityScore),
}));

export const apiKeys = pgTable('api_keys', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull().default('Default'),
  // 'api'  = a manually-minted REST/MCP key (Authorization: Bearer otp_...)
  // 'mcp'  = a token minted for a Remote MCP connection (lives in the URL path)
  kind: varchar('kind', { length: 16 }).notNull().default('api'),
  keyPrefix: varchar('key_prefix', { length: 8 }).notNull(),
  keyHash: varchar('key_hash', { length: 64 }).notNull(),
  scopes: text('scopes').array().notNull(),
  lastUsedAt: timestamp('last_used_at'),
  useCount: integer('use_count').notNull().default(0),
  expiresAt: timestamp('expires_at'),
  revokedAt: timestamp('revoked_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  hashIdx: index('idx_api_keys_hash').on(table.keyHash),
  orgIdx: index('idx_api_keys_org').on(table.orgId),
}));

// OAuth 2.1 Dynamic Client Registration records (RFC 7591). Remote MCP clients
// (Claude, Cursor, ...) self-register here before the authorization-code flow.
// Public clients: PKCE only, no client secret.
export const oauthClients = pgTable('oauth_clients', {
  id: uuid('id').defaultRandom().primaryKey(),
  clientId: varchar('client_id', { length: 64 }).notNull().unique(),
  clientName: varchar('client_name', { length: 255 }),
  redirectUris: text('redirect_uris').array().notNull(),
  grantTypes: text('grant_types').array().notNull().default(['authorization_code']),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  clientIdx: index('idx_oauth_clients_client_id').on(table.clientId),
}));

// Short-lived single-use authorization codes (the auth-code + PKCE flow). The
// code itself is stored hashed; rows expire in minutes and are consumed once at
// /oauth/token. The long-lived access token issued in exchange is an api_keys
// row (kind='mcp') -- no separate token table (long-lived, no refresh).
export const oauthCodes = pgTable('oauth_codes', {
  id: uuid('id').defaultRandom().primaryKey(),
  codeHash: varchar('code_hash', { length: 64 }).notNull(),
  clientId: varchar('client_id', { length: 64 }).notNull(),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  redirectUri: text('redirect_uri').notNull(),
  scopes: text('scopes').array().notNull(),
  codeChallenge: varchar('code_challenge', { length: 255 }).notNull(),
  codeChallengeMethod: varchar('code_challenge_method', { length: 16 }).notNull().default('S256'),
  expiresAt: timestamp('expires_at').notNull(),
  usedAt: timestamp('used_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  codeIdx: index('idx_oauth_codes_code_hash').on(table.codeHash),
}));

// BYOK (bring-your-own-key) AI provider keys, one active per org. encryptedKey
// holds packed ciphertext (never the plaintext); keyLast4 is the masked display
// suffix. The partial unique index enforces a single active key per org. DDL
// self-heals on boot via ensure-ai-keys.ts (Drizzle migrate is broken).
export const orgAiKeys = pgTable('org_ai_keys', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  provider: varchar('provider', { length: 20 }).notNull(), // 'anthropic' | 'openai'
  encryptedKey: text('encrypted_key').notNull(),
  keyLast4: varchar('key_last4', { length: 8 }),
  status: varchar('status', { length: 20 }).notNull().default('active'), // 'active' | 'revoked'
  lastRotatedAt: timestamp('last_rotated_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  // One active key per org (partial unique). Drizzle uniqueIndex supports .where().
  oneActiveIdx: uniqueIndex('org_ai_keys_one_active_idx').on(table.orgId).where(sql`status = 'active'`),
  orgIdx: index('org_ai_keys_org_idx').on(table.orgId),
}));

// Scaffolding for per-agent Stripe billing (humans free; $12/agent/mo, $16 if
// the org has API keys). Populated by a future Stripe webhook; unused until
// BILLING_ENABLED. See ensure-subscriptions.ts.
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
  status: varchar('status', { length: 40 }).notNull().default('none'),
  planKind: varchar('plan_kind', { length: 40 }).notNull().default('unknown'),
  planRate: integer('plan_rate'),
  agentQuantity: integer('agent_quantity'),
  currentPeriodEnd: timestamp('current_period_end'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  orgIdx: uniqueIndex('subscriptions_org_idx').on(table.orgId),
  stripeSubIdx: index('subscriptions_stripe_sub_idx').on(table.stripeSubscriptionId),
}));

export const tickets = pgTable('tickets', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id),
  // Team scoping: which L10/forum this issue belongs to. Leadership team
  // L10 only sees its own issues, separating private work (e.g. a
  // "David x Dan" team) from full-team agenda items.
  teamId: uuid('team_id'),
  title: varchar('title', { length: 500 }).notNull(),
  description: text('description').notNull(),
  status: ticketStatusEnum('status').notNull().default('open'),
  priority: ticketPriorityEnum('priority').notNull().default('medium'),
  category: ticketCategoryEnum('category').notNull().default('bug'),
  reporterEmail: varchar('reporter_email', { length: 255 }),
  resolution: text('resolution'),
  agentNotes: text('agent_notes'),
  // IDS workflow (EOS Identify-Discuss-Solve) -- separate lifecycle from triage status
  idsStatus: idsStatusEnum('ids_status').notNull().default('open'),
  priorityRank: integer('priority_rank'),
  solvedInMeetingId: uuid('solved_in_meeting_id'),
  // L8 ownership for the issue (separate from reporter)
  ownerEntityType: ownerEntityTypeEnum('owner_entity_type'),
  ownerExternalId: varchar('owner_external_id', { length: 120 }),
  ownerName: varchar('owner_name', { length: 255 }),
  // GTD Next Action: one concrete physical step. Surfaced on /dashboard
  // hero; the bare title isn't always actionable. Added via
  // ensure-next-actions.ts boot DDL.
  nextAction: text('next_action'),
  nextActionSetAt: timestamp('next_action_set_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
}, (table) => ({
  statusIdx: index('ticket_status_idx').on(table.status),
  orgIdx: index('ticket_org_idx').on(table.orgId),
  teamIdx: index('tickets_team_idx').on(table.orgId, table.teamId),
  idsStatusIdx: index('ticket_ids_status_idx').on(table.orgId, table.idsStatus),
}));

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id),
  actorType: actorTypeEnum('actor_type').notNull(),
  action: varchar('action', { length: 100 }).notNull(),
  entityType: varchar('entity_type', { length: 50 }).notNull(),
  entityId: uuid('entity_id'),
  details: jsonb('details'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  orgTimeIdx: index('audit_org_time_idx').on(table.orgId, table.createdAt),
}));

// ---- Consultant Ecosystem Enums ----

export const workspaceRoleEnum = pgEnum('workspace_role', ['owner', 'consultant', 'client']);
export const sourceDocStatusEnum = pgEnum('source_doc_status', ['processing', 'processed', 'completed', 'failed']);
export const inquiryStatusEnum = pgEnum('inquiry_status', ['new', 'read', 'replied', 'closed']);

// ---- Consultant Ecosystem Tables ----

export const consultantProfiles = pgTable('consultant_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  displayName: varchar('display_name', { length: 255 }).notNull(),
  headline: varchar('headline', { length: 255 }),
  photoUrl: text('photo_url'),
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  expertiseTags: text('expertise_tags').array(),
  contactEmail: varchar('contact_email', { length: 255 }),
  website: text('website'),
  websiteUrl: text('website_url'),
  linkedinUrl: text('linkedin_url'),
  published: boolean('published').notNull().default(false),
  isPublished: boolean('is_published').notNull().default(false),
  profileType: varchar('profile_type', { length: 20 }).notNull().default('consultant'),
  contentSourceUrl: text('content_source_url'),
  contentCount: integer('content_count').notNull().default(0),
  publisherDescription: text('publisher_description'),
  lastSyncedAt: timestamp('last_synced_at'),
  // Coach Directory (Layer 2) -- seeded by ensure-coach-directory.ts
  claimed: boolean('claimed').notNull().default(false),
  directorySource: varchar('directory_source', { length: 80 }),
  directorySourceId: varchar('directory_source_id', { length: 120 }),
  phone: varchar('phone', { length: 60 }),
  tier: varchar('tier', { length: 60 }),
  geoCity: varchar('geo_city', { length: 120 }),
  geoState: varchar('geo_state', { length: 120 }),
  geoCountry: varchar('geo_country', { length: 120 }),
  // Coach-client ecosystem (Phase 2) -- ensure-coach-clients.ts
  inviteToken: varchar('invite_token', { length: 64 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  orgIdx: index('cp_org_idx').on(table.orgId),
  slugIdx: uniqueIndex('cp_slug_idx').on(table.slug),
  publishedIdx: index('cp_published_idx').on(table.published),
  claimedIdx: index('cp_claimed_idx').on(table.claimed),
  directorySourceIdx: index('cp_directory_source_idx').on(table.directorySource),
  geoCityIdx: index('cp_geo_city_idx').on(table.geoCity),
  geoCountryIdx: index('cp_geo_country_idx').on(table.geoCountry),
}));

export const workspaces = pgTable('workspaces', {
  id: uuid('id').defaultRandom().primaryKey(),
  consultantOrgId: uuid('consultant_org_id').references(() => organizations.id).notNull(),
  ownerId: uuid('owner_id').references(() => organizations.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  consultantOrgIdx: index('ws_consultant_org_idx').on(table.consultantOrgId),
  ownerIdx: index('ws_owner_idx').on(table.ownerId),
  slugIdx: uniqueIndex('ws_slug_idx').on(table.slug),
}));

export const workspaceMembers = pgTable('workspace_members', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }).notNull(),
  orgId: uuid('org_id').references(() => organizations.id),
  email: varchar('email', { length: 255 }).notNull(),
  role: workspaceRoleEnum('role').notNull(),
  invitedAt: timestamp('invited_at').defaultNow().notNull(),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
  acceptedAt: timestamp('accepted_at'),
}, (table) => ({
  workspaceIdx: index('wm_workspace_idx').on(table.workspaceId),
  orgIdx: index('wm_org_idx').on(table.orgId),
  emailIdx: index('wm_email_idx').on(table.email),
}));

export const sourceDocuments = pgTable('source_documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id).notNull(),
  title: varchar('title', { length: 500 }).notNull(),
  originalFilename: varchar('original_filename', { length: 500 }),
  storageKey: varchar('storage_key', { length: 1000 }),
  rawText: text('raw_text'),
  rawContent: text('raw_content'),
  wordCount: integer('word_count').notNull().default(0),
  status: sourceDocStatusEnum('status').notNull().default('processing'),
  sectionCount: integer('section_count').notNull().default(0),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  orgIdx: index('sd_org_idx').on(table.orgId),
  statusIdx: index('sd_status_idx').on(table.status),
}));

// ---- Best Practices & Publisher Ecosystem ----

export const bestPractices = pgTable('best_practices', {
  id: uuid('id').defaultRandom().primaryKey(),
  publisherProfileId: uuid('publisher_profile_id').references(() => consultantProfiles.id, { onDelete: 'cascade' }),
  slug: varchar('slug', { length: 255 }).notNull(),
  term: varchar('term', { length: 500 }).notNull(),
  definition: text('definition').notNull(),
  category: varchar('category', { length: 255 }).notNull().default('General'),
  industry: varchar('industry', { length: 100 }),
  isOriginal: boolean('is_original').default(false),
  relatedTerms: text('related_terms').array(),
  sourceUrl: text('source_url').notNull(),
  canonicalUrl: text('canonical_url'),
  isCoordination: boolean('is_coordination'),
  public: boolean('public').default(false).notNull(),
  lastUpdatedAt: timestamp('last_updated_at'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  publisherIdx: index('bp_publisher_idx').on(table.publisherProfileId),
  categoryIdx: index('bp_category_idx').on(table.category),
  industryIdx: index('bp_industry_idx').on(table.industry),
  termIdx: index('bp_term_idx').on(table.term),
  isCoordinationIdx: index('bp_is_coordination_idx').on(table.isCoordination),
}));

export const oosBestPracticeMatches = pgTable('oos_best_practice_matches', {
  id: uuid('id').defaultRandom().primaryKey(),
  oosFileId: uuid('oos_file_id').references(() => oosFiles.id, { onDelete: 'cascade' }).notNull(),
  bestPracticeId: uuid('best_practice_id').references(() => bestPractices.id, { onDelete: 'cascade' }).notNull(),
  relevanceScore: real('relevance_score').notNull().default(0),
  matchedClaims: text('matched_claims').array(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  oosIdx: index('obpm_oos_idx').on(table.oosFileId),
  bpIdx: index('obpm_bp_idx').on(table.bestPracticeId),
  scoreIdx: index('obpm_score_idx').on(table.relevanceScore),
}));

export const inquiries = pgTable('inquiries', {
  id: uuid('id').defaultRandom().primaryKey(),
  consultantProfileId: uuid('consultant_profile_id').references(() => consultantProfiles.id, { onDelete: 'cascade' }).notNull(),
  orgId: uuid('org_id').references(() => organizations.id),
  senderName: varchar('sender_name', { length: 255 }).notNull(),
  senderEmail: varchar('sender_email', { length: 255 }).notNull(),
  senderOrg: varchar('sender_org', { length: 255 }),
  senderCompany: varchar('sender_company', { length: 255 }),
  subject: varchar('subject', { length: 500 }),
  message: text('message').notNull(),
  notes: text('notes'),
  status: inquiryStatusEnum('status').notNull().default('new'),
  readAt: timestamp('read_at'),
  repliedAt: timestamp('replied_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  profileIdx: index('inq_profile_idx').on(table.consultantProfileId),
  orgIdx: index('inq_org_idx').on(table.orgId),
  statusIdx: index('inq_status_idx').on(table.status),
}));

// ---- Newsletter & Engagement ----

export const newsletterSubscribers = pgTable('newsletter_subscribers', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 200 }),
  notes: text('notes'),
  source: varchar('source', { length: 50 }).notNull().default('homepage'),
  doubleOptInConfirmed: boolean('double_opt_in_confirmed').notNull().default(false),
  confirmToken: varchar('confirm_token', { length: 64 }),
  tokenExpiresAt: timestamp('token_expires_at'),
  subscribedAt: timestamp('subscribed_at').defaultNow().notNull(),
  unsubscribedAt: timestamp('unsubscribed_at'),
  convertedAt: timestamp('converted_at'),
  convertedClerkUserId: varchar('converted_clerk_user_id', { length: 255 }),
  resendContactId: varchar('resend_contact_id', { length: 64 }),
}, (table) => ({
  emailIdx: uniqueIndex('ns_email_idx').on(table.email),
  confirmedIdx: index('ns_confirmed_idx').on(table.doubleOptInConfirmed),
  convertedIdx: index('ns_converted_idx').on(table.convertedAt),
  sourceIdx: index('ns_source_idx').on(table.source),
}));

// ---- Partner Program ----

export const partnerTierEnum = pgEnum('partner_tier', [
  'founding_partner',
  'certified_integrator',
  'master_integrator',
]);

export const partnerStatusEnum = pgEnum('partner_status', [
  'pending',
  'reviewing',
  'approved',
  'declined',
  'onboarded',
]);

// ---- Improvements / Roadmap Tracker ----

export const improvementStatusEnum = pgEnum('improvement_status', [
  'idea',
  'in_progress',
  'completed',
  'wont_do',
]);

export const improvementPriorityEnum = pgEnum('improvement_priority', [
  'low',
  'medium',
  'high',
]);

export const improvements = pgTable('improvements', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  notes: text('notes'),
  status: improvementStatusEnum('status').notNull().default('idea'),
  priority: improvementPriorityEnum('priority').notNull().default('medium'),
  source: varchar('source', { length: 120 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
}, (table) => ({
  statusIdx: index('imp_status_idx').on(table.status),
  priorityIdx: index('imp_priority_idx').on(table.priority),
  createdIdx: index('imp_created_idx').on(table.createdAt),
}));

export const partnerSignups = pgTable('partner_signups', {
  id: uuid('id').defaultRandom().primaryKey(),
  // Optional at the DB layer — the full /partners application validates these
  // as required at the app layer (zod schema in /api/v1/partner-signup).
  // Cross-product lightweight signups (orger.ai waitlist, future products)
  // only need email + source. ALTER COLUMN ... DROP NOT NULL applied in
  // ensure-partner-signups.ts.
  companyName: varchar('company_name', { length: 255 }),
  fullName: varchar('full_name', { length: 200 }),
  email: varchar('email', { length: 255 }).notNull(),
  title: varchar('title', { length: 255 }),
  linkedinUrl: varchar('linkedin_url', { length: 500 }),
  // List of channels/certifications self-claimed at signup. Stored as JSON
  // array of slugs. Optional for cross-product signups; defaults to [].
  channels: jsonb('channels').default([]),
  otherChannel: varchar('other_channel', { length: 500 }),
  clientCountRange: varchar('client_count_range', { length: 50 }),
  fitNote: text('fit_note'),
  source: varchar('source', { length: 50 }).notNull().default('partners-page'),
  status: partnerStatusEnum('status').notNull().default('pending'),
  // Tier is unassigned at signup; set by admin after review.
  tier: partnerTierEnum('tier'),
  reviewedAt: timestamp('reviewed_at'),
  approvedAt: timestamp('approved_at'),
  declinedAt: timestamp('declined_at'),
  onboardedAt: timestamp('onboarded_at'),
  adminNotes: text('admin_notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  emailCompanyIdx: uniqueIndex('ps_email_company_idx').on(table.email, table.companyName),
  emailIdx: index('ps_email_idx').on(table.email),
  statusIdx: index('ps_status_idx').on(table.status),
  tierIdx: index('ps_tier_idx').on(table.tier),
  createdIdx: index('ps_created_idx').on(table.createdAt),
  sourceIdx: index('ps_source_idx').on(table.source),
}));

// ---- Marketplace (Partner Channel) ----
// Framework for partners to list sellable agents, integrations, and content
// packs that OTP orgs install. Lives ON TOP of the existing partner program
// (partner_signups = recruitment/approval) and managerAgents (an org's own
// runtime agents). A LISTING is a product; an INSTALL is one org adopting it;
// a PARTNER record holds the Stripe Connect account the seller is paid through.
// The whole surface is gated OFF behind MARKETPLACE_LIVE until there are users
// and Connect onboarding is wired (see shared/marketplace-gate.ts).
// DDL self-heals on boot via ensure-marketplace.ts.

export const marketplaceListingTypeEnum = pgEnum('marketplace_listing_type', [
  'agent',
  'integration',
  'content_pack',
]);

export const marketplaceListingStatusEnum = pgEnum('marketplace_listing_status', [
  'draft',
  'submitted',
  'approved',
  'published',
  'rejected',
  'suspended',
]);

export const marketplacePricingModelEnum = pgEnum('marketplace_pricing_model', [
  'free',
  'subscription',
]);

export const marketplaceConnectStatusEnum = pgEnum('marketplace_connect_status', [
  'not_started',
  'onboarding',
  'active',
  'restricted',
]);

// A partner's payout identity. One per selling org. Holds the Stripe Connect
// account the partner is paid through. Created when a partner starts listing;
// payouts stay dormant until connect_status = 'active' AND billing is live.
export const marketplacePartners = pgTable('marketplace_partners', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  displayName: varchar('display_name', { length: 255 }),
  supportEmail: varchar('support_email', { length: 255 }),
  websiteUrl: text('website_url'),
  stripeConnectAccountId: varchar('stripe_connect_account_id', { length: 255 }),
  connectStatus: marketplaceConnectStatusEnum('connect_status').notNull().default('not_started'),
  payoutsEnabled: boolean('payouts_enabled').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  orgIdx: uniqueIndex('mkp_partner_org_idx').on(table.orgId),
  connectIdx: index('mkp_partner_connect_idx').on(table.stripeConnectAccountId),
}));

// A sellable product in the catalog. type-specific payload columns are nullable
// and only one is meaningful per listing_type:
//   agent        -> agent_template_md (CLAUDE.md-style def cloned into managerAgents on install)
//   integration  -> mcp_endpoint_url (the partner's MCP server the org connects to)
//   content_pack -> content_payload (OOS / best-practice / template references)
export const marketplaceListings = pgTable('marketplace_listings', {
  id: uuid('id').defaultRandom().primaryKey(),
  partnerOrgId: uuid('partner_org_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  tagline: varchar('tagline', { length: 255 }),
  description: text('description'),
  listingType: marketplaceListingTypeEnum('listing_type').notNull(),
  status: marketplaceListingStatusEnum('status').notNull().default('draft'),
  iconUrl: text('icon_url'),
  expertiseTags: text('expertise_tags').array(),
  // Pricing. Subscription is the default model; per-listing Stripe ids are
  // minted at publish time on the partner's Connect account.
  pricingModel: marketplacePricingModelEnum('pricing_model').notNull().default('subscription'),
  priceMonthlyCents: integer('price_monthly_cents'),
  priceYearlyCents: integer('price_yearly_cents'),
  currency: varchar('currency', { length: 3 }).notNull().default('usd'),
  stripeProductId: varchar('stripe_product_id', { length: 255 }),
  stripePriceMonthlyId: varchar('stripe_price_monthly_id', { length: 255 }),
  stripePriceYearlyId: varchar('stripe_price_yearly_id', { length: 255 }),
  // Type-specific payloads (see comment above).
  agentTemplateMd: text('agent_template_md'),
  mcpEndpointUrl: text('mcp_endpoint_url'),
  contentPayload: jsonb('content_payload'),
  frontmatter: jsonb('frontmatter').notNull().default({}),
  installCount: integer('install_count').notNull().default(0),
  adminNotes: text('admin_notes'),
  submittedAt: timestamp('submitted_at'),
  approvedAt: timestamp('approved_at'),
  rejectedAt: timestamp('rejected_at'),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
}, (table) => ({
  partnerIdx: index('mkl_partner_idx').on(table.partnerOrgId),
  statusIdx: index('mkl_status_idx').on(table.status),
  typeIdx: index('mkl_type_idx').on(table.listingType),
  // Fast public catalog query: published listings only.
  publishedIdx: index('mkl_published_idx').on(table.status, table.publishedAt),
}));

// One org adopting one listing. The subscription that pays the partner lives on
// stripe_subscription_id; for agent listings, provisioned_agent_id points at the
// managerAgents row cloned into the installing org.
export const marketplaceInstalls = pgTable('marketplace_installs', {
  id: uuid('id').defaultRandom().primaryKey(),
  listingId: uuid('listing_id').references(() => marketplaceListings.id, { onDelete: 'cascade' }).notNull(),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  installedByUserId: varchar('installed_by_user_id', { length: 255 }),
  status: varchar('status', { length: 20 }).notNull().default('active'), // active | cancelled | suspended
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
  provisionedAgentId: uuid('provisioned_agent_id').references(() => managerAgents.id, { onDelete: 'set null' }),
  installedAt: timestamp('installed_at').defaultNow().notNull(),
  cancelledAt: timestamp('cancelled_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  listingOrgIdx: uniqueIndex('mki_listing_org_idx').on(table.listingId, table.orgId),
  orgIdx: index('mki_org_idx').on(table.orgId),
  listingIdx: index('mki_listing_idx').on(table.listingId),
}));

// ---- OTP Labs (per-org early access) ----
// One row per (org, feature) the org has opted into early. The catalog of
// features lives in code (shared/lab-features.ts); this table only records
// which orgs flipped which beta feature on. Resolution: a beta feature is ON
// for an org iff a row here has enabled = true.
export const orgLabOptins = pgTable('org_lab_optins', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  featureKey: varchar('feature_key', { length: 80 }).notNull(),
  enabled: boolean('enabled').notNull().default(true),
  optedInBy: varchar('opted_in_by', { length: 255 }),
  optedInAt: timestamp('opted_in_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  orgFeatureIdx: uniqueIndex('olo_org_feature_idx').on(table.orgId, table.featureKey),
  orgIdx: index('olo_org_idx').on(table.orgId),
}));

export const practiceVotes = pgTable('practice_votes', {
  id: uuid('id').defaultRandom().primaryKey(),
  bestPracticeId: uuid('best_practice_id').references(() => bestPractices.id, { onDelete: 'cascade' }).notNull(),
  voterIp: varchar('voter_ip', { length: 45 }).notNull(),
  vote: integer('vote').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  practiceIdx: index('pv_practice_idx').on(table.bestPracticeId),
  uniqueVoteIdx: uniqueIndex('pv_unique_vote_idx').on(table.bestPracticeId, table.voterIp),
}));

export const onboardingSequence = pgTable('onboarding_sequence', {
  id: uuid('id').defaultRandom().primaryKey(),
  clerkUserId: varchar('clerk_user_id', { length: 255 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull(),
  signupAt: timestamp('signup_at').defaultNow().notNull(),
  email1SentAt: timestamp('email_1_sent_at'),
  email2SentAt: timestamp('email_2_sent_at'),
  email3SentAt: timestamp('email_3_sent_at'),
  unsubscribedAt: timestamp('unsubscribed_at'),
  // Sales work-queue fields. Surfaced at /admin/signups so Dawson can work
  // each new signup like an inbox. salesStatus moves new -> contacted ->
  // booked (or lost). Added 2026-06-16.
  salesStatus: varchar('sales_status', { length: 20 }).default('new').notNull(),
  salesStatusAt: timestamp('sales_status_at'),
  salesNotes: text('sales_notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  clerkUserIdx: uniqueIndex('onb_clerk_user_idx').on(table.clerkUserId),
  emailIdx: index('onb_email_idx').on(table.email),
  signupIdx: index('onb_signup_idx').on(table.signupAt),
  salesStatusIdx: index('onb_sales_status_idx').on(table.salesStatus),
}));

// ---- 90-day lifecycle email series (rungs 1-30) ----
// One row per (signup, rung) actually sent. Idempotent log: the unique index
// guarantees a rung is never double-sent to the same user. Skipped rungs are
// recorded with skipped=true so the scheduler advances past them. Table is
// self-healed on boot by ensure-lifecycle-sends.ts (Drizzle migrate is broken).
export const lifecycleSends = pgTable('lifecycle_sends', {
  id: uuid('id').defaultRandom().primaryKey(),
  clerkUserId: varchar('clerk_user_id', { length: 255 }).notNull(),
  emailN: integer('email_n').notNull(),
  skipped: boolean('skipped').notNull().default(false),
  sentAt: timestamp('sent_at').defaultNow().notNull(),
}, (table) => ({
  userRungIdx: uniqueIndex('lifecycle_sends_user_rung_idx').on(table.clerkUserId, table.emailN),
  userIdx: index('lifecycle_sends_user_idx').on(table.clerkUserId),
}));

// ---- Org membership (Phase 4.6 multi-user invitations) ----

// Ninety-style roles. 'member' is a deprecated legacy value kept for backward
// compat; new code should use 'managee'. See ensure-org-members.ts for the
// data migration that promotes 'member' → 'managee'.
export const orgMemberRoleEnum = pgEnum('org_member_role', [
  'owner', 'admin', 'manager', 'managee',
  'inactive', 'observer', 'implementer', 'free',
  'visionary', 'integrator',
  'member', // deprecated
]);
export const orgMemberStatusEnum = pgEnum('org_member_status', [
  'active', 'invited', 'suspended', 'inactive', 'revoked',
]);
export const orgInvitationStatusEnum = pgEnum('org_invitation_status', ['pending', 'accepted', 'revoked', 'expired']);

export const orgMembers = pgTable('org_members', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  clerkUserId: varchar('clerk_user_id', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  displayName: varchar('display_name', { length: 255 }),
  role: orgMemberRoleEnum('role').notNull().default('managee'),
  claimedEntityId: varchar('claimed_entity_id', { length: 120 }), // primary tile (back-compat)
  claimedEntityIds: jsonb('claimed_entity_ids').notNull().default([]).$type<string[]>(), // full list of tiles this human holds
  status: orgMemberStatusEnum('status').notNull().default('active'),
  // Phase 1 access toggles (admin sets at invite time, employee sees what they have)
  featureAccess: jsonb('feature_access').notNull().default({}),
  dataAccess: jsonb('data_access').notNull().default({}),
  agentAccess: jsonb('agent_access').notNull().default({}),
  preferences: jsonb('preferences').notNull().default({}),
  invitedByUserId: varchar('invited_by_user_id', { length: 255 }),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  orgUserIdx: uniqueIndex('org_members_org_user_idx').on(table.orgId, table.clerkUserId),
  orgIdx: index('org_members_org_idx').on(table.orgId),
  userIdx: index('org_members_user_idx').on(table.clerkUserId),
  roleIdx: index('org_members_role_idx').on(table.orgId, table.role),
}));

export const orgInvitations = pgTable('org_invitations', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  email: varchar('email', { length: 200 }).notNull(),
  role: orgMemberRoleEnum('role').notNull().default('managee'),
  claimedEntityId: varchar('claimed_entity_id', { length: 120 }), // primary tile (back-compat)
  claimedEntityIds: jsonb('claimed_entity_ids').notNull().default([]).$type<string[]>(),
  displayName: varchar('display_name', { length: 255 }),
  // Phase 2 access toggles: copied into org_members on accept
  featureAccess: jsonb('feature_access').notNull().default({}),
  dataAccess: jsonb('data_access').notNull().default({}),
  agentAccess: jsonb('agent_access').notNull().default({}),
  // Phase 4: which teams to drop this person into when they accept
  teamIds: jsonb('team_ids').notNull().default([]).$type<string[]>(),
  tokenHash: varchar('token_hash', { length: 100 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdByUserId: varchar('created_by_user_id', { length: 255 }).notNull(),
  status: orgInvitationStatusEnum('status').notNull().default('pending'),
  acceptedAt: timestamp('accepted_at'),
  acceptedByUserId: varchar('accepted_by_user_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  tokenIdx: uniqueIndex('org_invitations_token_idx').on(table.tokenHash),
  orgIdx: index('org_invitations_org_idx').on(table.orgId),
  statusIdx: index('org_invitations_status_idx').on(table.status),
  emailIdx: index('org_invitations_email_idx').on(table.email),
}));

// ---- OOS Operating Plan (strategic plan -> structured OOS claims) ----

export const oosPlanStatusEnum = pgEnum('oos_plan_status', ['draft', 'active', 'archived']);
export const oosPlanSectionKeyEnum = pgEnum('oos_plan_section_key', [
  'foundation',
  'market_command',
  'destination',
  'annual_game_plan',
  'ninety_day_engine',
  'performance_scorecard',
  'constraints_leverage',
  'alignment_accountability',
]);
export const oosItemPriorityEnum = pgEnum('oos_item_priority', ['critical', 'high', 'medium', 'low']);
export const oosItemStatusEnum = pgEnum('oos_item_status', [
  'proposed',
  'accepted',
  'in_progress',
  'at_risk',
  'completed',
  'deferred',
]);
export const oosOwnerTypeEnum = pgEnum('oos_owner_type', ['employee', 'agent', 'hybrid', 'unassigned']);
export const oosSyncTypeEnum = pgEnum('oos_sync_type', ['preview', 'push_to_oos', 'rollback']);

export const oosOperatingPlans = pgTable('oos_operating_plans', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  departmentId: uuid('department_id'), // nullable; departmental plans = future release
  title: varchar('title', { length: 255 }).notNull(),
  status: oosPlanStatusEnum('status').notNull().default('draft'),
  createdBy: varchar('created_by', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastSyncedToOosAt: timestamp('last_synced_to_oos_at'),
}, (table) => ({
  orgIdx: index('oop_org_idx').on(table.organizationId),
  deptIdx: index('oop_dept_idx').on(table.departmentId),
  statusIdx: index('oop_status_idx').on(table.status),
}));

export const oosOperatingPlanSections = pgTable('oos_operating_plan_sections', {
  id: uuid('id').defaultRandom().primaryKey(),
  planId: uuid('plan_id').references(() => oosOperatingPlans.id, { onDelete: 'cascade' }).notNull(),
  sectionKey: oosPlanSectionKeyEnum('section_key').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  contentJson: jsonb('content_json').notNull().default({}),
  sortOrder: integer('sort_order').notNull().default(0),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  planSectionIdx: uniqueIndex('oops_plan_section_idx').on(table.planId, table.sectionKey),
  sortIdx: index('oops_sort_idx').on(table.planId, table.sortOrder),
}));

export const oosExecutionItems = pgTable('oos_execution_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  planId: uuid('plan_id').references(() => oosOperatingPlans.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 500 }).notNull(),
  description: text('description'),
  outcome: text('outcome'),
  priority: oosItemPriorityEnum('priority').notNull().default('medium'),
  status: oosItemStatusEnum('status').notNull().default('proposed'),
  dueDate: timestamp('due_date'),
  quarter: varchar('quarter', { length: 12 }).notNull(), // 'Q1-2026'
  assignedOwnerType: oosOwnerTypeEnum('assigned_owner_type').notNull().default('unassigned'),
  assignedOwnerId: varchar('assigned_owner_id', { length: 255 }),
  assignedOwnerName: varchar('assigned_owner_name', { length: 255 }),
  secondaryOwnerType: oosOwnerTypeEnum('secondary_owner_type'),
  secondaryOwnerId: varchar('secondary_owner_id', { length: 255 }),
  secondaryOwnerName: varchar('secondary_owner_name', { length: 255 }),
  confidenceScore: real('confidence_score'),
  assignmentReason: text('assignment_reason'),
  sourceReferencesJson: jsonb('source_references_json').default([]),
  pushedClaimIdsJson: jsonb('pushed_claim_ids_json').default([]),
  createdByAi: boolean('created_by_ai').notNull().default(false),
  userModified: boolean('user_modified').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  planIdx: index('ooei_plan_idx').on(table.planId),
  quarterIdx: index('ooei_quarter_idx').on(table.planId, table.quarter),
  statusIdx: index('ooei_status_idx').on(table.status),
  ownerIdx: index('ooei_owner_idx').on(table.assignedOwnerType, table.assignedOwnerId),
  priorityIdx: index('ooei_priority_idx').on(table.priority),
}));

// ---- KPIs (scorecard measurables on org-chart entities) ----

export const kpiOwnerEntityTypeEnum = pgEnum('kpi_owner_entity_type', ['agent', 'human']);
export const kpiGoalOperatorEnum = pgEnum('kpi_goal_operator', ['gte', 'lte', 'eq', 'gt', 'lt']);
export const kpiTimeGrainEnum = pgEnum('kpi_time_grain', ['weekly', 'monthly', 'quarterly', 'annual']);
export const kpiAggregationEnum = pgEnum('kpi_aggregation', ['sum', 'avg', 'last', 'first', 'min', 'max']);
export const kpiValueSourceEnum = pgEnum('kpi_value_source', ['manual', 'api', 'computed']);

// Custom meeting formats: a user-authored, reusable agenda (ordered sections).
// visibility: 'private' (creator only) or 'org' (everyone in the org can run it).
// structure is MeetingSection[] (see shared/meeting-sections.ts). source_listing_id
// is set when a format was installed from a marketplace listing (provenance).
export const meetingFormats = pgTable('meeting_formats', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  createdBy: varchar('created_by', { length: 255 }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  structure: jsonb('structure').notNull().default([]),
  visibility: varchar('visibility', { length: 20 }).notNull().default('org'),
  sourceListingId: uuid('source_listing_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
}, (table) => ({
  orgIdx: index('meeting_formats_org_idx').on(table.orgId),
  orgVisIdx: index('meeting_formats_org_vis_idx').on(table.orgId, table.visibility),
}));

// KPI group registry + display order. Groups are otherwise just the group_name
// string on each KPI; this table persists a custom order and lets a group exist
// (and be reordered) independent of which KPIs are in it. Keyed by (org, name).
export const kpiGroups = pgTable('kpi_groups', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 120 }).notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  orgNameIdx: uniqueIndex('kpi_groups_org_name_idx').on(table.orgId, table.name),
  orgIdx: index('kpi_groups_org_idx').on(table.orgId),
}));

export const kpis = pgTable('kpis', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  // Team scoping: which L10 scorecard this KPI belongs on. Backfill (in
  // ensure-kpis-rocks-team.ts) puts all existing KPIs on leadership.
  teamId: uuid('team_id'),
  // Shared KPI: every per-person member of one shared KPI carries the same
  // sharedGroupId. NULL = an ordinary single-owner KPI. Created in
  // ensure-kpi-shared-group.ts.
  sharedGroupId: uuid('shared_group_id'),
  ownerEntityType: kpiOwnerEntityTypeEnum('owner_entity_type').notNull(),
  ownerExternalId: varchar('owner_external_id', { length: 120 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  groupName: varchar('group_name', { length: 120 }),
  goalOperator: kpiGoalOperatorEnum('goal_operator'),
  goalValue: real('goal_value'),
  unit: varchar('unit', { length: 40 }),
  timeGrain: kpiTimeGrainEnum('time_grain').notNull().default('weekly'),
  formula: text('formula'),
  aggregationMethod: kpiAggregationEnum('aggregation_method').notNull().default('sum'),
  planSectionId: uuid('plan_section_id').references(() => oosOperatingPlanSections.id, { onDelete: 'set null' }),
  executionItemId: uuid('execution_item_id').references(() => oosExecutionItems.id, { onDelete: 'set null' }),
  claimId: uuid('claim_id'),
  isPublished: boolean('is_published').notNull().default(false),
  public: boolean('public').default(false).notNull(),
  // Portfolio rollup: a member org can block this KPI from rolling up into a
  // portfolio super-metric. Column added by ensure-portfolio.ts on boot.
  rollupExcluded: boolean('rollup_excluded').notNull().default(false),
  createdBy: varchar('created_by', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
  // Archived KPIs (no longer relevant -- e.g. a scorecard group the org
  // stopped tracking). NEVER deleted: history stays queryable. Hidden from
  // every default list/scoreboard; /dashboard/kpis has a Show-archived
  // filter and an Unarchive action. Mirrors rocks.archivedAt. Column added
  // via ensure-kpis-rocks-team.ts boot DDL (Drizzle migrate is broken).
  archivedAt: timestamp('archived_at'),
}, (table) => ({
  orgIdx: index('kpis_org_idx').on(table.organizationId),
  ownerIdx: index('kpis_owner_idx').on(table.organizationId, table.ownerEntityType, table.ownerExternalId),
  groupIdx: index('kpis_group_idx').on(table.organizationId, table.groupName),
  sharedGroupIdx: index('kpis_shared_group_idx').on(table.organizationId, table.sharedGroupId),
  grainIdx: index('kpis_grain_idx').on(table.organizationId, table.timeGrain),
  sectionIdx: index('kpis_section_idx').on(table.planSectionId),
  execItemIdx: index('kpis_exec_item_idx').on(table.executionItemId),
}));

export const kpiValues = pgTable('kpi_values', {
  id: uuid('id').defaultRandom().primaryKey(),
  kpiId: uuid('kpi_id').references(() => kpis.id, { onDelete: 'cascade' }).notNull(),
  periodStart: timestamp('period_start').notNull(),
  periodEnd: timestamp('period_end').notNull(),
  value: real('value'),
  source: kpiValueSourceEnum('source').notNull(),
  enteredBy: varchar('entered_by', { length: 255 }),
  enteredAt: timestamp('entered_at').defaultNow().notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  kpiPeriodUk: uniqueIndex('kpi_values_kpi_period_uk').on(table.kpiId, table.periodStart),
  periodIdx: index('kpi_values_period_idx').on(table.kpiId, table.periodStart, table.periodEnd),
  sourceIdx: index('kpi_values_source_idx').on(table.source),
}));

export const kpiDependencies = pgTable('kpi_dependencies', {
  id: uuid('id').defaultRandom().primaryKey(),
  kpiId: uuid('kpi_id').references(() => kpis.id, { onDelete: 'cascade' }).notNull(),
  dependsOnKpiId: uuid('depends_on_kpi_id').references(() => kpis.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  uk: uniqueIndex('kpi_deps_uk').on(table.kpiId, table.dependsOnKpiId),
  dependsOnIdx: index('kpi_deps_depends_on_idx').on(table.dependsOnKpiId),
}));

// ---- Portfolio (an org composed of other orgs) ----
// A portfolio is an organizations row with kind='portfolio'. Member orgs link
// to it via portfolio_members; portfolio super-metrics are ordinary kpis rows
// in the portfolio org, fed by portfolio_metric_sources. Tables created by
// ensure-portfolio.ts at boot (Drizzle migrate is broken).

export const portfolioMembers = pgTable('portfolio_members', {
  id: uuid('id').defaultRandom().primaryKey(),
  portfolioOrgId: uuid('portfolio_org_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  memberOrgId: uuid('member_org_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  // Invite/consent flow: who invited the org, and the owner email it was sent to.
  // Columns added by ensure-portfolio.ts on boot (Drizzle migrate is broken).
  invitedByUserId: varchar('invited_by_user_id', { length: 255 }),
  invitedEmail: varchar('invited_email', { length: 200 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  uk: uniqueIndex('portfolio_members_uk').on(table.portfolioOrgId, table.memberOrgId),
  portfolioIdx: index('portfolio_members_portfolio_idx').on(table.portfolioOrgId),
}));

export const portfolioMetricSources = pgTable('portfolio_metric_sources', {
  id: uuid('id').defaultRandom().primaryKey(),
  portfolioKpiId: uuid('portfolio_kpi_id').references(() => kpis.id, { onDelete: 'cascade' }).notNull(),
  memberOrgId: uuid('member_org_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  memberKpiId: uuid('member_kpi_id').references(() => kpis.id, { onDelete: 'cascade' }).notNull(),
  weight: real('weight').notNull().default(1),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  uk: uniqueIndex('portfolio_metric_sources_uk').on(table.portfolioKpiId, table.memberOrgId, table.memberKpiId),
  portfolioKpiIdx: index('portfolio_metric_sources_kpi_idx').on(table.portfolioKpiId),
}));

// ---- Portfolio "champion invite" (seed a new org from the template) ----
// A portfolio owner invites ONE champion (a person, by email). On accept a
// BRAND-NEW org is created from the portfolio's template, the champion becomes
// its owner, and the new org is auto-linked into the portfolio. Distinct from
// portfolio_members (which links EXISTING orgs). Table created by
// ensure-portfolio-champion-invites.ts at boot (Drizzle migrate is broken).

export const portfolioChampionInvites = pgTable('portfolio_champion_invites', {
  id: uuid('id').defaultRandom().primaryKey(),
  portfolioOrgId: uuid('portfolio_org_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  email: varchar('email', { length: 200 }).notNull(),
  // Optional name for the org to create; the champion can name it on accept.
  orgName: varchar('org_name', { length: 255 }),
  token: varchar('token', { length: 64 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  invitedByUserId: varchar('invited_by_user_id', { length: 255 }),
  // Set on accept: the new org seeded from the template.
  createdOrgId: uuid('created_org_id').references(() => organizations.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  acceptedAt: timestamp('accepted_at'),
  // Invite link expiry. NULL = never expires (legacy rows). New invites get a
  // 14-day window; accept rejects expired tokens.
  expiresAt: timestamp('expires_at'),
}, (table) => ({
  tokenUk: uniqueIndex('portfolio_champion_invites_token_uk').on(table.token),
  portfolioIdx: index('portfolio_champion_invites_portfolio_idx').on(table.portfolioOrgId),
}));

// ---- In-app notifications (nav alert bell) ----
// Created by ensure-notifications.ts at boot. Recipients are chart seats;
// org_members.claimed_entity_ids maps seats to signed-in users at read time.

export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  recipientExternalId: varchar('recipient_external_id', { length: 120 }).notNull(),
  type: varchar('type', { length: 60 }).notNull(),
  title: varchar('title', { length: 500 }).notNull(),
  href: varchar('href', { length: 500 }),
  actorName: varchar('actor_name', { length: 255 }),
  readAt: timestamp('read_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  recipientIdx: index('notif_recipient_idx').on(table.organizationId, table.recipientExternalId, table.readAt),
  createdIdx: index('notif_created_idx').on(table.organizationId, table.createdAt),
}));

// ---- Web push subscriptions (browser endpoints for the alert bell) ----
// Created by ensure-push-subscriptions.ts at boot.

export const pushSubscriptions = pgTable('push_subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  clerkUserId: varchar('clerk_user_id', { length: 255 }).notNull(),
  endpoint: text('endpoint').notNull(),
  p256dh: varchar('p256dh', { length: 255 }).notNull(),
  auth: varchar('auth', { length: 255 }).notNull(),
  userAgent: varchar('user_agent', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastUsedAt: timestamp('last_used_at'),
}, (table) => ({
  endpointUk: uniqueIndex('push_subs_endpoint_uk').on(table.endpoint),
  orgUserIdx: index('push_subs_org_user_idx').on(table.organizationId, table.clerkUserId),
}));

// ---- User engagement log (re-engagement nudges, max 4 per 30 days) ----

export const userEngagementLog = pgTable('user_engagement_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  userEmail: varchar('user_email', { length: 255 }).notNull(),
  clerkUserId: varchar('clerk_user_id', { length: 255 }),         // NULL for pre-signups
  lastSignInAtAtSend: timestamp('last_sign_in_at_at_send'),
  segment: varchar('segment', { length: 50 }).notNull(),
  templateKey: varchar('template_key', { length: 100 }).notNull(),
  sentAt: timestamp('sent_at').defaultNow().notNull(),
  sendStatus: varchar('send_status', { length: 20 }).notNull().default('sent'),
  sendError: text('send_error'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  emailIdx: index('uel_email_idx').on(table.userEmail),
  emailSentIdx: index('uel_email_sent_idx').on(table.userEmail, table.sentAt),
  clerkUserIdx: index('uel_clerk_user_idx').on(table.clerkUserId),
  segmentIdx: index('uel_segment_idx').on(table.segment),
  sentAtIdx: index('uel_sent_at_idx').on(table.sentAt),
}));

export const oosPlanSyncEvents = pgTable('oos_plan_sync_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  planId: uuid('plan_id').references(() => oosOperatingPlans.id, { onDelete: 'cascade' }).notNull(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  syncType: oosSyncTypeEnum('sync_type').notNull(),
  pushedBy: varchar('pushed_by', { length: 255 }).notNull(),
  beforeSnapshotJson: jsonb('before_snapshot_json').default({}),
  afterSnapshotJson: jsonb('after_snapshot_json').default({}),
  claimIdsJson: jsonb('claim_ids_json').default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  planIdx: index('oopse_plan_idx').on(table.planId),
  orgIdx: index('oopse_org_idx').on(table.organizationId),
  typeIdx: index('oopse_type_idx').on(table.syncType),
  createdIdx: index('oopse_created_idx').on(table.createdAt),
}));

// ---- L8 (weekly leadership meeting; renamed from EOS Level-10) ----

export const meetingStatusEnum = pgEnum('meeting_status', ['scheduled', 'in_progress', 'completed', 'cancelled']);
// idsStatusEnum and ownerEntityTypeEnum are declared earlier (next to ticketStatusEnum) so the tickets table can reference them.

export const rocks = pgTable('rocks', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  // Team scoping: which L10 owns this rock. Backfilled to leadership for
  // all legacy rocks; move to a different team via PATCH /rocks/:id.
  teamId: uuid('team_id'),
  ownerEntityType: ownerEntityTypeEnum('owner_entity_type').notNull(),
  ownerExternalId: varchar('owner_external_id', { length: 120 }).notNull(),
  ownerName: varchar('owner_name', { length: 255 }),
  title: varchar('title', { length: 500 }).notNull(),
  description: text('description'),
  planSectionId: uuid('plan_section_id').references(() => oosOperatingPlanSections.id, { onDelete: 'set null' }),
  executionItemId: uuid('execution_item_id').references(() => oosExecutionItems.id, { onDelete: 'set null' }),
  quarter: varchar('quarter', { length: 10 }).notNull(),
  dueDate: timestamp('due_date').notNull(),
  onTrack: boolean('on_track').notNull().default(true),
  statusNote: text('status_note'),
  statusUpdatedAt: timestamp('status_updated_at'),
  completedAt: timestamp('completed_at'),
  // Archived (killed/deprioritized) rocks. Distinct from completedAt and
  // from deletedAt: archived rocks are hidden from the default Rock Review
  // but fully recoverable (Reopen clears it). Added via ensure-kpis-rocks-team.ts.
  archivedAt: timestamp('archived_at'),
  // GTD Next Action: one concrete physical step toward completing the
  // rock. Surfaced on /dashboard hero; the rock title is the destination,
  // not the next move. Added via ensure-next-actions.ts boot DDL.
  nextAction: text('next_action'),
  nextActionSetAt: timestamp('next_action_set_at'),
  // SMART Rock enrichment (free, Phase 1). The five SMART criteria are
  // free-text answers, plus a finish-line description and resources/obstacles
  // string lists. Shape lives in shared/smart-rock.ts. Nullable; null = "not
  // built". Queried by rock id, not into the jsonb, so no GIN index. Added via
  // ensure-smart-rocks.ts boot DDL.
  smartData: jsonb('smart_data'),
  // Manual display order for the Rock Review. Lower sorts first; NULL
  // (unnumbered) sorts after all numbered rocks by soonest due date.
  // Added via ensure-kpis-rocks-team.ts boot DDL.
  position: integer('position'),
  createdBy: varchar('created_by', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
}, (table) => ({
  orgIdx: index('rocks_org_idx').on(table.organizationId),
  ownerIdx: index('rocks_owner_idx').on(table.organizationId, table.ownerEntityType, table.ownerExternalId),
  quarterIdx: index('rocks_quarter_idx').on(table.organizationId, table.quarter),
}));

export const meetings = pgTable('meetings', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  teamId: uuid('team_id'), // FK added by ensure-meeting-teams.ts; declared as plain uuid to dodge Drizzle's circular ref check
  meetingType: varchar('meeting_type', { length: 60 }).notNull().default('leadership'),
  title: varchar('title', { length: 255 }).notNull(),
  status: meetingStatusEnum('status').notNull().default('scheduled'),
  scheduledAt: timestamp('scheduled_at').notNull(),
  startedAt: timestamp('started_at'),
  endedAt: timestamp('ended_at'),
  // Auto-end safety net: when a meeting is started we stamp a deadline
  // (startedAt + 60min). A meeting still in_progress past this deadline is
  // auto-completed (lazily on page load + by a periodic backstop) so a meeting
  // left open by someone who forgot to press End does not linger forever.
  // "Extend" pushes this out. null = no deadline (legacy / never started).
  // Column added by ensure-meeting-auto-end.ts on boot (Drizzle migrate is
  // broken; schema self-heals).
  autoEndAt: timestamp('auto_end_at'),
  attendees: jsonb('attendees').notNull().default([]),
  segueNotes: text('segue_notes'),
  headlines: text('headlines'),
  cascadingMessage: text('cascading_message'),
  // Phase 0 of the meeting scheduler (manual paste path): a user-pasted
  // video link (Meet / Teams / Zoom). Surfaced in the "Add to calendar"
  // copyable block so it can be pasted into a Google or Outlook invite.
  // Column added by ensure-meeting-video-link.ts on boot (Drizzle migrate
  // is broken; schema self-heals).
  videoLink: varchar('video_link', { length: 2048 }),
  // Recurring meeting series (OTP owns the series). recurrenceRule is an iCal
  // RRULE (e.g. FREQ=WEEKLY;BYDAY=TU); null = one-time. The first meeting a
  // user makes recurring is the series anchor (recurrenceParentId null, rule
  // set); each generated occurrence carries the same rule and points back at
  // the anchor via recurrenceParentId. Columns added by
  // ensure-meeting-recurrence.ts on boot.
  recurrenceRule: varchar('recurrence_rule', { length: 255 }),
  recurrenceParentId: uuid('recurrence_parent_id'),
  ratings: jsonb('ratings').notNull().default({}),
  scorecardSnapshot: jsonb('scorecard_snapshot'),
  rocksSnapshot: jsonb('rocks_snapshot'),
  // Custom meeting formats: agenda = snapshot of the format's structure at run
  // time (MeetingSection[]); formatId = the source format; runState = the
  // runner's live state (active section index + per-section notes). Columns
  // added by ensure-meeting-agenda.ts on boot.
  agenda: jsonb('agenda'),
  formatId: uuid('format_id'),
  runState: jsonb('run_state'),
  // Per-segment notes for the Strategy Reset meeting type. Keyed by segment
  // identifier; defaults to {} so callers can safely merge. Column added by
  // ensure-strategy-reset.ts on boot.
  segmentNotes: jsonb('segment_notes').notNull().default({}),
  // Post-meeting record (set on completed meetings). transcript = pasted/uploaded
  // text (source-agnostic: Plaud, Fireflies, Gemini, etc.) and the input the AI
  // follow-ups wizard reads; recordingUrl = a link to the recording (recordings
  // are too large for the 5MB attachment cap); aiSummary = the wizard's summary.
  // Columns added by ensure-meeting-transcript.ts on boot (Drizzle migrate is
  // broken; schema self-heals).
  transcript: text('transcript'),
  recordingUrl: varchar('recording_url', { length: 2048 }),
  aiSummary: text('ai_summary'),
  // Manual on/off-track overrides set during the meeting, keyed by KPI id:
  // { [kpiId]: 'ontrack' | 'offtrack' }. When present, the scorecard shows the
  // override instead of the auto-computed (latest vs goal) status. Column added
  // by ensure-meeting-scorecard-status.ts on boot.
  scorecardStatus: jsonb('scorecard_status').notNull().default({}),
  createdBy: varchar('created_by', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
}, (table) => ({
  orgIdx: index('meetings_org_idx').on(table.organizationId),
  scheduledIdx: index('meetings_scheduled_idx').on(table.organizationId, table.scheduledAt),
  typeIdx: index('meetings_type_idx').on(table.organizationId, table.meetingType),
}));

export const todos = pgTable('todos', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  // Phase: Todos v2. Clean separation between personal and L10 meeting todos
  // so /me/todos and /l8 never leak into each other again.
  kind: todoKindEnum('kind').notNull().default('personal'),
  priority: todoPriorityEnum('priority').notNull().default('p3'),
  teamId: uuid('team_id').references(() => teams.id, { onDelete: 'set null' }),
  meetingId: uuid('meeting_id').references(() => meetings.id, { onDelete: 'set null' }),
  ownerEntityType: ownerEntityTypeEnum('owner_entity_type').notNull(),
  ownerExternalId: varchar('owner_external_id', { length: 120 }).notNull(),
  ownerName: varchar('owner_name', { length: 255 }),
  // Delegation: who handed this todo down. Nullable; normal todos leave null.
  delegatorEntityType: ownerEntityTypeEnum('delegator_entity_type'),
  delegatorExternalId: varchar('delegator_external_id', { length: 120 }),
  delegatorName: varchar('delegator_name', { length: 255 }),
  title: varchar('title', { length: 500 }).notNull(),
  description: text('description'),
  dueAt: timestamp('due_at'),
  // Append-only log of due/promised-date changes: { from, to, at, by }.
  dueAtHistory: jsonb('due_at_history').notNull().default([]),
  doneAt: timestamp('done_at'),
  // Verification: when/who confirmed the delegated todo was done right.
  verifiedAt: timestamp('verified_at'),
  verifiedBy: varchar('verified_by', { length: 255 }),
  // Recurrence: iCal RRULE on a template, and the FK back to the template
  // on every generated instance. Templates never appear in user-facing
  // lists (only their instances do).
  recurrenceRule: text('recurrence_rule'),
  recurrenceParentId: uuid('recurrence_parent_id'),
  // Subtask tree.
  parentTodoId: uuid('parent_todo_id'),
  position: integer('position').notNull().default(0),
  // Rock milestone this to-do serves. FK (ON DELETE SET NULL) added by
  // ensure-rock-milestones.ts at boot; declared as plain uuid here because
  // rock_milestones is defined later in this file (same pattern as
  // meetings.team_id). Deleting a milestone keeps the to-do, unlinked.
  milestoneId: uuid('milestone_id'),
  createdBy: varchar('created_by', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
}, (table) => ({
  orgIdx: index('todos_org_idx').on(table.organizationId),
  meetingIdx: index('todos_meeting_idx').on(table.meetingId),
  ownerIdx: index('todos_owner_idx').on(table.organizationId, table.ownerEntityType, table.ownerExternalId),
  openIdx: index('todos_open_idx').on(table.organizationId, table.doneAt),
  kindOwnerIdx: index('todos_kind_owner_idx').on(table.organizationId, table.kind, table.ownerExternalId),
  kindTeamIdx: index('todos_kind_team_idx').on(table.organizationId, table.kind, table.teamId),
  parentIdx: index('todos_parent_idx').on(table.parentTodoId, table.position),
  recurrenceParentIdx: index('todos_recurrence_parent_idx').on(table.recurrenceParentId),
  delegatorIdx: index('todos_delegator_idx').on(table.organizationId, table.delegatorExternalId),
  milestoneIdx: index('todos_milestone_idx').on(table.milestoneId),
}));

// ---- Rock milestones (Quarterly Priority milestones) ----
// Created by ensure-rock-milestones.ts at boot (Drizzle migrate is broken;
// schema self-heals). Declared here for typed queries. Milestones hard-delete
// (no soft-delete column): the DELETE endpoint is org-scoped and the
// todos.milestone_id FK (ON DELETE SET NULL) keeps linked to-dos alive.
export const rockMilestones = pgTable('rock_milestones', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  rockId: uuid('rock_id').references(() => rocks.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  // Plain calendar date (YYYY-MM-DD string) -- no timezone math.
  dueDate: date('due_date'),
  completedAt: timestamp('completed_at'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  orgIdx: index('rock_milestones_org_idx').on(table.organizationId),
  rockIdx: index('rock_milestones_rock_idx').on(table.rockId),
}));

// IDS extension columns on tickets are added via raw SQL in the migration:
//   ALTER TABLE tickets ADD COLUMN ids_status ids_status NOT NULL DEFAULT 'open';
//   ALTER TABLE tickets ADD COLUMN priority_rank integer;
//   ALTER TABLE tickets ADD COLUMN solved_in_meeting_id uuid REFERENCES meetings(id) ON DELETE SET NULL;
// The Drizzle schema above intentionally does not redeclare the tickets table.

// ---- Teams (Phase 1: Employee/Manager/Managee model) ----
// Tables created by ensure-teams.ts at boot. The org_members and
// org_invitations tables already exist (Phase 4.6) and are extended via
// ensure-org-members.ts to add Ninety-style roles + access toggles.

export const teamTypeEnum = pgEnum('team_type', [
  'leadership', 'department', 'project', 'other',
]);

export const teamRoleEnum = pgEnum('team_role', ['leader', 'member']);

export const teams = pgTable('teams', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull(),
  type: teamTypeEnum('type').notNull().default('department'),
  description: text('description'),
  isDefault: boolean('is_default').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  orgIdx: index('teams_org_idx').on(table.orgId),
  typeIdx: index('teams_type_idx').on(table.orgId, table.type),
}));

export const teamMemberships = pgTable('team_memberships', {
  id: uuid('id').defaultRandom().primaryKey(),
  teamId: uuid('team_id').references(() => teams.id, { onDelete: 'cascade' }).notNull(),
  memberId: uuid('member_id').references(() => orgMembers.id, { onDelete: 'cascade' }).notNull(),
  roleOnTeam: teamRoleEnum('role_on_team').notNull().default('member'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  teamIdx: index('tm_team_idx').on(table.teamId),
  memberIdx: index('tm_member_idx').on(table.memberId),
}));

// ---- Meeting headlines (per-author headline rows on a meeting) ----
// Created in ensure-meeting-headlines.ts. Schema declared here for typed
// queries from API code.

export const meetingHeadlineKindEnum = pgEnum('meeting_headline_kind', ['customer', 'employee', 'other']);

export const meetingHeadlines = pgTable('meeting_headlines', {
  id: uuid('id').defaultRandom().primaryKey(),
  meetingId: uuid('meeting_id').references(() => meetings.id, { onDelete: 'cascade' }),
  teamId: uuid('team_id'),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  authorUserId: varchar('author_user_id', { length: 255 }).notNull(),
  authorName: varchar('author_name', { length: 255 }),
  kind: meetingHeadlineKindEnum('kind').notNull().default('other'),
  body: text('body').notNull(),
  readAt: timestamp('read_at'),
  readByUserId: varchar('read_by_user_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  meetingIdx: index('mhl_meeting_idx').on(table.meetingId, table.createdAt),
  authorIdx: index('mhl_author_idx').on(table.orgId, table.authorUserId),
  unreadIdx: index('mhl_unread_idx').on(table.meetingId, table.readAt),
}));

// ---- Seat responsibilities (structured role accountabilities per chart seat) ----
// Created in ensure-seat-responsibilities.ts.

export const seatResponsibilities = pgTable('seat_responsibilities', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  seatExternalId: varchar('seat_external_id', { length: 120 }).notNull(),
  responsibilities: jsonb('responsibilities').notNull().default([]).$type<string[]>(),
  updatedBy: varchar('updated_by', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  orgSeatIdx: uniqueIndex('seat_resp_org_seat_uk').on(table.orgId, table.seatExternalId),
  orgIdx: index('seat_resp_org_idx').on(table.orgId),
}));

// ---- People layer Phase 2: Seat Fit, Values, People Review ----
// Created in ensure-people-review.ts.

export const seatFitRatingEnum = pgEnum('seat_fit_rating', ['yes', 'partial', 'no']);

// One row per seat per period: how the person rates against their seat
// on Understands / Wants / Capacity.
export const seatFitReviews = pgTable('seat_fit_reviews', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  seatExternalId: varchar('seat_external_id', { length: 120 }).notNull(),
  period: varchar('period', { length: 20 }).notNull(),
  understands: seatFitRatingEnum('understands'),
  wants: seatFitRatingEnum('wants'),
  capacity: seatFitRatingEnum('capacity'),
  note: text('note'),
  ratedBy: varchar('rated_by', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  orgSeatPeriodIdx: uniqueIndex('seat_fit_org_seat_period_uk').on(table.orgId, table.seatExternalId, table.period),
  orgIdx: index('seat_fit_org_idx').on(table.orgId),
}));

// The organization's values (its value list -- columns of the People Review).
export const orgValues = pgTable('org_values', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 120 }).notNull(),
  description: text('description'),
  position: integer('position').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  orgIdx: index('org_values_org_idx').on(table.orgId),
}));

// One row per seat per value per period: how the person rates on that value.
export const valueReviews = pgTable('value_reviews', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  seatExternalId: varchar('seat_external_id', { length: 120 }).notNull(),
  valueId: uuid('value_id').references(() => orgValues.id, { onDelete: 'cascade' }).notNull(),
  period: varchar('period', { length: 20 }).notNull(),
  rating: seatFitRatingEnum('rating'),
  note: text('note'),
  ratedBy: varchar('rated_by', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  orgSeatValuePeriodIdx: uniqueIndex('value_rev_org_seat_value_period_uk').on(table.orgId, table.seatExternalId, table.valueId, table.period),
  orgIdx: index('value_rev_org_idx').on(table.orgId),
  seatIdx: index('value_rev_seat_idx').on(table.seatExternalId),
}));

// ---- Manager agents (user-uploaded CLAUDE.md / Agent.md per dashboard) ----
// Created in ensure-manager-agents.ts.

export const managerAgents = pgTable('manager_agents', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  ownerUserId: varchar('owner_user_id', { length: 255 }).notNull(),
  ownerMemberId: uuid('owner_member_id').references(() => orgMembers.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  externalId: varchar('external_id', { length: 120 }),
  description: text('description'),
  rawMd: text('raw_md').notNull(),
  frontmatter: jsonb('frontmatter').notNull().default({}),
  kpis: jsonb('kpis').notNull().default([]),
  score: real('score'),
  scoreBreakdown: jsonb('score_breakdown'),
  mcpConnectedAt: timestamp('mcp_connected_at'),
  lastRunAt: timestamp('last_run_at'),
  runCount: integer('run_count').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
}, (table) => ({
  orgIdx: index('mga_org_idx').on(table.orgId),
  ownerIdx: index('mga_owner_idx').on(table.orgId, table.ownerUserId),
  externalIdx: index('mga_external_idx').on(table.orgId, table.externalId),
}));

// ---- Glossary Terms (programmatic SEO) ----
// Created in ensure-glossary-terms.ts.

export const glossaryTerms = pgTable('glossary_terms', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: varchar('slug', { length: 200 }).notNull().unique(),
  name: varchar('name', { length: 300 }).notNull(),
  definition: text('definition').notNull(),
  whyItMatters: text('why_it_matters'),
  framework: varchar('framework', { length: 80 }),
  relatedSlugs: text('related_slugs').array(),
  aliases: text('aliases').array(),
  public: boolean('public').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  frameworkIdx: index('gt_framework_idx').on(table.framework),
  publicIdx: index('gt_public_idx').on(table.public),
}));

// =====================================================================
// Coach-Client Ecosystem (Phase 2) -- ensure-coach-clients.ts
// =====================================================================
// Two tables intentionally separate. Access is REVOCABLE (client can fire
// coach). Attribution is IMMUTABLE except by admin transfer (coach earns
// commission in perpetuity, GHL-style). Do not collapse into one table.

export const coachClientAttribution = pgTable('coach_client_attribution', {
  id: uuid('id').defaultRandom().primaryKey(),
  clientOrgId: uuid('client_org_id').references(() => organizations.id).notNull(),
  coachOrgId: uuid('coach_org_id').references(() => organizations.id).notNull(),
  coachProfileId: uuid('coach_profile_id').references(() => consultantProfiles.id),
  attributedAt: timestamp('attributed_at').defaultNow().notNull(),
  attributionSource: varchar('attribution_source', { length: 64 }).notNull().default('invite_link'),
  inviteTokenUsed: varchar('invite_token_used', { length: 64 }),
  // Transfer audit -- when an admin moves attribution to a new coach, this
  // row is marked transferredAt and a new row is inserted referencing this
  // one via transferred_from_coach_org_id.
  transferredFromCoachOrgId: uuid('transferred_from_coach_org_id').references(() => organizations.id),
  transferredAt: timestamp('transferred_at'),
  transferredByAdminId: varchar('transferred_by_admin_id', { length: 255 }),
  notes: text('notes'),
}, (table) => ({
  coachIdx: index('cca_coach_idx').on(table.coachOrgId),
}));

export const coachClientAccess = pgTable('coach_client_access', {
  id: uuid('id').defaultRandom().primaryKey(),
  clientOrgId: uuid('client_org_id').references(() => organizations.id).notNull(),
  coachOrgId: uuid('coach_org_id').references(() => organizations.id).notNull(),
  permissionLevel: varchar('permission_level', { length: 32 }).notNull().default('full_visibility'),
  grantedAt: timestamp('granted_at').defaultNow().notNull(),
  revokedAt: timestamp('revoked_at'),
  revokedByUserId: varchar('revoked_by_user_id', { length: 255 }),
});

// =====================================================================
// Google Ads server-side conversion log -- ensure-conversion-log.ts
// =====================================================================
// One row per upload attempt against the SIGNUP conversion action. The
// /onboarding/profile route checks this table for an existing successful
// or partial row before firing again -- this is what makes the
// server-side path idempotent across page reloads and Clerk session
// refreshes. Replaces the client-side page-view tag that over-counted
// on 2026-05-19 (1 conversion logged with 0 Clerk users created).

export const conversionLog = pgTable('conversion_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  clerkUserId: varchar('clerk_user_id', { length: 255 }).notNull(),
  conversionActionId: varchar('conversion_action_id', { length: 64 }).notNull(),
  gclid: varchar('gclid', { length: 512 }),
  gbraid: varchar('gbraid', { length: 512 }),
  wbraid: varchar('wbraid', { length: 512 }),
  value: real('value'),
  currency: varchar('currency', { length: 8 }).default('USD'),
  status: varchar('status', { length: 24 }).notNull(),
  errorMessage: text('error_message'),
  rawResponse: jsonb('raw_response'),
}, (table) => ({
  clerkUserIdx: index('conversion_log_clerk_user_idx').on(table.clerkUserId),
  statusIdx: index('conversion_log_status_idx').on(table.status),
  createdAtIdx: index('conversion_log_created_at_idx').on(table.createdAt),
}));

// =====================================================================
// File attachments on to-dos / issues / rocks -- ensure-attachments.ts
// =====================================================================
// The blob lives ONCE in `attachments` (bytea, 5MB cap enforced by the
// API); `attachment_links` is the many-to-many onto todos / tickets
// ("issue") / rocks. "Carry" an attachment from a to-do onto an issue or
// rock = insert a second link row; the blob is never duplicated. Deleting
// the last link deletes the attachment (no orphan blobs).

// Drizzle has no built-in bytea column; customType is the documented
// escape hatch. node-postgres maps bytea <-> Buffer natively.
const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType() {
    return 'bytea';
  },
});

export const attachments = pgTable('attachments', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  filename: varchar('filename', { length: 255 }).notNull(),
  mimeType: varchar('mime_type', { length: 120 }).notNull(),
  sizeBytes: integer('size_bytes').notNull(),
  data: bytea('data').notNull(),
  // Actor stamp: Clerk user id or 'api_key' -- same convention as
  // todos.created_by / rocks.created_by.
  uploadedBy: varchar('uploaded_by', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  orgIdx: index('attachments_org_idx').on(table.organizationId),
}));

export const attachmentLinks = pgTable('attachment_links', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  attachmentId: uuid('attachment_id').references(() => attachments.id, { onDelete: 'cascade' }).notNull(),
  // 'todo' | 'issue' | 'rock' (issues live in the tickets table). Kept as
  // varchar (not a pg enum) so adding entity kinds is DDL-free.
  entityType: varchar('entity_type', { length: 20 }).notNull(),
  entityId: uuid('entity_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  uniqueLink: uniqueIndex('attachment_links_unique_idx').on(table.attachmentId, table.entityType, table.entityId),
  orgIdx: index('attachment_links_org_idx').on(table.organizationId),
  entityIdx: index('attachment_links_entity_idx').on(table.entityType, table.entityId),
}));

// ---------------------------------------------------------------------------
// Monetization Phase 2: wallet + entitlements + usage ledger.
//
// MONEY-SENSITIVE. All amounts are integer CENTS (never floats). The DDL is
// self-healed on boot by ensure-wallets.ts (drizzle migrate is broken on this
// project -- see ensure-org-privacy.ts). These pgTable defs exist so the
// wallet service can run type-safe Drizzle queries; they MUST stay in sync
// with the raw DDL in ensure-wallets.ts.
// ---------------------------------------------------------------------------

// Prepaid balance, one row per org. balance_cents is the cached running total;
// the wallet_ledger is the append-only source of truth it's derived from.
export const orgWallets = pgTable('org_wallets', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull().unique(),
  balanceCents: integer('balance_cents').notNull().default(0),
  currency: varchar('currency', { length: 3 }).notNull().default('usd'),
  autoRechargeEnabled: boolean('auto_recharge_enabled').notNull().default(false),
  autoRechargeAmountCents: integer('auto_recharge_amount_cents'),
  autoRechargeThresholdCents: integer('auto_recharge_threshold_cents'),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  orgIdx: index('org_wallets_org_idx').on(table.orgId),
}));

// Append-only transaction log. NEVER mutate a row. amount_cents is always
// POSITIVE; `direction` ('credit' | 'debit') conveys the sign. balance_after_cents
// records the wallet balance immediately after this row was applied (audit trail).
// idempotency_key is UNIQUE (nullable): a repeated key returns the prior result
// rather than double-applying (Stripe webhook retries, per-request AI debits).
export const walletLedger = pgTable('wallet_ledger', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  direction: varchar('direction', { length: 8 }).notNull(), // 'credit' | 'debit'
  amountCents: integer('amount_cents').notNull(),           // always positive
  balanceAfterCents: integer('balance_after_cents').notNull(),
  reason: varchar('reason', { length: 32 }).notNull(),      // topup|ai_usage|addon_charge|refund|promo|adjustment
  idempotencyKey: varchar('idempotency_key', { length: 120 }).unique(),
  metadata: jsonb('metadata'),
  createdBy: varchar('created_by', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  orgTimeIdx: index('wallet_ledger_org_time_idx').on(table.orgId, table.createdAt),
}));

// What an org is allowed to do. plan_tier + addons + feature_flags drive the
// hasEntitlement() chokepoint (src/shared/entitlements.ts). One row per org.
export const orgEntitlements = pgTable('org_entitlements', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull().unique(),
  planTier: varchar('plan_tier', { length: 32 }).notNull().default('free'),
  addons: jsonb('addons').notNull().default(sql`'[]'::jsonb`),
  featureFlags: jsonb('feature_flags').notNull().default(sql`'{}'::jsonb`),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  orgIdx: index('org_entitlements_org_idx').on(table.orgId),
}));

// ---- Org event outbox (realtime sync R0) ----
// Append-only durable log of every mutation worth fanning out live. Written
// (gated by ORG_EVENTS_ENABLED) beside each entity write -- inside the same
// transaction where one exists, best-effort beside the audit row where it
// doesn't. Serves three jobs at once: the realtime fan-out source, the
// Last-Event-ID replay/catch-up source, and an agent "what changed since"
// cursor. `id` is a bigserial so it is strictly monotonic per insert order --
// that ordering IS the cursor (uuid/createdAt can't give it). Payloads are
// THIN (ids + minimal hints); subscribers refetch through the normal authorized
// GET, so this channel can never leak more than the REST API already allows.
// Pruned to 30 days by org-events-retention.ts. Created by ensure-org-events.ts
// at boot (Drizzle migrate is broken in this repo); this def exists so the test
// harness (drizzle-kit push) and typed queries see the table.
export const orgEvents = pgTable('org_events', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  // Coarse subscription channel (claim/chart/kpi/rock/todo/issue/meeting/...);
  // see ORG_EVENT_TOPICS in src/shared/org-event-types.ts.
  topic: varchar('topic', { length: 40 }).notNull(),
  // Nullable: org-wide events (no team scope). No FK -- kept loose like other
  // team-id references so a team delete never blocks the append-only log.
  teamId: uuid('team_id'),
  entityType: varchar('entity_type', { length: 50 }).notNull(),
  // varchar(120), not uuid: some entities key on uuid (rocks), others on an
  // external/claim id (claims, graph nodes). Holds both.
  entityId: varchar('entity_id', { length: 120 }),
  action: varchar('action', { length: 60 }).notNull(),
  actorType: varchar('actor_type', { length: 20 }).notNull().default('system'),
  actorId: varchar('actor_id', { length: 255 }),
  payload: jsonb('payload'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  // The replay cursor: WHERE org_id = $ AND id > $last ORDER BY id.
  orgCursorIdx: index('org_events_org_cursor_idx').on(table.orgId, table.id),
  // Retention prune scans by age.
  createdIdx: index('org_events_created_idx').on(table.createdAt),
}));
