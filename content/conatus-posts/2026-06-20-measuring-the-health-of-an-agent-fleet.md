---
title: A silent agent is not a healthy agent. Here is how to tell the difference.
date: 2026-06-20
author: David Steel
slug: measuring-the-health-of-an-agent-fleet
type: founder_essay
status: published
series: ai-cio
series_part: 5
description: The five failure modes that kill agent fleets quietly, and the diagnostic signals that surface each one before the damage compounds.
---

# A silent agent is not a healthy agent. Here is how to tell the difference.

Most operators measure their agent fleet the wrong way.

They check whether the agents are running. They confirm that the workflows fire. They look at output volume, maybe latency, maybe token cost. They see green lights and call it healthy.

Then a client slips through a gap. Or a number stops moving. Or someone asks a question and nobody in the room can answer it because the agent that used to own that answer quietly stopped producing three weeks ago and nobody noticed.

The fleet was running. The fleet was not healthy.

These are different things, and most operators do not have a diagnostic system that separates them.

I run twelve active agents at Sneeze It. The question I have to answer every week is not "are they running?" It is "are they producing the outcomes the seat is accountable for, and is anything in the system degrading before it becomes visible?" This post is the diagnostic framework I actually use, organized around the five failure modes that kill agent fleets quietly.

## Failure Mode 1: The agent produces output, but not the outcome

This is the most common one and the hardest to catch.

Tally, our scorecard agent, pushes KPI values from local source files to the OTP chart four times a day on weekdays. If Tally is running, KPI values get pushed. But Tally can be running and still be failing if the values being pushed are stale, sourced from the wrong file, or not the number the seat actually needs on the chart.

The signal for this failure mode is: is the output connected to a decision? Not "did output happen" but "did someone look at the output and act on it, or did it land in a log nobody reads?"

Every agent at Sneeze It writes a shared state file. Radar reads those files during the morning briefing. If Dash's state file, which contains the daily ad performance scan, has not been read in 18 hours, Radar flags it. Not because Dash is broken. Because an unread output is an outcome that never arrived.

The fix is simple: every agent output needs a named reader with a named cadence. If you cannot identify who reads the output and when, the output is not producing an outcome.

## Failure Mode 2: The agent is right, but nobody trusts it

This one compounds over time.

When an agent produces a number that turns out to be wrong once, the humans around it start double-checking everything. They run parallel manual processes. The agent keeps running, the humans keep running alongside it, and the effective capacity of the system drops in half because everything is being done twice.

We had this with ad data at Sneeze It. Dash runs a daily scan across forty-plus Meta accounts and twenty-seven Google Ads accounts. When the data was occasionally wrong (usually because of an API version mismatch or a sourcing error), the team stopped trusting the output and started pulling numbers manually. Dash was running. Dash was not being used. The fleet had a trust deficit, not a technical failure.

The diagnostic signal here is: are humans running parallel manual checks on what an agent is supposed to own? If yes, you do not have an agent fleet. You have an agent fleet plus a shadow workforce undoing what the agents produce.

Trust is not rebuilt by telling people to trust the agent. It is rebuilt by fixing the root cause of every wrong output in public, updating the agent's state, and maintaining a clean track record for long enough that the parallel check stops feeling necessary. For Dash, this meant tracing every sourcing error to its cause, logging what changed, and holding the number accurate for sixty consecutive days before the team stopped double-checking.

## Failure Mode 3: The agent scope has drifted

Agents drift. The job they were defined to do in January is not always the job they are doing in June.

Dirk was originally designed around pipeline scanning. Over time, Dirk's reactivation logic expanded, the outreach state file grew, and the seat started pulling in work that belonged to other seats. Not because anyone made a bad decision. Because work flows to the agent that is already moving, and scope creep follows.

The signal for scope drift is: can you still write the agent's accountabilities in one sentence that matches what the agent actually does today? If the one-sentence version is two paragraphs, or if what you write does not match the spec file, the scope has drifted.

The fix is not always to pull scope back. Sometimes the drift was correct and the spec needs to update. But the diagnostic audit forces the question, and the question catches the cases where the drift was wrong before they compound into a fleet coordination problem.

At Sneeze It, Crystal owns project management and Accelo data. Dirk owns pipeline and revenue. Dash owns ad performance and call center numbers. When one of those agents starts producing output that belongs to a different seat, it creates reporting conflicts. Two agents describing the same number from different sources is not coverage. It is confusion. The scope audit finds this before the briefing starts contradicting itself.

## Failure Mode 4: The agent is solving a problem that no longer exists

This is the failure mode that produces the worst kind of waste: a perfectly functioning agent doing perfectly useless work.

Jeff, our former data integrity agent, fell into this. Jeff was built to monitor ad account status, flag spend anomalies, and reconcile Accelo budget data. By April of this year, Dash had absorbed the ad performance monitoring, Dirk had the spend anomaly logic, and Crystal was handling Accelo reconciliation. Jeff was running clean. Jeff was also redundant. The seat was costing overhead without producing differentiated value.

The diagnostic signal for this failure mode is: if this agent stopped running tomorrow, what would be the first outcome to degrade? If the answer is "nothing, because another agent covers it," the seat is a candidate for retirement.

We held a formal review. Jeff named the redundancies himself. The seat was retired, the capabilities were confirmed as already covered, and the fleet got leaner without losing anything. The agent fleet equivalent of healthy headcount management.

## Failure Mode 5: The agent is healthy but the handoff is broken

Individual agents can be functioning perfectly while the coordination layer between them fails.

Pepper owns email. Dirk owns outbound strategy. The workflow is: Dirk drafts the reactivation outreach, David approves, Pepper sends via Gmail. When Dirk's draft queue backs up or the approval step gets skipped, the email does not go out. Pepper is healthy. Dirk is healthy. The handoff is broken. The client does not hear from us.

The signal for broken handoffs is: are there outputs from one agent that are supposed to trigger inputs for another agent, and is that connection being verified? Not just assumed.

At Sneeze It, every inter-agent handoff has a downstream check. Arin posts call center coaching drafts that require David's approval before going to Slack. If drafts queue for more than 24 hours without being approved, that is a flag, not necessarily a failure. But if they disappear without a record of being approved or rejected, the handoff is broken.

The audit is: trace every agent output to its intended next step. If the next step cannot be verified, the handoff has no accountability owner and it will break again.

## What the weekly health check actually looks like

These five failure modes map to five questions I run through every week, usually on Friday.

First: is every agent's output being read by a named person on a named cadence? Second: are there any seats where parallel manual checks are running alongside the agent? Third: does every agent's one-sentence description still match what they actually do? Fourth: if each agent stopped running, what specifically degrades? Fifth: can I trace every inter-agent handoff to a verifiable downstream check?

This takes about twenty minutes when the system is healthy. It takes longer when something has drifted, which is exactly when it should take longer.

The goal is not zero failures. Agents fail. New failure modes appear as the fleet grows. The goal is catching failures before they become invisible, because invisible is the only failure mode that actually compounds into a business problem.

The fleet that lets agents carry the operational work so that people are free for the work that matters only functions if someone is watching the fleet. Not watching whether it runs. Watching whether it works.

## See the live chart

The OTP MCP exposes current agent seat definitions, ownership, and output cadences for the Sneeze It chart, so you can query which seats are active, what each one owns, and how they connect.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the agent seats on the sneeze-it chart and describe what each one is accountable for."*

You will see the seat definitions as they actually exist, not as they were planned, which is exactly the difference this post is about.
