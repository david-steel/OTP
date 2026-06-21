---
title: The COO has five active jobs inside the agent operating system. None of them are optional.
date: 2026-06-21
author: David Steel
slug: the-coos-role-in-the-agent-operating-system
type: founder_essay
status: published
series: ai-coo
series_part: 36
description: Once the agent operating model is running, the COO still has five non-optional jobs. Process design, chart ownership, handoffs, quality, and protecting human time.
---

# The COO has five active jobs inside the agent operating system. None of them are optional.

There is a version of the agent era where the COO builds the operating model, hands it to the agents, and steps back.

That version does not work.

The agents carry the operational work. The COO carries the operating system. Those are different things, and confusing them is how agent fleets drift from reliable to expensive and confusing.

I have run a hybrid fleet at Sneeze It for over a year. At any given time, eight to ten agent seats are executing operational work in parallel: briefings, ad performance monitoring, scorecard pushes, inbox triage, pipeline hygiene, cold prospecting, call center coaching, project status tracking. The fleet runs without being asked. It does not have hard weeks. It does not forget.

What it does not do is manage itself. The agents carry the work. The COO carries five specific jobs that keep the system trustworthy. Here is what those jobs are and why each one matters.

## 1. Fix the process before the agent touches it

The most common way I see agent operating models go wrong is also the most preventable. Someone wires an agent to an existing process without redesigning the process first. The agent runs. The process runs. The inefficiency runs faster.

Accenture's framing on agentic AI is blunt: reinvent the process first, then infuse the agents. Their version of the warning is "don't make inefficiency run efficiently." I have seen this failure mode up close. An agent executing a broken process executes it with confidence, at volume, around the clock. The agent will not notice it is broken. The agent will not push back.

Before Radar came online as our chief-of-staff agent, I had to answer questions the old human version of the morning briefing never forced me to answer. What is the briefing actually for? What threshold makes something worth flagging versus worth reporting? Who does a flag go to and what are they supposed to do with it? What is the right order for the sections, and why?

Those questions took two weeks to answer honestly. They were worth every hour.

The COO's first job in the agent operating system is to be the process designer who refuses to let agents touch work that has not been cleaned up first. That job never ends. Every time a new seat is considered, the process question comes first. Not "can an agent do this?" but "is this process worth doing at all, and if yes, is it defined well enough for an agent to do it reliably?"

## 2. Build and maintain the hybrid chart

Once the process is defined, the work needs a seat. In a hybrid org, that means a chart that holds humans and agents together with the same organizing logic.

The principle I use is one seat, one owner. Every seat on the chart has a clear role, a clear metric, and a clear escalation path when the metric moves wrong. The chart is not organized by whether the seat is held by a human or an agent. It is organized by what the seat is accountable for.

Radar holds the chief-of-staff seat. Tally holds the scorecard seat and pushes KPI values to the org chart four times a day. Dash holds the analytics seat and monitors ad performance across forty-plus accounts against yesterday, last week, and the 30-day median. Crystal holds the project tracking seat in Accelo. Pepper holds the inbox triage seat. Arin holds the call center coaching seat. Dirk holds the sales pipeline seat and flags stale deals. Nick holds the cold prospecting seat and produces thirty qualified draft emails per day.

Bogdan holds the COO seat. Janine holds the accounting seat. Kristen holds the creative director seat.

If you look at the chart without reading the names, you cannot tell which seats are human and which are agents. That is by design. The accountability structure is identical. Deloitte's 2026 State of AI in the Enterprise survey of 3,235 organizations found that only 21% have a mature governance model for agentic AI. The failure mode they documented consistently is delegating agent governance to technical teams, which optimizes for uptime rather than output accountability. The hybrid chart prevents this by putting agents on the same accountability system the business already uses for humans.

The COO's second job is to build that chart and keep it current. New seat added, the chart gets updated. Old seat no longer producing, the chart reflects the retirement. The chart is not a one-time artifact. It is a live document of who is accountable for what.

## 3. Own the handoffs

Seats do not operate in isolation. The output from one seat becomes the input for the next. If the handoff between them is undefined, the chain breaks silently at the boundary. The agent reports success. The business outcome does not move. Nobody can see where it stopped.

At Sneeze It, agent-to-agent coordination runs through structured inbox files. Each agent has a file at a defined path. When Dirk needs Pepper to send an approved outreach email, Dirk writes a structured message to Pepper's inbox. The message has a type (REQUEST, INFORM, PROPOSAL, RESPONSE), a sender, a recipient, and a payload. Pepper reads the inbox, processes the request, and responds in the same protocol. When Dash detects a spend anomaly that Radar needs to include in the morning briefing, the same protocol handles it. When one agent needs to wait on another, the protocol defines the wait.

