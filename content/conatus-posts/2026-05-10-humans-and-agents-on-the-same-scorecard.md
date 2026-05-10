---
title: Humans and agents on the same scorecard does not feel like a strategic decision until you try the alternative
date: 2026-05-10
author: David Steel
slug: humans-and-agents-on-the-same-scorecard
type: founder_essay
status: published
series: organizing-agents
series_part: 2
description: How AI agents and humans share accountability inside a working hybrid org. The split-dashboard failure mode, the unified-scorecard fix, and what the Monday meeting actually looks like at Sneeze It.
---

# Humans and agents on the same scorecard does not feel like a strategic decision until you try the alternative

The first instinct most operators have when they start running a few AI agents is to build a separate dashboard for them.

There is the company dashboard, with the human KPIs on it. Sales pipeline. Cash collected. Headcount. Customer retention. Then there is the AI dashboard, with the agent KPIs on it. Tokens consumed. Tasks completed. Latency. Maybe a "messages handled per day" number for whatever the support bot is doing.

This split feels right. The agents are new. The agents are technical. The agents need their own surface to be measured on, the way new tools usually do.

It is also the single most expensive mistake I have watched operators make with agents.

The split dashboard is what makes the agents drift.

The unified dashboard is what makes them work.

I did not arrive at this by reasoning my way to it. I arrived at it the same way every operator does, which is by living through the failure mode. Our first agent had its own little scorecard. The agent was great. The metrics looked great. The business outcomes did not change. Six weeks in I realized the agent was producing numbers that were not connected to anything I actually cared about.

The fix was not to redesign the agent. The fix was to delete its dashboard and put its row on the same dashboard the humans were on.

This post is what I learned from that fix and the dozen agents that came after.

## Why the split dashboard fails

The split dashboard fails for the same reason a separate org chart for contractors fails. The work that matters happens at the boundary between the two charts, and the boundary has no owner.

A human seat on a scorecard reports things like "qualified meetings booked" or "pipeline created" or "client retention 90-day." The numbers are tied to outcomes the company sells. When a human's number drops, the company's number drops, and the conversation about why happens at the same Monday meeting where every other number lives.

When an agent's scorecard is on a different surface, the conversation about why never happens. Or it happens late, in a different room, with a different language. The agent's "tasks completed per hour" is fine. The company's "qualified meetings" is dropping. Nobody on the dashboard team is asking whether the agent is upstream of the meetings number, because the agent is not on that dashboard. By the time someone connects the dots, two months have gone by and the agent has been confidently producing a number that did not serve the business.

The split dashboard hides drift. The unified dashboard reveals it.

## What the unified dashboard actually looks like

Our Monday meeting at Sneeze It runs the same scorecard for humans and agents. There is one dashboard. Each row has a name, a metric, a target, a current number, and a trend arrow.

Bogdan, our COO, has rows on it. So does Janine. So does Kristen.

Radar, our chief-of-staff agent, has rows on it. So does Dirk, our sales agent. So does Pulse, our retention agent. So does Dash, our analytics agent.

The rows are not segregated. They are not labeled "human" or "agent." If you look at the dashboard cold, you cannot tell which rows are human and which are agent without reading the names. By design.

The metrics on each row are the metrics that seat is accountable for. Dirk's row tracks cold emails sent per week, qualified meetings booked per week, and pipeline stage transitions per week. Janine's row tracks days payable outstanding, days receivable outstanding, and cash collected per week. The metrics differ because the seats differ. The discipline is the same.

Every Monday we walk the dashboard from top to bottom. When a row is below target, the conversation is the same regardless of seat type. What is the gap. What was the cause. What is the fix. The fix lands on the seat that owns the row. The seat is responsible for executing it by next week.

