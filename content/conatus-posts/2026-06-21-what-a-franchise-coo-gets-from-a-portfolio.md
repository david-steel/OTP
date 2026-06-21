---
title: What a franchise COO actually gets from a portfolio view
date: 2026-06-21
author: David Steel
slug: what-a-franchise-coo-gets-from-a-portfolio
type: founder_essay
status: published
series: franchise
series_part: 42
description: A franchise COO is flying blind without location-level KPIs. A portfolio rolls every unit into one chart, surfaces the underperformer, and locks the standard.
---

# What a franchise COO actually gets from a portfolio view

The typical franchise COO does not have a visibility problem. They have a timing problem.

The numbers exist. The financials come in. The unit reports land. The COO reads them, flags the lagging locations, gets on calls, and tries to intervene. The problem is not that the information is unavailable. The problem is that by the time the information surfaces, the underperforming unit has already been underperforming for weeks, sometimes months. FranConnectGO's research puts it plainly: by the time financial results show a problem, it may be too late. Ops directors are, in their own words, "always playing catch-up."

That lag is the real cost of franchise scale.

Franchising in the US runs across roughly 851,000 establishments, employing more than 9 million people, generating output north of $936 billion. The industry grows faster than the US economy. And within it, the concentration tells you everything about who the real buyer of multi-location tooling is: 19.3% of franchisees control 58.8% of all franchised locations. Operators with 50 or more units grew 118% from 2010 to 2018, the fastest-growing tier in the whole system. PE roll-ups have accelerated this further. Blackstone holds Jersey Mike's. Bain launched a platform specifically to buy franchisee businesses. The franchise COO, whether corporate or operator-side, is increasingly managing a portfolio with dozens to hundreds of units.

There is no version of that job that works on monthly reports delivered by spreadsheet.

## Why the visibility gap gets worse as you grow

A single-unit franchisee has a visibility problem that is inconvenient. The COO running 30 locations has a visibility problem that is structural.

At 30 locations, no single number tells you how the system is performing. AUV (average unit volume) tells you the average. Same-store sales tell you the trend. Neither tells you which unit is dragging the average down, which unit is the quiet outlier running 40% above peers, or which unit was fine last week and is now in early distress. To get that picture, you have to pull individual location data, normalize it, compare it, and then decide where to direct your attention.

By the time that analysis is done, the week is over and a new one has started.

What a portfolio view gives a COO is the ability to skip that step. Not because the analysis no longer matters, but because the analysis happens in the system continuously, so when the COO sits down they are looking at live unit KPIs already benchmarked against each other, already surfacing the outliers, already showing the trend. The COO's job moves from analysis to decision.

## What the OTP portfolio actually is

OTP (orgtp.com) has a portfolio feature available now in early access. The feature is in Labs, meaning it is live and being used, but not yet the default experience for everyone.

Here is what it actually does.

A portfolio is a parent organization that groups several member orgs under one roof. Each member org is a full OTP org: its own hybrid chart of humans and AI agents, each on one scorecard, with one-seat-one-owner accountability. For a franchise system, each location is a member org. The franchisor (or the operator holding multiple units) is the portfolio.

Super-metrics live at the portfolio level. A super-metric is a KPI on the portfolio that aggregates the corresponding KPIs from every member org into one portfolio-level number. The system-wide speed-to-lead rate. The portfolio appointment rate. The blended AUV across all locations. These are not reports generated on request. They are live KPIs on a chart, updated as member org data updates.

Location-to-location benchmarking becomes structural rather than manual. When every location's appointment rate is a live number on a member org, the portfolio chart can show which unit is at 38%, which is at 22%, and which has been declining for three weeks. The COO does not need to request that comparison. It is already there.

The presets feature is where the consistency problem gets addressed. A portfolio sets preset defaults that member orgs inherit. And the portfolio can lock them. For a franchise system, this is the operating standard made structural: corporate defines the chart configuration, the seat definitions, the scorecard structure, the KPI targets. Every location inherits that standard on the way in. Corporate can lock the elements that must not drift. The tension between brand consistency and local autonomy does not disappear, but the tooling enforces the non-negotiables at the point of setup, not the point of audit.

Members join by invitation. A portfolio invites an org the franchisee already owns. Each location keeps its own full chart and its own team. The portfolio gets the cross-location view without touching how each location runs its own operations.

## What the per-location chart looks like

The clearest example I can give is our own operation at Sneeze It, since I am not going to invent a franchise brand that uses OTP and pretend it is a case study.

At Sneeze It, we run a hybrid chart that puts humans and AI agents on one scorecard. Bogdan, our COO, has a row. Janine, our head of accounting, has a row. So does Radar, our chief-of-staff agent, who runs the daily briefing and manages cross-channel awareness. Tally, our KPI agent, pushes scorecard numbers from local sources into OTP without anyone touching it. Dash, our analytics agent, reads ad performance across every client account and flags outliers. Arin, our call center manager agent, monitors speed-to-lead and appointment rates. Pulse watches client retention signals. Pepper handles email triage. Dirk manages the sales pipeline.

One scorecard. Every seat accountable for specific KPIs. No distinction on the chart between which rows are human and which are agent.

For a franchise system, this is what each member org looks like. The location manager has a row. The caller or setter has a row. And the agents who handle the operational work that does not require human judgment also have rows. Arin monitoring speed-to-lead at each location. Dash reading unit-level ad performance and surfacing the anomalies. Radar running the daily location briefing so the location manager starts the day with answers rather than questions.

The portfolio rolls all of that up. The COO looks at one chart and sees every location's agent-reported KPIs already benchmarked against system-wide targets.

## What the COO gets, specifically

The COO gets three things that were not available at this resolution before.

First: they get the underperformer before the unit's financials reveal it. Speed-to-lead, booking rate, call answer rate, and appointment show rate are operational KPIs that move before revenue moves. When those numbers are live at the portfolio level, the COO sees the early signal. The intervention window opens while there is still time to intervene.

Second: they get the outlier in the other direction. The unit running 40% above the system average on booking rate is doing something different. A portfolio view surfaces that unit without the COO having to go looking for it. Best-practice identification becomes a byproduct of normal operations rather than a quarterly exercise.

Third: they get accountability without micromanagement. The preset and lock mechanism means corporate sets the standard once. The standard is inherited by every new location. The COO does not need to audit whether each location built its chart correctly, whether each location is tracking the right KPIs, whether each location's targets match the system standard. That is all structural. The COO's attention goes to the live numbers, not to the structure underneath them.

This is the causal argument: visibility lag is the core franchise COO failure. Portfolio KPIs reduce the lag. Per-location agent teams (Arin on speed-to-lead, Dash on ad performance, Radar on daily briefing) produce the data the portfolio needs without adding reporting overhead to human staff. The preset and lock mechanism holds the standard. The COO moves from catching up to staying ahead.

Let agents carry the operational work, so people are free for the work that matters.

## See the live chart

The OTP portfolio API is queryable: you can ask which member orgs a portfolio contains, what super-metrics are configured, and what the current value of any portfolio-level KPI is.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the portfolios configured in the system and list their member orgs and any super-metrics."*

You will see the portfolio structure directly. That is what a COO query looks like before the briefing.

---

*Series: Franchise. Post 42 of an in-progress series. Questions about portfolio configuration or per-location agent setup: dsteel@orgtp.com.*
