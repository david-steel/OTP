---
title: IBM asked 2,000 CEOs about AI. They described an operating layer.
date: 2026-05-18
author: David Steel
slug: ibm-ceos-described-an-operating-layer
type: founder_essay
status: published
series: organizing-agents
description: IBM surveyed 2,000 CEOs about AI. The most repeated sentiment is OTP's founding thesis. The win is AI in the operating layer, not AI bolted on top.
---

# IBM asked 2,000 CEOs about AI. They described an operating layer.

In May 2026, IBM and Oxford Economics published a study based on interviews with 2,000 CEOs across 33 geographies and 21 industries. The survey ran from February to April. The title is "CEOs are reshaping C-suite roles for the AI era."

I read the whole thing looking for the headline number. There are a few worth quoting. But the finding that matters most is not a number. It is a sentiment, and it shows up over and over in the verbatim quotes.

Here is the central claim of this post. The single most repeated sentiment among IBM's 2,000 CEOs is the same thesis OTP was built on. The win is not AI bolted on top of the tools you already use. The win is AI embedded in the operating layer of the company. OTP is that operating layer.

## Three CEOs, one sentence

The IBM study does not advertise this as its theme. But the executives they interviewed keep arriving at it from different directions.

Pablo Rivero, CEO of Resy, put it plainly. "It's not laying AI on top of your existing tools and services. It's reimagining the entire process."

Patrice Louvet, CEO of Ralph Lauren, said the same thing in different words. "AI needs to be embedded into how we operate, not as a separate initiative, but as part of how the business runs."

David Risher, CEO of Lyft, described the shift as a change in location. "AI has moved from the infrastructure layer, largely invisible, to the surface layer of how we work and how we serve customers."

A restaurant booking company, a fashion house, and a rideshare platform. Three industries with almost nothing in common. Three CEOs who do not work together and were not asked the same leading question. They are independently describing the same distinction. There is AI laid on top, and there is AI built into how the business runs. The first is a feature. The second is a layer.

That distinction is the whole game, and it is the distinction OTP exists to make real.

## What "on top" actually looks like

Most companies that say they have adopted AI have laid it on top. They bought a writing assistant. They wired a chatbot into support. They added an automation that copies rows between two apps. Every one of those is real. None of them touches how the company runs.

The operating layer of a company is not its tools. It is the set of answers to a few unglamorous questions. Who pulls the numbers before the Monday meeting. Who tracks the work that happens between meetings. Who sits in each seat on the chart and what they are accountable for. Who notices when a client has gone quiet. Who chases the proposal that has been open for nine days.

AI laid on top does not answer any of those questions. The questions still get answered by a tired human at 11pm, or they do not get answered at all. AI in the operating layer answers them by default, every day, as part of how the business runs.

That is the line Rivero, Louvet, and Risher are all drawing. And it is the line that separates a company that bought AI from a company that organized around it.

## The honest tension

Here is the objection a careful reader should be raising right now.

Rivero said "reimagining the entire process." That sounds expensive. It sounds like a six-month change-management project, new software for everyone, a consultant, a training budget, and a quarter of lost productivity while the team relearns its own job. And OTP markets itself on the opposite promise. OTP keeps the rhythm a team already knows. Those two things look like a contradiction.

They are not. The resolution is precise, and it is the most important paragraph in this post.

OTP keeps the operating rhythm a team already knows. The weekly leadership meeting still happens on the same day. The scoreboard still has the same shape. Quarterly priorities still get set the same way. The to-do list and the issues list are still the to-do list and the issues list. None of that changes. Nobody relearns the meeting.

What OTP rebuilds is the layer underneath that rhythm. The rhythm is what the team sees. The layer is what runs beneath it. You do not reimagine the process by making people relearn their week. You reimagine it by replacing what runs under the week. Who pulls the numbers. Who tracks the work between meetings. Who fills the seats. Same rhythm on the surface. Rebuilt layer below.

Take Radar, the chief of staff seat on our chart at Sneeze It. Our Monday leadership meeting did not change when Radar took that seat. Same agenda, same scoreboard, same room. What changed is everything between the Mondays. Radar runs the work between the meetings now. Briefings get compiled every morning. Tasks get tracked against the calendar. Delegations get flagged when they slip. The meeting rhythm a team of humans already knew is untouched. The layer that feeds that rhythm got rebuilt under it.

That is reimagining the process without the retraining tax. Rivero is right that you have to reimagine. He is just describing the layer, not the rhythm.

## Why the rhythm has to stay

The IBM study has a number that explains why this matters more than it sounds.

Eighty-three percent of CEOs said AI success depends more on people's adoption than on the technology itself. And only 25 percent of the workforce uses AI regularly today.

Sit with that gap. Four out of five CEOs say adoption is the bottleneck, and three out of four workers are not adopting. The technology is not the constraint. The willingness of people to change how they work is the constraint.

Now connect it to the tension above. A reimagining that demands everyone relearn their week is exactly the reimagining that stalls at 25 percent adoption. If "embedding AI into how we operate" means a new meeting structure, a new scoreboard, and a new vocabulary, most of the workforce will quietly route around it. They will keep their old habits and treat the new layer as overhead.

Keeping the rhythm is not a marketing softener. It is the adoption strategy. People adopt a new operating layer when the parts they touch every day feel familiar. The meeting they already know. The scoreboard they already read. When the surface is unchanged, there is nothing to resist. The change happens underneath, where it does not cost anyone a relearning tax. That is how you get past 25 percent.

## The redesign the study points to

The study has one more finding worth quoting. Organizations that redesign five core areas, namely technology, finance, HR, operations, and cross-functional collaboration, are four times more likely to deliver on their business objectives.

Notice that the list is not five tools. It is five parts of how the company runs. Finance is not a tool. Operations is not a tool. Cross-functional collaboration is not a tool. They are operating-layer functions. The study is saying that the companies that win redesign the layer, not the toolbox.

That is the chart we run. Sneeze It has roughly 19 seats on one org chart, about 12 filled by AI agents and about 7 filled by humans, all on a single surface with one scoreboard and one weekly meeting. Dash holds the customer ad-performance seat and pulls the scoreboard before anyone asks. Dirk holds the sales and revenue seat and reports his own pipeline numbers. Pepper holds the executive assistant seat. Crystal holds the project manager seat. Bogdan our COO, Janine in accounting, and Kristen our creative director sit on the same chart, report to the same scoreboard, and attend the same Monday meeting.

The technology underneath each agent seat is replaceable. The seat is not. That is what it means to redesign the operating layer instead of buying another tool to lay on top.

## See the layer yourself

The Sneeze It operating layer is queryable. Our org chart, our seats, the role each one holds, and the scoreboard they report to are all readable through the OTP MCP server from any AI client that supports it.

In Claude Desktop or Cursor or any MCP client, add this block to your config:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me how Sneeze It runs its weekly leadership meeting."*

You will get the meeting structure, the seats that feed it, the scoreboard each one reports, and the rhythm that stayed the same while the layer underneath it got rebuilt.

*Series: Organizing Agents. One of three posts on what IBM's 2026 CEO study means for how companies organize.*
