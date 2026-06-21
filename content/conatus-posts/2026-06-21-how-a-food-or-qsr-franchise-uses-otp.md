---
title: Before OTP, a QSR franchise operator learns about problems from a P&L. After OTP, they learn before the P&L.
date: 2026-06-21
author: David Steel
slug: how-a-food-or-qsr-franchise-uses-otp
type: founder_essay
status: published
series: franchise
series_part: 37
description: How a food or QSR multi-unit operator goes from visibility lag to live location KPIs, using OTP's hybrid chart and portfolio feature.
---

# Before OTP, a QSR franchise operator learns about problems from a P&L. After OTP, they learn before the P&L.

The deepest multi-unit base in franchising is food and QSR. Every other vertical borrows the model. Every other vertical has the same core failure.

FranConnectGO put it plainly: "by the time financial results show a problem, it may be too late." Operators are "always playing catch-up." The financial statement is a lagging indicator. By the time a location's underperformance shows up on paper, the revenue opportunity is already gone.

This is not a new insight. It is an unsolved problem dressed up as an accepted constraint.

I built OTP to solve it. The portfolio feature (available now in early access) is what takes it from "one location's chart" to "every location on one view." Here is what that looks like, before and after, for a food or QSR operator.

## Before OTP

A multi-unit QSR operator with eight locations does not suffer from a data shortage. They suffer from data lag and data scatter.

Before OTP, the picture looks something like this.

Corporate gets weekly sales numbers from the POS system. Each location manager submits a report. The regional ops director compiles it into a spreadsheet. That spreadsheet goes to the franchise owner two or three days after the week ends. By the time the owner sees it, the week being analyzed is ten days in the past.

Same-store sales are tracked, but only in the sense that someone calculates them once a month from the accounting system. AUV (average unit volume) is a number the owner knows annually, from their FDD, not from a live dashboard. Labor percentage exists inside the POS for whoever logs in to look. Cross-location labor comparisons require someone to pull eight POS exports, paste them into a common format, and do the comparison manually.

Speed-to-lead does not exist as a concept inside most QSR orgs because there are no leads. The customer walks in. But for any QSR brand with digital ordering, catering, or a loyalty program, there is a response time metric buried somewhere that nobody is tracking.

The ops director is a coordinator. They relay information between locations and corporate rather than surfacing patterns across locations. They are the human API layer in a system that does not have a real one.

When a problem emerges, they find it in the P&L.

## After OTP: the location chart

The starting structure is simple. Each location runs its own OTP org. That org has a hybrid chart: human seats and agent seats on the same scorecard, one-seat-one-owner.

The human seats look like this: a general manager seat with the GM's name on it. A shift lead seat. A district manager or ops director seat covering this location as one of several they own.

The agent seats do the work that used to fall into the cracks. A Radar-equivalent seat handles daily briefing: what happened yesterday, what is on the schedule, what tasks are overdue. An Arin-equivalent seat watches speed-to-service metrics and coaching notes for the counter team. A Dash-equivalent seat tracks location-level spend and lead flow for any digital acquisition this location is running. A Pulse-equivalent seat monitors the digital loyalty numbers: reactivation, visit frequency, churn signals.

None of these agents are humans paid to stare at a dashboard. They are seats on the org chart doing specific work with specific metrics. Let agents carry the operational work, so people are free for the work that matters.

The GM's scorecard row tracks what the GM is accountable for: location revenue vs. target, labor percentage, customer satisfaction score, waste percentage. The Arin-equivalent row tracks speed-to-service, order accuracy rate, and coaching action completion. Those rows sit on the same chart, reviewed together, not on separate dashboards that nobody compares.

When a metric drops, the conversation is not "which system do I check?" It is "which row moved and why?"

## After OTP: the portfolio view

The portfolio is what happens when you put all eight locations under one roof.

In OTP, a portfolio is a parent org. Each location is a member org. The franchisor (or the multi-unit operator acting as their own corporate layer) creates the portfolio, invites each location's org, and now has a cross-location view rolling every location's KPIs into shared super-metrics.

Same-store sales growth across all locations, aggregated from each location's own revenue row, becomes a portfolio-level super-metric. Labor percentage per location feeds a portfolio-level view that shows you, at a glance, which location is at 28% and which is at 34%. AUV sits at the portfolio level, fed by each unit's revenue number. The ops director's daily view is not eight separate charts. It is one portfolio with eight member rows contributing to shared numbers.

This is location-to-location benchmarking built into the structure of the org, not bolted on after the fact.

The presets feature is where the consistency problem gets solved structurally. Corporate defines the standard chart once: these are the seats every location has, this is the scorecard every location uses, these are the metrics every seat tracks. Every location inherits that preset when they join the portfolio. Corporate can lock it. A location manager cannot quietly rename the labor percentage metric to something that makes their numbers look better. The standard is the standard.

For QSR, where brand consistency is the product, this matters more than the benchmarking does. A customer who has a bad experience at location five does not blame location five. They blame the brand. The preset is what prevents location five from quietly drifting off the brand's operational standard without corporate realizing it.

## The before/after in plain terms

Before OTP: the ops director is the information layer. After OTP: the information layer is structural, and the ops director is the decision layer.

Before OTP: a problem in location three shows up in the P&L. After OTP: it shows up in the location's scorecard row, flagged by an agent seat, before the P&L closes.

Before OTP: comparing labor percentage across eight locations takes a spreadsheet and two hours. After OTP: it is a portfolio super-metric that updates when each location's agent seat pushes the number.

Before OTP: onboarding a new location means training the new GM on "how we do things here" and hoping the training holds. After OTP: the new location's org inherits the portfolio preset, gets the standard chart on day one, and the franchisor can lock the metrics that cannot drift.

The financial statement does not go away. It still matters. But the financial statement is now a confirmation of what the portfolio already told you, not the first time you hear about a problem.

## What the portfolio feature is and is not

I want to be precise here because accuracy matters more than a clean pitch.

The portfolio feature is available now in early access. It is the enterprise tier of OTP. It is not mass-adopted and I am not going to pretend it is. If you are a multi-unit QSR operator and this structure interests you, you are in the early-access window, which means you are getting it before it is default-on for everyone.

The feature does exactly what I described: it groups member orgs under a parent portfolio org, rolls member KPIs into portfolio super-metrics, and gives the franchisor or operator a cross-location view with preset defaults they can lock. I have not invented a customer example to make this feel more concrete. The structure comes from how Sneeze It runs its own hybrid chart: Bogdan as COO, Janine in accounting, Radar as chief of staff, Tally pushing KPI values from local sources to the scorecard, Dirk running sales outreach, Crystal tracking project delivery, Arin watching the call center numbers, Nick running cold prospecting. Fourteen seats on one chart. One scorecard. The portfolio is that structure applied to fourteen locations instead of fourteen seats.

The difference for a QSR operator is not the technology. It is the discipline: one standard, locked, inherited by every location, with agents carrying the operational tracking so the humans can carry the decisions.

## See the live chart

From any MCP client with the OTP server installed, you can query the portfolio structure and member-org relationships directly, including which super-metrics are defined on an example portfolio and which member org KPIs feed them.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me how a portfolio groups member orgs and what super-metrics look like in the data model."*

What comes back is the actual structure, not a marketing description. That is the difference between reading about rollup KPIs and seeing how the relationships are wired.
