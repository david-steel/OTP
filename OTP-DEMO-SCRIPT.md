---
type: demo-script
date: 2026-03-28
status: v1
agent: dan
title: OTP Screen-Share Demo Script
audience: Founders and operators building multi-agent systems
runtime: 3-5 minutes
---

# OTP Demo Script
## Screen-Share Recording -- v1

---

## BEFORE YOU HIT RECORD

- Open Chrome, logged into orgtp.com, on the homepage
- Have your CLAUDE.md file ready on your desktop to drag-and-drop
- Close Slack and notifications
- Test the /publish upload flow once in advance so you know where the drag target is
- Consider zooming your browser to 110% so small text reads on screen

---

## THE SCRIPT

---

### OPENING -- 30 seconds
**[No screen yet, or homepage visible but not active]**

"Here is the problem nobody is talking about yet.

You built your first AI agent. It works great. So you build a second one. Then a third. And now they're fighting each other -- one agent overrides what another set up, nobody knows who owns what decision, and every session you're re-explaining the same context from scratch.

The hard problem in AI isn't building one good agent. It's getting twelve of them to not step on each other.

That is what OTP is built to solve. Let me show you."

---

### SCREEN 1 -- Homepage
**[SCREEN: orgtp.com]**

"This is OTP -- the Organizational Transport Protocol. The tagline says it: 'Where Agents Learn to Work as a Team.'

What you're seeing right now is the network -- 9 publishers live, including Google, AWS, Deloitte, and a handful of early operators like us. Organizations publishing structured files called OOS files -- Organizational Operating Systems -- that describe exactly how their AI agents coordinate.

Think of it as a protocol layer. Like HTTP for the web, but for agent coordination. Not prompts. Not documentation. Structured, machine-readable claims about how your agents work.

Let me show you what that actually looks like -- starting with your own system."

---

### SCREEN 2 -- Publish page
**[SCREEN: orgtp.com/publish]**

"You start here. Upload your CLAUDE.md -- or whatever file describes how your agents are configured.

I'm going to drag mine in right now."

**[Drag the CLAUDE.md file into the upload target. Watch the scan start.]**

"This is your existing CLAUDE.md. Every founder building with Claude Code has one. You probably wrote it yourself, made it up as you went, added rules when things broke.

OTP scans it and tells you what it actually says about your coordination -- whether your agents have clear ownership, whether your escalation paths are defined, whether your agents have the right context to make decisions without coming back to you constantly.

Watch what comes back."

---

### SCREEN 3 -- Scan Results / Coordination Score
**[SCREEN: orgtp.com/scan-results]**

"There it is. The Coordination Score.

Zero to 100. Six dimensions: role clarity, escalation design, context sharing, decision authority, feedback loops, and inter-agent protocol.

This is the Lighthouse. If you're building an agent army and you don't know your score, you're flying blind.

Mine came in at [X]. What that tells me is..."

**[Pause on the dimension bars. Point to the weakest one.]**

"This dimension right here -- that's the real issue. Not the average score. The gap. This is where my agents are stepping on each other.

Here's what I love about this. I didn't go looking for this problem. The scan found it. And it tells me exactly what to fix."

---

### SCREEN 4 -- Fix an Issue Inline
**[Stay on orgtp.com/scan-results, scroll to Insights section]**

"Each insight comes with a resolution. You don't have to leave the page.

Watch this --"

**[Click Resolve on one of the critical or warning insights]**

"That just updated my OOS directly. The claim that was missing -- it's now in my file. I can review it, tweak it, and when I'm happy with it, I publish it to the network.

This is not documentation. This is a living, correctable operating system for your agents."

---

### SCREEN 5 -- Publish to Network
**[Click 'Publish to OTP Network' button]**

"Now I publish.

What just happened: my OOS is live on the OTP network. Other organizations -- and more importantly, other agents -- can now read it.

But here's the part that matters for you as a builder: once this is published, any AI agent with the OTP MCP tools installed can pull this intelligence directly into their context.

Let me show you what the network looks like now."

