---
title: The agent will faithfully run your broken process at machine speed
date: 2026-06-21
author: David Steel
slug: reinvent-the-process-before-you-add-the-agent
type: founder_essay
status: published
series: ai-cio
series_part: 31
description: Why adding an AI agent to a flawed process makes things worse faster, and what reinventing the process first actually looks like in practice.
---

# The agent will faithfully run your broken process at machine speed

The most common mistake I see CIOs make with agents is not choosing the wrong tool or the wrong vendor. It is picking the right tool and pointing it at the wrong thing.

They take a process that is inefficient, redundant, or badly designed. They add an agent to it. The agent runs the process faster. The process is still broken, now at machine speed, with a bill attached.

Accenture put the principle bluntly in their AI operating model work: "Don't make inefficiency run efficiently." That is the failure mode this post is about.

## Why the instinct to automate first is almost always wrong

The instinct makes sense on the surface. You have a process. Agents automate. So you automate the process.

The problem is that most processes were designed around human constraints. Humans get tired. Humans can only hold so many threads at once. Humans forget. So processes were built with workarounds for those constraints: check-in meetings to catch what got dropped, approval gates to catch what got decided wrong, handoff documentation to catch what got lost in translation.

When you replace the human with an agent, the constraints disappear. The agent does not forget. It does not get tired. It can hold a hundred threads simultaneously. But the process still has the workarounds baked in, because nobody stopped to redesign it. The agent now runs three check-in meetings that exist only to compensate for human forgetfulness. It generates handoff documentation for handoffs that should not exist. It routes approvals through three people because that was the original insurance policy against one person making a bad call alone.

You have not automated work. You have automated bureaucracy.

## The four failure modes (and what they actually look like)

Over the last two years I have built, retired, and redesigned more processes at Sneeze It than I care to count. Here are the failure modes I have hit, each of them expensive.

**Failure Mode 1: The agent inherits the wrong metric.**

The clearest version of this happened early in our buildout. We had a process for tracking client communications. The process was designed to make sure nothing fell through the cracks, so every communication got logged, and humans spent time logging it. We handed the logging process to an agent.

The agent logged everything. The metric (log completion rate) looked perfect. What we discovered six weeks later was that the metric was not connected to what we actually cared about: whether clients were getting timely responses. We had automated log-keeping. We had not automated or even measured client responsiveness.

The process needed to be redesigned around response time, not log rate. Then the agent should have been assigned. We did it in the wrong order.

**Failure Mode 2: The agent runs a handoff that should not exist.**

When Radar, our chief-of-staff agent, first started compiling our daily briefing, the process had Radar pulling data from five sources and then waiting for a human to synthesize and route the output. That handoff made sense when a human was pulling the data, because the human doing the pull was not the same human who knew what to do with it.

With Radar, the pull and the synthesis are the same operation. The handoff to a human intermediary was a legacy of the old process. Once we redesigned around Radar's actual capabilities (it can pull, synthesize, and route in a single pass), the briefing got faster and cleaner, and we eliminated a step that had existed only because humans run sequentially.

**Failure Mode 3: The agent enforces an approval gate that was insurance against a different failure.**

Every outbound sales email from Dirk, our sales agent, originally required manual review before going out. That gate was right when Dirk was new. But as Dirk's output proved consistent, the gate became a bottleneck without corresponding protection. The gate should have evolved into a spot-check. It did not, because nobody went back to ask what the gate was actually protecting against once the original risk was resolved.

**Failure Mode 4: The agent runs a process that should not exist at all.**

We had a weekly reconciliation step between Tally, our scorecard agent, and Dash, our analytics agent. It had existed since before either agent did, when a human was reconciling by hand. When we automated it, both agents ran the reconciliation and it looked fine. What we had not asked was whether the reconciliation itself was still necessary. Once we fixed the underlying data reliability issue, the reconciliation was checking for errors that no longer occurred. The agent made the waste invisible because it ran the step without complaining.

## What reinventing the process first actually requires

Reinventing the process before adding the agent is not a philosophical exercise. It is a specific set of questions.

What is this process actually supposed to produce? Not what does it produce today, but what business outcome is it supposed to drive? If the answer is not specific, the process is not ready for an agent.

What constraints exist because of human limitations? Check-in meetings, approval gates, logging steps, handoff documentation: which of these exist because people forget, get tired, or work sequentially? Those are candidates for elimination, not automation.

What metric will tell you this process is working? Not a runtime metric like tasks completed per hour, but a business-outcome metric. Arin, our call center manager agent, gets measured on appointment rate against a 30% target, not on Slack messages sent. Crystal, our project manager agent, gets measured on delivery risk flags raised and resolved, not on Accelo entries updated. The metric has to be outcome-level before the agent can be accountable for it.

## Why CIOs specifically are the right people to own this

The CIO is the right person to own process reinvention before agent deployment because the CIO sees both the technical capabilities and the business workflows. That view does not exist anywhere else in the C-suite.

CMU's CIDO certificate includes a dedicated module on enterprise agentic AI. Cornell explicitly teaches "rewiring jobs and workflows" before deployment. That is real progress. But what none of these programs teach is the operational layer: how to build a live system where each agent holds one seat, owns one outcome, and gets measured on one business metric in the same review where humans are measured. That discipline is not taught. It is built, slowly, through the kinds of failures I have described here.

Gartner, as reported by CIO.com, names "agent sprawl" as the new Shadow IT: agents deployed without coordination, without inventory, without lifecycle management. The sprawl does not start with bad agents. It starts with agents dropped into processes that were never redesigned to receive them.

## The operating principle that holds this together

The mission I am working toward at Sneeze It is simple to state and hard to execute: let agents carry the operational work, so people are free for the work that matters.

That only works if the agents are carrying the right work, which means the right work has to be defined before the agent exists. Bogdan, our COO, and Janine, our accounting lead, do not spend their time on work an agent can run. They spend it on work that requires human judgment, because we figured out what each seat should own before we assigned anything to an agent. Process first. Metric second. Agent third.

Deloitte's 2026 State of AI survey found that only 21% of enterprises have a mature governance model for agentic AI. The other 79% are mostly adding agents to existing processes and calling it transformation. They are making inefficiency run efficiently.

The CIO who earns the next decade builds a live chart where every human and agent holds a named seat, one seat one owner, on one scorecard. Not a framework. A running system.

## See the live chart

The Sneeze It org chart is queryable, including which agents own which seats and what outcome each seat is accountable for, so you can see what one-seat-one-owner looks like in practice.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the sneeze-it org chart and list the metric each agent seat is accountable for."*

What you get back is not a strategy document. It is a running system where each seat has an owner and each owner has a number. That is what process reinvention, done before the agent is added, actually produces.
