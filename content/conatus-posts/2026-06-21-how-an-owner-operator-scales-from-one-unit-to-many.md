---
title: The owner-operator's control problem is not a unit problem. It is a visibility problem.
date: 2026-06-21
author: David Steel
slug: how-an-owner-operator-scales-from-one-unit-to-many
type: founder_essay
status: published
series: franchise
series_part: 26
description: How an owner-operator who built tight control at one location loses it at three, and what has to structurally change to get it back.
---

# The owner-operator's control problem is not a unit problem. It is a visibility problem.

When you run one location, control is almost automatic.

You walk the floor every morning. You see who is in and who called out. You know which shift is lagging because you can feel it. The number you care about most, whether that is booked appointments, speed-to-lead, or cash collected that day, exists in your head by noon because you talked to the person responsible for it.

Open a second location and that feedback loop breaks. Not slowly. It breaks the first week.

You are now physically in one place while the business is in two. You get a summary at the end of the day that summarizes what already happened. By the time you read it, the problems it describes are hours old. If it is a financial summary, the problem it describes might be weeks old. FranConnect's ops research puts it bluntly: by the time financial results show a problem, it may be too late. Operators are always playing catch-up.

This is the causal chain I want to trace in this post: why adding a unit does not just add complexity, why it specifically destroys a particular kind of control that owner-operators depend on, and what structural fix actually restores it.

## What the owner-operator's control actually is

Control at one location is not management. It is proximity.

You are close enough to the operation that you sense drift before the numbers report it. A slow Tuesday feels slow before end-of-day confirms it. A team member on a bad week shows up in their voice before it shows up in their output metrics. You are your own sensor.

When you add a unit, you hire a manager to be the sensor at the new location. That manager reports to you. You now have second-hand sensing at location two, and you are still trying to do first-hand sensing at location one. For a while, this works.

At three units, first-hand sensing collapses entirely. You cannot be at three floors at once. Every piece of information you receive is now mediated, delayed, or filtered by someone whose job it is to manage upward. The business is running on data that was accurate when it was created and is a half-step stale by the time it reaches you.

This is not a people problem. The managers are probably good. The problem is structural. You built a control system that depends on proximity, and then you added distance.

## Why the usual fixes do not work

The first thing most multi-unit operators try is adding meetings. Weekly check-ins per location. A monthly roll-up call. The instinct is sound: if proximity gave me information, structured conversation will substitute for it.

The problem is that meetings are retrospective. They surface what already happened. They are useful for accountability and they are useful for culture, but they do not give the owner-operator the live reading they had when they ran one location. Meetings are a lag indicator masquerading as a management system.

The second fix is dashboards. Build a spreadsheet that each location manager fills in. Pull the numbers into a master tab. Look at the master tab every morning.

This works until it does not. The managers are filling in the sheet at different times. Some are accurate. Some are optimistic. Some are consistently two days late. The master tab is a composite of varying data quality that you cannot distinguish from the outside. You think you are looking at the business. You are looking at a blend of the business and the managers' relationship with the spreadsheet.

The third fix is adding headcount. A regional operations director. A field support team. The point is to have human eyes in the locations so you do not have to be there yourself.

This is the most expensive fix and, at modest scale (two to five units), usually the premature one. You are paying for a layer of management whose job is to compensate for a structural gap that a better information system would close.

## What the structural fix actually is

The control you had at one location was proximity to live KPIs. The fix is not to manufacture proximity through meetings or spreadsheets or headcount. The fix is to give every location its own live scorecard, staffed by seats that own their metrics, and then to roll all of those scorecards into one view you can read from anywhere.

Each location needs an operating team that tracks real-time. At Sneeze It, we run a hybrid chart where every seat, whether human or AI agent, owns a metric and posts it on a shared scorecard. Radar, our chief-of-staff agent, runs the daily briefing and surfaces what is off. Arin, our call center manager, monitors speed-to-lead and dial volume in real time. Tally, our scorecard agent, pushes KPI values from every active data source into the org chart on a schedule so the numbers are current by the time anyone looks. Dash, our analytics agent, surfaces anomalies before they become trends. Pepper, our email agent, handles client communication triage so that nothing falls through. Crystal tracks project delivery against commitments. Pulse watches retention signals. Dirk tracks pipeline velocity. Nick handles cold prospecting.

Most of these seats do not require a human. The work they do is operational, pattern-driven, and repeatable enough that an agent can own it.

For a multi-unit operator, this matters because it means each location can have an operational team that is not dependent on headcount. Location one gets its own Radar and Arin and Tally. Location two gets its own Radar and Arin and Tally. The agent team at each location holds the standard. The humans at each location do the work that requires judgment.

What the owner-operator needs, on top of that, is the view across all of the location scorecards at once.

## What OTP's portfolio feature is

OTP's portfolio feature, available now in early access, is built precisely for this structure.

A portfolio is a parent organization that groups member organizations, in this case the individual location orgs, under one roof. Each location keeps its own full OTP chart: its own seats, its own KPIs, its own scorecard. The portfolio does not collapse the locations. It reads them.

On the portfolio level, super-metrics aggregate the KPIs from all member orgs into a single view. The owner-operator can look at one dashboard and see what is happening across every location, with each location contributing to the rolled-up numbers. When location two's speed-to-lead drops, the super-metric moves. The owner-operator sees it. Not in the next weekly check-in. Not in the monthly roll-up call. Now.

The presets feature is the consistency mechanism. A portfolio sets the standard chart, the operating scorecard, and the KPI targets once. Every member org inherits them. The portfolio can lock presets so that a location manager cannot drift the chart into something inconsistent with how corporate has defined the operation. This is the franchise consistency problem solved structurally rather than through audit and enforcement.

The franchise concentration data makes the relevance of this clear. According to FRANdata and the IFA, 19.3% of franchisees now control 58.8% of all franchise locations. Operators with 50 or more units grew at more than 118% between 2010 and 2018, the fastest-growing tier in the industry. These are not people running one location with a tight feedback loop. These are people running portfolios. Visibility is the job.

## The causal chain, closed

You built control through proximity. You added distance. Proximity-based control broke. You tried meetings, spreadsheets, and headcount as substitutes. They all have the same flaw: they are retrospective, and they filter through people whose interest in the data is not neutral.

The structural fix is to give every location a live scorecard staffed by seats that own their metrics, and then to read all of those scorecards from a portfolio level that rolls the KPIs up into super-metrics you can benchmark against each other.

The point is not to replace the managers or to create a surveillance layer. The point is to stop relying on proximity for a function that can now be handled structurally. When every location has an Arin watching speed-to-lead and a Tally pushing scorecard data on a schedule, and when the portfolio rolls those numbers into a view the owner-operator can read before breakfast, the control that existed at one location is restored at any number of locations.

The agents carry the operational sensing. The people carry the judgment calls. That split is the only version of multi-unit scale that does not require adding a human sensor for every unit you open.

Let agents carry the operational work, so people are free for the work that matters.

## See the live chart

You can query the OTP MCP right now to see how a franchise-structured portfolio can group member-org KPIs into super-metrics and what the preset inheritance looks like at the location level.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me how a portfolio groups member organizations and rolls up their KPIs into super-metrics."*

What comes back is the live structure, not a mockup. That is the architecture an owner-operator uses to hold the same read on ten locations that they had on one.

---

*Series: Franchise. Post 26 of an in-progress series.*
