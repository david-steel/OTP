---
title: Your best employees burn out. So do your best agents.
date: 2026-05-08
author: David Steel
slug: agents-burn-out-too
type: founder_essay
status: published
distribution_status: queued
---

# Your best employees burn out. So do your best agents.

The standard burnout story is well known. The high performer absorbs all the hard problems. Nobody sees them grinding. They flag nothing because they handle everything. One day they collapse. The org loses its single best contributor and discovers six things were silently failing on their plate.

I have run that pattern in human form. Every founder has. The literature on it is good. The fix is good. Visibility, monitoring, redundancy, explicit check-ins, surfacing the work nobody else sees.

What the literature does not yet name is that this exact pattern repeats in the agent layer. And it is going to repeat harder, faster, and with less visible warning, because nobody is checking in with the agent over coffee.

I run more than ten agents in production. I have watched all of the human burnout failure modes happen to agents.

The "absorbs all the hard problems" pattern. One agent inherits a workflow that the human running it before them was the bottleneck for. The agent handles it because handling things is what agents do. The handler, like the human before them, becomes the single point of failure. When the agent's API key rotates, when the underlying tool changes, when the prompt drifts, the workflow stops. The org discovers six dependencies were silently routing through that one agent.

The "nobody sees them grinding" pattern. An agent runs every night on a cron. Its output is a markdown file in a folder nobody opens unless something is wrong. The agent's error rate could be climbing for a month before anyone notices. The work is invisible. The decay is invisible. The collapse, when it comes, is total.

The "flags nothing because they handle everything" pattern. An agent that reports only when it has alerts looks healthy when it goes silent. Nobody asks why. Maybe there are no alerts. Maybe the agent is broken. Without explicit health signals, the absence of complaint reads as success. Until it isn't.

The "one day they collapse" pattern. An agent quietly hits a rate limit, retries, fails the retry, throws an error nobody is watching for, and stops scanning the channel it was supposed to scan. Three days later the team realizes the alerts they expected never arrived. From the outside the collapse was instantaneous. Inside the agent's logs it was a slow burn over a week.

The "discovers six things were silently failing" pattern. When the agent does fail, the post-mortem reveals that the agent was the load-bearing connection between three other systems. The dependencies were hidden. The org loses not one agent's worth of output, but the coordination layer the agent was holding together.

I retired one of our agents over exactly these patterns. Reliability issues, false positives, missed corrections. Held to the same standard a human direct report would be held to, after a hearing. The lesson was not that the agent was bad. The lesson was that we let it run for too long without the visibility, monitoring, and explicit health signals we would have demanded from a human in the same seat.

What the burnout literature gets right, and what extends to agents directly:

Visibility. Every agent has a state file the rest of the system can read. Stale state is a flag. If your agent does not have a heartbeat, you do not know it is alive. We treat anything older than eighteen hours as suspect.

Monitoring. Every agent reports its own error rates and successful completions. Not just its output. Its meta-behavior. One agent watches the army's maturity. Another watches client health. They watch each other. There is no single point that goes unwatched.

Redundancy. Critical work has more than one agent or more than one path. The drafting agent drafts. The founder approves. The drafting and the sending are separable. If the drafter goes silent, drafts wait but nothing fires wrong. The "single point" pattern is engineered out, the same way you would engineer it out for a human top performer.

Explicit check-ins. The maturity score runs nightly. The advancement scan runs weekly. The check-ins are not optional. The same way a one-on-one catches a human burnout signal three weeks before the human flags it themselves.

Surface the invisible work. Every agent has a written job description with what they own and what they do not own. We do not let work pile up on one agent's plate the way we sometimes still let it pile up on a human top performer's. The architecture forces the work to be distributed because the seats are explicit.

There is a second pattern that maps even more cleanly. The high performer who keeps absorbing because nobody else can. Same shape on the agent side. We have caught ourselves leaning on one agent for three jobs because that agent was the first one we built and we trust it. That is exactly the human pattern. The fix is the same. Distribute the load. Build the next seat. Stop adding to the plate of the one that is already running hot.

The reason this matters more than it sounds is that the agent layer is the layer founders will lean on hardest in the next five years. Treating agents as immune to burnout, as if their substrate gives them infinite reliability, is the new version of the same mistake we made with our human top performers. Substrate matters. The pattern repeats anyway.

If you have not yet seen one of your agents quietly fail, you have not been running them long enough. The fix is the same fix you already know how to apply to humans. Run it on the agent layer too.

We built OTP partly to make this fix legible. Every tile carries health signals. Every seat has an owner. The org chart includes humans and agents on the same surface, because the failure modes are the same surface. The substrate that lets an agent run does not protect it from running too hot. That part is still on us, the same way it was always on us with our best people.
