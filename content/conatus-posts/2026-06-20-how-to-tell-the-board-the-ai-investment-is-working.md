---
title: The board is asking the wrong question about AI. Here is the right one.
date: 2026-06-20
author: David Steel
slug: how-to-tell-the-board-the-ai-investment-is-working
type: founder_essay
status: published
series: ai-cfo
series_part: 18
description: Stop trying to prove AI ROI with a spreadsheet. The evidence that matters is in the operating record, and here is how to read it.
---

# The board is asking the wrong question about AI. Here is the right one.

Every board conversation I have heard about AI investment follows the same script. The operator shows up with a slide. The slide has a line that says "AI investment: $X." Below it there is another line that says "AI productivity gain: estimated $Y." The board looks at the ratio and decides whether Y justifies X.

The conversation is not wrong. It is just insufficient. And the insufficiency is what gets operators in trouble six months later when the numbers stop looking clean.

Here is the central claim: the question "is the AI investment working" cannot be answered by a single cost-benefit ratio. It can only be answered by reading the operating record. The record shows what the seats are doing, what the numbers say, and whether the work is actually landing. The ratio is a summary of the record. Show the board the record, not the summary.

## Why the ratio lies

A cost-benefit ratio tells you whether you paid less for something than it returned. That is a useful question for a machine. A CNC router. A conveyor belt. A software license that automates invoice processing.

AI agents are not machines in that sense. They hold seats. They make judgment calls. They influence the work of human seats around them. When Dirk, our revenue agent, sends a cold email sequence, the value of that send is not just the cost-per-email. It is the signal quality of the lead, the timing of the follow-up, the coordination with Nick (our cold prospecting agent) to avoid double-touching a prospect, and whether the pipeline Dirk builds actually closes. None of that fits neatly into a numerator and a denominator.

The ratio also has a timing problem. The cost shows up immediately. The value shows up later, after conversion cycles, after agents have had time to learn the patterns, after the human seats that depend on agent work have had time to integrate it. Show the board a ratio three months in and you are almost always showing them a number that understates the gain.

So stop leading with the ratio. Lead with the operating record. Then let the ratio be a footnote.

## What the operating record actually shows

At Sneeze It, every seat on the org chart, human and agent, publishes a row on the same scorecard. There is no separate AI dashboard. Tally, our scorecard agent, pushes the numbers from each seat to the chart on a consistent cadence throughout the day. When the board wants to know whether the AI investment is working, I do not pull a spreadsheet. I walk them through the chart.

Here is what they see.

Dash, our analytics agent, produces a daily performance scan across every client ad account we manage. That scan used to take a human analyst three to four hours a day. It now takes Dash about twelve minutes, and the scan is more complete because Dash does not get tired by the fifteenth account. The output feeds directly into the client calls our human account managers run. The human account managers did not disappear. They redirected their time from pulling data to acting on it. That is measurable. We track the ratio of time spent in data preparation versus time spent in client strategy. The ratio has shifted. That shift is in the operating record.

Dirk manages the sales pipeline. Before Dirk, the pipeline was audited by a human when someone remembered to audit it. The cadence was irregular. Deals would sit in the wrong stage for weeks. Dirk runs a review on a fixed cadence, flags stale deals, and surfaces the ones that need human attention. The human who reviews Dirk's output spends thirty minutes a week on pipeline hygiene instead of three hours. That is also in the record.

Janine, our human accounting lead, used to chase billing triggers manually. She watched for signals that a new client had hit spend thresholds, then fired the invoice. Now she gets a structured flag from the system when the threshold is met. She does not scan for it. She acts on it. Her rows on the chart show the same billing accuracy, at a fraction of the attention cost.

None of this is a ratio. All of it is a record. And the record is the evidence.

## What to actually bring to the board

The board slide I would build has three sections, and none of them are a single ROI number.

The first section is the seat map. Which seats exist, which are agent seats, which are human seats, and what each seat is accountable for. The seat map shows the board that the investment is not a technology experiment. It is an organizational structure. Agents hold seats the same way humans do. They have metrics. They have a manager. They have accountability. A board that understands the seat map understands that the conversation is not "did the AI tool pay off" but "are these seats performing."

The second section is the operating deltas. For each agent seat, show what the human work looked like before the seat existed. Not in abstract terms. In specific time and output terms. Dash replaced four hours of daily data compilation. Dirk replaced irregular manual pipeline reviews. Pepper, our EA agent, triages and drafts responses to the client email queue, which used to sit in my inbox until I got to it. The delta between "before" and "after" is the operating gain. It is auditable. It is concrete. It is not an estimate.

The third section is the downstream human impact. This is the part most operators miss. When an agent seat takes over operational work, the human seats around it change. The human account manager who used to pull Dash's data now runs better client calls. The human closer who used to do pipeline hygiene now spends that time on proposals. Janine's attention is on exceptions and judgment, not on hunting for signals. The board needs to see this part because this is where most of the organizational value lives. Not in the agent's output. In what the humans do with the freed capacity.

## The question that actually matters

There is one question I would add to the board slide that most operators do not think to include. It is not "what did the AI investment return." It is "what would the organization look like without it."

At Sneeze It, the honest answer is that without the agent layer, we would need three to four additional full-time hires to maintain the current operating cadence. We would need an analyst to do what Dash does. A pipeline coordinator to do what Dirk does. An EA to do what Pepper does. A project tracker to do what Crystal does across our Accelo data. The cost of those seats is not hypothetical. It is a real number. It is the cost of the operating capacity we are running without paying human salaries for it.

That comparison, agent seats versus the human equivalent, is the most honest frame I have found for a board conversation. It does not overstate. It does not claim that agents are doing something no human could do. It just asks: what is the organizational cost of running this operation, and how does the agent layer affect that cost. When you frame it that way, the ROI conversation becomes a lot simpler, because the alternative is visible.

## What the board actually needs to trust

The thing boards distrust about AI investments is not the math. The math is usually fine. What they distrust is durability. They have seen technology investments that looked good for two quarters and then degraded. They have seen vendors promise compounding returns that never compounded. They are right to be skeptical.

The answer to that skepticism is not a better ratio. It is the operating record over time. Show the board the seat map from six months ago and the seat map today. Show them the trend on each agent row. Show them the moments where an agent row dropped and what happened next. Show them that the accountability structure works the same way for agent seats as it does for human seats. The board is not looking for magic. They are looking for a management system that holds. Show them the system, not the result.

The mission, when I am honest about it, is to let agents carry the operational work so people are free for the work that matters. The board conversation is really about whether that mission is happening. The operating record is the proof.

## See the live chart

The seats and metrics described in this post are queryable through the OTP MCP, including which seats are agent-held, what metrics each seat tracks, and how the chart has changed over time.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the agent seats on the sneeze-it chart, their metrics, and who the human seats are that each agent seat supports."*

You will see exactly the kind of operating record this post describes. That is the evidence to bring to the board.
