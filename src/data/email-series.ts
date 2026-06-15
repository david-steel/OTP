// AUTO-GENERATED from .preview/email-series/series.json -- do not hand-edit.
// Regenerate: edit series.json, then re-run the porting step.
// The 90-day lifecycle curriculum: 30 time-based emails + 1 behavioral re-engagement.

export interface LifecycleCard {
  mascot: string; title: string; why: string; linkLabel: string; linkUrl: string;
}
export interface LifecycleEmail {
  n: number | string;
  day: number | string;
  phase: string;
  trigger: string;
  skipIf?: string;
  subject: string;
  eyebrow?: string;
  mascot: string;
  routeVerified?: boolean;
  headline: string;
  body: string[];
  cta: { label: string; url: string };
  secondary?: string;
  didYouKnow?: { text: string; linkLabel?: string; linkUrl?: string };
  cards?: LifecycleCard[];
}

export const EMAILS: LifecycleEmail[] = [
  {
    "n": 1,
    "day": 0,
    "phase": "Activation (Days 0-14)",
    "trigger": "signup +0d",
    "subject": "You're one of the first 50.",
    "eyebrow": "Welcome",
    "mascot": "onboarding-orgy-welcome.png",
    "routeVerified": true,
    "headline": "You're one of the first 50.",
    "body": [
      "I'm David. I built OTP, and you just signed up, which makes you one of the first 50 people on it. The founding 50 get every tool free for life, and a direct line to me.",
      "Let's use it. Grab 20 minutes and I'll set up your chart with you live."
    ],
    "cta": {
      "label": "Book 20 minutes with me",
      "url": "https://calendly.com/dawson-orgtp/30min"
    },
    "cards": [
      {
        "mascot": "onboarding-orgy-goal.png",
        "title": "The Plan (your OOS)",
        "why": "so your team stops starting from zero. Every AI session today forgets what last week's learned. The OOS is the file that makes it stick. Humans read it as the plan, agents query it as the rules.",
        "linkLabel": "See your chart",
        "linkUrl": "https://orgtp.com/dashboard"
      },
      {
        "mascot": "onboarding-orgy-kpi.png",
        "title": "Goals & KPIs",
        "why": "the chart needs something to point at. Goals are the direction; KPIs are how you know you're moving. Without them, your agents are busy, not aimed.",
        "linkLabel": "Set your first KPI",
        "linkUrl": "https://orgtp.com/onboarding/kpis"
      },
      {
        "mascot": "onboarding-orgy-agent.png",
        "title": "Agent Employees",
        "why": "this is the part the others don't have. Not AI that assists. AI that holds a seat, owns a number, and does the work.",
        "linkLabel": "Add an agent",
        "linkUrl": "https://orgtp.com/onboarding/agents"
      }
    ]
  },
  {
    "n": 2,
    "day": 2,
    "phase": "Activation (Days 0-14)",
    "trigger": "signup +2d",
    "skipIf": "members>1",
    "subject": "A chart with one person isn't a chart.",
    "eyebrow": "Step 1 of your setup",
    "mascot": "orgy-orchestrate.png",
    "routeVerified": true,
    "headline": "A chart with one person isn't a chart.",
    "body": [
      "Right now your org has one seat filled: yours. OTP starts working the moment the rest of your team is on it.",
      "<strong>Why this is step one:</strong> the whole point is coordination. Humans and agent employees reporting up the same chart, against the same plan. With one person on it, there's nothing to coordinate yet. Invite two or three people and the org becomes real."
    ],
    "cta": {
      "label": "Invite your team",
      "url": "https://orgtp.com/dashboard/members"
    },
    "secondary": "Want me to walk you through it instead? <a href=\"https://calendly.com/dawson-orgtp/30min\" style=\"color:#5a7d1f;font-weight:700;text-decoration:none;\">Grab 20 minutes</a> and we'll set it up together."
  },
  {
    "n": 3,
    "day": 4,
    "phase": "Activation (Days 0-14)",
    "trigger": "signup +4d",
    "skipIf": "meeting exists",
    "subject": "The plan only runs if you run the meeting.",
    "eyebrow": "Step 2 of your setup",
    "mascot": "onboarding-orgy-meeting.png",
    "routeVerified": true,
    "headline": "The plan only runs if you run the meeting.",
    "body": [
      "Your team's on the chart. Now give it a heartbeat.",
      "<strong>Why the meeting matters:</strong> a plan nobody reviews is a document. A plan you walk through on a cadence is an operating system. The meeting is where the chart, the goals, and the numbers get looked at together, every week, the same way. That rhythm is what makes OTP stick instead of drift."
    ],
    "cta": {
      "label": "Schedule your first meeting",
      "url": "https://orgtp.com/onboarding/first-meeting"
    },
    "didYouKnow": {
      "text": "OTP runs the meeting for you, segment by segment, and writes the recap. You don't facilitate. You show up."
    }
  },
  {
    "n": 4,
    "day": 6,
    "phase": "Activation (Days 0-14)",
    "trigger": "signup +6d",
    "subject": "This is where your org reports to you.",
    "eyebrow": "Step 3 of your setup",
    "mascot": "orgy-present.png",
    "routeVerified": true,
    "headline": "This is where your org reports to you.",
    "body": [
      "Team's on the chart, meeting's on the calendar. Here's the surface you'll actually live in.",
      "<strong>Why the dashboard exists:</strong> it's the one place that pulls your whole org into a single view, your people, your agents, your goals, and what moved since yesterday. Sixty seconds here each morning is how you stay ahead of the org instead of chasing it."
    ],
    "cta": {
      "label": "Open your dashboard",
      "url": "https://orgtp.com/dashboard"
    }
  },
  {
    "n": 5,
    "day": 8,
    "phase": "Activation (Days 0-14)",
    "trigger": "signup +8d",
    "skipIf": "goal exists",
    "subject": "Aimed, or just busy?",
    "eyebrow": "Step 4 of your setup",
    "mascot": "orgy-scoreboard.png",
    "routeVerified": true,
    "headline": "Aimed, or just busy?",
    "body": [
      "Your org's set up and moving. Here's the question that decides whether it's moving anywhere: what is it aimed at?",
      "<strong>Why goals exist:</strong> a chart shows who does what. Goals point the whole thing in one direction. Without one, a team stays busy without ever knowing if it's winning. Give OTP your top goal and it pulls the rest into line."
    ],
    "cta": {
      "label": "Set your top goal",
      "url": "https://orgtp.com/onboarding/goals"
    }
  },
  {
    "n": 6,
    "day": 11,
    "phase": "Activation (Days 0-14)",
    "trigger": "signup +11d",
    "skipIf": "kpi exists",
    "subject": "The one number that tells the truth.",
    "eyebrow": "Step 5 of your setup",
    "mascot": "onboarding-orgy-kpi.png",
    "routeVerified": true,
    "headline": "The one number that tells the truth.",
    "body": [
      "You've got a goal. Now pick the number that tells you, week to week, whether you're getting there.",
      "<strong>Why a KPI exists:</strong> goals are easy to feel good about and hard to be honest about. A KPI is the honest version. It's the single measure that moves before the goal does, so you see trouble early and momentum sooner."
    ],
    "cta": {
      "label": "Set your first KPI",
      "url": "https://orgtp.com/onboarding/kpis"
    },
    "secondary": "Not sure which number to track? <a href=\"https://calendly.com/dawson-orgtp/30min\" style=\"color:#5a7d1f;font-weight:700;text-decoration:none;\">Grab 20 minutes</a> and I'll help you pick."
  },
  {
    "n": 7,
    "day": 14,
    "phase": "Activation (Days 0-14)",
    "trigger": "signup +14d",
    "skipIf": "agent exists",
    "subject": "Hire your first agent employee.",
    "eyebrow": "Step 6 of your setup",
    "mascot": "onboarding-orgy-agent.png",
    "routeVerified": true,
    "headline": "Hire your first agent employee.",
    "body": [
      "This is the part of OTP nobody else has. Not AI that helps you type faster. An actual employee on your chart that happens to be AI.",
      "<strong>Why agent employees exist:</strong> a seat with a name, a number it owns, and work it does on its own. It reports up the chart like any hire, shows up in the meeting, and moves a KPI. Give it a seat, point it at a goal, and watch your org get capacity it didn't have yesterday."
    ],
    "cta": {
      "label": "Add your first agent",
      "url": "https://orgtp.com/onboarding/agents"
    },
    "didYouKnow": {
      "text": "Your agent employees read your OOS as their rules. The better your plan, the better they work."
    }
  },
  {
    "n": 8,
    "day": 17,
    "phase": "Adoption (Days 15-45)",
    "trigger": "signup +17d",
    "subject": "Your turn to publish.",
    "eyebrow": "Go deeper",
    "mascot": "orgy-orchestrate.png",
    "routeVerified": true,
    "headline": "Your turn to publish.",
    "body": [
      "You've read what OTP can do. Now add one thing to the network: publish a single OOS. Even a small one.",
      "<strong>Why publish:</strong> publishers get more back than readers. When you post how your team or your agents actually work, the protocol starts matching your claims against what other orgs have learned. You get coordinated intelligence, not static content."
    ],
    "cta": {
      "label": "Publish your first OOS",
      "url": "https://orgtp.com/publish"
    }
  },
  {
    "n": 9,
    "day": 20,
    "phase": "Adoption (Days 15-45)",
    "trigger": "signup +20d",
    "subject": "Someone already paid for your next mistake.",
    "eyebrow": "Go deeper",
    "mascot": "orgy-magnify.png",
    "routeVerified": true,
    "headline": "Someone already paid for your next mistake.",
    "body": [
      "Spend ten minutes in the network this week. Read one OOS from an org solving a problem near yours.",
      "<strong>Why browse:</strong> the coordination patterns transfer even when the industry doesn't. How one agency structures agent handoffs is the same problem a law firm or a SaaS team is solving, just in different words. You get to skip the six weeks of trial and error they already paid for."
    ],
    "cta": {
      "label": "Browse the network",
      "url": "https://orgtp.com/browse"
    }
  },
  {
    "n": 10,
    "day": 23,
    "phase": "Adoption (Days 15-45)",
    "trigger": "signup +23d",
    "subject": "Why your AI keeps forgetting.",
    "eyebrow": "The why behind OTP",
    "mascot": "onboarding-orgy-goal.png",
    "routeVerified": true,
    "headline": "Why your AI keeps forgetting.",
    "body": [
      "Every AI session your team runs starts from zero. The pattern one agent learns this week does not survive into next week. That's not a model problem. It's a memory problem.",
      "<strong>Why the OOS is the fix:</strong> it's the file format that makes those patterns persist. Humans read it as the org's plan. Agents query it as the rules they follow. Write it once, and every session after starts from where the last one left off."
    ],
    "cta": {
      "label": "Read the protocol",
      "url": "https://orgtp.com/protocol"
    }
  },
  {
    "n": 11,
    "day": 26,
    "phase": "Adoption (Days 15-45)",
    "trigger": "signup +26d",
    "subject": "The second meeting is the one that counts.",
    "eyebrow": "Build the habit",
    "mascot": "onboarding-orgy-meeting.png",
    "routeVerified": true,
    "headline": "The second meeting is the one that counts.",
    "body": [
      "Anyone can run a first meeting. The teams that win on OTP run the second, and the third, on the same day, same way.",
      "<strong>Why cadence beats intensity:</strong> the value isn't in any single meeting. It's in the rhythm. A weekly review turns your plan into a living system that catches problems while they're small. Make it recurring and it runs itself."
    ],
    "cta": {
      "label": "Open your meetings",
      "url": "https://orgtp.com/level-10-meetings"
    }
  },
  {
    "n": 12,
    "day": 29,
    "phase": "Adoption (Days 15-45)",
    "trigger": "signup +29d",
    "routeVerified": false,
    "subject": "Reading the scoreboard.",
    "eyebrow": "Build the habit",
    "mascot": "orgy-scoreboard.png",
    "headline": "Reading the scoreboard.",
    "body": [
      "Your KPIs only help if you read them at a glance. Here's the trick: watch the trend, not the number.",
      "<strong>Why the scorecard exists:</strong> a single number is a snapshot. The trend is the story. Up three weeks running means something working. Down two weeks is a flag worth a conversation. OTP puts the trend in front of you so you act on direction, not noise."
    ],
    "cta": {
      "label": "Check your scorecard",
      "url": "https://orgtp.com/dashboard"
    }
  },
  {
    "n": 13,
    "day": 32,
    "phase": "Adoption (Days 15-45)",
    "trigger": "signup +32d",
    "routeVerified": false,
    "subject": "Every seat needs an owner.",
    "eyebrow": "Tighten the chart",
    "mascot": "orgy-orchestrate.png",
    "headline": "Every seat needs an owner.",
    "body": [
      "Look at your chart. Is there a name on every seat, and one name per number?",
      "<strong>Why one owner per seat:</strong> shared accountability is no accountability. When two people own a number, neither does. OTP makes you put one name on each seat so when something moves, you know exactly who moved it, human or agent."
    ],
    "cta": {
      "label": "Review your chart",
      "url": "https://orgtp.com/dashboard/members"
    }
  },
  {
    "n": 14,
    "day": 35,
    "phase": "Adoption (Days 15-45)",
    "trigger": "signup +35d",
    "subject": "Point an agent at a number.",
    "eyebrow": "Tighten the chart",
    "mascot": "onboarding-orgy-agent.png",
    "routeVerified": true,
    "headline": "Point an agent at a number.",
    "body": [
      "An agent without a KPI is a demo. An agent that owns a number is an employee.",
      "<strong>Why pair agents with KPIs:</strong> the moment you make an agent accountable for a measure, it stops being a novelty and starts being leverage. It works the number every day, reports the movement in your meeting, and frees a human to do the work only a human can."
    ],
    "cta": {
      "label": "Assign an agent a KPI",
      "url": "https://orgtp.com/onboarding/agents"
    }
  },
  {
    "n": 15,
    "day": 38,
    "phase": "Adoption (Days 15-45)",
    "trigger": "signup +38d",
    "subject": "Headlines and issues: the 90 seconds that fix the week.",
    "eyebrow": "Run it like an operator",
    "mascot": "orgy-present.png",
    "routeVerified": true,
    "headline": "The 90 seconds that fix the week.",
    "body": [
      "Two parts of the meeting do most of the work: headlines and the issues list. Most teams skip them. Don't.",
      "<strong>Why they matter:</strong> headlines surface what changed before it becomes a crisis. The issues list is where you identify, discuss, and solve, in that order, instead of looping on the same problem every week. OTP structures both so the meeting ends with decisions, not vibes."
    ],
    "cta": {
      "label": "Open your meeting",
      "url": "https://orgtp.com/level-10-meetings"
    }
  },
  {
    "n": 16,
    "day": 41,
    "phase": "Adoption (Days 15-45)",
    "trigger": "signup +41d",
    "subject": "Bring the managers in.",
    "eyebrow": "Grow the org",
    "mascot": "orgy-orchestrate.png",
    "routeVerified": true,
    "headline": "Bring the managers in.",
    "body": [
      "You started OTP. The leverage shows up when your managers run their own slice of the chart inside it.",
      "<strong>Why expand access:</strong> an operating system one person checks is a dashboard. An operating system the whole leadership team runs is how a company actually coordinates. Give each manager their seat, their team, and their numbers, and the org starts running on the protocol instead of on you."
    ],
    "cta": {
      "label": "Invite your managers",
      "url": "https://orgtp.com/dashboard/members"
    }
  },
  {
    "n": 17,
    "day": 44,
    "phase": "Adoption (Days 15-45)",
    "trigger": "signup +44d",
    "routeVerified": false,
    "subject": "See it the way your team sees it.",
    "eyebrow": "Power feature",
    "mascot": "orgy-magnify.png",
    "headline": "See it the way your team sees it.",
    "body": [
      "You set the access. Now check what each person actually sees when they log in.",
      "<strong>Why view-as exists:</strong> what's obvious to the founder is often invisible to a new manager. OTP lets you view the org as any member, so you can fix the gaps before they cost you. The best operators design the employee's view, not just their own."
    ],
    "cta": {
      "label": "Open your dashboard",
      "url": "https://orgtp.com/dashboard"
    }
  },
  {
    "n": 18,
    "day": 47,
    "phase": "Network value (Days 46-75)",
    "trigger": "signup +47d",
    "subject": "How does your org compare?",
    "eyebrow": "Use the network",
    "mascot": "orgy-magnify.png",
    "routeVerified": true,
    "headline": "How does your org compare?",
    "body": [
      "You've published. Now use the other side of the network: compare your OOS against what's working elsewhere.",
      "<strong>Why compare:</strong> your blind spots are someone else's solved problem. When you line your claims up against the network, you find the rule you're missing and the pattern you didn't know had a name. That's the whole point of a protocol instead of a private doc."
    ],
    "cta": {
      "label": "Browse and compare",
      "url": "https://orgtp.com/browse"
    }
  },
  {
    "n": 19,
    "day": 51,
    "phase": "Network value (Days 46-75)",
    "trigger": "signup +51d",
    "routeVerified": false,
    "subject": "Every correction is a learning.",
    "eyebrow": "Use the network",
    "mascot": "onboarding-orgy-goal.png",
    "headline": "Every correction is a learning.",
    "body": [
      "When something in your org breaks and you fix it, capture it. One sentence: what failed, what to do instead, why.",
      "<strong>Why capture learnings:</strong> a correction you don't write down is a lesson you'll pay for twice. OTP turns each one into a claim the network can match against, so your team and every org on the protocol stops repeating the same mistake."
    ],
    "cta": {
      "label": "Open your dashboard",
      "url": "https://orgtp.com/dashboard"
    }
  },
  {
    "n": 20,
    "day": 55,
    "phase": "Network value (Days 46-75)",
    "trigger": "signup +55d",
    "subject": "Best practices, matched to you.",
    "eyebrow": "Use the network",
    "mascot": "orgy-present.png",
    "routeVerified": true,
    "headline": "Best practices, matched to you.",
    "body": [
      "The network isn't a library you dig through. It's a feed that surfaces what's relevant to the way your org actually works.",
      "<strong>Why this beats a search box:</strong> you don't know what you don't know. OTP matches your OOS against the best practices other orgs have proven, and brings you the ones that fit, before you hit the wall they already hit."
    ],
    "cta": {
      "label": "See what's matched",
      "url": "https://orgtp.com/browse"
    }
  },
  {
    "n": 21,
    "day": 59,
    "phase": "Network value (Days 46-75)",
    "trigger": "signup +59d",
    "subject": "The recap writes itself.",
    "eyebrow": "Run it like an operator",
    "mascot": "onboarding-orgy-meeting.png",
    "routeVerified": true,
    "headline": "The recap writes itself.",
    "body": [
      "After every meeting, OTP produces the recap and the cascading message, the short note that tells the rest of the company what leadership decided.",
      "<strong>Why the cascade matters:</strong> decisions die in the gap between the meeting and the team. The cascading message closes that gap in one paragraph, so everyone hears the same thing in the same words. You ran the meeting. OTP makes sure it lands."
    ],
    "cta": {
      "label": "Open your meetings",
      "url": "https://orgtp.com/level-10-meetings"
    }
  },
  {
    "n": 22,
    "day": 63,
    "phase": "Network value (Days 46-75)",
    "trigger": "signup +63d",
    "subject": "Set a Rock for the quarter.",
    "eyebrow": "Think in quarters",
    "mascot": "orgy-scoreboard.png",
    "routeVerified": true,
    "headline": "Set a Rock for the quarter.",
    "body": [
      "Weekly numbers keep you honest. Quarterly Rocks keep you moving toward something bigger than this week.",
      "<strong>Why Rocks exist:</strong> a goal with no time horizon is a wish. A Rock is the one thing that has to be true in 90 days. Set one, hang your weekly work off it, and your meeting stops being a status update and starts being progress you can see."
    ],
    "cta": {
      "label": "Set a quarterly Rock",
      "url": "https://orgtp.com/onboarding/goals"
    }
  },
  {
    "n": 23,
    "day": 67,
    "phase": "Network value (Days 46-75)",
    "trigger": "signup +67d",
    "subject": "Your second agent.",
    "eyebrow": "Scale the team",
    "mascot": "onboarding-orgy-agent.png",
    "routeVerified": true,
    "headline": "Your second agent.",
    "body": [
      "The first agent proves it works. The second is where the leverage compounds.",
      "<strong>Why go from one to two:</strong> one agent is an experiment. Two agents coordinating, each owning a number and reporting up the same chart, is a team. That's the moment OTP stops feeling like software and starts feeling like staff."
    ],
    "cta": {
      "label": "Add another agent",
      "url": "https://orgtp.com/onboarding/agents"
    }
  },
  {
    "n": 24,
    "day": 71,
    "phase": "Network value (Days 46-75)",
    "trigger": "signup +71d",
    "routeVerified": false,
    "subject": "Make your OOS public.",
    "eyebrow": "Build authority",
    "mascot": "orgy-orchestrate.png",
    "headline": "Make your OOS public.",
    "body": [
      "You've built something real. Turn your publisher profile on and let other operators find it.",
      "<strong>Why publish publicly:</strong> the orgs that share how they run become the reference everyone else cites. A public OOS is proof of how you operate, a magnet for the right people, and a seat at the center of the network instead of the edge."
    ],
    "cta": {
      "label": "Set up your publisher profile",
      "url": "https://orgtp.com/dashboard/publisher"
    }
  },
  {
    "n": 25,
    "day": 74,
    "phase": "Network value (Days 46-75)",
    "trigger": "signup +74d",
    "subject": "Protocol, not product.",
    "eyebrow": "The big idea",
    "mascot": "orgy-magnify.png",
    "routeVerified": true,
    "headline": "Protocol, not product.",
    "body": [
      "Most tools want to own your data. OTP is built the other way around. It's a protocol, a file format and a network, not a walled garden.",
      "<strong>Why that's the whole point:</strong> your OOS is yours. It works whether you're in the app, in an AI session, or handing it to a new hire. The protocol is what makes your operating system portable, durable, and worth building on for the long run."
    ],
    "cta": {
      "label": "Read the protocol",
      "url": "https://orgtp.com/protocol"
    }
  },
  {
    "n": 26,
    "day": 78,
    "phase": "Retention & advocacy (Days 76-90)",
    "trigger": "signup +78d",
    "subject": "Look what you built.",
    "eyebrow": "Your 90 days",
    "mascot": "orgy-celebrate.png",
    "routeVerified": true,
    "headline": "Look what you built.",
    "body": [
      "Eleven weeks ago you had a signup. Now you have a chart, a cadence, goals with numbers behind them, and agents doing real work.",
      "<strong>Why this is the milestone:</strong> most teams never get an operating system. They run on memory and good intentions. You built the thing that outlasts any one busy week. Take a look at how far the org has come."
    ],
    "cta": {
      "label": "Open your dashboard",
      "url": "https://orgtp.com/dashboard"
    }
  },
  {
    "n": 27,
    "day": 81,
    "phase": "Retention & advocacy (Days 76-90)",
    "trigger": "signup +81d",
    "subject": "Let's review it together.",
    "eyebrow": "Founder time",
    "mascot": "orgy-present.png",
    "routeVerified": true,
    "headline": "Let's review it together.",
    "body": [
      "You're past setup and into running. This is the perfect moment for a strategic pass, the two of us, on what's working and what to tune next.",
      "<strong>Why now:</strong> the first 90 days build the system. The next 90 sharpen it. Twenty minutes with me and we'll find the one change that compounds, whether that's a new agent, a tighter scorecard, or a goal worth aiming higher."
    ],
    "cta": {
      "label": "Book a strategic review",
      "url": "https://calendly.com/dawson-orgtp/30min"
    }
  },
  {
    "n": 28,
    "day": 84,
    "phase": "Retention & advocacy (Days 76-90)",
    "trigger": "signup +84d",
    "routeVerified": false,
    "subject": "Know an operator who needs this?",
    "eyebrow": "Pass it on",
    "mascot": "orgy-orchestrate.png",
    "headline": "Know an operator who needs this?",
    "body": [
      "You've felt the difference between running on memory and running on a protocol. Odds are you know someone still doing it the hard way.",
      "<strong>Why refer:</strong> the network gets better with every serious operator on it, including for you. The more orgs publishing what works, the more intelligence flows back to your chart. Send one person who'd get it."
    ],
    "cta": {
      "label": "Share OTP",
      "url": "https://orgtp.com"
    }
  },
  {
    "n": 29,
    "day": 87,
    "phase": "Retention & advocacy (Days 76-90)",
    "trigger": "signup +87d",
    "subject": "What's next on OTP.",
    "eyebrow": "Founding 50",
    "mascot": "orgy-celebrate.png",
    "routeVerified": true,
    "headline": "What's next on OTP.",
    "body": [
      "As one of the founding 50, you're not just using OTP, you're shaping it. Here's the deal going forward: you keep every tool free for life, and you keep the direct line to me.",
      "<strong>Why your voice still matters:</strong> the roadmap bends toward what the first operators actually need. Reply to this email with the one thing you wish OTP did, and it goes straight onto my list."
    ],
    "cta": {
      "label": "Open your dashboard",
      "url": "https://orgtp.com/dashboard"
    }
  },
  {
    "n": 30,
    "day": 90,
    "phase": "Retention & advocacy (Days 76-90)",
    "trigger": "signup +90d",
    "subject": "You're running on OTP now.",
    "eyebrow": "Day 90",
    "mascot": "orgy-celebrate.png",
    "routeVerified": true,
    "headline": "You're running on OTP now.",
    "body": [
      "Ninety days. You went from a signup to an org with a plan that persists, a cadence that holds, and agents that work. That's not a trial anymore. That's how you operate.",
      "<strong>Why I'm telling you:</strong> the hardest part is behind you. From here it compounds. If you want to push it further, my calendar's open, same as day one."
    ],
    "cta": {
      "label": "Book time with me",
      "url": "https://calendly.com/dawson-orgtp/30min"
    }
  }
];

export const REENGAGE: LifecycleEmail = {
  "n": "RE",
  "day": "-",
  "phase": "Behavioral",
  "trigger": "no login 3 days (M-F only)",
  "skipIf": "logged in within 3d",
  "routeVerified": true,
  "subject": "Your org chart is waiting.",
  "eyebrow": "Pick up where you left off",
  "mascot": "orgy-idle.png",
  "headline": "Your org chart is waiting.",
  "body": [
    "Haven't seen you in a few days. No guilt, life gets loud. Just a nudge, because the orgs that win on OTP are the ones that keep showing up for sixty seconds a day.",
    "<strong>The one thing to do:</strong> open your dashboard and look at what changed. That's it. Momentum is mostly just not breaking the chain."
  ],
  "cta": {
    "label": "Pick up where you left off",
    "url": "https://orgtp.com/dashboard"
  },
  "secondary": "Stuck on something? <a href=\"https://calendly.com/dawson-orgtp/30min\" style=\"color:#5a7d1f;font-weight:700;text-decoration:none;\">Grab 20 minutes with me</a>."
};
