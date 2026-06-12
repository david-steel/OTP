import type { ActorType } from '../shared/enums.js';

// Audit logger interface -- implementation depends on database connection
// This defines the contract; the actual insert happens via Drizzle in the route handlers

export interface AuditEntry {
  orgId: string | null;
  actorType: ActorType;
  action: string;
  entityType: string;
  entityId: string | null;
  details: Record<string, unknown> | null;
}

// Standard audit actions
export const AUDIT_ACTIONS = {
  // OOS lifecycle
  OOS_CREATED: 'oos.created',
  OOS_UPDATED: 'oos.updated',
  OOS_PUBLISHED: 'oos.published',
  OOS_ARCHIVED: 'oos.archived',
  OOS_RENAMED: 'oos.renamed',
  OOS_DELETED: 'oos.deleted',
  OOS_NEW_VERSION: 'oos.new_version',

  // Claim lifecycle (Phase B: MCP instrumentation)
  CLAIM_CAPTURED: 'claim.captured',

  // PII
  PII_SCAN_CLEAN: 'pii.scan.clean',
  PII_SCAN_FLAGGED: 'pii.scan.flagged',
  PII_FLAG_RESOLVED: 'pii.flag.resolved',

  // Search and browse
  SEARCH_EXECUTED: 'search.executed',
  OOS_VIEWED: 'oos.viewed',
  CLAIM_VIEWED: 'claim.viewed',

  // Diff
  DIFF_EXECUTED: 'diff.executed',

  // Auth
  ORG_REGISTERED: 'org.registered',
  USER_LOGIN: 'user.login',

  // Phase 2+
  SUBSCRIPTION_CREATED: 'subscription.created',
  SUBSCRIPTION_CANCELLED: 'subscription.cancelled',
  MERGE_PREVIEWED: 'merge.previewed',
  MERGE_APPLIED: 'merge.applied',
  MERGE_ROLLED_BACK: 'merge.rolled_back',

  // Wallet / monetization (Phase 2). MONEY-SENSITIVE -- every wallet mutation
  // writes one of these alongside the wallet_ledger row.
  WALLET_CREDIT: 'wallet.credit',
  WALLET_DEBIT: 'wallet.debit',
  WALLET_TOPUP: 'wallet.topup',
} as const;

export function createAuditEntry(
  action: string,
  entityType: string,
  opts: {
    orgId?: string;
    actorType?: ActorType;
    entityId?: string;
    details?: Record<string, unknown>;
  } = {}
): AuditEntry {
  return {
    orgId: opts.orgId || null,
    actorType: opts.actorType || 'user',
    action,
    entityType,
    entityId: opts.entityId || null,
    details: opts.details || null,
  };
}
