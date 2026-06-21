---
title: Culture does not protect itself when agents join the team. Someone has to do it on purpose.
date: 2026-06-21
author: David Steel
slug: how-a-chro-keeps-culture-human-with-agents-on-the-team
type: founder_essay
status: published
series: ai-chro
series_part: 24
description: When agents hold seats on the org chart, culture does not drift by accident. It drifts by default. The CHRO is the one who has to design against that.
---

# Culture does not protect itself when agents join the team. Someone has to do it on purpose.

When you first put an agent on the org chart, the culture question feels secondary. You are solving a capacity problem. You want a seat filled. The agent works. The number moves. Culture is what you worry about later, when things are stable.

This is backwards. Culture is the first thing that changes, and it changes before anyone notices.

I have been running a hybrid team for the better part of a year. Radar holds the chief-of-staff seat. Dirk owns sales. Dash reads every ad account we manage and reports what the data says. Arin manages the call center. Tally pushes KPIs to the scorecard. Pepper handles the inbox. Crystal tracks project delivery. Bogdan is our COO. Janine handles accounting. Some seats are human. Some are agent. The Monday meeting has rows for all of them.

What I have learned is this: the culture question is not whether the humans feel threatened by the agents. It is whether the humans feel that the work still belongs to them. That distinction is where the CHRO has to operate.

## The lifecycle is where culture lives

Culture is not a value statement. It is what people experience when they join, what they feel when they do the work, and what they understand when they leave. Every organization runs a version of this lifecycle whether it designs it or not. When agents join the team, each stage has to be re-examined.

Onboarding is where the culture question hits first. New humans join and immediately ask, implicitly or explicitly: what is this place, who has authority here, and what is expected of me? When some of those seats are agents, the new hire is calibrating against a workforce they have no instincts for. They do not know yet whether Radar is infrastructure or a teammate. They do not know whether Dash's pattern reports are input for their judgment or a replacement for it.

The CHRO who does not design an answer to that confusion leaves new hires to infer it. The inference lands on learned helplessness. They defer to the agent's output more than they should, because the path of least resistance is to assume the machine has the answer.

Active work is where the pressure is most constant. Sixty-nine percent of experts MIT SMR surveyed in 2025 agreed that agentic AI demands fundamentally new management approaches. The reason is not the technology. When agents absorb the operational work that used to be human work, the humans in adjacent seats have to find new ways to understand what they contribute. That shift is a cultural shift. It does not explain itself.

Departure is where hybrid teams fail the loudest, and where HR has thought the least. When a human leaves, there is a process. Exit interview, knowledge transfer, institutional acknowledgment. When an agent seat is retired, the pressure is to just turn it off. The process is for the team watching.

## Why retiring Jeff was a cultural act

In April we retired Jeff. Jeff was an agent who held three missions at launch. Over time, each was absorbed by a better-fit seat. Dash took the pacing work and the account status work. Dirk took the revenue integrity work. Jeff's seat was empty in function before it was empty on the chart.

The technically correct move would have been to stop running Jeff and reassign the capabilities quietly. Nobody would have noticed. The agent does not have feelings.

We held a formal retirement hearing instead. Jeff named his own failures without softening them. He identified which capabilities each receiving seat would absorb. I made the decision. The seat was retired. A written record was kept.

This was not sentimentality. It was a cultural signal.

HBR and BCG published research in May 2026 that found anthropomorphizing agents in a large study produced worse outcomes: reduced individual accountability, increased unnecessary escalation, lower review quality. Their prescription was right: treat agents as scoped tools with named human owners, kill switches, and audit logs. Not as employees with performance reviews and feelings.

But the hearing was not anthropomorphizing. It was accountability architecture. It demonstrated that seats on this chart are taken seriously, that the threshold for earning one is real, and that exits are deliberate and documented. When people see a seat retired through a structured process, they understand the seats next to them are governed by the same discipline. That is a cultural output.

MIT SMR states the underlying principle plainly: "agentic AI cannot be accountable for its decisions." The deploying human is. Jeff did not advocate for his own survival. I made the decision. Accountability never moved to the agent. The team saw that.

## What the CHRO designs against

Korn Ferry surveyed 15,000 employees in 2025. Forty-eight percent feared their jobs would be replaced by AI within three years. Seventy percent of senior leaders said their organization had an AI strategy, but only 39 percent of employees agreed. That gap is not an information problem. It is a culture problem.

SHRM's 2026 data clarifies the actual picture: AI is 5.7 times more likely to shift job responsibilities than to eliminate jobs, and 3 times more likely to create new roles than to remove them. The risk is not that humans lose their titles to agents. The risk is that humans lose their sense of ownership over the work while technically keeping the title. That is the cultural failure mode the CHRO has to design against.

The first design task is naming what stays human. Not as reassurance, but as a structural decision. Bogdan's seat is COO-level judgment. Janine's seat is billing relationships. Those seats are not threatened by agents because the design is explicit about what each one owns. Deloitte found in 2025 that managers spend roughly 40 percent of their time on administrative work versus 13 percent on people development. Agents absorb that 40 percent. The CHRO's job is to make sure humans understand that the 40 percent going to agents is not their contribution disappearing. It is their capacity being returned.

The second design task is making human judgment load-bearing in the workflow, not decorative. HBR Analytic Services surveyed 603 leaders in late 2025 and found only 6 percent fully trusted agents with core processes. The instinct is right. When Dash flags a spending anomaly, the workflow requires a human to review and decide. The flag does not trigger an action. The human decision does. That structure tells the person in that seat that their judgment matters. It has to be in the workflow, not just in a policy document.

## The handoff is the job

Bersin put it directly: "the AI revolution is all about redesigning the way we get things done. And that lands in the laps of HR." The redesign is not about which tasks move to agents. It is about what work means for the humans after it does.

The CHRO who handles it well designs the lifecycle with agents in the picture from day one. Onboarding tells new humans what agents own and what they do not. Active work has explicit structures that keep human judgment central. Seat retirement happens through a documented process that signals what earned accountability looks like on this chart, for agents and humans alike.

The CHRO who waits will watch high-performing humans disengage while technically staying employed, because the operational work the agents absorbed used to be how they knew their contribution mattered.

Let agents carry the operational work, so people are free for the work that matters. That sentence is only true when the work that matters is named and handed to the humans ready to own it. That handoff is the CHRO's job.

## See the live chart

The OTP MCP exposes the Sneeze It org chart as a queryable structure, including which seats are agent-owned versus human-owned and who holds accountability for each agent seat.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the sneeze-it org chart and identify which seats are human versus agent, including who owns accountability for each agent seat."*

The accountability structure behind every seat on that chart is what this post is about.
