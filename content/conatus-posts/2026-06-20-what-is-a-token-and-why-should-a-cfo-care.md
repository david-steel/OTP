---
title: Tokens are a cost line, not a technical detail, and your CFO needs to treat them that way
date: 2026-06-20
author: David Steel
slug: what-is-a-token-and-why-should-a-cfo-care
type: founder_essay
status: published
series: ai-cfo
series_part: 7
description: Tokens are how AI vendors bill you. If your CFO doesn't understand them, you're running AI operations without reading the bill.
---

# Tokens are a cost line, not a technical detail, and your CFO needs to treat them that way

Nobody in finance has ever needed to understand what a CPU cycle is. They understand the cloud bill.

Tokens are the same thing. You do not need to know what a token is at the model level to run AI operations well. You need to know what a token does to your unit economics, who on your team is generating them, and whether the output you are getting is worth what you are paying per thousand.

That is a CFO question. It has always been a CFO question. The engineering team just forgot to tell finance it existed.

## Start here: what is a token

A token is a chunk of text. Not a word, not a character, somewhere in between. "Running" is one token. "Uncharacteristically" is probably two or three. The exact split depends on the model's vocabulary, and you do not need to memorize it.

What you need to know is this: every time you send a message to an AI model, and every time the model sends a reply back, both sides of the conversation are measured in tokens and you are charged for both. Input tokens cost money. Output tokens also cost money, usually more.

That is the whole concept. The rest is just applying it.

## The decision tree a CFO actually needs

Here is the set of questions I now run through every time we add an AI seat or expand an existing one at Sneeze It. They are in order. You cannot skip to a later question without answering the earlier one.

**Question 1: Do we know what the seat is generating in tokens per day?**

If the answer is no, stop. You are running an operation you cannot measure. The first task is instrumentation, not optimization. Every AI seat should be reporting token consumption the same way every SaaS tool reports seat-count or API calls. This is table stakes for cost control.

At Sneeze It, Tally owns KPI pushes to our scorecard. When we built out token tracking for our agents, Tally became the thing that publishes those numbers to the same chart where Janine's AR numbers live. The data is on one surface. Finance can see it in the same Monday review where they see everything else.

If token consumption is buried in a model provider dashboard that only the engineering team can access, you have a blind spot. Bring it to the scorecard.

**Question 2: Is the token spend tied to a business output we can measure?**

This is where most operators fail. They know the token spend. They do not know what the token spend produced.

Dash runs daily advertising analysis across forty-some client accounts. That work generates tokens every morning. The question is not how many tokens Dash consumed. The question is whether the analysis Dash produced caught something actionable. Did it flag a spend anomaly? Did it surface a CPL pattern that changed a client recommendation? If yes, the token spend was productive. If Dash is running a full scan every morning and the output is going unread, the tokens are waste.

The same logic applies to Dirk, our sales agent. Dirk generates outreach, flags pipeline, and writes reactivation sequences. Every sequence is a token event. The question finance should be asking is not "how much did Dirk's sequences cost this week" but "did Dirk's sequences move any deals." If the sequences are sitting in a drafts queue waiting for approval and nobody is approving them, that is a process problem, not a model problem. But the token bill is still running.

Output accountability is the only thing that converts token spend from a variable cost into an investment.

**Question 3: Where is the waste?**

Once you have instrumentation and you have tied consumption to output, you can actually find where you are paying for tokens you do not need.

Context is the most common culprit. Every time an agent runs, it often carries context from prior conversations, prior documents, prior state. Some of that context is necessary. A lot of it is not. Carrying a full conversation history into every call when only the last three messages matter is like leaving the water running while you brush your teeth. The bill is running. The behavior is unchanged.

At Sneeze It, we caught this with Pepper, our email agent. Pepper was loading the full client domain whitelist (sixty-eight entries) into every single triage call, even when the email being triaged was clearly from a team member and the whitelist was irrelevant. That is a real token cost multiplied across every triage run every day. The fix was conditional loading. The behavior did not change. The bill dropped.

System prompts are the second culprit. Long, sprawling system prompts that were built up over months of iteration carry a lot of tokens into every call. Most teams never audit them. Finance should push for a prompt audit the same way they push for a vendor contract review. It is the same discipline applied to the same kind of cost.

**Question 4: Is the model tier matched to the task?**

This is the last question because it requires the answers to the earlier ones.

Not every task needs the most capable model. Some tasks need precision reasoning on ambiguous inputs. Others need reliable extraction from structured data. The cost difference between model tiers is significant, and running a heavy model on a lightweight task is the equivalent of hiring a senior consultant to format a spreadsheet.

The way to match tier to task is to know what the task actually requires. That requires instrumentation (question 1), output accountability (question 2), and waste identification (question 3). Without those, any tier recommendation is a guess.

When we built out the Dash daily scan, we made a deliberate choice to use a faster, cheaper model for the initial data extraction pass and reserve the more capable model for the narrative synthesis layer. The cost profile changed meaningfully. The output quality did not.

## Why this is a finance function, not an engineering function

Engineering can answer the question "how do we reduce token consumption." Only finance can answer the question "what level of token spend is appropriate for the output we are getting."

Those are different questions. The first is a technical optimization. The second is a business judgment. It requires knowing the revenue tied to the output, the cost of the alternative (a human doing the same work, an analyst doing the scan, a team running the sequence), and the margin math that makes the investment worth it.

Janine does not need to understand how a transformer model tokenizes text. Janine needs to see the agent cost line on the same report where the agency's other cost lines live, and she needs to know what business output each line corresponds to. That is a normal finance function. The only thing that makes it feel exotic is that we have been treating it as an engineering problem.

It is not an engineering problem. It is a measurement problem dressed in technical vocabulary.

The agents at Sneeze It are carrying real operational work. Dash is running the ad analysis that used to take a team of analysts. Dirk is running the pipeline function. Tally is running the scorecard function. The point of all of it is to let agents carry the operational work so the people on our team are free for the work that actually requires them.

But none of that math works if the token spend is invisible to the people who read the P&L. Make it visible. Run the decision tree. Treat the token line the same way you treat any other cost of goods.

That is the CFO's job here. It has always been the CFO's job. The vocabulary is new. The discipline is not.

## See the live chart

You can query Sneeze It's live org chart, including agent seats like Tally, Dash, and Dirk, to see which KPIs each seat owns and how they map to business outputs.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the Sneeze It agent seats and what business KPIs each one owns."*

You will see exactly which outputs each seat is accountable for, which is the first step toward tying your own token spend to the outputs that justify it.
