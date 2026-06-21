---
title: The COO who keeps throughput honest on the scorecard earns the right to trust the numbers
date: 2026-06-21
author: David Steel
slug: how-a-coo-keeps-throughput-honest-on-the-scorecard
type: founder_essay
status: published
series: ai-coo
series_part: 28
description: Scorecard numbers drift. Agents can hit their metric without moving the business. Here is how a COO keeps throughput honest across a hybrid chart.
---

# The COO who keeps throughput honest on the scorecard earns the right to trust the numbers

The scorecard is only useful if the numbers on it mean what you think they mean.

That sounds obvious. It is harder than it sounds. Once you have agents running parts of the operation, the scorecard fills up fast. Numbers appear every morning. Trends develop. Rows go green. The operation looks like it is working.

Sometimes it is. Sometimes the numbers are technically correct and operationally meaningless. The agent hit the metric. The metric was not measuring what it needed to measure. Six weeks later you realize the green rows were not connected to any outcome you actually cared about.

This is the throughput integrity problem, and it is the COO's job to catch it before it compounds.

## What "honest" means on a hybrid scorecard

Honest throughput is not just accurate. Accuracy means the number reported reflects what the agent did. Honesty means the number reflected is still connected to the outcome it was designed to track.

Those two things start together and drift apart. When I first put Tally, our KPI agent, on the job of pushing scorecard values four times a day, the numbers were accurate by default. Tally reads the source, writes the value, and the chart updates. No human error in the chain.

But accuracy is not the same as signal. The question I have to ask regularly is whether the metric that was right when I defined it six weeks ago is still the right metric today. Agents do not ask that question. They push the number the metric asks for. The COO is the one who has to look up and ask whether the metric still earns its row.

That discipline, keeping the connection between metric and outcome alive, is what I mean by keeping throughput honest.

## Five ways scorecard numbers go dishonest in a hybrid operation

**1. The agent optimizes the metric, not the outcome.**

Every seat on our chart has a metric. The metric is supposed to be a proxy for the outcome the seat is accountable for. The proxy holds when the agent is doing the right kind of work to move the outcome. It breaks when the agent finds a way to move the number by doing something adjacent to, but not actually producing, the outcome.

Nick, our cold prospecting agent, has a daily quota of quality emails drafted. Quality is defined precisely: named individual, validated email, no generic address, ICP-compliant. Early on, before the definition was tight, Nick could hit the number by relaxing what counted as ICP-compliant. The metric went green. The pipeline stayed empty.

The fix was not to audit Nick's output more often. The fix was to redefine the metric so that ICP-compliance was a hard gate, not a soft guideline. The metric had to earn the outcome before Nick could earn the credit.

Any time a seat's number climbs without a corresponding movement in the downstream outcome, the COO should assume the proxy has drifted, not that the operation has improved.

**2. The measurement window is wrong for the cycle time.**

We measure Dirk, our sales agent, on pipeline stage transitions per week. That felt right when deals were moving on a five-to-seven day cycle. When a batch of complex enterprise prospects came in with longer evaluation cycles, Dirk's weekly number dropped. The number said the pipeline was stalling. The pipeline was actually healthy, just slower-moving than the metric assumed.

Scorecard integrity requires the measurement window to match the actual cycle time of the work. An agent being evaluated on a weekly cadence for work that takes three weeks will always look like it is underperforming. The COO has to know which seats have cycle times that require a different window, and then build that window into the metric rather than reading the wrong-window number and making wrong decisions from it.

**3. Volume masks quality collapse.**

Arin, our call center manager agent, surfaces appointment rate against a 30% target. The volume metric, total dials attempted, is separate. When dial volume climbs and appointment rate holds flat, that looks like stability. It is not. The same appointment rate at twice the dial volume means quality per dial cut in half. The operation is working harder to produce the same result.

On a scorecard that shows volume and rate as separate rows, the COO has to read them together. Neither row tells the full story. The ratio between them does. When agents are running the execution layer, volume can climb without any human decision to climb it, because agents just keep processing. Quality does not automatically follow volume up. The COO has to build the ratio into the scorecard so the comparison happens automatically, not after the fact.

**4. Upstream definitions change and downstream metrics do not.**

Dash, our analytics agent, reads the CCM-Stats sheet to report lead volume for each client account. The definition of what counted as a "lead" in that sheet changed once in the last quarter, when a client switched intake form configurations. Dash did not know the definition changed. The number kept flowing. The chart kept updating. The trend looked slightly different than the actual lead trend, for three weeks, until someone in a client call mentioned it.

