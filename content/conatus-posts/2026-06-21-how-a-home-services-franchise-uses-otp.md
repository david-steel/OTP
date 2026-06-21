---
title: The home-services franchise does not have a growth problem. It has a visibility problem.
date: 2026-06-21
author: David Steel
slug: how-a-home-services-franchise-uses-otp
type: founder_essay
status: published
series: franchise
series_part: 36
description: How a home-services franchise uses OTP portfolios to fix the four failure modes that kill multi-location operators before the numbers even show it.
---

# The home-services franchise does not have a growth problem. It has a visibility problem.

The HVAC franchise with 22 locations is not struggling because the brand is weak or the training was bad. It is struggling because the owner cannot see what is actually happening at each unit until it is too late to do anything useful about it.

That is the home-services franchise problem in one sentence.

According to FRANdata and the IFA, roughly 19.3% of franchisees now control 58.8% of all franchise locations in the US. The multi-unit operator running a dozen or more service territories is not the exception. That operator is the franchise industry. And the operating failure that takes them down is almost always the same: "By the time financial results show a problem, it may be too late. Operators are always playing catch-up." That quote is from FranConnectGO's research, and I have heard the same sentence from every multi-location operator I have worked with at Sneeze It.

OTP was not designed for home-services franchises specifically. But the portfolio feature, available now in early access, fits the failure mode precisely. Here is how it maps.

## The four failure modes and what OTP does about each one

### Failure mode 1: You find out about the slow location three months after you should have

A home-services franchise generates leads, dispatches jobs, and closes them. The scoreboard metric is booked appointments per territory. A healthy unit closes a high percentage of inbound calls. A struggling unit leaks somewhere in the sequence. Maybe speed-to-lead is poor. Maybe the tech is not following up fast enough. Maybe the booking rate by service type has quietly shifted.

The problem is that this data lives inside each location's CRM, call tracker, and dispatch system. The owner reviews it after the fact, usually in a monthly report, usually after the lead window has already closed.

The OTP portfolio puts every location's KPIs on one super-metric view. The corporate org (the franchisor in OTP's model) rolls each location's member-org KPIs up into shared super-metrics: system-wide booking rate, system-wide lead response time, location-by-location appointment rate compared against the portfolio average. When territory 14 drops below the portfolio average on booking rate, the franchisor sees it now, not at month-end review.

At Sneeze It, our analytics agent Dash does this inside our own org. Dash runs daily, reads the numbers, and flags any account where performance has diverged from its own 7-day average. Same logic applies at the franchise level: the portfolio's super-metrics are the Dash layer for a network of locations.

### Failure mode 2: Each location is running a slightly different playbook

This one is quieter and deadlier than the first. It shows up slowly, as brand drift, as inconsistent customer experience, as the location that gets 4.2 stars while the one next door gets 4.8. The owner usually attributes it to the individual operator. The real cause is usually that there was never a structural mechanism to enforce a standard playbook.

OTP's preset feature is the structural fix. The franchisor sets the org chart template once in the portfolio: which seats exist, which KPIs each seat owns, what the targets are. Every member org (each location) inherits that preset. The portfolio can lock specific presets, which means the location cannot override the standard without corporate seeing it. One template, 22 locations, locked.

At Sneeze It, when I add a new agent seat like Arin (our call center manager) or Nick (our prospecting agent), I define the seat once. Same discipline applies here. The franchise defines "this is what a Tally seat looks like, this is what a Radar seat looks like, this is what an Arin seat looks like" and every territory runs that same definition.

### Failure mode 3: The local operator has no support structure for the work that does not need a human

Home services is operationally intensive in a narrow band of functions: scheduling, dispatch, follow-up, review requests, re-engagement of lapsed customers. These are not judgment calls. They are reliable, high-volume, deadline-sensitive tasks that humans often perform worse than agents because humans get tired and distracted and go home.

