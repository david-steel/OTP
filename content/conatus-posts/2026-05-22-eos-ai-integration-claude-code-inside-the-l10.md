---
title: Claude Code inside the L10®, a walkthrough
date: 2026-05-22
author: David Steel
slug: claude-code-inside-the-l10-walkthrough
type: founder_essay
status: published
series: eos-ai-integration
series_part: 11
keywords:
  - Claude Code
  - Anthropic
  - L10
  - Level 10 Meeting
  - EOS
  - Entrepreneurial Operating System
  - AI agents
  - agentic AI
  - Scorecard
  - Rocks
---

# Claude Code inside the L10®, a walkthrough

This is a practical walkthrough of how we use Anthropic's Claude Code to support our Level 10 Meeting® at Sneeze It. The pattern is reproducible with ChatGPT, the OpenAI API, or any agent platform with file access and scheduled execution. Claude Code is what we picked. The principles travel.

The goal: walk into the L10® with the Scorecard live, Rocks flagged, Headlines compiled, To-Dos audited, and an Issues List that is deduped and ordered. The meeting itself is run by the Integrator on the human side, no model gets typed into during the hour.

## The setup

A folder on the Integrator's laptop holds the company's operating layer. Inside that folder:

- A CLAUDE.md file that contains the company V/TO™ verbatim plus the company-wide standing instructions every agent inherits.
- A subfolder for each agent. Inside each agent's folder is the SOP markdown, the scorecard, and the agent's last few outputs.
- A schedule file that tells the operating system when to run each agent.

Each agent is a Claude Code slash command. Slash commands are markdown files. The agent's job description is the markdown. When the command runs, Claude reads CLAUDE.md, reads the slash command markdown, reads any data sources the command points to, and produces output.

This sounds elaborate. In practice it is a folder with text files and a cron schedule. The text files are readable by any non-technical Integrator. The whole stack is auditable in twenty minutes.

## Monday morning, the Scorecard agent runs

At 6 a.m. ET Monday a Scorecard agent runs. It reads the agent's SOP, opens each upstream system (CRM, ad accounts, call center stats, billing), applies the definition for each row, and writes the week's number into the Scorecard.

For each row the agent also writes a one-line evidence trail. "RMR closed last 30 days: $47,200. Sourced from billing system, filter on contract_date >= 2026-04-22, sum of monthly_amount where status = active." The Integrator can spot-check any number in five seconds.

If a number cannot be computed because of a definition gap, the agent leaves the row blank and posts a ntfy to the Integrator. "Row 'Lead-to-Client Conversion %' has a definition gap. Two leads this week have null source. Need a routing rule." The Integrator fixes the rule or makes a call before the meeting.

## Monday afternoon, the Rocks agent runs

At 2 p.m. Monday the Rocks agent reads each Rock's SOP, checks the milestones against the team's task system, and produces a one-line status for each Rock with evidence.

"Rock: Launch new onboarding flow by Mar 31. Status: On Track. Evidence: 3 of 5 milestones complete, milestone 4 due Wed shows 80% progress in Linear."

"Rock: Hit 50 new logos by Mar 31. Status: Off Track. Evidence: 12 of 50 closed at week 8 of 13. Trajectory implies 19.5 by quarter end."

The Off-Track flag goes to the Accountability Partner before the L10®. The Partner walks in already knowing.

## Tuesday morning, the Headlines and To-Do agents run

At 7 a.m. Tuesday two more agents run.

The Headlines agent reads the customer-facing channels (support inbox, NPS responses, client Slack channels we monitor) and surfaces a Customer Headlines list. It reads the team's internal channels and surfaces an Employee Headlines list. Five bullets each. The team confirms and adds during the L10®.

The To-Do agent reads the prior week's To-Dos from the meeting notes against the team's task system. For each, it reports Done, In Progress, or Not Done with evidence. The completion rate goes into the meeting prep doc.

## Tuesday morning, the Issues List agent runs

At 7:30 a.m. Tuesday the Issues List agent reads the company-wide Issues List, the agent flags from the prior week, and the IDS history.

It clusters by root cause. It deduplicates. It proposes a discussion order based on impact and dependency. The Integrator reviews the proposed order in five minutes and accepts or rearranges.

## Tuesday at 9 a.m., the L10® runs

Same agenda. Same time boxes. No model is opened during the hour.

The team walks in to a Scorecard that is fully populated, Rocks that are flagged, Headlines that are surfaced, To-Dos that have status, and an Issues List that is ordered. The first five sections take exactly their time box. IDS gets the rest of the hour.

If the team hits a clarifying question that nobody can answer, the question goes on the Issues List. Not into ChatGPT in the moment.

## Tuesday at 10:30 a.m., the post-meeting agent runs

After the meeting ends, the meeting notes get dropped into a folder. A post-meeting agent reads the notes and extracts:

- New To-Dos with owner and due date. These get filed into the team's task system.
- New Rocks proposed. These go into the draft for the next quarterly.
- Decisions logged. These go into the strategic notes with date and meeting attribution.
- Issues solved. These get marked closed in the Issues List with the resolution.
- Issues kicked. These stay open with notes.

By 11 a.m. the L10® is propagated. The next L10® opens with everything in flight.

## What this took to build

The initial buildout took about two weeks of focused work for our first agent and about one day per agent after that, because each new agent inherits the V/TO™ preamble and the standing patterns. Two weeks to first L10® with full integration, including the Scorecard and Rocks agents. Six weeks to the full pattern above.

We use Anthropic's Claude Code because the model is strong on long-context reasoning and the platform runs in the terminal where our operations data lives. We could rebuild the same pattern on ChatGPT Custom GPTs, OpenAI Assistants API, or a handful of other platforms. The architecture is portable.

The blocker was never the model. The blocker was definition discipline. We had to nail down the Scorecard row definitions, the Rock Done states, and the SOPs before any agent could push a useful output. Once the definitions were sharp, the agents lit up almost immediately.

## What does not change about the L10®

The agenda. The time box. The Integrator's role. The Accountability Partner's role. The L10® rating at the end (one through ten, expectation set at ten). The discipline of holding the meeting on the same day at the same time every week.

EOS® works because it is a system. The agents serve the system. They do not replace it.

## FAQ

**Can I do this with ChatGPT instead of Claude Code?** Yes. The pattern is platform-agnostic. We picked Claude Code for terminal access. ChatGPT works for the same flow, with different tools to read data sources.

**Do I need to be technical to set this up?** Somewhat. The first agent benefits from a technical builder. After the first agent the pattern is markdown files and SOPs that a non-technical Integrator can edit.

**How much does Claude Code cost?** Anthropic prices Claude Code on usage. Most small EOS® companies spend less per month than one human seat costs per day. Track usage during the first month and tune.

**What if the agent makes a mistake during the L10® prep?** The accountability partner catches it during their pre-meeting review. The meeting still runs clean. The SOP gets updated. Same flow as if a human direct report made a mistake.

EOS®, Entrepreneurial Operating System®, V/TO™, Level 10 Meeting®, L10®, Rocks™, Scorecard, IDS, Issues List, Headlines, and Integrator are concepts and trademarks of EOS Worldwide, LLC. This article is an independent practitioner perspective and is not affiliated with or endorsed by EOS Worldwide.
