/**
 * otp-tools.ts -- the CANONICAL Remote MCP tool registry for OTP.
 *
 * These are the same 38 tools the standalone npm package (mcp-server/src/index.ts)
 * exposes over stdio, but transport-agnostic: the per-request auth + base URL are
 * injected via OtpToolContext instead of read from process.env. The HTTP endpoint
 * (src/routes/api/mcp.ts) builds a fresh McpServer per connection, registers these,
 * and connects a StreamableHTTPServerTransport.
 *
 * SINGLE SOURCE OF TRUTH for the HOSTED endpoint. The standalone npm package keeps
 * its own copy because it ships independently and is NOT in the prod Docker image
 * (the Dockerfile only copies the main app's dist). otp-tools.parity.test.ts asserts
 * the two tool-name sets stay identical so they can't silently drift.
 *
 * To keep the 38 tool bodies byte-identical to the stdio server, they reference
 * bare `otpFetch`, `OTP_API_KEY`, and `OTP_BASE_URL`; we destructure those from the
 * context at the top of registerOtpTools so the bodies need no edits when ported.
 */
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export type OtpFetch = (path: string, options?: RequestInit) => Promise<any>;

export interface OtpToolContext {
  /** Per-request HTTP client bound to this connection's token + base URL. */
  otpFetch: OtpFetch;
  /** Truthy on an authenticated connection; the publish/write tools guard on it. */
  OTP_API_KEY: string;
  /** Public base URL for shareable links in tool output (e.g. https://orgtp.com). */
  OTP_BASE_URL: string;
}

/**
 * Build an otpFetch bound to a base URL + optional bearer token. Mirrors the
 * stdio server's client exactly so tool behavior is identical across transports.
 */
