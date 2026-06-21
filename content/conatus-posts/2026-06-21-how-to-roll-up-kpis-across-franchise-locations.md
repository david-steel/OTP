---
title: How to roll KPIs up across all your franchise locations without losing the signal in the noise
date: 2026-06-21
author: David Steel
slug: how-to-roll-up-kpis-across-franchise-locations
type: founder_essay
status: published
series: franchise
series_part: 3
description: A worked example of OTP portfolio super-metrics for franchise operators. Roll location KPIs into one corporate view, benchmark units, and set the standard once.
---

# How to roll KPIs up across all your franchise locations without losing the signal in the noise

The question I get from multi-unit operators is almost always the same: how do I see what is actually happening across all my locations, in real time, without waiting for someone to build a report?

That question deserves a direct answer. Here is one, worked through from the ground up.

## Why the spreadsheet approach breaks

Franchising has concentrated. According to FRANdata and the IFA, roughly 19.3% of franchisees now control 58.8% of all franchise locations. If you are in that 19.3%, you are not running one location's operations. You are running a portfolio of them. The fastest-growing tier, operators with 50 or more units, grew 118% between 2010 and 2018.

The problem that comes with scale is not that the data does not exist. Every location has data. The problem is that by the time that data surfaces at the portfolio level, the signal is stale. FranConnectGO describes it plainly: by the time financial results show a problem, it may be too late, and operators are always playing catch-up.

The spreadsheet approach fails in predictable ways. You collect location-level reports on different schedules. Someone aggregates them manually, or you wait for a weekly roll-up. The corporate view is already three to five days behind when you look at it. You cannot benchmark unit 7 against unit 12 without pulling two tabs and doing math. And the moment one location changes their reporting format, the aggregate breaks.

The problem is not the people doing the work. The problem is the architecture. A portfolio of locations needs a portfolio-level instrument.

## What a portfolio instrument actually does

OTP's portfolio feature, available now in early access, is built exactly for this.

A portfolio in OTP is a parent organization that groups member organizations under one roof. Each member org is a full OTP org: it has its own org chart, its own seats (human and AI), its own scorecard, and its own KPIs. Nothing about the member org collapses or simplifies. It keeps running its own operations with full visibility at the location level.

The portfolio adds a layer above that. It rolls member-org KPIs up into portfolio-level super-metrics. A super-metric is a KPI that lives on the portfolio's scorecard and is fed by the corresponding KPIs across member orgs. If every location is tracking speed-to-lead, the portfolio sees a system-wide speed-to-lead super-metric that aggregates all of them into one number. Same for average unit volume. Same for booking rate. Same for any KPI the franchisor cares about at the portfolio level.

This is not a reporting dashboard bolted on top. The super-metrics update as the underlying member KPIs update. The corporate view is as fresh as the data coming from the locations.

## A worked example: speed-to-lead across a fitness portfolio

Take a fitness franchisor with twelve locations. The single most consequential operational KPI in fitness franchising is speed-to-lead: how fast does a location respond when a prospect raises their hand.

Here is how this works in OTP, walked through step by step.

Each location is its own member org. At each location, the org chart has a set of seats built for the operation. Arin, the call center manager agent, owns speed-to-lead and booking rate at the location level. Amanda, the human setter, owns dials and contacts per day. Dash, the analytics agent, reads the performance data and flags patterns. Pulse, the retention agent, monitors existing member health. These seats do real operational work: let agents carry the operational work, so people are free for the work that matters.

Each location's Arin seat is accountable for a speed-to-lead KPI in that location's scorecard. Amanda's seat has her own row. Dash has its row. The location-level chart is a live hybrid of humans and agents, each with a clear seat, a clear metric, and clear accountability.

Now the portfolio layer sits above all twelve locations. The corporate portfolio creates a speed-to-lead super-metric sourced from all twelve Arin-seat KPIs. When a location's speed-to-lead degrades, the portfolio super-metric reflects it. The corporate operator does not need to check twelve dashboards. They check one number, and when it moves, they know which member org to look at.

The portfolio also enables side-by-side benchmarking. Which location has the fastest speed-to-lead? Which is the slowest? Are the bottom two locations in the same territory, or in different markets? Is the gap growing or shrinking week over week? These are questions that a per-location system cannot answer, because the answers live at the portfolio level.

## Presets: setting the standard once

The speed-to-lead example covers visibility. The other half of the portfolio problem is consistency. When every location operates independently, the operating standard drifts. Policies get interpreted differently. SOPs become suggestions.

OTP portfolios handle this with presets. The portfolio sets default configurations that member orgs inherit. The franchisor defines the standard org chart structure, the standard KPI definitions, and the standard scorecard format once. Every location inherits that setup when they join the portfolio.

More important: the franchisor can lock presets. A locked preset is one the member org cannot override. For brand consistency, this is the structural answer. Corporate defines what a "qualified lead" means. Corporate defines the speed-to-lead target. Corporate locks both. Every location reports against the same definitions, which means the portfolio super-metrics are actually comparing the same things across locations, not twelve slightly different interpretations of the same concept.

This is the franchise consistency problem solved at the architecture level, not the policy level.

## Who the portfolio is for

The portfolio tier in OTP is an enterprise feature. It is the right fit for operators who are managing multiple orgs and need a unified corporate view, multi-unit operators building toward scale, area developers running a territory, and PE-backed platforms that have rolled up franchise locations and need portfolio-level visibility to manage them.

It is available now in early access, which means you can get on it, use it, and help shape what it becomes. It is not default-on for everyone.

For single-location operators or those just starting to build on OTP, the place to start is the member org: build the location's hybrid chart first, get the seats right, get the KPIs publishing. The portfolio layer is what you add when you have more than one location and need a parent view.

## What the Monday meeting looks like when this is running

The corporate operator's Monday meeting looks different when the portfolio is live.

You open the portfolio scorecard. The super-metrics are current. System-wide speed-to-lead is at target. AUV is flat for the portfolio but one location is running 20% below the system average. Booking rate is above target at nine locations and below at three, all in the same region. You know in the first five minutes which locations need attention this week and which can run on their own.

The location manager for the underperforming unit opens their own member-org scorecard. Arin's row shows the gap. Dash's row shows the context. The conversation between corporate and the location is grounded in the same data, because they are pulling from the same system.

Radar, the chief-of-staff agent, prepares the briefing from the shared state. Tally, the scorecard agent, has already pushed the KPI values into the system from the underlying data sources. Crystal, the project management agent, has flagged any delivery risks at the location level.

The operator is not assembling information from twelve sources before the meeting. The information is already assembled. The meeting is decision time, not reporting time.

That is the visibility lag, solved.

## See the live chart

The OTP portfolio structure is queryable via MCP. You can ask any AI assistant with the OTP MCP installed to describe how a portfolio rolls member KPIs into super-metrics.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to explain how a portfolio org rolls up member KPIs into super-metrics, and show me what seats a single-location org chart would have."*

What you get back is the actual data model, not a description of it. That is the difference between a documented feature and a queryable one.

---

*Series: Franchise. Post 3 of an in-progress series. Previous: [Every franchise location is its own org, and that is the problem](/blog/every-franchise-location-is-its-own-org).*
