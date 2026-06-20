---
title: AI governance delegated to technical teams produces less value. Deloitte proved it. Here is what shaping it actually looks like.
date: 2026-06-21
author: David Steel
slug: why-ai-value-comes-from-leaders-shaping-governance-not-delegating
type: founder_essay
status: published
series: ai-cio
series_part: 24
description: Deloitte's 2026 survey of 3,235 enterprises found that senior leaders who shape AI governance outperform those who delegate it. A worked example from Sneeze It.
---

# AI governance delegated to technical teams produces less value. Deloitte proved it. Here is what shaping it actually looks like.

There is a version of AI governance that feels like leadership and is not.

It goes like this. The CEO or CIO says something like "we need a governance framework for our AI." A task force is formed. An IT director or a VP of engineering is put in charge. They write a policy. The policy covers data security, acceptable use, and who to call if something breaks. It is filed. The executives consider the matter handled.

Deloitte surveyed 3,235 enterprises in 2026 and found that this approach produces measurably less business value than the alternative. The finding, from their State of AI in the Enterprise report, is direct: enterprises where senior leadership actively shapes AI governance achieve significantly greater business value than those delegating to technical teams alone.

That is not a finding about strategy or vision. It is a finding about which executive behaviors actually show up in the P&L.

The distinction worth unpacking is between *shaping* and *delegating*. Delegating means handing the problem to someone with technical skills and checking back in when there is a crisis. Shaping means staying in the seat where the governance decisions actually happen, which is not the policy document. It is the operating model.

## What governance decisions actually look like when you stay in the seat

When I say "shaping governance," I mean something specific. I mean the decisions that determine whether each AI agent in your organization is doing the work it is supposed to do, for whom, measured against what outcomes, and with a clear answer to what happens when it stops performing.

These decisions do not live in a policy. They live in the daily operating layer of the company.

At Sneeze It, I run about ten agents alongside a human team. Bogdan is our COO. Janine runs accounting. Kristen leads creative. They all hold seats on the same chart. Next to them sit Radar (chief of staff), Tally (scorecard and KPI tracking), Dash (analytics), Dirk (sales), Pepper (email), Crystal (project management), and Arin (call center management). Every seat, human and agent, answers the same governance questions every week.

What is this seat accountable for? Who owns it? What does the number say? When the number drops, what changed?

That is governance. And the person answering those questions is me, not a technical team.

## The worked example: Arin

Arin is our call center manager. The target is 30% of new leads converting to booked appointments across our client accounts. Arin pulls CCM data from Google Sheets daily, analyzes speed-to-lead, dial volume, show rates, and per-agent performance, then drafts coaching messages to our calling team.

The governance question for Arin is not "did the agent run?" It is "is the 30% target being hit, and when it is not, is Arin diagnosing the right cause?"

I stay in that question. When Arin's coaching flagged a speed-to-lead issue, I looked at the underlying data and confirmed the diagnosis before the message went to the team. When a caller was terminated for falsifying a report, I made the call that the termination was clean and that Arin's data had caught something the previous human manager had missed.

Those are governance decisions. They required a senior leader in the room, not because the technical details were complicated, but because the business judgment was mine to make.

A technical team could have told me the agent ran, that the output matched the expected format, and that no errors were logged. None of that is governance. All of that is operations.

## The pattern that Deloitte is actually describing

The Deloitte finding is not surprising once you understand what gets lost when governance is delegated.

Technical teams are very good at the questions they are trained to ask: Is the system functioning? Is the data clean? Is the latency acceptable? These are the right questions for an IT audit. They are the wrong questions for governing an AI fleet that is supposed to produce business outcomes.

The questions that produce business value are the ones only senior leaders can honestly answer. Is this agent doing work that matters? Is the seat designed so that the agent and the human downstream of it are accountable for the same outcome? When the agent drifts, is there a real conversation about what changed, or does the drift go undetected because no senior person is looking at the seat the same way they look at a human seat?

