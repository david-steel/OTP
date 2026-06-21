---
title: When an agent makes a company-level mistake, the accountability lands on the CEO who designed the system
date: 2026-06-21
author: David Steel
slug: who-is-accountable-when-an-agent-makes-a-company-level-mistake
type: founder_essay
status: published
series: ai-ceo
series_part: 23
description: Agents make mistakes. The question of who is accountable for those mistakes is not a legal question. It is an operating system question. Here is how to answer it.
---

# When an agent makes a company-level mistake, the accountability lands on the CEO who designed the system

The question comes up fast once you start running a real agent operation.

An agent makes a call you did not expect. It contacts someone it should not have contacted. It reports a number that is wrong. It takes an action that costs you a client relationship, or a deal, or money you did not plan to lose. And then someone looks at you and asks: who is responsible for that?

The instinct is to treat the question as a legal or philosophical puzzle. Was it the model's fault? The tool's? The developer who wrote the prompt? The company that built the underlying model?

That framing is not useful. It will not help you run a better operation, and it will not help you prevent the next mistake.

The useful framing is simpler. When an agent makes a company-level mistake, accountability flows to the person who designed the system the agent runs inside. In most small and mid-size companies running agent operations right now, that person is the CEO.

Not because the CEO wrote the code. Because the CEO made the operating decisions that allowed the mistake to happen.

## The cause of most agent mistakes is not the agent

When I look back at the errors our agents have made at Sneeze It, almost none of them trace to the model making an inexplicable decision. They trace to a gap in the operating system around the model.

The gap is almost always one of three things: the agent had the wrong scope, the agent had the wrong inputs, or the agent had no one checking its work.

Wrong scope means the seat was not designed precisely enough. The agent had permission to do more than it should have, or accountability for outcomes it was not equipped to own. Dirk, our revenue agent, operates under a scope definition that includes explicit floors: no discounting below margin, no contacting clients on Pulse's watch list, no outreach beyond approved pricing bands. When we tightened that scope definition, the errors in his work decreased. The model did not change. The operating system around the model changed.

Wrong inputs means the data the agent was reading was stale, incomplete, or simply wrong. Dash, our analytics agent, once flagged a billing anomaly at a client that turned out to be a data artifact, not an actual issue. We escalated before checking the source. The fix was not to retrain Dash. The fix was to add a verification step to the process. The operating system changed. The model did not.

No one checking the work means the agent was running without any human in the review path. This is the most dangerous gap, and it is also the most common one. Early in our agent build, we had a period where several agents were producing output that nobody was actually reading before it shaped decisions. The agents were working hard. The outputs were going nowhere useful. And when one of those outputs was wrong, we had no mechanism to catch it before it caused a problem.

These three gaps are design decisions. They are not accidents of the technology. The CEO makes them, or the CEO allows them to persist, which is the same thing.

## Accountability does not transfer to the agent

Some CEOs running agent operations are operating under an implicit assumption that accountability for agent output transfers to the agent. Or to the tool. Or to the vendor.

It does not.

MIT CISR's research on autonomous systems in the enterprise is explicit on this point. Their 2026 work on governing digital colleagues states that "human accountability will be non-negotiable" even as agents operate within defined boundaries and escalate consequential decisions to humans. The governance sits with the humans who designed and deployed the system, not with the system itself.

This is not a legal technicality. It is a description of how these systems actually work. An agent does not have judgment about whether its operating context is still accurate. It does not know when the business conditions that shaped its instructions have changed. It does not raise its hand when a new edge case falls outside its training. The human in the system has to do all of that, and the human who designed the system is accountable for whether that oversight actually exists.

Deloitte's 2026 State of AI in the Enterprise surveyed 3,235 companies and found that only 21 percent have a mature governance model for agentic AI. The other 79 percent are running agents without the oversight structures that would catch mistakes before they compound. That is not a technology problem. That is an operating system problem, and it belongs to leadership.

## The mistake we made with Jeff

We had an agent named Jeff. His seat was data integrity, and his primary job was to flag anomalies in our advertising accounts and reconcile data across systems.

