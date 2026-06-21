---
title: RACI matrix: what it is and how to actually use it
date: 2026-06-21
author: David Steel
slug: raci-matrix
type: founder_essay
status: published
series: operating-system
series_part: 11
description: A RACI matrix maps who is Responsible, Accountable, Consulted, and Informed for every decision. Here is what it means and how to run one.
---

# RACI matrix: what it is and how to actually use it

A RACI matrix is a decision-rights chart that assigns one of four roles to each person for each task or decision: Responsible, Accountable, Consulted, or Informed. That is what the acronym stands for, and that one sentence is the complete definition. Every elaboration below is about how to use it without breaking your team.

I run a hybrid org, Sneeze It, with human employees and AI agents on the same accountability chart. RACI thinking shows up constantly, not because I was formally trained in it but because when you have nineteen seats touching the same deliverables, you will invent RACI whether you call it that or not.

## What does RACI stand for

RACI stands for Responsible, Accountable, Consulted, and Informed. Here is what each letter actually means in practice:

**Responsible** is the person (or seat) doing the work. They execute the task. There can be more than one person who is Responsible, though the more people you assign here, the more coordination overhead you create.

**Accountable** is the single person who owns the outcome. If the work does not get done, or gets done wrong, the Accountable person is the one who answers for it. There can only ever be one Accountable per decision. This is the letter most teams get wrong by assigning it to two people and then wondering why nothing moves.

**Consulted** means this person provides input before or during the work. Two-way communication. Their feedback is required to proceed, or at minimum should be collected before the decision is final.

**Informed** means this person is told what happened after a decision is made. One-way communication. They do not get a vote and they do not block anything. They just need to know.

The whole framework is about making the A explicit. Most confusion in organizations is not about who is doing the work. It is about who owns the outcome when the work goes sideways.

## The RACI model explained

The RACI model originated in project management and has been part of the standard project management body of knowledge for decades. You will see variants, including RASCI (which adds Supportive) and DACI (Driver, Approver, Contributor, Informed), but RACI is the most common and the one you will encounter in EOS-adjacent frameworks, consulting contexts, and org design conversations.

The model rests on one core claim: ambiguity about decision rights is the root cause of most cross-functional friction. When two people both believe they are Accountable for a decision, one of three things happens. They fight over it. One defers and the decision stalls. Or both move forward independently and produce conflicting outputs. None of those are good. The RACI model forces a conversation that would otherwise happen during a crisis instead of before one.

The model is agnostic about org size. It is as useful in a five-person team as in a five-hundred-person company. What changes is the number of rows.

## How to read a RACI chart

A RACI chart is a grid. Rows are tasks, decisions, or deliverables. Columns are people or seats. Each cell gets one letter: R, A, C, or I.

A few rules for reading one correctly:

Every row must have exactly one A. If a row has two As, you do not have a RACI chart. You have a wish list.

Every row must have at least one R. If no one is Responsible, the task will not get done.

Not every cell needs a letter. Blank is fine. Blank means this person has no role in this task. Forcing letters into every cell to make the chart feel complete is a common mistake that produces meaningless charts.

If the same person is both R and A on most rows, your chart is probably correct but your org might be too centralized. Watch for that pattern. It usually means someone is doing too much and something will eventually break.

Columns with mostly I assignments belong to people who are receiving a lot of information and producing very little. That is sometimes appropriate (a board member, a client) and sometimes a sign that a seat is not pulling its weight.

## How to build a RACI template

You do not need software to build a RACI matrix. You need a spreadsheet and a list of decisions.

Start by listing the ten to twenty decisions or deliverables that cause the most friction in your org. Not every task. The ones where people step on each other, where balls get dropped, or where you spend time in meetings trying to figure out who has the final call.

Put those in the rows. Put your seats (or people) in the columns. Then work through each cell. For each row, ask: who is doing the work (R), who owns the outcome (A), who needs to be asked first (C), and who needs to know after (I).

The first draft of the chart usually surfaces the real problems. You will find rows with two As. You will find rows where nobody is Responsible. You will find people in C positions who should be in R positions and vice versa. That is the point. The chart does not solve the problems. It makes them visible so you can solve them.

A note on templates: most RACI templates available online are generic enough to be useless. The useful RACI chart is the one specific to your actual decisions and your actual seats. Start from your friction list, not from a downloaded template.

