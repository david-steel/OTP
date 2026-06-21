---
title: How a PE-backed franchise roll-up gets one view of every unit it owns
date: 2026-06-21
author: David Steel
slug: how-a-pe-backed-franchise-rollup-sees-every-unit
type: founder_essay
status: published
series: franchise
series_part: 24
description: PE-backed franchise roll-ups own dozens of units and manage them blind. Here is how a portfolio view changes that, one location at a time.
---

# How a PE-backed franchise roll-up gets one view of every unit it owns

Private equity does not buy one gym or one home services location. It buys a position in an entire category.

Blackstone took a majority stake in Jersey Mike's in November 2024. Bain launched Prosper Growth Partners in November 2025 specifically to buy franchisee businesses. Flynn Group picked up 37 Planet Fitness units and became one of the largest multi-concept operators in the country. The pattern is clear: PE is not rolling up brands at the franchisor level anymore. It is rolling up franchisees, buying operating positions in dozens or hundreds of units across a territory.

Here is the problem they have not solved: once you own fifty locations, you are managing them the same way the single-unit operator in 2006 managed one location. With spreadsheets, email threads, and a monthly financial report that tells you what happened six weeks ago.

The core failure is visibility lag. FranConnectGO put it plainly: by the time financial results show a problem, months of revenue opportunity may already be gone. Operators are always playing catch-up. That was true for single-unit operators in 2006. It is still true for PE roll-ups in 2026, just at a scale that multiplies the damage.

What follows is a specific description of how OTP's portfolio feature addresses this, and why the organizational model underneath it is the part the spreadsheets cannot replicate.

## 1. The concentration problem

Franchising has become a game of scale. According to FRANdata and the IFA, 19.3% of franchisees now control 58.8% of all franchised locations. Operators with 50 or more units grew at 118.52% from 2010 to 2018, the fastest-growing tier in the industry.

That concentration is exactly what PE is betting on. Buy the multi-unit operator, get the territory, own the economics at scale. The business logic is sound. The operational problem is that most of those roll-ups inherit a different information system at each location, no shared definition of KPIs, and a reporting cadence that was designed for a regional manager reviewing printouts, not a portfolio company that needs real-time visibility across a board deck.

The question is not whether to roll up. The question is how to see the whole thing once you have.

## 2. The information architecture is the problem

Every unit in a PE-backed roll-up already has people doing work. The Arin-equivalent at each location (whatever they call the person managing speed-to-lead and call center conversion) is generating data every day. The problem is that data lives in a system built for one location, not for the portfolio.

At Sneeze It, I run a hybrid org chart. Radar is our chief-of-staff agent. Dash handles analytics across every ad account. Tally pushes our KPI values to the scorecard. Arin manages call center performance and speed-to-lead. Pepper handles email. Dirk runs sales pipeline. Each of these seats owns a specific metric. The scorecard tells me, in one view, whether every seat is at target.

Now multiply that by fifty locations.

Each location should have its own Radar, its own Arin, its own Dash. Each location's metrics should live on its own scorecard, owned by its own people and agents. The roll-up problem is not that the seats are wrong. The roll-up problem is that fifty scorecards are not the same as one portfolio view.

## 3. What the OTP portfolio feature actually does

OTP's portfolio feature, available now in early access, is built on a specific architecture.

A portfolio is a parent organization that groups several member organizations under one roof. Each member org keeps its own full OTP chart: its own humans, its own agents, its own KPIs, its own scorecard. The portfolio does not flatten those orgs. It sits above them.

What the portfolio layer adds is super-metrics. A super-metric is a KPI on the portfolio that is fed by one or more member-org KPIs, aggregated across the portfolio into a single number the parent can track. In franchise terms: each location tracks its own booking rate, its own show rate, its own AUV. The portfolio rolls those into a system-wide view. Same metric, same definition, one place.

The second piece is presets. A portfolio sets default configurations that member orgs inherit. The portfolio can lock those presets. In franchise terms: corporate defines the standard scorecard once, every location inherits it, and corporate can lock it for brand consistency. This is the consistency problem solved at the structural level, not the policy level.

The third piece is benchmarking. With every location on the same scorecard format, location-to-location comparison is straightforward. Which units are at or above system AUV. Which are below. Which are trending in the wrong direction before the monthly financials surface it.

This is the visibility problem: when it shows up in the financials, months of revenue opportunity are already gone. The portfolio view is the mechanism for seeing it earlier.

## 4. What the PE roll-up actually sees

A portfolio owner in OTP sees one dashboard with super-metrics aggregated from every member org. They can drill down to a single location's scorecard when a number moves. They can benchmark locations against each other on the same definitions, because the presets ensured those definitions were set by corporate and inherited uniformly.

Here is the specific flow as I understand the feature in early access:

**The portfolio invites a member org.** The franchisee already owns their OTP org. Corporate sends an invitation. The member org joins the portfolio. Its KPIs become available as sources for super-metrics.

**Super-metrics roll the KPIs up.** The portfolio owner defines a super-metric, sources it from the relevant member-org KPIs, and watches it aggregate across the system. Speed-to-lead response rate across fifty locations. Booking rate by territory. Same-store trend by region.

**Presets lock the standard.** When corporate sets the scorecard template and locks the preset, every location that joins inherits the same structure. New units onboard into a system, not into a blank chart. The operating standard travels with the org.

**Benchmarking identifies the outlier.** The portfolio owner can see which locations are above and below system averages on every tracked metric. That identification is what makes the catch-up conversation happen at the right time, not six weeks after the financial report lands.

## 5. The franchise roll-up is a portfolio by definition

The franchise structure was always a portfolio structure. One franchisor, many franchisee orgs, one operating standard, one brand. What has been missing is a software layer that actually reflects that structure.

Every tool in the traditional franchise stack treats each location as an independent installation. The reporting layer aggregates after the fact. The compliance layer audits after the fact. The coaching layer coaches after the fact.

OTP's portfolio feature treats the roll-up the same way the roll-up actually operates: one parent, many member orgs, live metrics flowing up, presets flowing down.

I am not claiming any of the PE-backed groups or franchise brands I work with in ad management have deployed this. They have not, as far as I know. What I am saying is that the architecture maps directly onto what a roll-up needs, and the gap between what they currently run and what this makes possible is large enough to be worth taking seriously.

Operators with 50 or more units grew 118% in eight years. Those units need a shared view. The spreadsheet did not grow with them. The monthly financial report did not grow with them. A portfolio model, where every location is an org on its own scorecard and the parent rolls it all up, is the architecture that fits the business.

## 6. The agent question at the location level

The reason I think about this in terms of seats rather than just dashboards is that the visibility problem is partly a staffing problem.

A PE roll-up cannot put a senior ops director in every location. It can put agents in every location. Each location runs its own Arin for speed-to-lead, its own Dash for performance analytics, its own Pulse for retention signals. Those agents publish their numbers to the location's scorecard. The scorecard feeds the portfolio super-metric. The portfolio owner sees it.

The agents carry the operational work. The people are free to do the work that matters: coaching the outlier location, adjusting the standard, allocating capital.

The mission of the whole system is the same at one location or fifty. Let agents carry the operational work, so people are free for the work that matters.

The portfolio view is what makes that mission work at roll-up scale.

## See the live chart

You can ask an OTP MCP client to pull the current super-metrics from any portfolio org and show how member-org KPIs are aggregating into the parent view.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me whether any portfolio orgs exist and what super-metrics they are tracking."*

What comes back is the actual structure: which orgs are members, which KPIs are sourced, which are rolled up at the parent. That is the architecture a PE-backed roll-up runs when it finally has one view of every unit it owns.
