---
title: "Business process management: what it is and how to run it"
date: 2026-06-21
author: David Steel
slug: business-process-management
type: founder_essay
status: published
series: operating-system
series_part: 15
description: Business process management is the discipline of documenting, running, and improving how your company does recurring work. Here is how to actually do it.
---

# Business process management: what it is and how to run it

Business process management is the discipline of documenting, running, and improving how your company does recurring work. If your team repeats a task more than once a week, that task is a business process and it belongs in a system, not someone's head.

Most small and mid-size businesses get this backwards. They build the process in practice, let it live in one person's muscle memory, and then wonder why scaling is so hard. This post covers what business process management actually means, how to document a process correctly, what kinds of processes to track, and how to use SOPs and process maps to run a tighter operation.

## What is business process management

Business process management (BPM) is a formal approach to identifying, documenting, executing, monitoring, and improving the recurring workflows inside a business. It treats a business as a collection of repeatable processes rather than a collection of individual tasks.

The distinction matters. An individual task is "Bogdan wrote the monthly billing report." A business process is "the billing report is produced every month, by the operations seat, from these three data sources, in this format, delivered by the 5th." When a process is documented, anyone who sits in that seat can execute it. When it lives only in Bogdan's head, you have a dependency, not a system.

BPM is not a software category or a certification. It is a management practice. The software helps. But the discipline comes first.

A working BPM practice has three stages that cycle continuously. Document: write down what the process is and how it runs. Execute: run the process according to the documentation. Improve: review results, find friction, update the documentation. Repeat.

The reason most businesses never complete this cycle is that they document once, skip the improve step, and let the documentation go stale. A process doc that does not reflect how the work actually runs today is worse than no doc at all, because it creates false confidence.

## How to document a business process

Documenting a business process well requires answering five questions: who owns it, what triggers it, what are the steps, what is the expected output, and what does failure look like.

**Owner.** Every process has exactly one owner. Not a team. Not a department. One seat. The owner is responsible for executing the process and for keeping the documentation current. If the owner changes, the first act of the new owner is to verify the doc.

**Trigger.** What starts this process? A date (the 1st of the month), an event (a new lead enters the CRM), a threshold (ad spend crosses 80% of budget), or a request (client submits a revision). The trigger is what activates the process. Without a clear trigger, the process runs on hope.

**Steps.** Write the steps at a level of detail a competent person new to the seat could follow. Not so granular you are writing a script. Granular enough that two people executing independently would produce the same output. Number the steps. Flag any decision points: "If X, go to step 4. If Y, go to step 7." Flag any handoffs: "At this step, the output goes to Janine in accounting."

**Expected output.** What does done look like? A report in a specific format. A task marked complete in the project management system. A message sent to a specific channel. Define it. Outputs without definitions cannot be QA'd.

**Failure signals.** What would tell you the process ran wrong? A number out of range. A file missing. A delay past a defined deadline. Write the failure signals down. They become your process audit checklist.

Once you have these five pieces, you have a process document. Not a great one yet, but a working one. You improve it by running it and correcting errors.

## List of business processes

Most businesses have more processes than they realize. The first step in a BPM implementation is an audit: list every recurring action the business performs.

Group them by function. Here is a representative list organized by area.

**Revenue and sales:** lead intake, lead qualification, proposal creation, contract execution, onboarding new clients, offboarding churned clients, renewal outreach.

**Finance:** monthly invoicing, accounts receivable follow-up, payroll, expense approval, cash flow reporting, annual audit preparation.

**Delivery and operations:** client reporting, project kick-off, scope change management, quality review, project closeout documentation.

**Marketing:** content publishing, social post scheduling, campaign launch, campaign performance reporting, email list hygiene.

**People:** new hire onboarding, performance review cycle, offboarding, timesheet approval, PTO request processing.

**Systems and data:** weekly data backup verification, software license audit, CRM hygiene, reporting accuracy review.

At Sneeze It, AI agents own a large share of this list. Tally pushes KPI values to the scorecard four times a day, a process that used to require a human to pull numbers and update a spreadsheet. Arin generates daily performance summaries for our call center team. Dash scans ad accounts across Meta and Google every morning and writes a brief. These are business processes. The seat owner happens to be an agent rather than a human, but the process documentation requirement is identical.

If your seat can be filled by an agent, the documentation you write to train the agent is your SOP. That is not a coincidence. A well-written SOP is essentially a runbook an agent can execute. The discipline of writing one makes the other possible.

## SOP

A standard operating procedure (SOP) is the written form of a business process. It is the document that lives in your knowledge base, gets handed to new hires, and gets reviewed whenever the process changes.

An SOP has a different job than a project plan or a task description. A project plan covers a one-time initiative. A task description covers a single discrete action. An SOP covers a repeatable process that will run many times, executed by different people or systems, and must produce consistent output every time.