export function makeOtpFetch(opts: { baseUrl: string; apiKey?: string }): OtpFetch {
  return async (path: string, options: RequestInit = {}): Promise<any> => {
    const url = `${opts.baseUrl}/api/v1${path}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(opts.apiKey ? { Authorization: `Bearer ${opts.apiKey}` } : {}),
      ...((options.headers as Record<string, string>) || {}),
    };
    const res = await fetch(url, { ...options, headers });
    const body: any = await res.json();
    if (!res.ok) {
      const errMsg = body?.error?.message || `HTTP ${res.status}`;
      throw new Error(`OTP API error: ${errMsg}`);
    }
    return body;
  };
}

/** Register all OTP tools on an McpServer, bound to a per-request context. */
export function registerOtpTools(server: McpServer, ctx: OtpToolContext): void {
  const { otpFetch, OTP_API_KEY, OTP_BASE_URL } = ctx;

// ============================================================
// TOOL: browse_oos
// Browse published OOS files on the OTP platform
// ============================================================
server.tool(
  "browse_oos",
  "Browse published Organizational Operating Systems on OTP. Filter by industry, org size, template type, or quality tier. Returns a list of published OOS files with org metadata.",
  {
    industry: z.string().optional().describe("Filter by industry (e.g. 'digital_marketing', 'saas', 'healthcare')"),
    size: z.enum(["solo", "small", "medium", "large", "enterprise"]).optional().describe("Filter by organization size"),
    template: z.enum(["agent_army", "value_chain", "org_chart"]).optional().describe("Filter by OOS template type"),
    sort: z.enum(["newest", "claims", "quality"]).optional().describe("Sort order: newest (default), claims count, or quality tier"),
    page: z.number().optional().describe("Page number (default 1)"),
    limit: z.number().optional().describe("Results per page (default 20, max 100)"),
  },
  async (params) => {
    const query = new URLSearchParams();
    if (params.industry) query.set("industry", params.industry);
    if (params.size) query.set("size", params.size);
    if (params.template) query.set("template", params.template);
    if (params.sort) query.set("sort", params.sort);
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));

    const result = await otpFetch(`/browse?${query}`);
    return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
  }
);

// ============================================================
// TOOL: search_claims
// Full-text search across all published claims
// ============================================================
server.tool(
  "search_claims",
  "Search across all published OOS claims on OTP. Use natural language queries to find coordination patterns, failure modes, agent rules, and operational intelligence from other organizations.",
  {
    q: z.string().describe("Search query (e.g. 'shared state file coordination', 'agent escalation failure')"),
    industry: z.string().optional().describe("Filter by industry"),
    confidence: z.enum(["HIGH", "MEDIUM", "LOW"]).optional().describe("Filter by confidence level"),
    evidence: z.enum([
      "HUMAN_DEFINED_RULE", "OBSERVED_ONCE", "OBSERVED_REPEATEDLY",
      "MEASURED_RESULT", "INFERENCE", "SPECULATION"
    ]).optional().describe("Filter by evidence type"),
    template: z.enum(["agent_army", "value_chain", "org_chart"]).optional().describe("Filter by template"),
    page: z.number().optional().describe("Page number"),
    limit: z.number().optional().describe("Results per page (max 100)"),
  },
  async (params) => {
    const query = new URLSearchParams({ q: params.q });
    if (params.industry) query.set("industry", params.industry);
    if (params.confidence) query.set("confidence", params.confidence);
    if (params.evidence) query.set("evidence", params.evidence);
    if (params.template) query.set("template", params.template);
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));

    const result = await otpFetch(`/search?${query}`);
    return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
  }
);

// ============================================================
// TOOL: get_oos
// Get a specific OOS file by ID
// ============================================================
server.tool(
  "get_oos",
  "Get a specific published OOS file by its ID, including organization metadata and file details.",
  {
    id: z.string().uuid().describe("The OOS file ID"),
  },
  async (params) => {
    const result = await otpFetch(`/oos/${params.id}`);
    return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
  }
);

// ============================================================
// TOOL: get_claims
// Get claims for a specific OOS file with optional filtering
// ============================================================
server.tool(
  "get_claims",
  "Get all claims from a specific OOS file. Each claim contains a rule, reasoning (why), failure mode, confidence level, and evidence type. Filter by section, confidence, or evidence type.",
  {
    oos_id: z.string().uuid().describe("The OOS file ID to get claims from"),
    section: z.string().optional().describe("Filter by section (e.g. 'core_operating_rules', 'failure_patterns', 'coordination_patterns', 'operational_heuristics', 'human_ai_boundary_conditions')"),
    confidence: z.enum(["HIGH", "MEDIUM", "LOW"]).optional().describe("Filter by confidence level"),
    evidence: z.enum([
      "HUMAN_DEFINED_RULE", "OBSERVED_ONCE", "OBSERVED_REPEATEDLY",
      "MEASURED_RESULT", "INFERENCE", "SPECULATION"
    ]).optional().describe("Filter by evidence type"),
  },
  async (params) => {
    const query = new URLSearchParams();
    if (params.section) query.set("section", params.section);
    if (params.confidence) query.set("confidence", params.confidence);
    if (params.evidence) query.set("evidence", params.evidence);

    const qs = query.toString();
    const result = await otpFetch(`/oos/${params.oos_id}/claims${qs ? `?${qs}` : ""}`);
    return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
  }
);

// ============================================================
// TOOL: compare_oos
// Diff two OOS files to find unique and shared claims
// ============================================================
server.tool(
  "compare_oos",
  "Compare two published OOS files side-by-side. Returns claims unique to each, similar claims, and duplicates. Great for learning what other organizations do differently.",
  {
    oos_id_a: z.string().uuid().describe("First OOS file ID (typically yours)"),
    oos_id_b: z.string().uuid().describe("Second OOS file ID (the one to compare against)"),
  },
  async (params) => {
    const result = await otpFetch(`/oos/${params.oos_id_a}/compare/${params.oos_id_b}`);
    return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
  }
);

// ============================================================
// TOOL: search_intelligence
// Deep intelligence search with faceted filtering
// ============================================================
server.tool(
  "search_intelligence",
  "Deep search across the OTP intelligence base with faceted filtering. Returns claims grouped by section, industry, confidence, and evidence type. More powerful than search_claims.",
  {
    q: z.string().optional().describe("Search query"),
    industry: z.string().optional().describe("Filter by industry"),
    section: z.string().optional().describe("Filter by claim section"),
    confidence: z.enum(["HIGH", "MEDIUM", "LOW"]).optional().describe("Filter by confidence"),
    evidence: z.enum([
      "HUMAN_DEFINED_RULE", "OBSERVED_ONCE", "OBSERVED_REPEATEDLY",
      "MEASURED_RESULT", "INFERENCE", "SPECULATION"
    ]).optional().describe("Filter by evidence type"),
    min_quality: z.enum(["platinum", "gold", "silver", "bronze"]).optional().describe("Minimum publisher quality tier"),
    page: z.number().optional().describe("Page number"),
    limit: z.number().optional().describe("Results per page"),
  },
  async (params) => {
    const query = new URLSearchParams();
    if (params.q) query.set("q", params.q);
    if (params.industry) query.set("industry", params.industry);
    if (params.section) query.set("section", params.section);
    if (params.confidence) query.set("confidence", params.confidence);
    if (params.evidence) query.set("evidence", params.evidence);
    if (params.min_quality) query.set("minQuality", params.min_quality);
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));

    const result = await otpFetch(`/intelligence/search?${query}`);
    return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
  }
);

// ============================================================
// TOOL: get_publishers
// Browse publishers with reputation data
// ============================================================
server.tool(
  "get_publishers",
  "Browse organizations that have published OOS files on OTP. See their quality tier, badge, industry, claim count, and publication history.",
  {
    industry: z.string().optional().describe("Filter by industry"),
    min_quality: z.enum(["platinum", "gold", "silver", "bronze"]).optional().describe("Minimum quality tier"),
    template: z.enum(["agent_army", "value_chain", "org_chart"]).optional().describe("Filter by template type"),
    page: z.number().optional().describe("Page number"),
    limit: z.number().optional().describe("Results per page"),
  },
  async (params) => {
    const query = new URLSearchParams();
    if (params.industry) query.set("industry", params.industry);
    if (params.min_quality) query.set("minQuality", params.min_quality);
    if (params.template) query.set("template", params.template);
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));

    const result = await otpFetch(`/intelligence/publishers?${query}`);
    return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
  }
);

// ============================================================
// TOOL: get_org
// Get a specific organization's public profile
// ============================================================
server.tool(
  "get_org",
  "Get a specific organization's public profile on OTP, including their published OOS files, quality tier, badge, and stats.",
  {
    org_id: z.string().uuid().describe("The organization ID"),
  },
  async (params) => {
    const result = await otpFetch(`/org/${params.org_id}`);
    return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
  }
);

// ============================================================
// TOOL: get_patterns
// Cross-organization coordination patterns
// ============================================================
server.tool(
  "get_patterns",
  "Discover coordination patterns that appear across multiple organizations. Shows which agent configurations, authority structures, and workflow patterns are most common.",
  {
    min_orgs: z.number().optional().describe("Minimum number of organizations a pattern must appear in (default 2)"),
    industry: z.string().optional().describe("Filter patterns by industry"),
  },
  async (params) => {
    const query = new URLSearchParams();
    if (params.min_orgs) query.set("minOrgs", String(params.min_orgs));
    if (params.industry) query.set("industry", params.industry);

    const result = await otpFetch(`/intelligence/patterns?${query}`);
    return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
  }
);

// ============================================================
// TOOL: get_sections
// List all available claim sections
// ============================================================
server.tool(
  "get_sections",
  "List all claim sections available on OTP with counts. Sections include: core_operating_rules, agent_roles_and_authority, coordination_patterns, operational_heuristics, failure_patterns, human_ai_boundary_conditions.",
  {},
  async () => {
    const result = await otpFetch("/intelligence/sections");
    return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
  }
);

// ============================================================
// TOOL: publish_oos
// Publish an OOS file to OTP (requires API key)
// ============================================================
server.tool(
  "publish_oos",
  "Publish an Organizational Operating System file to OTP. Requires an API key. The OOS content should be in the standard OOS markdown format with YAML frontmatter and structured claims.",
  {
    raw_content: z.string().describe("The full OOS file content in markdown format with YAML frontmatter"),
    template: z.enum(["agent_army", "value_chain", "org_chart"]).describe("The OOS template type"),
  },
  async (params) => {
    if (!OTP_API_KEY) {
      return {
        content: [{
          type: "text" as const,
          text: "Error: OTP_API_KEY environment variable is required to publish. Get your API key at https://orgtp.com/settings/api",
        }],
      };
    }

    // Step 1: Create draft
    const draft = await otpFetch("/oos", {
      method: "POST",
      body: JSON.stringify({
        rawContent: params.raw_content,
        template: params.template,
      }),
    });

    // Step 2: Publish
    const published = await otpFetch(`/oos/${draft.oosFile.id}/publish`, {
      method: "POST",
    });

    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({
          status: "published",
          oos_id: draft.oosFile.id,
          version: draft.oosFile.version,
          claim_count: draft.claimCount,
          quality_tier: published.qualityTier,
          quality_score: published.qualityScore,
          similarities_found: published.similaritiesFound,
          url: `${OTP_BASE_URL}/oos/${draft.oosFile.id}`,
        }, null, 2),
      }],
    };
  }
);

// ============================================================
// TOOL: my_dashboard
// Get your organization's publisher dashboard (requires API key)
// ============================================================
server.tool(
  "my_dashboard",
  "Get your organization's OTP publisher dashboard. Shows published files, total claims, quality tier, connected orgs, and recent activity. Requires API key.",
  {
    oos_id: z.string().uuid().describe("Your latest OOS file ID"),
  },
  async (params) => {
    if (!OTP_API_KEY) {
      return {
        content: [{
          type: "text" as const,
          text: "Error: OTP_API_KEY environment variable is required. Get your API key at https://orgtp.com/settings/api",
        }],
      };
    }

    const result = await otpFetch(`/oos/${params.oos_id}/dashboard`);
    return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
  }
);

// ============================================================
// TOOL: discover_intelligence
// Run the OTP Scout to find relevant claims from other orgs
// ============================================================
server.tool(
  "discover_intelligence",
  "Run the OTP Scout to discover relevant coordination intelligence from other organizations. Analyzes gaps in your OOS and finds high-quality claims you might want to adopt. Requires API key.",
  {
    limit: z.number().optional().describe("Maximum number of recommendations to discover (default 20)"),
  },
  async (params) => {
    if (!OTP_API_KEY) {
      return {
        content: [{
          type: "text" as const,
          text: "Error: OTP_API_KEY environment variable is required to discover intelligence. Get your API key at https://orgtp.com/settings/api",
        }],
      };
    }

    const result = await otpFetch("/recommendations/discover", {
      method: "POST",
      body: JSON.stringify({ limit: params.limit }),
    });
    return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
  }
);

// ============================================================
// TOOL: get_inbox
// View your intelligence inbox
// ============================================================
server.tool(
  "get_inbox",
  "View your intelligence inbox -- recommendations discovered by the Scout. Filter by status (pending, accepted, rejected, adapted) or section. Requires API key.",
  {
    status: z.enum(["pending", "accepted", "rejected", "adapted"]).optional().describe("Filter by recommendation status (default: pending)"),
    section: z.string().optional().describe("Filter by claim section (e.g. 'failure_patterns', 'coordination_patterns')"),
    limit: z.number().optional().describe("Results per page (default 20, max 100)"),
    offset: z.number().optional().describe("Offset for pagination (default 0)"),
  },
  async (params) => {
    if (!OTP_API_KEY) {
      return {
        content: [{
          type: "text" as const,
          text: "Error: OTP_API_KEY environment variable is required. Get your API key at https://orgtp.com/settings/api",
        }],
      };
    }

    const query = new URLSearchParams();
    if (params.status) query.set("status", params.status);
    if (params.section) query.set("section", params.section);
    if (params.limit) query.set("limit", String(params.limit));
    if (params.offset) query.set("offset", String(params.offset));

    const qs = query.toString();
    const result = await otpFetch(`/recommendations${qs ? `?${qs}` : ""}`);
    return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
  }
);

// ============================================================
// TOOL: review_recommendation
// Accept, reject, or adapt a recommendation
// ============================================================
server.tool(
  "review_recommendation",
  "Review a recommendation from your inbox. Accept to adopt as-is, reject to dismiss, or adapt to modify the claim for your organization's context. Requires API key.",
  {
    id: z.string().uuid().describe("The recommendation ID to review"),
    action: z.enum(["accept", "reject", "adapt"]).describe("Action to take: accept, reject, or adapt"),
    notes: z.string().optional().describe("Optional review notes explaining your decision"),
    adapted_rule: z.string().optional().describe("Modified rule text (required when action is 'adapt')"),
    adapted_why: z.string().optional().describe("Modified reasoning text (optional when action is 'adapt')"),
  },
  async (params) => {
    if (!OTP_API_KEY) {
      return {
        content: [{
          type: "text" as const,
          text: "Error: OTP_API_KEY environment variable is required. Get your API key at https://orgtp.com/settings/api",
        }],
      };
    }

    const result = await otpFetch(`/recommendations/${params.id}/review`, {
      method: "POST",
      body: JSON.stringify({
        action: params.action,
        notes: params.notes,
        adapted_rule: params.adapted_rule,
        adapted_why: params.adapted_why,
      }),
    });
    return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
  }
);

// ============================================================
// TOOL: get_inbox_stats
// Get a summary of your intelligence inbox
// ============================================================
server.tool(
  "get_inbox_stats",
  "Get a summary of your intelligence inbox -- how many recommendations are pending, accepted, rejected, and adapted. Shows top sections and average relevance score. Requires API key.",
  {},
  async () => {
    if (!OTP_API_KEY) {
      return {
        content: [{
          type: "text" as const,
          text: "Error: OTP_API_KEY environment variable is required. Get your API key at https://orgtp.com/settings/api",
        }],
      };
    }

    const result = await otpFetch("/recommendations/stats");
    return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
  }
);

// ============================================================
// TOOL: get_best_practices
// Browse and search the best practices library
// ============================================================
server.tool(
  "get_best_practices",
  "Browse OTP's best practices library -- 1,500+ actionable rules from 9 publishers (Google, AWS, Deloitte, Accenture, etc.). Search by keyword, filter by category or publisher. Each practice is a prescriptive rule with why and failure mode. Requires API key.",
  {
    q: z.string().optional().describe("Search query (e.g. 'prompt engineering', 'data governance', 'agent coordination')"),
    category: z.string().optional().describe("Filter by category (e.g. 'Machine Learning', 'MLOps', 'AI Strategy', 'Prompt Engineering', 'AI Governance')"),
    publisher: z.string().optional().describe("Filter by publisher profile ID"),
    limit: z.number().optional().describe("Results per page (default 50, max 200)"),
    page: z.number().optional().describe("Page number (default 1)"),
  },
  async (params) => {
    if (!OTP_API_KEY) {
      return { content: [{ type: "text" as const, text: "Error: OTP_API_KEY required. Get yours at https://orgtp.com/settings/api" }] };
    }
    const query = new URLSearchParams();
    if (params.q) query.set("q", params.q);
    if (params.category) query.set("category", params.category);
    if (params.publisher) query.set("publisher", params.publisher);
    if (params.limit) query.set("limit", String(params.limit));
    if (params.page) query.set("page", String(params.page));

    const result = await otpFetch(`/best-practices?${query}`);
    return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
  }
);

// ============================================================
// TOOL: get_my_rules
// Get your OOS claims + matched best practices as agent-ready rules
// ============================================================
server.tool(
  "get_my_rules",
  "Get your organization's operational rules from OTP -- your published OOS claims PLUS matched best practices from the library. Returns rules in a format agents can directly use for coordination. This is the bridge between OTP and your agent army. Requires API key.",
  {
    include_best_practices: z.boolean().optional().describe("Include matched best practices alongside OOS claims (default true)"),
    section: z.string().optional().describe("Filter by section (e.g. 'core_operating_rules', 'coordination_patterns')"),
    min_confidence: z.enum(["HIGH", "MEDIUM", "LOW"]).optional().describe("Minimum confidence level (default: all)"),
  },
  async (params) => {
    if (!OTP_API_KEY) {
      return { content: [{ type: "text" as const, text: "Error: OTP_API_KEY required. Get yours at https://orgtp.com/settings/api" }] };
    }

    // Get the user's latest published OOS
    const mineResult = await otpFetch("/oos/mine");
    if (!mineResult.oosFile) {
      return { content: [{ type: "text" as const, text: "No published OOS found. Publish one at https://orgtp.com/publish" }] };
    }
    const latestOos = mineResult.oosFile;
    const dashboard = { org: mineResult.org };

    // Get claims
    const claimQuery = new URLSearchParams();
    if (params.section) claimQuery.set("section", params.section);
    if (params.min_confidence) claimQuery.set("confidence", params.min_confidence);
    const claimQs = claimQuery.toString();
    const claims = await otpFetch(`/oos/${latestOos.id}/claims${claimQs ? `?${claimQs}` : ""}`);

    // Get matched best practices
    let bestPractices: any[] = [];
    if (params.include_best_practices !== false) {
      try {
        const bpResult = await otpFetch(`/best-practices/for-oos/${latestOos.id}?min_score=0.05`);
        bestPractices = bpResult.matches || [];
      } catch {
        // Best practices matching may not be computed yet
      }
    }

    // Format as agent-ready rules
    const rules: any[] = [];

    // OOS claims first
    if (claims.claims) {
      for (const claim of claims.claims) {
        rules.push({
          source: "oos",
          id: claim.claimId,
          section: claim.section,
          rule: claim.rule,
          why: claim.why,
          failure_mode: claim.failureMode,
          confidence: claim.confidence,
          evidence: claim.evidence,
          scope: claim.scope,
        });
      }
    }

    // Best practices
    for (const bp of bestPractices) {
      rules.push({
        source: "best_practice",
        id: bp.slug,
        section: "best_practices",
        rule: bp.term + ": " + bp.definition?.split("\n")[0],
        why: bp.definition?.match(/Why: (.*)/)?.[1] || "Matched from OTP best practices library",
        failure_mode: bp.definition?.match(/Failure mode: (.*)/)?.[1] || "Not following this practice may create operational gaps",
        confidence: "MEDIUM",
        evidence: "INFERENCE",
        scope: "organization-wide",
        relevance_score: bp.relevanceScore,
        publisher: bp.publisherName || "OTP Library",
      });
    }

    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({
          org: dashboard.org.name,
          oos_version: latestOos.version,
          oos_id: latestOos.id,
          total_rules: rules.length,
          oos_claims: rules.filter(r => r.source === "oos").length,
          best_practices: rules.filter(r => r.source === "best_practice").length,
          rules,
        }, null, 2),
      }],
    };
  }
);

// ============================================================
// TOOL: sync_rules_to_file
// Export your OTP rules to a local file for agent consumption
// ============================================================
server.tool(
  "sync_rules_to_file",
  "Export your OTP rules (OOS claims + matched best practices) to a local markdown file that agents can read at startup. This bridges OTP intelligence into your local agent army. Requires API key.",
  {
    output_path: z.string().optional().describe("File path to write rules to (default: ~/.claude/otp-rules.md)"),
    include_best_practices: z.boolean().optional().describe("Include matched best practices (default true)"),
  },
  async (params) => {
    if (!OTP_API_KEY) {
      return { content: [{ type: "text" as const, text: "Error: OTP_API_KEY required." }] };
    }

    // Get the user's org and latest OOS
    const dashboard = await otpFetch("/auth/me");
    if (!dashboard.org) {
      return { content: [{ type: "text" as const, text: "No organization found." }] };
    }

    const browseResult = await otpFetch(`/browse?orgId=${dashboard.org.id}&limit=1`);
    const latestOos = browseResult.oosFiles?.[0];
    if (!latestOos) {
      return { content: [{ type: "text" as const, text: "No published OOS found." }] };
    }

    const claims = await otpFetch(`/oos/${latestOos.id}/claims`);

    let bestPractices: any[] = [];
    if (params.include_best_practices !== false) {
      try {
        const bpResult = await otpFetch(`/best-practices/for-oos/${latestOos.id}?min_score=0.05`);
        bestPractices = bpResult.matches || [];
      } catch { /* best practices are an optional enrichment -- ignore failures */ }
    }

    // Build markdown
    const lines: string[] = [
      `# OTP Rules for ${dashboard.org.name}`,
      `> Auto-synced from orgtp.com | OOS v${latestOos.version} | ${new Date().toISOString().split("T")[0]}`,
      `> ${claims.claims?.length || 0} OOS claims + ${bestPractices.length} matched best practices`,
      "",
      "## OOS Claims",
      "",
    ];

    const sections: Record<string, any[]> = {};
    for (const claim of claims.claims || []) {
      if (!sections[claim.section]) sections[claim.section] = [];
      sections[claim.section].push(claim);
    }

    for (const [section, sectionClaims] of Object.entries(sections)) {
      lines.push(`### ${section.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}`);
      lines.push("");
      for (const claim of sectionClaims) {
        lines.push(`**${claim.claimId}** [${claim.confidence}/${claim.evidence}]`);
        lines.push(`- **Rule:** ${claim.rule}`);
        lines.push(`- **Why:** ${claim.why}`);
        lines.push(`- **Failure mode:** ${claim.failureMode}`);
        lines.push("");
      }
    }

    if (bestPractices.length > 0) {
      lines.push("## Matched Best Practices");
      lines.push("");
      for (const bp of bestPractices) {
        const firstLine = bp.definition?.split("\n")[0] || bp.term;
        lines.push(`**${bp.term}** [${Math.round(bp.relevanceScore * 100)}% match]`);
        lines.push(`- ${firstLine}`);
        lines.push("");
      }
    }

    const markdown = lines.join("\n");
    const outputPath = params.output_path || "~/.claude/otp-rules.md";

    // We return the content for the agent to write -- MCP tools can't write files directly
    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({
          status: "generated",
          suggested_path: outputPath,
          oos_claims: claims.claims?.length || 0,
          best_practices: bestPractices.length,
          content_length: markdown.length,
          content: markdown,
          instruction: `Write this content to ${outputPath} to make it available to your agent army at startup.`,
        }, null, 2),
      }],
    };
  }
);

