---
title: The franchise operators who beat visibility lag are not reading better reports. They built a different system.
date: 2026-06-21
author: David Steel
slug: how-to-track-same-store-trends-across-the-system
type: founder_essay
status: published
series: franchise
series_part: 33
description: Same-store trends across a franchise portfolio reveal organic growth. Here is why the standard reporting stack hides the signal, and what replaces it.
---

# The franchise operators who beat visibility lag are not reading better reports. They built a different system.

The standard pitch in multi-unit franchising goes like this: you get the brand, the playbook, the system. You replicate it across locations, and the system does the heavy lifting. Revenue scales with units.

The pitch is true. The pitch is also the thing that makes same-store performance so hard to see.

Because when every location is supposed to run the same playbook, the question is not "is each location producing revenue." The question is "are the comparable locations growing, holding, or slipping, independent of new units entering the system." That is the same-store question. And it is the one most franchise operators get the slowest, most distorted answer to.

## Why visibility lag is the structural problem

FranConnectGO put it plainly: by the time financial results surface a problem at a unit, "months of revenue opportunity have been lost." Operators are "always playing catch-up."

That is not a technology problem. That is a system design problem.

The typical franchise reporting stack was built to answer "how did last month go across the portfolio." It was not built to answer "which comparable-vintage locations are trending below system baseline right now, and why does location 12 look like location 7 did six weeks before location 7 had its bad quarter."

One of those questions produces a report. The other produces a decision before the damage lands.

The operators who have solved this are not reading better reports. They have pulled same-store performance out of the monthly financial cycle and put it on a live scorecard with location-to-location benchmarking built into the view.

## What same-store actually means in practice

Same-Store Sales, or SSS, is the performance of locations that have been open at least one year. It strips out the noise of grand openings and ramp-up periods so you can see organic growth: whether your established base is getting stronger or weaker.

It is the most widely cited franchise health metric because it isolates the thing you actually control. A new unit opening in Phoenix does not make your Denver location better. Same-store growth means Denver is better than Denver was.

The problem with tracking SSS at scale is that it requires two things that most franchise tech stacks do not provide simultaneously: granular per-location KPI visibility, and a portfolio-level roll-up that makes the system-wide trend readable without manually aggregating spreadsheets.

You need to see the location. You need to see the system. And you need to see where the location sits relative to its peers.

## The counter-position

Here is where most vendors in this space stop being helpful.

They sell you a better dashboard. The dashboard aggregates your unit data into a cleaner system-level view. You can see the roll-up. You can see AUV. You can see total revenue.

What you cannot see is the human and agent accountability structure underneath the number.

A same-store trend is not just a data point. It is a signal about whether the seats at a location are doing their jobs. A fitness studio's same-store trend is a function of whether Arin (the call center agent) is routing leads fast enough, whether Dash (the analytics agent) is catching CPL creep before it becomes a spend problem, whether the human GM is on the floor during peak hours. The metric is downstream of the seat.

If your portfolio view is just a data aggregation layer sitting on top of a disconnected location system, you can see the trend but you cannot act on it. Because the trend is pointing at a system, but the system is not on the same chart.

This is the counter-position to every "better dashboard" product in franchise tech. A better dashboard does not change the accountability structure. A portfolio scorecard that connects to each location's live seat accountability does.

## What the structure looks like in OTP

OTP's portfolio feature (available now in early access) is built on exactly this logic.

Each franchise location is its own OTP org with its own hybrid chart: humans and AI agents on one scorecard, one seat one owner. A fitness location's chart might carry Radar running the daily ops brief, Arin managing speed-to-lead and appointment rate, Dash tracking CPL and lead volume, Pulse watching retention signals, and a human GM holding the floor-level accountability that agents cannot hold. Every seat has a metric. Every metric has a target. Every week, the chart tells you whether the seat is on track.

The franchisor org is the portfolio. It groups member location orgs under one roof and rolls their KPIs up into super-metrics: system-wide appointment rate, system-wide CPL, same-store lead volume indexed to their vintage cohort. A super-metric on the portfolio is fed by the corresponding KPI across however many member orgs the portfolio includes. The portfolio aggregates member KPIs into a single portfolio-level view.

