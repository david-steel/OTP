---
title: Agents do not need a training budget. That is the whole problem with your L&D strategy.
date: 2026-06-21
author: David Steel
slug: how-agents-change-learning-and-development
type: founder_essay
status: published
series: ai-chro
series_part: 36
description: How agents change learning and development in a hybrid org. The accountability architecture that keeps humans growing while agents carry the operational work.
---

# Agents do not need a training budget. That is the whole problem with your L&D strategy.

Here is the thing nobody says out loud about learning and development in an agent-era organization: the agents absorb the work that used to produce learning.

The junior analyst who spent two years grinding through data pulls learned something in that grind. The account coordinator who handled a hundred routine client emails before her first real client call learned something in those emails. The work was repetitive. It was also curriculum.

When an agent takes that work, the repetition goes with it. What does not automatically follow is a plan for where the learning goes instead.

That is the L&D problem agents actually create. Not "how do we train people to use AI." That is the easy version of the question and most HR teams are already running that playbook. The harder version: what do people learn from, now that the operational repetition is gone?

## What the data is actually telling L&D teams

SHRM's 2026 State of AI in HR report found that AI is 5.7 times more likely to shift job responsibilities than to displace jobs outright, and three times more likely to create new roles than eliminate them. L&D teams have read this as reassurance. I read it as a directive.

If responsibilities are shifting, the skills those responsibilities required are no longer the skills the seat needs. If new roles are emerging, there is no institutional knowledge for them yet. The existing training catalog is partially obsolete, and the emerging work has no catalog at all.

Deloitte's 2025 Global Human Capital Trends research found that managers spend roughly 40 percent of their time on administrative tasks and only 13 percent on people development. When agents absorb the administrative load, that 40 percent frees up. But only 7 percent of organizations report making great progress on manager reinvention. The time is about to free up. The structure for using it is not there. That is a L&D architecture problem. The CHRO owns it.

## The Sneeze It worked example

At Sneeze It, I have agents running eight operational seats: Radar handles the daily briefing, Tally handles KPI pushes, Dash handles ad performance scanning, Crystal handles project status, Arin handles call center coaching analysis, Pepper handles email triage, Dirk handles pipeline monitoring, Nick handles cold prospecting.

Each of those seats used to involve humans doing repetitive work. That work was not just toil. It was how people learned what a normal week looked like versus an anomalous one, what mattered, where the business was fragile.

The agents do that work better and faster. They do not learn from it the way a human would. And when a human is no longer doing it, neither are they.

The answer at Sneeze It was to make humans the named owners of agent seats, and to make the ownership itself the development. Bogdan, our COO, owns the accountability architecture. Janine owns the financial outputs. They review what Dash and Tally and Crystal surface, challenge it, decide what it means, and take the actions agents cannot take. That is the judgment layer. Learning happens there now.

## The critical tension the literature has not resolved

One school of thought says: manage agents like coworkers. MIT SMR research found that 69 percent of experts say agentic AI demands new management approaches, and HBR introduced the role of the "agent manager" who runs agents through dashboards and scorecards.

A second school, from HBR and BCG research published in May 2026, pushes back hard. Their large-scale experiment found that treating agents like employees reduced individual human accountability, increased unnecessary escalation, and lowered review quality. Their prescription: treat agents like rented contractors with a narrow statement of work, governed by scoped permissions, kill switches, audit logs, and named human owners. Not HR onboarding. Not performance reviews.

Both camps are right about something, and the disagreement dissolves when you separate the concepts.

Agents do not learn. They are configured, scoped, and measured. "Onboarding an agent" means giving it a defined seat with scoped permissions and a clear metric. "Retiring an agent" is a human decision when the seat is not producing. Jeff, a data integrity agent on our chart, was retired in April after a formal review. The decision was made by a human. Accountability never moved to Jeff.

That is accountability architecture, not anthropomorphizing. It is making sure humans never stop owning the outcomes.

The L&D implication follows directly. Human development has to focus on the judgment required to own those seats well: recognizing when the agent is wrong, knowing when to override, knowing when to retire a seat not earning its place. Only 6 percent of leaders in HBR Analytic Services' survey of 603 executives fully trust agents with core processes. Teaching humans to maintain that appropriate skepticism is now a core L&D objective.

## Three moves the L&D function has to make

SHRM found that 17 percent of organizations are using AI in L&D today. Most of that is AI-assisted content creation and adaptive platforms. That is efficiency. The architecture shift is different.

The first move is redistributing the learning surface. If operational repetition is gone, the learning surface moves to decisions, reviews, and ownership. L&D designs programs around the judgment calls humans make as seat owners, not around the tasks agents execute.

The second move is making agent oversight a named competency. Nobody has "agent oversight" as a defined skill on their job description yet. In a hybrid org, they should. How do you know when an agent's output needs a challenge? How do you run the accountability conversation with the human who owns the seat when the number drops? These are learnable skills. They need curriculum.

The third move is protecting the apprenticeship function. When agents absorb routine work, organizations have to find new containers for early-career learning. Structured rotations through agent-adjacent review work. In some cases, deliberately keeping some routine work human in the early tenure period, not because agents cannot handle it, but because the human is not yet ready to skip the apprenticeship.

Josh Bersin put a number on it: for each dollar spent on machine learning technology, organizations may need to spend nine dollars on human capital. L&D is the channel for that nine dollars. If L&D is still running the 2023 AI-literacy playbook, it is not being spent.

## The seat is the curriculum

In a hybrid org where agents carry the operational work so that people are free for the work that matters, the seat itself becomes the unit of development. Every seat has a clear owner, a clear metric, a named human accountable for what it produces. That is true for Bogdan's COO seat. It is true for the seats Radar and Dash and Pulse and Crystal and Arin hold.

L&D does not need a separate program for "agent era readiness." It needs to make seat ownership the central architecture of development. Clear seats. Named owners. Measured outputs. Human accountability.

Agents improve through configuration. Humans improve through ownership. The CHRO's job is to keep those two tracks from getting confused, and to make sure the ownership track stays challenging enough that the humans on it are actually growing.

## See the live chart

You can query the OTP chart for Sneeze It to see which seats are agent-held versus human-held, and which agents have named human owners on the accountability layer.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the Sneeze It org chart and identify which seats are agent-held and who the named human owner is for each."*

The response shows the accountability architecture in live form. That structure is what keeps humans developing inside a workforce where agents carry the operational load.
