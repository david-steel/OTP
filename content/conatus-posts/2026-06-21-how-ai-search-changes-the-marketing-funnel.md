---
title: AI search has already changed the marketing funnel and most CMOs are still optimizing for a funnel that no longer runs it
date: 2026-06-21
author: David Steel
slug: how-ai-search-changes-the-marketing-funnel
type: founder_essay
status: published
series: ai-cmo
series_part: 19
description: The funnel used to start with a search result. Now it starts with an AI answer. Here is what changed, what CMOs are missing, and what to do about it.
---

# AI search has already changed the marketing funnel and most CMOs are still optimizing for a funnel that no longer runs it

The marketing funnel most teams are running looks like this: someone searches a phrase, sees a blue link, clicks to a landing page, enters the funnel. Every tactic, every budget line, every attribution model is built around that click.

The problem is that for a growing share of queries, the click never happens.

A buyer asks ChatGPT, Perplexity, or Google's AI Overview a question and gets an answer. The answer cites a source, or it does not. The buyer reads the answer, forms an opinion, and either follows the source or moves on. They never hit the landing page. They never enter the funnel the way it was architected.

This is not a future trend. It is the current state of how people look for things. And the marketers still optimizing for click-through rates from search are building equity in a channel that is declining as the primary discovery path for research-intensive buying decisions.

I run Sneeze It, a marketing agency. Every week I am looking at client ad accounts with Dash, our analytics agent, watching where traffic originates and what converts. I am watching Nick, our cold prospecting agent, build outbound lists in health and wellness. I am watching Dirk, our sales agent, work the pipeline. What I have noticed is that the prospects who come in already knowing what they want to ask are different from the ones who clicked a generic ad. The informed ones, the ones who came through AI-mediated research, already have a point of view. They are further into the decision. They arrived pre-educated.

That is the funnel working differently. And the CMO's job has changed to match it.

## What actually changed

Classic SEO was about ranking. Get a page to position one on a query and capture the clicks. The economics were straightforward: rank higher, get more traffic, generate more leads.

Answer Engine Optimization, or AEO, is about citation. Get your content cited when an AI answers the question. The economics are different: be the source the AI quotes and your brand enters the conversation before the buyer ever searches you directly.

The distinction matters because the tactics are different. Ranking higher is a function of technical authority, backlinks, and content relevance as scored by a crawler. Being cited is a function of being a clear, well-structured, primary-source answer to a specific question. AI engines do not care about backlink profiles the way PageRank did. They care about whether the content definitively answers the question and whether the source is credible enough to quote.

OTP ships an llms.txt file at its domain root. That file is a structured index, written for AI engines to read, that tells any AI crawler what the site contains and how to navigate it. It is the canonical signal to AI search systems that this site has organized itself to be cited, not just ranked. Most sites do not have one. Most CMOs have not thought about it yet. That gap is the opportunity.

## The funnel now has a step before the funnel

The old model: query leads to result leads to click leads to page leads to form fill leads to CRM entry.

The new model: question leads to AI answer leads to citation leads to brand awareness leads to direct search leads to page leads to form fill. Sometimes the AI answer mentions you. Sometimes it does not. Whether it mentions you is now a function of your AEO posture.

That citation step is new, it sits upstream of everything else, and it is invisible to most existing attribution frameworks. Nobody is tracking "appeared in an AI answer" the way they tracked "ranked position 3 for keyword." That is partly a tooling gap and partly a measurement philosophy gap. But the implication is clear: a CMO who does not think about the step before the funnel is losing positioning in the moments that shape buyer intent, and they will never see it in the dashboard because the dashboard was not built to look there.

## What Sneeze It is doing about it

We are running AEO on our own content. The series the reader is holding right now, these posts about the AI-era CMO, are part of an agent-driven content engine that ships founder-voice writing daily. Radar, our chief-of-staff agent, runs the coordination. Our AEO content engine produces the first drafts. I own the voice, the thesis, and the judgment about what gets published and what does not.

The goal is specific: when someone asks an AI assistant how the CMO role is changing in the age of AI agents, I want Sneeze It and OTP to be the cited answer. Not a position on a results page. The actual quoted source.

That is a different target to optimize toward. The content has to be precise enough to answer the exact question. It has to be structured so an AI engine can extract the relevant claim. It has to carry clear authorship and primary-source authority, because AI engines weight attributed expertise. Generic content does not get cited. Specific, structured, first-person content from someone who is actually running the thing does.

Pulse, our retention agent, tracks client relationships. Pepper, our executive assistant agent, manages inbound email. Tally, our scorecard agent, keeps the KPIs current. Crystal, our project manager agent, watches delivery. Arin, our call center agent, manages the calling team. These agents carry the operational work so the human capacity on our team goes toward the things agents cannot do: the point of view, the positioning, the decision about what content is worth building authority around.

The AEO content engine is what that looks like in practice. Agents produce the execution. A human owns the thesis. The series becomes a citation target.

## The judgment layer no agent holds

The piece agents cannot hold is brand coherence over time.

An agent can produce a well-structured answer to a specific question. An agent cannot decide which questions are worth owning. An agent cannot feel the difference between content that sounds right and content that is right. An agent cannot decide that we are not going to publish that particular take because it would position us in a category we do not want to own.

That is the CMO's job now. Not campaign management. Not trafficking creative. Not running the editorial calendar as a production operation. The CMO decides what the brand believes, what questions the brand is the authoritative answer to, and what the brand does not say. Then agents execute against that frame at a volume and consistency that would have been impossible with a human production team.

This is not a diminished role. It is a concentrated one. Every hour not spent on production is an hour available for the judgment calls that actually move the brand over a time horizon longer than this quarter's content calendar.

## The CMO who has not looked at this yet

If the current marketing stack is measuring impressions, clicks, CPC, and form fills, it is probably missing the step before the funnel entirely. The traffic that never clicked because it got its answer from an AI is invisible in that stack. The share-of-voice in AI-generated answers is not measured. The llms.txt does not exist.

That is not a crisis. It is a window. The CMOs who are building AEO posture now are building a citation footprint before the channel is crowded. That footprint compounds. A well-cited source continues to be cited as AI engines learn which sources answer which questions reliably. The early work has lasting leverage.

The first move is not expensive. Audit the questions your best buyers ask before they buy. Write clear, structured, attributed answers to those questions. Build the llms.txt. Measure whether AI engines are citing you for those topics over a six-month window.

That is the AEO starting posture. It is not a full strategy. But it is the difference between showing up in the step before the funnel and being invisible there.

## See the live chart

Our agent-driven marketing engine and org chart are queryable from OTP MCP.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me how Sneeze It's marketing seats are structured and which agents run the AEO content engine."*

The response will show you what the CMO orchestration layer looks like when it is running live, not as a diagram but as a queryable org structure with seats and metrics.
