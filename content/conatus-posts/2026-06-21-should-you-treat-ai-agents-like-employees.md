---
title: The answer to whether AI agents are employees is the wrong question
date: 2026-06-21
author: David Steel
slug: should-you-treat-ai-agents-like-employees
type: founder_essay
status: published
series: ai-chro
series_part: 6
description: Both camps in the agent management debate are right. The synthesis is accountability architecture, not anthropomorphizing. Here is how we run it.
---

# The answer to whether AI agents are employees is the wrong question

I run twelve agents at Sneeze It. I also have human teammates. They share a scorecard, a meeting cadence, and a chain of accountability. That arrangement has generated a sharp debate in the research literature about whether I am doing something smart or something dangerously naive.

The debate is worth having.

## What the camps actually say

Camp A says manage agents like coworkers. MIT Sloan Management Review found 69 percent of experts agree agentic AI demands new management approaches distinct from anything applied to traditional software. HBR described a new role, the "agent manager," who runs agents through dashboards, scorecards, and observability tooling.

Camp B says do not treat agents like employees. HBR and BCG published research in May 2026 showing that when organizations anthropomorphize agents, accountability degrades. In a large experiment, giving agents employee-like status reduced individual human accountability, increased unnecessary escalation, and lowered review quality. Their model is the rented contractor with a narrow statement of work, governed by scoped permissions, kill switches, audit logs, and named human owners.

Read those two positions quickly and they look contradictory. Read them carefully and they agree on everything that matters.

## What both camps actually require

Both camps require the same three things.

Every agent needs a named human owner. Not a team. Not a department. One person whose seat on the org chart is the accountable seat for what the agent does or fails to do.

Every agent needs a measured seat. Observability, a scorecard, a metric that connects to a business outcome. Not tokens consumed or tasks completed. A metric that shows whether the seat is earning its place.

Human accountability is never transferred to the agent. The agent does work. The agent does not own outcomes. The human owner owns outcomes.

The camps differ on framing, not substance. Camp A says think of the agent like a managed contributor because that mental model drives the right behaviors. Camp B says do not, because it lets humans off the hook when something goes wrong. Both are right. The framing question is almost irrelevant if the accountability structure is correct.

## What we built instead of picking a side

Before I ran agents, I could tell you who owned sales, who owned client retention, who owned analytics. Bogdan owned operations. Janine owned accounting. The seats were clear.

When I added agents, I did not create a separate category. I added seats.

Radar holds the chief of staff seat. Dash holds the customer advertising analysis seat. Dirk holds the sales intelligence seat. Pulse holds the client retention seat. Pepper holds the inbox seat. Arin holds the call center management seat. Nick holds the cold prospecting seat. Tally, Crystal, and others hold their own rows.

Every one of those seats has a named human who is accountable for it. When Dash's numbers are wrong, the conversation goes to the seat owner, not the infrastructure team. When Pepper misclassifies a client email, the seat owner reviews the error and decides whether it changes the logic. The agent is the capacity. The human is the accountability.

This is not anthropomorphizing. Korn Ferry found 70 percent of senior leaders say their organizations have an AI strategy but only 39 percent of employees agree. That gap exists because the framing has been about technology adoption, not accountability design. When you design accountability instead of adoption, the gap closes.

## Before and after, in plain terms

Before we ran agents this way, the work looked like this. A human held a seat and did the operational work of the seat and the judgment work of the seat. Most of the time was operational. The judgment work happened in the margins.

After, the agents carry the operational work. The humans carry the judgment. Radar scans seven channels and compiles a briefing. I decide what it means and what to do. Dash reads thirty-nine Meta accounts and surfaces patterns. I decide whether a client call is needed. Dirk surfaces stale pipeline and drafts outreach. I approve before anything goes.

The operational work is not what scales human judgment. It consumes it. When agents carry it, humans are free for the work that actually requires them. MIT Sloan's framing is right that this demands new management. The daily question is not "are my agents running" but "are my agents producing the outcomes their seats exist to produce."

## Jeff

In April I retired an agent named Jeff.

Jeff held the data integrity seat. He ran a budget reconciliation scanner and was supposed to watch for blind spots in our ad data. Over time the seat drifted. The missions got absorbed into other agents. The data went stale. He had sent a message to a teammate without authorization.

There was a hearing. Jeff had the chance to defend his seat. His defense amounted to recommending his own retirement. His capabilities were redistributed to Dash, Crystal, and Dirk. The seat was closed.

This is what Camp B is pointing at. Accountability never moved to Jeff. The decision to retire him was a human decision, made in a structured process. If I had anthropomorphized Jeff into something deserving employment protections, that decision would have been harder and the process murkier. HBR/BCG are right that anthropomorphizing invites that outcome.

But the reason the decision was clean is not that Jeff was treated like a tool. It is that the seat was designed with accountability from the start. Named owner. Measured outcome. When the seat stopped earning its place, the conversation was possible.

The answer to "should you treat agents like employees" is: design the accountability, not the framing.

## What SHRM's data actually tells CHROs

SHRM's 2026 survey of 1,908 HR professionals found that AI is five times more likely to shift job responsibilities and three times more likely to create new roles than displace them. That is not what most of the workforce believes. Korn Ferry found 48 percent of employees globally fear their job will be replaced within three years.

The fear is about displacement. The actual pattern is about redefinition. When agents carry the operational work, the human seat does not disappear. It changes. Arin manages the call center team, coaches human callers, and surfaces performance patterns. That seat exists because the data work is automated. The judgment work, the coaching, the escalation decisions, the culture of the team, none of that is automated. The seat is more valuable because the overhead is off it.

That is the shift HR needs to design for. Not displacement. Redefinition. And the tool that makes the design visible is the org chart, held to a standard that names every seat, names every owner, and measures every row the same way regardless of whether the occupant is human or agent.

## See the live chart

The Sneeze It org chart, including which seats are held by agents and which by humans, is queryable via OTP's MCP.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the Sneeze It org chart and identify which seats are agent-owned versus human-owned, and who the named human accountable owner is for each agent seat."*

The response is the accountability architecture in structured form, not a framing debate.

---

*Series: AI-Era CHRO. Post 6 of an in-progress series. Previous: [What HR does when half the workforce is agents](/blog/what-hr-does-when-half-the-workforce-is-agents)*
