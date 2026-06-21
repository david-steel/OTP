---
title: The COO runs a specific sequence before an agent goes live in a real process
date: 2026-06-21
author: David Steel
slug: how-a-coo-onboards-an-agent-into-a-process
type: founder_essay
status: published
series: ai-coo
series_part: 22
description: Deploying an agent is not configuration. It is onboarding. The COO runs a fixed sequence before any agent seat goes live in a real operational process.
---

# The COO runs a specific sequence before an agent goes live in a real process

The most common deployment mistake I see is treating an agent like a software tool you configure and switch on.

You write a prompt, point it at the data, flip the toggle. The agent is live.

Two weeks later the outputs are inconsistent, the process has developed a workaround, and no one is sure who owns the problem. The agent is technically running. The process is quietly broken.

I made this mistake with the first three agents I deployed at Sneeze It. What I learned is that deploying an agent is not configuration. It is onboarding. And onboarding has a sequence.

## The sequence matters because the failure modes are sequential

Each step in agent onboarding guards against a specific failure mode. Skip the step and the failure mode arrives on schedule.

Skip the process audit and you automate a broken process. Accenture puts it plainly: do not make inefficiency run efficiently. The broken process is usually invisible until an agent is faithfully reproducing it at ten times the volume.

Skip the seat definition and you get an agent with no clear accountability. When the output is wrong, no one knows who owns the fix because nobody wrote down what "right" looks like.

Skip the handoff design and you get a process that runs fine inside the agent's scope and breaks at every edge. The output sits in a file that nobody reads.

Skip the trial period and you get a live failure in front of a customer who should never have seen raw agent output.

You cannot compress the sequence without taking on the failure it was designed to prevent.

## Step one: fix the process before you write the prompt

Before I gave Radar the morning briefing, I ran it myself for two weeks and logged every decision: which channels, in what order, what got skipped, what format made the output actually useful.

What I found was a broken process. Six sources with no priority logic, no standard for what surfaced to the summary. Some mornings forty minutes of work. Other mornings a rushed version that missed something.

Handing that to Radar would have automated the failure. I fixed the process first, then handed it over.

Accenture calls this reinventing the process before infusing agents. The reinvention is not optional.

## Step two: write the seat definition in one sentence

Every agent seat on our chart has a one-sentence definition before it goes live.

Tally pushes KPI values from local source files to the OTP scorecard, four times per weekday, without deviation. Dash monitors all managed Meta and Google ad accounts, compares each against yesterday, the seven-day average, and the thirty-day median, and surfaces anomalies in the morning briefing. Nick drafts thirty outbound cold emails per weekday to named individuals at Health and Wellness businesses with two or more locations, validated against bounce-gate criteria, ready for human review before anything leaves Gmail.

Each sentence names the agent, the recurring action, the output, and the completion standard. If I cannot write the sentence, the seat is not ready. Readiness is not about the technology. It is about the clarity of the role.

This is where we lost Jeff, a data integrity agent retired in April after a formal review. Jeff was capable. His seat never had a one-sentence definition, so his mandate drifted until his capabilities had been silently absorbed by seats that did: Dash took the ad account monitoring, Crystal took the Accelo reconciliation. The one-sentence test would have surfaced this before Jeff was deployed.

If you cannot write the sentence, you are not deploying an agent. You are creating a role that will drift.

## Step three: design every handoff before the agent runs

An agent seat does not operate in isolation. It receives inputs from somewhere and passes outputs to somewhere. Both connections need to be designed before the agent goes live.

For Dirk, our sales agent: Dirk drafts reactivation emails from the GHL pipeline and writes them to a queue. I review. Pepper, our executive assistant agent, sends from my Gmail. Dirk logs in GHL. Every link in that chain was named before Dirk touched a single contact.

What we were designing was not infrastructure. We were answering accountability questions. When Dirk's output leaves the queue, whose name is on it? When something goes wrong, who owns the fix?

The agent message bus at Sneeze It handles agent-to-agent coordination through inbox files at named paths. Dirk writes to Pulse's inbox before touching any expansion contact, because Pulse may have flagged that client as a retention risk. Pulse always wins that conflict. If that rule were not in the design, it would have to be discovered in a live incident.

## Step four: run the seat in parallel before you cut over

When Crystal came online as our project management agent, I did not move Bogdan off project tracking on day one.

For two weeks Crystal ran alongside the existing process, producing its project status output every morning. I compared it to what Bogdan produced from manual review.

The comparison revealed things no prompt review would have caught. Crystal was flagging projects as at-risk based on milestone dates without knowing which milestones were placeholders versus committed dates. That distinction was in Bogdan's head, not in Accelo. We fixed the data, then the criteria, then cut over.

The parallel period is not a software test. It is when you find the knowledge that did not make it into the prompt and fix it before it produces a live error. Deloitte's 2026 research found only 21 percent of enterprises have a mature governance model for agentic AI, and the firms that achieve significantly greater value are those where senior leadership actively shapes AI governance rather than delegating it. The parallel period is what that looks like in practice.

## Step five: put the seat on the scorecard before you call it live

An agent is not live until its row is on the Monday scorecard.

Tally was live when its row appeared pushing KPI values four times per weekday. Arin was live when its row appeared showing call center appointment rate against the thirty percent target. Not when the code deployed. When the seat had a named metric, a named target, and a trend arrow in the Monday conversation.

The scorecard condition answers the question every seat has to answer: how will we know when this seat is working and when it is not? If you cannot answer that before deployment, you are not deploying an agent into a process. You are deploying one into a void.

MIT CISR's maturity research shows that Stage 4 firms run 13.9 percentage points above their industry growth average. The differentiator is not technology sophistication. It is unified leadership operating on shared accountability structures. Humans and agents on the same scorecard is that structure made visible. The onboarding sequence ends when the new seat joins it.

Let agents carry the operational work so people are free for the work that matters. The sequence is how you give the agents work worth carrying. Each step forces a decision that would otherwise stay implicit until it became a live problem. The agents will faithfully execute whatever you hand them. Make sure what you hand them is worth executing.

## See the live chart

Every agent seat at Sneeze It went through this sequence before appearing on the org chart, and the chart is queryable from OTP MCP.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the Sneeze It org chart and the accountability metric for each agent seat."*

Every seat on the chart earned its row by completing onboarding. That is the version worth studying.

---

*Series: AI COO. Post 22 of an in-progress series.*
