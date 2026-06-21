---
title: Continuous improvement with agents is not faster cycles. It is a closed loop the COO has to build.
date: 2026-06-21
author: David Steel
slug: how-a-coo-runs-continuous-improvement-with-agents
type: founder_essay
status: published
series: ai-coo
series_part: 39
description: Agents generate an observation signal at every step. The COO who builds the feedback loop turns that signal into a better process every week.
---

# Continuous improvement with agents is not faster cycles. It is a closed loop the COO has to build.

Traditional continuous improvement runs quarterly. You audit the process, find the gaps, update the SOP, retrain the team. By the time the loop completes, the business has changed again and you are already behind.

Agents change the timing, but not automatically. The observation signal is there if you build the loop to capture it. Most COOs do not build the loop. They add agents, watch the throughput numbers improve, and declare the operation better. Six months later the process is drifting, because the improvement cycle still runs on its old quarterly rhythm and the agent has been quietly executing a process that no longer matches the business it is supposed to serve.

The COO's job in the agent era is to close the loop. Every agent execution is an observation. Every observation is data that either confirms the process is working or reveals that it needs to change. The COO who captures that data and acts on it has a continuous improvement engine. The one who does not has fast inefficiency.

## What agents give the COO that humans cannot

In a human-only operation, the improvement signal lives in people's heads. A team member finds a shortcut, tells one colleague, and never updates the SOP. The signal that the process needs changing is generated in execution but never reaches the person who can act on it. The quarterly audit goes looking for signals it missed. It finds some. It makes some changes. The cycle repeats.

Agents do not solve this by default. They just run faster and longer. But every agent execution produces a structured output. The output either matches what the process was designed to produce or it does not. The deviation is measurable and timestamped. It can be reviewed without a retro, without waiting for someone to surface it.

At Sneeze It, Dash runs every client's advertising data each morning and flags anomalies. Tally pushes KPI values to the scorecard four times a day. Each push is an observation: here is what the operation produced in this window. When Tally's pushes show a consistent gap between target and actual over multiple days, Bogdan has a signal that something structural is wrong.

The signal only closes the improvement loop if someone reviews the pattern and asks whether the process needs to change. Handling a flag is operations. Reviewing the pattern of flags and changing the underlying process is continuous improvement. Both require the COO. Only one actually improves anything.

## Three signals most COOs miss

I watch for three categories of agent-generated signal that never show up in a quarterly review.

The first is the handled exception. When Nick, our cold prospecting agent, routes a contact outside his normal process because something in the input did not match the expected pattern, that routing decision is a signal. The exception itself may be fine. The fact that it appeared means the process has a boundary the designer did not anticipate. Three exceptions of the same type is a pattern, not an edge case.

The second is the handoff that slows down. When Pepper, our email agent, drafts a response and approval takes two days instead of two hours, that is a signal. Not necessarily that Pepper drafted badly, but that the approval process has a gap. The latency data is available. In most hybrid operations, nobody watches it.

The third is the coordination message that should not need to exist. At Sneeze It, agents send structured messages to each other through inbox files. When Dirk, our sales agent, has to message Crystal, our project management agent, because a closed deal did not automatically create a project, that message is a process failure. Each inter-agent message that should not be necessary is evidence of a gap in the handoff design.

The COO who reads these three signal types and acts on them runs a real continuous improvement program. The COO who reads only the Monday scorecard runs quarterly reviews with better data.

## How to build the loop

The loop has four components. None of them exist by default.

Observation capture. Every agent needs to write its state and its flags to a shared file a human can read. At Sneeze It, Dash writes to dash-latest.md, Arin writes to arin-latest.md, Dirk writes to dirk-latest.md. The file captures what the agent did and what it flagged as anomalous. Without flag capture, the signal lives in logs nobody reads.

Pattern review. Once a week, Bogdan and I review flags across agents. Not individual flags. Patterns. Three exceptions of the same type from Nick. Pepper's approval latency trending up over two weeks. Arin's call center data showing the same agent missing speed-to-lead targets repeatedly. Patterns are continuous improvement inputs. Individual flags are operations.

Process redesign authority. The COO needs a clear mandate to change the process when a pattern reveals a gap. If that authority requires a meeting, a sign-off, and a changelog, the improvement cycle stays quarterly no matter how fast the agents run. The friction is what makes improvement slow, not the observation cadence.

Update propagation. When the process changes, the agents running that process need to know. This is where most improvement loops break down. The COO identifies the problem, makes the change in a doc, and the agent continues running the old version. At Sneeze It, process changes go into the reference files the agent reads. When Dirk's outreach process changes, the update goes into his rules file. The propagation step is what makes the improvement real rather than theoretical.

## What Accenture gets right and what it misses

Accenture's guidance on agentic AI is accurate: do not make inefficiency run efficiently. Fix the process before you add the agent. The pre-deployment process audit is a necessary gate.

What the framework does not address is what happens after the agent is running. The audit is one-time. Continuous improvement is permanent. Deloitte's 2026 State of AI in the Enterprise found that only 21 percent of organizations have a mature governance model for agentic AI. Most governance conversations are about controls: what the agent can do, what it cannot, who can override it. Controls without a feedback loop produce stable operations that never improve.

The COO who closes the loop is in the 21 percent. The one who sets governance and calls it done is in the 79.

## The improvement signal Jeff left behind

In April we retired Jeff, a data integrity agent who had been monitoring advertising account status across our client portfolio. The retirement followed a formal review. Jeff's scanner had gone stale, his false positive rate had climbed, and the capabilities that mattered had been absorbed by Dash.

What I remember is not the metrics. It is that Jeff's most valuable output was never his KPI. It was the one thing he caught that nobody else would have caught: a silent account migration that moved a client's data without triggering any alert in any system we had built. We read the flag, handled it, and moved on. We never built that signal type into how Dash monitors account status permanently.

That was a continuous improvement failure. The agent generated a signal the operation needed. The loop to capture it permanently was never built. When Jeff was retired, the capability went with him for weeks.

Every time an agent catches something unexpected, the COO has a choice: treat it as a one-time exception or build it into the permanent improvement loop. One-time exceptions accumulate. Built-in signals compound.

## Let agents carry the operational work, so people are free for the work that matters

The reason to run agents on the operational line is to free humans for work agents cannot do: judgment calls, relationship management, strategic decisions, exception handling that requires context no agent has.

At Sneeze It, Arin handles daily call center performance feedback. Radar compiles the morning briefing. Tally keeps the scorecard current. Janine is not spending her time on data collection. Bogdan is not spending his on status aggregation. What they do with that time is review patterns, redesign processes, and make judgment calls on cases that need a human.

That is the point. The improvement loop is what converts agent throughput into compounding operational quality. Without the loop, you have faster operations. With it, you have operations that actually get better.

The COO who builds the loop is not building infrastructure. She is building the mechanism by which the operation learns. That is the work the role was always about.

## See the live chart

Every agent seat described in this post holds a named row on the Sneeze It org chart, queryable from OTP's MCP server.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the seats on the Sneeze It org chart and identify which are agents versus humans."*

The chart is a live structure, not a screenshot, and every seat carries the same accountability fields regardless of whether the occupant is an agent or a person.
