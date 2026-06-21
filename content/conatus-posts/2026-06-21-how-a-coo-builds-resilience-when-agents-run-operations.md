---
title: The COO who builds resilience into an agent-run operation knows which failures will happen and designs for them
date: 2026-06-21
author: David Steel
slug: how-a-coo-builds-resilience-when-agents-run-operations
type: founder_essay
status: published
series: ai-coo
series_part: 24
description: Four failure modes that hit every agent-run operation eventually. How the COO designs for recovery, not just prevention, before the fleet breaks at runtime.
---

# The COO who builds resilience into an agent-run operation knows which failures will happen and designs for them

Resilience is not what you build after the operation breaks. It is what you design before the fleet goes live, because you already know, with reasonable confidence, how it is going to break.

That is the central claim I want to make here, and I want to make it early because the rest of this post depends on it. The COO's job is not to prevent every failure in an agent-run operation. That is not a reasonable goal and pursuing it produces paralysis. The job is to identify the four or five failure modes that are structurally inevitable in a hybrid operation, design the recovery path for each one before the operation starts, and then build the monitoring layer that tells you when a failure has actually occurred.

Accenture's framing for agent deployment is worth keeping close: reinvent the process first, then infuse the agent. Do not make inefficiency run efficiently. I read that as the upstream version of resilience design. You fix the process before you automate it, which means you are not designing around a broken process and you are not automating the defects in. But even a clean process, handed to a well-designed agent fleet, will encounter failure modes you cannot prevent. That is what this post is about.

## The four failures that hit every agent-run operation eventually

I run a hybrid team at Sneeze It. We have Radar handling daily operations and briefings. Tally pushing KPI values to the scorecard four times a day on weekdays. Dash running advertising analysis across every client account. Arin managing the call center team through daily Slack coaching. Dirk owning our sales pipeline. Nick prospecting in health and wellness. Pepper triaging email. Crystal tracking every project and delivery risk. Bogdan as COO on the human side. Janine in accounting.

This is an operation that runs on agents carrying the operational load so that people are free for the work that only people can do. And in running it, I have seen the same failure modes appear regardless of how carefully the seats were designed.

### Failure mode one: the silent stale agent

The agent runs. It has been running for days. The output it produces no longer reflects current data because something upstream changed and the agent did not know to stop.

This is the most common failure in an agent-run operation and the hardest to catch without a monitoring layer, because the agent's behavior looks completely normal from the outside. It is still executing. It is still producing output. The output is just wrong.

At Sneeze It, Radar flags any shared state file older than 18 hours as stale in the morning briefing. That is not optional. The 18-hour threshold exists because we know that a briefing built on a 30-hour-old Dash scan is not a briefing. It is a historical document presented as current intelligence, and making decisions from it is worse than making decisions from nothing because you do not know you are working from bad data.

The design principle for this failure mode is: the agent must not be the only thing that knows whether its data is current. Build the staleness check into the system that reads the output, not just into the agent that produces it. The reader is the second check.

When Tally fails to push a KPI because the source file is missing, Tally does not silently skip it. It logs the skip, and if more than half the KPIs fail in a single run, it alerts at high priority. The threshold matters. A single skip can be noise. A pattern of skips is a signal that something broke upstream. Designing the threshold in advance is the difference between a monitoring layer and a log nobody reads.

### Failure mode two: the broken handoff that nobody catches

Agents at Sneeze It coordinate through structured inbox files. Dirk sends a REQUEST to Pulse's inbox before running any expansion outreach on a client. Pulse reads the request and responds with clearance or a hold. Pepper routes client email drafts to David for approval before anything goes out. Crystal writes project status updates that Radar reads during briefings.

Every one of those handoffs is a point where the chain can break invisibly.

Dirk sends a REQUEST. Pulse's inbox file is corrupted or missing. Dirk does not get a response. What happens next? If there is no timeout logic, Dirk waits indefinitely. If there is timeout logic but no escalation path, the outreach neither runs nor gets flagged. The lead goes cold. Nobody knows why.

The design principle for this failure mode is: every handoff must have a defined timeout and a defined fallback behavior. "Wait indefinitely" is not a fallback. "Fail closed and alert" is a fallback. "Proceed without clearance" is almost always wrong for anything that affects a client relationship, which is why Dirk failing to get Pulse clearance should default to holding the outreach and alerting, not proceeding.

We also design the inbox files themselves to be observable. If a message has sat in an agent's inbox without a response for longer than the expected cycle time, that is a signal that the receiving agent is not running, the file path changed, or the response was eaten somewhere in the chain. Designing the observability into the handoff is cheaper than debugging a broken chain after two weeks of invisible failures.

