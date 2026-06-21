---
title: The system-wide leadership meeting does not fail because of logistics. It fails because nobody has the same numbers.
date: 2026-06-21
author: David Steel
slug: how-to-run-a-system-wide-leadership-meeting-across-locations
type: founder_essay
status: published
series: franchise
series_part: 31
description: Why cross-location leadership meetings fall apart, and how a shared portfolio scorecard fixes the problem at its source.
---

# The system-wide leadership meeting does not fail because of logistics. It fails because nobody has the same numbers.

The first time you try to run a leadership meeting across multiple locations, you discover the real problem immediately.

You pull everyone together. The corporate team. The location managers. Maybe a regional director. You have an agenda. You have goals you want to cover. And then someone shares a number and someone else says they have a different number, and ten minutes in you are no longer running a leadership meeting. You are running a data reconciliation session.

Every location tracked something slightly differently. One location counted leads from the CRM. Another counted from the call log. A third counted from what the front desk wrote down. The corporate number is an average of all three methods, which means it is an average of three different definitions. By the time you align on what the numbers actually mean, the meeting has consumed itself.

This is the visibility-lag failure that multi-unit operators have been describing for years. By the time financial results reveal a problem, as FranConnectGO puts it, "it may be too late." Operators are "always playing catch-up." The cross-location leadership meeting is supposed to be the mechanism that prevents this. But if every location is running its own tracking method, the meeting cannot be that mechanism. It can only surface the disagreement between methods.

The fix is not a better agenda. The fix is a shared scorecard that all locations are running before anyone sits down to meet.

## The lifecycle of the cross-location meeting problem

This problem follows a predictable arc. I have watched it at Sneeze It with our client work across multi-location fitness and wellness brands, and I have watched it repeat across the operators we talk to.

**Phase one: manual aggregation.** Early on, the system-wide meeting works because there are few enough locations that a person can manually pull numbers from each one the night before. The ops director texts the location managers. The location managers text back. The ops director builds the spreadsheet. The meeting has numbers. The numbers are close enough. Nobody notices the methodology gaps because the volume is low enough that gut-checks still calibrate.

**Phase two: the spreadsheet breaks.** Around ten to fifteen locations, the manual pull stops working. Not because it is impossible, but because it is slow. By the time the spreadsheet is built, it is Tuesday and the numbers are from Friday. The meeting is running on four-day-old data. Location managers start skipping the data request because they know the ops director will follow up eventually. The spreadsheet arrives incomplete. The meeting gets pushed or shortened because nobody has time to build a real picture before it starts.

**Phase three: the meeting becomes theater.** By the time an operator is running twenty-plus locations without a unified system, the cross-location leadership meeting has often become something nobody says out loud: theater. Corporate talks. Locations listen. Numbers are shared that everyone knows are directional at best. The conversation about what to do about Location 7 happens without any real visibility into what is actually happening at Location 7. Decisions get made. Actions get assigned. And by the next meeting, nobody remembers what was decided because there was no system tracking the accountability.

This arc is not unusual. The operators with 50 or more units who grew 118% between 2010 and 2018 (FRANdata) did not grow past this problem by ignoring it. They built systems that made it structurally impossible. The question is what those systems look like when you want to run a real leadership meeting, not just a call with pretty charts.

## What the meeting actually needs to work

A system-wide leadership meeting that produces real decisions and real accountability needs three things before anyone opens their mouth.

First, every location needs to be tracking the same metrics with the same definitions. Speed-to-lead is speed-to-lead at every location, measured from the same moment. Booked appointments are booked appointments, counted the same way. Same-store sales are calculated on the same cohort definition. If Location 3 and Location 11 are tracking different things and calling them the same name, no comparison is valid and no decision is defensible.

Second, the corporate team needs to see every location's numbers in one view before the meeting, not assembled during it. The conversation in the room should be about what the numbers mean and what to do next, not about whether the numbers are right.

