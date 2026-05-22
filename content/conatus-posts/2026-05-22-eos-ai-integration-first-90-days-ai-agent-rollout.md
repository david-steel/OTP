---
title: An EOS® company's first 90 days with an AI agent rollout
date: 2026-05-22
author: David Steel
slug: eos-company-first-90-days-ai-agent-rollout
type: founder_essay
status: published
series: eos-ai-integration
series_part: 15
keywords:
  - EOS rollout
  - Entrepreneurial Operating System
  - AI agents
  - agentic AI
  - 90 day plan
  - Claude
  - Claude Code
  - ChatGPT
  - Anthropic
  - OpenAI
  - L10
---

# An EOS® company's first 90 days with an AI agent rollout

If you have read the rest of this series, you have a model for how AI agents fit into EOS®. This post is the practical one. Given a company already running EOS® reasonably well, how do you actually roll out AI agents over a single quarter without breaking the system you have spent years building.

Plan for one quarterly Rock. Yes, that level of focus. Treat AI integration like any other Rock with a Done state, an Accountability Partner, weekly milestones, and a fixed 90-day window.

The Rock: "By end of Q1, we have one human-style Chief of Staff agent and one Scorecard agent live and producing weekly outputs the leadership team trusts."

That is a deliberately small Rock. The mistake almost every leadership team makes here is over-ambition. Pick two seats. Land them well. Earn the trust. Expand next quarter.

## Weeks 1 and 2: definitions and decisions

Before any model gets touched.

**Week 1 deliverables.**

- Confirm the V/TO™ is current. If it is more than two quarters stale, refresh it. The V/TO™ is the preamble for every agent. Stale V/TO™ produces drifty agents.
- Identify two seats for first agents. Recommended pair: Chief of Staff (briefings, calendar, task orchestration) and Scorecard (KPI push). These two together touch the L10® in the most useful way and the leverage shows up fastest.
- Pick a vendor. Anthropic with Claude or Claude Code, OpenAI with ChatGPT and the Assistants API, or your incumbent if you already have one. Stop shopping after this week.
- Identify the human accountability partner for each agent seat. Usually the Integrator owns the Chief of Staff agent. The owner of the largest Scorecard row owns the Scorecard agent.

**Week 2 deliverables.**

- Write the SOP for each agent. Six fields each: identity, job, scorecard, data sources, escalation rule, off-limits actions.
- Write definitions for every Scorecard row. The agent will be more disciplined than your humans were on these definitions. Make them defensible.
- Confirm data access. The Chief of Staff agent needs read access to calendar, task system, Slack. The Scorecard agent needs read access to the source systems behind every row.
- Set the enterprise plan with your vendor. Zero training on customer data. SSO. Audit logs. Sign the DPA.

You have not built anything yet. You have done the writing and the contracts. This is the work that earns the next 60 days.

## Weeks 3 and 4: first build, shadow mode

Build both agents. Run them in shadow mode.

**Week 3 deliverables.**

- Build the Chief of Staff agent. It reads calendar, task system, and a designated set of Slack channels. It produces a daily briefing draft to a private channel or file that only the accountability partner sees. The partner reviews each morning.
- Build the Scorecard agent. It reads the source systems for two or three Scorecard rows (not all of them yet). It produces draft numbers in a private worksheet, not in the live Scorecard. The accountability partner reviews each Monday.

**Week 4 deliverables.**

- Refine SOPs based on what you learned from week 3 outputs. Where did the agent miss. Where did it surface false signals. Update the SOP, not the model.
- Add two more Scorecard rows to the Scorecard agent. Continue in shadow mode.
- First L10® where the leadership team is told the agents exist. Not in use yet. The team should know what is coming.

You are still in shadow mode. Nothing the agents produce is acted on without the partner's review.

## Weeks 5, 6, and 7: live mode for the easier seat

Promote the Scorecard agent first, because the Scorecard work is the most measurable.

**Week 5 deliverables.**

- Scorecard agent goes live. The numbers it produces go into the actual Scorecard, with the agent's evidence trail visible.
- The Scorecard row owners spot-check the numbers each Monday. If a number is wrong, the row goes back to manual for that row until the SOP is fixed.
- L10® uses the agent-produced Scorecard for the first time. The team experiences a five-minute Scorecard review instead of a fifteen-minute one.