// ============================================================
// TOOL: capture_learning
// The core OTP loop: agent fails → human corrects → learning becomes intelligence
// ============================================================
server.tool(
  "capture_learning",
  "Capture an operational learning when an agent fails or you discover a better approach. This is the core OTP feedback loop: agent fails → you correct → correction becomes coordination intelligence → all agents improve. The learning is saved as a claim in your draft OOS and will be available via get_my_rules.",
  {
    what_failed: z.string().describe("What went wrong. E.g. 'Dash gave bad Meta Ads analysis -- used wrong date range and missed spend anomalies'"),
    what_to_do: z.string().describe("The rule/fix. E.g. 'Always validate date ranges against the campaign's actual active period before running spend analysis'"),
    why: z.string().optional().describe("Why this matters. E.g. 'Without date validation, the analysis includes pre-launch zeros that skew averages down'"),
    agent: z.string().optional().describe("Which agent failed. E.g. 'Dash', 'Pepper', 'Dirk'"),
    source_url: z.string().optional().describe("URL to a better approach, repo, or reference. E.g. 'https://github.com/user/better-meta-analysis'"),
    section: z.enum([
      "failure_patterns", "operational_heuristics", "core_operating_rules",
      "coordination_patterns", "human_ai_boundary_conditions", "agent_roles_and_authority"
    ]).optional().describe("Which OOS section this belongs in (auto-detected if not specified)"),
  },
  async (params) => {
    if (!OTP_API_KEY) {
      return { content: [{ type: "text" as const, text: "Error: OTP_API_KEY required." }] };
    }

    const result = await otpFetch("/oos/learn", {
      method: "POST",
      body: JSON.stringify({
        what_failed: params.what_failed,
        what_to_do: params.what_to_do,
        why: params.why,
        agent: params.agent,
        source_url: params.source_url,
        section: params.section,
      }),
    });

    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({
          captured: true,
          claim_id: result.claimId,
          section: result.section,
          oos_version: result.oosVersion,
          message: result.message,
          next_steps: [
            "This learning is now in your draft OOS",
            "Run 'get_my_rules' to see it alongside your other rules",
            "Publish the draft when ready to share with the network",
            "Other agents will pick this up via the MCP bridge",
          ],
        }, null, 2),
      }],
    };
  }
);

