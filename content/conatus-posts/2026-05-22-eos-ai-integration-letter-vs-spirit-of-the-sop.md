---
title: Letter vs Spirit of the SOP, what AI agents are allowed to interpret
date: 2026-05-22
author: David Steel
slug: letter-vs-spirit-of-the-sop-agents-interpret
type: founder_essay
status: published
series: eos-ai-integration
series_part: 28
keywords:
  - SOPs
  - Standard Operating Procedures
  - EOS Process
  - Process Component
  - Entrepreneurial Operating System
  - AI agents
  - agentic AI
  - Claude
  - ChatGPT
  - interpretation
---

# Letter vs Spirit of the SOP, what AI agents are allowed to interpret

There is an old EOS® coaching distinction between the Letter of the Law and the Spirit of the Law. The Letter is what the SOP literally says. The Spirit is what the SOP is trying to accomplish. Humans can usually navigate the gap between the two by reading the room. Agents cannot.

This is the single hardest design question in agentic AI for EOS® companies. How much interpretation do you allow the agent. Too little and the agent fails the moment the situation is novel. Too much and the agent invents its own version of the company's process.

Get this calibration right and your agents earn trust. Get it wrong and the agents either break or embarrass the company.

## The two failure modes

**Failure mode one: pure letter.**

The agent follows the SOP literally. The SOP says "send an email to leads tagged Hot in the CRM within 24 hours of being tagged." The agent does exactly that. A lead gets accidentally tagged Hot by an intern at 11 p.m. on a Friday. The agent sends the email at 11:30 p.m. The client thinks the company is desperate.

The SOP was correct in spirit (move quickly on real Hot leads). The agent followed it in letter (any lead with the tag, any time). The result is bad.

**Failure mode two: too much spirit.**

The agent reads the SOP loosely and improvises. The SOP says "qualify the lead against ICP." The agent decides ICP is "any business that could benefit from our product," which is a generous interpretation, and stretches the qualification to a much wider set. The pipeline fills with poor-fit leads. The sales team's hit rate collapses.

The SOP was a sharp guardrail. The agent treated it as a suggestion. The result is sprawl.

Both failure modes are real. The right calibration sits between them and is not the same for every agent.

## A framework for calibrating

Three categories of agent actions. Different rules for each.

**Category A: Mechanical execution. Letter wins.**

Pushing a Scorecard number. Reading from a data source. Counting events. Generating a report from a template. These actions should follow the letter exactly. No interpretation. The agent reads the SOP and executes.

Failure mode if you allow too much spirit here: the numbers drift, the definitions slide, the team stops trusting the data.

**Category B: Drafting and synthesis. Spirit with disclosure.**

Writing a cold email draft. Summarizing a meeting. Clustering Issues. Surfacing customer themes. These actions need interpretation, because the input is messy and judgment is part of the job. The agent should interpret, but should always disclose its interpretation alongside the output. "I interpreted these three tickets as the same root cause. Here is my reasoning." The human reviewer can confirm or push back.

Failure mode if you allow only letter here: the agent produces mechanical, stilted, useless drafts that need full rewriting.

**Category C: Decisions that affect the world. Letter strictly, escalate the rest.**

Sending an external email. Updating a CRM record. Pushing data to a public surface. Tagging or untagging. These actions need strict letter compliance, and anything outside the letter must escalate to a human.

Failure mode if you allow spirit here: the agent takes irreversible actions based on judgment calls that the human team would not have made.

The three categories are not always clean in practice. Some agent runs touch all three. The rule of thumb: be permissive on B, strict on A and C.

## How to write SOPs with this in mind

Three additions to the standard six-field SOP from earlier in this series.

**Add an Interpretation field.** Write down, for each agent, the scope of interpretation allowed. "This agent may interpret which support tickets cluster as the same root cause. This agent may not interpret which customers should receive outreach."

**Add a Disclosure rule.** Where interpretation is allowed, require the agent to disclose its reasoning. "When clustering tickets, include a one-line explanation of why each ticket was grouped together."

**Add a Letter-Only list.** Specific actions where letter compliance is mandatory and no interpretation is allowed. "The agent must use the exact qualification criteria in the ICP document. Any prospect outside those criteria must be skipped, not interpreted."

This adds three short paragraphs to each SOP. Worth it.

## What this looks like in our practice

Our cold outreach agent at Sneeze It runs all three categories in a single workflow.

**Category A actions.** Read the ICP list. Pull the prospect data. Validate the email. Update the agent's own scorecard.

**Category B actions.** Cluster prospects by industry vertical. Choose which Three Uniques to lead with based on the prospect's profile. Draft the email body. Each draft includes a one-line note: "Lead with Unique 2 because the prospect's recent press mentions cost pressure."

**Category C actions.** Send the email. The agent does not send autonomously to prospects outside its trust ladder rung. Inside its rung, the agent sends only to prospects that passed every letter-strict filter. Anything ambiguous escalates to the founder.

This calibration took two months to dial in. The first version had too much spirit (the agent stretched the ICP). The second version had too little (the agent rejected any prospect that did not match the ICP exactly, which over-cut). The third version, with the three-category framework, holds.

## The hardest part is naming what is mechanical vs not

Most companies cannot tell, on day one, which actions in their workflows are mechanical (Category A), which need interpretation (Category B), and which are world-affecting (Category C).

This is okay. It is also one of the unexpected benefits of building agents. The forcing function of writing an SOP for an agent surfaces this distinction. The human team learns where their own judgment is heavy vs light. The conversations the team has during SOP design are some of the most clarifying conversations any leadership team will have about how they actually work.

This is not a bug. It is the upgrade. The agent layer makes the company's reasoning legible to itself.

## What to do when an agent's interpretation surprises you

It will. Even with sharp SOPs, an agent occasionally produces an interpretation the team did not expect. Sometimes it is bad and the SOP needs tightening. Sometimes it is good and the SOP needs widening.

The rule: never delete the surprise. Document it. Discuss it in the next IDS. Update the SOP based on what the team decides.

This is exactly how a new human team member's judgment gets refined. The agent layer follows the same coaching pattern.

## FAQ

**What about emergencies? Should the agent improvise when the situation is novel?** No. The agent escalates. The Integrator or the named accountability partner improvises. Agents do not improvise.

**Can the agent ask the human for clarification mid-run?** Yes, and should. Build the escalation as part of the agent's normal flow. "I encountered an ambiguous case, here is what I see, what should I do." A waiting agent that asks well is better than a running agent that guesses.

**What about agents that learn from corrections?** Useful in principle. In practice, build the correction loop into your SOP review cadence. When the team corrects the agent, update the SOP that same day. The "learning" is in the SOP, not in the model's weights.

**Should agents ever override the SOP?** No. If the agent thinks the SOP is wrong, it escalates. The human team decides whether to update the SOP. The agent never operates outside the SOP unilaterally.

EOS®, Entrepreneurial Operating System®, Process Component, Followed By All™, V/TO™, Level 10 Meeting®, L10®, Rocks™, Scorecard, Issues List, IDS, Accountability Chart, and Integrator are concepts and trademarks of EOS Worldwide, LLC. This article is an independent practitioner perspective and is not affiliated with or endorsed by EOS Worldwide.
