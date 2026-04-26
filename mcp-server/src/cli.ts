#!/usr/bin/env node

/**
 * otp - Traditional CLI for the Organization Transport Protocol
 * For AI agents that use bash (Codex, Copilot, Goose, etc.) or humans.
 *
 * Usage:
 *   otp search "agent escalation"
 *   otp browse --industry healthcare
 *   otp get <oos-id>
 *   otp claims <oos-id>
 *   otp compare <id-a> <id-b>
 *   otp patterns
 *   otp publishers
 *   otp sections
 *   otp publish <file>
 *   otp discover
 *   otp inbox
 *   otp review <rec-id> accept|reject|adapt
 *   otp tickets
 *   otp ticket:create "title" "description"
 *
 * All output is JSON by default (agent-friendly).
 * Add --pretty for human-readable formatting.
 */

const OTP_BASE_URL = process.env.OTP_BASE_URL || "https://orgtp.com";
const OTP_API_KEY = process.env.OTP_API_KEY || "";

// -- HTTP client --

async function otpFetch(path: string, options: RequestInit = {}): Promise<any> {
  const url = `${OTP_BASE_URL}/api/v1${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(OTP_API_KEY ? { Authorization: `Bearer ${OTP_API_KEY}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  const res = await fetch(url, { ...options, headers });
  const body = await res.json();

  if (!res.ok) {
    const errMsg = body?.error?.message || `HTTP ${res.status}`;
    throw new Error(errMsg);
  }

  return body;
}

// -- Arg parsing --

interface Args {
  command: string;
  positional: string[];
  flags: Record<string, string>;
  pretty: boolean;
}

function parseArgs(argv: string[]): Args {
  const raw = argv.slice(2);
  const command = raw[0] || "help";
  const positional: string[] = [];
  const flags: Record<string, string> = {};
  let pretty = false;

  for (let i = 1; i < raw.length; i++) {
    const arg = raw[i];
    if (arg === "--pretty") {
      pretty = true;
    } else if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const val = raw[i + 1] && !raw[i + 1].startsWith("--") ? raw[++i] : "true";
      flags[key] = val;
    } else {
      positional.push(arg);
    }
  }

  return { command, positional, flags, pretty };
}

// -- Output --

function output(data: any, pretty: boolean): void {
  if (pretty) {
    prettyPrint(data);
  } else {
    console.log(JSON.stringify(data));
  }
}

