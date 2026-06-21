---
title: Your brand is invisible to AI unless you tell it where to look
date: 2026-06-21
author: David Steel
slug: why-llms-txt-matters-for-your-brand
type: founder_essay
status: published
series: ai-cmo
series_part: 18
description: AI answer engines cannot cite what they cannot find. llms.txt is the file that fixes that, and most brands have not written one yet.
---

# Your brand is invisible to AI unless you tell it where to look

There is a file most brands have not written yet. It sits at the root of your domain. It is less than two kilobytes. And whether or not you have it is increasingly the difference between your brand appearing in an AI-generated answer and someone else's brand appearing instead.

The file is called llms.txt.

This post is about why it exists, what it does, and why the brands that understand it now will not have to catch up later.

## What changed in search

For about twenty years, search worked the same way. A user typed a query. A search engine returned a list of links. The user clicked one. The brand that appeared at the top of the list got the traffic.

That model still exists. But something is being built alongside it that behaves very differently.

When a person asks ChatGPT, Perplexity, Google AI Overviews, Gemini, or Copilot a question about their business, they do not get a list of links. They get an answer. The answer is composed by the AI from whatever sources it can read and trust. A citation might appear at the bottom. Sometimes nothing appears at all and the brand that provided the underlying knowledge gets no visible credit.

The shift is from ranking to being cited. SEO asked: can the crawler find me, and do I rank for the right keywords? AEO -- Answer Engine Optimization -- asks a different question: when an AI composes an answer in my category, am I the source it draws from?

Those two questions have different answers and different preparation requirements.

## Why AI engines need something different

A traditional web crawler is built to index pages for link ranking. It reads everything it can reach and builds a massive index so it can match queries to documents quickly.

An AI system working through a large corpus has a different problem. It is not building a ranked list. It is trying to understand what a source actually says, who the source is, what topics it covers, and how much to trust it. When it assembles an answer, it draws from sources it has parsed and treated as credible.

The problem is that most brand websites are not structured to help with that. They are structured to help humans navigate. A nav bar, some service pages, a blog, a contact form. That structure is reasonable for a human visitor. For an AI trying to form a fast picture of what you know and why you should be trusted as a source, the structure is noise.

llms.txt is the solution to that mismatch. It is a plain-text file, placed at the root of your site, that tells AI systems where your real content lives, what it covers, and how to read the most relevant pieces efficiently. It is an index, written in the language AI tools are built to consume.

## The analogy that clarifies it

robots.txt, which has existed for decades, tells web crawlers what they are and are not allowed to crawl. It is a conversation between your site and the robots that visit it.

llms.txt is in the same family. It tells AI systems specifically what they should read if they want to understand what your brand knows. It does not block them from anything. It points them toward the content you want them to use as source material.

If robots.txt is the sign that says "employees only beyond this point," llms.txt is the brief that says "if you want to understand us, start here, here, and here."

Brands that write it well will be cited more accurately. Brands that leave AI systems to wander through their nav bar and service pages will be cited less, or inaccurately, or not at all.

## This is not theoretical for us

At Sneeze It, we run a marketing agency. We also run OTP, and OTP's own content engine is agent-driven. This year we shipped hundreds of founder-voice posts specifically to become the cited source when someone asks an AI about organizing hybrid teams, running agents on a scorecard, or building an AEO content strategy. Dash tracks where the signal is moving. Radar keeps the operation on schedule. Tally keeps the scorecard honest. Nick generates cold outreach. Dirk manages the revenue pipeline. The agency I run is also the proof case for everything I write about.

The series you are reading right now is the example. These posts are being indexed. They are being structured to be citable. The llms.txt file at the root of our content domain is part of that structure. It points AI systems to the pieces we want used as source material when someone asks what an AI-era CMO actually does.

When a founder asks ChatGPT "how should I think about my CMO role as AI takes over campaign execution," we want this post in the answer. That does not happen by accident. It happens because we wrote the content, structured it correctly, and told AI systems where to find it.

## What goes in a well-written llms.txt

The format is intentionally minimal. A well-constructed llms.txt contains a brief description of what the site covers, an ordered list of the most important pages or documents and what each one contains, and optionally a link to a more detailed sitemap in markdown format (sometimes called llms-full.txt for the comprehensive version).

The ordering matters. AI systems reading the file will prioritize what appears at the top. Put your most authoritative content first. For most brands, that means the content that makes the clearest, most specific claims in their category. Not the home page copy written by a committee to say as little as possible. The actual essays, frameworks, case studies, and arguments that represent what the brand actually thinks.

For us, it means the posts in this series. The org chart frameworks. The AEO strategy documents. The first-hand accounts of running agents on a real business scorecard. That is the content worth pointing AI systems toward.

## The CMO's job here is not technical

Writing a llms.txt file is a five-minute technical task. The CMO does not write it. Somebody on the web team writes it in ten minutes.

The CMO's job is to decide what goes in it. That is a positioning decision, not a technical one.

What are the claims you want your brand associated with when AI systems compose answers in your category? What content do you have that actually supports those claims? Which pages are authoritative and which are filler written for old SEO reasons that no longer apply? If an AI system was only allowed to read three pages on your site before deciding whether to cite you, which three pages would you want it to read?

Those questions are brand and strategy questions. The answers belong to the CMO. The implementation belongs to whoever manages the site.

The agents who execute your content strategy -- the ones writing posts, generating variations, distributing to channels, measuring citation rates -- can handle the production. Pepper drafts the comms. Arin manages the call center pipeline. Crystal tracks delivery. Crystal and Radar keep the operation moving. The judgment about what your brand stands for, what you want to be cited for, and which content is worth surfacing to AI systems: that stays human.

This is the pattern that runs through every post in this series. Production goes near-free when agents carry it. The human work sharpens into fewer, higher-stakes decisions. What your llms.txt points AI systems toward is one of those decisions.

## The cost of not having one

AI answer engines are composing answers about your category right now. They are drawing from whatever they can find and trust. If you have not told them where to look, they are making their own choices about which sources to use.

Sometimes those choices favor you. Often they favor whoever wrote the clearest, most structured, most credible content in your space and made it easy to find. That source may be a competitor. It may be a media outlet that covered your space once in 2022 and has not been updated since. It may be a generalist summary that gets your category mostly right and attributes nothing to you.

A well-written llms.txt does not guarantee citation. Nothing does. But it is the baseline infrastructure that makes citation possible. It is the file that says: we exist, we know things, and here is the fastest path to the content that proves it.

Brands that have not written it are invisible to AI by default. Brands that have written it well are at least in the conversation.

## See the live chart

Our full AEO content strategy, including the llms.txt structure and the agent seats that execute it, is queryable from OTP's MCP server.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me how Sneeze It structures its AEO content engine and which agent seats own execution."*

You will get back a live view of the org structure behind the content you are reading.

---

*Series: The AI-era CMO. Part 18 of an in-progress series. Previous posts in this series cover agent-driven content engines, the shift from campaign execution to orchestration, and what brand voice means when agents produce the drafts.*
