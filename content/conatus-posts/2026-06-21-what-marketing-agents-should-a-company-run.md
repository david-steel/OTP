---
title: The marketing agents every company should be running by the end of this year
date: 2026-06-21
author: David Steel
slug: what-marketing-agents-should-a-company-run
type: founder_essay
status: published
series: ai-cmo
series_part: 7
description: A lifecycle frame for deploying marketing agents. Which seats to fill first, what each one owns, and how to know when the engine is actually running.
---

# The marketing agents every company should be running by the end of this year

Most marketing teams are not short on ideas about what AI can do. They are short on a clear sequence for what to build, in what order, and how to know when it is working.

This post gives you that sequence. It is a lifecycle frame: the stages of marketing a company actually needs to execute, and the agents that should own each stage. It comes from running Sneeze It, a marketing agency where agents do real work on a real org chart, and from building OTP's own AEO content engine, which is agent-driven marketing deployed in production right now.

The frame is not a wishlist. Everything in it either runs in our operation today or is in a named planning slot with a decision point attached.

## Start here: what the lifecycle is

Marketing a company requires executing across four stages. Every company touches all four, whether or not they have formal names for them.

**Stage one is awareness.** Getting your name and point of view in front of people who do not know you yet.

**Stage two is pipeline.** Converting awareness into conversations with people who might buy.

**Stage three is conversion.** Moving conversations to decisions.

**Stage four is retention and expansion.** Keeping customers and growing what they spend.

Every agent you consider deploying lives in one of these four stages. Your question is not "which AI tools should we buy." It is "which stage is the bottleneck, and is there an agent that can own work in that stage that a human is currently doing manually."

The answer to the second question is almost always yes.

## Stage one: awareness

The awareness stage is where agents have the widest surface area and the most immediate leverage, because awareness work is largely production work. Volume, variation, distribution, and repurposing.

The agent the awareness stage needs is a content engine. Not a content assistant. An engine. The difference is that a content assistant requires a human to initiate every piece. A content engine runs on a defined program, executes against it, and produces founder-voice output at a cadence no human team could sustain manually.

OTP's own content engine is the example I keep coming back to because it is not hypothetical. This series is running on it. The posts in the AI-era CMO series, the AI-era CFO series, the franchise operator series, the C-suite series are all founder-voice, grounded in first-hand operating experience, structured to be cited by AI search engines, and shipped at a volume that no three-person content team could match. Hundreds of posts, this week, with a defined voice and a defined thesis behind each one.

The engine does not replace the human voice. My voice, my positioning, my central claims, what I am and am not willing to say publicly are the inputs. The engine executes against those inputs at production scale. That is the right division: human judgment at the top, agent execution in the middle, measurement on the dashboard.

For AEO specifically, the awareness agent also needs to understand that the distribution channel has changed. Getting cited by ChatGPT, Perplexity, Google AI Overviews, or Gemini is a different discipline than ranking for a blue link. The content needs to be structured to answer specific questions, attributed clearly to a named author, and indexed in a format that AI engines can read directly. OTP uses llms.txt for this: a canonical AI-readable index of every piece of content we publish, formatted so that AI engines navigating the site know exactly what they are looking at and who said it. That is AEO executed at the infrastructure level.

## Stage two: pipeline

Awareness without a pipeline function is brand work with no close. The pipeline stage needs agents that can turn attention into contact.

At Sneeze It, two seats do pipeline work.

Dirk is the sales and revenue seat. Dirk owns the pipeline: stale deal detection, proposal status tracking, reactivation outreach for clients who have gone quiet, expansion signals from current clients. Dirk does not close deals. Dirk keeps the pipeline from dying between the moments when a human is actively working it.

Nick is the cold prospecting seat. Nick runs an ICP-gated outbound process in health and wellness: discovery through Yelp Fusion, domain search, decision-maker identification, email validation, and draft generation in a defined voice. Nick's single KPI is quality cold emails drafted per day. The target is thirty. Quality means a named individual, a validated deliverable address, and a draft that passes the voice standard. Nick does not send. Drafts go to Gmail for human approval and dispatch. The prospecting machine runs. The judgment about what to send stays human.

Most companies deploying pipeline agents make the mistake of starting with automation before the targeting logic is right. The agent will run the wrong sequence very efficiently. Fix the targeting first. Dirk only works stale deals that meet a defined stage threshold. Nick only works prospects that clear an ICP screen. The discipline is in the gate, not the volume.