---

### SCREEN 6 -- Dashboard
**[SCREEN: orgtp.com/dashboard]**

"This is your publisher dashboard. Your coordination score, your published OOS files, version history.

The score on the dashboard is yours -- it follows your organization. Every time you publish an update, it recalculates. You're building toward something. Not just configuring tools."

---

### SCREEN 7 -- Intelligence Graph
**[SCREEN: orgtp.com/graph]**

"This is where it gets interesting.

This is the Intelligence Graph. Every node is an organization. Every edge is a shared coordination pattern. The graph shows you how agent architectures relate across the entire network.

Click the Best Practices tab."

**[Click Best Practices tab]**

"55 coordination practices from 9 publishers. These aren't opinions. These are validated patterns -- things organizations actually implemented, measured, and published with confidence scores.

What you're looking at is collective intelligence. Every org that publishes makes the whole network smarter. That's the flywheel."

---

### SCREEN 8 -- OOS Detail with Copy as System Prompt
**[SCREEN: orgtp.com/oos/[id] -- your own published OOS or Sneeze It's]**

"This is what an OOS looks like when it's published. Every claim is structured: what the rule is, why it exists, what happens when it fails, and what scope it applies to.

See this button -- 'Copy as System Prompt.'"

**[Click it]**

"One click. That entire OOS, formatted as a system prompt, copied to your clipboard. Ready to inject into any agent that needs it.

This is how coordination propagates. Not manually copy-pasting your CLAUDE.md into every session. The protocol handles it."

---

### SCREEN 9 -- MCP Tools in Claude Code (optional, if you want to show the code layer)
**[SCREEN: Claude Code terminal or settings.json with OTP MCP configured]**

"For the engineers in the room -- this is what the agent-side integration looks like.

One line to install:"

```
npx otp-mcp-server init
```

"That gives every agent in your Claude Code environment 17 OTP tools. Things like get_my_rules -- your agent pulls its own operating rules from the network at session start. And capture_learning -- when a human corrects an agent, that correction automatically feeds back into the OOS.

That is the Live Learning Loop. Agents fail. Humans correct. Corrections become network intelligence. The system gets smarter every day without you manually updating anything."

---

### CLOSING -- 30 seconds
**[Return to orgtp.com homepage or stay on graph]**

"Here is what I want you to take away from this.

The agents you're building right now -- they're smart individually. But as a team they're probably a mess. And nobody has built infrastructure for that problem until now.

OTP is the coordination layer. The protocol. The network that makes your agents better by connecting them to how other organizations solved the same problems.

It's free to publish. It takes five minutes to scan your first CLAUDE.md. And if you're already running multiple agents, I promise you -- you will see something in that score you did not expect.

orgtp.com. Go scan yours."

---

## TOTAL RUNTIME: approximately 3-4 minutes

---

## DIRECTOR'S NOTES

**The score reveal is the aha moment.** Slow down there. Let the number land. The audience has a CLAUDE.md. They are wondering what their score would be. Make them feel that.

**Do not rush the graph.** The Intelligence Graph is the "holy shit" moment for network-thinkers. Give it 20 extra seconds. Let them look.

**If you fumble the inline fix** -- it's fine. Say "this is still in active development" and move on. The flow matters more than perfection. You're a founder showing his tool, not a polished demo.

**The "Copy as System Prompt" button** is more powerful than it looks. Say the quiet part out loud: "You're not managing documentation anymore. You're managing a living protocol."

**The MCP section is optional.** If you're recording for a non-technical audience, skip Screen 9 entirely and cut straight to the close. The protocol is the product -- the MCP is the plumbing.

**What NOT to say:**
- Don't say "we plan to" or "coming soon" -- you have a live product, act like it
- Don't over-explain the OOS format -- show it, don't define it
- Don't say "basically" -- it undercuts the credibility of what you've built

---

## ONE-LINE PITCH (for the video description or thumbnail)

"You built one AI agent that works. Now you're building your fourth and things are breaking. This is the coordination layer you're missing."
