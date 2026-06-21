---
title: A franchise location running on humans and agents together looks like this
date: 2026-06-21
author: David Steel
slug: what-a-franchise-location-on-humans-and-agents-looks-like
type: founder_essay
status: published
series: franchise
series_part: 18
description: One GM, one scorecard, humans and agents on the same chart. What the hybrid franchise location actually looks like in practice, seat by seat.
---

# A franchise location running on humans and agents together looks like this

About 19.3% of franchisees control 58.8% of all franchise locations. That number has been true for a few years and is getting more true. Operators with 50 or more units grew 118% from 2010 to 2018, the fastest-growing tier in the whole system, according to FRANdata.

Those operators are not winning because they have better people. They are winning because they have figured out how to run many locations with less drag per location. That drag is the thing. Every new unit adds coordination cost. Every new unit is another place where the standard can drift, where a lead can fall through, where a slow week stays invisible for too long.

The question I keep coming back to is not "how do you run more units?" It is "what does a single unit actually look like when it is running well, in 2026?"

My answer: one GM, one scorecard, humans and agents on the same chart.

Here is the concrete picture.

## The chart starts with seats, not headcount

Every high-functioning location I have seen starts with a clear accountability chart. One seat, one owner. The failure mode at most locations is the opposite: a GM covering six roles at once because the roles are not named, and nobody knows what is supposed to happen when the GM leaves.

The hybrid chart fixes this by naming seats that a human does not have to fill. Some seats belong to humans. Some seats belong to agents. They sit on the same chart, with the same discipline. One row, one metric, one person or agent accountable.

At a fitness location, a realistic hybrid chart looks like this.

The GM is still human. She owns the floor, the member experience, the culture. That is a people job. It does not scale with AI.

The front desk coordinator is still human for the same reasons. First contact, judgment calls, physical presence.

But below that, the work fragments into discrete, repeatable functions where agents outperform humans structurally. Not because agents are smarter. Because they do not forget, do not slow down at 4pm, and do not have off weeks.

## Seat by seat

At Sneeze It, the company I run, we manage advertising for multi-location fitness and wellness brands. We built our own hybrid chart to run that work. The seats on it map directly onto what a franchise location needs.

**Radar** is our chief-of-staff agent. At a location level, this seat handles the daily briefing: what happened yesterday, what is due today, what is behind. The GM reads it when she arrives. Instead of opening four tabs and piecing together a picture, she has one output. That is twenty minutes back per day per location, compounded across a year.

**Arin** is our call center agent. At Sneeze It, Arin manages calling team performance, tracks speed-to-lead against a 30% appointment-booking target, and sends coaching feedback. For a franchise location, this seat watches inbound leads, flags ones that have not been called within the target window, and surfaces the pattern before the week ends. Speed-to-lead at a fitness location is not a nice-to-have metric. It is the closest thing there is to a booking guarantee, and it almost never has a human watching it in real time.

**Dash** is our analytics agent. It reads spend, lead volume, cost per lead, and trend data across the accounts we manage. At a location, this seat does the daily performance read: how many leads came in, what the cost per booked appointment is, and whether any of those numbers are moving in a direction that needs a call. The GM does not have to run the numbers. The seat does.

**Pulse** is our retention agent. Retention is the unit economics of fitness: the member who does not renew is the one who never got a timely check-in after week three. Pulse tracks communication cadence, surfaces silence risk, and flags the clients who have not heard from the team in too long. At a location, this seat is the difference between a 60% and a 75% retention rate over a year.

**Tally** keeps the scorecard honest. Every seat publishes numbers. Tally is the agent that reads those numbers and pushes them to the chart. Without a Tally seat, scorecards become a Tuesday ritual of copy-pasting from spreadsheets. With it, the chart is live.

**Bogdan** is our COO. Human. He owns what humans have to own: relationships, judgment under ambiguity, decisions that have organizational weight. At a location, the equivalent seat is the GM herself.

**Janine** handles accounting. Human. Cash collected, invoices, payables. At a location, this maps to whoever owns the financial close.

The chart above is not theoretical. It is the actual chart we run at Sneeze It, named for our specific work. What I am arguing is that a franchise location can build the same kind of chart, with the same discipline, with seats named for that location's work. The GM is still the GM. The agents take the operational pattern-work, so she is free for the work that actually requires her.

## Why this solves the right problem

The franchise industry's core operational failure is visibility lag. "By the time financial results show a problem, it may be too late." Operators are "always playing catch-up," per FranConnectGO. That is not a people failure. It is a structural one. The feedback loop is too slow.

A hybrid chart at the location level tightens the loop because the seats that watch the numbers are always on. Arin does not go home. Dash does not take a long weekend. The location's speed-to-lead number at 9pm on a Friday is not invisible until the Monday meeting. It is on the chart.

The next post in this series goes up a level, to what happens when the franchisor rolls every location's chart into one portfolio view. That is where benchmarking across locations becomes a live operation rather than a quarterly report. But the portfolio only works if the locations are individually organized.

You cannot roll up clean data from locations that are not producing it.

This is why the location-level hybrid chart comes first. Corporate gets the portfolio view later. The unit gets the agent team now.

## The consistency argument

Franchises run on brand consistency. The compliance failure mode is well documented: without central systems, "each unit begins operating as an independent business," with policies interpreted differently location to location. (Operandio) That drift is usually not visible until a customer flags it, or a field audit catches it.

The hybrid chart solves a piece of this structurally. When every location runs the same Radar brief, the same Arin speed-to-lead protocol, the same Pulse retention cadence, those are not policy documents sitting in a binder. They are active seats doing active work the same way every day.

The corporate standardization layer, which in OTP is the portfolio preset, sets the chart structure once and every location inherits it. That feature is available now in early access. The location-level chart is what makes the preset worth setting.

Let agents carry the operational work, so people are free for the work that matters. That is not a franchise pitch. It is the structural condition that makes multi-unit ownership survivable at scale.

## See the live chart

The Sneeze It hybrid chart, including the seats named in this post, is queryable via the OTP MCP. You can ask for the org chart and see exactly which seats are human and which are agents, and what each one is accountable for.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the org chart for sneeze-it and identify which seats are agents, what each agent is accountable for, and which seats would translate directly to a franchise location."*

What comes back is a structured view of the chart. Use it as a starting point for mapping the seats your location actually needs.

---

*Series: Franchise. Part 18. Next: how the franchisor rolls every location's chart into a portfolio with live super-metrics and location-to-location benchmarking.*