## RACI examples from a hybrid org

Here are real examples from how Sneeze It uses RACI logic across human and agent seats.

**Cold email sends.** Responsible: Nick (agent, cold prospecting). Accountable: David (founder). Consulted: Dirk (sales agent, strategy). Informed: Arin (call center manager, agent). Nick drafts, David approves each wave, Dirk informs the strategy, Arin tracks what converts downstream. Clear ownership. One A.

**Daily briefing.** Responsible: Radar (chief-of-staff agent). Accountable: David. Consulted: None at compile time (data is pre-computed). Informed: Bogdan (COO), Janine (finance). Radar compiles and writes to Obsidian. David reviews. Bogdan and Janine get the relevant sections when there is something for them to act on.

**Ad performance flags.** Responsible: Dash (analytics agent). Accountable: David. Consulted: The client-facing account manager when a flag is serious. Informed: Bogdan. Dash owns the detection and the output. David owns what to do about it.

**Client retention risk.** Responsible: Pulse (retention agent). Accountable: David. Consulted: Dirk (to check if an expansion play should be paused). Informed: Arin. Pulse detects, David decides, Dirk pauses any conflicting outreach, Arin adjusts cadence.

What you notice in these examples is that David is Accountable for almost everything. That is correct for a small company with a working founder in the seat. The point of making it explicit is not to change who is accountable but to make it visible so the agents know where to send escalations.

For a deeper look at how humans and agents share accountability on the same chart, the post on [putting humans and agents on the same scorecard](/blog/humans-and-agents-on-the-same-scorecard) covers the Monday meeting mechanics.

## Where RACI fits inside a business operating system

If you run EOS, the Entrepreneurial Operating System created by Gino Wickman, the RACI matrix fits as a decision-rights layer underneath the Accountability Chart. The Accountability Chart tells you who sits in which seat and who reports to whom. RACI tells you who owns each specific decision that crosses seat boundaries.

Cross-functional friction is usually cross-seat friction. The Accountability Chart resolves most of it by defining who owns each function. RACI resolves what the chart leaves ambiguous: the decisions that live between seats.

OTP, the platform I built at orgtp.com, works alongside EOS and similar operating systems. It puts humans and agents on the same chart with shared KPIs, rocks, and weekly meeting infrastructure. The RACI logic shows up in how seats are defined and how escalations are routed. The Tally agent, for example, is Responsible for pushing KPI values to the scorecard. The account owner is Accountable. Tally does not decide what the KPIs mean. That sits above it.

You can read more about how the accountability chart works with agents in the post on [adding an AI agent to your org chart](/blog/adding-an-agent-to-your-org-chart).

## Frequently asked questions

**What does RACI stand for?**
RACI stands for Responsible, Accountable, Consulted, and Informed. Responsible is who does the work. Accountable is the single person who owns the outcome. Consulted are people whose input is required. Informed are people who are told what happened after.

**Can a person be both Responsible and Accountable?**
Yes. In small teams this is common, especially for founders or senior seats. The founder is often both doing the work and owning the outcome. What matters is that Accountable is still assigned to exactly one person. You cannot split the A.

**How many people should be Consulted?**
As few as possible. Consulted gates the work, because you need to collect their input before proceeding. Every additional C adds latency. If someone's input is not actually required, move them to I or remove them from the chart entirely.

**What is the difference between RACI and DACI?**
DACI (Driver, Approver, Contributor, Informed) swaps the first two letters and uses slightly different language, but the core logic is the same: name who owns the decision, who executes, who provides input, and who is told. RACI is more widely used. DACI is common in tech companies, particularly those influenced by Google's internal decision frameworks.

**Is RACI only for project management?**
No. RACI originated in project management but is equally useful for ongoing operations, recurring decisions, and steady-state roles. If you have a task that happens weekly, assigning RACI to it once removes the need to re-negotiate ownership every week. That is where most of the value comes from in a company with a regular cadence.

## Run your operating system in OTP

OTP is a chart where humans and agents share scorecards, rocks, and weekly meetings, and every seat has clear ownership built in. You can assign KPIs, track rocks, and run your weekly review with the same accountability logic RACI formalizes, across every seat whether it is human or agent.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the accountability chart and identify which seats have undefined decision ownership."*