**Week 6 deliverables.**

- All Scorecard rows the agent can produce go live. Any rows that are inherently judgment-based (employee sentiment, qualitative ratings) stay human-entered.
- The Chief of Staff agent stays in shadow mode. Its briefings are still draft to the Integrator only.

**Week 7 deliverables.**

- Chief of Staff agent moves to live mode in a limited way. The morning briefing is shared with the leadership team. It is not the official briefing yet, it is in parallel with whatever briefing the Integrator was producing manually. The team gets used to seeing it.

By the end of week 7 the Scorecard is live and the Chief of Staff is parallel-running. The team has experienced the change at two L10®s. The momentum is real but small.

## Weeks 8, 9, and 10: trust ladder and integration

Move the Chief of Staff up the trust ladder. Use the second L10® and beyond.

**Week 8 deliverables.**

- Chief of Staff agent becomes the official morning briefing. Manual briefings stop. Integrator reviews each morning and edits if needed.
- L10® uses both agents. Five minutes saved on Scorecard. Ten minutes saved on briefing-style review of headlines and calendar awareness. Use the time on IDS.

**Week 9 deliverables.**

- First Quarterly check-in. Half the quarter is done. Walk through the agent layer at the L10® level. What is working. What is not. What needs adjustment for the second half of the quarter.
- Sharpen the SOPs for the second half.

**Week 10 deliverables.**

- Stress test the agents. Hand each one a request that would violate a Core Value and see if it pushes back. Test the escalation rules. Test the off-limits actions. Document gaps.
- Patch any prompt gaps you find.

## Weeks 11, 12, and 13: stabilize and plan next

Do not add more agents. Stabilize the two you have.

**Week 11 deliverables.**

- Six L10®s have now used the new pattern. The team should be familiar with the cadence. Pattern is stable.
- Run the first People Analyzer™-style review of the agent seats. Core Values alignment, Gets it, Capacity, Commitment. Document.

**Week 12 deliverables.**

- Prep the Quarterly. Identify which other seats are candidates for agents next quarter. Recommended next pair: inbox triage and project management visibility.
- Write a brief on what worked and what did not, for the leadership team to read before the Quarterly.

**Week 13 deliverables, the Quarterly.**

- Standard EOS® Quarterly. Review Rocks. Review the agent rollout Rock. Decide which agents to add next quarter as a new Rock.
- Refresh the V/TO™ if needed. Refresh the agent preamble file the same day.

## What success looks like at day 90

Two agents live. L10® is faster and sharper. Scorecard is current every Monday morning. The Integrator has visible time back. The leadership team trusts the data more than they did 90 days ago.

You have not changed the EOS® framework. You have given it a new layer.

## What failure looks like at day 90

You built eight agents. None of them are trusted. The L10® is being interrupted by agent flags. The Integrator is spending more time managing agents than the agents are saving. The Scorecard has agent-produced numbers next to manual numbers and nobody is sure which is which.

This is what happens when you skip the discipline of the first two weeks and try to over-build in weeks 3 through 6. The fix is to retire the agents that are not earning their keep and restart with two seats and clean SOPs.

## FAQ

**Can a 10-person company do this?** Yes. The Chief of Staff seat alone often returns 10 hours per week to the founder at a 10-person company.

**Can a 200-person company do this?** Yes, but with two changes. The Integrator probably needs a Chief of Staff-style human to manage the agent layer day to day. The vendor decision needs to involve IT and legal earlier.

**Do we need consultants for this?** Not necessarily. The hardest work is internal: definitions, SOPs, accountability. A consultant or agency can help build the technical layer faster, but the EOS® discipline that makes it work has to come from your leadership team.

**What if our V/TO™ is not ready?** Fix the V/TO™ first. Do not deploy agents on a fuzzy V/TO™. You will deploy fuzziness at scale.

EOS®, Entrepreneurial Operating System®, V/TO™, Level 10 Meeting®, L10®, Rocks™, Scorecard, People Analyzer™, IDS, Quarterly, and Integrator are concepts and trademarks of EOS Worldwide, LLC. This article is an independent practitioner perspective and is not affiliated with or endorsed by EOS Worldwide.
