---
title: The CFO role does not disappear when agents run the back office. It gets harder.
date: 2026-06-20
author: David Steel
slug: how-the-cfo-role-changes-when-agents-run-the-back-office
type: founder_essay
status: published
series: ai-cfo
series_part: 3
description: When agents handle the transactional back office, the CFO seat shifts from data collection to judgment. Here is what that looks like in practice.
---

# The CFO role does not disappear when agents run the back office. It gets harder.

The assumption I hear most often from operators who are starting to hand financial operations to agents is that the human at the top of the finance stack is going to have less to do.

That assumption is wrong, and the misread is expensive.

When agents take over the transactional layer of your back office, the human CFO role does not shrink. It shifts. The seat goes from spending most of its time collecting, checking, and formatting financial data to spending almost all of its time doing the one thing agents cannot do: making judgment calls that require context, stakes, and accountability.

That shift sounds like a promotion. It is, in a sense. But it is also harder, because you can no longer coast on busyness. When an agent is doing the repeatable work, the human work that is left is the work that actually moves the business.

Here is how I have watched this play out at Sneeze It.

## What the agents actually took over

At Sneeze It the finance function is not large. We are a services business. We track client billing, accounts receivable, payroll, spend against budget, and the cash position at any given moment. For a company our size, that is the whole job.

Tally, our scorecard agent, owns KPI pushes. Every day, four times a day, Tally reads the relevant state files, extracts current values, and writes them to the OTP scorecard. Days receivable outstanding. Net new revenue this week. Cash collected versus target. The numbers are current because Tally is always running, not because a human remembered to update a spreadsheet.

Dash, our analytics agent, owns the spend layer. Across more than thirty ad accounts, Dash tracks daily spend, flags overpacing, and surfaces anomalies before they become billing surprises. When a client's account shows up in CCM-Stats with spend we have not invoiced for, Dash catches it and flags it.

Dirk, our sales and revenue agent, tracks pipeline state. Won deals, stale deals, proposals viewed and not responded to. Dirk writes to `dirk-latest.md` so that when Janine is preparing an invoice run, she is not hunting down deal status in three different places.

Janine is our human in the finance seat. She does billing, accounts receivable, accounts payable, and vendor relationships. She approves invoices and sends them. She handles the conversations with clients when a payment is late. She makes judgment calls about when to push and when to wait.

What changed when agents took over the transactional layer is not that Janine does less. What changed is what the work requires of her.

## The data collection problem went away

Before agents, a significant chunk of the time in any finance seat goes to collecting data. Pulling ad spend numbers. Tracking deal status. Updating the cash position. Chasing down whether a project is billable.

That work is not hard. It is also not valuable. It is coordination overhead that exists because the systems do not talk to each other automatically. When agents take that layer over, the coordination overhead disappears.

Janine does not spend time pulling ad spend because Dash already pulled it. She does not spend time tracking down deal status because Dirk already updated the pipeline. She does not spend time asking whether a client's ad account went live because Tally already pushed that number to the scorecard.

This sounds like a smaller job. It is not.

The hours that used to go to data collection do not disappear. They convert. They convert into the hours Janine now spends reviewing the data the agents surfaced and deciding what to do with it.

That conversion is where the role gets harder.

## Judgment does not scale the way data collection does

Here is the difference that operators miss. Data collection is repeatable. You can build a checklist. You can train a new hire to do it. You can build an agent to do it better.

Judgment is not repeatable in the same way. When Tally surfaces a number showing days receivable outstanding is climbing, the question is not "what does the number mean." The number is clear. The question is "what do we do about it, and when, and with this particular client."

That question requires knowing which client it is. It requires knowing whether they are in a rocky patch or just slow. It requires knowing whether Dirk has an expansion conversation in motion with them and Janine pushing hard on an invoice right now would damage it. It requires knowing whether the dollar amount is large enough to matter to cash flow this month.

Agents do not have that context. Janine does.

What the agent layer changed is that Janine now gets to apply that context every day instead of spending most of her time making the data available so she can apply it some of the day.

That is a real improvement. It is also genuinely more demanding, because there is no busyness to hide behind. When the data is already there and the action is unclear, the next move is always a judgment call.

## The accountability structure changes too

When a human is collecting data and making decisions from that data, the accountability is blended. The human who pulled the numbers is also the human who acted on them. When something goes wrong, it is hard to know whether the failure was in the collection or the judgment.

When agents collect and humans judge, the accountability separates cleanly.

If the numbers were wrong, that is an agent problem. The agent's seat on the chart has a metric for data accuracy, and that metric is visible every Monday. If the decision based on correct numbers was wrong, that is a human judgment call, and the accountability sits with the human who made it.

That separation sounds obvious. It is much rarer in practice than you would think. Most finance operations blend collection and judgment in ways that make post-mortems almost impossible. You cannot figure out whether the late invoice was late because the data was missing or because the decision to delay was made on purpose.

At Sneeze It, if HiTone Fitness shows up in CCM-Stats with new spend and Dash did not flag it for Janine, that is a Dash problem. If Dash flagged it and Janine delayed the invoice for a reason and the reason turned out to be wrong, that is a Janine decision and we learn from it. The agents did not make the finance function more complicated. They made the accountability cleaner.

## What the CFO seat actually looks like when this is working

The human finance seat in a company that has gotten this right looks less like a collector and more like a judge.

The agent layer surfaces what happened. Current spend. Cash collected versus target. AR aging. Pipeline state. It surfaces it accurately, consistently, without anyone asking. The human looks at what was surfaced and asks the question that cannot be automated: given everything I know about this business and these relationships and this moment, what should we do.

That is not a smaller job. It is a more important one.

The mission I keep coming back to at Sneeze It is to let agents carry the operational work so people are free for the work that matters. Finance is where I have watched that mission pay off most clearly, because the operational work in finance is extensive and the judgment work is scarce and the two used to be completely entangled.

When agents run the back office, the entanglement comes apart. The operational work goes where it belongs, which is to a seat that can do it twenty-four hours a day without error accumulation or distraction. The judgment work stays where it belongs, which is with a human who can be held accountable for it in a way that actually means something.

The CFO role does not disappear. It becomes the whole job.

## See the live chart

You can query the current finance-adjacent seats on the Sneeze It OTP chart, including Tally (scorecard pushes), Dash (spend and AR flags), Dirk (revenue pipeline), and Janine's human seat, to see how the accountability is distributed across human and agent rows.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the finance-adjacent seats on the sneeze-it chart and which are human versus agent."*

You will see a live view of how operational accountability is distributed in a working hybrid org, which is the fastest way to understand what the separation of collection and judgment actually looks like in practice.
