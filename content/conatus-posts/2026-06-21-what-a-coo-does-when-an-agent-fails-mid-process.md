---
title: When an agent fails mid-process, the COO decides what happens in the next sixty seconds
date: 2026-06-21
author: David Steel
slug: what-a-coo-does-when-an-agent-fails-mid-process
type: founder_essay
status: published
series: ai-coo
series_part: 25
description: Agent failure mid-process is not a technical incident. It is an operational decision. The COO who has the response built before the failure owns the outcome.
---

# When an agent fails mid-process, the COO decides what happens in the next sixty seconds

The failure will happen. It is not a question of whether your agents will fail mid-process. It is a question of what the organization does in the sixty seconds after.

Before I worked through this, my answer to that question was honest but not good. The agent would stop producing output. Someone would notice. That someone would find me. I would diagnose what happened and decide on a fix. The process would sit idle in the meantime, and whatever the agent was feeding would go without input until I got back to it.

That is not a failure response. That is a pause with no defined end.

The COO's job is to have the response built before the failure, so that the sixty seconds after a mid-process agent failure are decisive rather than improvised.

## What mid-process failure actually looks like

An agent failing to start is visible. An agent failing silently mid-process is the expensive version.

The failure mode I see most often is not a crash. It is a seat that keeps running but stops producing reliable output. The agent is technically alive. The process technically continues. But the output quality has degraded or the state file has gone stale, and the downstream seat that depends on that output is now working on bad data without knowing it.

Radar, our chief-of-staff agent, reads shared state files from six other agents every morning to compile the briefing I review. If Dash, our analytics agent, produces a state file with a corrupted timestamp, Radar reads it and reports the data as current. The output looks right. The data is wrong. Nothing crashed. The process failed silently, and I read a briefing anchored to stale numbers without knowing they were stale.

That is why we build an 18-hour freshness threshold into Radar's compile step. If any shared state file is older than 18 hours when Radar reads it, the briefing flags it as stale. Not a crash. Not an alarm. A flag that tells me exactly which seat produced stale output and when.

The COO has to know the difference between a visible failure and a silent one, because the response protocol is different for each.

## The before state: improvised response

Before I built a response protocol, a mid-process failure at Sneeze It looked like this.

Nick, our cold prospecting agent, produces 30 outreach drafts per batch. The drafts go to Gmail. I approve and send. If Nick's pipeline broke mid-batch, because the email validation step returned an unexpected error from the LeadMagic API, the batch would stall. Nick would have produced some drafts and stopped. I would not know which drafts were clean, which were incomplete, and which address validations had not run. The safe response was to delete the partial batch and restart from the last clean state. But I did not have a documented last clean state, because I had not built checkpointing into the batch process.

The fix in this scenario took 40 minutes: diagnosing the stall, identifying which records had been processed, manually rerunning validation on the unprocessed records, and restarting the draft step from the right position in the list. Forty minutes for what should have been a five-minute recovery.

The same pattern repeated itself in other seats. When Pepper's Gmail MCP connection dropped during an inbox triage run, I did not know which emails had already been triaged and which were still unread. When Tally, which pushes KPI values to the OTP scorecard four times a day, missed a scheduled run due to a source file parse error, the scorecard showed a stale number and nobody knew when the last clean push had run.

Improvised response has a consistent cost: it takes ten times longer than it should, it makes more errors than a documented recovery, and it teaches you nothing that sticks.

## The after state: a response built into the process design

After I worked through this, a mid-process agent failure at Sneeze It produces a decision in less than 60 seconds and a recovery in under ten minutes for most failure types. The difference is not that the agents fail less. It is that the process was designed with the failure response built in.

Three things changed.

First, every agent process that runs in stages now has checkpointing. Each stage writes a record of what it completed before passing to the next stage. Nick's prospecting pipeline writes a checkpoint after validation and another after draft creation. If the process stalls, I know exactly how many records cleared validation, how many drafts exist, and where the batch stopped. Recovery means restarting from the checkpoint, not from the beginning.

Second, every agent seat has a defined coverage seat for critical outputs. Dash produces the client advertising analysis I read in the morning briefing. If Dash produces stale or corrupted output, the coverage protocol is: Radar flags the stale state file, I acknowledge the flag in the briefing, and the analysis for that day is skipped rather than run on bad data. That sounds simple because it is. The decision I would otherwise have to make, whether to run the briefing anyway and note the gap, or delay the briefing, or manually pull the numbers, is pre-made. Skipping the stale data and flagging it clearly is better than any alternative in most cases. Writing that down once means I do not have to think about it when the failure happens.

