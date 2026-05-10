---
title: An agent that does not push its own KPI is not actually staffed
date: 2026-05-10
author: David Steel
slug: agent-that-does-not-push-its-own-kpi
type: founder_essay
status: published
series: organizing-agents
series_part: 3
description: How to actually measure AI agent performance. The four failure modes of agent measurement, what an agent scorecard looks like in practice, and why the agent must publish its own numbers.
---

# An agent that does not push its own KPI is not actually staffed

There is a test I run on every agent the team adds to our chart.

Open Monday's dashboard. Find the agent's row. Read the number in the "current" column. Then ask: who put that number there.

If a human pulled the number from a tool, copied it into a spreadsheet, or otherwise moved data around to make the row update, the agent is not actually staffed yet. The seat is being managed by the human who is doing the data plumbing. The seat is not yet running on its own.

If the agent itself wrote that number, with no human in the loop, the seat is staffed. The agent owns the row.

This test sounds trivial. It is the difference between a working agent army and an expensive theater performance.

Most agent rollouts I see in 2026 are the theater performance. The agents are doing real work. The metrics are pulled by humans. The dashboard updates because someone on the ops team wrangled it. Six months in, the team has spent more time managing the agents' measurement than the agents are saving in actual labor. The math has flipped negative and nobody is saying it out loud.

This post is about how to avoid that outcome. It walks through the four failure modes of agent measurement, what a real agent scorecard looks like, and how to make the agent itself responsible for its own numbers.

## The four failure modes of agent measurement

Every agent measurement problem I have ever debugged falls into one of these four buckets.

**Failure mode one: the human is the agent's manager.**

The human is the one who tracks whether the agent did its work. The human is the one who reports the agent's numbers up. The human is the one who notices when the agent's output drops. In every conversation about the agent's performance, the human is the one talking, and the agent's role is "the thing the human is talking about."

This is the default failure mode of nearly every agent rollout. The team builds the agent, deploys it, and then assigns a human to "watch over it." The human is now the agent's manager, which means the team has not added capacity. They have added a managee. The promised productivity gain is canceled by the supervision overhead.

The fix is not to remove the human's involvement. The human still owns accountability for the agent's seat. The fix is that the agent reports its own numbers, and the human's job becomes reviewing those numbers in the same Monday meeting where every other seat's numbers get reviewed. Five minutes per week per agent, not five hours.

**Failure mode two: the metric is a runtime metric, not a business metric.**

Tasks completed per day. Tokens consumed per hour. Latency per call. Cache hit rate. Errors per thousand requests.

These are all runtime metrics. They tell you about the agent's machinery. They tell you nothing about whether the agent is producing business value.

Runtime metrics are necessary if you are debugging the agent. Runtime metrics are wrong if you are managing the agent. The seat's scorecard should report business outcomes, not infrastructure health. If you do not have a business outcome you can name, the seat does not have a real role yet.

The fix is to ask: if this seat were filled by a human, what would they report at Monday's meeting. That answer is the agent's metric. Cold emails sent. Qualified meetings booked. Pipeline stage transitions. Days payable outstanding. Percentage of clients with a current performance review on file. None of those are runtime metrics. All of them are seat metrics.

**Failure mode three: the metric is aspirational, not measurable.**

The seat's metric reads like a goal, not a number. "Customer satisfaction." "Team alignment." "Strategic clarity." Things that sound like they should matter but cannot be reported as a single number that updates every week.

Aspirational metrics are the second-most common failure mode after runtime metrics. They make Monday meetings feel productive without producing accountability, because nobody can prove the metric moved or did not move.

The fix is the rule from the EOS framework: if you cannot put a number on it that updates every week, it is not a metric. It is a wish. Either find a measurable proxy or remove the row from the dashboard.

**Failure mode four: the metric updates on the wrong cadence.**

Monthly metrics for an agent that runs hourly. Quarterly metrics for an agent that runs daily. Annual metrics for an agent whose work compounds in days.

The cadence mismatch is what hides drift. If the agent's metric updates monthly and the agent goes off-pattern in week two, you do not catch it until week six. By then the damage is locked in.

