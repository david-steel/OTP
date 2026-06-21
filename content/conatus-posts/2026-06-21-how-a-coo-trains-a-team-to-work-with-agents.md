---
title: The team fails before the agent does. The COO's job is to train people to work alongside the fleet.
date: 2026-06-21
author: David Steel
slug: how-a-coo-trains-a-team-to-work-with-agents
type: founder_essay
status: published
series: ai-coo
series_part: 32
description: When agents join the team, humans develop predictable failure modes. The COO's job is to diagnose them early and train the team out of them before they calcify.
---

# The team fails before the agent does. The COO's job is to train people to work alongside the fleet.

Every time I have added an agent to the team at Sneeze It, the same thing happens.

The agent runs fine. The humans around it struggle.

Not dramatically. Not visibly. Just a quiet cluster of friction that compounds over the first few weeks and eventually shows up as worse outcomes than you had before the agent was there. The agent is producing. The process is losing ground. And if you do not know what you are looking for, you will go back and tune the agent when the agent was never the problem.

The problem was the team.

I want to be specific about what that means. The people on our team are good. Bogdan is a rigorous COO. Janine runs accounting with a precision I cannot match. The callers Arin coaches are working hard. When I say "the team struggles," I am not describing a performance problem. I am describing a set of learned behaviors that made complete sense in an all-human operation and break down in a hybrid one.

The COO's job, in the first months of agent deployment, is to identify those failure modes and train through them. Here is what they are and what the fix looks like.

## Failure mode one: treating the agent's output as a first draft

When a human delivers a report, the default instinct is to review it, edit it, and put your name on the final version. That instinct is good. It is the right behavior with human work.

It does not transfer to agents without modification.

What I see happen is that a human receives Dash's daily ad anomaly report, reads it, thinks "close enough," adjusts a few phrasings, and sends the adjusted version to the client. What they have done is introduced their judgment into a factual data output without updating the underlying source of record. Dash wrote a finding. The human softened it. The client received the softer version. If the finding was right, the client needed the unsoftened version. If the finding was wrong, the fix belongs in Dash's rules, not in an individual human's downstream edit.

The training point is not "stop reviewing agent output." It is "separate review from rewriting." Review flags whether the output met the standard. If it did not, the fix goes back to the agent's rules. If it did, the output goes out as written. The human's job is gate, not ghostwriter.

This sounds small. In practice it determines whether you build a system or a ritual. A ritual is when the human rewrites Dash every morning to match their sense of what the client wants to hear. A system is when Dash's rules reflect what the client needs and the human confirms the rules are holding.

## Failure mode two: reassigning yourself to oversight and then doing the work anyway

When I put Radar on the morning briefing, Bogdan's explicit new role was to read the briefing and act on the flags it surfaced. Not to compile the briefing. That was Radar's seat.

For the first three weeks, Bogdan would read the briefing, notice something Radar had not flagged, and go manually check the source. He would pull the Accelo project list himself. He would scan Slack for context Radar had not surfaced. He was doing the work Radar was supposed to have done.

This is not a failure of trust. It is a failure of role clarity. Bogdan had spent years as the person who checked sources directly. That habit did not disappear because a new seat was added. The habit was the competence. Giving it up felt like giving up the thing that made him good at the job.

What resolved it was not reassurance. It was a direct structural conversation. Radar's rules are where any gap gets fixed. If Radar missed the Accelo flag, the fix is a new rule in Radar's briefing protocol, not a parallel manual check. The moment Bogdan runs a manual check that Radar should have run, he is doing two jobs: his and Radar's. He is not doing either well.

The training: when a human starts performing an agent's seat, redirect the energy into improving the agent's rules. Every manual check is a missing rule. Write the rule. Do not do the check twice.

## Failure mode three: routing everything through the agent instead of using the agent for what it is built for

The opposite failure happens too.

Once a team has agents, there is a temptation to route everything to them. Arin runs call center performance coaching. So a team member asks Arin to handle a message that is about a client relationship, not a calling metric. Crystal tracks project status. So someone routes a client pricing question to Crystal because it is "project-related."