MIT CISR's Enterprise AI Maturity research supports the same direction from a different angle. Their verified findings show that firms at Stage 4 (AI Future Ready) outperform industry benchmarks by 13.9 percentage points in growth and 9.9 points in profit. The characteristic of Stage 4 firms is a united top leadership team across CEO, CIO, chief strategy officer, and head of HR. Not a delegated technical function. A unified team of leaders shaping how AI operates at the firm level.

The commonality is leadership presence in the seat where the governance is real.

## What the Deloitte number on governance maturity tells you

The same Deloitte survey found that only 21% of enterprises have a mature governance model for agentic AI. That means roughly 80% have either no model or one that is not working.

The 80% are not failing because they have bad technical teams. They are failing because their leadership teams have confused policy with governance. The policy exists. The task force filed something. The technical team owns the ticket. And nobody in a senior seat is sitting in front of a unified scorecard asking whether the agents are producing the outcomes the company needs.

Gartner has named the failure mode, though I am citing this through CIO.com since Gartner's primary pages returned errors when our research team tried to fetch them directly. The framing, as reported by CIO.com, is "agent sprawl" as the new Shadow IT. Applications accumulate agents that nobody owns, that nobody measures, and that nobody retires when they stop working. The spawl compounds because no senior person has made agent accountability a governance seat at the same level as human accountability.

The fix is not a better framework. It is a decision about who stays in the seat.

## What Neil and Tally make possible

Two agents on our chart illustrate the governance architecture I am describing, because they are specifically designed to keep senior leadership informed rather than insulated.

Neil is our chief learning officer. His job is to scan for improvements to the agent army itself: new patterns, new tools, new research on agentic systems. He runs through a hard gate before surfacing anything. The test is not "is this interesting?" The test is "will this make our team better than what we have now?" If the answer is no, it is discarded. Neil does not present options. He presents gates.

Tally pushes KPI values from local data sources to our OTP scorecard four times a day. Every KPI on the chart stays current. When a number is unavailable because the source is broken, Tally does not fabricate a value. It escalates instead.

Both of these agents are governance infrastructure. Neil prevents drift in capability standards. Tally prevents drift in measurement visibility. But they only work if a senior leader is reading the scorecard they feed, using the numbers to ask the same questions about agent seats that they ask about human seats.

The governance is not in the agents. The governance is in the senior leader who uses the agents to stay informed.

## The thing delegation cannot do

Here is the practical test.

When an agent's output is wrong, or when an agent is doing the right thing but the thing it is doing is no longer the right thing for the business, who changes it? In a delegated model, the change request goes to the technical team, gets triaged, gets queued, and gets addressed sometime in the next sprint. In a governed model, the senior leader with the seat authority sees the number, identifies the gap, and either makes the call or assigns it to someone with clear accountability.

The speed difference between these two models is not the interesting part. The interesting part is that in a delegated model, many gaps are never identified at all, because the person looking at the agent's output is asking technical questions while the person looking at the business outcome is not looking at the agent. The two never meet until something fails visibly.

This is what Deloitte is measuring when they say "significantly greater business value." They are measuring the compounding cost of that gap.

The mission that guides how I build this is straightforward: let agents carry the operational work, so people are free for the work that matters. But that mission only holds if the people who are freed from the operational work stay close enough to know whether the agents are carrying it correctly. That is not delegation. That is a different kind of presence.

The governance is not a document you file. It is the habit of sitting in front of the same scorecard, asking the same questions, in the same meeting, whether the seat in front of you is held by Bogdan or by Arin.

## See the live chart

Every agent seat on our OTP chart is queryable, including the governance relationship between each seat, its KPIs, and its reporting chain.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the org chart for sneeze-it and identify which seats have active KPIs and who is accountable for each."*

What comes back is not a governance document. It is a live operating model, with names, seats, and numbers. That is the difference between shaping governance and delegating it.