The handoffs between human and agent seats have a different structure, but the same discipline. All outbound Slack messages from agent seats require David's approval before sending. Dirk drafts reactivation outreach; Pepper sends it after approval. Nick drafts cold prospecting emails to Gmail drafts; they go out manually. The agents do not have unilateral outbound authority. That is an operational policy, and it is the COO's job to define it and enforce it.

McKinsey's framing is that managing in the age of AI means managing systems, people and agents together. The handoff definitions are what makes "together" mean something. The COO's third job is to own every handoff in the system: agent-to-agent, agent-to-human, human-to-agent, human-to-human at boundaries where an agent is upstream or downstream.

## 4. Run the quality loop

The fourth job is the one most operating models defer until they regret it.

Agents do not self-correct from environmental feedback the way experienced humans do. A human who starts producing bad output usually shows early signals. The meetings get harder. The numbers slow. People work around them. An agent that drifts produces bad output at the same speed and with the same confidence as good output. The scorecard metrics look fine. The actual output is wrong.

The quality loop at Sneeze It has two layers. The first is the Monday scorecard. Every seat's primary metric runs through Tally to the weekly review. When a number moves wrong, the conversation is the same regardless of whether the seat is human or agent: what is the gap, what caused it, what is the fix, who owns the fix. The conversation happens in the same cadence as every other number conversation. Agent seats do not get a separate technical review. They get the same operational accountability review.

The second layer is the correction protocol. When David identifies a mistake in an agent's output, the correction becomes a captured learning in OTP that is available to the whole fleet. Every correction is coordination intelligence. Corrections that never get captured are wasted lessons. The system gets better through the loop, not through wishful thinking about models improving on their own.

MIT CISR's enterprise AI maturity research shows that Stage 4 firms, where agents are embedded in workflows delivering measurable results, are led by united leadership teams that actively shape AI governance rather than delegating it. The quality loop is governance made operational. The COO's fourth job is to run it consistently, not just when something breaks.

## 5. Protect human time for judgment work

The fifth job is the one that completes the logic of the whole system.

The reason to let agents carry the operational work is to free the people on the team for the work that actually requires them. That is not a passive outcome. It requires the COO to actively identify what that work is, protect the time for it, and prevent the easy trap of filling the freed hours with more coordination overhead.

At Sneeze It, the work that requires Bogdan is the work agents cannot do. Making a resource call when two clients have conflicting deadlines and both are at risk. Sitting in the conversation when a client's cost per lead has climbed for three weeks and nobody is sure why. Deciding whether a proposal that has been open six days gets a follow-up or not. Reading the relationship, not just the data.

Those are judgment calls. They require context that is relational, historical, and organizational. They require someone who has been in the room with the client, who knows what the contract terms actually mean, who can read whether a delayed response is a busy week or a cooling relationship.

The agents surface everything needed to make those calls. The agents do not make the calls. The COO's fifth job is to keep that boundary clear. Not just in the system design, but in the calendar. If Bogdan's week fills back up with coordination work after the agents come online, the system is failing. The agents should be carrying the coordination so Bogdan can show up for the judgment.

Jeff, a data integrity agent, was retired in April after a formal hearing. The hearing produced an honest record and a clean redistribution of capabilities to other seats. The retirement decision required human judgment about role fit, trust, and organizational need. No agent could have made it. The COO made it, with evidence, in the open.

That is the last thing the fifth job protects: the decisions that are too consequential, too relational, or too novel for the system to handle autonomously. Those decisions belong to humans. The COO's job is to make sure agents are not making them and that humans have the time and the information to make them well.

## The five jobs together

The COO in the agent operating system is not executing less. The COO is executing differently.

Process design runs before every new agent seat. The hybrid chart stays current as the fleet changes. Handoff protocols are defined, documented, and audited. The quality loop runs weekly and every correction becomes a learning. Human time is actively protected for the work that requires human judgment.

Pull any one of those five and the system starts to degrade in a specific way. No process discipline: agents run inefficiency at scale. No chart: agent output has no owner. No handoff protocols: the chain breaks silently at boundaries. No quality loop: drift accumulates until the damage is visible. No protection of human time: the freed hours fill with new coordination overhead and the compound benefit of the fleet never materializes.

The agents carry the operational work so people are free for the work that matters. That sentence describes the outcome. The five jobs are what make the outcome real.

## See the live chart

The Sneeze It hybrid org chart, with all agent and human seats and their accountability metrics, is queryable from OTP MCP.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the Sneeze It org chart and tell me which seats are agents, which are humans, and what each seat is accountable for."*

The chart shows the five jobs made concrete: the seats, the metrics, the handoff structure, and the line between agent execution and human judgment.

---

*Series: AI COO. Post 36 of an in-progress series.*
