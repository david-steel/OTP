---
title: A demand spike used to mean chaos. With agents on the line, it means something different.
date: 2026-06-21
author: David Steel
slug: how-a-coo-handles-a-demand-spike-with-agents
type: founder_essay
status: published
series: ai-coo
series_part: 11
description: How a COO handles a sudden surge in volume when agents are already running the operational line. The lifecycle of a demand spike, from detection to reset.
---

# A demand spike used to mean chaos. With agents on the line, it means something different.

Every COO has a version of this story.

A campaign launches and leads triple overnight. A product goes viral on a Friday afternoon. A client adds two locations in the same week. Something unexpected hits and the volume goes up fast and the question is immediate: can the operation absorb this, or is it going to buckle?

In the old model, a demand spike was a people problem. Who can we pull? Can we get someone in over the weekend? Who has capacity and how fast can we redeploy them? The answer almost always involved trade-offs. Pulling someone from one seat to cover another created a gap somewhere else. Rushing onboarding created quality risk. Moving fast created the kind of coordination failures that showed up two weeks later as a client complaint or a missed handoff.

The COO's job during a spike was mostly damage control and fast improvisation. You found the extra capacity wherever you could, patched the gap, and cleaned up the mess afterward.

With agents running the operational line, a demand spike is a different kind of problem. Not easy. Different.

## Stage one: detection

The first question in any spike is: do you see it before it breaks something?

Before I had a real agent fleet, the answer was usually no. The spike showed up as a symptom first. Something downstream broke. A metric dropped. A client escalated. Then we worked backward to the cause.

Now detection is Dash's job. Dash monitors ad performance across all of our accounts continuously, comparing current numbers against yesterday, the seven-day average, and the thirty-day median. When lead volume climbs sharply on a specific account, that is not noise. It is a signal that goes into the briefing automatically.

The morning Radar compiles that briefing, the spike is visible before Bogdan opens his laptop. Not as a complaint. As data. Volume is up. Which account. How much. Against which baseline. That is the information a COO needs to decide whether the spike is a gift or a problem, and what to do about it either way.

Detection is where most operational crises are actually born. Not in the spike itself but in the lag between when the spike happened and when the right person knew about it. Agents close that lag because they do not sleep and they do not forget to check.

## Stage two: triage

Detection is not enough on its own. A COO needs to triage fast. What kind of spike is this? How long is it likely to last? Which seats are going to feel it first?

At Sneeze It, a lead volume surge has a predictable path through the operation. It hits the call center first. Arin, our call center manager agent, is watching speed-to-lead and booking rates continuously. If lead volume doubles and the calling team does not adjust, speed-to-lead degrades. The leads that arrived in the first hour age while the callers are still working through the previous queue. That degradation shows up in Arin's numbers before it shows up anywhere else.

Arin's data, combined with Dash's volume read, gives Bogdan the triage picture. Not through a manual pull or a Slack thread with three people. Through the briefing. Two data points from two agents, each watching their slice of the operation independently, assembled into one view before the day begins.

Triage with agents is faster because the agents have already done the data collection. The COO arrives at triage with answers, not questions.

That changes the shape of the decision. When you have the picture early, the options are still open. You can route, adjust, or front-load. When you have the picture late, you are reacting to what already broke.

## Stage three: surge routing

This is where the hybrid chart earns its value.

In a pure-human operation, surge routing is a headcount problem. You have the bodies you have. You can move some of them. You cannot conjure more. Every redeployment creates a gap. The COO is making a trade-off, not a decision.

In a hybrid operation, the math is different. Some of the seats can absorb more volume without degrading. Some cannot.

Arin can run more accounts simultaneously than a human call center manager. Dash does not slow down when lead volume goes up. Radar compiles the same briefing whether it is summarizing two Slack threads or twenty. These agent seats have a different capacity ceiling than human seats, and in a surge, that ceiling matters.

The COO's job in surge routing is not to find more people. It is to understand which seats in the fleet can absorb the extra volume and which seats represent the real constraint.

At Sneeze It, the real constraint during a lead spike is always the human callers. Amanda and Erica can only call so fast. They can improve speed-to-lead, they can prioritize, they can work the queue harder. But they cannot manufacture more hours. The agent seats around them, Arin monitoring their numbers, Dash flagging the accounts generating the volume, Radar pulling the briefing together, those seats absorb more signal without breaking. The callers are where the actual bottleneck lives.

