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
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  statusIdx: index('ticket_status_idx').on(table.status),
  orgIdx: index('ticket_org_idx').on(table.orgId),
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
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  orgIdx: index('cp_org_idx').on(table.orgId),
  slugIdx: uniqueIndex('cp_slug_idx').on(table.slug),
  publishedIdx: index('cp_published_idx').on(table.published),
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
  source: varchar('source', { length: 50 }).notNull().default('homepage'),
  doubleOptInConfirmed: boolean('double_opt_in_confirmed').notNull().default(false),
  confirmToken: varchar('confirm_token', { length: 64 }),
  tokenExpiresAt: timestamp('token_expires_at'),
  subscribedAt: timestamp('subscribed_at').defaultNow().notNull(),
  unsubscribedAt: timestamp('unsubscribed_at'),
}, (table) => ({
  emailIdx: uniqueIndex('ns_email_idx').on(table.email),
  confirmedIdx: index('ns_confirmed_idx').on(table.doubleOptInConfirmed),
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
