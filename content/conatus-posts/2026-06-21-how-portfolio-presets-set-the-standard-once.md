---
title: Portfolio presets let corporate define the operating standard once and every location inherits it automatically
date: 2026-06-21
author: David Steel
slug: how-portfolio-presets-set-the-standard-once
type: founder_essay
status: published
series: franchise
series_part: 10
description: How OTP portfolio presets solve the consistency problem in multi-unit franchising by letting corporate set the operating standard once and lock it across every location.
---

# Portfolio presets let corporate define the operating standard once and every location inherits it automatically

The consistency problem in franchising is not complicated. It is just expensive.

Corporate defines a standard. The standard gets documented. The document gets sent to every location. Somewhere between the send and the execution, the standard fractures. One location follows it precisely. Another interprets it loosely. A third ignores it entirely because the manager who received the document has already turned over twice.

This is not a training failure. It is a structural one. The standard lives in a document, not in the system every location actually runs on. Documents drift. Systems do not.

## Why the standard breaks at scale

The concentration statistics in franchising are striking. According to FRANdata and the IFA, roughly 19.3% of franchisees control approximately 58.8% of all franchise locations. Operators with 50 or more units grew by more than 118% between 2010 and 2018, the fastest-growing tier in the industry. The businesses that work at scale are the ones that cracked the consistency problem.

The ones that struggle share a common failure mode: by the time financial results reveal a compliance problem, the damage is already done. Operators describe it as "always playing catch-up." The unit's numbers tell you something went wrong months after the correction window has closed.

Visibility lag is half the problem. The other half is that even when corporate can see a gap, the mechanism for closing it is slow. Send a message. Wait for acknowledgment. Hope the SOP change gets implemented. Repeat.

The reason this cycle keeps repeating is that the standard lives outside the operating system. Every time corporate updates it, they have to push it back through channels that were never designed for enforcement. The locations that are already disciplined implement the update. The ones that needed it most implement it last, or not at all.

Portfolio presets in OTP break this cycle structurally.

## What presets actually do

OTP's portfolio feature, available now in early access for enterprise teams, lets a parent organization (the portfolio) group member organizations under one roof and roll their KPIs into shared super-metrics. Each member org keeps its own full chart: humans and AI agents on one scorecard, one seat, one owner.

The presets piece is the franchise consistency lever.

A portfolio sets default configurations that its member orgs inherit. That inheritance is automatic. When corporate updates the preset, the change propagates. Corporate does not need to send a document. Corporate does not need to run a training call. The standard updates in the system every location operates from.

The other half of presets is the lock. Corporate can lock preset configurations across member orgs. A locked preset is not a recommendation. It is a constraint. A location cannot deviate from it without the portfolio removing the lock. That is a fundamentally different relationship between standard and practice than any document-based system can produce.

This is how you set the standard once.

## What the standard actually contains

For a fitness or wellness franchise thinking through how this works in practice, the scorecards and seat definitions inside an OTP org are where the standard lives.

At Sneeze It, our hybrid chart has specific seats doing specific work. Radar holds the chief-of-staff seat and runs the daily briefing. Arin holds the call center management seat and tracks speed-to-lead and appointment rates against the 30% booking target. Dash holds the analytics seat and monitors ad spend, lead volume, and CPL across our client portfolio. Tally holds the KPI push seat and keeps the scorecard current without anyone touching it manually. These agents carry the operational work so the humans on the chart are free for the work that matters.

The insight for franchises is that this setup, designed once at the portfolio level, can propagate to every location as a preset.

A fitness franchisor running an OTP portfolio could define the seat structure for a standard location: a Radar-equivalent handling daily ops visibility, an Arin-equivalent on call center and booking rates, a Dash-equivalent monitoring ad performance. Each location inherits that seat structure automatically. Corporate locks the KPI definitions so every location measures the same things in the same way. The benchmarking that follows is actually meaningful because the underlying chart is consistent, not a patchwork of each location's individual interpretation of what "appointment rate" means.

Location-to-location benchmarking is one of the most frequently cited requirements in franchise operations. You cannot benchmark well against inconsistent inputs. Presets make the inputs consistent.

## The cause and the mechanism

The cause of the consistency breakdown is always the same: the operating standard and the operating system are two different things.

The mechanism that fixes it is moving the standard into the system. Not as a document attached to the system. Not as training material adjacent to the system. As configuration inside the system that the system enforces.

Portfolio presets are that mechanism in OTP. Corporate sets the chart structure, the seat definitions, the KPI targets. The portfolio pushes them to every member org. Corporate locks what needs to stay consistent. The locations operate from a system where the standard is not optional.

The causal chain from this point is direct. Consistent charts produce consistent KPIs. Consistent KPIs make the super-metrics meaningful. Meaningful super-metrics let corporate see what is actually happening across all locations in real time, not months after the gap has widened into a problem. Corporate is no longer playing catch-up because the system is enforcing the standard automatically while the people on each chart focus on execution.

The effect is not just operational tidiness. It is the difference between a portfolio that grows and a portfolio that fractures. The operators who control 58.8% of franchise locations did not get there by hoping each new unit would interpret the standard correctly. They built systems where the standard was not optional.

## What gets locked and what stays local

One clarification worth making: portfolio presets do not mean every location runs identically in every dimension. The architecture allows corporate to set what needs to be set and lock what needs to be locked while leaving room for local configuration in areas where local judgment legitimately matters.

A location in a high-competition urban market might need different lead-volume targets than a location in a suburban market. Corporate can leave those unlocked. The KPI definitions, the seat structure, the measurement cadence: those get locked because inconsistency there makes the portfolio data meaningless.

This is the structural answer to the central tension in franchising: centralized standards versus local autonomy. Lock what must be consistent for the portfolio to function as a system. Leave unlocked what benefits from local adaptation. The preset architecture is designed to support that distinction.

## The early access reality

Portfolio presets are available now in early access. This is not a feature that is coming. It is a feature you can use. The maturity expectation that comes with early access is real: the teams using it now are shaping how it develops. That is a different value proposition than waiting for a general release, and it is not appropriate for every operator.

For multi-unit operators already struggling with visibility lag and consistency drift, the early access window is the relevant entry point. The teams that adopt infrastructure early tend to be the ones who understand that the problem they are solving now is the same problem that prevented the last wave of multi-unit operators from scaling efficiently.

The franchise operations problem has not changed. The tools for solving it structurally are new.

## See the live chart

The OTP MCP exposes portfolio structure and seat definitions directly, so you can query what a preset-based setup looks like in practice before building one.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the org chart for sneeze-it and explain which seats would be defined once at the portfolio level for a franchise rollout."*

What comes back is a live structured view of how human and agent seats combine on a real operating chart, and a concrete starting point for thinking through what your own portfolio preset would contain.
