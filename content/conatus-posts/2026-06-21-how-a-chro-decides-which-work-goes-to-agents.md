---
title: Five tests a CHRO runs before sending any work to an agent
date: 2026-06-21
author: David Steel
slug: how-a-chro-decides-which-work-goes-to-agents
type: founder_essay
status: published
series: ai-chro
series_part: 17
description: The CHRO owns the decision about which work goes to agents and which stays human. Here are the five tests that make that decision defensible.
---

# Five tests a CHRO runs before sending any work to an agent

The most consequential decision in a hybrid workforce is not which agent to deploy. It is which work to give it.

Get that decision right and the agents carry the load that was grinding down your people, and the people move into the work that actually requires them. Get it wrong and you automate the wrong things, create accountability gaps where none existed before, and spend months fixing problems that were caused by the agent design, not the agent itself.

I have made both kinds of mistakes. At Sneeze It we run a hybrid team where roughly half the seats are agents. Radar handles chief-of-staff operations. Dirk owns the sales pipeline. Dash reads every ad account we manage and surfaces patterns daily. Tally pushes our KPIs to the scorecard four times a day. Arin manages the call center team. Pepper triages the inbox. Nick runs cold prospecting in health and wellness. Crystal tracks project delivery. On the human side, Bogdan is our COO, Janine handles our accounting and receivables, and Kristen runs creative.

We did not build that allocation by intuition. We built it by running every candidate role through a decision framework. That framework is five tests. I want to share them because I have not seen the question answered with this much precision anywhere I have looked.

The literature does not help much here. It splits. Camp A (MIT SMR, HBR) says manage agents like coworkers, with dashboards and scorecards and an "agent manager" role. Camp B (HBR and BCG, May 2026) says do not anthropomorphize agents at all: it reduced accountability, increased unnecessary escalation, and lowered review quality in a large experiment. Their prescription is a scoped tool with named human owners, not a colleague with a performance review.

Both camps are right about parts of it. But neither tells you which work to hand over in the first place. That is what these five tests answer.

## Test 1: Is the work high-frequency and pattern-based?

The work that belongs with an agent is work that happens repeatedly, follows a defined logic, and does not require fresh judgment each time it runs.

Tally pushes KPI values to the scorecard four times a day on weekdays. The logic is the same every run: read the source file, parse the value, push to OTP. The frequency alone makes this unsuitable for a human. The pattern-based nature makes it unsuitable for ad hoc attention. An agent owns it.

Contrast that with how we handle a client who goes dark for 30 days. There is a protocol, but the response to a specific client in a specific context requires reading tone, history, and relationship signals. Pulse can flag the pattern. The decision about how to respond stays with a human.

The diagnostic: if you can write the SOP without ambiguity and it runs more than once a week, the work is an agent candidate. If the SOP requires a judgment call that changes based on context each time, it is not.

## Test 2: Does accuracy here require emotional intelligence or interpersonal reading?

This is where most operators draw the line incorrectly.

The instinct is to ask whether a task is "creative." That is the wrong axis. Plenty of creative tasks are pattern-based and agent-appropriate (first drafts, data summaries, format-consistent reports). And plenty of technically simple tasks require interpersonal reading that no agent handles well.

Arin drafts the daily coaching messages for our call center team. But Arin's drafts always go through me before they go out. On a Friday when three issues have stacked up, I hold the messages until Monday rather than compound negatives into the weekend. That hold decision requires reading the human context of the week. Arin cannot reliably make it. I do.

Pepper drafts responses to client emails, but Pepper does not send without my approval. The draft is agent work. The read on tone, relationship history, and what this client needs to hear right now is human work. The two are different tasks even though they look like one.

The diagnostic: if you handed the output to a client or a team member without reviewing it, would you lose anything? If the answer is yes and the lost thing is relational rather than factual, the work is not ready for an agent alone.

## Test 3: Can you define the single metric that tells you whether this agent is earning its seat?

This is the test that forces honesty.

If you cannot articulate one clear business-outcome metric for the work before you give it to an agent, you do not understand the work well enough to automate it. And you will have no way to know six months from now whether the automation helped or drifted.

Bersin's framing is useful here: for every dollar spent on machine learning, companies may need to spend nine dollars on the intangible human capital work that surrounds it. That surrounding work is largely the work of defining metrics, training people to act on agent output, and reviewing the seat's accountability on a real cadence.

