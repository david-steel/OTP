---
title: What a multi-unit owner-operator actually gets on day one with a portfolio view
date: 2026-06-21
author: David Steel
slug: what-a-multi-unit-owner-operator-gets-on-day-one
type: founder_essay
status: published
series: franchise
series_part: 44
description: A diagnostic of the four visibility failures that hit every multi-unit operator, and what changes when you put all locations on one portfolio view from the start.
---

# What a multi-unit owner-operator actually gets on day one with a portfolio view

The failure mode is almost always the same.

A franchisee signs on unit two, sometimes unit three, and then spends the next eighteen months managing by feel. They visit each location in a rotation. They read spreadsheets their managers send on Friday afternoons. They learn about problems the same way a smoke detector learns about a fire: after it is already burning.

FranConnectGO described it plainly: "By the time financial results show a problem, it may be too late. Operators are always playing catch-up."

This is not a character flaw. It is a structural gap. The operator owns multiple locations but has no single surface that shows all of them together, updating in real time, with each location's KPIs side by side. So they play catch-up. They always have.

What OTP's portfolio view changes, on day one, is the structure of that problem. Not by adding another report. By making the gaps impossible to hide.

## The four visibility failures that hit every MUO

Before talking about what the portfolio fixes, it helps to name the failures it is designed to surface. In my work with multi-location operators, the same four show up in different costumes.

**Failure one: The underperformer you cannot see.**

When each location lives in its own system, the only way to find the underperformer is to look at each location separately and mentally compare them. Most operators do not have time to do this with any regularity. So the underperformer runs for months, sometimes longer, before anyone triangulates the pattern. By the time it surfaces, the gap between that location and the rest of the portfolio has compounded into something much harder to close.

The portfolio view makes this comparison automatic. Every location's KPIs roll up into shared super-metrics at the portfolio level, and each location's numbers sit next to each other in one view. The underperformer does not hide. It shows up as the row that is out of line with the rest.

**Failure two: The consistency problem that looks like a performance problem.**

When one location's numbers drop, the instinct is to look at the manager, the team, the local market. Sometimes that is right. But often, the root cause is simpler: the location stopped doing the thing the standard says it should do, and no one caught it.

Operators with 50 or more units grew 118% from 2010 to 2018, the fastest-growing tier in franchising. At that scale, consistency is not a soft cultural concern. It is the mechanical condition on which the entire portfolio depends. One unit interpreting the booking SOP differently costs you leads. Five units doing it costs you a material percentage of your system's revenue.

The presets feature in OTP's portfolio is built for exactly this. A portfolio can define default settings and a standard scorecard structure, push them to every member org, and lock them. The lock is not a suggestion. Corporate sets the operating standard once. Every location inherits it. Deviation becomes visible immediately because the locked structure does not drift.

This is what corporate-defined standards actually need to be: structural, not cultural. Not "here is our brand guide" but "here is your scorecard, and you cannot move these columns."

**Failure three: The agent gap that opens at unit two.**

Running one franchise location with a well-structured team is hard enough. Running two or three without extending the same operational intelligence to each one is where most MUOs first feel the pressure.

At Sneeze It, we run a hybrid chart: humans and agents sharing one scorecard, one-seat-one-owner. Radar handles daily briefings and calendar orchestration. Arin manages call center performance and coaches the team on speed-to-lead metrics. Dash pulls ad performance and flags patterns. Tally pushes KPI values to the scorecard on a four-times-daily schedule. Each seat has one owner, one accountability, one row on the dashboard.

For a multi-unit operator, the question is whether each location can run this same structure independently, with its own chart, while the franchisor (or the operator above the locations) sees all of them in one place.

That is exactly what the OTP portfolio architecture makes possible. Each location is a member org with its own full chart: its own Radar, its own Arin or speed-to-lead agent, its own analytics seat. The portfolio rolls those KPIs up into super-metrics at the top level. The operator sees the system view. Each location keeps its own operational detail.

The agent gap is real: franchisees who have not built out per-location agent teams are running on human attention alone at each location, which means they scale by hiring, not by structure. A portfolio that lets every location inherit a standard agent-seat configuration from day one changes that math.

**Failure four: The data freshness problem disguised as a management problem.**

The standard MUO management tool is a Friday report. A manager at each location fills out a template, sometimes a spreadsheet, sometimes a form, and sends it up. The operator reads all of them on the weekend and makes decisions on Monday based on data that is already three to five days old for anything that happened Tuesday or Wednesday.

This is not a management problem. It is a data freshness problem. The decisions are fine. The data they are based on is stale before it arrives.

A portfolio with live member-org KPIs does not fix every data freshness problem. Locations still need to be set up correctly, with their own scorecards and agents updating them. But when that infrastructure is in place, the operator is not waiting for Friday. The portfolio super-metrics update when the member orgs update. The visibility is structural, not calendar-dependent.

## What day one actually looks like

OTP's portfolio view is available now in early access (gated behind the Labs toggle at /settings/labs, enterprise tier). It is not yet on by default for everyone.

On day one, a multi-unit operator setting up a portfolio creates the portfolio org, invites their existing location orgs as member orgs, and configures the super-metrics they want to see at the top level. Each location keeps its own chart. Each location's KPIs feed the portfolio.

That day-one view is not a finished system. The finishing work is on the location orgs: building out the scorecard for each one, putting the right seats on it, adding the agent team that runs those seats. That is where the real leverage is.

But the portfolio makes visible the current state of each location from the moment the locations join. Even if the location orgs are sparse at first, the structure is there. The operator can see all of them. The underperformer is already visible. The consistency lock is already in place.

That is what changes on day one. Not a new report. A new baseline.

Franchising has concentrated: 19.3% of franchisees now control 58.8% of all locations. The operators at that scale are not managing by feel. They cannot. The franchise economy is $936B in output across 851,000 establishments and more than 9 million jobs. At that volume, the infrastructure that holds it together has to be structural, not relational.

The thesis of this series is that a franchise is a portfolio. Each location is a member org. The franchisor is the portfolio view that holds them together. The mission underneath it is simple: let agents carry the operational work at each location, so the people running those locations are free for the work that actually requires them.

Day one gives you the view. The work that follows is building the chart that makes the view worth looking at.

## See the live chart

You can query the OTP MCP right now to see what a portfolio configuration looks like, including how super-metrics connect to member org KPIs and how the preset lock flows down to locations.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me how a portfolio org rolls up KPIs from member orgs into super-metrics, and what gets locked by presets."*

What comes back is the actual data model: the relationship between the portfolio and its members, the super-metric structure, and the preset inheritance chain. That is the architecture a multi-unit operator is buying when they set up a portfolio. Seeing it in structured form before you build it is the fastest way to understand what you are actually setting up.
