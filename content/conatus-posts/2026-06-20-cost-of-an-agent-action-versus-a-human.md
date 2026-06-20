---
title: The cost of an agent action is not what you think you are comparing
date: 2026-06-20
author: David Steel
slug: cost-of-an-agent-action-versus-a-human
type: founder_essay
status: published
series: ai-cfo
series_part: 13
description: Comparing agent cost to human cost by token price versus hourly rate is the wrong calculation. Here is the one that actually holds.
---

# The cost of an agent action is not what you think you are comparing

Most operators I talk to run the same mental math when they start putting agents into their business.

They look at the API cost for a single agent action. A few cents, maybe a dollar for a complex run. Then they look at what a human costs per hour and divide by how many actions that human takes per hour. The math is flattering. The agent wins by a mile. They declare the ROI obvious and move on.

That is the wrong calculation. And running the wrong calculation is how you end up with agents that look cheap on paper and expensive in practice.

The correct calculation is cost-per-correct-outcome. Not cost-per-action. Not cost-per-token. Cost per outcome that actually served the business. That is the number that tells you what an agent is worth versus a human in the same seat.

When I started building the agent team at Sneeze It, I made this mistake myself. I looked at token cost and congratulated myself. It took a few months of watching agents produce actions that did not translate into outcomes before I understood what I was actually measuring.

Here is what I learned, organized around the failure modes I kept running into.

## Failure mode 1: counting actions, not outcomes

An agent action and a useful agent action are two different things.

Tally, the agent who pushes KPI values from local sources to our OTP scorecard, runs four times a day on weekdays. Each run is a cluster of actions. Reading source files, parsing values, calling the OTP API, logging results. At the token level, each run costs almost nothing.

But the right question is not what each run costs. The right question is whether each run produced a correct scorecard update. If Tally reads a malformed source file and pushes a stale number to the chart, the action completed. The cost on the API invoice is the same as a correct run. The outcome is a wrong scorecard that drives a wrong conversation at the Monday meeting.

The cost-per-action calculation makes both runs look identical. The cost-per-correct-outcome calculation makes the difference visible immediately.

This is why I track agent outcome fidelity alongside agent run cost. Not because I am paranoid about agents. Because cost without fidelity is not a number. It is a guess.

## Failure mode 2: ignoring the cost of correction

Every time an agent action requires a human to correct it, the correction has a cost. That cost does not appear on the API invoice. It shows up later, in someone's time.

Dash runs our ad performance analysis across Meta and Google every day. When Dash produces an accurate read on a client account, the cost is the API call and whatever time I spend reading the output. When Dash produces an inaccurate label, the cost is the API call plus the time I spend catching the error, plus the time to figure out what went wrong, plus whatever downstream confusion the bad label caused.

I have had days where Dash's per-action cost looked pennies on the dollar versus a human analyst. I have also had days where one bad label, propagated through a briefing and into a client conversation, cost an hour of correction work. That one bad label made that run cost more than a human would have cost for the same task.

Correction cost is real. It is just invisible on the invoice. The operators who account for it run their agents differently than the operators who only look at the API bill.

## Failure mode 3: not pricing human time at its true cost

This one runs the other direction.

When operators compare agent cost to human cost, they usually use loaded hourly rate. Salary divided by hours, with benefits added. That is the floor, not the ceiling.

The real cost of a human doing an operational task is loaded rate plus opportunity cost. Every hour Janine spends on a task an agent could handle is an hour Janine is not doing the work only Janine can do: judgment calls, vendor relationships, the kind of institutional knowledge that does not live in a prompt.

Janine handles our accounting, AR, AP, and billing. The work inside that seat splits into two kinds. There is work that requires her judgment and relationships. And there is work that is mechanical: data reconciliation, flag-and-route, standard reporting. When I look at what an agent could absorb inside her seat, I am not pricing that against Janine's hourly rate. I am pricing it against her hourly rate plus the strategic work she would do instead if the mechanical work were off her plate.

That reframe changes every calculation. The agent is not just cheap because tokens are cheap. The agent is valuable because it frees the human for the work the human actually earns.

## Failure mode 4: treating all task types as equivalent

Some tasks are agent-natural. Some tasks are human-natural. Blending them without distinction produces a misleading cost picture.

Nick handles our cold prospecting in health and wellness. His job is a clear pipeline: Yelp discovery, domain research, decision-maker identification, email validation, draft generation, Gmail queue. Every step in that pipeline is defined, repeatable, and measurable. The cost per drafted email is stable. The fidelity on ICP filtering is high because the rules are explicit. That is an agent-natural task.

If I tried to calculate what a human prospector would cost doing the same pipeline, the math is straightforward and Nick wins on volume and unit cost without a close contest.

But there are tasks inside that same pipeline where a human still beats Nick. Reading a prospect's LinkedIn history and deciding whether a specific founder signal changes the outreach angle. Judging whether a brand feels right for a new vertical we have not tested before. Those are judgment calls that benefit from context Nick does not carry. If I pull those tasks out of the human's plate and hand them to Nick, the cost-per-action is low but the cost-per-correct-outcome is high, because he will get them wrong more often.

The cost calculation only holds if you are honest about which tasks belong in which column.

## Failure mode 5: forgetting that agents do not have capacity constraints

This is where the calculation actually breaks in the agent's favor in a way most operators undercount.

A human prospector works a certain number of hours per day. Nick has no such constraint. The same cost structure that runs 30 emails in one day can run 300 if the pipeline is fed correctly. The marginal cost of the additional 270 emails is almost entirely API tokens. There is no overtime, no fatigue-induced error rate increase, no second hire.

Dirk, who handles our sales pipeline, can watch every deal in the CRM simultaneously. He does not context-switch. He does not lose track of a deal because he spent the morning on a different deal. The cost-per-action scales flat in a way no human seat scales flat.

When I think about where agents generate the most value against their cost, it is not on the per-action comparison. It is on the volume ceiling. Humans have one. Agents do not.

## The calculation that holds

Cost-per-correct-outcome, with correction cost included, measured against human opportunity cost rather than loaded rate, scoped to the task types where the agent's fidelity is high and the volume ceiling matters.

That is the calculation. It is less flattering than token price versus hourly rate. It is also the one that tells you where to put agents and where not to.

The mission driving all of this is straightforward: let agents carry the operational work so people are free for the work that matters. That mission only pays off if the agents are doing the right work correctly. Getting the cost comparison right is how you know which work that is.

## See the live chart

From the OTP MCP, you can query which seats on the Sneeze It chart are agent-held and what tasks they own, giving you a concrete view of how agent work is scoped by outcome, not by action volume.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the agent seats on the Sneeze It chart and what each seat is accountable for."*

What you will see is each seat defined by its outcome accountability, not its action count. That is the structure that makes cost-per-correct-outcome a calculable number instead of a guess.

---

*Series: AI CFO. Post 13 of an in-progress series.*
