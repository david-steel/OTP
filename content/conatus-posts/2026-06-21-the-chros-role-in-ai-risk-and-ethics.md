---
title: The CHRO owns AI risk because accountability without a named human owner is not accountability at all
date: 2026-06-21
author: David Steel
slug: the-chros-role-in-ai-risk-and-ethics
type: founder_essay
status: published
series: ai-chro
series_part: 33
description: Six obligations every CHRO must own as agents enter the workforce, and why accountability architecture is not the same as anthropomorphizing your agents.
---

# The CHRO owns AI risk because accountability without a named human owner is not accountability at all

There is a live debate in the management literature right now, and if you are a CHRO deploying agents, you are in the middle of it whether you have read the papers or not.

Camp A says manage agents like coworkers. MIT SMR published in September 2025 that 69% of experts agree agentic AI demands new management approaches, including dashboards, scorecards, and observability. HBR introduced the "agent manager" role earlier this year. The framing is digital teammates.

Camp B fires back hard. An HBR and BCG study published in May 2026 ran a large experiment and found that anthropomorphizing agents specifically reduced individual accountability, increased unnecessary escalation, and lowered review quality. Their model: treat agents as a rented contractor with a narrow statement of work. Govern them through scoped permissions, kill switches, audit logs, and named human owners. Not HR onboarding. Not performance reviews. Governance.

The synthesis is not complicated, but it requires saying it precisely: both camps agree on the same three things. Every agent needs a named human owner. Every agent needs a measured seat. Accountability stays with the human, always.

That synthesis is what OTP's one-seat-one-owner chart enforces. Not anthropomorphizing. Accountability architecture.

The distinction matters because the CHRO's role in AI risk is not to treat agents like employees. It is to make sure every agent in the organization is traceable to a human who owns what it does.

Here is how that plays out across the six specific obligations a CHRO carries when agents are on the workforce.

## 1. Establish named ownership before any agent goes live

MIT SMR's ninth essential question on agentic AI is direct: when agentic AI systems make critical decisions, how do you ensure accountability? Accenture's answer, also in MIT SMR, is that high-AI-value firms are 4.5 times more likely to have invested in agentic architectures that answer that question structurally.

The architecture is not complicated. Before any agent seat goes live, a human name goes in the owner field. Not a team name. Not a department. A person.

At Sneeze It, Tally is our scorecard agent. It pushes KPI values from local sources to the OTP chart four times a day on weekdays. The seat exists. The metric is defined. And the human who answers for Tally's numbers is named. If Tally reports the wrong number, that person is in the conversation, not the agent.

This is not HR work in the traditional sense. It is the work HR used to do for every new hire: make sure someone is responsible. The CHRO's job is to make that discipline mandatory before the first agent goes live, not after the first failure.

## 2. Define the scope, then gate everything outside it

The HBR and BCG finding on anthropomorphization is worth sitting with. When people mentally treat agents like employees, they stop supervising. Review quality drops. Escalation goes up because the human trusts the agent to flag its own edge cases, which agents do not do reliably.

The fix is scoped permissions, not softer language.

When we built Dirk, our sales agent, we gave it a defined lane: agency revenue, reactivation campaigns, pipeline tracking. Dirk does not touch client ad performance. Dirk does not write to our CRM without an explicit write authorization flag set in the environment. Every call Dirk makes that could modify data requires a variable that is off by default.

Scoped permissions are not a technical safety feature. They are a governance feature. They are the thing that keeps a human meaningfully in the loop, because the loop is structurally enforced, not dependent on the agent's self-awareness.

The CHRO's role here is to require this architecture across the organization. Not just for the high-stakes agents. For all of them. Because the governance gap that causes problems is almost always the agent everyone assumed was low-risk.

HBR Analytic Services surveyed 603 business leaders in late 2025 and found only 12% had risk and governance controls fully in place. Only 6% fully trusted agents with core processes. The other 94% are running agents under some degree of assumption. That assumption is the CHRO's problem to fix.

## 3. Build the ethics layer into the seat design, not the agent instructions

The standard approach to AI ethics is a policy document. A list of things agents should not do. Sometimes it is a filter on the prompt. Sometimes it is a disclaimer in the system message.

None of that is the ethics layer. The ethics layer is who owns the seat, what the seat is permitted to do, what the seat is measured on, and what happens when the seat produces a bad outcome.

