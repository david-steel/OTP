---
title: The COO's job is to make sure two agents never touch the same thing at the same time
date: 2026-06-21
author: David Steel
slug: how-a-coo-prevents-two-agents-from-colliding
type: founder_essay
status: published
series: ai-coo
series_part: 18
description: When you run a fleet of AI agents, collision is the silent failure mode. Here is the decision tree the COO uses to prevent it before it happens.
---

# The COO's job is to make sure two agents never touch the same thing at the same time

The collision problem is the one nobody warns you about when you start running agents.

You add a sales agent. You add a retention agent. You add a prospecting agent. Each one is doing its job. Each one has a clear seat on the chart. Then one day a client receives two messages in the same week from two different agents who did not know the other existed, and you find out about it because the client asks you what is going on.

That is a collision. And once you have seen one, you start seeing the conditions that produce them everywhere.

The COO's job in a hybrid org is not just to define what each agent does. It is to define what each agent does when another agent is already in motion on the same territory. That requires a decision tree, not a job description.

## Why job descriptions are not enough

The instinct when you stand up a new agent is to write a tight role definition. One seat, one owner, clear scope. That is the right starting point. But a job description defines what an agent does when it is the only agent in the room. It does not define what the agent does when another agent has already touched the same client, the same prospect, or the same data.

At Sneeze It we have a sales agent named Dirk, a cold prospecting agent named Nick, and a retention agent called Pulse. Each of them has a distinct seat. Dirk handles pipeline, warm leads, and reactivation. Nick handles cold outreach in health and wellness only. Pulse monitors existing client health and routes escalations.

Three agents. All touching contacts. All capable of writing the same client or prospect a message on the same day.

The job descriptions do not prevent that. The rules between the seats do.

Accenture puts it plainly: reinvent the process before you add the agent. The process in a multi-agent org is not just the workflow inside each seat. It is the protocol between seats. Most COOs build the seats first and discover the protocol problem later, when someone complains.

## The decision tree

When I am designing the rules between two agents that share territory, I work through four questions in order. The order matters. Skipping to question three before you have answered question one produces rules that look complete but fail under pressure.

**Question one: do these two agents share territory at all?**

Start here. If Arin, our call center manager, and Tally, our KPI tracker, never touch the same contacts or the same data stream, they do not need collision rules between them. Their scopes are structurally separate. Design their seats correctly and the collision risk is zero.

If the answer is yes, they share territory, move to question two.

**Question two: is the territory time-sequenced or concurrent?**

Some agents are upstream and downstream of each other. Nick does cold outreach. If a cold lead responds and enters the pipeline, Dirk picks it up. They do not touch the same contact at the same time. Nick hands off and steps back. Dirk takes over. The sequence is the collision prevention.

This is the cleanest architecture. When you can make two agents sequential rather than concurrent, do it. The handoff is explicit, the state is clear, and there is no window where both agents are active on the same territory simultaneously.

If the agents are concurrent on the same territory, move to question three.

**Question three: which agent has priority, and under what conditions does priority shift?**

This is where most COOs underinvest. Priority between concurrent agents needs to be stated explicitly, not inferred from role seniority or assumed from whoever was added first.

At Sneeze It, Pulse always wins in any Dirk-Pulse conflict. That is not a preference. It is a written rule. If a client is on Pulse's watch list for churn risk, Dirk's expansion play pauses. Dirk is the hunter. Pulse is the guardian. The guardian has priority because the cost of a churn event outweighs the upside of an expansion play every time.

Bogdan, our human COO, did not arrive at that rule by intuition. We worked it out the first time Dirk flagged an expansion opportunity for a client that Pulse had already flagged as at risk. Two agents, same client, same week, different recommendations. We had to decide which signal governed. We decided, we wrote the rule, and we have not revisited it since.

The rule does not have to be complicated. It has to be explicit. "Agent A has priority over Agent B when condition X is true" is a complete collision rule. Write it before the first conflict, not after.

If the priority is genuinely context-dependent and you cannot write a simple rule, move to question four.

**Question four: who is the human decision point?**

Some territory is contested enough that a written priority rule would be arbitrary. In those cases, the answer is not to write a better rule. The answer is to route the conflict to a human.

