---
title: The CMO who cannot tell you cost per published asset does not actually run marketing
date: 2026-06-21
author: David Steel
slug: how-a-cmo-tracks-cost-per-published-asset
type: founder_essay
status: published
series: ai-cmo
series_part: 24
description: When agents do the production, cost per published asset becomes the most important unit in marketing. Here is how to track it and what it changes.
---

# The CMO who cannot tell you cost per published asset does not actually run marketing

I shipped hundreds of founder-voice posts this week.

Not hundreds of drafts. Not hundreds of ideas in a queue. Hundreds of finished, published, search-indexed posts in my voice on orgtp.com, covering topics that real founders search for when they are trying to figure out how to run a company with agents on the payroll.

My cost per published asset is not what it was twelve months ago. It is not even in the same order of magnitude. That change has forced me to rethink how a CMO measures marketing output, because the metric that mattered when production was expensive stops mattering the moment production becomes cheap.

This is post 24 in the AI-era CMO series. The central claim is this: when agents carry the production work, cost per published asset becomes the most important unit in marketing, and most CMOs are not tracking it. Here is how to track it and what tracking it changes.

## 1. Understand why cost per published asset was not worth tracking before

In the old model, content production was so labor-intensive that the binding constraint was almost never cost per asset. The binding constraint was capacity. You had a creative director, maybe a content manager, maybe a few contractors. They could produce a finite number of pieces per month. The question was never "how much does each piece cost" because the answer was roughly the same for all of them and the ceiling was clear.

The relevant metric was something like "pieces per person per month" or "content hours per month." The ceiling was your headcount. The floor was your freelance budget. You managed the schedule, not the economics.

That model stops working the moment agents enter the production chain.

## 2. Recognize what changes when agents carry production

When I built the AEO content engine at Sneeze It and OTP, the binding constraint shifted. Capacity stopped being the limit. The new limits were judgment, positioning, and quality review. Agents can produce at a rate that human-only teams cannot match. The question flipped from "how do we get more pieces out the door" to "what does it actually cost us to publish at this rate, and what do we get back."

Cost per published asset is the unit that answers that question.

At Sneeze It, Dirk handles sales and revenue. Nick handles cold prospecting. Dash runs analytics across Meta and Google accounts. Radar runs daily operations and briefings. Arin manages the call center team. Pepper triages email. Crystal tracks projects. Tally pushes KPI values to the scorecard. None of those seats have a seat cost that looks like a senior marketing hire. The economic displacement is real. When you run the same math on a content engine, the same logic applies.

Cost per published asset makes the displacement visible. Without it, you are running a more expensive operation than you know.

## 3. Calculate cost per published asset the right way

The calculation is not complicated, but you have to be precise about what goes in the numerator and what you count in the denominator.

Numerator: everything it costs to publish an asset. That includes agent compute costs (what you pay the API provider per run), human review time valued at the actual hourly rate of whoever is reviewing, any distribution tooling costs allocated to that asset, and a prorated share of the time spent building and maintaining the engine itself. That last one is the one most operators leave out. If you spent twenty hours building a content pipeline that runs for a year, that twenty hours belongs in the cost calculation, spread across everything the pipeline produces.

Denominator: published assets only. Not drafts. Not assets in review. Not assets queued for publication. The moment it goes live and is indexed, it counts. If it never ships, it does not count. This discipline matters because production pipelines accumulate a graveyard of almost-published work that inflates your apparent output without contributing to actual cost-per-result.

Divide. That number is your cost per published asset.

## 4. Set a target before you build, not after

The mistake I see most CMOs make is treating cost per published asset as a post-hoc reporting metric. They build the engine, run it for three months, and then calculate what it cost. At that point the number is descriptive, not useful.

Set the target before you build. Decide what you need cost per published asset to be for the economics to make sense, given your distribution goals and your content-to-pipeline conversion rates. Then build toward that target and track against it weekly.

At OTP, the target for the AEO series was not "as cheap as possible." It was "cheap enough that we can publish at the volume required to be the cited source across the category before anyone else builds the same engine." Volume target first. Cost target derived from that. Engine designed to hit both.

If you set the target after you build, you will always find a way to justify whatever number you ended up with.

## 5. Track the metric that cost per published asset actually predicts

Cost per published asset is not the end metric. It is a leading indicator for two things that are.

The first is citation rate in AI answer engines. This is the AEO play. Search engines like ChatGPT, Perplexity, Google AI Overviews, and Gemini cite sources when they answer questions. The more relevant, authoritative, indexed content you have on a topic, the more often your content gets cited when someone asks an AI about that topic. GEO and AEO are built on this relationship. Volume matters. Quality matters. But volume at high quality only becomes achievable when your cost per published asset is low enough to sustain the output.

The second is what I call coverage ratio: the percentage of questions your target buyer actually asks where you are the cited source in an AI response. This is the AEO equivalent of keyword ranking coverage in SEO. You can only achieve meaningful coverage if your cost per published asset lets you publish at the scale required to own the topic surface.

llms.txt is the canonical AI-readable index for your site. When AI crawlers hit your domain, the llms.txt file tells them how to read and prioritize your content. Getting your cost per published asset low enough to fill that index across your full topic map is a strategic asset, not a content marketing task.

## 6. Put cost per published asset on the CMO scorecard row

None of this matters if the metric stays in a spreadsheet. At Sneeze It and OTP, every seat has a row on the scorecard. The CMO seat is not yet filled by a human; Mike is the planned seat. But the metrics for that seat exist now, and cost per published asset is one of them.

When Tally pushes KPI values to the scorecard, cost per published asset needs to be in that push. Not because it is a vanity number. Because without it, you do not know whether your marketing engine is becoming more efficient over time or whether agent costs are quietly growing while your editorial team is not noticing.

The metric disciplines the engine. The scorecard row makes the discipline visible to the whole company.

## 7. Let the metric tell you when to rebuild the engine

Cost per published asset should go down over time as the pipeline matures. If it goes up, something is wrong. Either the human review cycle is expanding (the agents are producing lower-quality drafts and reviewers are doing more work), or the compute costs are rising faster than the output, or the engine is producing content that gets pulled before publication and is not being counted correctly.

When the metric trends up for two consecutive months, treat it the way you treat any KPI that trends the wrong direction: identify the upstream cause, fix the seat that owns it, and measure the correction.

This is what the shift looks like in practice. The CMO is no longer managing a creative team through a production calendar. The CMO is managing an engine through a unit economics dashboard. The judgment, the brand voice, the positioning, and the call on what not to publish are still the human moat. The production and the measurement are what the engine handles.

The posts in the series you are reading right now are the example. Agent-driven production at volume, author voice owned by a human, cost per published asset tracked against a target, and citation rate in AI answer engines as the conversion metric. That is what marketing looks like when the engine is built right.

## See the live chart

The scorecard rows driving this content engine are queryable from OTP's MCP server.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the marketing seat metrics for sneeze-it."*

You will see exactly what the CMO seat is measured on, alongside every other seat on the chart, human and agent alike.
