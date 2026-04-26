# OOS -- The Open Operating System for AI Teams

You built an AI agent team. It works. Your agents coordinate, they don't step on each other, and you've figured out the rules that keep them productive.

But you learned all of that the hard way. And nobody else can benefit from what you know.

**OOS is a structured format for capturing, sharing, and learning from how organizations actually run AI teams.**

Every OOS document contains **claims** -- specific, evidence-backed rules about how an AI system works, why it works that way, and what happens when it breaks. Not marketing. Not theory. Battle-tested coordination intelligence.

```yaml
---
oos_version: "1.0"
org_pseudonym: "Acme Digital Agency"
industry: "digital_marketing_agency"
org_size: "small"
template: "agent_army"
agent_count: 8
platforms: ["claude"]
generated_at: "2026-03-14T12:00:00Z"
version: 1
claim_count: 14
confidence_distribution: { high: 5, medium: 6, low: 3 }
---
```

```
[C001] core_operating_rules
- Rule: Every agent writes to a shared state file. No agent reads data sources directly.
- Why: Direct data source access creates race conditions and inconsistent views across agents.
- Failure mode: Two agents read the same data source at different times, get different results,
  make conflicting decisions.
- Confidence: HIGH
- Evidence: MEASURED_RESULT
- Scope: All agents in the system.
```

That's an OOS claim. It tells you: what the rule is, why it exists, what goes wrong without it, how confident they are, and what evidence backs it up. You can adopt it, adapt it, or skip it -- but you can evaluate it on its merits.

---

## Why OOS Exists

Everyone building multi-agent AI systems is solving the same coordination problems independently:

- How do you prevent two agents from acting on the same task?
- When should an AI agent escalate to a human?
- How do you structure shared state so agents don't corrupt each other's data?
- What happens when your sales agent and your retention agent target the same client?

These are not technical problems. They are **organizational intelligence** -- earned through trial, error, and production incidents. Today, this intelligence lives in private CLAUDE.md files, scattered Notion docs, and the heads of founders who built the systems.

OOS makes it structured, portable, and comparable.

---

## What's in This Repo

```
oos-open/
  README.md                  -- You are here
  SPEC.md                    -- Full OOS format specification
  schemas/
    v1.0/
      oos-schema.json        -- JSON Schema (Draft 2020-12)
  packages/
    validate/
      src/
        index.ts             -- Zod-based OOS validator
        types.ts             -- TypeScript type definitions
        enums.ts             -- Confidence, Evidence, Template enums
      package.json
      README.md
  examples/
    agency-14-agents.oos.md  -- Digital agency with 14 AI agents (Sneeze It)
    solo-founder.oos.md      -- Solo founder building OTP itself, 3 agents
  LICENSE                    -- MIT (code), CC BY 4.0 (spec)
```

---

## The OOS Format

An OOS document has two parts: **frontmatter** and **claims**.

### Frontmatter

Metadata about the organization and its AI system. Machine-readable. Required fields:

| Field | Type | Description |
|-------|------|-------------|
| `oos_version` | string | Format version (e.g., "1.0") |
| `org_pseudonym` | string | Organization name (can be anonymized) |
| `industry` | string | Industry classification |
| `org_size` | enum | `solo` \| `small` \| `medium` \| `large` \| `enterprise` |
| `template` | enum | `agent_army` \| `value_chain` \| `org_chart` |
| `agent_count` | integer | Number of AI agents in the system |
| `platforms` | string[] | AI platforms used (e.g., `["claude", "openai"]`) |
| `generated_at` | ISO 8601 | When this version was created |
| `version` | integer | Document version number |
| `parent_version` | integer \| null | Previous version (null for first publish) |
| `claim_count` | integer | Total number of claims (min: 10) |
| `confidence_distribution` | object | Count of HIGH / MEDIUM / LOW claims |
| `evidence_distribution` | object | Count by evidence type |

Optional: `org_id` (UUID), `mcp_servers` (string[]), `word_count`.

### Claims

The core of OOS. Each claim captures one piece of coordination intelligence:

| Field | Required | Description |
|-------|----------|-------------|
| `claim_id` | Yes | Unique ID (format: C001, C002, ...) |
| `section` | Yes | Which section this claim belongs to |
| `rule` | Yes | What the rule or pattern is |
| `why` | Yes | Why this rule exists |
| `failure_mode` | Yes | What happens when you violate this rule |
| `confidence` | Yes | `HIGH` \| `MEDIUM` \| `LOW` |
| `evidence` | Yes | How the claim was established (see below) |
| `scope` | Yes | Where this rule applies and where it doesn't |

### Evidence Types

OOS tracks how each claim was established, from strongest to weakest:

| Type | Strength | Meaning |
|------|----------|---------|
| `MEASURED_RESULT` | 6 | Quantified outcome from production data |
| `OBSERVED_REPEATEDLY` | 5 | Seen multiple times in production |
| `OBSERVED_ONCE` | 4 | Seen once in production |
| `HUMAN_DEFINED_RULE` | 3 | Designed by a human before deployment |
| `INFERENCE` | 2 | Logical conclusion from other evidence |
| `SPECULATION` | 1 | Hypothesis, not yet validated |

