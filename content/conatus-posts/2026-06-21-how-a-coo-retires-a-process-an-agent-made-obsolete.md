---
title: When the agent shows up, some processes should not survive the introduction
date: 2026-06-21
author: David Steel
slug: how-a-coo-retires-a-process-an-agent-made-obsolete
type: founder_essay
status: published
series: ai-coo
series_part: 23
description: How a COO spots the processes that agents make obsolete, and why retiring them is harder than adding the agent in the first place.
---

# When the agent shows up, some processes should not survive the introduction

The moment you add an AI agent to your operations, you learn something you did not expect to learn.

Not about the agent. About the process the agent is now running.

Specifically: some of those processes only existed because humans are slow, forgetful, and sequential. The agent is none of those things. And once a fast, consistent, non-forgetful entity takes over the work, certain steps in the process have no remaining justification. They were compensating for human constraints that are no longer present. The agent has made them obsolete.

The COO's job at this point is not to automate those steps. It is to retire them.

This is the skill I have had to build the most deliberately over the last two years at Sneeze It, and it is the one I see most operators skip entirely. They add the agent. The agent runs the process. The process still has four extra steps in it because nobody stopped to ask whether the process should still exist at its full original size. The agent makes inefficiency run efficiently, which is exactly what Accenture warns against. But there is a version of that failure that is more subtle: the agent makes obsolete steps run reliably, and because they run reliably, nobody questions them.

## The worked example: Tally and the weekly reconciliation

For the first several months of our agent buildout, Tally (our scorecard agent) and Dash (our analytics agent) both participated in a weekly reconciliation step. Someone would cross-check the numbers Tally was pushing to the OTP scorecard against the numbers Dash was reading from our ad platforms. Discrepancies got flagged and resolved.

This step made sense when the data sources were unreliable. In the early weeks, Dash had a bug in the way it read certain Google Ads metrics. Tally was pulling KPIs from files that agents wrote, and those files occasionally had formatting inconsistencies. The reconciliation caught real errors. It was the right process for the situation.

Then we fixed the underlying reliability problems. The Dash bug was resolved. The file formatting was standardized. The reconciliation started coming back clean, week after week.

The process kept running. Nobody retired it. Both agents dutifully executed the reconciliation, produced a report nobody read, and moved on to the next task. The step was now pure overhead, and because it was running automatically, it was invisible overhead.

The thing that made it visible was the unified scorecard. Tally's rows and Dash's rows sit on the same chart as Bogdan (our human COO) and Janine (our accounting lead). When I looked at what Tally was actually spending cycles on, the reconciliation step showed up as a regular activity with no downstream action connected to it. Nobody was acting on it because there was nothing to act on.

The right move was not to optimize the reconciliation. It was to retire it.

## What made the retirement harder than adding the agent

Retiring a process is harder than it sounds, for a specific reason: the process was created in response to a real problem. The problem is gone. But nobody updated the belief that the problem is still there.

We had a mental model of our data pipeline as unreliable. That model was accurate in month one. It was inaccurate in month four. But the reconciliation step was keeping the old model alive, because as long as the step exists, the implicit message is that the data pipeline needs checking.

When I retired the reconciliation, I had to do two things simultaneously. First, I had to verify, not assume, that the underlying problems were actually resolved. I ran a manual check on the data sources Tally and Dash were both reading from. I confirmed the numbers matched without the reconciliation. I logged that verification as the closure record. This is the part most operators skip. They assume the problem is gone and delete the step. Then the problem resurfaces three weeks later with no process to catch it.

Second, I had to update the mental model explicitly. Bogdan needed to know the step was gone and why. Not because Bogdan was running the reconciliation (he was not), but because the decision to retire a control process is a decision about acceptable risk, and the COO should not make that call silently. I told him what we had verified, what we had retired, and what would catch a data problem if one resurfaced in its place.

That conversation took ten minutes. Skipping it would have left a gap in shared understanding that would have surfaced later in a worse form.

