---
title: A CFO measures the ROI of AI the same way they measure the ROI of a hire
date: 2026-06-20
author: David Steel
slug: how-a-cfo-measures-the-roi-of-ai
type: founder_essay
status: published
series: ai-cfo
series_part: 14
description: The right frame for AI ROI is not token cost vs. output volume. It is seat cost vs. seat output, the same math you use for every hire.
---

# A CFO measures the ROI of AI the same way they measure the ROI of a hire

Here is the frame that keeps getting skipped.

Most conversations about AI ROI treat AI as infrastructure. You measure it the way you measure software: license cost divided by output volume, maybe a time-savings calculation if you can get someone to estimate their hours. The number you get back is either impressive or impossible to defend, and either way it does not change how the company is run.

The frame that actually works is simpler and less flattering to the technology. An AI agent is a seat. You measure it the way you measure the seat-holder. Cost of the seat versus value the seat produces. If the seat pays for itself at a margin you would accept from a human hire, the seat belongs on your chart. If it does not, it should be restructured or retired. The math is the same math you already know how to do.

That is the central claim. Everything below is how we run it at Sneeze It, and what it looks like before and after you make the switch.

## Before: AI as a line item with no accountability

Before we formalized this, our AI spend was a cost line. It sat with software and subscriptions, somewhere between the SEO tool and the video platform.

Janine, who runs accounting and AR and AP for the company, could pull the number if I asked for it. But she had no way to evaluate it. There was no seat it was attached to. There was no output it was compared against. There was no owner in the room responsible for defending whether that dollar was returning anything.

We were spending on agents that were doing real work: scanning inboxes, pulling ad data, flagging stale pipeline, scoring leads. The work was getting done. But from a finance perspective, it was invisible. The cost was in one bucket. The value was distributed across twenty other line items, untraceable back to the source.

This is the default state for most organizations running AI. The spend is visible. The value is not. So the number feels arbitrary, and any CFO worth the title is right to be skeptical of it.

The problem is not AI ROI being hard to measure. The problem is measuring it in the wrong category.

## The switch: agents are seats, seats have owners, owners have rows

The fix was to treat every agent like a hire.

Each agent at Sneeze It now has a seat on the org chart with a defined role, a defined scope, and at least one KPI it is accountable for. The cost of running that agent (API fees, tooling, compute) is attributed to that seat, not to a general software bucket. The seat's output is tracked against that cost. Once a week, the seat's numbers are on the same dashboard the human seats are on.

Tally, our scorecard agent, exists specifically to enforce this. Its job is to push KPI values from local sources to the OTP chart on schedule. It does this four times a day, on weekdays, without being asked. The chart is never stale by more than a few hours. When a seat's number drops, the conversation about why happens in the same meeting where Bogdan's COO numbers and Janine's AR numbers are reviewed.

When you put agents on the same accountability surface as humans, the ROI question becomes a normal management question. Not "is AI worth it" in the abstract. "Is this seat producing enough value to justify its cost, the same way every other seat is being held to that standard."

That is a question CFOs know how to answer.

## What the math looks like in practice

Take Dash, our analytics agent. Dash scans Meta and Google ad accounts for all our clients daily, surfaces spend anomalies, flags CPL changes, and writes a state file Radar reads during every briefing.

Before Dash existed, that work belonged to a human analyst who spent four to six hours a week doing it, and who still missed things because the accounts are too many to scan manually with any consistency.

The cost of running Dash as a seat is a fraction of what a human analyst's loaded cost would be for equivalent coverage. The output Dash produces, specifically the anomalies it catches before they become client problems, is measurable in retained revenue and avoided escalations.

I do not need a survey or a benchmarking firm to tell me that number. I can look at the cases where Dash flagged something in real time that would have gone unnoticed for three days under the old model, and I can estimate what a three-day delay costs in a client relationship. The math is not perfect. It does not need to be. It needs to be defensible at a Monday meeting, which it is.

That is the standard. Not a rigorous academic ROI calculation. A number a reasonable operator would defend to a reasonable board member.

## The seats that are easy to measure and the ones that are harder

Some agent seats produce output that is trivially measurable. Dirk, our sales agent, tracks cold outreach sent, qualified meetings booked, and pipeline stage transitions. Those are revenue-adjacent numbers. If Dirk's outreach is generating meetings that close, the attribution chain is short enough that a CFO can trace it without squinting.

Some agent seats produce output that is harder to quantify but still worth holding to a standard. Crystal, our project management agent, tracks stale projects and delivery risks. The value Crystal produces is largely a reduction in the number of things that fall through the cracks on client delivery. That is harder to put a number on than Dirk's pipeline. But the right response to that difficulty is not to move Crystal back to the software bucket. It is to define a proxy metric (delivery risks flagged per week, stale projects resolved per week) and hold the seat to it.

The seat accountability frame works even when the output is indirect. What it requires is that the seat have a defined role and at least one metric that is tied to a business outcome. If you cannot write that metric, the agent does not yet have a clear seat, and measuring its ROI is impossible not because ROI measurement is hard but because the role has not been defined.

## What "restructure or retire" looks like

In April we retired Jeff, our data integrity agent. Jeff had a real function early on. By April, the capabilities the seat was built for had either moved to other seats or were no longer needed in the form Jeff was executing them. The seat cost was real. The value was no longer there.

We ran the same evaluation we would run on a human role that had drifted from its original scope. We asked whether the seat could be restructured to produce value in a new form. We asked whether the capabilities were genuinely needed somewhere else, and if so, whether they belonged in a different seat that already existed. We concluded the seat should be retired and the capabilities redistributed to Dash and Dirk.

The decision was clean because the frame was clear. This is a seat. Seats are accountable for producing value that justifies their cost. This seat is no longer doing that. We close it.

That conversation is available to any CFO who runs AI inside an accountability frame. It is not available to the CFO who is looking at a software budget line and trying to evaluate whether the subscriptions are "worth it." You cannot retire a line item the way you retire a seat.

## What this lets the people do

This frame is not just about protecting margins on AI spend. The reason it matters is what it frees up.

When agents carry the operational scanning, the daily data pulls, the inbox triage, the KPI tracking, the anomaly detection, the people on your chart stop carrying that weight. Janine does not spend her morning tracking down which invoices are past due because the tracking is automated and the flags come to her. Bogdan does not have to pull project status manually because Crystal surfaces delivery risks before he asks. The people are free for the work that actually requires them.

That is the mission this is all in service of. Let agents carry the operational work so people are free for the work that matters. The ROI of that, measured at the seat level, turns out to be both easy to defend and worth defending.

## See the live chart

The OTP MCP exposes every seat on the Sneeze It chart, including agent seats, with role, KPIs, and output metrics, so you can query the actual accountability structure we run.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the agent seats on the Sneeze It chart and what KPIs they are accountable for."*

You will see the actual seat structure, not a case study, and you can compare it directly to your own chart to identify where agent seats could replace ambiguous software spend.

---

*Series: AI CFO. Post 14 of an in-progress series.*
