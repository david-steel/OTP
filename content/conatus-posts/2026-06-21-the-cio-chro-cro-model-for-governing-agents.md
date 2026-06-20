---
title: Governing agents is not a CIO problem. It is a CIO, CHRO, and CRO problem together.
date: 2026-06-21
author: David Steel
slug: the-cio-chro-cro-model-for-governing-agents
type: founder_essay
status: published
series: ai-cio
series_part: 35
description: Why governing AI agents requires the CIO, CHRO, and CRO at the same table, and what each one owns that the others cannot cover alone.
---

# Governing agents is not a CIO problem. It is a CIO, CHRO, and CRO problem together.

The first version of agent governance inside most companies is a technology project. The CIO gets the call. The CIO builds a policy. The CIO stands up an inventory spreadsheet. Twelve months later, the agents are still ungoverned, the spreadsheet is stale, and the CIO is frustrated that nobody outside of IT is following the rules.

The problem is not the framework. The problem is that the frame is wrong.

Agents do not live inside a technology stack. They live inside a workforce. They handle revenue conversations, hiring workflows, coaching sessions, and client escalations. Governing them requires the same set of executives who govern the rest of the workforce: the CIO, the CHRO, and the CRO. Not in sequence. At the same table.

Here is why each seat is necessary and what it owns that the others cannot cover alone.

## 1. The CIO owns the infrastructure agents run on, not the agents themselves

Every agent needs an identity, scoped permissions, and a place in an inventory so it can be managed across its lifecycle, including retirement. That is CIO territory.

Gartner, as reported by CIO.com in April 2026, named six steps for managing AI agent sprawl: agent governance and policies; centralized agent inventory; agent identity, permissions, and lifecycle; information governance; monitoring and remediation; and balancing governance with empowerment. Five of those six steps belong to the CIO.

But infrastructure governance stops at the infrastructure layer. The CIO cannot govern an agent doing sales work without the person who owns sales outcomes. Trying to govern the whole fleet from the technology seat produces policy that nobody enforces, because the people whose work the agents are doing never signed it.

At Sneeze It, the CIO-equivalent layer owns the agent message bus, the agent-inbox files that let agents coordinate directly with each other, and the technical standards every agent runs against. That seat is real. It does not extend into the work the agents are doing. The work belongs to the seat that owns the outcome.

## 2. The CHRO owns anything an agent touches on the workforce side

This is the seat most governance models skip, and the skip causes the most damage.

When Arin, our call center agent, sends a daily coaching message to Amanda and Erica, our human callers, Arin is doing manager work. The governance questions are not technology questions. Who reviewed the message. What tone standards apply. What happens when the coaching does not land. Those are workforce decisions. The technology seat cannot answer them.

The CHRO owns three questions for any agent touching the workforce: Who is this agent's named accountable manager? How does this agent change the role of the human next to it? What is the escalation path when the agent's output creates a workforce consequence?

MIT CISR's research on digital colleagues (Weill and Woerner, April 2026) makes this explicit: human accountability for agent actions is non-negotiable, and governance of agents is shared across the CEO, CIO, CHRO, and CRO. Not delegated to one seat. Any governance model that does not include the CHRO is incomplete by design.

## 3. The CRO owns anything an agent touches on the revenue side

When Dirk, our sales agent, drafts a reactivation sequence for a churned client, three decisions inside that draft are commercial decisions: the content, the timing, and whether to send at all. Pepper, our email agent, handles the mechanics. But the judgment about which client to touch, at which price point, with which offer, belongs to whoever owns revenue.

The CRO owns three things agents cannot self-govern: pricing integrity (an agent optimizing for engagement will drift toward framings that damage commercial positioning), customer relationship risk (some relationships should not be touched by an agent, ever), and pipeline signal integrity (an agent flagging a deal as stale does not know the buyer is in a quarterly blackout).

At Sneeze It, Dirk and Nick, our cold prospecting agent, operate inside the same boundary: draft, flag, recommend. Neither makes commercial decisions autonomously. Dirk drafts. David approves. Pepper sends. That is a three-seat coordination problem, not a single-seat technology problem.

## 4. The coordination failure when one seat is missing

**CIO-only governance** produces policy nobody outside IT follows. The inventory is accurate. The agents in sales and HR are not in it, because the people running them never connected with the governance process.

**CHRO-only governance** produces workforce principles with no technical teeth. Nobody can tell whether agents are following them, because the monitoring infrastructure was never built.

**CRO-only governance** produces tight commercial controls on revenue agents and nothing else. Partial governance creates a false sense of coverage.

All three failures share the same root cause. The scope of agent governance exceeds the scope of any single executive seat.

## 5. What a working three-seat model looks like

This is not a committee. Committees produce documents.

The CIO owns the agent inventory, identity and permissions, coordination protocol, security, and lifecycle including retirement. Every new agent enters the CIO layer first.

The CHRO owns named human accountability for every agent that influences workforce activity, the approval loop for agent communications to employees, and the escalation path when an agent's output becomes a workforce event.

The CRO owns the commercial guardrails for any agent in the revenue motion, the approval chain for agent-generated outreach, and the decision about which revenue relationships agents are authorized to touch.

The scopes overlap at specific moments: new agent deployment, scope changes, output that creates consequences across domains. Those are when the three-seat model meets. Not in a standing weekly committee. At the specific decision that requires all three inputs.

## 6. Three seats, not necessarily three titles

Most companies do not have a CHRO and a CRO as separate executives. The seat might be the COO. It might be the founder.

The principle holds regardless of how the titles are distributed. The governance failure in most mid-size companies is not that they lack a CHRO. It is that nobody is asking the CHRO-layer questions about their agents at all. At Sneeze It, Bogdan is our COO. He holds the operational layer that in a larger company would be distributed across several seats. The three-seat model does not require three titles. It requires that three sets of questions are owned by someone with the authority to answer them.

MIT CISR's maturity research (Woerner, Sebastian, Weill, Kaganer, 2025) describes the distinguishing feature of their highest-maturity firms as a united top leadership team, naming the CEO, CIO, chief strategy officer, and head of HR. The firms that reach the top do not get there because they built better agents. They get there because the leadership team governing those agents is unified.

The Deloitte State of AI 2026 survey of 3,235 executives found only 21% of companies have a mature governance model for agentic AI. The other 79% have the policy. They do not have the operating structure.

That is the gap between a framework and a running system. Gartner names the framework. The framework does not run itself.

The mission at Sneeze It is to let agents carry the operational work, so people are free for the work that matters. That mission requires governing agents the same way you govern a workforce: with the right people in the right seats, owning clear outcomes. Three seats at the table. One chart they all share.

---

## See the live chart

The OTP MCP lets you query which human and agent seats at Sneeze It hold accountability for each governance domain.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the org chart for sneeze-it and identify which human seats hold accountability for agent governance."*

You will see named seats, not a governance diagram. That is the difference between a framework and a running system.
