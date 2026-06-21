---
title: Operations is where AI actually pays off, and the COO is the reason why
date: 2026-06-21
author: David Steel
slug: why-operations-is-where-ai-actually-pays-off
type: founder_essay
status: published
series: ai-coo
series_part: 46
description: Most AI investment chases the front of the funnel. The real payoff is in operations, where repetition is highest and the COO already owns the system.
---

# Operations is where AI actually pays off, and the COO is the reason why

Every founder I talk to who is experimenting with AI has a similar story. They started with a marketing use case, a sales use case, maybe a customer support chatbot. The results were interesting. The ROI was hard to pin down.

Then at some point they put agents on an operational process. Something with repetition and structure and clear outputs. And the results were different in kind, not just degree.

That is not an accident. It is a structural fact about where agents perform, and it leads directly to a claim I want to make plainly: operations is where AI actually pays off, and the COO is the natural owner of the system that captures it.

## Why the front of the funnel disappoints

The places where most companies deploy AI first, content generation, sales prospecting, ad creative, are high-variance by nature. The judgment required is aesthetic, strategic, or relational. A piece of content either lands or it does not. A cold email either opens or it does not. The signal is noisy, the iteration cycle is long, and the agent's contribution is hard to isolate from a dozen other variables.

That is not a reason to avoid AI in those functions. It is a reason not to expect AI to transform them in a quarter.

Operations is different. The signal is clear. The repetition is high. The outputs are measurable on short cycles. When an agent runs an operational process well, you see it within days, not quarters, because the baseline is well understood and the delta is visible.

Accenture has put this directly: reinvent the process before you automate it. The point is not to make inefficiency run efficiently. Fix the process, then add the agent. That sequencing is only possible when someone owns the process end to end, and that person is the COO.

## What operations actually contains

Operations is the largest surface area in most companies. It is everything that happens repeatedly and needs to happen consistently: the morning briefing, the KPI scorecard, the ad account scan, the project status check, the inbox triage, the billing cycle, the call center performance review.

Every one of those activities has the same property: it must be done on a cadence, the steps are knowable, and the output goes somewhere specific. That is the profile of work that agents perform at a fundamentally different cost and reliability level than humans.

At Sneeze It, the operational surface includes things like this. Radar compiles the morning briefing every day: Slack, Google Calendar, the sales pipeline, the inbox, the project tracker, the ad data, all pulled and compiled before anyone opens a browser tab. Radar does not need to be reminded. It does not miss a morning because it had a hard night.

Tally pushes KPI scorecard values to the org chart four times a day. The moment a number changes at the source, the chart reflects it. Janine, our accounting human, does not spend time pulling numbers. The numbers arrive on her desk and she applies judgment to them.

Dash scans more than thirty ad accounts across Meta and Google every morning, compares every number to yesterday, the seven-day average, and the thirty-day median, flags anomalies above defined thresholds, and writes a structured briefing file. That used to be a multi-hour manual process. Now it is an automated scan that surfaces exactly the things that need human attention and suppresses the rest.

Crystal monitors the active project list in Accelo, flags anything running late or missing tasks, and surfaces the flags in the morning briefing. Bogdan, our COO, does not spend Tuesday morning asking each team lead for a status update. He reads what Crystal surfaced and applies judgment to what matters.

None of those seats are doing creative work. None are making strategic decisions. All of them are making the humans around them dramatically more effective by carrying the coordination and the data work so the humans can carry the judgment.

That is the operations payoff.

## The COO is the natural owner because operations is already their domain

The CIO often gets framed as the AI owner, the person responsible for the technology and the governance. But governance is not the same as operating model. Deloitte's 2026 State of AI in the Enterprise, surveying more than 3,200 companies, found that only 21 percent have a mature governance model for agentic AI. The gap is not technical. It is organizational. Companies that have senior leadership actively shaping AI governance get significantly more business value than those delegating to technical teams alone.

The COO is positioned to close that gap in a way no one else is. Not because the COO is more technical, but because the COO already owns the processes the agents need to run inside.

The COO knows where the repetition lives. The COO knows which handoffs break down under pressure. The COO knows which human seats are spending most of their time on work that follows a clear rule, and which seats require genuine judgment. That knowledge is the prerequisite for deploying agents well, and the COO already has it.

McKinsey has framed the new management challenge as managing systems of people and agents together. That is a description of the COO's job title with agents added to the mix. The COO has always been the person responsible for systems that run on people. Adding agents to those systems does not change the ownership. It changes the tools.

## The process has to be right before the agent goes in

The structural requirement that unlocks the operational payoff is one that every COO already understands: the process has to be right before you add another resource to it.

Put a human into a broken process and you get a frustrated human. Put an agent into a broken process and you get a machine producing the wrong output at scale, reliably, around the clock, without noticing that anything is wrong.

This is not a theoretical caution. We lived it. Early iterations of our operational agents inherited process steps that had not been examined closely in months. The agents executed those steps faithfully. The output was structured, consistent, and occasionally useless, because the steps themselves were not producing what the downstream seat needed.

The fix was never about the agent. The fix was about the process. Once the process was right, the agent ran it better than any human could on volume and consistency. But that sequence mattered: process first, then agent.

The COO is the person who can force that sequence. The COO can say, before we add an agent here, let us make sure the process we are handing it is actually worth running at scale. No other executive in the company is positioned to make that call across the full operational surface. The CTO can make it for infrastructure. The CFO can make it for finance. The COO can make it for everything that runs the business day to day.

## The hybrid chart is how you capture the payoff

The mechanism for capturing the operational payoff is not a technology decision. It is an organizational one. Every operational process needs one seat that owns it, one metric that measures it, and one person accountable when the metric drops.

At Sneeze It, that means Bogdan's name is on the chart next to Radar, Dash, Tally, Crystal, and Arin. Not because Bogdan built them or manages their code. Because Bogdan is accountable for the operational outcomes those seats contribute to. When Dash's numbers drop below target, the conversation about why lands on Bogdan's agenda the same way a conversation about a human direct report landing below target would.

One seat, one owner. The owner can be a human or an agent. The discipline is the same.

When agents carry the operational work, humans on the chart are freed for the work that requires what agents cannot provide: relationship judgment, strategic context, and the kind of accountability that comes from actually caring about the outcome. Janine does not pull reports. She reads reports and decides what to do. Bogdan does not chase status updates. He reads Crystal's flags and decides which risks to address today.

The payoff is not that the agents replace the humans. The payoff is that the humans spend their time on the work that actually matters, and the agents spend their time on everything upstream of that.

That is the operational payoff. And the COO is the executive who has to build the chart, own the seats, fix the processes before the agents touch them, and keep the human judgment in the decisions that deserve it.

Operations is where AI pays off. The COO is why.

## See the live chart

The hybrid chart at Sneeze It, with human and agent seats running on a single scorecard, is queryable from OTP's MCP server.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the org chart for sneeze-it and tell me which seats are agents running operational processes."*

The response shows exactly how the operational and human seats sit on the same chart, with one owner per seat and one metric per row.
