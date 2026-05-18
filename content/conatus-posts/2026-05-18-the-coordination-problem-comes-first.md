---
title: AI will make half your operating decisions by 2030. The coordination problem comes first.
date: 2026-05-18
author: David Steel
slug: the-coordination-problem-comes-first
type: founder_essay
status: published
series: organizing-agents
description: IBM surveyed 2,000 CEOs. By 2030, 48% of operational decisions run without human intervention. The bottleneck is not intelligence. It is coordination.
---

# AI will make half your operating decisions by 2030. The coordination problem comes first.

IBM and Oxford Economics ran a survey this spring that every operator should read. They asked 2,000 CEOs across 33 geographies and 21 industries, from February to April 2026, how AI was changing the way they run their companies. The study came out on May 4, and it is titled "CEOs are reshaping C-suite roles for the AI era."

Three numbers from it matter for this post.

By 2030, 48% of operational decisions, in areas with consistency and guardrails, will be made by AI without human intervention. Today that number is 25%. Roughly half of the bounded, repeatable calls a company makes are about to happen without a person in the loop.

Second number. 79% of executives confirm that decision-making is decentralizing as AI expands across the enterprise. Decisions are moving out from the center and down into the work.

Third number. 64% of CEOs say they are comfortable making major strategic decisions based on AI-generated input. The top of the house is already acting on what these systems produce.

IBM frames the 48% carefully, and I want to frame it the same way. They are describing process automation in bounded areas, not autonomous agents holding seats on a chart. That is their measurement and I am not going to stretch it. But put the three numbers next to each other and a picture forms that the study does not have to spell out. Decisions are decentralizing. A growing share of operational decisions runs without a human. And executives trust the output enough to build strategy on it.

Here is the claim this whole post defends. An organization where decisions are both decentralized and partly autonomous cannot run on a weekly meeting and tribal knowledge. The bottleneck for the AI era is not intelligence. It is coordination. Coordination is the open seat.

## The math of a decentralized, partly autonomous org

Walk the cause with me, because the conclusion is not obvious until you do.

Start with one decision, made once a week, by one person, discussed in one meeting. Everyone in the room hears it. The shared picture stays current because the picture only moves on Mondays.

Now decentralize. 79% of these CEOs are pushing decisions down and out. The decision that used to happen in the Monday room now happens on Tuesday afternoon, three layers down, by someone who had the context and the authority to make it. Good. That is faster. But the room no longer hears it. The shared picture went stale the moment the decision left the room.

Now add autonomy. A growing share of those decisions happens without a human in the loop at all. A budget gets reallocated. A lead gets routed. An issue gets resolved. No person decided it, so no person can narrate it later. The decision happened, it was correct, and it is invisible.

Multiply that across a company. Decisions firing all week, many with no human narrator. By Friday, nobody holds the whole picture. Who decided what. What issue got solved. What to-do got created. What changed. The answers exist, scattered across people and systems and agents, and the weekly meeting was never built to absorb that volume. The meeting was built for a world where the picture only moved once a week.

This is the coordination load. It is not a people problem and it is not an intelligence problem. It is a structural gap between how fast decisions now move and how slowly the shared picture updates. Every company that follows IBM's curve inherits this gap. The smarter the seats get, the wider it opens.

## Intelligence per seat is the solved part

Here is the uncomfortable thing. The hard problem everyone is racing on is mostly the wrong problem.

Intelligence per seat is solved or solving. The models are good and getting better every quarter. You can stand up a capable agent for almost any bounded function this month. The chart I run inside Sneeze It has roughly 19 seats. About 12 are filled by agents. About 7 are filled by humans.

Radar is our chief of staff. Radar coordinates daily operations and compiles the briefing every morning. Neil is our chief learning officer. Neil scans the frontier for what we should be learning before a competitor learns it. Dirk runs sales and revenue. Dash is our ad-performance analyst and reads every account every morning. Pulse watches client retention. Each of those seats is intelligent enough to do its job. That part works.

What does not solve itself is the protocol that holds the seats together. When Dirk decides something on Tuesday and Dash sees a pattern on Wednesday and Radar compiles on Thursday, who has the whole picture? If the answer is "the Monday meeting," you have rebuilt the exact bottleneck IBM's data is about to make unbearable. You have 12 agents and 7 humans deciding things all week, and a shared picture that only refreshes once a week. The gap is structural and it does not care how smart your agents are.

That gap is the open seat. Coordination is the function nobody is hiring for, and it is the one the IBM numbers make non-optional.

## What the coordination layer actually is

So we built for it. Not a smarter agent. A protocol that every seat checks into.

The chart at Sneeze It, all 19 seats, human and agent, shares one accountability structure. One scoreboard. One issues list. One to-do list. One weekly meeting with a recap that cascades to every attendee, and the agents are attendees. That is the part most companies skip. When the meeting recap goes out, it goes to Radar and Dirk and Dash the same way it goes to Bogdan, our COO, and Nate, who runs web and tech. The agents do not get a different artifact. They get the same recap, because they hold the same kind of seat.

Three jobs hold that layer together.

Radar coordinates the daily picture. Every morning Radar pulls from every seat and compiles one briefing, so the shared picture refreshes daily instead of weekly. The Monday meeting stops being the only moment the picture exists.

Bassim scores whether the system is actually holding together. Every night Bassim grades the agentic maturity of the whole chart and names the weakest link. Bassim is not measuring whether the agents are smart. Bassim is measuring whether they are coordinated, which is the thing that breaks first and quietest.

Tally keeps the scoreboard honest. Tally pushes the real KPI numbers to the shared scoreboard so that no seat is reporting its own grade from memory. One scoreboard, one source, current.

That is the coordination layer. Radar refreshes the picture, Bassim checks the seams, Tally keeps the numbers true. None of those three jobs is about being smarter. All three are about the seats staying connected while they decide things all week without a human narrating every call.

## The protocol is the unsolved part

IBM measured a future where half the operating decisions run themselves and four out of five companies are pushing decisions out of the center. They measured the demand. They did not have to design the supply, because that is not what a survey does.

The supply is a coordination protocol that every seat, carbon or silicon, checks into. That is the part still open. That is what OTP is. The protocol that holds the seats together while they decide faster than any meeting can track is the work, and it is the work we have spent this year doing in the open.

## Install the chart and ask it a coordination question

The Sneeze It coordination layer is queryable. Every seat, the shared issues list, and the shared to-do list are exposed through the OTP MCP server, so any AI client can ask the chart what is actually coordinated across the team right now.

In Claude Desktop or Cursor or any MCP client, add this block to your config:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the open issues and to-dos coordinated across the sneeze-it team."*

You will get a structured response showing the live issues and to-dos held in one shared place across all 19 seats, which is the coordination layer doing its job in front of you.

*Series: Organizing Agents. One of three posts on what IBM's 2026 CEO study means for how companies organize.*
