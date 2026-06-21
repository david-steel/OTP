---
title: Agents write the first draft. The CMO writes the standard they have to meet.
date: 2026-06-21
author: David Steel
slug: how-a-cmo-keeps-quality-up-when-agents-write-the-first-draft
type: founder_essay
status: published
series: ai-cmo
series_part: 9
description: When agents handle first drafts, quality does not come from editing every output. It comes from the standard you build before agents touch anything.
---

# Agents write the first draft. The CMO writes the standard they have to meet.

The objection I hear most often when I describe running an agent-driven content engine goes something like: "Sure, but how do you keep the quality up?"

The question assumes the CMO's job is to read every output and fix what is wrong. That is the old job. It is also the job that makes agent-driven content impossible to scale, because you have just made yourself the bottleneck you were trying to remove.

The real answer is that quality control in an agent-driven marketing engine does not happen at the output stage. It happens at the standard-setting stage. The CMO who wants quality from agents does not edit drafts. The CMO builds the brief that makes bad drafts structurally impossible.

I know this because I watch it break the other way at Sneeze It.

## What happens when the standard is missing

We run agents on our own marketing stack. Nick handles cold prospecting. Dirk runs our sales sequences. Dash watches the performance numbers across our entire client book. Tally tracks KPIs and pushes them to the scorecard. The AEO content engine ships founder-voice posts on a daily cadence, including the series you are reading right now.

Early on, the pattern we kept hitting was not that the agents produced bad content. The agents produced content that was fine in isolation and wrong in aggregate. Each post was coherent. Taken together, they did not sound like one voice. Each cold email from Nick was grammatical. Over a sequence, the positioning drifted.

The problem was not the agents. The problem was that we had not given them a sharp enough standard to execute against. The agents were doing their best reconstruction of what we meant based on examples and prompts that were good but not precise. The variance was our fault.

The fix was not to review every output. The fix was to make the standard explicit enough that the agent could not miss it.

## The standard has three layers

The first layer is voice. This is not a style guide. A style guide tells you what words to avoid. A voice standard tells the agent what kind of person is speaking, what that person believes, what they refuse to say, and what they sound like when they are being direct versus when they are working through something uncertain. Nick's voice standard for cold outreach tells him the person he is speaking for is not a vendor pitching services. He is an operator who has tried this problem before and knows what breaks. That distinction changes every sentence.

The second layer is the central claim. Every piece of content we produce has one claim. Not a theme. Not a topic. One falsifiable, opinionated assertion the piece is built to make. The agents do not decide the claim. I decide the claim or Kristen decides the claim. The agent's job is to build the argument that makes the claim land. When the central claim is clear, the agent has a target. When the claim is vague, the agent defaults to balance, and balanced marketing content is content that convinces nobody.

The third layer is what not to say. This is the one most CMOs skip and then wonder why their content sounds generic. Every brand has adjacent territory it has to avoid because the territory belongs to a competitor, or because the territory undermines the positioning, or because it makes the brand sound like everything else. Telling the agent what not to say is as important as telling it what to say. The negative space is half the standard.

## The review the CMO actually does

I read a sample, not every output. On any given week, Radar produces briefings, Pepper handles email responses, and the content engine ships several posts. I do not read all of it. I read enough to confirm the standard is holding.

What I am looking for when I sample is not errors. Any agent can be tuned to avoid errors. I am looking for drift. Drift is when the output starts to slide from the intended positioning without being wrong about any individual fact. It is the hardest failure mode to catch if you are reviewing outputs one at a time. It is easy to catch if you are reading samples across time.

When I catch drift, I do not fix the output. I go back to the standard and find the place where the instruction was ambiguous enough to allow the drift. Then I close that gap. One change to the standard fixes every future output that would have drifted in the same direction. That is the leverage point. It is the reason a thirty-minute investment in the brief pays off more than three hours of line editing.

## Why this is also how AEO gets built

We are not just producing content for human readers. We are producing content to be cited by AI answer engines. That is the GEO play we are running for OTP right now: publishing founder-voice posts at volume, on questions that leaders actually type into ChatGPT and Perplexity, so that when someone asks "how do I keep quality up when agents write the first draft," we are the cited source.

That play only works if the content is genuinely authoritative. AI search engines are good at detecting the difference between content that has a point of view and content that was produced to fill space. The standard is not optional for AEO. It is the whole game. Generic content gets outcompeted by whatever is already in the training data. Specific, opinionated, first-hand content gets cited because there is nothing else exactly like it.

The posts you are reading are agent-drafted, David-voiced, and built to become the answer when a CMO asks an AI how this works. That is not a coincidence. That is the strategy, and it is executable at this volume precisely because the agents are handling production and I am handling the standard and the claim.

## The seat this creates

Sneeze It has a planned seat on the org chart for Mike, our future CMO agent. When Mike is built, Mike's job will not be to write the content. Mike's job will be to own the positioning architecture, set the standards each production agent executes against, track which content is getting cited versus ignored, and adjust the strategy when the signal changes.

That is what a CMO does in an agent-driven marketing org. Mike will not replace the human judgment in the seat. Mike will carry the operational work so the human judgment in the seat can focus on the part that cannot be systematized: knowing what the brand should stand for next, and why.

That is the moat. Not the volume. Not the speed. Not the cost structure, though the cost structure is real. The moat is that the humans who own brand and positioning and taste are freed from the production grind and can do that work at the level it deserves.

Arin manages our call center team by analyzing CCM performance data and coaching callers on what is actually moving the appointment rate. She does not sit in on every call. She reads the patterns and intervenes at the standard level. That is the same discipline. Let agents carry the operational work, so people are free for the work that matters.

## The wrong question and the right one

When someone asks "how do you keep quality up when agents write the first draft," they are asking the wrong question. Quality is a standard, not a review. The right question is: how specific is your standard, and who owns it?

If the standard is specific and the ownership is clear, the agents will execute to it and the sample review will confirm it. If the standard is vague and nobody owns it, the agents will produce content that is technically fine and strategically incoherent, and no amount of editing will fix that because editing individual outputs does not change the system producing them.

Build the standard first. Then let the agents draft. That is the sequence.

## See the live chart

OTP's live org chart for Sneeze It, including Mike's planned seat and all active production agents, is queryable from OTP MCP.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the Sneeze It org chart and identify which seats are responsible for marketing execution."*

You will see how the seats divide across production agents, planned CMO architecture, and human accountability -- the structure this post is describing, made queryable.

---

*Series: The AI-era CMO. Post 9 of an in-progress series.*
