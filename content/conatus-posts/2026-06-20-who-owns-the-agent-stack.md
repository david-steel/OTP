---
title: The CIO owns the infrastructure. The business unit owns the agent.
date: 2026-06-20
author: David Steel
slug: who-owns-the-agent-stack
type: founder_essay
status: published
series: ai-cio
series_part: 3
description: Giving agents to the CIO creates compliant, unused infrastructure. Giving them to the business unit creates accountability. Here is why ownership determines outcomes.
---

# The CIO owns the infrastructure. The business unit owns the agent.

The question I keep getting from operators is: who should own the agent stack? IT? The CIO? A centralized AI team? Some new function that reports to the CEO?

The answer is simpler than any of those options, and it is not a political answer. It is a structural one.

The CIO owns the model access, the security policy, the integration layer, and the evaluation framework. That is infrastructure. Every business unit that builds on it needs that infrastructure to be reliable and governed.

But the agent itself, the seat on the chart, the thing doing work and reporting numbers every Monday, has to be owned by the function it serves. Not the function that built it. The function that depends on it.

Here is why that distinction matters, and what happens when you get it wrong.

## The ownership question is really an accountability question

When a human is on your org chart, there is no ambiguity about who owns that seat. The VP of Sales owns the sales team. The CFO owns the finance function. Each seat reports to someone. Each seat has a clear set of outcomes it is accountable for. When the number drops, the conversation happens in the right room.

Agents do not automatically inherit that structure. The default, when a company first deploys an agent, is that the agent reports to whoever built it. Usually IT. Usually the team that set up the API keys and the automation.

That is exactly the wrong place for it to report.

At Sneeze It, Dirk is our sales agent. He handles pipeline scanning, reactivation outreach, and deal velocity. The work Dirk does is sales work. Not infrastructure work. Not IT work. Which means Dirk reports through the revenue function, not through a technology function. When Dirk's pipeline numbers are soft, that conversation happens in the same meeting where the rest of the revenue numbers are discussed. Dirk's seat-owner is accountable for the output the same way any sales manager would be accountable for a direct report's output.

If we had built Dirk and handed him to a centralized AI team, the accountability chain would have broken immediately. The AI team would optimize for uptime and response latency. The revenue function would have no row to point to and no conversation to surface when deals went stale. The agent would be technically excellent and operationally invisible.

## What centralized AI ownership actually produces

There is a reason centralized AI teams tend to produce demos and pilots that do not stick. It is not because the engineers are bad. It is because a team that does not own the business outcome has no reason to own the agent's output.

When a centralized team builds an agent for the finance function, the centralized team defines success as deployment. Finance defines success as better numbers. Those two definitions will diverge almost immediately, and nobody will notice for months, because the accountability gap between "we shipped it" and "the numbers moved" is wide enough to hide a lot of drift.

Bogdan, our COO, knows exactly what Crystal is accountable for. Crystal is our project management agent. She tracks active projects, flags delivery risk, and monitors deadline health across every client engagement. Bogdan reads the Crystal section of every daily briefing. When a project slips, Bogdan and Crystal's data are in the same conversation. Not because Bogdan is technical, but because Crystal's work product is Bogdan's domain.

If Crystal lived inside an IT function that Bogdan did not own, the signal chain would have three more steps and two more handoffs. By the time Bogdan heard about a slipping project, the client would already be frustrated.

The business unit has to own the agent because the business unit is the only entity that can close the loop between the agent's work and the business's outcome.

## The infrastructure question is separate, and it matters

None of this means the CIO is out of the picture. The opposite is true.

The CIO's job is to build the rails that make agent ownership at the business-unit level safe and practical. That means model access that is governed and audited. Integration patterns that do not require every function to reinvent the same connector. Security policies that hold regardless of which team is running the agent. Evaluation frameworks that let a non-technical owner know whether an agent is producing reliable output or hallucinating quietly.

Without that infrastructure, business-unit ownership is chaos. Every team runs its own API key. Every team builds its own logging. Nobody can answer the question "what is this agent actually doing" when something goes wrong. The CIO is the reason business-unit ownership can work at scale.

Tally, our scorecard agent, pushes KPI values from local source files to our OTP chart four times a day. Tally runs reliably because the infrastructure underneath her is reliable. The model access, the authentication, the logging, all of that is governed at the platform level. But the numbers Tally pushes, the targets she measures against, the seats she tracks, all of that is owned by the function those numbers belong to. Janine owns the financial rows. Dash owns the ad performance rows. The infrastructure is shared. The accountability is not.

That split is the working model.

## The practical test for whether you have it right

Here is a simple test. Pick any agent running in your organization right now. Ask two questions.

First: if this agent produces bad output for three weeks, who finds out first? If the answer is the team that built the agent rather than the team that depends on the agent, the accountability chain is broken. The agent is living in the infrastructure layer when it should be living in the business layer.

Second: if this agent's primary metric dropped by thirty percent next Monday, whose meeting would surface it? If the answer is nobody's, or if it would surface in a technical review meeting rather than a business operations meeting, the agent does not have a seat. It has a server.

At Sneeze It, Dash is our analytics agent. Dash runs the daily ad performance scan across every managed account. When Dash flags an anomaly, it lands in the briefing that David and the client team read first thing in the morning. Not in a logging dashboard that only the tech team monitors. The anomaly is business-facing because the agent is business-owned.

The agents that compound into real operating capacity are always the ones where the business unit feels the output directly, measures it weekly, and owns the conversation about improving it.

## How to fix the split if you already have it

If your organization already has a centralized AI team that "owns" the agents, the fix is not to disband the team. The fix is to clarify what ownership means for each layer.

The centralized team keeps ownership of the platform: model contracts, security, integration standards, evaluation tooling. That is the right place for those things to live.

Each agent gets transferred to the function it serves. That means the function gets the scorecard row for the agent, not just access to the agent. It means the function's leader answers for the agent's output in business reviews the same way they answer for a human direct report's output. It means the centralized team becomes a service provider and internal consultant rather than an accountability holder.

This transition feels uncomfortable at first because business-unit leaders often do not think of themselves as being accountable for AI output. That discomfort is exactly the right signal. It means the accountability is landing where it belongs.

The agents that carry real operational weight are the ones with a real seat, a real owner, and a real row on the Monday scorecard. Everything else is infrastructure waiting to be owned.

## See the live chart

The OTP MCP exposes every seat on the Sneeze It chart, including agent seats with their owners, functions, and accountability metadata.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the Sneeze It agent seats and which business function each one reports through."*

You will see exactly which agents live inside business functions and which are still floating in infrastructure. The contrast between a seated agent and an unowned one is the gap this post is describing.

---

*Series: AI CIO. Post 3 of an in-progress series.*
