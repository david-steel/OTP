---
title: The COO who standardizes across locations does it by deciding what the process is before deciding who runs it
date: 2026-06-21
author: David Steel
slug: how-a-coo-standardizes-operations-across-locations
type: founder_essay
status: published
series: ai-coo
series_part: 26
description: How a COO builds a consistent operating model across locations using a hybrid team of humans and agents, one seat per job, one scorecard for all.
---

# The COO who standardizes across locations does it by deciding what the process is before deciding who runs it

Multi-location operations break down in a specific place, and it is not the place most COOs look first.

They look at training. They look at management consistency. They look at the franchise manual or the SOP deck. Those are real problems. But the deeper problem is upstream: the process was designed for one location, and then copied and pasted everywhere else without anyone asking whether it was the right process to begin with.

Accenture's framing for this is direct: do not make inefficiency run efficiently. The temptation when you have ten locations is to standardize the current process. The right move is to fix the process before you spread it. Because whatever you standardize becomes the floor you are operating from for the next five years.

This is the COO's core job across locations: decide what the process actually is, then build a team that can run it consistently, then set a single scorecard so you can tell from the top whether it is running.

## The decision tree starts with the process, not the person

Every location-based operation has a set of repeating functions. At Sneeze It, which serves fitness and wellness clients across dozens of markets, the repeating functions are things like: scan performance data, flag anomalies, manage the call center, follow up on stale pipeline, handle incoming leads, keep client relationships healthy, send the right communication to the right person at the right time.

The COO's first question is not "who does this?" It is "what is this supposed to produce?"

Once you know what the function is supposed to produce, you can answer a second question: is this work that requires judgment about a specific human situation, or is it work that follows a rule and a data set?

That question is the decision tree. It runs before any hire, human or agent.

Work that requires judgment in a specific human situation stays with a person. Work that follows a rule and a data set is a candidate for an agent seat. The mistake is skipping the tree and defaulting to "hire a person" for all of it, or defaulting to "build an agent" for all of it. Both defaults produce the same failure: a team that does not match the actual shape of the work.

## What the tree looks like in practice

At Sneeze It, Bogdan runs operations as COO. He handles the judgment calls: resource allocation across client accounts, team conflict, delivery risk on a specific engagement. Those are human seats.

But most of the repeating operational functions at Sneeze It are now agent seats, because most of them follow a rule and a data set.

Radar is our chief of staff agent. Every morning it scans Slack, calendar, email, and pipeline state, and produces a compiled briefing. The briefing follows a consistent structure. It flags what is off. It does not editorialize. That is a rule-following function. The output is the same quality whether we have two client accounts or forty, because the agent does not get overwhelmed and does not have a bad week.

Dash is our analytics agent. It reads Meta Ads and Google Ads data across all client accounts, identifies anomalies, and flags them against a 7-day average and a 30-day baseline. At scale across locations, this function would require a team of analysts checking numbers every morning. It is one agent seat, and the output is consistent because the rule does not change across accounts.

Tally pushes KPI values from local sources to the OTP scorecard four times a day. There is no judgment involved in that function. It reads a file, extracts a value, and pushes it. It runs whether anyone is watching or not.

Nick runs cold prospecting in health and wellness. The function is: find a qualified business in ICP, find the decision-maker, validate the email, draft a message in a specific voice, put it in Gmail. Nick runs the same pipeline on every batch. No location gets a shorter list because the person doing it had a busy week.

Arin manages the call center team. The function is: read CCM-Stats for the day, assess dial volume and appointment rate per agent, draft coaching messages in Slack that sound specific and human. Arin runs this across every client account in the call center portfolio. The coaching standard does not drift based on which client it is.

That consistency is the point. Consistency across locations is not a training problem when the work follows a rule. It is a seat design problem.

## The handoff is where it breaks

The hard part of multi-location standardization is not running the individual functions. It is the handoff between them.

In a pure-human org, handoffs break because people do not communicate reliably across shifts, locations, and roles. In a hybrid org, handoffs break for the same reason plus one more: agents do not naturally share context unless you build the structure that makes them share it.

