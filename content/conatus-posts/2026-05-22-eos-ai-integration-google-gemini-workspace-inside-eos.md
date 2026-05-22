---
title: Google Gemini and Workspace inside EOS®
date: 2026-05-22
author: David Steel
slug: google-gemini-workspace-inside-eos
type: founder_essay
status: published
series: eos-ai-integration
series_part: 47
keywords:
  - Google Gemini
  - Google Workspace
  - EOS
  - Entrepreneurial Operating System
  - AI agents
  - agentic AI
  - Vertex AI
  - Apps Script
---

# Google Gemini and Workspace inside EOS®

If your company runs on Google Workspace (Gmail, Calendar, Drive, Docs, Sheets, Slides, Meet), Google's Gemini family is the analogue to Microsoft Copilot for M365 shops. Same logic: the agent layer that lives inside the surfaces where your team already works wins on adoption.

This post is for Google Workspace EOS® companies (a lot of startups, marketing agencies, smaller services firms, and companies that picked Google over Microsoft a decade ago) who want to know what the AI integration looks like with Gemini as the substrate.

## What Gemini and Google Workspace offer

The Google AI surface for an EOS® company has three layers.

**Gemini in Workspace.** The "help me write," "help me organize," and side-panel AI inside Gmail, Docs, Sheets, Slides, and Meet. Reads the open document or thread, drafts or summarizes. Each user sees their own Gemini.

**Gemini for Google Workspace add-ons.** Custom Apps Script extensions plus Gemini API access via Vertex AI. This is where you build the EOS®-specific agents.

**Vertex AI and the Gemini API.** Google Cloud's full developer surface. Long-context models (Gemini 2.5 Pro, with extremely long context windows), tool use, function calling, and the ability to run scheduled jobs via Cloud Run, Cloud Functions, or Cloud Scheduler.

For agent-layer purposes, Apps Script plus Vertex AI is the practical combination. Apps Script runs natively inside Workspace and can be triggered on schedule. Vertex AI provides the model.

## What changes when Gemini is your substrate

Three things.

**One, agents inherit Workspace permissions.** An Apps Script agent acting on a Google Doc sees what the script's runner has permission to see. Identity is reused. No new auth layer.

**Two, the spreadsheet is your scorecard surface.** Most Workspace shops already keep the Scorecard in a Google Sheet. Apps Script can read and write the sheet natively. The Scorecard agent is unusually easy to build.

**Three, the integration substrate is open.** Workspace plays well with most third-party SaaS. Compared to Microsoft's tighter ecosystem, Workspace shops typically have more APIs and more integration patterns already in place.

## What the agent layer covers with Gemini and Workspace inside EOS®

Same seven workflows from earlier in this series, mapped to Workspace patterns.

**Chief of Staff agent (briefing).** An Apps Script agent triggered each morning that reads the day's Calendar, the prior 24 hours of unread Gmail labeled for review, and a curated set of Drive folders. Produces a brief in a Google Doc shared with the leadership team. Optional: send via Gmail.

**Scorecard agent (KPI push).** An Apps Script agent that reads from connected source systems (CRM via API, ad accounts, billing) each Monday and writes the values into the Scorecard Google Sheet. Cell-level evidence trail in a hidden column.

**Inbox triage agent.** Gmail filter labeling rules combined with an Apps Script + Gemini agent that classifies messages and writes drafts into the user's Drafts folder. Native to Gmail.

**Project visibility agent.** Reads project data from whichever system the team uses (Asana, ClickUp, Linear, custom). Posts the daily status to a designated Doc or Sheet.

**Issues clustering agent.** Reads the L10® meeting notes from a Google Doc (or Meet transcripts auto-captured), clusters Issues, and posts the deduped Issues List to the meeting prep doc.

**Customer Headlines synthesis.** Reads the support inbox, NPS survey responses, review platforms via API, and customer-facing Drive folders. Posts weekly themes to a Doc.

**Sales pipeline agent.** Reads the CRM via API, flags stale deals, drafts follow-ups in Gmail. Same pattern as the Sales Director seat post earlier.

Same agent layer. Different substrate.

## What Gemini does well

Three things Gemini does unusually well for EOS® companies on Workspace.

**One, long context.** Gemini 2.5 Pro handles very long context windows. For Annual session red team work, IDS knowledge base across years of meeting notes, or comprehensive V/TO™ stress testing, this is genuinely useful.

