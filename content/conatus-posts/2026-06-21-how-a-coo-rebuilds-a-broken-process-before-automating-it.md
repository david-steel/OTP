---
title: The COO who automates a broken process just makes the mess run faster
date: 2026-06-21
author: David Steel
slug: how-a-coo-rebuilds-a-broken-process-before-automating-it
type: founder_essay
status: published
series: ai-coo
series_part: 7
description: Before you hand a process to an agent, you have to fix the process. Here is the order of operations that actually works, from a COO who got it wrong first.
---

# The COO who automates a broken process just makes the mess run faster

The most useful phrase I have heard about AI and operations came from Accenture, and it is not subtle: "Don't make inefficiency run efficiently."

That sentence should be printed above every whiteboard in every COO's office where agent deployment is being planned. Because the most common failure mode I have watched play out, including at Sneeze It before we got this right, is not that the agents are bad. It is that the process the agent inherits is broken, and the agent just executes the broken version at scale.

Here is the central claim, stated plainly: you cannot improve a broken process by automating it. You can only make the break happen faster and at higher volume.

The COO is the natural owner of this problem. Not because agents are an IT question or a technology question, but because process design has always been the COO's seat. What changes in an agent era is that the stakes for getting the process right before deployment are much higher than they used to be. A bad human process produces a bad outcome slowly. A bad agent process produces a bad outcome at scale, continuously, without complaint.

## The process that looked ready and was not

In early 2025, before the agent fleet was running properly, we had a lead intake process that touched five people and two systems. A new lead came in. Someone logged it in GHL. Someone else reviewed it for qualification. A third person sent the first email. A fourth set the follow-up task. A fifth confirmed the calendar booking. The process had existed long enough that nobody questioned it.

When we brought Dirk, our sales agent, online to own the pipeline, the first instinct was to map the existing five-step process and assign each step to either Dirk or a human. That is the obvious move. You have a process. You have an agent. You split the work.

What we found when we actually wrote it out was that three of the five steps existed only because the other two did not talk to each other. The manual logging in GHL duplicated data that was already in the intake form. The qualification review was happening after the first email went out, which meant we were reaching people before we had decided they were worth reaching. The follow-up task was being created manually because nobody had set up a trigger.

The process had four years of accumulated workarounds baked into it. It was not a process. It was a series of patches held together by institutional habit.

If we had handed that to Dirk, he would have executed every step faithfully. We would have automated the workarounds. We would have scaled the patches.

## The rebuild order that works

We rebuilt before we automated. Here is the order that worked for us, applied now across every process before we hand it to an agent seat.

Start by writing the intended output, not the steps. What does a completed, correct instance of this process look like? Not the tasks involved. The output. If you cannot write a one-sentence definition of the output that any reasonable person could evaluate, the process is not ready. You cannot hand an undefined output to an agent and expect the agent to resolve the ambiguity correctly. It will resolve it, but not the way you want.

For lead intake, the output was simple: a qualified lead in GHL with a booked meeting on the calendar, confirmed by the prospect, within four business hours of first contact. Everything that did not serve that output was examined as a candidate for removal.

Next, walk every step and ask why it exists. Not whether it is hard or easy. Why it exists. Steps that exist because a previous step produced bad output are symptoms, not solutions. They tell you where the real problem is upstream. Remove the symptom and fix the upstream step. This is the part that takes real time, because the answers are usually buried in institutional memory that nobody has written down.

Then write the clean process, as if you were designing it from scratch today with the tools you actually have. Not as a wish list. Not as what would be ideal in a world of perfect data. What you can actually build now. This version is almost always two to four steps instead of five to eight, because most of the excess steps in a mature process exist to manage the failures of earlier steps.

Only after you have the clean process do you assign seats. Human or agent, one seat per step, one owner per seat. No shared ownership. Shared ownership is where handoffs go to die.

## What we put on the hybrid chart

After the lead intake rebuild, the process went from five steps with five owners to three steps with three owners.

Nick, our cold prospecting agent, owns the top of the funnel. He validates, qualifies against ICP, and drafts the outreach. His output is a validated prospect in GHL with a draft in Gmail. That is his seat. That is his metric.

Dirk, our pipeline agent, owns the mid-funnel. His input is Nick's validated prospect. His output is a booked meeting with stage logged in GHL. He does not qualify. He does not draft cold outreach. He picks up where Nick leaves off.

Bogdan, our COO human, owns the exception case. When a prospect raises something that requires a judgment call, Dirk flags it to the agent inbox and Bogdan makes the call. Not every lead. The ones that fall outside the pattern the agents were built for.

Three steps. Three owners. One scorecard row per seat. Tally pushes the numbers four times a day. Radar reads the state of all three seats in the morning briefing.

