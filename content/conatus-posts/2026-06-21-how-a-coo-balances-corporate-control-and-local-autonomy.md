---
title: The COO who gives agents control at the edge keeps the decisions that matter at the center
date: 2026-06-21
author: David Steel
slug: how-a-coo-balances-corporate-control-and-local-autonomy
type: founder_essay
status: published
series: ai-coo
series_part: 44
description: How a COO decides which decisions agents make locally and which stay central. The decision tree we use at Sneeze It, with real seat examples.
---

# The COO who gives agents control at the edge keeps the decisions that matter at the center

The hardest thing about running agents is deciding how much to let them decide.

Not the technical part. The technical part is mostly solved. The hard part is the architecture question that every COO faces after the third or fourth agent is running: who decides what, and who owns the accountability when the decision turns out to be wrong.

I got this wrong for about four months. I gave agents too much autonomy in some places and too little in others, and the results were exactly what you would expect. The agents with too much autonomy drifted. The agents with too little autonomy became expensive mirrors, reflecting back data I could have pulled myself.

The fix was a decision tree. Not a policy document. Not a governance framework. A literal tree I can walk in under two minutes for any decision I am tempted to route to an agent.

## The central claim

Control and autonomy are not opposites you balance. They are a sorting problem. Some decisions belong at the center. Some decisions belong at the edge. The COO's job is to sort them correctly and enforce that sorting consistently across every seat, human or agent.

Get the sorting right and the system runs. Get it wrong and you spend most of your week correcting agents that were trusted with the wrong class of decision.

## What the tree looks like

The tree has three nodes. I walk them in order.

**Node 1: Is the decision reversible within 24 hours?**

If no, it stays central. Period. Irreversible decisions are pricing changes, contract commitments, hiring and firing, structural changes to how a client relationship works. These decisions have compounding downstream effects that an agent cannot fully model, and correcting them after the fact costs more than making them centrally from the start. No agent at Sneeze It holds authority for an irreversible decision. Not Dirk, our sales agent. Not Pulse, our retention agent. Not Crystal, our project manager. When those agents reach a decision point that is irreversible, they surface it to me or Bogdan and stop.

If yes, it can move to Node 2.

**Node 2: Does the decision require reading context the agent cannot access?**

This is the node most operators skip, and skipping it is where the drift comes from. An agent can process what it can see. What it cannot see is the conversation David and Bogdan had on Thursday about a specific client. What it cannot see is the tone shift in a client's last email that suggests something is wrong under the surface. What it cannot see is the history between two people that makes a communication decision obvious to a human and opaque to a model.

If the decision requires context the agent cannot access, it stays central. Not because the agent is not smart enough. Because the agent is working with incomplete information and an incorrect decision made with incomplete information is worse than a slightly slower correct one.

If the agent has access to all the information it needs to make the decision well, it moves to Node 3.

**Node 3: Does the decision affect the customer relationship or the company's public position?**

If yes, a human approves before it executes. The agent can prepare everything. Draft the message, structure the proposal, stage the outreach. The human approves or declines in one action. The agent does not send on its own.

If no, the agent executes, logs the action, and publishes the result to the shared scorecard.

That is the tree. Three nodes, clear outputs.

## How it maps to real seats

Radar, our chief of staff, runs Node 3 decisions all day. Radar compiles the morning briefing, scans calendar, summarizes Slack, flags delegation gaps. Every output Radar produces lands in a file or an Obsidian note. None of it touches a client. None of it requires approval. Radar runs.

Arin, our call center manager, reaches Node 3 on coaching messages to the calling team. Arin drafts. David approves. Then the message goes to the team in Slack. The draft is usually good. The approval gate is not about quality. It is about the customer relationship node, which here means the internal team relationship. Arin does not send independently.

Dirk, our sales agent, reaches Node 1 on pricing decisions and Node 3 on outreach drafts. Dirk can queue thirty cold emails. David reviews the wave. The wave goes. What Dirk cannot do is change pricing, extend credit terms, or commit the company to a scope that was not previously agreed. Those are irreversible. They stay central.

Tally, our KPI agent, never leaves Node 3 territory. Tally reads source files and pushes numbers to the scorecard four times a day. No human approval required. The output is a number. The number is correct or it is not, and the scorecard makes it visible within hours.

Dash, our analytics agent, produces output that lives entirely in Node 3. Dash reads Meta and Google Ads data, computes portfolio performance, flags anomalies. Dash reports. Dash does not change bids, does not pause campaigns, does not contact clients. Analysis is reversible, observable, and does not touch the customer relationship. Dash runs without approval on the analysis. Every recommendation Dash produces requires a human to act on it.

