---
title: Your One-Page Strategic Plan™ is the AI agent's system prompt
date: 2026-05-23
author: David Steel
slug: opsp-is-the-system-prompt
type: founder_essay
status: draft
series: scaling-up-ai-integration
series_part: 2
keywords:
  - One-Page Strategic Plan
  - OPSP
  - Scaling Up
  - Verne Harnish
  - Core Values
  - BHAG
  - Brand Promises
  - AI agents
  - system prompt
  - Claude
  - ChatGPT
---

# Your One-Page Strategic Plan™ is the AI agent's system prompt

The One-Page Strategic Plan™ is the densest single page in the Scaling Up canon. Core Values, Core Purpose, BHAG, 3-5 Year Targets, 1-Year Goals, Quarterly Priorities, Top 5 / Top 1 of 5, Brand Promises, Critical #s, Smart #s, Trends, Strengths, Weaknesses, and the Quarterly Theme. Most leadership teams print it, put it on the wall, and reference it twice a quarter.

In an AI-integrated Scaling Up® company, the OPSP has a new job. It is read by every agent on the Function Accountability Chart on every run.

A "system prompt" in AI terminology is the standing instruction set the model reads before it does anything. It defines who the agent is, what the agent's job is, what the agent values, what the agent must never do, and how the agent escalates. Every agent has one. The OPSP is the natural source of truth for the top half of every agent's system prompt in your company.

This is one of the cleanest mappings between an existing business framework and an AI architecture decision. Better than the V/TO™ on EOS®'s side, because the OPSP has more to give the agent.

## What lifts directly from the OPSP into a system prompt

Walk through the OPSP in order.

**Core Values.** Verbatim into the system prompt. Every customer-facing agent should refuse work that violates a Core Value. If "Brutal honesty" is a Core Value, an agent asked to soften bad news to a client should push back. The Core Values are the company's alignment layer for humans and agents both.

**Core Purpose.** The "why we exist" anchor. Goes in the preamble for any agent that touches customer-facing communication or recruiting content. The Purpose is what keeps copy from drifting into generic.

**BHAG.** Big Hairy Audacious Goal. Goes in as the company's true north. Useful for agents making tradeoff calls between paths.

**3-5 Year Targets.** Includes the Sandbox (your market focus). The Sandbox is the agent's ICP filter. Outreach agents use it. Sales drafting agents use it. Marketing content agents use it. A fuzzy Sandbox produces a fuzzy agent layer. A sharp Sandbox produces a sharp one.

**1-Year Goals.** What we are committing to this year. Quantified. The agent layer uses these as the ladder-up reference for every Quarterly Priority and every Smart #.

**Quarterly Priorities (also called Rocks in some Scaling Up shops, though Verne uses Priorities).** What we are committing to this quarter. Each Priority has an owner, a measurement, and a quarter-end definition of done. The agent layer tracks them weekly and surfaces drift early.

**Top 5 / Top 1 of 5.** The team's five most important things this quarter, plus the single most important. These guide what the agent layer surfaces first in any conflict. When pipeline health and a new launch both flag the same week, the agent ranks by which one is the Top 1 of 5.

**Brand Promises.** The two or three promises you make to customers. Every customer-facing agent should produce work that reflects the Brand Promises. Cold outreach references them. Sales drafts reinforce them. Customer success communications make them visible.

**Critical #s and Smart #s.** The agent layer's KPI surface. Pushed weekly. Pushed daily where the data supports it. Defined precisely in the agent's SOP so the math survives team turnover.

**Trends, Strengths, Weaknesses, Theme.** Quarterly-refresh fields. The agent layer reads these but treats them as more dynamic than the Core Values or BHAG. The Theme in particular informs the voice of the quarter's customer-facing content.

The OPSP is not the entire system prompt. The system prompt also contains the agent's specific function description, its Smart #s, escalation rules, and off-limits actions. The OPSP is the company-wide preamble that every agent inherits.

## Why this matters more than it looks

Three reasons.