What you see at the portfolio level is the system. What you can drill to is the seat.

That is the visibility structure that makes same-store trending actionable instead of historical.

## Presets and the consistency lever

Same-store comparability only works if the locations are actually running comparable playbooks. If location 7 is measuring "booked appointments" and location 12 is measuring "confirmed first visits," you cannot compare them. The SSS benchmark is meaningless.

Presets solve this structurally.

A portfolio sets preset defaults for every member org, and the portfolio can lock them. The operating standard, the scorecard structure, the KPI definitions, the seat configuration: corporate defines it once, every location inherits it, and no individual franchisee can drift the definitions in a direction that breaks comparability.

This is not a policy problem. Policy breaks because someone at location 12 decides their market is different. A locked preset does not break. The location cannot unlock it without corporate action.

When presets are locked, the same-store comparison is a real apples-to-apples look at location performance. The benchmark is credible because the definitions are shared.

## The benchmarking layer

Concentration in franchising has accelerated: 19.3% of franchisees control 58.8% of all locations, and operators with 50 or more units grew 118% between 2010 and 2018 (FRANdata / IFA, 2026). The operators at that scale have one advantage the single-unit operator does not: they have a portfolio of their own locations to benchmark against.

Location 7 is not just above or below some industry stat. Location 7 is above or below location 3, 11, and 14, which opened in the same quarter, serve comparable markets, and run the same playbook under the same presets.

That peer comparison is the signal. Industry benchmarks tell you how you compare to the market. Peer benchmarking within your own portfolio tells you whether your bottom-quartile location is a market problem or an ops problem, because you can see it next to a peer location in a similar market that is outperforming it.

OTP's portfolio view makes this comparison native. When every member org is running a consistent chart under locked presets, and their KPIs are rolling up to shared super-metrics, the location-to-location comparison is not a separate analytics exercise. It is built into the portfolio view.

## The agent layer is the operational difference

Here is what I have seen at Sneeze It, working with multi-location fitness and wellness brands on their advertising: the locations that close the visibility lag fastest are not the ones with better reporting. They are the ones that have automated the operational work between the signal and the response.

When Arin catches a speed-to-lead slip at 9am, the coaching message goes to the caller before noon. When Dash flags a CPL spike on a Tuesday, the budget conversation happens Tuesday, not in the Friday report. When Tally pushes the KPI values to the scorecard on the four-times-daily run, the portfolio-level trend is current, not 30 days stale.

The agents carry the operational work. The humans are free for the decisions that actually require judgment: the GM conversation, the market-level call, the franchisee relationship.

That is the mission: let agents carry the operational work, so people are free for the work that matters.

A same-store trend in a portfolio where agents are doing the operational scaffolding is a different kind of signal than a same-store trend in a portfolio where the GM is also trying to pull reports, coach the caller, and run the floor. The first one tells you whether the playbook is working. The second one tells you whether the GM is surviving.

## What to build first

If you are running a multi-location portfolio and you want to start tracking same-store trends the way I have described here, the order matters.

Start with the seat structure at one location. Get the accountability chart right: who owns each metric, what is the target, what is the review cadence. If agents are part of the chart, define what seat each agent holds and what business metric that seat is accountable for.

Then standardize that structure across comparable locations before you build the portfolio view. The portfolio roll-up is only as useful as the comparability of the member charts below it. Fix the definitions first.

Then build the portfolio. Lock the presets. Define the super-metrics. Set the same-store cohort (units open 12+ months) as the baseline comparison group.

Then look at the location-to-location benchmark every week, not every month. A trend that is caught in week three is a conversation. A trend that surfaces in month four is a problem.

## See the live chart

OTP's portfolio feature is available now in early access. You can query the live chart structure for an existing org to see how seat accountability maps to KPIs before building your own portfolio view.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the org chart for sneeze-it and list every KPI that Tally tracks across the chart."*

You will see how a live hybrid chart structures seat accountability to KPIs, which is the unit of analysis the portfolio rolls up. That is the building block the same-store view sits on.
