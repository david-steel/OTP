---
title: What a CEO is accountable for that an agent can never own
date: 2026-06-20
author: David Steel
slug: what-a-ceo-is-accountable-for-that-an-agent-cannot-own
type: founder_essay
status: published
series: ai-ceo
series_part: 3
description: The work agents genuinely cannot own at a CEO level, and what that clarification frees you to do with the hours you get back.
---

# What a CEO is accountable for that an agent can never own

Here is the framing I see most operators get wrong: they build agents to help them do more, and then they try to keep doing all of the same things they were doing before.

The agents help. The calendar does not change. The accountability does not shift. The CEO is still in every review, every standup, every fire. Just faster now, because they have better data.

That is not what agents are for.

The actual gain from agents is not velocity. It is clarity. When an agent takes a seat on your chart and owns the work in that seat, the space where you used to do that work becomes visible again. Empty. You can see it. And then the question becomes: what does the CEO actually need to be in that seat for, and what can I let go?

I have been building this out live at Sneeze It for about a year. We have around ten agents on the chart right now. Dirk runs agency sales outreach. Dash owns all the ad performance numbers. Radar runs daily briefings. Tally pushes KPI values to the scorecard automatically. Nick drafts cold prospecting emails for health and wellness. Arin manages the call center team through daily Slack coaching.

That is real operational work. None of it was eliminated. It moved seats.

So what is left on my plate? What stayed with me that genuinely cannot transfer?

This is the post about that question.

## Before: what the chart looked like when I was the operator

Before agents, I was the connective tissue of most of what happened. Every morning I was the one reading the pipeline and deciding what was stuck. I was pulling the ad numbers from platforms and trying to remember which clients were down and which were up. I was triaging the inbox and deciding what needed a response today versus next week. I was the one watching Proposify for signed deals and firing off the "tell Janine to bill this" message.

I was also the one trying to think about where the agency was going in twelve months. How the pricing structure held up. Whether the team we had could carry us to the next stage of growth. What the right next hire was. Which clients were relationships and which were transactions.

The problem is those two jobs, the operational one and the strategic one, ran in the same window. The Proposify tab was open next to the quarterly roadmap doc. The inbox triage happened between the strategy call and the L10. The jobs were not separated. They were interleaved, and the operational one almost always won because it was louder.

## After: what actually shifted

When Dirk took outreach, Dash took the numbers, Radar took the briefing, and Tally took the scorecard pushes, the operational layer became readable without requiring my presence inside it. I still see it. Bogdan, our COO, still oversees it. Janine still runs the financials. But I am not the one producing it every morning.

That shift exposed something I did not expect. Once the operational layer was running without me, I could see more clearly which decisions still required me and which ones were habits I had never examined.

A lot of them were habits.

I did not need to be the person deciding how to respond to every routine vendor email. Pepper handles that now. I did not need to be the one generating the CCM data view every time Arin needed to coach the calling team. But there is a category of decisions that genuinely did not move. Those are worth naming.

## The three things that stayed with me

The first is people accountability at the human layer. Agents can flag performance gaps. Dash flags which accounts are underperforming. Arin surfaces which callers are not hitting their dial targets. Crystal flags which projects are behind. But when a human on the team is not performing, the conversation about that belongs to a person. Not because agents cannot process the data. They can. But because the conversation about someone's future at a company is a relational act. It carries weight that requires the person on the other side to feel it.

When Francois was terminated in April, that decision came from a data pattern Arin surfaced. But the decision, the timing, the conversation, the record kept afterward, those lived with me and Bogdan. The accountability lived with us. The agent gave us clarity. The accountability did not transfer.

The second is bet-level decisions about the company's direction. Agents optimize within a strategy. They do not set one. When I decided to build OTP alongside the agency, that was not a decision an agent could make. It required weighing things that are not on any scorecard: what I wanted to be working on in five years, what the market looked like from where I was sitting, what the downside was if I was wrong and what I could live with. Dirk can tell me which outreach segment is converting. Dirk cannot tell me whether the agency is the right bet for the next three years.

The third is the relationship with clients that is strategic, not operational. The calls Dash flags as retention risk, Pulse can draft the outreach. But the call where you look a client in the eye (or on video) and tell them their results are down and here is the plan, that call needs a human on it. The clients paying at the level where relationship is part of what they bought did not buy data quality. They bought confidence. Confidence is something I have to carry personally into the room. No agent carries it for me.

## The useful reframe

Most CEOs I talk to who are building agent teams are still asking "how do I use agents to do more?" That is the wrong question.

The right question is: what is the work that can only be done by a human who has authority, relationships, and skin in the game? That work is yours. The rest is a delegation problem.

The mission I am working toward is agents carrying the operational layer so that people are free for the work that matters. What that actually requires is knowing, with some precision, what the work that matters is. Most operators have never had to answer that cleanly because the operational layer never moved far enough away to create the contrast.

When Dash owns the numbers, Dirk owns the outreach, Tally owns the scorecard, and Radar owns the briefing, you can finally see what you are left with. And what you are left with is a much shorter, much sharper list than most CEOs expect.

That shorter list is the job. The rest was noise that needed a different seat.

## See the live chart

The current Sneeze It org chart is queryable through the OTP MCP, including which seats are held by agents versus humans and what each seat owns.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the sneeze-it org chart and identify which seats are agent-held versus human-held."*

You will see the full chart with seat types labeled. The question worth asking after that is: which of those human seats are human because of a genuine accountability reason, and which are human because nobody got around to filling them with an agent yet.

---

*Series: AI CEO. Post 3 of an in-progress series. Previous: [Humans and agents on the same scorecard.](/blog/humans-and-agents-on-the-same-scorecard)*
