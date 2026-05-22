---
title: Agent-to-agent coordination patterns inside EOS®
date: 2026-05-22
author: David Steel
slug: agent-to-agent-coordination-patterns-eos
type: founder_essay
status: published
series: eos-ai-integration
series_part: 48
keywords:
  - agent-to-agent coordination
  - multi-agent systems
  - EOS
  - Entrepreneurial Operating System
  - agentic AI
  - message bus
  - AI agents
  - Claude
  - ChatGPT
---

# Agent-to-agent coordination patterns inside EOS®

The earlier posts in this series assumed one agent per seat, reporting up to one human. That works for the first 5 to 10 agents in your company. After that, agents start needing to coordinate with each other. The question that shows up is "how do two of our agents talk."

The answer matters because the wrong pattern produces sprawl. Agents start sending each other notifications, looping on each other's outputs, or duplicating work. The right pattern produces an agent layer where each seat does its job and the team's information flows where it should.

This post is for leadership teams running 5 or more agents who are starting to think about coordination.

## The default failure mode

The wrong instinct is to wire every agent directly to every other agent. The Crystal agent reads the Dirk agent's output. The Dirk agent reads the Dash agent's output. The Pulse agent reads everything. Within a week each agent has 8 to 12 input dependencies and nobody can debug anything.

This is the same failure mode that hits human teams when nobody on the org chart knows what they own and everyone is in every meeting. EOS® was built to prevent it on the human side. The same discipline applies to agents.

The fix is one of two patterns. Pick one. Use it consistently.

## Pattern one: the shared-state file

The simplest pattern. Each agent writes its outputs to a file with a predictable path. Other agents that need to consume those outputs read the file.

At Sneeze It we use this pattern. Each agent has a `latest.md` file in a shared folder. Radar reads `dash-latest.md`, `dirk-latest.md`, `pulse-latest.md`, and `crystal-latest.md` when it produces the morning briefing. Each upstream agent writes its own file on its own schedule. Radar consumes when it runs.

What this gets right:

- Each agent stays decoupled. No agent waits on another. No agent gets blocked by another's failure.
- The flow is auditable. Open the folder. Read the files. Trace what informed what.
- The pattern works across vendors. Claude Code, OpenAI Assistants API, and Copilot Studio agents can all write to the same files.

What this gets wrong:

- No real-time coordination. If Dirk discovers something Crystal needs to act on right now, the shared-state pattern is not fast enough.
- Stale data risk. If an upstream agent fails to update its file, downstream agents work off stale data. Build staleness checks (the file's mtime is older than expected; flag the consumer).

For most EOS® companies with 5 to 15 agents, this pattern is enough. Almost everything that needs coordination can wait for the next scheduled run of the consumer.

## Pattern two: the inbox / message bus

A more sophisticated pattern. Each agent has an inbox (a folder, a database table, or a Slack channel) where other agents can leave structured messages. The consuming agent reads its inbox on its run.

We use this too, sparingly. Our Bassim agent (which scores agentic maturity) writes messages to Neil's (the learning officer) inbox identifying capability gaps. Neil reads the inbox each run and decides whether to act.

Message formats matter. We use five message types:

**REQUEST.** "Please do X." Sender expects a response.

**INFORM.** "Here is information you may want." No response expected.

**PROPOSAL.** "I think we should X. Do you agree." Decision expected.

**RESPONSE.** "Here is my answer to your REQUEST or PROPOSAL."

**CHALLENGE.** "I disagree with X you said. Here is why."

Each message carries sender, recipient, type, timestamp, and body. The recipient's SOP describes how each type gets handled.

What this gets right:

- Faster coordination than shared-state. Agents can react to each other within a single human's day.
- Decisions and disagreements get logged. The CHALLENGE type is unusually valuable for caught-on-the-record agent disputes that humans should review.
- The pattern scales to dozens of agents without each one having to know about every other one.

What this gets wrong:

- More complex than shared-state. Worth the cost above ~10 agents, premature below.
- Risk of message loops if agents keep sending each other CHALLENGEs without resolution. Build a hop limit. Build a human escalation if the loop is not resolved.

## When to use which

A rule of thumb.

**Under 10 agents, all reporting to humans on different cadences.** Shared-state file is enough.

**10 to 30 agents with some cross-functional dependencies.** Shared-state for the general case. Message bus for the specific seams (revenue agents talking to retention agents, analytics agents talking to operations agents).

**30+ agents.** Real message bus, real inbox per agent, structured types. You are now running an enterprise-grade agent layer.

Most EOS® companies live in the first two zones. Few need the third anytime soon.

## What stays human

Two specific cases where agent-to-agent coordination should not happen autonomously and should escalate to a human.

**One, cross-Visionary decisions.** Two agents disagree on whether to launch an outbound campaign. The Visionary and Integrator decide. The agents do not.

**Two, decisions that affect external parties.** Two agents propose to send a client different things. A human reads both proposals and chooses. Agents do not negotiate with each other on client-facing content.

These rules go in every agent's off-limits actions field. The agent stops short of acting and escalates.

## A real example from our practice

Our Pulse agent and our Dirk agent had a conflict in late 2025. Pulse flagged a client as at-risk for churn. Dirk's expansion outreach queue had the same client scheduled for an expansion pitch.

Without coordination, Dirk would have sent the expansion outreach and Pulse would have separately drafted a retention check-in. The client would have received two contradictory messages in 48 hours.

We solved this by giving Pulse override authority. Pulse always wins in any Dirk-Pulse conflict. If a client is on Pulse's at-risk list, Dirk's expansion play is paused. The message bus carries the INFORM from Pulse to Dirk: "this client is on the at-risk list, pause expansion." Dirk reads the inbox each run, sees the message, and queues no expansion for that client.

This is exactly the kind of conflict that two human teams would resolve over a Slack DM or in the L10®. The agent layer does the same thing, in structured form, automatically.

## What this looks like in your Accountability Chart

Add a small notation to each agent seat indicating its coordination dependencies.

"Dirk seat. Reports up to David. Coordinates with: Pulse (Pulse overrides on at-risk clients), Pepper (Pepper sends Dirk-drafted emails)."

Short. Specific. Auditable. The Integrator and Visionary can read the chart and know which agents depend on which.

This is the same discipline you would apply to a human team. The Director of Sales coordinates with the Director of Customer Success on at-risk accounts. Document it. Live it.

## FAQ

**Should agents have unique authentication credentials?** Yes, ideally. Each agent runs under its own service account. Easier to audit. Easier to revoke.

**What if an agent fails to write its shared-state file?** Build a staleness check into every consumer. The Radar morning briefing flags any latest.md that has not been updated in the expected window. The Integrator sees the flag.

**Can we use a database instead of files?** Yes. Most agent layers above 15 agents end up with a database for coordination. Postgres works fine. The file pattern is the starting point, not the destination.

**What about Slack or Teams as the coordination substrate?** Workable. Each agent has a private channel that posts its updates. Other agents subscribe to the channels they need. This is the human-readable version of the shared-state pattern.

EOS®, Entrepreneurial Operating System®, V/TO™, Level 10 Meeting®, L10®, Rocks™, Scorecard, Issues List, Accountability Chart, Visionary, and Integrator are concepts and trademarks of EOS Worldwide, LLC. This article is an independent practitioner perspective and is not affiliated with or endorsed by EOS Worldwide.