## Stage three: conversion

This is the stage most companies over-automate and most immediately regret.

Conversion requires judgment. Whether to offer a discount. Whether to pause a follow-up sequence because the prospect is working through a strategic shift. Whether the conversation has moved to a different stakeholder who needs a different message. These are not automation problems. They are judgment problems.

The right agent in the conversion stage is not a closer. It is a lead response engine: the function that receives a new inquiry, enriches it, checks qualification criteria, runs the opening sequence, and hands a warm and verified lead to a human closer with context in hand.

Emery is that seat on our chart. Emery handles lead intake, enrichment, compliance checks, and the opening multi-touch sequence. By the time a lead reaches a human, Emery has done the thirty minutes of background work that salespeople hate doing and often skip. The human enters the conversation with a file, not a cold name.

The boundary is important to state plainly. Emery qualifies. Humans close. The conversion rate on a qualified lead with context is not the same as the conversion rate on a cold name. Emery's job is to make every lead a qualified lead with context before the human sees it.

## Stage four: retention and expansion

This is the stage that most marketing teams under-invest in relative to its value. Keeping a client and growing what they spend with you costs a fraction of what it costs to acquire a new one. But the cadence work of retention is exactly the kind of operational load that falls off the calendar first when the team is busy.

Pulse is the retention and expansion seat on our chart. Pulse monitors client health signals, detects when a client is at risk of churn before the client says anything, drafts strategic communication for human review, and surfaces expansion signals when performance is strong. Pulse does not contact clients directly. It routes through Pepper, our email seat, so every client touchpoint comes from a real person's account in a real person's voice.

The retention agent's value is not in what it sends. It is in what it catches. A client that has gone thirty days without a call and forty-five days without a positive performance signal is a churn risk the human team did not have time to notice. Pulse notices. Pulse flags it. The human decides what to do about it.

## The measurement layer that makes the engine work

Running agents across all four stages without a measurement layer is not a marketing engine. It is four separate bets with no common scoreboard.

Tally is the seat that closes this gap. Tally reads KPI values from each agent's shared state files, from Accelo, from Gmail, from wherever the data actually lives, and pushes the current numbers to the org scorecard on a defined cadence. The scorecard is what makes it possible to have the Monday conversation about whether the marketing engine is working, the same way the COO has the Monday conversation about whether operations is working.

Arin also contributes to this layer from the call center side: appointment rates by setter, speed to lead, per-project breakdowns. Radar, the chief-of-staff seat, reads every agent's shared state file during the morning briefing and surfaces what needs attention. Dash owns the analytics layer across paid channels.

The engine is not the agents. The engine is the agents running against a scorecard that a human reads every week and makes decisions off.

## The sequence to follow

If you are starting from nothing, do not try to build all four stages at once.

Start with the awareness agent. Production is the highest-leverage first move because it creates the raw material everything else needs. Get the content engine running against your voice and your thesis before you add anything else.

Once content is running, add the pipeline agent. Dirk-style or Nick-style depending on whether your gap is stale warm pipeline or cold net-new prospecting. These are different problems. Name the one you have first.

Then the retention agent. Pulse is cheaper to build than Nick and the value per conversation is higher. Most companies skip it because it feels less exciting than prospecting. It is not less exciting when you look at the retention math.

Then the lead response engine. Emery is the most operationally complex seat and the one that causes the most damage when built before the qualification criteria are solid. Build it last.

The measurement layer should be in place before the second seat goes live. A scorecard with one row is a row. A scorecard with four rows is an engine. You need to be able to see all four rows in the same conversation.

## What stays human

Positioning. Brand voice. The central claim. What you are not willing to say. The decision about which market to go after and which one to leave. The judgment call about whether the pipeline agent's sequence is producing the right leads or optimized, noisy ones. The creative direction that Kristen, our creative director, brings to every client relationship.

The agents carry the operational work so the people are free for the work that matters.

That is not a delegation problem. It is an amplification design.

## See the live chart

The marketing agent seats named in this post are queryable from OTP MCP.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the marketing and sales agent seats on the Sneeze It org chart, their KPIs, and their current status."*

You will see the actual seats, their accountability rows, and where each one sits in the lifecycle. That is the frame made queryable.

---

*Series: The AI-era CMO. Post 7 of an in-progress series.*