**Two, native Sheets manipulation.** Apps Script + Gemini handling structured data in Google Sheets is a clean pairing. Scorecards, KPI dashboards, board reports, and financial summaries are unusually straightforward to build.

**Three, Meet-native meeting capture.** Google Meet's transcription and Gemini's summarization are well-integrated. L10® meetings run in Meet get transcribed, summarized, and propagated with very little custom build.

## What Gemini does less well

Three honest constraints.

**One, the consumer-vs-enterprise split is confusing.** Gemini in Gmail vs Gemini in Workspace Business vs Gemini in Workspace Enterprise vs Vertex AI all have different defaults around data handling, training, and capabilities. Make sure your IT has configured the right tier and policy. Free or consumer-tier Gemini is not appropriate for V/TO™-bearing or client-data work.

**Two, Apps Script has quirks.** Apps Script is powerful but the developer experience is dated compared to modern serverless patterns. Most agent builders find it usable but not their favorite. For complex agents, factor in the learning curve.

**Three, the agent platform layer is less mature than competitors.** Google has not yet shipped a Copilot Studio equivalent that is the obvious answer for non-technical builders. The DIY path (Apps Script + Vertex AI) is real but requires technical capacity.

## What to deploy in the first 90 days with Gemini and Workspace

If you are a Workspace shop starting AI integration with Gemini, prioritize.

**Week 1 to 4.** License the right Workspace tier (Workspace Business or Enterprise with Gemini included) and confirm data handling. Run a leadership team enablement on Gemini in Gmail, Docs, Sheets, and Meet.

**Week 4 to 8.** Build the first Apps Script agent for the Chief of Staff role. Triggered on schedule. Reads Calendar and labeled Gmail. Writes a brief Doc.

**Week 8 to 12.** Build the Scorecard automation. Apps Script reads source systems via API. Updates the Scorecard Sheet each Monday.

**Quarter 2.** Customer Headlines synthesis, sales pipeline agent, inbox triage. Each one a separate Apps Script + Vertex AI agent.

## The hybrid pattern many Workspace shops adopt

Like the M365 hybrid, many Workspace shops run Gemini alongside Claude or ChatGPT.

**Gemini inside Workspace surfaces.** Gmail, Docs, Sheets, Slides, Meet. The team is already there.

**Claude or ChatGPT for specific workflows.** Long-form strategic drafting, complex reasoning, cold outreach voice work, where the engineering team prefers a specific API or wants the latest model tier.

Both run. Same V/TO™ preamble. Different surfaces. Reasonable if your spend supports it.

## What about NotebookLM

A small but useful Google product worth naming: NotebookLM. It is a Gemini-powered note-taking and reasoning tool that lets you upload up to 50 source documents and have the model reason against them. For an EOS® leadership team, NotebookLM is unusually useful for two specific jobs.

**Annual session prep.** Upload the V/TO™, the last 12 Scorecards, the year's Rock retrospectives, and the Issues Lists. Ask NotebookLM to surface patterns. Excellent red-team input.

**New leadership team member onboarding.** Hand a new Director a NotebookLM workspace with the V/TO™, the last quarter of L10® notes, and the relevant SOPs. Let them ask questions. Ramp is much faster.

NotebookLM is free or low-cost depending on tier. Worth knowing about even if it is not your main agent platform.

## FAQ

**What about Google Gemini Code Assist for engineering teams?** Useful for software-team productivity, parallel to Claude Code and GitHub Copilot. Same usage pattern. Not specifically an EOS® agent.

**What about confidentiality?** Use Workspace Business or Enterprise with Gemini, configured with appropriate data policies. Vertex AI offers explicit controls on data residency and training. Both are credible for sensitive data.

**Can Gemini agents talk to each other?** Yes, via Apps Script orchestration or Vertex AI agent frameworks. Less polished than Claude Code or Copilot Studio for this specifically, but workable.

**Should we move off Workspace to enable a better agent layer?** No. Same logic as M365. The cost of leaving is much higher than the marginal benefit.

EOS®, Entrepreneurial Operating System®, V/TO™, Level 10 Meeting®, L10®, Rocks™, Scorecard, Issues List, Customer Headlines, Accountability Chart, and Integrator are concepts and trademarks of EOS Worldwide, LLC. Google Workspace, Gemini, Vertex AI, Gmail, Calendar, Drive, Docs, Sheets, Slides, Meet, Apps Script, NotebookLM, and Gemini Code Assist are products and services of Google LLC. This article is an independent practitioner perspective and is not affiliated with or endorsed by EOS Worldwide or Google.
