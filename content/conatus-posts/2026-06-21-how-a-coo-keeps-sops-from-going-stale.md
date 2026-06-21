---
title: The COO who stops treating SOPs as documents finally stops losing the staleness fight
date: 2026-06-21
author: David Steel
slug: how-a-coo-keeps-sops-from-going-stale
type: founder_essay
status: published
series: ai-coo
series_part: 13
description: SOPs go stale because the update signal never reaches the person who can fix the doc. Agents change that. Here is how the COO closes the loop.
---

# The COO who stops treating SOPs as documents finally stops losing the staleness fight

Every COO I know has a version of the same problem.

The SOP library exists. Most of it was accurate when it was written. Then the process changed, someone found a shortcut that worked, and the doc was never updated. Six months later the SOP says one thing and the team does another.

The standard fix is an audit. Pull the docs, compare to observed practice, update the gaps, run a training pass. Repeat every quarter.

The audit fixes the symptom. It does not fix the cause. Six months later you run the audit again.

The problem is not that people forget to update the SOP. The problem is that the signal that the SOP needs updating never reaches the person who can change it. The update signal and the update authority live in different places, and nothing connects them.

## Where the signal actually lives

When an SOP is wrong, there are always signals. A step in the doc does not map to how the tool currently works. A handoff goes to the wrong person because the team structure changed. A client escalates because the intake process the SOP describes was not followed, because the person who followed it last month got a different result and told a colleague to skip the step.

These signals live in execution. In the tickets. In the Slack threads. In the escalations. In the edge cases that get handled off-script.

In a human-only operation, those signals stay buried in execution. The person who noticed the SOP mismatch is not the person who owns the SOP. The owner of the SOP is not in the room where the mismatch happens. The signal decays in the middle.

This is what makes SOP staleness feel inevitable. It is not a discipline problem. It is a signal routing problem. The people closest to where the SOP breaks are the furthest from the authority to fix it.

## What changes when agents are in the execution layer

Accenture's framing on process improvement is direct: reinvent the process before you add the agent. Do not make inefficiency run efficiently. I agree with that completely. But there is a second-order effect that most people miss: once you have redesigned the process and put an agent on the execution seat, you get a signal source that never existed before.

Agents execute the SOP every time. They do not approximate it, skip familiar steps, or improvise based on last month's workaround. They run the doc. When the doc is wrong, the failure is immediate and legible. The agent either cannot complete the step or produces a result that is visibly off. There is no gray zone of "we sort of followed the SOP." There is only "the SOP produced the right output" or "the SOP produced the wrong output."

That legibility is the signal the COO has never had.

At Sneeze It, Radar runs the morning briefing from a structured set of instructions. If a data source moves or a format changes, Radar's output breaks in a specific and identifiable way. I trace the wrongness back to the step that failed and fix it that morning. When a human coordinator ran the same process, drift was gradual and hard to attribute. The audit was the only way to find it.

## The COO's job: close the feedback loop, not just fix the doc

The goal is not to write better SOPs. The goal is a system where SOPs update as fast as the process changes.

That system has three components.

The first is an execution layer that produces clean signal when the SOP breaks. Dash monitors ad performance against a defined methodology. When the methodology needs to change, the signal is in the output: numbers that do not reflect the accounts, anomalies that do not get flagged. When Dash's output is off, I trace it to the instruction it was following and fix the instruction. No five-person investigation.

The second is a named owner for every SOP who is in the feedback loop of the execution it governs. One seat, one owner. Not "the team owns the prospecting SOP." Nick owns it. Nick is the agent running cold outreach. When the ICP shifts, Nick's owner knows immediately because Nick is the one executing. The update authority and the signal source sit on the same seat.

The third is a coordination channel between seats so SOP changes propagate. At Sneeze It, agents communicate through an inbox at `~/.claude/agent-inbox`. When Dirk's revenue strategy shifts the targeting criteria, Dirk sends a message to Nick's inbox. Nick's SOP updates before the next batch runs. No audit. No training pass. The signal traveled from where the change happened to where it needed to land.

## The objection about human SOPs

Most operations leaders hear this and say: my SOPs govern humans, not agents. So this does not apply.

It applies more than you expect, and for a reason most people miss.

When you put agents on the clearest and most repeatable execution seats, the human seats that remain are freed from routine work. Bogdan, our COO, does not spend time checking whether the briefing process ran. Radar runs it. What Bogdan does is decide what the output means.

And the SOPs that govern human seats become easier to keep current, because you can see the comparison. When Arin monitors call center performance for Amanda and Erica, and the coaching SOP says to address speed-to-lead first, and Amanda's numbers show a different pattern, Arin surfaces the discrepancy. The human SOP and the observed practice are in the same conversation. The COO sees the gap in real time, without an audit.

Deloitte's 2026 State of AI in the Enterprise found that only 21% of organizations have a mature governance model for agentic AI, and the ones that do achieve significantly greater business value than those delegating to technical teams alone. The governance that matters is not IT governance. It is operational governance. Owned by operations. Which means owned by the COO.

## What the feedback loop looks like day to day

When Crystal flags a project milestone with no tasks assigned, the first question is whether the SOP for project setup includes the step that creates milestone tasks. If it does not, that step gets added. The next project Crystal monitors has the right structure.

When Pepper triages the inbox and a client email falls through a classification gap, the triage SOP has a missing case. The case gets added. The next similar email routes correctly.

None of these require a quarterly audit. Each one is a one-time fix to the instruction that governs a seat. The SOP stays current because the execution layer cannot silently tolerate a wrong one.

This is the COO move. Not writing better documentation. Not running tighter compliance campaigns. Designing an execution layer that breaks legibly when the SOP is wrong, and then owning the feedback loop that keeps it honest.

Let agents carry the operational work so people are free for the work that matters. The thing that makes that possible is SOPs that stay current. The thing that keeps SOPs current is execution that tells you immediately when they are not.

Accenture's directive was reinvent the process before you automate it. The follow-through is: run the reinvented process on a substrate that tells you when it drifts. Documents do not tell you when they are wrong. Agents do.

## See the live chart

The Sneeze It seat structure, including which agents own which operational SOPs, is queryable directly from OTP.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the Sneeze It org chart and which operational seats carry their own SOPs."*

You will see the seat structure that makes this feedback loop possible, and you can adapt the pattern to your own org without starting from scratch.

---

*Series: AI COO. Post 13 of an in-progress series.*
