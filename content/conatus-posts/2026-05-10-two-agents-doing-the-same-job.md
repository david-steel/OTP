---
title: Two agents doing the same job is not a coordination problem. It is an org chart problem.
date: 2026-05-10
author: David Steel
slug: two-agents-doing-the-same-job
type: founder_essay
status: published
series: organizing-agents
series_part: 4
description: Why AI agents end up doing duplicate work, and why every technical fix (orchestration, message bus, agent supervisor) is downstream of the real cause. The three sources of collision, all rooted in chart design.
---

# Two agents doing the same job is not a coordination problem. It is an org chart problem.

The first time two agents on a team collide, the engineering instinct is to add infrastructure.

Maybe a message bus, so the agents can talk to each other. Maybe an orchestrator, a supervisor agent that routes work between the others. Maybe a lock service, so only one agent can hold a task at a time. The conversation in the room is about queues, about retries, about idempotency. The team is about to spend six weeks building the wrong thing.

The duplicate-work problem is not a coordination problem. It is an org chart problem. Every collision I have watched two agents have can be traced back to a missing or unclear line on the chart that drew the agents in the first place. The fix is upstream of any technical orchestration. The fix is on the chart.

This sounds reductive until you sit with it for a few minutes. Two agents are doing the same job because, at the moment they were each given their work, neither was clear which of them owned it. The runtime collision is the symptom. The unclear ownership at the chart level is the cause. You can paper over the symptom with infrastructure. You cannot remove the cause without going back to the chart.

This post walks through the three sources of collision I have seen in our own chart and in the charts of operators who ask me about this. All three are chart problems. All three are upstream. All three are cheaper to fix than the orchestration that gets built when they are misdiagnosed.

## Source one: two seats with overlapping accountabilities

The most common source of collision is two seats on the chart whose roles overlap on the boundary.

Pulse, our retention agent, is accountable for keeping existing client revenue alive. Dirk, our sales agent, is accountable for growing existing client revenue. The boundary between "keep alive" and "grow" is not a line. It is a smear. Both agents have reasons to talk to a current client. Both agents could draft an outbound message. Both agents could think they are the one whose job it is to handle a particular signal.

The first time this happened, both agents independently drafted outreach to the same client about an account expansion conversation. The drafts went to me for approval. The collision was visible only because I happened to be reviewing both queues that morning. If I had not been, both messages would have gone out, the client would have received two emails from Sneeze It in the same week pitching the same thing in slightly different language, and our credibility would have taken a small but real hit.

The fix was not to build a message bus. The fix was to write a single rule on the chart that resolved the boundary. The rule we wrote: any client on Pulse's watch list (defined as a client where retention risk is elevated) is paused from any Dirk outreach until Pulse clears them. Pulse always wins in a Pulse-Dirk conflict. Dirk is the Hunter. Pulse is the Guardian.

That sentence, written into both agents' operating rules, removed the collision class. Not the specific collision. The class. Every Pulse-Dirk overlap from that point forward had a clear answer because the chart had a clear answer.

A message bus would have moved the collision from runtime to runtime-but-faster. The chart rule moved the collision out of runtime entirely.

## Source two: the seat that has no clear input boundary

The second source of collision is a seat whose input is "anything that fits." When two agents both have "anything that fits" for input, every signal is a candidate for both. They will collide constantly because they were designed to.

Our chief-of-staff agent, Radar, runs a daily briefing. The briefing pulls from Slack, calendar, email, project management, sales pipeline, ad performance, and call center metrics. Every other agent in our chart writes something to a shared state file that Radar reads. Radar's input boundary is "everything every other agent has produced today."

The first version of Radar collided with our analytics agent Dash. Both were pulling Meta Ads data directly. The conversation in our team chat was confusing because neither of them was wrong, exactly. They were both supposed to know about ad performance. The collision showed up as duplicated alerts: Radar would flag a budget anomaly in the morning briefing, Dash would flag the same anomaly an hour later in a different surface, and the team would get the same alert twice.

The fix was to define Dash's role as "the source of truth for ad performance" and Radar's role as "the consumer who reads from Dash's shared state file." Once the chart said this, both agents stopped pulling Meta Ads data directly and started honoring the upstream-downstream relationship. Dash writes. Radar reads. The collision class disappeared.

