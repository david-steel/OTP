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
  totalTokenCost: integer('total_token_cost'),
  tokenEfficiencyScore: real('token_efficiency_score'),
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
  tokenCost: integer('token_cost'),
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
