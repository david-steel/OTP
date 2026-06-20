---
title: Most finance work can go to agents. A small slice cannot. Knowing the difference is the decision.
date: 2026-06-20
author: David Steel
slug: what-finance-work-should-never-leave-a-human
type: founder_essay
status: published
series: ai-cfo
series_part: 23
description: Not all finance work belongs to agents. Here is how to draw the line at Sneeze It, seat by seat.
---

# Most finance work can go to agents. A small slice cannot. Knowing the difference is the decision.

There is a version of this conversation that is mostly hypothetical. Which finance tasks "could" agents do in theory. Which ones "require" human judgment in principle. It is a reasonable MBA discussion and it has almost nothing to do with how real finance decisions get made inside a small business.

Here is the version that is real: at Sneeze It, we have agents doing finance-adjacent work every single day. Tally pushes KPI numbers to the scorecard four times on weekdays. Dash flags when a client account is overspending or running quiet. Dirk monitors pipeline and tracks revenue signals. None of them touch the actual money.

Janine does. She is our accountant. She owns AR, AP, billing setup, and cash collected. She has rows on the scorecard. She is not optional and she is not going anywhere. And the reason is not that agents are bad at numbers. Agents are extremely good at numbers. The reason is that certain finance decisions carry a category of consequence that requires a human being to be accountable for them.

The question is not "can an agent handle this?" The question is "what happens if this is wrong, and who absorbs that?"

That is the decision tree.

## Branch one: Does the work produce a number or move money?

The first branch is simple. If the work produces a number, an agent can almost certainly do it well. If the work moves money, or authorizes moving money, a human needs to own it.

Tally produces numbers. Dash produces numbers. Dirk produces numbers. None of them write checks, create invoices, change billing settings, or authorize payments. Those paths stay with Janine.

This is not a technical limitation. You could wire an agent to write checks if you wanted to. The reason you do not want to is that an error at the "produces a number" layer has a correction cost of near zero. You update the number. The error at the "moves money" layer has a correction cost that ranges from annoying to catastrophic, and it often has a time lag before you find out anything went wrong.

When the downside is asymmetric enough that the correction window matters, you put a human on it. That is the logic, not a principle, not a feeling.

## Branch two: Is the judgment recurring and pattern-based, or is it singular and relationship-based?

The second branch separates the rest.

Recurring, pattern-based finance work is where agents are strongest. Tally does not think about which KPI numbers to push. It reads a source file, extracts the value, and pushes it. That is a pattern that repeats on a schedule. If the source file is wrong, Tally flags it. If the push fails, Tally escalates. The judgment has been encoded. The human made the decision once, upstream, when they defined the KPI and the source.

Recurring pattern work that has not yet been encoded is a candidate for agent ownership. It is worth the effort to encode it because you get the recurring work back permanently.

Singular, relationship-based judgment is different. When Janine calls a client to discuss a billing dispute, the judgment she exercises in that conversation is not pattern-based. She is reading the room. She knows the history. She knows what kind of flexibility is acceptable and what would set a bad precedent. She knows when to push and when to absorb. That knowledge lives in a relationship. Agents do not have relationships.

This is the thing that people miss when they think about AI in finance. The question is not whether an agent could read the billing history and draft a script for the call. It could. The question is whether the script, once on the call, performs as well as Janine's live judgment does. It does not. The delta is real and it is not worth closing for a billing call with a client you care about.

## Branch three: Does the output require a signature or a commitment?

The third branch is short but it matters.

Any finance output that requires a signature, a commitment, a contract, or a formal approval belongs to a human. Not because agents cannot draft documents. They can draft them competently. Because a signature is a legal and relational act that has to be traceable to a person. The accountability chain has to terminate somewhere. It terminates at a human every time.

Bogdan, our COO, signs vendor agreements. Janine signs off on billing reconciliations before they go to clients. I sign client contracts. None of these outputs are difficult to produce. The signing is not the hard part. The accountability that the signature represents is.

Agents can prepare everything that leads to the signature. They should. That is exactly what they are for. Dash surfaces the spend data. Tally surfaces the AR numbers. Dirk surfaces the deal terms. Janine signs. That sequence is correct.

## What this looks like at Sneeze It on a billing run

Here is the concrete version. When we add a client to the billing list, the process looks like this.

Dash flags when a client account shows spend in the CCM data for the first time. Dash does not bill the client. Dash surfaces the trigger. That is where the agent work ends.

Then Janine gets the flag. She confirms the account is live, checks what the client contracted for, pulls the billing rate, and sets up the invoice. She sends it. She follows up. She reconciles when payment comes in.

Tally tracks the cash collected number on the scorecard. Dirk tracks the deal status in the pipeline. The agents are doing real work. The financial commitment and the relationship work stay with Janine.

When we added WOA Rock Hill and WOA Bristol to the billing list in June, that is exactly how it went. Dash caught the spend signals. Janine handled the invoice setup. The division of labor was not accidental. It is how the seats are designed.

## The failure mode you want to avoid

The most common mistake I see is operators offloading finance work to agents not because the work belongs there but because the agent is available and the human is expensive or slow.

Availability is not a good reason. The question is always "what happens when this is wrong and who absorbs it."

If you find yourself answering "the agent absorbs it" for a finance task, you do not have an answer. Agents do not absorb consequences. People do. The accountability still lands on a human somewhere, just later, with more damage.

The agent work has to terminate at a human who is on the hook for it. If you have not named that human and given them real authority and real ownership, you have not set up the seat correctly. You have just moved the accountability into a gap where it will sit until something goes wrong.

## How to draw the line in your own shop

The decision tree, stripped down, looks like this.

Does the output produce a number, or does it move money or make a commitment? If it moves money or makes a commitment, the seat owner is human.

Is the judgment recurring and encodable, or singular and relational? If it is singular and relational, the seat owner is human.

Does the output require a legal or formal accountability trace? If yes, the seat owner is human.

Everything else is a candidate for agent ownership. And the scope of "everything else" is large enough that most finance work, measured by volume and time, shifts to agents. The high-stakes, low-volume, high-consequence work stays with the human. That is not a compromise. That is the right allocation.

Janine doing billing judgment, relationship calls, and contract sign-offs is a better use of her than Janine manually updating spreadsheets and pushing numbers to a dashboard. The agents carry the operational weight. She does the work that only she can do. That is the mission.

## See the live chart

You can query the OTP chart for Sneeze It to see exactly which seats are human and which are agent, and what each one is accountable for in the finance and revenue stack.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the seats on the Sneeze It chart that touch finance or revenue, and whether each seat is a human or an agent."*

You will see exactly where the line is drawn and why each seat is allocated the way it is. That allocation is the decision, made visible.
