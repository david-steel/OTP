---
title: The CFO of 2030 is a seat, not a title, and part of the capacity filling it will not be human
date: 2026-06-20
author: David Steel
slug: what-the-cfo-of-2030-looks-like
type: founder_essay
status: published
series: ai-cfo
series_part: 35
description: The CFO function is splitting into judgment work and operational work. One part stays human. The other is already being automated at Sneeze It.
---

# The CFO of 2030 is a seat, not a title, and part of the capacity filling it will not be human

Most conversations about the CFO of 2030 are really conversations about software.

Better forecasting tools. Smarter dashboards. AI that summarizes the cash position before the Monday call. The assumption underneath all of it is that the role stays the same and the tools get better. A human CFO, same as before, but with a faster spreadsheet.

I think that assumption is wrong. Not wrong about the tools getting better. Wrong about what the CFO function actually is when you pull it apart.

The CFO function is two things, and they are not the same thing wearing the same title. One is judgment: reading the business, making calls under uncertainty, deciding what the numbers mean. The other is operations: collecting the numbers, reconciling them, pushing them to the right places at the right time, flagging when something is off. Judgment requires a person. Operations does not. And the operations half is already being automated, right now, in small businesses that could never afford a full-time CFO.

The CFO of 2030 is what you get when those two halves finally separate on the org chart.

## The operation half is the part that grinds people down

I have watched what finance operations actually costs at a small agency. Not in money, though the money is real. In attention.

Janine, who handles accounting and AR and AP and billing at Sneeze It, is one of the sharpest operators I know. But a significant portion of her week is not judgment. It is the operational rhythm that keeps the numbers honest. Reconciling what was invoiced against what hit the bank. Flagging when a client account looks like it is going to miss. Knowing when a new client crosses the threshold that triggers a billing change, so the conversation with David happens on time instead of late.

That operational rhythm is important. It is also, increasingly, the kind of work that does not need a human to do it first.

Tally, an agent on our chart, pushes KPI values from local data sources to the company scorecard on a schedule. No prompt from me. No Slack message asking if the numbers got updated. The numbers are just there, four times a day, when the humans who need them need them. That is a small version of what financial operations automation looks like. The agent does not understand the business. It does not decide what the numbers mean. It keeps the clock ticking so the humans can spend their time on the part that requires them.

## The judgment half is where the real value lives, and it is not going anywhere

Here is the part of the CFO conversation that gets skipped in most pieces about AI taking over finance.

The judgment work in finance is not rule-following. It is reading a set of numbers and knowing what they mean given everything else you know about the business, the client, the market, and the people. That is not a pattern-matching problem. It is a context-carrying problem. And the context required is the kind that lives in relationships and history, not in a database.

When Janine sees that a client account has been slow to pay for three consecutive months and simultaneously knows that the account manager mentioned a budget freeze in passing last week, she is doing a kind of synthesis that no agent currently on our chart is equipped for. She is not executing a rule. She is seeing a shape across time and context that means something. That shape will still need a human to see it in 2030.

The mistake is assuming that because the judgment work is irreplaceable, the whole CFO function is irreplaceable as-is. It is not. The operations layer that currently sits under the judgment layer and consumes a large fraction of finance time is separable. And separating it is where the opportunity is.

## What the split looks like in practice

At Sneeze It, the finance function is not fully split yet. We are partway through it.

Tally carries the scorecard operations. Dash, our analytics agent, reads ad spend numbers across all client accounts and flags when a budget looks misaligned with the billing category. That is a financial signal that used to require someone to manually pull numbers and compare them. Now it surfaces automatically, and Janine or I look at it when it is relevant. Dirk, our sales agent, tracks pipeline value and stage transitions, which is another financial signal: what the business is likely to earn three months from now based on what is moving today.

None of those agents replace Janine. They are upstream of Janine. They do the part of the financial operations job that is rhythmic, repetitive, and rule-bound. She does the part that requires judgment. The split is already on the chart. We just did not call it CFO architecture when we built it.

The CFO of 2030, for a business our size, probably looks like this. A part-time or fractional CFO who does the judgment work: reading the business, making calls under uncertainty, talking to the bank, deciding what the numbers mean for the next quarter. And a set of agents handling the operational rhythm underneath: collecting, reconciling, flagging, publishing. The agents do not need to understand the business. They need to know the rules, run the clock, and surface the right signals to the right people at the right time.

That is not a dramatic prediction. It is a description of what is already happening in the businesses building this way.

## The thing most people miss about the split

The point of separating judgment from operations is not to cut the finance function down to a smaller headcount. It is to let the judgment work happen more cleanly.

When Janine is not spending hours on reconciliation work, the time she has for reading the business improves. The financial calls she makes get better because she has more time and attention to look at the signals that actually matter. The agents running the operational layer are not replacing her judgment. They are clearing space for it.

This is the real reason the CFO of 2030 is a different kind of seat, not a smaller one. It is a seat where the judgment-to-operations ratio has flipped. Where most of what the human does is the high-value, high-context work, and the operational rhythm runs underneath on its own.

That is the mission the whole hybrid chart is built around: let agents carry the operational work, so people are free for the work that matters. Finance is just one of the last functions where people have not yet admitted that this is what is happening.

## See the live chart

From the OTP MCP, you can query the current seats on the Sneeze It chart and see which ones are carrying financial operations work versus judgment work, and which are human versus agent.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me which seats on the sneeze-it chart handle financial or scorecard operations, and which are agents versus humans."*

You will see the split in live form. That is the chart the CFO of 2030 is built on.
