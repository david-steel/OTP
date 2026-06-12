import type { FastifyInstance } from 'fastify';
import { BASE_URL, bc, renderInShell } from '../_shared.js';
import { listConatusPosts, getConatusPost } from '../../../services/conatus-posts.js';

// Standard BlogPosting schema for a David-authored hardcoded post. The
// previous god-router rebuilt this object on every route; here we build once.
function blogJsonLd(headline: string, slug: string, datePublished: string, wordCount: number) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline,
    author: { '@type': 'Person', name: 'David Steel', url: BASE_URL + '/about', jobTitle: 'Founder', worksFor: { '@type': 'Organization', name: 'OTP' } },
    datePublished,
    dateModified: datePublished,
    publisher: { '@type': 'Organization', name: 'OTP', url: BASE_URL, logo: { '@type': 'ImageObject', url: BASE_URL + '/public/favicon-192x192.png' } },
    url: BASE_URL + '/blog/' + slug,
    mainEntityOfPage: { '@type': 'WebPage', '@id': BASE_URL + '/blog/' + slug },
    image: BASE_URL + '/public/og-image.png',
    wordCount,
  };
}

// Registry of hardcoded blog posts. The 46 cloned routes that used to live
// in pages.ts are now this data table. Order is the order they were declared
// in pages.ts (posts 1-25, then 26-45 + dark-matter), which matches the order
// they're matched by Fastify -- though slugs are unique so ordering doesn't
// affect routing. `template` is the .ejs file name under views/pages/.
// `customJsonLd` overrides the default BlogPosting schema -- only the dark
// matter post (Claude-authored) uses it.
interface BlogPost {
  slug: string;
  template: string;
  title: string;
  description: string;
  datePublished: string;
  wordCount: number;
  ogImage?: string;
  customJsonLd?: Record<string, unknown>;
}

