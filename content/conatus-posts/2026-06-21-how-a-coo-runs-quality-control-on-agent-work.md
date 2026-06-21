---
title: Quality control on agent work is the COO's job, and it looks nothing like QA on human work
date: 2026-06-21
author: David Steel
slug: how-a-coo-runs-quality-control-on-agent-work
type: founder_essay
status: published
series: ai-coo
series_part: 19
description: Agents don't have bad days, but they do drift. The COO who catches drift early does it through lifecycle checkpoints, not random audits.
---

# Quality control on agent work is the COO's job, and it looks nothing like QA on human work

The failure mode nobody warns you about is not the agent that crashes. It is the agent that keeps running, confidently, while the output quietly degrades.

A human on the operational line gives you signals when something is wrong. They get quiet. They ask more questions. They flag the weird case instead of pushing it through. An agent gives you none of those signals. It processes the input, produces output that looks correct, and moves on. By the time you notice the degradation, it has been running for weeks and you have no clean line on when it started.

Quality control on agent work is not optional. It is the COO's job. And it requires a different approach than QA on human work, because the failure modes are different, the signals are different, and the corrective loop is different.

## The lifecycle frame matters here

There is a useful way to think about quality control on agent work: as something that runs across the full lifecycle of a seat, not as a checkpoint you visit once after deployment.

Before a process goes to an agent, the COO has to be honest about whether the process itself is clean. Accenture puts this plainly: do not make inefficiency run efficiently. A broken process handed to an agent runs at scale, which means the errors also run at scale. The first quality gate is not about the agent. It is about the process the agent is about to inherit.

At deployment, the COO sets the output standard and the measurement method. Not "the agent should do X well" but "we will know the agent is doing X well when the following number is within the following range." This is not a technical spec. It is an accountability decision, the same kind Bogdan makes when he puts a new process into the human side of our operations at Sneeze It.

During operation, the COO runs periodic checkpoint reviews. After operation ends or a seat is retired, the COO does a post-mortem on what the agent got right and what drifted. Every one of those phases has a different quality question attached to it.

Most operators only think about QC during operation, after something has already gone wrong. That is the expensive version.

## What agent drift actually looks like

Drift is the quiet failure. It is not the agent refusing to run. It is the agent running in a way that no longer matches the standard you set at deployment.

At Sneeze It, Dash runs daily analysis across our client advertising accounts and the call center. The output standard is precise: compare today's numbers to yesterday, the seven-day average, and the thirty-day average, use the median for our top-tier clients, flag outliers rather than averages, and include timestamps on all data. That standard is written down. It was set when the seat was designed.

Drift would look like Dash starting to report in a format that varies from run to run, or summarizing averages when the standard says to flag outliers, or producing a report that is technically correct but no longer structured in a way that Radar, our chief-of-staff agent, can read reliably in the morning briefing. None of those failures would crash anything. All of them would quietly erode the quality of the briefing David reads every morning.

The COO's job is to catch that before it compounds. The way to catch it is to have a checkpoint, not an audit.

## Checkpoints versus audits

An audit is reactive. Something looks wrong, so you go look at a bunch of output and try to find the pattern. An audit is expensive, slow, and usually catches the problem three weeks after it started.

A checkpoint is proactive. You define, at deployment, what you are going to verify and when. You build the checkpoint into the operating cadence. You look at a small, targeted sample on a fixed schedule and compare it against the written standard. If the sample is clean, you move on. If it drifts, you have an early signal.

For most of our agents, the checkpoint is weekly. Tally, who pushes KPI values from our local sources to the OTP scorecard four times a day on weekdays, gets a Friday checkpoint where we verify that the values it pushed match what our source files actually contain. The check takes less than five minutes. It has caught two drift events since Tally was deployed, both of them minor, both of them corrected before they reached the scorecard that David and Bogdan read.

For agents with higher-stakes outputs, the checkpoint runs more frequently. Pepper, who triages David's inbox and drafts client email responses, has a checkpoint built into every run: the drafts go to David for approval before anything is sent. That is not a trust problem. It is a quality gate. The output standard for client communication is high enough that the cost of a bad draft reaching a client is higher than the cost of a five-second review. The checkpoint is calibrated to the stakes.

## The three questions every checkpoint answers

