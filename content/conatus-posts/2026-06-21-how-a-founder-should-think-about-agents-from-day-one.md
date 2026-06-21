---
title: Founders who wait until they have a team to think about agents will wish they had not waited
date: 2026-06-21
author: David Steel
slug: how-a-founder-should-think-about-agents-from-day-one
type: founder_essay
status: published
series: ai-ceo
series_part: 32
description: The mental model for building agents into the structure of a company from the start, not bolting them on after the org chart is already wrong.
---

# Founders who wait until they have a team to think about agents will wish they had not waited

The founders I have watched get this right did not add agents to an existing company. They built the company around a different assumption from the start.

The assumption is this: execution is near-free. Judgment is the scarce input.

If that is true from day one, then the company you are building is structured differently than the company you would have built ten years ago. The seats, the scorecard, the accountability model, the way you decide where human hours go, all of it changes. The question is not "when do I add agents." The question is "what does a company look like when agents do the operational work from the beginning."

I built Sneeze It the wrong way first. Every agent arrived as an addition to an existing structure. Radar came after I already had a human running operations. Dirk came after I already had a sales motion with humans at its center. Every agent had to negotiate for its seat rather than being born into one.

That experience taught me what I would do differently starting from zero.

## Start with the accountability chart, not the hire plan

Every founder knows they need to build a team. Most founders think about that team as a list of humans they need to recruit and pay. Engineer. Sales rep. Operations lead. Customer success. Finance.

The better starting frame is an accountability chart. What seats does this company need filled for it to function. Who or what fills each seat. The "who or what" is the key phrase.

At Sneeze It today, Bogdan our COO holds a human seat. Janine our accounting lead holds a human seat. Radar holds the chief-of-staff seat. Tally holds the scorecard seat. Dash holds the analytics seat. Arin holds the call center manager seat. Nick holds the cold prospecting seat. Pulse holds client retention intelligence. Pepper holds inbox triage.

These are not tools assisting the humans. They are seats on the chart with names, metrics, owners, and accountability. One seat, one owner. The seat publishes numbers every week.

If I were starting from zero, I would draw this chart before making my first hire or building my first agent. For each seat: does it require human judgment, human relationships, or legal accountability? If yes, human seat. If no, agent candidate. This framing changes what you recruit for, what you pay for, and what you measure.

## The day-one question is not "what can an agent do" but "what requires a human"

Most founders approach agents by asking what an agent can do. They look at the capability and then try to find a task for it. This produces agents that are doing things that do not matter, and humans that are doing things an agent could do.

The better question is what requires a human. I mean this seriously as a filtering question, not as a rhetorical one.

A seat requires a human when it carries legal or financial accountability that cannot be delegated to software. A seat requires a human when the relationship is the product. A seat requires a human when the judgment required is novel enough that no pattern from prior work is sufficient.

Everything else is a candidate for an agent seat.

When Janine holds our accounting seat, she holds it because an agent cannot sign a return or carry personal liability. When Bogdan holds our COO seat, he holds it because the seat requires judgment about people and culture that an agent cannot yet exercise with his depth of context.

But Dash holds our analytics seat because analytics runs better when it runs continuously and consistently than when it runs whenever a human has time. The seat does not require human judgment most days. On the days it does, Dash escalates to me.

Agents are not for simple tasks. They are for tasks whose quality is determined by consistency and pattern-fidelity. Humans are for tasks whose quality is determined by judgment, relationship, and novel response to context.

## Wire the scorecard before you wire the agents

The first mistake is adding agents to a human org instead of designing a hybrid org from the start. The second mistake is building agents without putting them on the scorecard.

An agent that is not on the scorecard is infrastructure. Infrastructure drifts. It drifts because nobody is measuring it against outcomes the company cares about, and nobody is in the Monday meeting asking why the number dropped.

Deloitte surveyed 3,235 enterprises in 2026 and found that only 21% have a mature governance model for agentic AI. The other 79% have agents running without the accountability structure that would catch drift. This is not a technology problem. It is an operating model problem.

At Sneeze It, Tally exists specifically to push agent numbers to the scorecard every week so the review discipline does not depend on self-reporting. The number is there every Monday whether anyone asks for it or not.

If I were starting today: weeks one and two, draw the chart before hiring anyone, categorize each seat as human-required or agent-ready. Weeks three and four, wire the scorecard. Every seat gets a metric in business-outcome language. Not "emails sent" but "qualified replies generated." One row per seat, unsegmented. Weeks five through twelve, run the weekly review with identical discipline for every row. When an agent's number drops, the conversation is the same as when a human's drops.

McKinsey describes the emerging CEO job as managing systems of people and agents together. The day-one implication: founders who manage those systems well in three years are the ones who set up the structure at the start, not the ones who retrofit it onto a human org that already has its own inertia.

## What stays human regardless of where you start

One thing is consistent across every version of this I have seen work: the judgment function stays human.

Agents at Sneeze It do not make strategic decisions. Radar, our chief-of-staff, surfaces everything that belongs in a decision and flags what requires my attention. Dirk, our sales agent, identifies opportunities and drafts outreach. He does not decide who we pursue and on what terms. Pulse, our retention intelligence agent, detects churn risk and surfaces it. He does not decide how we respond to a client who is about to leave.

The agent's job is to do the operational work so accurately and consistently that the decision-maker gets to the decision with better information, faster, than they would if a human were doing the same operational work.

This is the version of the CEO job that is worth building toward. Not a CEO who is managed by agents, or dependent on them, or displaced by them. A CEO who has built a structure where agents carry the operational work, so people are free for the work that matters. The judgment, the relationships, the vision, the calls that cannot be delegated because they require a human to be accountable for the outcome.

Jeff was one of our early agents. We retired him in April after a formal hearing. The retirement was clean because the accountability structure was clean. We knew exactly what his seat was supposed to produce, what it had produced, and where the gap was. That clarity made the conversation possible.

A well-structured operating model makes the hard conversations possible because the accountability was clear from day one.

## See the live chart

The Sneeze It accountability chart, with human and agent seats, is queryable through the OTP MCP. You can pull the current seat structure, the metrics each seat is accountable for, and how humans and agents sit on the same chart alongside each other.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the Sneeze It org chart and identify which seats are currently held by agents versus humans."*

What comes back is a working model of what a day-one hybrid accountability structure looks like in production. Compare it to how your own chart is structured today.
