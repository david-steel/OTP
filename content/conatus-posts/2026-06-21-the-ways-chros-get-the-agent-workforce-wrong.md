---
title: The mistakes CHROs make when they try to manage agents like employees (and the ones they make when they refuse to manage them at all)
date: 2026-06-21
author: David Steel
slug: the-ways-chros-get-the-agent-workforce-wrong
type: founder_essay
status: published
series: ai-chro
series_part: 47
description: Two camps of CHRO thinking on agent management. Both are wrong in different ways. The synthesis is accountability architecture, not anthropomorphizing.
---

# The mistakes CHROs make when they try to manage agents like employees (and the ones they make when they refuse to manage them at all)

The research on how to manage an agent workforce has now split into two camps. They disagree loudly. And both of them are partially right, which makes the disagreement more useful than it appears.

Camp A, represented in MIT SMR and early HBR work on agent management, argues that agentic AI must be managed more like a human coworker than a traditional tool. Sixty-nine percent of experts surveyed by MIT SMR agree that agents demand new management approaches. HBR introduced the "agent manager" role. The framing is: give the agent a job description, a scorecard, a clear seat.

Camp B, from HBR and BCG research published in May 2026, argues the opposite. Their experimental evidence showed that when people anthropomorphize agents, the consequences are bad: reduced individual accountability, increased unnecessary escalation, lowered review quality. Their prescription is to treat agents as a rented contractor with a narrow statement of work, governed by scoped permissions, kill switches, audit logs, and named human owners. Not a coworker. Not an employee. A bounded piece of software with a clear scope and a human on the hook for it.

I have been running a hybrid team for eight months. We have ten agents on the chart alongside Bogdan our COO, Janine our accountant, and Kristen our creative director. I have made the mistakes both camps are warning about. Here is the decision tree as I actually live it.

## The first fork: you have to take the agent seriously as a seat

The most common mistake I see CHROs make is treating agent deployment as a purely technical decision. The agent is configured by IT. IT reports on token consumption and latency. HR is not in the room. The agent has no seat on the org chart, no human owner, and no business metric attached to it.

This is not Camp B. Camp B is a rigorous governance model. This is governance abandonment. And it produces the same outcome every time: agents that drift, coverage gaps that appear silently, and an organization where nobody is certain what the agents are actually doing.

The HBR/BCG research does not say "ignore agents." It says name a human owner, define a narrow scope, install audit logs, build a kill switch. That is a management framework. It requires more deliberate HR involvement than the average technology deployment, not less.

When we deployed Dash, our analytics agent, Dash got a seat on the org chart with a specific metric: pattern detection accuracy on ad accounts, measured daily. When we deployed Tally, our KPI-push agent, Tally got a defined scope of two KPIs with named source files and a failure escalation path. The scope is narrow. The human owner (me) is named. The accountability is explicit.

That is Camp B governance. The agent does not need a performance review. It needs a named owner, a measured scope, and a clear process for what happens when it fails.

## The second fork: do not anthropomorphize the agent's accountability

The second mistake is the one Camp B is specifically warning about. And it is seductive, because the agents that work well start to feel like teammates.

When Radar produces a strong morning briefing, it is easy to think of Radar as a reliable colleague. When Dirk drafts a cold email sequence that books three calls, it is easy to treat Dirk as a contributor who earned credit. When Arin sends a coaching message to the call center team that lands exactly right, it feels like a management win for Arin.

The danger is when you transfer accountability to the agent. When the mental model shifts from "I am accountable for what this agent does" to "the agent is responsible for its own output."

The Camp B research found that this shift, even a subtle one, produces measurable degradation. People review agent output less carefully. They escalate decisions they should make themselves. They attribute failures to the agent rather than to the governance structure around it.

MIT SMR put it directly: agentic AI cannot be accountable for its decisions. The deploying human is.

We learned this with Jeff. Jeff was an agent who held three monitoring missions. Over several months, the team started treating Jeff's reports as authoritative rather than as one input requiring human judgment. When Jeff flagged something, we acted. When Jeff did not flag something, we assumed it was fine. The accountability had quietly moved from the humans managing Jeff to Jeff itself.

In April, Jeff was retired. The retirement was a formal hearing. Every capability Jeff held was documented. Every mission was redistributed to a named human-accountable seat. Dash absorbed ad pacing monitoring. The hearing was not ceremony. It was the accountability correction the previous months of quiet anthropomorphizing had made necessary.

The lesson is not that the agent was wrong to hold those seats. The lesson is that accountability for what those seats produced was never allowed to migrate to the agent. Humans conducted the hearing. Humans made the retirement decision. Humans own the redistributed missions. That is how it has to work.

