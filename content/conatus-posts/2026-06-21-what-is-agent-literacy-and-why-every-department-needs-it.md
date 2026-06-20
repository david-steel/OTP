---
title: Agent literacy is not a technical skill. It is the new management layer.
date: 2026-06-21
author: David Steel
slug: what-is-agent-literacy-and-why-every-department-needs-it
type: founder_essay
status: published
series: ai-cio
series_part: 23
description: Agent literacy is not about prompting or coding. It is the ability to manage work done by agents -- scope it, measure it, correct it, and retire it.
---

# Agent literacy is not a technical skill. It is the new management layer.

The framing that most organizations are working from right now goes like this: some people in the company need to understand AI, and those people are in IT.

Everyone else needs to "be aware" of AI, attend a workshop, maybe learn to prompt better.

That framing will cost you.

Agent literacy is not knowing how to write a prompt. It is not knowing how to run an API call. It is the ability to manage work that an agent is doing, which means knowing how to define the scope of that work, measure whether the output is good, intervene when it is not, and decide when the agent is no longer needed.

That is a management skill. And every department needs it.

## Why the current approach produces drift

Gartner named the pattern earlier this year, as reported by CIO.com: agent sprawl is "the new Shadow IT." The same way departments once bought their own software without IT knowing, departments are now deploying their own agents without anyone knowing. By Gartner's own account, as reported via CIO.com, roughly 40% of enterprise applications could include task-specific AI agents by the end of 2026.

Most of those agents will have no named owner. No performance standard. No retirement plan. They will run until someone notices the output is wrong, or until they stop running entirely and nobody notices that either.

This is not an IT problem. IT did not deploy most of those agents. Department heads did. Operations managers did. People who needed the work done found a way to get it done, the same way people in 2005 installed Dropbox on their laptops without asking anyone.

The difference is that a rogue Dropbox account holds files. A rogue agent makes decisions. It qualifies leads, prioritizes support tickets, drafts client communications, selects which records to escalate. When the agent's judgment drifts, the department drifts with it. When nobody in the department has the literacy to catch that drift, the problem compounds silently.

Deloitte's 2026 State of AI in the Enterprise survey (n=3,235) found that only 21% of organizations have a mature governance model for agentic AI. The other 79% are running agents in conditions where drift is not just possible, it is structurally guaranteed.

## What agent literacy actually is

I run about ten agents at Sneeze It. Radar is our chief of staff. Dirk handles sales outreach. Arin manages our call center team. Dash runs analytics across our media accounts. Tally pushes KPI values to our scorecard. Each of those agents sits inside one of our departments, doing department-level work.

The humans those agents work alongside, including Bogdan our COO, Janine in accounting, and Kristen on creative, do not need to know how any of those agents were built. They do not need to read a prompt or configure an API.

What they need to know is this: every agent has a seat with a defined scope, a metric that proves whether the work is getting done, and a person accountable for that metric. When the metric drops, someone investigates. When the investigation reveals the agent is producing bad output, someone intervenes. When the intervention does not fix the problem, someone decides whether to retrain the agent, change its scope, or retire it.

That is agent literacy. Scope, measure, intervene, retire. It is not technical. It is managerial.

The reason every department needs it is that agents are now doing department-level work. A sales agent calling on the wrong leads is a sales problem, not an IT problem. A call center agent misclassifying disposition codes is an operations problem, not an IT problem. The people who have context to catch those failures are in the departments, not in IT. If they lack the literacy to manage agent-generated work, the failures will not get caught.

## The cost of mislocating the skill

When organizations treat agent literacy as a technical skill, they centralize it in IT or in a small AI team.

That team reviews agent performance once a month, on a dashboard built for engineers, measuring latency and token consumption instead of business outcomes. The department heads send the AI team a ticket when something seems off. The AI team investigates. Six weeks have gone by.

Meanwhile, the agent has been doing department work with nobody in the department qualified to evaluate it. The drift is not visible to the people who would recognize it as drift.

