---
title: Compliance-aware AI inside EOS® healthcare, finance, and regulated industries
date: 2026-05-22
author: David Steel
slug: compliance-hipaa-eos-healthcare-finance-regulated
type: founder_essay
status: published
series: eos-ai-integration
series_part: 34
keywords:
  - HIPAA
  - compliance
  - regulated industries
  - EOS healthcare
  - EOS finance
  - Entrepreneurial Operating System
  - AI agents
  - agentic AI
  - Claude
  - ChatGPT
  - Anthropic
  - OpenAI
---

# Compliance-aware AI inside EOS® healthcare, finance, and regulated industries

Most of this series can be read directly by an EOS® company in any industry. This post is the one for regulated industries specifically. Healthcare. Finance. Legal. Insurance. Wealth management. Anything where the team is subject to HIPAA, SOC 2, GLBA, PCI, FINRA, or a state-level regulator.

If you run a regulated EOS® company, the agent layer questions are not just "what should the agent do." They are also "what is the company allowed to let the agent do under our regulatory regime."

This post is not legal advice. It is a practitioner's framework for thinking about agent integration when compliance is a real constraint. Talk to your compliance officer and your legal counsel before deploying.

## What the regulators care about

Three concerns, simplified, that apply across most regulated industries.

**Concern one: data handling.** Where does customer data go. Who can see it. How long is it retained. Is it encrypted at rest and in transit. Can it be deleted on request. Regulators write this down in HIPAA, GDPR, CCPA, GLBA, and various sector-specific rules.

**Concern two: decision authority.** Who is responsible for actions taken on behalf of the company. Can a machine make medical, financial, or legal recommendations. If so, under what supervision. Some industries require a licensed professional in the loop.

**Concern three: auditability.** Can the company show what happened, when, by whom (or what), and why. Regulators want a paper trail. Most regulated industries require log retention for years.

An AI agent layer touches all three. Data handling because the agent reads and writes customer data. Decision authority because the agent takes actions. Auditability because the agent's actions need to be logged the same way human actions are.

## The vendor question first

Before you write a single SOP for a regulated agent, pick a vendor with the right contracts.

**For HIPAA-covered work.** Use a vendor that signs a Business Associate Agreement (BAA). Anthropic's Claude API and OpenAI's API both offer BAAs on the right tiers. Free or consumer tiers do not. Sign the BAA before any PHI touches the model.

**For SOC 2.** Both Anthropic and OpenAI provide SOC 2 Type II reports for their enterprise offerings. Get them. Pass them to your auditor.

**For data residency.** If you have GDPR or data-residency obligations, both vendors offer region selection on enterprise tiers. Confirm and document.

**For "no training" guarantees.** Both vendors offer zero training on customer data at the enterprise tier. Get it in writing.

Most regulated companies find that the right enterprise tier of either Anthropic or OpenAI is acceptable. The free or consumer tiers are not. Do not let employees use ChatGPT.com or Claude.ai for regulated workflows. Procure the right tier centrally and require its use.

## The SOP changes for regulated agents

The standard six-field SOP from earlier in this series picks up four more fields when regulation is in play.

**Field seven: data classification.** What categories of data does this agent read and write. PHI. PII. Financial. Confidential. Public. Classify explicitly. Different classifications get different treatment.

**Field eight: regulatory authority.** Which regulations apply. HIPAA. SOC 2. GLBA. State-specific. The Integrator and compliance officer name them in the SOP.

**Field nine: audit logging requirements.** What gets logged. Where the logs are stored. How long they are retained. Who can read them. Most regulated agents need every input and output logged with timestamp and identifier.

**Field ten: licensed-professional-in-the-loop requirements.** If the agent is supporting a regulated decision (medical, legal, financial advice), specifies which licensed professional reviews and signs off. The agent never makes the regulated decision unilaterally.

These four fields turn an agent SOP from a process document into a compliance artifact. Get a compliance officer to sign each one before the agent goes live.

## What agents are still safe in a regulated industry

Plenty. The negative case is narrower than founders often think.

**Internal operations agents.** Chief of Staff. Scorecard. Briefing. Issues clustering. Project management visibility. None of these touch regulated customer data if you keep them on internal data only.

**Marketing agents.** Cold outreach (on public business contact data), content drafting, social media, internal newsletters. Largely outside the regulated perimeter as long as they do not touch customer PHI or PII.

