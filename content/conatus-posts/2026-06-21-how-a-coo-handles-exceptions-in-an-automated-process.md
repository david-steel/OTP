---
title: Exceptions are where automated processes break, and the COO decides who catches them
date: 2026-06-21
author: David Steel
slug: how-a-coo-handles-exceptions-in-an-automated-process
type: founder_essay
status: published
series: ai-coo
series_part: 40
description: Agents run the standard case well. The COO designs what happens to the case the agent was never built to handle -- before it arrives.
---

# Exceptions are where automated processes break, and the COO decides who catches them

The standard case is not the problem.

An agent handles the standard case better than a human does. Faster, more consistently, without fatigue, without the variance that comes from a person having a bad Tuesday. The reason to put work on an agent is precisely because the standard case is repeatable and the agent does repeatable work without degrading.

The problem is everything else.

Every automated process has a boundary. Inside the boundary are the cases the process was designed for. Outside the boundary are the exceptions: the inputs that do not match the expected shape, the edge cases the SOP did not anticipate, the situations that require a judgment the agent cannot make. Those cases do not disappear because you automated the process. They arrive at the boundary and wait.

The COO's job is to decide, before the process goes live, what happens to the case the agent cannot handle. That decision determines whether exceptions get caught cleanly or disappear into the process and surface as problems three weeks later.

## The four ways an exception goes wrong

I have run into four failure modes for exceptions in an automated process. Each one is distinct, and each one has a different fix.

The first is the exception that passes through undetected. The agent processes it, produces output that looks correct, and moves on. The case was outside the designed scope, but nothing in the process caught it. The downstream seat acts on the output as if it were valid. By the time someone notices the problem, the bad output has already influenced decisions.

At Sneeze It, Dash is responsible for daily analysis of client advertising performance across Meta and Google. The process runs on accounts that Sneeze It manages. If a client migrates their account mid-month, the account identifier changes, and Dash's data pull returns zero spend for a client who is actively running campaigns. Nothing crashes. Dash reports zero spend, which looks like the campaign stopped. The briefing I read that morning flags the account as inactive. It is not inactive. The exception passed through and produced a false signal.

The fix was a reconciliation gate: Dash compares the active account list against the previous day's list before reporting. Any account that disappears overnight gets flagged for human review rather than reported as zero. The gate catches the exception before it becomes a false signal.

The second failure mode is the exception that triggers the wrong action. The agent recognizes something is different but applies the nearest rule rather than stopping. The rule is close enough to be plausible, wrong enough to cause damage.

Dirk, our pipeline agent, is authorized to write to our CRM for specific operations with explicit permission gates. One of those operations is updating opportunity stage. If a contact appears in the system in a way that matches a reactivation pattern, Dirk moves the opportunity through the pipeline. But not every contact who looks like a reactivation candidate is one. Some are clients who are already active under a different record. Applying the reactivation sequence to an active client is the wrong action. The case matched the pattern, but the agent applied the rule to the wrong situation.

The fix was a pre-check against the active client list before any pipeline action runs. Dirk coordinates with Pulse, our retention agent, through the agent message bus: a structured REQUEST to Pulse's inbox asking whether a contact is on the active client list, and a RESPONSE clearing or holding the action. No human in the middle. No ambiguity. The exception is caught by requiring a second seat to confirm the case before the action fires.

The third failure mode is the exception that reaches a human in a form that is impossible to act on. The agent recognizes it cannot handle the case and escalates, but the escalation carries no useful context. The human receives a flag with no information about what triggered it, what options exist, or what the urgency is. The escalation adds work rather than routing work.

When Pepper, our email agent, encounters a client email that does not fit the standard triage buckets, she surfaces it for my review. Early in Pepper's operation, that surface looked like: "flagged for review." One email address, no context about what the message said, no suggestion about what the response category might be, no indication of how time-sensitive it was. I was the exception handler, but I had less information than I would have had if I had read the email myself.

