#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

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
    throw new Error(`OTP API error: ${errMsg}`);
  }

  return body;
}

// -- MCP Server --

const server = new McpServer({
  name: "otp",
  version: "0.1.0",
});

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

// -- Start --

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("OTP MCP Server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
