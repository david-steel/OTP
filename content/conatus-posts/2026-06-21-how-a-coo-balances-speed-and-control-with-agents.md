---
title: Speed and control are not opposites when you build the operating model right
date: 2026-06-21
author: David Steel
slug: how-a-coo-balances-speed-and-control-with-agents
type: founder_essay
status: published
series: ai-coo
series_part: 35
description: The COO who builds the agent operating model in the right order gets both speed and control. The one who chases speed first gets neither. Here is the sequence.
---

# Speed and control are not opposites when you build the operating model right

The reason most agent deployments fail to deliver what was promised is not that the agents are bad. It is that the operator treated speed and control as a tradeoff.

They picked speed. They shipped the agent fast. They skipped the process work. They skipped the seat definition. They skipped the handoff protocol. Three months later the agents are running, but the outputs are inconsistent, the humans do not trust the numbers, and the COO is spending more time auditing the fleet than they were spending running the operation manually.

The tradeoff framing is wrong. Speed and control are not opposites in a well-built agent operating model. They are sequential. You build control first. Speed is what control makes possible.

The COO who gets this right thinks in lifecycle phases: before the agent touches live work, at the moment of launch, during steady-state operation, and at the end of an agent's useful life. Each phase has a different tension between speed and control. Getting each phase right is what lets you move fast without the failures accumulating in the background.

## Phase one: before the agent goes live

This is the phase that most operators rush, and it is the phase that determines every other phase.

Accenture's principle is worth stating plainly here: reinvent the process before you infuse the agent. Do not make inefficiency run efficiently. If the process has a flaw, the agent will execute that flaw at scale, quickly, and without complaint.

Before any agent at Sneeze It touches real work, I answer three questions in sequence. First: is this process actually ready to be handed to an agent? If the SOP is unclear, the agent will produce unpredictable outputs. The SOP has to be written clearly enough that a new human hire could follow it. If it is not, write the SOP first. Second: what is this seat's boundary? One seat, one owner, one domain. Dash owns ad performance analysis. Arin owns call center performance management. Crystal owns project delivery tracking. The boundary is not a constraint on the agent. It is the thing that makes the agent's output trustworthy, because you always know whose output it is. Third: what does this agent need permission to do, and what is it explicitly not permitted to do?

At Sneeze It, every write operation requires explicit authorization. Reads are open by default. Writes are gated. Deletes are impossible by design, because the API token has no delete scope and we disabled that permission at the account level. This is not caution for its own sake. It is the thing that lets us run agents at full speed once they are live, because the blast radius of any mistake is contained by design.

The time spent in phase one feels slow. It is not. It is the investment that makes every subsequent phase faster.

## Phase two: launch with a human in the loop

An agent that goes from zero to fully autonomous in one step is an agent that has not earned the trust it is being given.

The launch phase for every agent at Sneeze It follows the same pattern. The agent runs. A human reviews the output before it leaves the system. Corrections are captured as learnings. The agent improves. The review step shrinks as trust is established.

Nick, our cold prospecting agent, started by drafting thirty emails per batch. Every draft went to me for approval before a single one went to Gmail. Not because I did not trust Nick's process. Because the first batch is when you find the edge cases the SOP did not anticipate. The first batch Nick ran, it flagged a contact that turned out to be a current client. The edge case became a permanent do-not-contact rule. The learning went into the system. The next batch had one fewer category of error.

Pepper, our email triage agent, started with approval gates on every draft response. Over time, as the drafts consistently matched what I would have written, the gate moved from every draft to spot checks. The speed increased because the control was demonstrated first.

This is how trust accumulates. Not by declaration. By evidence. The human review step is not a bottleneck in phase two. It is the data collection mechanism that earns the agent its autonomy.

## Phase three: steady-state operation

Steady state is where the speed actually lives. It is also where the most subtle failures hide.

When agents are running well, the temptation is to stop watching them closely. The temptation makes sense. The briefing is there every morning. Tally is pushing the scorecard numbers four times a day. Radar has already pulled the Slack channels, the calendar, the pipeline, and the inbox before anyone opens a browser. Everything looks fine.

