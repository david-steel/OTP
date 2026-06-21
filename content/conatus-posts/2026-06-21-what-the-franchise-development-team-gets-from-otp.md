---
title: The franchise development team finally has real numbers to sell with
date: 2026-06-21
author: David Steel
slug: what-the-franchise-development-team-gets-from-otp
type: founder_essay
status: published
series: franchise
series_part: 43
description: What franchise development teams get from OTP portfolios: live system KPIs to sell with, presets to show the operating standard, and a benchmark that makes the pitch honest.
---

# The franchise development team finally has real numbers to sell with

The franchise development team has one job: convince qualified candidates that buying into the system is a good decision.

That job gets harder every year the industry concentrates. About 19.3% of franchisees now control 58.8% of all locations, according to FRANdata and the IFA. The buyers your development team is pitching are increasingly sophisticated. They are PE-backed groups, multi-unit operators building brand portfolios, area developers doing the math on 10-unit development schedules. They have seen the FDD. They have talked to existing franchisees. They want actual system performance data, not a polished sales deck.

The problem for most franchise development teams is that the actual data lives scattered across locations, each running its own reports on its own timeline. By the time the development team has assembled a meaningful picture of system health, the numbers are a quarter old and three spreadsheet tabs deep.

Here is what they get from OTP instead.

## A portfolio is the system's single source of truth

OTP's portfolio feature, available now in early access, lets a franchisor create a parent organization that groups every location's OTP org under one roof. Each location runs its own full chart: human seats, agent seats, its own KPIs, its own scorecard. The portfolio rolls those KPIs up into what OTP calls super-metrics: portfolio-level numbers fed by every member org's data and recomputed from the source.

For the franchise development team, this means the system's AUV, average show rate, average speed-to-lead, and same-store trends are not a quarterly finance exercise. They are live numbers on the portfolio scorecard. When a candidate asks "how are your locations performing right now," the development team can answer from a live chart, not from a deck built in March.

That shift changes the entire texture of the sales conversation. A number you can show from a live source is a different kind of claim than a number you present in a slide.

## The presets tell candidates what they are actually buying

The harder question in any franchise development conversation is not "how are your top locations doing." It is "how does the system make sure every location performs at that level."

OTP answers this structurally. When the franchisor sets up the portfolio, they define presets: the default chart structure, the seat definitions, the scorecard design. Every member org inherits those presets. The portfolio can lock them, which means no location can drift from the standard the corporate team has set.

For a development candidate evaluating the brand, this is concrete proof of the operating system. The preset chart is what they will inherit. The locked seats are the non-negotiables. The scorecard is what their location's performance will be measured against from day one.

This is not a promise in the FDD. It is the actual structure they would operate inside.

## What the Sneeze It chart looks like as a reference point

We have built the hybrid chart at Sneeze It, and it is the clearest picture I can give of what each location in a franchise system would actually run.

Radar sits at chief-of-staff, running the daily briefing and watching the calendar. Tally pushes KPI values from local sources to the scorecard four times a day, without anyone touching it manually. Dash runs analytics across our ad accounts and call center data. Arin manages our call center team, coaching on speed-to-lead and dial volume based on the same spreadsheet every human manager would use. Crystal tracks project delivery. Dirk runs the sales pipeline.

On the human side, Bogdan holds the COO seat. Janine holds accounting.

Every seat is on one scorecard. No separate dashboards. When a number drops, we know whose row it is, what the gap is, and who is accountable for fixing it.

Now imagine a franchise system where every location runs a version of this chart. The specific agent mix will vary. A fitness franchise might weight Arin and Dash heavily because speed-to-lead and booking rate are the central KPIs. A home services brand might weight Crystal and Radar because job completion and follow-up scheduling are what drive same-store growth. The preset defines the standard. The locations inherit it. The portfolio rolls it up.

The development team's pitch is now grounded in a real operating model, not a concept.

## What the worked example actually looks like in a conversation

Say you are on the franchise development team for a 40-location fitness brand. A multi-unit operator is evaluating a 5-location development agreement.

She asks how you make sure new locations ramp quickly.

You walk her through the preset chart. The Arin seat is pre-configured for speed-to-lead monitoring from day one. The scorecard has a 30% booking rate target locked at the portfolio level. Every new location inherits this structure on open and is benchmarked against the existing 40 before their second week of operation.

She asks which locations are performing at that level now.

You open the portfolio scorecard. The super-metric for average booking rate across all member orgs is right there. You can show her the range: the top 10% of locations, the median, the bottom 10%. Location-to-location benchmarking is built into the structure. She can see the system's floor and its ceiling.

She asks what happens when a location's number drops.

You show her that every location's chart has a named seat accountable for that number. The portfolio surfaces the underperformance before it becomes a financial problem. FranConnectGO has documented the failure mode of the old approach: by the time financial results reveal the issue, "it may be too late" and operators are "always playing catch-up." The portfolio view with live unit KPIs is the structural alternative.

This conversation could not happen at that level of specificity without live portfolio data. The development team is no longer selling a concept. They are selling a system they can show.

## What the development team is really asking for

The franchise development team does not need more marketing materials. They need credibility in the room.

Credibility comes from being able to show what you are selling. The operating standard is not a PowerPoint. The system performance is not a quarterly report. The benchmark is not a footnote in the FDD.

OTP's portfolio gives the development team a live source for all three. The super-metrics are the system's current performance. The presets are the operating standard, visible and locked. The member-org benchmarks are the range every candidate is being asked to enter.

The agents on each location's chart, Radar managing operations, Tally keeping the scorecard honest, Dash watching the numbers that matter, are the reason the numbers are live in the first place. The agents carry the operational work so people are free for the work that matters. For the franchise development team, that work is the conversation with the candidate in the room.

The portfolio is available now in early access. It is the enterprise tier. If you are building a multi-location operating system and you want the development team to stop selling on hope, that is the place to start.

---

## See the live chart

The OTP MCP can return the portfolio structure for any org with portfolio enabled, including the super-metrics and member org list.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the portfolio structure for sneeze-it and list any super-metrics configured on the portfolio."*

What comes back is the portfolio parent org, the member orgs feeding it, and the KPIs at both levels. That structure is what the franchise development team would show a candidate as the system's operating foundation.