## The three types of processes agents make obsolete

After two years of building and retiring processes alongside agents, the obsolete steps fall into three categories.

The first is the human-sequencing step. Humans work one thing at a time. So processes were built with queuing logic: this gets done, then that. When Radar (our chief-of-staff agent) took over the morning briefing, it pulled data from six sources simultaneously. The old process had them happening one after another, with a handoff between each, because that was the only way a human could manage it. Once Radar was running the briefing, the sequential structure was not just unnecessary. It was slowing Radar down. We retired the sequential handoffs and let Radar run all six in parallel. The briefing got faster by thirty minutes.

The second is the memory compensation step. Humans forget, so processes had check-ins, reminders, and status updates baked in. When Arin (our call center manager agent) took over performance tracking, the weekly manual check-in call between the previous human manager and the team existed partly to surface things that had been dropped. Arin does not drop things. The check-in still has a place for human judgment and relationship, but the data-retrieval purpose of it was obsolete the day Arin came online. We redesigned the check-in to focus on what Arin cannot do, which is the relational and motivational work, and retired the data-status portion entirely.

The third is the error-insurance step. Processes had approval gates, double-checks, and cross-verifications that existed because individual humans made individual errors. Some of those gates still matter, because individual agents also make individual errors. But some of them existed as insurance against a failure mode the agent does not have. Dirk (our sales agent) originally required human review of every cold outreach draft before it went into the Gmail queue. That gate was right when Dirk was new and unproven. Once Dirk had produced consistent, on-brief output across hundreds of drafts, the gate became insurance against a failure that had not materialized. We converted it to a spot-check cadence and retired the universal gate. The spot-check still runs. The blanket approval does not.

## How to know when a step is ready for retirement

The signal I look for is a step that produces an output, and nobody acts on that output. The reconciliation report nobody read. The status update nobody referenced. The approval gate where the reviewer said "looks good" without looking closely, because the output was always good.

When a step produces an output and the output is routinely ignored, the step is a candidate for retirement. The ignoring is information. It is the team's implicit judgment that the output does not carry signal worth acting on.

The COO's job is to make that implicit judgment explicit and then decide. Either the team is wrong to ignore the output, which means you need a conversation about why the step exists and what it is supposed to catch. Or the team is right to ignore it, which means the step has run its course and should be retired cleanly.

The Accenture principle here is exact: do not make inefficiency run efficiently. And the subtler version is: do not make obsolete processes run reliably. Reliability is not the same as necessity. An agent can run a useless step with perfect consistency. Consistency does not redeem the step.

## What the COO owns in this work

This is COO territory because process retirement requires the same authority as process creation. You are changing the operating model. You are accepting risk. You are updating the shared mental model of how the org produces its outcomes.

That is not IT work. It is not something Radar or Tally or Dash decides unilaterally. The agent may surface that a process step has no downstream action connected to it. The agent does not retire the step. The COO sees the signal, verifies the underlying problem is resolved, consults the humans whose mental model needs updating, and makes the call.

The agent message bus at Sneeze It (structured coordination between agent inboxes) gives agents a way to surface this kind of signal to each other and to the human seats on the chart. But surfacing a signal is different from making a structural decision. Bogdan (COO, human) makes the structural decisions about the operating model. The agents make the work visible enough for him to see the decisions that need making.

This is the COO role the agent era actually creates: not someone who manages the fleet, but someone who keeps the operating model calibrated to what the fleet has made possible. When agents arrive, some processes should not survive the introduction. The COO is the one who notices, verifies, and cleans up cleanly.

## See the live chart

The Sneeze It org chart, including which seats own which processes and where retirement decisions have been logged, is queryable from the OTP MCP.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the sneeze-it org chart and list the processes each seat owns."*

What you get back shows how one-seat-one-owner maps to live process ownership, which is where the retirement decision actually has to land to stick.

---

*Series: AI COO. Post 23 of an in-progress series. Read the full series at orgtp.com/blog.*