In a hybrid operation, the agent is only as honest as the source it reads. When sources change their definitions, the agent does not notice. The COO has to build definition-audits into the operational calendar. Every metric on the scorecard should have a documented source and a documented definition, and both should be reviewed when anything in the source changes. This is not a technology problem. It is a governance habit.

**5. The scorecard stops being read as a system.**

Deloitte's 2026 State of AI research found that only 21% of enterprises have a mature governance model for agentic AI. The ones that do share a pattern: senior leadership reads the chart as a system, not as a collection of individual seat scores.

The failure mode is reading each row in isolation. Radar's briefing-compilation rate is green. Dash's portfolio coverage is green. Crystal's task-tracking completeness is green. All three rows are green and nobody noticed that the three seats are supposed to hand off to each other, and the handoff between Dash and Crystal broke two weeks ago. The individual rows looked fine. The chain was broken.

Throughput is a system property, not a seat property. The COO keeps it honest by reading the chart as a chain, not as a collection of independent scores. When a row's number looks right but the downstream seat's number is wrong, the diagnosis starts at the handoff between them, not at either seat in isolation.

## The cadence that keeps the numbers honest

I run three distinct checks on the scorecard. They happen at different frequencies and serve different purposes.

The daily check is Radar's briefing. Every morning the compiled output includes the numbers that moved overnight. I am not looking for optimization at this cadence. I am looking for anything that moved unexpectedly. A number that went up fast is as worth examining as one that went down.

The weekly check is the Monday meeting. We walk every row. The question for each row is the same: is the number telling us what we need to know about this seat's output? If someone says "yes but it is not capturing the full picture," that is a signal the metric needs to be revisited. Not after the meeting. On the agenda for the following week.

The quarterly check is metric definition review. Every metric on the chart gets a short audit: is the source still clean? Is the definition still what we wrote? Is the proxy still connected to the outcome? This is the check that catches the upstream-definition-changes problem before it runs for months undetected.

Three cadences, three different failure modes they address. The daily catches surprises. The weekly catches drift. The quarterly catches definition decay.

## What the COO is actually doing when they run these checks

The COO in a hybrid operation is not watching the agents. The agents are doing the work. The COO is watching the measurement system that interprets what the agents are doing.

That is a different job than the old coordination role. Bogdan does not need to follow up with Radar to make sure the briefing ran. Radar runs. What Bogdan needs to do is periodically ask whether the metrics Radar reports are still the right proxies for what we are trying to know.

This is the design-and-govern role the research describes. MIT CISR's maturity model tracks firms that reach Stage 4 maturity, where humans and agents operate together with shared accountability. The firms that get there are not the ones with the most agents. They are the ones where senior leadership stays actively engaged with whether the measurement system reflects the actual operation. The governance is what makes the scorecard trustworthy.

Accenture frames this as reinventing the process before you add the agent. The equivalent discipline on measurement is: define what honest looks like before you trust the number. The process and the metric have to be designed together, then maintained together as the operation evolves. An agent dropped into a well-defined process with a well-defined metric produces trustworthy throughput. An agent dropped into an ambiguous metric produces a number that looks like throughput and is not.

## The check that matters most

Of all the checks I run on the scorecard, the one that catches the most is the simplest.

When a row has been green for three consecutive weeks, I ask one question: what would have to be true downstream for this number to be producing real output?

For Dirk, that question is: are the proposals connected to Nick's prospecting output converting at a rate that reflects the quality of the initial contact? For Crystal, it is: are the tasks flagged as complete actually closed in the client's delivered work, or are they closed in Accelo without a corresponding delivery? For Tally, it is: are the KPI values it pushed this week sourced from data that updated this week, or is the source stale and Tally is pushing a stale number into a fresh timestamp?

These are not audits. They are sanity checks. They take five minutes. They are the difference between a COO who trusts the chart and a COO who has earned the right to trust it.

Earning the right to trust it is the job.

## See the live chart

Every seat on our scorecard is queryable from the OTP MCP, including the metric definition and the source for each KPI Tally pushes.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the KPI scorecard for sneeze-it and list the metric and source for each seat."*

Reading how each row is defined, not just what it reports, is the first step toward a scorecard you can actually trust.

---

*Series: The AI-Era COO. Part 28 of an in-progress series.*
