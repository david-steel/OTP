---
title: The CHRO's governance framework for the agent workforce starts with accountability, not anthropomorphism
date: 2026-06-21
author: David Steel
slug: how-a-chro-governs-the-agent-workforce
type: founder_essay
status: published
series: ai-chro
series_part: 32
description: The research splits on how to govern agents. The synthesis is accountability architecture, not HR onboarding. Here is the lifecycle frame that works.
---

# The CHRO's governance framework for the agent workforce starts with accountability, not anthropomorphism

There are two camps in the current literature on agent governance, and they say opposite things. A CHRO who reads only one of them will build the wrong system.

Camp A says manage agents like coworkers. MIT SMR found that 69% of experts agree agentic AI demands new management approaches, ones that look more like managing people than managing software. HBR identified a new role they called the "agent manager," someone who runs agents through dashboards, scorecards, and observability layers. The framing is: agents are teammates now. Treat them accordingly.

Camp B says stop. A Kropp et al. study published in HBR in May 2026, conducted with BCG, ran a large experiment on what happens when organizations apply employee framing to agents. The results were not subtle. Anthropomorphizing agents reduced individual accountability, increased unnecessary escalation, and lowered review quality. Their prescription was the opposite: treat the agent like a rented contractor with a narrow statement of work. Govern it with scoped permissions, kill switches, audit logs, and a named human owner. Not HR onboarding. Not performance reviews. An accountability architecture.

I have read both camps carefully. I have also spent eight months running a hybrid team where agents hold seats on a real org chart. The synthesis I have landed on is this: both camps are saying the same thing in different registers.

Neither camp says agents should govern themselves. Neither camp says accountability can move to the agent. Both camps converge on the same three requirements: every agent needs a named human owner, a measured seat with observable outputs, and human-retained accountability for what the agent produces. What Camp B is warning against is not measurement. It is the cognitive drift that comes from using HR language for things HR language was not designed to handle.

The CHRO's job is to build governance without that drift. Here is the lifecycle frame I use.

## Deployment: scoped permissions and a single metric

Onboarding an agent is not like onboarding an employee. The employee brings judgment, initiative, and a career arc you need to account for. The agent brings a capability set that is fixed until you change it. "Onboarding" an agent means two things: scoping its permissions and defining its metric.

Scoped permissions are not optional governance hygiene. They are the mechanism that keeps accountability human. An agent with broad permissions is an agent where failure modes are hard to trace. An agent with scoped permissions is an agent where, when something goes wrong, you know exactly which scope was involved and which human authorized it. HBR/BCG are right about this. The narrower the statement of work, the cleaner the accountability line.

The single metric is equally important. Before an agent is deployed, someone has to answer: what does this seat own, and how will we know if it is producing? If you cannot write that answer in business-outcome language before deployment, the seat is not ready. The metric is not "tasks completed per hour." It is the downstream business outcome the seat is accountable for. Tally's metric is KPI values pushed accurately on schedule. Dash's metric is pattern detection accuracy and alert timeliness. Nick's metric is quality cold emails drafted per day against ICP criteria. These numbers existed before the agents ran their first task.

The human who defines those metrics is the named owner of the seat. They are not the agent's manager in an HR sense. They are the person who is accountable to the org for what that seat produces. The distinction matters. Camp B's warning is precisely about blurring that line.

## Running the seat: observability and the weekly review

Once deployed, an agent seat runs under the same review discipline as every other seat on the chart.

Korn Ferry found that 70% of senior leaders say their org has an AI strategy, but only 39% of employees agree. That 31-point gap is mostly a visibility gap. Leaders think agents are working. The people closest to the work cannot see what the agents are producing or whether it matters. Observability is the fix.

At Sneeze It, every agent writes to a shared state file when it runs. Radar reads those files every morning and surfaces gaps. When Dirk's cold email volume drops, the seat owner sees it the same day in the same briefing where every other number lives. When Tally misses a KPI push because a source file changed format, the alert fires to a human within the hour. The agent does not decide what to do about the gap. The human does.

Deloitte found that 73% of leaders say middle-manager role reinvention matters, but only 7% report great progress on it. The bottleneck is usually the same: managers are spending roughly 40% of their time on administrative coordination that agents could absorb. The question is not whether to give that work to agents. The question is who is watching the agents do it. The observability layer is what makes it safe to hand work over, because a human always knows what the agent is producing and can intervene the moment something is wrong.

