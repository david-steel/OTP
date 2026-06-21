---
title: A franchise is already a portfolio. Most franchisors just do not have a system that treats it that way.
date: 2026-06-21
author: David Steel
slug: how-does-a-franchise-use-otp
type: founder_essay
status: published
series: franchise
series_part: 1
description: Every franchise is already a portfolio of orgs. OTP's portfolio feature gives franchisors a live roll-up of location KPIs, benchmarking, and locked presets for brand consistency.
---

# A franchise is already a portfolio. Most franchisors just do not have a system that treats it that way.

Here is the number that reframed how I think about franchise operations: 19.3% of franchisees control 58.8% of all franchised locations in the United States. That is from FRANdata and the IFA, 2026.

Sit with that for a second. The franchise economy, across 851,000 establishments and more than nine million jobs, is not a flat landscape of independent owner-operators each running a single shop. It is a portfolio economy. A concentrated layer of multi-unit operators runs the majority of the locations. Operators with 50 or more units grew 118% between 2010 and 2018, the fastest-growing tier in the system.

The question is not whether franchise operations are portfolio operations. They already are. The question is whether the systems those operators use were designed for a portfolio, or whether they were designed for a single location and then stretched, painfully, to cover many.

Most of the systems were stretched. And that is the problem.

## The failure mode everyone is living with

The phrase I keep seeing in franchise ops research is "always playing catch-up." By the time financial results surface a problem at a specific location, it may already be too late to recover that quarter. The lag is not a technology failure. It is a structural one. Reporting gets built for a single org. The franchisor then tries to aggregate it by asking franchisees to submit data on a schedule, or by exporting spreadsheets, or by building a custom dashboard on top of whatever the franchisor is already using for corporate operations.

Each layer of manual assembly introduces delay. Each location is running on its own schedule, its own interpretation of the SOP, its own internal habits that drift slightly from what corporate standardized. By the time corporate notices the drift, it has been baked in for months.

This is not a people problem. It is a visibility problem. And it is exactly the problem an OTP portfolio solves structurally.

## What OTP actually is before the portfolio layer

OTP is an org-chart platform built around a hybrid model: humans and AI agents on the same scorecard, one seat per role, one owner per seat.

At Sneeze It, every operational seat on our org chart has a row on the same scorecard. Bogdan, our COO, has a row. Janine, who runs accounting, has a row. Kristen, our creative director, has a row. Tally, our scorecard agent, pushes KPI values to the chart automatically on a four-times-daily schedule. Radar, our chief of staff agent, compiles the daily briefing and flags anything that has drifted. Dash, our analytics agent, runs the numbers across every ad account we manage and writes the daily summary. Arin, our call center manager agent, tracks speed-to-lead and appointment rate across the calling team.

All of that, every seat, lives on one chart. One view of the whole operation.

Now apply that structure to a franchise location. A fitness studio running OTP has a chart that might include the general manager (human), the front desk team (humans), and a few agents: one watching booking rate and lead response time, one monitoring membership retention, one handling the weekly performance summary that goes to the franchisee. Each seat is accountable for its metric. The GM sees the chart every week the same way I see ours.

That is one location. Now the portfolio layer is what makes this a franchise system.

## What the portfolio actually is

OTP's portfolio feature, available now in early access, groups member orgs under one parent org. The parent is private. It never appears in browse or search. It exists for one purpose: to give the franchisor a live view across all its member locations.

Each member org keeps its full chart intact. The fitness studio in Location A keeps its seats, its scorecard, its weekly cadence. Location B keeps its own chart. Location C keeps its own. Each location is its own org with its own operating rhythm.

The portfolio layer sits above all of them. It rolls member KPIs up into super-metrics. The franchisor sees system-wide averages across every location, updated as the member orgs update. When one location's booking rate drops, the portfolio view shows it. When another location's lead response time starts drifting up, the portfolio sees it before it shows up in a quarterly spreadsheet.

This is centralized real-time reporting without asking franchisees to submit anything manually. The data moves through the system structure, not through a human compliance step.

## Presets are how brand consistency becomes structural

The other piece of the portfolio that matters for franchises is presets.

The consistency problem in multi-location operations is well documented. Without a central system, each location starts interpreting the brand standard slightly differently. SOPs go stale. Policies get applied unevenly. Corporate issues an update and forty percent of the message never arrives intact, according to vendor research in the space (take that number as a benchmark claim, not a verified fact).

OTP's presets let a portfolio set default configurations that every member org inherits. More than that, the portfolio can lock those presets. A locked preset means the member org cannot deviate from the standard the franchisor set. That is not just a reporting feature. That is operational compliance built into the architecture.

Set the operating standard once. Every location inherits it. Lock it.

For a multi-unit operator running 20 fitness locations, that means every location's scorecard looks the same, tracks the same core KPIs, and cannot drift off-format without a deliberate portfolio-level decision. The franchisor is not chasing uniformity. The system enforces it.

## Counter-positioning to what exists

Most franchise management software was built to let corporate talk to franchisees. Send announcements. Track training completion. Distribute assets. That is valuable, but it does not solve the visibility problem, because visibility is not a communication problem. It is a data structure problem.

OTP is not franchise management software. It is a hybrid org structure that happens to map exactly onto what a franchise already is. The franchisor is the portfolio. The franchisees are the member orgs. The agents each location runs, watching booking rate and lead response and membership churn, are the seat-level accountability infrastructure that makes the chart work.

Arin, the agent we use to manage speed-to-lead and appointment rate for call center operations, is a good example of what this looks like at the location level. Each fitness or wellness location that runs an Arin-equivalent agent has a row on its chart showing speed-to-lead per day and appointment rate per week. Those numbers feed up to the portfolio's super-metric for that KPI across all locations. The franchisor sees, at a glance, which locations are hitting the target and which are lagging.

No spreadsheet submission required. No weekly email asking for numbers. The system produces the view because the structure produces it.

## What the portfolio tier is (and is not)

OTP's portfolio feature is the enterprise tier. It is not default-on for everyone. It is available now in early access for organizations that are ready to structure multi-location operations this way.

The entry point is one location on OTP, running a real hybrid chart. Once that location's chart is working, adding a second location as a member org is straightforward. The portfolio view follows from the structure, not from a separate configuration project.

This is the approach I would recommend to any multi-unit operator who is tired of playing catch-up. Start with one location. Build the chart right. Then let the portfolio layer do what it was built to do.

The goal is what I say about every agent we run at Sneeze It: let agents carry the operational work, so people are free for the work that matters. In a franchise context, that means the agents handle the continuous monitoring, the scoring, the reporting. The franchisor handles the decisions that those numbers surface.

That is the franchise system working the way it was supposed to.

## See the live chart

The OTP MCP exposes portfolio structure queries, including member orgs grouped under a parent portfolio and the super-metrics that aggregate across them.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me how the Sneeze It org is structured and which seats are agents vs. humans."*

You see a live hybrid chart with real seat-level accountability. That is exactly what a franchise location's chart looks like before it joins a portfolio. The portfolio is one layer up.