**Sales pipeline agents.** Inbound lead routing, pipeline visibility, follow-up reminders. Touch customer data lightly. Stay inside the perimeter with the right contracts.

**Customer support visibility.** Reading themes from support tickets, surfacing patterns. Possible inside the perimeter with the right BAA and the right data handling.

**Internal HR agents.** Employee onboarding, internal Q&A on policy docs. Inside the perimeter for employee data only.

The agents that need the most careful treatment are the ones that touch customer PHI, financial transactions, or regulated advice. These usually need licensed-professional-in-the-loop and the strictest SOPs.

## What agents need licensed humans in the loop

Three categories of work where the agent supports but does not decide.

**Medical recommendations.** A clinician reviews. An agent can draft, summarize, or analyze. A clinician signs.

**Financial advice or recommendations.** A licensed advisor reviews. An agent can compile, model, or analyze. The advisor signs.

**Legal advice or document drafting.** A licensed attorney reviews. An agent can research, draft, or analyze. The attorney signs.

In each case the agent's role is to accelerate the licensed professional's work, not to replace it. The Letter-vs-Spirit calibration is strict letter on the recommendation itself. The licensed professional is the only one who carries the spirit.

## What this does to the L10® meeting

The L10® cadence does not change. The Scorecard, Rocks, and Issues sections work normally.

Two specific additions for regulated companies.

**The Compliance Headlines section.** A short addition to Customer or Employee Headlines specifically for compliance signals. Any audit prep work. Any incident the team needs to know about. Any regulatory update that affects the company. Two minutes. Sourced from the compliance officer or a compliance-watching agent.

**The Agent Logs review.** Quarterly, not weekly. The compliance officer reviews a sample of agent outputs to confirm they meet the regulatory standard. This is a Quarterly Rock-style item, not a recurring L10® topic.

Neither addition is huge. Both are necessary in a regulated context.

## What we are seeing in regulated EOS® companies

A growing pattern: regulated companies are deploying agents on the internal operations side (Chief of Staff, Scorecard, briefing) at the same pace as non-regulated companies. The customer-facing agent layer lags by 6 to 12 months because the compliance and contracting work takes longer.

This is the right sequencing. Internal ops agents prove the integration pattern with low compliance exposure. The team builds confidence and capability. Customer-facing agents come once the compliance scaffolding is in place.

Healthcare practices with multiple locations are particularly well-suited to this. Internal coordination across locations is exactly the operational drag a Chief of Staff agent removes. PHI never enters the agent's context. The investment is small. The leverage is real.

## What to ask your compliance officer

Before any agent deployment, walk these questions with your compliance officer.

- Which regulations apply to this specific agent's intended workflow.
- Which vendor and tier do we need to sign a BAA or DPA with.
- What data classifications will the agent read or write.
- What audit logs must we maintain.
- Does the agent need a licensed professional in the loop, and if so, at what step.
- What incident-response plan applies if the agent makes a mistake that constitutes a regulatory breach.
- Who at the company is accountable for the agent under our compliance program.

Most compliance officers, asked these questions thoughtfully, become allies in the agent layer rollout rather than blockers. They understand the leverage. They just need the questions answered.

## FAQ

**Can we use ChatGPT Plus or Claude Pro for regulated work?** No. Use enterprise tiers with the right contracts (BAA, DPA, SOC 2). Free and prosumer tiers are not designed for regulated data.

**What about open-source models we self-host?** Possible. Self-hosted models keep data in your environment, which simplifies some compliance questions. They also shift the burden of model security, monitoring, and updates to your team. Most regulated EOS® companies are better off using a vendor with the right contracts than self-hosting.

**Can the agent's outputs become part of the regulatory record?** Yes, and they need to be logged appropriately. Treat the agent's outputs the same way you would treat a human team member's outputs for audit purposes.

**What about state-specific regulators?** Talk to your compliance officer. State regulations sometimes add requirements beyond federal. The framework above applies, with state-specific overlays.

EOS®, Entrepreneurial Operating System®, V/TO™, Level 10 Meeting®, L10®, Rocks™, Scorecard, Issues List, Accountability Chart, Customer Headlines, Employee Headlines, Quarterly, and Integrator are concepts and trademarks of EOS Worldwide, LLC. HIPAA, SOC 2, GLBA, PCI, FINRA, GDPR, CCPA, and other regulations are administered by their respective regulatory bodies. This article is an independent practitioner perspective, not legal or compliance advice, and is not affiliated with or endorsed by EOS Worldwide, any vendor, or any regulator.
