---
title: Every franchise location can run the same AI agent team. Here is how to decide what that team looks like.
date: 2026-06-21
author: David Steel
slug: can-every-franchise-location-run-the-same-ai-agent-team
type: founder_essay
status: published
series: franchise
series_part: 14
description: A decision tree for franchise operators building per-location AI agent teams, grounded in how the OTP portfolio feature enforces the standard across every unit.
---

# Every franchise location can run the same AI agent team. Here is how to decide what that team looks like.

The question that keeps coming up from multi-unit operators is whether an AI agent team can actually replicate across locations. Not whether it is technically possible. Whether it holds. Whether a location in market four runs the same system as location one, eighteen months later, without the franchise owner manually debugging drift.

The answer is yes. But the yes comes with a structure, and the structure is where most operators get stuck.

This post is a decision tree. Not a theory post. You read it by answering the questions in order. By the end you have a picture of what your per-location agent team looks like, and you understand the one mechanism that keeps it from drifting.

## Start here: does every location do the same kind of work?

If your franchise locations are a fitness studio, a med spa, a home services company, a call-center-anchored health brand, yes. The work is the same at every unit. The seat list is the same. The KPIs are the same. A new client comes in, someone (or something) has to capture the lead, follow up fast, book the appointment, track the show rate, report to the owner. Every location runs that loop.

If your locations have meaningfully different operational models (a branded hotel with a spa is structurally different from a hotel without one), the team still replicates, but you will have a base configuration and a few per-location variants. The decision tree still applies. You just run it twice.

For the fitness and wellness operators we work with at Sneeze It, the locations are structurally identical. Each one lives or dies on a few numbers: leads, booked appointments, show rate, cost per acquisition. What I built at Sneeze It as an agency team translates almost directly to what a per-location agent team should look like for those clients.

## Decision 1: what is the first thing that breaks without an agent at every location?

Start with the highest-pain seat, not the most impressive one.

For most multi-location operators, the answer is speed to lead. FranConnectGO puts it plainly: by the time financial results show a problem, it may be too late, and operators are "always playing catch-up." Speed to lead is where the version of "too late" is measured in hours, not quarters.

If speed to lead is your first constraint, your first per-location agent seat is something like Arin: a call center performance agent that monitors dial volume, tracks speed to lead, and flags when a location is letting leads go cold. At Sneeze It, Arin manages our calling team across client accounts, fires alerts when contact rates drop, and drafts the coaching message I review before it goes out. Each franchise location needs that same function running locally, pointed at its own team.

If your first constraint is not speed to lead but lead capture (the leads are coming in and nobody is logging them), your first seat looks more like Pepper: an intake agent reading inbound messages and routing them so nothing falls through.

If your first constraint is reporting (the owner has no idea what is happening at the unit until the end of the month), your first seat looks more like Radar: a chief-of-staff agent that reads the numbers every morning, writes a brief, and flags anomalies before they become surprises.

Pick the one that kills you first. Build that seat first. Every location gets it.

## Decision 2: which seats replicate exactly, and which seats need local calibration?

This is the question that determines how much standardization work you have to do at the portfolio level, and it has a clean answer.

Seats that replicate exactly are seats where the work is identical at every location and the KPIs are the same. Speed to lead monitoring. Appointment booking rate. Lead volume reporting. Daily performance brief. These seats get the same configuration at every location. Arin has the same target (30% of new leads to booked appointments) whether she is pointed at one location or ten.

Seats that need local calibration are seats where the inputs vary by location. A sales seat that works from a local prospect list is an example. Nick, our cold prospecting agent, searches for local health and wellness businesses, finds the decision-maker, validates the email, drafts the outreach. That seat replicates across locations, but the search terms and geography are local. The structure is the same. The data is local.

Seats that belong at the portfolio level (not the location level) are seats where the work only makes sense in aggregate. Dash, our analytics agent, reads the numbers across every account we manage and looks for cross-location patterns. Dirk, our sales agent, manages pipeline across the whole business, not inside any single account. For a franchise portfolio, those seats belong to the franchisor org, not to each location.

The clean version of this picture: every location runs Radar, Arin, and Pulse. Dash and Dirk live at the corporate portfolio level. Nick is replicated per location but locally configured. That is the team.

## Decision 3: how do you keep every location running the same version of the standard?

