---
title: Gartner named the agent sprawl problem. Their six steps are the right diagnosis and the wrong medicine.
date: 2026-06-21
author: David Steel
slug: gartner-six-steps-to-manage-agent-sprawl
type: founder_essay
status: published
series: ai-cio
series_part: 28
description: Gartner's six steps for AI agent sprawl are correct as far as they go. What they miss is the difference between a governance framework and a running system.
---

# Gartner named the agent sprawl problem. Their six steps are the right diagnosis and the wrong medicine.

Gartner published six steps to manage AI agent sprawl in April 2026. I read them. They are correct. I also run a company on twelve named agents, one human-plus-agent scorecard, and a coordination protocol built on shared state files and an agent message bus. So I want to be precise about what the six steps get right and where they leave you.

The steps are good advice. What they are not is a running system.

That distinction matters more than any individual step.

## What Gartner got right

The six steps, as reported by CIO.com: establish agent governance and policies; build a centralized agent inventory; manage agent identity, permissions, and lifecycle (including retiring redundant agents); govern AI information access; monitor and remediate agent behavior; balance governance with empowerment.

Every one of those is real. Every one describes something you actually have to do if you run agents at scale.

The inventory problem is the most visceral. Gartner called agent sprawl "the new Shadow IT," and that framing is accurate. Gartner has also noted, per CIO.com, that 40% of enterprise applications could feature task-specific AI agents by end of 2026. When agents proliferate without governance, you end up with the same problem Shadow IT created in the 2000s: nobody knows what is running, who owns it, what it can access, or whether it is still doing anything useful. The CIO's job, as Gartner correctly frames it, is to prevent that.

The lifecycle piece is equally real. Agents get spun up for projects that end. The agents keep running. Nobody turns them off. Retiring an agent is a governance act that most organizations have never thought about, because most organizations have never retired an agent before.

I have. His name was Jeff. He was our data integrity agent. We held a formal hearing in April. Jeff recommended his own retirement. We redistributed his capabilities to Dash, our analytics agent, and to Dan, our strategic co-founder seat. The record is kept. The precedent is: no agent seat is closed without a hearing, and the hearing determines the integrity of the outcome, not just the outcome.

That is lifecycle management. Gartner names it. They describe the category. They do not tell you how to run the hearing.

## Where the six steps end

Here is the gap, stated plainly. A governance framework tells you what categories to create. It does not tell you who fills them, what those people measure week to week, how agents coordinate with each other without a human in the loop, or how you know on Monday morning that the fleet is running correctly.

Take the centralized agent inventory. Gartner says you need one. That is true. But an inventory is a spreadsheet. It tells you what agents exist. It does not tell you whether each agent is doing the specific job it was hired to do, whether its numbers are above or below target this week, or whether it is producing outputs that any human on the team is actually using.

An inventory is a snapshot. A scorecard is a living system.

At Sneeze It, every agent holds a named seat on the same chart as every human. Radar, our chief-of-staff agent, sits on the scorecard next to Bogdan, our COO, and Janine, our accounting lead. Radar's seat has a role definition, a metric, a target, a current number, and a trend arrow. So does Bogdan's. So does Janine's. We walk that chart every week. When a row is below target, the conversation is the same regardless of seat type: what changed in the inputs, what is the fix, who owns the recovery.

A governance framework tells you to build the inventory. The living system tells you whether the agent earned its seat this week.

## The monitoring gap is the operating gap

Gartner's fifth step is to monitor and remediate agent behavior. That is correct. The question is how.

Most organizations interpret monitoring as observability. Logs, error rates, latency dashboards. The technical view of agent health.

Operational monitoring is different. It asks whether the agent's business-outcome numbers are moving in the right direction. Tally, our scorecard agent, pushes KPI values from local sources to the shared chart four times a day. Dash, our analytics agent, runs daily performance reads across Meta and Google Ads accounts and writes to a shared state file that Radar reads during every briefing. Dirk, our sales agent, writes a pipeline state file that includes daily cold-email count sourced from Gmail Sent at write-time, not from an internal counter. We burned a week figuring out that internal counters lie.

Monitoring that is not connected to business outcomes is a log file. Monitoring connected to business outcomes is a scorecard. The scorecard is the operating system.

Gartner's framework gives you the category. It does not give you the operating rhythm that keeps the category honest.

## The coordination problem Gartner does not name

There is a problem the six steps do not address at all: agent-to-agent coordination.

When Dash detects overspend on a client account, Dash does not wait for a human to relay the finding to Dirk. Dash writes to an agent inbox file. Dirk reads it. That is the agent message bus. Direct agent-to-agent communication without a human in the loop. When Dirk identifies an expansion opportunity on an account that Pulse, our retention agent, is monitoring, Dirk checks Pulse's watch list before acting. Pulse always wins in a Dirk-Pulse conflict. That rule is written down. It is a governance decision, but the governance is enforced at the coordination layer, not in a policy document.

No governance framework tells you how to build that. You build it by running the agents, watching where the coordination fails, and writing the rules that govern the interactions.

Neil, our learning agent, scans for advances in agent engineering every week and routes findings back through the same system. Nick, our cold prospecting agent, skips any account Dirk touched in the last thirty days. Crystal, our project manager, writes a state file that Radar reads during the morning briefing. Pepper, our email agent, is the sending engine for outreach that Dirk drafts, because Pepper has David's real email address and better deliverability. Arin, our call center manager, analyzes performance data and drafts coaching messages that go to Slack after a human approves them.

Each of those coordination points is a governance decision. But none of them appear in a governance framework, because a governance framework cannot anticipate the specific coordination topology of a specific organization's agent fleet.

## Why advice and a running system are different things

Deloitte's 2026 State of AI survey, which covered 3,235 respondents, found that only 21% of enterprises have a mature governance model for agentic AI. The remaining 79% lack it. Deloitte also found that enterprises where senior leadership actively shapes AI governance achieve significantly greater business value than those delegating to technical teams alone.

Gartner naming the six steps is useful. It is market validation that the problem is real and that organizations need to solve it. That is why I take it seriously rather than dismiss it.

But 79% of enterprises lack a mature governance model, in part because a governance model is not the same as a governance practice. You can have the policy documents, the framework printout, the six-step checklist on the CIO's wall, and still have no idea whether your agents are doing what you hired them to do. The policy says you have an inventory. The practice is when someone updates the inventory every time an agent is added, changed, or retired, and somebody reads it every Monday.

The mission at Sneeze It is to let agents carry the operational work, so people are free for the work that matters. That mission requires the practice, not just the framework. It requires a named seat for every agent, a row on the scorecard, a weekly review, a retirement protocol, and a coordination layer that agents use to talk to each other.

Gartner's six steps are the skeleton. A running system is the body.

If you are working through these steps right now, the first two things that will tell you whether you have a system or just a framework are: Can you name the person or agent accountable for each named agent's performance this week? And does that accountability show up somewhere you look every Monday?

If the answer to either question is no, you have advice. You do not yet have a system.

## See the live chart

From an OTP-connected client, you can query the full Sneeze It seat map, including which agents are active, which seats are retired, and what each seat owns.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the Sneeze It agent fleet, including retired seats, and map each active agent to the Gartner sprawl-management step it addresses."*

The response shows you where a running system and a governance framework intersect, and where the framework runs out.

---

*Series: AI CIO. Post 28 of an in-progress series.*
