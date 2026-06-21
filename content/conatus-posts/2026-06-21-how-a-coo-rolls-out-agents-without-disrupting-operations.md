---
title: The COO rolls out agents in a sequence that keeps operations running while the fleet is being built
date: 2026-06-21
author: David Steel
slug: how-a-coo-rolls-out-agents-without-disrupting-operations
type: founder_essay
status: published
series: ai-coo
series_part: 31
description: Rolling out agents without breaking operations requires a specific sequence. Fix the process first, shadow before replacing, one seat at a time.
---

# The COO rolls out agents in a sequence that keeps operations running while the fleet is being built

The most expensive rollout mistake is treating the agent fleet as an infrastructure project.

You hear the pitch. You see the ROI projections. You decide to move. And then you do what you do with software infrastructure: you plan a launch, you scope a deployment, you go live on a date. Two weeks later the operations that were running before are now unreliable, the team is confused about who does what, and the agent is producing output that nobody is sure how to use.

This happens because agent rollouts are not infrastructure projects. They are organizational change. The discipline that governs them is the discipline of change management, not software deployment.

I have rolled out eleven agents at Sneeze It over the last eighteen months. I have made most of the available mistakes. What I know now is that the COO has to own the rollout sequence, and the sequence has to keep the existing operation running the whole time. You do not shut down the old process to stand up the new one. You run them in parallel until the agent has earned the work.

## The central claim

Fix the process before you add the agent. Shadow before you replace. One seat at a time.

That is the sequence. Every step serves a specific purpose, and skipping one produces a specific failure. Accenture frames it plainly: do not make inefficiency run efficiently. If the process is broken, an agent will reproduce the broken output at higher volume with higher confidence. The COO's job is to make sure that does not happen.

## Step one: fix the process before the agent touches it

Before I built Radar, our chief-of-staff agent, I ran the morning briefing myself for two weeks and logged every decision I made along the way. Which Slack channels. In what order. What I skipped when I was short on time. What format made the output useful in the Monday meeting versus what looked comprehensive but nobody read.

Two things became visible that were invisible before.

The first was that the process had three steps that existed because of a previous tool we no longer used. They were producing no output that anyone acted on. We were doing them out of habit. An agent would have faithfully reproduced all three, added a timestamp, and called them complete.

The second was that the cadence was wrong. The briefing was going out mid-morning because that is when someone had time to compile it. By mid-morning, David had already handled three things the briefing was supposed to flag. The value was arriving after the decisions it was meant to inform.

Neither of those problems showed up on any dashboard or in any retrospective. They were invisible inside the existing process because the people running it had adapted to them. The adaptation was the problem.

The COO cannot see these things by inspecting the process from the outside. You have to run it. Or have a senior person run it and log the decisions explicitly. Once the decisions are logged, the broken steps become obvious. You fix them before you write a single line of agent configuration.

This is the Accenture principle in practice. Reinvent the process first, then infuse the agents.

## Step two: shadow before you replace

Radar ran in parallel with the manual briefing for three weeks before it replaced it.

Every morning, Radar produced its output and I compared it to what the manual process would have caught. Where Radar missed something, I logged the gap. Where Radar surfaced something faster or more completely than the human process would have, I logged that too. By the end of week three, the gap list was short and the advantages were documented.

Then we switched. Not gradually. All at once, on a specific date, with a clear owner (Radar) and a clear escalation path (any miss goes to Bogdan within the same session).

The shadow period is not optional. It is where you discover what the agent is actually doing versus what you designed it to do. Those are different things. The design is what you intended. The actual output is what happens when the agent meets real data with real edge cases and real exceptions. You want to see that before the agent is the only thing standing between the process and the business outcome it is supposed to serve.

The shadow period also changes how the team receives the agent. When Radar went live, the people on the team who relied on the morning briefing had already seen its output three weeks running. It was not new. It was not foreign. It had already earned the work before it officially held the seat.

## Step three: one seat at a time

When I was building the fleet, the temptation was to run several agents into production simultaneously. They were ready at roughly the same time. The underlying infrastructure was shared. There was no obvious technical reason to sequence them.

