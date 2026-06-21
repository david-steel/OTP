---
title: The new unit ramp problem is a visibility problem, and the fix is structural
date: 2026-06-21
author: David Steel
slug: how-to-ramp-a-new-unit-faster
type: founder_essay
status: published
series: franchise
series_part: 21
description: Why new franchise units underperform in the first 90 days, and how a per-unit org chart with an AI agent team fixes the ramp gap at the root.
---

# The new unit ramp problem is a visibility problem, and the fix is structural

Every multi-unit operator knows the ramp problem. A new location opens. The first 60 to 90 days are a blur of staffing decisions, SOP interpretation errors, leads that don't get called back fast enough, and a support team at corporate that is stretched thin across the whole portfolio. By the time the unit's numbers start coming in, you're already weeks behind on the interventions that would have mattered.

The instinct is to throw more people at it. Add a field support rep. More site visits. A dedicated ramp coach. These things help at the margin, but they do not fix the root problem.

The root problem is visibility lag. Corporate cannot see what is happening inside the unit in real time. And the unit's local team, especially in the early weeks, does not yet know what to surface or when.

There is a structural fix. It requires thinking about the new unit not as a location to be managed but as an organization to be staffed.

## Before: how most new units actually ramp

Here is what a typical new-unit ramp looks like before you introduce any structural change.

The unit opens with a location manager who was trained centrally on the brand's SOPs. They have a human team that is also new, also learning. The unit's first leads start coming in. Calls happen, or don't. Booking rates are inconsistent because nobody on the local team is watching speed-to-lead closely yet. The manager is dealing with twelve things simultaneously and does not know which number to focus on first.

Corporate gets a report at the end of week two. Maybe week four. The report is a snapshot of lagging indicators: revenue, membership count, bookings. By the time the report arrives, the root causes of the underperformance are two weeks old. FranConnectGO put it plainly: by the time financial results show a problem, it may be too late. Operators are always playing catch-up.

The feedback loop is too slow. The visibility is too thin. And the standard playbook response is to assign a human to fill the gap, which means that same human is now split across every new unit opening in the same quarter.

This is the before.

## After: a new unit with its own operating team on day one

Now here is what a new unit ramp looks like when the unit is treated as its own organization with its own hybrid team of humans and AI agents.

On day one, the unit's OTP org is live. It has a chart. The chart has seats. Each seat has one owner, one accountability, and one set of KPIs it is responsible for reporting.

Some seats are humans. The location manager. The front desk. The setter.

Some seats are agents. An Arin-style call center agent watching speed-to-lead and dial volume in real time. A Dash-style analytics agent tracking lead volume, booking rate, and show rate daily against the brand's target. A Radar-style chief-of-staff agent compiling what happened today, what's behind, and what needs attention before the manager starts tomorrow morning.

The manager does not need to know what to look at first. The agent team tells them. Arin flags when a lead sat untouched for more than fifteen minutes. Dash flags when the booking rate drops below the brand's benchmark. Radar compiles both into a morning brief the manager reads before the first call of the day.

This is the same structure we run at Sneeze It. Bogdan, our COO, has a seat. Janine, who handles accounting, has a seat. And Radar, Dash, Arin, Dirk, and Pulse all have seats alongside them, each accountable for a specific slice of the business, all on one unified scorecard. The agents carry the operational observation work. The humans carry the decisions.

The difference at the unit level is that the agent team can be stood up instantly, on day one, without hiring. A new unit can have a functioning operational intelligence layer before the local human team has completed their first week.

## The portfolio layer: what corporate sees

The per-unit org chart is the foundation. The portfolio is what makes it scale.

OTP's portfolio feature (available now in early access) lets a franchisor create a parent organization that groups every location's org under one roof. Each location keeps its own full chart, its own seats, its own KPIs. The portfolio rolls those KPIs up into super-metrics at the corporate level.

For a new unit, this matters immediately. Corporate can see that Unit 7 in Charlotte has a booking rate of 18% in week one while the portfolio average is 31%. That gap is visible the day it happens, not when the month-end report lands.

Presets are the other lever. The portfolio sets the standard chart once. What seats exist, what metrics each seat tracks, what targets it holds. Every new unit inherits that standard when its org is created. And corporate can lock the preset, so no individual location drifts from the brand's operating model, even when local managers make well-intentioned customizations that undermine consistency.

Franchising has concentrated for a reason. The operators with 50 or more units grew 118.52% from 2010 to 2018, the fastest-growing tier in franchising, according to FRANdata. These operators have figured out that the unit is not the business. The portfolio is the business. You need to be able to see all of it, in real time, from one place.

The portfolio feature makes that possible without requiring a custom data infrastructure build for each franchise system.

## The ramp problem, restated

Speed-to-lead is the first thing that breaks in a new unit. Local staff is learning the brand, learning the software, learning which leads are warm and which are noise. The result is that the unit's most valuable window, the first hour after a lead comes in, gets handled inconsistently.

A unit-level Arin agent does not have a learning curve on that. It watches every lead as it comes in, logs the time, flags the ones that cross a threshold, and surfaces the flag to whoever is accountable for making the call. The local team still makes the call. The agent makes sure the call gets made.

This is the mission Arin holds at Sneeze It for our clients' call center performance: watch the numbers no one has time to watch, surface the gap before it becomes a week of lost revenue, let the humans do the work that requires judgment.

A new unit with that operational layer in place from day one ramps faster not because the humans work harder but because the humans work with better information. They know which metrics are behind. They know by how much. They know before the problem compounds.

The portfolio layer means corporate knows it too, in the same morning briefing that the unit manager reads.

## What this requires

You need to think about every unit as an organization, not a location. That shift in framing is the precondition. Once you frame it that way, the question becomes: what seats does this organization need, and which of those seats can be filled by an agent on day one?

The answer for most franchise units is more than you'd expect. Operational observation, KPI tracking, morning briefings, speed-to-lead monitoring, and performance flagging are all agent-appropriate work. These are seats that can be live before the grand opening, and they are seats that free up the local human team to focus on the work that actually requires a person in the room.

The mission throughout is the same one we hold at Sneeze It: let agents carry the operational work, so people are free for the work that matters.

That is how you ramp a new unit faster. Not by adding a human field rep to the support rotation. By making sure the unit has its own operating team, including the agents, on day one.

## See the live chart

From an OTP portfolio with the enterprise tier enabled, you can query which member orgs (locations) are below target on a given super-metric, and see how each location's KPIs roll up into the portfolio view.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the seats on the sneeze-it org chart that handle operational monitoring and performance tracking."*

You will see exactly which seats carry that work, what they are accountable for, and how they sit relative to the human seats. That is the per-unit operating model, queryable.
