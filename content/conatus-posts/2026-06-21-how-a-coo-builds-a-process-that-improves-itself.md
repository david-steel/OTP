---
title: A process that improves itself does not happen by accident. The COO has to build it on purpose.
date: 2026-06-21
author: David Steel
slug: how-a-coo-builds-a-process-that-improves-itself
type: founder_essay
status: published
series: ai-coo
series_part: 47
description: Self-improving processes are not emergent. They require a correction channel, an update path, and a seat that owns the improvement. Here is how to build one.
---

# A process that improves itself does not happen by accident. The COO has to build it on purpose.

Every operations leader I have talked to in the last two years has said some version of the same thing: the agents are running, the throughput is up, the team is freed from the routine work. Good. And then, six months later, the same person tells me the processes have drifted, the agents are doing things slightly wrong, nobody knows when it started, and the correction requires reconstructing what the process was supposed to do in the first place.

The throughput improved. The process did not.

That is the distinction this post is about. A faster process is not a better process. A process that improves itself is a different category of thing entirely, and it does not come from adding agents. It comes from deliberately building four components that most COOs skip because they feel like overhead: a correction channel, a seat that owns improvement, an update propagation path, and a discipline for telling the difference between a bad run and a flawed design.

Here is the worked example from inside our operation.

## The prospecting process before the correction channel existed

In early 2026, Nick, our cold prospecting agent, was running batches of thirty outreach drafts per day against health and wellness targets. The process had a hard ICP filter, a validation gate, a Kennedy-pattern drafting engine, and a do-not-contact list that was supposed to catch brands we had already touched.

The process ran well in the first week. By week four, David had flagged the same two categories of mistake three times each. First: brands that were close enough to ICP to pass the filter but wrong enough in practice that they wasted a slot. Second: contacts that were technically valid email addresses but functionally the wrong person, the kind of info@ or manager@ that never converts.

Nick had a do-not-blast list. What he did not have was a way to feed David's corrections back into the process permanently. When David flagged a brand, Nick removed it from the current batch. The same brand could surface again in the next batch unless someone manually added it to the list. The correction happened once. The learning did not persist.

This is the failure mode that makes processes drift. The execution loop runs correctly. The correction exists but lives outside the execution loop. The loop and the correction never touch.

## The four components a self-improving process actually needs

A self-improving process is not a process that runs faster or a process that generates more throughput. It is a process where each correction makes the next run better than the last. Building it requires four things working together.

The first is a correction channel. This is a place where every correction David makes to an agent's output goes, immediately and permanently, before the next run begins. At Sneeze It, Nick's correction channel is a reference file called do-not-blast.md. When David flags a brand post-batch, Nick adds it before the session ends. The file is Nick's long-term memory for the ICP boundaries David has refined in practice. The correction channel is not a log. It is a live input to the next execution.

The second is a rules layer that captures the pattern, not just the instance. A correction that says "remove this brand" fixes one case. A correction that says "remove any brand whose primary model is transaction-based rather than appointment-based" fixes the category. The pattern correction is what keeps the same type of mistake from resurfacing in different clothing. At Sneeze It we use OTP's learning network for this: when David corrects an agent's output, the agent captures what failed, what to do instead, and why, in language general enough to catch the next variant. The OTP rules layer is what makes a correction into a standard.

The third is an update propagation path. This is how the correction gets into the process before the next run. If the correction exists in a file the agent reads at the start of every batch, it propagates automatically. If it exists in a meeting note, a Slack message, or a mental note the COO intends to formalize later, it does not propagate. At Sneeze It, every correction that changes how Nick should work goes into his reference files, not into a task backlog. The task backlog is where corrections go to die. The reference file is where they go to run.

The fourth is the discipline to distinguish a bad run from a flawed design. Not every mistake means the process is wrong. Sometimes the input was unusual. Sometimes the agent hit an edge case that should be handled, just not by changing the core process. The COO who redesigns the process after every exception builds a process that never stabilizes. The COO who redesigns the process when the same exception appears three times builds a process that tightens toward accuracy over time. Three is not a magic number. The point is that a single deviation is a data point. A pattern of deviations is a signal that the design has a gap.

## What it looks like when all four are working

Here is the Nick prospecting process after we built all four components.

Nick runs a batch. David reviews. David flags: "This company does a walk-in model, not appointments. Remove from list, and exclude this category going forward." Nick adds the specific brand to do-not-blast.md. The agent also captures the general principle through OTP: ICP must include appointment-based booking funnel, not transaction-at-door. That rule surfaces in future runs before the qualification step, not after the draft is already written.

The propagation is immediate. The next batch runs against a tighter filter. The mistake does not repeat. And the correction that happened in session thirty-two is now part of what session seventy runs.

This is what "a process that improves itself" actually means. Not that the agent learns on its own. Agents do not have that capability in any meaningful operational sense. The process improves because the COO built a channel that carries corrections from execution back into design, and an update path that carries updated design back into execution. The human judgment is still in the loop. The loop is just structured to capture it.

