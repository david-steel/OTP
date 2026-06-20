---
title: The right AI budget is not a number. It is an answer to three questions.
date: 2026-06-20
author: David Steel
slug: how-much-should-a-cfo-invest-in-ai
type: founder_essay
status: published
series: ai-cfo
series_part: 31
description: CFOs who ask "how much should we spend on AI?" are asking the wrong question. Here are the three questions that lead to the right number.
---

# The right AI budget is not a number. It is an answer to three questions.

Every CFO I talk to wants a percentage. Some fraction of operating budget, or revenue, or headcount cost, that tells them how much AI spending is correct.

I understand the impulse. Percentages feel safe. They give you cover. "We're investing X percent of revenue in AI, consistent with industry standards" is a defensible sentence in a board presentation.

It is also mostly useless.

The right AI investment is not a percentage. It is the output of three sequential questions, each of which gates the next. Answer the questions in order. The number falls out at the end. If you skip to the number first, you will either underspend in the wrong places or overspend on things that do not close your actual gaps.

Here is the decision tree I use at Sneeze It, built by running agents through it repeatedly over the past year.

## Question 1: What is the work that no human on your team should be doing?

This is not a question about automation. It is a question about allocation.

In any company, a meaningful portion of what your best people do every week is operational carry: routine data pulls, status summaries, scheduling coordination, basic reconciliations, repetitive communications. It is not strategic. It is not irreplaceable. It is just load. And your best people are carrying it because nobody else has time.

Identify it specifically. Not in categories. In tasks. Who is doing what, how often, and what would they do instead if that work disappeared from their week?

At Sneeze It, Janine runs accounting. Her highest-value work is client billing, AR follow-up, and the kind of month-end judgment calls that require context only she has. Her lower-value work, before agents, was assembling status data that already existed elsewhere, compiling reports that repeated the same structure every cycle, and flagging things that should have been flagged automatically upstream.

The question is not "can AI do Janine's job?" It is "which parts of Janine's week should not be Janine's problem?"

The answer to that question is the only legitimate starting point for an AI budget. Everything else is speculation.

## Question 2: Which of those tasks can a current-generation agent actually own?

This is where most AI investment conversations go wrong. People skip from "we have this work" to "AI will handle it" without asking whether a current agent can reliably own it without supervision that costs as much as just doing the work.

The honest answer in 2026 is that agents are good at a narrow set of things. They are good at pulling structured data and summarizing it. They are good at executing a defined sequence of steps without deviation. They are good at flagging when inputs fall outside a threshold. They are good at drafting routine communications against a template. They are bad at judgment under ambiguity. They are bad at anything requiring real-time human context. They are bad at work where a miss has large asymmetric consequences.

Run each task from Question 1 through a short gate: Can the agent's output be verified in under ten seconds by the human who used to do it? Is failure low-stakes and reversible? Does the task have a defined input format and a defined output format?

If yes to all three, the agent can probably own it. If no to any of them, the agent becomes an assistant, not an owner, and the investment math changes.

Tally, our scorecard agent, owns KPI pushes to our OTP chart. Structured input (data in a file), defined output (a number posted to a specific field), low-stakes if it misses (the number is stale for an hour, not catastrophic). That is a task that passes the gate. Tally runs it four times a day with no human in the loop.

Dash, our ad analytics agent, owns data pulling and pattern flagging across our Meta and Google accounts. Structured inputs, defined output format, low-stakes individual flags. The human judgment layer (what to do about the pattern) stays with me and the client teams. Dash passes the gate for the data work. The judgment layer does not.

Question 2 tells you which fraction of your Question 1 list is investable now, versus later, versus never.

## Question 3: What does the freed capacity actually cost, and what does it buy?

This is the part where you get your number.

Take the tasks that passed Question 2. Calculate what it costs your current team, at loaded cost, to do those tasks per year. That is your upside ceiling: the maximum you could theoretically recover by automating. In practice you will recover a fraction of it, because humans are not perfectly fungible and freed time does not always convert cleanly to higher-value work. Call your recovery rate somewhere between thirty and sixty percent in year one, depending on how disciplined your team is about actually moving to higher-value work when the operational load lifts.

Now calculate what it costs to run the agents that replace those tasks. This includes tooling (model API costs are lower than most people assume, often well under a hundred dollars a month per seat for most operational tasks), engineering time to build and maintain, and the human review time for tasks that are not fully autonomous yet.

If the agent cost is less than the human cost times your recovery rate, you have a fundable investment. Not because it is impressive, but because the arithmetic closes.

Bogdan, our COO, reviews this math roughly every quarter. We do not have a policy that says "we invest X percent in AI." We have a running list of tasks from Question 1, a gate from Question 2, and a cost comparison from Question 3. When a task clears all three, we build the agent. When it does not, we leave it alone until either the task changes or the agent capability catches up.

Right now that math is working clearly for operational data work, routine communications, and structured reporting. It is not working yet for judgment-heavy work, for high-consequence decisions, or for anything where the cost of a wrong output exceeds the cost of the human hour.

## The mistake that looks like strategy

The most expensive AI investment I see CFOs make is paying for capability they cannot yet use.

It shows up as enterprise contracts for platforms that are impressive in demos and underutilized in practice. It shows up as large model API budgets for tasks that a cheaper model handles identically. It shows up as agent investments in tasks that never passed Question 2, where the agent does the work and a human re-does it anyway because the output is not reliable enough to publish.

The second most expensive mistake is waiting too long on tasks that clearly pass all three questions.

Dirk, our sales and revenue agent, ran the Question 1 and Question 2 gate before we built him. Cold outreach qualification, pipeline scanning, deal status flagging. Structured work, clear inputs and outputs, failures are reversible, output is verifiable in seconds. The cost of building and running Dirk is a fraction of what a fractional sales hire would cost for the same work. We were late to that investment because we were waiting for some kind of industry benchmark to tell us we were allowed.

No benchmark was going to give us that permission. The three questions were the only framework that actually produced a number we could defend.

## Where the number lives

The CFO question is not "how much should we invest in AI?" The question is "what operational work is our team carrying that we can identify, gate, and replace with agents whose cost clears the math?"

Run that process once seriously and you will have your number. It will be specific to your company, your team's actual cost structure, and the tasks your current best people are doing instead of the work they were hired for.

The mission underneath all of this, the reason it matters, is simple. Agents carrying operational load means people are free for the work that actually requires them. That is not a technology argument. It is a resource allocation argument, and the CFO is exactly the right person to make it.

## See the live chart

You can query the OTP MCP to inspect which seats on the Sneeze It chart are currently running autonomous agents, what tasks those agents own, and how they sit on the accountability chart relative to human seats.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the Sneeze It org chart and identify which agent seats are handling tasks that freed human capacity."*

You will see the actual seats, the actual roles, and the accountability structure that makes the investment legible at the board level.
