// Demo-presenter scoped access.
//
// A small allow-list of trusted non-admins (e.g. Dawson, who runs sales demos)
// may "view as" the canned demo orgs (Acme Corp) WITHOUT being granted full
// super-admin. The scope is deliberately tight: a demo presenter can only ever
// land in a demo org -- never a real customer org. The gate is enforced in two
// places that must agree:
//   1. issue point  -- /admin/view-as/:email (who may start the impersonation)
//   2. apply point  -- middleware/guards.ts  (which cookie may be applied)
//
// Keep this list short and obvious. Anyone who needs to see real customer data
// gets super-admin via super-admin.ts, not an entry here.

const DEMO_PRESENTER_EMAILS = new Set<string>([
  'dawson@juicedboxes.com',
]);

const DEMO_TARGET_ORG_CLERK_IDS = new Set<string>([
  'demo_acme',
]);

export function isDemoPresenterEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return DEMO_PRESENTER_EMAILS.has(email.trim().toLowerCase());
}

export function isDemoTargetOrg(clerkOrgId: string | null | undefined): boolean {
  if (!clerkOrgId) return false;
  return DEMO_TARGET_ORG_CLERK_IDS.has(clerkOrgId);
}
