---
title: A franchise is a portfolio. The org structure has always said so.
date: 2026-06-21
author: David Steel
slug: why-a-franchise-is-really-a-portfolio
type: founder_essay
status: published
series: franchise
series_part: 2
description: Franchising has concentrated into a portfolio business. Nineteen percent of franchisees control 58% of locations. Here is why the structure demands a portfolio view.
---

# A franchise is a portfolio. The org structure has always said so.

Here is the number that reframed how I think about franchising: 19.3% of franchisees control 58.8% of all franchised locations. That is not a market share statistic. That is a portfolio management statistic dressed in franchise language.

When nearly six in ten franchise locations are owned by fewer than two in ten franchisees, those owners are not running a business. They are running a portfolio of businesses. The legal structure says "franchise." The operational reality says "multi-location operator with a visibility problem."

The visibility problem is the thing that actually matters. FranConnectGO describes it plainly: by the time financial results show a problem, it may be too late. Operators are always playing catch-up. And the faster you grow, the further behind you fall, because each new location adds another set of numbers you are not seeing in time.

This is the problem OTP's portfolio feature was built for. A franchise is a portfolio. Treat it like one.

## What "portfolio" actually means structurally

The word gets used loosely. What I mean here is precise.

A portfolio is a parent organization that groups member organizations under one roof and rolls their KPIs up into shared super-metrics. Each member organization keeps its own full chart, its own scorecard, its own seats. The portfolio is the layer above that: the view where system-wide numbers live, where location-to-location benchmarking happens, and where the franchisor can see every location's signal without waiting on a monthly report.

In OTP, a portfolio works exactly this way. The franchisor is the portfolio. Each franchisee location is a member org. The franchisor invites each location in. Each location already runs its own OTP chart, with its own people and agents on it. The portfolio layer rolls their KPIs up into super-metrics: system-wide average unit volume, total leads, aggregate show rate, same-store trends. The franchisor sees all of it in one place.

This is not a reporting feature. It is a structural claim: a franchise is a portfolio, and the software should reflect that.

## The location is its own org

Before the portfolio layer makes sense, the single location has to make sense as a unit.

Each franchise location is a full operating business. It has a general manager. It has front-desk staff. It has a call center or a setting function. It has ad spend. It has a lead-to-appointment funnel. In a modern location, it increasingly has AI agents working inside that funnel. The location needs a scorecard, a chain of accountability, and a way to see whether its numbers are moving in the right direction.

At Sneeze It, we work with multi-location fitness and wellness brands on the ad and call center side. The operational shape of a well-run location looks like a hybrid chart: humans and agents on the same scorecard, one seat per function, each seat accountable for its numbers.

For a location running a call center, that means Arin (our call center agent, named after CCM Mastery's creator) is tracking speed-to-lead, dial volume, and appointment rate daily. The target for appointment rate is 30% of new leads converted to booked appointments. When the number drops, the conversation happens at the next review, with the same discipline you would apply to any human seat.

Radar, our chief-of-staff agent, runs the daily briefing: what happened in the last 24 hours, what is overdue, what needs a decision. Tally pushes the KPI values to the scorecard at 10:15, 12:15, 3:15, and 6:00 each day. The scorecard is never stale by more than a few hours.

Dash, our analytics agent, reads the ad account data across Meta and Google. When spend is up and appointments are down, Dash flags it before a human would have caught it. Pulse tracks client retention signals. Dirk handles sales.

This is what a location looks like when it is organized as an OTP org: humans and agents on the same scorecard, with live numbers pushing into the chart on a defined cadence. No guessing. No lag.

Now put 20 of those locations into a portfolio.

## What the franchisor actually sees

The franchisor's job is not to manage every location. The job is to see every location clearly enough to know which ones need attention and which ones do not.

This distinction matters because most multi-unit operators get it backwards. They either centralize everything (and kill the local responsiveness that makes each location work) or they decentralize everything (and lose visibility until a problem has already cost them money). The right posture is: each location runs itself, the portfolio rolls up what matters.

In OTP's portfolio view, each location's KPIs feed into super-metrics at the portfolio level. System-wide appointment rate. Average unit volume across the group. Same-store lead volume compared to the prior period. The franchisor does not have to call each GM to build this picture. The picture is already built.

Location-to-location benchmarking comes from the same structure. When location 7 has a 28% appointment rate and location 3 has 19%, that gap is visible in the portfolio view before it shows up in a monthly report. The operators with 50+ units grew 118.52% between 2010 and 2018, the fastest tier in franchising. Those operators are not competitive because they are better managers. They are competitive because they built systems that make comparison visible at scale.

## Presets: where the brand standard lives

Every franchise system has a brand standard. How the phones get answered. What the intake call looks like. What the appointment confirmation sequence is. What the GM's weekly review covers. The standard is what the brand is.

The failure mode is not that franchisees ignore the standard. The failure mode is that the standard lives in a PDF nobody reads, and by month four each location is running its own version of the standard without corporate realizing it.

OTP's preset system solves this structurally. The franchisor sets the portfolio's preset configuration once: the chart structure, the scorecard metrics, the reporting cadence. Every member org inherits those defaults. And if the franchisor wants, they can lock them. Corporate defines the standard. Every location runs it. Nobody drifts.

This is not administrative control for its own sake. It is the organizational equivalent of a franchise agreement made operational. The franchise agreement says the standard exists. The preset system says the standard runs.

## Why visibility lag is the actual failure

The 19.3%/58.8% concentration tells you that franchising has already become a portfolio business. What it does not tell you is that the tools most operators are using to manage their portfolios were not designed for portfolios.

A spreadsheet per location, a quarterly review per GM, a reporting cadence measured in months: these are single-unit tools applied to a portfolio problem. By the time the quarterly review surfaces a decline in location 4's appointment rate, the decline has been compounding for ten weeks.

The fix is not more frequent spreadsheets. The fix is a live scorecard for each location, feeding into a portfolio view that benchmarks locations against each other and flags the outlier before it becomes a problem. This is what OTP's portfolio feature does, available now in early access for teams who want to run the structure before it is default-on for everyone.

The mission underneath it is one I come back to constantly: let agents carry the operational work, so people are free for the work that matters. For a franchise operator, the operational work is scorecard maintenance, report generation, lag detection. The work that matters is growing the portfolio, closing new locations, building the brand. The portfolio view is the mechanism that makes the distinction real.

A franchise IS a portfolio. Structuring it as one is how you stop playing catch-up.

## See the live chart

You can ask OTP's MCP what super-metrics and member orgs are visible in a live portfolio, which shows exactly how the rollup layer sits above member-org KPIs and what data the franchisor seat actually sees.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the portfolio view for sneeze-it and list the super-metrics that roll up from member orgs."*

You will see how the parent layer sits above the individual org charts, and why the structural difference between a per-location scorecard and a portfolio-level super-metric is the visibility gap that franchising has been trying to close for twenty years.

---

*Series: Franchise. Post 2 of an in-progress series. Previous: [The franchise org chart has an accountability gap. Here is what fixes it.](/blog/franchise-org-chart-accountability-gap)*
