---
title: The CEO's job of deciding what stays human is harder than building the agent
date: 2026-06-21
author: David Steel
slug: the-ceos-job-of-deciding-what-stays-human
type: founder_essay
status: published
series: ai-ceo
series_part: 16
description: How to make the judgment call about which work belongs on a human seat vs. an agent seat, with a worked example from Sneeze It.
---

# The CEO's job of deciding what stays human is harder than building the agent

Every CEO building an agent team eventually hits the same wall.

You have figured out how to build the agent. The tooling is good enough now that building is not the hard part. The hard part is the decision that comes before you build: is this work better on a human seat or an agent seat?

That question sounds simple. It is not. And the CEOs I watch get it wrong are usually making one of two mistakes. Either they automate things that should have stayed human, then quietly patch the damage over the next few months. Or they keep things on human seats that agents could do better, then wonder why they are still as busy as before.

The decision about what stays human is a CEO-level judgment. Not because it is technically complex. Because it requires knowing what your company actually sells, what trust is worth to your clients, and what you are willing to be accountable for. No agent makes that call for you.

Here is how I make it at Sneeze It, with a specific worked example.

## The three questions I ask before I assign a seat

Before I put a function on an agent or a human, I ask three things in order.

First: does this work require relational authority? By that I mean, does the work land differently if a person does it versus a system? There is a real class of interactions where the relationship is part of what is being delivered. A client who is down 30% in leads does not just need data and a diagnosis. They need a person across from them who can be held accountable if the plan does not work. An agent can surface the data and draft the talking points. The call where you look someone in the eye and say "here is what we are going to do" is a human seat.

Second: does a mistake here damage something that takes months to repair? Agents make errors. That is not a criticism; humans make errors too. But some errors are cheap and recoverable, and some errors are expensive and slow. If an agent sends the wrong prospecting email to a cold contact, that is recoverable. If an agent sends the wrong message to a strategic client during a retention risk, that is a slower repair. The cost-of-failure test is the most important gate I have. High cost of failure, low tolerance for variance: human seat. Low cost of failure, high volume: agent seat.

Third: is the judgment here contextual or procedural? Procedural judgment follows a rule. If the rule is good and the inputs are clean, an agent applies it reliably. Contextual judgment reads the room. It weighs factors that are not on any scorecard. Contextual judgment is the product of experience and authority that an agent does not carry. When the judgment is contextual, the seat stays human.

## The worked example: Arin and the call center team

When I built Arin, the agent that manages our call center team, I had to make exactly this set of decisions.

Arin analyzes calling performance daily from our CCM-Stats sheet, spotting which agents are below dial targets, which have speed-to-lead problems, which are converting at the wrong rate. Then Arin drafts coaching messages that go out to the team through Slack.

The question I had to answer was: how much of the coaching loop stays human?

Walking it through the three gates:

Relational authority. The call center agents are hourly contractors who need to feel like someone cares whether they succeed. That relational element is real. But here is the thing: Arin's messages go out in my voice. The team knows David Steel is the one looking at their numbers every morning. The agent is producing the message; the authority behind it is mine. I decided relational authority was handled by design, as long as two conditions held: all messages require my approval before sending, and Arin never reveals AI identity.

Cost of failure. A coaching message that is slightly off still costs very little to recover. If Arin incorrectly flags a caller for "zero touches" when actually they dialed but got no pickups, I catch that at approval and correct it. The errors are visible and caught before they cause damage. Agent seat, with a human approval gate.

Contextual vs. procedural judgment. Performance coaching sounds contextual. But most of it is procedural: dial count, show rate, speed to lead, appointment rate. The rules are clear. What is not procedural is knowing when to hold a message. I have a standing rule that Arin does not send negative feedback on Fridays when three or more issues are queued. That call about timing is mine. The content is mostly Arin's. I drew the line between the procedure (agent) and the timing call (human).

The result: Arin handles the daily analytical work and the message drafting. I handle final approval, timing decisions, and any conversation where a caller's employment status or future at Sneeze It is the real subject. Those conversations belong to Bogdan or me. Not because Arin could not produce the words, but because those words need to land from someone who has authority over what happens next.

## Where I have gotten this wrong

Two times the decision went poorly, and both followed the same pattern.

The first time was assigning work to an agent that involved communicating directly with a client contact before I had thought through the approval structure. The agent produced the right message. The message went out at the wrong moment, to the wrong person in the relationship. The cost was real. The fix was adding a human gate. I should have added that gate before the first send.

The second time was the opposite: keeping work on a human seat out of habit, not out of genuine judgment. I had a team member reviewing data every morning and flagging anomalies. That work was almost entirely procedural. The person doing it was spending two hours a day on it. Dash, our analytics agent, now does that work in minutes. I was slow to make the move because the person doing it was reliable and I did not want to disrupt the routine. That cost us time and, honestly, cost the person clarity about what their role actually was.

The lesson from both: the decision about what stays human is a judgment call that has to be made deliberately, not by default in either direction.

## The principle underneath all of it

MIT CISR's research on enterprise AI puts it plainly: human accountability is non-negotiable. Agents act. Humans are accountable for what agents do. That accountability structure does not change the moment the agent is doing the work. It only changes where the work happens.

Deloitte found that only 21% of enterprises have a mature governance model for agentic AI. The other 79% are making agent assignments without governance. That gap is where the expensive mistakes live.

The goal I am working toward is letting agents carry the operational work so that people are free for the work that matters. But that goal only works if "the work that matters" is defined clearly, and the line between agent work and human work is drawn from judgment, not from what happens to be easy to automate first.

At Sneeze It right now, the human seats are Bogdan (COO), Janine (accounting), Kristen (creative), and me. The agent seats are Radar (chief of staff), Dash (analytics), Dirk (sales), Arin (call center), Pulse (client retention), Pepper (email), Tally (scorecard), Nick (cold prospecting), and Crystal (project management). Every one of those assignments went through the three questions. Some of them were revised.

The ones that were revised were revised because I made the decision too fast the first time.

Build the agent second. Make the decision first.

## See the live chart

Every seat on the Sneeze It chart, human and agent, is queryable through the OTP MCP, including the role definition and what each seat owns.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to list the sneeze-it seats and tell me which are human and which are agent seats."*

You will see the full chart returned as structured data. The useful follow-up is to look at any human seat and ask whether it passes all three gates: relational authority, cost of failure, and contextual judgment. If it passes none of them, it is probably an agent seat waiting to be filled.

---

*Series: AI CEO. Post 16 of an in-progress series.*