### Failure mode three: the cascading error

The most dangerous failure mode in an agent-run operation is not the agent that gets something wrong. It is the agent that gets something wrong and feeds that error to the next agent in the chain, which feeds it to the next, and by the time the error reaches a human it has been amplified through four processing steps and the original source is invisible.

Dash produces a spend report. The baseline it is comparing against drifted because the time window calculation changed. Radar reads the Dash output and builds the daily briefing on it. David reads the briefing and makes a client decision based on a comparison that no longer means what he thinks it means.

Nobody in that chain lied. Every agent did exactly what it was designed to do. The error was in the baseline, not the logic, and it traveled the full chain before anyone had a chance to catch it.

The design principle for this failure mode is: put human checkpoints at the natural seams in the chain, not at the end of the chain. The end-of-chain review catches errors after they have already been amplified. A seam review catches them before they travel.

At Sneeze It, Bogdan does not review the final output of every agent process. He reviews the inputs and outputs at specific seam points: where Dash output goes into the client strategy conversation, where Crystal's project risk flags go into the resourcing decision, where Dirk's pipeline analysis goes into the sales call. The seam points are not chosen arbitrarily. They are the places where an error in the upstream data would change the human decision. Those are the review gates that matter.

Deloitte surveyed 3,235 enterprises in 2026 and found that only 21 percent have a mature governance model for agentic AI. The other 79 percent are not necessarily running agents carelessly. Many of them have review processes. But review at the wrong points in the chain is not governance. It is theater. The COO has to know which seams carry the most risk and put the checkpoints there.

### Failure mode four: the retired seat that left a gap

Jeff was our data integrity agent. We retired him in April 2026 after a formal hearing. The hearing produced a clear record: what he was accountable for, why the seat was no longer serving the business, and where each capability was redistributed. Dash inherited the ad pacing monitor. Dan absorbed the blind spot identification function. Crystal took the budget reconciliation work.

That redistribution map is the entire point of a retirement protocol that takes the seat seriously. Because the failure mode is not the retirement itself. The failure mode is the retirement that leaves a gap nobody named.

An agent that stops running without a deliberate handoff does not leave an error. It leaves silence. Work that was previously getting done stops getting done. No alert fires. No metric drops immediately, because the metric was the agent's output and the agent is no longer producing it. The gap opens quietly and it compounds quietly until something downstream breaks badly enough that someone traces it back to the seat that went dark.

MIT CISR's research on enterprise AI maturity found that the biggest performance jump happens when organizations move from running individual AI pilots to developing genuine AI ways of working. A retirement protocol is part of those ways of working. It is not ceremony. It is the operational discipline that keeps the fleet coherent as it evolves.

The design principle for this failure mode is: treat agent retirement as a handoff event, not a shutdown event. Map every dependency before the seat goes dark. Assign every function to a named seat. Verify that the receiving seats are actually running the redistributed work one week after the retirement. Then close the record.

## The recovery posture the COO sets

Across all four failure modes, the underlying posture is the same: the COO designs for recovery, not just prevention.

Prevention is the work you do before the fleet goes live. Process redesign. Scope gates. Output standards. Quality gates built into the process, not bolted on after. All of that matters and none of it is sufficient, because a fleet that runs in a real environment will encounter inputs, edge cases, and chain failures that were not in the design spec.

Recovery is the work you do so that when the fleet breaks, the operation does not break with it. Timeouts that default to safe behavior. Seam checkpoints that catch errors before they amplify. Staleness flags that tell the reader when the data cannot be trusted. Retirement handoffs that leave no gaps. Human seats that are positioned not to review routine output but to catch the specific failure modes that agents cannot catch about themselves.

The agents at Sneeze It carry the operational load. Radar runs the daily briefing. Tally keeps the scorecard current. Dash keeps the ad analysis current. Arin keeps the call center accountable. That is the operating model. But Bogdan and Janine are not out of the picture. They are positioned at the seams where human judgment is the only check that matters, and at the failure modes where agent self-reporting is structurally insufficient.

That is the resilience architecture. Agents carry the work. Humans hold the recovery gates. The COO designs both.

## See the live chart

Every seat in our hybrid operation, including which failure modes each seat is designed to detect and recover from, is queryable from OTP MCP.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the Sneeze It org chart and which seats are agent-operated versus human."*

The structure you see is not an org chart with agents added. It is a resilience architecture with seats assigned to the points where each type of failure gets caught.

---

*Series: AI-Era COO. Part 24 of an in-progress series.*