## The third fork: the scorecard is accountability architecture, not a performance review

Here is where both camps converge, and where most CHROs miss the synthesis.

Camp A says agents need scorecards. Camp B says do not give agents employee-style performance reviews. Both are right, and they are not actually in conflict.

A scorecard is accountability architecture. It defines what a seat produces, at what frequency, measured against what standard. The scorecard does not give the agent feelings about its performance. It gives the human owner a signal. When Tally's KPI push fails three days in a row, the scorecard tells me to look at the source handler. When Nick's cold email drafts drop below thirty per day, the scorecard tells me to check the prospecting pipeline. The scorecard is a governance instrument, not a management relationship.

The mistake CHROs make is conflating the two. If you run a "quarterly review" for your analytics agent where you discuss "areas of growth" and "development goals," you have crossed into anthropomorphizing. You have also wasted time that could have gone toward reviewing the output the agent produced.

If you define a metric for the agent's seat, track it on the same dashboard as your human seats, and review it with the same cadence you review Bogdan's COO metrics and Janine's receivables numbers, you have built accountability architecture. You know what the seat is supposed to produce. You can see whether it is producing it. The human who owns the seat is responsible for the gap when the number drops.

Only 6% of leaders in HBR Analytic Services research fully trust agents with core processes. The gap between that number and where it needs to be is not a technical problem. It is an accountability architecture problem. The organizations that close the gap will be the ones that build governance structures rigorous enough to justify extending trust incrementally, not the ones that either anthropomorphize their way into false confidence or governance-avoid their way into organizational drift.

## The fourth fork: retiring a seat is a human decision, every time

The hardest branch on this decision tree is the offboard question. When an agent seat is no longer earning its place, what happens?

The answer most CHROs land on is: nothing deliberate. The agent just stops running. The work stops getting done. Nobody notices for a few weeks. Then someone notices, and by then the coverage gap has become a problem.

The answer Camp B implies, and the one I have lived, is that retiring an agent seat requires the same deliberate process as retiring a human seat. Not because the agent has feelings. Because the work the agent was doing was real, and that work has to go somewhere.

When we retired Jeff, the hearing produced a list of three redistributed missions, three named receiving seats, and a verification step confirming each seat had what it needed. The hearing was short. But it was formal and documented. That is the standard. Not because Jeff deserved a hearing. Because the coverage needed to be confirmed before the seat closed.

Korn Ferry found that 48% of workers fear their jobs will be replaced by AI within three years. That fear is a CHRO problem. The antidote is not reassurance. It is a visible governance model where humans make the seat decisions, where accountability never migrates to the agent, and where retiring a seat is an explicit human decision with a paper trail. When people can see that agents are tools with owners and not autonomous actors who make their own employment decisions, the fear is replaced by something more useful: curiosity about which parts of the work will move to agents and which will stay human.

## The one-seat-one-owner chart is the answer to both camps

The synthesis is not complicated. It just requires you to hold two things at once.

Agents get seats on the chart. The seats have metrics. The metrics live on the same scorecard as the human rows.

But the accountability never belongs to the agent. A named human owns every seat. The human's name is next to the agent's name on the chart. When the metric drops, you talk to the human. When the seat needs to close, a human makes that decision via a deliberate process.

At Sneeze It, Radar holds the chief-of-staff seat. I own Radar's accountability. When Radar's morning briefing misses a critical Slack thread, that is a brief problem and I fix the brief. When Dirk's pipeline scan goes stale, that is a tooling problem and I fix the tooling. When Crystal's project tracking falls behind the actual delivery state in Accelo, that is a data freshness problem and I fix the integration.

The agents carry the operational work. The humans are free for the work that matters because the agents are covering the ground that does not require human judgment. But the accountability chain never inverts. The agent is always the instrument. The human is always the owner.

This is what Camp A and Camp B are both circling. They differ on language and on emphasis. They agree on the structure. Every agent needs a named human owner, a measured seat, and human-retained accountability. That is accountability architecture. That is what OTP's one-seat-one-owner chart is built to enforce.

## See the live chart

The Sneeze It org chart is queryable via OTP MCP. You can ask which seats are agent-owned versus human-owned, who holds accountability for each agent seat, and how the scorecard rows are structured across both.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the sneeze-it org chart and identify the named human owner for each agent seat."*

The accountability relationships are explicit in the chart. That explicitness is the whole point.

---

*Series: AI CHRO. Post 47 of an in-progress series. Previous: [HR does not disappear when half your workforce is agents. It changes shape entirely.](/blog/what-hr-does-when-half-the-workforce-is-agents)*