MIT CISR's verified research on enterprise AI maturity found that the firms in the highest maturity stage outperformed their industries by 13.9 percentage points on growth and 9.9 points on profit. One of the distinguishing factors at that stage: a united top leadership team, including the CEO, CIO, head of strategy, and head of HR, all actively shaping how AI operates. Not just the technical team.

That is not a governance model. That is a literacy model. The outcome accountability sits with the people closest to the domain.

## How we built literacy into the seats

At Sneeze It, we did not run an AI literacy training program. We built literacy into how the seats are designed.

Every agent at Sneeze It publishes its own numbers to our weekly scorecard. Arin's row on the Monday scorecard shows appointment rate vs. the 30% target our call center is accountable for. Dirk's row shows cold emails sent per week and pipeline stage transitions. Tally exists specifically to push all agent KPI values to that scorecard automatically, so the data is always current when we walk the board.

When Bogdan looks at those rows, he is not reading an AI dashboard. He is reading his operational scorecard. The fact that some rows belong to agents and some belong to humans is secondary to the fact that every row belongs to a seat, and every seat has a defined accountability.

This is how literacy gets embedded. Not through training programs. Through seat design that makes agent performance visible to the domain experts who can evaluate it.

Pepper, our email agent, drafts client communications that Kristen's team reviews before anything goes out. The review is not a technical audit. It is a domain audit. Kristen is reading the draft the way she would read a human team member's draft: does this sound right for the client, does this match our voice, does this serve the relationship. That judgment is the literacy we need. Kristen already has it. The system is designed so she can apply it to agent-generated work.

## The department head question

If you are a department head reading this, the question is not "does my team understand AI." The question is: can they do these four things for every agent operating in their domain.

Can they define what the agent is and is not supposed to do, specifically enough that a gap in performance would be obvious. Can they measure the output in business terms, not runtime terms. Can they tell the difference between an agent performing at 90% and one producing 90% volume with 50% quality. And can they decide when the agent has reached the end of its usefulness and needs to be retired or replaced.

We retired Jeff, our data integrity agent, in April. He was the first retirement in our agent fleet. The decision came out of our Monday meeting, not from an AI team review. The data on his row was weak. The conversation was identical to the conversation we would have had about a human direct report whose number was weak. The outcome was a structured retirement with a record kept. The work was redistributed to seats that already existed.

A department head running that conversation does not need to know how Jeff was built. She needs to know what he was accountable for and whether he was delivering. That is the literacy. It is no different from the management literacy she already has.

## The reason this becomes the CIO's problem

The CIO cannot build this literacy alone. It has to live in the departments.

But the CIO is accountable for the conditions that make it possible. That means building scorecards where agent performance is visible in business terms. It means designing seats so that scope, ownership, and metrics are defined before the agent is deployed. It means creating a lifecycle that includes retirement so that agents do not accumulate without accountability.

Gartner's Six Steps to Manage AI Agent Sprawl, as reported by CIO.com, names centralized agent inventory and lifecycle management including retiring redundant agents as two of the six required steps. Those are organizational design decisions, not engineering decisions.

The CIO who stops at "we have a governance policy" and does not build the seat structure that makes literacy operational in every department will still end up with a governance problem. The policy will sit in a document while the departments run agents in the dark.

Let agents carry the operational work, so people are free for the work that matters. That is the intended state. But it only holds if the people in each department can see what the agents are doing, evaluate whether it is right, and intervene when it is not.

That is the literacy gap. It sits in every department. It is the CIO's job to close it.

## See the live chart

You can query Sneeze It's agent seats directly through the OTP MCP, including which seats each agent holds, what metrics each seat tracks, and how agents and humans sit alongside each other on the same scorecard.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the agent seats on the Sneeze It chart and what each seat is measured on."*

What you get back is a structured view of which agents hold seats, what their accountability metrics are, and where they sit relative to human seats. It is the operating system that the advisory frameworks describe but do not give you.
