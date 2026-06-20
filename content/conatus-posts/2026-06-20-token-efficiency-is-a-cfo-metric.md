---
title: Token efficiency is a CFO metric, not an engineering detail
date: 2026-06-20
author: David Steel
slug: token-efficiency-is-a-cfo-metric
type: founder_essay
status: published
series: ai-cfo
series_part: 1
description: Why token efficiency belongs on the CFO's scorecard. The hidden margin line in an agent-run business, how to measure cost per task against fully-loaded labor, and what finance actually owns when agents do the work.
---

# Token efficiency is a CFO metric, not an engineering detail

The first time a finance leader hears the word token, they file it next to latency and uptime. A technical thing. An engineering thing. Something the people who build the agents worry about, the way they worry about server costs.

That instinct is wrong, and it is expensive.

Token efficiency is a margin line. It belongs to the CFO.

Here is the reasoning. When an agent does a unit of work, it consumes tokens. Tokens have a price. The price moves with how the agent is built, how it is prompted, how much context it carries, and how often it repeats itself. Two agents can produce the identical outcome and one can cost four times the other. The difference does not show up in the demo. It shows up on the bill, every month, multiplied by every task the agent runs.

That is not an engineering metric. That is unit economics. And unit economics has always been the CFO's table.

## What a token is, in CFO language

You do not need to understand the math to own the line. A token is the unit a language model bills in. Think of it as the meter on the work. Input tokens are what the agent reads to do a task. Output tokens are what it writes. Both are priced, output usually higher than input.

The number that matters to you is not tokens. It is cost per task. How many dollars does it take for an agent to do one reconciliation, draft one email, qualify one lead, prep one forecast. That number is a function of token usage, and token usage is a function of design choices that someone in your company is making with or without your visibility.

If no one in finance is watching cost per task, then the company is running a variable cost line that scales with volume and answers to nobody. You would never allow that for any other input. You should not allow it here.

## Why this is finance work and not IT work

The CIO can tell you what the agents cost in total. That is a budget number. It tells you the size of the bill, not whether the bill is good.

The question that decides margin is the one finance is built to ask. What did we get for it, and could we have gotten the same for less. That is a cost-per-unit question. It is the same question a CFO asks about cost of goods, about cost to acquire a customer, about fully-loaded labor cost per output. The medium is new. The discipline is not.

At Sneeze It this lives on the same scorecard as everything else. Tally, our scorecard agent, pushes the numbers that let us see cost against output per seat. Dirk, our sales agent, sends cold outreach. The number I care about is not how many tokens Dirk burned. It is cost per qualified meeting booked. When that number moves, I want to know whether the cause was volume, design, or waste. Dash, our analytics agent, runs against a large pull of ad data every day. The number I care about is cost per usable insight, not the raw spend. Same logic, every seat.

## The comparison that makes the case

The reason token efficiency matters is that it sits next to the most expensive line in most companies, which is people.

When you put cost per task next to fully-loaded labor cost for the same task, you get the real decision. Not "should we use AI," which is a slogan. The real decision is "for this specific unit of work, what does a human cost, what does an agent cost, and what does the blend cost." That is a number a CFO can act on. It tells you what to automate, what to keep human, and where the margin actually moves.

This is where the mission becomes a P&L statement instead of a poster. Let agents carry the operational work, so people are free for the work that matters. The CFO is the one who can prove that sentence is true, because the CFO can show the toil leaving the cost line and the judgment work staying where the value is.

## What goes on the scorecard

You do not need a new dashboard. You need a few new rows on the one you have.

Cost per task, for every workflow an agent runs. Token efficiency trend, so you can see whether a workflow is getting cheaper or quietly more expensive as it grows. Automation rate, the share of a process now carried by agents. Margin per workflow, so the unit economics roll up to something the board understands. And a ceiling on variable spend per agent, so no seat can run up a runaway bill without tripping a flag.

None of these require you to write a prompt or read a model card. They require you to treat the agent line the way you treat every other input that touches margin. Which is to say, they require a CFO.

## The shift underneath all of it

The old CFO reported what happened. The agent-era CFO prices what automates. Token efficiency is the first place that shift becomes concrete, because it is the first line where a finance decision and a technology decision are the same decision.

The companies that win the next decade will be the ones where the CFO claimed this line early, while everyone else still filed it under engineering. The bill is already running. The only question is whether finance is reading it.

## See the live scorecard

Our hybrid chart puts humans and agents on the same scorecard, with the same kind of cost-and-output discipline this post describes, queryable from your AI assistant.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show how a hybrid team puts cost and output on one scorecard across human and agent seats."*

You will see what it looks like when finance owns the agent line instead of inheriting it.

---

*This is part one of the AI CFO series. It pairs with the Organizing Agents series on [putting humans and agents on the same scorecard](/blog/humans-and-agents-on-the-same-scorecard) and [measuring agent performance](/blog/agent-that-does-not-push-its-own-kpi). Next in the series: what a CFO actually does in the age of AI, and the five responsibilities that did not exist five years ago.*
