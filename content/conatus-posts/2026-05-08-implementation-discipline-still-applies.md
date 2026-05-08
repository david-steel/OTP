---
title: The implementation discipline that makes processes stick for humans applies to agents too. The work moves up a layer.
date: 2026-05-08
author: David Steel
slug: implementation-discipline-still-applies
type: founder_essay
status: draft
---

# The implementation discipline that makes processes stick for humans applies to agents too. The work moves up a layer.

The standard BPM advice on getting employees to follow processes is six steps. Make the expectation clear. Train them on it. Reinforce it. Measure outcomes. Correct deviations. Update when conditions change. The list has been right for fifty years. It is still right.

The reason most founders I know start hiring agents is the hope that the list of six gets shorter. Hand the SOP to the agent. The agent reads it. The work is done.

That has not been my experience. Every step on the list still applies. The substrate changed. The discipline did not. The work moved up a layer.

Make the expectation clear. For humans, this is the SOP itself. For agents, this is also the SOP, except the bar for clarity is higher. A human can fill in gaps with judgment, ask a peer, or default to common sense. An agent does what the prompt says. If the SOP is ambiguous, the agent is confidently ambiguous. The cost of vague SOPs goes from "team gets it mostly right" to "agent picks one interpretation and runs it ten thousand times." The discipline of writing the SOP precisely matters more, not less.

Train on it. For humans, this is onboarding, role-playing, and a manager walking through the doc. For agents, the equivalent is the system prompt and the runtime context, which is the agent's only training. There is no follow-up coaching. There is no peer to copy from. The first read of the SOP is the only training. If something is missing, it is missing for every session. The "training" step does not vanish. It compresses into the act of authoring the prompt well.

Reinforce. For humans, reinforcement is a manager noticing a deviation and naming it. For agents, reinforcement is corrections going back into the SOP so the next session does not repeat the mistake. We built OTP partly for this reason. Every correction David gives an agent is captured to OTP and pushed back into the SOP layer the agent reads next session. Without that loop, the agent makes the same mistake forever. With it, the agent improves session over session. Reinforcement does not go away. It changes shape.

Measure outcomes. For humans, this is KPIs and reviews. For agents, this is also KPIs, except the KPIs are now machine-readable and updated on a cron. We push agent KPI values to the org chart four times a day on weekdays. The measurement does not get more lenient because the substrate changed. It gets more frequent and more granular. The discipline is still the same. Name what good looks like. Watch the number. React when it drifts.

Correct deviations. For humans, this is feedback in a one-on-one. For agents, this is a correction captured the moment the founder notices the agent did the wrong thing. The capture is not optional. Rule fifteen of our agent army says: when the founder corrects an agent, the agent must call the capture function before continuing. Every correction is data. The discipline of correcting deviations is more rigorous in the agent stack than it ever was in the human stack, because we wrote it down as a rule the agent has to follow.

Update when conditions change. For humans, the SOP gets revised, reissued, and retrained on. For agents, the SOP gets revised and the next boot reads it. The mechanics are easier. The discipline of noticing that the world changed and updating the doc is exactly the same. If nobody is editing the SOP when conditions shift, the agent runs the old version against the new world. The doc going stale is still a failure mode.

The reason this matters is that the founders I see hiring agents tend to think of agents as a way to skip the implementation discipline. They are not. They are a way to apply the discipline at a layer that holds it better. The discipline does not go away. The same six steps run, just with an agent on the receiving end instead of a person.

There is a sharper way to say this. The reason BPM frameworks fall off in the human layer is that the loop between the SOP and the work depends on memory, training, and habit, three things that decay. The reason BPM frameworks could finally stick in the agent layer is that the agent has no memory to fade and no habit to drift into. The agent reads its prompt every session. The price of that reliability is that the prompt has to actually be right, every session. The author has to do the work the human used to do in their own head. There is no skim. There is no fill-in-the-blank.

The BPM consultant's job in this world looks different but is not gone. The author of the SOP is still load-bearing. The reinforcement loop is still load-bearing. The measurement layer is still load-bearing. What changes is who reads the SOP and how the loops close. Agents close them faster, more reliably, and at lower cost per session than humans ever could. They do not close them at zero cost.

If your agents are not producing the outcomes you expected, audit the six steps. The most common pattern I see in my own stack and in others I have looked at: founders authored an SOP once, dropped it on the agent's tile, and walked away. No reinforcement. No measurement. No corrections. No updates. The agent is doing exactly what was asked of it, which is the same problem the BPM industry has been documenting on the human side for half a century. Different substrate. Same root cause. Same fix.

The substrate changed. The work moved up a layer. The discipline is the same discipline. Different consumer.

We built OTP for the case where the discipline gets done. Tiles carry SOPs. Inheritance closes the loop from the human author down to the agent that reads. Corrections capture into a layer the next session reads. KPIs push to the chart on a schedule. The mechanics make the discipline cheaper. They do not make it optional.