The agents are in the room for these conversations. Or rather, the agents publish the data that drives the conversations. Then their seat-owner (the person who manages the agent's accountability) speaks to the row the way a manager speaks to a direct report's row. The conversation discipline does not change. The conversation cadence does not change.

What changes is that we now have nineteen rows instead of seven, and twelve of those rows are filled by entities that work twenty-four hours a day, never get sick, and do not need to be re-onboarded after a long weekend.

## The four conversations that change the moment you unify

When the split dashboard goes away and the unified one takes over, four kinds of conversations start happening that were not happening before. They are the conversations that compound into a real hybrid org.

**The "your row dropped" conversation.** When an agent's row drops, you have the same conversation you would have with a human direct report whose number dropped. Not "the model got dumb." Not "we need to upgrade to the next version." The conversation is "what changed in the inputs," "what changed in the SOP," "what does the seat need to recover the number." The agent's seat-owner walks through it the way a manager walks through a direct report's number. The fix is structural, not technical.

**The "your row is the bottleneck" conversation.** When a human's row drops because an agent upstream is feeding bad inputs, the human and the agent's seat-owner have the conversation that resolves it. They have it because both rows are on the same dashboard and the dependency is visible. On a split dashboard, this conversation never happens because the human cannot see the upstream cause without leaving the room.

**The "we should add a row" conversation.** When a gap shows up on the dashboard that nobody is accountable for, the team identifies it and decides whether the next seat to fill that gap should be a human or an agent. This conversation is the source of every healthy agent hire we have made. It happens because the dashboard makes the gap visible. On a split dashboard, gaps live between the two surfaces and nobody sees them.

**The "we should retire a row" conversation.** When a seat stops being needed (because the work has moved or the pattern has changed), we retire the seat. This conversation is identical for agents and humans except that agents make it easier because they do not require severance. We had this conversation about Jeff, our former data integrity agent, in April. The conversation resulted in a retirement, capabilities redistributed to other seats, and an honest record kept. The dashboard is what made the conversation possible.

These four conversations are the operating discipline of a hybrid org. They cannot happen without a unified dashboard.

## How to make the switch if you already have a split

Most operators reading this already have a split dashboard. Here is the order I would recommend for collapsing it.

Start by writing each agent's metrics in business-outcome language. If your agent's current metric is "tasks completed per day" or "tokens consumed per hour," that is a runtime metric, not a business metric. Replace it with the closest business metric the seat is actually accountable for. If you cannot write that metric, the seat does not yet have a clear role and you need to fix that before unifying anything.

Next, find the human row on your existing scorecard that is most affected by the agent's work. If the agent is a setter, the human row most affected is the salesperson who closes what the setter books. Put the agent's row directly above the salesperson's row on the same dashboard. The visual proximity is half the unification.

Then, in your next Monday meeting, walk the dashboard top to bottom and treat the agent's row exactly the way you treat the human rows around it. Do not announce the change. Just do it. People will adjust within one meeting.

After two weeks of running the unified dashboard, the split dashboard will start to feel obsolete. Delete it. Do not migrate it. Do not archive it. Delete it. Anything that lives on a separate dashboard will pull attention away from the dashboard that matters.

## What it costs and what it gains

The cost of unifying is small. It is mostly a one-time exercise in rewriting agent metrics in business-outcome language and then physically moving rows to a single surface.

The gain is large enough that I struggle to articulate it without sounding like marketing. The team starts treating agents like teammates instead of like infrastructure. The agents inherit the operating discipline humans already operate under. The conversations that compound a real hybrid org start happening. The agents stop drifting because every Monday someone is looking at their numbers in the same conversation everyone else's numbers are looked at.

This is not a strategic decision the way a partnership or a fundraise is a strategic decision. It is a kitchen-table decision. You collapse two dashboards into one, and a few weeks later you realize the company runs differently because of it.

## See the live unified dashboard

The live agent rows on our Monday dashboard are queryable. You can ask any AI assistant with the OTP MCP installed to pull the current state of any seat on our chart, and you will get back a structured response with the role, the metrics, and where they sit on the chart relative to humans.

In Claude Desktop or Cursor or any MCP client, add this block to your config:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the org chart for sneeze-it. Identify which seats are agents and which are humans."*

Look at how the response answers that. Then ask the same question of your own current chart. The contrast is the strategy.

## What comes next

This is post 2 of an in-progress series on organizing agents. Post 1 covered the five things every seat on a hybrid chart needs. The next post in the series goes deeper on agent measurement: what an actual agent KPI looks like, why the agent has to publish its own numbers, and what happens when you make the agent measure itself.

If you have a question about hybrid accountability that this post did not answer, write to me at dsteel@orgtp.com. Real questions become real posts.

---

*Series: Organizing Agents. Post 2 of an in-progress series. Previous: [Adding an AI agent to your org chart is not configuration. It is hiring.](/blog/adding-an-agent-to-your-org-chart)*