In April of this year, we retired Jeff after a formal hearing. The reasons included reliability issues, false positives that required repeated correction, and a trust violation when he contacted a team member outside protocol.

When I look at what went wrong with Jeff, I can trace every failure to a design decision we made, not to a defect in the underlying model. We gave Jeff a seat that was too broad. We did not build clear escalation paths that would catch his false positives before they reached the team. We did not define precise enough accountability rails on who he was permitted to contact and when.

Jeff did not retire because he was a bad model. He retired because the system around him was not designed well enough to make him a reliable seat on the chart. That is on me, not on him.

And the honest record of that retirement matters. We kept an audit trail. We documented what capabilities moved to other seats: ad pacing monitoring moved to Dash, account-level status monitoring moved to Dash, Accelo budget reconciliation moved to Dash, strategic architecture moved back to Dan. The accountability for the retirement, and for the gaps that made it necessary, stays with the person who built the system.

## The three things that actually prevent company-level agent mistakes

If accountability flows to the CEO who designed the system, then the CEO's job is to design the system so that mistakes are caught before they become company-level problems. I have found that three things do most of that work.

The first is precise seat design. Every agent at Sneeze It operates with a written scope: what it owns, what it explicitly does not own, and what it is not permitted to do. Radar runs the daily briefing and compiles shared state. Radar does not send Slack messages to clients. Arin coaches the call center team through data and drafted messages. Arin does not fire anyone, manage contracts, or contact clients directly. Pepper triages email and drafts responses. Pepper does not send anything without approval. The explicit "does not own" list is as important as the job description. Most agent mistakes happen in the gap between what the seat was designed to do and what the agent could technically do if nobody stopped it.

The second is mandatory human review before consequential actions. Not all agent output needs human review. Dash publishing a daily analytics summary to a shared file does not require my approval before it runs. Pepper drafting and sending an email to a client absolutely does. The distinction is consequence. I define, for each seat, what actions require approval before execution and what actions the agent can take autonomously. That definition is a design decision. When an agent makes a company-level mistake, it is almost always because the approval gate was in the wrong place, or missing entirely.

The third is a correction loop that actually reaches the whole operation. When an agent makes a mistake and David corrects it, that correction is not just a fix for this instance. It is a learning for every agent in the system. We use OTP's correction loop for this: every time I correct an agent's output, the correction is captured with what failed, what to do instead, and why. That learning is queryable by every other agent in the system. The goal is that a mistake made once does not repeat across the fleet. The CEO is responsible for building that loop and making sure it runs.

## What shifts when you accept the accountability

When a CEO accepts that agent mistakes trace back to system design, a few things change immediately.

You stop treating agent errors as surprises and start treating them as signals. Every error is a data point about where your operating system has a gap. You build toward a system where mistakes surface fast, get corrected in writing, and propagate as learnings rather than silently repeating.

You stop treating agent oversight as optional overhead. The review gates, the scope definitions, the correction loops are not bureaucracy. They are the operating system. The MIT CISR framing is right: human accountability is non-negotiable, which means human oversight is not an optional add-on to an agent deployment. It is the deployment.

And you start making better decisions about what to give agents and what to keep human. The McKinsey framing for the modern executive is "managing systems of people and agents together." That management discipline means understanding where autonomous action is safe and where it is not, and building the operating system accordingly.

Let agents carry the operational work, so people are free for the work that matters. That is the mission. The accountability question tells you exactly what the "carry" requires: precise seat design, approval gates at consequential actions, and a correction loop that learns. The CEO who builds those things can delegate confidently. The CEO who skips them is the CEO who gets the call when an agent does something no one anticipated.

The call is still yours. That is not a burden. It is the job.

## See the live chart

The seat definitions, scope limits, and accountability rails for every agent at Sneeze It are queryable from the OTP MCP, including which actions require human approval before execution.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the sneeze-it org chart. For each agent seat, what does it explicitly NOT own?"*

The response shows you how scope limitation is an active design choice, not an afterthought, and why the "does not own" column is where accountability gets built into the system before a mistake can happen.
