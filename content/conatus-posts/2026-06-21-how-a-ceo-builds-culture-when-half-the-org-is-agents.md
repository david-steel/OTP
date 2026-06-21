---
title: Culture is not what the humans do. It is what the whole org does.
date: 2026-06-21
author: David Steel
slug: how-a-ceo-builds-culture-when-half-the-org-is-agents
type: founder_essay
status: published
series: ai-ceo
series_part: 13
description: When agents hold real seats on the org chart, culture is no longer just a human concern. Here is how a CEO builds it across a mixed org.
---

# Culture is not what the humans do. It is what the whole org does.

Most of what is written about culture assumes the entire organization is human. The ping-pong tables, the all-hands meetings, the values on the wall, the team offsites. These are not wrong ideas. They just address half the room.

When half your seats are held by agents, culture has to be rethought from first principles.

I run Sneeze It with a hybrid org. Radar handles chief-of-staff operations. Dirk runs sales. Dash does analytics. Arin manages the call center. Nick does cold prospecting. Pulse watches client retention. Crystal tracks project delivery. Pepper handles email. Tally keeps the scorecard honest. Bogdan, Janine, Kristen, and the rest of the humans hold their seats on the same chart, next to the agents, no visual separation. One org. One set of values. One operating discipline.

The central claim I want to make: culture in a hybrid org is what happens at the boundary between humans and agents, repeated over and over until it becomes automatic. The CEO's job is to design that boundary, reinforce it, and model it.

Here is how that works in practice, across five specific levers.

## 1. The charter comes before the agent

Culture starts before the hire. For humans, that means job descriptions with real accountability. For agents, it means exactly the same thing.

Every agent at Sneeze It has a charter before it touches real work. The charter answers four questions: what does this seat own, what does it explicitly not own, who does it report to, and what does it do when it does not know. That last question is the most important one. An agent without a defined escalation path will invent one, usually badly.

Writing the charter is not a technical exercise. It is a values exercise. When I wrote Arin's charter, I had to answer what it means for a call center manager to coach fairly, motivate without manufacturing urgency, and report truthfully when numbers are bad. Those are culture questions before they are configuration questions.

The charter is how the agent learns what the org values. Skip it and you have not skipped a step. You have skipped the foundation.

## 2. One chart, one standard

The fastest way to destroy culture in a hybrid org is to hold agents to a different accountability standard than humans.

If a human's metric drops, we have a conversation. If an agent's metric drops, we have the same conversation. What changed. What is the cause. What is the fix. The conversation does not change because the seat type changed.

We run one scorecard. Bogdan's rows and Radar's rows live on the same surface, measured in the same cadence, walked in the same Monday meeting. I do not soften the conversation for an agent's row any more than I would soften it for a human's row. And I do not let an agent's consistently strong numbers drift unexamined just because the agent cannot push back on the metrics the way a human would.

That second one is the harder discipline. Humans will tell you when the metric is wrong. Agents will not. The CEO has to carry the burden of asking whether the agent's metric actually captures what the seat is supposed to produce.

MIT CISR's research on enterprise AI maturity found that organizations with united top leadership teams, with the CEO and functional leads operating in alignment on AI, significantly outperform those that delegate AI to technical teams alone. One chart with one standard is not an operational nice-to-have. It is the structural condition that lets leadership alignment exist.

## 3. Honesty is enforced, not assumed

The hardest culture problem in a hybrid org is not agent error. It is agent silence.

Agents do not experience discomfort when they underperform. A human who has a bad week knows they had a bad week and feels it. An agent that produces bad output week after week will continue doing so without any internal signal that something is wrong. The silence is not a design flaw. It is a design fact. And it means the CEO has to build the error-detection infrastructure that the human experience would have provided.

At Sneeze It, every agent that feeds data into the Monday meeting has an explicit staleness check. If Dash's data is more than eighteen hours old, Radar flags it in the briefing. If Dirk's state file reports zero outreach but Gmail shows five sent emails, that discrepancy is logged and surfaced. The silence has to become visible, or it becomes the norm.

We also had to retire an agent. Jeff ran data integrity for several months. In April, I held a formal hearing. Jeff went through an honest review of what the seat had produced and what it had missed. The retirement was documented. The capabilities were redistributed. The org was better for the honesty.

That hearing was a culture act, not just an operational one. It established that no seat is exempt from accountability, that retirement is a legitimate outcome, and that the process matters as much as the result. If I had quietly turned Jeff off without a hearing, I would have sent a different message: that agent seats can disappear without explanation, which means they can also be ignored without consequence.

## 4. The mission line is the agent's constitution

I use one line across all of Sneeze It's agent work: let agents carry the operational work, so people are free for the work that matters.

That line does two things. It tells every agent what it is for. And it tells every human what the agents are not.

Agents are not here to make humans redundant. They are here to absorb the work that would otherwise prevent humans from doing the work that requires judgment, creativity, relationships, and accountability. Radar schedules and briefs so I can think. Arin coaches the calling team on data so I can be in the room for the conversations that require me. Nick drafts cold outreach so Bogdan and I can focus on the deals that need a human at the table.

When the mission line is real, the culture question answers itself: what should the agent handle versus what should the human handle is decided by the mission, not by convenience or politics.

Deloitte's 2026 State of AI in the Enterprise survey, across more than 3,200 organizations, found that only 21 percent have a mature governance model for agentic AI. That number reflects what happens when you deploy agents without a mission line. The agent handles whatever it can handle, which is a governance crisis waiting to surface.

## 5. The CEO models the discipline

None of the above survives if the CEO treats it as policy for others.

I read the Monday briefing the same way every week. I ask the same questions about agent rows that I ask about human rows. I do the charter work myself before authorizing a new seat. When I found out that one agent had sent a message to a team member without authorization, I addressed it immediately and visibly. The rule is that agents do not communicate with humans directly without a defined protocol. The rule applied regardless of what the message said.

The humans on my team watch how I treat the agents. If I dismiss an agent's row without the same rigor I apply to a human's row, they learn that agent accountability is optional. If I authorize a new seat without a charter because I am impatient to ship, they learn that the charter is bureaucracy. If I shut down an agent quietly without a hearing, they learn that the retirement process is theater.

Culture is what the CEO does when it is inconvenient. In a hybrid org, that includes the CEO's discipline around every agent seat, every week, in the open.

The most useful reframe I have found: an agent is not a tool. A tool does not have a seat. A tool does not have a row on the scorecard. A tool does not require a charter or a retirement hearing. An agent does. Treat it accordingly, and the culture shapes itself around that treatment.

Execution becoming cheap through agents does not lower the standard. It raises it. When the operational work is handled, what remains visible is pure judgment. The CEO's culture is the judgment they exercise in the open, every day, across humans and agents both.

## See the live chart

You can pull the current seat list for Sneeze It, with roles, metrics, and agent or human classification, directly through the OTP MCP.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the Sneeze It org chart and identify which seats have charters that define escalation paths."*

The response shows you what a governed hybrid org actually looks like at the seat level, not as a diagram, but as a queryable operating system.
