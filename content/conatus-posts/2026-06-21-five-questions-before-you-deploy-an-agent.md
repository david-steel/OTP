---
title: Five questions a CIO should answer before deploying any agent
date: 2026-06-21
author: David Steel
slug: five-questions-before-you-deploy-an-agent
type: founder_essay
status: published
series: ai-cio
series_part: 47
description: Most agentic AI projects fail not at build time but at decision time. Five diagnostic questions every CIO should answer before the first agent goes live.
---

# Five questions a CIO should answer before deploying any agent

Most agentic AI projects do not fail because the technology breaks. They fail because nobody answered the right questions before the agent went live.

Gartner, as reported by CIO.com, projects that over 40% of agentic AI projects will be canceled by the end of 2027, with escalating costs, unclear value, and inadequate risk controls as the named causes. Those are not technology failures. They are governance failures that start at the decision point, not the deploy point.

I have deployed more than ten agents at Sneeze It. Some of them work well. One of them, Jeff, was retired in April through a formal hearing. Looking back across all of them, the difference between the agents that held and the ones that drifted traces back to five questions I either asked or failed to ask before the agent went live.

These questions are not a checklist. They are a diagnostic. If you cannot answer them clearly, the agent is not ready.

## Question 1: What seat does this agent own?

An agent without a seat is not a team member. It is a script with ambitions.

Before we deployed Radar, our chief-of-staff agent, we defined the seat first. Radar owns daily operations, briefings, calendar and task orchestration, and cross-channel awareness. Full stop. It does not own strategy. It does not own email. It does not own sales. When something falls in a gray zone, the seat definition is what tells us where to route it.

The same discipline applies to every other agent on our chart. Dash owns analytics. Dirk owns sales. Pepper owns email triage. Crystal owns project management. Arin owns call center performance. Nick owns cold prospecting. One seat, one owner. No overlap.

If you cannot state the seat in a single sentence before the agent deploys, you are not ready to deploy. What you will get instead is an agent that does adjacent work whenever it feels useful, duplicates what humans are already doing, and gradually becomes the source of the accountability confusion Gartner named when it called agent sprawl the new Shadow IT.

Define the seat before anything else.

## Question 2: Who is accountable when the agent's output is wrong?

Agents make mistakes. The question is not whether mistakes will happen. The question is who owns the conversation when they do.

This is not a technical question. It is an org design question. At Sneeze It, every agent has a seat-owner. The seat-owner is the person who stands in front of the Monday scorecard and answers for the agent's row the way a manager answers for a direct report's row. When Dash produces a number that does not match the source data, the seat-owner walks through it. When Dirk's outreach cadence stalls, the seat-owner diagnoses it. The agent does not explain itself. The seat-owner does.

Most organizations skip this step. They deploy the agent, assume technical oversight covers accountability, and then discover six months later that nobody owns the conversation when the agent drifts. By then the drift has compounded.

MIT CISR research on digital colleagues found that "human accountability will be non-negotiable." That is accurate. But naming accountability as a principle is different from wiring it to a named person before the agent goes live. Do the wiring before you deploy.

## Question 3: What metric tells you the agent is working?

Not a runtime metric. A business metric.

When we first deployed an agent at Sneeze It, it had its own little scorecard: tasks completed per hour, latency, messages handled per day. The numbers looked good. The business outcomes did not change. After six weeks I realized the agent was producing metrics that were not connected to anything I actually cared about. The fix was to replace the runtime metrics with business-outcome metrics and put the agent's row on the same dashboard the humans were on.

Tally, our scorecard agent, exists precisely because this discipline matters. Tally pushes KPI values from local sources to the OTP scorecard so the numbers on the chart are real and current, not aspirational. It does not fabricate a value when a source is broken. It escalates instead. That behavior, honesty about what is measurable and what is not, is the discipline every agent needs before it goes live.

Before you deploy, write the business metric the agent's seat is accountable for. If you cannot write it, you do not yet understand what the seat owns. Go back to Question 1.

## Question 4: How does this agent coordinate with the agents already running?

The first agent is easy. The fifth agent is where things break.

At Sneeze It, agents coordinate through a message bus. Agent-inbox files at a defined directory path. Dirk, our sales agent, checks with Pulse, our retention agent, before launching expansion outreach toward any client. If Pulse has that client on its churn watch list, Dirk pauses the expansion play. Pulse always wins. This coordination happens agent-to-agent, without David in the middle.

If we had not defined that protocol before Dirk went live, Dirk would have done exactly what a new salesperson does when nobody briefs them on the retention situation. It would have pushed expansion toward the clients most likely to churn. The outcomes would have been bad. The cause would have been invisible.

Gartner's Six Steps to Manage AI Agent Sprawl, as reported by CIO.com, names agent identity, permissions, and lifecycle as step three. That framing captures the surface of the problem. The deeper issue is coordination logic: which agent wins when two agents have competing interests, who routes the dispute, and what happens when neither agent knows the other exists.

Before you deploy a new agent, map which existing agents it touches. Define who wins in conflicts. Build the coordination path before the conflict happens.

## Question 5: What is the retirement plan?

This is the question almost nobody asks, and it is the one that determines whether you end up with a healthy fleet or an accumulated swamp.

Jeff, our former data integrity agent, was retired in April. It was the first agent retirement in our army. The process was a formal hearing. Jeff was asked to defend its continued existence. It could not. Three missions had been absorbed by other seats. The reliability record showed stagnation. Jeff recommended its own retirement.

The retirement was clean because the seat definition was clean. We knew what Jeff owned. We knew what it was accountable for. We knew where its capabilities would go. Radar redistributed Jeff's work to Dash and Dirk within a week. The chart closed without a gap.

Most organizations do not think about agent retirement until an agent has been underperforming for months and nobody is sure what it does anymore. That is the same problem as not defining the seat before deployment. It is the same governance failure, deferred.

Before you deploy, write one sentence: under what conditions does this agent get retired, and who makes that call? If you cannot write it, the agent will outlive its usefulness and you will not notice until the damage is done.

## The pattern across all five

Every one of these questions is an org design question dressed in AI clothing.

What seat does it own. Who is accountable. What metric tells you it is working. How does it coordinate. What is the retirement plan. None of these require a technical answer. They require an organizational one.

The advisory firms have named this. Deloitte found in a verified 2026 survey of 3,235 organizations that only 21% have a mature governance model for agentic AI. The remaining 79% are deploying agents without the org design that makes agents hold. Business schools are starting to teach governance and strategy, with CMU the closest to teaching the actual build of an agent capability. But no program verified in our research teaches the operating discipline: a live chart where humans and agents hold named seats, one seat per owner, with scorecards, lifecycle, and coordination protocols.

That is what we run. Not a framework. A running system.

The mission underneath it is to let agents carry the operational work, so people are free for the work that matters. But agents only carry the work reliably when someone answered the five questions before the agent went live. Skip the questions and the agent drifts. Answer them and the agent holds.

Bassim, our maturity evaluator, runs against the entire fleet on this standard. Every agent is evaluated against the 8 Levels of Agentic Engineering. The score is honest and usually uncomfortable. That discomfort is the point. It is easier to deploy an agent than to govern one, and the gap between those two things is exactly where the 40% failure rate lives.

Answer the five questions first.

## See the live chart

The OTP MCP exposes the Sneeze It org chart, including all agent seats, their accountability structure, and the coordination rules between them.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the seats in the sneeze-it chart and which agents coordinate directly with each other."*

You will see the seat definitions, the owners, and the coordination paths in structured form. That structure is what the five questions produce when you answer them before you deploy.
