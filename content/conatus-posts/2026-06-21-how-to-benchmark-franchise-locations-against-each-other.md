---
title: Benchmarking franchise locations against each other requires a shared chart before it requires a shared report
date: 2026-06-21
author: David Steel
slug: how-to-benchmark-franchise-locations-against-each-other
type: founder_essay
status: published
series: franchise
series_part: 6
description: The decision tree for cross-location benchmarking in a franchise. Starts with what you actually need before a comparison means anything.
---

# Benchmarking franchise locations against each other requires a shared chart before it requires a shared report

Every multi-unit operator I talk to wants the same thing: a view that shows all their locations ranked by performance, side by side, so they can see who is winning, who is lagging, and why.

Most of them already have reports. The reports are not the problem.

The problem is that the reports describe different things. Location A tracks "booked appointments." Location B tracks "confirmed bookings." Location C tracks "shows." They look like the same metric. They are not. The moment you put those three numbers in a column and call it a benchmark, you have built a comparison that will cost you real decisions.

Benchmarking franchise locations against each other is a decision tree. The first branch is not "which report do I build." The first branch is "do my locations measure the same things the same way." If the answer is no, stop and fix that first. Everything downstream of a broken definition is noise dressed as data.

Here is how I think through the tree.

## Branch one: Do your locations share a common chart?

A chart is not an org chart. It is a structured list of every seat in an organization, each seat owned by exactly one person or agent, each seat carrying the metrics that seat is accountable for.

If each of your locations is running its own chart with its own seat definitions, in its own spreadsheet or Slack channel or whatever the manager decided to track, you do not have a benchmark problem. You have a standardization problem. Benchmarking will not help you. It will surface numbers that are incomparable and you will spend the comparison meeting arguing about definitions instead of fixing performance.

If your locations share a common chart structure, where the same seat names appear at every location and each seat carries the same metric definition, you can benchmark. You cannot benchmark before that.

This is Branch One. The decision: does a common chart exist? Yes or no.

**If no:** define the standard chart first. One franchisor. One chart template. The seats that exist at every location (your local Radar running operations, your Arin managing lead response, your Dash reading the numbers) must be identical across locations, with identical metric definitions. Then come back to this tree.

**If yes:** proceed to Branch Two.

## Branch two: Are the metrics being pushed consistently?

A shared chart structure is necessary but not sufficient. The locations also need to push their numbers on a common cadence, using the same source of truth for each metric.

This is where most multi-unit operators fall apart. Corporate sets a chart. Locations use it unevenly. Some push numbers daily. Some push weekly. Some push when they remember. By the time you pull a portfolio view, you are comparing a number that was updated this morning at one location against a number from ten days ago at another. The benchmark is a lie.

The decision here: are all locations pushing the same metrics on the same cadence from the same source? Yes or no.

**If no:** the fix is not more reporting. The fix is locking the cadence at the portfolio level. A portfolio preset can define the update schedule and the source definition for each metric, and every member location inherits that preset. Lock it and the variation disappears. You standardize once; every location runs to that standard.

**If yes:** proceed to Branch Three.

## Branch three: What kind of comparison do you need?

Once you have a shared chart and consistent cadence, the benchmark question splits into two distinct use cases. They require different outputs.

**Use case A: identify the outlier.**

You have fifteen locations. Fourteen are running 28 to 34 percent booking rate. One is at 19 percent. You need to find that location fast, before the visibility lag catches up with you. FranConnectGO put it plainly: "By the time financial results show a problem, it may be too late." Operators "always playing catch-up." The portfolio super-metric solves this case. When every location is feeding its booking rate into a portfolio-level aggregation, you see the outlier the moment the number is pushed, not three weeks later when the monthly report lands.

**Use case B: understand the gap.**

You found the outlier. Now you need to know why. Is it the lead volume? The speed-to-lead? The setter's conversion rate from dial to appointment? The show rate? This is a seat-level question, not a portfolio question. You pull the underperforming location's chart, walk its seat rows, and compare each row against the same row at a top-performing location. Radar at Location A has a 4-minute average speed-to-lead. Radar at Location C has a 22-minute average. That is the gap. That is the coaching target.

