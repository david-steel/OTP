---
title: A fitness franchise runs on visibility. OTP is the structure that provides it.
date: 2026-06-21
author: David Steel
slug: how-a-fitness-or-gym-franchise-uses-otp
type: founder_essay
status: published
series: franchise
series_part: 34
description: How a gym or fitness franchise uses OTP to run each location as its own hybrid org and roll every location's KPIs into one portfolio view.
---

# A fitness franchise runs on visibility. OTP is the structure that provides it.

The fitness franchise model has a measurement problem that gets worse as you grow.

Each location tracks members, appointments booked, speed to lead, and show rate. But those numbers live in separate systems, on separate spreadsheets, reported by separate managers at separate cadences. By the time the numbers travel up to the operator, they are a week old. A month old. Sometimes older. FranConnectGO puts it plainly: "by the time financial results show a problem, it may be too late." Operators are always playing catch-up.

The problem is not that the locations do not have data. The problem is structural. Each location is an island, and the operator has no single surface that shows all of them at once with current numbers.

OTP fixes this through a combination of three things working together: a hybrid chart at each location, a portfolio that rolls every location's KPIs up into shared super-metrics, and presets that let the franchisor define the operating standard once and lock it across the whole system.

That combination is not a dashboard. It is an org design.

## Why the fitness vertical concentrates at the multi-unit tier

According to FRANdata and IFA data from 2026, 19.3% of franchisees control 58.8% of all franchised locations. Operators with 50+ units grew 118.52% between 2010 and 2018, the fastest-growing tier in franchising.

Fitness accelerates this pattern. The model is semi-absentee by design. Small footprint, recurring membership revenue, predictable unit economics. A well-run location can run with a small staff. Which means a single operator can run four, eight, twenty locations if the systems hold.

The systems usually do not hold. Not at scale. What holds is the franchisee's personal attention, and personal attention does not multiply past a handful of locations. The operators I talk to who are managing ten or fifteen locations describe the same failure: they spend their day on the loudest location, not the most important one. The underperformer is quiet until it is a crisis.

The visibility problem is not about effort. It is about structure.

## Each location needs its own hybrid chart

Before rolling anything up into a portfolio, each location needs its own operating chart. That is the first thing OTP provides.

On that chart, each seat has one owner, one set of metrics, and one accountability conversation. At Sneeze It, our hybrid chart runs humans and agents in the same structure. Bogdan, our COO, has rows on the scorecard. So does Janine in accounting. And so does Radar, our chief-of-staff agent. And Tally, the agent that tracks and pushes KPI values. And Dash, our analytics agent. And Dirk, who handles sales. And Pulse, who tracks retention. And Pepper, who manages email. And Arin, who manages the call center and monitors speed to lead.

The chart does not separate humans from agents. Each seat is a seat. One owner, one metric set, one accountability cadence.

A fitness location's hybrid chart looks different from ours but follows the same logic. The studio manager holds one seat. The front-desk coordinator holds another. Add an agent in Arin's role to track speed to lead across every inbound inquiry, fire an alert when response time exceeds a threshold, and report daily on calls handled versus calls missed. Add an agent in Dash's role to pull membership KPIs and surface trend shifts before the weekly huddle. Add an agent in Pulse's role to flag members who have not visited in fourteen days and queue a re-engagement touchpoint.

The human at that location now has agents carrying the operational monitoring, so their attention stays on the work that actually requires a person. That is the mission: let agents carry the operational work so people are free for the work that matters.

## The portfolio is what makes the franchisor's job possible

Here is where the structure changes for a multi-unit operator or a franchisor.

In OTP, a portfolio is a parent organization that groups member orgs under one view. Each location is a member org with its own chart. The portfolio rolls each location's KPIs up into shared super-metrics, which are portfolio-level KPIs fed by the member KPIs underneath them.

The product describes it directly: "roll KPIs up across several organizations into one view." That is the exact structure a fitness franchisor needs. Average unit volume across all locations in one number. Show rate as a system-wide super-metric. Speed to lead, appointment bookings, membership retention, all of them visible at the portfolio level with each location's contribution underneath.

This is different from a reporting tool. A reporting tool pulls data. A portfolio is structural. The locations are org members. The super-metrics are accountability metrics at the franchisor level. When a super-metric drops, the conversation is the same as when any KPI drops: what changed, what caused it, what is the fix, who owns the fix.

The underperformer is no longer quiet. It is visible in the portfolio view every time someone looks at the chart.

## Presets solve the consistency problem structurally

The other chronic failure in multi-location fitness is consistency. Each location gradually drifts toward its own interpretation of the operating standard. The SOP exists but goes stale. The chart structure diverges. Metrics get measured differently from one location to the next, which makes comparison meaningless.

OTP handles this through presets. The portfolio can define default chart structure and settings that member orgs inherit, and the portfolio can lock them.

For a franchisor, this means defining the standard chart once. Every new location that joins the portfolio inherits the same seat structure, the same metric definitions, the same KPI cadence. The standard is not a document that has to be re-trained after every staff turnover. It is baked into the structure of the org chart itself.

Locked presets mean corporate does not have to audit for compliance. The structure is the compliance. The locations still have local ownership of their seats and their day-to-day numbers. The franchisor holds the frame that those numbers are measured in.

That is the relationship the franchise model is supposed to enforce by contract. Presets enforce it by design.

## What the portfolio view changes operationally

Before the portfolio, a multi-unit fitness operator asks each location to send its numbers on a weekly call. Some locations send them. Some do not. The conversation is reactive because the data arrives after the week is over.

After the portfolio, the super-metrics are live. The operator does not wait for a report. They open the portfolio view and see which locations are above target on show rate, which are below, and what the system-wide number looks like at this moment.

The conversations in the weekly meeting change. Instead of "what happened last week," the conversation becomes "what is the gap, what caused it, what is the fix." The underperformer is already identified before the call starts. The operator walks into the conversation with data, not questions.

Crystal, our project manager agent at Sneeze It, does something similar for the client work we manage. Every active project has a seat with a status. The portfolio view for our client work is the list of those statuses across all projects, not a summary one person assembled before the meeting.

A fitness franchisor running OTP gets the same shift: operational awareness that is continuous, not periodic.

## This is available now in early access

The portfolio feature is live in OTP in early access, gated through Labs. It is the enterprise tier. If you are a multi-unit fitness operator, a franchisor managing locations across territories, or a PE-backed roll-up building a visibility layer across your properties, this is the structure it was designed for.

Each location gets its own hybrid chart. Each chart contributes KPIs to the portfolio. The portfolio shows the franchisor what is actually happening across the system, not what was reported in last week's call.

The visibility that fitness franchising has always needed is a structural problem. This is the structural solution.

## See the live chart

The OTP MCP exposes the portfolio structure directly. You can ask your AI assistant to list all member orgs in a portfolio, pull the super-metrics for a parent organization, and see which locations are contributing to which portfolio KPIs.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the portfolio for sneeze-it and list which member orgs are contributing KPIs to each super-metric."*

The response shows the portfolio structure in real terms: parent org, member orgs, and the rollup relationships between them. That is the same architecture a multi-unit fitness franchise would run on.
