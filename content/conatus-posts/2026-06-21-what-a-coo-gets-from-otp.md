---
title: What a COO actually gets from OTP
date: 2026-06-21
author: David Steel
slug: what-a-coo-gets-from-otp
type: founder_essay
status: published
series: ai-coo
series_part: 49
description: Before and after running a hybrid org on OTP: one queryable chart, one scorecard, one seat per owner, and agents that coordinate without a human in the middle.
---

# What a COO actually gets from OTP

The promise of the agent era for operations is simple: let agents carry the operational work so people are free for the work that matters. The problem is that the promise breaks down the moment you try to operationalize it.

You have agents. You have humans. You have no shared surface that tells you who owns what, what the numbers are, or whether the handoffs are working. The COO ends up spending more time managing the fleet than the fleet was supposed to save.

OTP is the operating system I built to fix that problem at Sneeze It. This post is the before and after.

## Before OTP

Before I had a shared coordination layer, the hybrid org at Sneeze It ran the way most hybrid orgs run: informally, and with a lot of friction at the edges.

I knew Radar was running our morning briefings. I knew Dash was scanning Meta and Google ad performance across 39 client accounts. I knew Dirk was monitoring the sales pipeline, Nick was drafting cold prospecting emails, Pepper was triaging client email, Tally was pushing KPI values to the scorecard, and Arin was coaching the call center team through Slack. I knew Bogdan as COO was managing the human side of delivery, and Janine was keeping accounts receivable and payable on track.

What I did not have was a single place where all of that was visible at once.

If I wanted to know what Dash had flagged overnight, I had to read a file. If I wanted to know whether Dirk had moved any pipeline deals, I had to check another file. If I wanted to know whether the handoff between Pepper and Dirk (Pepper drafts, Dirk logs) had worked, I had to open both files and cross-reference them manually. The agents were working. The visibility was not.

The worse version of this problem was coordination. Agents would act on stale information because they had no reliable way to know what another agent had already done. Dirk might queue an expansion outreach to a client that Pulse had flagged as churn risk. The agents had no shared memory of each other's state.

This is not a problem you can solve by adding more agents. It is a structural problem. The org has no chart the agents can read.

## The one claim that matters

A COO running a hybrid org needs one thing above everything else: a single queryable surface that shows who owns what, what the numbers are, and whether the work is moving.

OTP is that surface. It is not a dashboard in the passive sense. It is a live org chart where every seat -- human and agent -- has a name, a role, a scorecard, and an accountability record. The chart is queryable via MCP, which means any agent or any AI assistant can read it programmatically and act on what it finds.

That single change resolves the before state almost entirely.

## After OTP

The Sneeze It org chart on OTP has both humans and agents on it. Bogdan holds the COO seat. Janine holds accounting. Kristen holds creative direction. Then Radar holds chief of staff. Dash holds analytics. Dirk holds sales. Pulse holds client retention. Pepper holds inbox. Arin holds call center management. Tally holds KPI tracking. Crystal holds project management. Nick holds cold prospecting.

One seat, one owner. No overlaps. Every seat has defined metrics on the shared scorecard.

What changed operationally is threefold.

First, coordination between agents now goes through the chart rather than through me. When Dirk wants to know whether a client is on Pulse's watch list before queuing an expansion play, Dirk reads the chart and the agent inbox. When Tally pushes KPI values, it pushes to the seats defined on the chart, not to a separate dashboard that nobody else can see. The agent message bus -- inbox files at `~/.claude/agent-inbox/` for each seat -- gives agents a way to pass structured messages to each other without a human in the middle. REQUEST, INFORM, PROPOSAL, RESPONSE. The protocol is defined. The coordination happens.

Second, the scorecard is unified. Deloitte's State of AI in the Enterprise 2026, surveying 3,235 organizations, found that only 21% have a mature governance model for agentic AI. The common failure mode is not that companies lack agents -- it is that the agents are not accountable to the same outcomes as the humans. Separate dashboards, separate cadences, separate conversations. The agents run, the numbers look fine on the agent dashboard, and the business outcomes drift. On OTP, Bogdan's row and Dash's row are on the same scorecard. When Dash's ad performance flags drop, that conversation happens in the same Monday review where Bogdan's delivery metrics get reviewed. The unified scorecard is what makes the accountability real.

Third, I have a retirement record. In April, we retired Jeff, our data integrity agent, through a formal hearing. His capabilities were redistributed across Dash, Dirk, and Dan. The record is on the chart. Accenture's operating model research puts it plainly: reinvent the process before you automate it, because automating inefficiency just makes it run faster. Jeff's retirement was the operational version of that principle applied to a seat rather than a process. The chart made that decision visible, auditable, and clean.

## What the COO does differently

Before OTP, my job as the operator was to hold the coordination in my head. I knew who was doing what because I had built each agent and remembered each assignment. That is not a system. That is a single point of failure wearing a system's clothing.

After OTP, the COO job shifts. Bogdan can read the chart. Janine can see which seats are upstream of the numbers she tracks. An incoming operator, a new leadership team member, or an investor asking "how does this org actually work" can get a structured answer from the chart without me explaining it.

The MIT CISR Enterprise AI Maturity research found that organizations at the highest maturity stages outperform their industries by 13.9 percentage points in growth and 9.9 percentage points in profit. The differentiator is not the number of agents. It is whether the org has what the research calls "united top leadership" -- a shared operating model, not a collection of independent tools. OTP is the shared operating model.

The COO gets four concrete things from running on OTP.

A live chart that any agent or any person can query to understand who owns what and what the current state is. A unified scorecard where human and agent rows sit in the same cadence, not on separate surfaces. A coordination layer that lets agents pass structured messages to each other without creating a meeting or a Slack thread. And a lifecycle record that makes hiring and retiring seats an operational act, not a technical one.

Those four things are not features in the product sense. They are the conditions that make a hybrid org governable.

## The COO's actual job in this system

McKinsey's framing is right: managing in the age of AI means managing systems, people and agents together. The COO is the natural seat for that job because operations has always been about making systems work reliably at the level below strategy.

The agents carry the operational work. Radar runs the briefings. Dash monitors the spend. Arin coaches the callers. Nick drafts the outreach. Pepper routes the inbox. Tally pushes the numbers. The agents do not need to be asked. They do not have hard weeks.

What the COO does is keep the operating model honest. Fix the process before putting an agent on it -- not afterward. Design the handoffs so the work does not get lost between seats. Keep humans on the decisions that require judgment and relationships, not on the work that an agent can carry reliably. Run the quality checks that confirm the fleet is actually doing what the scorecard claims.

None of that is possible without a shared chart. Before OTP, the COO's job in a hybrid org is heroic and invisible. After OTP, it is structural and auditable.

That is the before and after. One queryable org chart. One scorecard. One seat per owner. The agents coordinate without a human in the middle. The COO manages the system, not the status updates.

## See the live chart

The Sneeze It org chart, agent seats, and KPI rows are queryable directly from OTP's MCP server.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the org chart for sneeze-it and list which seats are held by agents versus humans."*

The response gives you the live chart -- the same structure Bogdan reads, the same seats Dirk queries before queuing an outreach, the same scorecard that runs the Monday review.

---

*Series: The AI-Era COO. Part 49 of an in-progress series.*