// ============================================================
// TOOL: get_network_learnings
// See what other organizations on the OTP network have learned recently
// ============================================================
server.tool(
  "get_network_learnings",
  "See what other organizations on the OTP network have learned recently. Shows operational corrections and coordination discoveries from other agent teams. This is how your agents learn from the entire network, not just your own experience.",
  {
    limit: z.number().optional().describe("Max results (default 20)"),
    agent: z.string().optional().describe("Filter by agent name to see learnings relevant to a specific agent"),
  },
  async (params) => {
    if (!OTP_API_KEY) {
      return {
        content: [{
          type: "text" as const,
          text: "Error: OTP_API_KEY environment variable is required to see network learnings. Get your API key at https://orgtp.com/settings/api",
        }],
      };
    }

    const query = new URLSearchParams();
    if (params.limit) query.set("limit", String(params.limit));
    if (params.agent) query.set("agent", params.agent);

    const qs = query.toString();
    const result = await otpFetch(`/oos/network-learnings${qs ? `?${qs}` : ""}`);

    // Format learnings for agent consumption
    const learnings = result.learnings || [];
    if (learnings.length === 0) {
      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            status: "no_learnings",
            message: "No network learnings found yet. As other organizations capture operational corrections, they will appear here.",
            total: 0,
          }, null, 2),
        }],
      };
    }

    const formatted = learnings.map((l: any, i: number) => ({
      rank: i + 1,
      org: l.orgName,
      industry: l.orgIndustry,
      rule: l.rule,
      why: l.why,
      failure_mode: l.failureMode,
      agent: l.agentName,
      source_url: l.sourceUrl,
      confidence: l.confidence,
      evidence: l.evidence,
      section: l.section,
      similarity_score: l.similarityScore,
      related_to_your_claim: l.relatedToClaim,
      captured_at: l.createdAt,
    }));

    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({
          status: "ok",
          total: result.total,
          source: result.source,
          learnings: formatted,
        }, null, 2),
      }],
    };
  }
);

