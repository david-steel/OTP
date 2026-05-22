---
title: Bloom Growth, Ninety, Traction Tools, and the AI-native EOS® layer
date: 2026-05-22
author: David Steel
slug: bloom-ninety-traction-tools-vs-ai-native-eos-layer
type: founder_essay
status: published
series: eos-ai-integration
series_part: 23
keywords:
  - Bloom Growth
  - Ninety
  - Traction Tools
  - EOS software
  - Entrepreneurial Operating System
  - AI agents
  - agentic AI
  - Claude
  - ChatGPT
  - L10
---

# Bloom Growth, Ninety, Traction Tools, and the AI-native EOS® layer

If you run EOS® and you have software for it, you almost certainly run one of three platforms. Ninety (the largest user base). Bloom Growth (formerly Traction Tools' newer sibling). Traction Tools (the original). Each one digitizes the V/TO™, the Accountability Chart, the Scorecard, the Rocks, the Issues List, the To-Dos, and the L10® meeting.

These platforms work. Tens of thousands of EOS® companies use them daily. The question this post answers is what happens to them when AI agents enter the picture.

The short version: they remain useful, with two new requirements you should evaluate them on. Read access for an agent layer. Export of historical data for indexing.

## What each platform is

**Ninety.** The current market leader for EOS® software. Strong UI, broad feature coverage, large customer base. Cloud SaaS. Mobile apps. Active product team.

**Bloom Growth.** Newer entry from the team behind Traction Tools. Modernized UI. Strong on coaching workflows. Multi-framework support including OKRs and Scaling Up alongside EOS®.

**Traction Tools.** The original EOS® software, built closely with EOS Worldwide for many years. Mature. Familiar to anyone trained by an early-cohort EOS® Implementer®.

All three give you the same core artifacts: V/TO™, Accountability Chart, Scorecard, Rocks, Issues, To-Dos, L10® meeting flow. Choose based on UI preference, team familiarity, and pricing. The framework is identical underneath.

## The two new requirements

When you evaluate any of the three (or a newer entrant) for an AI-integrated EOS® company, add two requirements to the usual list.

**Requirement one: agent-friendly read access.**

Can an agent read your Scorecard, Rocks, Issues List, and To-Dos without scraping the UI. This means either:

- A documented API the agent can hit with credentials.
- An export-to-file workflow the agent can run on a schedule.
- A standard integration channel (Zapier, Make, native webhooks) that exposes the data.

If none of those exist, the agent layer cannot be pre-staged from the platform. The Integrator ends up copying data between systems by hand, which defeats the purpose. As of this writing, all three major platforms support some level of API or export, but the depth varies. Ask specifically.

**Requirement two: historical data export.**

Can you export the full archive of your Issues List, To-Dos, and L10® notes in a structured format the model can read.

This is the requirement teams forget. The historical data is the most valuable input for the Issues-as-training-data pattern. Without it, the agent layer starts from a cold archive. With it, the agent has years of institutional reasoning to draw on.

CSV exports work. JSON exports work better. Markdown exports work fine. PDF-only exports do not work because they are too hard for an agent to parse cleanly. If the platform only exports to PDF, that is a real constraint.

## Should you switch platforms?

Almost certainly not. Switching EOS® platforms is painful. The team is trained, the data is in, the workflows are running. Do not switch unless the platform fails one of the new requirements badly.

The right move for most teams is to stay on whatever platform they are using and add a thin agent layer alongside it. The agent layer reads from the platform via API or scheduled export. The agent layer writes its outputs to wherever the team already works (Slack, Obsidian, a shared file, Todoist). The platform stays the source of truth for EOS® artifacts.

This is also how we run it at Sneeze It. The EOS® artifacts live in their own system. The agent layer reads them. The agent layer's outputs go to the team's daily tools. No platform switch required.

## The AI-native EOS® layer as a complement

A new category is emerging: lightweight, AI-native operating-layer tools that sit alongside the EOS® platform. They are not replacements for Ninety or Bloom Growth. They are companions.

The natural shape of these tools:

- Read the EOS® platform's data (V/TO™, Scorecard, Rocks, Issues, To-Dos).
- Run a configurable set of agents (briefing, Scorecard-pusher, Issues-clusterer, Rock-watcher).
- Surface agent outputs in the team's daily channels.
- Maintain an Issues archive for retrieval.
- Provide a unified system prompt for the team's agent layer.

You can build this yourself in Claude Code or in OpenAI Assistants API. You can also use a vendor that has built it. Either approach is reasonable. The vendor approach saves engineering time. The DIY approach gives more control.

What you do not want is to wait for your EOS® platform itself to ship a deep AI feature. The current EOS® platforms are adding AI summarization and basic assistant features, which are useful but not the agent layer this series has been describing. Build the agent layer alongside the platform.

## What to do this month

If you are already on Ninety, Bloom Growth, or Traction Tools, take three actions.

**One, audit your API or export access.** Confirm you can read the Scorecard, Rocks, Issues, and To-Dos programmatically. If not, raise it with the vendor.

**Two, export your historical Issues and To-Dos to a folder.** CSV or JSON. Store it where the agent layer can read it. Set a recurring monthly re-export.

**Three, pick one agent to build first.** Recommended: the Issues-clustering agent, because it gets immediate value from the historical archive you just exported. Build it in a week. Run it before your next L10®.

That is the practical handshake between your EOS® platform and your AI agent layer. The platform does what it has always done. The agent layer does the work the platform was not designed for.

## What to ask vendors

Whether you are staying with your current platform or evaluating a new one, ask the vendor these questions specifically.

- Do you have a documented API with read access to the V/TO™, Scorecard, Rocks, Issues, To-Dos, and Accountability Chart.
- What is the rate limit on that API.
- Can we export historical data, including closed Issues and completed Rocks, in JSON or CSV.
- Do you have integrations with Slack, Microsoft Teams, Obsidian, or any of the major agent platforms (Claude API, OpenAI API, n8n, Zapier).
- Does your enterprise tier offer zero training on customer data for any AI features you ship.
- What is your roadmap for AI agent integration on your side.

Good vendors answer all of these without hedging. Hedging is information.

## FAQ

**Are these platforms going to be replaced by AI?** Not soon. The EOS® framework's core artifacts still need a place to live with versioning, access control, audit logs, and team workflows. The platforms will absorb AI features over time, not get replaced by them.

**What about Asana, Notion, Linear, or generic PM tools?** Some companies run EOS® on generic tools. That works for small teams but loses the EOS®-specific workflows (Quarterly session templates, V/TO™ structure, Accountability Chart layout). Use a dedicated EOS® platform once you cross 8 to 10 leadership team members.

**What if our platform does not have an API?** Raise it with the vendor as a P0 request. If they do not have a roadmap for it, the long-term answer is to move to one that does. Short-term, work with manual exports.

**Can the EOS® Implementer® help us choose?** Yes. Implementers see many companies and have a strong read on which platforms are evolving well. Ask yours.

EOS®, Entrepreneurial Operating System®, V/TO™, Vision/Traction Organizer™, Level 10 Meeting®, L10®, Rocks™, Scorecard, Issues List, To-Dos, Accountability Chart, Quarterly, and EOS® Implementer® are concepts and trademarks of EOS Worldwide, LLC. Ninety is a product of Ninety.io. Bloom Growth is a product of Bloom Growth, Inc. Traction Tools is a product of Traction Tools, LLC. This article is an independent practitioner perspective and is not affiliated with or endorsed by EOS Worldwide, Ninety.io, Bloom Growth, Inc., or Traction Tools, LLC.
