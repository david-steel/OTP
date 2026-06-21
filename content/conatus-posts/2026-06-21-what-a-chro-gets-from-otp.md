---
title: Five things a CHRO gets from OTP that no HR system was built to give
date: 2026-06-21
author: David Steel
slug: what-a-chro-gets-from-otp
type: founder_essay
status: published
series: ai-chro
series_part: 49
description: OTP gives CHROs five things no legacy HR system built for a human-only workforce can deliver in the agent era.
---

# Five things a CHRO gets from OTP that no HR system was built to give

Every HR system in your stack was designed for a workforce made entirely of humans.

That assumption held for decades. It does not hold now. Korn Ferry surveyed 15,000 employees across 15 markets in 2025 and found that 42% of CHROs are already prioritizing AI investment for HR. Only 5% feel fully prepared. The gap is not caused by slow thinking. It is caused by a category mismatch. The tools your function relies on were built for a different kind of workforce than the one you are now responsible for governing.

OTP -- Organization Transport Protocol -- is an accountability and org design platform built from the start to hold both humans and agents on the same chart. It does not replace your HRIS. It solves the five structural problems your HRIS cannot solve because those problems did not exist when your HRIS was written.

Here is what a CHRO specifically gets from it.

## 1. A single org chart that holds human and agent seats without treating them as different things

Most CHROs managing a hybrid workforce right now are maintaining two parallel systems. The HRIS holds the human headcount. A separate document, spreadsheet, or tool inventory tracks the agents. The two systems do not talk to each other. The accountability relationships between them are implied, not designed.

OTP holds one chart. Every seat on the chart has a role, a metric, a named human owner, and a seat type. Humans and agents occupy seats the same way. The chart does not segregate them onto different surfaces or use different design logic for each.

At Sneeze It, Bogdan holds the COO seat. Janine holds the accounting seat. Kristen holds the creative director seat. On the same chart: Radar holds the chief-of-staff seat. Dash holds the ad analytics seat. Dirk holds the sales pipeline seat. Tally holds the KPI accuracy seat. Pulse holds the client retention seat. Pepper holds the email triage seat. Crystal holds the project delivery seat. Arin holds the call center management seat. Nick holds the cold prospecting seat.

The chart does not announce which seats are human and which are agent. It announces what every seat is accountable for and who owns it. That is the only distinction that matters for governance.

A single chart where the accountability structure is explicit is what the CHRO needs to govern a hybrid workforce. Your current HRIS cannot produce it because it was not built to hold agent seats.

## 2. Named human ownership for every agent seat, enforced by structure not policy

Here is where the most important research finding lands directly on a practical product requirement.

The 2026 HBR and BCG research found that when organizations anthropomorphize AI agents -- treating them as employees with stakes in outcomes, assigning them accountability as if they were professionals -- the result was reduced individual accountability, increased unnecessary escalation, and lower review quality. The prescription from that research is specific: scoped permissions, audit logs, named human owners, and governance discipline, not HR onboarding and performance reviews with the agent.

MIT SMR put it plainly: agentic AI cannot be accountable for its decisions. The deploying human is.

OTP enforces this structurally. Every agent seat requires a named human owner before the seat goes live. The human owner is not a field you can leave blank or a policy you have to remind people to follow. It is required by the design of the chart. If there is no named human owner, the seat is not complete.

This is the synthesis between what both camps of researchers are pointing at. The discipline that Camp A calls for -- scorecards, observability, cadenced review -- and the governance Camp B calls for -- named owners, bounded scope, human accountability -- are not in conflict. They are the same requirement stated from different angles. Every agent seat needs a measured seat with a named human owner. OTP builds that requirement into the structure of the chart rather than into a compliance checklist someone has to remember to check.

When Jeff, a data integrity agent at Sneeze It, was retired in April, that retirement was a human decision made by a named owner through a documented process. A retirement hearing was held. Every capability Jeff held was redistributed to a named seat. The record was kept. The agent did not advocate for its own survival. The accountability was never his. That is not a policy outcome. It is a structural one.

## 3. Scorecard rows that measure agents in business-outcome language alongside human rows