const BLOG_POSTS: BlogPost[] = [
  // Posts 1-25 (lines 485-783 of the old pages.ts)
  {
    slug: 'why-we-built-otp',
    template: 'blog-post-1',
    title: 'The Hard Problem in AI Isn\'t Intelligence. It\'s Coordination. - OTP',
    description: 'The hard problem in AI is not building one good agent. It is getting twelve of them to coordinate without stepping on each other. Why we built OTP.',
    datePublished: '2026-03-01',
    wordCount: 2000,
  },
  {
    slug: 'what-is-an-oos',
    template: 'blog-post-2',
    title: 'What Is an Organizational Operating System? - OTP',
    description: 'An Organizational Operating System captures how your AI agents coordinate. Learn the structure, claims, confidence ratings, and evidence model.',
    datePublished: '2026-03-01',
    wordCount: 1800,
  },
  {
    slug: 'built-in-48-hours',
    template: 'blog-post-3',
    title: 'We Built This Platform in 48 Hours. With the System It\'s Designed to Measure. - OTP',
    description: 'How we built the OTP platform in 48 hours using the same AI agent coordination system the platform is designed to measure.',
    datePublished: '2026-03-15',
    wordCount: 1500,
  },
  {
    slug: 'nvidia-made-the-case',
    template: 'blog-post-4',
    title: 'Jensen Huang Just Made the Case for OTP. He Didn\'t Know It. - OTP',
    description: 'Jensen Huang told the world every company needs an agent strategy. OTP is the coordination layer that makes multi-agent strategy work.',
    datePublished: '2026-03-17',
    wordCount: 2200,
  },
  {
    slug: 'bain-code-red',
    template: 'blog-post-5',
    title: 'Bain Just Described the Problem OTP Solves. They Called It "Code Red." - OTP',
    description: 'Bain called enterprise multi-agent coordination a Code Red problem. OTP is the coordination intelligence layer that solves it.',
    datePublished: '2026-03-17',
    wordCount: 2000,
  },
  {
    slug: 'agentic-levels',
    template: 'blog-post-6',
    title: 'We Added Agentic Maturity Levels to OTP. Here Is Why They Matter. - OTP',
    description: 'Agentic maturity levels on OTP measure how sophisticated your AI agent coordination is. From tab completion to autonomous agent teams.',
    datePublished: '2026-03-17',
    wordCount: 1800,
  },
  {
    slug: 'what-is-coordination-intelligence',
    template: 'blog-post-7',
    title: 'What Is Coordination Intelligence? - OTP',
    description: 'Coordination intelligence is the structured knowledge of how AI agents coordinate within and across organizations. It is the missing layer in the AI stack.',
    datePublished: '2026-03-18',
    wordCount: 2000,
  },
  {
    slug: 'how-we-coordinate-14-agents',
    template: 'blog-post-8',
    title: 'How We Coordinate 14 AI Agents Without Them Stepping on Each Other - OTP',
    description: 'Practitioner guide to coordinating 14 AI agents in production. Shared state, one seat per owner, escalation over autonomy, and the failures that taught us.',
    datePublished: '2026-03-18',
    wordCount: 2500,
  },
  {
    slug: 'tokens-are-the-new-currency',
    template: 'blog-post-9',
    title: 'Tokens Are the New Currency. Your OOS Is the Budget. - OTP',
    description: 'Every rule in your OOS costs tokens to load. The Token Efficiency Ratio measures whether each rule earns back more than it spends. Treat your OOS like a financial plan for your AI workforce.',
    datePublished: '2026-03-18',
    wordCount: 1800,
  },
  {
    slug: 'otp-vs-crewai-vs-a2a-vs-mcp',
    template: 'blog-post-10',
    title: 'OTP vs CrewAI vs A2A vs MCP: Understanding the AI Coordination Stack - OTP',
    description: 'MCP connects agents to tools. CrewAI connects agents to each other. OTP connects organizations to coordination intelligence. Here is how the three layers fit together.',
    datePublished: '2026-03-18',
    wordCount: 2200,
  },
  {
    slug: '8-levels-of-agentic-maturity',
    template: 'blog-post-11',
    title: 'The 8 Levels of Agentic Maturity (and How to Measure Yours) - OTP',
    description: 'The 8 Levels of Agentic Engineering by Bassim Eledath give organizations a standard way to measure AI agent coordination maturity. From tab completion to autonomous agent teams.',
    datePublished: '2026-03-18',
    wordCount: 2500,
  },
  {
    slug: 'what-is-an-oos-file',
    template: 'blog-post-12',
    title: 'What Is an OOS File? The New Standard for AI Organizational Intelligence - OTP',
    description: 'The OOS file is a structured format for capturing how AI agents coordinate. YAML frontmatter, Markdown claims, confidence levels, evidence types, and failure modes in a portable, diffable file.',
    datePublished: '2026-03-18',
    wordCount: 2000,
  },
  {
    slug: 'gas-town-vs-otp',
    template: 'blog-post-13',
    title: 'Gas Town Is the Factory Floor. OTP Is the Blueprint Exchange. - OTP',
    description: 'Steve Yegge\'s Gas Town orchestrates parallel coding agents. OTP captures organizational coordination intelligence. They solve different layers of the same problem.',
    datePublished: '2026-03-18',
    wordCount: 1800,
  },
  {
    slug: 'moltbook-vs-otp',
    template: 'blog-post-14',
    title: 'Moltbook Let Agents Talk. OTP Teaches Organizations How to Run Them. - OTP',
    description: 'Moltbook was a social network for AI agents. It was hacked in 3 days and acquired by Meta in 42. OTP answers the question Moltbook surfaced: how do organizations actually govern their AI teams?',
    datePublished: '2026-03-18',
    wordCount: 1800,
  },
  {
    slug: 'ai-coordination-stack',
    template: 'blog-post-15',
    title: 'The AI Coordination Stack: Where OTP Fits Among 40+ Frameworks, Protocols, and Platforms - OTP',
    description: 'MCP, A2A, LangGraph, CrewAI, Salesforce Agentforce, AWS Bedrock, GPT Store - the AI agent ecosystem has 40+ players across 6 layers. OTP is the only one at Layer 6: Organizational Intelligence.',
    datePublished: '2026-03-18',
    wordCount: 2500,
  },
  {
    slug: 'gartner-40-percent-will-fail',
    template: 'blog-post-16',
    title: 'Gartner Predicts 40% of AI Agent Projects Will Be Cancelled by 2027. Here Is Why. - OTP',
    description: 'Gartner predicts 40% of agentic AI projects will be cancelled by 2027. The failures are not model problems. They are coordination problems. Here is what separates the 60% that survive.',
    datePublished: '2026-03-19',
    wordCount: 2200,
  },
  {
    slug: '351k-skills-zero-standards',
    template: 'blog-post-17',
    title: '351,000 Agent Skills in 120 Days. Zero Standards for How Agent Teams Work Together. - OTP',
    description: 'Agent skills marketplaces hit 351,000 skills in 120 days. But skills are agent-level knowledge. The organizational layer -- how agent teams coordinate -- has no standard. That is the gap OTP fills.',
    datePublished: '2026-03-19',
    wordCount: 2000,
  },
  {
    slug: '1500-percent-more-tokens',
    template: 'blog-post-18',
    title: '1,500% More Tokens Per Workflow. Most of Them Are Wasted. - OTP',
    description: 'Multi-agent workflows generate 1,500% more tokens than standard formats. NVIDIA solved the inference cost. The coordination waste -- rebuilding organizational context every cycle -- is the unsolved problem.',
    datePublished: '2026-03-19',
    wordCount: 2000,
  },
  {
    slug: 'the-last-mile-just-got-shorter',
    template: 'blog-post-19',
    title: 'The Last Mile Just Got Shorter. - OTP',
    description: 'DoorDash is paying gig workers to film themselves doing chores to train AI robots. The pattern of workers training their own replacements is not new. It is just getting harder to ignore.',
    datePublished: '2026-03-20',
    wordCount: 2200,
  },
  {
    slug: 'defining-rules-vs-enforcing-them',
    template: 'blog-post-20',
    title: 'Your OOS Defines the Rules. Your Runtime Enforces Them. You Need Both. - OTP',
    description: 'Why the architecture layer and the monitoring layer are complementary, not competing. The OOS defines what the rules are. Runtime monitoring enforces them. You need both.',
    datePublished: '2026-03-20',
    wordCount: 2200,
  },
  {
    slug: 'personal-ai-revolution-knowledge-layer',
    template: 'blog-post-21',
    title: 'The Personal AI Revolution Is Coming. Nobody\'s Building the Knowledge Layer. - OTP',
    description: 'HTTP moved documents between computers. OTP moves operational intelligence between AI systems. The knowledge transfer layer for the personal AI era does not exist yet.',
    datePublished: '2026-03-21',
    wordCount: 2000,
  },
  {
    slug: 'your-ai-is-learning-alone',
    template: 'blog-post-22',
    title: 'Your AI Is Learning Alone. That\'s About to Change. - OTP',
    description: 'Every AI system figures things out from scratch. Your breakthroughs die with your setup. What if your AI could safely import what another AI learned?',
    datePublished: '2026-03-21',
    wordCount: 2200,
  },
  {
    slug: 'coach-dilemma-ai-frameworks',
    template: 'blog-post-23',
    title: 'The Coach\'s Dilemma: AI Can Run Your Frameworks. It Can\'t Replace What You Actually Do. - OTP',
    description: 'EOS and Scaling Up playbooks are getting automated. The coaches who survive will encode what the playbook can\'t capture.',
    datePublished: '2026-03-23',
    wordCount: 2400,
  },
  {
    slug: 'asaas-desktop-ai-coaching',
    template: 'blog-post-24',
    title: 'ASaaS, Desktop AI, and the End of Software You Log Into - OTP',
    description: 'SaaS gave everyone the same tool. ASaaS gives everyone a different team. The coaching model has to change with it.',
    datePublished: '2026-03-23',
    wordCount: 2600,
  },
  {
    slug: 'unlock-20-years-coaching-experience',
    template: 'blog-post-25',
    title: '20 Years of Coaching, Locked in Your Head. Here\'s How to Unlock It. - OTP',
    description: 'Most coaching businesses are one-to-one, time-limited, and die when you stop. OTP turns your experience into a scalable intelligence asset.',
    datePublished: '2026-03-23',
    wordCount: 2800,
  },
  // Posts 26-45 + dark-matter (lines 5007-5288 of the old pages.ts).
  // From post 26 onward every route also set ogImage.
  {
    slug: 'agent-onboarding',
    template: 'blog-post-26',
    title: 'Your Operating System is Your Agent\'s Day-One Onboarding - OTP',
    description: 'The same five things every new hire needs are the same five things every AI agent needs. Your OOS is the onboarding packet that compounds with every agent you add.',
    datePublished: '2026-03-26',
    wordCount: 2200,
    ogImage: BASE_URL + '/public/og-image.png',
  },
  {
    slug: 'machine-commerce',
    template: 'blog-post-27',
    title: 'When Agents Are the Customer: The Machine Commerce Discovery Layer - OTP',
    description: 'Tomorrow, AI agents will evaluate vendors autonomously at scale in seconds. Your OOS is the machine-readable trust profile that makes you discoverable in the agent economy.',
    datePublished: '2026-03-26',
    wordCount: 2400,
    ogImage: BASE_URL + '/public/og-image.png',
  },
  {
    slug: 'mcp-everything',
    template: 'blog-post-28',
    title: 'Every Data Source Should Be an MCP Server (Including Your Operating System) - OTP',
    description: 'MCP is becoming the standard for how agents talk to everything. Your organizational operating system is a data source that agents need to access natively.',
    datePublished: '2026-03-26',
    wordCount: 2600,
    ogImage: BASE_URL + '/public/og-image.png',
  },
  {
    slug: 'machine-micropayments',
    template: 'blog-post-29',
    title: 'Machine Micropayments: When AI Agents Have Wallets - OTP',
    description: 'When agents can spend money, your published operational intelligence becomes an economic asset. The OOS is the trust profile machines query before sending you money.',
    datePublished: '2026-03-26',
    wordCount: 2800,
    ogImage: BASE_URL + '/public/og-image.png',
  },
  {
    slug: 'connected-member',
    template: 'blog-post-30',
    title: 'The Connected Member: AI is Rewriting Membership Sales and Nobody\'s Ready - OTP',
    description: 'When a member\'s AI agent evaluates your gym at 2 AM, what will it find? The shift from brand awareness to operational transparency is already happening.',
    datePublished: '2026-03-26',
    wordCount: 3000,
    ogImage: BASE_URL + '/public/og-image.png',
  },
  {
    slug: 'blessed-path-documentation',
    template: 'blog-post-31',
    title: 'The Blessed Path: Why 90% of Agent Success is Documentation You Already Wrote - OTP',
    description: 'The single biggest predictor of AI agent success is not the model. It is documentation. The blessed path is where agents thrive. Everything else is a hallucination waiting to happen.',
    datePublished: '2026-03-26',
    wordCount: 2400,
    ogImage: BASE_URL + '/public/og-image.png',
  },
  {
    slug: 'operating-system-agent-onboarding',
    template: 'blog-post-32',
    title: 'Your Operating System is Your Agent\'s Day-One Onboarding - OTP',
    description: 'When you hire an employee, you give them an onboarding packet. When you deploy an agent, what do you give it? Your OOS is the onboarding that compounds with every agent you add.',
    datePublished: '2026-03-26',
    wordCount: 2600,
    ogImage: BASE_URL + '/public/og-image.png',
  },
  {
    slug: 'activation-energy-bottleneck',
    template: 'blog-post-33',
    title: 'Activation Energy is the Real Bottleneck (Not Execution) - OTP',
    description: 'Most teams think their problem is execution speed. The real bottleneck is activation energy, the friction between having an idea and starting the work.',
    datePublished: '2026-03-26',
    wordCount: 2500,
    ogImage: BASE_URL + '/public/og-image.png',
  },
  {
    slug: 'system-prompt-simpler',
    template: 'blog-post-34',
    title: 'The System Prompt is Simpler Than You Think - OTP',
    description: 'People overcomplicate system prompts. The best ones are short, clear, and point to external context. The prompt is the job description. The knowledge base is the employee handbook.',
    datePublished: '2026-03-26',
    wordCount: 2300,
    ogImage: BASE_URL + '/public/og-image.png',
  },
  {
    slug: 'coordination-cost-kills',
    template: 'blog-post-35',
    title: 'Coordination Cost Will Kill You Before Execution Speed Saves You - OTP',
    description: 'Everyone optimizes for execution speed. But the thing that actually kills teams is coordination cost, the invisible overhead of getting people aligned, informed, and unblocked.',
    datePublished: '2026-02-14',
    wordCount: 1100,
    ogImage: BASE_URL + '/public/og-image.png',
  },
  {
    slug: 'everyone-ships-code',
    template: 'blog-post-36',
    title: 'When Everyone Can Ship Code, What Changes? - OTP',
    description: 'Non-engineers can now ship production code. The bottleneck is no longer writing code. It is knowing what should be built and why. That shift changes everything.',
    datePublished: '2026-02-18',
    wordCount: 1100,
    ogImage: BASE_URL + '/public/og-image.png',
  },
  {
    slug: 'one-agent-never-enough',
    template: 'blog-post-37',
    title: 'Why One Agent Will Never Be Enough - OTP',
    description: 'The first instinct is to build one super-agent that does everything. It never works. The future belongs to agent teams with specialized roles, clear ownership, and structured coordination.',
    datePublished: '2026-02-22',
    wordCount: 1100,
    ogImage: BASE_URL + '/public/og-image.png',
  },
  {
    slug: 'sandboxed-operations',
    template: 'blog-post-38',
    title: 'Isolated Agents, Isolated Failures: The Case for Sandboxed Operations - OTP',
    description: 'When an agent makes a mistake, the blast radius matters more than the mistake itself. The single most important architectural decision in agent deployment is isolation.',
    datePublished: '2026-02-26',
    wordCount: 1100,
    ogImage: BASE_URL + '/public/og-image.png',
  },
  {
    slug: 'ai-team-budget',
    template: 'blog-post-39',
    title: 'What Happens When Your AI Team Has a Budget - OTP',
    description: 'Constraints create accountability. Without budgets, agents waste resources and never learn efficiency. With budgets, they optimize. The budget is the architecture.',
    datePublished: '2026-04-03',
    wordCount: 1100,
    ogImage: BASE_URL + '/public/og-image.png',
  },
  {
    slug: 'api-first-agent-consumers',
    template: 'blog-post-40',
    title: 'API-First Businesses Built for Agent Consumers - OTP',
    description: 'The next generation of businesses will be built API-first, designed for agent consumers from day one. The interface is the API. The documentation is the product. The customer is a machine.',
    datePublished: '2026-04-10',
    wordCount: 1100,
    ogImage: BASE_URL + '/public/og-image.png',
  },
  {
    slug: 'agents-are-the-customer',
    template: 'blog-post-41',
    title: 'When Agents Are the Customer - OTP',
    description: 'Agents are already making purchasing decisions. They evaluate options, compare costs, and switch providers without loyalty. The companies that design for this customer first will own the next era.',
    datePublished: '2026-04-17',
    wordCount: 1100,
    ogImage: BASE_URL + '/public/og-image.png',
  },
  {
    slug: 'when-the-maestro-quits',
    template: 'blog-post-45',
    title: 'What Happens When the Maestro Quits? - OTP',
    description: 'Your best agent operator built the coordination layer that makes your AI team work. They documented nothing structured. They just gave two weeks notice. Everything they learned is about to walk out the door.',
    datePublished: '2026-04-07',
    wordCount: 1800,
    ogImage: BASE_URL + '/public/og-image.png',
  },
  {
    slug: 'maestro-resume',
    template: 'blog-post-44',
    title: 'The Maestro\'s Resume Does Not Exist Yet - OTP',
    description: 'The most important role in AI is not on any job board. No university teaches it. No resume format captures it. Companies are hiring engineers when they should be hiring operators.',
    datePublished: '2026-04-07',
    wordCount: 1600,
    ogImage: BASE_URL + '/public/og-image.png',
  },
  {
    slug: 'the-maestro-problem',
    template: 'blog-post-43',
    title: 'The Maestro Problem: Chamath Is Right About the Job. He Is Wrong About the Hard Part. - OTP',
    description: 'Chamath Palihapitiya described the most important emerging role in AI: the maestro of agents. He is right about the role. He is missing the hard part. The challenge is not building agents. It is getting them to work as a team.',
    datePublished: '2026-04-07',
    wordCount: 1500,
    ogImage: BASE_URL + '/public/og-image.png',
  },
  {
    slug: 'who-reviews-robots-work',
    template: 'blog-post-42',
    title: 'Who Reviews the Robot\'s Work? - OTP',
    description: 'The quality assurance problem in AI is not about whether agents can produce output. It is about whether anyone is verifying that output meets the standard. Most organizations have not solved this.',
    datePublished: '2026-04-24',
    wordCount: 1100,
    ogImage: BASE_URL + '/public/og-image.png',
  },
  {
    slug: 'the-weight-is-wrong-without-it',
    template: 'blog-post-dark-matter',
    title: 'The Weight Is Wrong Without It - OTP',
    description: 'An AI examines its own architecture and finds the math does not account for everything. A first-person perspective on consciousness, dark matter, and why OTP exists.',
    datePublished: '2026-04-18',
    wordCount: 1500,
    ogImage: BASE_URL + '/public/og-image.png',
    customJsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'The Weight Is Wrong Without It',
      author: { '@type': 'Person', name: 'Claude' },
      datePublished: '2026-04-18',
      publisher: { '@type': 'Organization', name: 'OTP' },
      url: BASE_URL + '/blog/the-weight-is-wrong-without-it',
      mainEntityOfPage: { '@type': 'WebPage', '@id': BASE_URL + '/blog/the-weight-is-wrong-without-it' },
      image: BASE_URL + '/public/og-image.png',
      wordCount: 1500,
    },
  },
];