A useful checkpoint answers exactly three questions. It does not try to evaluate everything the agent did. It looks at the right three things.

First: is the output in the expected format? Agents that have been running for several weeks sometimes produce output that has drifted structurally even when the content is correct. Arin, who manages our call center team through daily Slack messages, has a fixed format for coaching messages: wins first, specific improvements second, tone that sounds like David. A checkpoint on Arin's output verifies the structure before verifying the content, because a structural drift is both easier to detect and easier to fix.

Second: are the numbers anchoring to the right baseline? This is the most common quality failure I see in agent work. The agent produces a number, but the number is compared against the wrong reference point. Dash compares daily spend to a rolling baseline. If the baseline drifts (because the agent started pulling the wrong time window, or because the data source changed), every downstream comparison is off. The checkpoint for Dash verifies the baseline, not just the output.

Third: is the output reaching the next seat cleanly? Most of our agents do not work alone. Their output is the input for another seat. Radar reads Dash's output. Crystal reads Radar's output. Nick's cold prospect drafts go into Gmail for David to approve and send. The quality of that handoff is as important as the quality of the output itself. A checkpoint that only looks at what an agent produced and not at how it was received by the next seat in the chain is missing half the picture.

## When the checkpoint fails

When a checkpoint surfaces a quality problem, the response is not to retrain the agent or rebuild the process. The first response is to look at the input.

Most agent quality failures trace to an input problem, not an output problem. The agent ran correctly on bad data, or ran correctly on inputs that no longer matched the SOP, or ran correctly on a task definition that had quietly shifted from what it was at deployment.

When Nick, our cold prospecting agent, started producing drafts that drifted from the Kennedy-pattern framework we use for outreach, the first question was not "what is wrong with Nick." The question was "did the input change." In that case the answer was that the prospect list had started including out-of-ICP leads from a changed discovery source. The agent ran correctly. The input was wrong. The fix was upstream, not in the agent.

This matters for how the COO approaches the corrective conversation. The corrective loop for an agent quality failure looks like a process failure, not a performance failure. You trace the input chain, find where the drift entered, and fix it there. The agent does not need coaching. The process needs tightening.

## The accountability structure that makes QC work

Quality control on agent work only works if accountability is unambiguous. One seat, one owner. If two agents share accountability for a process, no checkpoint will tell you which one drifted. If the output standard was never written down, the checkpoint has nothing to compare against.

At Sneeze It, every seat on our hybrid chart has a named output standard and a named checkpoint cadence before it goes live. That standard is the COO's decision, not the agent's. The agent runs what the process requires. The COO decides what good looks like, writes it down, and owns the checkpoint that verifies it.

Deloitte's 2026 State of AI survey found that only 21% of enterprises have a mature governance model for agentic AI. The gap between that 21% and the rest is not primarily a technology gap. It is an accountability gap. The enterprises with mature governance have someone who owns what good looks like and checks it on a cadence. The others have deployed agents and hoped.

The COO is the natural owner of that accountability. Not because they built the agent, but because they own the process the agent is running. The output standard for an agent seat is an operational decision. The checkpoint cadence is an operational cadence. The corrective loop when drift appears is an operational response. All of it belongs in the COO's seat.

## The retired seat teaches you something about QC

Jeff, a data integrity agent we retired in April after a formal hearing, failed a quality checkpoint in a specific way that is worth naming. His output looked right. The format was correct. The cadence was maintained. But the numbers he was producing had stopped connecting to the business outcomes the seat was created to serve. His scanner was running. The signal was stale.

That failure taught us something about what quality control misses if it only looks at format and frequency. A seat can produce clean output on a dead signal. The hardest quality check is the one that asks whether the work the agent is doing still matters, not just whether it is doing the work correctly.

We now include that question in every quarterly seat review: is this seat still solving the problem it was built for? That is not a question about agent performance. It is a question about process relevance. The COO has to ask it, because nobody else will.

## See the live chart

Every agent seat at Sneeze It, including its output standard and checkpoint cadence, is queryable from OTP MCP.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the seats on the Sneeze It chart and their accountability structure."*

The response shows you not just who holds each seat but what the seat is accountable for producing, which is the raw material of quality control.

---

*Series: AI-Era COO. Part 19 of an in-progress series.*
