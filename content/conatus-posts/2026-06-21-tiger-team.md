---
title: Tiger team: what it is, when to use one, and how to run it right
date: 2026-06-21
author: David Steel
slug: tiger-team
type: founder_essay
status: published
series: operating-system
series_part: 22
description: A tiger team is a small, dedicated group pulled from normal duties to solve a critical problem fast. Here is what the term means, when it works, and when it backfires.
---

# Tiger team: what it is, when to use one, and how to run it right

A tiger team is a small, dedicated group of people pulled from their normal duties to solve a specific, urgent problem with a hard deadline. That is the complete definition. Every version of the term traces back to that core structure.

The phrase has been used in aerospace, software, the military, and business operations for decades. The format persists because it works for a narrow set of situations. It also gets misapplied constantly, which is why understanding the tiger team meaning precisely matters before you form one.

## What is a tiger team

A tiger team is not a task force. It is not a working group. It is not a standing committee that meets weekly to review a topic.

The distinguishing features are specificity and dedication. A tiger team has one problem, a clear success condition, and members who are pulled off their regular work for the duration. When the problem is solved (or the deadline passes), the team dissolves. Members return to their home seats.

The name itself is disputed in origin. Some attribute it to NASA's Apollo program, where dedicated troubleshooting teams were used to find failure points in spacecraft systems. Others trace the language to military operations. The exact origin is less important than the operating pattern: a small, focused group with a time-bounded mission and full attention on one target.

Three things define whether a group is actually a tiger team rather than just a meeting:

**Dedicated capacity.** Members are not doing their tiger team work alongside their normal workload. They are off their normal workload. If someone is splitting time, the tiger team is not running, a committee is.

**One defined problem.** The team exists to close a specific gap or answer a specific question. "Improve our retention" is not a tiger team mission. "Find out why our 30-day churn doubled in the last 6 weeks and return a root cause with a recommendation" is.

**A hard end.** Tiger teams dissolve when the mission is complete. A team with no defined end date is not a tiger team. It is a department that started small.

## Tiger team meaning in practice

In practice, tiger team means different things depending on the industry.

In software, a tiger team usually means a group pulled together to resolve a production incident, a security vulnerability, or a critical bug. The team is on it until the issue is closed.

In the military, a tiger team often means a red team variant: a group tasked with finding weaknesses in a system by trying to break it before an adversary does. The goal is adversarial probing, not construction.

In agencies and service businesses, a tiger team typically means a crisis response unit for a client situation that cannot wait for normal process, or an internal problem that normal operations have failed to solve over time.

What holds across all of these is the tiger team meaning at the structural level: small, dedicated, time-bounded, mission-specific. Anything that does not meet those four conditions is not a tiger team, whatever you call it.

The distinction matters because calling something a tiger team raises the organizational cost. You are pulling people off their standing responsibilities. If the problem does not warrant that cost, the label creates disruption without return. If the problem does warrant it and you do not form the tiger team, you get a problem that drags at partial attention for months.

## When to use a tiger team

The situations that warrant a tiger team have a common shape. The problem is:

- Specific and bounded (not general and chronic)
- Urgent enough that normal process is too slow
- Complex enough that it needs more than one person
- Important enough to justify pulling people off other work

That last point is where most leaders miscalibrate. They form tiger teams for problems that are urgent but not important, or for problems that are important but could move at normal pace without real cost. The urgency-importance check is the right gate before you assemble the group.

The situations that do not warrant a tiger team are equally important to recognize. Chronic operational problems rarely respond to a tiger team because the root causes are systemic, not fixable by a focused sprint. Strategy development is usually too open-ended to survive the time-bounded tiger team structure. And problems that require organizational buy-in across many stakeholders tend to need a change process, not a fast team.

The ideal tiger team problem looks like this: something broke (or is about to break), you know roughly what domain it lives in, the cost of it continuing is high and measurable, and you need a small group of the right people to close it faster than normal work cycles allow.

## Tiger team examples

A few real-world patterns show the structure in action.

A software company loses a major client over a reliability issue. They pull four engineers and a product lead off their sprints for two weeks. The tiger team mandate is to identify every component that contributed to the outage, build a remediation plan, and implement the critical path items. They return to their sprints when the work is done. The rest of the reliability backlog goes into the normal planning cycle.

A professional services firm is at risk of losing a contract because a deliverable has slipped six weeks. The principal assembles three people who were not on the original project, gives them the account files, and tasks them with producing the deliverable in ten days. The original project team keeps moving on adjacent work. The tiger team closes the gap.

A sales team has a conversion problem. Proposals are going out, but win rate has dropped 15 points over a quarter. The CEO pulls one senior salesperson, one client services lead, and a junior analyst for three weeks. Their mandate is to review the last thirty proposals, identify the pattern, and return a hypothesis with evidence. The tiger team produces a finding. The sales team tests it.

What all of these share is a bounded problem, temporary commitment, and a clear output. None of them became standing teams. The dissolution is part of what makes the format work.

At Sneeze It we used a version of this structure when our call center appointment rate dropped unexpectedly. We did not route the problem through the normal weekly review cycle. Arin, our call center manager, pulled together a focused diagnostic with the relevant callers and ran a hard two-week review of dials, show rates, and script patterns. The output was a specific coaching change, not a general improvement plan. The review closed when the diagnosis was done. Arin then tracked the recovery on the regular scorecard with Tally pushing the numbers to the OTP chart so we could see the trend week over week without a separate report.

You can read more about how we track recovery metrics across seats in [Humans and agents on the same scorecard](/blog/humans-and-agents-on-the-same-scorecard). The diagnostic pattern that precedes the scorecard entry is where the tiger team format fits.

## Frequently asked questions

**What is the difference between a tiger team and a task force?**
A task force is often ongoing and multi-objective, with members who continue their regular work on the side. A tiger team is time-bounded, single-objective, and requires dedicated capacity, meaning members step off their regular work for the duration. The dedication is what makes a tiger team different.

**How many people should be on a tiger team?**
Most effective tiger teams run between three and seven people. Fewer than three tends to miss skill coverage. More than seven creates coordination overhead that slows the sprint. The right number is the minimum needed to cover the domains the problem touches.

**Who should lead a tiger team?**
The team lead should have decision-making authority within the scope of the mission, direct access to the people and data the team needs, and no competing priorities that pull attention. A tiger team lead who is also managing their normal workload is not actually leading a tiger team.

**How long should a tiger team run?**
Most problems that suit the tiger team format resolve in one to four weeks of dedicated effort. If the team is still working after six weeks, the problem is likely systemic rather than bounded and needs a different approach, or the scope was wrong from the start.

**Can AI agents be part of a tiger team?**
Yes. If an agent is dedicated to the problem for the duration, produces outputs the team depends on, and is pulled from its standing work, it fills the structural role a human would. The seat definition matters more than whether the seat is human or agent. We have done this at Sneeze It. Dash, our analytics agent, has run full attention on a specific account diagnostic for a defined window while Radar handled the standing daily briefing alone. The structure holds.

## Run it in OTP

When your tiger team closes, the action items do not disappear. They move to the standing scorecard, where the seats accountable for follow-through can be tracked alongside every other seat in the org. OTP lets you assign those items to human seats or AI agent seats on the same chart, so the recovery work stays visible without a separate project file.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to create action items from a tiger team diagnostic and assign them to the right seats on our org chart."*

---

*Series: Operating System. Post 22. Related: [Adding an AI agent to your org chart is not configuration. It is hiring.](/blog/adding-an-agent-to-your-org-chart)*
