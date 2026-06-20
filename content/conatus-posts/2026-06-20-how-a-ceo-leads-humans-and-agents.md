---
title: Leading a workforce of humans and agents is one job, not two
date: 2026-06-20
author: David Steel
slug: how-a-ceo-leads-humans-and-agents
type: founder_essay
status: published
series: ai-ceo
series_part: 2
description: The failure modes that appear when CEOs treat agent leadership as a separate discipline. Why one job description covers both, and what breaks when you split them.
---

# Leading a workforce of humans and agents is one job, not two

The question I get most often from other agency CEOs is some version of: "How do you manage the AI stuff on top of everything else?"

I understand why they frame it that way. Agents feel like a technology decision. Technology decisions have their own department, their own meetings, their own person who handles them. So the instinct is to split leadership in two: one mode for your human team, one mode for the AI layer.

That split is where everything goes wrong.

Leading a workforce that includes both humans and agents is one job. The same skills. The same accountability structures. The same failure modes. The moment you treat agents as a separate category to manage, you have already made the mistake that costs you six months.

Here is what that mistake actually looks like in practice, broken into the specific failure modes I have either lived through or watched other operators walk into.

## Failure mode 1: You manage agents by the system, not the seat

The first thing most CEOs do when they add their first agent is delegate the relationship to whoever is most technical on the team. That person becomes the de facto "agent manager." They track the system health, they tune the prompts, they report back when something breaks.

This sounds like delegation. It is actually abandonment.

When you put a human in a seat, you do not hand them off to IT. You manage them. You give them a role, a metric, and a cadence for reviewing their performance against that metric. You hold the relationship yourself because the performance of that seat is your accountability, not IT's.

The same is true for agents.

Dirk is our sales and revenue agent at Sneeze It. Dirk's seat owns pipeline health, stale deal identification, reactivation outreach, and expansion opportunities. I do not manage Dirk by asking our ops person how the system is running. I manage Dirk the same way I manage any revenue seat: by looking at the numbers each week and asking what is stuck, what moved, and what needs to change.

When Dirk's numbers are off, the conversation is not "the model is misbehaving." The conversation is "what changed in the inputs" and "what does this seat need to recover." Same conversation I would have about any revenue role that missed its number.

## Failure mode 2: You give agents tasks, not accountabilities

This one is subtle and it is the root cause of about half the agent disappointments I hear from other operators.

A task is something you do once. An accountability is something you own continuously. When you give an agent a task, you get a task completed. When you give an agent an accountability, you get a seat.

The difference shows up fast. An agent given the task "analyze this week's ad spend" will analyze this week's ad spend and stop. An agent given the accountability "own ad performance analysis for the portfolio" will do that analysis, flag anomalies, cross-reference trends against prior weeks, and escalate when something looks wrong, because that is what owning an accountability looks like.

Dash, our ad and analytics agent, does not get tasks. Dash owns a seat. That seat is accountable for all customer ad performance across Meta and Google, call center data, and spend anomaly detection. Dash writes to a shared state file every day. Radar, our chief of staff agent, reads that file during the morning briefing. When a number looks wrong, Dash flags it. When a client is trending down, Dash surfaces it. This is not a task. This is a role.

If you are assigning agents tasks rather than seats, you are leaving most of the value on the table.

## Failure mode 3: You review agent performance in a different meeting than human performance

I mentioned this failure mode in the previous post in this series, but it comes up here too because it is that common.

When agents have their own separate review (a technical standup, an ops check-in, a monthly AI dashboard review), they drift. The review is not connected to the outcomes that matter, so the agent can be performing well on every metric in that review while quietly failing the business.

At Sneeze It, agents and humans are reviewed in the same Monday meeting, on the same dashboard. Bogdan, our COO, has rows on the scorecard. Janine, who owns our accounting, AR, and AP, has rows on the scorecard. So does Tally, our scorecard agent who pushes KPI values from local data sources into the chart. So does Dirk. So does Dash.

No separate AI review. No technical standup where agent metrics live in a different language than business metrics. One meeting, one dashboard, one standard.

The moment you split the review, you have split the accountability. And when accountability is split, nothing gets better.

## Failure mode 4: You let the agent lead rather than the seat

This one is the most insidious failure mode because it feels like trust.

An agent will do what it is built to do. If you have not defined the seat clearly, the agent will define it for you. The agent will start producing outputs based on its best inference of what you probably want. Those outputs will seem useful. They may even be useful. But they are not anchored to a defined accountability, which means they are not improving the business in a predictable way.

The CEO's job is to define the seat before the agent fills it. Role, metric, accountability, escalation path, and cadence. The same four things every human seat needs before someone sits in it.

When Nick, our cold prospecting agent, went live, we did not say "go find us clients." We said: the seat owns cold prospecting in health and wellness only, the single metric is quality emails drafted per day with a target of thirty, and quality means a named individual who passed email validation and is not a generic address. Nick does not define its own scope. The seat defines the scope. Nick fills it.

That discipline is the CEO's job, not the agent's.

## Failure mode 5: You treat corrections as technical issues rather than management conversations

When an agent produces bad output, the first instinct is to call it a model problem. Tune the prompt. Upgrade the version. Add a constraint. These are technical interventions, and sometimes they are the right move.

But most of the time, bad agent output is a management failure, not a model failure.

The agent did not have a clear enough brief. The accountability was fuzzy. The metric was not defined tightly enough so the agent optimized for the wrong thing. The escalation path was not specified so the agent decided what to escalate and what to let pass.

I have made all of these mistakes. Every time I investigated far enough, the root cause was a leadership failure that happened before the agent ever produced its first output.

The fix is to treat the correction as a management conversation. What is the brief that produced this output? What did the seat description say about this situation? What would a strong human in this seat have done differently? Then fix the brief.

Let agents carry the operational work so people are free for the work that matters. But that only pays off when the briefs are tight enough that the agents know what the work actually is.

## What changes and what does not

I want to be honest about what is actually different when you add agents to your workforce.

The leadership discipline is the same. Seats, metrics, accountability, cadence, correction. Same as humans.

What is different is the ratio. I have twelve agent seats and a smaller human team. The twelve agents work continuously. They do not have bad weeks. They do not need re-onboarding after a long weekend. They scale to whatever the workload requires.

But twelve agent seats that are poorly led produce less value than two human seats that are clearly led. The leverage is not automatic. The leadership is what activates it.

That is the answer to the original question. A CEO leads a workforce of humans and agents by leading them exactly the same way. One chart. One meeting. One standard for what a seat requires. The only decision that changes is whether the next seat should be filled by a person or an agent. And that decision gets easier every month.

## See the live chart

You can query every seat on the Sneeze It chart, human and agent, from any MCP client connected to OTP.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the Sneeze It org chart and identify which seats are currently held by agents versus humans."*

You will see one chart with both types of seats, the same metrics format on every row, and the same accountability structure applied to all of them. That is what a unified workforce looks like from the outside.
