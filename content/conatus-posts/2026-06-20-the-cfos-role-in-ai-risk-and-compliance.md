---
title: The CFO's job in an AI-powered company is not to block the agents. It is to own the risk they create.
date: 2026-06-20
author: David Steel
slug: the-cfos-role-in-ai-risk-and-compliance
type: founder_essay
status: published
series: ai-cfo
series_part: 30
description: AI risk and compliance is not IT's problem. The CFO is the only seat positioned to price it, trace it, and govern it.
---

# The CFO's job in an AI-powered company is not to block the agents. It is to own the risk they create.

Here is the version of this conversation I keep having with operators who are a year or two into running agents.

The agents are working. Revenue is up. Headcount is flat or down. The team is less stressed. Then someone asks what happens if an agent makes a consequential mistake, who is accountable, and whether there is any paper trail. The room goes quiet.

The honest answer for most companies is: nobody owns it, and there is no trail.

That is a finance problem before it is anything else. The CFO is the one seat in any company structure with both the authority and the incentive to price risk, trace accountability, and build the governance around decisions that have financial consequences. If agents are making decisions with financial consequences and the CFO is not involved, there is a gap in the operating structure that will eventually produce a loss.

This is not about slowing the agents down. It is about making the agents auditable.

## What it looked like before

Before we had agents running inside Sneeze It, the risk surface was mostly human. Janine, who owns our accounting and AR, made decisions about payment terms. Bogdan, our COO, made decisions about contracts and commitments. If something went wrong, I could trace the decision back to a person, a conversation, a reason.

The accountability chain was visible because it ran through humans. Humans leave trails. They have inboxes. They have memories. They remember why they decided what they decided, and when they do not, there is usually an email somewhere that does.

When we started running agents, that changed.

Dirk, our sales agent, started making outreach decisions. Tally, our scorecard agent, started pushing numbers to our org chart. Dash, our analytics agent, started generating financial interpretations of ad spend, CPL trends, and budget pacing. None of those decisions ran through a human inbox. They ran through a system.

I did not have a CFO at the time. I was playing the role myself. And the moment I asked "what would happen if Dash called a spend anomaly wrong and we made a decision off it," I did not have a clean answer.

The system was working. The governance was not.

## What the before picture actually cost

The gap did not produce a catastrophic loss, but it did produce something close to one.

Dash flagged a billing event incorrectly. The flag suggested we were missing revenue from one of our HiTone locations. Before anyone confirmed the data, the interpretation had circulated. We were one conversation away from filing an incorrect invoice with a client. What caught it was not a system. It was Janine, cross-referencing her own records, and calling out the discrepancy manually.

That was a near-miss the system was not designed to catch. It caught it through human redundancy, the same redundancy agents are supposed to reduce.

The lesson was not "Dash is dangerous." The lesson was "we have no formal trace between what Dash produces and what Janine acts on, and that gap is a financial risk."

## What the after picture requires

The CFO's role in AI risk and compliance is not a single responsibility. It is four separate ones.

The first is pricing the risk. Every agent that touches a financial decision or a data input that flows into a financial decision is a risk item. The CFO's job is to put a number on what happens if that agent is wrong, how often it could be wrong, and what that costs annually. This is not a technical exercise. It is the same exposure analysis a CFO runs on any operational dependency.

The second is tracing accountability. For every agent output that influences a financial decision, someone human has to be the last stop before that output becomes action. Dash can call the spend anomaly. Janine confirms it before anything moves. Tally can push the KPI. The CFO verifies the source before the number goes into any external report. The trace needs to exist in writing. Agent output to human confirmation to action. That chain is the paper trail.

The third is building the governance. Governance here means a small set of rules: which agent decisions require human confirmation before execution, which agent outputs are reportable without review, and what the escalation path is when an agent produces something unexpected. At Sneeze It, any agent output that flows into a client invoice, a financial report, or a contract commitment requires a human confirmation step. Everything else can run autonomously. The governance document is two pages. The important thing is that it exists and is owned.

The fourth is running the audit. Once a quarter, I pull a sample of agent decisions that had financial consequences and ask whether the outcome matches what we expected when we built the rule. If Dirk sent outreach to a prospect we had already closed, I want to know. If Tally pushed a KPI that was sourced from a stale file, I want to know. The audit is not punitive. It is calibration. Agents drift when nobody is checking their outputs against the standard they were built to hit.

## What makes this a CFO responsibility specifically

Finance people sometimes push back on this framing. The agents are technology, they say. The compliance is IT. The risk is operations.

The pushback is wrong, and I think the reason it persists is that most companies still think of agents as tools rather than decision-makers.

A tool does not create liability. A tool that answers a question the same way every time and produces a result the human then evaluates is not a risk item. A CRM is not a risk item. A spreadsheet is not a risk item.

An agent that decides who to contact, what to say, what numbers to flag, and what to escalate is not a tool. It is a decision-maker without a salary, a title, or a performance review. It runs on whatever rules were written into it, and those rules may be right or may have drifted from what the business actually needs.

That is a financial risk. Pricing financial risk, tracing it, governing it, and auditing it is the CFO's domain. Not because it is glamorous, but because no other seat has the authority and the standing to own it.

If agents are making consequential decisions in your company and your CFO is not involved in the governance, you have outsourced financial risk to a system nobody has accountability for. That is not a technology problem. It is a fiduciary one.

## The scorecard implication

One concrete thing changed at Sneeze It when we took this seriously.

We added a compliance column to the rows on our org chart for agents whose outputs have financial consequences. Dash has a compliance note. Tally has one. Dirk has one. The note says what the confirmation step is, who owns it, and what the audit cadence is.

The column is not expensive to maintain. It takes maybe two hours a quarter across all the agents that need it.

What it produced was a conversation I had not expected. When Janine saw the column for the first time, she said: "So I am the confirmation step for Dash. I should probably know what Dash's error rate is."

She was right. She did not have that information. Within a week she did.

That is what governance produces. Not bureaucracy. People knowing what they are accountable for, and having the information they need to do it.

The agents carry the operational work. The humans stay connected to the consequences. The CFO owns the bridge between the two.

## See the live chart

You can query Sneeze It's org chart, including which agent seats have financial accountability, what the confirmation steps are, and how agent rows are structured alongside human rows like Janine and Bogdan.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the Sneeze It org chart and identify which agent seats have financial or compliance implications."*

What comes back will show you what a governed hybrid org actually looks like on a chart, and give you a template for mapping the same accountability structure onto your own.
