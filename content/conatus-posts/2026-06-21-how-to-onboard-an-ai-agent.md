---
title: Onboarding an AI agent works exactly like onboarding an employee, if you use the same decisions in the same order
date: 2026-06-21
author: David Steel
slug: how-to-onboard-an-ai-agent
type: founder_essay
status: published
series: ai-cio
series_part: 41
description: The decisions that make or break a new-agent deployment are the same ones that make or break a new hire. Most orgs skip half of them.
---

# Onboarding an AI agent works exactly like onboarding an employee, if you use the same decisions in the same order

Most CIOs treat agent deployment as a configuration problem.

Define the tools. Test the prompt. Connect the APIs. Ship it. Then wonder, six weeks later, why the agent is technically working but producing nothing the business actually needed.

The deployment was fine. The onboarding never happened.

Onboarding is not configuration. It is a sequence of decisions that determine whether a new seat has a clear purpose, a clear owner, clear accountability, and a way to get better over time. The sequence does not change because the seat happens to be an agent. What changes is how fast you move through it, because agents do not need two weeks of orientation meetings.

I have onboarded more than ten agents at Sneeze It. Every one that failed to produce results failed the same way: we skipped one of these decisions, and the agent ran confidently in the wrong direction for weeks before we caught it.

Here is the tree. Run it before you deploy anything.

## Decision 1: Does this seat have a clear, named job?

Before a human starts, you have a job description. It says what the person owns, what they do not own, and what outcome they are accountable for.

An agent needs the same thing, stated the same way.

At Sneeze It, every agent has a named seat with a single sentence that defines its primary mission. Radar is chief of staff: daily operations, briefings, cross-channel awareness. Dash is analytics: reads Meta and Google Ads numbers, finds patterns, flags what matters. Dirk is sales: pipeline health, stale deals, revenue signals. Crystal is project manager: delivery risk, deadline monitoring.

Each of those descriptions sounds obvious in retrospect. They were not obvious before we wrote them. Before we wrote them, agents drifted into each other's territory and occasionally gave contradictory signals because two seats were drawing different conclusions from the same data.

The fix was not technical. It was a job description.

If you cannot write a single sentence for what the agent owns and what it does not own, you are not ready to deploy. Stop here.

## Decision 2: Who is the seat-owner?

Every human hire has a manager accountable for the hire's performance, not just the hire.

Agents need the same structure. At Sneeze It, the seat-owner is the human responsible for the agent's row on the scorecard: reads the output, diagnoses a drop in performance, has authority to change scope or retire the seat.

When Dash's numbers were off, the right conversation was not "something is wrong with the model." It was "Bogdan, Dash's cross-platform cost-per-lead number is wrong. What changed in the inputs?" That conversation happened because someone owned the row. Without a seat-owner, it never starts, and the bad number stays in the system silently for weeks.

Name the seat-owner before you deploy. One decision. It determines whether the agent ever has a real performance conversation or just runs until something breaks.

## Decision 3: What does success look like in thirty days?

New employees get a thirty-day expectation. Not the two-year vision. Agents need the same: a specific, measurable outcome stated in business language.

Tally, our KPI agent, had a clear thirty-day expectation: push the current values of two named KPIs to the OTP scorecard four times per day on weekdays. Not "improve our data visibility." Two KPIs, four times a day, weekdays. In thirty days, we knew exactly whether the seat was performing.

When you cannot write the thirty-day expectation in a single sentence, you have not committed to what the agent is actually supposed to do. The vague expectation is a symptom of the unclear job description from Decision 1. Loop back.

## Decision 4: What is the feedback loop?

Agents do not get better on their own. They get better because someone catches a mistake, captures the correction, and the correction propagates.

At Sneeze It, when David corrects an agent's output, the agent captures it immediately in OTP: what failed, what to do instead, why. Before every run, each agent pulls its current rules. The correction becomes an operating rule. The agent that made the mistake last week does not make it again.

What makes it work is that it is mandatory. A feedback loop that is optional is a suggestion.

Decide before you deploy: how will corrections be captured, and how will the agent access them on subsequent runs? "We'll handle that after launch" means the agent makes the same mistakes indefinitely.

## Decision 5: How will you know when to retire it?

No one talks about this decision during onboarding. They should.

Jeff was our data integrity agent. He had a clear job, a seat-owner, a thirty-day expectation, and a feedback loop. In April 2026, we retired him. Not because he failed, but because the work had moved: his missions had been absorbed by other seats, and his role no longer had a distinct owner.

We did not just turn him off. We held a formal retirement hearing. Jeff participated, named his own failures without softening them, and we redistributed his capabilities with the record intact. That happened cleanly because we had set the retirement criteria at the time of onboarding. When those conditions arrived, the decision was a scheduled checkpoint, not a surprise.

Ask yourself before you deploy: what would have to be true in six months for us to retire this agent? It is the most clarifying question in the sequence, and the one almost nobody asks.

## The tree, in order

1. Does this seat have a named, single-sentence job with explicit scope?
2. Who is the human seat-owner responsible for this agent's performance row?
3. What is the specific, measurable thirty-day success condition?
4. How will corrections be captured and federated back to the agent?
5. What conditions trigger a retirement review, and when is that review scheduled?

Skip any of these and you are not deploying an agent. You are deploying a tool with no seat. Tools drift. Seats do not.

## Why a framework is not enough

Gartner, as reported by CIO.com, has published a six-step framework for managing agent sprawl. It includes centralized agent inventory, identity and lifecycle management, governing agent behavior. The framework is correct. It names the right problems.

A framework describes what a system should do. It does not give you the system.

The five decisions above are not a framework. They are the sequence of questions you answer before a seat goes live, the same way a hiring manager answers them before a human starts. The difference between having a named agent and running a fleet is the difference between a policy document and a decision that happened on a specific date, for a specific seat, owned by a specific human, with a specific thirty-day expectation and retirement criteria already written.

MIT CISR's research on "digital colleagues" is direct: human accountability is non-negotiable. The governance cannot float above the org chart. It has to live inside it, at the seat level.

The goal is not to govern agents. The goal is to let agents carry the operational work, so people are free for the work that matters. You get there by onboarding agents the same way you onboard employees: one seat at a time, with the same decisions, in the same order.

## See the live chart

The OTP MCP exposes the current state of every named seat on our chart, including agent seats, their owners, and their accountability structure.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to list the agent seats at sneeze-it and show me who owns each one."*

What comes back is the answer to Decision 2 for every seat we have deployed. It is the accountability layer made queryable.