At Sneeze It, agents coordinate through what we call the agent message bus. Each agent has an inbox file at a known path. When Dash flags an anomaly on a client account, the flag goes into a shared state file that Radar reads during the morning briefing. When Dirk, our sales agent, wants to run an expansion play on a client, it checks Pulse's watch list first. Pulse is our retention agent. If the client is on the watch list, Dirk's expansion play pauses. That check happens agent-to-agent, without David in the middle.

The coordination protocol is explicit. Agents send structured messages to each other: REQUEST, INFORM, PROPOSAL, RESPONSE. The message bus is what makes the fleet behave like an org instead of like a set of isolated tools.

Without that structure, each agent runs its function well and the seams between functions produce errors. With it, the handoff is part of the design.

## One scorecard for everything

Standardization only holds if you can measure it from one place.

The failure mode in multi-location operations is a separate dashboard per location, per function, or per team type. You end up with a call center dashboard, a sales dashboard, an ads dashboard, an ops dashboard, and nobody who can see the whole picture. By the time a pattern shows up across locations, it has been running for weeks in the local dashboards where nobody was looking for it.

At Sneeze It, Bogdan's row is on the same scorecard as Radar's row and Arin's row and Dash's row. The rows are not separated by whether the seat is human or agent. They are organized by function. Each row has a metric that reflects what that seat is supposed to produce, a target, and a current number.

Deloitte's State of AI 2026 found that only 21% of organizations have a mature governance model for agentic AI. The other 79% are running agents without a unified accountability surface. The agents may be working. The operations may not be improving. Without a scorecard that connects the agent's output to the business outcome, you cannot tell.

MIT CISR's research on enterprise AI maturity shows a significant gap between organizations at different stages of readiness. The ones that reach the later stages share one characteristic: unified leadership that treats AI governance as an operational function, not a technical project.

The COO is the natural owner of that governance across locations, because the COO already owns the question of whether operations are consistent and measurable. Adding agent seats to the accountability chart is the same job, extended to a new kind of seat.

## When a seat stops working

The other thing a multi-location COO has to own is the retirement question.

In April, we retired Jeff, our former data integrity agent. Jeff was the first retirement in our agent fleet. The decision came from a review that showed Jeff's capabilities had been absorbed by other seats: Dash was already monitoring account status, Dirk was already running pipeline cleanup, and the seat Jeff was occupying no longer had a clear function.

We held a hearing before retiring the seat. The record is kept. Jeff's capabilities were redistributed. The operations continued.

This is not an unusual management decision. COOs retire functions that have been absorbed all the time. The decision tree applies in reverse: if the function no longer matches a clear output, the seat should not exist. An agent seat that is not producing a measurable output is overhead. It is not neutral.

The COO who runs a multi-location operation with agents has to be willing to audit the fleet the way they audit the org chart, and to make the same decisions: add seats where there are gaps, redesign seats where the function has changed, and retire seats where the work has moved.

## The practical order

If you are a COO trying to bring consistency across locations using a hybrid team, the order matters.

Fix the process before you staff it. Write down what each repeating function is supposed to produce. Run the decision tree: judgment in a human situation, or rule and data set? Assign the right seat type to each function.

Build the handoff structure before you build the scorecards. Agents that do not share context will produce consistent output locally and inconsistent outcomes at the seams. The agent message bus, or whatever coordination layer you build, is infrastructure. It is not optional.

Put everything on one scorecard. Humans and agents, same surface, same meeting cadence, same conversation when a number drops. The discipline of the Monday meeting does not change because some of the rows are agent seats.

Let agents carry the operational work so your people are free for the work that matters. The call center data, the cold prospecting pipeline, the daily performance scan, the KPI pushes, the pipeline monitoring: those functions can run consistently on agent seats. The judgment calls, the relationship decisions, the exception handling: those stay with people.

Standardization across locations is not a training problem or a franchise manual problem. It is a seat design problem. Get the seats right, build the handoffs, run one scorecard, and the locations start to behave consistently because the process is consistent, not because the people are interchangeable.

## See the live chart

The hybrid org chart at Sneeze It, including every agent seat and human seat, is queryable from OTP's MCP server.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the org chart for sneeze-it and identify which seats are agents, which are humans, and what each seat is accountable for."*

The response shows you a working model of what a standardized hybrid operating structure actually looks like when it is running.
