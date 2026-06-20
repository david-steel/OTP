---
title: The first finance tasks you hand to an agent are not the ones you think
date: 2026-06-20
author: David Steel
slug: what-finance-tasks-to-hand-to-an-agent-first
type: founder_essay
status: published
series: ai-cfo
series_part: 20
description: Which finance tasks to hand to an AI agent first, and why the answer is almost never invoicing. A worked example from Sneeze It's live org chart.
---

# The first finance tasks you hand to an agent are not the ones you think

Most operators who ask this question are thinking about invoicing.

They want to hand off invoice creation, payment reminders, maybe accounts receivable follow-up. Those are the tasks that feel mechanical and repetitive. They are the tasks that feel like the right answer to "what should an agent do first."

They are almost never the right first tasks.

I have been building this out live at Sneeze It for the past year. We have Janine on our team handling accounting, AR, AP, and billing. We have Tally, an agent whose only job is pushing KPI values from internal sources to our scorecard. We have Dash, an agent reading ad spend numbers across more than 60 client accounts every day. We have Dirk, an agent tracking revenue signals and pipeline movement. None of them are doing what most people imagine when they say "hand finance tasks to an agent."

Here is what I actually learned about the sequencing.

## Start with the number that lies to you right now

The first finance task worth handing to an agent is whatever number you are currently getting wrong because the human who should be checking it does not have time to check it reliably.

For us, that was ad spend reconciliation. Janine is excellent. She is not in 60 client ad accounts every morning. Nobody is, manually. So the numbers she was working from when she flagged billing discrepancies were always slightly stale. We were billing off last week's data, or last month's close, instead of what was actually running.

Dash fixed this. Dash reads the accounts every day, including Google and Meta, and writes a state file. Janine reads the state file. Her judgment is the same as it always was. Her inputs are now accurate. The invoices she generates are tied to numbers we can actually defend.

This is the pattern: find the number a human is acting on that is currently wrong or late because the data collection is manual. Hand the data collection to an agent. Leave the judgment to the human.

Do not start by handing the agent the judgment. Start by handing the agent the data.

## The second task is the one that only fails slowly

After you fix the data problem, look for the task that does not fail visibly when it slips. These are the tasks that accumulate quietly until they become real problems.

For us, that was scorecard hygiene. Tally was built specifically for this. Before Tally, the KPI values on our OTP scorecard were only as current as the last time someone remembered to update them. That could be daily or it could be eight days. The dashboard was always technically functional and often operationally stale.

Tally pushes KPI values on a schedule. Not because the values are complex to compute. Because the act of checking and updating is the kind of routine that humans do inconsistently when nothing breaks if they skip it once. The agent never skips it. The scorecard is now accurate four times a day on weekdays without anyone deciding to make it accurate.

The test for this category is simple. Pick any weekly KPI you track. How old was the number the last time you looked at it? If the answer is "I am not sure," that KPI is a candidate.

## The third task is the trigger you keep missing

The third category is triggers. Specific conditions that should produce specific actions, but only when the condition is met, which means a human has to remember to check whether it is met.

We have one of these for a client called HiTone Fitness. The billing rule is: when ad spend appears in CCM-Stats for any HiTone location, David flags Janine, who generates the invoice. The charge is $5,472 per month. Not a small number. The trigger is spend appearing in the data.

Before we made this explicit, the trigger was "someone remembers to check." After we made it explicit, Dash watches for it and flags it when it fires. Janine handles the billing. I handle the client relationship. Nobody is trying to remember a conditional.

You almost certainly have triggers like this. A client threshold that changes what you bill. A spend level that changes a contract status. A payment lag that should trigger a specific follow-up sequence. These are strong candidates for early agent work because the cost of missing them is high and the act of watching for them is purely mechanical.

## What you should not hand off yet

Now the part that takes more discipline to say: do not hand an agent the judgment calls.

Do not hand an agent the decision about whether a client relationship is healthy enough to send a billing escalation. Do not hand an agent the decision about whether a budget overage is a billing error or a performance decision. Do not hand an agent the cash flow forecast, because the inputs going into that forecast are still partly intuition based on what you know about your clients and your team.

I tried to shortcut this at Sneeze It. We had a period where we were experimenting with agents that were supposed to flag "billing risk." The flags were technically accurate and operationally wrong. An agent saw that a client's Accelo project was missing and flagged it as a billing concern. But HiTone bills off a retainer, not Accelo. The agent did not know that. Janine knew that. Bogdan knew that.

What looked like an opportunity to hand off more turned out to be an opportunity to waste Janine's time on false alarms. We rolled back. The agent now does data collection and trigger-watching. Janine does billing judgment. The boundary is clear and it works.

## The worked example, end to end

Here is how this actually runs on a normal day.

Dash reads ad spend across all client accounts every morning. It writes the numbers to a shared state file with timestamps. The file covers Meta spend, Google spend, and per-account status flags.

Tally reads specific KPIs from that state file and a few other sources. It pushes the values to our OTP scorecard four times a day. When I look at the scorecard, the ad spend numbers are current.

When Dash sees HiTone spend appear, it flags it. I see the flag. I tell Janine. Janine generates the invoice. That whole chain runs without anyone maintaining a spreadsheet or setting a calendar reminder.

Dirk watches the pipeline and flags revenue signals, including deals that have closed, which is the trigger that tells Janine to send a new client welcome invoice.

Janine's job has not gotten smaller. It has gotten cleaner. She is spending her time on the billing decisions that require judgment and relationships, not on the data collection that used to precede those decisions.

That is the mission this is all serving. Let agents carry the operational work so people are free for the work that matters. For Janine, the work that matters is knowing the clients well enough to handle billing in a way that does not damage the relationship. The agent handles the watching. She handles the knowing.

## The sequence, restated simply

Hand off the number that lies because the collection is manual. Then hand off the routine that only fails slowly. Then hand off the triggers that require a condition to be met before anything fires.

Hold the judgment, the relationships, and the calls where context about a client changes the right answer.

The invoicing can come later, once you trust the data underneath it.

## See the live chart

The seats named here, Tally, Dash, Dirk, and Janine, are all on the live Sneeze It org chart on OTP. You can query their KPIs and seat definitions directly via the OTP MCP.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me which seats on the sneeze-it chart are responsible for finance data, and what KPIs each one owns."*

You will see exactly which tasks are human-owned and which are agent-owned, and what the accountability line between them looks like in practice.

---

*Series: AI CFO. Post 20 of an in-progress series.*
