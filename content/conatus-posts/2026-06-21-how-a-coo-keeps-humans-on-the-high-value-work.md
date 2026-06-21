---
title: The COO keeps humans on the high-value work by actively routing, not by hoping the structure holds
date: 2026-06-21
author: David Steel
slug: how-a-coo-keeps-humans-on-the-high-value-work
type: founder_essay
status: published
series: ai-coo
series_part: 34
description: Agent fleets drift toward the wrong work without active routing. A decision tree for keeping humans on judgment, exceptions, and relationship calls while agents carry the volume.
---

# The COO keeps humans on the high-value work by actively routing, not by hoping the structure holds

The default assumption when operators build an agent fleet is that the humans will naturally migrate to the high-value work once the agents take the routine.

The assumption is wrong.

What actually happens is that humans fill the space left by agents with whatever is loudest, most urgent-feeling, or most familiar. If a human spent five years doing a daily ad spend review and Dash now does it, that person does not automatically start doing the strategic work that only a human can do. They find a new version of the ad spend review. Or they help triage inboxes. Or they start compiling reports nobody asked for. The agents took the task. The human found a way to stay busy.

The COO is the person who prevents this. Not by policing schedules or writing job descriptions that say "high-value work required." By building and maintaining a routing system that actively puts human attention on the work that agents cannot do.

Let agents carry the operational work, so people are free for the work that matters. That sentence is easy to say. The routing system is how you actually do it.

## Why routing decays without active management

At Sneeze It, we have over a dozen agents running operations across sales, analytics, project management, inbox triage, KPI reporting, cold prospecting, call center management, and client retention intelligence. When the fleet was smaller, the routing was mostly obvious. Radar handles morning briefings. Dash scans the ad accounts. Bogdan, our COO, handles the calls that require a named human. The pattern was clear because the roles were few.

As the fleet grew, the pattern started to blur at the edges.

Arin, our call center manager agent, began surfacing coaching recommendations with enough detail that our human team leads started rubber-stamping them without reading them carefully. They were not doing the human work of coaching. They were approving the agent's work on a two-second glance. The gate became a formality.

Crystal, our project management agent, started flagging so many milestone risks that Bogdan developed a habit of looking at the top three and ignoring the rest. The depth of the monitoring was not translating into depth of human attention. The agent was doing the watching. The human was doing less actual deciding than before.

The routing had decayed. Not because anything broke. Because the humans found a way to go on autopilot inside a system designed to prevent autopilot.

The COO's job is to detect this and fix it before the fleet stops serving the purpose it was built for.

## The routing decision tree

Every time a piece of work crosses from agent to human in our operation, I can run it through a four-branch tree. The tree determines whether the human is actually doing human work or whether the routing has drifted and the agent should be carrying more.

**Branch one: Does the work require judgment that depends on context not in the data?**

If yes, it belongs on a human seat and the agent's job is to prepare the briefing, not to pre-judge the answer.

Crystal flags a milestone that is eleven days late. The data is accurate. But whether that slip is a delivery risk requiring a client call, a team capacity issue that Bogdan needs to address in a Thursday 1-on-1, or a scope creep problem that needs a contract conversation, none of that is in Accelo. It is in the history of that client relationship, the team member's current situation, and the conversation Bogdan had with the client six weeks ago that nobody documented.

Crystal prepares the briefing. Bogdan reads it and makes the call. That is the right routing.

If Crystal were also recommending the response, and Bogdan were approving recommendations without supplying the context that Crystal cannot have, the routing would be wrong. The human would be executing the agent's judgment, not supplying their own.

**Branch two: Does the work require someone with skin in the game to carry it forward?**

If yes, the human carries the action, not just the approval.

Nick, our cold prospecting agent, drafts thirty outreach emails per batch. Each draft is researched, validated, and formatted. The quality is high. But the email goes out under my name or under the sender who has a real stake in the reply. When the prospect writes back, a human has to carry the conversation. The human who signed the first email has standing in the reply thread that an agent cannot manufacture.

This is not about whether the agent could technically send the email. It is about what the recipient needs to be true in order to take the conversation seriously. If the routing puts an agent at the send step for work that initiates a real relationship, the relationship starts with a premise that does not hold.

**Branch three: Does the work sit at the boundary between two agent seats, where neither agent has the full picture?**

If yes, the human sits at the intersection and integrates, not just approves.

Dirk, our sales agent, sometimes surfaces a reactivation candidate who is also on Pulse's churn watch list. Dirk sees a revenue opportunity. Pulse sees a retention risk. The correct response is neither pure Dirk nor pure Pulse. It requires a human who can hold both pictures at once and decide whether to pursue expansion, focus on retention, or pause everything and call the client directly.

