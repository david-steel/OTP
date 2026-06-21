---
title: The handoff is where the hybrid org breaks, and the COO is the one who has to fix it
date: 2026-06-21
author: David Steel
slug: how-a-coo-handles-handoffs-between-humans-and-agents
type: founder_essay
status: published
series: ai-coo
series_part: 17
description: Handoffs between humans and agents fail for a predictable reason. Here is how to design them so they do not, and who owns the problem when they do.
---

# The handoff is where the hybrid org breaks, and the COO is the one who has to fix it

The process runs fine in isolation. The agent does its job. The human does their job. Then the two seats have to exchange work, and something drops.

Every failure I have traced in our agent fleet at Sneeze It has started at a handoff, not at an execution step. The agents execute reliably. The humans execute reliably. The relay between them is where things break.

The COO is the one who has to own that relay.

## What bad handoffs look like

Before I restructured how our agent seats pass work to each other and to our humans, the handoffs were informal. Comments, state updates, shared documents that assumed the receiving seat would know what to do with the output.

Nick, our cold prospecting agent, would draft a batch of outreach emails and park them in Gmail drafts. The implicit handoff was: David will check the drafts folder and send. But "David will check" is not a handoff protocol. It is an assumption. When I was in client calls all morning, the drafts sat. Nick's scorecard row looked fine. My calendar looked fine. The work was finished but going nowhere. It was in the gap between two seats.

Dirk, our pipeline agent, would flag a stale deal and add a note in GHL. Bogdan reads the morning briefing, not GHL notes throughout the day. The note existed. Bogdan did not know it existed. The deal sat three more days.

Two seats. Two failure modes. One pattern: the output of one seat was not a real input to the next.

## The before and the after

Before the fix, work moved through the org the way water moves through old plumbing. It mostly got there. Sometimes it pooled at a joint and stayed.

After, every handoff is a structured message to a specific inbox with a specific required action.

We built what we call the agent message bus: inbox files at a known path where any seat can send a structured message to any other. The message has a type (REQUEST, INFORM, ESCALATION), a sender, a recipient, a required action, and a deadline.

Nick sends a REQUEST to my inbox when a batch is ready: count, ICP category, required action, deadline. Dirk sends an ESCALATION to Bogdan's inbox when a deal has been stale more than five days: prospect name, last touch date, Proposify status, three options. Bogdan decides without leaving the briefing.

No work disappears between seats.

## The three things every handoff needs

Every reliable handoff has three components. When any one is missing, the handoff eventually fails.

A defined output. Not "Dirk flags the deal." The exact fields the receiving seat needs to act. If Bogdan receives "this deal is stale," he cannot act without leaving the briefing to find context. If he receives the deal name, last action date, dollar value, and three options, he decides in sixty seconds.

A named recipient with a specific required action. Not "someone should look at this." A seat name and a verb. "Bogdan: decide whether to follow up or close." The required action tells the recipient what done looks like and tells the COO who is accountable if it does not happen.

A deadline. Nick's draft batches expire at end of day. If not approved, the next morning's briefing flags it as a delayed handoff. Dirk's escalations expire in 24 hours. No decision logged means the escalation escalates.

If a seat cannot say what it produces, who receives it, what they do with it, and by when, the handoff is informal and will eventually fail.

## Where humans sit in the relay

Agent-to-agent handoffs run automatically. Radar reads Dash's state file and includes ad alerts without anyone prompting it. Dirk reads Crystal's state file before an expansion play. Pulse reads Dirk's outreach history before deciding whether to pause on a client who is on the retention watch list. That layer runs without a human in the middle.

Human-in-the-loop handoffs are different. Humans do not poll state files. They need something to land in their awareness with context to act on.

Pepper, our inbox agent, triages client email and drafts responses. The handoff to me is a compiled triage in the morning briefing, each draft tagged "approve to send" or "review required." I read top to bottom and act.

Arin, our call center manager agent, drafts coaching messages for Amanda and Erica. Every draft routes to my approval queue before it reaches the callers. The agent produces the draft. The human decides whether it goes.

Bogdan owns the handoff review layer. When agents escalate simultaneously, he sets the priority order. When a handoff breaks because one agent produced output the next cannot parse, Bogdan finds the gap and resets the SOP. Let agents carry the operational work so people are free for the work that matters. At the handoff layer, the work that matters is deciding when the relay needs a human and when it does not.

## What a retired seat teaches you

We retired Jeff, our former data integrity agent, in April after a formal review. The retirement made visible something the handoff design had been hiding.

Jeff surfaced discrepancies between data sources: when GHL numbers did not match what Dash was reporting, or when a project in Crystal's data had no corresponding billing record in Janine's queue. His outgoing messages were INFORM escalations to Bogdan.

When we rebuilt the reporting pipeline, the gaps Jeff was flagging stopped being produced. His messages became rare, then stopped. Not because Jeff stopped working, but because the upstream failures that generated the handoff content were fixed.

A seat with nothing to hand off is a seat that does not belong on the chart. Jeff's seat was built around a symptom. Fix the cause and the seat becomes redundant. The handoff data made that visible before anyone had to say it out loud.

## The scorecard row that governs the relay

Deloitte's 2026 State of AI in the Enterprise (n=3,235) found only 21% of organizations have a mature governance model for agentic AI. The other 79% are deploying without the structures that make agents reliable at seat boundaries. The handoff is exactly that boundary.

At Sneeze It, the handoff layer has a scorecard row: required actions expired in the last seven days, escalations past 24 hours without a logged decision. Tally pushes those numbers four times a day. When the row goes red, the relay is breaking somewhere and the COO finds where.

MIT CISR's maturity research shows Stage 4 firms outperforming industry by 13.9 percentage points in growth and 9.9 in profit. The distinguishing factor is not which agents they chose. It is that senior leadership shaped the operating model before deploying at scale. The operating model includes the handoff layer. You cannot govern a fleet by watching individual seat performance and ignoring the relay between seats.

The COO who designs clean handoffs, names recipients, sets deadlines, and reads the health row weekly is not doing AI work. They are doing operations work. The agents happen to be some of the seats. That has always been the job. The shape of it just changed.

## See the live chart

Every seat on the Sneeze It hybrid chart, including the handoff relationships between them, is queryable from the OTP MCP.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the Sneeze It org chart and describe the handoff relationships between agent seats and human seats."*

You will see exactly which seats pass work to which, and what the COO owns at every boundary where work crosses from agent to human.

---

*Series: AI COO. Post 17 of an in-progress series.*