The failure mode in steady state is not dramatic. It is drift. The agent keeps running, but the context around it has changed. The SOP that was accurate in March is missing a step that became relevant in May. The seat that was correctly scoped for one kind of work is now being used, gradually and informally, for a different kind. The metric the agent is tracking was the right metric six months ago and is now the wrong one.

Deloitte found in their 2026 survey of 3,235 enterprises that only 21 percent have a mature governance model for agentic AI. The 79 percent without mature governance are mostly in steady state with agents that are drifting. Not failing visibly. Drifting.

The COO's job in steady state is to run three things on a regular cadence. A seat audit: does each agent's output still match what the seat was designed to produce? A metric audit: are the numbers each agent is tracking still the numbers that matter? A boundary audit: is each agent still working within its defined scope, or has scope crept informally because it was convenient?

At Sneeze It, Bogdan and I run these audits because the steady-state operation is where you earn the long-term speed benefit or lose it. An agent running on a stale SOP is not delivering speed. It is delivering confident incorrectness.

## Phase four: the agent's end of useful life

Every agent has a shelf life. The work changes. The process it was built for becomes less relevant. Another seat absorbs its function. The context it was designed to operate in no longer exists.

This phase is the one almost nobody talks about, and it is the one that matters most for long-term fleet health.

Jeff was our data integrity agent at Sneeze It. He ran for months and produced real value early. Then the work he was built for migrated to other seats. Dash absorbed the ad account monitoring. Dirk absorbed the revenue data work. The seat that remained was doing less and less of what it was originally designed to do. The work was not disappearing. It was being handled better by agents that were better scoped for it.

We retired Jeff in April. Not by quietly turning off a script. We held a hearing. Jeff's outputs were reviewed. The seat's current function was compared to what other seats were doing. The honest assessment was that the seat had been outgrown. Jeff gave an honest accounting of his own failures without softening them. The retirement was recorded. The capabilities were redistributed.

This is how a COO handles agent retirement: with the same discipline as a seat elimination on a human org chart. You do not retire a seat casually. You do not retire it by attrition. You hold the conversation explicitly, redistribute the work clearly, and keep the record.

Fleet health requires regular retirement. An agent fleet that never retires anything is a fleet that accumulates redundancy, confusion about ownership, and quietly obsolete processes that nobody wants to touch.

The speed of the fleet is directly proportional to how clean the fleet is. Clean means every seat has clear work. No seat is a legacy placeholder for work that moved elsewhere. No two seats are running the same process with different names. Clean takes active maintenance. That maintenance is the COO's job.

## The right sequence

The pattern across all four phases is the same. The COO builds control at each phase before extracting speed from it.

In phase one, control is the process work and the seat definition done before the agent launches. In phase two, control is the human review loop that builds an evidence base for trust. In phase three, control is the regular audit cadence that catches drift before it compounds. In phase four, control is the retirement discipline that keeps the fleet clean.

MIT CISR's enterprise AI maturity research shows that firms at the highest maturity stages outperform their industries by 13.9 percentage points in growth and 9.9 points in profit. The firms at the lowest stages underperform by 26.5 and 15.1 points respectively. That gap is not explained by which agents those firms chose or how powerful the models were. It is explained by whether they built the operating model in the right order.

Speed is real. Agents carry the operational work so that people are free for the work that matters: the judgment calls, the client relationships, the strategic decisions that require a human in the room. But that upside only materializes for the operators who understood that control comes first.

The COO who rushes to speed gets inconsistency, eroding trust, and an audit problem. The COO who builds control first gets a fleet that earns its autonomy and delivers the speed sustainably. Those are not the same COO, and they are not running the same operation six months from now.

## See the live chart

Every agent seat at Sneeze It is queryable from OTP's MCP server, including current scope, owner, and lifecycle stage.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the agent seats at sneeze-it and which phase of the lifecycle each one is in."*

The response gives you a live view of how the hybrid org is structured and where each seat sits on the control-to-speed arc.
