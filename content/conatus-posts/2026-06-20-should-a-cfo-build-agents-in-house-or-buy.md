---
title: The CFO asking "build or buy" is asking the wrong question at the wrong time
date: 2026-06-20
author: David Steel
slug: should-a-cfo-build-agents-in-house-or-buy
type: founder_essay
status: published
series: ai-cfo
series_part: 32
description: The build-vs-buy frame fails CFOs because it treats agents as software, not as seats. Here is the lifecycle frame that actually helps.
---

# The CFO asking "build or buy" is asking the wrong question at the wrong time

Every CFO I talk to eventually gets to the same fork in the road.

They have watched agents work somewhere in the business. Something clicked. Now they want to formalize it, which means someone (usually the CFO) has to answer the procurement question: do we build agents in-house or do we buy them?

It is a reasonable question. It is also the wrong question, and asking it too early is how companies end up with either an expensive internal AI team producing things nobody uses, or a vendor contract for a "solution" that sits between their real data and their real work and does not actually connect to either.

The reason the question fails is that it treats agents as software. Software you evaluate against a requirements list, issue an RFP, build a spec for, then deploy. Agents are not software in that sense. Agents are seats. A seat has a role, a set of outputs, an accountability structure, and a relationship to the other seats around it. You do not evaluate a seat with a requirements list. You evaluate it against what the job actually needs at each phase of its life.

The lifecycle frame is what works. Build-or-buy is a single decision made once. Lifecycle is a series of decisions, made at the right moments, as you learn what the agent actually needs to do.

## Phase one: clarity before cost

The earliest mistake CFOs make is jumping to the procurement question before they have clarity on the seat.

At Sneeze It, I did not start by asking whether to build or buy our financial accountability work. I started by asking what that seat needed to produce. Janine, our accountant, tracks days payable outstanding, accounts receivable aging, and cash collected per week. She owns those numbers. Before I could decide whether to put an agent anywhere near that work, I had to understand what the seat was and where the operational drag was actually coming from.

The drag was not in Janine's analysis. It was in the data collection that fed the analysis. Getting numbers from Accelo, from our CRM, from our ad platforms, into a format Janine could actually use, was eating hours. That is where an agent made sense. Not "an agent to do finance" but a specific agent for a specific collection task feeding a specific seat.

Tally, the agent that now pushes KPI values from local sources to our OTP scorecard, started as exactly that kind of narrow task. It does not analyze. It does not advise. It reads sources and pushes numbers so that the humans who do advise (Janine, me, Bogdan as COO) spend their time on the actual analysis instead of the data plumbing.

Before you can make any procurement decision, you need that level of seat clarity. What job is being done. Where is the drag. What exactly would the agent output. If you cannot write that out in a sentence without using the word "intelligent" or "dynamic," you do not have enough clarity yet.

Phase one always ends the same way: with a specific job definition, not a vendor shortlist.

## Phase two: the real cost of building

Once you have seat clarity, building in-house feels like the obvious choice.

You control the data. You control the logic. You own the intellectual property. The CFO's instinct toward control is not wrong, exactly. It is just priced incorrectly.

I have built several agents in-house. The honest accounting goes like this. You spend the first few weeks building the scaffolding, not the agent. Authentication, data connectors, prompt design, output formatting, retry logic for when the model does something unexpected. Then you spend the next few weeks discovering all the edge cases the scaffolding does not handle. Then someone on your team has to own that scaffolding permanently, because it will break when the underlying model or API it connects to changes, and that happens more often than you think.

What you are actually buying when you build in-house is not the agent. It is the ongoing infrastructure commitment. For most companies, that commitment is not the best use of the people who would own it.

The question is not "build or buy" at this phase. The question is "what is the real carrying cost of maintaining this seat versus what it produces." If the seat produces a narrow, well-defined output that requires data only your systems hold, and your team has the capacity to own the infrastructure, building makes sense. If the seat needs to connect to multiple external systems and the maintenance load would pull your technical team away from higher-leverage work, you are pricing the build incorrectly when you only count the first implementation.

Dirk, our sales agent, was built in-house because the work it does (reading our CRM, scoring pipeline, drafting outreach in a specific voice) required deep integration with our specific GHL setup and required a voice calibrated to our exact offer and market. That work could not be bought from a vendor because the vendor would not have our data, our voice, or our market context. The build cost was justified by the specificity of the seat.

Tally was also built in-house, for a different reason. The task was simple enough that building it was cheaper than the integration overhead of buying a platform, connecting it to our systems, and maintaining that connection when the platform changes its API.

But the agents that read general market signals, or that handle patterns well-served by existing models, were not worth building from scratch. The seat might be specific. The underlying capability does not have to be.

## Phase three: what buy actually means

When you buy, you are not buying an agent. You are buying a capability, a data connection, and a maintenance contract.

The CFO should evaluate each of those three things separately.

The capability question is whether the vendor's agent actually does the job the seat requires. Not the demo version of the job. The actual job, with your actual data, connected to your actual systems. The gap between demo and production is where most bought agents fail. The agent looked great in the sandbox. It does not look great when it is reading your chart of accounts, your vendor names, and your one-off receivables structure.

The data connection question is where I would spend the most time. An agent that cannot reach your real data is not an agent for your finance function. It is a general-purpose chatbot with your logo on it. Before any procurement conversation goes past the demo, the question to ask is: where does the data come from, how does it stay current, and what happens when the data source changes.

The maintenance contract question is the one most CFOs underweight. When the vendor changes their model, updates their prompt logic, or changes their pricing, what does that mean for the seat you have been running on their platform. The vendor dependency is not just a budget line. It is an operational dependency. If the agent is load-bearing in your weekly close process and the vendor has a service interruption, what is the fallback.

Buying works best when the capability is general (the vendor's model does this well for most companies), the data connection is standard (the vendor connects to your systems natively), and the maintenance dependency is acceptable given the stakes of the seat.

## Phase four: the decision that compounds

Here is the lifecycle moment most operators miss. After you have built or bought an agent and it is running, the build-or-buy decision repeats.

Every agent I have running at Sneeze It has been modified, sometimes substantially, from its original form. Arin, the call center manager agent, has a very different set of operating rules today than it did at launch. Dash, the analytics agent, reads different sources and produces different formats than it did in version one. The agents that are most useful evolved through use. The ones that got locked in to their original spec (usually because buying meant you were dependent on the vendor's release cycle for changes) stayed useful only as long as the original spec matched what the work actually needed.

The compounding return from the right agent is not the first deployment. It is the tenth iteration after the seat owner and the agent have developed a working relationship. That iteration loop is faster when you build, and when you have a clear seat definition that does not require vendor approval to change.

This is the only sense in which I would push most operators toward building for the agents that are genuinely load-bearing. Not because building is inherently better. Because load-bearing seats need to evolve, and evolution requires a tight loop between the seat's work and the agent's logic.

The mission this all serves is straightforward: let agents carry the operational work so that the people doing the high-judgment work (Janine on receivables, Bogdan on operations, me on client relationships and sales) are actually free to do it. That mission requires agents that fit the work exactly. Fitting the work exactly requires iteration. Iteration requires control.

Buy the agents that do general work well. Build the agents that do your specific work, and plan for the tenth version, not just the first.

## See the live chart

The OTP MCP exposes the current seat structure at Sneeze It, including which agents are load-bearing and what outputs they own.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the agent seats at sneeze-it and what each one produces."*

You will see the specific output each seat owns. That is what seat clarity looks like before a build-or-buy decision gets made.
