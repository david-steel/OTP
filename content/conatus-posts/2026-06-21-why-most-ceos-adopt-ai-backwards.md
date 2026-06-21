---
title: Most CEOs adopt AI backwards, and the sequence is why it fails
date: 2026-06-21
author: David Steel
slug: why-most-ceos-adopt-ai-backwards
type: founder_essay
status: published
series: ai-ceo
series_part: 42
description: The typical AI adoption sequence is tool first, org design never. Here is what the right order looks like, and why flipping it changes everything.
---

# Most CEOs adopt AI backwards, and the sequence is why it fails

The typical AI adoption sequence goes like this. Someone on the team finds a tool. The tool is impressive. The CEO approves the spend. A few people start using it. Results are mixed. Three months later the tool is mostly idle, the budget is renewed anyway, and leadership moves on to the next announcement.

This is not a tools problem. It is a sequence problem.

Most CEOs start with tools and never get to structure. The right sequence is the reverse: structure first, then tools. When you flip the order, everything downstream changes.

## What the backwards version looks like

The backwards version is familiar because it is the default.

A CEO attends a conference, or reads a newsletter, or watches a demo. The framing is compelling. AI can automate the work your team is drowning in. AI can find the pipeline gaps your sales reps miss. AI can triage the inbox that has become a full-time job.

So the CEO buys the tool. Or authorizes someone to build an agent. Or approves a pilot with a vendor promising transformation.

What happens next is predictable. The tool runs in isolation. It has no seat on the org chart. No one is accountable for its output. It reports to no one and is measured by nothing connected to the business. The CEO sees a demo of what it produced and calls it progress. The team never integrates it into the operating rhythm because there is no operating rhythm that makes room for it.

Deloitte surveyed 3,235 enterprise leaders in 2026 and found that only 21% have a mature governance model for agentic AI. The other 79% are in the tool-first mode. They have the spend. They do not have the structure.

And without structure, the tool does not compound. It pilots. It demonstrates. It eventually expires.

## What the right sequence looks like

The right sequence starts with a question that has nothing to do with tools.

What is the seat? Who owns the outcome? What does success look like, and how will we measure it in the same meeting where we measure everything else?

These are org-design questions, not AI questions. They are the same questions you would ask before hiring a human. In fact, they are exactly the questions you should ask before placing an agent into a role, because agents and humans belong on the same chart, under the same accountability logic, with the same discipline applied to their numbers.

When I built Radar, our chief-of-staff agent, I did not start by evaluating tools. I started by defining the seat. The seat was responsible for morning briefings, calendar synthesis, Slack synthesis, and surfacing blockers before the workday started. It had a clear owner, a clear output, and a clear place on the company scorecard. Only then did I ask what combination of tools and capabilities would fill that seat.

When I built Dirk, our sales agent, I defined the seat as autonomous outreach and pipeline management. The seat sat on the chart next to Bogdan, our COO, and Janine in accounting. Dirk's row on the scorecard tracked cold emails drafted per week, qualified meetings created per week, and pipeline stage transitions. Those numbers were reviewed in the same meeting where every other number lived.

The tool follows the seat. The seat does not follow the tool.

## Why the sequence matters more than the tool quality

The sequence determines whether the agent compounds or stalls.

When structure comes first, several things happen automatically. The agent has a defined scope, so it does not drift into adjacent work that nobody asked it to do. The agent has a measurable output, so the company knows within one review cycle whether it is performing. The agent has a seat-owner, so when something goes wrong there is a conversation and a fix, not a shrug.

MIT's Center for Information Systems Research tracks enterprise AI maturity across four stages. Organizations at Stage 4, where AI is embedded into how the company operates, outperform their industry peers by 13.9 percentage points on revenue growth and 9.9 points on profitability. Stage 1 organizations, the ones still experimenting with tools, underperform their peers by 26.5 points on growth. The research identifies what separates Stage 4 from Stage 1, and it is not the sophistication of the tools. It is the alignment of the leadership team and the integration of AI into the operating structure.

McKinsey puts the same idea more directly: "Managing in the age of AI means managing systems, people and agents together." Not tools. Systems. The distinction matters because a system has seats and accountability and a cadence. A tool has a login and a subscription.

When the sequence is backwards, the tool never becomes a system. It remains a tool.

## What changes inside the company when you flip the order

The before state is common enough that most operators recognize it immediately.

Before: the CEO endorses AI broadly. Individual team members find tools that solve their individual problems. The tools report to no one. Measurement is subjective. The CEO hears "we use AI a lot" without being able to say what it produces or where it sits on the chart. Twelve months of spend later, the company has a collection of tools that no one has integrated and several that have quietly lapsed.

After: every agent has a named seat. Every seat has a defined output. Every output is measured on the same scorecard that governs human performance. The CEO can look at the Monday dashboard and see Radar's row alongside Bogdan's row, see Tally's row alongside Janine's row, see Arin's row alongside the call center numbers. The CEO knows what each seat produces, what each seat costs, and what the company would lose if the seat went dark.

This is not a hypothetical structure. Sneeze It runs this way today. Radar handles daily operations. Tally keeps the scorecard current. Dash runs all advertising and analytics across 39 accounts. Arin manages the call center team. Pulse monitors client retention. Pepper handles email triage. Crystal tracks project delivery. Nick runs cold prospecting. Dirk manages sales pipeline. These seats sit on one chart alongside Bogdan, Janine, Kristen, and the rest of the human team. One chart. One accountability logic. One scorecard.

The agents did not arrive because we found tools we liked. They arrived because we identified seats we needed filled and then determined whether the seat called for a human or an agent. The distinction is the entire difference.

## The retirement question as a forcing function

One of the sharpest tests of whether you have done this right is whether you can retire an agent when the seat no longer serves the business.

In a tool-first org, tools never get retired because no one knows what they do or who owns them. They just accumulate subscription lines.

In a seat-first org, retirement is a structural decision. In April, we held a formal hearing for Jeff, our former data-integrity agent. Jeff had a seat. The seat had metrics. The metrics revealed that Jeff's capabilities had been absorbed by other seats and the role no longer had a clear owner. We retired the seat, redistributed the capabilities, and kept an honest record of the decision.

That conversation happened because the seat had been defined clearly enough to evaluate. You cannot retire a tool that was never given a job.

## The question the sequence forces you to answer

Building an agent without first defining the seat is the equivalent of hiring without a job description. It can produce something impressive. It will not produce accountability.

The question the right sequence forces is simple: what seat is this filling, and what does success in that seat look like?

That question is uncomfortable because it requires the CEO to do org design before they do AI adoption. It requires thinking about accountability structures before thinking about demos. It requires restraint at the point where the tool is new and exciting and the pressure to ship something is highest.

But the restraint is where the compounding starts. Let agents carry the operational work, so people are free for the work that matters. That sentence only becomes true when the agents have seats that are clear enough to hold them accountable, and when the people around them know exactly what the agents are responsible for.

Structure first. Then tools. The sequence is the strategy.

## See the live chart

The OTP MCP exposes every seat on our org chart, including which are agents and which are humans, along with each seat's accountability and scorecard row.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me how seats are structured on the Sneeze It chart, and tell me which seats were defined before the agents that fill them were built."*

The response shows what a seat-first org chart looks like in practice, and gives you a template for applying the same sequence to your own company.