This is the franchising problem stated precisely. You can build a great agent team for location one. You can document the SOP. You can train the franchisee. And then eighteen months later, location seven is running a different version of the chart because someone at location seven "made some adjustments," and the adjustments drifted, and now the brand benchmark is meaningless because the underlying measurement is inconsistent.

The structural answer is presets, and this is where OTP's portfolio feature becomes the mechanism.

The portfolio is a parent organization that groups member orgs (each location's OTP chart) under one roof. The franchisor sets defaults: the seat names, the KPI structure, the targets. Those defaults flow down to every member org as presets. And the franchisor can lock them.

Locked means the location cannot modify that part of the chart without the franchisor unlocking it. The operating standard is set once. Every location inherits it. The benchmark is enforced structurally, not through trust.

This is not a feature I am describing aspirationally. The OTP portfolio is live in early access now (available under the Labs toggle in your organization settings at /settings/labs). It is the enterprise tier. If you are managing more than a handful of locations and the consistency problem is real for you, this is the mechanism.

## Decision 4: what does the corporate visibility layer look like?

Once every location is running the same team, the next question is what the franchisor sees across all of them.

The OTP portfolio rolls each location's KPIs up into portfolio-level super-metrics. The franchisor's chart shows system-wide numbers: total leads across all units, aggregate show rate, average unit performance against the benchmark. Those super-metrics aggregate the member-org KPIs into one view.

This is the visibility that FranConnectGO says most multi-unit operators lack. The concentration numbers are stark: 19.3% of franchisees now control 58.8% of all franchise locations. Operators with 50+ units grew 118.52% between 2010 and 2018, the fastest-growing tier. Those operators are not running location-by-location spreadsheets. They are running portfolios, and they need portfolio-level visibility, not just a folder of individual reports.

The OTP portfolio super-metric is a KPI on the franchisor's chart that is fed by one or more KPIs from the member orgs and recomputed as those member KPIs update. The franchisor does not have to aggregate anything manually. The chart does it.

At Sneeze It, Tally is our scorecard agent. Tally reads the values from our source systems, pushes them to the right KPI on the right chart, and keeps the numbers current four times a day. For a franchise portfolio, that pattern applies per location: each location's agent team writes to that location's chart, and the portfolio aggregates upward. The franchisor sees fresh system-wide numbers without asking anyone for a report.

## The team, stated plainly

If I were building the agent team for a franchise portfolio running fitness or wellness locations today, here is what I would build.

At every location: Radar (daily performance brief, anomaly flags, owner awareness), Arin (speed to lead, call team performance, show rate), Pulse (client retention signals, churn risk detection). These three seats replicate exactly. Same configuration, same KPI targets, same playbook. Locked via portfolio presets.

At the location level, locally configured: Nick (cold prospecting, local geography) and a lead intake agent modeled on Pepper. Same structure, local data.

At the portfolio level: Dash (cross-location analytics, underperformer identification, benchmark comparison), Dirk (system-wide pipeline, expansion opportunity detection), Crystal (project and delivery tracking across units). These seats belong to the franchisor org. They read from the super-metrics the portfolio aggregates.

That is a team of eight to ten agents depending on the vertical. Some of those seats are human at first and become agents later. Bogdan, our COO, is a human seat. Janine, our accounting seat, is a human seat. The chart includes both. The point is not to replace the humans. The point is to let agents carry the operational work so the humans are free for the work that matters.

## One more decision

The question I have not answered is: when do you build this yourself versus when do you wait?

Build it yourself when the visibility lag is already costing you. When you find out about an underperforming location from its quarterly P&L instead of from a daily dashboard. When you are trying to benchmark locations against each other and the numbers are not comparable because each location is measuring differently. When a new location opens and you have no structured way to confirm it is running the standard.

Wait if you are still on your first location. Get the single-location agent team working before you build the portfolio layer. The portfolio amplifies what is already working. It does not fix what is not.

That is the decision tree. One question at a time.

## See the live chart

The OTP MCP can tell you whether any org in the portfolio has an active chart and what super-metrics that portfolio currently tracks. You can ask it to show you the current KPI structure for a member org and compare it against the portfolio preset.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the org chart for sneeze-it and identify which seats belong to the portfolio level versus the per-location level."*

What you get back is the actual live chart, queryable in real time. That is what a franchise corporate office could see for every location, updated automatically, without asking anyone for a report.
