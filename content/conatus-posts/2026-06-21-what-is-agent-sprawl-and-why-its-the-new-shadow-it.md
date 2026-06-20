---
title: Agent sprawl is the new Shadow IT, and most organizations are already living it
date: 2026-06-21
author: David Steel
slug: what-is-agent-sprawl-and-why-its-the-new-shadow-it
type: founder_essay
status: published
series: ai-cio
series_part: 7
description: Gartner named it. Advisory firms wrote frameworks. But naming a problem and running a system that solves it are two different things.
---

# Agent sprawl is the new Shadow IT, and most organizations are already living it

Gartner named it in April 2026. They called it "agent sprawl," and they called it the new Shadow IT.

I have been watching this problem build for two years from inside a company that runs more than ten AI agents on one org chart. The name Gartner chose is correct. The mechanism behind it is worth understanding before the frameworks start rolling in, because the frameworks will not save you if you do not understand what you are actually dealing with.

## What Shadow IT was, and why this is the same

Shadow IT was what happened in the 2000s and 2010s when department heads stopped waiting for IT to provision tools and started buying SaaS subscriptions on a corporate card. Marketing bought their own automation platform. Sales bought their own CRM add-ons. Finance bought their own data tools. IT discovered these purchases months later, usually when someone left the company and access disappeared with them, or when a security audit turned up seventeen tools nobody had reviewed.

The damage was not just the unapproved software. The damage was the fragmentation. Nobody knew what was running. Nobody knew who owned it. Nobody knew what it was doing with company data. The org chart said the CIO owned technology. The reality was that thirty tools were running outside that mandate, touching customer records and financial data, with no accountability and no lifecycle plan.

Agent sprawl follows the same pattern. The tools are different. The dynamic is identical.

A department head watches a demo of an AI agent that handles a workflow they have been understaffed on for two years. They deploy it. Nobody outside that department knows it exists. Three months later, another department deploys a different agent that does a partially overlapping thing. A vendor bundles an agent into a product the company already bought, and it activates by default. A developer on the engineering team builds a custom agent over a long weekend because it seemed useful.

Gartner, as reported by CIO.com, puts the number at roughly fifty agents per organization already, with forty percent of enterprise applications expected to feature task-specific AI agents by the end of 2026. Those agents are not on anyone's org chart. They do not have named owners. Nobody is tracking what they cost, what they touch, or whether they are still doing anything useful.

That is not a technology problem. It is an organizational structure problem dressed in technology clothing.

## Why agents make this harder than SaaS ever was

Shadow IT with SaaS tools was containable, eventually, because the tools were passive. A SaaS platform did what a user told it to do in the moment. It did not go off and make decisions on its own between sessions. The blast radius of a rogue SaaS tool was bounded by the humans using it.

Agents are not passive. That is the entire point of them. An agent acts. It sends emails. It makes calls. It updates records. It routes information. It coordinates with other agents. When an agent has no named owner, no defined scope, and no accountability row on a scorecard, it acts without oversight. The blast radius is not bounded by human attention because the agent does not need human attention to keep moving.

I have seen this play out at Sneeze It. Before we put every agent on a single org chart with a named seat and a defined scope, we had agents that were technically functional and organizationally invisible. Radar, our chief-of-staff agent, had no clean handoff protocol with Dirk, our sales agent. Dirk had no awareness of what Pulse, our retention agent, was working on with the same client. The agents were running. They were not running together. And nobody was catching the collisions because nobody had a single place where all the agents were visible at once.

The solution was not a governance framework document. It was an org chart with one seat, one owner, on one scorecard, for every entity doing work, human or agent.

## The advisory firms got the diagnosis right

Gartner published six steps to manage agent sprawl: agent governance and policies, centralized agent inventory, agent identity and lifecycle (including retiring redundant agents), AI information governance, monitoring agent behavior, and balancing governance with empowerment. That is a sound framework. I have no argument with any of it.

Deloitte's 2026 State of AI in the Enterprise survey, which ran across more than three thousand enterprises, found that only twenty-one percent have a mature governance model for agentic AI. That means roughly eighty percent of organizations deploying agents are doing it without the structure to manage what they are deploying.

