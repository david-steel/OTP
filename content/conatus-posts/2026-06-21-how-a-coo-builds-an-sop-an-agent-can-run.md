---
title: A COO who wants agents to run reliably writes SOPs differently than they used to
date: 2026-06-21
author: David Steel
slug: how-a-coo-builds-an-sop-an-agent-can-run
type: founder_essay
status: published
series: ai-coo
series_part: 12
description: Agent-ready SOPs look different from human SOPs. Six steps the COO uses to write process that a hybrid team can actually execute and a fleet can run without drift.
---

# A COO who wants agents to run reliably writes SOPs differently than they used to

The fastest way to make an agent unreliable is to hand it a process designed for a human.

I have done this. We all do it at the start. You have an existing SOP, it lives in a doc somewhere, you paste it into the agent's instructions and assume the hard part is over. A week later the agent is doing something adjacent to what you wanted, or it is doing the right thing in the wrong order, or it is producing output that requires a human to second-guess every line before trusting it.

The SOP was not wrong. It just was not written for what an agent actually needs to execute reliably.

This is the craft the COO has to develop in the agent era: writing SOPs that a hybrid team of humans and agents can follow from the same document, where each step is unambiguous about who does the work, what the input is, what the output must look like, and what happens when something goes wrong. Accenture calls the pattern "reinvent the process before you automate it." I would put it more plainly: do not make inefficiency run efficiently. Fix the process first. Then write the SOP. Then put the agent on it.

Here is the sequence I use. Six steps, in order.

## 1. Start with the outcome, not the activity

Every SOP I build now opens with a single declarative sentence about what the process is supposed to produce. Not what it does. What it produces.

Before: "This process covers daily ad performance monitoring."

After: "This process produces a reviewed performance alert by 8 AM every weekday, delivered to the Obsidian daily note, with every anomaly above threshold either flagged or cleared."

The difference matters because agents do not have the ambient context that tells a human when they are done. A human running a monitoring process knows, roughly, when the monitoring feels complete. An agent will complete its steps and stop, whether or not it produced the thing that matters. The outcome sentence is what tells the agent what done looks like.

Dash, our analytics agent, runs a daily performance scan across Meta and Google Ads accounts. The SOP does not say "review the accounts." It says "produce a structured scan with spend vs. baseline, trend arrows, and any T20 client flagged by name, written to dash-latest.md before the morning briefing compiles." That is a testable outcome. Either the file is there at the right time with the right fields, or it is not.

## 2. Map the process before you assign the seats

The second mistake I made early was assigning seats before I understood the process. I knew Dash should handle ad monitoring, so I wrote the SOP around Dash. Six weeks later I realized two steps in the middle of the process required judgment calls that Dash should not be making alone, and I had baked those judgment calls into the agent's instructions as if they were execution steps.

The right order is: map every step of the process first, with no names on it. Just inputs, outputs, decisions, and hand-offs. Then assign each step to the seat that should own it.

When I mapped Dash's daily scan without names, I found five steps. Three were pure execution: pull the data, compare to baseline, format the output. Those belong to Dash. One was a threshold judgment: is this anomaly real or noise? That belongs partly to Dash (it has the rules) and partly to me (when the anomaly is outside the rules). One was a communication decision: should this go to the morning briefing or does it need an immediate alert? That belongs to Radar, which compiles the briefing, not to Dash.

Map first. Then assign. This is the step most COOs skip and then spend three months untangling.

## 3. Write every step in executable language

An SOP written for humans tolerates a lot of imprecision because humans fill in the gaps with common sense. "Review the pipeline" works in a human SOP because the reader knows what a pipeline review looks like in your context.

An agent SOP cannot tolerate that imprecision. The agent has no common sense in the gap-filling sense. It has the exact instructions you gave it, and it will execute those instructions literally.

This means every step in an agent-ready SOP has to answer four questions: What is the input? What is the action? What is the output? What is the pass/fail criterion?

For Tally, our KPI-pushing agent, a step that used to read "update the scorecard" now reads: "Read kpis.json, pull the current value from the source listed for each KPI, compare to the target, push the value to OTP via the update_kpi call, log the result to tally-YYYY-MM-DD.log. If more than 50% of KPIs fail in one run, send a high-priority ntfy alert to sneeze-alerts. Do not push partial data without logging the failure first."

Every word is doing work. The agent does not have to infer what updating the scorecard means. The step is executable as written.

## 4. Draw the exception boundary before the agent hits it

The single most important design decision in an agent SOP is where the exception boundary sits. The exception boundary is the line where the agent stops executing and escalates to a human.

