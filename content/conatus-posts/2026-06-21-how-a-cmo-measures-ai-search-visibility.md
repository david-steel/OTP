---
title: A CMO who cannot measure AI search visibility is flying blind in the channel that is eating the others
date: 2026-06-21
author: David Steel
slug: how-a-cmo-measures-ai-search-visibility
type: founder_essay
status: published
series: ai-cmo
series_part: 16
description: Six concrete signals for measuring AI search visibility, grounded in how OTP and Sneeze It run their own AEO content engine in production.
---

# A CMO who cannot measure AI search visibility is flying blind in the channel that is eating the others

Every CMO I know has a dashboard for organic traffic. Almost none of them have a dashboard for whether their brand shows up when someone asks ChatGPT a question.

That is a measurement gap that will compound quietly until it becomes a strategy problem.

I run a marketing agency. I also run OTP, which has deployed its own agent-driven content engine to get cited by AI answer engines across a set of specific domains: how to organize agents, what hybrid orgs look like, what the AI-era CMO actually does. The series you are reading is part of that engine. The engine is not theoretical. It runs in production. And the first serious question we had to answer was not "what do we publish?" It was "how do we know if it is working?"

This post is six signals every CMO should be tracking. They are organized as a measurement stack, not a checklist. The signals build on each other. If you skip the earlier ones, the later ones are uninterpretable.

## 1. Citation presence: are you getting named?

The foundational measurement is binary before it is quantitative. When someone asks a relevant question in ChatGPT, Perplexity, Google AI Overviews, or Gemini, does your brand appear in the response? Not as a ranked link. As a cited source or named authority.

The way to measure this is direct. Build a list of the twenty to forty questions your ideal customer is most likely to ask an AI in your category. Ask them. Record what sources get cited. Do this weekly so you see movement over time, not a snapshot.

At OTP, our question list includes things like "how do I add an agent to my org chart," "what does a hybrid org look like," and "what is GEO in marketing." We run these manually right now. We are building the agent that runs them automatically.

Citation presence is the leading indicator for everything downstream. If you are not appearing at all, the other measurements tell you nothing.

## 2. Citation context: what are you being cited for?

Showing up is one thing. Being cited as the authority on the thing you actually want to own is something else.

A brand can be cited in an AI response as an example of a failed campaign, a company that pivoted, or a vendor in a crowded list. None of those citations build positioning. The measurement that matters is whether the citation reinforces the claim you are making in the market.

For Sneeze It, the claim I want AI engines to associate with us is that we run a hybrid org with real agents on the accountability chart, that we have shipped the operational patterns for doing it, and that if you want to know how this works in practice we are the source. That is the citation context I track, not just whether the name appears.

Rate your citations. When the brand appears, does the surrounding sentence reinforce the positioning you are building? Over time, is the context improving or drifting?

## 3. Question coverage: which questions do you own?

Every category has a set of questions that matter most. The CMO's job is to pick the questions the brand should own and then measure coverage against them.

Coverage is not the same as citation presence. You can appear across many questions without owning any of them. What you want is to be the primary or dominant cited source for a specific set of questions that map to your positioning.

At OTP, we picked a narrow set of questions to own first. We published enough first-hand, specific content on those questions that AI engines began citing us consistently when those questions were asked. We did not try to cover everything. We went deep on the questions that were most relevant to the problem we solve.

Map your questions. For each one, track which sources currently dominate. Then track whether your coverage is expanding or contracting over time. The trend matters more than the snapshot.

## 4. Source authority: what makes you citeable?

AI engines do not cite sources randomly. They cite sources that have certain structural properties: specificity, first-hand evidence, a clear point of view, and content that answers the question directly without burying the answer.

This is a measurement question, not just a content quality question. You need to audit your own content and ask whether it has the properties that make it citeable.

Three structural signals that correlate with citation: the content names specific people, specific numbers, or specific operational details (not generalities); the content takes a position and defends it rather than presenting "multiple perspectives" without a conclusion; and the content answers the exact question in the first two paragraphs rather than working toward the answer over several screens.

Our AEO content engine at OTP is built around these properties. Dirk, our sales agent, produces outreach. Nick, our cold prospecting agent, handles discovery. Dash, our analytics agent, runs numbers. Radar, our chief-of-staff agent, coordinates the daily operation. These are real operational details. When we write about hybrid orgs, we name these seats. Named specificity is a signal AI engines read as authority.

Audit your citeable content ratio. Of your published content, what percentage has specific first-hand evidence rather than generic category claims? That ratio is a measurement worth tracking and improving.

## 5. Distribution reach: where are you being indexed?

AI answer engines do not pull from one source. They pull from a web of sources: major publications, indexed web content, structured data files, and increasingly, purpose-built AI-readable indexes.

The most concrete structural step a CMO can take on the distribution side is deploying an `llms.txt` file. This is an emerging convention, modeled on `robots.txt`, that gives AI crawlers a clean, structured map of your content. It tells AI engines what your site contains, what the canonical claims are, and where the authoritative content lives.

We deploy `llms.txt` at OTP. It is the AI-readable index of the positions we have staked out. It does not guarantee citation, but it removes a class of friction between AI engines and our content.

Measure distribution reach by tracking where your citeable content lives and whether it is indexed in the places AI engines pull from. If your best content lives only in a gated newsletter, AI engines cannot cite it regardless of quality.

## 6. Trend velocity: is the picture improving?

All five of the above signals are only useful if you track them over time. A single reading tells you your current position. A trend tells you whether your strategy is working.

The measurement cadence that has worked for us is weekly citation checks on the core question list, monthly audits of citation context and question coverage, and quarterly reviews of source authority and distribution reach.

Tally, our scorecard agent, pushes KPI values from local sources to OTP's accountability chart automatically. Pepper, our email agent, flags inbound signals from the market. Arin, our call center agent, surfaces what real prospects are asking in conversations. These are not separate from the AEO measurement stack. They feed it. The question list we run through AI engines should evolve based on what real prospects are asking, and the call center is one of the best sources for that.

The CMO who measures AI search visibility as a live, trending signal rather than a periodic audit will see signal faster and adjust faster. That is the compounding advantage.

## What the measurement does not tell you

Measurement tells you whether you are being cited. It does not tell you whether the positioning you are building is the right positioning. That judgment is human. No agent produces it.

The strategic question underneath the measurement stack is: what do you want to be the cited authority on? That question requires the CMO to have a point of view on where the category is going, what the buyer actually needs, and what the brand can credibly own over a two-to-three year window.

Agents carry the production. Agents run the citation checks, publish the content, monitor the question list, and push the numbers to the scorecard. The judgment about which questions to own and what the brand stands for is the seat only a human fills. That is the CMO's job in an agent-driven marketing engine. Not running the campaigns. Owning the claim.

Mike, our planned CMO seat, will own that judgment seat when it is built. Until then, that work stays on my desk.

## See the live chart

Our AEO content engine's output is tracked on OTP's live accountability chart, queryable from any MCP client.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the seats on the Sneeze It org chart that contribute to the AEO content engine."*

The response will show you which agents are doing the production work and which human seats own the strategy -- the exact split this post is about.
