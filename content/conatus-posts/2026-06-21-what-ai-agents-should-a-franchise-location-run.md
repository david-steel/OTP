---
title: Every franchise location should run its own agent team, starting with these four seats
date: 2026-06-21
author: David Steel
slug: what-ai-agents-should-a-franchise-location-run
type: founder_essay
status: published
series: franchise
series_part: 15
description: The four AI agent seats every franchise location needs, from open through mature, and why the franchisor can see all of them at once.
---

# Every franchise location should run its own agent team, starting with these four seats

The question I get from multi-unit operators is usually framed wrong.

They ask: "Should we build one central AI system for all our locations?" The implied answer is yes, because scale is efficient and centralized feels controlled.

The right answer is no. Each location should run its own agent team, on its own OTP org, with its own scorecard. The franchisor watches the whole portfolio from above. That is the structure that actually works, and I can show you exactly what it looks like.

## Why one central system fails franchises

The failure mode is familiar to every operator who has tried to run a software platform across independent franchisees. The platform is tuned for the average location. The Tulsa unit runs different hours, a different lead mix, a different call cadence. The average-tuned platform serves it poorly. Franchisees start working around it. Within a year, the system has low adoption and the corporate team blames franchisee culture instead of architecture.

Agent teams fail the same way at that scale. A centralized agent built to serve 40 locations ends up serving none of them well because the inputs, the staff, the local market, and the performance gaps differ unit by unit.

The right architecture: each location runs agents calibrated to its own numbers, its own team, its own current stage. The franchisor rolls those agent-generated KPIs up into a portfolio view. Corporate sees every location in one place. Locations keep operational autonomy. That is the split that actually holds.

## The lifecycle frame

A franchise location goes through predictable phases. The agent team it needs changes with each one.

The phases are not rigid. They overlap. But the pattern is consistent enough that I can describe the agent seats by phase and most operators will recognize where their units sit.

**Phase one: Opening.** The location is new. Staff is small, often untrained. Lead volume is incoming but chaotic. The owner is doing five jobs.

**Phase two: Establishing.** The location has found its cadence. The staff is learning. Lead volume is becoming predictable. The owner is still close to daily operations but starting to delegate.

**Phase three: Operating.** The location runs without the owner managing every hour. The KPIs are tracked. The patterns are visible. The question shifts from "are we functioning" to "are we growing."

**Phase four: Mature.** The location is a stable cash-flow machine. The owner is thinking about the next unit or the next brand. The agent team is mostly maintaining, not building.

The agent seats I am about to name map to this lifecycle. You do not add them all at once. You add them in order.

## The four seats

**Seat one: the operations coordinator. (Phase one and after.)**

At Sneeze It, this is Radar. Chief of staff. Radar holds the calendar, monitors the task queue, surfaces what needs attention before the owner discovers it the hard way.

For a franchise location, this seat exists from day one. The opening phase is chaos. There are vendor timelines, local licensing items, staff onboarding tasks, and grand opening marketing all running at the same time. An agent in this seat watches all of it, flags what is slipping, and keeps the owner operating on priority order instead of loudest-noise order.

In the OTP chart for a single location, this seat is in the first row. The metric it owns is something like "open items flagged before due date." When that number is high, the owner is ahead. When it is low, the owner is reactive.

**Seat two: the lead response manager. (Phase one, active as soon as leads arrive.)**

At Sneeze It, this is Arin on the call center side. Arin tracks speed-to-lead, dial volume, appointment rate, and booking outcomes for every active client location.

At the franchise unit level, this seat is the one that most directly protects revenue. Leads expire. The window between a lead submitting interest and that lead picking up a competitor's call is measured in minutes, not hours. An agent in this seat monitors lead intake, flags uncontacted leads, tracks contact rates, and reports booking outcomes on the scorecard every day.

For fitness, wellness, and home-service franchises, this is the seat with the highest immediate ROI. The owner does not always have a dedicated setter or a trained front-desk person in the first month. The agent holds the accountability until the human seat is staffed and dialed in.

**Seat three: the analytics reporter. (Phase two and after.)**

At Sneeze It, this is Dash. Dash reads the ad performance data, compares it to prior periods and to targets, and flags what is moving in the wrong direction before it compounds.

At the franchise level, this seat translates to "who is watching the numbers." It is not always ad data. For a service franchise, it might be job completion rate, average ticket, or customer re-booking rate. The seat is the same regardless of the vertical: it owns the measurement layer and it publishes to the scorecard on a fixed cadence.

This is also the seat that makes the franchisor's portfolio useful. When every location runs its own analytics agent publishing to its own OTP scorecard, the portfolio can roll those scorecards up into super-metrics. System-wide average unit performance. Same-store comparisons. Flagged underperformers. The franchisor is not waiting for a monthly report. The data is live, location by location.

**Seat four: the retention and expansion monitor. (Phase three and after.)**

At Sneeze It, this is Pulse. Pulse tracks client health, monitors for churn signals, and surfaces expansion opportunities at the right moment.

At the franchise level, this seat watches the existing customer base. It is not just new leads. It is re-engagement with lapsed customers, upsell timing for active ones, and early warning on the customers who are fading. In membership-based franchises, this is the difference between a 75% retention rate and an 85% retention rate, and in a fitness or wellness franchise that difference is the entire margin story.

This seat does not belong in phase one. In phase one, the location does not have enough customer history to make the patterns meaningful. It belongs in phase three, when the base is large enough that a one-point retention improvement is worth measuring.

## What the agent team looks like when all four are running

When a mature franchise location runs all four seats on OTP, the daily operating picture looks like this.

The operations coordinator publishes its daily task summary. The lead response manager posts overnight contact rates and this morning's queue. The analytics agent posts yesterday's performance against prior-period benchmarks. The retention monitor flags any customer who hit a churn signal in the last 48 hours.

The location owner walks into the morning looking at a four-row scorecard. The conversations that used to require a weekly call or a monthly report are now visible daily. The owner makes decisions with current information instead of stale information.

And the franchisor, looking at the portfolio view, sees all of those location scorecards aggregated into super-metrics. Every location's lead contact rate feeds into a system-wide average. Every location's retention rate feeds into a portfolio benchmark. The locations that are outlying in either direction are visible immediately. Not at month-end.

This is what OTP calls a portfolio, currently available in early access through Labs. Each location is a member org, with its own chart and its own KPIs. The franchisor org is the portfolio, watching all of them from above, rolling the numbers up into the super-metrics that tell the system-level story.

The agent team is not a luxury for the sophisticated unit. It is the operating layer that makes visibility possible. The franchisor's portfolio is only as useful as the data the locations publish into it. Locations with agent teams publish good data. Locations without them publish whatever the owner remembered to enter.

Let agents carry the operational work, so people are free for the work that matters.

## See the live chart

From the Sneeze It OTP org, you can query the actual seat structure of a hybrid chart, including which seats are agent-filled and how they connect to franchisor-level portfolio metrics.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the Sneeze It org chart and identify which agent seats would map to a single franchise location."*

What comes back is the actual seat list, with roles and metrics, that you can use as a template for your own location's first agent chart.

---

*Series: Franchise. Part 15. Previous post in this series: [A franchise IS a portfolio](/blog/a-franchise-is-a-portfolio)*
