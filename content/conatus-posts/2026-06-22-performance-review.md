---
title: Performance review is not a calendar event. It is a system.
date: 2026-06-22
author: David Steel
slug: performance-review
type: founder_essay
status: published
series: operating-system
series_part: 42
description: A performance review only works if the data is live, the goals were set at the start, and the conversation follows a structure that produces action.
---

# Performance review is not a calendar event. It is a system.

A performance review works when the data behind it was collected all year, the goals were written before the quarter started, and the conversation follows a structure that produces action instead of just producing discomfort.

Most reviews fail all three of those tests. The manager scrambles for examples in the week before the meeting. The goals were set in January and nobody looked at them again. The conversation wanders between praise and criticism without ever landing on a clear next step. The employee leaves confused about what "meets expectations" actually means for their role.

This post covers what goes into a review, how to set goals that make it honest, and what performance management looks like when it runs continuously instead of twice a year. I will also show what we do at Sneeze It, where we run reviews for both human team members and the AI agents on the org chart.

## Performance management starts before the review meeting

The most common mistake operators make with performance reviews is treating them as a standalone event. You schedule the meeting, you fill out the form, you deliver the feedback, you file the paperwork. Then you wait six months and do it again.

That process does not work because it has no memory. The manager reconstructs twelve months of performance from what she remembers, which means the review reflects the most recent six weeks far more than the prior ten months. An employee who had an exceptional Q1 and a difficult Q4 gets rated on the Q4.

Performance management is the ongoing process of tracking progress against clear standards, giving real-time feedback, and creating a record that makes the review meeting easy because the data is already there. When performance management is continuous, the review becomes a structured synthesis of things already observed and documented. It stops being an event and starts being a summary.

If your review process requires you to generate the evidence during the review preparation, you do not have a review process. You have a guessing process with a form attached.

The fix is a scorecard that runs all year. Each seat on the org chart has two or three metrics tied to the outcomes that seat is accountable for. Those metrics are tracked weekly. When the review comes, the data is already there.

We do this in OTP and also on paper for seats not yet fully instrumented. Tally, our scorecard agent, pushes KPI values from our data sources into the org chart automatically. When I review Bogdan, our COO, or Janine in accounting, I already have a twelve-month record of numbers tied to their seats. The review conversation is about patterns and development, not about reconstructing history.

## Goals for an employee performance review have to be set before the work starts

The most important thing about goals for an employee performance review is not how they are written. It is when they are written.

Goals written after the quarter started are not goals. They are post-hoc criteria. The employee did not know what she was being measured on. The manager did not know what she was measuring. The review that follows is a negotiation about standards that should have been agreed to before the work began.

Goals need to be set at the start of the period, written in language specific enough that both parties will agree, six months later, on whether the goal was hit. "Improve client communication" is not a goal. "Respond to all client messages within four business hours and achieve a 90-day client retention rate above 85 percent" is a goal.

The structure I use for every seat is adapted from the EOS Rocks framework developed by Gino Wickman of EOS Worldwide. A Rock is a priority that is specific, measurable, and achievable within a ninety-day window. At the start of each quarter, each seat identifies three to five Rocks. Each week, each Rock is reported as on-track or off-track. At quarter-end, the Rock is done or not done.

That rigidity is a feature. "On track" and "off track" force a binary conversation that prevents the drift that happens when goals are soft. OTP is not an EOS product and I am not affiliated with EOS Worldwide, but the Rocks structure is sound and it is what I use.

When the quarterly review comes, the goals were written ninety days ago. The conversation about whether they were met is short because the standard was already agreed to.

## Performance appraisal and the conversation structure that actually works

A performance appraisal is the formal documentation layer on top of the review conversation. It records what was observed, how it compares to the standard, and what happens next.

The conversation structure that produces useful appraisals has four parts.

First, start with the data. Look at the scorecard numbers for the period. Target, result. Do not editorialize yet.

