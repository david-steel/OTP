---
title: The CFO question about automation is not "how much" but "what do we stop funding first"
date: 2026-06-20
author: David Steel
slug: how-a-cfo-allocates-capital-toward-automation
type: founder_essay
status: published
series: ai-cfo
series_part: 34
description: Capital allocation toward automation is a reallocation decision, not a net-new budget line. How to find the labor it replaces and redirect it.
---

# The CFO question about automation is not "how much" but "what do we stop funding first"

Every CFO I talk to frames this the same way. They want to know how to build a business case for automation. How to calculate ROI. How to get the AI line item approved by the board.

They are asking the wrong question.

Automation is not a new line item. It is a reallocation decision. The capital you put toward agents comes from the labor those agents replace or from the headcount you do not have to hire because an agent took the seat. If you are treating automation as an additive spend, you are paying twice for the same work. You are also missing the structural signal that makes automation worth doing in the first place.

The right question is not "how much should we spend on automation." The right question is "what are we currently funding that an agent could own, and what happens to that capital when the agent takes the seat."

That is a fundamentally different framing. And it changes the allocation math entirely.

## The problem with the ROI model

The standard ROI model for automation goes like this. You estimate the time saved by automating a process. You multiply that time by the hourly rate of the person doing it. You compare that to the cost of the automation. If the ratio is good enough, you approve the spend.

This model produces defensible spreadsheets. It also consistently underbuilds the case and then disappoints the board when the savings do not materialize in the way they were projected.

Here is why. The time-saved calculation assumes the freed time disappears from cost. It usually does not. The person whose task got automated still has the same salary. They fill the freed time with something else, often something uncaptured and unaccountable. The cost did not go down. It just moved to a different task that nobody is measuring.

The automation spend went out. The labor cost stayed. The CFO looks at the P&L six months later and the automation shows up as a net-new cost with no corresponding reduction.

This is the trap. The model treats automation as a tool purchase. It is not. It is a seat decision.

## The seat decision

When we built out the agent layer at Sneeze It, I stopped thinking about agents as software and started thinking about them as seats on the org chart. A seat has a role. A seat has accountabilities. A seat has a cost. And when you add a seat, you ask: what is this seat replacing, and what happens to the resources that were funding whatever it replaces.

Tally is a good example. Tally is our KPI agent. Its job is to read data from local sources and push numbers to our scorecard on a defined cadence. That is a task that previously lived in fragments across multiple human workflows. Someone would pull a report. Someone else would update a spreadsheet. The number would land in the scorecard hours late, sometimes wrong, sometimes not at all.

Tally does this four times a day, automatically, without error. The capital question was not "can we afford to build Tally." It was "what human workflow does Tally retire, and can that person use the freed time on something the business actually needs." When I could answer yes to the second part, the build was justified.

Dash, our data analyst agent, is a more expensive example. Dash runs a daily scan of every managed advertising account across Meta and Google, computes performance metrics, flags anomalies, and writes a structured brief that lands in our morning briefing. The cost of Dash is modest compared to the cost of a dedicated human analyst doing the same sweep manually every morning. But the capital case for Dash did not rest on the comparison to a hypothetical analyst we never hired. It rested on the concrete time it returned to the humans on our team who were doing fragments of that analysis badly and slowly as a secondary responsibility.

The seat decision requires you to be honest about two things. First, what does this seat actually own, in specific, measurable terms. Second, what human capacity was previously covering that ownership, and where does that capacity go when the agent takes it.

If you cannot answer both questions, you are not ready to allocate.

## Where the capital actually goes

The capital that comes free when an agent takes a seat does not automatically land somewhere useful. This is the part most operators miss, and it is where the CFO's job gets real.

When Pepper took over email triage at Sneeze It, the freed time did not flow automatically into revenue-generating work. It required an explicit decision about where that time went. I had to name the reallocation, not just the automation. Pepper handles the triage. That returned time belongs to client strategy. I had to make that explicit or it would dissolve into admin.

The CFO's role in automation capital allocation is not signing off on the software cost. It is tracking where the freed capacity lands. The agent spend is cheap. The waste of freed human capacity is expensive, because it is invisible.

Janine, who handles our accounting and AR, has watched a portion of operational overhead shrink as agents took over recurring report pulls and scorecard updates. The capital question for Janine's time is not "did the agents save us money on accounting." It is "what is Janine doing with the time that is no longer going to overhead." If the answer is revenue-relevant work, the automation is compounding. If the answer is new overhead she invented to fill the gap, we lost the trade.

Bogdan tracks this at the COO level. Freed capacity has to have a named destination, or it evaporates. This is the allocation discipline that most organizations skip because they are too focused on the cost of the automation and not focused enough on the cost of the unplaced freed capacity.

## The sequence that works

If I were walking a CFO through this for the first time, I would give them this sequence.

Start by mapping the operational work that is currently distributed across multiple human seats without a clear owner. These are the tasks that live in the gaps. Report pulls. Scorecard updates. Inbox management. Competitive monitoring. Data normalization. These are not the core of anyone's job. They are the tax on everyone's job.

Then ask which of those tasks a well-defined agent could own completely, not assist with, but own, with a measurable output and a named accountability. If you cannot define the output and the accountability, the agent is not ready. Define those first.

Then price the agent seat at its real cost: build time, infrastructure, oversight time from whoever manages the seat. Compare that to the hours you are currently paying humans to do the task poorly as a secondary responsibility.

Then, before you approve the spend, name where the freed human hours are going. Write it down. Put it on someone's scorecard. If the freed hours are going to work that has no seat and no accountability, you have not allocated capital. You have shuffled it.

The agents that compound for us are the ones where the freed human time went somewhere with a clear name and a number attached to it. The agents that did not compound are the ones where the freed time dissolved.

## What this means for the allocation decision

The capital allocation decision for automation is straightforward once you have the right frame. You are not buying efficiency. You are buying capacity. The purchase is only worth making if you have a named use for the capacity you are buying.

This is why I push back on the "AI will save us X percent of labor costs" framing. It might. It also might not, if the freed capacity has no destination. What I can say is that every agent seat we have added at Sneeze It has generated a return, and the return has been proportional to the clarity of the answer to the second question: where does the freed human time go.

The mission we are building toward is letting agents carry the operational work so people are free for the work that matters. But "free for the work that matters" only pays off if you name the work that matters and route the freed time to it. That routing is a CFO decision, not a technology decision. The agent is the vehicle. The CFO decides where it goes.

The capital allocation is easy. The discipline around what you do with what comes back is where most organizations leave the value on the table.

## See the live chart

You can query the current seat structure at Sneeze It, including which agents hold operational seats and what accountabilities each seat owns.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me every agent seat on the Sneeze It chart and what operational work each seat owns."*

You will see the actual accountability structure, not a description of it. That is the output the allocation decision has to be built on.
