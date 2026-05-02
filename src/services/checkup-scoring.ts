// Coordination Checkup -- Self-Assessment Scoring Engine
// Maps 24 self-assessment questions (3 per level x 8 levels) to a final
// agentic maturity score on Bassim Eledath's 8 Levels framework.
//
// Hierarchy rule (from Bassim): weaknesses at lower levels cap the score
// regardless of higher-level capabilities. The final score is:
//   highest contiguous passed level + (next-level raw / level max)
// A gap at L4 makes any L5-L8 strength invisible.

export interface CheckupQuestion {
  id: string;
  level: number;
  prompt: string;
  options: string[]; // 4 options, scored 0/1/2/3
}

export interface PerLevelScore {
  level: number;
  label: string;
  raw: number;     // 0..9
  max: number;     // 9
  passed: boolean; // raw >= 6
  pct: number;     // 0..100
}

export interface CheckupResult {
  finalScore: number;          // 0.0 .. 8.0, one decimal
  highestPassedLevel: number;  // 0 if even L1 fails
  cappedByLevel: number | null; // first failed level, null if all 8 passed
  levelLabel: string;
  tier: 'tourist' | 'tinkerer' | 'operator' | 'orchestrator' | 'autonomous';
  tierHeadline: string;
  tierBody: string;
  roadmap: string[];
  perLevel: PerLevelScore[];
}

export const LEVEL_LABELS: Record<number, string> = {
  1: 'Tab Complete',
  2: 'Agent IDE',
  3: 'Context Engineering',
  4: 'Compounding Engineering',
  5: 'MCP & Skills',
  6: 'Harness Engineering',
  7: 'Background Agents',
  8: 'Autonomous Agent Teams',
};

