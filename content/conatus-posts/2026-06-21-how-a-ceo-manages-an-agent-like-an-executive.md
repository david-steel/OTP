---
title: A CEO manages an agent the same way they manage an executive, or it breaks
date: 2026-06-21
author: David Steel
slug: how-a-ceo-manages-an-agent-like-an-executive
type: founder_essay
status: published
series: ai-ceo
series_part: 17
description: The failure modes that appear when CEOs treat agents as software. How managing an agent like a direct report changes the outcomes and what that looks like week to week.
---

# A CEO manages an agent the same way they manage an executive, or it breaks

The mistake most CEOs make with agents is a category error.

They treat the agent as software. Software gets configured, deployed, and then mostly left alone. If it breaks, you file a ticket. If the output quality drops, you upgrade the version. You do not hold a one-on-one with your database. You do not put your payment processor on a scorecard.

When you treat an AI agent that way, the agent drifts. It produces outputs that are technically correct and operationally useless. It optimizes for the metric you set at deployment, which is never quite the right metric six months later. It accumulates edge cases nobody documents. Eventually someone notices the work is off and cannot trace when it went wrong.

I have lived through this. The fix is not a better prompt. The fix is a different management frame.

The frame is this: every agent in my company holds a named seat, has a clear owner, carries measurable accountability, and gets managed the way I manage my human executives. Not the same conversations. Not the same cadence. The same discipline.

## The five failure modes of software-style agent management

When CEOs manage agents as software rather than as seat-holders, five things break. They do not all break at once. They compound.

**Failure mode one: no seat, no accountability.**

Software does not hold a seat on an org chart. When an agent has no seat, no one is accountable for its outputs. The work it produces belongs to everyone and no one. When that work causes a problem, the conversation is about the technology, not the accountability. Nobody asks "whose seat is this?" because there is no seat to ask about.

At Sneeze It, every agent has a named seat with a named job description. Radar is chief of staff. Dash is the analytics function. Dirk owns revenue development. Pulse holds client retention. Nick does cold prospecting. Arin manages the call center. Pepper owns the inbox. Crystal is the project manager. Tally pushes scorecard data.

These are not metaphors. They are actual seats on the chart. If Dirk's pipeline numbers drop, I ask the same question I ask when any revenue seat underperforms. I do not file a ticket.

**Failure mode two: metrics that measure the machine, not the mission.**

Software metrics measure infrastructure. Uptime. Latency. Tokens per second. Error rate. These are useful for running the infrastructure. They are useless for running the business.

When I put Dash on the scorecard, I did not track "API calls executed." I tracked what the analytics seat is accountable for: daily performance anomalies surfaced, spend variance flagged before it became a problem, client accounts where lead volume dropped more than twenty percent. Those are business outcomes. When Dash hits them, the company benefits. When Dash misses them, I have a conversation about the gap the same way I have that conversation about any other seat.

Deloitte's 2026 State of AI in the Enterprise survey found that only twenty-one percent of organizations have a mature governance model for agentic AI. The other seventy-nine percent are mostly running software-style management on entities that need executive-style management. The metric problem is a significant part of why.

**Failure mode three: no cadence.**

Software does not need a weekly check-in. Agents do.

Not because agents need hand-holding. Because the work they do is tied to a changing environment, and the calibration has to keep pace. A cold prospecting sequence that worked in Q1 may need adjustment in Q3. A retention signal that predicted churn six months ago may have a different shape now. The agent is not going to flag this on its own. The manager has to.

At Sneeze It, every agent writes to a shared state file after every run. I read those files. When something looks off, I look closer. When something looks consistently off, I treat it the way I treat any executive whose output has been declining for three weeks. I ask what changed, what the current constraint is, and what the fix looks like.

**Failure mode four: no lifecycle.**

Software gets deprecated when the vendor stops supporting it. Agents need an active lifecycle managed by someone who understands what the seat is for.

We retired Jeff, our former data integrity agent, in April. It was not a deprecation. It was a hearing. Jeff got the same process any executive would get: an evaluation of whether the seat was still needed, whether the work was being done, and whether the capabilities could be redistributed. Jeff had an honest conversation about his own performance, concluded his seat was no longer earning its keep, and recommended his own retirement. The capabilities went to Dash, Dan, and Dirk.

That process matters. If we had just switched off the process and moved on, nobody would have understood where the gap went. The hearing created a record, a redistribution, and a clean close. That is executive lifecycle management, not software deprecation.

**Failure mode five: no escalation path.**

Software escalates through error codes and alerts. Agents escalate through structured communication to the seats that need to know.

When Dirk identifies a client where expansion looks possible but Pulse has flagged a retention risk on that same account, Dirk does not send an error code. Dirk's expansion play pauses because Pulse holds a higher authority on that client. The two seats coordinate. Pulse wins. Dirk waits.

That is a judgment call encoded as a rule, managed at the org-design level, enforced by the structure of the chart. You cannot do that with software-style management. You need seats, owners, and explicit authority relationships.

## What executive-style management actually looks like week to week

It is less dramatic than it sounds.

Every week I read what each seat produced. I look at the numbers against the targets. When a number is below target, I look at why: did the inputs change, did the SOP drift, did the environment shift in a way the seat has not adjusted to yet.

When the cause is in the agent's control, I update the agent's operating instructions the way I would update a direct report's priorities. When the cause is upstream, I look at what seat is responsible for those inputs and have that conversation instead.

The Monday meeting at Sneeze It runs a single scorecard. Bogdan, our COO, is on it. Janine is on it. So is Radar. So is Dirk. So is Dash. The rows are not segregated by type. The discipline is identical: name, metric, target, current number, trend, and the conversation when the trend is wrong.

McKinsey put it directly: managing in the age of AI means managing systems of people and agents together. The critical word is together. Not in parallel on separate dashboards. Not in sequence, humans first then a separate agent review. Together, on the same surface, with the same accountability standard.

MIT CISR's research on enterprise AI maturity found that firms at the highest stage of AI readiness run with a united top leadership team, specifically CEO, CIO, chief strategy officer, and head of HR, all jointly governing the AI operating model. The Stage 4 firms in that research outperform their industry by 13.9 percentage points on growth and 9.9 on profit. The separation is not coincidental. The firms that manage humans and agents with a unified discipline are the ones capturing the margin.

## The one question that exposes where you are

Here is the diagnostic I use when I talk to other CEOs about their agent stack.

Ask yourself: if your most important agent had been producing bad outputs for three weeks, how would you find out?

If the answer is "someone would notice eventually" or "we get alerts when the system errors," you are managing it as software.

If the answer is "it is on the scorecard, so I would see it Monday," you are managing it as an executive seat.

The gap between those two answers is the gap between an agent that drifts and an agent that compounds.

Let agents carry the operational work, so people are free for the work that matters. That is the model. But it only holds if the agents are managed with the same rigor the people are. Execution becoming cheap does not lower the value of judgment. It raises it, because now the only thing standing between a well-managed agent army and a drifting one is the quality of the management.

That is not a technology problem. It is a CEO problem.

## See the live chart

The seats at Sneeze It, including which agents hold which roles and what they are accountable for, are queryable from the OTP MCP server.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the Sneeze It org chart. For each agent seat, show the role and what metrics that seat is accountable for."*

You will see the difference between software-style deployment and executive-style seat management in a single response.