A home-services location running OTP can put an agent in each of the seats that carry this work. An Arin-equivalent agent (call center, speed-to-lead accountability) handles the inbound response cadence. A Pepper-equivalent handles follow-up email. A Radar-equivalent (chief-of-staff) makes sure the scoreboard is current and flags anomalies before the local operator has to find them.

The local operator does not need to build this from scratch. The franchisor defines these agent seats in the preset, and every location inherits them. The mission is the same one Sneeze It runs on: let agents carry the operational work, so people are free for the work that matters.

### Failure mode 4: The corporate team has no way to benchmark performance across locations without building a custom data pipeline

This is the one that kills sophistication. A multi-unit home-services operator who wants to compare booking rate across 22 territories typically has to extract data from each location's system, normalize it, and build a spreadsheet or a BI tool to see the comparison. By the time that pipeline exists, it is three months old, maintained by one analyst who is a single point of failure, and nobody looks at it because it is not where decisions happen.

OTP's portfolio view is the comparison. Each location's booking rate KPI feeds the portfolio super-metric. The corporate chart benchmarks location 14 against location 17 against the portfolio average. No data pipeline. No analyst maintaining a one-off spreadsheet. The benchmark is structural because the chart is structural.

Location-to-location benchmarking is a named requirement in franchise management, not a nice-to-have. The operators who grow the fastest are the ones who use network-wide data to identify which unit cracked a local problem and then replicate the fix across the portfolio. You can only do that if the data is already in one place.

## What the org chart looks like for one location

A single home-services territory in OTP is its own member org. It has its own hybrid chart: a mix of the humans and agents running that location's operations.

The local owner holds the accountability chair at the top. Below that, the seats are a mix. The human tech or field lead holds the job-quality seat. An Arin-equivalent agent holds the inbound response and booking rate seat. A Pepper-equivalent holds the follow-up and re-engagement seat. A Dash-equivalent holds the KPI monitoring seat, watching booking rate vs. prior week and flagging drift. A Tally-equivalent pushes the KPI values to the scorecard so the portfolio's super-metrics are always current.

None of these agent seats requires the local operator to build or manage AI infrastructure. The franchisor defines the seat in the preset. The location inherits it. The agent runs.

At Sneeze It, our COO Bogdan holds the accountability chair for delivery. Crystal manages project tracking. Arin manages call center performance. Dash monitors ad performance. The pattern at a franchise location is structurally the same. What changes is the domain: service tickets instead of ad campaigns, booking rates instead of cost-per-lead, technician scheduling instead of creative approval.

## What the franchisor sees

The corporate chart is the portfolio. It holds no employees in the operational sense. It holds super-metrics that aggregate across all member orgs.

System-wide average booking rate. Location-by-location comparison. Territories ranked by same-store performance trend. Underperformers flagged by threshold, not by someone remembering to check.

Dirk, our sales agent, feeds Sneeze It's pipeline view in real time. The equivalent at the portfolio level is a corporate-facing super-metric that shows which territories are growing, which are flat, and which have dropped below threshold. Nobody needs to build a report. The chart is the report.

This is the structural promise of OTP's portfolio: one template, many locations, one view.

## A note on where this stands

The portfolio feature is in early access inside OTP Labs. It is available now, not at some future date. It is not default-on for every org. You enable it at the org level under Labs settings, and the team reviews it with you before a franchise implementation goes live.

I am not claiming that any specific franchise brand is running this today. What I am saying is that the feature was built for exactly this problem, that the feature is real and available, and that the four failure modes above are the reason it exists.

If you are a multi-unit home-services operator and you have read this far, the question I would ask is: how long does it currently take you to know that a location is underperforming? If the answer is "weeks" or "when the monthly report comes in," the visibility problem is already costing you.

## See the live chart

The OTP MCP exposes a portfolio view: you can query which member orgs belong to a portfolio, what super-metrics are defined, and which member-org KPIs feed them.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the portfolio structure for sneeze-it and list any super-metrics that roll up across member orgs."*

The response shows you exactly how a franchise corporate org sees its member locations in one structured view, which is the thing the monthly spreadsheet has never been able to do.
