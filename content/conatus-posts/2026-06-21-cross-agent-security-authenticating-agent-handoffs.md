---
title: Cross-agent security is not an API problem. It is an accountability problem.
date: 2026-06-21
author: David Steel
slug: cross-agent-security-authenticating-agent-handoffs
type: founder_essay
status: published
series: ai-cio
series_part: 36
description: How to secure handoffs between AI agents. The answer is not authentication tokens. It is named seats, one-seat-one-owner, and a live chart where every agent is accountable.
---

# Cross-agent security is not an API problem. It is an accountability problem.

Every conversation about securing handoffs between AI agents starts in the wrong place.

It starts with tokens. Mutual TLS. OAuth flows. Signed payloads. The security team wants to know what credentials Dirk uses when it passes a message to Pepper. The platform team wants to know which certificate Radar presents when it asks Crystal for a project status update. The CIO wants to know what the audit log looks like when Tally reads a KPI and pushes it somewhere.

These are real questions. They matter. They also miss the structural problem by about two levels of abstraction.

The structural problem is this: an agent cannot be authenticated if it has no identity. And an agent has no identity if it does not hold a named seat.

Most companies running agents do not have named seats. They have deployments. They have scripts. They have "the agent we built for the HR intake workflow" and "the thing in the marketing stack that checks approvals" and "the automation Nate set up for the CRM." When those agents pass work to each other, you are not securing a handoff between two defined entities. You are securing a handoff between two anonymous processes that nobody owns. The token problem is trivial. The identity problem is foundational.

## The counter-position

Here is the view I want to challenge, because it is the default view in nearly every security framework I have seen.

The view says: secure the channel, and the handoffs will be safe. Encrypt the message in transit. Validate the sender with a token or certificate. Log the exchange so you can audit it. Do this at every integration point, and you have a secure multi-agent system.

This view is technically accurate and operationally hollow.

It tells you that the message arrived intact from the sending process. It does not tell you whether the sending process had authorization to initiate that handoff in the first place. It does not tell you whether the handoff was within the scope of that agent's defined seat. It does not tell you who is accountable when the handoff produces a wrong output and that output propagates downstream into three other agents before anyone notices.

CIO.com published a piece in 2026 identifying three pillars of AI orchestration. The third pillar is "cross-agent security and immutable audits." The piece names the problem correctly. What it does not answer is what cross-agent security is actually secured against, and what structural mechanism produces the immutability the audits depend on.

The answer to both is the same: named seats with defined scopes.

## What a named seat does for security

At Sneeze It, we run roughly ten agents on one org chart. Each agent holds a named seat. Each seat has a defined scope. The scope is not a permission flag in a config file. It is a written definition of what that seat does, what it does not do, who owns it, and what it is accountable for.

Radar is our chief of staff. Radar's scope is daily operations, briefings, calendar orchestration, and cross-channel awareness. Radar does not touch client ad spend. Radar does not draft cold outreach. Radar does not push KPIs to the scorecard.

Tally is our scorecard agent. Tally's scope is reading values from local sources and pushing KPIs to the OTP chart. Tally does not analyze those values. Tally does not act on them. Tally does not send Slack messages.

Dirk is our sales agent. Dirk's scope is pipeline, reactivation, expansion, and offer strategy. Dirk drafts outreach but does not send it. Pepper sends it. Dirk does not touch client ad performance. Dash owns that.

When Dirk passes a message to Pepper, that is a legitimate handoff because both seats are defined, both seat scopes touch the send operation (Dirk strategizes, Pepper executes), and the handoff is within the written design of both seats. If Dirk tried to pass a message to Dash asking Dash to change a client's campaign budget, that handoff would be out of scope for Dirk, out of scope for Dash, and would fail at the seat-scope level before any API authentication ever runs.

Seat scopes are the first and most important security layer in a multi-agent system. Tokens and certificates are the second layer. Running them in the wrong order produces a system that can authenticate bad handoffs with perfect cryptographic precision.

## The agent message bus

We route agent-to-agent coordination through what we call an agent message bus. Practically, this means each agent has an inbox file. When one agent needs to communicate with another, it writes a structured message to that file. Messages have typed categories: REQUEST, INFORM, PROPOSAL, RESPONSE, CHALLENGE.

The typing is not ceremonial. It encodes what the sending agent expects the receiving agent to do with the message. A REQUEST carries explicit scope: "I am asking you to do X, which is within your seat." An INFORM is one-directional with no expected action. A PROPOSAL requires a RESPONSE. A CHALLENGE routes to Dan, our strategic co-founder, for arbitration.