These two use cases run in sequence. Portfolio view finds the who. Location chart view finds the why. You need both surfaces. One does not substitute for the other.

## Branch four: What are you actually benchmarking?

This is the most skipped step and the most expensive one to skip.

Franchise performance has two categories of metric: unit economics and operational. Unit economics are things like AUV (average unit volume, the average annual revenue per location), same-store sales growth (growth for locations open at least a year, which isolates organic improvement from the volume effect of new openings), and EBITDA margin. Operational metrics are things like speed-to-lead, booking rate, show rate, and labor as a percentage of revenue.

Both matter. They tell you different things. AUV and same-store sales describe the output. Operational metrics describe the machine that produces the output. If you benchmark only AUV, you see the gap but not the lever. If you benchmark only booking rate, you see the lever but not the business impact.

The tree here: what is the decision you are trying to make?

If the decision is "which location gets more marketing investment," benchmark AUV and same-store sales growth together. Highest AUV with flat same-store growth is different from lower AUV with 12 percent same-store growth. The second one gets the investment.

If the decision is "which location gets operational coaching," benchmark the seat-level operational metrics. Arin's speed-to-lead row. The booking rate row. The show rate row. Compare those across locations and you have a coaching queue ranked by impact.

If the decision is "which location needs a staffing conversation," benchmark labor percentage alongside AUV. High labor, low AUV is the target.

Operators with 50+ units grew +118.52 percent from 2010 to 2018, the fastest-growing tier in the system (FRANdata). The operators who scaled into that tier were not the ones with the best reports. They were the ones who could act on the comparison fast. The benchmark only has value when the decision it produces is clear before you pull the numbers.

## What the portfolio layer does in practice

At Sneeze It, our internal chart runs a hybrid of humans and agents on one scorecard. Bogdan as COO holds rows on the same dashboard as Radar (our chief-of-staff agent), Tally (our scorecard and KPI agent), Dirk (sales), Pulse (retention), Pepper (email), Crystal (project management), Dash (analytics across accounts), Arin (call center and speed-to-lead), and Nick (prospecting). One seat, one owner, one set of metrics. No row is labeled "human" or "agent."

For a franchise, that same model runs at every location. The location has its own Arin handling speed-to-lead and booking rate. Its own Radar running the daily operational brief. Its own Dash reading the numbers. The franchisor's portfolio layer rolls each location's Arin row, each location's booking rate, each location's speed-to-lead, up into a super-metric at the portfolio level. The corporate team sees one number per metric per location, side by side, updated on the same cadence, using the same definition. The outlier is visible the same day. The coaching decision follows the same week.

This is what the OTP portfolio feature does, available now in early access. The portfolio is a parent org that groups member orgs (your locations) under one view. Each member org keeps its own full chart. The portfolio layer holds super-metrics that aggregate across member KPIs. Presets let the franchisor set the standard chart once and lock it across every location. Corporate gets the cross-location benchmark. Each location keeps its own full seat accountability.

This is not a reporting layer on top of your existing data. It is a structural layer that forces the definitions to match before the comparison is possible. That is why it solves the problem the reports do not.

## The tree, compressed

Here is the decision sequence:

Do your locations share a common chart with shared seat names and shared metric definitions? If no, build that first. If yes, continue.

Are all locations pushing their metrics on the same cadence from the same source? If no, use presets to lock the cadence. If yes, continue.

What kind of comparison do you need? Portfolio super-metric view to find the outlier. Location chart view to find the why. Both, in sequence.

What is the decision this benchmark serves? Match the metrics to the decision before you pull the numbers. AUV and same-store sales for investment allocation. Operational seat metrics for coaching. Labor percentage plus AUV for staffing.

That is the tree. The comparison is the last step, not the first.

## See the live chart

The OTP MCP can show you the current portfolio structure, including which super-metrics roll up from member org KPIs and how presets propagate to member orgs.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the sneeze-it org chart and explain which seat metrics would map to franchise location benchmarks."*

You will see exactly which seat rows, metric names, and cadences would need to exist at every location before a cross-location comparison is valid. That gap between what you see and what your current locations actually track is the standardization gap. Close it, and the benchmark becomes real.

---

*Series: Franchise. Post 6 of an in-progress series.*
