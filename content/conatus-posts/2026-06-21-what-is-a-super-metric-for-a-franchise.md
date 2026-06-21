---
title: A super-metric is the number your franchisor should have been reading all along
date: 2026-06-21
author: David Steel
slug: what-is-a-super-metric-for-a-franchise
type: founder_essay
status: published
series: franchise
series_part: 4
description: What a super-metric is, how it rolls up KPIs across franchise locations, and the five failure modes it fixes for multi-unit operators.
---

# A super-metric is the number your franchisor should have been reading all along

Here is the real problem with multi-unit franchise reporting: by the time your financials tell you a location is underperforming, you are already three months behind.

FranConnectGO put it plainly: operators are "always playing catch-up." The financial lag is structural. Monthly P&Ls arrive late. Unit managers compile their own spreadsheets. Area developers reconcile those spreadsheets into another spreadsheet. By the time the result reaches the franchisor, the problem that created the gap has been compounding for weeks.

The fix is not faster spreadsheets. The fix is a super-metric that reads live KPIs from every location at once.

## What a super-metric actually is

A super-metric is a KPI that lives on the portfolio (the franchisor's view) and is fed by KPIs from each member org (each location). When a location updates its own scorecard, the super-metric recomputes. The portfolio owner sees one number that reflects what all the locations are doing.

In OTP, the portfolio feature (available now in early access) makes this concrete. Each franchise location runs its own OTP org: a hybrid chart where human seats and AI agent seats share the same scorecard under one-seat-one-owner accountability. The location's Arin tracks speed-to-lead and booking rate. Its Dash reads ad performance. Its Radar manages the week. Its Tally pushes the KPI values back to the scorecard automatically, on schedule, without a person doing data entry.

The portfolio sits above all of that. It rolls the location-level KPIs up into super-metrics at the portfolio level. The franchisor does not log into each location's org to read each location's numbers. They read one portfolio view with one set of super-metrics that aggregates across the entire system.

That is the structural change. Not a faster spreadsheet. A live feed.

## The five failure modes a super-metric fixes

I run a marketing agency, Sneeze It, that works with multi-location fitness and wellness brands on the advertising side. I have watched these failure modes repeat across accounts. They are not operator mistakes. They are visibility architecture problems.

**1. The lag problem.** Franchisors learn about underperformance from the financial close, not from the operations. By the time the unit's EBITDA shows a problem, the cause is weeks old. A super-metric for something like lead volume or appointment rate is a leading indicator. It moves before the financials move. If you are watching system-wide booking rate as a super-metric and it drops at three locations in the same week, you know there is a pattern worth investigating before it hits the P&L.

**2. The averaging problem.** Most rollups show averages. An average hides the distribution. If eight locations are performing well and two are performing badly, the average looks acceptable. A super-metric in a portfolio view sits alongside the individual location KPIs, not instead of them. The portfolio shows you the system-level number AND you can drill to see which locations are pulling it down. The comparison is built in.

**3. The consistency problem.** A franchise system is only as strong as its weakest location running the standard playbook. When each location defines its own scorecard independently, the system stops measuring the same things. Corporate's "lead volume" and the unit's "lead count" are not the same metric. After a few years you cannot benchmark locations against each other because they are not counting the same way.

Presets solve this. In OTP, the portfolio can push preset defaults to every member org, and corporate can lock them. Every location inherits the standard scorecard structure. The unit's Tally pushes numbers against the same KPI definitions corporate set. The super-metric aggregating those numbers is comparing apples to apples. This is the franchise consistency problem solved at the measurement layer.

**4. The scale problem.** FRANdata confirmed that operators with 50 or more units grew 118.52% from 2010 to 2018, the fastest-growing tier in franchising. PE is now rolling up franchisees directly: Blackstone holds Jersey Mike's, Bain launched a platform in November 2025 specifically to acquire franchisee businesses. The operators managing 50, 100, or 200 locations cannot review each location's dashboard individually. They need a single view with super-metrics that surface which locations need attention. The ones that do not need attention should be invisible in the morning review. The ones that do should be loud.

**5. The diagnosis problem.** A flagged location needs to be diagnosed, not just flagged. The super-metric tells you that system-wide speed-to-lead is dropping. But it does not tell you whether the problem is at two locations or twenty, whether it is an agent misconfiguration or a staffing gap, or whether it started this week or three weeks ago. For that, you go from the super-metric into the member org's own scorecard, where the seat-level KPIs live. The portfolio and the org are connected. The drill path is built in.

## What this looks like at Sneeze It

I built OTP to run Sneeze It, so I can show you the real seat structure rather than a hypothetical.

Our org chart has human seats and agent seats on the same scorecard. Bogdan (COO) and Janine (accounting) sit next to Radar (chief of staff agent), Dirk (sales agent), Pulse (retention agent), Pepper (email agent), Crystal (project manager agent), Dash (analytics agent), Arin (call center agent), and Nick (prospecting agent). Tally, our KPI agent, pushes the numbers from each seat to the scorecard on schedule four times a day.

A franchise location running OTP builds the same structure for its own context. The location's Arin tracks speed-to-lead and appointment set rate. Its Dash reads the ad performance from the account that location controls. Its Radar manages the location's week. Tally pushes those KPIs on schedule.

When the franchise portfolio rolls that up, the franchisor's super-metric for "system-wide booking rate" is reading from every location's Tally-pushed scorecard. No manual compilation. No spreadsheet merge. No data-entry lag.

The seats at each location do the operational work so the people running the location are free for what matters. The portfolio does the aggregation so the franchisor is free to focus on the locations that actually need intervention.

## What the failure modes have in common

Look at the five failure modes again. They are all the same problem in different costumes.

A lag problem is a data-timing problem. A consistency problem is a definition problem. A scale problem is a surface problem. A diagnosis problem is a drill-path problem. The averaging problem is a distribution problem.

Every one of them is a visibility architecture problem.

The spreadsheet approach layers more aggregation on top of bad inputs. The super-metric approach fixes the inputs first, at the location level, and then the aggregation becomes accurate by default. You cannot have a reliable super-metric if the location-level KPIs feeding it are inconsistently defined, manually entered, or delayed by a monthly close cycle.

The preset lock plus the per-location agent team plus Tally pushing numbers on schedule is what makes the super-metric trustworthy. Without the definition lock, the aggregation is noise. Without the agent layer pushing numbers automatically, the aggregation is as slow as the person who remembers to update the spreadsheet.

## The honest framing

The OTP portfolio feature is in early access, not general release. It is the enterprise tier, and it is available to organizations that want to run the first real version of this with us. The portfolio invite flow, the super-metric configuration, and the preset locks are all live. The rollup recomputes when member orgs update their KPIs.

It is not a theoretical product. It is a working feature that takes the franchise structure, the one where one franchisor runs above many location orgs, and maps it directly onto the software architecture.

The companies I work with in fitness and wellness are running this pattern manually today. They are doing it with spreadsheets and Slack threads and weekly calls where the area developer reads numbers from a Google Sheet while the franchisor takes notes. The super-metric is what happens when you build the accountability structure into the software instead.

## See the live chart

The OTP MCP exposes live portfolio and org data, so you can query which super-metrics a portfolio carries and how member orgs are linked.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the portfolio structure for sneeze-it and list any super-metrics the portfolio carries."*

What you get back is the live architecture: the portfolio org, the member orgs feeding it, and the KPI structure that makes the rollup possible. That is the franchise visibility model, queryable in a single prompt.

---

*Series: Franchise. Post 4 of an in-progress series. Previous: [The preset lock is how a franchise sets its operating standard once and enforces it everywhere.](/blog/the-preset-lock-for-franchise-consistency)*
