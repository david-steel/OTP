---
title: The CEO who cannot tell whether the agents are working has the same problem as the CEO who never checks on people
date: 2026-06-21
author: David Steel
slug: how-a-ceo-knows-the-agents-are-actually-working
type: founder_essay
status: published
series: ai-ceo
series_part: 34
description: Knowing your agents are actually working requires the same discipline as knowing your people are. One scorecard, named seats, business metrics. Here is what that looks like in practice.
---

# The CEO who cannot tell whether the agents are working has the same problem as the CEO who never checks on people

There is a version of this problem I see constantly.

A CEO tells me they have deployed several AI agents. They point to the tools. They name the vendors. They say something like "we have agents handling email, research, prospecting, and reporting now." When I ask how they know the agents are working, they go quiet.

Not because they think the agents are failing. They have no idea. The agents are running, which feels like working. But running and working are not the same thing.

## Before: the verification vacuum

Before I put every agent on a formal scorecard, I had the same problem.

Our agents felt active. Radar, our chief-of-staff agent, was producing briefings every morning. Dirk, our sales agent, was scanning the pipeline. Dash, our analytics agent, was running numbers. The system was busy. The logs were full. But I had no structured way to verify that what the agents were producing was moving the business.

The failure mode is not agents going dark. It is agents going sideways. They keep producing output. The output is plausible. Nobody flags it because plausible-looking output from a busy system feels like performance. Two months later you realize the briefings were accurate but not actionable, the pipeline scans were thorough but not finding the right signals, the analytics were detailed but nobody was changing decisions based on them.

This is the verification vacuum. The agents are running. You cannot tell whether they are working.

I did not fix this with better monitoring tools or more logs. I fixed it by deciding that I would manage agents exactly the way I manage people: one scorecard, named seats, business-outcome metrics reviewed on a fixed cadence.

## After: one chart, one scorecard, named seats

We run Sneeze It on a single org chart. Bogdan, our COO, has a named seat on that chart. So does Janine, who owns our accounting function. So does Kristen, our creative director. And on the same chart: Radar (chief of staff), Dirk (sales), Dash (analytics and advertising), Pulse (client retention), Pepper (email and inbox management), Crystal (project management), Arin (call center management), Nick (cold prospecting), Tally (scorecard integrity). Ten-plus seats occupied by agents, alongside the human seats, on one chart.

Every seat has one owner. Every owner has metrics tied to business outcomes, not to agent behavior. Dirk's row on the scorecard does not track "emails processed" or "pipeline records updated." It tracks qualified meetings booked per week, pipeline stage transitions, and cold outreach volume against a weekly target. Arin's row does not track "messages sent to callers." It tracks appointment rate against the 30% target we set for the call center, per caller, per project. Tally's row tracks whether the KPI scorecard contains current data. The metric is either fresh or it is not.

This is the critical shift. Before, the agents had output metrics. After, they have outcome metrics. Output metrics tell you the agent was busy. Outcome metrics tell you the agent was useful.

## The four signals that tell me the agents are working

When the scorecard is built on outcome metrics and reviewed at a fixed cadence, four signals emerge that give me genuine visibility.

**The number is where it should be.** When Dash's row shows the client ad performance data was pulled, processed, and flagged within the window, that row is green. When Tally's row shows every KPI on the chart was updated within the last 24 hours, that row is green. Green means the seat is performing. I do not need to dig into logs to verify this. The metric either moved or it did not.

**The number is not where it should be.** When a row drops, I treat it identically to how I treat a human's dropped row. I do not reach for the agent's configuration. I ask the seat's owner the same question I would ask a manager: what changed in the inputs, what changed in the process, and what is the fix. Deloitte's 2026 survey found that only 21% of enterprises have a mature governance model for agentic AI. The other 79% are running agents without a structured mechanism for catching exactly this. The scorecard is that mechanism.

**The row upstream is causing the row downstream to drop.** When Crystal's project management row shows a milestone tracking gap, and we trace it back to Dash not flagging a spend pattern that should have triggered a client conversation, we see the dependency on one chart. The upstream cause is visible because both seats are on the same surface. This is the conversation a split dashboard makes impossible.

**A row that used to exist is gone.** In April we retired Jeff, our former data integrity agent. The retirement happened through a formal process: a review of whether the seat was producing outcomes the business needed, an honest assessment that the capabilities had been absorbed by other seats, a structured handoff of the remaining work to Dash and Dirk. The row was removed from the chart. The work did not disappear. This is how you know an agent is no longer working: the seat is gone, its work is accounted for elsewhere, and the chart reflects reality. MIT CISR's research on "digital colleagues" is direct on this point. Human accountability must be non-negotiable. That means someone is always accountable for whether the agent's row is green, and for what happens when the seat is retired.

## What the weekly check actually looks like

Every week we walk the scorecard row by row. This takes roughly fifteen minutes because the agents publish their own numbers to the shared state. Radar writes to radar-latest.md. Dirk writes to dirk-latest.md. Dash writes to dash-latest.md. Arin writes to arin-latest.md. The scorecard reads those files and compiles the numbers. The fifteen-minute review is not a data-gathering exercise. It is a judgment exercise.

Is this number telling me what I think it is telling me? Is the trend moving in the right direction? Is the seat still the right shape for the work it is supposed to own?

McKinsey framed the shift clearly: managing in the age of AI means managing systems of people and agents together. The weekly scorecard walk is how you manage that system without it becoming invisible.

The check does not feel like monitoring technology. It feels like running a team. That is the point. The agents are not infrastructure you check the uptime on. They are seats with owners, metrics, and accountability. You do not inspect them. You manage them.

## What changes for the CEO

Before this structure existed, my relationship to the agents was passive. They ran. I noticed when something was obviously broken. I trusted output that felt plausible. This is the same mistake every CEO makes with unmeasured headcount: it is not that the people are failing, it is that you have no structured signal.

After, my relationship to the agents is active. Each seat has a metric I understand in business terms. Each metric is on the same chart as the human metrics. Each week I spend fifteen minutes looking at whether the numbers moved. When they did not, I have the same conversation I would have with any seat-owner on the chart.

Let agents carry the operational work, so people are free for the work that matters. That is the design principle. But the design only holds if you can actually verify the agents are carrying the work correctly. The scorecard is the verification mechanism. Without it, you are not running an AI-powered business. You are running a business with AI-shaped blind spots.

## See the live chart

You can query the current Sneeze It org chart, including every named agent seat and the metric each seat is accountable for, directly from the OTP MCP.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the sneeze-it org chart and list the accountability metric for each agent seat."*

You will see exactly what is on the scorecard, which seats are human and which are agents, and what metric each seat is accountable for. That is the live answer to whether the agents are working.