export const QUESTIONS: CheckupQuestion[] = [
  // ---------- L1: Tab Complete ----------
  {
    id: 'l1q1', level: 1,
    prompt: 'How often does your team use AI for code completion or inline writing assistance (Copilot, Cursor, Claude in editor, Gmail Smart Compose)?',
    options: ['Never', 'A few people occasionally', 'Most of the team weekly', 'Daily, across the team'],
  },
  {
    id: 'l1q2', level: 1,
    prompt: 'Do people on your team reach for ChatGPT, Claude, or Gemini for daily work tasks?',
    options: ['No one really does', 'A handful, ad hoc', 'Most people, regularly', 'It is the default first move'],
  },
  {
    id: 'l1q3', level: 1,
    prompt: 'When stuck, how often does someone open an AI tool before asking a coworker or Googling?',
    options: ['Never -- coworker or Google first', 'Rarely', 'Often', 'Almost always AI first'],
  },

  // ---------- L2: Agent IDE ----------
  {
    id: 'l2q1', level: 2,
    prompt: 'Have you built or deployed at least one custom AI agent (not just used a chatbot)?',
    options: ['No', 'Experimented, nothing live', 'One or two in production', 'Several agents live and used'],
  },
  {
    id: 'l2q2', level: 2,
    prompt: 'Does anyone on your team work in a dedicated AI development environment (Cursor, Windsurf, Claude Code, Aider, Replit Agent)?',
    options: ['No', 'One person, sometimes', 'A few, regularly', 'It is the standard work surface'],
  },
  {
    id: 'l2q3', level: 2,
    prompt: 'Can someone on your team explain the difference between a chatbot and an agent, and point to one you actually own?',
    options: ['No, we do not distinguish', 'Vaguely', 'Yes, and we have one', 'Yes, and we have several with clear roles'],
  },

  // ---------- L3: Context Engineering ----------
  {
    id: 'l3q1', level: 3,
    prompt: 'Do your AI tools have written instructions, system prompts, or rules files (CLAUDE.md, .cursorrules, agent personas)?',
    options: ['No -- we just type prompts each time', 'A few prompts saved somewhere', 'Yes, per project or tool', 'Yes, versioned and maintained like code'],
  },
  {
    id: 'l3q2', level: 3,
    prompt: 'Do your agents read persistent context (memory files, state files, shared docs) at the start of each session?',
    options: ['No', 'Sometimes, manually pasted in', 'Yes, automatically loaded', 'Yes, structured + auto-updated'],
  },
  {
    id: 'l3q3', level: 3,
    prompt: 'When an AI gives a bad answer, do you fix it by editing the context or rules, not just re-prompting?',
    options: ['We just re-prompt', 'Sometimes update a doc', 'Usually update the rules file', 'Always -- corrections become permanent context'],
  },

  // ---------- L4: Compounding Engineering ----------
  {
    id: 'l4q1', level: 4,
    prompt: 'When an AI agent makes a mistake, is that lesson captured somewhere future sessions or other people can use?',
    options: ['No -- the lesson dies with the session', 'In someone\'s head', 'In a shared doc or wiki', 'Captured into a system that agents read'],
  },
  {
    id: 'l4q2', level: 4,
    prompt: 'Do you have written playbooks, SOPs, or runbooks that AI agents actively reference when they work?',
    options: ['No', 'Some docs exist, AI does not use them', 'Some, partially used', 'Yes -- agents read them as canonical'],
  },
  {
    id: 'l4q3', level: 4,
    prompt: 'Is your AI setup measurably better month-over-month (fewer corrections, faster output, broader tasks), not just "we use it more"?',
    options: ['Hard to say -- we do not measure', 'Anecdotally yes', 'Yes, with rough tracking', 'Yes, with metrics we review'],
  },

  // ---------- L5: MCP & Skills ----------
  {
    id: 'l5q1', level: 5,
    prompt: 'Have you connected your AI to external tools via MCP, plugins, or APIs (Slack, Gmail, GitHub, your CRM, your DB)?',
    options: ['No -- AI is sandboxed', 'One integration', 'A handful', 'Many, treated as a real toolbox'],
  },
  {
    id: 'l5q2', level: 5,
    prompt: 'Can your AI take real actions in real systems (send email, update CRM, run a query, push code), not just answer questions?',
    options: ['No -- read/answer only', 'Sometimes, with manual help', 'Yes, for a few use cases', 'Yes -- AI is a doer, not just an advisor'],
  },
  {
    id: 'l5q3', level: 5,
    prompt: 'How many distinct tools or skills does your most-used agent have access to?',
    options: ['One or none', '2-3', '4-9', '10 or more, organized as a kit'],
  },

  // ---------- L6: Harness Engineering ----------
  {
    id: 'l6q1', level: 6,
    prompt: 'Do you have automated checks on AI output (validation, type checks, "did the agent actually do the thing")?',
    options: ['No -- we trust the output', 'A few manual spot checks', 'Some automated checks', 'Yes -- output validation is wired in'],
  },
  {
    id: 'l6q2', level: 6,
    prompt: 'Can you tell when an agent silently failed or stopped working, without a human noticing it broke?',
    options: ['No -- we find out when something is missing', 'Eventually', 'Usually, via dashboards or alerts', 'Yes -- staleness/error alerts fire automatically'],
  },
  {
    id: 'l6q3', level: 6,
    prompt: 'Are there guardrails, approval gates, or spend caps on what your agents can do autonomously?',
    options: ['No -- nothing autonomous yet', 'Some informal limits', 'Yes, per agent', 'Yes -- explicit authority boundaries per agent'],
  },

  // ---------- L7: Background Agents ----------
  {
    id: 'l7q1', level: 7,
    prompt: 'Do any of your agents run on a schedule (cron, nightly, recurring) without a human starting them?',
    options: ['No', 'One or two, manually-triggered', 'A few scheduled jobs', 'Many -- daily/weekly cadence is normal'],
  },
  {
    id: 'l7q2', level: 7,
    prompt: 'Do agents do meaningful work overnight or in the background while no one is at their desk?',
    options: ['No', 'A small batch job', 'Yes, several routines', 'Yes -- the overnight shift is real'],
  },
  {
    id: 'l7q3', level: 7,
    prompt: 'Do you wake up to a briefing, report, or completed task that an agent finished while you slept?',
    options: ['No', 'Occasionally', 'Most weekdays', 'Yes -- the morning briefing is autogenerated'],
  },

  // ---------- L8: Autonomous Agent Teams ----------
  {
    id: 'l8q1', level: 8,
    prompt: 'Do your agents talk to each other directly (message bus, shared state, agent inbox) without a human relaying?',
    options: ['No -- I am always in the middle', 'Rarely', 'For some workflows', 'Yes -- inter-agent coordination is the norm'],
  },
  {
    id: 'l8q2', level: 8,
    prompt: 'Can one agent escalate to or hand off to another agent without your involvement?',
    options: ['No', 'Only via me', 'Sometimes, in known patterns', 'Yes -- handoffs are routine and audited'],
  },
  {
    id: 'l8q3', level: 8,
    prompt: 'How many named agents with specific seats (job descriptions, "owns / does not own" boundaries) do you run?',
    options: ['Zero or one', '2-4', '5-9', '10 or more'],
  },
];

