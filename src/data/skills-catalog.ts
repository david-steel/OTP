// Curated skills taxonomy for the team chart editor.
//
// Each entry is a short, recognizable skill name. Grouped by category so the
// autocomplete dropdown can render section headers. Custom skills (not in the
// catalog) are still allowed and saved as-is.
//
// Adding a new category or skill: just append to the array. No migration
// needed; the saved entity field stays a flat string[].

export interface SkillsCategory {
  category: string;     // display label
  skills: string[];     // canonical names
}

export const SKILLS_CATALOG: SkillsCategory[] = [
  {
    category: 'Leadership & Strategy',
    skills: [
      'strategic planning',
      'OKRs',
      'team building',
      'hiring',
      'fundraising',
      'board management',
      'public speaking',
      'EOS',
      'change management',
      'executive coaching',
    ],
  },
  {
    category: 'Sales',
    skills: [
      'outbound prospecting',
      'discovery calls',
      'product demos',
      'closing',
      'account management',
      'channel partnerships',
      'sales engineering',
      'RFP response',
      'pipeline forecasting',
      'cold email',
      'cold calling',
      'enterprise sales',
      'PLG sales',
    ],
  },
  {
    category: 'Marketing',
    skills: [
      'SEO',
      'paid ads (Meta)',
      'paid ads (Google)',
      'paid ads (LinkedIn)',
      'content marketing',
      'email marketing',
      'brand strategy',
      'public relations',
      'copywriting',
      'growth experiments',
      'GEO (AI search optimization)',
      'community management',
      'event marketing',
      'video production',
      'podcast production',
    ],
  },
  {
    category: 'Customer Success',
    skills: [
      'customer onboarding',
      'retention',
      'expansion',
      'churn analysis',
      'support',
      'account health scoring',
      'NPS/CSAT analysis',
      'customer education',
    ],
  },
  {
    category: 'Operations',
    skills: [
      'project management',
      'vendor management',
      'finance & accounting',
      'AP/AR',
      'HR',
      'legal',
      'procurement',
      'budgeting',
      'SOP authoring',
      'process automation',
      'compliance',
    ],
  },
  {
    category: 'Engineering',
    skills: [
      'typescript',
      'javascript',
      'python',
      'go',
      'rust',
      'postgres',
      'react',
      'next.js',
      'node.js',
      'aws',
      'gcp',
      'kubernetes',
      'docker',
      'observability',
      'security',
      'frontend',
      'backend',
      'systems design',
    ],
  },
  {
    category: 'AI / ML',
    skills: [
      'prompt engineering',
      'LLM ops',
      'RAG',
      'fine-tuning',
      'agent design',
      'evals',
      'embeddings & vector search',
      'multi-agent coordination',
      'MCP server design',
    ],
  },
  {
    category: 'Creative',
    skills: [
      'graphic design',
      'UX design',
      'UI design',
      'brand identity',
      'illustration',
      'photography',
      'creative direction',
    ],
  },
  {
    category: 'Data & Analytics',
    skills: [
      'SQL',
      'dashboards',
      'ETL',
      'analytics',
      'attribution',
      'A/B testing',
      'forecasting',
      'data modeling',
      'experimentation',
    ],
  },
];
