---
title: The line between agent work and human work is not where you think it is
date: 2026-06-21
author: David Steel
slug: what-it-work-agents-take-over-and-what-stays-human
type: founder_essay
status: published
series: ai-cio
series_part: 27
description: A decision tree for CIOs sorting IT work between agents and humans. The rule is not about complexity. It is about accountability.
---

# The line between agent work and human work is not where you think it is

Most CIOs draw the line in the wrong place.

They sort work by complexity. Routine tasks go to agents. Complex tasks stay with humans. Monitoring, alerting, ticket routing, report generation: agents. Architecture decisions, vendor negotiation, board communication: humans. That feels right. It is also incomplete, and the gap between "feels right" and "is complete" is where most agent programs quietly break down.

The real dividing line is not complexity. It is accountability.

Can the output of this work be traced back to a named seat that a human can hold accountable? If yes, the work can run on an agent. If no, it has to stay with a human until that accountability structure exists. Everything follows from this.

This post is a decision tree for sorting IT work between agents and humans, based on what we have learned running a hybrid org at Sneeze It, where roughly ten agents hold named seats on one chart alongside human teammates like Bogdan (our COO), Janine (accounting), and Kristen (creative). The logic is not theoretical. It is what we use every week.

## Branch one: does this work have a named seat?

The first question is not "can an agent do this?" An agent can produce a structured output for almost anything. The first question is: does this work have a named seat on the org chart, with a metric that measures whether the seat is doing its job?

If the work has no named seat, no metric, and no owner, no agent can run it well. There is no way to know whether the agent is doing it right. You have given the agent a job without defining the job. That is a human problem to solve before the routing question matters.

At Sneeze It, every seat on the chart has a name, a metric, and a target. Radar, our chief-of-staff agent, owns the daily briefing, measured by whether it lands before 8 AM and surfaces items that required action. Tally, our KPI agent, owns pushing scorecard values to the OTP chart, measured by coverage and freshness. Dash, our analytics agent, owns advertising performance across all client accounts. When a seat exists with a clear metric, proceed. When it does not, build that first.

## Branch two: can a non-expert verify the output?

Agents make errors. If the output is a number (emails sent, KPIs updated, appointments booked, accounts flagged), any attentive person can spot when it looks wrong. These seats run well on agents with minimal review.

If the output is a judgment call, the verification problem changes. When Dirk, our sales agent, drafts a reactivation sequence for a lapsed client, the error is not a wrong number. It is wrong tone, or wrong assumption about why the client left, or wrong timing for this industry. Catching that requires sales experience.

The routing rule: if a non-expert can verify the output, the seat can run fully on an agent. If verification requires domain expertise, the seat runs on an agent that drafts and a human who approves. The difference is how much human review the loop needs.

Gartner, as reported by CIO.com, estimated that approximately 40% of enterprise applications will feature task-specific AI agents by end of 2026, with organizations running roughly 50 or more agents. That is not a pilot. That is a fleet. And a fleet with no accountability structure is what Gartner also called the new Shadow IT.

## Branch three: does the work create external commitments?

Some work involves representing the organization to someone outside it. A vendor call. A client conversation. A board presentation. A regulatory filing.

This work is different from operational work not because it is more complex but because it creates obligations. When a person speaks to a vendor on behalf of a company, the company's word is behind what they say. When an agent does the same thing without an explicit accountability structure, that structure does not exist. The Deloitte State of AI in the Enterprise 2026 survey (n=3,235) found that only 21% of organizations have a mature governance model for agentic AI. That 79% gap is an accountability structure that has not been built yet.

The routing rule: agents cannot own external commitments. They can draft the email, prepare the filing, generate the slide. But the seat that signs off has to be a human seat. MIT CISR's research on digital colleagues puts it clearly: "human accountability will be non-negotiable." Not human involvement. Human accountability. The agent does the work. A human owns the answer.

## Branch four: does the work benefit from a correction loop?

Agents improve when corrections get captured and fed back. At Sneeze It, when an agent makes an error and a human corrects it, the correction goes into OTP as a learning, available the next time a similar situation comes up. The seat performs better over time.

This loop only works when the work is recurring and patterned. Arin, our call center coaching agent, reviews performance data daily. The patterns that produce strong appointment rates are learnable. Work that is too novel or too fast-changing for patterns to hold is harder to compound through a loop.

The routing rule: weight recurring, patterned work toward agents with an active learning loop. Weight one-off judgment work toward humans until the pattern becomes clear enough to transfer.

## The full tree, in one pass

Does the work have a named seat with a metric? If not, build that first.

Can a non-expert verify the output? If yes, the seat runs fully on an agent. If no, the agent drafts and a human approves.

Does the work create external commitments? If yes, a human seat owns the final output regardless of who does the upstream work.

Does the work benefit from a correction loop? If yes, build the loop and route to an agent. If not, weight toward human judgment until the pattern emerges.

None of these branches say no agents. They say where the human accountability has to sit.

## Advice is not an operating system

Gartner published a Six Steps to Manage AI Agent Sprawl framework in April 2026 (as reported by CIO.com): establish governance policies, build a centralized agent inventory, manage agent identity and lifecycle including retiring redundant agents, govern AI information, monitor and remediate agent behavior, balance governance with empowerment.

That is the right advice. But advice is not an operating system.

CMU, through its Heinz CIDO certificate and LEAAID program, gets closest among the business schools, covering agent architecture, deployment, governance, and assurance. But even CMU stops short of teaching how to run a fleet as a standing operating function: agents on a named chart with humans, a unified scorecard, agent retirement through a formal process (we retired Jeff, our first agent, in April through exactly that), agents coordinating without a human in the middle.

The decision tree in this post is how the routing decisions get made inside a running system. The goal is always the same: let agents carry the operational work, so people are free for the work that matters.

## See the live chart

Every seat described in this post is queryable from the OTP MCP: which run fully on agents, which require human approval, and which stay with humans entirely.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the Sneeze It org chart and identify which seats run fully on agents versus which require human approval."*

What comes back is the live chart, queryable by seat, metric, and accountability level. That is the difference between a framework for thinking about hybrid orgs and a running example of one.
