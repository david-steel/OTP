---
title: How to keep SOPs consistent across 50 locations without policing them
date: 2026-06-21
author: David Steel
slug: how-to-keep-sops-consistent-across-50-locations
type: founder_essay
status: published
series: franchise
series_part: 13
description: The visibility-lag problem that makes franchise consistency impossible, and how presets in OTP's portfolio feature lock the operating standard once across every location.
---

# How to keep SOPs consistent across 50 locations without policing them

The consistency problem in franchising is not a training problem.

Most operators treat it like one. They build better onboarding decks. They train harder. They re-train. They send field reps to audit locations. They write cleaner SOPs, distribute them via email or a shared drive, and hope every GM at every location reads them and applies them before anything drifts.

By location 20 the system starts to crack. By location 50 it has usually broken entirely, though the breakage is mostly invisible until a customer complaint, a failed audit, or a quarter of underperformance from a cluster of units reveals it.

The consistency problem is a structure problem. Not a content problem.

## Before: why the policing model fails

Here is what the policing model actually looks like at scale.

A franchise operation with 50 locations typically has a corporate team that produces the standard: the SOPs, the scorecards, the KPIs locations are supposed to track, the benchmarks they are supposed to hit. That standard gets pushed out. It goes out by email, by a shared document library, by an operations manual that is physically handed to franchisees at training.

The moment the standard leaves corporate's hands, the divergence clock starts.

Location 3 runs its own Notion page with a slightly different version of the SOP because the GM found it easier to update. Location 17 tracks a different speed-to-lead metric because the previous ops director thought the corporate one was misleading. Location 31 still has the 2022 scorecard because nobody told them about the 2024 revision.

None of this is malicious. Most franchisees are operating in good faith. The problem is that decentralized distribution plus independent execution plus no structural linkage back to the standard equals drift by default. The standard is a document, not a constraint. Documents drift.

The fix most operators reach for is inspection: field reps, audits, compliance checklists, mystery shoppers. Policing. And policing works, but it is expensive, it is lagging (you find the drift after it has already done damage), and it scales poorly. You can audit 10 locations with a field rep. You cannot audit 50 locations weekly with the same headcount.

The deeper problem is that policing is a response to the wrong thing. You are not trying to catch drift after it happens. You are trying to eliminate the structural conditions that produce drift. Those are not the same problem.

## After: what structural consistency actually looks like

The right model is one where the standard is not a document. It is a setting.

At Sneeze It, I run a hybrid organization: humans like Bogdan (COO) and Janine (accounting) on the same org chart as agents like Radar (chief of staff), Dash (analytics), Tally (scorecard and KPI tracking), Arin (call center and speed-to-lead), Dirk (sales pipeline), Pulse (retention), Pepper (email), Crystal (project management), and Nick (prospecting). Every seat has one owner. The scorecard is live, not a quarterly report.

That structure works because the chart is not a document. It is a system. When I change a metric definition or update a target, Tally pushes the new value. The seat that owns the metric sees the change because the seat is connected to the same live scorecard, not reading a PDF that may or may not have reached them.

Now take that architecture and apply it across franchise locations.

OTP's portfolio feature, available now in early access, is built exactly for this. A portfolio is a parent organization that groups member organizations (your locations) under one roof. Each location runs its own OTP org: its own hybrid chart with human seats (the GM, the ops lead) and agent seats (the equivalent of Arin running speed-to-lead, or Radar running daily briefings for that location). Each location owns its own scorecard and its own KPIs.

The corporate franchisor sits at the portfolio level. From there, it can set presets: the standard chart structure, the standard scorecard, the standard KPI definitions. And it can lock them.

When a preset is locked, the member org inherits the standard and cannot override it. The GM at location 17 does not get to define a different speed-to-lead metric. The previous ops director's custom scorecard at location 31 does not survive the migration. The standard is not a document anymore. It is a structural constraint that every location inherits at the moment it joins the portfolio.

This is the architectural shift that eliminates the policing model.

## What this changes in practice

Before: corporate writes a KPI definition. It gets emailed to location GMs. Six months later, half the locations are tracking slightly different things. The comparison across locations is apples-to-oranges without someone manually cleaning the data.

After: corporate defines the KPI once at the portfolio level. Every member org inherits the same definition. Tally, running inside each location's OTP org, pushes values against the same metric structure. The portfolio rolls those values up into a super-metric: the same KPI aggregated across every location. Corporate looks at one portfolio dashboard and sees the system-wide number alongside each location's individual number.

Before: an underperforming location reveals itself through lagging financial results. By the time the franchisor sees the numbers, FranConnectGO has described this dynamic plainly: months of revenue opportunity may already be lost.

After: the location's scorecard is live. The portfolio's super-metrics are live. A location's speed-to-lead dropping, or its show rate falling below the benchmark, is visible at the corporate level in the same cycle it is visible at the location level. Not at the end of the quarter. Not after the field rep visit.

Before: field reps audit for compliance by visiting locations and checking their documents against the standard.

After: the preset is the compliance check. If a location is on the portfolio, it is on the standard. There is no separate audit needed to confirm whether they are running the right scorecard. The scorecard runs because the preset is locked. The audit question becomes "are the numbers healthy," not "are they running the right metrics."

## Why this matters at the scale franchising has reached

About 19.3% of franchisees now control 58.8% of all franchised locations. Operators with more than 50 units grew 118% from 2010 to 2018, the fastest tier. That concentration is not slowing down. Private equity is now buying franchisee businesses (Blackstone with Jersey Mike's, Bain's Prosper Growth Partners), which pushes the multi-unit model even further.

At that scale, the document-based consistency model does not break under the weight of bad intention. It breaks under the weight of distance. Fifty locations with fifty slightly different interpretations of the same SOP is not a failure of training. It is a structural outcome of distributing standards as content instead of enforcing them as settings.

The portfolio in early access does not claim to solve every operational problem in franchising. It solves the specific one that makes consistency impossible at scale: the standard lives somewhere else, outside the system, and every location is executing against its own local copy.

When the standard is a locked preset inside the portfolio, there is no local copy. There is only the standard.

The franchisor's job changes. Instead of writing SOPs and policing adherence, the corporate team defines the operating structure once at the portfolio level, invites locations into the portfolio as member orgs, and spends its ongoing attention on the numbers: which locations are outperforming, which are slipping, and what the cross-location benchmark reveals about system-wide health.

Agents can carry the operational work at each location, the same way Arin runs speed-to-lead management at Sneeze It, or Dash surfaces cross-account analytics, or Pulse monitors retention signals. That is the model: agents carry the operational load so the humans at each location, and the corporate team above them, are free for the decisions that actually require them.

The standard stops being a document you push. It becomes a structure you build once and every location inherits.

## See the live chart

From any OTP-connected client, you can query which member orgs belong to a portfolio and what preset KPIs are locked at the portfolio level.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the sneeze-it org structure and identify which KPIs Tally is tracking against the scorecard."*

What you see is a live hybrid chart with human and agent seats sharing one scorecard. That is the same structure a franchise location would run as a member org inside a portfolio. The portfolio rolls those seat-level numbers up into system-wide super-metrics and locks the standard that produces them.

---

*Series: Franchise. Post 13 of an in-progress series.*
