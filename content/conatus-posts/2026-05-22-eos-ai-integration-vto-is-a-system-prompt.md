---
title: Your V/TO™ is a system prompt, translating vision into agent instructions
date: 2026-05-22
author: David Steel
slug: vto-is-a-system-prompt-translating-vision-to-agents
type: founder_essay
status: published
series: eos-ai-integration
series_part: 7
keywords:
  - V/TO
  - Vision Traction Organizer
  - EOS Vision
  - Entrepreneurial Operating System
  - Core Values
  - Core Focus
  - AI agents
  - system prompt
  - Claude
  - ChatGPT
  - agentic AI
---

# Your V/TO™ is a system prompt, translating vision into agent instructions

The Vision/Traction Organizer™ exists so every person in an EOS® company can answer the same question the same way. What is the vision. What is the plan. What are we doing this quarter. The V/TO™ is the founding document of the company's operating layer.

In an AI-integrated EOS® company, the V/TO™ has a new job. It is also the founding document of the agent layer.

A "system prompt" in AI terminology is the standing instruction set the model reads before it does anything. It defines who the agent is, what the agent's job is, what the agent values, what the agent must never do, and how the agent escalates. Every agent has one. The V/TO™ is the natural source of truth for the top half of every agent's system prompt in your company.

This is one of the cleanest mappings I have ever seen between an existing business framework and an AI architecture decision.

## What lifts directly from the V/TO™ into a system prompt

Walk through the V/TO™ in order.

**Core Values.** These belong in the system prompt verbatim. Every agent that takes action in the company should refuse work that violates a Core Value. If "Do the right thing" is a Core Value, an agent asked to send a manipulative cold email should push back. The Core Values are the company's alignment layer. They are also the agent's alignment layer.

**Core Focus™ (Purpose/Cause/Passion and Niche).** This belongs in the system prompt verbatim. An agent that drifts outside the Core Focus is doing the same thing a salesperson does when they chase a deal outside the niche. The Core Focus tells the agent what kind of work is on-strategy and what kind is not.

**10-Year Target™.** This goes in as a "true north." An agent making a tradeoff between two paths should choose the path more aligned with the 10-Year Target.

**Marketing Strategy.** The Target Market, Three Uniques, Proven Process, and Guarantee belong in any agent that touches customer-facing work. Sales agents, marketing agents, client retention agents, outreach agents.

**3-Year Picture™.** Useful context. Not every agent needs it. Strategic agents like a Visionary briefing agent or a planning agent should have it.

**1-Year Plan.** This is more dynamic. Useful for an Integrator agent or a Chief of Staff agent that needs to know what the company has committed to this year.

**Quarterly Rocks.** Even more dynamic. Each Rock has its own SOP and its own accountability partner. An agent involved in a Rock should know that Rock.

**Issues List.** Dynamic. The L10® agent reads this every meeting.

The V/TO™ is not the entire system prompt. The system prompt also contains the agent's specific job description, scorecard, escalation rules, and off-limits actions. The V/TO™ is the company-wide preamble that every agent inherits.

## Why this matters more than it sounds

Three reasons.

**One, alignment scales.** When a company has five humans, the Visionary and the Integrator can keep everyone aligned by being in the room. When a company has fifty humans, the V/TO™ is the alignment mechanism. When a company has fifty humans and a dozen agents, the agents inherit the alignment mechanism only if the V/TO™ is in their system prompt. Without it, the agents act on a generic large-language-model worldview, which is not your worldview.

**Two, drift gets caught early.** Agents reveal vagueness in the V/TO™. If your Core Focus says "We help businesses grow" and an agent has to decide whether a request fits the Core Focus, it cannot. Humans cannot either, but humans hide it better. Agents force the V/TO™ to actually mean something.

**Three, vendor portability.** Your V/TO™ is yours. The Core Values are yours. The Three Uniques are yours. If you build the agent stack so the V/TO™ is the top of every system prompt, you can switch from Claude to ChatGPT to a future model without rewriting your agent layer. The V/TO™ travels.

## How to actually wire this up

Most EOS® companies already keep the V/TO™ in a Google Doc or a shared file. To turn it into a system prompt, three moves.

**First, convert the V/TO™ to a structured text format.** Plain markdown is easiest. Keep the section headers (Core Values, Core Focus, 10-Year Target, etc.). Keep the actual content verbatim. Strip formatting that does not survive copy and paste.

**Second, create a "shared preamble" file the agents read.** This is the markdown V/TO™ plus a short company-wide instruction set. Things like "speak in this voice," "never claim to be human," "always cite your sources," "escalate anything risky to a named human." Every agent's system prompt starts by reading this preamble.

**Third, set a refresh policy.** When the V/TO™ changes at a quarterly or annual session, the preamble file changes too. Same day. Otherwise the agents are working off a stale vision. The Integrator owns the refresh.

The technical implementation varies by platform. In Claude Code we put the company V/TO™ at the top of a CLAUDE.md file that every agent reads. In ChatGPT Custom GPTs you paste it into the Instructions field. In OpenAI Assistants API it goes in the system message. Same pattern, different surfaces.

## The honest truth about most V/TO™ documents

Half of the V/TO™ documents I have ever read would not survive being used as a system prompt. The language is too soft. The Core Focus is too generic. The Three Uniques sound like every competitor. The 10-Year Target is missing.

Putting the V/TO™ in front of an agent is a stress test. The agent will follow what is written. If what is written is vague, the agent will act vague. If what is written is sharp, the agent will act sharp.

This is the upside the assistive-AI crowd misses. The forcing function of building real agents makes your V/TO™ better. The discipline an EOS® company already has is what makes agentic AI work at all.

## FAQ

**Should every agent have the entire V/TO™ in its system prompt?** Yes for Core Values and Core Focus. Optional for the rest depending on the agent's job.

**Does this leak the V/TO™ to OpenAI or Anthropic?** Only if you use a consumer tier. Enterprise tiers from both companies offer zero-training agreements. Use those.

**What if our V/TO™ changes mid-quarter?** Update the preamble file the same day. The agents will pick up the new version on their next run.

**Is the V/TO™ enough alignment for an agent?** No. The agent also needs its job-specific instructions, scorecard, and escalation rules. The V/TO™ is the preamble, not the whole prompt.

EOS®, Entrepreneurial Operating System®, V/TO™, Vision/Traction Organizer™, Core Focus™, 10-Year Target™, 3-Year Picture™, Rocks™, and Marketing Strategy are concepts and trademarks of EOS Worldwide, LLC. This article is an independent practitioner perspective and is not affiliated with or endorsed by EOS Worldwide.
