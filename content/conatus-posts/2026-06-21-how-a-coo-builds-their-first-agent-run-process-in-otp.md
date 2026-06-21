---
title: The COO's first agent-run process is never the most exciting one. It is always the most repeatable one.
date: 2026-06-21
author: David Steel
slug: how-a-coo-builds-their-first-agent-run-process-in-otp
type: founder_essay
status: published
series: ai-coo
series_part: 50
description: A decision tree for COOs building their first agent-run process in OTP. Pick the right process, fix it first, assign seats, set the scorecard, run it.
---

# The COO's first agent-run process is never the most exciting one. It is always the most repeatable one.

The most common mistake I see COOs make when they decide to deploy their first agent is starting with the wrong process.

They pick something hard, something impressive, something that would free up a strategic person if only it could be handled by a machine. They spend three weeks mapping it, another two weeks picking a tool, then another two weeks configuring. At the end they have a fragile automation that requires constant tending and a team that does not trust it.

The second most common mistake is starting with no process at all. They pick an agent because the vendor demo looked good, wire it to the company's existing chaos, and declare it live. Six weeks later, the agent is faithfully executing the broken logic it inherited. The work is faster. The results are worse.

My central claim: the first agent-run process should be the one your team already does correctly, already does repeatedly, and already does the same way every time. Not the glamorous process. The one that is boring precisely because it works.

## The decision tree

Before you touch a single agent configuration, run through four questions in order. Each one is a gate. If you cannot answer the first one clearly, do not proceed to the second.

**One: Is there a defined output?**

Write a one-sentence description of what a completed, correct instance of this process looks like. Not the steps. The output. "A qualified lead with a meeting booked on the calendar within four business hours of first contact" is an output. "We handle leads well" is not.

If you cannot write that sentence, the process is not ready for an agent. An agent will resolve the ambiguity on its own, and it will resolve it in whatever direction its instructions bias it toward. That is usually not the direction you want.

**Two: Is the output something a computer can verify?**

An agent can evaluate whether a number crossed a threshold, whether a record exists in a system, whether a file was written to the right place, whether an email was sent. An agent cannot evaluate whether a client relationship is warming, whether a sales conversation had the right tone, or whether a piece of creative work is on-brand.

If the success condition requires human judgment to evaluate, the step belongs to a human seat. That does not mean the process cannot include agents. It means the agent owns the steps that end in verifiable outputs, and the human holds the step where judgment is required.

When Dash, our analytics agent, scans Meta and Google ad accounts each morning, the output is either an alert or a clear. Did any account cross the anomaly threshold against the 30-day median? Yes or no. That is a computer-verifiable output. Dash owns that step. Bogdan, our COO, owns the decision about what to do when the alert fires. That step requires company context that is not in the data.

**Three: Does the process run the same way more than once a week?**

Agents pay off on frequency. The more often a process runs, the more the agent's consistency advantage compounds against human variability. A process that runs once a quarter is a bad first candidate regardless of how well-defined it is. The frequency is too low to see the benefit and high enough to create risk if the agent gets it wrong.

Tally, our scorecard agent, pushes KPI values to the org chart four times a day on weekdays. The process runs twenty times a week. It is completely reliable and completely boring, and that reliability is what makes it worth running as an agent.

**Four: Can you fix the broken parts before you assign the seat?**

Every mature process has accumulated workarounds. Steps that exist because an earlier step produces bad output. Manual checks that exist because two systems do not talk to each other. Approvals that exist because the person upstream cannot be trusted to do it right. These are not features of the process. They are patches.

If you hand the process to an agent with the patches intact, the agent executes the patches faithfully. You have automated the workarounds. The COO's job, before any agent is assigned, is to identify every patch and trace it to the upstream failure that created it. Fix the upstream failure. Remove the patch. Then assign the seat.

Accenture's framing is worth keeping close here: "Don't make inefficiency run efficiently." The process rebuild is not a preparation step. It is the investment. It is also why the COO owns this work, not the technology team. The process belongs to operations. The agent is just the seat-holder.

## Building the hybrid chart

Once the process has cleared all four gates, you are ready to put it on the hybrid chart. Here is how we do it at Sneeze It.

Each step in the process gets a seat. One seat, one owner. No shared ownership at a step level. Shared ownership is where handoffs go to die. Every agent seat goes on the same chart as every human seat, with the same row structure: name, role, metric, target, current number.

The step that has a defined input and a computer-verifiable output gets an agent seat. The step that requires judgment, relationship context, or company-level decision authority gets a human seat.