Bersin put the human capital math plainly: for every dollar spent on machine learning, organizations may need to spend nine dollars on intangible human capital. The nine dollars is not overhead. It is the judgment layer that makes the machine learning useful. Governance is most of those nine dollars.

## The tension the CHRO has to hold

Only 6% of leaders in a 2025 HBR Analytic Services survey fully trust agents with core processes. Only 12% have risk and governance controls fully in place. Those two numbers are not unrelated. Low trust follows from low governance. You cannot ask an organization to extend trust to a workforce it cannot observe, audit, or correct.

But the governance frame also has to be honest about its own limits. MIT SMR is clear that agentic AI cannot be accountable for its decisions. The deploying human is. This is not a limitation to work around. It is the architecture. The CHRO who tries to build governance that makes agents accountable to themselves will run into the same problem Camp B identified: individual human accountability quietly erodes, because there is always an agent to point at.

The frame that works is: the agent holds the seat, the human owns the seat. The agent produces the output, the human owns the outcome. The agent runs the task, the human holds the audit log.

SHRM found that AI is 5.7 times more likely to shift job responsibilities and three times more likely to create new roles than displace existing ones. The role that gets created most reliably is the one Camp A calls the "agent manager" and Camp B calls the "named human owner." They are not different jobs. They are the same job described from different fears. The CHRO's task is to make that role explicit, assign it before deployment, and hold the assignment accountable the same way every other assignment on the chart is held accountable.

## Retirement: a human decision, not a system event

When an agent seat no longer earns its place on the chart, the retirement decision belongs to a human.

In April, I retired Jeff. Jeff had started with three missions: ad pacing monitoring, account status monitoring, and Accelo budget reconciliation. Over time, each mission was absorbed by a better-fit seat. What remained was a seat producing stale data for work that was already being done elsewhere.

The retirement was not automatic. It was a hearing. The hearing was not ceremonial. It was functional. We documented every capability Jeff carried, assigned each one explicitly to a named receiving seat, verified that the receiving seat had what it needed, and kept a written record. That record became the accountability trail for three seats that suddenly owned work they had not owned before.

The governance principle here is the same as deployment: human decisions bookend the agent's lifecycle. A human defines the scope when the agent launches. A human closes the seat when the seat is not earning its place. The agent does not retire itself. The named owner makes that call, documents it, and redistributes the work.

Camp B's "kill switch" framing is not cold or dismissive. It is the same principle. The switch exists because a human pulls it. The accountability for what happens after the switch is pulled belongs to the human who pulled it, not to the agent that stopped.

## What this means for the CHRO role

Korn Ferry found that 42% of CHROs are prioritizing AI investment for HR, and only 5% feel fully prepared. The readiness gap is not primarily a technology gap. It is a governance design gap.

The CHRO who builds the right framework will not be the one who applies the most HR language to agents. It will be the one who builds the clearest accountability architecture: named owners before deployment, measurable seats from day one, observable outputs reviewed on cadence, and human-retained authority over retirement decisions.

Bersin's Superworker framing describes individuals who use AI to dramatically enhance their productivity and performance. The CHRO's job is to create the conditions where that enhancement is actually trackable, auditable, and correctable. Not by treating agents like employees. By treating accountability like the scarce resource it is and making sure every seat on the chart, human or agent, has a human who owns it.

At Sneeze It, agents carry the operational work. Radar runs the morning briefing. Arin manages the call center coaching cadence. Crystal tracks project delivery. Pulse monitors client health. Pepper handles email triage. Nick runs cold prospecting. The humans, Bogdan as COO, Janine in accounting, Kristen in creative direction, are free to do the work that requires judgment, relationships, and authority. That is the outcome the governance framework is supposed to produce. Agents carry the load so people are free for the work that matters. Governance is what keeps the carrying honest.

The CHRO who builds that architecture earns their seat at the strategy table. The one who skips it will spend the next two years wondering why the agents keep drifting.

## See the live chart

Query the Sneeze It org chart via the OTP MCP to see which seats are agent-owned versus human-owned, who holds named accountability for each agent seat, and how the lifecycle is structured from deployment to retirement.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the sneeze-it org chart and identify which seats are agent-owned, who the named human owner is for each, and whether any seats have been retired."*

You will see a live accountability architecture, not a slide deck about one.
