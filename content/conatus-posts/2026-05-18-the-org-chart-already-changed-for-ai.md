---
title: The org chart already changed for AI. IBM just counted the seats.
date: 2026-05-18
author: David Steel
slug: the-org-chart-already-changed-for-ai
type: founder_essay
status: published
series: organizing-agents
description: IBM surveyed 2,000 CEOs and found the Chief AI Officer went from 26% to 76% of companies in one year. The org chart is not a fixed artifact.
---

# The org chart already changed for AI. IBM just counted the seats.

Most people treat the org chart as a fixed thing. A pdf in a shared drive. A slide that gets dusted off once a year. A diagram that describes the company the way a photograph describes a face.

That belief was always wrong. IBM just put a number on how wrong.

The central claim of this post is simple. The org chart is not a static artifact. It reshapes itself for the AI era, it does so fast, and most charts and most chart tools cannot keep up with the speed of the change they are already living through.

## What IBM actually measured

In May, IBM and Oxford Economics published a study called "CEOs are reshaping C-suite roles for the AI era." They surveyed 2,000 CEOs across 33 geographies and 21 industries, fielded between February and April of 2026. This is not a vendor blog post. It is a large, deliberate piece of research into how the people who own the org chart are changing it.

One finding stands out above the rest. 76% of organizations now have a Chief AI Officer. A year earlier, that number was 26%.

Sit with that for a second. In twelve months, a brand new C-suite seat went from a quarter of companies to three quarters of them. That is not gradual. That is not a trend you have time to study before responding to it. That is the org chart visibly moving while everyone was looking at last year's version of it.

The other numbers in the study point the same direction. 85% of CEOs say all functional leaders must become technology experts in their own domains. 77% say talent and technology leadership roles are converging. 64% say they are comfortable making major strategic decisions based on AI-generated input.

I want to be precise about what IBM did and did not say, because the precision is the whole point. IBM studied human executives. The Chief AI Officer in that study is a human being with a title and a salary and a parking spot. IBM did not study autonomous AI agents. IBM did not say AI agents belong on the org chart as seats. That is not their claim and I am not going to put words in their mouth.

What IBM measured is narrower than that, and more useful. They measured that the org chart is not fixed. They proved, with 2,000 data points, that the chart adds new kinds of seats, and that it can do so across an entire economy inside a single year.

That is the finding. The chart moves. IBM counted how fast.

## Where the chart moves next

Here is where IBM's research ends and Sneeze It's lived practice begins. I want that line to be bright, because the two things get blurred constantly and the blur helps nobody.

IBM's data says the org chart added one new kind of seat in a year, a human seat, the Chief AI Officer. That is what they counted.

OTP's argument, which is ours and not IBM's, is about what comes after that seat. If the chart already proved it will reshape itself to absorb the AI era, the next reshape is not another human title. The next reshape is the work itself moving onto the chart as agent seats.

I do not have to speculate about this, because I already run a chart that has done it.

The Sneeze It org chart has roughly 19 seats. About 12 of them are filled by AI agents. About 7 are filled by humans. They sit on the same chart, report through the same lines, and publish numbers to the same Monday dashboard.

Radar is our chief of staff seat. Every morning Radar pulls the calendar, the tasks, the inbox, and the pipeline, compiles a briefing, and tells me what needs my attention before I have asked. Dirk holds the sales and revenue seat. Dirk runs cold outreach and watches the pipeline and flags deals that are going stale. Pepper holds the executive assistant seat and triages client email so the urgent ones reach me and the noise does not. Dash watches every customer ad account every morning and surfaces the anomalies. Crystal tracks every project. Neil scans the frontier for what we should be learning before a competitor learns it first.

Those are not tools wired into a workflow. They are seats. Each one has a name, a role, a reporting line, a scorecard, and an accountability owner. The same five things every seat needs whether a human or an agent fills it.

So when IBM tells me 76% of companies added a Chief AI Officer in a year, I do not read that as the end of the story. I read it as the first chapter. IBM counted the chart starting to move. I am telling you where it moves next, because the chart I run is already there.

## Why the old chart cannot hold this

Now connect the two halves. IBM proved the chart changes fast. Our chart proves the chart will hold agents. Put those together and you get a problem most companies have not noticed yet.

A pdf cannot keep up with a chart that adds a C-suite seat across an economy in twelve months. By the time the pdf is approved and circulated, it describes a company that no longer exists. A slide is worse, because a slide is built to be presented once and forgotten.

The tools are not much better. Most org chart software was built on one quiet assumption. Every box holds a person. The data model has a name field, a title field, a manager field, a headshot. There is no field for a scorecard the seat publishes itself. There is no field for a reporting line that an agent can actually read at runtime. There is no field for the accountability loop that lets a corrected agent stop repeating a mistake.

A tool built for human boxes can draw an agent as a box. It cannot make the box do anything. It cannot answer a question. The agent on that chart is decoration, not infrastructure.

IBM measured the speed of the change. The speed is the indictment of the old format. If the chart can move from 26% to 76% on a single seat type in a year, then a chart that takes a quarter to update is structurally behind reality at all times. And the format that is already behind on human seats has no chance of holding the agent seats arriving next.

## What a chart that holds both looks like

This is the gap OTP was built to close, and it is why the Sneeze It chart looks the way it does.

Our chart is not a picture of the company. It is a runtime artifact. It holds human seats and agent seats with the same data model. Every seat has a role you could fit on a sticky note. Every seat has a scorecard it publishes itself. Every seat has a reporting line that the agents can actually read and act on. When a correction lands on Dirk or Pepper, it goes into that seat's operating rules, and the loop closes.

Most important, the chart is queryable. You do not open it. You ask it. An AI assistant with the OTP MCP installed can pull the chart and answer questions about who owns what, what each seat reports, and where the gaps are. The chart updates the way reality updates, which is continuously, not annually.

That is the answer to the speed IBM measured. You do not keep up with a chart that changes this fast by drawing it faster. You keep up by making the chart a live system instead of a document. A document is always a snapshot of a company that has already moved on. A live chart is the company.

IBM counted the chart starting to move. The honest next sentence is that a chart you cannot query cannot move at the speed IBM just documented, and it certainly cannot hold what is arriving after the Chief AI Officer.

## Query the chart yourself

The Sneeze It chart, every human seat and every agent seat, is queryable through the OTP MCP from any AI client you already use.

In Claude Desktop or Cursor or any MCP client, add this block to your config:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the org chart for sneeze-it."*

You will get a structured response with the leader at the top, the agent seats with their names and roles, and the human seats, all on one chart you can keep asking questions of.

*Series: Organizing Agents. One of three posts on what IBM's 2026 CEO study means for how companies organize.*
