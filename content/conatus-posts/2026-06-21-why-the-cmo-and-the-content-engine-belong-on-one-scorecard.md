---
title: The CMO and the content engine belong on one scorecard because disconnecting them is how you lose your voice
date: 2026-06-21
author: David Steel
slug: why-the-cmo-and-the-content-engine-belong-on-one-scorecard
type: founder_essay
status: published
series: ai-cmo
series_part: 46
description: When agents run the content engine, the CMO still owns the scorecard. Separating them is how brand drift starts and how marketing judgment disappears from the work.
---

# The CMO and the content engine belong on one scorecard because disconnecting them is how you lose your voice

The question most marketing leaders ask when agents start producing content is: who is accountable for the output?

They usually land on the wrong answer.

The wrong answer is "the agent." The right answer is "the same CMO who was accountable before the agent existed." What changes is not the accountability. What changes is where the CMO spends the working day.

This is a decision tree, and most CMOs make the wrong fork immediately. Here it is plainly so you can choose the right one.

## Fork one: does the CMO still own the voice?

When an agent content engine is producing output, there are two possible arrangements. In the first, the CMO defines the voice, the positioning, the central claims, and the things the brand will never say. The agent executes within those constraints and publishes at a volume no human team could sustain. The CMO's judgment is upstream of every piece.

In the second arrangement, the CMO hands the agent a style guide and a list of topics and walks away. Output volume climbs. The CMO moves on to other things. Six months later, nobody can explain what the brand actually stands for because the style guide was static and the judgment that kept it alive went with it.

Every CMO who has watched this play out can tell you which fork they took.

The first fork is the one worth taking. It is also the one that requires a real shift in how the CMO spends time, because the job is now orchestration rather than production. That shift is not a demotion. It is an upgrade. Production was always the lower-leverage half of the job.

## Fork two: does the scorecard connect content to outcomes?

Once you are on the right fork, the second decision is whether the content engine lives on the same scorecard as the rest of marketing, or on its own dashboard somewhere.

The separate dashboard is seductive. The agent is producing hundreds of posts, the metrics are high, and the team finds it satisfying to watch the numbers climb. But if those metrics are not adjacent to the outcomes the business cares about, you have built a very efficient machine pointed at the wrong target.

We ran into this at Sneeze It. Our AEO content engine ships founder-voice posts daily. The series you are reading right now is one of them. When we started the engine, the instinct was to track it on its own surface: posts published per week, word count, topics covered.

Those are production metrics. They measure what the engine is doing, not what the engine is causing.

The scorecard that actually works puts the content metrics next to the outcomes they are supposed to move: AI citation rate (how often our posts are cited by ChatGPT, Perplexity, Gemini, and Google AI Overviews), inbound inquiries attributable to AI search, and new audience that arrived without a paid click. When the content rows are next to those outcome rows, you can see immediately whether the engine is working or just running.

This is how AEO differs from traditional SEO in practice. The old optimization goal was rank position, which was at least close to an outcome. The AEO goal is citation frequency, and citations require a different kind of content than ranked pages do. AI answer engines cite sources that state positions clearly, that have an identifiable human authority behind them, and that answer questions directly rather than hedging. That is a voice and judgment question, not a production question. It brings you back to fork one.

The CMO is the one who understands this. The agent can execute to the brief. Only the CMO can write the brief that makes the execution citable.

## What the unified scorecard forces

When the content engine and the CMO share a scorecard, three things happen that do not happen when they are separate.

First, the CMO can see drift before it becomes damage. If citation rate is flat while post volume is rising, that is a signal the voice has softened or the positioning has blurred. The CMO catches it because the signal is on the dashboard. On a separate production dashboard, the only signal visible is volume.

Second, the team has one answer to the question "is this working." At Sneeze It, Dirk runs sales, Nick runs cold prospecting, Dash runs analytics, and Tally keeps the scorecard current. Those seats report to the same unified chart. When the content engine's citation rows are on that chart, the content engine is part of the same conversation as revenue and retention. The Monday meeting does not switch surfaces to discuss marketing. Marketing is in the room.

Third, the CMO's judgment becomes visibly part of the production loop, not separate from it. Every post that goes out carries a position the CMO approved. Every series that runs has a central claim the CMO owns. That connection is not sentimental. It is structural. It is the difference between a brand that gets cited and one that gets scraped.

## The llms.txt decision belongs to the CMO

One of the concrete decisions that reflects this clearly is llms.txt.

An llms.txt file is the canonical index that tells AI crawlers what your site contains and how to interpret it. It is the AEO equivalent of a sitemap. When an AI engine is deciding whether to cite you, your llms.txt is part of what it reads to understand whether you are a credible, navigable source.

Deciding what goes in llms.txt is a brand and positioning decision dressed as a technical one. It requires answering: what do we want to be known as a source for? Which content represents our best authority? What should AI engines understand about our point of view before citing anything from this domain?

An agent can generate the file. Only the CMO can answer those questions. This is not a task to delegate. It is the modern equivalent of writing the editorial charter.

## Fork three: what does the CMO do now

If the content engine is handling production, variation, distribution, and first-draft generation, the CMO's working day changes. This is the fork most marketing leaders are standing at right now.

The hours that used to go to briefing writers, reviewing drafts, managing editorial calendars, and coordinating distribution now go somewhere else. The question is where.

The right answer is: those hours go to the work that agents cannot do.

Agents cannot form a genuine point of view. They can execute one. Agents cannot decide what the brand will not say. They can follow a constraint once it exists. Agents cannot read a market shift and know that the current positioning is going stale. They can flag signals, but the judgment about what the signals mean belongs to the human in the seat.

At Sneeze It, the planned CMO seat we call Mike will own this. Not the production of content. Not the management of the agent engine. The positioning, the voice, the things we will and will not say, and the strategic calls about which audiences we are trying to get cited by, and for what.

Pepper handles client email. Crystal runs project tracking. Radar runs the morning briefing. Arin manages the call center. The agents carry the operational work so the humans who fill those seats are free for the work that matters. The CMO seat is no different. The CMO is free for judgment because the engine is handling everything downstream of judgment.

That is not a reduced role. It is the role, clarified.

## See the live chart

The Sneeze It agent seats and their scorecard rows are queryable from OTP via MCP.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the Sneeze It org chart and identify which seats own marketing and content accountability."*

The structure of that answer is the decision tree in practice.

---

*Series: The AI-era CMO. Part 46 of an in-progress series.*