Second, name what you observed beyond the numbers. The score tells you what happened. The observation tells you how. "Your pipeline numbers were above target every week, and I noticed you started qualifying out deals earlier" is an observation that explains a score.

Third, identify one or two patterns that matter for development. Not a full list. The one or two things that would most change the trajectory if they changed.

Fourth, agree on the next quarter's goals before the meeting ends. If you leave without that, you are starting the cycle over again with no standards set.

This structure works for Arin, our call center manager, reviewing Amanda the setter. It works when I review Bogdan. It works when a seat-owner reviews an agent's scorecard row. The structure does not change based on who is in the seat.

The step most managers skip is the fourth one. They run a good review and end the meeting without writing the next quarter's goals. The employee leaves with a clear picture of the last quarter and no picture of the next one. Ninety days later, the cycle repeats.

Write the goals in the meeting. Before anyone leaves the room.

## What performance review looks like for AI agents

Running reviews for AI agents is the same process, with one structural difference. The agent publishes its own numbers. It does not need to remember the year. The record is already there.

At Sneeze It, Radar writes its scan results to a shared file after every run. Dash publishes its ad performance analysis after every daily pull. Dirk logs pipeline activity to a state file after every sequence run. When I review an agent's performance, I pull the file history and the KPI chart. The data is clean.

The review conversation for an agent is with the seat-owner, the human who manages that agent's accountability on the chart. We ask the same four questions: targets, results, patterns, next quarter goals. If numbers dropped, the conversation is about what changed in the inputs or the SOP. If numbers improved, we document what produced the improvement so the pattern holds.

We had this conversation about Pulse, our retention agent, last quarter. The data showed strong early churn detection and weak expansion timing. The goal we set was specific: flag expansion opportunities only after two consecutive months of performance improvement, not one. That goal is in the chart. In ninety days, we will check whether it was met.

You can read more about agent accountability in the post on [putting humans and agents on the same scorecard](/blog/humans-and-agents-on-the-same-scorecard). One standard, applied the same way, regardless of whether the seat is held by a person or an agent.

If you are thinking through who owns each review on an Accountability Chart, the post on [adding an agent to your org chart](/blog/adding-an-agent-to-your-org-chart) covers the seat structure that makes reviews possible.

## Frequently asked questions

**What is the purpose of a performance review?**
A performance review compares actual results to agreed-upon goals, identifies patterns that explain the results, and sets clear standards for the next period. When it runs well, it produces two things: a documented record of performance and a written agreement on what the next quarter is supposed to produce.

**How often should performance reviews happen?**
Quarterly is better than annual for most seats. Annual reviews give too little signal too late. Weekly scorecard check-ins are what make quarterly reviews short and useful, because the data is already collected when the meeting arrives.

**What should goals for an employee performance review include?**
A specific outcome, a measurable standard, and a timeframe. "Improve sales performance by Q3" is not a goal. "Book twelve qualified discovery calls per month and maintain a close rate above 25 percent through Q3" is a goal. Both parties need to be able to agree, after the period ends, on whether the goal was met without arguing about what the standard was.

**What is the difference between a performance review and a performance appraisal?**
The review is the conversation. The performance appraisal is the written record of what was observed, how it compares to the standard, and what is expected next. The terms are often used interchangeably, but the distinction matters when documents need to be stored and referenced independently of the conversation that produced them.

**What is the biggest reason performance reviews fail?**
Goals were not set before the work started, so the review becomes a negotiation about standards after the fact. The second failure is that managers reconstruct the year from recent memory, so the last six weeks dominate a review that should cover twelve months. Both problems are solved by setting written goals at the start of each period and tracking a scorecard throughout.

## Run it in OTP

OTP lets you attach goals and KPIs directly to each seat on your org chart so the data is live when the review meeting comes. Every seat, human or agent, can carry its own scorecard.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the KPIs attached to each seat on my org chart and flag any seat with no goals set for the current quarter."*