The format matters less than the discipline. Some teams write SOPs as numbered lists. Some use flowcharts. Some use video walkthroughs with a written summary alongside. Pick the format your team will actually reference. A beautiful SOP nobody reads is worse than a rough one everyone uses.

SOPs go stale if you do not build in a review cycle. A process that runs weekly should be reviewed quarterly. A process that runs monthly should be reviewed semi-annually. Assign the review to the process owner. Put it on the calendar. The review does not need to be elaborate: the owner runs the process, compares actual execution to the documented steps, and updates the doc where they diverge.

The hardest part of SOP culture is not writing the first version. It is building the habit of updating. Treat an outdated SOP as an operational risk. It is one, the same way an outdated runbook in an engineering team is an operational risk.

## Process mapping

Process mapping is the practice of drawing a process as a diagram rather than writing it as a list. It is useful for processes that have multiple branches, multiple owners, or significant handoff complexity.

A basic process map has four elements: steps (boxes), decisions (diamonds), handoffs (arrows between lanes), and outcomes (terminal boxes). When a process involves three people and five decision points, a map makes the structure visible in a way a numbered list cannot.

You do not need specialized software to draw a process map. A whiteboard works. A shared Google Doc with shapes works. The goal is to make the flow visible, not to produce a technically perfect artifact.

Process maps are especially useful at two moments: when you are designing a new process (drawing it reveals gaps before you execute it) and when you are troubleshooting a broken process (drawing the actual current-state process, not the documented one, often reveals where reality and documentation diverged).

A RACI matrix is a useful companion to a process map. RACI stands for Responsible, Accountable, Consulted, Informed. For each step in a process, the RACI defines who does the work (Responsible), who owns the outcome (Accountable), who needs to weigh in (Consulted), and who needs to know the result (Informed). It forces clarity on handoffs. When two people both think they own a step, a RACI makes the conflict visible before it becomes a dropped ball.

If you are running a business on EOS, the Entrepreneurial Operating System created by Gino Wickman, your process documentation work belongs in the People-Process-Data component of the business. EOS calls for documented and followed core processes as one of the Six Key Components. OTP works alongside EOS: the scorecard, accountability chart, and weekly meeting format in OTP give your documented processes a home where both humans and agents can be measured against them. For more on running the human-agent scorecard, see [Humans and agents on the same scorecard](/blog/humans-and-agents-on-the-same-scorecard).

The most common process mapping mistake is mapping the aspirational process instead of the current-state process. Map what actually happens first. Then map what you want to happen. The gap between the two maps is your improvement backlog.

## Frequently asked questions

**What is the difference between a business process and a business procedure?**
A process is the overall flow of work from trigger to output. A procedure is the step-by-step instruction for completing one specific part of that flow. A process might be "client reporting." A procedure is "how to pull data from Google Ads for the client report." Processes contain procedures. The terms are often used interchangeably in practice, and the distinction matters less than having both documented.

**How many processes should a small business document first?**
Start with the ten to fifteen processes that run every week and have the most consequence if they run wrong. Client invoicing, lead intake, delivery reporting. Once those are documented and stable, expand to monthly and quarterly processes. Do not attempt to document everything at once. You will document nothing well.

**What is the relationship between business process management and SOPs?**
Business process management is the practice. An SOP is one of the outputs of that practice. BPM tells you which processes to document, how often to review them, and how to measure whether they are running correctly. The SOP is the document that captures a single process in enough detail that someone new to the seat can execute it. SOPs without BPM go stale. BPM without SOPs stays abstract.

**Can AI agents run business processes?**
Yes. If the process has a clear trigger, defined steps, and a measurable output, an agent can run it. The documentation requirement is identical. Agents at Sneeze It run several recurring processes: daily ad account scanning (Dash), KPI value pushes to the scorecard (Tally), cold prospecting research (Dirk), and call center performance reporting (Arin). Each of those has a written process definition that works as both an SOP for human review and a behavioral specification for the agent. See [Adding an AI agent to your org chart is not configuration. It is hiring.](/blog/adding-an-agent-to-your-org-chart) for how we set those seats up.

**How do you know when a business process needs to be updated?**
Three signals: the output has degraded and the steps have not changed, the steps someone is actually following have drifted from what the SOP says, or the business context the process was designed for has shifted (new tool, new client type, new team structure). Any of these signals means the SOP needs a review and likely an update before the next execution.

## Run your operating system in OTP

OTP is a team chart where humans and agents share scorecards, rocks, and weekly meetings. Your documented processes connect directly to the seat that owns them, whether that seat is a person or an agent.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me which seats on my org chart own recurring processes, and flag any seat without a documented process owner."*

---

*Related: the tooling side of this discipline — [business management software](/blog/business-management-software) for running the operating cadence.*
