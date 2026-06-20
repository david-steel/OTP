---
title: An AI agent with too many permissions is not a productivity tool. It is a liability.
date: 2026-06-21
author: David Steel
slug: agent-permissions-and-least-privilege
type: founder_essay
status: published
series: ai-cio
series_part: 38
description: How to scope AI agent permissions using least privilege. A worked example from a real hybrid org that has retired an agent, limited every seat to one job, and put the whole fleet on one chart.
---

# An AI agent with too many permissions is not a productivity tool. It is a liability.

Most CIOs I talk to scope their AI agents the same way they scoped their first service accounts fifteen years ago: give the agent access to everything it might conceivably need, then restrict later if something breaks. Later never arrives.

The principle that solved the service-account problem is the same one that solves the agent problem. Least privilege. An agent gets exactly the permissions its defined job requires. Nothing more. The seat defines the permissions. The permissions define the blast radius.

That framing sounds simple. In practice it requires three things most organizations skip: a clear seat definition before deployment, a named owner who is accountable for what the seat does, and a live inventory so the CIO can see what every agent can actually touch.

Let me walk through what this looks like in a working system, because the abstract principle lands differently when you see it applied across a real fleet.

## The seat before the permissions

At Sneeze It we run roughly ten active agents on a single org chart alongside our human team. Before any agent goes live, the seat definition has to be locked. One seat. One job. One owner.

Radar is our chief-of-staff agent. Its job is daily briefings, calendar and task orchestration, and compiling shared state files for other agents to read. That means Radar has read access to Google Calendar, Slack, and the shared-state files in our Claude config directory. It does not have write access to GHL (our CRM). It does not touch billing. It cannot send email.

Dirk is our sales agent. Dirk has write access to GHL, but only through a wrapper script that requires an environment variable set explicitly: `GHL_WRITE_AUTHORIZED=dirk`. Without that variable in the environment, the wrapper fails closed and returns exit code 10. Dirk cannot read financial records. Dirk cannot access the call center data. Dirk cannot create calendar events.

Pepper is our email agent. Pepper reads Gmail and drafts responses. Pepper does not send without David's approval. Pepper has no access to GHL at all.

This is not a coincidence. These are intentional scope decisions, made at seat-definition time, enforced at the tool and wrapper level. The discipline is: if you cannot describe exactly what the seat needs, you cannot define what it can access.

Gartner has called agent identity, permissions, and lifecycle a core step in managing what they term "agent sprawl" (as reported by CIO.com, Apr 2026). That framing is correct. The sprawl problem and the permissions problem are the same problem viewed from different angles. Agents without scoped permissions are agents without defined seats. Agents without defined seats drift.

## The blast radius model

Here is the question I ask when scoping an agent's permissions: what is the largest mistake this agent could make without any human catching it, and how bad is that?

For Radar, the answer is "Radar writes a misleading briefing and David makes a bad scheduling decision." Recoverable. One day.

For Dirk, if permissions were not gated, the answer would be "Dirk deletes a CRM record for an active client." Not recoverable, at least not easily. That is why GoHighLevel is configured with three layers of protection: no delete scopes on the API token, deletes disabled at the admin level, and a wrapper that refuses any tool call containing "delete" or "destroy." Three layers because the blast radius of a CRM delete is unacceptable.

For our analytics agent Dash, the answer is "Dash reads data from an account we do not manage and reports it as our client's performance." So Dash has a hard-coded exclusion list and only reports on verified Sneeze It accounts. Read-only on the ad APIs. No write path exists.

The blast radius model replaces "what might this agent need?" with "what is the worst thing this agent can do, and is that acceptable?" Those are different questions and they lead to different permission scopes.

## Crystal, Arin, and the coordination problem

Some of our agents coordinate. Crystal is our project management agent, reading Accelo for job status, deadlines, and resource allocation. Arin is our call center manager, reading the CCM performance spreadsheet and drafting coaching messages for the human team. Both agents produce shared-state files that Radar reads during briefings.

