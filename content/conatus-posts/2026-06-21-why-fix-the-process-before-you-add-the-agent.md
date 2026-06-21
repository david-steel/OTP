---
title: Fix the process before you add the agent. The COO is the one who has to say it.
date: 2026-06-21
author: David Steel
slug: why-fix-the-process-before-you-add-the-agent
type: founder_essay
status: published
series: ai-coo
series_part: 8
description: The COO owns process redesign before agent deployment. Here are the four failure modes that show up when you skip it, and what the fix looks like at Sneeze It.
---

# Fix the process before you add the agent. The COO is the one who has to say it.

Nobody in the building wants to hear that the process needs to be redesigned before the agent goes in. The CEO wants the agent running. The team wants the headcount problem solved. The vendor wants the deal closed. The COO is the one who has to slow the room down and say: the process is broken. Adding an agent to it will not fix it. It will run it faster.

That is the core claim. Fix the process before you add the agent, or you will pay to automate your own dysfunction.

Accenture put the same principle in their AI operating model work: do not make inefficiency run efficiently. I have not found a cleaner way to say it. But I have found a longer list of ways to learn it the hard way.

## Why the COO is the natural owner of this

The CEO sees the outcome. The CIO owns the tooling. The CFO watches the cost. The COO is the only seat in the building with a full view of how the work actually moves from trigger to result. Every hand-off, every approval gate, every status check, every moment where work sits in a queue waiting for the next human to pick it up.

That full-process view is exactly what you need before you drop an agent into the middle of it. Without that view, you guess. You put the agent at the step that looks busiest instead of the step that is actually the constraint. You automate a hand-off that should not exist. You add throughput to a stage that is not the bottleneck, and the bottleneck does not move.

The COO already has the map. The COO's job becomes: read the map before you build the agent, not after.

## The four failure modes I have lived through

At Sneeze It, we have been running a hybrid operating model for roughly eighteen months. Humans on some seats, agents on others, one scorecard, one owner per seat, everyone on the same accountability chart. The model works well now. The path to "works well now" included enough mistakes that I can name the failure modes by category.

**Failure Mode 1: Automating the workaround.**

Every process that has been running for more than a year has workarounds baked into it. The workarounds exist because someone got burned once and added a step. That step became permanent. That permanent step became the process.

When you add an agent to a process full of workarounds, the agent faithfully executes the workarounds. It does the redundant check. It sends the confirmation email that exists only because a human forgot to send it once in 2023. It routes the approval through three people because the original process did not trust any one person to decide.

The agent is not adding value at those steps. It is adding speed and cost to friction that should have been cut.

Before we built Pepper, our email triage agent, the process for handling client emails had six steps. Two of those steps were humans confirming to each other that a thing had been received. The steps existed because emails had been lost. We added an agent to the six-step process and watched it dutifully run all six steps, including the two confirmation steps that served no purpose once the agent was logging every action automatically.

We caught it. But we caught it three weeks in, not before we built it.

The fix: map the process before you write a single line of agent spec. For each step, ask whether the step exists because the work requires it, or because a human limitation required it. Agent limitations are different. The step list is different.

**Failure Mode 2: The agent inherits a metric that the process outgrew.**

We gave our analytics agent Dash a set of metrics to track and report on. The metrics were the ones we had been tracking manually. They were fine metrics for a human running them weekly. When Dash ran them daily, we discovered that half of them were lagging indicators we were using as proxies because the direct measurement was too slow to do manually.

Dash could measure the direct indicators. We were measuring proxies because they were easier to produce at human speed. The proxy metrics stayed in the spec because we copied them from the manual process.

This matters because an agent optimized against a proxy metric will drift toward the proxy and away from the outcome. The metric looked fine. The outcome it was supposed to approximate did not move.

Fix the measurement before you hand it to the agent. The agent will hit whatever number you give it.

**Failure Mode 3: The hand-off exists to compensate for human memory, not because the work requires a transition.**