The fix was a structured escalation format. Every exception Pepper surfaces now includes: the sender and their client tier, a one-line summary of what the email is asking, the reason it did not fit the standard categories, and the two most likely response directions for me to choose between. I spend ten seconds reading a structured handoff instead of reopening the email from scratch. The exception still reaches a human. The human can act on it immediately.

The fourth failure mode is the exception the process handles correctly but that should have changed the process. The COO resolves the individual case but does not update the SOP. The same exception arrives next week. The COO resolves it again. The process has an untreated structural gap, but each exception is small enough that the gap stays invisible.

This is the most expensive failure mode because it has no ceiling. Every exception that the process handles one-off is an exception that will recur. The cost compounds in proportion to how often the case appears.

## What a well-designed exception protocol looks like

A process with good exception handling has three components, each of which has to be designed rather than discovered.

The first is a boundary definition. The SOP for the process specifies not only what the agent handles but what it does not handle. This sounds obvious. In practice, most SOPs describe the standard case and leave the exception handling implicit. The agent runs into an edge case and either passes it through or crashes, because the SOP never said what to do when the case falls outside the expected shape.

For Nick, our cold prospecting agent, the boundary is explicit: Health and Wellness only, multi-location businesses or single-location businesses with a strong regional presence, no food, no retail, no adjacent health categories outside the defined ICP. When Nick's discovery process surfaces a candidate that is borderline, the SOP says to stop at the boundary and drop the candidate rather than stretch the ICP to hit the volume target. The boundary definition means the exception never gets into the pipeline. It gets dropped at the gate.

The second component is a triage decision for each exception class. Not every exception goes to a human. Some exceptions should be silently dropped. Some should trigger a re-run with different parameters. Some should fire a flag in the morning briefing. Some require an immediate human decision. The COO decides which response matches which exception class, and that decision is written into the process before the process goes live.

Tally, who pushes KPI values from local sources to the OTP scorecard four times a day, has three exception classes. If the source file is missing, Tally skips that KPI and logs the miss without alerting anyone, because missing source files are transient and the next scheduled run will catch it. If more than half the KPIs fail in a single run, Tally fires a high-priority notification to me directly, because widespread failure suggests a systemic problem rather than a transient one. If a KPI value is outside a defined plausible range, Tally holds the push and flags it for manual verification before the number hits the scorecard. Three exception classes, three different responses, all defined in advance.

The third component is a feedback loop from exception to process. Every exception that required human intervention is a data point about where the process has a gap. The COO's job after handling an exception is not just to resolve the case. It is to ask whether the case should change the SOP.

Accenture puts this the right way: reinvent the process before automating it. But the honest version of that principle extends past the initial deployment. The process needs reinvention after the exceptions arrive, because the exceptions reveal what the pre-deployment design missed. The COO who treats every exception as a case to handle is doing the work. The COO who treats every exception as a signal about the process is building something that gets better.

## Who the exceptions belong to

The exception is not the agent's failure. The agent did exactly what it was built to do. It ran the standard case, hit its boundary, and surfaced what it could not handle.

The exception belongs to the COO.

McKinsey frames this as managing systems of people and agents together. The COO who owns the hybrid operating model owns both sides of that system, which means owning what the agents carry and owning what they cannot. The agents carry the operational work so that the humans are free for the work that matters. The exception handling is part of the work that matters. It requires judgment. It requires the ability to update the process based on a case the design did not anticipate. It belongs to the people on the hybrid chart who are there precisely because not everything fits a rule.

Bogdan, our COO, does not spend his day on work that Radar and Dash and Crystal can handle. He spends it on the cases those agents surface that require a human call. The exceptions are not overhead. They are the productive frontier of the hybrid operation, the edge where the agent fleet generates signal and the humans make decisions that make the fleet better.

That is the operating model. Let agents carry the standard case, so the people are free to handle what the standard case cannot reach.

## See the live chart

The exception routing and seat boundaries across our hybrid org are queryable from OTP MCP.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the org chart for sneeze-it and identify which seats handle escalations from agent seats."*

The response shows how exception routing is built into the seat structure itself, not handled as an afterthought.
