---
title: The CIO does not own the agents. The CIO owns what connects them.
date: 2026-06-20
author: David Steel
slug: what-the-cio-owns-when-every-department-runs-agents
type: founder_essay
status: published
series: ai-cio
series_part: 1
description: When every department runs its own agents, the CIO's job shifts from building to connecting. Here is what that actually looks like.
---

# The CIO does not own the agents. The CIO owns what connects them.

The obvious answer to "what does the CIO own when every department runs its own agents" is wrong.

The obvious answer is: the CIO owns governance. The CIO owns the vendor contracts, the approved model list, the data classification rules, the security review checklist. The CIO becomes the agent police, blessing what departments build and blocking what they cannot.

That answer made sense when IT was the only team that could build anything. It does not make sense when your sales team can spin up a pipeline agent in an afternoon and your call center manager has her own coaching agent before you have finished approving the pilot.

The real answer is this. When every department runs its own agents, the CIO's job shifts from owning the agents to owning the layer between them. The agents belong to the seats that run them. The CIO owns the connective tissue.

Here is what that connective tissue actually looks like, broken into the things the CIO specifically has to own.

## 1. The shared scorecard

Every agent produces output. Not every agent publishes that output to a place the rest of the organization can see.

When agents are departmental, they naturally report upward inside their department and stop there. Dirk, our sales agent, publishes pipeline health to a state file that Radar, our chief of staff, reads every morning. Dash, our analytics agent, writes ad performance numbers to a file that flows into the same briefing. Tally, our scorecard agent, reads those files and pushes the numbers to the org chart so the whole company can see them in one place.

That pipeline, from departmental agent output to shared scorecard, does not build itself. Someone has to define what belongs on the shared scorecard. Someone has to make sure each agent publishes in a format the scorecard can consume. Someone has to decide when a number belongs on the company dashboard versus staying inside the department.

That someone is the function the CIO is now running. It is coordination work, not configuration work.

The CIO owns the scorecard and owns the data contract that lets departmental agents feed it.

## 2. The accountability structure across seats

An agent is accountable to the seat that owns it. But agents upstream and downstream of each other create accountability chains that cross department lines. When Dirk's pipeline numbers drop, that eventually shows up in Janine's cash collected number. When Dash flags a client account going sideways, that creates work for Bogdan on the operations side to triage. The chain from Dash's flag to Bogdan's action crosses a seat boundary.

Someone has to own those cross-seat accountability chains. Who is accountable when two agents conflict. Who resolves a situation where the sales agent says "green light on expansion" and the retention agent says "hold, client is at risk." We had this exact tension between Dirk and Pulse, our retention agent. We resolved it with a rule: Pulse wins. If a client is on Pulse's watch list, Dirk's expansion play pauses. The Guardian beats the Hunter.

That rule did not emerge from the agents themselves. It was a deliberate architectural decision about how accountability flows across seats when the seats disagree. The CIO owns the set of those decisions. Not the individual agents. The rules that govern how agents relate to each other.

## 3. The inter-agent communication protocol

When departments run their own agents, the agents will eventually need to coordinate with each other. The question is whether that coordination happens through a defined protocol or through ad hoc chaos.

We use a message bus. Agents write to inbox files. Agents read from inbox files. The structure of every message is defined: REQUEST, INFORM, PROPOSAL, RESPONSE, CHALLENGE. Each message has a sender, a recipient, a type, and a payload. An agent can challenge another agent's output. An agent can request a clearance from another agent before acting.

This protocol does not belong to any department. It belongs to the organization. It is the common language agents use to talk to each other across seat boundaries.

The CIO owns the protocol. Departments implement agents. The protocol is infrastructure, and infrastructure has one owner.

## 4. The maturity floor

Not all agents are at the same level of autonomy. Some agents make observations and report them. Some agents make recommendations and wait for approval. Some agents act and log what they did. Some agents act, loop back, and correct.

The problem with distributed agent development is that every team sets its own bar. The sales team ships an agent that acts without logging. The analytics team ships an agent that logs everything but never acts. The call center team ships an agent with no correction loop. None of them are wrong inside their own context. Together, they are incoherent.

The CIO owns the maturity floor. Minimum logging standards. Minimum correction loop requirements. Minimum approval gates before an agent moves from reporting to acting. The details vary by risk and by seat. The standard exists across all seats.

We had Bassim, our maturity evaluator, doing this work at the agent fleet level. Bassim scored the whole army against an eight-level framework and surfaced where the floor was sagging. That job is now absorbed into the organizational function the CIO runs. It is not a one-time audit. It is an ongoing accountability for the maturity of the fleet.

## 5. The retirement process

Every agent eventually becomes obsolete, misaligned, or redundant. The work it was doing moves to a different seat. The world it was calibrated for changes. Another agent starts duplicating its function.

In April we retired Jeff, our data integrity agent. Jeff had five missions when he was built. By April, three of those missions had migrated to other seats, one was never well-defined, and the fifth had failed silently for weeks without anyone noticing. Jeff's own assessment, when asked directly, was that the seat was not earning its existence.

The retirement was clean because we ran a process. We held a hearing. We evaluated the seat against its original purpose. We redistributed capabilities to the seats that should have owned them all along. We kept an honest record.

Nobody fights for a human employee the way departments fight for their own tools. They will let an agent run long past usefulness because it feels like infrastructure, not headcount. The CIO owns the retirement process. Not because the CIO has to be the one to run every hearing. Because if nobody owns it, it never happens, and the fleet fills up with seats doing work nobody needs.

## What this is not

The CIO does not own the agents.

Dirk belongs to the revenue function. Dash belongs to the analytics function. Arin, our call center manager agent, belongs to the call center. The people who run those functions own those agents, tune them, set their targets, and answer for their numbers.

The CIO's job, when every department runs its own agents, is to own the five things those departments cannot own for themselves: the shared scorecard, the cross-seat accountability rules, the inter-agent communication protocol, the maturity floor, and the retirement process.

That is not a smaller job than the old CIO job. It is a different job. One that requires understanding how organizations work, not just how software works. The seat goes to whoever can hold those five things without collapsing them back into governance paperwork.

The agents are easy. The connective tissue is the hard part.

## See the live chart

You can query Sneeze It's agent fleet through the OTP MCP to see which seats are active, which are retired, and how the cross-seat accountability rules are structured.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the Sneeze It org chart and identify which agent seats cross department boundaries."*

You will see the inter-agent relationships directly on the chart, which makes the connective tissue visible in a way a written description cannot.

---

*Series: AI CIO. Post 1 of an in-progress series.*
