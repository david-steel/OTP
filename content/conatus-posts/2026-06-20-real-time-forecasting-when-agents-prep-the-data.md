---
title: Real-time forecasting is not a tool problem. It is a prep problem. Agents fix the prep.
date: 2026-06-20
author: David Steel
slug: real-time-forecasting-when-agents-prep-the-data
type: founder_essay
status: published
series: ai-cfo
series_part: 25
description: When agents handle data prep, forecasts stop being stale the moment they matter. Here is what that changes in practice at Sneeze It.
---

# Real-time forecasting is not a tool problem. It is a prep problem. Agents fix the prep.

The forecast was always there. It just arrived after the decision.

That is the part nobody advertises when they sell you a forecasting tool. The tool can be genuinely good. The dashboard can be genuinely beautiful. But if the data feeding it has to be assembled by a human before it reflects reality, then the forecast is only as current as the last time someone had an hour to update it. Which means it is usually stale exactly when it matters most.

This is the thing I kept running into before we built out the agent layer at Sneeze It. The question was never "do we have a forecast." We had a forecast. The question was "is it current enough to act on right now, in this conversation, before I move on." The answer was almost always no.

Agents fix this. Not because they are smarter about forecasting than humans. Because they remove the prep bottleneck that was making the forecast arrive late.

Here is what I mean in practice, broken into the five things that change when agents handle the prep.

## 1. The data does not wait for a human to pull it

Before Dash was running daily, the ad spend picture was a weekly manual pull. Someone would export from Meta, export from Google, line the numbers up, and drop the result somewhere I could read it. By the time that happened, the week had moved.

Dash now runs every morning. Across Meta and Google, across thirty-plus accounts, with spend sorted, flagged, and compared to yesterday's baseline and the thirty-day median. The data is current when I open my briefing, not current as of last Thursday when someone had time.

The forecast that runs on top of that data is therefore current. Not because the forecasting logic changed. Because the prep runs on its own, on a schedule, without anyone having to remember to do it.

When the data is always fresh, the forecast becomes something you can actually act on in real time.

## 2. The variance gets flagged before you have to find it

Manual prep has one natural failure mode: the person doing it looks for what they expect to find. They are not being careless. They are being efficient. You scan for the pattern, you move on, you miss the outlier hiding in column R.

Agents have no such bias. Dash is scanning for exactly the things that are off, every morning. If a Meta account's spend spiked to one hundred and forty percent of its thirty-day average, that flag appears at the top of the brief before I have touched my coffee. If a Google account went to zero spend when it should be running, same thing.

These are the variances that change a forecast. The budget might be fine until this week, when a single account went sideways. If the flag arrives in the morning brief, I can adjust the forecast in the morning meeting. If it waits for manual prep, I adjust it next week, and the forecast was wrong all week while the spend was running.

Real-time forecasting means real-time variance detection. Agents do that. Manual prep does not.

## 3. The numbers on the scorecard and the numbers in the forecast are the same numbers

This one took me longer to see than it should have.

When different people pull different numbers for different purposes, the numbers drift. The version in the forecast is not the version in the scorecard. The version Janine is looking at for AR is not the version Dirk is looking at for pipeline. Everyone has a number. Nobody has the same number. The reconciliation meeting exists because of this exact problem.

Tally runs against our scorecard on a regular cadence. It reads our source files and pushes the current values to the OTP chart. One source, one push, one number on the chart. When Janine is looking at days receivable outstanding, she is looking at the same number the forecast is using. When Dirk is looking at pipeline, his number is on the same chart Janine's number is on.

The forecast does not have to reconcile competing versions because there is only one version. That is not a forecasting insight. That is a data-discipline insight. Agents enforce the discipline automatically by being the single entity that updates the scorecard.

When the scorecard is always current and always consistent, the forecast built on it is also current and consistent.

## 4. The forecast can be run at decision time, not report time

Here is the rhythm that used to slow things down. A decision comes up mid-week. You want to know where you stand against budget. You pull up the last report. The last report was compiled on Monday. You do not know how the week has moved since Monday, so you build in a mental buffer, you hedge the decision, or you wait for the next report.

That hedge is expensive. Every time I hedged a spend decision because I was not confident the numbers were current, I either delayed something that should have moved or approved something I should have waited on. The hedge is not free. It is a cost.

Now Dash has already run this morning. The spend picture is from today, not from Monday. When the decision comes up mid-week, I am not hedging against a Monday number. I am acting on a today number. The decision lands cleaner, faster, and with more confidence.

The difference is not better forecasting models. The difference is that the agent ran the prep this morning instead of a human running it Monday and then the whole team waiting for the next cycle.

## 5. The historical baseline writes itself

Forecasting is mostly comparison. Is this month tracking above or below last month. Is this week trending toward the goal we set in January. Is this account's performance drifting relative to its own prior thirty days.

All of those comparisons require a baseline. And for a long time, maintaining that baseline was its own work. Someone had to save last week's numbers before pulling this week's numbers. Someone had to remember to update the thirty-day rolling average. Someone had to ensure the January goal was still the number the current performance was being compared against.

Agents maintain this automatically because they run on a schedule and write to a shared state file every time they run. Dash writes its output every morning. The prior morning's output does not disappear. The baseline accumulates without anyone managing it.

When I ask about this week versus the prior four-week average, that question is answerable because the data has been written every morning for months. I did not ask anyone to keep a historical record. The record kept itself, because the agent ran and wrote.

Forecasting that can see thirty days back, accurately, without anyone manually maintaining the archive, is forecasting that can answer real questions instead of approximate ones.

## The thing that is actually changing

None of this is about better math. The forecasting models in use today are not meaningfully different from what existed five years ago.

What is changing is who absorbs the prep burden. When a human carries it, the forecast is as current as the human's last available hour. When an agent carries it, the forecast is as current as the last scheduled run, which is today, which is this morning.

The mission I keep coming back to is the same one that shapes how we build the agent layer at Sneeze It. Let agents carry the operational work so people are free for the work that matters. Data prep is operational work. Running the daily numbers pull, flagging the variance, writing the scorecard, maintaining the baseline: every one of those is work that should not cost a person's morning.

When it does not, the forecast is ready when the decision is. That is the only thing that makes a forecast worth having.

## See the live chart

The seats named here (Dash, Tally, Janine, Dirk) are live on the Sneeze It org chart in OTP, with their current roles and accountability structures queryable via the MCP.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me which seats on the sneeze-it chart handle financial data, scorecard updates, or spend tracking, and whether each seat is a human or an agent."*

What comes back shows you how the data prep layer is staffed in a live hybrid org, and which parts are running without human intervention every day.
