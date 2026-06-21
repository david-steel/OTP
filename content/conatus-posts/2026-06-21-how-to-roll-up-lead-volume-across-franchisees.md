---
title: Lead volume rollup across franchisees fails for five structural reasons, and only one of them is a data problem
date: 2026-06-21
author: David Steel
slug: how-to-roll-up-lead-volume-across-franchisees
type: founder_essay
status: published
series: franchise
series_part: 28
description: The five structural reasons multi-unit operators cannot roll up lead volume across locations, and how OTP portfolio super-metrics fix them without adding another dashboard.
---

# Lead volume rollup across franchisees fails for five structural reasons, and only one of them is a data problem

Every multi-unit operator I talk to has the same request. They want one number. Total leads across the system, broken out by location, updated fast enough to actually act on.

They ask for a dashboard. A report. An integration. A Slack alert.

What they actually need is a structural fix, and they usually cannot see that until I walk them through where it breaks.

Franchising has concentrated. About 19.3% of franchisees now control 58.8% of all locations, according to FRANdata and the IFA. The operators at that tier are running a portfolio, not a business unit. They need portfolio-grade visibility. What they have, in most cases, is a spreadsheet and a weekly call.

The core failure, as FranConnectGO puts it, is that "by the time financial results show a problem, it may be too late." Operators are always playing catch-up. Lead volume is one of the earliest signals, and it is also one of the hardest to aggregate cleanly. Here is why.

## Failure mode 1: the data lives in each location's tools, not yours

Every location has a CRM, a call center platform, an ad account, or some combination of the three. Each one has its own login, its own data structure, and its own definition of what counts as a lead.

You can pull reports from each one. Individually. By hand. After the fact.

That is not a rollup. That is a reconciliation. And reconciliation happens after the week is over, which means you are managing to last week's number while this week's number is already decaying.

The rollup problem is not that the data does not exist. It is that nobody owns the job of aggregating it in real time, because that job requires every location to structure its data the same way and report to the same place.

## Failure mode 2: each location defines "lead" differently

One location counts every inbound call. Another counts only qualified contacts. A third counts form submissions. A fourth runs paid ads and counts clicks.

When you ask for total leads across the system, you are asking for a sum across four different definitions. The number is technically correct and operationally meaningless.

This is a consistency problem, not a technology problem. Until every location uses the same definition, baked into the same KPI, your system-wide number is noise dressed up as data.

## Failure mode 3: no one at the location level owns the number

At a healthy single location, someone owns lead volume. It might be the owner-operator. It might be the front desk manager. It might be the call center agent, the Arin seat in a system that runs agents.

At the portfolio level, no seat owns the system-wide number. There is no row on any chart that says "total leads across all twelve locations, weekly target X, current number Y, trend arrow Z." Because there is no chart that spans all twelve locations.

Without a seat that owns the number, the number does not get managed. It gets reported. The distinction is everything. A reported number gets read and forgotten. A managed number gets acted on.

## Failure mode 4: benchmarking requires the data to live in one place before you can compare it

The thing multi-unit operators actually want is not just the total. It is the breakdown. Which location is generating leads at the right rate and which is not. Who is converting leads to booked appointments and who is letting them sit.

This is location-to-location benchmarking, and it is one of the named requirements of multi-unit operations. Operators with 50 or more units grew at +118.52% from 2010 to 2018, the fastest-growing tier in franchising (FRANdata). Those operators did not get there by looking at each location's data in isolation. They got there by finding which location was winning and bringing the pattern to the rest.

But benchmarking requires all the data to be in the same structure, at the same level of granularity, at the same time. If location A updates its lead count daily and location B updates weekly, the benchmark is wrong.

## Failure mode 5: the franchise consistency problem is upstream of the data problem

Even if you solve the technology problem (the data is in one place), you still have the definition problem (each location defines things differently). And upstream of that is the operating standards problem.

