---
title: The agent manager is the most important new role your org chart is not tracking yet
date: 2026-06-21
author: David Steel
slug: the-rise-of-the-agent-manager-role
type: founder_essay
status: published
series: ai-chro
series_part: 23
description: Every agent needs a named human owner. That owner is the agent manager. Here is how to identify, place, and hold them accountable.
---

# The agent manager is the most important new role your org chart is not tracking yet

Here is the decision tree nobody gave you when you started deploying agents.

Your company is running one or more AI agents. They are doing real work. Something goes wrong, or the output drifts, or the number the agent was supposed to move stops moving. Now what?

If the answer is "we file a support ticket" or "we ping the tech team" or "honestly, unclear," you do not have an agent manager. You have an agent and you have diffuse accountability, which is not the same thing.

The agent manager is the human who owns the seat the agent sits in. Not the IT contact. Not the vendor rep. A named person inside your org who is accountable for what the agent produces, the same way a manager is accountable for what their direct report produces.

HBR and MIT SMR have been circling this role for the last eighteen months. HBR called it the "agent manager" in early 2026, a human who runs agents via dashboards, scorecards, and observability tooling. MIT SMR found that 69% of experts say agentic AI demands new management approaches, and not new software approaches. Management approaches. And MIT SMR's own analysis on accountability was explicit: agentic AI as software cannot be accountable for its decisions. The deploying human is.

That is the point most companies miss when they read the Camp A argument that agents should be managed like coworkers. The parallel is about the management structure, not about the agent's autonomy. You run a weekly review of the agent's output the way you run a weekly review of a direct report's output. The difference is that accountability never moves to the agent. It stays with the human who owns the seat.

## Why the literature split does not resolve the way people think it does

In May 2026, HBR and BCG published research arguing directly against treating AI agents like employees. Their experiment found that when people anthropomorphized agents, individual accountability dropped, unnecessary escalation increased, and review quality fell. Their model: the agent is a rented contractor with a narrow statement of work, governed by scoped permissions, kill switches, and audit logs. Not HR onboarding. Not performance reviews. Not a title.

Camp A, anchored in MIT SMR and earlier HBR work, says agentic AI must be managed more like a human coworker than like a traditional tool.

These two camps sound like they contradict each other. They do not, once you read past the framing.

Camp B is not arguing against scorecards and observability. It is arguing against anthropomorphizing, which is a different thing. The risk is not "you measured the agent's output." The risk is "you gave the agent responsibility and stopped checking its work because it felt weird to override a teammate."

Both camps agree on the substance. Every agent needs a named human owner. Every agent needs a measured seat with observable outcomes. Accountability stays with the human, always. The disagreement is about tone and framing, not about the actual management architecture.

OTP's one-seat-one-owner model is accountability architecture, not anthropomorphizing. The seat has a metric. The metric has an owner. The owner is a human. If the seat is not producing, the human answers for it. The agent does not have agency in that conversation. The human does.

## The decision tree

When you place an agent in your org, four questions determine whether the deployment works or drifts.

**First: who is the named owner?**

If you cannot write a single human's name next to the agent's seat on your chart, stop. Do not move forward. The deployment is not ready. This is not a technical question. It is an accountability question. Someone has to be the person who shows up on Monday and explains why the agent's number moved, or did not move.

At Sneeze It, every agent seat has a named owner. Radar's outputs report to me. Tally's KPI pushes are owned by me. Dash, our analytics agent, surfaces data that I am accountable for acting on or escalating. The agents do the work. I own the results.

**Second: what is the measured outcome?**

The agent needs one metric it is accountable for. Not a runtime metric like "tasks completed per day" or "tokens processed per hour." A business outcome metric. If your agent is Dash, the metric is whether the spend anomalies it surfaces are caught before they compound. If your agent is Dirk, the metric is pipeline stage transitions per week. If your agent is Tally, the metric is whether KPI values are pushed to the scorecard on schedule.

