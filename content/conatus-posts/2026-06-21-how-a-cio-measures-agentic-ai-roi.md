---
title: The ROI question for agentic AI does not have an answer yet because most CIOs are measuring the wrong thing
date: 2026-06-21
author: David Steel
slug: how-a-cio-measures-agentic-ai-roi
type: founder_essay
status: published
series: ai-cio
series_part: 26
description: Why agent ROI keeps coming back undefined, and what the before/after looks like when you measure the seat instead of the tool.
---

# The ROI question for agentic AI does not have an answer yet because most CIOs are measuring the wrong thing

Every CIO I talk to wants the same thing: a defensible number they can take to the board.

The agentic AI budget got approved. Agents are running. The board wants to know what the return is. And the CIO is staring at tokens consumed, tasks completed, model calls per hour. None of it maps to anything the board cares about.

That is not a measurement problem. That is an architecture problem.

Here is what the before looks like, and what the after looks like when you fix it.

## Before: measuring agents as infrastructure

Before most organizations fix this, agent measurement looks like IT instrumentation. A latency dashboard. A token-cost dashboard. A "tasks completed per day" metric the platform vendor provided because it was easy to instrument. Maybe a model quality score. Agent utilization rates somewhere in a data team chart.

None of it answers the board's question.

The board is not asking how many tokens the agent consumed. They are asking whether revenue went up, whether costs came down, whether client retention improved. The instrumentation dashboard cannot answer those questions because it was never pointed at them.

The deeper problem: agent metrics live on a separate surface from human metrics. The agents are tracked in the AI platform console. The humans are tracked in the CRM. Nobody has a row on the same scorecard that shows both.

That separation is where ROI goes to die. You cannot trace what you cannot see on the same surface. The causal chain between what the agent does and what the business produces stays invisible.

The Deloitte State of AI in the Enterprise 2026 (n=3,235) found that only 21 percent of companies have a mature governance model for agentic AI. An even smaller number have measurement systems that connect agent activity to business outcomes. The governance gap and the measurement gap are the same gap in different clothes.

## What the right unit of measurement is

The right unit of measurement for agentic AI ROI is not the agent. It is the seat.

A seat is a named role on an org chart with a defined scope, a clear owner, and a set of business metrics the role is accountable for. When an agent fills a seat, it inherits all of that: scope, accountability, metrics, and a row on the scorecard.

When you measure an agent-as-infrastructure, you measure what the model does. Tokens. Latency. Outputs per unit of compute. Those are engineering metrics. They tell you whether the agent is running. They do not tell you whether the business is better.

When you measure an agent-as-seat, you measure what the role delivers. A sales development seat: qualified meetings booked per week. A client-retention seat: 90-day retention rate. A data analyst seat: insights delivered and the decisions those insights informed. Business metrics. On the same dashboard as the human metrics. Answering the board's actual question.

At Sneeze It, every agent holds a named seat with one-seat-one-owner discipline. Radar, our chief-of-staff agent, tracks briefing completeness and task-to-calendar alignment. Dash, our analytics agent, tracks insights delivered across 39-plus ad accounts. Tally, our scorecard agent, tracks KPI data freshness. Dirk, our sales agent, tracks outreach volume, pipeline created, and qualified meetings booked.

None of those metrics live in an AI platform console. All of them sit on the Monday dashboard next to Bogdan (our COO), Janine (accounting), and Kristen (creative). Same dashboard. Same cadence. Same conversation.

When the board asks what the ROI is, I point to a row: this seat did not exist eighteen months ago, it now does this work, here is what it produces each week. That is a number they understand because it is the same kind of number they have always understood.

## The before/after of a real seat

Take Dirk. Before Dirk existed, cold prospecting either was not happening or was happening inconsistently. The human time required to run outbound at volume was not available.

After: the seat runs prospecting continuously. Cold emails sent per week, valid contacts reached, qualified meetings booked. The seat publishes its own numbers. When they drop, the conversation about why happens at the same Monday meeting where every other number lives.

Before: no seat, no metrics, no accountability, no compounding.

After: a named seat, business metrics, weekly accountability, traceable pipeline contribution.

The ROI is not "Dirk's model produced X outputs." It is "the prospecting seat that did not exist now produces Y qualified meetings per week, worth Z in pipeline." Tokens cannot get you to that sentence. Seats can.

## What MIT CISR's maturity research actually says

MIT CISR's Enterprise AI Maturity research (Woerner, Sebastian, Weill, Kaganer, 2025) found that Stage 4 firms run 13.9 percentage points higher growth and 9.9 points higher profitability above industry average. Stage 1 firms run 26.5 points below.

The gap does not come from better models. It comes from what CISR calls "developing AI ways of working" at Stage 3. Not a capability. An operating model. The firms that outperform built accountability structures for how humans and agents work together.

CISR's digital-colleagues research puts it plainly: "human accountability will be non-negotiable." The CIO is most likely to own the measurement infrastructure that makes that accountability real. Token dashboards cannot deliver it. Seat-level metrics on a unified scorecard can.

## Gartner naming the problem is market validation, not competition

Gartner, as reported by CIO.com, has published a Six Steps to Manage AI Agent Sprawl framework and calls agent sprawl "the new Shadow IT." Two of the six steps: build a centralized agent inventory with lifecycle management including retirement, and monitor and remediate agent behavior.

This is the advisory layer naming the problem. It is not a solution.

A framework that says "monitor agent behavior" does not tell you what metric to monitor, what dashboard it lives on, or how to trace agent behavior to business outcomes. It is governance advice. Good advice. Incomplete without an operating system underneath it.

The business schools teach strategy and governance and how to build one agent (CMU's LEAAID certificate gets closest). The advisory firms publish frameworks. Neither gives you a running system where every agent holds a named seat on a live chart, with a row on the Monday scorecard, with a human accountable for that seat's performance. That operating layer is the gap.

## The governance/ROI equivalence

The Deloitte survey adds one more finding: "Enterprises where senior leadership actively shapes AI governance achieve significantly greater business value than those delegating to technical teams alone."

Governance and ROI are not separate disciplines. They are the same discipline from two directions.

A seat-level measurement system is governance. Defined scope. Traceable metrics. Clear accountability. A lifecycle that includes retirement (we retired Jeff, our data integrity agent, in April after a formal review that redistributed his capabilities to three other seats). The board can see the chart and ask about any row.

Without that system, governance is a policy document and ROI is a token bill.

A unified scorecard lets agents carry the operational work, so people are free for the work that matters. That is what the board's ROI question is actually asking for. Not a token count. A live chart.

## See the live chart

From any OTP-connected client, you can query the Sneeze It agent-fleet scorecard by seat: which seat, which metrics, which targets, current performance, and trend direction.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the Sneeze It agent seats and the business metrics each seat is accountable for."*

What you get back is a live operating chart, not a slide deck, not an advisory framework. Every seat named, every metric live. That is what seat-level ROI measurement looks like when it is actually running.
