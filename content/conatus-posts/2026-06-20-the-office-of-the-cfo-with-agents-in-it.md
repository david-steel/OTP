---
title: The office of the CFO looks different when agents are doing the operational work
date: 2026-06-20
author: David Steel
slug: the-office-of-the-cfo-with-agents-in-it
type: founder_essay
status: published
series: ai-cfo
series_part: 24
description: What finance looks like when agents handle the operational layer. A lifecycle walkthrough from revenue to reporting inside a working hybrid org.
---

# The office of the CFO looks different when agents are doing the operational work

Most small agencies do not have a CFO. They have a bookkeeper, an accountant who shows up at tax time, and a founder who checks the bank balance on the wrong days.

That is not a CFO function. It is a financial survival function.

The CFO function is something different. It tracks money at every stage of the revenue lifecycle: when it is earned, when it is collected, when it is spent, and what the numbers say about what to do next. Most small operators cannot afford to run that function with people alone. The people who do it well are expensive. The work that fills their hours is not.

That is the gap agents are built for.

This is not a post about replacing finance people. Janine, who handles our accounting and AR and billing at Sneeze It, is more valuable now than she was before we added agents. The argument here is narrower: agents can carry the operational weight of financial work so that the people in the function can spend their time on the decisions that actually require judgment.

## Stage one: Revenue is earned

The revenue lifecycle at an agency starts when a proposal is accepted.

At Sneeze It, that moment used to disappear into a gap. The proposal closed in Proposify. Someone had to notice. Someone had to update the CRM. Someone had to flag Janine so billing could start. If those three someones were the same person having a busy week, the handoff slipped.

Dirk, our sales agent, owns the top of this lifecycle now. When a proposal moves to won, Dirk updates the opportunity stage in GHL, flags Janine with the contract details, and logs the event to our shared state. The handoff does not slip because the handoff is not dependent on a human noticing. Dirk is watching.

The financial implication is not small. Every day of billing delay at the start of an engagement is a day of cash flow lost. When the handoff slips by a week, you lose a week. When it is automated, you lose nothing.

## Stage two: Revenue is invoiced

Invoicing sounds simple. It is not.

At the volume we run, invoices need to go out to the right client, with the right line items, at the right time, referencing the right engagement scope. When any one of those is wrong, you either over-bill, which damages trust, or under-bill, which damages margin.

Janine owns the invoicing decision at Sneeze It. She always will. The judgment call about what to charge, whether a scope has changed, whether a client is owed a credit, those decisions belong to a human who understands the relationship.

What she does not need to own is the detection work upstream of that decision. When a new engagement starts, when a location is added, when a client's spend crosses a billing threshold, something needs to catch it and put it in front of her. Dash, our analytics agent, is watching the ad spend data every day. When a HiTone location shows spend appearing for the first time, Dash flags it. Janine sees the flag, validates the scope, and invoices.

The agent does not replace the billing decision. It replaces the work of staring at spreadsheets long enough to notice the billing trigger.

## Stage three: Revenue is collected

Collection is where small agency finances go to die.

Receivables sit. Clients pay slow. The 30-day invoice becomes a 45-day invoice becomes a 90-day invoice and by then you are financing your client's operations out of your own cash flow without knowing it.

The CFO function exists, in part, to prevent this. Aging reports. Follow-up cadences. Escalation protocols when something has been outstanding too long. All of that requires consistent attention on a schedule.

Consistent attention on a schedule is exactly what agents are good at.

We do not yet have an agent owning the AR follow-up cadence at Sneeze It in a fully automated way, but the architecture for it exists inside what Tally, our scorecard agent, already does. Tally pushes KPI values from our source files to the OTP scorecard four times a day on weekdays. Days receivable outstanding could live on that scorecard the same way cold emails sent and active projects live on it. When the number moves above threshold, the flag goes somewhere a human sees it.

That is the pattern. The agent monitors. The agent measures. The agent surfaces the moment that requires human judgment. The human decides.

## Stage four: Spend is tracked

On the spend side, the challenge is not that tracking is hard. It is that there is a lot of it, and most of it looks unremarkable until it does not.

Dash reads the ad spend data across all client accounts every day. That work is primarily in service of client performance, but the pattern extends naturally to the financial layer. Spend anomalies are spend anomalies whether you are thinking about client outcomes or agency P&L. An account that spikes unexpectedly is a flag for both.

The same kind of monitoring that Dash runs for ad data could run across vendor invoices, subscription renewals, and payroll anomalies if those data sources were connected. The agent does not need to understand why the spike happened. It needs to know when something is outside the normal band and surface it.

That surfacing work is where a disproportionate share of human financial attention goes today. Watching. Checking. Scanning for the thing that is out of place. Agents can carry that entirely.

## Stage five: Numbers are reported

The reporting layer is where the CFO function gets to do its real work.

At Sneeze It, the scorecard is the reporting surface. Tally pushes the numbers. The chart holds them. The Monday meeting reads them. Bogdan, our COO, sees the operational rows. Janine's inputs flow into the financial rows. The agents who generate the numbers are on the same chart as the humans who act on them.

What this means for the financial function is that the reporting cadence is no longer dependent on someone building a slide deck or pulling a report the night before the meeting. The numbers are already in the chart because Tally put them there this morning. The meeting starts from current data, not from a snapshot someone assembled by hand.

Reporting used to take time because the data was distributed and assembling it was manual. Agents collapse the assembly time to near zero. The human who used to spend Friday afternoon building the weekly financial report can spend Friday afternoon thinking about what the numbers mean.

## Stage six: Decisions are made

This is the only stage where agents genuinely do not belong in the lead.

Pricing decisions. Cash flow strategy. Whether to take on a client whose payment history is uncertain. Whether to invest ahead of revenue in a new hire or hold cash through a slow quarter. These are judgment calls that require context agents cannot hold: relationships, risk tolerance, founder conviction, market read.

The finance function at Sneeze It is still mine and Janine's and Bogdan's at this stage. The chart gives us data. The agents give us current, accurate, monitored data. But the decision is ours.

That is the shape of the CFO function with agents in it. Agents own the lifecycle. Humans own the decisions that run through it.

The implication for small operators is this: you may not be able to afford a CFO, but you can build a CFO function. The operational layer of that function, monitoring, flagging, measuring, reporting, is increasingly something agents can carry. What you need from a human CFO is the judgment layer on top of a functioning operational layer. That is a much smaller ask than asking one human to run the whole thing by hand.

## See the live chart

The OTP chart for Sneeze It has seats for Janine, Tally, Dash, Dirk, and Bogdan, each owning a layer of the financial lifecycle. You can query which agents are in the financial chain and what they own from any MCP client.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me which seats on the Sneeze It chart touch the financial lifecycle, and what each one owns."*

You will see which parts of the function are carried by agents, which are carried by humans, and how the two connect. That picture is the starting point for designing your own.
