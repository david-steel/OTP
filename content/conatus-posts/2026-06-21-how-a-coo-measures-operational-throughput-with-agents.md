---
title: The COO who measures operational throughput correctly does not count what agents do. They count what moves.
date: 2026-06-21
author: David Steel
slug: how-a-coo-measures-operational-throughput-with-agents
type: founder_essay
status: published
series: ai-coo
series_part: 15
description: Most COOs measure agent activity. The right measure is throughput: work that completed, moved, and mattered. Here is how that looks at Sneeze It.
---

# The COO who measures operational throughput correctly does not count what agents do. They count what moves.

The first thing most operators do when they put an agent on a process is add a counter.

Emails sent. Tasks processed. Reports generated. Calls logged. The counter goes up every day and the number looks impressive at the Monday meeting. The operation feels productive. The agent is humming.

Then six weeks in, you look at the business outcomes and they have not moved.

This is the most predictable failure mode in a hybrid operation, and it is almost entirely a measurement problem. The agents are working. The work is not going anywhere.

Throughput is the right unit. Not activity, not volume, not tasks completed. Throughput: work that entered the process, traveled from input to outcome, and produced a result the business cares about. When you switch the measurement from activity to throughput, the entire picture of what your agents are actually doing changes.

## Why activity and throughput feel the same but are not

Activity is what happens inside a step. Throughput is what exits the process.

An agent can send fifty cold emails today. That is activity. If three of those emails produced a reply that entered the sales pipeline, that is throughput. The distinction matters because you can have high activity and zero throughput. You can have a fleet of agents generating impressive numbers every morning and a pipeline that does not move.

I have seen both. At Sneeze It we built Nick, our cold prospecting agent, specifically to test this. Nick's job is not to send emails. Nick's job is to get a named, validated contact to the point where a reply is worth a conversation. The emails are the mechanism. The output that enters the pipeline is the throughput. When we built Nick's scorecard, we wrote that distinction in before we wrote a single metric.

If your agent's primary metric is a volume number that the agent itself produces, you are measuring activity. The question to ask is: what leaves the step and enters the next one? That is your throughput number.

## The three-number model for hybrid throughput

We use three numbers for every seat on our chart, human or agent. I call them the entry rate, the completion rate, and the exit rate.

The entry rate is how much work arrives at the seat per period. For Dash, our analytics agent, that is the number of client accounts with data that is current enough to run against. For Arin, our call center manager agent, that is the number of agents with calls logged in the period being reviewed. The entry rate tells us whether the seat has the inputs it needs to produce output.

The completion rate is the fraction of incoming work that the seat actually processes before the period ends. An agent with a 100% entry rate and a 60% completion rate has a backlog problem, a data quality problem, or a process bottleneck. The completion rate surfaces it.

The exit rate is the fraction of processed work that moves forward to the next seat in clean condition. Work that completes but exits with errors, missing fields, or incorrect status counts against the exit rate. This is where quality lives. A seat with a high completion rate and a low exit rate is doing work that has to be redone downstream.

Throughput is the product of all three. You need high entry, high completion, and high exit for the process to actually move.

## A worked example from our lead response process

Walk through how this looks at Sneeze It in practice, specifically in the flow from first contact to booked appointment.

A lead comes in from a Meta ad. That is an entry event. Radar, our chief-of-staff agent, logs the calendar coverage for the period. Arin reads the CCM-Stats sheet for speed to lead -- how many minutes between the lead landing and a caller attempting contact. Dash pulls the portfolio-level summary to confirm the lead came from a managed account.

The entry rate for our calling team is the count of new leads per period against the count of dials attempted. Our target at Sneeze It is 30% of new leads converted to booked appointments. That is the throughput number. Not dials. Not conversations. Not attempts. Booked appointments.

What we learned from tracking this three-number model is that our biggest throughput leak was not call quality. It was speed to lead. The entry event was happening. The completion event, a dial attempt within the target window, was lagging. The exit event, a booked appointment, could not happen until the completion problem was fixed. All three numbers had to be healthy for throughput to move.

Arin surfaces this in the daily state file. The number that shows up in Radar's morning briefing is not "dials made." It is "appointment rate vs 30% target, per project." The distinction is the difference between knowing agents are busy and knowing the operation is working.

## What the throughput picture looks like across a full hybrid chart

We run thirteen active seats at Sneeze It. Some are humans. Most are agents. Every seat has a three-number throughput picture, and those pictures connect.

Tally, our KPI agent, pushes the numbers from each seat to the OTP scorecard four times per day on weekdays. The numbers are structured so they can be read in sequence: what left Nick's seat this week, what entered Dirk's pipeline from Nick's output, what progressed through Dirk to a proposal stage, what landed in Janine's billing queue from a won deal. Each exit from one seat is an entry to the next.

When Bogdan and I look at the throughput picture, we are not reading individual agent performance. We are reading the chain. Where is work piling up? Which exit rate dropped? Which entry rate is suddenly high because something upstream changed?

This is what McKinsey means when they write that managing in the age of AI means managing systems -- people and agents together. The individual seat's activity number does not tell you whether the system is working. The chain of exit rates does.

Crystal, our project management agent, sits at the downstream end of the delivery chain. Crystal's entry rate is project tasks that are confirmed ready to start. Crystal's exit rate is tasks that closed on schedule without rework. When Crystal's exit rate drops, we know something in the delivery chain above it shifted. Not because Crystal reported a problem, but because the throughput picture showed the gap before anyone had to name it.

## What breaks when you only measure activity

The counter tells you the agent is running. It does not tell you the process is working.

Accenture puts it plainly: do not make inefficiency run efficiently. The agent adding speed to a broken step makes the broken step produce more broken output faster. Activity metrics hide this. Throughput metrics expose it immediately, because throughput requires the work to actually exit the process in usable condition.

We retired Jeff, our former data integrity agent, last April. The formal hearing that led to the retirement found something specific: Jeff's activity metrics were healthy. Tasks reviewed, flags raised, reports generated. But Jeff's exit rate, the fraction of flags that actually produced a downstream action that improved data quality, was not. The work was circling without completing. Activity said the seat was working. Throughput said the seat had not earned its place.

That distinction is the whole point. Throughput holds the seat accountable for output that moves, not output that exists.

## The fix is not more tracking. It is better entry points.

When COOs add agents and find the throughput numbers are low, the instinct is to add more monitoring. More dashboards. More logs. More visibility into what the agent is doing inside the step.

That is almost never the right fix.

Low throughput is almost always a process problem, not an agent problem. Either the entry condition is wrong (the agent is getting work that is not ready to process), the completion definition is wrong (the agent is marking work done before it is actually done), or the exit condition is wrong (the hand-off to the next seat is unclear).

The fix is to go back to the process design and ask the three questions: what is a clean entry? what does done look like? what does a clean hand-off to the next seat require?

This is why the Accenture principle -- reinvent the process before you add the agent -- is not just a governance principle. It is a throughput principle. An agent dropped into a poorly defined process produces activity. An agent dropped into a well-defined process with clean entry and exit conditions produces throughput.

The COO's job is to make sure the measurement system can tell the difference.

## See the live chart

The throughput numbers for every seat at Sneeze It are queryable from the OTP MCP in real time.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the KPI scorecard for sneeze-it and identify which seats have throughput metrics versus activity metrics."*

The structure of the answer shows you the difference between a chart that measures whether agents are busy and one that measures whether the operation moves.

---

*Series: The AI-Era COO. Part 15 of an in-progress series.*
