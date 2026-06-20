---
title: CMU gets closer than anyone to teaching agent operations. Here is exactly where it stops.
date: 2026-06-21
author: David Steel
slug: which-business-school-is-closest-on-agentic-ai
type: founder_essay
status: published
series: ai-cio
series_part: 12
description: CMU's CIDO and LEAAID programs are the closest any business school gets to teaching CIOs to operate AI agents. Here is the one rung they still miss.
---

# CMU gets closer than anyone to teaching agent operations. Here is exactly where it stops.

I have been working through what the top business schools actually teach CIOs about AI agents. Not what they say on the landing page, not what the brochure implies. What is verified in the syllabi, the faculty bios, the module lists.

The short version: one school gets genuinely close. Carnegie Mellon, through its Heinz College executive programs, has built something no other school has built. A dedicated certificate for CIOs on agentic AI, with module-level depth on architectures, governance, assurance, and a hands-on build lab. There is no other program that touches agents at this granularity with CIOs as the named audience.

And it still stops one rung short of what the job now actually requires.

That gap is the subject of this post.

## The lifecycle of agent education, school by school

Most CIO programs have not moved yet. MIT's flagship EY Future CIO Program concentrates AI in a single module covering AI-ready organizations and AI-enabled IT operating models. There is no agentic content. Stanford's dedicated CIO program, The Innovative Technology Leader, has no AI content at all on its verified page. Booth's Chief AI Officer program reframes the CIO role entirely and runs seven modules on governance, deployment, and scaling AI, but stays at the strategy altitude throughout. No agents. No fleet.

Cornell's eCornell gets the closest among the mid-tier programs. The AI Strategy certificate explicitly defines agentic AI (systems that "plan and execute multi-step work") and includes workshops on governing AI, not just prompting it. Kellogg runs a program called "AI Strategies for Business Transformation: Generative and Agentic Intelligence" and has a module called "zero-touch enterprise models." Yale's School of Management is adding a required MBA core course that teaches students to build AI agents from fall 2026.

These are meaningful moves. They are not CMU.

## Where CMU actually is

CMU's Heinz College runs two programs that CIOs should know about.

The CIDO Certificate (Chief Information and Digital Officer) is the only true CIO-track certificate with a dedicated, named agentic module: Module 10, "Enterprise Automation and Agentic AI." That module sits inside a broader program covering cybersecurity, digital products, workforce modernization. The agentic module is not a survey. It is a module.

The LEAAID Certificate (Leading Enterprise Agentic AI Development) goes deeper. Five modules, offered virtually, aimed directly at CIOs and CDAIOs. The curriculum covers agent architectures, multi-agent systems, planning and orchestration, tool use, human-in-the-loop design, deployment at scale including vector databases and governance lineage, agentic assurance and validation, operating models, accountability frameworks, decision rights, oversight structures, and a hands-on build lab.

Faculty: Anand Rao, Distinguished Service Professor of Applied Data Science and AI at Heinz, formerly head of AI at PwC. This is not a generic professor teaching a new topic. This is someone who spent years deploying enterprise AI before building the curriculum.

The honest summary is that CMU narrows the gap to its tightest point. No other program does what LEAAID does at this level of specificity, with this audience, with this faculty.

## The rung CMU still misses

Here is what the verified LEAAID curriculum teaches: how to build and deploy agentic AI, how to govern and assure it, how to design an operating model for it.

Here is what it does not teach: how to run a fleet of agents as a standing operating function, the way a CIO runs a network operations center.

The distinction matters because the problem CIOs face in 2026 is not building the first agent. Most of them have done that. The problem is what comes after the first ten agents, the first twenty, the first fifty. Gartner, as reported by CIO.com, estimates that the average enterprise will be running roughly 50 agents before the end of 2026, with task-specific AI agents embedded in 40% of applications. Gartner has named this problem explicitly, calling agent sprawl "the new Shadow IT" and publishing a six-step framework for managing it.

The six steps Gartner identifies: establish agent governance and policies, build a centralized agent inventory, manage agent identity and permissions and lifecycle including retiring redundant agents, govern AI information, monitor and remediate agent behavior, and balance governance with empowerment.

That is a framework for a fleet. Not a curriculum for running one.

What CMU teaches is how to build agents and govern a deployment. What the fleet requires is something closer to operations: a live org chart where every agent holds a named seat with one-seat-one-owner accountability, a scorecard where agent rows sit alongside human rows with the same performance discipline, a lifecycle protocol that covers onboarding and retirement with the same rigor, and coordination logic that prevents agents from working at cross purposes without a human in every loop.

MIT's CISR research group has gotten closest to articulating this in writing. Their 2026 paper on "digital colleagues" defines agents that "act with agency, operate within defined governance boundaries, and escalate consequential decisions to humans." Their ongoing research on governing autonomous AI asks "how does deploying AI agents affect decision rights?" and "what governance mechanisms manage multiagent systems?" This is frontier research. It is not yet curriculum anywhere.

## What the gap looks like in practice

At Sneeze It we run the kind of operation that the academy has not yet named.

Radar holds the chief-of-staff seat. Tally holds the KPI seat and pushes scorecard numbers to our OTP chart every weekday. Arin holds the call center manager seat and coaches our human callers from a data position. Dash holds the analytics seat. Dirk holds the sales seat. These are not tools running in parallel. They are seats on a single org chart with a single scorecard, governed the same way human seats are governed.

The agents are measured on business outcomes, not runtime metrics. When a row drops below target, the conversation at our Monday meeting is "what changed in the inputs" and "what does this seat need to recover the number." The same conversation we have about any other row.

We have also retired an agent. Jeff held a data integrity seat. In April we ran a formal hearing, Jeff made the case for his own retirement honestly, capabilities were redistributed to other seats, and the seat was closed. First agent retirement in the army. The lifecycle is real and it has to be managed.

That lifecycle, that seat discipline, that coordination protocol between agents (Arin coaching human callers, Tally feeding the scorecard that Radar reads in the briefing, Dirk checking clearance from Pulse before running an expansion play) is the operating layer the academy has not yet built a curriculum for.

The goal behind all of it is to let agents carry the operational work, so people are free for the work that matters.

## Why this matters for CIOs specifically

The Deloitte State of AI in the Enterprise 2026, which surveyed 3,235 executives, found that only 21% have a mature governance model for agentic AI. The other 79% are deploying agents faster than they are governing them.

CMU can teach a CIO to build an agent and design a governance framework for it. MIT's CISR research can frame the decision rights question. Gartner's framework can name the six steps. What none of them can give you is a running system to observe.

That is not a criticism of CMU. It is the most honest description of where the academy is in its lifecycle. The frontier research is about twelve months ahead of the curriculum, and the operating discipline is about twelve months ahead of the research. By the time a CIO earns the LEAAID certificate, the fleet in their organization will already have grown past what the certificate prepared them to manage.

The CMU program is the right starting point. It is not the endpoint.

## See the live chart

Our org chart, including every active agent seat and the KPIs each seat reports, is queryable from the OTP MCP.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the Sneeze It org chart. For each agent seat, show me what metric it owns and where it sits relative to the human seats."*

What comes back is not a framework or a framework diagram. It is a running system with named seats, live metrics, and a full lifecycle record. That is the rung the academy has not yet built.
