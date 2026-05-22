---
title: IDS with Claude, doing Identify, Discuss, Solve inside a reasoning engine
date: 2026-05-22
author: David Steel
slug: ids-with-claude-identify-discuss-solve-reasoning-engine
type: founder_essay
status: published
series: eos-ai-integration
series_part: 6
keywords:
  - IDS
  - Identify Discuss Solve
  - EOS Issues
  - Entrepreneurial Operating System
  - Claude
  - Anthropic
  - ChatGPT
  - OpenAI
  - AI agents
  - L10
---

# IDS with Claude, doing Identify, Discuss, Solve inside a reasoning engine

IDS is the engine room of an EOS® L10® meeting. Identify the real issue. Discuss it just long enough to get clarity. Solve it with a To-Do or a Rock. Move to the next one. Most leadership teams spend the first two years of EOS® learning to do this well.

The new question is whether a reasoning engine like Anthropic's Claude can participate in IDS without breaking it. The honest answer is yes, but not the way most teams try first.

The wrong way is to type the issue into ChatGPT mid-meeting and read out what the model says. That collapses the meeting structure for the same reasons covered in the L10® break-down post. The right way is for Claude or ChatGPT to participate before and after IDS, not during.

## Before IDS, the model surfaces and orders the Issues List

The hardest part of IDS for most teams is Identify. The team is staring at a list of fifteen Issues that look unrelated. Three of them are the same root issue showing up in three different surfaces. Two of them are symptoms of a different Issue further down the list. One of them is a To-Do that got logged as an Issue by mistake.

This is exactly the work a reasoning engine is good at. Pre-meeting, the agent reads the entire Issues List, clusters by likely root cause, flags duplicates, and proposes a recommended discussion order based on dependency and impact.

The Integrator reviews the proposed order and either accepts it, rearranges it, or kicks something back. The team walks into IDS with a list that is already deduped and ranked. That alone gives back ten to fifteen minutes of IDS time per week.

The agent did not solve any Issue. The agent did not even Identify any Issue. The agent did pattern matching that humans are bad at when they are tired.

## During IDS, the model stays in the room as a research partner

This is the part that requires discipline. The model is in the room, accessible, but it is not driving.

The right pattern: one person, usually the Integrator or a designated meeting facilitator, runs the model. When the team hits a clarifying question that nobody can answer from memory and the answer is needed to keep IDS moving, the facilitator types the question. Not the discussion, just the question.

Examples that are fair:

"What was last quarter's churn rate in the SMB segment?" If the Scorecard has it, pull it from the Scorecard, not the model. If the Scorecard does not, the model with read access to the data warehouse can return it in seconds.

"What did we agree to in the L10® notes three weeks ago when this came up?" Models with access to the meeting notes archive will return the resolution. Faster than scrolling.

Examples that are not fair during IDS:

"What should we do about this Issue?" That is the team's job. The model does not have the context, the relationships, or the accountability.

"Draft the To-Do for this." That is fine after IDS, not during. During IDS the team agrees on the To-Do verbatim. The model can format it after.

The simple rule is "facts in, opinions out." The model is in the room to remove friction on facts. The team owns the judgment.

## After IDS, the model captures and propagates the decisions

After IDS is where the model earns its keep.

Every Issue solved in IDS produced one of three outputs. A To-Do for someone in the room. A new Rock. A decision recorded in the V/TO™ or the strategic notes.

Without an agent, those outputs get captured in the meeting notes and then someone has to remember to file the To-Dos in the task system, update the V/TO™, and notify any team members not in the room. This is where most L10® meetings leak.

With an agent, the meeting notes get parsed within minutes of the meeting ending. To-Dos are filed in the task system with the right owner, the right due date, and a reference back to the meeting. Rocks proposed in IDS show up in the next quarterly Rock draft. Decisions get logged with date and meeting attribution so the next IDS on the same topic has the history.

The team walks out of the L10®. The agent does the propagation. The next L10® opens with everything still in flight.

## Why Claude specifically can do this work well

The agentic IDS pattern needs three model strengths.

First, long context. A solid IDS pass benefits from the model having the entire Issues List, the prior quarter of meeting notes, the V/TO™, and the Scorecard in working memory at once. Anthropic's Claude has very large context windows, and Claude Opus and Sonnet hold long-form structured data well. OpenAI's models do too. Both work.

Second, reasoning over messy text. Meeting notes are messy. Issues are partially formed sentences. The model has to cluster, dedupe, and rank without losing the team's intent. Reasoning-tuned models do this better than pure text generators. Claude and the most recent ChatGPT tiers both qualify.

Third, refusal to overstep. A well-aligned model will say "this seems like a leadership call, not something I should decide" when asked to solve an Issue. This is the part many teams underweight. You want a model that pushes back when asked to overreach, because that protects the IDS discipline.

Anthropic's research and training emphasis on honest refusal makes Claude a strong fit for this. OpenAI's models are increasingly similar. The choice is less important than the discipline around the model.

## What an agentic IDS does not solve

The model will not fix a team that does not actually want to Solve.

Many EOS® companies have IDS sessions that drag because the leadership team is conflict-avoidant or because one person dominates. No model fixes that. The Implementer (the EOS® Implementer® coaching the team) is still the person who works on team health. The model removes friction. The Implementer changes culture.

If your IDS is broken because the team will not have hard conversations, do not buy an agent. Get coaching first. Add the agent when the team is ready to use the time.

## FAQ

**Should the model write the Issue statement?** Yes, often. Many Issues are sloppy when first written. Having Claude or ChatGPT rewrite the Issue in a single sharp sentence before IDS makes Identify faster. The original author always confirms.

**Can the model propose Solves?** Cautiously. After the team has Identified and Discussed, asking the model "what would you propose as a Solve" can produce useful starting material. The team owns the decision. Never let the model's proposal be the Solve unless the team has actively chosen it.

**What about Issues that contain confidential or personnel matter?** Use enterprise tiers of Claude or ChatGPT with no training on customer data. Document a policy. Personnel-related IDS should still happen in the room, with the model not in the conversation.

EOS®, Entrepreneurial Operating System®, V/TO™, Level 10 Meeting®, L10®, IDS, Issues List, Rocks™, Scorecard, and EOS® Implementer® are concepts and trademarks of EOS Worldwide, LLC. This article is an independent practitioner perspective and is not affiliated with or endorsed by EOS Worldwide.
