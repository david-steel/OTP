---
title: The Issues List is your company's training data
date: 2026-05-22
author: David Steel
slug: issues-list-as-training-data-for-ai-agents
type: founder_essay
status: published
series: eos-ai-integration
series_part: 18
keywords:
  - Issues List
  - IDS
  - EOS
  - Entrepreneurial Operating System
  - AI agents
  - agentic AI
  - Claude
  - ChatGPT
  - knowledge base
  - retrieval
---

# The Issues List is your company's training data

Every EOS® company has been quietly producing one of the most valuable artifacts in the AI era and treating it as overhead. The Issues List, the running record of what the leadership team identified, discussed, and solved, week after week, year after year, is the company's accumulated operational reasoning. It is also exactly the format a reasoning engine can use.

Most teams never go back and read their old Issues Lists. The L10® closes, the To-Dos get filed, the resolution gets noted, the meeting moves on. The accumulated wisdom sits in old Google Docs or Ninety entries that nobody opens.

In an AI-integrated EOS® company, the Issues List has a new job. It is your company's knowledge base for institutional decision-making. Feed it to a model and the model can surface, when a similar issue comes up two years later, exactly how the team solved it last time.

## Why this is more valuable than most knowledge bases

Three reasons the Issues List is unusually high-signal training data.

**One, it is decisions, not descriptions.** Most internal documentation describes how things should work. The Issues List records what actually happened when things went wrong and what the team decided. Decisions are scarcer and more valuable than descriptions.

**Two, it is structured.** Identify, Discuss, Solve. Three fields per Issue. Even the messiest Issues List has a recognizable schema. Models love this.

**Three, it has time stamps and outcomes.** Every Issue has a date. Every Solve is in the system as a To-Do or a Rock that either got done or did not. The Issues List is one of the few internal artifacts that comes with a verifiable success signal.

Most internal wikis are wishful thinking. The Issues List is recorded reality.

## What a knowledge-base agent does with the Issues List

A simple pattern: build an agent whose only job is to read the company's Issues List archive and, when a new Issue is identified in the current L10®, surface any prior Issues that look like the same root cause along with their resolutions.

The agent runs before each L10®. It reads the Issues List for the current week and matches each new Issue against the historical archive using semantic similarity. The output is a one-paragraph note attached to each new Issue: "Possible relevant prior issues. (2025-04-12) Same client complaint, resolved by adjusting the onboarding email sequence. (2024-11-08) Similar pattern, ended up being a misconfigured CRM filter."

The team reads the note as part of IDS. They are not bound by it. They might decide the prior resolution does not apply. But they no longer rediscover the same Solve fresh every six months.

This single pattern catches the most common waste in EOS® teams: re-solving the same Issue three quarters in a row because nobody remembers the prior IDS.

## What else falls out of treating the Issues List as data

Pattern detection across the year. The Annual session benefits enormously from "show me the five themes that came up in IDS more than four times this year." The model can do that in seconds against a structured Issues List. The team identifies systemic problems they would never see by reading the meetings individually.

Onboarding new leadership team members. When a new Director or Integrator joins, hand them a model with the Issues List loaded and let them ask questions. "What does this team typically do when a client churns." "How does this team handle hiring disagreements." The institutional knowledge gets accessible instantly.

Implementer reviews. An EOS® Implementer® coaching the team can ask the model "what Issues from the prior quarter are showing up again this quarter" and walk into the session already knowing the recurring patterns.

Vendor and customer audits. A model can pull every Issue that involved a specific vendor or customer and produce a relationship dossier. Useful for renewal conversations, escalations, and pricing discussions.

## What you have to do for this to work

The Issues List has to be in a format a model can read.

Most teams keep Issues in Ninety, Bloom Growth, Traction Tools, or a Google Doc. All of these are exportable. The first step is to export the archive to a plain text or markdown format and store it in a folder the agent can read.

The second step is to keep the export current. Either the agent pulls fresh data from the tool each week, or someone exports the L10® notes to the archive each Tuesday. Either works. The discipline is the agent has access to the full historical record, not just last week's.

The third step is the agent's prompt. Tell it the IDS structure (Identify, Discuss, Solve), tell it the company's context (V/TO™ preamble), tell it the company's confidentiality rules. Then let it run.

This is one of the few AI use cases where the buildout is genuinely fast. Most companies can get a working Issues-knowledge agent live in a week.

## What this does not solve

Bad Issues are still bad Issues. If your team has historically recorded Issues as "we need to fix marketing" with no specifics, the archive is useless no matter how good the model is. Garbage in, garbage out.

The forcing function: teams that know their Issues List will be read by an agent (and by their future leadership team members) start writing Issues better. Sharper Identify. More specific Discuss. Cleaner Solve. The discipline propagates the same way it does for the Scorecard.

The Issues List quality and the discipline of the L10® rise together. The agent rewards the team that has been doing it right and shames the team that has been phoning it in.

## FAQ

**What about confidential Issues (personnel, legal, etc.)?** Tag them at the time of writing. The agent's prompt should exclude tagged-confidential Issues from any output that goes beyond the leadership team. Most platforms support this with a simple field.

**How long should we keep the archive?** Permanently. Storage is cheap. The 10-year-old Issues are sometimes the most valuable because they show how the company has changed.

**Will this make the team lazy about IDS?** No, the opposite. Knowing that the prior Solves are surfaced makes the team explicit when they want to deviate. "Last time we tried X, this time we are trying Y because Z." Sharper IDS, not lazier.

**Can the model close Issues without the team?** No. The team owns the Solve. The model recommends, the team commits.

EOS®, Entrepreneurial Operating System®, V/TO™, Level 10 Meeting®, L10®, IDS, Issues List, Rocks™, Scorecard, and EOS® Implementer® are concepts and trademarks of EOS Worldwide, LLC. This article is an independent practitioner perspective and is not affiliated with or endorsed by EOS Worldwide.