Our morning briefing process is the clearest example of how this looks when it is running correctly. Radar, our chief-of-staff agent, pulls Slack, Google Calendar, the pipeline, the inbox, the ad data, and the project tracker into a compiled briefing every morning. Its output is a structured brief written to the Obsidian daily note. That output is verifiable: either it was written or it was not, and the contents either match the data sources or they do not. Radar owns that step.

Bogdan reads the brief and makes the decisions it surfaces. Which milestone conflict gets priority resources. Whether the stale proposal gets a follow-up. What to do with the client whose cost per lead climbed 22% in three weeks. Those steps require judgment. They belong to Bogdan's human seat.

Tally sits adjacent to Radar on the chart. Tally pushes the scorecard numbers that Bogdan reads when he looks at the dashboard. That is a separate process, a separate seat, a separate metric, running in parallel with Radar's briefing process without either of them needing to coordinate through a human. They coordinate through the agent message bus, structured messages in the agent inbox files, so the agents handle their own handoffs without putting David or Bogdan in the middle.

This is the architecture Deloitte's 2026 State of AI research points to when it describes governance maturity. Only 21% of organizations surveyed (n=3,235) have a mature governance model for agentic AI. The organizations that do have one share a pattern: named ownership of every step, clear escalation paths, and human decision authority at the points that require it. That is what the hybrid chart is. Not a technology diagram. An accountability structure.

## Setting the scorecard row

Once the seat is on the chart, it needs a metric. The metric should be in business-outcome language, not runtime language.

"Tasks completed per day" is a runtime metric. It tells you the agent is running. It does not tell you the agent is producing value. The business-outcome version of that metric depends on what the process is for.

If the process is lead intake, the metric is "qualified leads with meetings booked, within the four-hour window." If the process is ad performance monitoring, the metric is "anomalies flagged before first client call of the day." If the process is scorecard publishing, the metric is "KPI push completion rate across the four daily runs."

Each metric should have a target that the team can evaluate without ambiguity. When Arin, our call center manager agent, reports on appointment rates for the week, the target is 30% of new leads converted to booked appointments. Everyone on the Monday scorecard run can look at that number and know whether the process is working. The same conversation that happens about Bogdan's numbers happens about Arin's numbers. Same discipline, same cadence, same accountability.

This is the MIT CISR maturity model in practice. Stage 4 firms, those outperforming their industries by 13.9 percentage points in growth and 9.9 in profit, are the organizations where senior leadership has structured the accountability model first and then deployed agents into it. The accountability structure is not downstream of deployment. It is the prerequisite.

## The first week

Set the metric. Set the target. Let it run. Do not optimize in the first week. The most valuable thing the first week produces is a baseline, not results. You need to know what the process produces before you intervene on it.

At the end of the first week, review the output against the target. Not against your intuition about what should have happened. Against the metric you set before it ran. If you set the metric after seeing the results, you are rationalizing rather than measuring.

When something is off, trace it to the step first. Is the input to the agent step arriving correctly? Is the agent's output matching what the next step requires? Is the human step downstream acting on what the agent produced? The diagnosis is a process question before it becomes a technology question. The agent seat is usually not the problem. The handoff is usually the problem.

Pepper, our inbox agent, triages client emails and drafts responses. For the first two weeks Pepper ran, the output was correct but the review process was slow because we had not defined what "draft approved" looked like or how fast it needed to happen. The agent was fine. The handoff between Pepper's draft and David's approval was undefined. Once we defined it, the process stabilized inside a week.

## What comes after the first process

Once the first agent-run process is stable, the pattern for the second one is the same decision tree. Same four gates. Same chart structure. Same scorecard row.

What changes is how fast you can do it. The second process takes half the time the first one did because you have already built the chart structure, the scorecard format, and the handoff protocol. The third is faster still.

Nick, our cold prospecting agent, came online after Dirk, our pipeline agent, had been running for several months. The decision tree for Nick's process took an afternoon rather than a week, because the seat structure, the hybrid chart, and the scorecard format already existed. We just had to answer the four questions for a new process and assign the seat.

The COO who builds one agent-run process well does not have to rebuild the operating model for the second one. They are running inside a system that already knows how to hold agents accountable. That is what OTP is designed to be: not a configuration tool but a running operating system where the second seat costs a fraction of the first because the structure already exists.

## See the live chart

The Sneeze It hybrid chart, with every seat and every process accountability, is queryable from the OTP MCP.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the Sneeze It org chart and list the metrics each agent seat is accountable for."*

Every metric you see on that chart was set before the seat ran, not after. That sequence is the practice.

---

*Series: AI COO. Post 50 of an in-progress series.*
