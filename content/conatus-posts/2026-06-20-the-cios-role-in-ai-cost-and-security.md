---
title: The CIO's real job in AI is not picking the tools
date: 2026-06-20
author: David Steel
slug: the-cios-role-in-ai-cost-and-security
type: founder_essay
status: published
series: ai-cio
series_part: 4
description: AI cost and security are not IT problems. They are accountability problems. Here is how a working hybrid org assigns them.
---

# The CIO's real job in AI is not picking the tools

The conversation about AI in most organizations goes in one direction: capability. What can the agents do. Which model is smarter. Which vendor has the better API.

The conversation almost nobody is having is the one that actually determines whether the investment survives: accountability. Who decides what each agent can touch. Who owns the bill when token spend spikes at 2 a.m. Who answers when a customer asks how their data moved through your system.

That is the CIO's job. Not tool selection. Accountability architecture.

I say this as someone who runs a small company where I am effectively the CIO, the CEO, and the guy who debugs the cron jobs. I have made most of the mistakes available in this space. The ones that cost real money and real trust were never about choosing the wrong model. They were about leaving accountability ambiguous on cost and access. Every time I left those two things undefined, the system punished me for it.

Here is the worked example of what I had to build and why.

## The cost problem looks like a vendor problem until you see it clearly

When you first start running AI agents, the token bill feels like a fixed cost. You have an agent, the agent runs tasks, you pay for tokens. The bill is the bill.

It stops feeling like a fixed cost the first time it triples in a week without any change you approved.

At Sneeze It, we run Dash as our analytics agent. Dash reads advertising data across forty-plus accounts, computes baselines, flags anomalies, and publishes a state file that every other agent reads during the morning briefing. The work is real and the cost is predictable when the agent is scoped correctly.

When Dash is not scoped correctly, it reads everything it can reach every time it runs. If Dash runs four times a day and pulls sixty days of data on every call instead of the rolling twenty-four hours it actually needs, the token spend multiplies by a factor that shows up on a bill three weeks later, after the damage is done.

The CIO's job on cost is not to pick a cheaper model. It is to define, in advance, what each agent is allowed to consume and when. At the seat level. Per agent. Written down.

We did this by accident the first time. We did it on purpose after the first surprise bill. Now every agent seat on our chart has a scope document that defines what data it can access, how often it can run, and what it should stop doing before calling out for escalation. Tally, our scorecard agent, runs four times a day on weekdays and touches three data sources. That is the whole scope. If Tally ever needs more, that is a conversation, not a silent expansion.

The discipline that prevents surprise AI costs is the same discipline that prevents scope creep in any other seat. You define the job before the seat runs, and you re-examine the scope when the bill changes.

## The security problem looks like an IT problem until someone asks you to explain a data decision

Token cost surprises are expensive. Data access surprises are a different category of problem.

When you give an agent access to a system, you are making a trust decision. You are deciding that this agent, under these conditions, acting inside this workflow, should be able to read or write to this system. If that decision is implicit, if it happened because you needed to get the agent working quickly and the credentials were available, then you have no record of what you decided or why.

At Sneeze It, Janine owns our billing and accounts receivable. She is a human seat, and she works in our accounting systems directly. Dirk, our sales agent, needs to know whether a reactivation prospect has an outstanding invoice before it drafts outreach. That is a legitimate data dependency. The question is how Dirk gets that signal.

The wrong answer is to give Dirk direct access to the accounting system. The right answer is to define a narrow output that Janine's seat publishes and that Dirk reads. Dirk does not need the invoice. Dirk needs a flag: contact cleared or contact flagged. Janine's seat produces the flag. Dirk reads the flag. The accounting system stays out of Dirk's access scope entirely.

This is not a technical pattern. It is an accountability pattern. The CIO's job is to draw those lines before the agents are wired together. Least privilege is not a security feature. It is how you maintain a clear record of what each seat is allowed to know and do.

When you have that record, you can answer the question a customer or regulator might ask. When you do not have that record, you are hoping nobody asks.

## What a working accountability architecture looks like in practice

The pattern that has worked for us is simple enough that I can describe it in a paragraph.

Every agent seat on our chart has three defined boundaries: what it can read, what it can write, and what it must escalate rather than decide. Dash can read advertising data and write to its own state file. It cannot write to billing, cannot write to CRM, cannot write to the client communication record. When Dash finds an anomaly that requires action, it escalates to the briefing and the human in that seat decides what to move. Bogdan, our COO, owns the decision tree for escalations that cross into operations. I own the ones that touch client relationships.

The agents that drift, the ones that quietly start reading more than they were meant to, are almost always agents whose boundaries were defined in conversation but never written into their seat spec. We learned this slowly. The fix was to treat the scope document as part of the seat definition, the same way you would put a job description in front of a new hire before they start.

Tally is the clearest example of this done right. Tally's job is to read specific local data sources and push values to the OTP scorecard. That is the whole job. The scope document names the three sources, the four daily run windows, and the escalation path when a source is broken. Tally does not improvise. If a source is missing, Tally escalates instead of inventing a value. That behavior is not a feature of the model. It is a feature of a clearly defined seat.

## The real question is who answers when something goes wrong

The final piece of the CIO's accountability architecture is the easiest to skip and the hardest to recover from skipping.

When an agent makes a decision that costs money or moves data in a way that turns out to be wrong, the question will be: who was responsible for that agent's behavior? If the answer is "we're not sure" or "the vendor" or "whoever set it up," you have a gap that will eventually matter.

At Sneeze It the answer is always a human seat. Every agent has an owner. The owner is a person on our chart who is accountable for that agent's scope, cost, and escalation behavior. Dash's owner is me. Dirk's owner is me. Tally's owner is me because we are small and the accountability has to land somewhere real.

As we grow, those ownerships will distribute. But the principle does not change. Every agent seat must have a human seat that answers for it. The CIO's job is to make that map before the agents are in production, not after the first incident forces the question.

Cost and security are not IT problems. They are accountability problems. The CIO's role is to build the architecture that makes accountability clear and keep it clear as the agent fleet grows.

The tools are almost beside the point.

## See the live chart

You can query the current seat definitions and agent scopes for the Sneeze It org chart directly through the OTP MCP, including which human seat owns each agent and what data access is documented for each role.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the Sneeze It org chart and identify which human seats own which agent seats."*

You will see the accountability map as it actually runs today, not as it was planned on a whiteboard.
