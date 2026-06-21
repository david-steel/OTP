---
title: Goal-setting breaks when you treat agents like employees and ignores accountability when you treat them like software
date: 2026-06-21
author: David Steel
slug: how-a-chro-sets-goals-across-humans-and-agents
type: founder_essay
status: published
series: ai-chro
series_part: 31
description: A decision tree for CHROs setting goals across human and agent seats without anthropomorphizing agents or losing human accountability.
---

# Goal-setting breaks when you treat agents like employees and ignores accountability when you treat them like software

The goal-setting question in a hybrid workforce has a trap on both sides of it.

If you treat agents like employees, you start implying they have some stake in the outcome. HBR and BCG research found, in a large experiment, that anthropomorphizing AI agents reduced individual accountability, increased unnecessary escalation, and lowered review quality. The people managing agents stopped owning results because the agents seemed to own them.

If you treat agents like software, you stop setting goals for them entirely. You measure latency and uptime. You track tasks completed. You never connect the work to a business outcome anybody cares about. Six weeks in, the agent is confidently producing numbers that have no relationship to what the company needs.

I have made both mistakes. The synthesis I landed on is not a compromise between camps. It is a decision tree that handles them separately.

## The question every goal starts with

Before I set a goal for any seat, I ask one question: who is the human accountable for this seat's results?

At Sneeze It, that question has a specific answer for every row on our scorecard. Bogdan, our COO, owns his results. Janine, our accounting lead, owns hers. For Radar, our chief-of-staff agent, I own the accountability. For Dirk, which manages our sales pipeline, I own it. For Dash, which reads every ad account and reports patterns daily, I own it. For Arin, which manages the call center team via Slack coaching, I own it.

The goal does not belong to the agent. It belongs to the seat, and the human who owns accountability is responsible for the result. MIT SMR put it plainly in their agentic AI research: agentic AI cannot be accountable for its decisions. The deploying human is. That is the correct architecture.

## The decision tree

**Is the work outcome-measurable?** Tally, our KPI-pushing agent, has one goal: push accurate values to the scorecard on cadence. Nick, our cold prospecting agent, has one goal: thirty validated, named-individual cold email drafts per day to qualified health-and-wellness prospects. Both are countable in business language and visible on the same dashboard as every human row. If a seat's work cannot be stated in business-outcome language, the diagnosis is that the seat does not have a clear role. Fix the role before setting any goal.

**Is the goal within the seat's direct control?** Dash produces a daily pattern report that feeds into how account managers talk to clients, which feeds into retention. But retention is not within Dash's direct control. Dash controls pattern detection and alert accuracy. The downstream outcome belongs to the seat that acts on Dash's output. This is the same discipline I apply to human seats: Janine owns days receivable outstanding, not clients' decisions to pay on time. Scope the goal to what the seat actually controls.

**Does the goal require human judgment at the output stage?** Pepper, our email triage agent, drafts responses to client emails. The goal is not "send the right email." The goal is "surface the right emails and produce drafts worth approving." Every draft requires my review. Pulse, our client retention agent, detects churn risk and drafts outreach. The goal is detection accuracy and draft quality. Client communication is a human approval gate every time. Scoped permissions and named human gates are not organizational timidity. They are what keep accountability clean. When people believe the agent owns the result, they stop owning it themselves.

**Is this a goal or a constraint?** Dirk has goals for pipeline velocity and meetings booked. But Dirk also operates under constraints: never contact someone on Pulse's churn watch list, never discount below margin floor, never exceed daily contact limits. Constraints are not measured on the scorecard. They are coded into the brief and enforced at runtime. Failing a constraint is a governance failure, not a performance failure. The response is different.

## What onboarding and retiring actually mean

Onboarding an agent does not mean a welcome message or a values deck. It means: define the seat's business-outcome goal, name the human who owns accountability, scope permissions to exactly what the seat needs, define the kill condition, and set the metric you will track. That is the full checklist.

Jeff, our former data integrity agent, was retired in April. His goals had been absorbed by better-fit seats over time. We ran a formal retirement hearing. A human made the decision. Jeff did not retire himself. Capabilities were explicitly redistributed to Dash and Dirk, a written record was kept, and accountability remained human at every step. SHRM's 2026 data shows AI is 5.7 times more likely to shift job responsibilities and three times more likely to create new roles than displace jobs. Jeff's closure created three new accountability items on three existing human-owned seats. The goal-setting burden shifted, not disappeared.

## Where the CHRO's job actually sits

Korn Ferry found that 42% of CHROs are prioritizing AI investment but only 5% feel fully prepared. The preparation gap is mostly the decision tree. Organizations have deployed agents and then tried to manage them either like employees or like software. Both produce the same result: unclear accountability and goals disconnected from outcomes.

Bersin's framing holds: $9 of human capital investment for every $1 of machine learning. In a hybrid team, that human capital is not in the agents. It is in the people who own the agent seats, set the goals, review the output, and carry the accountability.

Let agents carry the operational work. Tally pushes KPIs. Nick drafts cold emails. Dash reads the ad accounts. Pepper triages the inbox. Arin coaches the call center team. Crystal tracks project delivery. That frees Bogdan to run operations with judgment and Janine to manage cash with context. The CHRO's job is to build the goal-setting system that keeps the accountability with the people while the work moves to the agents.

## See the live chart

The OTP org chart for Sneeze It shows which seats are agent-owned versus human-owned, the named accountability owner for each agent seat, and the scorecard metrics each seat is measured against.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the sneeze-it org chart and list the primary metric for each agent seat alongside its named human accountability owner."*

You will see the accountability architecture that makes hybrid goal-setting work, and you can query the same structure for your own org.
