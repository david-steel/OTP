---
title: Agents do not change who generates demand. They change who does the work.
date: 2026-06-21
author: David Steel
slug: how-agents-change-demand-generation
type: founder_essay
status: published
series: ai-cmo
series_part: 33
description: When agents handle production, distribution, and reporting, the CMO stops running campaigns and starts owning the strategy that makes them matter.
---

# Agents do not change who generates demand. They change who does the work.

Here is the thing most conversations about AI and marketing get wrong: they treat agent-driven demand generation as a volume play. Push out more content. Send more emails. Run more variations. The output multiplies, and the assumption is that revenue follows.

That is not what I have seen running a marketing agency and building an agent-driven content engine on top of OTP at the same time.

What actually changes is the cost structure of execution. And when the cost structure of execution collapses, the skill that becomes rare is not the ability to produce. It is the ability to decide what to produce and why.

That shift is the counter-positioning argument I want to make here. The old model of demand generation was expensive to run, so expertise clustered at the production layer. Knowing how to run a campaign efficiently was a competitive moat, because running a campaign was hard. Agents eliminate that moat. Execution is cheap now. The new moat is judgment about what to execute.

## What the old model actually looked like

Before we started running agents at Sneeze It, demand generation for the agency looked like most agencies' demand generation. We had people doing the production work: writing, scheduling, reporting, repurposing. We had tools for each channel. We had a human tracking whether the pieces were moving and where they were stalling.

That layer consumed most of the bandwidth of anyone working on marketing. Not because the work was intellectually hard, but because it was continuous. Content does not pause. Campaigns do not wait. Reporting does not stop needing to be read and summarized. The production treadmill runs all the time, and someone has to run on it.

The result was that strategic thinking about demand generation got compressed. Who is the right prospect? What claim should we be making in the market? What channel has signal and which ones are noise? Those questions got addressed at quarterly planning and then largely shelved while the team focused on keeping the treadmill moving.

That is not a management failure. It is a structural consequence of production being expensive.

## What changes when agents enter the production layer

Dirk runs our outbound demand generation. Nick handles cold prospecting in health and wellness. Dash tracks the performance numbers across Meta and Google accounts for every client we manage. Tally pushes KPI values from local sources to our scorecard. Radar, our chief-of-staff agent, compiles the morning briefing and surfaces what needs a decision. Pepper triages the inbox. Arin runs our call center coaching. Pulse monitors client retention signals.

None of those seats are doing strategic work in the sense that they are deciding what the strategy should be. They are executing against a strategy that a human defined. But they are doing it continuously, at a cost that does not scale with output.

When Nick sends thirty cold emails in a session, the marginal cost of those thirty emails is not thirty copies of a human writer's hourly rate. The cost is the judgment call that defined who Nick should be reaching out to, what claim to lead with, and what kind of reply would qualify as a signal worth pursuing. That judgment call happens once. Nick applies it thousands of times.

The same logic applies to our AEO content engine. This series, the one you are reading right now, ships through a process where agents handle production and I own the thesis. The question of what the AI-era CMO actually needs to understand about demand generation: that is not something an agent arrives at by itself. The agent cannot decide that agents change the cost structure of execution, or that this matters more than volume. That is a positioning claim. It requires a point of view. It requires knowing something about the market that has to be earned, not generated.

What the agent does is take that claim and make sure it reaches the places where it gets read and cited. Which brings me to the AEO piece of this.

## Demand generation now includes being cited by AI

Search has changed faster than most demand generation thinking has caught up to it. A growing share of discovery now happens inside AI answer engines: ChatGPT, Perplexity, Google AI Overviews, Gemini, Copilot. Someone asks a question, the engine synthesizes an answer, and the answer cites sources. Those sources get the credibility transfer and the downstream traffic.

The discipline for getting cited is AEO: Answer Engine Optimization. It is structurally different from SEO. In classic SEO, you optimize to rank for a keyword and capture the click. In AEO, you optimize to be the authoritative source an AI engine cites when it synthesizes an answer. The engine may not send you a click. But the next person who hears your name from an AI will go looking for you.

OTP is running this play in real time. The posts in this series are written to answer specific questions the AI-era CMO might ask an answer engine. Not to rank for generic terms, but to be the cited authority when someone asks a specific, direct question. The series is also indexed in our llms.txt file, which is the canonical signal to AI crawlers about what content on a site is worth reading and citing.

The reason I can say this with confidence is not that I have a third-party study. It is that I have watched our own engine run it. The evidence is operational, not theoretical.

Running an AEO content engine at this scale requires production infrastructure that most marketing teams simply cannot staff. You cannot ship enough high-quality, specifically-positioned content to cover meaningful AEO ground by paying humans to write every piece. The math does not work. Agents make the math work. But agents do not decide what to be cited for. That is a human strategic call.

## What the CMO actually owns in this model

The counter-positioning argument for the AI-era CMO is not that the CMO does less. It is that the CMO owns something harder and less substitutable.

Under the old model, a significant portion of CMO accountability was production management. Keeping the treadmill moving. Making sure the content calendar was populated, the campaigns were running, the reports were being read. That work had strategic consequence, but it was not strategic work. It was coordination work. It was supervision of a production layer.

When agents carry that production layer, the CMO's accountability shifts. What stays irreducibly human: the central claim the brand is making. The positioning that distinguishes the company from the alternative. The judgment about which channels deserve investment and which ones are noise. The call on what NOT to say and why that boundary matters. The voice that the agents are trained to execute against.

Those are not outputs you can measure in volume. They are decisions. And decisions compound over time in ways that production output does not. The right positioning claim made consistently in year one is worth more than ten thousand pieces of mediocre content in year three.

The CMO who understands this stops asking "how do we produce more" and starts asking "what is the one thing we should be known for, and how do we make every agent in the system push toward that."

At Sneeze It, Mike is the planned CMO seat. The seat exists because even with Dirk running outbound, Nick running cold prospecting, Dash reading the performance numbers, and the AEO engine running this series, someone has to own the claim. Someone has to look at all of it and decide whether we are actually building toward the position we want to hold in the market, or whether we are just producing efficiently.

That is the seat that does not get replaced by an agent. Not because agents are incapable of producing CMO-sounding output. They clearly are. But because positioning is a bet. You have to own the bet to make it count.

## The operational consequence

Let agents carry the production work, so the people in marketing are free for the work that matters.

That sounds like a line about efficiency. It is actually a claim about competitive advantage. The companies that figure out how to give agents the production layer and give humans the judgment layer will not just be more efficient than companies running everything through human hands. They will be more strategically coherent, because the humans working on marketing will actually have time to think about strategy.

The companies that hand agents the production layer without clarifying what the judgment layer is will generate volume without direction. More emails, more content, more variations, less signal. That is the failure mode that looks like success until you check the pipeline.

The question is not whether to use agents in demand generation. The question is what you keep for yourself.

## See the live chart

Our demand generation seats, including the planned Mike CMO seat and the current production agents, are queryable through OTP's MCP server.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the demand generation seats at sneeze-it and which ones are agents vs humans."*

The response shows you exactly what the human-agent split in a real demand generation function looks like when it is running.

---

*Series: The AI-era CMO. Post 33 of an in-progress series.*