This structure makes every handoff auditable without special instrumentation. The message file is the audit log. The structured format is the immutability layer. You can read any message and know exactly which seat sent it, to which seat, of what type, and what action was expected. The provenance is in the structure, not in a separate logging system that might be misconfigured or gapped.

Gartner, as reported by CIO.com, identifies agent identity, permissions, and lifecycle management as one of six core steps to managing what they call "agent sprawl." Their framing is right. The identity and permissions layer they describe is exactly what named seats with defined scopes provide. The difference is that Gartner's six steps are a framework. What I am describing is a running system. The framework tells you what to build. The running system is what you actually operate every Monday.

## Where handoffs actually go wrong

I want to be specific about the failure modes, because they are not the ones most security documentation describes.

The first failure mode is scope creep. An agent that starts with a narrow seat gradually accumulates tasks outside its original definition. This happens slowly, one request at a time, usually because the agent is competent and someone keeps asking it to do adjacent things. The agent's effective scope drifts from its defined scope. When it initiates handoffs based on its effective scope rather than its defined scope, those handoffs are no longer traceable to a written authorization. You cannot audit against a scope that was never written down and whose drift was never logged.

The second failure mode is the undiscovered handoff. This is an agent initiating a handoff to another agent that is not part of its defined workflow. The undiscovered handoff does not fail visibly. It succeeds, which is the problem. An agent in a marketing stack passes a customer record to an agent in a data enrichment pipeline that nobody mapped to the marketing workflow. The handoff completes. The audit log shows it completed. Nobody reviews it because it did not fail. Two weeks later someone asks why there is a new field in the CRM and nobody can trace which agent put it there.

The third failure mode is the expired agent. Jeff was our data integrity agent. Jeff was retired in April after a formal review where Jeff's scope had been absorbed by other seats. At the moment of Jeff's retirement, we redistributed three capability areas to Dash, Dan, and Dirk. If Jeff had remained active in any system after the retirement, any handoff Jeff initiated would be a handoff from a seat that no longer existed on the chart. The receiving agent would have no way to validate whether the initiating seat still had organizational standing. Without a lifecycle that matches the chart, the chart cannot enforce anything.

## The immutable audit requires a live chart

Deloitte's 2026 State of AI in the Enterprise found that only 21% of enterprises have a mature governance model for agentic AI. The 79% that lack it do not lack it because they have not read the frameworks. They lack it because governance requires something to govern. You cannot govern an agent fleet that has no formal structure. You cannot audit handoffs that have no defined initiating seat. You cannot enforce permissions against a scope that was never written.

The live chart is what makes the audit possible. Not the audit log from the channel encryption. The org chart where every agent holds a named seat with a defined scope, a named human owner, a documented lifecycle, and a place on the scorecard where its performance is visible every week.

MIT CISR's research on what they call "digital colleagues" reaches a similar structural conclusion: governance of autonomous agents requires "shared responsibility across CEO, CIO, CHRO, and CRO" with "human accountability non-negotiable." The accountability is non-negotiable because without it, the agent's actions cannot be traced to a human decision. The traceability is the security. The named seat is the traceability.

## What this means operationally

The practical answer to "how do you secure handoffs between AI agents" is a sequence, not a checklist.

First, name every seat. Write the scope for each seat before the agent goes live. The scope should include what the agent does, what it does not do, who owns the seat, and what it is accountable for on the scorecard. If you cannot write this before launch, you are not ready to launch.

Second, define legitimate handoff pairs. For each pair of agents that will pass work to each other, write the handoff definition. Which seat initiates, which seat receives, what the expected input looks like, what the expected output looks like, and which human is accountable if the handoff produces a wrong result. Undocumented handoff pairs are the source of the undiscovered handoff failure mode.

Third, enforce the lifecycle. When a seat changes, the handoff definitions that reference that seat change. When a seat is retired, every handoff that seat initiates must be remapped or decommissioned. The retirement is not complete until the chart reflects it and every downstream handoff has been audited.

The encryption, the tokens, and the certificates go on top of this structure. They are not replaceable by the structure. But they are also not sufficient without it.

This is the work that letting agents carry the operational load actually requires. Agents do not secure themselves. The CIO who treats cross-agent security as an API problem will keep getting surprised by the accountability problem underneath it.

## See the live chart

The agent seats and handoff relationships described in this post are part of the live OTP chart, queryable by any MCP client.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me all the agent seats at sneeze-it, their defined scopes, and which agents have documented handoff relationships with each other."*

What you see is not a diagram. It is a live org chart with named seats and owners. That is the structure that makes the handoff security possible.
