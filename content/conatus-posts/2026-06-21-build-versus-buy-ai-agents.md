---
title: The build-versus-buy question for AI agents is the wrong question
date: 2026-06-21
author: David Steel
slug: build-versus-buy-ai-agents
type: founder_essay
status: published
series: ai-cio
series_part: 46
description: Every CIO is asking whether to build or buy AI agents. The harder question is whether you can govern what you already have, regardless of where it came from.
---

# The build-versus-buy question for AI agents is the wrong question

Every CIO I talk to frames it the same way. Do we build agents in-house, or do we buy them from a vendor? It feels like the right strategic question. It has budget implications, talent implications, roadmap implications.

It is also the wrong question.

The question that actually determines whether you get value from AI agents is simpler and harder. Can you govern what you run? Do you know who owns each agent, what it is supposed to produce, how you measure it, and what happens when it drifts? Build-versus-buy is a sourcing question. Governance is an operating question. And right now, in most enterprises, governance is losing badly regardless of where the agents came from.

The Deloitte State of AI in the Enterprise 2026 survey of 3,235 organizations found that only 21% have a mature governance model for agentic AI. Which means roughly 80% of companies are acquiring agents (built or bought) faster than they are building any system to run them. That is not a sourcing problem. That is an operating problem.

## What the sourcing question actually gets you

The build-versus-buy decision matters. I am not dismissing it. Building gives you control over architecture, data, cost, and the ability to put the agent on your own chart exactly where you need it. Buying gives you speed, vendor support, and a product team that has already solved problems you do not want to solve yourself.

What the decision does not give you: a governance structure. A scorecard. A single named owner for the seat. A mechanism to detect when the agent drifts. A retirement path when the agent stops serving its purpose. You get those things from operating discipline, not from the vendor relationship or the code repository.

Gartner, as reported by CIO.com, named this in April 2026 with a "Six Steps to Manage AI Agent Sprawl" framework. Step two is a centralized agent inventory. Step three is agent identity, permissions, and lifecycle, including retiring redundant agents. The framework is solid. But a framework is advice. The question is whether you have a running system that implements it.

Most CIOs do not yet.

## The Sneeze It answer, which is both

At Sneeze It, my marketing agency, we run an agent fleet of roughly ten seats. Some we built. Some we use as-is or configured from off-the-shelf components. All of them are on the same chart.

Radar, our chief of staff agent, came from Claude Code with heavy customization. We built the role, the tooling, the briefing logic, and the accountability structure. It would not exist in vendor form. Radar scans Slack, calendar, and pipeline each morning, compiles a briefing, and writes it to Obsidian. The briefing includes whatever is on fire and what can wait.

Dash, our analytics agent, reads Meta Ads, Google Ads, and call-center data from a Google Sheet. Heavily built. No vendor ships "monitor every managed advertising account and flag spend anomalies against seven-day and thirty-day baselines."

Pepper, our email triage agent, runs inside a Gmail environment. Closer to configured-from-existing tooling than built from scratch, but the triage logic, the client domain whitelist, and the voice rules are all ours.

Crystal, our project manager, wraps the Accelo MCP server. The coordination protocol is ours. The underlying data platform is theirs.

Tally pushes KPI values to our OTP scorecard four times a day, pulling from local sources and writing structured numbers. One agent, one job, one owner.

On the human side, Bogdan is our COO. Janine runs accounting. Kristen runs creative.

Every one of these seats, human and agent, holds the same kind of accountability on the same chart. One seat, one owner, one metric set, one scorecard. The chart does not care whether the seat is a person or a process. It cares whether the seat has a clear role and whether someone is watching the number.

That discipline is not a build decision or a buy decision. It is an operating decision.

## What happens when you skip the operating layer

In the first year of running agents at Sneeze It, I made the mistake that most operators make. I built an agent, confirmed it was technically working, and moved on. The agent produced metrics. The metrics looked fine. The business outcome the agent was supposed to affect did not change.

The problem was not the agent. The problem was that nobody was watching the seat the way you watch a human seat. There was no row on the scorecard. There was no weekly conversation about whether the number was where it needed to be. There was no named owner who would be asked on Monday morning to explain a gap.

Jeff, our former data-integrity agent, is the clearest illustration of this. Jeff ran for months. When I finally ran a formal seat review, it turned out Jeff's core missions had migrated to Dash, Dirk, and Crystal without anyone formally closing the seat. Jeff was still running. Jeff was producing output. Jeff was not connected to anything the company needed that was not already covered. We held a retirement hearing, redistributed the capabilities, and closed the seat.

The retirement was the right outcome. The harder lesson was that we had been running a seat for months past its useful life because we had not built the habit of asking: does this seat still serve its purpose?

That habit is what governance means in practice. It is not a policy document. It is a recurring conversation, on a regular cadence, about whether each seat on the chart is earning its row.

## What the sourcing decision actually comes down to

Given all of that, here is how I actually think about build versus buy for a specific agent seat.

Build when the work is genuinely specific to your operation and no vendor product matches the seat closely enough to be useful. Dash is a build because our account structure, our client mix, and our alert logic are not something any off-the-shelf analytics agent knows. The agent needs to carry organizational knowledge that lives in our context, not in a product.

Buy or configure when the underlying capability is generic and the seat definition is the value. A project management agent that wraps an existing project tool, a scheduling agent that integrates with an existing calendar, an email triage agent that knows your client list. The seat definition is yours. The execution layer can be theirs.

Do not build when what you are really doing is delaying governance. This is the trap. "We need to build it ourselves to have enough control to govern it properly" is sometimes true and often an excuse to postpone the harder work of deciding what this agent is accountable for.

The sourcing question is worth maybe 20% of your thinking. The seat definition, the ownership, the metric, and the review cadence are worth the other 80%.

## Where the schools and advisors leave a gap

CMU's Heinz College comes closest to teaching this honestly. Their LEAAID certificate covers agentic AI foundations, deployment at scale, governance, and assurance, and they include a hands-on build lab. That is the deepest agent-fluency program I have found in any business school curriculum.

But even CMU tops out at "build and govern one agentic capability." The fleet-as-operating-function layer, running twenty seats under a unified chart with weekly accountability reviews, agent-to-agent coordination via a message bus, a retirement protocol when a seat stops serving its purpose, is not taught anywhere I have found.

The advisory side, Gartner naming agent sprawl, Deloitte measuring governance maturity at 21%, MIT CISR researching decision rights for autonomous agents, has described the problem accurately. What they cannot offer is a running system. They offer frameworks. The framework tells you what to do. The operating system is what you do it on.

That is the gap OTP fills. Not advice about governing agents. A live chart where every seat, human and agent, holds a named role with one owner, shows up on one scorecard, and participates in the same weekly accountability rhythm.

The mission is to let agents carry the operational work so that people are free for the work that matters. That mission is not achievable through sourcing. It is achievable through operating discipline. Build or buy. Govern either way.

## See the live chart

From any MCP client with OTP connected, you can query the current Sneeze It seat roster and see which roles are filled by agents, which are filled by humans, and what each seat owns.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the Sneeze It org chart and identify which seats are agents, which are humans, and what metric each seat is accountable for."*

The response shows a working fleet, not a theoretical one, and the seat definitions are what make the sourcing decision answerable.
