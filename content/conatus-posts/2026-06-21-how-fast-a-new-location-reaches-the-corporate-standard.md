---
title: How fast a new location reaches the corporate standard depends entirely on how the standard was built
date: 2026-06-21
author: David Steel
slug: how-fast-a-new-location-reaches-the-corporate-standard
type: founder_essay
status: published
series: franchise
series_part: 20
description: A new franchise location is not slow because the team is bad. It is slow because the standard was never made portable. Here is the failure mode and the fix.
---

# How fast a new location reaches the corporate standard depends entirely on how the standard was built

The multi-unit franchise world has concentrated fast. About 19.3% of franchisees now control 58.8% of all locations. Operators with 50 or more units grew 118% between 2010 and 2018, the fastest-growing tier in franchising. That concentration is not slowing down.

What that means operationally: a single operator opening a new location is not opening one store. They are opening the fifth, or the fifteenth. The question they ask every time is not whether the new location will succeed. The question is how long it will take to reach the standard the other locations already run at.

The honest answer is: it depends almost entirely on how the standard was built. Not on the team. Not on the market. On the portability of the operating model.

This post is about the failure modes I have watched kill that portability, and the structural fix that prevents them.

## The five failure modes that slow a new location down

Most franchisors think onboarding a new location is a training problem. Train the manager, run the playbook, check the boxes. If the location is still struggling at week twelve, the instinct is to send more training.

Training is almost never the problem.

Here is what actually slows new locations down.

**The standard lives in people, not in systems.** The corporate standard is often held in the heads of the regional director and a few high-performing managers. The new location gets a visit, some shadowing time, maybe a printed SOP binder. The binder is out of date by the time it is printed. The standard does not transfer because it was never stored anywhere a system could read it.

**KPIs are set once and not inherited.** Corporate agrees on a set of metrics. Speed-to-lead, appointment rate, show rate, cost per acquisition. The new location starts fresh. Someone recreates the scorecard manually, usually with the wrong targets, usually missing two metrics that turned out to matter. Corporate does not find out until the quarterly review, which is ninety days in.

**Benchmarking is retrospective.** By the time a new location's numbers show up in any comparison against other units, the window to course-correct early is already gone. FranConnectGO puts it plainly: "by the time financial results show a problem, it may be too late." Operators are always playing catch-up because the data loop is slow.

**Consistency degrades at scale.** Without a central system, each unit begins operating as an independent business. Policies get interpreted differently. Thresholds drift. The brand standard that protected the portfolio when there were five locations is actively eroding at fifteen.

**The new location cannot see where it stands.** This is the one that compounds all the others. The new location manager does not have visibility into how comparable units are performing. They cannot see that their appointment rate is 12% when the portfolio median is 24%. They are flying blind for months while corporate watches the same gap from a different dashboard.

None of these are people problems. They are architecture problems. The fix is structural.

## What portability actually requires

A portable standard has three properties.

It is stored in a system, not a person. The moment the standard depends on a regional director's memory, it degrades every time that director changes. The standard has to live somewhere a system can read it, push it, and enforce it.

It is inherited automatically, not recreated manually. When a new location comes online, the scorecard should appear. The KPI targets should appear. The agent configuration should appear. Nothing is recreated. Nothing is mistyped. The new location inherits the standard the way a new employee inherits a job description.

It is enforced, not suggested. There is a difference between a default that can be changed and a lock that cannot. A franchise brand standard is a lock, not a default. The new location manager should be able to customize things within their authority. They should not be able to turn off the metrics corporate uses to run the portfolio.

This is exactly what the portfolio preset is built to do.

## How presets work in practice

OTP's portfolio feature, available now in early access, is built on a specific mechanic: the franchisor runs a portfolio org. Each location is a member org with its own full chart. The portfolio can push preset defaults to every member org and lock them.

That lock is the key word. When corporate sets a KPI target or a chart structure as locked, member orgs inherit it. They cannot change it without corporate unlocking it. The standard is not a recommendation. It is the floor.

For a new location, what that means practically is this. The location joins the portfolio. The corporate scorecard appears. The KPI targets appear. The agent seats that corporate has standardized appear. The new location is not starting from a blank chart. They are starting from the standard that the best-performing locations in the portfolio already run on.

At Sneeze It, the operating discipline I would deploy at every location under a franchise model is grounded in the same seats we run internally. Radar handles chief-of-staff work: daily briefings, calendar, delegation tracking, cross-channel awareness. Arin manages call center performance, speed-to-lead, and appointment rates. Dash reads the ad and call center numbers and reports patterns without editorializing. Pulse watches client retention and flags churn risk before it becomes visible in revenue. Tally pushes KPI values to the scorecard automatically so the numbers are live, not manual. Each of those seats has a defined role, a defined metric, and accountability to the shared scorecard.

A preset is how corporate would push that structure to a new location from day one. The location opens. The chart appears. Radar is configured. Arin is watching speed-to-lead. Tally is pushing numbers. The location's scorecard is already speaking the same language as every other location in the portfolio.

## What the portfolio view adds on top

The preset handles what the new location inherits. The portfolio view handles what corporate sees.

When corporate looks at the portfolio, they see super-metrics. Each super-metric is a KPI on the portfolio level that is fed by the corresponding KPIs from member orgs. Speed-to-lead across all locations. Appointment rate across all locations. Same-store performance trends. The portfolio view rolls member-org KPIs up into a shared view so corporate can see the system at once.

That is location-to-location benchmarking made visible in real time. When the new location's appointment rate is 12% and the portfolio is running at 24%, corporate sees it immediately, not at the next quarterly review. The conversation about what is causing the gap can happen in week two instead of week sixteen.

The data loop that FranConnectGO describes as "always playing catch-up" shortens because the data is not traveling through a quarterly spreadsheet. It is live on the portfolio chart.

## The real question is not how fast. It is what is blocking.

Operators ask how fast a new location can reach the corporate standard. The more useful question is what is currently preventing the standard from being portable.

Is the standard stored in people? Is the scorecard recreated manually every time? Is the new location flying blind for months before anyone benchmarks them? Is corporate playing catch-up because the data loop is slow?

Each of those is a solvable architecture problem. The solution is not more training. It is a system where the standard lives in a structure that can be pushed, inherited, and enforced.

Let agents carry the operational work, so people are free for the work that matters. In a franchise, the agents at each location run the repeatable tasks. Corporate uses the portfolio to see whether the repeatable tasks are running the way the standard says they should. The humans at every level are free to focus on the decisions the system cannot make for them.

## See the live chart

The OTP MCP can show you what a portfolio structure looks like and which seats in a member org are inherited from a preset versus locally defined.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the Sneeze It org chart and explain which seats would be pushed to a new franchise location as preset defaults."*

You will see how the seat structure maps to a portable standard, and which roles would appear automatically on day one at a new location.