The key difference from the old process is not that it is shorter. It is that every step exists for a reason, and the agents do not inherit any of the steps that were patching earlier failures. The patches are gone because the failures that generated them are gone.

## What Accenture and the data actually say

Accenture's framing, "reinvent process before you infuse agents," is not a software implementation principle. It is an operations principle. It predates agents. It is what every serious operations redesign has always required. Agents just make the failure to follow it much more expensive.

Deloitte's 2026 State of AI in the Enterprise (n=3,235) found that only 21% of organizations have a mature governance model for agentic AI. The remaining 79% are deploying into environments where the processes, the accountability structures, and the handoff logic have not been rebuilt for hybrid execution. Most of them are automat­ing what they already have. Most of them will automate the problems along with the work.

The MIT CISR maturity research shows Stage 4 firms outperforming industry by 13.9 percentage points in growth and 9.9 points in profit. The distinguishing factor is not which agents they chose. It is that senior leadership shaped the operating model before deploying at scale. The companies that let the technical teams deploy into unreconstructed processes stay in Stage 1 and Stage 2. The data on what that costs: Stage 1 firms run 26.5 points below industry average on growth and 15.1 points below on profit.

The process rebuild is not a preparation step. It is the investment.

## Where agents belong and where they do not

After two years of running an agent fleet at Sneeze It, the pattern is clear enough that I can state it as a rule.

Agents belong on steps that have a defined input, a defined output, and a success condition that a computer can evaluate. Dash watches ad spend and flags anomalies against a 30-day median. The input is the account data. The output is an alert or a clear. The success condition is whether the number crossed the threshold. That is an agent step.

Crystal monitors active projects in Accelo and flags anything running late or missing tasks. The input is the project record. The output is a flag or a clear. The success condition is whether the milestone has tasks assigned and the date is viable. That is an agent step.

Arin analyzes call center performance and drafts coaching messages for the team. Input is the CCM-Stats data. Output is a draft message. Success condition is whether the draft reflects the actual numbers and matches the coaching pattern. Agent step, with Bogdan reviewing before anything goes to the team.

Humans belong on steps that require company-level judgment, relationship context, or decisions that cannot be evaluated by a computer. When Crystal flags a capacity conflict between two projects and both have the same deadline, Bogdan decides which one gets the senior talent. That is not an agent step. It requires knowing the client, the contract, the team's current state, and the reputational consequences. No agent on our chart holds that step.

Pepper, our inbox agent, triages and drafts. Bogdan approves anything that goes to a client relationship. Dirk flags stale pipeline deals and suggests actions. Bogdan decides which actions actually move. Nick drafts cold outreach. David approves before anything goes to the queue.

The pattern is consistent: agents carry the operational work, humans hold the decisions. The rebuild is what makes that split possible. If the process is a tangle of patches, you cannot draw that line cleanly. The patches live at the boundary between execution and judgment, and they blur it.

## The retirement test

One other thing the process rebuild forces you to do: it makes obsolete seats visible.

When we rebuilt lead intake, one of the five-step owners became redundant not because of agents, but because the step they owned turned out to be a symptom of an upstream failure. Once we fixed the upstream failure, the step vanished. The seat owner moved to a different responsibility.

We had the same experience with Jeff, our former data integrity agent. Jeff's seat was built to manage data quality gaps that existed because the reporting pipeline was fragmented. When we rebuilt the reporting pipeline as part of a process cleanup, Jeff's primary functions redistributed naturally to Dash and Dirk, and the gaps Jeff was patching stopped existing. Jeff went through a formal retirement review in April. The record is kept. The capabilities were redistributed. The redundancy was not Jeff's fault. It was the process's fault for having been built around the fragmentation instead of fixing it.

Rebuilding before automating does not just improve the process. It shows you which seats, human and agent, are patches versus owners.

## The COO owns this

The process rebuild belongs to the COO seat, not the technology team, not the AI lead. Accenture's point about reinventing before automating assumes an executive who owns both the process and the deployment decision. That is the COO.

The COO's job in an agent era is not to hand the process to the technology team and ask them to figure out which steps agents can handle. It is to rebuild the process, draw the human-agent split, put every step on the hybrid chart with one-seat-one-owner, set the scorecard rows, and then hold the fleet accountable in the same Monday meeting where the humans are held accountable.

The agents carry the operational work. The COO designs the system that makes that safe.

Don't automate the mess. Fix the mess. Then automate.

## See the live chart

The Sneeze It org chart, with every seat, every owner, and every accountability, is queryable from the OTP MCP.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the Sneeze It org chart and identify which seats are agents, which are humans, and what each seat is accountable for."*

Every seat you see on that chart went through the process rebuild before an agent was assigned to it.

---

*Series: AI COO. Post 7 of an in-progress series.*