At Sneeze It, when two agents surface conflicting signals about the same client and neither signal clearly governs the other, the conflict routes to me or to Bogdan through the briefing. Radar's morning output surfaces the conflict explicitly. A human decides. The agent that was paused receives the decision and resumes or stands down.

This is not a failure of the system. It is the system working. The point of the decision tree is to handle the clear cases automatically and surface the genuinely ambiguous ones for human judgment. The COO's job is to keep the ratio of human decisions low by writing better rules, not to eliminate human decisions entirely.

Deloitte found that only 21 percent of enterprises have a mature governance model for agentic AI. That number is low because most operators have not built the decision tree. They have built job descriptions and hoped the agents would figure out the rest.

## The agent message bus is how the rules stay live

A decision tree is a document. A message bus is how the decision tree runs in real time.

At Sneeze It, agents communicate through structured inbox files at `~/.claude/agent-inbox/{agent}.md`. When Dirk wants to pursue an expansion play for a client, it sends a clearance request to Pulse before initiating contact. Pulse reads the request, checks the client's current health signals, and responds with a green or a hold. No human in the loop for that exchange. The coordination happens agent-to-agent, on the protocol we designed.

This is what Gartner means when it identifies centralized agent identity and permissions as a core governance requirement (via CIO.com). The message bus is how identity and permissions run during live operations. The COO designs the bus. The agents use it. The bus is what makes the decision tree operational rather than theoretical.

Without the bus, each agent operates as if it is the only one in motion. With the bus, agents check before they act. The check takes seconds. The collision it prevents can cost a client relationship.

## What Jeff taught us about scope creep as a collision risk

Collision does not only happen between two active agents. It also happens when an agent's scope drifts into territory another agent already owns.

Jeff, our former data integrity agent, is the clearest example of this at Sneeze It. Jeff was built to catch things other agents missed. Over time, Jeff started catching things Dash was already catching, and flagging things Dirk was already flagging. The seats were overlapping. The overlap produced false positives, redundant alerts, and friction between humans who were receiving conflicting signals from agents who had not checked with each other.

We gave Jeff a formal hearing in April. The honest assessment was that Jeff's seat had never been fully distinct from the seats around it. The capabilities were real. The overlap was structural. Jeff was retired, and the capabilities were redistributed to the seats that owned the adjacent territory cleanly.

The lesson is not that Jeff failed. The lesson is that scope clarity is a maintenance problem, not a setup problem. The COO has to revisit the decision tree when agents are added, when seats evolve, and when collision signals start appearing in the output. A clean chart from six months ago may not be a clean chart today.

MIT CISR's maturity research shows the biggest capability jump happens when organizations move from running pilots to developing real AI ways of working. The "ways of working" are the collision rules. The pilots work fine in isolation. The ways of working are what determine whether the fleet is reliable at scale.

## Let agents carry the operational work. Keep people on the exceptions.

The goal of the decision tree is to let agents carry the operational work without the COO having to referee every interaction in real time.

Radar runs the morning briefing. Dash monitors spend across 39 accounts. Nick drafts cold outreach. Arin coaches the call center team. Crystal tracks project delivery. Pepper triages the inbox. Tally pushes KPI values to the scorecard. Each of them is running independently, all day, without constant supervision.

That only works because the collision rules between them are explicit. Pepper knows not to send outreach that Dirk has already queued. Nick knows not to touch any brand Dirk has contacted in the last 30 days. Crystal knows that delivery risk on a client escalates through Radar before it reaches Bogdan or Janine.

The humans at Sneeze It are not watching agents to make sure they do not step on each other. The humans are doing the work that requires judgment, relationships, and decisions that change context every week. The agents are free to carry the operational load because the COO did the structural work to keep their lanes clean.

That is the job. Not managing agents. Managing the architecture that makes agents manageable.

## See the live chart

Every seat on the Sneeze It hybrid chart, including the collision rules between concurrent agents, is queryable from OTP MCP.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the sneeze-it org chart and identify which agents share territory with another agent."*

The response will show you how one-seat-one-owner looks when the seats are actually distinct, and what the structure looks like when two seats are designed to coordinate rather than collide.
