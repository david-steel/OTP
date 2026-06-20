---
title: The operational risks that show up when agents run the line are not the ones you expected
date: 2026-06-20
author: David Steel
slug: operational-risk-when-agents-run-the-line
type: founder_essay
status: published
series: ai-coo
series_part: 4
description: The real risks when AI agents handle daily operations are not hallucinations or breakdowns. They are the invisible, structural kind that sneak up on you.
---

# The operational risks that show up when agents run the line are not the ones you expected

Most founders who start running agents on daily operations spend their first few months worried about the wrong things.

They worry about the agent making things up. They worry about a bad API call going sideways. They worry about the model "going rogue" on some edge case they did not anticipate.

Those things can happen. But they are not the risks that have actually hurt us at Sneeze It or that I have watched hurt other operators. The risks that bite are slower, quieter, and harder to see until they have already cost you something.

The central claim here is simple: when agents run the line, the operational risk is mostly structural, not technical. The agent will not usually blow up. It will quietly succeed at the wrong thing for weeks, and nobody will notice until the outcome gap shows up downstream.

Here are the four risks I have seen materialize, and what we did about each.

## 1. The agent succeeds at its task and misses its purpose

This is the most common one, and the hardest to catch.

An agent that is doing exactly what it was built to do can still be producing nothing that matters. The failure mode is a metrics mismatch, not a malfunction.

We lived through this early on. One of our first agents was completing hundreds of actions per week. The operational dashboard showed green. The business outcome it was supposed to serve was not moving. When I finally traced it, the agent's definition of "task complete" did not match what the task was actually for.

The fix was to stop measuring what the agent did and start measuring what changed because the agent did it. For Dash, our analytics agent, the relevant number is not "accounts scanned." It is "alerts surfaced that led to a decision." For Dirk, our sales agent, the relevant number is not "emails drafted." It is "meetings booked from agent-drafted outreach."

The task metric and the purpose metric are different metrics. If you only track the first one, the agent can look healthy while the line quietly erodes.

## 2. The silent-success problem: no output, no error, no flag

Agents can fail in a way that produces no error message and no visible symptom. They just stop being useful without announcing it.

A data source goes stale. An API credential rotates and the wrapper fails quietly. A condition the agent checks for never triggers, so the agent never fires. From the outside, everything looks operational because there are no errors in the log.

We built a rule at Sneeze It called the stale check. Every agent that writes a shared state file includes a timestamp. Any state file older than 18 hours gets flagged during the morning briefing, regardless of what the content says. If Radar compiles the briefing and Dash's file is 22 hours old, that is a warning, not a detail.

This rule exists because we had agents that were producing nothing useful for days before anyone noticed. The stale check is not sophisticated. It is a heartbeat test. But heartbeat tests catch the most expensive silent failures before they compound.

The underlying discipline is: every agent must do something provably observable on a known cadence. If an agent can plausibly do nothing for 48 hours with no alert, you do not have an operating agent. You have a dormant one.

## 3. Drift between seats when agents handle handoffs

Agents that coordinate with each other (or with humans) introduce a class of risk that is easy to miss until a real thing breaks.

The handoff is where responsibility blurs. One agent's output becomes another seat's input. When the output degrades or changes shape slightly, the receiving seat often absorbs it without flagging the problem. The signal decays across the chain.

Here is a live example. Dirk drafts outreach. Pepper is the sending engine. Dirk has a definition of what "ready to send" looks like. If Dirk's definition drifts (say, quality thresholds loosen after a rule change), Pepper will still send because Pepper's job is to send what Dirk produces. The degraded quality propagates through the chain before anyone sees it.

The fix is not to add more checks on the receiving end. It is to make the handoff explicit in the accountability chart. Dirk owns the quality of what he hands off. Pepper is not responsible for catching Dirk's drift. The human who manages Dirk's seat is responsible for reviewing the handoff quality on a cadence.

Accountability at the handoff has to live somewhere on the chart. If it does not, it lives nowhere, and drift accumulates.

## 4. The agent replaces human judgment, not just human labor

This is the risk that carries the most long-term cost, and the one most operators miss until it is too late to unwind cheaply.

Agents are good at operating inside defined parameters. They are not good at noticing when the parameters themselves have become wrong. That is a judgment call, and judgment calls require context that agents do not carry.

When agents run the line, the humans who used to run that line stop accumulating the intuition that came from running it. The daily friction of doing the work is where a lot of operational insight lives. When you remove the friction entirely, you also remove the signal.

We saw a version of this with Arin, our call center manager agent. Arin runs the data, drafts the coaching messages, monitors the appointment rate. That work used to require someone to actually look at the numbers every day. The person looking at the numbers every day was building pattern recognition as a byproduct. When the agent took that work over, the human pattern recognition stopped accumulating.

The answer is not to keep humans doing work agents can do better. The answer is to keep humans in the diagnostic conversation, not the operational one. Every week I review what Arin flagged and why. I am not re-doing Arin's work. I am exercising judgment about whether Arin's criteria are still the right ones. That is the distinction. Agents run the operation. Humans govern the criteria.

If you give up the governance conversation because the operations are running smoothly, you will eventually find yourself with an agent that is optimizing confidently for a goal that no longer serves you.

## The common thread

All four of these risks share a structure. The agent is not broken. The system around the agent is what failed: unclear success criteria, no heartbeat check, an unowned handoff, judgment replaced instead of supported.

The goal, when agents carry the operational work, is not to remove humans from the picture. It is to move humans from the line into the role that actually requires them. That means defining success at the outcome level, not the task level. It means building observable cadences so silence is never ambiguous. It means owning every handoff explicitly on the chart. And it means keeping a human in the criteria conversation even when the operation is humming.

The agents that run well at Sneeze It are not the most sophisticated ones. They are the ones where someone on the team is clear about what success actually looks like and is watching for the gap between task completion and purpose fulfillment.

That gap is where the risk lives.

## See the live chart

You can query the OTP org chart for Sneeze It to see which seats are agents, what their stated metrics are, and how their rows are organized relative to human seats.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the Sneeze It org chart and identify which agent seats have explicit handoff relationships with human seats."*

You will see how the accountability is structured across the hybrid chart, which is the first thing to get right before any of the risks in this post become manageable.