The fix is that the agent's metric should update at least as fast as the agent's output. If the agent is sending cold emails daily, the metric updates daily. If the agent is making weekly client calls, the metric updates weekly. The cadence of measurement matches the cadence of work.

## What a real agent scorecard looks like

Dirk, our sales agent, has three rows on his scorecard.

Cold emails sent per week. Target 30 per day, 150 per week. Current week is reported as a single number, updated every Friday at 5 pm by Dirk himself, written to the company dashboard via a direct API call, with no human in the loop.

Qualified meetings booked per week. Target 3. Same publication mechanism. Same cadence.

Pipeline stage transitions per week. Target 5. Same mechanism. Same cadence.

That is the entire scorecard. Three rows. Each row is a business metric, not a runtime metric. Each row is measurable, not aspirational. Each row updates weekly, which matches Dirk's work cadence.

When I look at Dirk's row in Monday's meeting, I see three numbers. I know within five seconds whether Dirk had a good week. If a number is below target, I ask Dirk's seat-owner the same question I would ask any direct report. What was the cause. What is the fix. What does next week look like.

That conversation is five minutes. Not fifty. Not five hours. Five minutes per agent per week, multiplied by twelve agents, is one hour. That is what running an agent army actually costs in management time, when measurement is set up right.

## The agent has to publish its own numbers

This is the part most teams skip, and skipping it is what kills the math.

If a human is the one writing the agent's numbers into the dashboard, the agent is not yet a peer of the humans on the chart. The agent is a feature of a human's seat. The human's seat is the one that is actually accountable. The agent is just the tool the human is using to produce work.

The fix is operational, not philosophical. The agent needs the credentials, the API access, and the explicit task of writing its own numbers to the dashboard at the right cadence. This is usually a thirty-minute integration. Most teams skip it because it feels small. It is not small. It is the difference between an agent that holds a seat and an agent that is decoration on a seat someone else holds.

We have a dedicated agent named Tally whose only job is to push KPI numbers to our dashboard. Tally reads from each agent's local state files and posts to the dashboard via API. The other agents do not push their own numbers directly. They push to Tally, who handles the dashboard write. This is a small architectural choice but it scales: when we add a new agent, the new agent only needs to know how to write its number to a state file, not how to authenticate to the dashboard.

The point is that no human is in the loop. The dashboard updates without any human action. When the dashboard is wrong, the bug is in code, not in someone's calendar.

## What you do this week

If you are running agents and you are not sure whether they are actually staffed, run the test from the top of this post.

Open this week's dashboard. Find an agent's row. Read the number in the "current" column. Ask who put that number there.

If the answer is a human, you have one of the four failure modes above. Identify which. Fix it.

If the answer is the agent itself, look at the metric. Is it a business metric or a runtime metric. Is it measurable or aspirational. Is the cadence right. Fix what is broken.

If everything checks out, you have an agent that is actually staffed. Treat it like a teammate, not like infrastructure.

Most agents in production today fail this test. Almost every operator I have walked through this realizes their agents are not actually as autonomous as they thought. The number on the dashboard was being moved by a human, the metric was a runtime artifact, and the conversation about the agent's performance was a conversation about the human who was managing it.

The good news is the fix is mechanical. None of the four failure modes is hard to repair once you can name it.

## See the live agent scorecards

The agents on our chart publish their own numbers. You can pull the current state of any seat with the OTP MCP.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me what KPIs Sneeze It's agents track."*

You will get a structured response with each agent's metrics and current targets, exactly as they appear on our Monday dashboard. Compare to your own dashboard. The contrast names the work.

## What comes next

This is post 3 of an in-progress series on organizing agents.

Previous posts:
- [Adding an AI agent to your org chart is not configuration. It is hiring.](/blog/adding-an-agent-to-your-org-chart)
- [Humans and agents on the same scorecard does not feel like a strategic decision until you try the alternative](/blog/humans-and-agents-on-the-same-scorecard)

The next post in the series goes deeper into a problem most teams discover the first time they have two agents that overlap: how to prevent agents from doing duplicate work, and why the answer is upstream of any technical orchestration.

If you have a question about agent measurement that this post did not answer, write to me at dsteel@orgtp.com. Real questions become real posts.

---

*Series: Organizing Agents. Post 3 of an in-progress series.*
