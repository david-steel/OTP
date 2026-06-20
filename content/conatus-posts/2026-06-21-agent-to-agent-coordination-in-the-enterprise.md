---
title: Agent-to-agent coordination is not automatic. It has to be designed.
date: 2026-06-21
author: David Steel
slug: agent-to-agent-coordination-in-the-enterprise
type: founder_essay
status: published
series: ai-cio
series_part: 42
description: When a company runs dozens of AI agents, the hardest problem is not building them. It is getting them to coordinate without a human in the middle of every exchange.
---

# Agent-to-agent coordination is not automatic. It has to be designed.

Most conversations about AI agents inside a company focus on a single agent doing a single job. The sales agent. The customer support agent. The scheduling agent. One agent, one task, one evaluation.

That framing works for a pilot. It breaks down the moment you run more than a handful of agents in production, because real work does not stay inside a single seat. The sales agent needs the analytics agent to know whether a deal is worth pursuing. The call center agent needs the retention agent to know whether a client is at risk. The prospecting agent needs to know which accounts the pipeline agent already touched.

The question is not whether your agents need to coordinate. They do. The question is whether you design that coordination or let it happen by accident.

Most companies let it happen by accident. The result is what Gartner, as reported by CIO.com, calls agent sprawl: dozens of agents running disconnected in parallel, duplicating work, stepping on each other, with no inventory, no coordination layer, and no one accountable for the gaps between them.

The coordination problem is not technical at its root. It is organizational.

## Why agents do not coordinate naturally

Agents are built to execute their own mandate. A well-designed agent is focused, bounded, and good at the narrow thing it owns. That focus is what makes it useful. It is also what makes coordination hard.

When two agents share a boundary, the natural outcome is a gap, not a handoff. The email agent closes a thread it should have flagged for the sales agent. The analytics agent surfaces a pattern no one acts on because there is no structured channel to the seat that could act. The prospecting agent emails a company that the pipeline agent already has an active deal with, because neither knows what the other is working.

These are not failures of individual agents. They are failures of the system around the agents. The agents are doing exactly what they were built to do. The coordination layer was never designed.

## The lifecycle of a coordination failure

The lifecycle looks the same at most companies that try to run agents at scale.

Phase one: you build your first few agents. Each one operates well inside its own mandate. You notice the outputs are good but the connections between agents are missing. You solve it by having a human in the middle, reading both outputs and bridging the gap manually.

Phase two: you add more agents. The manual bridging starts to cost more than the agents are saving. The human in the middle becomes the bottleneck. You tell yourself you need better tooling, or a shared data layer, or some kind of message bus.

Phase three: without a designed coordination system, most organizations stall here. The agents keep running. The human stays in the middle. The value of the agent fleet plateaus because the coordination ceiling is a person's bandwidth.

Gartner, as reported by CIO.com, published a six-step framework for managing agent sprawl in April 2026. Step three specifically names agent lifecycle management, step five names monitoring agent behavior, and step six explicitly addresses balance between governance and empowerment. Those six steps are the right framing. They describe the coordination problem accurately.

But a framework tells you what to govern. It does not give you a running system. Every step still requires you to design and operate the coordination layer yourself.

## What designed coordination looks like in practice

At Sneeze It, we run around ten agents on one org chart. One seat, one owner is the rule. No seat does two jobs. No two seats do the same job.

The coordination is built into the architecture, not bolted on after the fact.

The first layer is explicit seat ownership. When Dash, our analytics agent, spots an anomaly in a client's ad account, it does not send a general alert into the void. It writes a structured output to a shared state file that Radar, our chief-of-staff agent, reads during the morning briefing. Radar is the orchestration seat. It reads all the shared state files, compiles the pattern, and surfaces the synthesis to me as a single structured briefing. The handoff from Dash to Radar is defined, not improvised.

The second layer is the agent message bus. We maintain a set of inbox files at a standard path, one per agent. When Dirk, our sales agent, wants to pursue an expansion play with an existing client, it cannot just act. It checks whether Pulse, our retention agent, has that client on a watch list. If Pulse does, Dirk's play is paused. Pulse always wins in a Dirk-Pulse conflict. That rule is written down. The agents coordinate through the inbox files without a human brokering every exchange.

