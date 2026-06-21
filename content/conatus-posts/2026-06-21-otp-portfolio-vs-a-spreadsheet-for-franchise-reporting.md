---
title: A spreadsheet will never tell you which location is about to miss before it misses
date: 2026-06-21
author: David Steel
slug: otp-portfolio-vs-a-spreadsheet-for-franchise-reporting
type: founder_essay
status: published
series: franchise
series_part: 45
description: Before and after: how franchise portfolio reporting changes when you replace a spreadsheet with OTP and what you can see that you could not see before.
---

# A spreadsheet will never tell you which location is about to miss before it misses

Every multi-unit operator I have talked to has the same spreadsheet story.

They built it when they had two or three locations and it worked fine. Then they hit six or eight locations and the spreadsheet started requiring a part-time person to maintain it. Then they hit ten or twelve and the spreadsheet became the thing everyone feared on Monday morning. Data was wrong. Formulas were broken by someone who edited the wrong tab. The weekly update email went out with last week's numbers because nobody noticed the import had failed.

By then they were not using the spreadsheet to manage the business. They were managing the spreadsheet.

This post is a direct before-and-after comparison. Same problem, two tools. A spreadsheet built for multi-location reporting versus OTP Portfolio, which is in early access now and designed from the ground up for exactly this.

## Before: what a spreadsheet actually does to a multi-unit operator

The spreadsheet model for franchise reporting has a specific shape. One tab per location, or one master tab that consolidates the per-location tabs, or a folder of individual files that get copy-pasted into a summary each week. There are variations but the pattern is the same.

Each location produces a number. You collect the numbers. You put the numbers in the sheet. You look at the sheet. Then you wait until next week and do it again.

This is a reporting system, not an operating system.

The delay built into that cycle is the thing that kills you. FranConnectGO named it directly: by the time financial results show a problem, it may be too late. Operators are always playing catch-up. That phrase landed on me the first time I read it because it describes exactly what spreadsheet-based reporting produces. Catch-up. You are always responding to what already happened, never positioned in front of what is about to happen.

And the problem compounds as you scale. The 19.3% of franchisees who control 58.8% of all franchised locations are not running twelve locations from a spreadsheet and winning. They are running twelve locations with systems that give them the same visibility into unit twelve that they have into unit one. Operators with 50 or more units grew 118% from 2010 to 2018, the fastest-growing tier in franchising. That growth rate is not a spreadsheet story.

The spreadsheet also has no native concept of benchmarking. You can build pivot tables. You can write conditional formatting to flag red cells. But the spreadsheet does not know that location four is underperforming relative to its own 90-day trend AND relative to the system median. You have to build that logic yourself, and then someone has to maintain it, and then it breaks.

The last thing the spreadsheet cannot do: it cannot carry any sense of who is accountable for what. A cell in a spreadsheet has a value. It does not have a seat. The number for location seven's appointment rate is a number. The spreadsheet does not know whether there is a person responsible for that number, whether there is an agent responsible for that number, or whether the number has a target attached to it with an owner who gets flagged when it drops.

This is the before.

## After: what OTP Portfolio actually gives you

OTP Portfolio, available now in early access, starts from a different premise. The premise is that a franchise is a portfolio. Not a metaphor. A structural reality. One parent organization. Multiple member organizations. Each member organization is a full OTP org with its own org chart, its own scorecard, its own humans and agents on the same accountability surface.

The portfolio rolls each member's KPIs into shared super-metrics: system-wide numbers that aggregate across every location. Average unit volume, appointment rate, speed-to-lead, whatever the system tracks. Those super-metrics live on the portfolio's scorecard. When location seven's appointment rate drops, the portfolio's system-wide appointment rate reflects it. The number does not wait for someone to copy it into a master tab.

This is the first thing that actually changes in the after state. The latency goes away. You are not looking at what happened last week. You are looking at what is happening now.

The second thing that changes is benchmarking. When every location is a member org feeding the same portfolio, location-to-location comparison is structural, not manual. You can see that location three is running 34% appointment rate and location seven is running 19%. You can see that location seven was at 26% four weeks ago. The trend is visible. The gap is visible. The conversation about what to do about it can start before the month closes and the damage is locked in.

The third change is accountability. This is the one that matters most to me as someone who runs a hybrid org.

At Sneeze It, our chart has seats for Bogdan as COO, Janine in accounting, Radar as our chief-of-staff agent, Tally as the KPI tracking agent who pushes scorecard numbers, Dash as our analytics agent, Arin managing call center speed-to-lead, Dirk driving sales, Pulse watching retention, Pepper handling email triage, Crystal running project management, Nick prospecting. Every seat has a metric. Every metric has a target. Every Monday the dashboard surfaces who is above target and who is below.

For a franchise, this model plays out at two levels. Each location runs its own version of this chart: a human GM or manager, an Arin-equivalent watching speed-to-lead and appointment rate, a Dash-equivalent reading the ad data for that location, a Radar-equivalent handling daily ops. Each seat has a metric. Each metric has an owner. The location's chart is its own accountability surface.

Then the portfolio rolls it up. The franchisor sees all of it. Not as a spreadsheet summary. As a live view of every location's scorecard feeding into the super-metrics that represent the system's health.

The fourth change is presets. This is the consistency play that franchising specifically requires. The portfolio sets the standard chart: which seats exist, which metrics those seats track, what the targets are. Every member org inherits those defaults. The portfolio can lock them. That lock is how corporate sets the operating standard once and enforces it across every location without email threads and compliance audits. A location does not drift from the standard because the standard is structurally embedded in what the location sees when it opens its chart.

A spreadsheet cannot do this. A spreadsheet can contain a template. But the template is advisory. There is nothing that prevents location seven from deleting the column the franchisor wants it to track. The lock does not exist in a spreadsheet. It exists in OTP.

## The real difference

The spreadsheet produces a report. The portfolio produces an operating layer.

The report tells you what happened. The operating layer tells you where accountability sits, what the trend is, and which location needs a conversation before the month closes.

I am not arguing that spreadsheets are bad tools. I am arguing that a spreadsheet is the wrong tool for this specific problem, and that the multi-unit operators who scale past ten or fifteen locations consistently replace the spreadsheet with something that has seats, owners, and live data. OTP Portfolio is built to be that thing. The mission behind it is simple: let agents carry the operational work at each location, so the people running the system are free for the work that actually matters, which is spotting the underperformer early and fixing it before the damage shows up in the financials.

That is the work the spreadsheet will never let you do because the spreadsheet is always already behind.

## See the live chart

The OTP MCP exposes the Sneeze It chart, including the seat structure that maps directly to what a per-location franchise org would look like, and the portfolio super-metric model for rolling up KPIs across member orgs.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me how a portfolio org groups member orgs and what super-metrics roll up across them."*

What comes back is the actual data model, not a description of it. If you are running more than five locations today and still doing your Monday reporting from a spreadsheet, that response is the clearest before-and-after you will find.