Once the COO knows where the bottleneck is, the decisions get cleaner. What does the calling team need right now? More information about which leads to prioritize first. Arin can produce that ranking. Better visibility on which accounts are generating the surge. Dash has that data. A faster escalation path if the queue starts to age badly. Radar can flag it in the next briefing.

The agents carry the information work so the humans can focus on the calling. That is what "let agents carry the operational work, so people are free for the work that matters" looks like in a live surge.

## Stage four: quality holds through the surge

The failure mode I have seen in demand spikes is not usually capacity. It is quality. The operation finds a way to absorb the volume and the quality drops in ways nobody catches until a client says something.

This is where guardrails matter more than anything else.

In a human-only operation, quality during a surge is a matter of how disciplined people are when they are tired and moving fast. Some hold. Some do not. The variance is high because humans under pressure do what they do, and there is no consistent check on it while it is happening.

Agents do not have a tired version of themselves. Arin coaches the calling team the same way on a high-volume day as on a normal one. Dash flags anomalies at the same threshold regardless of how many accounts are active. Radar writes the briefing to the same standard whether there are three things to surface or thirteen.

The quality floor held by agent seats during a surge is not aspirational. It is structural. The agent does not cut corners under pressure because the agent has no pressure response. The checklist runs the same way. The SOP executes the same way. The output meets the standard or it escalates. That is the design.

The COO's job during a spike is to make sure the human seats also have what they need to maintain quality: clear prioritization, escalation paths that are not clogged, and enough information to make good decisions quickly. When agent seats are feeding the humans good information in real time, the humans can hold quality under pressure. When the humans are also doing the data collection themselves, quality degrades because there are not enough hours.

## Stage five: recovery and reset

The spike ends. The volume normalizes. The question the COO has to answer is: what did we learn?

In a pure-human operation, spikes tend to leave behind a lot of informal knowledge and very little documented change. People remember what they did. The playbook does not get updated. The next spike encounters the same improvisation problem.

With agents in the operation, the spike leaves a record. Dash has the volume curve. Arin has the speed-to-lead data across every day of the surge. Radar's briefings from the spike period are written to a file. The data is there to debrief from.

The COO who runs a real debrief after a spike uses that record to ask three questions. First: where did the operation hold? Second: where did it flex in ways we did not design for? Third: what does the process need to look like before the next spike, so we are routing by design rather than improvising under pressure?

That third question is the process redesign moment. Accenture's framing stays true here too: fix the process, then assign it to an agent. A spike often reveals that a step in the process was never really designed. It was just what people did. A surge forces it into the open. The COO's job is to capture that signal and turn it into a deliberate design choice before the next surge arrives.

The agent fleet makes the debrief possible because the data exists. The COO makes the debrief valuable because the data does not interpret itself.

## What the hybrid operation actually buys

A demand spike in a hybrid operation is not frictionless. Volume increases are real, and real volume has to go somewhere. The callers still have to make the calls. The client relationships still require human judgment. The quality decisions that live at the exception layer still require a human to make them.

What the hybrid operation buys is that the information load does not scale with the volume. The briefing does not get harder to compile when leads triple. Arin does not slow down when it is monitoring more accounts. Dash does not take longer to flag anomalies when there are more of them. The agent seats absorb the information work, so the human seats can focus on the contact work.

The COO handles a demand spike the same way a good COO always handles one: with clear detection, fast triage, deliberate routing, quality maintenance, and a real debrief at the end. What changes is the inputs. Instead of spending the surge period chasing data from across the operation, the COO arrives at each stage of the lifecycle with the information already surfaced.

The decisions are the same decisions. They are just made sooner, with better information, by someone who is not also trying to collect the data.

That is what the agent fleet is actually for.

## See the live chart

The Sneeze It org chart, with every agent seat and human seat named, is queryable from the OTP MCP.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the Sneeze It org chart and identify which seats would absorb more volume in a demand spike versus which seats represent the human constraint."*

The answer maps directly to the surge routing decision this post is about.

---

*Series: AI COO. Post 11 of an in-progress series. Previous: [The COO is the right owner of the agent operating model](/blog/why-the-coo-should-own-the-agent-operating-model)*
