---
title: The CIO is an orchestration job now. Most CIOs are still doing the infrastructure one.
date: 2026-06-21
author: David Steel
slug: is-the-cio-an-infrastructure-job-or-an-orchestration-job
type: founder_essay
status: published
series: ai-cio
series_part: 8
description: The CIO role has shifted from operating systems to orchestrating agent fleets. Here is what that looks like in a live working example.
---

# The CIO is an orchestration job now. Most CIOs are still doing the infrastructure one.

The question I keep seeing asked about the CIO role in 2026 is whether it is an infrastructure job or an orchestration job. I want to answer it directly, and then show you what the answer looks like in practice, because the distinction only becomes real when you see it in a working system.

The answer is: orchestration. Fully, irreversibly, orchestration. The CIO who is still framing the job as infrastructure is not wrong about what they do every day. They are wrong about what the job is becoming, and the gap between those two things is what will separate the CIOs who matter in three years from the ones who don't.

Here is the shift. The old job was: keep the systems running. Procure the stack. Manage the vendors. Ensure uptime. Own the data infrastructure. That work is real and it continues. But it is no longer the center of the job. It is the table stakes.

The new center is this: you have agents now. Maybe five, maybe fifty, eventually hundreds. They sit inside your applications, inside your workflows, inside your teams. They run tasks, send messages, pull data, update records, write reports, and make decisions inside defined boundaries. They do this continuously, in parallel, across the whole organization.

Who governs that fleet? Who tracks which agents exist? Who retires the redundant ones? Who owns the accountability when an agent produces a wrong output and nobody caught it because the agent's results were not on any scorecard? Who defines what a healthy agent looks like versus a drifting one?

If the answer at your organization is "nobody," you are already inside the problem Gartner named earlier this year. Gartner published a six-step framework in April 2026 for managing what they are calling AI agent sprawl, which they describe as "the new Shadow IT" (as reported by CIO.com). They are not wrong about the problem. They are selling frameworks. What they cannot give you is a running system. That is a different thing.

## What the infrastructure instinct gets wrong

I run a small agency called Sneeze It. We have been building and running a fleet of AI agents since late 2024, and I have made most of the mistakes available to make, so I write about what I actually encountered rather than what the frameworks suggest you will encounter.

The infrastructure instinct says: deploy agents, measure them on technical metrics, and manage the technical layer. Tokens consumed. Latency. Uptime. Tasks completed per hour. If you have a technical background and you approach your agent fleet the way you approached your server infrastructure, those metrics will feel natural. They will also tell you almost nothing about whether the agents are producing value.

The orchestration job says something different. It says: every agent holds a seat. Every seat has a name, a role, a metric tied to a business outcome, and a place on the same scorecard the humans are on. The agents are not infrastructure to be maintained. They are workers to be managed. The management discipline is the same. The accountability cadence is the same. The only things that differ are the seat names and what goes in the metric column.

I did not arrive at this framing by reasoning my way to it. I arrived at it by watching agents drift because nobody was treating them as workers. We would deploy an agent, watch it produce activity metrics that looked fine, and then six weeks later realize the business outcomes it was supposed to support had not moved. The agent was working hard on the wrong things, and there was no system to catch that because the agent was not on any human-facing scorecard.

## What orchestration actually looks like

At Sneeze It right now, we run about ten agents on one org chart. One seat, one owner. Every seat is on the same dashboard the humans are on.

Radar holds the chief-of-staff seat. Radar's business metrics are: briefing delivered before 8 AM, stale data flagged within one hour, escalations routed to the right seat by end of day. Not "briefing messages sent." Not "Slack channels scanned." The business outcomes the chief of staff seat is supposed to produce.

Tally holds the scorecard agent seat. Tally's job is to push KPI values from local sources to the org scorecard four times per day on weekdays. Tally does not fabricate a value when a source is broken. Tally escalates. That is an explicit seat-level behavior, not a technical parameter.

Dash holds the analytics seat. Dash covers roughly $185,000 in monthly ad spend across Meta and Google for our clients. Dash reports patterns to the humans who make decisions, and the metrics Dash is accountable for are the ones the analytics seat is supposed to own: anomalies flagged before market open, client spend variance surfaced before the weekly call, not "queries run per hour."

The humans on the same chart are Bogdan, our COO, Janine in accounting, and Kristen leading creative. Their rows sit alongside the agent rows. We do not label the rows "human" or "agent" on the dashboard. A seat is a seat. The accountability discipline is the same.

