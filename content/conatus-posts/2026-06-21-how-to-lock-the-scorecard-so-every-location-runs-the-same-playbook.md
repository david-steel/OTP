---
title: How to lock the scorecard so every location runs the same playbook
date: 2026-06-21
author: David Steel
slug: how-to-lock-the-scorecard-so-every-location-runs-the-same-playbook
type: founder_essay
status: published
series: franchise
series_part: 11
description: A worked example of how the OTP portfolio preset lock works, and why it is the structural answer to scorecard drift across franchise locations.
---

# How to lock the scorecard so every location runs the same playbook

Every multi-unit operator I know eventually runs into the same thing.

Corporate sets a scorecard. The standard is clear. Speed-to-lead under five minutes. Appointment booking rate at or above 30%. Call answer rate above 80%. The brand playbook says so.

Six months later, one location is tracking speed-to-lead in seconds. Another swapped the booking rate for a "conversion estimate" their manager made up. A third dropped the call answer metric entirely and replaced it with a customer satisfaction survey nobody fills out. Three locations, three scorecards, zero comparability.

This is not a discipline problem. It is a structural one. When you give every location a blank scorecard and tell them to run the playbook, the scorecard drifts. People adjust metrics to fit what they can measure easily. Managers add what their last job tracked. The standard evaporates without anyone intending to violate it.

The fix is not more communication. It is a structural lock.

Here is exactly how that works in OTP.

## The setup: one portfolio, many member orgs

In OTP, a portfolio is a parent organization. It groups multiple member orgs (locations) under one roof, rolls their KPIs up into shared super-metrics, and gives corporate a cross-location view without touching each location's day-to-day operations.

This is the enterprise tier of OTP, available now in early access through Labs.

Each location is its own OTP org with its own hybrid chart: human seats and AI agent seats on the same scorecard, each with its own KPIs. A location might have Arin (call center agent) on one row tracking speed-to-lead and dial volume, Dash (analytics agent) on another row watching lead cost and conversion trends, and a human operations manager holding the booking rate row. One seat, one owner, one number. The location runs its own chart.

The portfolio sits above all of that.

## Step one: build the standard chart once

The franchisor builds the master scorecard in the portfolio. Not in every location. Once.

The seats are defined at the portfolio level. The KPI names are exact. "Speed-to-lead (minutes)" is what the metric is called, not "lead response time" or "time to first contact" or whatever a local manager might name it. The column headers match. The targets are set.

This is the operating standard. One definition. One vocabulary. One set of targets.

At Sneeze It, we run this same discipline internally. Arin, our call center agent, tracks speed-to-lead and dial volume with exact column definitions. Tally, our scorecard agent, pushes those values to the chart on a schedule. The metric name never drifts because the agent owns the row and the row definition is locked. Nobody is hand-entering a "conversion estimate." The seat publishes what the seat is accountable for, exactly as defined.

For a franchise system, the portfolio extends this to every location. The standard chart that corporate defines becomes the chart every location inherits.

## Step two: invite locations and push presets

When a location joins as a member org, the portfolio pushes presets to it. The location inherits the standard scorecard: the seat names, the KPI names, the column structure, the targets.

Here is where the lock comes in. A portfolio can mark its presets as locked. When a preset is locked, the member org cannot change it. The location manager cannot rename the metric. They cannot swap the target. They cannot add a row in the standard section and call it something custom.

The scorecard is the scorecard. Corporate set it. It is locked.

What the location CAN do is run their seats. They populate the numbers. They hire (or configure) the agents that fill those seats. Arin, at a fitness franchise location, works the speed-to-lead row the same way Arin works it at Sneeze It: dials, follows up, logs the outcome, posts the number. The seat does the work. The row definition is not negotiable.

This is the structural answer to scorecard drift. It is not a policy. It is not a reminder email from corporate. It is a permission state in the system. Locked means locked.

## Step three: watch the super-metrics

At the portfolio level, corporate sees super-metrics. These are KPIs fed by the member orgs below them. When every location is tracking the same speed-to-lead metric with the same definition, the portfolio can aggregate those numbers into a system-wide view. Same-store trends become comparable. Underperformers become visible in real time, not after a quarterly review.

This is where the concentration reality of modern franchising meets the product. About 19.3% of franchisees control 58.8% of all locations (FRANdata/IFA, 2026). Operators with 50 or more units grew 118% from 2010 to 2018, the fastest-growing tier. A portfolio operator running 30 fitness locations cannot afford to wait for month-end financial reports to know which location is struggling. By the time the financials show the problem, the opportunity to correct it is weeks past.

Super-metrics solve this. If the portfolio super-metric for speed-to-lead starts moving in one direction, corporate can trace it to the locations pulling it. The underperformer is not hidden inside a quarterly average. It is a row on the portfolio chart, visible in real time.

## What the location view looks like

The location does not see the portfolio above it as a constraint. It sees its own OTP chart with its own seats doing work.

Radar (chief-of-staff agent) is running the morning briefing, scanning what needs attention. Pulse (retention agent) is watching client health and surfacing churn risk. Dirk (sales agent) is managing pipeline. Crystal (project manager agent) is tracking delivery. Pepper (email agent) is triaging client messages. Each seat has its work. The location manager sees a functioning hybrid org.

What the manager cannot do is change the scorecard structure that corporate locked. They can adjust what is in their local seats' scope, hire people, bring in agents, and run their operations. But the shared metrics that corporate needs to aggregate across 30 locations stay intact. The preset lock is invisible to them in normal operation. It only matters when someone tries to drift.

This is the right trade. Local autonomy on operations. Corporate control on the measurement standard. Those two things do not conflict when the structure separates them cleanly.

## What to do if you are already in drift

Most franchise systems reading this are already in some version of the scorecard drift problem. Three locations, four different metric names for the same thing.

The recovery is the same as the setup, just with a data cleaning step first. Build the standard chart at the portfolio level. Name every metric once, exactly. Then, as each location joins the portfolio, their scorecard migrates to the standard. The lock prevents future drift. The past inconsistency goes away as each location's data gets mapped to the correct row.

The work is not technical. It is definitional. The hard part is getting corporate to agree on what "speed-to-lead" means before pushing it to 30 locations. That conversation has to happen anyway. OTP just makes the outcome of that conversation structurally enforceable.

Let agents carry the operational work, so people are free for the work that matters. In a franchise system, the work that matters is the conversation about standards, not the downstream enforcement of them. The portfolio lock handles enforcement. Corporate handles strategy.

That is the division of labor.

## See the live chart

The OTP MCP exposes portfolio structure queries. You can ask what super-metrics a portfolio is tracking, which member orgs are feeding them, and what preset locks are in place.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the portfolio structure for sneeze-it and list any preset configurations on its member orgs."*

What comes back is a live view of how the parent-member relationship is structured, what is inherited, and what is locked. For a franchise evaluating whether presets can do the consistency work they need, that is the concrete proof.

---

*Series: Franchise. Post 11 of an in-progress series. Previous: [Why the franchisor is a portfolio and every location is an org.](/blog/the-franchisor-is-a-portfolio)*
