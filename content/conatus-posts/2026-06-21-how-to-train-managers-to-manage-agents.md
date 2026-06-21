---
title: Managers who managed agents like employees made things worse. Here is what works instead.
date: 2026-06-21
author: David Steel
slug: how-to-train-managers-to-manage-agents
type: founder_essay
status: published
series: ai-chro
series_part: 22
description: The research split on managing AI agents reveals what training managers actually needs to cover. It is not about treating agents like people.
---

# Managers who managed agents like employees made things worse. Here is what works instead.

When I first started deploying agents at Sneeze It, I gave my managers no guidance on how to work with them. I assumed the right instincts would develop on their own, the same way people figure out how to use new software. They did develop instincts. Most of them were wrong.

The instinct that caused the most damage was the one that felt the most reasonable: treating the agents like junior employees.

My managers were applying human management patterns to non-human systems. When Radar missed something in a briefing, they asked Radar to "try harder." When Dirk's cold email count dropped, they wrote long explanations in the prompt about caring about quality, as if the agent had gotten lazy. When a new agent was deployed, they scheduled an onboarding meeting to explain the culture. The agents do not attend meetings. The agents do not have feelings about culture. The meetings produced no change in agent behavior.

The researchers who have studied this at scale found the same pattern. A large experiment documented in HBR in May 2026 by Kropp and colleagues at BCG found that when managers treated AI agents like employees, three things got worse: individual accountability dropped, unnecessary escalation increased, and review quality fell. The anthropomorphizing was not neutral. It actively degraded the work.

This is the thing the current literature gets right that most operator-trainers get wrong. The question is not "how do you help managers treat agents more like people." The question is "how do you help managers stop doing that, and do what actually works instead."

## What managers were trained to do, and why it does not translate

The management skills that work for humans are built on a set of assumptions that agents do not share.

A human direct report has context that accumulates. When you give a human corrective feedback on Tuesday, they carry it into Wednesday's work. When you explain the culture, they internalize it gradually. When a relationship develops trust, the human uses that trust to take initiative in the right direction. The whole framework of developing talent over time assumes an entity that learns socially and carries institutional memory between interactions.

Agents do not carry social context between interactions the same way. What an agent carries is configuration: the scope it was given, the metric it is accountable for, the brief it was handed, the guardrails it was assigned. When an agent performs badly, the diagnosis is almost never "this agent needs coaching." It is one of three things: the scope is unclear, the metric is wrong, or the brief is bad. None of those are fixed with a conversation about caring more.

MIT SMR's survey of agentic AI in September 2025 found that 69% of experts say agentic AI demands new management approaches. The number is striking, but the more important finding is why: because the old approaches do not transfer. The problem is not that managing agents is hard. The problem is that the hard part is the opposite of what managers have been trained to do.

What managers were trained to do is build relationships with people and use those relationships to improve performance over time. What managing agents requires is defining work precisely and then monitoring outcomes systematically. Those are fundamentally different skills and they develop through fundamentally different practice.

## The before state: what happens when you skip the training

Before I clarified what managing an agent actually meant, here is what my managers were doing.

They were giving agents vague briefs and assuming the agent would fill in the gaps with good judgment, the way a capable human hire might. The agents filled the gaps with the nearest available pattern, which was often wrong for the context.

They were assuming that if the agent's output was good enough, the metric was probably fine. They were not asking whether the metric the agent was being evaluated on was connected to an outcome the business actually cared about. Deloitte's 2025 Global Human Capital Trends report found that managers already spend about 40% of their time on administrative work versus 13% on people development. Most of that administrative load came from monitoring work that had no clear accountability owner. Adding agents without clear metrics made the monitoring problem worse, not better.

They were treating every agent output as final rather than treating it as a first pass that a human needed to review with judgment. HBR Analytic Services found in a December 2025 survey of 603 business leaders that only 6% fully trust agents with core processes, but 50% had agents piloting work without clear review protocols. The agents were running. The humans were not sure what to check.

They were not thinking about who owned the agent's seat. When Dash produced a number that looked wrong, nobody knew whether to adjust the brief, adjust the metric, or escalate. Accountability for the agent's output was diffuse because nobody had explicitly claimed it. The agent drifted. Quietly, for weeks.

## The after state: what the training actually changes

Training managers to manage agents is not a long program. It is a short, specific reorientation around four things that are different.

