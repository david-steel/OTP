---
title: The COO maps which work goes to agents before the first agent is deployed
date: 2026-06-21
author: David Steel
slug: how-a-coo-maps-which-work-goes-to-agents
type: founder_essay
status: published
series: ai-coo
series_part: 9
description: Before you deploy an agent, map every operational task to one of four buckets. That map is the COO's real contribution to the agent operating model.
---

# The COO maps which work goes to agents before the first agent is deployed

The most expensive mistake I made early in building the Sneeze It agent fleet was letting enthusiasm drive the sequencing.

I knew agents could help. I started deploying them where they seemed useful. A briefing agent here, an analytics agent there. The agents were capable. The results were uneven. It took a few months before I understood why.

The problem was not the agents. The problem was that I had skipped the mapping step.

I had not drawn a clear line across all of our operational work: this side goes to agents, that side stays with humans. Accenture's operations teams put it plainly: do not make inefficiency run efficiently. Fix the process before you add the agent. I was adding agents before the process was ready for them.

The mapping step is the COO's actual contribution to the agent operating model. Without it, you are not automating your operations. You are automating your guesswork.

## Before the map

Before I had any mapping discipline, work at Sneeze It got assigned based on availability.

Radar did not exist, so morning briefings were assembled by whoever had bandwidth. Bogdan, our COO, would pull Slack threads, check Accelo, look at the pipeline, and synthesize a picture of the day. Ninety minutes. Information retrieval and formatting, every morning. Not strategic work.

Dash did not exist, so ad performance data arrived a day old on a human analyst's schedule. When they were out, we were blind. Tally did not exist, so KPI updates happened when someone remembered. We were making current decisions against lagging data.

The humans doing this work were not doing human work. They were doing retrieval, volume, pattern-matching. The before state is always the same: the humans are the system, so the system breaks when the humans have a hard week.

## The four-bucket map

The map has four buckets. Every recurring operational task goes into one before you deploy anything.

**Bucket one: routine, rule-based execution.** Clear trigger. Clear output. Clear completion standard. No judgment in the step. This work goes to agents without qualification.

Tally is this bucket in its purest form. Pull the KPI value from the source file, push it to the scorecard, four times a day. Every element is defined. Nothing for a human to contribute that Tally is not doing better.

**Bucket two: volume work with a quality gate.** Repeatable and pattern-based, but the output goes to a human before it acts on the world. The agent does the research, drafting, synthesis. The human reviews and releases.

Dirk, our sales agent, lives here. Dirk identifies reactivation candidates, drafts outreach, queues the emails. The draft is agent work. The send is human-approved. Nick, our cold prospecting agent, does the same: thirty outreach drafts per day, reviewed before anything leaves Gmail. The agent handles volume. A human holds the gate.

**Bucket three: exception handling and escalation.** Looks routine until it is not. The agent monitors and flags. The human investigates and decides.

Dash scans thirty-plus ad accounts across Meta and Google, compares every client against prior-day, seven-day, and thirty-day medians. When a number crosses a threshold, the flag goes into the briefing. Dash does not diagnose the cause or recommend a fix. Bogdan or I decide what the number means. The agent handles the monitoring. The human handles the meaning.

**Bucket four: judgment work.** Requires context that cannot be captured in rules, relationships that live in memory rather than data, decisions that carry organizational stakes. This stays with humans, always.

Whether to fire a caller. Whether to pause a client's account while results are weak. Whether to write off a late invoice. Bogdan makes those calls. Janine, our human in accounts receivable, makes those calls in her domain. No agent is chartered to touch them.

## What the map revealed

When I did this exercise for the first time, two things became clear.

Most of what our people were spending time on fell in buckets one and two. Routine execution and volume-with-a-gate. Not judgment work. The capable humans we hired were doing work that did not require capable humans, because there was nothing else to do it.

The second finding was harder. The work I had already given to agents was not always the right work. I had deployed Radar before mapping whether the briefing process itself was working. It was not. The briefing pulled from six sources with no priority logic and no format built for fast consumption. I was automating a broken process.

When I fixed the briefing first and then handed it to Radar, the output became useful. Same agent. Different underlying process. The map forced the fix before the automation.

## How the hybrid chart follows from the map

Once the map is drawn, the chart writes itself.

Bucket-one work gets an agent seat with a one-sentence definition. One named thing, one named output, one named metric Tally will push to the Monday scorecard. If you cannot write that sentence, the seat is not ready.

Bucket-two work gets an agent seat paired with a named human at the approval gate. Dirk drafts. I approve before Pepper sends. Two seats, explicit handoff.

Bucket-three work gets an agent seat with a defined escalation path. Dash flags. The flag goes to the briefing. Bogdan reads the briefing. Every link is named. The human at the end knows they are at the end.

Bucket-four work stays on a human seat. Bogdan. Janine. Me. The agents feed those seats with better information than any human system could produce. The seat holder makes the call.

The result is a chart where every seat has one owner and one clear answer to the question: judgment seat or execution seat. Crystal watches project milestones in Accelo. Arin watches dial volume and appointment rates for the calling team. No overlap, no gap.

When Jeff, a former agent who held a blurry data-integrity role, was retired after a formal review, his capabilities went to seats with cleaner mandates: Dash took the ad account monitoring, Crystal took the Accelo reconciliation. Those seats had one-sentence definitions. Jeff's never did. That was the actual problem.

## The COO's ongoing job after the map

After the map is drawn, the COO owns the quality gate. Not auditing every agent output, which defeats the purpose. Owning the criteria agents operate within and checking whether those criteria are still right.

Arin monitors the calling team and drafts coaching messages when appointment rates drop or speed to lead slows. I review what Arin flagged and why. I am not re-doing Arin's work. I am checking whether the criteria have drifted from what we actually need. The COO does not run the operation. The COO governs the criteria.

When every seat has a clear definition and every bucket has a named owner, the gate is systematic rather than reactive. You are not fighting fires. You are checking the structure that prevents them.

Let agents carry the operational work so people are free for the work that matters. The map is how you figure out which is which. You cannot skip it. It is the first job, and it has to come before the first deployment.

## See the live chart

The Sneeze It org chart is queryable from OTP MCP.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the Sneeze It org chart and identify which seats are agents running routine execution versus humans holding judgment calls."*

The response shows the live structure, not the planned one, which is the version worth learning from.

---

*Series: AI COO. Post 9 of an in-progress series.*
