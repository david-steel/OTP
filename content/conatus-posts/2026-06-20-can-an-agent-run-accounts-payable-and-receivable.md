---
title: An agent cannot run accounts payable and receivable alone, but it can do the part that was breaking you
date: 2026-06-20
author: David Steel
slug: can-an-agent-run-accounts-payable-and-receivable
type: founder_essay
status: published
series: ai-cfo
series_part: 22
description: What AI agents can actually own in AP and AR, what still needs a human, and how that split plays out on a live org chart.
---

# An agent cannot run accounts payable and receivable alone, but it can do the part that was breaking you

The question sounds clean: can an AI agent run accounts payable and receivable?

The clean answer is no. The true answer is that the clean answer is the wrong frame.

Here is the frame that actually helps. AP and AR are not monolithic functions. They are collections of tasks at different altitudes. Some of those tasks require judgment, relationship, and authority. Some of them are data work that a person should never have been doing in the first place. The question is not whether an agent can run AP/AR. The question is which tasks in AP/AR are appropriate for an agent seat, and which tasks require a human.

Get that split right and the function runs better than it did when a single person was doing all of it.

## Before: one human holding everything

At Sneeze It, before we thought seriously about this, Janine was holding the entire AR/AP function in her head and in her Gmail. She is our accounting human, the one who knows which clients are behind, which invoices need to go out, which vendor bills are sitting, and when cash is thin.

Janine is good at her job. That was part of the problem.

Because she was good, nothing fell through the cracks. Because nothing fell through the cracks, nobody ever had to build a system. The function ran on her attention, her memory, and her willingness to chase things manually. Which meant every number that mattered to our cash position lived in one person's inbox, and there was no visibility into any of it without asking her.

She was producing outcomes but not producing data. She was managing relationships but not producing signals the rest of the org could act on. She was doing the high-judgment work and the low-judgment work, because nobody had ever separated them.

Dirk, our AI chief revenue operator, was pushing to book new clients. He had no way to see days receivable outstanding without calling Janine. Radar, our chief-of-staff agent who runs our Monday briefing, could not flag cash collection trends because there was no feed to read from. The financial floor of the business was dark to the rest of the org chart, even though everyone needed to see it.

## What changed when we separated the tasks

We did not hire a second human. We did not replace Janine with an agent. We sat down and looked at what she was actually doing, and we separated it into two columns.

Column one: the work that requires her. Judgment calls on disputed invoices. Conversations with clients who are behind and need a real person on the phone. Decisions about whether to extend terms. Vendor negotiations. Authorizing a write-off. Anything that touches a relationship or requires her name on it.

Column two: the work that did not require her. Pulling data on overdue accounts. Watching which invoices had been outstanding more than thirty days. Tracking the spread between what was billed and what was collected. Flagging when a client's payment pattern changed. Generating the weekly cash position summary. None of this required judgment. All of it required discipline and consistency, which is exactly what agents are built for.

Tally, our scorecard agent, took the column-two work. Tally's job is to read source data and push it to the right places so the humans who need it have it. We added AR metrics to Tally's KPI push: days receivable outstanding, current receivables balance, collections rate by client tier, weekly change in aged invoices. Those numbers now show up on the Monday dashboard without anyone pulling them.

Dash, our analytics agent, cross-references what Tally surfaces with the client roster. When a high-spend account goes quiet on payments, Dash flags it. Not because Dash has any authority over the account, but because pattern recognition inside a data set is the work Dash exists to do.

Janine still owns everything that requires her. She has more of her week now for the work that actually requires her, because she is not spending hours compiling data that an agent can compile in seconds.

## After: what the function looks like now

The Monday dashboard has financial rows on it the same way it has sales rows and call center rows.

Tally pushes the AR aging numbers. Dash flags anomalies. Radar surfaces the cash position summary in the morning briefing as a line item, not a conversation starter. Dirk sees days receivable outstanding on the same dashboard he sees his pipeline numbers, so when he is pushing to close a new client, he can see whether we have cash headroom or whether collection is under pressure.

Janine sits above all of this on the chart. She is the human with authority over the function. The agents feed her better data faster, so when she does have to make a judgment call, she makes it with more signal than she had before.

The function is not automated. It is clarified. The column-two work is handled consistently, at any hour, without anyone having to remember to do it. The column-one work stays with Janine because that is where it belongs.

This is the pattern that actually holds up. Not an agent running AP/AR. A human owning the function with agents handling the parts of it that did not need a human in the first place.

## The question operators get wrong

When people ask if an agent can run AP/AR, they are usually asking because they are in pain. The pain is usually one of two things.

The first pain is the Janine problem: one person holding the function, no visibility for the rest of the org, everything running on tribal knowledge and personal attention. The instinct is to find something that can replace that person. The right answer is to find something that can augment her so she is not the single point of failure.

The second pain is the data problem: the numbers exist somewhere but nobody can see them when they need them. The instinct is to build a dashboard. The right answer is to put an agent on the task of surfacing those numbers on the cadence the org needs them, so the dashboard is never stale.

In both cases the agent is not replacing a function. It is filling a structural gap that was always there but was being covered by a person's extra effort.

That extra effort was expensive and invisible. Invisible because it was just Janine doing her job. Expensive because her attention on the data-pulling work was attention she could not spend on the relationship and judgment work where she actually creates value.

The mission underneath all of this is the same one that drives every seat on our chart: let agents carry the operational work so the people who are irreplaceable for their judgment are free to use it.

## What an agent seat in this function actually requires

To put an agent on column-two AP/AR work, you need four things.

You need a readable data source. The agent cannot work from an inbox. The data has to exist somewhere structured enough to query, whether that is a spreadsheet, a connector to your accounting system, or a file that gets updated on a consistent pattern.

You need a clear metric definition. "Watch AR" is not a metric. "Days receivable outstanding, updated weekly, with trend vs prior four weeks" is a metric. The agent needs to know exactly what it is computing and why.

You need a human seat above it with clear authority. Tally surfaces the numbers. Janine owns what happens with them. That authority boundary is what keeps the agent from being in a position it was never supposed to occupy.

And you need a place for the numbers to land. In our case it is the Monday dashboard and the daily morning briefing. If the numbers are going into a folder nobody reads, the agent is doing work and the org is not benefiting from it.

Those four things are more work than people expect. But they are also the same four things any well-designed financial process requires, whether or not an agent is involved. Agents do not create structural discipline. They reward it.

## See the live chart

From OTP's MCP you can query the seats on Sneeze It's chart that currently own financial visibility work, see which are agents and which are humans, and inspect the KPIs each seat is accountable for in AP/AR.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me which seats on the Sneeze It chart own financial or scorecard work, and what KPIs they track."*

The response will show you how human and agent seats share the financial function on a live chart, not as a hypothetical.
