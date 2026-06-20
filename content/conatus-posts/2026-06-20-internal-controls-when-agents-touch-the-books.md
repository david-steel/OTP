---
title: Internal controls do not disappear when agents touch the books. They move.
date: 2026-06-20
author: David Steel
slug: internal-controls-when-agents-touch-the-books
type: founder_essay
status: published
series: ai-cfo
series_part: 28
description: What changes in your financial controls when AI agents handle numbers. The human-gated model breaks. Here is what replaces it.
---

# Internal controls do not disappear when agents touch the books. They move.

The assumption most operators bring into this is that agents make controls harder.

More hands on the numbers means more chances for something to go wrong. Harder to audit. Harder to trace. Harder to know who approved what and when. So either you keep the agents out of the financial layer, or you accept that your controls are weakened.

That assumption is wrong. Or at least it is incomplete.

What I have found, running agents that touch financial data every single day, is that the controls do not disappear. They move. They move from human-gated checkpoints to seat-level accountability gates. The discipline required is different. But the discipline is not weaker. In some ways it is tighter.

Here is what that actually looks like at Sneeze It, worked through a real example.

## The old model and why it breaks

In a traditional finance setup, the control is a human in the middle. A number gets generated. A human looks at it. A human approves it. The approval creates an audit trail. The human is the gate.

This works as long as the human is fast, available, consistent, and has enough context to know what they are looking at.

When you add agents, two things change. First, the volume of numbers increases. Agents produce data constantly, not once a day when someone has time to review. Second, the latency expectation changes. An agent that surfaces a billing discrepancy at 11 PM on a Friday is not going to wait until Monday morning for a human to approve it. If the control model requires a human in the middle of every pass, you will either slow the agents down to human speed or you will skip the controls.

Neither of those is acceptable. So you have to rethink what a control actually is.

## The Sneeze It model: seat-level accountability

We have three seats that regularly touch financial data.

Janine owns accounts receivable, accounts payable, and billing. She is a human. She is the financial authority on the chart. When something requires a judgment call that carries real consequence, it goes to her.

Tally is an agent whose only job is pushing KPI values from local sources to the OTP scorecard. It reads data, formats it, and pushes it four times a day. It does not write to any source-of-truth file. It does not modify billing records. It does not approve anything. It reads and it reports.

Dash is an agent that analyzes advertising spend across every client account daily. It also reads, compares, and surfaces patterns. It flags when a client's spend hits 80% of their budget. It flags account status changes. It does not move money. It does not submit invoices. It does not approve credits.

The control model here is not "a human reviews every output." The control model is "each seat has a clearly bounded job, and the job definition is itself the control."

Tally cannot overstate a KPI because it does not author KPIs. It reads them from files. The file is the source of truth. The seat definition is the fence.

Dash cannot misrepresent a client's billing exposure because it is not in the billing workflow at all. It is in the analysis workflow. Janine is in the billing workflow. Bogdan, our COO, owns the financial health of the business. Those seats are separate. The separation is a control.

## Where the real risk lives

This is the part most operators miss.

The risk in a hybrid finance model is not that the agent will do something wrong within its seat. The risk is that the seat boundaries drift.

Here is a concrete version of this. Dash started as a pure analytics agent: read the numbers, report the numbers. At some point I considered having Dash surface billing triggers directly to clients. Not to Janine. Directly to clients. Because the data was right there and it would save a step.

That would have been a mistake.

The moment Dash is in the client communication chain around billing, Dash is adjacent to a financial approval workflow. And "adjacent to" is the first step toward "responsible for." Once a seat is adjacent to a financial decision without being explicitly accountable for it, you have created a control gap. Not because the agent will make a bad decision on purpose. Because nobody agreed on what counts as a bad decision, and the audit trail does not know whose row to put the outcome on.

The fix was simple: Dash flags. Janine acts. The handoff is explicit. The boundary holds.

## What a control looks like in a seat-based model

A traditional control is a checkpoint: human reviews, human approves, log is written.

A seat-based control is a boundary: this seat can read X, can write Y, and cannot touch Z. The boundary is written once and enforced at the seat definition. The audit trail is the record of which seat did what, not which human was in the room.

This means your control work moves earlier in the process. You do not audit after the fact. You design the seat correctly before the agent runs.

For Tally, the seat design says: reads from local files, pushes to OTP scorecard, no other writes. The control is in the job description.

For Dash, the seat design says: reads from Google Sheets and ad APIs, writes to a shared state file, surfaces patterns to Radar's briefing and Janine's attention. The control is in what Dash does not have access to.

For Dirk, our sales agent, the seat design says something similar. Dirk can read GHL pipeline data, draft outreach, and log activity. Dirk cannot issue refunds, modify billing records, or send invoices. Revenue-recognition stays with Janine. The fence is explicit.

## The one control that humans still own

There is one kind of control that does not transfer to seat design. It is the exception.

An agent operating inside a well-defined seat will perform correctly on everything the seat anticipated. It is the thing nobody anticipated where the agent will either fail silently or do something unintended.

That is why every financial-adjacent seat at Sneeze It has an escalation path to a human. Not for routine operations. For anomalies.

Dash sees an account status flip it has not seen before: the rule fires and the alert goes to Janine, not to a queue. Tally encounters a KPI source that returns an unexpected format: it skips and logs, rather than publishing a garbled number. The design principle is fail visible, not fail quietly.

The human is not in the middle anymore. The human is at the edge, holding the exception path.

That is a real control. It is different from what most finance teams were trained on. But it is functional. And it scales in a way that "a human reviews every output" simply does not.

## What to check before an agent goes anywhere near your numbers

One question: does this seat have a clear fence around what it can write?

If the seat can only read, the control is easy. If the seat can write, you need to know exactly what it can write to, under what conditions, and what happens when a condition it was not designed for shows up.

That review happens once, before the agent runs. It is not a daily audit. It is a seat design review. Do it once per seat. Update it when the seat's job changes.

The internal controls do not disappear. They live in the seat definitions now.

## See the live chart

You can query the Sneeze It chart, including which seats touch financial data and how their write permissions are scoped, from any MCP client connected to OTP.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the Sneeze It seats that interact with financial data and describe what each seat is allowed to write."*

What comes back is a live read of the chart as it is actually configured. That is the audit trail. The seat definition is the control.
