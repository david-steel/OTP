---
title: Designing a process that runs on humans and agents starts with one question, not two
date: 2026-06-20
author: David Steel
slug: designing-a-process-that-runs-on-humans-and-agents
type: founder_essay
status: published
series: ai-coo
series_part: 2
description: The COO's design question is not "what can agents do." It is "who decides." Get that right and the rest of the process follows.
---

# Designing a process that runs on humans and agents starts with one question, not two

Every COO I talk to who is running agents asks the same design question when they are building a new process. They ask: what should the agent do, and what should the human do?

That is the wrong question. Or rather, it is the second question. Ask it first and you will keep rebuilding the process every few weeks because the answer keeps shifting as the agents get better.

The first question is: who decides?

Everything else in process design follows from that. When you know who holds the decision, you know who needs context, who needs authority, and what the hand-off looks like. Agents can execute almost anything. They cannot hold decisions that require judgment on behalf of the company. Once you accept that distinction, designing a hybrid process becomes much more straightforward than it looks.

## The decision tree, not the task list

Most process design starts with a task list. Here are the steps. Here is who does each one.

A hybrid process, one that runs on humans and agents, has to start with a decision tree instead.

A decision tree for a process asks three things at every step. First: is this a decision or an execution? Second: if it is a decision, does it require company-level judgment or pattern-matching? Third: where does the output go and who confirms it before it moves?

Those three questions create four kinds of steps.

**Execution steps with clear rules.** These go to agents. Tally pushes KPI values to the scorecard four times a day. There is no judgment in that step. The rule is clear, the source is defined, and the output is a structured number. Dash scans thirty-plus ad accounts every morning, extracts the numbers, compares them to baseline, and writes a file. No one needs to decide whether to run that scan. It runs.

**Execution steps with fuzzy rules.** These can go to agents with a human confirmation gate. Dirk identifies accounts that have gone thirty days without contact and drafts a reactivation email. The draft is the execution. The decision, whether to send it and to whom, stays with me or with whoever Dirk is routing through. The agent executes the research and the writing. The human confirms before it leaves.

**Decisions with clear precedents.** These can be delegated to agents with a defined escalation path. If Dash sees a client account drop more than twenty percent on lead volume in a week, the rule is defined: flag it, do not recommend, escalate to the briefing. Dash does not decide what to do about it. Dash decides that the threshold was crossed and routes accordingly. That is a pattern-match, not a judgment call, and it can live with the agent.

**Decisions that require company-level judgment.** These stay with humans, always. Whether to fire a caller. Whether to discount a client's retainer. Whether to enter a new vertical. Bogdan holds those decisions on the operational side. I hold them on the strategic side. No agent is chartered to touch them, and the process should be designed so they never reach an agent without first passing through a human.

Most of the friction I see in hybrid process design comes from collapsing those four categories into two. People ask "agent or human" and skip the underlying question of what kind of step it is. When you skip that question, execution steps end up with humans who do not need to own them, and decision steps end up with agents who cannot hold them.

## What the design actually looks like in a running process

Take the billing process at Sneeze It. This is a real process, not a hypothetical.

Every month, Janine runs AR. She invoices clients, tracks collections, flags anything that is late or disputed. That is a human seat with human judgment. Whether to extend a client thirty days, whether to escalate to a conversation, whether to write something off. Those are Janine calls. She needs context I do not always have and she needs to read the client relationship, not just the number.

What changed when we added agents to that process is not Janine's role. What changed is what arrives on her desk.

Tally now pushes KPI numbers to the scorecard automatically. Janine does not have to pull them. Dash flags when a client's ad spend drops, which is often the first signal that a client is about to request a pause or a cancel. That signal used to reach Janine only after the pause request came in. Now it reaches her before. Radar surfaces the calendar and the context so Janine is not piecing together what happened last week before she makes a call.

The agents did not change the process. They changed the quality of what the human holds when she makes the decision. Janine still decides. She decides faster and with better information.

That is what a well-designed hybrid process feels like on the human side. The work that lands on the human is the work only the human can do. The agents carry everything upstream of that.

## The hand-off is the hardest part

Every hybrid process has at least one hand-off point, where agent-executed work passes to a human before a decision is made.

The hand-off is where most processes break down.

The failure mode is one of three things. The agent produces output the human does not trust, so the human re-does the work. The agent produces output the human cannot interpret quickly, so the gate becomes a bottleneck. Or the agent produces output with no clear owner on the human side, so it sits until someone notices.

Fixing the first failure requires the agent to explain its work, not just produce it. Dash does not just return a number. Dash returns the number, the baseline, the delta, and the trend arrow. Janine or I can verify the logic in twenty seconds. The trust is built into the format.

Fixing the second failure requires designing the output for the human's context, not the agent's convenience. The hand-off is not a data dump. It is a brief. Radar's morning briefing is built so I can read the critical flags in under three minutes. If I need to go deeper on something, the detail is there. If I do not, I do not have to touch it.

Fixing the third failure requires named ownership. Every piece of agent output that requires a human decision has a name on it. Dirk's reactivation drafts have my name on them. Dash's client alerts have Bogdan's name on them during the weeks I am out. The output does not exist in a shared queue where everyone assumes someone else is handling it.

## The COO's actual job in a hybrid process

When I am designing a process that will run on humans and agents, my job is not to figure out what the agents are capable of. That ceiling keeps rising and designing to it is a waste of time.

My job is to protect three things.

First, the decisions. Every decision in the process needs a named human who owns it. If I cannot name the human, the process is not ready to run.

Second, the hand-offs. Every point where agent output moves to a human needs a format, an owner, and a timing. If any of those three is missing, the hand-off will fail.

Third, the feedback loop. When a process step breaks, whether it is an agent step or a human step, the failure has to surface somewhere visible. That is what the scorecard is for. Tally keeps those numbers current. Bogdan and I review them. If a row drops, we have the conversation, regardless of whether the seat is a human or an agent.

The mission underneath all of this is simple. Let agents carry the operational work so that the humans are free for the work that actually requires them. You do not get there by handing tasks to agents. You get there by designing the process from the decision backward.

## See the live chart

You can query the current seat structure of the Sneeze It org, including which seats are agents and which are humans, directly via the OTP MCP.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me which seats on the Sneeze It chart own decision gates versus execution steps."*

You will see the seat structure as it actually runs, not as it was planned. That is the version worth studying.