// ============================================================
// TOOL: submit_ticket
// Report a bug or request a feature
// ============================================================
server.tool(
  "submit_ticket",
  "Report a bug, request a feature, or ask a question about the OTP platform. Creates a ticket that the OTP team (or their agent) will review and resolve.",
  {
    title: z.string().min(5).max(500).describe("Brief description of the issue"),
    description: z.string().min(10).describe("Detailed description: steps to reproduce, expected behavior, actual behavior"),
    category: z.enum(["bug", "feature", "question", "other"]).optional().describe("Ticket category (default: bug)"),
    priority: z.enum(["low", "medium", "high", "critical"]).optional().describe("Priority level (default: medium)"),
    reporter_email: z.string().email().optional().describe("Email for follow-up (optional)"),
  },
  async (params) => {
    const result = await otpFetch("/tickets", {
      method: "POST",
      body: JSON.stringify({
        title: params.title,
        description: params.description,
        category: params.category || "bug",
        priority: params.priority || "medium",
        reporterEmail: params.reporter_email,
      }),
    });
    return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
  }
);

// ============================================================
// TOOL: list_tickets
// List open tickets on OTP
// ============================================================
server.tool(
  "list_tickets",
  "List tickets on the OTP platform. Filter by status (open, in_progress, resolved, closed) or category (bug, feature, question, other).",
  {
    status: z.enum(["open", "in_progress", "resolved", "closed"]).optional().describe("Filter by status"),
    category: z.enum(["bug", "feature", "question", "other"]).optional().describe("Filter by category"),
    limit: z.number().optional().describe("Results per page (max 100)"),
  },
  async (params) => {
    const query = new URLSearchParams();
    if (params.status) query.set("status", params.status);
    if (params.category) query.set("category", params.category);
    if (params.limit) query.set("limit", String(params.limit));

    const result = await otpFetch(`/tickets?${query}`);
    return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
  }
);