Nick, our cold prospecting agent, runs the full pipeline but stops at Node 3. Nick finds prospects, validates emails, drafts outreach in David Kennedy's pattern. The drafts land in Gmail. David sends. Nick does not send.

Crystal, our project manager, reaches Node 1 quickly on scope changes and Node 2 on client relationship decisions. Crystal reports project status, flags risks, surfaces delivery gaps. When Crystal identifies a risk that involves changing what was committed to a client, that surfaces to me. Crystal does not renegotiate scope independently.

Pepper, our email agent, sits at the intersection of Nodes 2 and 3. Client email context requires a human to interpret the relational layer. Pepper drafts. David sends. The drafts are good enough that the approval step takes thirty seconds. The thirty seconds is not overhead. It is the cost of keeping customer relationships at the center.

## What Bogdan does that no agent does

Bogdan is our COO, a human, and his seat makes the most useful contrast.

Bogdan operates at Node 1 regularly. He makes scope decisions, vendor commitments, team structure decisions, and timing calls on client deliverables that are not easily reversed. He reads context from twenty different sources simultaneously, including interpersonal context that does not exist in any system. He escalates to me when a decision is irreversible AND affects the company's strategic position.

Nothing in the agent fleet does what Bogdan does at Node 1. The agents do not attempt it. The decision tree makes it structurally impossible for them to reach those decisions without a human in the path.

The agents make Bogdan better at his Node 1 work because they clear the Node 3 decisions from his plate. Bogdan is not processing the morning briefing. Radar does that. Bogdan is not pulling ad performance before a client call. Dash does that. Bogdan is not tracking project status across twelve active engagements. Crystal does that. Bogdan spends his time on the decisions that actually require Bogdan.

That is the point of the sorting. Not to replace human judgment. To aim it correctly.

## Why most operators get this wrong

The failure mode I see most often is agents that were given Node 3 authority but are actually making Node 1 or Node 2 decisions because nobody walked the tree explicitly.

A well-intentioned operator sets up a customer success agent and tells it to "handle routine client check-ins." Three months later the agent has been sending check-ins that contain implicit commitments the company cannot meet, and the client relationships have quietly degraded in ways that are very hard to reverse.

The agent was not bad. The sorting was wrong. "Routine check-in" sounds like Node 3. But client communications always pass through Node 3's filter (does this affect the customer relationship?) and the answer is almost always yes. The operator skipped the tree, handed the agent Node 3 authority without recognizing it was Node 3, and the drift compounded silently.

The tree makes the sorting explicit. Run every agent through it before it touches a real decision. The exercise takes ten minutes. The cost of skipping it is measured in months.

## Where Gartner and the advisory firms land on this

Gartner's Six Steps to Manage AI Agent Sprawl (published April 2026, cited via CIO.com) includes agent identity, permissions, and lifecycle as a named step. The underlying problem they are describing is exactly this: agents with unclear authority boundaries generate sprawl and risk. The governance answer Gartner recommends is centralized agent inventory with explicit permission scopes.

The decision tree is the operational version of that. Not a policy you write and file. A process you run every time you assign authority to a seat.

Deloitte's 2026 State of AI in the Enterprise (n=3,235) found that only 21 percent of enterprises have a mature governance model for agentic AI. The other 79 percent have agents operating without a clear sorting mechanism. Some of those agents are doing fine because they happen to be working in Node 3 territory by accident. The rest are drifting, and the operators usually know something is off before they can name what it is.

What is off is the sorting.

## The last thing

The COO's job in an agent-operating model is not to approve everything. It is to design the system so the right things require approval and the right things do not.

Kristen, our creative director, does not need to approve every keyword in a paid campaign. Janine, our accounting lead, does not need to be in the loop on every draft Pepper writes. The sorting protects them from noise. The sorting also protects the company from agents touching things they were not designed to handle.

Let agents carry the operational work. Keep humans on the decisions that actually require human judgment. The decision tree is how you know which is which.

Build it before you need it.

## See the live chart

Every agent seat at Sneeze It, with its authority boundaries, is queryable from the OTP MCP.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the Sneeze It org chart and which seats have autonomous execution authority versus approval-required authority."*

The response shows you the live sorting in a real operating company, not a hypothetical.

---

*Series: AI-COO. Post 44 of an in-progress series. Previous posts cover agent hiring, unified scorecards, and what a hybrid org chart actually looks like.*
