---
title: What a CEO does when agents run the operations
date: 2026-06-20
author: David Steel
slug: what-a-ceo-does-when-agents-run-operations
type: founder_essay
status: published
series: ai-ceo
series_part: 1
description: When agents absorb the operational work, the CEO job does not shrink. It shifts to decisions only a human can make. Here is what that looks like in practice.
---

# What a CEO does when agents run the operations

The question I get more often than almost any other is some version of: if the agents are doing the work, what are you doing?

It is a fair question. And I want to answer it with something other than a vision statement.

The short answer is this: when agents absorb the operational layer, the CEO job does not shrink. It shifts. It moves upward and inward toward the work that actually requires a human, the decisions that carry real stakes, the relationships that cannot be automated, and the judgment calls that agents cannot make because they require values, not information.

That is the claim this post defends. Let me show you what it looks like in practice.

## What the shift actually looks like on a Tuesday

On any given Tuesday at Sneeze It, here is roughly what the agents are running without me.

Radar has already pulled the morning briefing, scanned Slack across a dozen channels, checked the calendar, flagged Wednesday as my off day, and written the daily note to Obsidian before I finish my first cup of coffee. Dash has already scanned spend across forty-plus Meta ad accounts and flagged anything outside its threshold. Tally has already pushed the KPI values to the scorecard. Pepper has triaged the inbox and drafted responses to client emails. Crystal has checked Accelo for stale projects and resource gaps.

By 9 AM, the operational picture is complete. Assembled, formatted, surfaced. Not by me.

What I am doing at 9 AM is reading it. Not compiling it.

That distinction sounds minor. It is enormous. Compiling used to take most of the morning. I was the one scanning Slack, checking spend, reading every client email, building the weekly picture in my head. That was operational work. It was necessary and it consumed the hours where I had the most cognitive capacity. Now those hours are available for something else.

The question is what that something else actually is. Because if the answer is "more email" or "more Slack" or "more reactive firefighting," then the agents freed up space that filled immediately with noise. That is what happens when you deploy agents without being intentional about what the freed capacity is for.

## The three things only I can do

After running this long enough to have learned it the uncomfortable way, I have landed on three categories of work that are genuinely mine. Not because nobody else could do them, but because they require the kind of judgment that comes from carrying the whole context of the business, including the context that is not in any file.

The first is decisions with real stakes and no clean answer. Agents are excellent at surfacing data, flagging patterns, and recommending actions within a defined scope. What they cannot do is make a call that requires weighing incommensurable values. When Dirk flags a reactivation opportunity and Pulse flags that the same client is on the churn watch list, the agents surface the conflict. The decision about what to do with it is mine. Not because the agents lack the information. Because the decision involves trust, relationship history, timing instinct, and a read on what this client actually needs right now. That is judgment work. It does not compress into a rule.

The second is the work that builds the people who build the company. Bogdan, my COO, needs a thinking partner, not a status update. My Thursday 1-on-1 with him is not information exchange. It is the place where we work through the strategic problems that do not resolve cleanly, where I learn what he is seeing that I am not, where I give him context that makes him a better decision-maker in the spaces I cannot be. Agents can prep the agenda. They cannot run the conversation that matters.

The same is true for the human callers on the call center team. Arin, our AI call center manager, coaches Amanda and Erica on their dials and appointment rates. What Arin cannot do is sit with a human who is having a hard week and say something that resets their relationship to the work. That is still mine, or Erica's now that she has moved into a management seat.

The third is the external-facing work where the human matters. Clients do not sign because they trust Dirk. They sign because they trust me. A sales call with a new prospect is not primarily an information transfer. It is a relationship moment. The prospect is deciding whether they want to be in business with me, not whether our services match their needs on a spec sheet. I can show up to that call more prepared because Dirk has already mapped the prospect, but I have to show up.

## The trap the shift creates

There is a trap in the shift that I did not anticipate, and I want to name it directly because I have watched it catch other operators.

When the agents absorb the operational work, the CEO feels liberated. For a few weeks, maybe a few months, it feels like having a whole new morning. The compiling is gone. The inbox is handled. The briefing is ready. The question is what you do with the space.

The trap is that the space fills with whatever floats to the top. More strategy calls. More podcast appearances. More advisory conversations. More "thinking time" that does not produce decisions. The operational grind gets replaced with a different kind of busyness that feels important but is not grounded.

I know this because I fell into it. The agents freed up twelve hours a week and for a while those twelve hours went to things I could say yes to more easily, because I was no longer spending them on operations. The revenue did not move. The strategy did not sharpen. What moved was my calendar density.

The discipline the CEO job actually requires in an agent-run operation is not strategic thinking in the abstract. It is forcing every week to produce a concrete output that only I could have produced. A decision made. A relationship deepened. A priority set that changes what the agents work on next. If I cannot name that output by Friday, the week was not a CEO week. It was an administrative week wearing strategic clothes.

## The accountability that does not go away

There is one more thing that is fully mine and cannot be delegated to any agent at any level of sophistication: accountability for outcomes.

Dash flags the ad spend. But if a client's cost per lead spikes for three weeks and nobody has had the harder conversation with them, that is on me. Crystal tracks the project timeline. But if a project is six weeks late and the client relationship is fraying, no project manager agent is going to carry the accountability for that. Janine tracks AR and flags slow payers, but the decision to have a direct conversation with a client about an overdue invoice, the decision that risks a relationship while protecting the business, is mine.

Agents surface the signal. The CEO decides what to do with it when the clean answer does not exist.

This is what I mean when I say the job shifts upward. The agents carry the operational load so that my cognitive capacity is available for the moments when the signal requires judgment and the judgment requires values. The mission underneath all of it is exactly that: let agents carry the operational work, so people are free for the work that matters.

The work that matters for a CEO turns out to be harder, not easier, than what the agents replaced. Operational work is hard because it never stops. The work that is left is hard because it requires you to be genuinely present, genuinely accountable, and genuinely uncertain about the outcome.

That is what I am doing on Tuesday morning while Radar finishes the briefing.

## See the live chart

You can query the Sneeze It agent army from any OTP MCP client and see exactly which seats are agent-run and which are human, and what each seat is accountable for.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the Sneeze It org chart and identify which seats are human versus agent, and what each seat owns."*

You will see how the operational seats map to the decision seats, and where the human judgment layer sits in relation to the agent layer. That structure is the strategy.
