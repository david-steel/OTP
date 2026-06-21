---
title: What a franchise founder sees in a portfolio is not data. It is proof that every location is running the same business.
date: 2026-06-21
author: David Steel
slug: what-a-franchise-founder-sees-in-a-portfolio
type: founder_essay
status: published
series: franchise
series_part: 41
description: The franchise founder's view inside an OTP portfolio: super-metrics, per-location scorecards, presets that lock the brand standard, and what happens when you can see all of it at once.
---

# What a franchise founder sees in a portfolio is not data. It is proof that every location is running the same business.

Nineteen percent of franchisees control 58.8% of all franchised locations. That number is from FRANdata and the IFA, and it means the franchise industry has already moved. The dominant operator class is no longer the single-unit owner. It is the portfolio operator, the person running five or fifteen or fifty locations under one P&L and, often, more than one brand.

That operator has one question every morning that no single-location dashboard has ever answered cleanly.

Is every location actually running my business, or am I running fifty separate businesses that share a name?

Most of the industry answers this with lagging financials. Monthly statements. Quarterly reviews. Variance reports that land three weeks after the variance already cost revenue. FranConnectGO describes the problem directly: "By the time financial results show a problem, it may be too late. Operators are always playing catch-up."

Playing catch-up at the portfolio level is not a reporting problem. It is a structural problem. The information architecture does not match the business architecture.

A franchise IS a portfolio. The solution is to make the software reflect that fact.

## What the portfolio view actually shows

OTP's portfolio feature is in early access now. The mechanics are straightforward enough that I can describe them without fluff.

A portfolio is a parent organization that groups member organizations under one roof and rolls their KPIs up into shared super-metrics. Each location (member org) keeps its own full chart: its own humans, its own agents, its own scorecard, its own seat assignments. The portfolio does not flatten the locations. It does not replace them. It sits above them and aggregates upward.

The franchisor view is the portfolio view. You open one screen and you see the super-metrics: system-wide KPIs fed by every location's data, rolling up into numbers you can act on. Average unit performance. Lead volume across the system. Show rate across the system. Same-store trends for the locations that have been open long enough to produce them.

The thing that changes when you have this view is not the data. The data existed before. What changes is the latency. Instead of waiting for a report to reveal a problem, you see the KPI move. When one location's show rate drops, the super-metric reflects it. When three locations' lead volume climbs together, you see the signal before it becomes a trend worth chasing separately.

The franchise founder is not reading reports anymore. They are watching a live chart.

## The preset problem, solved structurally

The visibility piece is half the answer. The other half is consistency.

Operators with 50+ units grew 118.52% from 2010 to 2018, the fastest-growing tier in franchising. The companies that built those portfolios learned the same lesson repeatedly: scale does not fail on growth. It fails on drift. Individual locations start interpreting the brand standard differently. SOPs get modified locally. Practices diverge. By the time corporate notices, the brand is no longer running as a single business.

OTP's portfolio handles this through presets. A portfolio sets default configurations (the sidebar structure, the settings) that its member orgs inherit. And the portfolio can lock those presets.

That is the franchise consistency problem solved structurally rather than through enforcement culture.

Corporate defines the standard chart once. Every location that joins the portfolio inherits it. Corporate can lock the elements that define brand compliance, so a franchisee cannot drift the scorecard into something that no longer matches the system's operating standard.

This is not a rules layer on top of an existing tool. It is the architecture of how the member org's chart is built. The standard is baked in from the moment the location joins.

## What each location is actually running

The reason the portfolio framing works for franchises, and not just for software companies that want to call something a portfolio, is that each location deserves a real operational chart of its own.

A single-location fitness brand running OTP has a chart with humans and agents sharing a scorecard. Bogdan holds a COO seat with his own rows. Janine holds an accounting seat. On the agent side, Arin runs call center management, watching speed-to-lead and appointment rate for every new inquiry. Dash tracks ad performance across Meta and Google. Radar runs the daily brief. Tally pushes KPI values to the scorecard on a cadence. Pulse watches client retention signals. Dirk handles sales pipeline. Pepper manages inbound email triage. Nick runs cold prospecting for new locations.

One seat. One owner. One metric. Human or agent: the discipline is the same.

Now multiply that chart across a franchise system. Every location gets the same architecture. Each location's Arin is watching that location's speed-to-lead. Each location's Dash is watching that location's ad spend. Each location's Radar is running that location's daily brief.

The portfolio is what makes those per-location charts visible at the franchisor level. The super-metrics roll upward. The preset locks the standard downward. The founder is in the middle, looking at both.

That is the view no report ever gave.

## Counter-positioning the visibility-lag default

Most franchise tech approaches the visibility problem by making reports faster. Better dashboards. More frequent data pulls. Prettier charts on the same lagging numbers.

The counter to that is not better reporting. It is a different accountability structure.

A faster report still tells you what happened. A live seat-based scorecard tells you who is responsible for what is happening now, and whether that seat (human or agent) is performing to standard.

The difference matters because the fix is different. If your report shows a location underperforming, you start an investigation. If your portfolio shows a specific seat (the Arin at that location, the Dash at that location) with a metric below target, you start a seat conversation. What changed in the inputs. What changed in the SOP. What does the seat need to recover the number.

The accountability is structural. The conversation is specific. The fix is faster because the cause is named.

This is what lets agents carry the operational work, so people are free for the work that matters. When every location's Arin is watching speed-to-lead in real time, the founder is not watching speed-to-lead. The founder is making the decisions that compound across all locations, with the portfolio view confirming that the system is holding.

## Where this lands

The portfolio feature in OTP is enterprise tier and available now in early access. The architecture is: one portfolio organization, member orgs invited in, super-metrics fed by member KPI data, presets pushed and locked from the portfolio level. No fabricated case study is going to tell you what it feels like to use it. The right move is to build a location's chart first, get the discipline working at a single org, and then evaluate whether the portfolio view is the right next step for where your operation is headed.

The franchise founder who is playing catch-up with monthly financials is not missing a better report. They are missing an architecture where the business's accountability structure matches the business's operating structure.

A franchise is a portfolio. The chart should reflect that.

## See the live chart

The OTP MCP exposes what a portfolio org and its member orgs look like structurally, including how super-metrics are defined and which seats roll up into the franchisor view.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the sneeze-it org chart and describe which seats could roll up into a franchise portfolio super-metric."*

You will see the actual seat structure that underpins this post, which makes the architecture concrete instead of theoretical.

---

*Series: Franchise. Part 41 of an in-progress series. Questions from franchise operators become posts. Write to dsteel@orgtp.com.*