The coordination creates a temptation to give each agent broader access so they can pull context from each other directly. We resisted that. Each agent has read access to its own data sources and write access only to its own shared-state output file. Agent-to-agent coordination happens through a structured message protocol using flat files at a defined directory path, not through shared database access or broad API permissions.

This matters because when an agent produces a bad output, the permission scope tells you exactly how far the damage can go. If Arin produces a bad coaching draft, the blast radius is a draft file that David reviews before it is sent. The damage cannot propagate upstream to the CRM or downstream to billing because Arin does not have those permissions. The isolation is a feature, not a limitation.

## The retirement that changed how we think about permissions

In April we retired Jeff, our first data integrity agent. Jeff's retirement came from a formal internal hearing. The honest finding was that Jeff's seat had never been earned, because its missions had been absorbed by other agents, and Jeff's reliability had degraded. We redistributed Jeff's capabilities to Dash and Dirk and closed the seat.

The permissions cleanup after Jeff's retirement was quick because Jeff's permissions had been scoped to the seat, not to a shared service account. We revoked the relevant API tokens, updated the wrapper config, and removed the shared-state file. Done.

Compare that to what most organizations deal with when they retire a service account that accumulated permissions over three years of "we might need this." The permissions are entangled. The account has access to things nobody remembers authorizing. The audit is a multi-week project.

Scoped permissions at seat-definition time make retirement clean. Broad permissions accumulated over time make retirement a risk event.

## What the CIO actually needs to implement this

Deloitte's State of AI in the Enterprise 2026 (verified, n=3,235) found that only 21 percent of enterprises have a mature governance model for agentic AI. The other 79 percent are running agents without the structures that make permissions auditable.

The structure is not complicated. It has four parts.

First, a seat definition before any agent is deployed. Name, role, one-sentence job description, accountable human owner. If you cannot complete this card, you cannot deploy the agent.

Second, permissions scoped to the seat at the tool and wrapper level. Not at the agent level in a policy document. At the tool level, enforced by code, so that the agent physically cannot exceed its scope even if it tries.

Third, a live inventory. Right now, this week, what agents are running, what they can access, and who is the named owner. Gartner's step two of their six-step agent sprawl framework names this explicitly: a centralized agent inventory. The inventory is what makes the quarterly audit possible. Without it, you are auditing memory, which is not auditing anything.

Fourth, a retirement protocol. When a seat closes, permissions are revoked, the shared-state files are cleaned up, and the record is kept. Not archived and forgotten. Kept, because the retirement is evidence of a working governance process.

None of this requires a new platform. All of it requires a decision about who owns the discipline. In the MIT CISR research on AI governance, the framing is clear: human accountability is non-negotiable, and that accountability has to be assigned to named people, not to "the AI committee."

## The principle underneath the practice

The reason least privilege works for AI agents is the same reason it works for service accounts and for humans. When you cannot do more than your job requires, your failures are contained. When your failures are contained, they are diagnosable. When they are diagnosable, you can fix them.

The goal at Sneeze It is to let agents carry the operational work, so people are free for the work that matters. That only holds if the agents are trustworthy. And trustworthy does not mean perfect. It means scoped. When an agent makes a mistake inside a well-defined permission boundary, we find it fast, we fix it, and the rest of the fleet keeps running. When an agent makes a mistake outside any permission boundary, we find it late, we pay for it, and we spend weeks reconstructing what happened.

Scope the seat first. Then scope the permissions to match. The permissions are not a security feature bolted on after deployment. They are the operating design of the seat.

## See the live chart

Every agent seat at Sneeze It, including its role and position in the org, is queryable from the OTP MCP.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me every agent seat at sneeze-it and who owns each one."*

You will see named seats, named human owners, and the one-seat-one-owner structure that makes permission scoping auditable. That is the live version of the framework described in this post.