Agents do not have general judgment. They have seated accountability for a defined scope. Arin's scope is dial volume, appointment rate, speed to lead, and per-agent coaching. A client relationship question is not inside that scope. Routing it there does not get you a good answer faster. It gets you an answer from the wrong seat.

The training: know the seat boundaries before you route. The one-seat-one-owner discipline on the org chart is not bureaucracy. It is the reason any individual answer is trustworthy. The moment you route outside the seat, you lose the guarantee that the seat's expertise applies.

Bogdan enforces this explicitly. When someone routes something to the wrong seat, he redirects it, names the right seat, and explains why. After a few months of that, the team internalized the chart. Routing errors dropped sharply.

## Failure mode four: escalating to David when the agent message bus exists

Early in the fleet buildout, when an agent had a problem that touched another agent's scope, someone would come to me. Dash had flagged a spend anomaly. Crystal had the project context. Nobody wanted to make a call about whether they were related without running it past David.

I spent a lot of weeks being a routing node.

What changed is that agents now coordinate directly through their inbox files. Dash can send a structured message to Crystal. Crystal can respond with project context. The coordination happens without a human in the middle and without David as the switchboard.

But the human team had to be trained to trust that coordination channel. The failure mode was not that the agent message bus did not work. The failure mode was that humans did not know it existed and defaulted to escalating instead of letting the agents work through it.

The training: when a question involves two agent seats, wait for the agents to coordinate before escalating. Check the shared state files first. Most of what looks like a gap is already being resolved by the time it surfaces to a human.

## Failure mode five: withholding corrections from the agent's rules

This one is the most expensive and the least visible.

When an agent produces a wrong output, humans are very good at handling it in the moment. Bogdan catches a Dash report that mischaracterized a spend pattern. He corrects it for the client. He moves on. The incident is resolved.

What does not happen automatically is that the correction gets written back into Dash's rules. The learning stays in Bogdan's head. Next week, Dash makes the same error. Bogdan corrects it again. The pattern repeats until someone makes the explicit decision to fix the rule.

At Sneeze It, every correction goes into the learning loop. The correction becomes a rule. The rule applies to the whole fleet. The pattern does not repeat. But this only works if the human who catches the error treats it as a system input, not a one-time fix.

The training is direct: every time you override an agent's output, you have identified a missing rule. Your job is not complete until that rule exists. Deloitte's 2026 State of AI report found that only 21% of enterprises have a mature governance model for agentic AI. The ones that do not are paying for it exactly this way: corrections stay in people's heads, agents keep making the same mistakes, the fleet does not get smarter.

A fleet that learns from corrections is different in kind from one that does not. The COO's job is to build the habit that makes the fleet learn.

## What training actually looks like

I want to be concrete about what this is not.

It is not a workshop. It is not an AI literacy curriculum. It is not a policy document about acceptable use.

It is the COO noticing, in real time, when a human is operating in a failure mode, naming the failure mode directly, and redirecting the behavior in one sentence. It is Bogdan saying "that's Radar's job, write it as a rule" instead of letting the manual check become a habit. It is the weekly review where Bogdan walks one case of each failure mode with whoever is on the team, not as a correction session but as a pattern briefing.

The goal is not to train people on AI. It is to train people on how the seats work, where the boundaries are, and how the system learns. Those are operations concepts, not technology concepts. They have always been what COOs teach.

What is different now is that some of the seats are agents, the seats coordinate through a message bus instead of a meeting, and corrections flow back into rules instead of institutional memory that walks out the door when someone leaves.

The humans do not need to understand how the agents work. They need to understand what the seats own, and that the fleet gets better when they treat corrections as rules. The COO is the person who makes sure they do.

Let agents carry the operational work. That is what they are there for. The COO's job is making sure the humans around them are freed up for the work that actually requires human judgment, and that the system compounds instead of drifts.

That is not a technology management problem. It is an operations management problem. The COO has always owned it.

## See the live chart

The seat boundaries described in this post are queryable directly from OTP's MCP server.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me all agent seats on the Sneeze It chart and what each one owns."*

The response will show you the seat definitions, scope boundaries, and accountability structure that make the failure modes above preventable.