Without a central system that defines what a lead is, sets the reporting cadence, and locks those standards across every location, each unit begins interpreting the brand on its own terms. That is not a hypothesis. Operandio documents it as a consistency failure that accelerates as the network grows.

The visibility lag you feel on lead volume is a symptom. The root cause is that each location is running a slightly different operating standard, and the franchisor has no structural mechanism to set one standard and enforce it.

## What a structural fix looks like

The five failure modes above are not independent. They are connected, and a structural fix has to address them at the root, not one at a time.

Here is what that structure looks like in OTP, which now has portfolio support available in early access.

Each franchisee location runs its own OTP org. That org has a hybrid chart: humans and AI agents on the same scorecard, one seat per role, one owner per seat. In a fitness or wellness location, that means a seat for the human owner-operator, a seat for the front desk team, and agent seats for work that should run continuously. An Arin seat that monitors speed-to-lead and books appointments. A Dash seat that pulls ad performance and flags when cost per lead climbs. A Pulse seat that watches retention signals. A Tally seat that pushes KPI values from local sources to the scorecard automatically.

Every location defines "lead" the same way, because every location inherits its chart definition from the franchisor's portfolio.

The franchisor runs an OTP portfolio. The portfolio groups all member orgs (the location orgs) under one roof. Lead volume at each location is a KPI on that location's scorecard. At the portfolio level, that KPI becomes a source for a super-metric: total leads across the system, updated when any member pushes a new value, visible to the franchisor in one view.

The franchisor does not have to pull reports. The portfolio pulls the data as each location's Tally seat pushes its weekly number. The definition is consistent because the preset came from the portfolio and was inherited by every member. The franchisor can lock that preset so no location can drift it.

The benchmark is automatic. Because every location's lead volume is structured identically and flowing to the same portfolio, the comparison is a query, not a project.

At Sneeze It, we run this structure for ourselves. Radar, our chief-of-staff agent, compiles the cross-department view. Tally pushes KPI values from local sources to the scorecard. Dash surfaces the analytics. Dirk runs the pipeline. Nick runs cold prospecting. The humans on our chart (Bogdan as COO, Janine in accounting) have rows next to the agent rows, and everything rolls into one dashboard.

We are not a franchise. But the structural logic is the same: one chart per operating unit, one portfolio that aggregates across units, one consistent standard set at the top and inherited down.

## What this does not require

It does not require replacing your CRM, your call center platform, or your ad accounts. The KPI the location pushes to its OTP scorecard can be sourced from whatever system the location runs.

It does not require a custom integration project. Tally-style agents can pull a number from a file, a spreadsheet, or a direct API call, then push it to the KPI. The aggregation happens at the portfolio layer, not the source layer.

It does not require the franchisor to manage each location's internal system. The portfolio view gives the franchisor the number. The location owns how it produces the number. That separation of accountability is what makes the model scale.

## The mission underneath this

The reason agents belong on every location's chart is not automation for its own sake. It is that the operational work (monitoring speed-to-lead, flagging when lead volume drops, pushing KPI values to the portfolio) should run continuously and without a human doing it manually. When agents carry that work, the humans at each location are free for the work that matters: coaching the team, serving the member, running the business.

The franchisor's job is to hold the standard and spot the underperformer early. Not to chase last week's spreadsheet.

OTP's portfolio feature is available now in early access. It is the enterprise tier. If you are running five or more locations and this problem sounds familiar, the portfolio is where to start.

## See the live chart

You can ask the OTP MCP to pull a portfolio's super-metrics and show how member KPIs feed up into the system-wide view.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the Sneeze It org chart and identify which seats push KPIs that would feed a franchise portfolio super-metric."*

You will see the specific seats (Tally, Dash, Arin) that are doing the KPI-reporting work, which is exactly the structure each franchise location would replicate.

---

*Series: Franchise. Post 28 of an in-progress series.*