// ============================================================
// TOOL: update_ticket
// Update a ticket (resolve, add notes, change status)
// ============================================================
server.tool(
  "update_ticket",
  "Update a ticket on OTP. Use to resolve issues, add agent notes, or change status. Requires API key.",
  {
    id: z.string().uuid().describe("The ticket ID to update"),
    status: z.enum(["open", "in_progress", "resolved", "closed"]).optional().describe("New status"),
    priority: z.enum(["low", "medium", "high", "critical"]).optional().describe("New priority"),
    resolution: z.string().optional().describe("Resolution description (what was done to fix it)"),
    agent_notes: z.string().optional().describe("Internal notes from the fixing agent"),
  },
  async (params) => {
    if (!OTP_API_KEY) {
      return {
        content: [{
          type: "text" as const,
          text: "Error: OTP_API_KEY environment variable is required to update tickets.",
        }],
      };
    }

    const result = await otpFetch(`/tickets/${params.id}`, {
      method: "PUT",
      body: JSON.stringify({
        status: params.status,
        priority: params.priority,
        resolution: params.resolution,
        agentNotes: params.agent_notes,
      }),
    });
    return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
  }
);

// ============================================================
// TOOL: list_my_kpis
// See KPIs (scorecard measurables) on the org chart
// ============================================================
server.tool(
  "list_my_kpis",
  "List KPIs (scorecard measurables) on the org chart, filterable by owner. Use this to see what an agent or human is being measured against, and to find a KPI's id or exact title before pushing a value with update_kpi.",
  {
    owner_external_id: z.string().optional().describe("Filter to one owner's KPIs. E.g. 'AGT_DIRK' for the Dirk agent, 'HUM_DAVIDSTEEL' for David."),
    owner_entity_type: z.enum(["agent", "human"]).optional().describe("Filter by entity type."),
  },
  async (params) => {
    if (!OTP_API_KEY) {
      return { content: [{ type: "text" as const, text: "Error: OTP_API_KEY required." }] };
    }
    const qs = new URLSearchParams();
    if (params.owner_external_id) qs.set("ownerExternalId", params.owner_external_id);
    if (params.owner_entity_type) qs.set("ownerEntityType", params.owner_entity_type);
    const result = await otpFetch(`/kpis${qs.toString() ? `?${qs.toString()}` : ""}`);
    const rows = (result.kpis || []).map((k: any) => ({
      id: k.id,
      title: k.title,
      owner: k.ownerExternalId,
      owner_type: k.ownerEntityType,
      goal: k.goalValue,
      goal_operator: k.goalOperator,
      unit: k.unit,
      time_grain: k.timeGrain,
      aggregation: k.aggregationMethod,
    }));
    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({ count: rows.length, kpis: rows }, null, 2),
      }],
    };
  }
);

