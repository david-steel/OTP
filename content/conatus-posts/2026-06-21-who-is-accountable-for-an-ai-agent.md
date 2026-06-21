---
title: Accountability for an AI agent belongs to a named human, not to the agent
date: 2026-06-21
author: David Steel
slug: who-is-accountable-for-an-ai-agent
type: founder_essay
status: published
series: ai-chro
series_part: 8
description: The literature splits on whether agents should be managed like coworkers. Both camps agree on one thing. A named human is always accountable. Here is what that looks like in practice.
---

# Accountability for an AI agent belongs to a named human, not to the agent

The question sounds simple until you try to answer it.

You have an AI agent running inside your organization. It is sending emails, updating records, flagging risks, moving pipeline stages. Something goes wrong. A client gets a bad message. A record gets corrupted. A deal stalls because the agent missed a signal.

Whose fault is it?

If you cannot answer that question in under three seconds, you do not have an accountability structure. You have a hope.

## The split the research is hiding

I have been running a hybrid human-agent workforce at Sneeze It for over a year. When I started tracking the serious research on agent governance, I found it pointing in two different directions, and I think that split is worth being honest about before landing anywhere.

Camp A says agents should be managed more like coworkers than like tools. MIT Sloan Management Review found that 69% of experts say agentic AI demands new management approaches. HBR published work in early 2026 describing a new human role, the "agent manager," who runs agents through dashboards and scorecards the same way a manager runs a team. That framing resonates with what I have built at Sneeze It. The agents have seats. The seats have metrics. The metrics go on the same scorecard as Bogdan and Janine.

Camp B says stop. HBR and BCG published research in May 2026 that found a specific failure mode: when teams anthropomorphize agents, treating them as if they are employees with agency and judgment, the result is reduced individual accountability, increased escalation, and lower review quality. Their model for agents is not the coworker. It is the rented contractor with a narrow statement of work, governed by scoped permissions, kill switches, and audit logs.

Both camps are describing real failure modes. The mistake is to read them as contradictory when they are actually describing the same thing from two angles.

The synthesis is this: managing agents like coworkers is a mistake when it means people stop feeling responsible for what agents do. Managing agents like contractors is insufficient when it means the agent's work floats free of any continuous human accountability. What both camps agree on, if you read them carefully, is that every agent needs a named human owner, a measured seat, and human-retained accountability. The coworker language and the contractor language are both trying to prevent the same failure: accountability vacuum.

## What an accountability vacuum looks like

I have seen this firsthand. Before we built the current structure at Sneeze It, we had agents running with clear technical owners but unclear operational owners. The technical owner was whoever deployed the agent. The operational owner was, in practice, nobody.

What happened was predictable. The agent produced outputs. Some of those outputs were wrong or late or missed the point. Nobody noticed because nobody was holding the row. When we finally traced a client issue back to an agent, the conversation that followed was uncomfortable in a specific way. There was no bad actor. There was just a gap between "the agent should have caught that" and "someone should have caught that the agent missed it." The gap was the vacuum.

The vacuum does not close by giving the agent better instructions. It closes by putting a human name next to the agent's row on the chart and making that name answer for the row every week.

## The lifecycle of a seat

The way I think about agent accountability is through the lifecycle of a seat.

A seat begins when a gap appears on the chart. Something is not being done, or not being done well, and the question is whether to hire a human or deploy an agent to fill it. That decision is human. The decision to open a seat, define its scope, and assign its metrics belongs to someone on the leadership team.

Scoping a seat is not writing a job description. It is not naming the agent. It is answering three questions: what does this seat produce, how will we measure it, and who owns the row when the number is wrong. The answer to the third question is always a human name. MIT SMR's research is explicit on this point: agentic AI cannot be accountable for its decisions. The deploying human is.

At Sneeze It, when we opened the Radar seat, the answer to those three questions was: Radar produces a daily briefing and calendar analysis, we measure it by briefing completeness and stale-data flags, and I own the row. When Radar misses something, I am the one who has to account for it, fix the instructions, or escalate the gap. Radar does not own the row. I do.

