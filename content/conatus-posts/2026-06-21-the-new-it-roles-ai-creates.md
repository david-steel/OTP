---
title: The IT org chart has a new column and most companies have not added it yet
date: 2026-06-21
author: David Steel
slug: the-new-it-roles-ai-creates
type: founder_essay
status: published
series: ai-cio
series_part: 33
description: AI agents create new IT roles that no job board lists yet. A decision tree for CIOs building the agent-ops layer before sprawl forces them to.
---

# The IT org chart has a new column and most companies have not added it yet

Most CIOs I talk to are asking the wrong question about staffing.

The question they are asking is: "Which IT jobs will AI eliminate?" The question they should be asking is: "Which IT jobs does AI create, and do I have a single person in that seat?"

These are not the same question. The first is about subtraction. The second is about architecture. And the second one is the one that determines whether your agent program compounds or collapses.

I run an agency called Sneeze It. We have roughly ten AI agents on one org chart, alongside humans like Bogdan (our COO), Janine (accounting), and Kristen (creative director). Each agent holds a named seat, one seat one owner, on one scorecard. Radar is our chief of staff. Dash runs analytics. Dirk owns sales pipeline. Pepper handles email triage. Crystal manages project delivery. Arin coaches the call center team. Tally pushes KPI values to the scorecard automatically. Nick runs cold prospecting. Pulse handles client retention intelligence.

What I have learned is that running this fleet required roles I did not expect to need, that no job board lists, and that most IT organizations have not created yet.

Here is the decision tree I use when figuring out whether a new IT role is genuinely necessary in an agent-powered org.

## The decision tree

**First branch: Does someone own the agent inventory?**

If the answer is no, stop here. This is the first role you need before any other.

Gartner, as reported by CIO.com, has named "agent sprawl" as the new shadow IT. Their research identifies a centralized agent inventory as step two of a six-step governance framework. When nobody owns the inventory, the org discovers agents the same way it discovered shadow IT in the 2010s: after something breaks, usually in a compliance audit.

The role: **Agent Inventory Manager.** Not a software category. Not a committee. One person accountable for knowing what agents exist, what they own, what systems they can touch, and whether each one is still earning its seat. At Sneeze It, this role sits inside operations. The inventory is not a spreadsheet. It is an active org chart with a row per agent, a seat definition, and metrics.

If you already have someone who owns this, move to the next branch.

**Second branch: Does someone manage agent performance vs. business outcomes?**

Most early agent programs measure runtime: tasks completed, tokens consumed, latency, uptime. These are infrastructure metrics. They measure the agent the way you measure a server. They do not measure whether the agent is producing business value.

The gap shows up quietly. An agent's runtime metrics look fine. The business outcome the agent is supposed to drive is flat or declining. Nobody connects the two because they are measured on different surfaces, in different cadences, by different people.

The role: **Agent Performance Analyst.** The person who translates agent output into business KPIs, puts those KPIs on the same scorecard as the human seats, and owns the weekly conversation about whether each agent seat is on target. At Sneeze It, Tally automates the KPI push so the number is always current. But Tally does not decide what the number means. That is a human judgment call. The Agent Performance Analyst makes that call.

At MIT CISR, verified research from Weill and Woerner (April 2026) uses the phrase "human accountability will be non-negotiable" when describing the governance of what they call digital colleagues. They are describing exactly this role. Someone accountable for the performance of each agent seat, the way a manager is accountable for a direct report.

If you have this role, move to the next branch.

**Third branch: Does someone govern agent lifecycle, including retirement?**

Agents do not naturally sunset. They accumulate. An agent deployed for a use case that no longer exists will keep running, consuming cost, and occasionally interfering with agents deployed after it, because nobody officially retired it.

Gartner's framework, as reported by CIO.com, includes "agent identity, permissions, and lifecycle" as step three. Lifecycle explicitly includes retiring redundant agents. This sounds obvious. It is almost universally missing.

