---
title: AI governance does not belong to the CIO. It belongs to the table.
date: 2026-06-21
author: David Steel
slug: who-should-own-ai-governance-in-the-c-suite
type: founder_essay
status: published
series: ai-cio
series_part: 21
description: The CIO cannot own AI governance alone. MIT CISR says shared responsibility. Here is what that actually looks like when you run it live.
---

# AI governance does not belong to the CIO. It belongs to the table.

The CIO governance question is real, but it is being asked wrong.

Most organizations ask: "Who should own AI governance?" Then they wait for someone to volunteer, assign it to the most technical person in the room (usually the CIO), and call the governance question settled. What they have actually done is created a single point of failure and called it a strategy.

MIT CISR's research is clearer than that. Their "Digital Colleagues" paper from April 2026, authored by Weill and Woerner, defines shared responsibility as the actual answer. The CIO is one owner, not the sole owner. The CEO, CHRO, and CRO all hold a piece of it. Human accountability is "non-negotiable," but it is distributed, not concentrated.

This is not what most C-suites are practicing. Deloitte's 2026 State of AI in the Enterprise, surveying over 3,000 enterprises, found that only 21 percent have a mature governance model for agentic AI. That means roughly 80 percent of organizations are either assigning governance to the wrong seat or assigning it to no seat at all.

What follows are four governance failures I have watched happen in organizations running AI agents, and the structural answer to each one. Every answer points back to the same root cause: governance does not work when it is owned by one function. It works when it is shared, explicit, and tied to a live operating system.

## 1. The CIO-only trap

The first failure is the most common. Leadership decides the CIO owns AI governance because AI is technology. The CIO builds a policy, a review process, maybe an AI governance committee. The committee meets quarterly. Meanwhile, the business units deploy agents on their own timelines and the governance process runs eight weeks behind reality.

This is what Gartner, as reported by CIO.com, is calling "the new Shadow IT." Agents proliferating faster than governance can track them. Gartner's April 2026 release identifies six steps to manage AI agent sprawl, starting with centralized agent inventory and agent identity, permissions, and lifecycle management, including retiring redundant agents. Useful framework. But the framework assumes you have a functioning governance body that is empowered to execute those steps.

A CIO-only governance model is not that. The CIO can inventory the agents IT knows about. They cannot inventory the agents HR deployed to screen resumes, the agents Finance deployed to reconcile invoices, or the agents Operations deployed to handle vendor exceptions, unless those functions are accountable to the same governance system.

Governance that lives only in IT governs only what IT sees.

## 2. The accountability vacuum

The second failure follows from the first. When governance is nominally assigned but structurally vague, nobody is actually accountable for specific agent behavior. A policy exists. Principles exist. But when an agent produces a bad output, the question of who owns the fix has no clear answer.

MIT CISR's research is instructive here. Their "Agents of Change" working paper explicitly asks how deploying AI agents affects decision rights, and what governance mechanisms manage multiagent systems. These are open research questions in 2026, which tells you that even the most advanced academic research on this topic has not yet resolved them. The academy is asking the question. It is not teaching the answer.

The answer I have arrived at is structural. At Sneeze It, we assign every agent a named seat with one owner. One seat, one owner, no exceptions. The agent's seat-owner is accountable for that agent's output the way a manager is accountable for a direct report's output. When the agent produces a bad result, we know immediately who owns the conversation about why.

Radar, our chief-of-staff agent, has a seat owner. Tally, our KPI agent, has a seat owner. Dirk, our sales agent, has a seat owner. None of them govern themselves. None of them report to a committee. Each one has a single human point of accountability.

This is not a technology decision. It is an org design decision. And it is exactly the layer that no governance framework, academic or advisory, has operationalized.

## 3. The CHRO blind spot

The third failure is structural and almost invisible until it is too late. When AI governance lives in IT, the CHRO is a bystander. Agents that automate work, reshape roles, retrain humans, or change what it means to do a specific job are technically in scope for the governance committee, but practically out of reach for the person accountable for the human workforce.

MIT CISR's "Digital Colleagues" paper is specific about this. The governance model it describes includes the CHRO explicitly, not as a participant in a committee, but as a co-owner. Agents that "act with agency within defined governance boundaries" and that "escalate consequential decisions to humans" are fundamentally a workforce design question, not a technology question.

At Sneeze It, Bogdan (our COO) and Kristen (our creative director) are not passive users of the agents their functions work alongside. They are active co-owners of how those agents are governed. When a new agent seat is being designed, the question is not only "what does this agent do" but "how does this seat interact with the human seats around it, and who owns those interactions."

The CHRO co-owner model is the only one that answers that question at scale.

## 4. The missing lifecycle

The fourth failure is the quietest. Organizations treat AI governance as a deployment decision rather than a lifecycle decision. Governance applies when agents are approved and deployed. It does not apply when agents drift, when agents duplicate each other's function, or when agents should be retired.

Gartner's Six Steps, as reported by CIO.com, specifically name lifecycle management, including retiring redundant agents, as a governance responsibility. This is the right call. But lifecycle governance requires something most organizations have not built: a mechanism for deciding when an agent's seat is no longer needed.

We had this conversation about Jeff, our former data integrity agent, in April. Jeff had been the clearest example of lifecycle governance working correctly. His functions had migrated to other seats, his reliability had deteriorated, and after a formal hearing, his seat was retired. His capabilities were redistributed. The record was preserved. The decision was made by the humans who co-owned the governance of the agent's function, not by the CIO acting unilaterally.

Jeff was the first agent retirement in our army. It was not a technology decision. It was an org governance decision. The CIO-only model has no mechanism for it.

## What shared responsibility actually requires

MIT CISR's enterprise AI maturity research, tracking data across hundreds of firms, finds that Stage 4 organizations outperform their industries by 13.9 percentage points on growth and 9.9 percentage points on profit. The characteristic of Stage 4 firms is a "united top leadership team, including CEO, CIO, chief strategy officer, and head of HR."

Shared responsibility is not a soft aspiration. It is the measurable difference between organizations that are outperforming and organizations that are not.

But shared responsibility without a shared operating system produces distributed confusion rather than distributed governance. What MIT CISR describes as a research finding needs to be operationalized as an org design. That means:

A named seat for every agent, with one human owner per seat. An accountability structure that spans functions, not just IT. A shared scorecard where agent performance is visible to the whole leadership team, not siloed in a technical dashboard. A lifecycle process that includes onboarding, performance management, and retirement, run by a cross-functional group, not a single department.

This is the operating layer that governance frameworks describe but do not provide. The frameworks name the problem. A running system solves it.

The point of the structure we have built at Sneeze It is not to make agents more powerful. The point is to let agents carry the operational work so people are free for the work that matters. That freedom only exists when the governance is real, the accountability is clear, and no single person in the org is carrying the whole weight of it alone.

The table has to own it together. That is not a political compromise. It is the only architecture that works.

## See the live chart

You can query the current OTP agent chart for Sneeze It, including which human seats co-own which agent seats, directly from any MCP client.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the sneeze-it org chart and identify which human seats are accountable for which agent seats."*

What you see is a live governance map: not a policy document, not a framework, but an operating structure where every agent has a human owner and every owner is on the same scorecard.