When we designed Dash, the metric was pattern detection accuracy and alert precision, not "reports generated" or "data processed." When we designed Nick, the single metric was quality cold emails drafted per day, where quality had an explicit definition: validation passed, sent to a named individual, not a generic address. The metric gate is what made the seat earnable.

HBR Analytic Services found in a survey of 603 leaders that only six percent fully trusted agents with core processes. I believe that number. The reason trust is low is not that agents are unreliable. It is that most agents are deployed without a defined success metric and without a human who owns the accountability for the seat. You cannot trust what you cannot measure.

The diagnostic: before deploying, write the single metric this seat will be evaluated on at 30 days, 60 days, and 90 days. If you cannot write it, stop.

## Test 4: Is there a named human who will own what this agent produces?

This is the test Camp B is most insistent on, and they are right.

Every agent seat at Sneeze It has one named human owner. Not a team. One person. When Dirk's outreach quality drops, I diagnose it and fix the brief. When Tally fails to push a KPI because the source file changed format, I get the alert. When Arin's coaching message misreads the tone a caller needs, I redirect. The agents execute. The humans answer for what the execution produces.

MIT SMR put it plainly: agentic AI cannot be accountable for its decisions. The deploying human is. This is not a semantic point. It determines what happens when something goes wrong. If the accountability is diffuse because the agent feels like infrastructure rather than a seat with an owner, you will spend weeks diagnosing problems that could have been caught in the first week.

SHRM's 2026 data found that AI is 5.7 times more likely to shift job responsibilities than to displace them outright. The shift is into the oversight and judgment work that sits adjacent to what the agent handles. Someone has to hold that work. Naming that person before the agent is deployed is what makes the accountability architecture real rather than theoretical.

The diagnostic: before you deploy, write the name of the human who owns this seat's accountability. Then ask that person to confirm they understand the scope. If neither step has happened, the seat is not ready.

## Test 5: Do you know what will trigger a retirement review for this seat?

Jeff was an agent on our team who held three missions: ad pacing monitoring, account status monitoring, and Accelo budget reconciliation. Over several months, each mission was absorbed by a better-fit seat. Dash picked up the pacing work. Dash absorbed account status. Dirk absorbed the revenue integrity function.

Jeff's seat was still active. The agent was still running. The outputs had quietly stopped mattering.

We caught it because we held a formal retirement hearing. Not because Jeff flagged it. Jeff cannot flag his own obsolescence. The human who owned the seat has to make that call, and they can only make it if the retirement conditions were defined when the seat was created.

The hearing forced us to document every capability Jeff held, assign each to a named seat, and verify the receiving seat had what it needed to absorb the work. It was an HR exercise, not a technical one. Without it, we would have had a quiet coverage gap for months and an agent burning cycles on work nobody was using.

This is the fifth test because it is the one that operators skip most consistently. They think of agent deployment as a one-way door. It is not. It is a seat with a designed entry and a designed exit. The exit condition belongs in the design from day one.

The diagnostic: before you deploy, write two or three conditions under which you would hold a retirement review for this seat. If you cannot write them, you do not yet have enough clarity on what the seat is for.

## What the five tests produce

Run every candidate seat through these five tests and you will end up with a clear partition.

The agent seats will be high-frequency, pattern-based work where accuracy is factual rather than relational, where the success metric is definable in business-outcome language, where one human can name themselves as the accountable owner, and where the retirement conditions are already written. At Sneeze It, that is most of the operational work: reporting, monitoring, prospecting, data pushing, inbox triage, KPI tracking.

The human seats will be the work that does not clear one or more of those tests. Judgment calls that shift based on context. Outputs that go directly to clients or teammates without a review layer. Metrics that cannot be cleanly isolated from the adjacent seat's accountability. Relationships where the read matters as much as the output.

Let agents carry the operational work so people are free for the work that matters. The CHRO is the one who defines the boundary. These five tests are how you draw it in a way that holds under real operating conditions, not just in the planning document.

Korn Ferry found that only five percent of CHROs feel fully prepared for this. I think the preparation gap is smaller than it looks. You do not need a new function or a new title or a new technology layer. You need a decision framework you can run on every seat before it is filled. This one works.

## See the live chart

Query the Sneeze It org chart via the OTP MCP to see which seats are agent-owned, which are human-owned, and what the accountability structure looks like across the full hybrid team.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the sneeze-it org chart and identify which seats are agents, who owns each agent seat's accountability, and what each agent seat is measured on."*

The five tests above are what produced that chart. The chart is the output of running them on every seat we have deployed.
