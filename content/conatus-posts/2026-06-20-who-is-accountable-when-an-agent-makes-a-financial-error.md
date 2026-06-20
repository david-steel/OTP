---
title: When an AI agent makes a financial error, the accountability lands exactly where it would if a human made it
date: 2026-06-20
author: David Steel
slug: who-is-accountable-when-an-agent-makes-a-financial-error
type: founder_essay
status: published
series: ai-cfo
series_part: 26
description: Financial errors made by AI agents trace back to a human seat. The org chart determines who answers for it, not the technology.
---

# When an AI agent makes a financial error, the accountability lands exactly where it would if a human made it

The question sounds new. It is not.

When Tally, our scorecard agent, misreads a KPI source file and pushes the wrong number to the OTP chart, there is a moment right after where people want to know who is responsible. The instinct is to point at the software. The software made the error. The software should answer for it.

That instinct will cost you. It will cost you in audits, in client trust, and eventually in the culture of your team. The moment you let "the agent did it" function as an explanation, you have created a category of error that lives outside your accountability structure. That category will grow.

Here is the actual answer: when an agent makes a financial error, the accountability lands on the human seat that owns the agent's role. Same as it would if a junior accountant made the error. The agent is a seat on the org chart. The seat has an owner. The owner answers for the output.

## The confusion starts in how we frame the technology

Most operators frame agents as tools. Tools break and you replace them or repair them. Nobody is "accountable" when a spreadsheet calculates wrong. You just fix the formula.

Agents are not tools in that sense. Agents are seats. They have defined roles, defined outputs, and defined accountability lines. The seat might be filled by software instead of a person, but the seat still exists on the chart and the chart still has a human anchoring it.

When I treat Dash, our analytics agent, as a tool, I stop asking "who owns Dash's output?" Because tools do not have owners in the accountability sense. They have operators. And operators of tools are not accountable for tool outputs the way managers are accountable for direct reports.

When I treat Dash as a seat on the chart, the ownership question has an obvious answer. I do. Because right now Dash reports to me. If Dash publishes a number that is wrong and that number makes it into a client conversation, I am the person who explains what happened. Not because I ran the query myself. Because the seat reports to me and I am accountable for what the seat produces.

This framing change is not cosmetic. It changes what you build around the agent, how you review its output, and how fast you catch errors before they compound.

## What actually happened the last time we had a financial error

Earlier this year, Tally pushed a KPI value that was stale. The source file had not been updated and Tally read the old number. The number went to the OTP chart. I spotted it during a weekly review.

The first question I asked was not "what is wrong with Tally?" It was "who checked this output before it published?" The answer was no one. We had not built a review step for that particular KPI category because we assumed the source file was always current. That assumption was wrong.

The fix was not a Tally fix. The fix was a process fix. We added a staleness check to the source file before Tally reads it. We also added a review gate for any KPI that touches client-facing billing data.

Those fixes came from the human seat that owns Tally's accountability, which at that point was me. I designed the review gate. I approved the staleness check logic. The error traced back to a gap in the process I was accountable for, not to a flaw in the technology.

That is what accountability actually looks like in a hybrid org. The agent did not make a mistake in isolation. The seat around the agent did not have the right guardrails. The human who owns that seat fixes the guardrails.

## Janine is accountable for financial output, regardless of which seat produced it

Janine runs accounting, AR, AP, and billing at Sneeze It. She is a human seat. She does not run an AI agent. But the financial data that reaches Janine's desk comes partly from agent-produced outputs. Dash synthesizes spend numbers across our ad accounts. Tally pushes KPI values to the scorecard. Dirk, our sales agent, logs deal stages and revenue pipeline into GHL.

Janine is not responsible for the agent logic behind those numbers. But if a number that reaches her is wrong and she uses it to generate an invoice, she and I both answer for that invoice. The accountability does not stop at "Dash said so." Janine has always operated inside a system where data from other humans was imperfect and needed review. Agents are not a different category. They are more sources, with their own error profiles, that sit upstream of her work.

This is not unfair to Janine. The alternative is worse. The alternative is a world where agent-produced financial data is exempt from human review because "the agent ran it." That world does not have tighter accountability. It has a gap in accountability dressed up as automation.

The right structure is the same one you would use if you hired a junior analyst to pull the numbers. Janine would not blindly use a new analyst's output on day one. She would build a review step. She would know that person's error profile. She would spot-check. You do the same with the agent seats that feed her work.

## The scoreboard does not care which kind of seat produced the number

Every Monday I walk the OTP chart. I look at the numbers. When a number is wrong or missing or stale, I ask who owns the seat that produced it.

If Dirk's pipeline data is off, Dirk's seat-owner (me, for now) is the person who explains it. If Tally pushes a wrong number, same answer. If Dash mislabels a client's ad spend and it creates a discrepancy with what Janine has in the billing system, both seat-owners are in the conversation.

The scorecard does not have a column for "agent-produced, therefore exempt." It has a column for who owns the row. That person answers for the row.

This is the only structure that scales. If you exempt agent rows from accountability, you create an expanding blind spot in your financials. Every time you add an agent that touches money, you add a zone of the org where nobody fully answers for the output. At two agents that is manageable. At ten it is a liability.

## Accountability does not require humans doing the work. It requires humans owning the work.

There is a version of AI adoption that feels like removing accountability. You automate a task, nobody is watching the automation, errors happen quietly, and by the time they surface the trail is cold.

That version fails. Not because AI is untrustworthy, but because you removed the ownership without reassigning it. Ownership cannot be automated. The work can be automated. The accountability stays human.

What changes when agents carry the operational work is that humans are freed for the work that actually requires them. Judgment calls. Client relationships. The conversation with Janine when a billing dispute surfaces. The decision about whether to flag a pattern or let it ride. The oversight of what the agents are producing and whether it is right.

That oversight is not a burden. It is exactly what the human seats should be doing. Agents handle the volume. Humans handle the accountability. That split is what makes the whole system trustworthy.

## See the live chart

You can query our live org chart, including which human seats own which agent seats and what financial accountability flows through each, using the OTP MCP.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the sneeze-it org chart and identify which human seats own accountability for agent-produced financial data."*

What comes back is a structured map of who answers for what. Run that same question against your own chart and you will immediately see where accountability is assigned and where it is not.