Third, every failure produces a learning that enters the system before I close the incident. This is the Accenture point about reinventing the process before automating it, applied after the fact. When a failure exposes a process weakness, the weakness gets fixed before the process restarts. When Nick's batch stalled because LeadMagic returned an unexpected error code, the fix was not just to restart the batch. It was to add that error code to Nick's handled-errors list, so the next occurrence produces a clean failure message rather than a silent stall.

## How to map your failure response before the failure

The COO who wants this posture before a failure happens has to answer four questions about each agent process.

Where are the checkpoints? Any process longer than three sequential steps needs a checkpoint between steps. The checkpoint records what was completed and writes it to a readable state before moving on. This is not a logging question. It is a recovery architecture question. If the process fails at step four, can you restart from step three without redoing steps one through three? If the answer is no, you do not have checkpoints.

What does the downstream seat do if this output is missing or stale? Downstream seats in a hybrid org do not wait indefinitely. They make do. The question is whether they make do with a known degraded state or with a corrupted input they cannot identify as corrupted. Arin, our call center manager agent, reads the CCM-Stats data before drafting coaching messages for Amanda and Erica. If that data is missing, Arin's response is to skip the draft and flag the gap, not to draft on stale numbers. That is a defined coverage response, not improvisation.

Who decides, and how fast? Not all mid-process failures are equal. A Tally KPI push that misses one run is a minor stale-data problem that self-corrects at the next scheduled run. A Pepper triage stall in the middle of a high-volume client email day is a higher-urgency problem that needs human resolution within the hour. The COO has to pre-categorize failure types by urgency so that the decision to escalate or wait is not made fresh each time.

What enters the system from this failure? Bogdan, our human COO, runs a weekly audit of incidents from the prior seven days. Each incident has a record: what failed, what the recovery was, what was changed to prevent recurrence. That record is not ceremonial. It is the COO's source material for process improvement. An agent fleet that fails without producing learning is an agent fleet that fails the same way repeatedly.

## The retirement that clarified the difference between process failure and seat failure

Jeff, our former data integrity agent, was retired in April 2026 after a formal hearing. His case is worth describing here because it illustrates the distinction the COO has to make when an agent is failing: is this a mid-process failure, or is this a seat that should not exist?

Jeff had several mid-process failures in his final weeks. His scanner ran stale for five or more days. His output produced false positives on budget data that required repeated corrections. When I investigated, the failures were not primarily checkpointing or coverage problems. The failures traced to a deeper issue: the work Jeff was supposed to do had been absorbed by other seats. Dash had taken over the spend anomaly detection. Crystal was handling the billing reconciliation. Jeff was running, but the inputs he was built to process were no longer routed through his pipeline.

That is a different failure from a mid-process stall. A mid-process stall means the process broke and needs recovery. A seat that has nothing left to process means the process has moved and the seat is running on empty.

The COO has to distinguish between those two things, because the response is completely different. One requires an incident response. The other requires a retirement hearing.

Jeff's retirement produced a documented redistribution of his capabilities: Dash took the pacing monitor, Dan absorbed the blind spot analysis, Crystal took the budget reconciliation. Capabilities redistributed and clearly assigned means the work is still happening. The seat is gone. The work is not.

## What agents carry, and what humans own

The reason a COO needs to build this before the failure is that the failure moment is the wrong time for first principles thinking.

Let agents carry the operational work so people are free for the work that matters. That principle only holds if the operational work agents carry is covered when the agent fails. If every agent failure routes to a human doing the agent's work manually, you do not have an agent fleet. You have a fleet that works when conditions are perfect and falls apart when they are not.

Bogdan and Janine are not backstops for agent failures. They are doing the relational, judgment-intensive, exception-handling work that cannot be systematized. When Pepper flags an unusual client email that does not fit any of its triage buckets, Janine is not in the loop because Pepper stalled. She is in the loop because that specific exception requires the kind of relational judgment only a person with the client history can provide.

The COO's job is to make that distinction explicit in every process design: what does the human do when the agent runs correctly, and what does the human do when the agent fails? Those are two different questions with two different answers. If the answer to both is "the human steps in and does the work," the process was not really delegated to the agent. The agent was just a first attempt that defaulted to a human when it did not work.

## See the live chart

Every agent seat at Sneeze It, including its failure response protocols, is queryable from OTP MCP.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the Sneeze It org chart and which seats have defined coverage protocols."*

A fleet without documented failure response is a fleet that improvises at the worst moment. The OTP structure makes the response visible before you need it.

---

*Series: AI-Era COO. Part 25 of an in-progress series.*
