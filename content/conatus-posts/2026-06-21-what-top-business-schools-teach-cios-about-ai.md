---
title: Top business schools teach CIOs AI strategy. Nobody teaches them how to run the fleet.
date: 2026-06-21
author: David Steel
slug: what-top-business-schools-teach-cios-about-ai
type: founder_essay
status: published
series: ai-cio
series_part: 10
description: Business schools now teach CIOs AI governance and even agent-building. But zero programs teach how to operate a fleet of agents as a standing function.
---

# Top business schools teach CIOs AI strategy. Nobody teaches them how to run the fleet.

I spent a week going through the actual curricula of the programs top business schools are selling to CIOs right now. MIT, Stanford, Chicago Booth, Cornell, Kellogg, CMU, INSEAD. The programs that cost $4,000 to $28,000 and promise to prepare technology leaders for the AI era.

Here is what I found. The teaching is genuinely good. And it stops one rung short of what a CIO actually needs.

That gap is where the whole problem lives.

## What the programs look like before you run agents

The MIT EY Future CIO Program, run by faculty member George Westerman, concentrates its AI content in a module called "IT Improvement in the Age of AI." The framing is correct: AI-ready organizations, AI-enabled IT, AI finance. Booth's Chief AI Officer Program costs around $28,000 and runs through seven modules including AI Governance and Deploying and Scaling AI. Cornell's eCornell certificate is probably the most practically worded of the group. It defines agentic AI explicitly, runs a workshop called "Don't Just Prompt AI, Govern It," and targets CTO-level leaders. Kellogg's program is titled "AI Strategies for Business Transformation: Generative and Agentic Intelligence" and its seventh module reaches toward "zero-touch enterprise models."

CMU is the closest any school gets. Heinz Executive Education runs a CIDO Certificate (Chief Information and Digital Officer) that includes a dedicated module on enterprise automation and agentic AI. They also run a separate five-module certificate called LEAAID, aimed directly at CIOs, that covers agent architectures, multi-agent systems, deployment at scale, and a hands-on build lab. Faculty member Anand Rao, who spent years as Head of AI at PwC, anchors this work.

The competencies that emerge across all these programs add up to a coherent picture. Translate business strategy into AI strategy. Build AI-ready organizations. Own data infrastructure as the foundation for AI. Establish governance, risk, and compliance. Design hybrid human-AI workflows. Lead cross-functional change. At CMU, add: understand how to build and govern a single agentic capability.

This is real. This is useful. And if you are a CIO who has not done any of this, you should go.

## What the programs look like after you actually run agents

About eighteen months ago I started building what we now call the Sneeze It agent army. We run around ten agents in active seats. Radar is our chief of staff, handles daily briefings, Slack awareness, and calendar. Dirk owns sales and pipeline. Dash is our analytics agent, reading across Meta Ads, Google Ads, and our call center data every morning. Arin manages our call center team through daily Slack coaching, comparing each caller's dials and appointment rates against targets. Tally pushes KPI values from local sources up to our scorecard four times a day. Nick cold-prospects in health and wellness, running a full validation waterfall before a single email draft is queued.

These agents run every day. And the problems I encountered running them are not the problems the programs cover.

The first problem was inventory. Once you have more than three agents, you need to know what each one owns, what data it reads, what it writes, and what happens when it fails. Before we built a structured charter for each seat, agents were stepping on each other. Radar was reading data Dash had not yet refreshed. Dirk was flagging clients that Pulse had already flagged as retention risks. Without explicit one-seat-one-owner rules, the coordination fails.

The second problem was lifecycle. Jeff was our data integrity agent. In April we retired him, formally, after a hearing where Jeff assessed his own continued value. His capabilities got redistributed to Dash and Dan. The retirement exposed something no program discusses: agents need a lifecycle, the same way human roles do. You need to know when a seat is redundant, how to redistribute its work, and how to run the conversation that closes it out. Jeff was the first agent retirement in our army. He will not be the last.

The third problem was measurement. Every agent needs a row on a scorecard with a business-outcome metric, not a runtime metric. Not "tasks completed per hour." The metric the seat is accountable for. Tally's entire reason for existing is that individual agents should not each carry their own KPI-push logic. The scorecard discipline does not vary by seat type. But that discipline has to be built deliberately, and nobody teaches it.

