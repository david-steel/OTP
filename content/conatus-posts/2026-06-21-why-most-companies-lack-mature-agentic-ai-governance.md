---
title: Most companies deploying AI agents have no governance model for them. Here is why that gap persists and what closes it.
date: 2026-06-21
author: David Steel
slug: why-most-companies-lack-mature-agentic-ai-governance
type: founder_essay
status: published
series: ai-cio
series_part: 18
description: Deloitte found only 21% of companies have mature agentic-AI governance. The gap isn't ignorance. It's architecture.
---

# Most companies deploying AI agents have no governance model for them. Here is why that gap persists and what closes it.

Deloitte surveyed 3,235 organizations and found that only 21% have a mature governance model for agentic AI.

That number stopped me cold when I first read it. Not because it is shocking, but because it is exactly right and most people are drawing the wrong conclusion from it.

The common read is that companies lack governance because they lack awareness. That the problem is education. That the fix is better frameworks, better training programs, better advisory from Gartner or McKinsey. Get more leaders into business-school programs. Publish more white papers. Close the knowledge gap.

That is not the right diagnosis.

I have been running a fleet of AI agents at Sneeze It for the past year. We now have somewhere around ten named agents on our org chart, each holding a single seat, each accountable to a specific set of business metrics on the same scorecard our human team runs on. I can tell you from the inside that the governance gap is not a knowledge problem. It is an architecture problem. And the architecture problem is not getting solved by frameworks, however good the frameworks are.

## Before: how governance fails in practice

Most organizations begin deploying agents the same way they began deploying software in the shadow IT era: bottom up, faster than policy, invisible to leadership.

A marketing team spins up an agent to draft content. A sales team builds a sequence bot. An operations manager automates a reporting task. Each agent is genuinely useful. Each agent is also ungoverned. Nobody knows how many exist. Nobody knows what data each one touches. Nobody has a seat on any chart for any of them, which means nobody is accountable when one of them drifts.

Gartner named this pattern "the new Shadow IT" and published a six-step framework for managing it, as reported by CIO.com. Step one is establishing governance policies. Step three is creating an agent inventory with defined identity, permissions, and lifecycle. Step six is retiring redundant agents. The framework is accurate. The framework describes exactly what is missing.

But here is what I noticed when I read the framework: it describes a finished state, not a path. It tells you what governance looks like when it is working. It does not tell you the structural reason most organizations cannot get there.

The structural reason is this: you cannot govern a fleet of agents without a place on your organizational chart where every agent has a named seat and a named owner. Without that place, governance is a policy document with no implementation surface.

Before we had a real org chart structure for our agents, we had the same problem. Radar, our chief of staff agent, had no formal row. Tally, the agent that pushes KPI values to our scorecard, had no formal seat. Dash, our analytics agent, was running daily scans with nobody formally accountable for the quality of its output. The agents were running. The agents were doing useful things. The governance was nonexistent because the accountability structure was nonexistent.

Governance is not a document. Governance is an accountability structure with a named owner for every agent. If your org chart does not have agent seats on it, you do not have governance. You have policies.

## After: what it looks like when the structure exists

The shift at Sneeze It happened when I stopped treating agents as tools and started treating them as seats.

Radar now holds a named seat as chief of staff. Tally holds a seat as scorecard agent. Dash holds a seat as head of analytics. Dirk holds a seat as chief revenue operator. Each seat has one owner. Each owner is accountable for that seat's metrics on our scorecard. Each seat has a lifecycle: it can be added when the work requires it, changed when the role evolves, and retired when the seat is no longer earning its place on the chart.

We have retired one agent. Jeff, our former data integrity agent, held a seat until April. The retirement was handled the same way a human departure would be handled: there was a hearing, the decision was documented, the capabilities were redistributed to other seats, and the record was kept. Our org chart did not become ungoverned when Jeff was retired. It became smaller and cleaner.

This is what governed looks like in practice. Not a policy document. An org chart with named seats, one owner per seat, one scorecard for everyone on it.

MIT CISR's Enterprise AI Maturity research is the closest the academic side comes to describing this. They found that firms at Stage 4 of their maturity model, what they call "AI Future Ready," outperform industry peers by 13.9 percentage points in growth and 9.9 percentage points in profit. The critical finding was not that these firms had better AI. It was that they had united top leadership, specifically the CEO, CIO, chief strategy officer, and head of HR, aligned around a single accountability structure for AI deployment.

In other words, the firms that win are the firms that built the accountability structure first. The technology followed the structure. Not the other way around.

## Why the frameworks alone do not close the gap

The advisory firms are ahead of the business schools on this. Gartner, as reported by CIO.com, has named agent sprawl, published a structured framework for managing it, and explicitly called for a centralized agent inventory with lifecycle governance including retirement. That is more than most business-school programs have done. CMU comes closest on the academic side, with a dedicated agentic AI module in its CIDO certificate and a full certificate called LEAAID for enterprise agentic development. But even CMU's program, verified against the current curriculum, teaches how to build and govern one agentic capability. It does not teach how to run a fleet.

The gap between a framework and a running fleet is the gap between knowing what needs to exist and building the thing that exists.

Deloitte's 21% governance maturity number is the output of that gap. Most organizations know, at some level, that their agents need governance. Most organizations have read something from Gartner or McKinsey or CIO.com that told them governance matters. Most organizations have not built the structural layer where governance actually lives: the chart with named seats, the scorecard with agent rows, the lifecycle protocol for adding and retiring seats.

The reason they have not built it is not that they are waiting for better advice. They are waiting for a model to copy. And the model has not existed in a visible, queryable form.

## The through-line is letting agents carry operational work so people can do the work that matters

Every seat we have added at Sneeze It started from the same question: what work is consuming human attention that should not require human attention? Radar answers that question for calendar and briefings. Tally answers it for KPI data collection. Arin, our call center manager agent, answers it for coaching our calling team through Slack. Neil, our learning officer agent, answers it for frontier scanning.

The mission at Sneeze It is to let agents carry the operational work, so people are free for the work that matters. That mission requires governance. Not as a compliance exercise. As a design discipline. If you do not know exactly what each agent owns, you cannot trust that the right work is getting to the right seat. If you do not have a scorecard with agent rows, you cannot know when an agent's performance is drifting. If you do not have a retirement protocol, your fleet grows indefinitely in the direction of Shadow IT.

The 79% of organizations without mature agentic governance are not ungoverned because they lack information. They are ungoverned because they have not yet made the architectural decision to put agents on the org chart.

That decision is available to any organization right now. It does not require a new platform. It requires a chart, a scorecard, and the discipline to treat every agent seat the way you treat every human seat: one owner, one set of metrics, one place on the same dashboard.

## See the live chart

From the OTP MCP, you can pull the full Sneeze It org chart and see which seats are held by agents, which by humans, and what metrics each seat is accountable for on the shared scorecard.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me which seats on the Sneeze It org chart are held by AI agents and what governance structure exists for them."*

What comes back is not a framework. It is a running system, with named seats, named owners, and a scorecard that includes agents alongside humans. That is the difference between advice and an operating model.

---

*Series: AI CIO. Post 18 of an in-progress series.*
