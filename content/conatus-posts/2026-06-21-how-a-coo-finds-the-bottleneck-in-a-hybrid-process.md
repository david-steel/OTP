---
title: The bottleneck in a hybrid process is almost never where the COO thinks it is
date: 2026-06-21
author: David Steel
slug: how-a-coo-finds-the-bottleneck-in-a-hybrid-process
type: founder_essay
status: published
series: ai-coo
series_part: 16
description: In a hybrid human-agent operation, bottlenecks hide at handoffs and show up as the wrong symptom. Here is the diagnostic the COO actually needs.
---

# The bottleneck in a hybrid process is almost never where the COO thinks it is

The work is piling up somewhere. You can feel it before you can see it.

Pipeline deals are stalling. Reports are coming in late. Client emails are sitting too long. The agents are running, the humans are busy, and the outcome is still not moving. Something is stuck. The question is where.

In a purely human operation, finding the bottleneck is uncomfortable but straightforward. You walk the process and ask people where they are waiting. The answers come fast because humans know when they are blocked. They complain about it.

In a hybrid operation, where humans and agents share the work, the diagnostic is different. Agents do not complain. They do not raise their hand when they are behind. They process what they can and queue the rest silently. The bottleneck does not announce itself. It shows up as a downstream symptom two steps away from the actual cause.

## The central claim

In a hybrid process, the bottleneck almost always lives at a handoff, not inside a step.

The work inside each individual step, whether an agent runs it or a human does, is usually the easy part. The agent has a defined input, a defined output, and it executes reliably. The human knows their piece of the job. The failure happens in the gap between them: work that exits one seat in a condition the next seat cannot use, or work that arrives at the wrong time, or work that never arrives at all because the handoff logic was never designed.

I learned this at Sneeze It when the pipeline was not moving. My first instinct was to look at Dirk, our sales pipeline agent. Dirk is the mid-funnel seat. If deals are not progressing, the progression agent must be the problem.

Dirk was not the problem. The problem was the handoff between Nick, our cold prospecting agent, and Dirk. Nick was delivering validated prospects to GHL, but the contact records were missing a field Dirk's pipeline logic needed to categorize them correctly. Dirk was receiving the work and not processing it, not because Dirk was broken, but because the input did not match the expected format. Nick's exit condition and Dirk's entry condition did not agree.

The bottleneck was in the gap. The symptom showed up two seats downstream.

## Five failure modes that look like bottlenecks but are not

Before you can find the real bottleneck, you have to rule out five things that generate the same symptoms without being the actual constraint.

**Stale data that looks like slow execution.** In our morning briefing, Radar compiles the operational picture from shared state files across the fleet. If one of those files has not updated in eighteen hours, the relevant seat looks idle. Stale data is not a performance problem. It is an infrastructure problem, and confusing the two sends you in the wrong direction.

**Activity without exit.** An agent can be running at full volume and producing zero usable output. Dash, our analytics agent, monitors forty-plus ad accounts every day. If the ad platform returns partial data, Dash still processes what it receives and posts a state file. The file exists. The coverage is incomplete. Activity is not throughput. You have to check what actually exited the step in usable condition.

**Human approval as the hidden queue.** Several agents at Sneeze It produce output that requires approval before anything moves. Nick drafts cold emails to Gmail. Dirk surfaces pipeline actions. Arin drafts coaching messages for the call center team. The agent's work is done the moment the draft exists. If the approval gate is slow, the pipeline looks stuck at the agent. The actual constraint is the gate.

**Missing escalation path.** Sometimes a step completes and the output has nowhere to go. The agent finishes the work, produces the right output, and the next seat in the sequence is not set up to receive it. The work exits one seat and lands nowhere. It accumulates in the gap silently.

**Volume outpacing run cadence.** Agents do not get visibly overwhelmed the way humans do. They process at the same rate and queue the rest silently. Pepper, our inbox agent, triages client email on manual run cycles. On a high-volume day, some emails wait for the next pass. That is a capacity design decision, not a performance failure. It looks like a bottleneck until you check the cadence.

## The diagnostic sequence

Start at the output, not the agent. What should be exiting the full process right now, and is it? If the output is not moving, you have confirmed there is a problem. You have not located it yet.

Walk backward from the last seat. Identify the most recent step where the work is confirmed clean. The bottleneck is somewhere between that step and where the output should have arrived. You have just cut the search space in half.

Check the handoff between the last clean step and the next one. Read the exit condition of the upstream seat and the entry condition of the downstream seat. Do they agree in format, in timing, in what fields are required? At Sneeze It, agents coordinate through structured messages in the agent-inbox files. When Dirk flags an exception for Bogdan, it goes in that inbox. If the inbox has unread messages that should have triggered downstream work and did not, that is the gap.

Check timestamps. When did the work enter the step? When did it exit? What was the lag? The log knows before anyone does.

Tally, our KPI agent, makes this visible at the portfolio level. Tally pushes numbers from each seat to the OTP scorecard four times a day. When a seat shows zero output for a period where output was expected, the bottleneck diagnostic starts. Tally does not find the bottleneck. It identifies which gap to investigate.

## What this looks like in practice

When Crystal, our project management agent, flagged a milestone three days out with no tasks assigned, my first instinct was to look at the delivery team. But the diagnostic starts with the handoff question, not the seat question.

Crystal's job is to monitor and flag. The flag worked. The breakdown was upstream: the milestone had been created in Accelo without the context the delivery lead needed to assign the right team member. The handoff between project creation and task assignment was missing a required field.

We added the field to the project creation template. The downstream assignment started working. The bottleneck was not in Crystal's seat or the delivery lead's seat. It was in the handoff logic between them.

## The pattern underneath all of it

Agents do not surface their own bottlenecks. Humans do, inconsistently. The handoff between them surfaces nothing, because no single seat owns the gap itself.

Each seat runs its job. The gap between seats has no owner. The gap is where the work dies, or slows, or arrives in the wrong shape.

Let agents carry the operational work so people are free for the work that matters. That sentence has a prerequisite: the handoffs have to be designed, not assumed. Agents run what they are handed. Humans respond to what they receive. The COO designs the structure that connects them.

Find the handoff. That is where the work stopped.

## See the live chart

The Sneeze It org chart, with every seat and every handoff, is queryable from the OTP MCP.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the Sneeze It org chart and list which seats hand off to which other seats."*

The chain of handoffs is the map of every place a bottleneck can hide.

---

*Series: The AI-Era COO. Part 16 of an in-progress series.*
