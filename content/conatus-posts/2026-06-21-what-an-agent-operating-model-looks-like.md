---
title: An agent operating model is not a tool stack. It is an accountability system with agents in it.
date: 2026-06-21
author: David Steel
slug: what-an-agent-operating-model-looks-like
type: founder_essay
status: published
series: ai-coo
series_part: 14
description: What an agent operating model actually contains, how the pieces fit, and why accountability is the structure that makes the whole thing reliable.
---

# An agent operating model is not a tool stack. It is an accountability system with agents in it.

When most people say they are building an agent operating model, what they mean is they are adding agents to things they already do.

They put a summarization agent in their inbox flow. They connect an agent to their CRM to log calls. They wire an agent to Slack to post updates. The agents are real. They are doing things. But the collection of agents is not an operating model. It is a tool stack with a new layer on top.

The difference matters because tool stacks fail in a specific way. When something goes wrong, you do not know where. The inbox agent is running. The CRM agent is running. The Slack agent is running. But the sales pipeline has not moved in three weeks and nobody can explain why. The agents are fine. The system has no accountability structure. So the failure is invisible until it is not.

An agent operating model is something you build deliberately. It has components. The components fit together in a specific way. And the thing holding the structure together is not the software. It is accountability.

## The central claim

Every reliable agent operating model has the same four components: a redesigned process, a hybrid chart, a handoff protocol, and a quality loop. Remove any one of them and the fleet runs but does not produce. The COO's job is to build and own all four.

## Component one: the redesigned process

Accenture's framing on agentic AI is blunt: reinvent the process first, then infuse the agents. Their warning is "don't make inefficiency run efficiently."

That warning has teeth. If the process is broken before the agent takes it over, the agent executes the broken process reliably. The inefficiency scales. The agent does not notice it is broken. The agent does not push back. It just runs.

At Sneeze It, before Radar came online as our chief-of-staff agent, I redesigned the morning briefing process. The old version was a human ritual: pull five sources, format the output, decide what to flag, distribute. When I looked at it as a process design problem rather than a task, I had to answer questions the human version never forced me to answer. What is the briefing actually for? What should be in it and what should not? At what threshold does something get flagged versus reported? Who does the flag go to?

Those questions sound simple. They took two weeks to answer honestly.

Only after the process was defined could Radar execute it. And Radar executes it exactly as defined, every morning, without being reminded, without drift. That reliability comes from the process definition, not from the model powering the agent.

The COO who tries to put an agent on an undefined process will get an agent that produces unpredictable output. The COO who defines the process first gets an agent that produces consistent output. The redesign is the precondition, not the warmup.

## Component two: the hybrid chart

Once the process is defined, the work needs an owner. In a hybrid org, that means a chart with humans and agents on it together.

The organizing principle at Sneeze It is one seat, one owner. Every seat has a clear role, a clear metric, and a clear escalation path. The chart does not have a human section and an agent section. It has seats.

Radar holds the chief-of-staff seat. Dash holds the analytics seat, monitoring ad performance across forty-plus accounts. Tally holds the scorecard seat, pushing KPI values to the org chart four times a day. Crystal holds the project tracking seat in Accelo. Pepper holds the inbox triage seat. Arin holds the call center coaching seat. Dirk holds the sales pipeline seat. Nick holds the cold prospecting seat.

Bogdan holds the COO seat. Janine holds the accounting seat. Kristen holds the creative director seat.

The chart is not organized by whether the seat is human or agent. It is organized by what the seat is accountable for. That design decision is what makes the agents legible. When you look at the chart and ask "who owns pipeline hygiene," the answer is Dirk. The answer is not "we have an agent that does some pipeline things." It is Dirk, this seat, this metric, this escalation path when the metric moves wrong.

Deloitte's 2026 State of AI in the Enterprise study found that only 21% of organizations have a mature governance model for agentic AI. The survey covered 3,235 respondents. The common failure mode was not bad technology. It was senior leadership delegating agent governance to technical teams, which optimized for uptime and cost rather than for output accountability. The hybrid chart is how you prevent that. You put the agents on the accountability structure the business already uses, with the same discipline the human seats get.