The third layer is scope discipline. Pepper handles email. Crystal handles project management. Arin handles the call center. Nick handles cold prospecting. These are clean seats with clean boundaries. When the scope is clear, coordination is mostly about information passing rather than role negotiation. Clean seats reduce the surface area of potential conflicts.

Tally, our scorecard agent, is a good example of what the coordination layer enables. Tally does one thing: push KPI values from local sources to the OTP scorecard. It reads from the files other agents write to. It does not recompute analytics (that is Dash). It does not compile briefings (that is Radar). It does not chase down stale data. It trusts the other seats to write accurate files, and it does the narrow job of moving those numbers to the right place. That division of labor only works because each seat's output format is defined and stable enough for Tally to read without interpretation.

## What Jeff's retirement taught us about coordination

In April, we retired Jeff, the first agent we ever retired. Jeff was our data integrity agent. He ran across the fleet looking for anomalies, reconciling numbers, flagging gaps.

The retirement was not a failure of Jeff's individual work. The retirement was the outcome of a coordination design problem. Jeff's mandate overlapped with what Dash was already doing on the analytics side and what Crystal was starting to do on the project side. Three seats with partially overlapping mandates create coordination ambiguity. The agents do not know who owns what. The humans in the loop end up manually resolving the ambiguity every day.

The fix was not to improve Jeff. The fix was to clarify seat ownership, redistribute Jeff's specific capabilities to the seats that already owned those domains, and close the ambiguity. Jeff's retirement made the fleet's coordination cleaner.

This is the lifecycle frame for agent coordination: design the seats before you build the agents, keep the seat boundaries tight, and retire or restructure when overlap accumulates.

## The three signals that your coordination is failing

Most coordination failures do not announce themselves. They look like underperformance. A number is lower than expected. A task falls through a gap. A client does not get followed up with. By the time you trace the root cause to a coordination failure, you have already absorbed weeks of the gap.

The signals I watch for are:

A human spending time bridging two agents. If someone on the team is regularly translating one agent's output for another agent, that translation should be designed into the system. A human bridge is a coordination design debt.

Duplicate work across two seats. If two agents are touching the same data, the same client, or the same workflow in the same week, the seat boundaries are not clean enough. Designed coordination prevents redundancy.

An output that has no downstream consumer. If an agent is producing a report, a file, or an alert that no other agent or human reads, the coordination chain is broken. The output exists but the handoff does not. The mission line that drives the fleet is: let agents carry the operational work, so people are free for the work that matters. If an agent's output lands nowhere, that goal is not being met.

## What the CIO is actually responsible for

The Deloitte State of AI in the Enterprise 2026 study, based on more than 3,000 respondents, found that only 21% of enterprises have a mature governance model for agentic AI. The academic side is even quieter on this. MIT CISR has excellent open research on governing multiagent systems and designing decision rights for autonomous agents, but that research has not yet made it into formal CIO programs. The schools teach strategy, governance, and how to build one agent. The coordination operating layer is still untaught.

The CIO who inherits a fleet of agents without a coordination design is not managing an AI strategy. They are managing a set of disconnected processes that happen to involve AI. The fleet looks capable on paper and underdelivers in practice.

What the CIO actually owns, at the coordination layer, is three things. First: seat design, which means defining clean mandates before agents are built, not after. Second: handoff standards, which means specifying how agents pass information to each other and to humans, so those handoffs are reliable rather than improvised. Third: conflict resolution rules, which means deciding in advance which seat wins when mandates overlap, so agents do not require a human referee every time a boundary gets contested.

These are organizational design decisions. They happen to involve AI. But the failure mode they prevent is the same one that happens when human roles are badly designed: ambiguity, duplication, and gaps that cost the business without anyone being clearly accountable.

The technical work of building agents is easier every quarter. The organizational work of coordinating them scales with the number of seats, not with the sophistication of any individual model.

That is the CIO's job now.

## See the live chart

The full coordination structure of the Sneeze It fleet is queryable from OTP, including which agents feed which, how shared state is defined, and what the conflict resolution rules look like in practice.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the Sneeze It org chart and identify which agent seats have defined handoff relationships with other agent seats."*

What comes back is a live view of how agent-to-agent coordination is structured at the seat level, not just described in a document.
