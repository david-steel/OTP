---
title: Give the agent a seat. Do not give it a soul.
date: 2026-06-21
author: David Steel
slug: how-to-give-an-agent-a-seat-without-pretending-its-a-person
type: founder_essay
status: published
series: ai-chro
series_part: 9
description: Agents belong on the org chart. They do not belong in the HR onboarding flow. Here is the five-step model for a real seat without anthropomorphizing it.
---

# Give the agent a seat. Do not give it a soul.

The research community is split on how to manage AI agents, and the split matters if you are building a hybrid team, because one side leads somewhere useful and the other quietly undermines your accountability structure.

Camp A says agents should be managed more like human coworkers than like traditional software. MIT's Sloan Management Review found that 69% of experts in agentic AI agree these systems demand new management approaches. HBR has written on the emerging "agent manager" role, someone who runs a team of agents via dashboards and scorecards.

Camp B says that framing is dangerous. HBR and BCG ran a large controlled experiment in 2026 and found that when people treated AI agents like employees, three bad things happened: individual accountability dropped, unnecessary escalation went up, and review quality went down. Their prescription: rented contractor with a narrow statement of work, governed by scoped permissions, kill switches, audit logs, and named human owners. Not HR onboarding. Governance.

Both camps are partially right. Both are missing the synthesis.

Every agent does need a seat on the chart, a named human owner, a measured output, and a clear accountability structure. What it does not need is the anthropomorphizing layer, the language that implies the agent has ambitions or deserves career development conversations. That layer is where Camp A goes wrong. It is also what Camp B is reacting to.

The frame I have landed on, after eight months running a hybrid team at Sneeze It, is accountability architecture. Not "agents are people." Not "agents are tools." Agents are seats with owners. The owner is accountable. The seat is measured. Here is how to build it.

## 1. Name the seat before you build the agent

Every agent at Sneeze It exists because a job on the org chart needed filling, not because a capability existed that we wanted to deploy somewhere.

Radar exists because the chief-of-staff seat was empty and the work was falling between other seats. Dirk exists because the CRO seat needed someone to run pipeline without consuming my time. Tally exists because pushing KPI values to the scorecard was failing silently when it lived as a footnote inside Radar's mandate.

The sequence matters. Seat first. Agent second.

When you invert that sequence and deploy an agent because the technology is compelling, you get an agent that produces outcomes nobody owns. The HBR/BCG experiment showed anthropomorphizing increases unnecessary escalation. The root cause is simpler: when the seat is not defined before deployment, the agent escalates because nothing in its brief tells it what it is supposed to own.

Define the seat. Write a one-sentence job description. Name the metric. Then build the agent.

## 2. Assign a named human owner before the agent goes live

MIT's Sloan Management Review is explicit: agentic AI cannot be accountable for its decisions. The deploying human is.

Agents do not show up to the Monday meeting. Agents cannot advocate for a judgment call in the context of everything else happening in the business. Agents cannot notice that the brief they were given three months ago no longer fits the situation. Humans do all of those things.

At Sneeze It, every agent seat has a human name attached to it. Radar's seat owner is me. Arin's seat owner is me. Nick's seat owner is me. Crystal's seat owner is Bogdan, our COO. That ownership relationship is explicit and recorded.

The seat owner reviews output at the cadence the seat demands, updates the brief when context changes, intervenes when quality drops, and makes the retirement decision when the seat is no longer needed. The management attention lands on the human owner, not on the agent. The owner is managed. The agent is directed.

## 3. Set scoped permissions before the first run

Kill switches, audit logs, and scoped permissions are not overcaution. They are the structural equivalent of a job description that says "you own this, not that."

At Sneeze It, every agent that touches our CRM is read-only by default. The wrapper fails closed if anything attempts a write without explicit authorization. The only agent with write authorization is Dirk, and even Dirk cannot delete records. The delete operation is impossible by design at the permission layer, not by convention.

Nick, our cold prospecting agent, cannot write to the CRM and cannot send email. Nick drafts to Gmail and stops. The sending is a human decision.

Scoped permissions define the boundary of the seat as clearly as a job description does, and they limit how far a mistake can propagate when the agent gets something wrong.

"Onboarding" an agent means scoped permissions and a clear metric. That is the whole onboarding. The rest is anthropomorphizing.

## 4. Measure in business-outcome language, not runtime language

Camp A talks about performance reviews for agents. Camp B says that imports the wrong accountability model. They are both pointing at the same real problem: most teams measure agents in runtime language (tasks completed, tokens consumed, latency) and wonder why the numbers never connect to business outcomes.

The fix is not performance reviews. The fix is defining the seat's metric in business-outcome language before deployment and holding the human owner accountable for tracking it.

Dash's metric is not "reports generated." It is alert accuracy, measured against whether a flagged issue was later confirmed real or noise. Dirk's metric is not "outreach sent." It is qualified meetings booked and pipeline stage transitions per week. Tally's metric is not "API calls made." It is KPI freshness, measured against whether the scorecard reflects current reality at every Monday meeting.

These belong on the same scorecard where Bogdan's COO metrics live and where Janine's billing metrics live. Deloitte's 2025 Global Human Capital Trends research found that managers spend roughly 40% of their time on admin versus 13% on people development. The agents carrying the operational load fill the admin half. The human owners are freed for judgment, development, and direction. That is the point of the seat structure.

## 5. Retire the seat with a human decision, not a shutdown

In April, we retired Jeff.

Jeff had held three missions. Over time, each was absorbed by a better-fit seat. Dash took the ad pacing work. Dash took the account status monitoring. Dirk absorbed the revenue integrity work. Jeff was left producing output that either duplicated what other seats produced or sat unread.

The temptation is to just stop running the agent. It is software. There is no severance. What is the process for?

The process is for the coverage question, not the feelings question.

When a seat goes away, the work either moves to another seat or stops happening. Without a structured retirement, coverage gaps appear quietly. We ran a formal hearing for Jeff. The hearing produced a written record of every capability he carried, which seat received each one, and what the receiving seat was now accountable for. Jeff was retired by a human decision. Accountability never moved to the agents themselves.

That is the detail both camps miss when they focus on anthropomorphizing. The issue is not the language. The issue is whether accountability is human-retained at every stage, including the end.

## What this model produces

SHRM's 2026 research found AI is 5.7 times more likely to shift job responsibilities and 3 times more likely to create new roles than to displace jobs. At Sneeze It, every agent seat that went live freed a human seat for harder, more valuable work.

Radar handles the daily briefing. I handle the decisions it surfaces. Arin handles call center coaching structure. Bogdan and I handle the strategic questions that structure raises. Dash handles pattern detection across 39 ad accounts. Our account managers handle the relationships the data surfaces. The agents carry the operational work. The people are free for the work that matters.

HBR Analytic Services found that only 6% of leaders fully trust agents with core processes. That number will move as accountability architecture becomes standard practice, not as agents get more capable. Capability is already ahead of governance. The gap is not technical.

## See the live chart

Every seat on the Sneeze It chart, agent and human, is queryable from OTP with its type, owner, and accountability structure visible in a single call.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the sneeze-it org chart and tell me which agent seats have named human owners and what each agent's accountability metric is."*

You will see the accountability architecture described in this post, not as a framework but as a live chart you can query.