Third, accountability from the previous meeting needs to be visible in the same view. If the action from last month's meeting was "Location 7 gets to a 30% booking rate by the 15th," the leadership meeting should open with Location 7's current booking rate on the same screen as every other location's booking rate. Not in a separate report. Not in a follow-up email. In the room, in the view, alongside the metric that drove the decision.

None of this is philosophically complicated. What makes it hard is that most cross-location systems are built to report up, not to align across. The corporate system gets a number. Each location produces the number for the corporate system. Nobody has a view that shows all the numbers side by side, tracked the same way, updated together.

## How OTP's portfolio structure changes the meeting format

At Sneeze It, we run one hybrid org chart. Radar is our chief-of-staff agent. Tally tracks and pushes our KPIs to the scorecard. Dash covers analytics across accounts. Arin manages call center speed-to-lead and booking rates. Pulse monitors client retention. Crystal tracks project delivery. Dirk manages the sales pipeline. Pepper handles email triage. Nick runs prospecting. Bogdan, our COO, and Janine, our accounting lead, have their seats on the same chart alongside every agent.

One meeting. One dashboard. Every seat visible. When a row drops below target, the conversation in the room has a single shared reference point for why.

For a franchise running OTP's portfolio feature (available now in early access), this same structure extends across locations. Each location is its own OTP org with its own hybrid chart: the local Arin-equivalent tracking speed-to-lead at that location, the local Dash-equivalent monitoring ad performance, human seats for the manager and front desk.

The franchisor runs a portfolio that groups those location orgs under one view. Super-metrics on the portfolio roll up the KPIs from every member org. Booked appointments per week becomes a system-wide super-metric fed by each location's booking-rate KPI. Speed-to-lead becomes a portfolio number that surfaces which locations are consistently below threshold.

Presets let corporate define the standard chart once: which seats exist, which KPIs those seats track, what the definitions are. Locations inherit the preset. Corporate can lock it. Every location is now tracking the same things, the same way, without anyone manually coordinating it.

What this produces is a meeting that can actually run.

The corporate leadership team opens the portfolio view. Every location's numbers are current, because each location's agents are publishing to their own scorecard and the portfolio is aggregating them. The discussion starts with which locations are above target and which are below. Location 7's booking rate is visible in the same row as Location 3's and Location 11's. The comparison is legitimate because every row was produced by the same process.

When an action gets assigned, it lands on the seat that owns the number at that location. The next meeting opens with that seat's number visible. The accountability loop is structural, not conversational.

## What this changes for the operator running the meeting

The system-wide leadership meeting is supposed to be where the franchisor catches problems before they compound and scales what is working faster than any individual location could on its own. That is the job. Most multi-unit operators want it to do that job. It mostly does not, because the infrastructure for it does not exist.

The meeting becomes a real operating mechanism when every location's numbers come from the same system, the portfolio view is live before the room convenes, and accountability is tracked in the same place where the work happens.

The goal is not a better meeting cadence. The goal is that the meeting cadence becomes the moment the whole system surfaces problems and coordinates action, rather than the moment everyone discovers they have been measuring different things.

That is what agents are for, too. Let Tally push the numbers. Let Arin track the speed-to-lead at every location. Let the portfolio roll it up. The meeting exists for the decisions humans are best at: reading the patterns, calling the play, holding the accountability. Let agents carry the operational work so people are free for the work that matters.

## See the live chart

You can query an OTP portfolio structure through the MCP server, including how super-metrics aggregate from member orgs.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the org chart for sneeze-it and explain how a portfolio would roll up location KPIs into a system-wide super-metric."*

You get back the actual chart structure plus a concrete picture of how the portfolio layer works, which is the fastest way to see whether the meeting format described here would apply to your locations.

---

*Series: Franchise. Post 31 of an in-progress series. Questions about running cross-location meetings with OTP: write to dsteel@orgtp.com.*