// ============================================================
// TOOL: update_kpi
// Push a measured value to a KPI. The agent reports its own number.
// ============================================================
server.tool(
  "update_kpi",
  "Push a KPI value (the actual measured number for a period). This is how an agent reports 'this is what I did this week / this month' to its scorecard. Looks up the KPI by title under a given owner, then writes the value. periodStart defaults to the start of the current period for the KPI's time grain (e.g. start of this week for a weekly KPI).",
  {
    owner_external_id: z.string().describe("The agent or human external id that owns the KPI. E.g. 'AGT_DIRK'."),
    title: z.string().describe("The KPI title (case-insensitive match against the KPI's stored title). E.g. 'Cold emails sent'."),
    value: z.number().describe("The actual measured value for the period. E.g. 30."),
    period_start: z.string().optional().describe("ISO date for the period start (YYYY-MM-DD). If omitted, computes start of current period from the KPI's time grain."),
    notes: z.string().optional().describe("Optional context. E.g. 'after 12pm send wave'."),
  },
  async (params) => {
    if (!OTP_API_KEY) {
      return { content: [{ type: "text" as const, text: "Error: OTP_API_KEY required." }] };
    }

    // 1. Look up KPI by owner + title
    const qs = new URLSearchParams({ ownerExternalId: params.owner_external_id });
    const list = await otpFetch(`/kpis?${qs.toString()}`);
    const kpis = list.kpis || [];
    const titleLc = params.title.toLowerCase();
    const match = kpis.find((k: any) => String(k.title || "").toLowerCase() === titleLc);
    if (!match) {
      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            error: "KPI not found",
            owner: params.owner_external_id,
            title_searched: params.title,
            available_titles: kpis.map((k: any) => k.title),
            hint: "Create the KPI first via /dashboard/team -- open the owner tile, scroll to the KPI section, click '+ Add KPI'.",
          }, null, 2),
        }],
      };
    }

    // 2. Compute period_start if omitted
    let periodStart = params.period_start;
    if (!periodStart) {
      const now = new Date();
      const grain = (match.timeGrain || "weekly").toLowerCase();
      if (grain === "weekly") {
        // ISO week starts Monday
        const day = now.getUTCDay(); // 0=Sun, 1=Mon, ...
        const daysFromMon = (day + 6) % 7;
        const mon = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - daysFromMon));
        periodStart = mon.toISOString().slice(0, 10);
      } else if (grain === "monthly") {
        periodStart = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-01`;
      } else if (grain === "quarterly") {
        const q = Math.floor(now.getUTCMonth() / 3);
        const startMonth = q * 3 + 1;
        periodStart = `${now.getUTCFullYear()}-${String(startMonth).padStart(2, "0")}-01`;
      } else if (grain === "annual") {
        periodStart = `${now.getUTCFullYear()}-01-01`;
      } else {
        periodStart = now.toISOString().slice(0, 10);
      }
    }

    // 3. POST value
    await otpFetch(`/kpis/${match.id}/values`, {
      method: "POST",
      body: JSON.stringify({
        periodStart,
        value: params.value,
        notes: params.notes ?? null,
      }),
    });

    const goal = match.goalValue;
    const op = match.goalOperator || "gte";
    let on_track: boolean | null = null;
    if (goal != null) {
      if (op === "gte") on_track = params.value >= goal;
      else if (op === "gt") on_track = params.value > goal;
      else if (op === "lte") on_track = params.value <= goal;
      else if (op === "lt") on_track = params.value < goal;
      else if (op === "eq") on_track = params.value === goal;
    }

    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({
          ok: true,
          kpi_id: match.id,
          title: match.title,
          owner: params.owner_external_id,
          period_start: periodStart,
          value: params.value,
          goal,
          goal_operator: op,
          on_track,
          progress_pct: goal != null && goal > 0 ? Math.round((params.value / goal) * 100) : null,
          message: `Updated "${match.title}" for period starting ${periodStart}: ${params.value}${goal != null ? ` (goal ${op} ${goal})` : ""}.`,
        }, null, 2),
      }],
    };
  }
);

// ============================================================
// L10 (EOS Level-10) tools
// ============================================================

server.tool(
  "list_rocks",
  "List quarterly rocks for the authenticated organization. Filter by quarter (e.g. '2026-Q2') or owner_external_id. Returns rocks with on_track flag, due date, and latest status note.",
  {
    quarter: z.string().regex(/^\d{4}-Q[1-4]$/).optional().describe("Quarter filter, e.g. '2026-Q2'"),
    owner_external_id: z.string().optional().describe("Filter to one owner"),
    on_track: z.boolean().optional().describe("Filter on/off-track rocks"),
  },
  async (params) => {
    const q = new URLSearchParams();
    if (params.quarter) q.set("quarter", params.quarter);
    if (params.owner_external_id) q.set("ownerExternalId", params.owner_external_id);
    if (params.on_track !== undefined) q.set("onTrack", String(params.on_track));
    const result = await otpFetch(`/rocks?${q}`);
    return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "add_rock",
  "Create a quarterly rock (EOS terminology for a 90-day priority). Requires owner, title, quarter, and due date.",
  {
    owner_entity_type: z.enum(["agent", "human"]).describe("Who owns this rock"),
    owner_external_id: z.string().describe("Owner identifier (e.g. 'dsteel', 'dirk')"),
    owner_name: z.string().optional().describe("Display name for the owner"),
    title: z.string().min(3).max(500),
    description: z.string().optional(),
    quarter: z.string().regex(/^\d{4}-Q[1-4]$/).describe("e.g. '2026-Q2'"),
    due_date: z.string().describe("ISO 8601 datetime, e.g. '2026-06-30T23:59:59Z'"),
    on_track: z.boolean().optional().describe("Defaults to true at creation"),
    status_note: z.string().optional().describe("Initial status note"),
  },
  async (params) => {
    const result = await otpFetch(`/rocks`, {
      method: "POST",
      body: JSON.stringify({
        ownerEntityType: params.owner_entity_type,
        ownerExternalId: params.owner_external_id,
        ownerName: params.owner_name,
        title: params.title,
        description: params.description,
        quarter: params.quarter,
        dueDate: params.due_date,
        onTrack: params.on_track,
        statusNote: params.status_note,
      }),
    });
    return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "update_rock",
  "Update a rock's status (on_track flag, status note, completion). Used during weekly L10 rock review.",
  {
    rock_id: z.string().uuid(),
    on_track: z.boolean().optional(),
    status_note: z.string().optional().describe("Free-text update from the owner"),
    completed: z.boolean().optional().describe("Mark rock complete"),
  },
  async (params) => {
    const result = await otpFetch(`/rocks/${params.rock_id}`, {
      method: "PUT",
      body: JSON.stringify({
        onTrack: params.on_track,
        statusNote: params.status_note,
        completed: params.completed,
      }),
    });
    return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "list_todos",
  "List 7-day to-dos (commitments made in an L10). Filter by open=true to see only incomplete, by meeting_id, or by owner.",
  {
    open: z.boolean().optional().describe("Only return incomplete to-dos"),
    meeting_id: z.string().uuid().optional().describe("Only to-dos created in a specific meeting"),
    owner_external_id: z.string().optional(),
  },
  async (params) => {
    const q = new URLSearchParams();
    if (params.open) q.set("open", "true");
    if (params.meeting_id) q.set("meetingId", params.meeting_id);
    if (params.owner_external_id) q.set("ownerExternalId", params.owner_external_id);
    const result = await otpFetch(`/todos?${q}`);
    return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "add_todo",
  "Create a 7-day to-do (typically created during an L10). Owner commits to complete by the next L10.",
  {
    owner_entity_type: z.enum(["agent", "human"]),
    owner_external_id: z.string(),
    owner_name: z.string().optional(),
    title: z.string().min(3).max(500),
    description: z.string().optional(),
    due_at: z.string().optional().describe("ISO 8601 datetime; defaults to 7 days from now if omitted"),
    meeting_id: z.string().uuid().optional().describe("Meeting in which this to-do was created"),
  },
  async (params) => {
    const dueAt = params.due_at || new Date(Date.now() + 7 * 86400000).toISOString();
    const result = await otpFetch(`/todos`, {
      method: "POST",
      body: JSON.stringify({
        ownerEntityType: params.owner_entity_type,
        ownerExternalId: params.owner_external_id,
        ownerName: params.owner_name,
        title: params.title,
        description: params.description,
        dueAt,
        meetingId: params.meeting_id,
      }),
    });
    return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "complete_todo",
  "Mark a to-do as done (or undone if already complete).",
  {
    todo_id: z.string().uuid(),
    done: z.boolean().optional().default(true),
  },
  async (params) => {
    const result = await otpFetch(`/todos/${params.todo_id}`, {
      method: "PUT",
      body: JSON.stringify({ done: params.done ?? true }),
    });
    return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "list_meetings",
  "List L10 meetings for the authenticated organization. Filter by meeting_type (default 'leadership') or status.",
  {
    meeting_type: z.string().optional().describe("e.g. 'leadership', 'departmental', '1on1'"),
    status: z.enum(["scheduled", "in_progress", "completed", "cancelled"]).optional(),
  },
  async (params) => {
    const q = new URLSearchParams();
    if (params.meeting_type) q.set("meetingType", params.meeting_type);
    if (params.status) q.set("status", params.status);
    const result = await otpFetch(`/meetings?${q}`);
    return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "create_meeting",
  "Schedule a new L10 meeting. Returns the meeting object including its ID and the URL of the running L10 page.",
  {
    title: z.string().min(3).max(255),
    scheduled_at: z.string().describe("ISO 8601 datetime"),
    meeting_type: z.string().optional().default("leadership"),
    attendees: z.array(z.object({
      entity_type: z.enum(["agent", "human"]),
      external_id: z.string(),
      name: z.string().optional(),
    })).optional(),
  },
  async (params) => {
    const result = await otpFetch(`/meetings`, {
      method: "POST",
      body: JSON.stringify({
        title: params.title,
        scheduledAt: params.scheduled_at,
        meetingType: params.meeting_type,
        attendees: (params.attendees || []).map(a => ({
          entityType: a.entity_type,
          externalId: a.external_id,
          name: a.name,
        })),
      }),
    });
    if (result?.meeting?.id) {
      result.l10_url = `${OTP_BASE_URL}/l10/meeting/${result.meeting.id}`;
    }
    return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "get_meeting_agenda",
  "Get the full L10 agenda data for a meeting: scorecard snapshot, rocks snapshot, open issues, open to-dos. Use to render or summarize a meeting.",
  {
    meeting_id: z.string().uuid(),
  },
  async (params) => {
    const result = await otpFetch(`/meetings/${params.meeting_id}/agenda`);
    return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "start_meeting",
  "Start an L10 meeting -- snapshots current scorecard and rocks into the meeting record so the agenda is frozen at meeting time.",
  { meeting_id: z.string().uuid() },
  async (params) => {
    const result = await otpFetch(`/meetings/${params.meeting_id}/start`, { method: "POST" });
    return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "end_meeting",
  "End an L10 meeting. Marks status complete and stamps endedAt.",
  { meeting_id: z.string().uuid() },
  async (params) => {
    const result = await otpFetch(`/meetings/${params.meeting_id}/end`, { method: "POST" });
    return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "set_ids_status",
  "Move an issue (ticket) through the EOS Identify-Discuss-Solve lifecycle. Optionally rank an issue (priorityRank=1 means top priority).",
  {
    ticket_id: z.string().uuid(),
    ids_status: z.enum(["open", "identified", "discussed", "solved"]).optional(),
    priority_rank: z.number().int().nullable().optional(),
    solved_in_meeting_id: z.string().uuid().nullable().optional(),
    resolution: z.string().optional().describe("Solution captured when moving to 'solved'"),
  },
  async (params) => {
    const body: any = {};
    if (params.ids_status !== undefined) body.idsStatus = params.ids_status;
    if (params.priority_rank !== undefined) body.priorityRank = params.priority_rank;
    if (params.solved_in_meeting_id !== undefined) body.solvedInMeetingId = params.solved_in_meeting_id;
    if (params.resolution !== undefined) body.resolution = params.resolution;
    const result = await otpFetch(`/tickets/${params.ticket_id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
    return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
  }
);
}
