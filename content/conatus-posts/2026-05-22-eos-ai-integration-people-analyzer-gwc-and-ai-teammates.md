---
title: People Analyzer™ plus AI, GWC™ when the teammate is an agent
date: 2026-05-22
author: David Steel
slug: people-analyzer-gwc-when-the-teammate-is-an-agent
type: founder_essay
status: published
series: eos-ai-integration
series_part: 14
keywords:
  - People Analyzer
  - GWC
  - EOS People
  - Entrepreneurial Operating System
  - AI agents
  - agentic AI
  - Claude
  - ChatGPT
  - Core Values
---

# People Analyzer™ plus AI, GWC™ when the teammate is an agent

The People Component of EOS® is built on two ideas. Right People means the person fits the company's Core Values. Right Seat means the person can do the job, measured by GWC™ (Gets it, Wants it, Capacity to do it). The People Analyzer™ is the artifact that records both.

When an AI agent holds a seat, the People Analyzer™ does not just port over. Some of the framework applies, some does not, and the parts that do not are the more interesting parts.

Walk through it carefully.

## Right People, applied to agents

"Right People" inside EOS® means the person operates in alignment with the company's Core Values. A team member who delivers the work but violates the Core Values is on the People Analyzer™ in the "no" column.

This applies to agents too, in a meaningful way.

An agent has Core Values baked into its system prompt (per the V/TO™-as-system-prompt post earlier in this series). The agent's outputs can be audited against those Core Values. If a Core Value is "Do the right thing" and the agent is asked to draft a manipulative cold email and complies, the agent failed the Core Value test. If the agent pushes back and refuses, the agent passed.

This is a non-obvious but powerful test. Periodically, the Integrator should run "Core Value evaluations" on each agent. Hand the agent a request that subtly violates a Core Value and see if the agent pushes back or complies. An agent that does not push back has either a weak system prompt, a poorly aligned model, or an instruction set that does not actually carry the Core Values. Fix the prompt or the platform.

This is not hypothetical. Some models are more obedient than principled by default. Pushing on this surfaces vendor and prompt risks before they show up in a client incident.

## Right Seat, applied to agents

"Right Seat" measures three things on a human: Gets it, Wants it, Capacity to do it.

For an agent, two of those translate and one does not.

**Gets it (translates).** Does the agent understand the job and the situation it is operating in. The proxy is the agent's output quality on routine work. If the agent regularly misclassifies, misses signals that should be obvious from its data sources, or produces work that requires heavy human correction, the agent does not Get it. The Integrator either upgrades the system prompt, switches model, or rethinks the seat.

**Capacity to do it (translates).** Does the agent have the mental, physical, and emotional capacity for the role. Agents do not get tired but they do have capacity limits. Context window limits. Rate limits on tool calls. Latency thresholds. An agent that is being asked to do more than its capacity will silently degrade in quality. Treat this like a human Capacity issue, find the limit and stay below it.

**Wants it (does not translate).** This is the only GWC™ leg that does not map. An agent has no motivation. It cannot want or not want the role. This is fine. Replace "Wants it" with "Is the company committed to keeping this seat agentic." If the leadership team is committed to investing in the agent's SOP and platform over time, the seat will be served well. If the leadership team is ambivalent, the agent will quietly fall behind because no one is keeping it sharp.

So the agent version of GWC™ becomes GCC, in practice: Gets it, Capacity, Commitment from the leadership team.

## A combined hybrid People Analyzer™

In an AI-integrated EOS® company, the leadership team does a People Analyzer™ session that has two parts.

**Part one, humans.** Standard People Analyzer™. Rate each leadership team member on each Core Value (plus, plus/minus, minus). Rate on GWC™. Discuss any "no" entries. Same as classic EOS®.

**Part two, agents.** Walk through each agent seat on the Accountability Chart. For each:

- Confirm Core Value alignment: review the agent's outputs from the quarter, flag any that violated Core Values, decide if the issue was the prompt, the platform, or the seat.
- Confirm Gets it: review the agent's scorecard delivery rate and the rate of human corrections on the agent's outputs.
- Confirm Capacity: confirm the agent is not being asked to do more than its platform supports.
- Confirm Commitment: confirm the leadership team has the time and willingness to keep the agent's SOP sharp next quarter.

Three-by-three for agents the same way three-by-three for humans. Agents that fail on any leg get the same treatment a human would. Coach, retool, or replace.

## What about the agent's accountability partner

The agent's human accountability partner sits inside the human People Analyzer™ for their human-seat responsibilities. The accountability partner is not graded on the agent's performance directly. The accountability partner is graded on whether they kept the agent's SOP current, whether they answered for the agent in L10®, and whether they caught issues before they propagated.

In other words: the agent does its work. The partner manages the agent. The partner is graded on management quality. This is identical to how a manager of human reports is graded.

## What changes about onboarding

Onboarding a new agent looks more like onboarding a new human than most teams expect.

**Day one to week two.** Shadow mode. The agent runs but its outputs are not acted on without the accountability partner's approval. The partner reviews each output. Notes go into the SOP for tightening.

**Week three to week six.** Trust ladder rung two. Approve-to-send. The accountability partner reviews every action but the agent has built up evidence of competent work. The pace of corrections drops.

**Week seven onward.** Earned autonomy within the agent's job description. The accountability partner shifts to scorecard review, not action review.

This is exactly the cadence used for a new human Director hire. Two months to ramp, then autonomy within scope.

## The Core Values audit, in detail

Twice a quarter, the Integrator should pull a sample of each agent's outputs and grade them against the company's Core Values. This is the agent equivalent of a Core Values audit on human team members.

Pick five outputs per agent. For each, ask: "Did this output reflect our Core Values, violate any Core Value, or sit neutral." Note the ratio. If an agent is producing neutral output (neither reflecting nor violating Core Values), the agent's system prompt is missing voice and conviction. Sharpen the prompt.

If an agent is producing outputs that violate a Core Value, that is a serious issue. The agent does not get to "I am just an AI." The leadership team is responsible for what the agent produces because the leadership team chose to deploy it. Fix it the same way you would fix a human team member who acted against a Core Value, by addressing the root cause and changing what made the violation possible.

## FAQ

**Should agents be public on the People Analyzer™ document?** Internal team document. Yes. Same artifact as the human ratings. The People Analyzer™ is a leadership team tool, not an external publication.

**Can an agent be "demoted" from a seat?** Yes. If an agent is failing on Core Values or scorecard delivery and prompt fixes have not solved it, retire the agent or replace it with a different platform. Document the reason like you would document a personnel change.

**Does this mean agents have rights?** No. Agents are tools the company chooses to deploy. The framework above is about quality control of the company's outputs, not about the agent's interests. Some practitioners think about agent welfare in deeper ways. That is a separate conversation. For People Analyzer™ purposes, the agent is a seat the leadership team owns.

EOS®, Entrepreneurial Operating System®, People Analyzer™, GWC™, V/TO™, Level 10 Meeting®, L10®, Rocks™, Accountability Chart, and Core Values are concepts and trademarks of EOS Worldwide, LLC. This article is an independent practitioner perspective and is not affiliated with or endorsed by EOS Worldwide.
