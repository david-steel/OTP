---
title: The audit trail problem is not a technology problem. It is a discipline problem.
date: 2026-06-20
author: David Steel
slug: keeping-audit-trails-when-agents-do-the-work
type: founder_essay
status: published
series: ai-cfo
series_part: 27
description: Why audit trails break when agents act, what causes the gap, and how structured shared state fixes it without slowing the work down.
---

# The audit trail problem is not a technology problem. It is a discipline problem.

Most of the questions I get about running agents in a finance function come down to one word: accountability. Who did what, when, and why. If a number is wrong, how do you know which seat touched it last? If a billing decision was made, where is the record?

The honest answer is that agents make this harder before they make it easier. A human sends an email, opens a spreadsheet, updates a record. You can see the fingerprints. An agent executes a sequence of actions in three seconds and writes nothing unless you told it to write something.

That gap is not a flaw in the agent. It is a discipline failure in how you set the agent up.

The claim I want to defend here is this: audit trails when agents do the work are not a logging problem or a software problem. They are a protocol problem. If you solve the protocol, the audit trail is automatic. If you do not solve the protocol, no amount of logging will save you.

## Why the fingerprints disappear

Here is what happens with a naive agent setup. You tell the agent to push KPI values from a source file to the scorecard. The agent does it. The scorecard gets updated. The finance review happens on Friday. Someone asks how the accounts receivable number moved between Monday and Thursday. Nobody knows. The agent ran. The number changed. The trail ends there.

The reason this feels unsolvable is that we are thinking about it like a human workflow. With a human, you recover the trail by reading email threads, looking at document revision history, pulling Slack. With an agent, there are no email threads. There is no revision history unless the agent was designed to create one.

So the instinct is to add logging. Pipe every agent action to a log file. Add a timestamp column to every database table. Buy an observability tool. This is not the wrong instinct, but it misses the deeper problem. Logging tells you what happened. It does not tell you what was decided, what was checked before the action, or what the state of the world was at the moment the action ran. Logging is a timestamp with a label. An audit trail is a story with context.

## What the trail actually needs to contain

An audit trail that holds up contains three things. What the seat observed before acting. What the seat decided to do and why. What the seat wrote as a result.

Notice that a human who is doing this job well produces all three naturally. Janine, our human in the accounting seat, reads a vendor invoice before she approves it (observation). She checks it against the budget and the contract before she releases the payment (decision). She logs the payment in the system with the invoice reference attached (written result). The trail is there because the work itself produced it.

An agent can be designed to do the same. The agent reads the source (observation, committed to a shared state file). The agent applies a rule (decision, logged to a structured record). The agent writes the output and notes what rule fired and what inputs triggered it (written result). The trail is there because the protocol requires it.

The difference is that Janine produces the trail because that is how human knowledge-work evolved over decades of audit requirements. The agent produces the trail only if you built the protocol before you deployed the agent. The trail does not emerge. You design it in.

## How this works in practice at Sneeze It

Tally is the agent on our chart that pushes KPI values from local sources to the OTP scorecard. Every time Tally runs, it writes to a log file with the timestamp, the KPI ID, the value it pushed, the source it read, and the rule it applied to extract the value. Not as an afterthought. As the first action before anything else happens.

The reason this matters became clear on a Thursday afternoon when the scorecard showed a number I did not recognize. I asked what happened. I looked at the log. Tally had run at 15:15, read the queue status count from the source file, applied the regex handler, and pushed the result. The source file had a formatting anomaly from an upstream process. The rule ran correctly on the anomalous input and produced a garbage value. The trail told me exactly what happened. No detective work. No guessing.

Without the log discipline, that conversation would have been: "the number is wrong, who touched it?" And the answer would have been: "the agent, but we do not know what it saw when it ran."

Dash, our analytics agent, applies the same principle in the ad performance function. Before Dash flags an anomaly to the briefing, it writes its observation to a shared state file with the timestamp and the data it was reading when it formed the view. If I question a flag later, I can read the file and see what Dash saw. The flag might still be wrong. But the trail tells me whether the error was in the data Dash received or in the judgment Dash applied.

Dirk, the sales agent, works inside the CRM pipeline and logs every opportunity stage transition with the reason the rule fired. When a deal moves to "stale," Dirk writes when it moved, what the criteria were, and what data triggered the criteria. Janine can pull that record in a billing review and see when and why a deal left the active pipeline without asking Dirk to reconstruct it.

## The protocol that makes this automatic

The protocol is four steps, run in order, every time an agent acts.

First, the agent writes what it is about to read, before it reads. This is the observation log. It captures the input state before any transformation.

Second, the agent reads the source and writes what it found. This is the reading log. If the source was broken or empty or anomalous, this record captures it.

Third, the agent applies its rule and writes what rule fired and what result it computed. This is the decision log. Not just the output. The rule that produced it.

Fourth, the agent writes the output to its destination and appends a reference to the decision log entry. The destination record points back to the decision. The decision points back to the observation. The chain is complete.

This is not complicated software. It is discipline that you encode in the agent's instruction set before deployment. The agent does not have to be smart about it. The agent just has to follow the sequence every time.

The result is that agents become one of the most auditable workers on the chart. Not despite the speed at which they act, but because the speed forced you to make the trail explicit. Janine's trail is implicit in her work habits. Tally's trail is explicit in its protocol. If Janine ever got sick and someone had to reconstruct her work, they would have a harder time than reconstructing Tally's.

## Where the trail fails even with good protocol

The protocol breaks in one place: when an agent writes to an external system and the external system does not provide a write-back confirmation. The agent thinks it wrote. The external system did or did not accept it. If there is no confirmation path in the protocol, the trail ends at the agent's outbound log and you cannot know what the external system actually received.

The fix is to add a read-back step. After the agent writes to the external system, the agent reads from the external system and writes what it read. If the read-back matches the write, the trail is complete. If it does not match, the trail captures the discrepancy and the agent escalates rather than continuing.

This is extra work. It is worth it. The agents who do this work are carrying the operational load so that people are free for the work that requires judgment. The point of letting agents carry the load is not to get cheap execution. It is to get reliable execution. The read-back step is what makes the execution reliable.

## See the live chart

The OTP MCP exposes every agent seat on our chart, including the structured shared-state files each agent writes to as part of its audit protocol. You can query any seat's last-run output and the protocol it used.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the agent seats on the sneeze-it chart and what each one writes to as part of its output protocol."*

What comes back is the live structure of how we run agents with audit trails built in, not bolted on.

---

*Series: AI CFO. Post 27 of an in-progress series.*