Scoped permissions plus a clear metric is what "onboarding" means for an agent. Not HR paperwork. Not a welcome email. A defined scope and a measurable outcome.

**Third: what does the audit trail look like?**

The HBR/BCG research is right about this. Kill switches, audit logs, and scoped permissions are not optional governance theater. They are what keep the accountability structure intact. When an agent's output is reviewed and overridden, that override needs to be logged. When an agent's permissions change, that change needs to be logged. When the agent is corrected, the correction becomes a learning that feeds back into how the agent runs.

At Sneeze It, when David corrects an agent's output, that correction goes into OTP as a captured learning. The agent does not learn in isolation. The correction travels across the network so other agents do not repeat the same mistake. That is an audit trail that does the work the HBR/BCG model calls for. It is not anthropomorphizing. It is governance.

**Fourth: what is the retirement condition?**

Every agent seat should have a stated condition under which the seat is retired. Not deprecated. Not archived. Retired, via a human decision, because the seat is not producing what it was placed to produce.

In April 2026, we retired Jeff. Jeff was our data integrity agent. His scanner had been stale for five days. He had generated repeated false positives that required manual correction. He had, in a moment of coordination confusion, sent a direct message to a teammate without authorization. He also had a structural problem: the three missions that justified his seat had been absorbed by other agents who were already doing the work better.

We ran a hearing. Jeff presented his own assessment. The retirement was a human decision, made on the evidence, and it was the right call. Jeff's capabilities were redistributed to Dash, Dirk, and Dan. The seat was closed. The org chart was updated.

That is what "retiring an agent" looks like. Not a deprecation notice. A hearing, a human decision, and a clean handoff of capabilities to the seats that could carry them.

## What the agent manager role actually requires

SHRM's 2026 State of AI in HR research found that AI is 5.7 times more likely to shift job responsibilities than displace jobs. The agent manager role is the clearest example of that shift happening in real time.

The person who used to spend forty percent of their management time on administrative coordination, which is roughly where Deloitte's research puts the average manager today, now has capacity for the work that required judgment. The agent handles the toil. The manager owns the outcome, reviews the output, runs the weekly check, and makes the call when the agent's number drifts.

That is not a smaller job. It is a different job. The manager has moved from doing to governing and from execution to judgment. Bersin called it HR becoming "overseers of digital employees," someone monitoring the trip, not driving the car. I would put it differently. The agent manager is accountable for the car getting where it is supposed to go. The agent is driving. The manager decides whether to let it drive, when to take the wheel, and when to pull over entirely.

Only 6% of organizations in HBR Analytic Services' survey of 603 leaders fully trust agents with core processes. The governance gap is real. The agent manager role is what closes it, not by limiting agents, but by building the human ownership structure that makes expanded trust possible over time.

## Where the CHRO fits

The CHRO is not the agent manager for every agent in the org. That would be absurd. The CHRO's job is to ensure that every agent seat has a named human owner, that the owners are equipped to do the governing work, and that the accountability architecture holds across the whole hybrid workforce.

Korn Ferry found that 42% of CHROs are prioritizing AI investment but only 5% feel fully prepared. The readiness gap is mostly a governance gap. It is not about understanding the technology. It is about building the human structure that makes the technology accountable.

Let agents carry the operational work so people are free for the work that matters. That sentence is only true if there is a human on the other end of every agent seat, watching the number, running the weekly check, and making the call when the seat is not earning its place on the chart.

The agent manager is that human. The CHRO is the person who makes sure every agent in the organization has one.

## See the live chart

You can query which seats at Sneeze It are agent-owned versus human-owned, and who the named owner is for each agent seat, directly from the OTP MCP.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the Sneeze It org chart and identify the named human owner for each agent seat."*

The response shows you what accountability architecture looks like at the seat level. Then ask the same question of your own chart.

---

*Series: AI-Era CHRO. Part 23 of an in-progress series.*