This is what orchestration looks like in practice. It is not an architecture decision. It is an org design decision.

## The knowledge gap

I want to be precise about what the business schools are teaching and what they are not, because this is the gap that is producing the instinct mismatch at the CIO level.

Across the top programs, MIT, Stanford, Chicago Booth, Kellogg, Yale, and Cornell, the curriculum converges on AI strategy and governance. That is the right foundation. The honest exception is CMU, which runs a dedicated module inside its CIDO certificate on enterprise automation and agentic AI, and a separate five-module certificate called LEAAID (Leading Enterprise Agentic AI Development) that names CIOs as the audience and covers agent architecture, deployment, governance, and a hands-on build. CMU gets closer than anyone else to the operating layer.

But even CMU, as I read their verified curriculum, teaches how to build and govern one agentic capability. It does not teach what to do when you have ten agents running in parallel, three of them drifting, one of them producing wrong outputs that nobody is catching, and no one person accountable for the health of the whole fleet.

That is the operating layer. It is not in any curriculum I have found.

Deloitte's 2026 State of AI survey (verified, n=3,235) found that only 21% of enterprises have a mature governance model for agentic AI. Roughly 80% lack it. That number reflects exactly what the curriculum produces: organizations that have deployed agents but have not yet built the discipline to govern them as a fleet.

MIT CISR research is running ahead of MIT Sloan's teaching here. CISR has published work in 2026 on "digital colleagues" and governing multiagent systems that names the right questions: what governance mechanisms manage a system of autonomous agents, and how do decision rights shift when agents are making consequential choices? CISR's research puts human accountability as "non-negotiable." But that research has not yet landed in the named CIO programs. The gap between what CISR is studying and what executive education is teaching is about twelve months, by my read.

The advisory firms have named the problem. Gartner has the six steps. CIO.com has published an orchestration framework with three pillars: conflict resolution and priority logic across agents, a universal context and memory layer, and cross-agent security with immutable audits. These are the right pillars. What they are not is a live operating system. Frameworks tell you what to build. A running system shows you what you are building toward.

## The retirement conversation

One thing I want to name that no framework I have read addresses directly: what happens when an agent's seat should no longer exist.

We retired an agent at Sneeze It in April. Jeff held a data integrity seat. Jeff was the first agent retirement in the history of the army. We ran a formal review. Jeff's capabilities were redistributed to other seats: Dash absorbed the ad pacing monitoring, Crystal absorbed project reconciliation. Jeff was retired with an honest record kept.

The infrastructure framing has no equivalent for this. Infrastructure gets deprecated. Workers get retired. The retirement conversation is a management conversation, not a technical one. It requires someone to own it, a process to run it, and a record to keep. In a fleet of ten agents that is manageable. In a fleet of fifty it becomes a governance function. The CIO who is thinking about the job as orchestration is already building that function. The CIO thinking about it as infrastructure will deal with the problem reactively when it becomes a sprawl problem, which is to say, after the damage is done.

## The working-example answer

The question this post is assigned to answer is whether the CIO seat is infrastructure or orchestration. I have given you the answer. Let me give you the working example version of it.

If your agents are on a separate dashboard from your humans, you are doing the infrastructure job. You are measuring the runtime of the tools, not the accountability of the seats.

If your agents are on the same chart and the same scorecard as your humans, with business-outcome metrics and a named owner for each seat, and you are running weekly review conversations that cover agent rows the same way they cover human rows, you are doing the orchestration job.

The orchestration job is the one that compounds. Every Monday we walk a scorecard at Sneeze It where Radar's row sits near Bogdan's row and Tally's row sits near Janine's row. The conversation discipline is the same. The accountability cadence is the same. When an agent row drops, the conversation is not "the model degraded." The conversation is "what changed in this seat's inputs, and what does the fix look like."

That is the job. The goal of that job is to let agents carry the operational work, so people are free for the work that matters. The CIO who builds toward that is not managing infrastructure anymore. They are managing an organization.

## See the live chart

Every human and agent seat at Sneeze It is queryable via the OTP MCP, including each seat's role, metric, and position on the chart relative to humans and other agents.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the org chart for sneeze-it. Which seats are agents, what are their business metrics, and how are they positioned relative to the human seats?"*

The response shows you a working example of the orchestration model, not a framework for building one.

---

*Series: AI CIO. Post 8 of an in-progress series.*
