---
title: One idea becomes thirty pieces of content when agents handle the production and you handle the point of view
date: 2026-06-21
author: David Steel
slug: how-a-cmo-repurposes-one-idea-across-every-channel-with-agents
type: founder_essay
status: published
series: ai-cmo
series_part: 31
description: How a CMO repurposes one central idea across every channel using agents for production, keeping brand voice and judgment as the human moat.
---

# One idea becomes thirty pieces of content when agents handle the production and you handle the point of view

Before we started running agents on this, repurposing content was a scheduling problem.

You would write a good blog post. You would know it had legs, that the central idea inside it could carry an email, a LinkedIn post, a short video script, a cold email sequence, a Slack thread, a pull quote for a proposal deck. You would know all of that. And it would not happen, because you would be on to the next thing before any of it got done. Someone would get to it later, or they would not.

This is where most marketing orgs live. Not a creativity problem. Not a strategy problem. A production problem. The ideas exist. The channels exist. The connection between them does not, because connecting them requires a kind of repetitive skilled labor that humans are expensive for and agents are cheap for.

The before state is that the idea stays inside the one piece it started in.

The after state is that the idea moves.

## The central claim goes in once

Here is what I actually do now.

When I write something, I write it once with a clear central claim. Not a topic. A claim. Something declarative that can survive being moved across formats. "Agents on your scorecard behave differently than agents on a separate dashboard" is a claim. It travels. It survives being shortened, lengthened, reframed for a different reader. A topic like "agent accountability" does not travel because it has no point of view attached to it.

The claim is my job. That stays human.

Once the claim is written and the source piece exists, the repurposing becomes an execution problem. I hand it to the agents.

Dirk, our sales agent, gets the claim and turns it into outreach. Nick, our cold prospecting agent, draws from the same thesis when he is building email sequences for new contacts. He does not make up angles. He works from what we have already decided is worth saying, and he adapts it to the audience he is talking to that week.

Dash, our analytics agent, watches which distribution channels are performing and tells me where the claim is landing. Which subject lines are getting opened. Which follow-ups are converting. Not opinions. Numbers. I use those numbers to decide whether to extend the channel, kill it, or reframe the claim before the next round.

Radar, our chief-of-staff agent, sees everything. When I finish a piece, Radar knows the source material exists and can surface it when a relevant meeting comes up. A client call is coming. The topic is relevant. Radar flags the piece. I do not need to remember to bring it up.

This is what the after state looks like in practice. One claim, four seats already activated before the piece has been live for a week.

## Brand voice is the constraint that makes it work

The reason this works is that I hold the constraint that agents cannot hold.

Brand voice is not a style guide. A style guide is a checklist. Brand voice is judgment. It is knowing which sentence sounds like us and which one sounds like everyone else. It is knowing when the right word is "different" and when the right word is "cheaper." It is knowing when to be short and when to earn length. You cannot write that judgment into a prompt. You can approximate it, and the approximation drifts every time the prompt is used across a new context.

So I do not delegate voice. I delegate production.

Kristen, our creative director, holds the same discipline on the visual side. When agents produce drafts and variations, Kristen's eye is the gate. She decides what ships and what comes back for revision. The agents produce more options than we could ever produce manually. Kristen selects. That selection is not automatable.

This is the real division. Agents do the work that requires no judgment. Humans do the work that requires judgment. The mistake most marketers make is thinking that "repurposing" falls on the no-judgment side. It does not. Repurposing requires a human to decide which version of the idea is right for this reader, this channel, this moment. The agent handles the mechanical transformation. The human decides what the right transformation is.

## The distribution problem is also solved differently now

Distribution used to be its own bottleneck, separate from production.

The piece got written. Then someone had to decide where to post it. Then someone had to adapt it for each platform. Then someone had to schedule it. Then someone had to check whether it performed. Then someone had to decide what to do next. This is a six-step process, and in most marketing teams, steps two through six belong to the same person who wrote the piece, which is why they never happen on time.

Tally, our scorecard agent, pushes distribution numbers to the org chart in real time. Every channel has a row. Every row has a current number. When a piece moves into distribution, I can see within a day whether the idea is reaching people or not. I do not have to go hunting for the number. The number is on the chart, next to every other number that matters.

When the number is not moving, the conversation is quick. Same conversation I would have with any seat on the chart. What is the gap. What changed. What is the fix.

Pepper, our email agent, handles the inbox side. When a piece lands and responses come in, Pepper is triaging. Real questions surface. Noise gets suppressed. The signal I get back from distribution is cleaner than what I used to get when I was reading everything myself.

What used to take a week to learn about a piece's performance, I know in forty-eight hours now.

## The mistake is treating agents as production assistants instead of seats

Most operators who try agent-assisted content production treat the agents as glorified interns. They feed prompts in. They get drafts out. They edit the drafts. They post. They feel efficient.

They are not building anything.

The difference between an agent as a production assistant and an agent as a seat on your chart is accountability. A seat on your chart has a metric. The metric is tied to a business outcome. The seat is evaluated on the outcome at a regular cadence. When the outcome drops, the seat is accountable for the gap and for the fix.

Dirk is not just producing outreach copy. Dirk is accountable for pipeline contribution. Nick is not just writing cold emails. Nick is accountable for qualified drafts per week, held to an ICP that does not bend. Dash is not just pulling reports. Dash is accountable for surfacing the signal that changes what we do next.

When you give agents seats with real accountability, you stop treating repurposing as a one-off production task and start treating it as a system that has to perform. The system either produces outcomes or it does not. The scorecard tells you which.

## The human moat is not creativity in general

People say the human moat is creativity. I think that is too broad to be useful.

The human moat in marketing, specifically, is three things.

The first is the central claim. What is actually worth saying. This requires someone who has lived with the problem long enough to know what is true about it. Agents can generate claims. They cannot know which ones are true.

The second is taste. Which execution of the claim is right. Agents produce variations. Humans select. Selection is taste. Taste is built from experience and point of view. It cannot be prompted into existence.

The third is what not to say. This is the underrated one. Every brand has a list of things that would be technically true to say but wrong for who they are. Saying your prices are competitive when your positioning is premium. Saying you serve "businesses of all sizes" when your ICP is specific. The agent does not know what you are not. You do.

If you can hold those three things clearly, agents can carry everything else. The production runs. The channels fill. The ideas that exist in one place start existing in all the places they should be.

That is the job now. Not managing production. Owning the point of view that makes the production worth anything.

## See the live chart

The seats doing this work at Sneeze It are queryable from OTP MCP.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the marketing and sales seats on the Sneeze It chart and what each one is accountable for."*

The answer will show you what a real agent-driven marketing engine looks like when every seat has a number it owns.