## Component three: the handoff protocol

The most common place agent operating models break is not within a seat. It is between seats.

An agent executes its defined work and produces an output. That output needs to get to the next seat in the chain. If the handoff is not defined, the output lands somewhere ambiguous and the chain stalls. The agent reports success. The business outcome does not move.

At Sneeze It, agent-to-agent coordination runs through inbox files. Each agent has a file at a specific path. When Dirk needs Pepper to send an approved outreach email, Dirk does not Slack anyone. Dirk writes a structured message to Pepper's inbox file. The message has a type, a sender, a recipient, and a payload. Pepper reads the inbox, processes the request, and responds in the same protocol.

When Dash detects a spend anomaly and needs Radar to include it in the morning briefing, the same protocol handles it. When Bassim identifies a capability gap in the fleet and needs Neil to address it, same protocol.

The handoffs are defined. The formats are defined. The escalation paths are defined. Nobody needs to be the nervous system between agents because the protocol handles coordination.

McKinsey's framing is that managing in the age of AI means managing systems, people and agents together. The handoff protocol is what makes "together" mean something. Without it, you have a collection of agents executing their individual work in parallel but not in sequence. The chain never completes. The compound effect of the fleet never materializes.

## Component four: the quality loop

The fourth component is the one most operating models skip because it feels administrative until the day it is not.

Every seat in the fleet needs a quality check that runs regularly enough to catch drift before it causes damage. For agents, drift is silent. A human who starts producing bad output usually shows signs. The meetings get harder. The numbers slow down. People start working around them. An agent that drifts produces bad output at the same speed and with the same confidence as good output. The telemetry all looks fine. The actual output is wrong.

At Sneeze It, the quality loop has two layers. The first is the scorecard. Every seat's metric runs through Tally to the Monday review. When a number moves wrong, the conversation happens in the same weekly cadence every other number gets. The second layer is the correction loop: when David identifies a mistake in an agent's output, that correction becomes a learning captured in OTP and available to the whole fleet. Every correction is coordination intelligence. Corrections that never get captured are wasted lessons.

This is the same discipline good operations management has always applied to human performance. The difference is that agents need it applied more consistently, because agents do not self-correct from feedback the way experienced humans do. You have to build the loop into the operating model. It will not emerge on its own.

The MIT CISR maturity research on enterprise AI shows that Stage 4 firms, where agents are embedded in workflows delivering measurable results, run with a united top leadership team that actively shapes AI governance. The quality loop is a governance mechanism. It is how the COO maintains standards across a fleet that is executing work around the clock.

## Why accountability is the structure

These four components are not a recipe. They are an accountability system. The process redesign defines what good output looks like. The hybrid chart assigns ownership of producing it. The handoff protocol specifies how it moves between seats. The quality loop detects when it degrades and routes the fix to the right owner.

Pull any one of those out and the system loses accountability in a specific way. No redesign: the agent executes inefficiency reliably. No chart: the output has no owner and no standard. No handoff protocol: the chain breaks silently at boundaries. No quality loop: drift accumulates invisibly until the damage is visible.

The agents carry the operational work so people are free for the work that matters. That sentence is only true if the operating model underneath it is built to keep the agents reliable. The model is what makes the sentence true.

Jeff was a data integrity agent at Sneeze It. We retired him in April. The retirement came after a formal hearing, with evidence, with capabilities redistributed to other seats. What the hearing made clear was that Jeff's seat had never been fully defined. The process was underspecified. The metric was unclear. The handoff protocol with other agents was informal. The quality loop was inconsistent. Jeff failed not because the model failed. Jeff failed because the operating model underneath him was incomplete.

That is the failure mode the four components prevent. Not every individual agent succeeding. The system succeeding. The system is the operating model.

## See the live chart

The Sneeze It operating model, including which seats are human, which are agents, and what each seat is accountable for, is queryable from the OTP MCP.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the Sneeze It org chart and identify how the agent seats connect to each other and to the human seats."*

The chart is the operating model made concrete. The structure answers the question.

---

*Series: AI COO. Post 14 of an in-progress series.*