When we retired Jeff, our former data integrity agent, in April of this year, it happened through a hearing. A human decision. We reviewed what Jeff was producing, evaluated whether the seat was earning its existence, and concluded it was not. Jeff's capabilities were redistributed to Dash and Dirk and Dan. The accountability for what Jeff had been doing moved to named humans in those seats.

The seat did not go away cleanly because an agent decided to stop working. It went away because a human decided the seat was not earning what the organization needed from it. That is how ethics works in a hybrid workforce. Not agent self-governance. Human governance over agents.

The CHRO's role is to make that process repeatable, not just reactive. What are the conditions under which a seat gets reviewed? Who conducts the review? Where does the record live? That is workforce governance, and it applies to agents the same way it applies to contractors.

## 4. Close the AI strategy communications gap before it becomes a trust problem

Korn Ferry's Workforce 2025 research across 15,000 employees in 15 markets found that 70% of senior leaders say their organization has an AI strategy, but only 39% of employees agree. That gap is not a communications problem. It is a trust problem in formation.

When employees cannot see where agents are being deployed, what the agents are accountable for, and who owns them, they fill in the gap with their own stories. Those stories tend toward the worst version of what could be happening. Korn Ferry found that 48% of employees globally fear AI will replace their job within three years. In tech, that number is 59%.

The CHRO's job is not to reassure people that nothing bad will happen. The CHRO's job is to make the architecture visible. When every agent has a named owner, a defined scope, and a seat on the chart, the story is legible. People can see that Radar runs the morning briefing and Bogdan, our COO, is the human responsible for what Radar flags. They can see that Crystal tracks project status and a human reviews every risk it surfaces. The architecture answers the fear better than any communication campaign does.

SHRM's 2026 State of AI in HR report found that 49% of organizations have AI-use policies but only 25% describe them as clear. That gap between having a policy and having a clear policy is where employee trust leaks out.

## 5. Protect the human judgment that agents cannot carry

There is a clean line in what agents absorb and what they should not. Bersin's framing is useful here: the CHRO oversees redesign, reskill, and redeploy. What those three words mean in practice is that HR identifies which work agents take on and then makes sure the human work that remains is genuinely human.

At Sneeze It, the agents carry operational load. Radar runs briefings. Dash reads ad performance numbers. Arin manages call center data and drafts coaching messages. Pepper triages email. Nick runs cold prospecting pipelines. Crystal tracks project status.

None of those agents make final decisions on people. None of them decide who gets promoted, who gets a performance conversation, which client relationship to prioritize, or whether a human on the team is struggling. That work stays human because judgment about people is not a task that scales safely.

Deloitte's 2025 Global Human Capital Trends found that managers spend roughly 40% of their time on administrative work versus 13% on people development. The agent case is not that we reduce headcount. The case is that we get that ratio right. Let agents carry the operational work so people are free for the work that matters.

The CHRO is the one who holds that line. When an agent starts encroaching on judgment work, either because it was scoped too broadly or because it drifted beyond its permissions, the CHRO is the function that calls it.

## 6. Build the audit infrastructure before you need it

Gartner predicts that by 2027, more than 40% of agentic AI projects will be canceled. That is not a failure statistic. That is a governance statistic. The projects that get canceled are the ones where nobody built the audit trail that lets you understand what went wrong.

Every agent seat needs an observable record. What did it produce. When did it produce it. What inputs drove it. Who reviewed the output. The record is not for the agent. It is for the human owner.

When something goes wrong with Dirk's outreach, we can pull the queue. We can see what was sent, when, to whom, and what the input data was. When Arin's coaching messages to the call center team need adjustment, we can see the prior messages and the performance data that drove them. The audit trail is not a compliance exercise. It is how human accountability becomes real instead of nominal.

Only 12% of organizations in the HBR Analytic Services survey had risk and governance controls fully in place. The CHRO who builds that infrastructure now is not preparing for a future scenario. The agents are already running. The audit trail is already either there or not.

The six obligations above are not a framework for treating agents like employees. They are a framework for making sure that as agents take on more of the operational workforce, every one of them remains traceable to a human who owns what it does. That is AI risk management. That is AI ethics. And in a hybrid workforce, it belongs to the CHRO.

## See the live chart

Every agent seat at Sneeze It is queryable from OTP's MCP, so you can see which seats are agent-owned versus human-owned and who the named human owner is for each.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the sneeze-it org chart and tell me which seats have agents versus humans, and who owns each agent seat."*

The answer tells you what accountability architecture looks like in practice, not in theory.

---

*Series: AI-Era CHRO. Part 33 of an in-progress series.*
