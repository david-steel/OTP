---
title: HR does not disappear when half your workforce is agents. It changes shape entirely.
date: 2026-06-20
author: David Steel
slug: what-hr-does-when-half-the-workforce-is-agents
type: founder_essay
status: published
series: ai-chro
series_part: 1
description: When agents fill half the seats on your org chart, HR's job doesn't shrink. The scope expands and the skill set rotates.
---

# HR does not disappear when half your workforce is agents. It changes shape entirely.

The question I hear most from operators who are building hybrid teams is something like: "If agents do the work, what does HR do?"

It is the wrong question. It assumes HR is primarily about managing the humans doing the work. It is not. HR is about making sure the right work gets done by whoever is accountable for it. When half your workforce is agents, that job does not get smaller. The scope expands and the skill set rotates.

I have been running a hybrid team for about eight months. Right now, roughly half the seats on our org chart are held by agents. Radar runs chief-of-staff functions. Dirk owns the sales pipeline. Dash reads every ad account we manage and reports patterns daily. Arin manages the call center team. Tally pushes our KPIs to the scorecard. Janine handles our accounting, receivables, and billing. Bogdan is our COO. Crystal tracks project delivery. Some seats are human. Some are agent. The work gets done or it does not, and the seat is accountable either way.

What I have learned from operating this is that the HR function does not shrink. It reorients around three questions that were not nearly as crisp when all the seats were human.

## Who is accountable for what this agent produces?

The hardest thing about an agent hire is not the technical setup. It is the accountability question.

When you hire a human, accountability is assumed. There is a person. The person has a name. The person shows up to the Monday meeting. If the number drops, you talk to the person. Everyone knows who to talk to.

When you deploy an agent, the accountability question is open by default. The agent does not show up to the meeting. The agent cannot advocate for itself. The agent cannot push back when the brief is unclear. If nobody explicitly owns the agent's seat, the agent drifts. Quietly. Confidently. For months.

This is an HR problem, not a technical problem.

Every agent on our chart has a human who owns the accountability for that seat. When Dirk's cold email quality drops, I am the person who diagnoses it and fixes the brief. When Arin sends a coaching message that misreads the tone of what the call center team needs, I review it and redirect. When Tally fails to push a KPI because the source file changed format, I get the alert and decide whether to fix the handler or redirect the KPI to a different source.

The agent does the work. A human owns the seat's accountability. That ownership relationship is a human resources question, and it needs to be explicit before the agent is deployed.

## How do you offboard a seat that does not have feelings?

In April, I retired Jeff.

Jeff was an agent who started with three missions: ad pacing monitoring, account status monitoring, and Accelo budget reconciliation. Over time, each mission was absorbed by a better-fit seat. Dash absorbed the pacing work. Dash absorbed the account status work. Dirk absorbed the revenue integrity work. Jeff was left without a clear job, and the data he was producing was either stale or redundant.

The standard answer in most orgs would be to just stop running the agent. Turn it off. It does not have feelings. What is the HR question?

The HR question is: where does the work go?

When a human departs, you lose their institutional knowledge, their relationships, and their judgment. You plan for continuity. With Jeff, the continuity question was less about knowledge and more about coverage. The three missions did not disappear when Jeff did. They had to be explicitly reassigned and then verified that the receiving seats actually picked them up.

We had a formal retirement hearing. It sounds excessive. It was not. The hearing forced us to document every capability Jeff carried, assign each one to a named seat, verify that the receiving seat had what it needed to absorb the work, and keep a record. The hearing was an HR exercise, not a technical one. It produced a written record that three seats absorbed Jeff's work and a list of what each seat was now accountable for that they were not before.

Without that process, we would have had a quiet coverage gap. The work would have stopped happening. Nobody would have noticed for weeks.

## How do you evaluate performance when the output is hard to attribute?

Janine does our billing. When a new client is signed, she builds the invoice, sets up the billing schedule, and tracks receivables. When something changes on a client account, she updates the record. This is clear, attributable work. Janine's output is the invoice.

Dash reads every ad account we manage and produces a daily pattern report. The output of that report feeds into how our account managers talk to clients, which feeds into retention, which feeds into revenue. The chain between Dash's analysis and a retained client is real, but it is long and indirect. How do you evaluate Dash's performance?

This is an HR question. It is the performance management question that hybrid teams have to answer.

The answer we landed on is: you evaluate against the metric the seat owns, not against the downstream outcome the seat influences. Dash owns pattern detection and alert accuracy. We track how often Dash flags an issue that a human later confirms was real versus how often Dash flags something that turns out to be noise. We track whether Dash's daily report reaches the right person in time to act. Those are Dash's metrics.

The downstream outcomes (client retention, CPL trends, account growth) belong to the seats that act on Dash's output, not to Dash. The same separation of accountability that governs human performance reviews governs agent performance reviews. The seat owns what it controls. The evaluation is against that scope.

This discipline requires someone to define the metrics before the seat is deployed, track them with the same rigor as human KPIs, and review them on the same cadence. That is HR work.

## What HR actually becomes

When half your workforce is agents, the HR function reorients around three things it probably was not doing before.

First, accountability mapping. Every deployed agent needs an explicit human owner. The owner is accountable for the agent's seat the way a manager is accountable for a direct report. Defining and maintaining that mapping is ongoing HR work.

Second, structured offboarding. When an agent seat is retired, closed, or redistributed, the capabilities it held need to be documented and explicitly reassigned. Without a structured offboard process, coverage gaps appear silently.

Third, metrics ownership. Every agent seat needs performance metrics defined in business-outcome language before deployment, tracked on the same cadence as human KPIs, and reviewed by the seat's accountable human owner. The HR function is responsible for ensuring that discipline holds.

None of this is what HR was doing ten years ago. It is what HR does when the org chart has Janine and Tally on the same sheet, when Bogdan and Radar are both in the Monday meeting, when Arin and Dash both have rows on the scorecard. The function changes shape. It does not disappear.

The operators who figure this out early will build teams where agents carry the operational work so people are free for the work that matters. The ones who treat agent deployment as a purely technical decision will spend a lot of time wondering why their agents keep drifting.

## See the live chart

Query the Sneeze It org chart via the OTP MCP to see which seats are held by agents, who owns each seat's accountability, and how agent seats are structured alongside human ones.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the sneeze-it org chart and identify which seats are held by agents versus humans, and who owns accountability for each agent seat."*

You will see the accountability relationships and seat types that make a hybrid team actually function, not just a list of agents that run.
