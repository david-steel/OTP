---
title: Data readiness has to come before agents because agents amplify whatever your data already is
date: 2026-06-21
author: David Steel
slug: data-readiness-before-you-deploy-agents
type: founder_essay
status: published
series: ai-cio
series_part: 43
description: Six things your data infrastructure must answer before you deploy an AI agent, and what happens when you skip the check.
---

# Data readiness has to come before agents because agents amplify whatever your data already is

Most CIOs approach data readiness as a condition they will get to eventually, after a few agents are already running. The logic feels sound: start small, prove value, then invest in cleaning the pipes.

The logic is backward.

Agents do not just consume data. They act on it, at scale, in minutes, without a human second-guessing every output. A bad human analyst delivers one bad report. A bad agent delivers the same bad analysis to every downstream seat, every day, autonomously. The failure multiplies before anyone notices.

Data readiness is not a pre-deployment formality. It is the engineering work that determines whether your agents are accelerants or liabilities.

Here is what I mean in practice, worked out through six questions we use at Sneeze It before any agent goes live.

## 1. Can the agent find a single authoritative record, or will it always be choosing between versions?

This is the most basic test and the one most organizations fail on first pass.

We run Dash, our analytics agent, off the CCM-Stats Template V5, a single Google Sheet that is the source of truth for call center and advertising performance. Before Dash went live, we had three versions of that data across three different tools, none of them synchronized. Dash would have reported whichever version it happened to reach first.

If your agent has to reconcile competing records before it can do its actual job, it is spending half its reasoning capacity on data arbitration instead of analysis. The agent gets dumber and slower. The fix does not happen at the agent layer. It happens at the data layer, before deployment.

The question to ask before any agent goes live: if the agent searches for this fact right now, does one authoritative record come back, or three?

## 2. Is the data accessible in a format the agent can read without custom parsing every time?

Agents are good at structured, queryable data. They are expensive (in tokens and latency) when they have to parse unstructured data before they can think about it.

When we built Arin, our call center manager agent, the CCM data was buried in multi-tab Google Sheets with merged cells, color-coded ranges, and formulas that only made sense if you knew which column to sum. Arin could technically read it. Reading it consumed so much context that the actual coaching analysis was shallow.

We reformatted the data before Arin went live. Not cleaned in a software-engineering sense. Reformatted so that the rows and columns Arin needed were flat, labeled, and directly accessible. Arin's performance improved not because we changed anything about Arin, but because we changed how the data was presented to the agent.

This is the rule: data that a human can figure out with context is not necessarily data an agent can figure out efficiently. Before deployment, test how many tokens it costs the agent just to read the data. If the read is expensive, fix the structure.

## 3. Is there a timestamp on every record, and does the agent know when the data was last refreshed?

Agents running on stale data do not know they are running on stale data unless you tell them.

Every pre-computed file in our shared-state architecture carries a timestamp. When Radar, our chief-of-staff agent, compiles the morning briefing, it checks each source file against an 18-hour freshness window. If the data is older than 18 hours, the briefing flags it explicitly rather than presenting stale numbers as current.

Deloitte's 2026 State of AI in the Enterprise study (n=3,235) found that only 21% of organizations have a mature governance model for agentic AI. Staleness handling is a governance question, not just an engineering question. An agent that presents last week's pipeline as today's pipeline is not a data problem. It is a governance gap. The fix is a freshness policy, enforced at the data layer, before the agent is reading anything.

Ask before deployment: what is the stated freshness window for this data source, and does the agent surface a warning when that window expires?

## 4. Does the data include the context the agent needs to interpret it correctly, or just the raw numbers?

Raw numbers without context produce confident wrong analysis.

Before Dirk, our sales agent, was reading the GHL pipeline, we had to decide what context to include alongside each deal record. Deal stage alone told Dirk very little. We had to add date of last activity, number of days in current stage, and the proposal status from Proposify, before Dirk could reliably distinguish a deal that was progressing slowly from a deal that was dead.

The agents we have seen fail at other companies were not failing because the models were bad. They were failing because the data they were reading told half the story. An agent that sees a "Proposal Sent" stage but no activity date cannot know whether the proposal was sent yesterday or eight months ago. Without that context, Dirk would have told us a healthy pipeline story that was actually a dead-deal cemetery.

Before deployment, walk through the fields the agent will read and ask: what would a competent human analyst need alongside this number to interpret it correctly? Add those fields. This is data context enrichment, and it is done before the agent goes live, not after it starts producing bad analysis.

## 5. Are the access boundaries clear, and does the agent know what it cannot read?

An agent with access to the wrong data is a liability, not an asset. An agent with access to more data than its job requires amplifies the scope of any error it makes.

We keep Pepper, our email agent, scoped strictly to the domains in a whitelist file. Pepper never reads email from accounts not on that list, even if those messages are technically accessible. This is not a technical limitation. It is a deliberate data access policy that we set before Pepper ran a single triage session.

The same principle applies to Crystal, our project management agent, and the Accelo data she reads. Crystal reads job, milestone, and task data. Crystal does not read client billing data, even though Accelo contains it. The boundary is set at the data architecture level.

Gartner, as reported by CIO.com, names this as step four in managing agent sprawl: AI information governance. That means scoping what each agent can read and enforcing those scopes before the agent is operational, not after a breach or an embarrassing leak reveals that the agent was reading things it should not have.

Ask before deployment: is this agent's data access scoped to exactly what the seat requires, and is that scope enforced at the data layer?

## 6. Is there a correction loop so the agent learns when its data interpretation was wrong?

Data readiness is not a one-time pre-deployment checklist. It is a continuous discipline.

Neil, our learning agent, runs a frontier scan that includes flagging when other agents' outputs were corrected. When Dash's analysis produces a number that David corrects, that correction goes into OTP as a learning. The learning informs how the data is interpreted next time. This is the correction loop that makes the data infrastructure smarter over time.

MIT CISR's enterprise AI maturity research found that the biggest performance jump in agentic AI comes in the move from pilot to scaled deployment. Stage 4 organizations, those that have developed what CISR calls AI ways of working, post 13.9 percentage points of additional growth above industry average compared to Stage 1. The correction loop is part of what creates that discipline. It is not about better models. It is about better data governance that feeds back into agent behavior.

Before deployment, define where corrections go and how they update the data layer or the agent's operating rules. Without that loop, every mistake is learned once by a human and then repeated by the agent forever.

## Why the order matters

The goal of all of this is to let agents carry the operational work, so people are free for the work that matters.

That goal fails when the agents are doing operational work on bad data. They are not carrying the work. They are amplifying the dysfunction.

At Sneeze It, we run one chart with one seat per owner: Bogdan and Janine and Kristen on the human side; Dash and Dirk and Pulse and Tally and Pepper and Crystal and Arin and Neil on the agent side. Every seat, human and agent, depends on the same data infrastructure. When that infrastructure is solid, the agents accelerate everything. When it is not, the agents make the mess run faster.

Data readiness is not glamorous work. There is no demo to show for it. But every agent deployment that has worked at Sneeze It started with someone answering these six questions honestly before writing a single line of agent logic.

Get the data right first. Then give the agents something worth running on.

## See the live chart

The OTP MCP exposes which data sources each Sneeze It seat reads, including staleness windows and access scopes, queryable in real time.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to list the active agent seats at sneeze-it and the data sources each one depends on."*

What comes back is a live view of the data architecture that backs a running hybrid org. Compare it to what you know about your own agents' data dependencies and see where the gaps are.