**One, alignment scales.** When a company has 20 people, the CEO can keep everyone aligned by being in the room. When a company has 200 people, the OPSP is the alignment mechanism. When a company has 200 people and a dozen agents, the agents inherit the alignment mechanism only if the OPSP is in their system prompt. Without it, the agents act on a generic large-language-model worldview, which is not your worldview.

**Two, drift gets caught early.** Agents reveal vagueness in the OPSP. If your Sandbox says "growing companies" and an agent has to decide whether a prospect fits, it cannot. Humans cannot either, but humans hide the failure better. Agents force the OPSP to actually mean something.

**Three, the dense OPSP rewards good agents more than the simple V/TO™ does.** Scaling Up's deliberate richness becomes leverage when read by a model that can hold the entire document in working memory. The Brand Promise nuances, the Strengths to lean on, the Weaknesses to compensate for, the Theme tying it all together, the Top 1 of 5 priority for this quarter. A model with the full OPSP in its preamble produces meaningfully better output than the same model with no preamble. EOS®'s simpler V/TO™ gets a smaller lift because there is less there to lift.

This is the under-noticed strength of Scaling Up for AI integration. The methodology already produces a document dense enough to drive a sophisticated agent layer.

## How to actually wire this up

Most Scaling Up shops keep the OPSP in a Word doc, a PDF, an Align workbook, a Rhythm Systems board, or a custom spreadsheet. To turn it into a system prompt, three moves.

**First, convert the OPSP to a structured text format.** Plain markdown is easiest. Keep the section headers. Keep the actual content verbatim. Strip formatting that does not survive copy-paste.

**Second, create a shared preamble file the agents read.** This is the OPSP plus a short company-wide instruction set. Voice notes. Off-limits actions. Escalation defaults. Every agent's system prompt starts by reading this preamble.

**Third, set a refresh policy.** When the OPSP changes at a quarterly or annual session, the preamble file changes the same day. Otherwise the agents are working off a stale strategy.

Implementation varies by platform. In Claude Code or the Anthropic API, the preamble sits at the top of a markdown file every agent reads. In ChatGPT Custom GPTs, you paste it into the Instructions field. In OpenAI Assistants API, it goes in the system message. Same pattern, different surfaces.

## The honest truth about most OPSPs

Half of the OPSPs I have ever seen would not survive being used as a system prompt. The Sandbox is too broad. The Brand Promises are generic. The Core Values include "Excellence." The Theme is forgettable. The Critical #s are not defined precisely enough for an agent to compute.

Putting the OPSP in front of an agent is a stress test. The agent will follow what is written. If what is written is vague, the agent will act vague. If what is written is sharp, the agent will act sharp.

This is the upside the assistive-AI crowd misses. The forcing function of building real agents makes the OPSP better. The discipline a Scaling Up coach has already built into the team is what makes the agent layer work at all.

## FAQ

**Should every agent have the entire OPSP in its system prompt?** Core Values and Core Purpose, yes. The rest depends on the agent's function. Customer-facing agents get the Brand Promises and Sandbox. Internal operations agents get the Quarterly Priorities and Critical #s. Match the surface to the job.

**Does this leak the OPSP to Anthropic or OpenAI?** Only if you use a consumer tier. Enterprise tiers from both companies offer zero training on customer data. Use those.

**What if our OPSP changes mid-quarter?** Update the preamble file the same day. The agents will pick up the new version on their next run.

**Is the OPSP enough alignment for an agent?** No. The agent also needs its function description, Smart #s, escalation rules, and off-limits actions. The OPSP is the preamble, not the whole prompt.

Scaling Up®, Mastering the Rockefeller Habits, One-Page Strategic Plan™, OPSP™, Rockefeller Habits™, Four Decisions™, Function Accountability Chart, FACS, Smart #s, Critical #s, Top 5, Top 1 of 5, Brand Promise, Sandbox, Theme, and Quarterly Priority are concepts and trademarks of Gazelles, Inc. / Verne Harnish. BHAG is a concept from Built to Last by Jim Collins and Jerry Porras. This article is an independent practitioner perspective and is not affiliated with or endorsed by Gazelles, Inc. or Verne Harnish.
