---
title: Orger is the first site built on OTP
date: 2026-05-10
author: David Steel
slug: orger-is-the-first-site-built-on-otp
type: founder_essay
status: published
series: organizing-agents
description: Orger.ai just shipped a new look and a new home. It is also the first product built on OTP as a framework, not just consumed as an API. Here is what that means and why it matters.
---

# Orger is the first site built on OTP

[Orger.ai](https://orger.ai) just shipped.

The new homepage went live today with a mascot named Orgy, a headline that reads "Your org chart, with agents," and a free builder that lets you drag and drop the humans you have and get grounded recommendations for the AI agents you should build next.

That sentence is the marketing. The interesting sentence is the one underneath it.

Orger is the first site built on OTP.

## What "built on OTP" actually means

Most products that touch OTP today consume it. They install the MCP, query the team graph, pull a few claims from the network, and return to whatever stack they were already running on. That is the API stage. It is fine. It is not what Orger is.

Orger does not call OTP from a separate stack. Orger runs on the same backend OTP runs on. Same Clerk auth. Same Postgres. Same MCP server. Same team graph. Same scorecard surface. The marketing site is its own Next.js app, and the authenticated chart you build inside the app is rendered straight off the OTP team graph through service auth.

When you sign up at orger.ai and start sketching your chart, you are writing into the same database that backs every chart on the OTP network. Your seats are OTP seats. Your scorecards are OTP scorecards. The agents you add inherit from the same operating-rule pool that every other agent on the network learns from.

That is what built on means. The product does not sit next to OTP. It sits inside it.

## Why this matters

OTP has spent the last few weeks getting called a lot of things. A protocol. A coordination layer. A network. A transactive memory system. All of those are accurate. None of them prove OTP is a framework.

A framework only earns the word once a product is built on it that could not have been built any other way at the same cost.

Orger is that product.

Building Orger as a standalone app would have meant standing up a separate auth system, a separate seat schema, a separate scorecard format, a separate MCP, and a separate place for every correction the agents make. Five separate runtimes for one product. None of that work would have moved the actual product forward. All of it would have rebuilt what OTP already does.

By building Orger on OTP, the product team got auth, persistence, the MCP surface, the team graph schema, the publish protocol, and the correction loop for free. The work that remained was the product itself. The mascot. The drag and drop. The recommendation engine that looks at the human seats you already have and tells you which agent seats you are missing.

That is the framework promise. You ship the part of the product that is yours and you inherit the part that is shared.

## What you can do with it today

Go to [orger.ai](https://orger.ai). Sign up. Drop in a few of the humans on your team. Watch the chart give you grounded recommendations for the AI agents you should add next, based on what every other org on the OTP network has already learned about which agent seats produce value and which ones do not.

The chart you build is queryable from any MCP-aware AI client. The same recommendations are visible to your AI assistant. The scorecard you publish travels through the network so the next operator does not have to learn the same lesson the hard way.

If you are an operator looking at your team and wondering which agent to hire next, this is the cheapest way to find out.

## What comes next

Orger is the first site built on OTP. It will not be the last.

The frame I keep coming back to is that OTP is for any product that needs humans, agents, seats, scorecards, and corrections to live on the same protocol. Every operator I talk to has at least one product idea that fits that description. Most of them assume they would have to build all of it from scratch. Orger is the proof they do not.

If you are building something that fits, the framework is open. The MCP is `npx -y @orgtp/mcp-server`. The team graph is queryable. The auth is Clerk. The scorecard surface is live. Reach me at dsteel@orgtp.com if you want to be the second site built on OTP.

The first one shipped today. Go look at it.

[orger.ai](https://orger.ai)

---

*Series: Organizing Agents. Companion to [Adding an AI agent to your org chart is not configuration. It is hiring.](./2026-05-10-adding-an-agent-to-your-org-chart.md)*