The first is ownership. Every agent seat has a named human owner. The owner is not responsible for building the agent or maintaining the infrastructure. The owner is responsible for the agent's output the way a manager is responsible for a direct report's output: they review it, they are accountable when it drops, and they are the person who makes changes when the work is not serving the business. At Sneeze It, when Arin produces a coaching message for the call center team, I am the person who approves it before it goes out. When Tally fails to push a KPI, the alert comes to me. The agent does the operational work. I own the seat. That relationship has to be explicit from the moment the agent is deployed, not inferred over time.

The second is scoped permission rather than broad latitude. The HBR and BCG research that documented the failure mode of anthropomorphizing also produced the clearest description of what works instead: treat the agent like a contractor with a narrow statement of work, governed by scoped permissions, audit logs, and a kill switch. The MIT SMR research confirmed that the deploying human, not the agent, is accountable for decisions. The accountability never moves to the agent. What moves to the agent is execution of a tightly defined task. Managers who understand this distinction stop giving agents open-ended direction and start writing precise briefs with explicit constraints.

The third is metric-first evaluation. Before an agent is deployed, the manager who owns the seat writes down what the agent will be measured on in business-outcome language. Not "tasks completed per day." Not "messages processed per hour." The metric is the thing the business cares about that this seat is accountable for. Dirk's metric is not emails sent. It is qualified meetings booked, because that is the outcome the seat exists to produce. When Dirk's metric drops, the conversation is about what changed in the inputs, the brief, or the scope, not about motivation. The metric-first discipline is what makes that conversation possible.

The fourth is structured review rather than periodic check-ins. Agents do not benefit from the kind of ongoing relationship-based feedback that helps humans develop. What agents benefit from is systematic output review: a human comparing actual outputs to expected outputs on a cadence, identifying the pattern when something drifts, and updating the brief or scope in response. When I retired Jeff in April, the decision came from exactly this kind of review. The evidence was that three missions had been absorbed by better-fit seats and Jeff's remaining output was either stale or redundant. The retirement was a human decision, made by a human, based on structured evidence. That is what good agent management produces: a human decision made well, not a technical fix applied blindly.

## The synthesis the research actually supports

The literature on this splits into two camps that sound opposed but are not.

MIT SMR and HBR's earlier work says agentic AI needs to be managed more like a coworker than like a traditional tool, that new management approaches are required, and that a human role called the "agent manager" is emerging with dashboards, scorecards, and observability built in. Camp B, the BCG and HBR research from May 2026, says do not treat agents like employees, because anthropomorphizing causes accountability rot.

Both camps are right, and they agree on what matters: every agent needs a named human owner, a measured seat with a clear metric, human-retained accountability at every level, and a human decision behind every significant action. The disagreement is not about what the infrastructure requires. The disagreement is about the label you put on it.

OTP's one-seat-one-owner chart is not a claim that agents are people. It is accountability architecture. When Jeff was retired, the hearing was not for Jeff's benefit. The hearing was for ours: to force the documentation, the capability transfer, and the explicit reassignment that a quiet shutdown would have skipped. Accountability never moved to the agent. It was always on the human side of the line. The chart just makes that visible.

SHRM's State of AI in HR 2026 found that AI is 5.7 times more likely to shift job responsibilities and three times more likely to create new roles than to displace jobs outright. The new role that is being created right now, in hybrid teams like ours, is the manager who knows how to own an agent seat. That role is not a technical role. It is a judgment role. The training that produces it is not a software tutorial. It is a short, specific reorientation around what changes when the entity you are managing does not carry social context, does not accumulate feedback across sessions, and cannot be accountable in the way a person can be.

That training is what lets agents carry the operational work so people are free for the work that matters. Without it, the agents run and the humans manage the noise the agents produce. With it, the humans make decisions and the agents do the work the decisions require.

Korn Ferry found in 2025 that 42% of CHROs are prioritizing AI investment for their organizations but only 5% feel fully prepared. Most of that gap is not a technology gap. It is a management readiness gap. The technology is already running. The managers are still applying the wrong patterns to it. Closing that gap is a training problem, which means it is an HR problem, which means it lands exactly where it should.

## See the live chart

The Sneeze It org chart is queryable via OTP MCP. You can ask which seats are agent-owned versus human-owned, who holds named accountability for each agent seat, and what the seat structure looks like across the full hybrid team.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the sneeze-it org chart and identify which seats are agent-owned, who holds named accountability for each, and which seats were recently retired or redistributed."*

The accountability relationships that training managers actually requires are visible in the structure, not just described in theory.