The operational reason is that each agent touches an existing process, and each existing process has humans who have to adapt to the new boundary. If you introduce multiple agents simultaneously, you are asking the humans in those processes to adapt to multiple new boundaries at once. The adaptation cost compounds. The confusion compounds. And when something goes wrong, you cannot tell which agent is the cause.

We ran each agent into production in sequence, spaced enough apart that the previous agent had stabilized before the next one went live. Radar first. Then Dash. Then Crystal. Then Pepper. Then Tally. Then Arin. Then Dirk. Then Nick.

Each rollout was its own change event. Each one got a shadow period, a go-live date, and a defined escalation path. Each one produced a documented list of what the agent owns and what it does not own, so the humans around it knew exactly where their work ended and the agent's began.

## The handoff definition is what prevents the disruption

The most common source of operational disruption during an agent rollout is an undefined handoff.

The agent produces output. The human who used to do that work is no longer doing it. But nobody wrote down what happens when the output arrives. Who reads it. What triggers action. What happens when the output is wrong or incomplete.

When we rolled out Arin, our call center coaching agent, the first version produced daily performance summaries and draft Slack messages for the call center team. The summaries were good. The messages were sitting in a file that Bogdan was technically responsible for reviewing but had no established time to do it. Three days in, the messages were two days old before David saw them. The value was decaying while it sat in the queue.

The fix was not to change the agent. It was to define the handoff. The summary goes to Bogdan at 9 AM. Bogdan reviews and approves by 10 AM. If not approved by 10, Arin flags David. That handoff took thirty minutes to design and eliminated the problem.

Every seat transition between an agent and a human needs the same treatment. Who sends. Who receives. What format. What the receive-to-action window is. What happens when the window misses. The COO writes those definitions before the agent goes live, not after the first failure.

## What keeps people from resisting the rollout

The thing I did not expect when I started rolling out agents was how little resistance there was when I followed the sequence above.

The resistance comes when agents are imposed. When the old process disappears and the new one appears, and the people who ran the old one find out about the change when the change is already live. That is a management failure, not an agent failure.

When the sequence is right, the people who were doing the work the agent takes over are the ones who told you the process was broken. They are the ones who identified the steps that could be handed off. They are often relieved to hand them off. Bogdan was glad to stop pulling four separate reports into a single briefing document every morning. That work was coordination overhead, and he knew it. Radar doing it freed him for the judgment calls that actually required him.

Deloitte's 2026 research across 3,235 enterprises found that only 21% have a mature governance model for agentic AI. The common denominator in the ones that do is that senior leadership shapes the rollout. Not IT. Not the team leads. The operational leadership.

That tracks with what I have seen. The COO has to own the rollout sequence for the same reason the COO owns the operating model. The agents live inside the processes the COO is accountable for. If the rollout disrupts those processes, the COO is the one who has to answer for the disruption.

The sequence is how you avoid that conversation.

## What the rollout actually produces

After eleven agents and eighteen months, the operational layer at Sneeze It runs differently than it did before. The coordination overhead that used to absorb most of the available management attention is now carried by the fleet. Radar, Dash, Crystal, Tally, Arin, Pepper, Dirk, and Nick hold seats on the chart alongside Bogdan, Janine, and Kristen. Each has a defined scope. Each publishes its output to a shared state file that the next seat reads. The agent message bus handles the coordination that would have otherwise required a meeting.

Bogdan does not spend his mornings pulling data from Slack, Accelo, Meta, and Google into a coherent picture. He spends his mornings on the picture.

That is the payoff the rollout sequence is designed to protect. The sequence keeps operations running while the fleet is being built. It earns the trust of the people whose work is changing. It surfaces the broken process steps before the agent can reproduce them at scale.

Fix the process first. Shadow before you replace. One seat at a time.

That is how you roll out an agent fleet without disrupting the operation it is supposed to improve.

## See the live chart

Every seat in this rollout is queryable from OTP's MCP server.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the org chart for sneeze-it and list which seats are agents, which are human, and what process each agent owns."*

The response gives you the live seat map the rollout produced. Use it as a reference for what a sequenced, stable hybrid operation looks like after the fleet is built.