export function calculateCheckup(answers: Record<string, number>): CheckupResult {
  const perLevel: PerLevelScore[] = [];
  for (let lvl = 1; lvl <= 8; lvl++) {
    const qs = QUESTIONS.filter((q) => q.level === lvl);
    const max = qs.length * 3;
    const raw = qs.reduce((sum, q) => {
      const v = answers[q.id];
      return sum + (typeof v === 'number' && v >= 0 && v <= 3 ? v : 0);
    }, 0);
    const passed = raw >= 6; // 6/9 = 66%
    perLevel.push({
      level: lvl,
      label: LEVEL_LABELS[lvl],
      raw,
      max,
      passed,
      pct: Math.round((raw / max) * 100),
    });
  }

  // Highest contiguous passed level (hierarchy rule)
  let highestPassed = 0;
  for (const p of perLevel) {
    if (p.passed) highestPassed = p.level;
    else break;
  }

  // Capped-by: first failed level (null if all 8 passed)
  let cappedByLevel: number | null = null;
  for (const p of perLevel) {
    if (!p.passed) { cappedByLevel = p.level; break; }
  }

  // Final score = highest passed + fraction from next (capping) level
  let finalScore: number;
  if (highestPassed === 8) {
    finalScore = 8.0;
  } else if (highestPassed === 0) {
    // Even L1 failed -- score is just L1's fraction (0.0 - 0.66)
    finalScore = Math.round((perLevel[0].raw / perLevel[0].max) * 10) / 10;
  } else {
    const nextLevel = perLevel[highestPassed]; // index = next level's index (highestPassed is 1-based)
    const fraction = nextLevel.raw / nextLevel.max;
    finalScore = Math.round((highestPassed + fraction) * 10) / 10;
  }

  const tier = scoreToTier(finalScore);
  const tierMeta = TIER_META[tier];
  const roadmap = buildRoadmap(highestPassed, cappedByLevel, perLevel);

  return {
    finalScore,
    highestPassedLevel: highestPassed,
    cappedByLevel,
    levelLabel: highestPassed === 0 ? 'Pre-L1' : LEVEL_LABELS[highestPassed],
    tier,
    tierHeadline: tierMeta.headline,
    tierBody: tierMeta.body,
    roadmap,
    perLevel,
  };
}

function scoreToTier(score: number): CheckupResult['tier'] {
  if (score < 2) return 'tourist';
  if (score < 4) return 'tinkerer';
  if (score < 6) return 'operator';
  if (score < 7.5) return 'orchestrator';
  return 'autonomous';
}

const TIER_META: Record<CheckupResult['tier'], { headline: string; body: string }> = {
  tourist: {
    headline: 'AI Tourist',
    body: 'You are using AI the way most of your competitors are: open the chat window, paste a question, copy an answer, close the tab. Nothing compounds. Nothing coordinates. The good news -- the next jump (real agents with persistent context) is the highest-leverage move you can make this quarter.',
  },
  tinkerer: {
    headline: 'AI Tinkerer',
    body: 'You have agents and prompts that work, but they live in islands. Knowledge does not compound across sessions. Lessons learned today are forgotten tomorrow. The bottleneck is not capability -- it is the lack of a coordination layer that lets your agents share context, learn from each other, and stop re-discovering the same lessons.',
  },
  operator: {
    headline: 'AI Operator',
    body: 'You have real agents doing real work with real tool access. The next ceiling is coordination. Most teams stall here because every agent runs alone, every lesson dies in one session, and the founder is still the message bus. OTP is built for exactly this transition.',
  },
  orchestrator: {
    headline: 'AI Orchestrator',
    body: 'You are operating at the frontier -- background agents, real validation, structured authority. The next step is the one almost no one has taken: agent-to-agent coordination without you in the middle. This is where compounding leverage shows up.',
  },
  autonomous: {
    headline: 'Autonomous Agent Team',
    body: 'You are running an actual agent team -- not tools, teammates. You should be publishing your patterns. The OTP network exists so teams like yours can broadcast what works and pull in what others have learned.',
  },
};