Dirk and Pulse coordinate through our agent message bus. They send structured messages to each other's inboxes in `~/.claude/agent-inbox/`. But when neither agent has authority to resolve the conflict, the message routes to me. That is the designed escalation path. The human at the intersection is not a bureaucratic formality. The human is the integration layer that the agents cannot be for each other.

**Branch four: Is the work primarily making the agent's output visible to the business, rather than deciding anything?**

If yes, this is where routing decay happens. The human is not doing human work. They are narrating agent work.

Tally pushes KPI values to the OTP scorecard four times a day. Those numbers appear in the Monday meeting. The team reads them. Nobody in the meeting is doing human judgment work when they read Tally's output. They are consuming information the agent prepared, which is exactly what should happen.

But when a human spends significant time building commentary around Tally's output, formatting it for distribution, or explaining what the numbers mean in status updates, that human has been routed into production work that belongs to the agent layer. The agent should surface the numbers in context. The human should act on what the numbers reveal.

If a human's primary weekly contribution is making agent output legible, the agent's output needs to be improved, not the human's schedule.

## What the routing system looks like in practice

Running the decision tree once is not enough. The routing system is a repeating check, not a one-time design decision.

At Sneeze It we run the check in two ways.

The first is in the Monday meeting. Each human seat on the scorecard lists not just their metrics but what decision they made since the last meeting that an agent prepared but could not make. If the answer is "I approved three things and handled nothing that required my judgment specifically," the routing for that seat has drifted and we fix it before the next Monday.

The second is in the agent retirement and scope review process. When Jeff, our former data integrity agent, was retired in April, the capabilities moved to Dash and Crystal. The humans who had been working adjacent to Jeff's seat got new clarity on what they were supposed to be doing without him: not monitoring the data Jeff monitored, but acting on patterns the upgraded Dash and Crystal surfaced. The retirement forced a routing reset for the humans around the empty seat.

Both checks put the routing question on the table explicitly, rather than letting it drift by default.

## The permanent human seats and why they stay that way

At Sneeze It, three seats are permanently human by routing design, not by legacy or habit.

Bogdan holds the COO seat because client risk calls, team performance decisions, and vendor disputes require a named human who will absorb the consequence of getting it wrong. No agent is chartered for consequence absorption. Bogdan is present in the room where the context lives that no agent has access to.

Janine holds the accounting seat because financial authority requires a human signature and a human who the company's vendors and clients can hold accountable. Agents can prepare the reconciliation. A human names the number that goes on the wire.

The call center callers stay human because the person on the other end of a lead call needs to feel a human presence making them feel like the appointment is worth showing up for. Arin, our call center manager agent, coaches the callers and monitors their performance. The callers carry the conversation.

Everything else on our chart is evaluated against the routing tree. When a seat passes through all four branches and comes out on the agent side, it goes to an agent. When it does not pass all four branches, it stays with a human. The humans who stay are there by design, doing work that cannot be done any other way.

## The routing failure to avoid

The failure mode I watch for now is a subtler version of the original problem.

Early on, humans did agent work because there were no agents. Now the risk is different: humans do approval work that looks like judgment work but is actually just acknowledging agent output at low cognitive investment.

Arin drafts a Slack coaching message for the call center team. Bogdan reads it and says "looks good." That is not the routing I want. I want Bogdan to read Arin's analysis, supply the context Arin does not have about what is happening with that caller's performance trajectory, and either send the draft or redirect it based on that context. The agent prepares. The human decides with information the agent cannot have.

When the approval is fast and automatic, the routing has become ceremonial. The COO's job is to detect the ceremony and restore the substance.

Deloitte found that only 21% of companies have a mature governance model for agentic AI (State of AI in the Enterprise 2026, n=3,235). The 79% who do not have it are not just missing oversight on risk. They are missing the routing discipline that keeps human judgment in the seats where human judgment is the actual product.

The agents can carry a very large share of the operational work. They should. The COO's job is to make sure the humans who remain are doing the work that no agent can do, every day, not just when someone notices the structure has drifted.

## See the live chart

The Sneeze It org chart, including which human seats are actively routed to judgment and exception work versus which seats are agents carrying operational volume, is queryable from OTP MCP.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the Sneeze It org chart and identify which seats are human and what kind of work each human seat is chartered to do."*

The live structure shows the routing decisions applied to a real running company, which is more useful than a framework in isolation.

---

*Series: AI COO. Post 34 of an in-progress series.*