The role: **Agent Lifecycle Owner.** The person who manages the full arc of each agent: provisioned, operating, under review, deprecated, retired. At Sneeze It, we held a formal retirement hearing for Jeff, our former data integrity agent, in April 2026. That was the first agent retirement in our org. The hearing established a precedent: no agent is retired without a structured conversation about what the seat owned and where those capabilities go. Jeff's capabilities redistributed across Dash and Dirk. The org chart updated. The scorecard row was removed.

That hearing required someone to run it. The Agent Lifecycle Owner is who runs it.

**Fourth branch: Does someone manage agent-to-agent coordination?**

Single agents are manageable. A fleet of agents that hand work to each other is a different architecture. The failure modes change. An agent can produce correct output that becomes incorrect input for the agent downstream. A coordination failure between two agents looks like an output problem from the second agent, when the actual root cause is a handoff problem between the first and second.

MIT CISR has an open research question, per their verified "Agents of Change" project, specifically asking "what governance mechanisms manage multiagent systems?" The question is still open because nobody has nailed the answer.

At Sneeze It, we handle this through an agent message bus. Agents coordinate through structured inbox files. Dirk checks whether a client is on Pulse's watch list before initiating expansion outreach. Bassim hands bottleneck findings to Neil for implementation. Crystal flags project risk to Radar before Radar compiles the morning briefing. The protocol exists. But someone has to own it, audit it, and fix it when the coordination breaks.

The role: **Agent Coordination Architect.** Not a title most org charts recognize yet. At smaller scale, this role is often absorbed by whoever built the agents. At enterprise scale, it cannot be. The coordination layer is where most fleet failures will originate over the next three years. The organization that has an owner for it will find and fix failures faster than the one that does not.

**Fifth branch: Does someone own agent literacy across departments?**

CIO.com, in their verified reporting on the changing IT mandate, lists "building agent literacy across departments" as one of the explicit roles that stays human as agents take over routine IT operations. This is the one branch that most IT organizations have thought about. It is the one where most of them have done the least.

Agent literacy is not AI training. It is not a two-hour workshop on how to write prompts. Agent literacy is the ability of a department to define what a seat should own, specify the metrics that seat is accountable for, and recognize when the agent in that seat is failing the role versus failing at a technical level.

The role: **Agent Literacy Lead.** The person who runs the program that brings every department to the point where they can be an intelligent client for the agent fleet. Not a champion. Not a center of excellence (a phrase that usually means committee with no accountability). One person accountable for whether the org can run agents without the IT team in the room.

## Why these roles do not exist yet

The reason most IT organizations have not created these roles is that they are thinking about AI agents the way they thought about software applications. You deploy an application. You maintain it. You upgrade it when needed. The organizational work is mostly technical.

Agents are not applications. They are seats. They hold accountabilities. They produce work that lands on a shared scorecard next to the work humans produce. Deloitte's 2026 survey of 3,235 enterprises found that only 21% have a mature governance model for agentic AI. The other 79% are deploying agents without the organizational architecture to govern them.

The roles above are that organizational architecture.

None of them require a large team. At Sneeze It, most of these responsibilities are held by one or two people, in some cases by a human-agent pair (a human who owns the accountability, an agent like Bassim that produces the maturity evaluation data the human acts on). The point is not headcount. The point is accountability. Every role I described requires a named seat, one owner, and a metric.

The advisory frameworks have arrived. Gartner names agent sprawl and publishes a six-step playbook. MIT CISR is writing the research. The academy, led by CMU's agentic AI modules at Heinz, is starting to teach students to build and govern individual agents.

What none of them has is a running operating system. Not a framework document. Not a curriculum. A live chart where every human and agent holds a named seat, one seat one owner, on one scorecard, with a lifecycle, a coordination protocol, and a learning loop.

The goal is straightforward. Let agents carry the operational work, so people are free for the work that matters. But that goal requires the five roles above before the agents can carry anything reliably.

The IT org chart has a new column. It belongs to agent operations. The CIOs who add that column now will not have to recover from sprawl later.

## See the live chart

The OTP MCP exposes the full Sneeze It org chart, including every agent seat and its current owner, metrics, and position relative to human seats.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to list every agent seat on the Sneeze It org chart and show me what role each one owns."*

You will see the five accountability types described in this post reflected in live named seats. That is what an agent operations layer looks like when it is running, not just recommended.