HBR Analytic Services surveyed 603 leaders in late 2025 and found that only 6% fully trust agents with core processes. The trust deficit is partly self-inflicted. When agents are measured in runtime metrics -- tasks completed, messages processed, tokens consumed -- no one can connect the agent's activity to the business outcome it is supposed to move. The gap in trust reflects the gap in language.

OTP links every seat to a scorecard row written in business-outcome language. The row is defined before the seat is filled. The row lives on the same scorecard surface as every human row on the chart.

At Sneeze It, Tally's scorecard row measures KPI chart accuracy and push cadence. Nick's row measures validated named-individual cold drafts per day. Dash's row measures alert precision and pattern detection rate. These rows sit next to Bogdan's operational throughput rows and Janine's receivables numbers on the same chart, reviewed on the same cadence, in the same Monday meeting.

SHRM's 2026 state of AI in HR report found that AI is 5.7 times more likely to shift job responsibilities than to displace them. The shift lands on the humans who own the seats adjacent to the agents. The CHRO needs to see that adjacency clearly to govern it. A unified scorecard in business-outcome language is the surface that makes it visible.

## 4. A structured seat exit process with a written record

No legacy HR system has a workflow for retiring an agent seat. They have offboarding for humans: final pay, access revocation, documentation of knowledge transfer. They have deprecation notes for software. What they do not have is a governed process for deciding that an agent seat no longer earns its place, redistributing its capabilities to named receiving seats, and keeping a written record of the decision and the reasoning.

OTP provides that structure. A seat retirement documents the date, the rationale, the capabilities held by the seat, the receiving seats and owners for each capability, and the decision-maker.

This matters to the CHRO for two reasons. First, agent seat exits are governance events. They involve scope changes, capability transfers, and accountability reassignments across the hybrid org chart. A written record is the audit trail that proves the exit was a human decision, not a system drift. Second, a documented seat exit is the reference point for the next seat design conversation. When Jeff's seat was retired and his three capabilities were redistributed to Dash, Dan, and other receiving seats, that redistribution created the record of what the next seat design should not replicate.

The Gartner research from mid-2025, reported via RCR Wireless, projects that more than 40% of agentic AI projects will be canceled by 2027. Most of those cancellations will happen without a governance record. The organizations that retain the record learn from the cancellation. The ones that do not have to relearn the same thing the next time they deploy.

## 5. An MCP interface that makes the workforce chart queryable from any AI tool

The four things above are structural. This one is operational, and it compounds the value of the first four.

OTP publishes your org chart through a Model Context Protocol server. Any AI tool that supports MCP -- Claude Desktop, Cursor, any MCP-enabled client -- can query the chart directly. That means any AI tool with access to the OTP MCP can answer workforce questions with live chart data rather than with stale documentation.

Who owns accountability for the Dirk seat right now? What is the metric on the Crystal seat? Which seats are agent-held versus human-held? What does the accountability structure look like for seats that have no human peer on the chart? Which seats are below target this week? These questions are answerable in real time from the MCP interface without opening a dashboard, reading a doc, or asking a human to pull a report.

Deloitte's 2025 Global Human Capital Trends research found that managers spend roughly 40% of their time on administrative work versus 13% on people development. The MCP interface compresses the administrative overhead of workforce questions so the CHRO's attention goes to the work that requires judgment. Let agents carry the operational work -- including the work of answering routine workforce visibility questions -- so people are free for the work that matters.

The five things a CHRO gets from OTP are not features stacked on top of HR infrastructure that was not built for this problem. They are structural solutions to problems that did not exist five years ago and that no HR system built five years ago was designed to solve. A single chart for a hybrid workforce. Enforced human ownership for every agent seat. Business-outcome scorecard rows reviewed on a shared cadence. A governed exit process with a written record. And a queryable interface that makes the whole structure accessible to every AI tool in the org.

The mandate is new. The tools need to match it.

## See the live chart

The Sneeze It org chart, including seat types, named human owners, and scorecard metrics for both human and agent seats, is queryable from the OTP MCP.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me which seats on the Sneeze It chart are agent-held, who owns each one, and what metric each is measured on."*

The accountability structure this post describes is live and queryable in that response.