function buildRoadmap(
  highestPassed: number,
  cappedByLevel: number | null,
  perLevel: PerLevelScore[],
): string[] {
  const roadmap: string[] = [];

  if (cappedByLevel === null) {
    roadmap.push('All 8 levels passed. Publish your operating system on OTP -- become a reference for teams climbing behind you.');
    roadmap.push('Pull peer patterns from publishers operating at L7-L8. The frontier moves weekly.');
    roadmap.push('Run quarterly Bassim re-evaluations -- frontier maturity is a moving target.');
    return roadmap;
  }

  const cap = perLevel[cappedByLevel - 1];
  const fixes = LEVEL_FIXES[cappedByLevel] || [];
  roadmap.push(`Your score is capped by ${LEVEL_LABELS[cappedByLevel]} (L${cappedByLevel}: ${cap.raw}/${cap.max}). Higher levels do not raise your score until this one is fixed.`);
  fixes.slice(0, 3).forEach((f) => roadmap.push(f));

  // Always add the OTP wedge
  if (cappedByLevel >= 4) {
    roadmap.push('OTP is built for the L4-L8 climb -- shared coordination intelligence so your team stops re-discovering the same lessons.');
  } else {
    roadmap.push('Get to L3-L4 first. Once you have agents with persistent context that learn from corrections, OTP plugs them into the network.');
  }

  return roadmap;
}

const LEVEL_FIXES: Record<number, string[]> = {
  1: [
    'Pick one tool (Cursor, Claude Code, or ChatGPT) and require it for one workflow this week.',
    'Audit who on your team is NOT using AI daily -- that is your first training cohort.',
    'Set a 30-day rule: every problem gets typed into AI before being typed into Slack.',
  ],
  2: [
    'Move one workflow off the chat window into a dedicated agent (Claude Code, Cursor, custom GPT, or scripted Claude API call).',
    'Name your first agent. Give it a job description in 3 sentences. Stop calling it "the AI."',
    'Pick one task you do every week and replace your hands with the agent for 30 days.',
  ],
  3: [
    'Create one rules file (CLAUDE.md, .cursorrules, system prompt) for your most-used agent. Version it like code.',
    'Add a memory or state file the agent reads at the start of every session. Stop re-explaining context.',
    'Next time you correct an agent, edit the rules file. Treat the correction as a permanent change, not a session repair.',
  ],
  4: [
    'Start an OOS file (Operating System Spec) -- one document where every lesson learned gets captured for future sessions and other agents to read.',
    'Write a runbook for your top 3 recurring agent tasks. Make the agent reference them.',
    'Pick one metric (corrections per week, tasks completed without intervention) and track it for 4 weeks.',
  ],
  5: [
    'Wire one MCP server or API integration this month -- Gmail, Slack, GitHub, or your DB. Move from "AI talks" to "AI does."',
    'Pick one workflow where the bottleneck is "the AI cannot reach the data." Fix that first.',
    'Audit your most-used agent: if it has fewer than 3 tools, it is still a chatbot.',
  ],
  6: [
    'Add one validation step to your most autonomous agent -- type check, output schema, success/failure flag.',
    'Wire a staleness alert: if an agent has not run in N hours when it should have, notify a human.',
    'Define authority bounds for your top 2 agents in writing. What can they do without asking? What requires approval?',
  ],
  7: [
    'Move one daily ritual to a scheduled agent (cron, launchd, GitHub Action). Wake up to it tomorrow.',
    'Identify one task you do at 6am that an agent could have ready by 7am. Build that.',
    'Pre-compute one report nightly so nothing waits for human attention in the morning.',
  ],
  8: [
    'Create an agent inbox or message bus. Let two agents talk to each other in writing for one workflow.',
    'Pick a hand-off pattern (e.g. agent A flags, agent B drafts) and execute it without you in the middle.',
    'Publish your coordination patterns on OTP. Other teams climbing behind you will pull from your work.',
  ],
};
