---
title: The franchise consistency problem is not a training problem. It is a structure problem.
date: 2026-06-21
author: David Steel
slug: how-to-enforce-brand-standard-operations-across-locations
type: founder_essay
status: published
series: franchise
series_part: 9
description: Why SOP documents and compliance inspections fail to hold brand standards across locations, and how structural presets fix the problem at the source.
---

# The franchise consistency problem is not a training problem. It is a structure problem.

Every multi-location franchise operator I have talked to has the same answer when I ask how they enforce brand standards.

They have documents. They have training programs. They have regional managers who drive circuits. Some have mystery shoppers. Some have compliance checklists that get filled out every quarter and filed somewhere.

Then they have locations that drift.

And when I ask why the drift happens, the answer is almost always some version of: "People do not follow the documents."

That is the wrong diagnosis. People do not follow documents that are not connected to anything they are measured on. Documents are aspirational. Structure is operational. The consistency problem in franchising is not that the brand standards are unclear. The standards are usually clear. The problem is that the standards live in a document, and the scorecard the location runs on does not enforce them.

That gap is where brand drift lives.

## What the standard enforcement model actually does

The traditional approach to brand consistency in a multi-unit system looks like this.

Corporate writes the standard. The standard gets documented in an operations manual. The manual gets distributed. Location managers read it (or do not). Training happens at onboarding. Then the location runs, and whether the standard holds is a function of individual manager discipline, not system design.

The feedback loop is slow. Financial reporting shows you a problem months after it started. "By the time financial results show a problem, it may be too late," according to FranConnectGO's operators survey. The phrase that comes up over and over is that operators are "always playing catch-up."

The compliance inspection is the band-aid on this. Send a regional manager out. Score the location. Write up the findings. Send them to corporate. Wait for the next quarter.

This works at five locations. It does not work at fifty. And the 19.3% of franchisees who now control 58.8% of all franchised locations are not running five-location portfolios. They are running systems, and systems need structural enforcement, not inspection cycles.

## The structural alternative

The counter-positioning here is simple. Instead of writing the standard in a document and hoping it gets followed, you encode the standard in the operating structure every location inherits from day one.

This is what OTP's portfolio feature does, and it is why the preset mechanism is the most important part of it for franchise operators.

A portfolio is a parent organization that groups member orgs under one roof and rolls their KPIs up into shared super-metrics. Each member org is a location with its own full chart: humans and AI agents on one scorecard, one-seat-one-owner. The portfolio's job is to aggregate those charts, benchmark locations against each other, and give corporate a cross-location view without stripping locations of their autonomy.

The presets are the consistency lever.

The portfolio sets default configurations that every member org inherits. Then corporate can lock those defaults. The lock means the location cannot deviate. The standard is not in a document. It is in the structure of the chart itself.

When you lock a preset, you have just automated your compliance inspection. The location does not need to remember to follow the standard. The standard is the floor the location operates on.

## What this looks like in a real operating structure

At Sneeze It, we do not run a franchise. We run an agency. But the structure we use to manage our own team is exactly what I would use to manage a portfolio of franchise locations, because the accountability problem is the same.

Radar is our chief-of-staff agent. Radar coordinates the operating week: briefings, calendar conflicts, delegation tracking, standups. Tally is our scorecard agent. Tally pushes KPI values from local sources to the OTP chart on a scheduled cadence four times a day. Arin is our call center agent. Arin tracks speed-to-lead, appointment rate versus the 30% target, and agent-level dial performance across the whole calling operation.

Each of these seats has specific metrics, a specific owner, and a specific cadence. The metrics are not advisory. They are the scorecard. When a number drops, the conversation happens at the next meeting, not in the next quarterly inspection.

Now imagine that structure at the location level. Each location runs its own Radar for operational coordination. Its own Arin for speed-to-lead and booking rate. Its own Dash for performance analytics. Its own Pulse for client retention signals. The agents carry the operational load, so the humans at the location are free for the work that matters.

Then the portfolio sits above all of that. Corporate does not need to call twelve locations to find out how appointments are trending. The super-metric at the portfolio level aggregates appointment rate across every location and surfaces the outliers. The location at 18% appointment rate is visible in the same view as the location at 34%. That conversation happens before the quarter closes, not after.

## Why the inspection model cannot catch up

The inspection model has a physics problem. A regional manager can cover maybe eight to twelve locations a quarter, in a good week. If you have fifty locations, your worst-performing location might not be inspected for months. Meanwhile, the problem is compounding.

Location-to-location benchmarking is explicitly named by multi-unit operators as a requirement. It is not a nice-to-have. It is the thing that tells you whether your low-performer is a training issue, a market issue, a staffing issue, or something in the brand execution. You cannot get to that answer from a quarterly inspection.

A portfolio with live KPI aggregation gives you the benchmarking view continuously. The location that is underperforming shows up not by waiting for a financial report but by diverging from the portfolio median on the metrics that matter. Speed-to-lead is a clean example. If nine locations answer a new lead within five minutes and one location averages forty-two minutes, that divergence is visible in the portfolio view the same day it happens.

The inspection model would find that in three months. The portfolio view finds it Tuesday.

## The lock is not a restriction. It is a gift.

Franchise operators sometimes worry that locking a preset is a control play that will alienate franchisees.

I think about it differently. A locked preset is a gift to the franchisee.

When a franchisee buys into a brand, they are buying the operating system as much as the name. The operating system is what makes the unit work. If the franchisor's job is to give every franchisee the best possible chance of succeeding, then locking the standard scorecard structure is part of that job. The franchisee does not have to figure out what to measure. They do not have to build the chart from scratch. Corporate has done that work, and the preset is how it transfers.

The conversation changes from "here is a document, please follow it" to "here is the structure, it is already in your chart." That is not a restriction. That is operational leverage.

## The early access reality

The OTP portfolio feature is available now in early access, as part of the enterprise tier. It is not default-on for everyone. It is behind a Labs flag while we are learning how portfolios perform in the real world and how the preset locking behavior should evolve as the feature matures.

That is honest. This is early infrastructure, not a finished product. But the structure is real. The super-metrics are live. The presets exist. The lock works.

If you are managing multiple locations and you want the brand consistency problem solved at the structure level rather than the inspection level, this is the place to start.

## See the live chart

The OTP MCP exposes current portfolio and member-org relationships, so you can query how a real portfolio's preset configuration maps to member-org chart structure.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me how the sneeze-it org uses presets and what KPIs Tally is tracking on the scorecard right now."*

You will see a live chart with real seats, real metrics, and real cadence. That is the structure a portfolio location would inherit on day one, not a template you have to build yourself.

---

*Series: Franchise. Post 9 of an in-progress series.*