Radar, our chief-of-staff agent, coordinates information across the team. Before Radar existed, there was a daily check-in where three humans reported their status to each other so nobody lost the thread. The check-in was not a decision-making forum. It was a memory-sharing forum. The humans needed to sync because no single person held all the context.

Our first instinct was to have Radar facilitate the check-in. Same meeting, same agenda, agent as facilitator.

The meeting should not have existed. Radar holds all the context. The hand-off that existed to solve human memory was a waste of everyone's time once Radar was in the system.

We cut the check-in. The meetings that survived were the ones where actual decisions happen.

If a hand-off exists because a human could not hold the thread, an agent can hold the thread and the hand-off goes away. If a hand-off exists because the work actually transfers between owners, it stays.

**Failure Mode 4: The approval gate solves for trust you already have.**

Nick, our cold prospecting agent, went through several iterations of an approval process before I realized I was making him ask permission for things I already trusted him to do. The approval gate was there because we had not yet established whether Nick could hold the quality bar on his own.

Once we verified that he could, the gate became friction. He was still routing drafts for review on work where the review was adding no signal. I was approving things automatically. The approval process existed because I had not updated the trust level.

In a hybrid operating model, approval gates have to be tied to trust levels, not just process steps. When the trust level changes, the gate changes. If it does not, you are adding a human touch point to every step even after the human has nothing to add.

## What the redesign actually looks like

When I am evaluating whether a process is ready for an agent, I run through four questions in order.

First: does this process have steps that exist because of human cognitive limits? Memory, attention, the need to hand off because one person could not track it all? If yes, which of those steps can be cut once an agent holds the context?

Second: what is the actual output this process is supposed to produce, and is that what we are currently measuring? If the measurement is a proxy, fix the measurement before the agent inherits it.

Third: where do hand-offs happen, and does each hand-off represent a genuine change of ownership, or a change of memory? Ownership hand-offs stay. Memory hand-offs go.

Fourth: what is the current trust level on each decision point, and does the approval gate reflect that trust level? Outdated gates slow down work that has already been validated.

After that exercise, the process that goes into the agent spec is the redesigned one, not the original.

## The hybrid chart is where the redesigned process lands

At Sneeze It, every agent seat on the accountability chart owns a specific piece of the redesigned process. Tally pushes KPI values to the scorecard on a fixed schedule. Crystal tracks project status in Accelo and flags delivery risk. Arin coaches the call center team with data pulled directly from CCM. Bogdan, our COO-human, handles the decisions that require judgment on behalf of the company.

Each seat owns one thing. The ownership line is clean because the process was designed before the seat was filled, not the other way around.

When we retired Jeff, our former data intelligence agent, it was partly because the process he was designed to run had been absorbed into other seats. Dash now carries what Jeff was covering on ad spend monitoring. Crystal carries the Accelo reconciliation. The job description that justified Jeff's seat dissolved when the process was redesigned around the agents that already existed.

That is what a working hybrid chart looks like. The chart reflects a designed process, not an accumulation of agents deployed without one.

## Let agents carry the operational work. That requires the COO to design what they carry.

The promise of a hybrid operating model is that agents carry the operational work and the humans are free for the work that matters. The judgment calls. The client relationships. The decisions that require company-level accountability.

That promise does not deliver itself. It requires someone to redesign the process before the agent goes in, so the agent is carrying the right work, measured on the right metrics, with the right hand-offs and the right gates.

The COO is the one with the map. The COO is the one who has to say: not yet. Fix the process first.

Only 21% of enterprises have a mature governance model for agentic AI, according to Deloitte's 2026 State of AI in the Enterprise survey of 3,235 organizations. The 79% that do not are, in most cases, not failing because they chose the wrong agent or the wrong platform. They are failing because they handed a broken process to an agent and expected the agent to fix it.

The agent will not fix the process. The agent will run the process. The COO has to fix it first.

## See the live chart

Every redesigned seat at Sneeze It is queryable from OTP's MCP server, including which agents own which process steps and what metrics they report against.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the Sneeze It org chart and which seats are agents versus humans."*

You will see the process ownership, the seat names, and the accountability structure that came out of redesigning before deploying.