The pattern is general. When a seat has unclear input boundaries, define them by who else's outputs the seat reads. The seats become a directed graph. Collisions happen at edges of the graph that are missing.

## Source three: the seat that is actually two seats

The third source of collision is a single seat that has accreted two distinct accountabilities over time. The seat-owner did not notice because the work all flowed through the same agent. But internally, the agent is now doing two unrelated things, and at some point those two things will compete.

This is the most common source of collision in older agent fleets. The first version of the agent had one job. Over six months, the team kept adding capabilities. By month seven, the agent has a runtime queue with two kinds of work in it, and at some point the queue prioritization disagrees with itself.

The fix is not to build queue priority logic inside the agent. The fix is to split the agent into two seats on the chart.

Our chief learning officer agent, Neil, was originally responsible for two distinct jobs. Scanning the frontier for new techniques. And evaluating the productivity of our existing agents. These two jobs share zero context. They use different tools. They produce different outputs. They were colliding inside Neil's runtime because they were both labeled "learning."

We split them. Neil kept frontier scanning. Bassim took agentic maturity evaluation. Two seats on the chart instead of one. No collision because no shared runtime. The chart got bigger by one row, the agents both got cleaner, and the conversations about "what is Neil doing this week" got more useful.

If you find yourself building queue priority logic inside an agent, stop. Look at the chart. The agent is probably two seats wearing one name.

## What this means for the architecture conversation

The implications for how teams build agent infrastructure are real.

You do not need a message bus to prevent duplicate work. You need clear chart lines.

You do not need an orchestrator to route tasks. You need clear input boundaries per seat.

You do not need queue priority logic. You need to split seats that have accreted two accountabilities.

You do not need a supervisor agent to watch the others. You need every seat to know who it reports to and what the escalation path is when it hits something it cannot handle.

The technical infrastructure for agent coordination is real. We have a small message bus at Sneeze It (agents write to each other's inbox files). We have escalation paths defined per seat. We have shared state files that downstream agents read. But none of that infrastructure exists to compensate for unclear chart design. It exists to support a clear chart that works exactly the way every healthy human org has worked since the first one was drawn.

If your team is about to build orchestration to fix duplicate work, look at your chart first. The collision is almost always upstream of the queue.

## The diagnostic

When two agents collide, do not start with the runtime. Start with three questions.

First: are these two seats covering the same work, or do they have a clear accountability boundary that this collision violated. If the first, the chart is wrong and the seats need to be merged or boundaries drawn. If the second, the violation is the bug, not the chart.

Second: is each seat's input boundary clearly defined, or are both seats free to act on "anything that fits." If the boundary is undefined, define it. Make the seats a directed graph.

Third: is one of these seats actually two seats wearing one name. If yes, split the seat. The chart row count goes up; the collisions go to zero.

These three questions resolve almost every duplicate-work problem I have seen, including ours. The diagnostic takes ten minutes. The infrastructure replacement takes six weeks and produces less.

## See the live chart

Our chart is queryable. You can pull it from any AI assistant with the OTP MCP installed.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me Sneeze It's chart. What are the accountability boundaries between Dirk and Pulse?"*

The answer will include the rule we wrote to resolve the Pulse-Dirk boundary. You can read the rule, see how it sits on the chart, and decide whether your own chart has the same kind of rules where it needs them.

## What comes next

This is post 4 of an in-progress series on organizing agents.

Previous posts:
- [Adding an AI agent to your org chart is not configuration. It is hiring.](/blog/adding-an-agent-to-your-org-chart)
- [Humans and agents on the same scorecard does not feel like a strategic decision until you try the alternative](/blog/humans-and-agents-on-the-same-scorecard)
- [An agent that does not push its own KPI is not actually staffed](/blog/agent-that-does-not-push-its-own-kpi)

The next post will cover the question I get from operators who have decided to start: what should my first AI agent actually be, and how do I tell if a job is ready to be turned into a seat.

If you have a question about agent collisions or coordination that this post did not answer, write to me at dsteel@orgtp.com. Real questions become real posts.

---

*Series: Organizing Agents. Post 4 of an in-progress series.*
