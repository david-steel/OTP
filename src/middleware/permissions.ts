/**
 * Pure permission functions over the Ninety-style role hierarchy.
 *
 * No DB, no Fastify, no side effects. Each function takes a Role (or
 * Role | null for "may not be a member") and returns a boolean. Use these
 * to compose route guards, button-disabled states, and access checks.
 *
 * Semantics mirror Ninety.io's role descriptions:
 *   owner       full access + can delete the company account
 *   admin       full access except delete
 *   manager     view+edit assigned teams; can invite + create teams
 *   managee     view+edit assigned teams; cannot invite or create
 *   inactive    on accountability chart only; no app access
 *   observer    view-only on assigned teams; cannot own rocks/issues/todos
 *   implementer view+edit entire company; cannot own rocks/issues/todos
 *   free        free-tier seat (placeholder)
 *   member      legacy synonym for managee (deprecated; treat as managee)
 */
import type { Role } from '../services/membership.js';

const ALL_FULL_ACCESS: Role[] = ['owner', 'admin', 'visionary', 'integrator'];
const CAN_INVITE: Role[] = ['owner', 'admin', 'manager', 'visionary', 'integrator'];
const CAN_CREATE_TEAMS: Role[] = ['owner', 'admin', 'manager', 'visionary', 'integrator'];
const CAN_VIEW_APP: Role[] = [
  'owner', 'admin', 'manager', 'managee',
  'observer', 'implementer', 'visionary', 'integrator',
  'free', 'member',
];
const CANNOT_OWN_ITEMS: Role[] = ['observer', 'implementer', 'inactive'];
// EOS Integrator runs the L10 and approves headlines + overrides rock status.
const CAN_INTEGRATE: Role[] = ['owner', 'admin', 'integrator', 'implementer'];

function has(role: Role | null | undefined, allowed: Role[]): boolean {
  return !!role && allowed.includes(role);
}

// ---------- Org-level capabilities ----------

export function canDeleteOrg(role: Role | null | undefined): boolean {
  return role === 'owner';
}

export function canEditOrgSettings(role: Role | null | undefined): boolean {
  return has(role, ALL_FULL_ACCESS) || role === 'implementer';
}

/**
 * Whether this role can act as the EOS Integrator on the dashboard:
 * mark headlines as read, override a Rock's on/off-track status,
 * close issues, and finalize cascading messages.
 */
export function canIntegrate(role: Role | null | undefined): boolean {
  return has(role, CAN_INTEGRATE);
}

export function canInviteMembers(role: Role | null | undefined): boolean {
  return has(role, CAN_INVITE);
}

export function canCreateTeams(role: Role | null | undefined): boolean {
  return has(role, CAN_CREATE_TEAMS);
}

// ---------- Item-level capabilities ----------

/**
 * Whether this role can be assigned ownership of Rocks, Issues, and Todos.
 * Observers, Implementers, and Inactive cannot. Per Ninety: "Cannot own
 * Rocks, Issues, or To-Dos" applies to observer + implementer + inactive.
 */
export function canOwnRocksIssuesTodos(role: Role | null | undefined): boolean {
  if (!role) return false;
  return !CANNOT_OWN_ITEMS.includes(role);
}

// ---------- Access scope ----------

/**
 * Whether this role can use the application at all (vs being on the chart
 * only). Inactive members appear on the org chart but cannot sign in to
 * features.
 */
export function canAccessApp(role: Role | null | undefined): boolean {
  return has(role, CAN_VIEW_APP);
}

/**
 * Whether this role sees the entire company without team-level scoping.
 * Owners, admins, and implementers see everything. Managers and managees
 * are gated to their assigned teams.
 */
export function hasOrgWideView(role: Role | null | undefined): boolean {
  return role === 'owner' || role === 'admin' || role === 'implementer'
      || role === 'visionary' || role === 'integrator';
}

/**
 * Whether this role's editing is gated to assigned teams (vs org-wide).
 * Manager/managee/observer all need team membership to act on items.
 */
export function isTeamScoped(role: Role | null | undefined): boolean {
  if (!role) return true;
  return !hasOrgWideView(role);
}

// ---------- View vs edit ----------

/**
 * Whether this role can edit items they have access to (vs view only).
 * Observer is the only "view but cannot edit" role.
 */
export function canEditAssignedItems(role: Role | null | undefined): boolean {
  if (!role || role === 'observer' || role === 'inactive') return false;
  return canAccessApp(role);
}

// ---------- Bundle ----------

/**
 * Compute a full capability bundle for a role -- handy for templates that
 * need many flags at once.
 */
export interface RoleCapabilities {
  canAccessApp: boolean;
  canEditOrgSettings: boolean;
  canDeleteOrg: boolean;
  canInviteMembers: boolean;
  canCreateTeams: boolean;
  canOwnItems: boolean;
  canEditAssignedItems: boolean;
  hasOrgWideView: boolean;
  isTeamScoped: boolean;
  canIntegrate: boolean;
}

export function capabilitiesFor(role: Role | null | undefined): RoleCapabilities {
  return {
    canAccessApp: canAccessApp(role),
    canEditOrgSettings: canEditOrgSettings(role),
    canDeleteOrg: canDeleteOrg(role),
    canInviteMembers: canInviteMembers(role),
    canCreateTeams: canCreateTeams(role),
    canOwnItems: canOwnRocksIssuesTodos(role),
    canEditAssignedItems: canEditAssignedItems(role),
    hasOrgWideView: hasOrgWideView(role),
    isTeamScoped: isTeamScoped(role),
    canIntegrate: canIntegrate(role),
  };
}
