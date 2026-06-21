---
title: How a med spa or wellness franchise runs every location on one scorecard without losing the local operator
date: 2026-06-21
author: David Steel
slug: how-a-med-spa-or-wellness-franchise-uses-otp
type: founder_essay
status: published
series: franchise
series_part: 35
description: A worked example of OTP portfolio for med spa and wellness franchises, where each location runs its own hybrid chart and the franchisor rolls KPIs up system-wide.
---

# How a med spa or wellness franchise runs every location on one scorecard without losing the local operator

The med spa and wellness franchise vertical has a problem that gets harder as it gets bigger.

Each location runs on calls, bookings, and speed to lead. The margin on a membership consultation is high, but only if the call gets answered and the follow-up fires inside five minutes. A franchisor with fifteen locations cannot personally audit fifteen speed-to-lead logs every morning. By the time the numbers surface, the slow location has already lost a week of revenue. FranConnectGO calls it the defining failure mode of multi-unit management: operators are "always playing catch-up."

The concentration data makes this worse, not better. About 19.3% of franchisees control 58.8% of all franchised locations (FRANdata and IFA, 2026). The operators who run the most locations are also the ones who need system-level visibility the most, and the ones most likely to be drowning in manual aggregation instead.

OTP's portfolio feature, available now in early access, is built for exactly this shape of organization.

## What OTP looks like inside a single med spa location

Before the portfolio makes sense, you need the picture inside one location.

Each location is its own OTP org. That org holds a hybrid chart: the humans who run the location (front desk, injector, manager, operations lead) share the scorecard with the AI agents doing the operational work. One seat, one owner, whether that owner is a person or an agent. The seat owns its metrics. The scorecard shows them together.

For a wellness or med spa franchise, the agent seats that matter most cluster around speed-to-lead and booking. Arin, our call center manager agent, runs dials-to-contact rate, speed-to-lead, and appointment conversion daily, flagging when a location's booking rate drops below benchmark before the morning briefing. Radar, our chief-of-staff agent, compiles the full operational picture each morning. Dash watches ad spend against lead volume and flags CPL movement. Pulse tracks retention signals so the operator knows which members are going quiet before they cancel.

The location's general manager does not pull twelve reports. The agents carry that work. The manager shows up to the weekly accountability conversation knowing which numbers moved and why. The mission is the same one I run Sneeze It on: let agents carry the operational work, so people are free for the work that matters.

## Where the portfolio comes in

One location running a hybrid chart is a better-run location. But the franchise case is fifteen locations, or fifty.

The OTP portfolio feature groups member orgs under one parent. Each location is a member org. The portfolio does not replace the location's chart. It sits above it, aggregating each location's KPIs into super-metrics the franchisor sees across the whole system: system-wide average unit volume, portfolio-level booking rate, same-store performance trend, average speed-to-lead. When a location's number moves, the super-metric moves. One view tells the story.

The portfolio also shows location-to-location performance side by side. When one location's booking conversion sits at 28% and another's is at 41%, both numbers appear in the same view against the same benchmark. The underperformer is visible before it becomes a quarterly loss.

## Presets are where the franchise model actually gets enforced

The hardest part of running a service franchise is not aggregating the numbers. It is making sure every location is running the same playbook.

A franchisor who sets a brand standard once and then watches it interpreted differently by fifteen operators is losing brand equity with every week that passes. Operandio describes it clearly: without central systems, each unit begins to operate as an independent business.

OTP's presets are the structural answer. The portfolio sets default configurations that every member org inherits, and the franchisor can lock them. The KPI structure, the accountability chart format, the operating standard of the scorecard: set once at the portfolio level, pushed down to every location. A location owner can build their own hybrid chart with their own agents and team. What they cannot do is drift from the performance framework the brand runs on.

## The worked example: a new location joins the portfolio

A new med spa franchise location opens. The franchisor sends an invitation to the franchisee's OTP org. The franchisee accepts. The location inherits the preset chart structure corporate defined: the standard scorecard KPIs (booking rate, speed-to-lead, member retention, new consultations booked), the seat structure, the accountability format.

The franchisee builds their local team on top of that foundation. Their general manager gets a seat. Their front desk coordinator gets a seat. They configure the agent layer: Arin runs call center performance daily, Dash watches ad metrics, Radar compiles the morning operational picture, Pepper handles follow-up email sequences. Tally, our KPI-pushing agent, handles publishing each seat's numbers to the scorecard so the data is always current without anyone pulling it manually.

Within two weeks, the location is publishing live data to the portfolio. Corporate sees the new location's booking rate, speed-to-lead, and member retention alongside every other location in the system. If speed-to-lead starts slipping at week three, Arin flags it at the location level, Radar surfaces it in the morning briefing, and the portfolio super-metric shows the trend before it costs a month of revenue.

The franchisee did not have to build a reporting system. The agents run the operational work and publish the results. The scorecard is where that work becomes visible.

## What changes when you go from five locations to fifty

The practices that worked at five locations stop working somewhere between fifteen and thirty. Operators with 50-plus units grew 118.52% between 2010 and 2018, the fastest tier in franchising (FRANdata). They did not get there by adding corporate headcount proportionally.

The super-metrics do not get harder to read as the network grows. The presets do not require renegotiation with each new location. What does change at fifty is how much the per-location agent layer matters. When each location runs its own Radar and Arin, those agents are doing the daily operational check-in that corporate cannot do personally at that scale. The GM gets a morning briefing. The human manager focuses on the conversations that require judgment, not on pulling yesterday's numbers.

The portfolio is not a reporting tool added on top of a manual system. It is the architecture that makes a fifty-location brand behave like an organization.

One thing to be clear about: Sneeze It works with multi-location fitness and wellness brands as advertising clients. The hybrid chart above is the Sneeze It chart, running in production. The franchise application is the logical extension. No named franchise brand is running the OTP portfolio right now that I can point to as a live case study. What I can point to is the architecture, and the fact that it exists in early access for the organizations who want to run it.

## See the live chart

You can query the OTP MCP directly to see what a portfolio super-metric looks like and how member org KPIs feed up to it.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the portfolio structure for sneeze-it and list any super-metrics or rolled-up KPIs visible from the portfolio level."*

What comes back is the actual data model, not a mockup, so you can see exactly how per-location KPIs aggregate before you build it for your own franchise.

---

*Series: Franchise. Post 35 of an in-progress series. Questions about the portfolio feature or the med spa application: dsteel@orgtp.com.*