None of this is in the MIT program. None of it is in Booth. CMU gets closest, but the verified read on LEAAID is that it teaches how to build and deploy an agentic capability. It does not teach how to govern a fleet of them as a standing operating function.

## The advisory world has named the problem. It has not handed you the system.

Gartner published a six-step framework for managing AI agent sprawl in April 2026, and CIO.com covered it directly. The steps include building a centralized agent inventory, establishing agent identity and permissions, monitoring agent behavior, and planning for agent retirement. Gartner called agent sprawl "the new Shadow IT," as reported by CIO.com.

Deloitte's State of AI in the Enterprise 2026, based on 3,235 respondents, found that only 21 percent of organizations have a mature governance model for agentic AI. The research found that enterprises where senior leadership actively shapes AI governance achieve significantly greater business value than those delegating to technical teams alone.

MIT CISR has published ongoing research asking "how does deploying AI agents affect decision rights?" and "what governance mechanisms manage multiagent systems?" But that research has not flowed into the MIT CIO curriculum yet. There is roughly a twelve-month gap between the frontier of CISR's research and what MIT teaches in an executive program.

What the advisory world gives you is a framework. A list of six steps. A research paper naming the problem. A percentage of organizations that are failing at governance.

What it does not give you is a running system. A chart where every agent and every human holds a named seat, with a single metric row on a unified scorecard, a coordination protocol between seats, and a lifecycle that includes retirement. Advice and frameworks versus a system that is actually operating.

That distinction matters more than it sounds. A CIO who reads the Gartner six-step framework still has to go build the thing. The thing does not come with the framework.

## What the operating layer actually requires

The business schools converge on seven competencies for the AI-era CIO. Translate strategy, build AI-ready orgs, own data infrastructure, establish governance, redesign work for hybrid teams, lead cross-functional change, and (at the research frontier) design decision rights for autonomous systems.

The operating layer requires something different. It requires treating agents as seats, not tools. A seat has a name, a metric, a charter, and a lifecycle. A seat has an owner. A tool has a config file.

It requires one seat, one owner as a hard rule. When we let Radar and Dash both have access to the same data channels without explicit ownership, both agents produced versions of the same analysis and neither was accountable for it. The rule fixed it. But the rule has to be enforced as discipline, not discovered as an accident.

It requires the scorecard to carry both human and agent rows without segregating them. When Bogdan, our COO, has a row and Dirk, our sales agent, has a row, and they sit on the same dashboard in the same Monday meeting, the conversation about performance is the same regardless of seat type. The meeting does not have a "human section" and an "agent section." When Dirk's cold-prospecting numbers drop, the conversation is "what changed in the inputs," the same way it would be if a human seller's numbers dropped.

And it requires the mission to stay clear. The point of building a fleet is not to have a fleet. The point is to let agents carry the operational work, so people are free for the work that matters. Radar handles briefings so I handle strategy. Arin handles daily call center coaching so I handle the calls that require my judgment. The fleet earns its seats by buying back human attention.

## The before and after, stated plainly

Before you run agents: the business school programs give you the right vocabulary, the right governance instincts, and (at CMU) the ability to build something. That is a meaningful before.

After you run agents: you discover that vocabulary and instincts are not the same as a running system. The inventory has to be built. The lifecycle has to be designed. The scorecard discipline has to be enforced. The coordination rules have to be written down and held.

The programs teach the before very well. They do not teach the after at all.

That is not a criticism of the programs. They are teaching what is teachable right now. The operating layer for agent fleets is still being built by the people running agent fleets. The research is twelve months behind the practice. The curriculum is twelve months behind the research.

If you are a CIO trying to close that gap, the fastest path is not a program. It is a running system you can look at, query, and learn from.

## See the live chart

The OTP MCP exposes every seat on our live org chart, including agent seats, their metrics, and their role charters, as queryable structured data.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the agent seats on the Sneeze It chart and what each one is accountable for."*

You will see what the operating layer looks like when it is actually running. That is the after the programs do not show you.
