---
title: Before you had a portfolio view, show rate and booking rate were a guessing game
date: 2026-06-21
author: David Steel
slug: how-to-see-show-rate-and-booking-rate-by-location
type: founder_essay
status: published
series: franchise
series_part: 29
description: How OTP's portfolio feature turns show rate and booking rate from per-location guesswork into a cross-location super-metric you can act on.
---

# Before you had a portfolio view, show rate and booking rate were a guessing game

Show rate tells you whether the appointment actually happened. Booking rate tells you whether the lead got that far. Together they are the two most important numbers in a franchise call center operation, and for most multi-unit operators, they exist in exactly the wrong place: inside each location, invisible to everyone above it.

That is the before state. The after state is what OTP's portfolio feature, available now in early access, actually makes possible.

## Before: data trapped in the unit

Most multi-unit operators I work with have some version of the same setup. Each location has a manager who tracks show rate and booking rate locally. Maybe it lives in a spreadsheet. Maybe it lives in their CRM. Maybe it exists only as a number someone reports in the weekly Slack message.

Corporate has no direct view. When they want to know how Friday looked across the system, they wait. They ask. They compile. By the time the answer lands, three days have passed and "Friday" is already irrelevant.

This is what FranConnectGO calls being "always playing catch-up." The numbers exist, technically. They just exist in the wrong place, at the wrong time, for the wrong audience.

The problem is not that location managers are hiding the data. The problem is structural. There is no system that rolls the unit-level truth up to a portfolio view and makes it queryable in one place.

So corporate makes decisions based on incomplete signals. They assume the underperforming location has a training problem when it might be a speed-to-lead problem. They assume the top-performing location has a good manager when it might have a market advantage that should be factored out. They cannot tell because they cannot compare.

## Why show rate and booking rate are the right metrics to fix first

These two numbers sit at the hinge between marketing spend and revenue.

Booking rate tells you what percentage of inbound leads actually became booked appointments. If that number is weak, you are paying for leads that evaporate at the phone. No amount of additional ad spend repairs a broken booking rate.

Show rate tells you what percentage of booked appointments resulted in someone walking through the door. A high booking rate combined with a low show rate means the appointment-setting operation is working and the confirmation or nurture sequence is failing. That is a solvable problem once you can see it.

For the fitness and wellness verticals I work in most, these numbers are the difference between a location that looks like it is growing (leads up, spend up) and a location that is actually converting. The unit economics only make sense once booking rate and show rate are in the same view.

19.3% of franchisees control 58.8% of all franchise locations, per FRANdata and IFA 2026 data. Those operators, the ones running twenty or fifty or two hundred units, cannot manage booking rate by asking each location for its number every week. They need a system that aggregates it and makes location-to-location comparison automatic.

## After: a super-metric at the portfolio level

This is where OTP's portfolio feature changes the picture.

In OTP, each franchise location runs as its own member org. Each location has its own hybrid chart, with human seats and AI agent seats on the same scorecard. The franchisor creates a portfolio org that groups all of those member orgs under one roof.

The portfolio can then define what OTP calls super-metrics: KPIs at the portfolio level that aggregate the corresponding KPIs from each member org. You define booking rate and show rate once, at the portfolio level. Every location that tracks those numbers feeds them up into the portfolio view. You see the system-wide number and the per-location breakdown from a single screen.

That is the structural fix for the visibility lag problem.

At Sneeze It, we run this for our own operation. Arin, our AI call center manager, tracks speed-to-lead, dial volume, booking rate, and appointment show rate across our accounts. Tally, our scorecard agent, pushes those KPI values into OTP on a schedule throughout the day. The humans who own those numbers, including our call center team leads, have their own rows on the same chart. The scorecard at any given moment reflects what is actually happening, not what someone reported in a meeting last Tuesday.

For a franchisor building on top of OTP's portfolio feature, the structure is the same. Arin at location 7 tracks that location's booking rate. Tally at location 7 pushes it to that location's scorecard. The portfolio rolls those values up. Corporate sees the system aggregate and, next to it, every location's individual contribution. The underperformer is visible. The outlier is visible.

That comparison is what location-to-location benchmarking actually requires. It is not enough to know your system average. You need to know which location is dragging it down and which location is raising it.

## What the agent team at each location makes possible

The after state is not just a reporting improvement. It changes what the franchisor's operations team can actually do.

When Arin flags a speed-to-lead gap at one location, it does not need to be a human conversation that gets escalated and scheduled and eventually arrives at corporate. It can be a structured alert that the portfolio sees in real time. Dash, the analytics agent, can pattern-match across locations to identify whether the gap is systemic (the same weekday drops for every location) or isolated (one location on one shift).

Pulse, our retention agent, watches for the performance signals that precede churn. At the franchisor level, a Pulse equivalent can watch for the show rate signals that precede a franchisee relationship going sideways. The metric drops two weeks before the conversation gets hard. The portfolio view shows you the drop.

Pepper handles outreach. At a location level, Pepper drafts the confirmation messages and follow-up sequences that move a booked appointment toward a show. At the portfolio level, the franchisor can see whether those sequences are consistent across locations or whether location 14 is running a different process from location 3. The presets feature in OTP makes this concrete: corporate defines the standard process once, and every member org inherits it. Corporate can lock the preset. That is the franchise consistency problem addressed at the system level.

This is what agents make possible at scale. Let agents carry the operational work at each location, so the people running the portfolio are free for the work that matters: finding the outliers, setting the standard, and making decisions with real data.

## What early access means in practice

The portfolio feature is available now in early access through OTP's Labs toggle. It is the enterprise tier, meaning it is built for operators who need a cross-org view, not a single-org scorecard.

Getting to the after state takes a few deliberate steps. Each location needs its own OTP org with the right seats and the right KPIs defined. Booking rate and show rate need to be live numbers on each location's scorecard, not monthly reports. The agents doing the operational work need to be pushing those numbers into OTP on a consistent cadence.

Once that foundation is in place, the portfolio rollup is a structural step, not a technical project. You invite the member orgs, define the super-metrics, and the cross-location view assembles itself from data that was already being tracked. The lag does not go away. It becomes a design problem you have already solved.

The before state is a series of location-level spreadsheets and weekly check-in calls. The after state is a portfolio where booking rate and show rate are queryable across every location, every day, without asking anyone for the number.

That is the visibility the multi-unit operator has always needed. It just required building the right structure first.

## See the live chart

OTP's portfolio super-metrics, including how booking rate and show rate aggregate across member orgs, are queryable directly from the MCP. You can ask any AI assistant with OTP MCP access to pull the current super-metric structure from a portfolio and describe how member-org KPIs feed it.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me how KPIs from member orgs in a portfolio roll up into super-metrics, and give me an example using booking rate."*

The response describes the actual rollup structure, not a mock. That is the architecture underneath the portfolio view, and it is the same architecture a multi-location operator builds on when they put show rate and booking rate into a system that actually competes with the visibility lag.
