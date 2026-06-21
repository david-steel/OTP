---
title: The ways COOs get agent operations wrong before they get them right
date: 2026-06-21
author: David Steel
slug: the-ways-coos-get-agent-operations-wrong
type: founder_essay
status: published
series: ai-coo
series_part: 45
description: The five failure modes COOs hit when deploying agents into operations, and the operational redesign pattern that fixes all of them.
---

# The ways COOs get agent operations wrong before they get them right

Most COOs I talk to are not failing to deploy agents. They are deploying agents successfully into the wrong things.

That is the diagnosis. One sentence. Everything else in this post unpacks it.

The promise of agents in operations is real. Less coordination overhead. Fewer dropped tasks. Accountability that runs while your humans are asleep. I have watched all of it come true at Sneeze It over the past eighteen months, and I have also watched every one of the failure modes below play out in our own work before we corrected them.

Here are the ways it goes wrong. Not hypothetically. Specifically.

## Failure one: agents are deployed to existing broken processes

The Accenture line that I keep coming back to is blunt: "don't make inefficiency run efficiently." I would extend it. Do not make a broken hand-off fast. Do not make an ambiguous role accountable. Do not give an agent a seat that has never had a clear owner.

The first instinct is to find the most manual, repetitive part of the operation and throw an agent at it. That instinct is partially right. The mistake is skipping the step where you figure out why the process is manual in the first place. Sometimes it is manual because nobody got around to automating it. Sometimes it is manual because it requires judgment calls that the team has not written down yet. Sometimes it is manual because the inputs are inconsistent and a human is quietly compensating every time.

If the last reason is true, you have not fixed the process by adding an agent. You have added a fast path to a bad outcome.

We rebuilt the process first every time an agent actually worked at Sneeze It. When Tally took over KPI publishing, we first agreed on what a valid KPI value looked like, wrote a source handler in the registry, and only then handed the task to Tally. When Arin took over call center management, we first defined what good daily coaching looked like, what data it had to include, and what the human approval step was. The agent inherited a designed process, not a salvage project.

Redesign the process. Then add the agent.

## Failure two: agents are hired for seats that have no owner

One seat, one owner. That principle sounds obvious until you are deploying your fourth agent and realize you have three seats that partially overlap with no one accountable when they conflict.

We retired Jeff, our former data integrity agent, in April after a formal hearing. His seat had fragmented across four missions that had already been absorbed by other agents. The missions existed. The gap they filled did not. He was producing numbers on a scorecard that was not attached to anything the business cared about. When I asked Jeff to defend his continued existence, he could not. He recommended his own retirement. We followed his recommendation.

That conversation only happened because we had a principle against overlap and a discipline for holding hearings. Without both, Jeff would still be running, consuming compute, and generating work that nobody needed.

The COO question before any agent deployment is: which existing seat does this agent fill, or which identified gap does it close? If the answer is "it does a bit of what three people do," that is not a seat. That is a task. Agents at the task level will drift. Agents at the seat level will compound.

## Failure three: agents are measured on runtime metrics instead of business outcomes

Gartner has framed agent sprawl as the new Shadow IT. I think the framing is right, and I think the measurement failure is what makes sprawl invisible. When your agent's KPI is "tasks completed per day" or "messages handled per hour," you do not see the sprawl. You see green numbers. The business sees nothing, because those numbers are not connected to anything the business sells.

Dash, our analytics agent, does not report "queries run per day." Dash reports qualified lead volume by client, cost per lead versus seven-day average, and spend pacing against monthly budget. Those are the numbers our clients pay us to track. The agent inherits the accountability of the seat.

Dirk, our sales agent, does not report "outreach sequences triggered." Dirk reports cold emails drafted per week, qualified meetings booked, and pipeline stage transitions. Same discipline. Business-outcome metrics, not runtime metrics.

When you can write the business outcome a seat is accountable for, you can deploy an agent into it. When you cannot write the outcome, you do not have a seat. You have a feature request that has not found a home yet.

## Failure four: the human-to-agent handoff has no quality gate

The handoff is where operations break. This is true for human-to-human handoffs. It is more true for human-to-agent and agent-to-human handoffs, because the failure mode is quieter.

A human who receives a bad handoff from another human usually says something. A system that receives a bad handoff from an agent usually processes it.

Pepper, our executive assistant agent, drafts responses to client emails. Every draft requires David's approval before it goes out. That is not a trust problem. That is a quality gate. The gate exists because Pepper's drafts are good but not infallible, and a client email sent with a wrong assumption costs more to fix than it costs to review.

Crystal, our project manager agent, flags delivery risks and milestone status from Accelo. Crystal publishes findings to a shared state file. Bogdan, our COO, reads the file and decides what to escalate. Crystal does not escalate directly to clients. The human reads the signal and decides the action.

The pattern is consistent: agent carries the operational work, human holds the exception gate. The gate is not optional. It is the thing that keeps the agent's speed from compounding an error into a crisis.

If your agent operations do not have explicit quality gates with named human owners, you do not have operations. You have automation running without guardrails.

## Failure five: agents work independently instead of coordinating

The most expensive version of agent sprawl is not one agent going off-script. It is two agents working at cross-purposes because neither knows what the other knows.

We have a formal protocol for this. It is called the agent message bus. Direct agent-to-agent communication via inbox files. No human in the loop for routine inter-agent coordination. Dirk, our sales agent, clears expansion plays with Pulse before contacting a client who might be at churn risk. Nick, our cold prospecting agent, checks against Dirk's outreach state file before approaching a prospect Dirk has already touched. Tally reads state files published by Crystal and other agents before pushing KPI values to the scorecard.

The coordination discipline is not a technical configuration. It is an organizational design decision. The same decision a COO makes when they decide which human seats have to coordinate before acting autonomously.

Deloitte's 2026 State of AI survey found only 21% of enterprises have a mature governance model for agentic AI. I would bet most of the other 79% have the coordination problem. Individual agents working fine. Agents together producing collisions nobody anticipated.

Design the coordination layer before you scale the fleet. After is too late.

## What the working version looks like

At Sneeze It, we have Radar running the daily briefing and coordinating across agents. We have Dash reading ad performance across Meta and Google and publishing to a shared state file before Radar compiles the morning report. We have Crystal tracking projects in Accelo, flagging risks, and writing to a state file that Bogdan and I read before deciding what to escalate. We have Arin managing the call center through Slack, with Janine handling accounting and billing on the human side, and Kristen holding the creative decisions that still require human taste.

The agents carry the operational work. The humans hold the exceptions, the judgment calls, and the conversations that compound relationships over time.

That division is not about trusting or not trusting agents. It is about designing an operation where every seat has a clear owner, every handoff has a quality gate, every agent measures business outcomes instead of runtime stats, and the whole fleet coordinates instead of colliding.

The COO who gets this right does not end up with fewer problems. They end up with problems that are visible, named, and fixable. That is a different category of operation than the one most teams are running.

## See the live chart

The Sneeze It agent operating model, including seat owners, KPIs, and coordination rules, is queryable from OTP MCP.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the Sneeze It org chart and identify which seats have named quality gates and which agent coordinates with which human."*

The structure you see is the operating model, not a diagram of one.
