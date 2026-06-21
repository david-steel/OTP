---
title: Headcount planning changes when agents absorb the toil. Here is the decision tree.
date: 2026-06-21
author: David Steel
slug: how-a-chro-plans-headcount-when-agents-do-the-toil
type: founder_essay
status: published
series: ai-chro
series_part: 15
description: When agents handle operational toil, headcount planning shifts from filling seats to assigning accountability. The decision tree CHROs need now.
---

# Headcount planning changes when agents absorb the toil. Here is the decision tree.

The headcount conversation used to be simple. You had more work than people. You hired people to do the work. The forecast told you how many seats you needed. The HRIS tracked them. HR kept the number honest.

That model assumed toil and judgment lived in the same seat.

They do not anymore.

When an agent can handle the operational work of a coordinator, a scheduler, a data analyst, or a first-pass reviewer, the headcount decision splits into two separate questions that used to be one. The first question is whether this work needs to be done. The second is whether the right entity to do it is a person.

CHROs who have not separated those two questions are still planning headcount the old way. They are adding human seats to cover work that agents could carry. Or they are deploying agents without asking who is accountable for what the agent produces. Both are expensive mistakes, just in opposite directions.

Korn Ferry found that 42 percent of CHROs are now prioritizing AI investment for HR, but only five percent feel fully prepared. The preparation gap is not about technology. It is about not having a framework for the planning question that agents create.

This post is that framework.

## The decision that changed

Deloitte's 2025 Global Human Capital Trends research found that managers spend roughly 40 percent of their time on administrative work and only 13 percent on people development. That ratio is the original sin of headcount planning: we have been hiring people to do toil, then wondering why their judgment work is thin.

Agents can carry most of that 40 percent. Scheduling. Data prep. First-draft communications. Screening and summarizing. Status reporting. At Sneeze It, Radar handles daily briefings, calendar scanning, and cross-channel synthesis. Dash reads Meta and Google Ads data across 39 accounts and surfaces only the patterns that matter. Tally pushes KPI values from local sources to the scorecard on a schedule. Crystal tracks project delivery risk across active Accelo jobs.

None of those seats require a human to do the operational work. They do require a human to own the accountability for what those seats produce.

That is the shift. The headcount question is no longer "how many people do we need to get this done." It is "which of these seats needs a human doing the work, and which needs a human owning the output while an agent does the work."

## The decision tree

Run this in order for every open seat, every new function, and every role you are considering backfilling.

**Step one: Is this work affecting a business outcome you measure?**

If the work does not connect to a metric your org tracks, it is overhead. Before you ask whether a human or an agent should do it, ask whether it should exist. Agents make this question cheaper to answer honestly, because you can deploy an agent for a function and discover quickly whether the output moves anything. A human hire forecloses that experiment for at least six months.

If the work connects to a business outcome, move to step two.

**Step two: Does the work require judgment in novel situations, care for another person, or accountability that cannot be delegated?**

MIT SMR's research on agentic AI found 69 percent of experts agree agents demand new management approaches, but that same research is clear on one thing: agents cannot be accountable for their decisions. The deploying human is.

Conflict resolution, ethics calls, the client call where someone needs to feel heard before they will hear anything back, the coaching conversation where tone and timing are everything. These are human seats. Not because agents could not produce something that looks like the output, but because the relationship is the work, not incidental to it.

If the seat requires these things as a core function, hire a human. If it does not, move to step three.

**Step three: Can the work be described in a narrow, measurable statement of output?**

This is where HBR and BCG's research lands with the most force. The May 2026 paper by Kropp and colleagues found that anthropomorphizing agents, framing them as teammates rather than tools with a specific scope, reduced individual accountability, increased unnecessary escalation, and lowered the quality of human review of agent outputs. The recommendation was explicit: treat agents as "rented contractors with a narrow statement of work," governed by scoped permissions, audit logs, and named human owners.

If you cannot write the agent's output in a single sentence that your Monday meeting would recognize as a business number, the agent is not ready to hold the seat. It is a prototype.

Nick, our cold prospecting agent, has one number: thirty qualified email drafts per day to named decision-makers in ICP accounts. Qualified means validated email, named individual, not a generic address. That sentence is the seat. Everything else follows from it.

If the work can be described that way, move to step four.

**Step four: Is there a named human who will own the accountability for what this seat produces?**

This is where most agent deployments break. Both sides of the current management literature agree on this point: a specific person must be on the hook for what the agent produces.

At Sneeze It, Arin drafts coaching messages for Amanda and Erica, our call center team. Every message requires my approval before it sends. Arin does the work. The accountability does not move. Dirk stages cold outreach drafts in Gmail. I send them. The agent carries the operational toil. A human retains the decision.

If there is no named owner, do not deploy the agent. SHRM's 2026 State of AI in HR report found organizations are 5.7 times more likely to see agent deployment shift job responsibilities than displace jobs. What it shifts toward is exactly this: humans whose job now includes reviewing and being accountable for what agents produce.

If there is a named owner, the seat is ready.

**Step five: Is the kill switch within reach?**

Literally: can the named human owner change the agent's scope, reduce its permissions, or retire the seat without a software deployment?

In April, we retired Jeff, an agent whose three missions had been absorbed by better-fit seats over six months. The retirement was a structured hearing. Jeff's capabilities were documented and each one reassigned to a named seat. Jeff could not argue for his own continuation. A human made the call.

That is what a functional kill switch looks like: not a technical off-switch but a human process that keeps accountability intact when a seat is no longer earning its place.

## What the two-track plan looks like

Headcount planning now runs two tracks in parallel.

The first track is the one HR has always run: what human seats do we need, at what level, in what functions. It does not disappear. It gets smaller. HBR Analytic Services found only six percent of organizations fully trust agents with core processes right now. The human track will always exist because judgment, care, and non-delegable accountability do not go away.

The second track is new: what agent seats do we need, what is each seat's narrow output, who is the named human owner, is the governance layer in place. Bersin puts the investment ratio at nine dollars of human capital for every dollar of machine learning spend. That nine-to-one is mostly people doing coordination, synthesis, first-pass review, and status monitoring. The second track is built to hand that work to agents.

Bogdan runs COO functions at Sneeze It. Janine handles accounting. Kristen leads creative. Those are first-track seats where judgment and relationship are the core function. Every operational layer around them, Radar's daily briefing, Dash's pattern detection, Crystal's delivery risk flags, Tally's scorecard pushes, Pepper's inbox triage, runs on the second track. Let agents carry the operational work so people are free for the work that matters. That is a planning decision. We made it deliberately, one seat at a time, running the decision tree.

The management literature argues about whether to call agents coworkers or contractors. Both camps converge on the same requirement: named human owner, measurable seat, scoped permissions, kill switch within reach. That is accountability architecture. OTP's one-seat-one-owner chart delivers it. The decision tree above is how you apply it.

---

## See the live chart

The Sneeze It org chart is queryable from the OTP MCP, including which seats are agent-owned versus human-owned and who holds accountability for each agent seat.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the sneeze-it chart and list every agent seat alongside its named human owner."*

You will see the accountability structure that makes the second headcount track governable, not just a list of agents that run.
