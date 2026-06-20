---
title: The COO job does not disappear when agents carry the operational work. It changes shape completely.
date: 2026-06-20
author: David Steel
slug: what-a-coo-does-when-agents-carry-the-operational-work
type: founder_essay
status: published
series: ai-coo
series_part: 1
description: When agents run the daily ops, the COO seat does not shrink. It shifts from execution to judgment. Here is what that looks like at Sneeze It.
---

# The COO job does not disappear when agents carry the operational work. It changes shape completely.

The question I keep getting from other agency owners is some version of: "If agents are running the operations, what does the COO actually do?"

I get why they ask. It sounds like a trick question. Like maybe the COO seat just quietly becomes redundant and you have to find a polite way to say that.

It is not a trick question. But the honest answer is not what most people expect.

The COO job does not shrink when agents carry the operational work. It changes shape. And the new shape is harder than the old one.

## What the COO seat looked like before

Before I had a real agent fleet, Bogdan, our COO, spent most of his working hours on what I would call coordination overhead.

Tracking whether the right person had the right information at the right time. Following up on deliverables. Making sure the project status in Accelo matched what was actually happening. Asking callers to update their numbers. Pulling reports together from four different sources so we could have a useful conversation on Thursday.

That is not a knock on Bogdan. It is just what operations management looks like when humans are the only execution layer available. The COO becomes the nervous system because there is nothing else to be the nervous system.

The work was real. It was also almost entirely about moving information from where it lived to where it was needed, and making sure the humans in between followed through.

## What changed when the agents came online

Radar now runs the morning briefing. It pulls Slack, Google Calendar, the pipeline, the inbox, the ad data, and the project tracker into one compiled output every morning before anyone opens a browser tab. It does not need to be asked. It does not need to be reminded.

Dash watches the ad accounts across Meta and Google, flags anomalies against yesterday, last week, and the 30-day median, and puts the alerts in the briefing automatically. It does not have a good day or a bad day. It does not get distracted.

Tally pushes the KPI scorecard values to the org chart four times a day without being prompted. Crystal monitors the active project list in Accelo and flags anything that is running late or missing tasks. These seats run like clockwork because clockwork is exactly what they are.

What does Bogdan do when those four agents are handling the coordination layer that used to eat most of his week?

He does the thing that agents cannot do.

## The before: coordination machine. The after: judgment seat.

Before, the COO was the system. The system broke when he was sick, on vacation, or just having a hard week. The agents do not have hard weeks.

After, the COO sits above the system. The agents surface what happened. Bogdan decides what it means and what to do about it.

That sounds like a reduction in workload. In terms of volume, maybe it is. In terms of cognitive load, it is an increase. Because the decisions that are left after you strip away coordination overhead are the decisions that were always the hard ones. They were just buried.

When Crystal flags that two projects are running late simultaneously and both have the same deadline, Bogdan has to make the call on which one gets the senior talent. That call requires knowing the client relationship, the contract terms, the team's capacity, and the reputational risk. No agent can make that call. An agent can surface everything needed to make it.

When Dash shows that a client's cost per lead has climbed 22% over three weeks and the ad changes were minimal, something else is wrong. It might be seasonality. It might be the landing page. It might be a targeting issue that requires a strategy conversation. Bogdan has to sit in that conversation and decide what to do. The agent surfaced the problem. A human has to diagnose and own the fix.

When Radar shows that David has five client calls this week and two internal L10s and that leaves roughly four hours for deep work, Bogdan has to make a call about what gets moved. The agent can show the math. Only a human can make the judgment about what matters most.

## Three specific shifts in the COO's actual job

The first shift is from data collection to data interpretation. When agents are collecting and surfacing data automatically, the COO never needs to chase a number again. What they need to do is understand what a number means in context, and that context is relational and historical and organizational. It is not something you can retrieve. It is something you build over time in the room with people.

The second shift is from firefighting to system design. When Bogdan was the nervous system, he spent significant time reacting. A handoff broke and he fixed it. A report was wrong and he caught it. A deadline slipped and he absorbed the friction. With agents running the coordination layer, the fires are smaller and they surface faster. The COO's job becomes designing the system so the agents are watching the right things, the right metrics, and escalating to the right people. That is a design job, not a firefighting job.

The third shift is from task owner to accountability architect. Before, Bogdan owned tasks. He executed. With agents doing the execution on most operational work, the job is making sure every seat (human and agent alike) has a clear metric, a clear escalation path, and a clear owner for when the metric moves wrong. Tally pushes the numbers. Bogdan decides whether the number is the right number and what happens when it drops.

## What this actually looks like on a Thursday

Thursday morning Bogdan reads the compiled briefing Radar wrote while he was asleep. Crystal has flagged one active project with a milestone three days out and no tasks assigned. Dash shows a 19% CPL spike for one client. Dirk has a proposal that has been sitting in "viewed" status for six days.

In the old model, most of Thursday morning would have been spent finding out those three facts. Phone calls. Slack threads. Digging through Accelo. Asking people.

Now, those three facts are sitting in the briefing when he opens it. Thursday morning is now the decisions. Who gets assigned to the milestone gap. What gets reviewed on the landing page. Whether Dirk should send a follow-up on the proposal or hold.

That is the shift. From the searching to the deciding. From the running around to the judgment.

It is not less work. It is more concentrated work. Fewer hours on tasks that do not require a brain, more hours on problems that genuinely do.

## The mission this serves

The reason I built the agent fleet the way I built it was to let agents carry the operational work so people are free for the work that matters.

Bogdan matters most in a room with a client who has a real problem. He matters most when there is a hard resource trade-off and someone needs to make a call that affects people. He matters most when the system throws something unprecedented and there is no playbook yet.

The agents handle the clockwork so he can show up for the judgment calls fully. Not drained from having spent the morning chasing numbers, but rested and present and informed because the agents did the gathering.

That is the actual COO job in a hybrid org. Not smaller. Sharper.

## See the live chart

You can query the Sneeze It org chart directly through the OTP MCP to see which operational seats are agent-held and which are human-held, and what each seat is accountable for.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the Sneeze It org chart and identify which operational seats are agents versus humans."*

You will see the exact split between human judgment seats and agent execution seats, and you will be able to read the accountability for each one. That split is the answer to the question this post is trying to answer.

---

*Series: AI COO. Post 1 of an in-progress series.*