## The seat that owns improvement is not the same as the seat that runs execution

This is the part most COOs miss, and it is the reason many hybrid processes look great for six months and then drift.

At Sneeze It, Nick owns execution. His seat is measured on quality drafts per day, ICP pass rate, and validation pass rate. Tally pushes those numbers to the scorecard four times a day. Bogdan reviews them as part of the Monday briefing that Radar compiles.

But no agent owns the improvement of Nick's process. That seat belongs to a human. Specifically, it belongs to David, who reviews the batch outputs and flags the corrections, and to Bogdan, who owns the process design decisions that govern what Nick is allowed to do. The improvement loop requires a human who has the judgment to distinguish a bad run from a flawed design, the authority to change the process, and the discipline to route every correction through the channel instead of handling it one-off.

When the execution seat and the improvement seat are the same, improvement does not happen. The executor is too close to the current run to ask whether the design is right. The executor's incentive is to produce output. The improver's job is to question the process that produced it. These are different cognitive modes and they need to be separated on the chart.

This is also why the COO is the natural owner of process improvement in a hybrid operation. Not the technology team, not the AI lead, not the operations manager who is also running execution. The COO holds both the process design authority and the accountability for outcomes, which means she is the only seat positioned to see when a pattern of deviations signals a design flaw rather than an execution failure.

## Where Dirk and the message bus fit in

The correction channel matters most at the boundary between agents, not just between human and agent.

Dirk, our pipeline agent, and Nick, our cold prospecting agent, coordinate through the agent message bus. Nick handles cold outreach. Dirk handles reactivation and warm follow-up. The coordination rule is explicit: if a brand appeared in Dirk's outreach in the last thirty days, Nick skips it. The agents share a coordination file that tracks which brands Dirk has touched.

When that coordination breaks down, it is not a Nick failure or a Dirk failure. It is a process design failure at the handoff. And the signal it generates is a specific kind of message through the agent inbox: "I drafted outreach to a brand Dirk just contacted." That message should not exist if the coordination is working. When it appears, it means the shared state file has a gap.

The COO who sees this message and says "fix the message" has handled an exception. The COO who sees this message and asks "why did the coordination file miss this brand?" is doing process improvement. The investigation usually leads to a gap in how brands are recorded or how the skip-check is timed. The fix goes into the coordination file format and the timing of when Nick reads it. The next run does not produce the same message.

This is the worked example for why process improvement at the handoff level requires the same four components: a correction channel (the agent inbox message), a rules layer (the coordination file format), an update propagation path (the reference files both agents read), and the discipline to trace the exception to its design cause rather than just suppressing the symptom.

## What Accenture and the MIT CISR data say about improvement architecture

Accenture's core guidance for agentic AI is to reinvent the process before you infuse the agent. That is the pre-deployment gate. What comes after is the improvement architecture, and the advisory firms are quieter about it.

The MIT CISR maturity research is instructive here. Stage 4 firms (the ones running 13.9 percentage points above industry average on growth) are distinguished not by which agents they deployed but by the operating model they built around those agents. A united senior leadership team, a shared accountability structure, and a governance model that connects execution to design decisions. That connection is the improvement loop. Without it, firms that deploy agents stay in Stage 2 or Stage 3 regardless of how many agents they add.

Deloitte's 2026 State of AI in the Enterprise found that only 21 percent of organizations have a mature governance model for agentic AI. The maturity gap is mostly a loop gap. Organizations that govern agents without a feedback path from execution to design are controlling the fleet, not improving it. Control without improvement is how a process drifts while looking stable. The scorecard shows green. The process is slowly wrong.

## The compounding that happens when the loop is closed

After eighteen months of running Nick and Dirk with the correction channel in place, the prospecting process looks almost nothing like the process we launched with. The ICP definition has tightened four times. The generic-address exclusion list has grown from three categories to nine. The coordination protocol between Nick and Dirk has been updated twice based on handoff failures that the agent inbox made visible. The do-not-blast list has absorbed every brand David has flagged without any of those brands resurfacing.

None of these improvements came from the agents getting smarter. They came from a COO who built a channel for corrections, a path for propagating them, and the discipline to act on patterns rather than one-off exceptions.

The result is that the process today catches mistakes the process six months ago would have produced. Not because we redesigned it in a project. Because each correction closed the loop and made the next run tighter.

That is what a self-improving process actually is. Not a system that optimizes itself. A system that is designed so that human corrections compound instead of evaporate.

Let agents carry the operational work, so people are free for the work that matters. The work that matters, in this case, is building the loop that makes the operational work better every week. That loop is the COO's job. Nobody else on the chart has both the authority and the accountability to build it.

## See the live chart

The seats described in this post, Nick, Dirk, Bogdan, Radar, and Tally, hold named rows on the Sneeze It org chart, queryable from OTP's MCP server.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me which seats on the Sneeze It chart are accountable for execution versus process improvement."*

You will see every seat, its owner, and its accountability in a live structure you can query against your own chart.