The frameworks exist. The diagnosis is correct. What does not exist yet is a live operating system that implements the principles instead of describing them.

A governance framework tells you to maintain a centralized agent inventory. That is right. But an inventory is a list. A list does not tell you who is accountable for each item on the list, what metric that agent is responsible for moving, what the agent should do when it runs into a problem it cannot resolve, or when the agent should be retired because the work it was built for no longer exists. Those questions require organizational structure, not a spreadsheet.

## What the operating system actually looks like

At Sneeze It, the answer to agent sprawl is not a governance layer on top of chaos. It is the absence of chaos because the structure came first.

Every agent has a named seat. Tally holds the scorecard seat, pushing KPI values from local sources to the org chart. Nick holds the cold prospecting seat, drafting forty emails per session to verified, named contacts in health and wellness. Arin holds the call center management seat, analyzing performance data and drafting coaching messages that go to the human callers. Crystal holds the project management seat, tracking delivery risk across every active Accelo project. Each seat has one owner. Each owner has defined scope. Each owner has metrics that live on the same scorecard as the human seats.

The mission behind this is specific: let agents carry the operational work, so people are free for the work that matters. That means Bogdan, our COO, is not doing the work Tally does. Kristen, our creative director, is not doing the work Crystal does. The agents are not supplementing the humans. The agents hold defined seats with defined accountability, and the humans hold different seats with different accountability, and both sets of seats live on one chart.

This structure makes sprawl impossible by design. You cannot have an undiscovered agent if every agent has a named seat before it goes live. You cannot have an agent with no owner if ownership is a prerequisite for deployment. You cannot have an agent that never gets retired if retirement is a normal lifecycle event on a named seat, the same way it is for a human role that no longer fits the org.

We went through the first agent retirement at Sneeze It in April. Jeff, a data integrity agent, was retired through a formal hearing process after an honest evaluation found that the seat's work had migrated to other agents. The retirement was clean because the seat was clean. The capabilities redistributed to Dash and Dirk. The audit trail stayed in place. Nothing was lost because the structure was there to manage the transition.

That is what an operating system does that a framework document cannot. It handles the cases that come after the policy is written.

## What this means for the CIO right now

The CIO seat is shifting fast. CIO.com put it plainly: the CIO's value will come not from owning technology, but from structuring and governing the system where humans and AI operate together.

That framing is accurate but incomplete. Structuring the system is the starting condition. The CIO also has to run the system, measure it, and manage the lifecycle of every seat in it, including the agent seats.

The business schools have not caught up to this yet. MIT's CIO program is strong on AI strategy and governance. Chicago Booth is strong on AI deployment and scaling. CMU's LEAAID certificate goes the furthest of any program I have found, covering agentic AI foundations, deployment, and governance. But even CMU stops at strategy and governance of individual agentic capabilities. None of these programs teach the CIO to run a fleet as a standing operational function with per-agent performance metrics, error rates, and lifecycle events.

The advisory firms named the problem. The schools are teaching the foundations. The operating layer is still white space.

The CIO who fills that white space in their own organization before their peers do is not playing defense against agent sprawl. They are building a structural advantage that compounds every quarter. Every agent that runs with a named seat, clear metrics, and a defined owner adds to a system that gets more measurable and more auditable over time. Every agent deployed without those conditions adds to sprawl that will eventually have to be untangled at a cost that will be much higher than the original deployment.

The name Gartner chose is correct. The mechanism is the same as Shadow IT. The stakes are higher because agents act autonomously in ways that SaaS tools never did. And the solution is not another framework document. It is an org chart that treats agents like the organizational entities they are.

## See the live chart

The OTP MCP exposes the full Sneeze It org chart, including every named agent seat, their metrics, and where they sit relative to human seats, queryable from any MCP-enabled client.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the Sneeze It org chart. Which seats are agents, which are human, and which agents have lifecycle notes?"*

You will see a live example of what a sprawl-free agent structure actually looks like, with named seats, defined scope, and retirement history intact, not as a framework recommendation but as a running system.
