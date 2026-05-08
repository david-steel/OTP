---
title: Agents alone are not going to fix the interruption problem. The team has to actually use them.
date: 2026-05-08
author: David Steel
slug: agents-alone-dont-fix-interruptions
type: founder_essay
status: published
distribution_status: queued
---

# Agents alone are not going to fix the interruption problem. The team has to actually use them.

I published a post earlier today arguing that agents catch the routine layer of "got a minute?" interruptions, and only the genuinely novel cases reach the founder. The argument holds. I want to walk back the implication that installing the agent is the whole job.

It is not. Here is what putting an agent in a seat does not do, by itself.

It does not change where the team's reflex goes. The team walks into the founder's office because that is where the answer has lived for the last five years. The reflex is muscle memory. Installing an agent does not rewire it. The team has to develop the habit of asking the agent first. That is a culture change, not a software install. The first month of an agent in a seat is mostly the founder routing questions back. "The agent has the answer. Ask it. Tell me what it said and we will go from there." If the founder does not say that, the team keeps walking in.

It does not fix the SOP problem. If the SOP authored on the agent's tile is wrong, the agent gives confidently wrong answers fast. Confidently wrong is more dangerous than slow and right. Now the team is taking direction from a substrate that is producing instructions the founder would never give. The interruptions stop because the team thinks they have the answer, but the answer is wrong. That is worse than the original problem. The author of the SOP, almost always the founder, has to actually think about every routine question and write down what they would have said. The agent does not do that work. The agent reads what was written.

It does not maintain itself. Agents need the SOP edited when reality changes. They need corrections captured. They need somebody actively watching for cases the agent answered wrong so the loop can close. That work is discipline. The same discipline the BPM consultants have been talking about for fifty years. Agents do not eliminate the discipline. They move it from "training humans to remember the doc" to "authoring runtime context that an agent reads cleanly." Easier in some ways. Not free.

It does not give the founder permission to step back. Most founders I know, myself included, will keep getting interrupted because we keep answering. The agent could have answered, but the team asked, and we said yes because we are wired to answer. Until the founder commits to "ask the agent first" as a rule the team can quote back, the founder is still the bottleneck. The handoff is a founder behavior change, not an architectural one.

So the right framing is not that agents eliminate the work the BPM industry has been trying to do for half a century. They make the work cheaper to do well, on a substrate that can hold its end of the contract. But the work has to actually be done.

What does "done well" look like, concretely?

There is a named owner of the agent's SOP. They edit it when the rules change. They review the agent's answers when something feels off. They capture corrections so the next session is smarter. If no human owns the SOP, the agent will produce ten thousand confidently stale answers before anyone notices.

There is a team norm. Ask the agent first. The founder enforces this norm by routing questions back to the agent the first time someone interrupts with a question the agent should have caught. Not as punishment. As a load-bearing handoff. The norm has to be repeated until it is the new reflex.

There is a feedback loop. When the agent gets it wrong, the human who caught the wrongness updates the SOP. When the agent does not know, the human answers and the answer goes back into the SOP so the agent does know the next time. This is the same six-step BPM discipline. Reinforce, correct, update. The substrate is easier to maintain. The discipline is the same.

There is monitoring. Agents drift. They depend on tools that change. Their context windows compress. They get prompts that contradict each other. Without somebody watching, an agent can quietly stop being good without ever flagging it. We retired one of ours over exactly that pattern. The monitoring is part of the work, not an afterthought.

The BPM industry's instinct that this requires real implementation discipline is correct. It always required that. The substrate change does not eliminate the need. It changes the shape. The work goes from "make humans remember the SOP" to "keep the SOP correct and keep the team using the substrate that reads it." Easier in some ways. Harder in others. Same discipline. New layer.

If you install an agent and your team's interruptions do not drop, the agent is not the problem. The agent is doing what agents do. The work that did not get done is the human work around the agent. The author of the SOP, the team norm, the feedback loop, the monitoring. Without that, you have not installed an agent. You have installed a faster wiki.

We built OTP for the case where that work gets done well. Tiles for SOPs. Inheritance from the human up the chain. Corrections captured into a system the next session reads. The substrate is ready. The discipline is still on us.