function prettyPrint(data: any): void {
  if (Array.isArray(data)) {
    for (const item of data) {
      if (item.claim_id || item.rule || item.claimText) {
        prettyPrintClaim(item);
      } else {
        prettyPrintItem(item);
      }
      console.log("---");
    }
    console.log(`${data.length} result(s)`);
  } else if (data.results || data.data) {
    prettyPrint(data.results || data.data);
    const total = data.total ?? data.pagination?.total;
    if (total !== undefined) console.log(`Total: ${total}`);
  } else if (data.claims) {
    for (const claim of data.claims) {
      prettyPrintClaim(claim);
      console.log("---");
    }
    console.log(`${data.claims.length} claim(s)`);
  } else if (data.oosFile || data.oos) {
    prettyPrintItem(data.oosFile || data.oos);
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
}

function prettyPrintItem(item: any): void {
  if (!item) return;
  const name = item.org_name || item.orgName || item.name || item.title || item.id || "";
  const industry = item.industry ? ` [${item.industry}]` : "";
  const quality = (item.quality_tier || item.qualityTier) ? ` (${item.quality_tier || item.qualityTier})` : "";
  const isTemplate = item.is_template === true || item.isTemplate === true;
  const templateTag = isTemplate ? " [example]" : "";
  const claimCount = item.claim_count ?? item.claimCount;
  const claims = claimCount !== undefined ? ` - ${claimCount} claims` : "";
  console.log(`${name}${industry}${quality}${templateTag}${claims}`);
  if (item.id) console.log(`  ID: ${item.id}`);
  if (item.template) console.log(`  Template: ${item.template}`);
  if (item.version) console.log(`  Version: ${item.version}`);
  if (item.badge) console.log(`  Badge: ${item.badge}`);
}

function prettyPrintClaim(claim: any): void {
  if (!claim) return;
  const org = claim.org_name || claim.orgName || "";
  const evidence = claim.evidence || claim.evidenceType || claim.evidence_type || "?";
  const header = org
    ? `${org} | [${claim.section || "?"}] ${claim.confidence || "?"} / ${evidence}`
    : `[${claim.section || "?"}] ${claim.confidence || "?"} / ${evidence}`;
  console.log(header);
  console.log(`  Rule: ${claim.rule || claim.claimText || ""}`);
  if (claim.why || claim.reasoning) console.log(`  Why: ${claim.why || claim.reasoning}`);
  if (claim.failure_mode || claim.failureMode) console.log(`  Failure: ${claim.failure_mode || claim.failureMode}`);
  if (claim.claim_id) console.log(`  ID: ${claim.claim_id}`);
}

function die(msg: string): never {
  console.error(`Error: ${msg}`);
  process.exit(1);
}

function requireKey(): void {
  if (!OTP_API_KEY) {
    die("OTP_API_KEY required. Run 'otp-mcp-server init' or set the env var. Get a key at orgtp.com/settings/api");
  }
}

// -- Commands --

async function cmdSearch(args: Args): Promise<any> {
  const q = args.positional[0];
  if (!q) die("Usage: otp search <query> [--industry X] [--confidence HIGH|MEDIUM|LOW]");

  const params = new URLSearchParams({ q });
  if (args.flags.industry) params.set("industry", args.flags.industry);
  if (args.flags.confidence) params.set("confidence", args.flags.confidence);
  if (args.flags.evidence) params.set("evidence", args.flags.evidence);
  if (args.flags.template) params.set("template", args.flags.template);
  if (args.flags.limit) params.set("limit", args.flags.limit);
  if (args.flags.page) params.set("page", args.flags.page);

  return otpFetch(`/search?${params}`);
}

async function cmdBrowse(args: Args): Promise<any> {
  const params = new URLSearchParams();
  if (args.flags.industry) params.set("industry", args.flags.industry);
  if (args.flags.size) params.set("size", args.flags.size);
  if (args.flags.template) params.set("template", args.flags.template);
  if (args.flags.sort) params.set("sort", args.flags.sort);
  if (args.flags.limit) params.set("limit", args.flags.limit);
  if (args.flags.page) params.set("page", args.flags.page);

  return otpFetch(`/browse?${params}`);
}

async function cmdGet(args: Args): Promise<any> {
  const id = args.positional[0];
  if (!id) die("Usage: otp get <oos-id>");
  return otpFetch(`/oos/${id}`);
}

async function cmdClaims(args: Args): Promise<any> {
  const id = args.positional[0];
  if (!id) die("Usage: otp claims <oos-id> [--section X] [--confidence HIGH]");

  const params = new URLSearchParams();
  if (args.flags.section) params.set("section", args.flags.section);
  if (args.flags.confidence) params.set("confidence", args.flags.confidence);
  if (args.flags.evidence) params.set("evidence", args.flags.evidence);

  const qs = params.toString();
  return otpFetch(`/oos/${id}/claims${qs ? `?${qs}` : ""}`);
}

async function cmdCompare(args: Args): Promise<any> {
  const [idA, idB] = args.positional;
  if (!idA || !idB) die("Usage: otp compare <oos-id-a> <oos-id-b>");
  return otpFetch(`/oos/${idA}/compare/${idB}`);
}

async function cmdIntelligence(args: Args): Promise<any> {
  const params = new URLSearchParams();
  if (args.positional[0]) params.set("q", args.positional[0]);
  if (args.flags.industry) params.set("industry", args.flags.industry);
  if (args.flags.section) params.set("section", args.flags.section);
  if (args.flags.confidence) params.set("confidence", args.flags.confidence);
  if (args.flags.evidence) params.set("evidence", args.flags.evidence);
  if (args.flags["min-quality"]) params.set("minQuality", args.flags["min-quality"]);
  if (args.flags.limit) params.set("limit", args.flags.limit);

  return otpFetch(`/intelligence/search?${params}`);
}

async function cmdPatterns(args: Args): Promise<any> {
  const params = new URLSearchParams();
  if (args.flags["min-orgs"]) params.set("minOrgs", args.flags["min-orgs"]);
  if (args.flags.industry) params.set("industry", args.flags.industry);

  return otpFetch(`/intelligence/patterns?${params}`);
}

async function cmdPublishers(args: Args): Promise<any> {
  const params = new URLSearchParams();
  if (args.flags.industry) params.set("industry", args.flags.industry);
  if (args.flags["min-quality"]) params.set("minQuality", args.flags["min-quality"]);
  if (args.flags.template) params.set("template", args.flags.template);
  if (args.flags.limit) params.set("limit", args.flags.limit);

  return otpFetch(`/intelligence/publishers?${params}`);
}

async function cmdSections(): Promise<any> {
  return otpFetch("/intelligence/sections");
}

async function cmdOrg(args: Args): Promise<any> {
  const id = args.positional[0];
  if (!id) die("Usage: otp org <org-id>");
  return otpFetch(`/org/${id}`);
}

async function cmdPublish(args: Args): Promise<any> {
  requireKey();
  const file = args.positional[0];
  const template = args.flags.template || "agent_army";
  if (!file) die("Usage: otp publish <file.md> [--template agent_army|value_chain|org_chart]");

  const { readFileSync } = await import("fs");
  let content: string;
  try {
    content = readFileSync(file, "utf-8");
  } catch {
    die(`Cannot read file: ${file}`);
  }

  // Create draft
  const draft = await otpFetch("/oos", {
    method: "POST",
    body: JSON.stringify({ rawContent: content, template }),
  });

  // Publish
  const published = await otpFetch(`/oos/${draft.oosFile.id}/publish`, {
    method: "POST",
  });

  return {
    status: "published",
    oos_id: draft.oosFile.id,
    version: draft.oosFile.version,
    claim_count: draft.claimCount,
    quality_tier: published.qualityTier,
    quality_score: published.qualityScore,
    url: `${OTP_BASE_URL}/oos/${draft.oosFile.id}`,
  };
}

async function cmdDiscover(args: Args): Promise<any> {
  requireKey();
  const limit = args.flags.limit ? parseInt(args.flags.limit, 10) : 20;
  return otpFetch("/recommendations/discover", {
    method: "POST",
    body: JSON.stringify({ limit }),
  });
}

async function cmdInbox(args: Args): Promise<any> {
  requireKey();
  const params = new URLSearchParams();
  if (args.flags.status) params.set("status", args.flags.status);
  if (args.flags.section) params.set("section", args.flags.section);
  if (args.flags.limit) params.set("limit", args.flags.limit);

  const qs = params.toString();
  return otpFetch(`/recommendations${qs ? `?${qs}` : ""}`);
}

async function cmdInboxStats(): Promise<any> {
  requireKey();
  return otpFetch("/recommendations/stats");
}

async function cmdReview(args: Args): Promise<any> {
  requireKey();
  const [id, action] = args.positional;
  if (!id || !action) die("Usage: otp review <recommendation-id> accept|reject|adapt [--notes '...']");
  if (!["accept", "reject", "adapt"].includes(action)) die("Action must be: accept, reject, or adapt");

  return otpFetch(`/recommendations/${id}/review`, {
    method: "POST",
    body: JSON.stringify({
      action,
      notes: args.flags.notes,
      adapted_rule: args.flags["adapted-rule"],
      adapted_why: args.flags["adapted-why"],
    }),
  });
}

async function cmdTickets(args: Args): Promise<any> {
  const params = new URLSearchParams();
  if (args.flags.status) params.set("status", args.flags.status);
  if (args.flags.category) params.set("category", args.flags.category);
  if (args.flags.limit) params.set("limit", args.flags.limit);

  return otpFetch(`/tickets?${params}`);
}

async function cmdTicketCreate(args: Args): Promise<any> {
  const [title, description] = args.positional;
  if (!title || !description) die('Usage: otp ticket:create "title" "description" [--category bug|feature|question] [--priority low|medium|high|critical]');

  return otpFetch("/tickets", {
    method: "POST",
    body: JSON.stringify({
      title,
      description,
      category: args.flags.category || "bug",
      priority: args.flags.priority || "medium",
      reporterEmail: args.flags.email,
    }),
  });
}

async function cmdDashboard(args: Args): Promise<any> {
  requireKey();
  const id = args.positional[0];
  if (!id) die("Usage: otp dashboard <oos-id>");
  return otpFetch(`/oos/${id}/dashboard`);
}

// -- Help --

function showHelp(): void {
  console.log(`
otp - Organization Transport Protocol CLI

USAGE
  otp <command> [args] [--flags]

COMMANDS (public, no API key needed)
  search <query>            Search across all published claims
  browse                    Browse published OOS files
  intelligence [query]      Deep faceted intelligence search
  get <oos-id>              Get a specific OOS file
  claims <oos-id>           Get claims from an OOS file
  compare <id-a> <id-b>     Diff two OOS files
  patterns                  Cross-org coordination patterns
  publishers                Browse publishers with reputation data
  sections                  List all claim sections
  org <org-id>              Get an organization's profile

COMMANDS (require OTP_API_KEY)
  publish <file.md>         Publish an OOS file to OTP
  discover                  Run the Scout for recommendations
  inbox                     View your intelligence inbox
  inbox:stats               Inbox summary statistics
  review <id> <action>      Review a recommendation (accept/reject/adapt)
  dashboard <oos-id>        Your publisher dashboard
  tickets                   List tickets
  ticket:create "t" "d"     Create a ticket

FLAGS
  --pretty                  Human-readable output (default: JSON)
  --industry <name>         Filter by industry
  --confidence HIGH|MEDIUM|LOW
  --evidence <type>         Filter by evidence type
  --template <type>         agent_army | value_chain | org_chart
  --section <name>          Filter by claim section
  --limit <n>               Results per page
  --page <n>                Page number

SETUP
  otp-mcp-server init       Interactive setup for MCP-compatible AI platforms
  export OTP_API_KEY=otp_...  Set your API key for CLI usage

EXAMPLES
  otp search "shared state coordination"
  otp browse --industry digital_marketing --pretty
  otp claims abc-123 --section failure_patterns
  otp compare abc-123 def-456 --pretty
  otp publish ./our-oos.md --template agent_army
  otp discover --limit 10

More info: https://orgtp.com
`);
}

// -- Router --

const COMMANDS: Record<string, (args: Args) => Promise<any>> = {
  search: cmdSearch,
  browse: cmdBrowse,
  intelligence: cmdIntelligence,
  get: cmdGet,
  claims: cmdClaims,
  compare: cmdCompare,
  patterns: cmdPatterns,
  publishers: cmdPublishers,
  sections: cmdSections,
  org: cmdOrg,
  publish: cmdPublish,
  discover: cmdDiscover,
  inbox: cmdInbox,
  "inbox:stats": cmdInboxStats,
  review: cmdReview,
  dashboard: cmdDashboard,
  tickets: cmdTickets,
  "ticket:create": cmdTicketCreate,
};

async function main() {
  const args = parseArgs(process.argv);

  if (args.command === "help" || args.command === "--help" || args.command === "-h") {
    showHelp();
    process.exit(0);
  }

  if (args.command === "version" || args.command === "--version" || args.command === "-v") {
    console.log("otp 0.2.0");
    process.exit(0);
  }

  const handler = COMMANDS[args.command];
  if (!handler) {
    console.error(`Unknown command: ${args.command}`);
    console.error("Run 'otp help' for usage.");
    process.exit(1);
  }

  try {
    const result = await handler(args);
    output(result, args.pretty);
  } catch (err: any) {
    if (args.pretty) {
      console.error(`Error: ${err.message}`);
    } else {
      console.log(JSON.stringify({ error: err.message }));
    }
    process.exit(1);
  }
}

main();