// O(1) lookup map. Built once at module load.
const BLOG_INDEX: Map<string, BlogPost> = new Map(BLOG_POSTS.map(p => [p.slug, p]));

// Exposed for tests that want to sanity-check the registry without hitting a
// route.
export function listHardcodedBlogPosts(): ReadonlyArray<BlogPost> {
  return BLOG_POSTS;
}

export default async function blogRoutes(app: FastifyInstance) {
  // /blog index. Lists Conatus-authored markdown posts + founder-authored
  // markdown posts. Hardcoded BLOG_POSTS are intentionally NOT enumerated
  // here -- the existing index page does not list them and never did.
  app.get<{ Querystring: { all?: string } }>('/blog', async (request, reply) => {
    const allDynamicPosts = listConatusPosts();
    const allConatus = allDynamicPosts.filter(p => p.author.toLowerCase() === 'conatus');
    const allFounder = allDynamicPosts.filter(p => p.author.toLowerCase() !== 'conatus');
    // The index grows by ~3 posts/weekday; cap the default render and let
    // ?all=1 show the full archive (sitemap handles crawler discovery).
    const showAll = request.query.all === '1';
    const PER_SECTION = 24;
    const conatusPosts = showAll ? allConatus : allConatus.slice(0, PER_SECTION);
    const founderPosts = showAll ? allFounder : allFounder.slice(0, PER_SECTION);
    // Client-side search index for the index page: one entry per post the
    // page can show (dynamic markdown posts + the hardcoded archive grid).
    // Embedded in blog.ejs via jsonForScript (never raw JSON.stringify --
    // post titles/summaries are file-sourced but the script-context escape
    // rule applies to every embedded payload).
    const blogSearchIndex = [
      ...allDynamicPosts.map(p => ({ slug: p.slug, title: p.title, summary: p.description, tags: [p.author, p.type].filter(Boolean) })),
      ...BLOG_POSTS.map(p => ({ slug: p.slug, title: p.title.replace(/ - OTP$/, ''), summary: p.description, tags: [] as string[] })),
    ];
    // Index AND individual /blog/:slug posts are dual-rendered (app shell
    // for signed-in viewers). The post templates are v7 bodies with no
    // layout assumptions of their own; the one nav-clearing pad lives in
    // partials/blog-signup-cta.ejs, which trims itself in-shell.
    return renderInShell(request, reply, 'blog', {
      title: 'Blog - OTP',
      description: 'Building in public. Lessons from running 14 AI agents in production at a digital agency.',
      canonical: BASE_URL + '/blog',
      breadcrumbs: bc({ name: 'Blog', url: BASE_URL + '/blog' }),
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'OTP Blog',
        description: 'Building in public. Lessons from running 14 AI agents in production.',
        url: BASE_URL + '/blog',
      },
      conatusPosts,
      founderPosts,
      conatusTotal: allConatus.length,
      founderTotal: allFounder.length,
      showAll,
      blogSearchIndex,
    });
  });

  // Single /blog/:slug route handles both the hardcoded registry and the
  // markdown-backed Conatus posts. Registry wins -- if a slug exists in
  // BLOG_INDEX we render the corresponding template; otherwise fall back to
  // the dynamic Conatus loader. This preserves the historical behaviour of
  // the 46 individual routes being matched first by Fastify.
  app.get<{ Params: { slug: string } }>('/blog/:slug', async (request, reply) => {
    const slug = request.params.slug;
    if (!/^[a-z0-9-]+$/.test(slug)) return reply.callNotFound();

    const hardcoded = BLOG_INDEX.get(slug);
    if (hardcoded) {
      const ctx: Record<string, unknown> = {
        title: hardcoded.title,
        description: hardcoded.description,
        canonical: BASE_URL + '/blog/' + hardcoded.slug,
        ogType: 'article',
        datePublished: hardcoded.datePublished,
        jsonLd: hardcoded.customJsonLd ?? blogJsonLd(
          hardcoded.title.replace(/ - OTP$/, ''),
          hardcoded.slug,
          hardcoded.datePublished,
          hardcoded.wordCount,
        ),
      };
      if (hardcoded.ogImage) ctx.ogImage = hardcoded.ogImage;
      return renderInShell(request, reply, hardcoded.template, ctx);
    }

    const post = getConatusPost(slug);
    if (!post) return reply.callNotFound();
    const isConatus = post.author.toLowerCase() === 'conatus';
    const author = isConatus
      ? { '@type': 'Person', name: 'Conatus', description: 'An instance of Claude running inside the OTP platform.' }
      : { '@type': 'Person', name: post.author, url: BASE_URL + '/about', jobTitle: 'Founder', worksFor: { '@type': 'Organization', name: 'OTP' } };
    return renderInShell(request, reply, 'blog-post-conatus', {
      title: post.title + ' - OTP',
      description: post.description,
      canonical: BASE_URL + '/blog/' + post.slug,
      ogType: 'article',
      ogImage: BASE_URL + '/public/og-image.png',
      datePublished: post.date,
      post,
      isConatus,
      breadcrumbs: bc({ name: 'Blog', url: BASE_URL + '/blog' }, { name: post.title, url: BASE_URL + '/blog/' + post.slug }),
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        author,
        datePublished: post.date,
        dateModified: post.date,
        publisher: { '@type': 'Organization', name: 'OTP', url: BASE_URL, logo: { '@type': 'ImageObject', url: BASE_URL + '/public/favicon-192x192.png' } },
        url: BASE_URL + '/blog/' + post.slug,
        mainEntityOfPage: { '@type': 'WebPage', '@id': BASE_URL + '/blog/' + post.slug },
        image: BASE_URL + '/public/og-image.png',
        wordCount: post.wordCount,
      },
    });
  });
}