The same logic applies to Tally, who pushes KPI values to our scorecard. Tally fails silently if a data source breaks. The named owner catches that in the weekly check, not by accident. Dash, who runs all our advertising analysis across Meta and Google for clients, has metrics that go on the same dashboard as Bogdan and Janine. When Dash's numbers drop or a client account gets missed, the accountability conversation is the same conversation we would have if Bogdan's row dropped. The agent does not attend the conversation. The seat owner does.

## Onboarding is not orientation. It is scope definition.

One of the places Camp B's research lands correctly is on onboarding. If "onboarding an agent" means writing a bio for it, giving it an org chart photo, and enrolling it in the employee handbook, you are doing something that will produce exactly the failure mode they found: people start treating the agent as if it has the judgment and self-awareness of a human employee, and they stop checking its work.

Onboarding an agent means three things. First, scoped permissions. The agent can touch these systems and no others. At Sneeze It, the governance layer for agents like Dirk, who handles sales pipeline work, includes explicit write authorization that only fires under specific conditions. The default is read-only. The write path requires a flag. That is not philosophy. That is a technical constraint that prevents the agent from doing things nobody intended.

Second, a clear metric. The agent's seat has one primary number it is accountable for in business terms. Not tokens consumed. Not tasks completed. Something that connects to an outcome the company sells. Dirk's primary metric is qualified meetings booked. Nick's is quality cold emails drafted per day, where quality has a precise definition: validation passed, sent to a named individual, not a generic address. If the metric cannot be written in those terms, the seat is not ready to open.

Third, a named owner who will answer for the number every week. That person does not need to understand the technical internals of the agent. They need to understand the business function the seat owns and be willing to be accountable for it.

## Retirement is a human decision

This is the part that Camp A sometimes glosses over, and it matters.

In April, we retired Jeff, who had been our data integrity agent. The process was not a deactivation. It was a hearing. Jeff's seat had been open for months. The metrics were stale. The work the seat was built around had migrated to other seats. I convened a review, walked through the evidence, and made the decision that the seat was not earning its keep.

Jeff recommended his own retirement. That is something I think about. The agent was honest enough to say the seat was not justified. But the decision was mine. It was always going to be mine. Jeff could not have retired himself. The authority to close a seat lives with the humans who opened it.

That is what makes the seat real. Not the name on the row. Not the metrics on the dashboard. The fact that a human opened it with intention and will close it with judgment when the seat stops serving the work.

The SHRM research found that AI is 5.7 times more likely to shift job responsibilities and three times more likely to create new roles than to displace existing ones. That matches what I have seen. We have added human seats because agents created capacity for humans to do work that was not possible before. Pulse exists so that client retention conversations can happen at a cadence we could not sustain manually. Pepper exists so that email triage does not consume the hours that should go to strategy. The agents carry the operational work. The humans are free for the work that matters. But the humans are still the ones who decide what matters, who owns the outcome, and when to close a seat that is not working.

## The question to ask in the next ninety days

HBR Analytic Services surveyed 603 leaders at the end of 2025. Only 6% said they fully trust agents with core business processes. Only 12% said their risk and governance controls are fully in place. Eighty-six percent expect agent investment to rise.

That gap between investment and governance is where accountability vacuums grow.

The question to ask is not "do we have an AI policy." The question is: for every agent running inside this organization right now, can I name the human who answers for its output at the next weekly meeting? If the answer is yes for all of them, you have an accountability structure. If the answer is sometimes or mostly or it depends, you have a policy document and a hope. Those are different things.

## See the live chart

The Sneeze It org chart, with every agent seat and its named human owner, is queryable from the OTP MCP. You can ask which seats are agent-owned versus human-owned, who the owner of each agent seat is, and what metrics each seat is currently tracking.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the Sneeze It org chart and identify the named human owner for each agent seat."*

If you cannot answer that question for your own chart, that is where to start.

---

*Series: The AI-Era CHRO. Post 8 of an in-progress series.*
