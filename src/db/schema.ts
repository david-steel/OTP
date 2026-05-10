import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  real,
  boolean,
  timestamp,
  jsonb,
  pgEnum,
  uniqueIndex,
  index,
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
  agenticLevel: integer('agentic_level'),
  slug: text('slug').unique(),
  public: boolean('public').default(false).notNull(),
  description: text('description'),
  website: text('website'),
  chart: jsonb('chart'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  clerkIdx: uniqueIndex('org_clerk_idx').on(table.clerkOrgId),
}));

export const oosFiles = pgTable('oos_files', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id).notNull(),
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

export const tickets = pgTable('tickets', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id),
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
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
}, (table) => ({
  statusIdx: index('ticket_status_idx').on(table.status),
  orgIdx: index('ticket_org_idx').on(table.orgId),
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
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  clerkUserIdx: uniqueIndex('onb_clerk_user_idx').on(table.clerkUserId),
  emailIdx: index('onb_email_idx').on(table.email),
  signupIdx: index('onb_signup_idx').on(table.signupAt),
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

export const kpis = pgTable('kpis', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
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
  createdBy: varchar('created_by', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
}, (table) => ({
  orgIdx: index('kpis_org_idx').on(table.organizationId),
  ownerIdx: index('kpis_owner_idx').on(table.organizationId, table.ownerEntityType, table.ownerExternalId),
  groupIdx: index('kpis_group_idx').on(table.organizationId, table.groupName),
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
  ownerEntityType: ownerEntityTypeEnum('owner_entity_type').notNull(),
  ownerExternalId: varchar('owner_external_id', { length: 120 }).notNull(),
  ownerName: varchar('owner_name', { length: 255 }),
  title: varchar('title', { length: 500 }).notNull(),
  description: text('description'),
  quarter: varchar('quarter', { length: 10 }).notNull(),
  dueDate: timestamp('due_date').notNull(),
  onTrack: boolean('on_track').notNull().default(true),
  statusNote: text('status_note'),
  statusUpdatedAt: timestamp('status_updated_at'),
  completedAt: timestamp('completed_at'),
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
  attendees: jsonb('attendees').notNull().default([]),
  segueNotes: text('segue_notes'),
  headlines: text('headlines'),
  cascadingMessage: text('cascading_message'),
  ratings: jsonb('ratings').notNull().default({}),
  scorecardSnapshot: jsonb('scorecard_snapshot'),
  rocksSnapshot: jsonb('rocks_snapshot'),
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
  meetingId: uuid('meeting_id').references(() => meetings.id, { onDelete: 'set null' }),
  ownerEntityType: ownerEntityTypeEnum('owner_entity_type').notNull(),
  ownerExternalId: varchar('owner_external_id', { length: 120 }).notNull(),
  ownerName: varchar('owner_name', { length: 255 }),
  title: varchar('title', { length: 500 }).notNull(),
  description: text('description'),
  dueAt: timestamp('due_at'),
  doneAt: timestamp('done_at'),
  createdBy: varchar('created_by', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
}, (table) => ({
  orgIdx: index('todos_org_idx').on(table.organizationId),
  meetingIdx: index('todos_meeting_idx').on(table.meetingId),
  ownerIdx: index('todos_owner_idx').on(table.organizationId, table.ownerEntityType, table.ownerExternalId),
  openIdx: index('todos_open_idx').on(table.organizationId, table.doneAt),
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
  meetingId: uuid('meeting_id').references(() => meetings.id, { onDelete: 'cascade' }).notNull(),
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
