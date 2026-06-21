---
title: Give each franchisee their own scorecard. Then roll every location up into one corporate view.
date: 2026-06-21
author: David Steel
slug: each-franchisee-own-scorecard-corporate-sees-the-rollup
type: founder_essay
status: published
series: franchise
series_part: 32
description: The two-layer scorecard problem in franchising: each location needs autonomy, corporate needs the roll-up. This is how OTP portfolios solve it.
---

# Give each franchisee their own scorecard. Then roll every location up into one corporate view.

Here is the scorecard problem that every growing franchise system runs into at some point.

The franchisee at location twelve needs a scorecard that reflects how location twelve is running. Their call center pickup rate. Their speed to lead. Their appointment show rate against their local booking target. Their on-the-ground team, with their seats and their metrics.

The franchisor, sitting at corporate, needs to see all twelve locations at once. Not twelve separate scorecards. One view. System-wide KPIs. Which location is performing, which is lagging, and whether the gap between them is a staffing issue or an ops issue.

These are two different things. Most franchise systems solve them badly: corporate gets a spreadsheet aggregation (updated weekly, always stale), and each location operates on gut feel or whatever the area rep last told them.

OTP Portfolio, available now in early access, is built for exactly this structure.

Here is how it works, in five pieces.

## 1. Each location gets its own org, with its own hybrid chart

When a franchise location joins OTP, it gets a member org. That org is its own full environment: its own chart, its own seats, its own scorecard, its own KPIs.

The hybrid chart is where the location's operational picture lives. Think about what a multi-location fitness brand actually needs at each site. A Radar-style chief of staff seat surfacing daily priorities and flagging schedule gaps. An Arin seat running call center operations, monitoring speed-to-lead, and coaching the booking team on appointment rates. A Dash seat pulling ad performance across Meta and Google so the location manager knows whether the front-of-funnel is healthy. A Pulse seat tracking client retention and flagging accounts that have gone quiet. Humans like the site manager and front-desk lead have their rows on the same scorecard.

One chart. One set of numbers. Everyone on it, humans and agents together.

This is what gives a franchisee real autonomy. They own their chart. They run their scorecard. They see their numbers without waiting on a corporate report.

## 2. The portfolio groups member orgs under one corporate roof

The portfolio is the parent organization. It does not appear in OTP's public directory. It is not browsable. It is the corporate layer, private, that holds the member orgs and exists for one purpose: a unified cross-location view.

Corporate sets up the portfolio. Each franchise location that joins gets invited in as a member org. The member org's team accepts the invite. Their existing OTP chart stays intact.

From that point, corporate has a portfolio view that spans every location. Not a snapshot. Not a report somebody ran. The portfolio aggregates member-org KPIs into super-metrics that update as the locations update.

## 3. Super-metrics give corporate the roll-up numbers that actually matter

A super-metric is a portfolio-level KPI fed by the corresponding KPIs across member orgs.

In a franchise system, those super-metrics are the numbers corporate has always wanted but never been able to get in real time. System-wide booked appointment rate. Average speed-to-lead across all locations. Total leads generated this week. Network-wide show rate. These are the metrics that tell you whether the brand is performing, not whether one location is.

What this replaces: the spreadsheet that the area rep builds manually from whatever each location reported, three days after the week closed, after two follow-up emails. FranConnectGO describes this dynamic as operators "always playing catch-up" because "by the time financial results show a problem, it may be too late." Super-metrics close that gap. The portfolio sees the numbers when the locations produce them.

## 4. Presets set the operating standard once and lock it for every location

This is the franchise consistency mechanism.

Corporate builds the standard chart in the portfolio: the seats, the KPIs, the structure. Then it deploys that chart as a preset to member orgs. Every location that joins inherits the standard. If corporate locks the preset, the member org cannot drift from the structure.

This is how you solve the SOP drift problem that franchise operators know well: each unit begins operating differently over time because there is no structural enforcement of the standard. Presets make the standard structural. You define it once. Every location inherits it. The brand runs consistently not because everyone remembers the training but because the chart is the same at every site.

Locked presets also make benchmarking honest. If every location tracks the same KPIs on the same chart, location-to-location benchmarking means something. You are comparing the same metrics, collected the same way, across every site. The gap between location three and location nine is a real signal, not a data artifact from inconsistent definitions.

## 5. Corporate gets the benchmark view that portfolio operators actually need

Franchising has concentrated significantly. According to FRANdata and the IFA, 19.3% of franchisees now control 58.8% of all franchise locations. Operators with 50 or more units grew 118.52% between 2010 and 2018, the fastest-growing tier in the industry.

Platform operators at that scale have a specific problem that generic BI tools do not solve: they need location-to-location benchmarking that accounts for the same operating model across every site. Which locations are above the network average on appointment rate? Which are below on show rate? Which have a speed-to-lead problem that is contributing to their conversion gap?

The portfolio view answers these questions because every member org is on the same scorecard structure. The super-metrics give you the system-wide number. The member-org view lets you drill to the location. The benchmark sits between them: where does this location stand relative to the network median?

This is not a reporting feature. It is the operational advantage of having a coherent structure across every location instead of a collection of independently operating units that happen to share a brand name.

## What this requires from you

Running an OTP portfolio structure means doing three things before the roll-up is useful.

First, standardize the chart. Every location needs the same seat definitions and the same KPI definitions for benchmarking to mean anything. This is not optional. If location four tracks "booked calls" and location seven tracks "scheduled appointments" for the same metric, your super-metric is noise.

Second, staff the key seats at each location. For a service franchise, the minimum useful agent team per location is probably a call center monitor (Arin-equivalent), a daily performance monitor (Dash-equivalent), and a retention tracker (Pulse-equivalent). These seats produce the KPIs the portfolio rolls up. Empty seats produce no data.

Third, let the portfolio surface the bottleneck before you go looking for it. The point of the corporate roll-up is not to confirm what you already know. It is to show you which location is drifting before it shows up in monthly financials.

The mission for agents in this structure is the same as anywhere else: let agents carry the operational work so people are free for the work that matters. At the location level, that work is coaching, culture, and local relationships. At the corporate level, it is the benchmark conversation: why is location nine below network average, and what does the fix actually require?

OTP Portfolio is the enterprise tier, available now in early access. If you are running a multi-location operation and want a structure instead of a spreadsheet, this is what to build toward.

## See the live chart

From an MCP client, you can ask OTP to show what a portfolio structure looks like and how member-org KPIs relate to portfolio super-metrics.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me how the Sneeze It org chart is structured and which KPIs would roll up into a portfolio super-metric for a multi-location operator."*

You will see the actual seat structure from a working hybrid chart, which gives you a concrete starting point for what each location's chart should look like before you wire up the portfolio layer.

---

*Series: Franchise. Post 32 of an in-progress series.*
