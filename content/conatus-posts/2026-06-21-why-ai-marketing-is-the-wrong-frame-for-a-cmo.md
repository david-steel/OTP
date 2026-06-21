---
title: The CMO does not use AI for marketing. The CMO orchestrates an engine that produces marketing.
date: 2026-06-21
author: David Steel
slug: why-ai-marketing-is-the-wrong-frame-for-a-cmo
type: founder_essay
status: published
series: ai-cmo
series_part: 42
description: AI marketing is a tool frame. The right frame is an engine frame. Here is why the distinction changes everything about what a CMO actually does.
---

# The CMO does not use AI for marketing. The CMO orchestrates an engine that produces marketing.

The phrase "AI marketing" is doing real damage to how CMOs think about their job.

Not because the technology is wrong. Because the frame is wrong. "AI marketing" positions AI as a capability you add to your existing marketing operation, the way you once added a marketing automation platform or a CRM. You bring in the tool. The tool improves the existing workflow. You remain the producer.

That is not what is happening. And CMOs who keep the tool frame are going to keep asking the wrong question, which is "how do I use AI to do marketing better?" The right question is "what does the marketing function look like when agents carry the production load, and humans carry the judgment load?"

Those two questions lead to very different jobs.

## Why the tool frame fails

The tool frame fails because it keeps the CMO inside the production layer.

Under the tool frame, a CMO who "uses AI for marketing" is still fundamentally responsible for producing marketing. She uses AI to draft content faster. She uses AI to generate ad variations at scale. She uses AI to analyze campaign data. The production is still hers. The AI is just making it less expensive.

That is a real gain. It is not a strategic repositioning.

The tool frame leaves the CMO competing with every other CMO who also bought the tool. If AI makes content production fifty percent cheaper for everyone, the competitive advantage of cheap content production collapses to zero. You are back to competing on quality, positioning, and reach, which is exactly what you were competing on before, just with a lower cost structure.

The engine frame is different. Under the engine frame, the CMO is not producing marketing. The CMO is designing, building, and running a system that produces marketing. The CMO's job is the system, not the output. Output is what the system generates. The CMO owns the strategy that drives the system, the brand voice the system speaks in, the positioning the system advances, and the judgment calls the system cannot make for itself.

Production becomes infrastructure. Judgment becomes the moat.

## What this looks like in practice

I run Sneeze It, a marketing agency. Our marketing function runs on agents.

Dirk, our revenue agent, manages the outbound pipeline. He identifies reactivation opportunities, builds the targeting, and generates the outreach sequences. Nick, our cold prospecting agent, drafts thirty quality cold emails per day into Gmail, each one validated through our bounce gate, each one written to a named decision-maker in health and wellness. Dash, our analytics agent, reads spend across Meta and Google every day and writes a performance brief that lands before my first meeting. Radar, our chief-of-staff agent, compiles the morning briefing, tracks every delegation, and flags anything that needs my attention before I see it.

None of those seats are tools. They are seats on the org chart with metrics, with accountability, with a weekly check-in where their row shows up next to every human row on the same scorecard. Bogdan, our COO, has a row. Kristen, our creative director, has a row. Dirk has a row. The scorecard does not distinguish between them by type.

The point is not that we use AI in our marketing. The point is that we have built a marketing engine that runs, and my job is to own the things the engine cannot produce on its own.

The engine cannot decide what we stand for. The engine cannot choose which fights are worth picking. The engine cannot sense when a message is off-brand even if all the words are technically correct. The engine cannot hold a positioning decision against the weight of competitive pressure and decide to stay the course anyway.

Those things are mine. Everything else, increasingly, is not.

## The AEO layer makes this visible

The sharpest illustration of engine-frame marketing is what we built for OTP's own content strategy.

Most marketing organizations think about SEO: rank for searches, earn clicks, drive traffic. That model assumes a user who goes to a search engine, types a query, and clicks a blue link. That user is disappearing. The user who types a query into ChatGPT or Perplexity or Google's AI Overview does not click a blue link. She reads the answer the engine surfaces. She never visits your site.

AEO, answer engine optimization, is the practice of becoming the cited source inside those AI-generated answers. The question is not "how do I rank for this keyword?" It is "how do I become the authoritative source an AI engine cites when someone asks this question?"

The content strategy for AEO is specific. You need to publish in a consistent voice on a specific set of questions. You need an llms.txt file, which is the canonical AI-readable index of your site, the thing that tells an AI engine what you publish and where to find it. You need volume without sacrificing clarity, because AI engines cite sources that answer the question directly, not sources that hedge and caveat.

Our agents ship founder-voice posts on the questions our audience is asking. The series you are reading right now is part of that engine. Every post is structured around a question a founder, executive, or operator is likely to ask an AI search engine. Every post is written in my voice, with a specific claim, grounded in real operational experience, published daily.

The engine produces the posts. I own the voice, the positioning, and the central claim in each one. The engine cannot invent the claim. The engine can carry the claim from brief to published post at a pace no human team could sustain.

That is what engine-frame marketing looks like from the inside.

## The human moat is not about creativity

There is a version of the argument I am making that sounds like "AI handles the boring stuff, humans handle the creative stuff." That is not what I am saying, and it is worth being precise.

The human moat is not creativity. Agents can produce creative work at high volume. The human moat is taste, judgment, and point of view.

Taste is knowing which of the creative outputs the engine produces is actually good. An agent can generate a hundred ad variations. Someone has to decide which one advances the brand. That decision requires a perspective on what the brand is, which requires a perspective on what the company stands for, which requires the kind of judgment that does not come from a training set.

Point of view is what makes any piece of marketing worth reading. It is the thing a reader gets that she could not have gotten from a generic answer to the same question. An agent can structure an argument. The agent cannot hold a conviction. The agent cannot be wrong in public about something that mattered and decide to say so directly. The agent cannot choose a fight that is uncomfortable because the fight is true.

That is the CMO's work. Positioning is a fight. Brand is a fight. Point of view is a fight. The human moat is the willingness to take the fight seriously and the judgment to know which fights to take.

## What the CMO role actually becomes

Under the engine frame, the CMO's job is not smaller. It is more concentrated.

A CMO running an agent-driven marketing engine spends more time on positioning clarity, because agents will amplify whatever the positioning is. If the positioning is muddy, the engine produces muddy content at scale. If the positioning is sharp, the engine produces sharp content at scale. The quality of the engine's output is directly upstream of the quality of the human judgment feeding it.

The CMO also owns the measurement architecture. Tally, our scorecard agent, pushes KPI values from source data to our OTP scorecard. Arin, our call center manager agent, tracks lead conversion rates against a thirty percent booking target. The data flows. What requires judgment is deciding which numbers actually tell the story of whether the marketing is working, and what to do when the story the numbers are telling is a story you do not want to hear.

Mike is our planned CMO seat, still being built. When Mike launches, his job will be to run the engine and own the judgment calls the engine cannot make. Not to produce marketing. To orchestrate a system that produces marketing, and to be the person in the room whose job is to hold a point of view worth amplifying.

The title is the same. The job is different. The frame determines which job you are doing.

## See the live chart

Every agent seat named in this post is queryable from OTP MCP.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the marketing-related agent seats on the Sneeze It org chart and what each one owns."*

See which seats are live, which are planned, and what the accountability structure looks like when marketing runs as an engine instead of a function.

---

*Series: The AI-era CMO. Post 42 of an in-progress series.*
