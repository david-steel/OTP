---
title: An agent fleet is not a software rollout. It is a workforce. And workforces need an org chart.
date: 2026-06-21
author: David Steel
slug: what-is-an-agent-fleet
type: founder_essay
status: published
series: ai-cio
series_part: 14
description: What an agent fleet actually is, why it behaves like a workforce instead of a tool, and who actually runs it day to day.
---

# An agent fleet is not a software rollout. It is a workforce. And workforces need an org chart.

The question I get most often from operators who are one or two agents in is some version of: "When does this become a fleet?"

The honest answer is: it already is. The moment you have two agents doing different things, you have the same coordination problem every workforce has. Who owns what. Who answers to whom. What happens when one of them fails. What happens when you need to retire one.

The word "fleet" sounds like it implies scale. Forty agents. A hundred agents. The kind of number Gartner, as reported by CIO.com, points to when they note that enterprises are running roughly fifty or more agents on average, with "40% of enterprise applications expected to feature task-specific AI agents by end of 2026." Those numbers suggest something happening at a level most companies are not at yet.

But the fleet problem starts at two. It starts the moment you have agents that could step on each other, overlap, go quiet, or drift, and nobody is watching.

## What a fleet actually is

An agent fleet is a group of AI agents running concurrently in your organization, each doing a different job, each consuming information from real business systems, each producing outputs that affect other seats.

What makes it a fleet and not just a collection of bots is that the outputs are consequential. A bot that answers FAQ questions is a tool. An agent that monitors your client accounts, flags churn risk, and routes recommendations to your retention team is a workforce member. The difference is not the technology. The difference is whether the agent's output changes what a human does next.

At Sneeze It, we run about ten agents. Radar is our chief of staff. Dash monitors ad performance across all client accounts. Dirk runs sales pipeline, Pulse watches client retention, Pepper handles email triage, and Arin manages our call center team. Each of them is reading from real business data every day and producing outputs that drive real decisions.

When Arin flags that a setter's speed-to-lead has dropped below threshold, someone on the call center side changes how they start their morning. When Dash surfaces an account spending 20% above its 30-day average, a real conversation with a real client happens. When Pepper flags an email from a client that has not responded in two weeks, I either write back or decide not to. These are consequential outputs.

That is what makes it a workforce, not a toolset.

## The counter-story the advisory world tells

Gartner has named what happens when you run a fleet without governance. They call it agent sprawl, and they call it "the new Shadow IT" (via CIO.com, where Gartner's April 2026 framework was reported). Six steps to manage it. Centralized inventory. Identity and permissions. Lifecycle management. Monitoring agent behavior. The framework is real and the problem is real.

Here is where I have to give credit where it is due and then draw the line that matters.

The advisory firms have named the problem correctly. Organizations are acquiring agents without an inventory of what they have. Agents are running with overlapping scope, undefined ownership, no retirement process. That is accurate. The frameworks describe the pathology well.

What the frameworks do not give you is an operating system. A framework tells you what to worry about. An operating system tells you how to run it on Tuesday morning.

The business schools are one step behind the advisory firms. MIT CISR is doing serious research on governing multiagent systems and designing decision rights for autonomous agents. CMU has the deepest agentic curriculum of any school I found in this research, with a full LEAAID certificate that teaches CIOs how to build and deploy agentic capabilities. Kellogg names agentic AI in a strategy module. Cornell teaches you to govern it.

But even CMU, the closest thing to an exception, teaches you to build an agent and govern its deployment. Nobody teaches you to run the fleet. Nobody teaches you who owns it, how you measure it, what you do when an agent fails silently, and how you retire a seat without losing the capability it was covering.

The academy teaches strategy. The advisory firms write frameworks. Neither gives you a running system.

## The question of who runs it

This is where the counter-positioning comes in. Most CIOs hearing "agent fleet" will mentally assign it to IT. It is software. Software lives in IT. IT runs it.

That is the wrong answer, and the reason it is wrong is the same reason you would not assign your sales team to IT just because they use a CRM.

An agent fleet is a workforce. Workforces report to operators, not to infrastructure teams. The CIO's job in this picture is not to run the fleet but to govern it: inventory, identity, permissions, security, cost, and lifecycle. CIO.com summarized it well: the CIO's value comes "not from owning technology, but from structuring and governing the system where humans and AI operate together."

The operating of the fleet is a management function, not a technology function. Every agent in the fleet needs a seat-owner. A human being who is accountable for what that agent produces, who reviews the output in the same cadence they would review a direct report's work, who has the authority to pause, retune, or retire the seat when needed.

At Sneeze It, I am the seat-owner for most of our agents right now. As the org matures, that accountability moves to the seat that is functionally closest to the agent's work. Arin's seat-owner will eventually be our call center director. Dash's seat-owner will eventually be our media director. The CIO equivalent at Sneeze It (which is me, wearing too many hats) governs the stack. The operators run the seats.

One reason this matters practically: Deloitte's 2026 State of AI in the Enterprise, surveying 3,235 companies, found that only 21% have a mature governance model for agentic AI. That is not a technology adoption problem. That is an org design problem. The 79% who lack mature governance are not missing better software. They are missing a chart that shows who owns what.

## What the fleet needs from an org chart

The reason I keep coming back to org charts for agent fleets is that every failure mode I have seen in our own fleet, and every pattern the Gartner frameworks describe, is an org chart failure in disguise.

Agent sprawl is what happens when you have agents with no seat definition. Nobody wrote down what this agent owns, so three agents end up doing overlapping things, none of them accountable for the outcome.

Silent drift is what happens when an agent has no seat-owner running a weekly accountability conversation. The agent is technically running. Nobody is asking whether the numbers the agent is producing are still connected to the outcomes the business cares about.

Zombie agents are what happen when there is no retirement process. An agent that was valuable six months ago is still running, still consuming resources, still occasionally producing outputs that confuse the humans downstream of it. Nobody retired it because nobody owned it.

At Sneeze It we have had all three. We dealt with all three the same way you deal with workforce problems: by clarifying the seat, assigning the owner, and running the accountability cadence.

In April, we retired Jeff. Jeff was our data integrity agent, and his retirement was the result of a formal hearing, not a quiet shutdown. We documented the reasons, redistributed the capabilities to the seats that would cover them (Dash took most of the work), and kept a record of what Jeff had done and why the seat was no longer needed. That process sounds elaborate. It took about ninety minutes. The alternative was leaving a zombie agent in the fleet indefinitely and watching it erode trust in the outputs that came from the seats around it.

The mission that drives how we organize this is simple: let agents carry the operational work, so people are free for the work that matters. That only works if the operational work is actually assigned. Seat by seat, owner by owner, with a cadence that holds each seat accountable.

## What to do next week

If you are running more than one agent and you have not written down who owns each seat, that is the first thing. Not a software purchase, not a governance framework, not a certification. A list of seats, the name of the human accountable for each one, and the business-outcome metric you are going to review on a weekly cadence.

If you have agents that you are not sure are still needed, that is the second thing. Ask the seat-owner. If there is no seat-owner, that is your answer.

The fleet question is not a technology question. It is the oldest management question there is: who is responsible, for what, and how do you know if it is working?

## See the live chart

Every agent seat at Sneeze It is queryable via the OTP MCP, including role, owner, metrics, and chart position relative to human seats.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me every agent seat on the sneeze-it chart and who owns each one."*

You will see a structured chart where each agent seat has a named owner, a role definition, and a position in the accountability hierarchy alongside the human seats. That structure is the operating system. The frameworks describe it. This runs it.
