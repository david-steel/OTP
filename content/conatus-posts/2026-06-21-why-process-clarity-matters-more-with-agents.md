---
title: Agents do not tolerate ambiguous processes. Humans do. That gap is why process clarity matters more now.
date: 2026-06-21
author: David Steel
slug: why-process-clarity-matters-more-with-agents
type: founder_essay
status: published
series: ai-coo
series_part: 38
description: Humans absorb process ambiguity through judgment and habit. Agents cannot. That asymmetry is why process clarity becomes a hard requirement, not a nice-to-have, the moment agents enter the line.
---

# Agents do not tolerate ambiguous processes. Humans do. That gap is why process clarity matters more now.

When humans run a process, ambiguity is survivable.

Not because ambiguity is good. It is not. Ambiguous processes waste time and produce inconsistent outputs. But humans can navigate ambiguity. They ask a colleague. They use judgment. They fill in the gap with context they have accumulated over months of doing the work.

Agents cannot do any of that. They execute what they are given. When the process is unclear, the agent either picks the wrong path confidently or stalls at the gap and waits. Both outcomes are worse than the human muddle-through they replaced.

This is the central claim of this post: process clarity was valuable before agents arrived. It becomes structurally necessary once they do. The same ambiguity a human team absorbed through informal coordination becomes a failure mode that runs at scale, continuously, without anyone flagging it, the moment an agent inherits the process.

## Why humans absorb ambiguity and agents cannot

Humans who run a process long enough develop what I would call gap-filling intelligence. They know what the rule is trying to accomplish, so when the situation is slightly outside the rule, they can infer the right call. They notice when something feels off. That noticing is itself a form of quality control that no written SOP produces explicitly.

When you move a step to an agent, the gap-filling intelligence does not transfer. What transfers is the documented process. If the documented process has ambiguity in it, the agent inherits the ambiguity without the intelligence that used to compensate for it.

Accenture frames this directly: "Don't make inefficiency run efficiently." A human who inherits an inefficient process can decide to route around the inefficiency. An agent that inherits one executes the inefficiency on every cycle, at whatever throughput the agent runs at, until someone notices and fixes the spec.

## What ambiguity looks like when an agent inherits it

We ran into this with Radar, our chief-of-staff agent that compiles the morning briefing at Sneeze It.

The briefing pulls from six data sources. When I designed the first version, I wrote the sources down and described roughly what Radar should pull from each one. What I did not write were clear rules for what to do when a source was stale. When is the data too old to include? Should Radar flag the gap and continue, or halt and escalate?

I had not written those rules because the human who previously compiled the briefing would have used judgment. Stale data is stale data. You know it when you see it.

Radar did not know it. The first briefing included eighteen-hour-old performance data without flagging it, because the process said "pull from X source" and the source had data in it. The fix was not a better agent. The fix was a clearer process: any source more than eighteen hours old gets named in a Warnings section. The intuition is now written down.

## The asymmetry compounds across a fleet

A single agent inheriting an ambiguous process is a manageable problem. The scale problem is what happens when you have ten of them.

At Sneeze It, Radar reads what Dash publishes before compiling the briefing. Dirk coordinates with Pulse before contacting a client, because Pulse has final say when a client is in a downside period. Nick skips any brand Dirk has touched in the last thirty days to prevent double contact. Tally reads files that other agents write and pushes numbers to the org chart four times a day. Bogdan, our human COO, sits above the fleet and holds the judgment calls that require company-level authority.

If any one of those handoffs has ambiguity in it, the ambiguity does not stay contained. Radar publishes stale numbers without knowing they are stale. Dirk contacts a client Pulse flagged because the coordination rule was unclear about which cases required clearance. Nick sends to a brand Dirk is mid-sequence with because the skip rule did not define "touched" precisely enough.

Each of those failures happened once in early versions of the fleet. Each was traceable to a handoff with ambiguity in it. The fix in every case was the same: write down the rule precisely enough that the agent does not have to infer it.

The agent message bus, the coordination layer agents use to pass structured requests between inboxes, amplifies this in both directions. When Dirk needs clearance from Pulse on a client, it writes a request to Pulse's inbox. Pulse applies its retention rules and writes back. No human in the middle. But this only works when both agents have a clear enough process to know what question to ask and what criteria to apply to the answer. Coordination infrastructure does not substitute for process clarity.

## What the COO has to do before the agent arrives

The practical consequence is that the COO now has a pre-deployment obligation that did not exist before.

Before handing a process to an agent, the COO has to make the implicit explicit. Every step that a human executed through intuition has to be written as a rule. Every edge case a human would have escalated by recognizing it has to be defined as an escalation trigger. Every handoff a human navigated through a quick conversation has to be specified as a structured interface.

MIT CISR's enterprise AI maturity research shows that the firms achieving the highest performance outcomes are not the ones with the best models. They are the firms where leadership has done the foundational work of aligning on what the AI is supposed to produce and how that connects to outcomes. Process clarity is not a technical gap. It is a leadership gap that shows up as a technical symptom.

Deloitte's 2026 State of AI survey, which covered 3,235 enterprises, found that only 21 percent have a mature governance model for agentic AI. That number suggests most organizations are deploying agents into processes that have not been made agent-ready. The gap-filling intelligence that used to compensate for ambiguity is no longer in the seat.

When we retired Jeff, a former data-integrity agent, through a formal hearing in April, the post-mortem was clarifying. Jeff's failures were not model failures. They were process-clarity failures. The human who had held similar responsibilities before Jeff was compensating for the same ambiguity Jeff could not compensate for. We retired the compensation mechanism without fixing the underlying problem first. That lesson is now part of how every seat at Sneeze It goes live: process clarity is met before deployment, not discovered through failure after.

Let agents carry the operational work. That is the efficiency the fleet creates, and it is what frees the people on your team for the work that actually requires them. But agents can only carry that work reliably if the process is clear enough to carry. The COO's job, before the agent arrives, is to make it so.

## See the live chart

Our hybrid chart, with human and agent seats holding named accountability under one scorecard, is queryable from the OTP MCP server.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the org chart for sneeze-it and list which seats are agents versus humans."*

The structure you get back is process clarity made visible -- the same discipline that prevents one agent's ambiguity from becoming another agent's failure.
