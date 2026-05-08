---
title: Your BPM framework keeps falling off because the SOP is not where the work is
date: 2026-05-01
author: David Steel
slug: bpm-framework-keeps-falling-off
type: founder_essay
status: published
distribution_status: queued
---

# Your BPM framework keeps falling off because the SOP is not where the work is

Every founder I know has tried this. You hire a process consultant. You spend a quarter writing SOPs. You stand up a Notion or Process Street or proprietary-vendor library. You roll it out at an all-hands. Adoption is high for two weeks, soft for two months, and after a quarter the SOP folder is a graveyard nobody opens.

This is the standard story of business process management failing, and the standard explanation is "you did not drive adoption hard enough." Hire the consultant again. Run the rollout again. Try a different cadence.

The standard explanation is wrong.

The reason your BPM framework keeps falling off is structural, not motivational. Your SOPs are documents. Documents are read by humans. Humans only read them when they remember to. The work, meanwhile, is happening continuously, in real time, in tools the SOP cannot reach. The decoupling between where the SOP lives and where the work happens is the half-life of every BPM rollout you have ever seen.

The thing that solves this is not better documentation discipline. It is putting the SOP inside the runtime of the thing doing the work.

For most of business history that was impossible. The thing doing the work was a human who was already doing the work; you could not push an SOP into their head. The best you could do was train them and hope. That is the BPM era we are still mostly inside, and that era is ending.

The thing doing the work is now, increasingly, an AI agent. An AI agent can be handed an SOP at the moment of execution. It reads it every single time. It does not "forget" the framework after the rollout. It does not skip steps because it is in a hurry. It runs the SOP because the SOP is its system prompt.

That changes what an SOP is. It stops being a compliance document. It becomes executable spec. The doc and the work converge.

This is the structural shift the BPM industry has not yet metabolized. Most BPM software vendors are still building beautiful libraries for documents that humans are supposed to read. The right product is a library that compiles into runtime context for the agents that actually do the work. Same SOP, different consumer. The doc looks identical. The performance does not.

We built OTP on this premise. Every tile on an OTP team chart, human or agent, can carry SOPs. Click a button on any agent and OTP compiles that agent's own SOPs plus the SOPs of the human it reports to into a single markdown file. Drop that file into Claude Code, Cursor, Codex, or whatever stack the agent runs on. The agent now executes against the latest version of the SOP, every session, automatically.

When the founder edits the SOP at noon, the agent that boots at 12:01 reads the new version. When a new agent comes online tomorrow, it inherits the SOP that the human who owns the seat has already authored. The half-life problem disappears, because the SOP is no longer a document in a folder. It is the runtime context of the work.

This is a different category of BPM than the one most consultants are still selling. The consultants are not wrong about the problem. SOPs that drift from the work are dead documents. They are wrong about the solution. The solution is not better adoption discipline. It is making the doc inseparable from the work, which now means writing it for the substrate that does the work, which now means agents.

If your BPM framework is failing to stick, you do not have an adoption problem. You have a substrate problem. The thing reading your SOPs is a tired human at the end of a long day, and tired humans skim. Hand the SOP to an agent that reads it cleanly every time. Watch what happens to "stickiness."