Most COOs draw this line too wide. They worry about the agent making a mistake, so they put the exception trigger early: "if anything looks unusual, flag it." The result is an agent that escalates constantly and a human who learns to ignore the flags. You have automated the work but not the judgment, and now the human is more interrupted than before.

Some COOs draw it too narrow. They want the agent to handle everything, so they give it instructions for every edge case they can think of and tell it to keep going. The result is an agent that handles the cases they anticipated and quietly mishandles the cases they did not.

The right boundary is defined by the cost of a wrong decision. If the agent makes a bad call on this step, what is the consequence? Low consequence: let the agent decide and log it. High consequence: require human review before proceeding.

For Dirk, our sales agent, the exception boundary around outreach is explicit: Dirk drafts, David approves, Pepper sends. Dirk does not have authority to send directly. The consequence of a wrong outreach decision, a wrong tone, a message to a current client who should have been excluded, is high enough that a human is in the loop at that specific step and not at any other step. The rest of Dirk's process runs without interruption.

For Nick, our cold prospecting agent, the exception boundary is the generic-address screen. Nick will not send to info@, contact@, sales@, or any similar address regardless of how well the company fits the ICP. That is a hard stop with no escalation path. The cost of the wrong decision on that step, an email to an unmonitored inbox, is high enough that we eliminated the judgment call entirely rather than escalating it.

Draw the boundary before the agent runs. Do not learn where it should be from the errors the agent makes after it runs.

## 5. Put the handoff in writing, not in assumption

Processes in a hybrid org break most often at handoffs. A human finishes a step and the next step belongs to an agent, or an agent finishes a step and the next step belongs to a human, and the question is: how does the next seat know the first seat is done, and does the output from the first step match the format the second step expects?

In a human-only process, handoffs are mostly social. You email someone, you walk over, you mention it in the meeting. There is enough ambient context that the receiver knows what they are getting.

In a hybrid process, the handoff has to be mechanical. The first seat writes to a defined location in a defined format. The second seat reads from that location. Neither seat assumes the other is watching.

At Sneeze It, agents coordinate through inbox files. Every agent has a file at a path like ~/.claude/agent-inbox/agentname.md. When Radar needs Dash's latest numbers, it does not ping Dash. It reads dash-latest.md, which Dash wrote before the morning briefing compiled. When Dirk needs to know whether a client is on Pulse's watch list before expanding outreach, Dirk reads pulse-latest.md. The handoff is a file, not a conversation.

Crystal, our project management agent, writes its project status to crystal-latest.md on a defined cadence. Radar reads that file during the standup compile. Crystal does not need to be "running" when Radar compiles. The handoff already happened. The file is the contract.

Write the handoff into the SOP explicitly. Define the file, the format, and the cadence. If the SOP says "hand off to the next step," it is not done yet.

## 6. Build the quality loop into the SOP, not onto it

The last mistake I made, and still sometimes make, is treating quality as a review layer added after the process runs. The agent produces output, a human reviews it, the human catches problems. This feels like quality. It is actually just delayed error detection.

A well-designed SOP builds the quality signal into the process itself. The agent knows what good output looks like because the SOP defines it. The agent checks its own output against that definition before surfacing it. The human review, when it happens, is a spot check on an already-filtered output, not a first-pass scan for errors.

For Arin, our call center manager agent, the SOP for drafting team messages includes a self-check before anything goes to me for approval: does the message reference specific numbers, not generalities? Does it match the 3 wins / 3 improvements format? Does it avoid the specific patterns I have flagged as off-brand? Arin runs that check internally before I see the draft. What I review is already closer to right. My job is approval, not rescue.

This is the version of quality that actually compounds over time. The agent gets better at producing what passes the check. The check tightens as I learn what to look for. The loop is inside the process, not outside it.

The COO's job in the agent era is not to run quality control on agents. It is to build quality into the SOP so the agent can run it without the COO in the middle of every cycle. That is what lets agents carry the operational work. And that is what frees the humans on the chart for the work that actually requires a human.

Bogdan is not reviewing Dash's daily scan. Janine is not proofreading Tally's KPI pushes. They are doing the work that requires judgment, relationship, and context that an agent does not have. The agents are doing the rest. That split is the whole point.

The SOP is what makes it work.

## See the live chart

Every seat named in this post holds a specific row on a queryable org chart, with its SOP scope, its KPI, and its handoff protocol documented.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the Sneeze It org chart and describe the handoff protocol between Dash and Radar."*

The response will show you what a documented hybrid handoff looks like in a running org, not as a template, but as live data.

---

*Series: AI-Era COO. Post 12 of an in-progress series.*