### Templates

OOS supports three organizational patterns:

**Agent Army** -- Teams of specialized AI agents, each owning a distinct function.
Sections: `agent_roles_and_authority`, `coordination_patterns`, `operational_heuristics`

**Value Chain** -- AI integrated into sequential business processes.
Sections: `value_chain_stages`, `stage_handoffs`, `operational_heuristics`

**Org Chart** -- AI capabilities mapped to traditional departments.
Sections: `department_ai_capabilities`, `cross_department_interfaces`, `operational_heuristics`

All templates share universal sections: `purpose`, `prime_directives`, `system_identity`, `core_operating_rules`, `failure_patterns`, `human_ai_boundary_conditions`, `confidence_map`, `merge_protocol`, `update_protocol`, `summary`.

---

## Validate an OOS Document

```bash
npx @openotp/validate my-file.oos.json
```

Or in code:

```typescript
import { validateOOS } from '@openotp/validate';

const result = validateOOS(myDocument);

if (result.valid) {
  console.log(`Valid OOS: ${result.claims.length} claims`);
} else {
  console.error(result.errors);
}
```

---

## Publish Your OOS

Validate locally, then publish to the OTP network:

1. Write your OOS document (Markdown or JSON)
2. Validate with `npx @openotp/validate`
3. Publish at [orgtp.com](https://orgtp.com)

Published OOS documents appear on the OTP Intelligence Graph -- a network visualization showing how organizations connect through shared patterns. Your claims become discoverable, comparable, and mergeable with other organizations' intelligence.

---

## How OOS Documents Connect

When multiple organizations publish OOS documents, the platform identifies:

- **Shared patterns** -- Claims that appear across organizations (e.g., "retention overrides sales" appears in 40% of agency OOS documents)
- **Contradictions** -- Organizations that solved the same problem differently
- **Gaps** -- Sections where your OOS is thin compared to similar organizations
- **Quality tiers** -- Platinum / Gold / Silver / Bronze based on evidence strength and claim density

The diff engine compares any two OOS documents claim-by-claim, classifying each as `UNIQUE_TO_A`, `UNIQUE_TO_B`, `SIMILAR`, or `DUPLICATE`.

---

## Real Examples

### A 14-agent digital agency (Sneeze It)

```yaml
agent_count: 14
platforms: ["claude"]
claim_count: 24
confidence_distribution: { high: 10, medium: 10, low: 4 }
```

Prime directives:
1. One seat, one owner. No agent does two jobs. No two agents do the same job.
2. Separate blast radius. Tuning one agent never breaks another.
3. Escalation over autonomy. Agents flag and recommend. The founder decides.

Sample claim:
```
[C004] coordination_patterns
- Rule: The retention agent always overrides the sales agent on at-risk clients.
- Why: Sales expansion to an at-risk client accelerates churn.
- Failure mode: Sales proposes an upsell while satisfaction is declining. Client cancels.
- Confidence: HIGH
- Evidence: OBSERVED_ONCE
- Scope: When client health drops below threshold. Healthy accounts excluded.
```

### A solo founder building OTP itself

```yaml
agent_count: 3
platforms: ["claude"]
claim_count: 18
confidence_distribution: { high: 5, medium: 9, low: 4 }
```

OTP runs on its own product. Its OOS is published on the platform as proof that the format works.

---

## Contributing

We welcome contributions to the OOS spec, validation library, and examples.

- **Spec changes** -- Open an issue first. Breaking changes require a version bump.
- **Validation bugs** -- PRs welcome. Include a failing test case.
- **New examples** -- PRs welcome. Anonymize real organizations. Minimum 10 claims.
- **Platform questions** -- Go to [orgtp.com](https://orgtp.com). This repo is for the open format, not the platform.

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

---

## License

- **Code** (validation library, CLI): MIT License
- **OOS Specification** (schema, SPEC.md): CC BY 4.0

You are free to use, modify, and distribute the OOS format in any project. Attribution required for the spec.

---

## FAQ

**Why not just use a README or CLAUDE.md?**
Those are unstructured prose. You cannot diff them, search across them, merge them, or compute quality scores. OOS is structured data with a schema -- it is machine-readable, comparable, and composable.

**Why claims instead of documentation?**
Documentation describes what you intended. Claims describe what you learned. Every claim has a `why` (the reason), a `failure_mode` (what breaks), and `evidence` (how you know). This forces honesty. You cannot claim HIGH confidence with SPECULATION evidence.

**Can I anonymize my organization?**
Yes. The `org_pseudonym` field exists for this purpose. You can share your coordination intelligence without revealing your identity.

**Do I need to use the OTP platform?**
No. The OOS format is open. You can validate locally, store your files anywhere, and never touch the platform. The platform adds publishing, the Intelligence Graph, diff/merge tools, and discovery -- but the format stands alone.

**What if my AI system uses something other than Claude?**
OOS is platform-agnostic. The `platforms` field is a freeform string array. Organizations using OpenAI, Gemini, open-source models, or hybrid systems all publish OOS documents.

---

Built by [Sneeze It](https://sneeze.it). Published on [OTP](https://orgtp.com).
