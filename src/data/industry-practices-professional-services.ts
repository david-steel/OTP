/**
 * Professional Services Coordination Playbook
 * Original OTP content -- coordination patterns for consulting, accounting,
 * legal, and advisory firms running AI agent teams.
 */

export interface IndustryPractice {
  term: string;
  definition: string;
  category: string;
  failureMode: string;
  evidence: 'HUMAN_DEFINED_RULE' | 'OBSERVED_REPEATEDLY' | 'MEASURED_RESULT';
}

export const PROFESSIONAL_SERVICES_PRACTICES: IndustryPractice[] = [
  // ---- Engagement Management ----
  {
    term: 'Single Engagement Owner Agent',
    definition: 'Every active engagement has exactly one agent responsible for its health: timeline, budget burn, deliverable status, and client sentiment. Other agents (billing, scheduling, knowledge) feed data to the engagement owner. Nobody else sends client-facing updates about that engagement.',
    category: 'Engagement Management',
    failureMode: 'The billing agent sends a budget overage warning to the client at the same time the delivery agent sends a "project on track" update. The client sees contradictory signals and loses confidence in the firm.',
    evidence: 'HUMAN_DEFINED_RULE',
  },
  {
    term: 'Engagement Phase Gates',
    definition: 'The engagement agent enforces phase transitions: Discovery to Planning, Planning to Execution, Execution to Delivery, Delivery to Close. Each gate requires sign-off data from specific agents (scope confirmed, resources allocated, deliverables reviewed). No phase advances without the gate conditions being met.',
    category: 'Engagement Management',
    failureMode: 'A consulting team starts execution before the scope document is signed. Three weeks in, the client disputes the deliverables. The firm has to absorb $40K in rework because the planning gate was skipped.',
    evidence: 'OBSERVED_REPEATEDLY',
  },
  {
    term: 'Scope Creep Detection',
    definition: 'The engagement agent monitors hours logged against the original scope estimate by work category. When any category exceeds 120% of plan, it flags the engagement partner with a specific recommendation: raise a change order, absorb the overage, or de-scope something else.',
    category: 'Engagement Management',
    failureMode: 'A 200-hour engagement quietly grows to 340 hours. Nobody flagged it because each individual task seemed reasonable. The firm writes off $23K in unbillable time. The pattern repeats on the next engagement.',
    evidence: 'MEASURED_RESULT',
  },

  // ---- Time & Billing ----
  {
    term: 'Real-Time Utilization Tracking',
    definition: 'The billing agent tracks each consultant\'s utilization rate (billable hours / available hours) in real time, not at month-end. Target utilization varies by role: partners 40%, senior consultants 70%, associates 85%. Alerts fire when anyone drops below target for 5+ consecutive business days.',
    category: 'Time & Billing',
    failureMode: 'A senior consultant is at 35% utilization for three weeks. Nobody notices until the monthly report. By then, $18K in potential billable time is lost and cannot be recovered.',
    evidence: 'MEASURED_RESULT',
  },
  {
    term: 'Write-Off Prediction',
    definition: 'The billing agent identifies engagements trending toward write-offs by comparing actual hours to budget at each phase gate. A write-off prediction above 10% triggers a conversation about scope, staffing, or client expectations before the work is done, not after.',
    category: 'Time & Billing',
    failureMode: 'The engagement closes and the billing agent calculates a 25% write-off. Leadership is surprised. The data was there at week 3 but nobody was watching the trend.',
    evidence: 'OBSERVED_REPEATEDLY',
  },
  {
    term: 'Invoice Timing Coordination',
    definition: 'The billing agent coordinates invoice generation with the engagement agent and the client relationship agent. Invoices go out after deliverable milestones, not on arbitrary monthly cycles. The relationship agent confirms client satisfaction before the billing agent generates the invoice.',
    category: 'Time & Billing',
    failureMode: 'An invoice for $28K goes out on the 1st of the month. The client received a deliverable on the 28th that they have questions about. The invoice arrives before the questions are answered. Payment is delayed 45 days while the dispute is resolved.',
    evidence: 'OBSERVED_REPEATEDLY',
  },

  // ---- Resource Allocation ----
  {
    term: 'Skills-Based Staffing',
    definition: 'The resource agent matches available consultants to engagement needs based on skill tags, industry experience, availability windows, and current utilization. The engagement agent submits a staffing request with required skills, and the resource agent returns ranked candidates with availability and conflict checks.',
    category: 'Resource Allocation',
    failureMode: 'A partner staffs an engagement based on who they had lunch with, not who has the right skills. The consultant struggles. The client notices. The firm sends a more senior person to fix it, doubling the cost.',
    evidence: 'HUMAN_DEFINED_RULE',
  },
  {
    term: 'Bench Management',
    definition: 'When a consultant drops below 50% utilization for a week, the resource agent automatically generates a bench report: current skills, available hours, upcoming engagement starts. Partners receive this daily so they can sell unstaffed capacity before it becomes a write-off.',
    category: 'Resource Allocation',
    failureMode: 'Three associates sit on the bench for 4 weeks. Nobody markets their availability because the bench data is buried in a spreadsheet nobody updates. The firm absorbs $50K in idle cost.',
    evidence: 'MEASURED_RESULT',
  },
  {
    term: 'Conflict of Interest Check',
    definition: 'Before staffing any engagement, the resource agent checks the consultant\'s history against the new client. Competing clients in the same industry, former employer relationships, and active non-compete engagements are flagged. The compliance agent must clear the conflict before staffing is confirmed.',
    category: 'Resource Allocation',
    failureMode: 'A consultant who just finished a strategy engagement for Company A is staffed on Company B, a direct competitor. Company A discovers this and terminates their retainer. The firm loses a $200K annual relationship.',
    evidence: 'HUMAN_DEFINED_RULE',
  },

  // ---- Client Relationship ----
  {
    term: 'Touch Frequency by Revenue Tier',
    definition: 'The relationship agent enforces minimum touch frequency based on client revenue tier. Tier 1 (top 20%): weekly. Tier 2 (middle 50%): biweekly. Tier 3 (bottom 30%): monthly. A "touch" is a substantive interaction, not an automated email. The agent flags clients below their minimum frequency.',
    category: 'Client Relationship',
    failureMode: 'A $500K client has not heard from anyone at the firm in 6 weeks. They feel neglected. A competitor reaches out with a proposal. The firm finds out when the client does not renew.',
    evidence: 'OBSERVED_REPEATEDLY',
  },
  {
    term: 'Expansion Signal Detection',
    definition: 'The relationship agent monitors engagement outcomes, client org changes (new hires, restructuring, M&A announcements), and satisfaction signals. When expansion indicators are strong, it alerts the partner with a specific upsell recommendation and suggested timing.',
    category: 'Client Relationship',
    failureMode: 'A client hires a new CTO and restructures their technology team. This is a perfect trigger for a technology strategy engagement. Nobody at the firm notices for 3 months. A competitor wins the work.',
    evidence: 'HUMAN_DEFINED_RULE',
  },
  {
    term: 'Client Feedback Loop',
    definition: 'The relationship agent sends a brief satisfaction pulse (3 questions max) at each engagement phase gate. Results are shared with the engagement owner and the partner. Declining satisfaction triggers an immediate conversation, not a quarterly review.',
    category: 'Client Relationship',
    failureMode: 'The client is unhappy at week 4 but nobody asks. At the end of the engagement, the NPS is 4/10. The firm loses the relationship and never learns what went wrong until the exit survey nobody reads.',
    evidence: 'MEASURED_RESULT',
  },

  // ---- Knowledge Management ----
  {
    term: 'Engagement Lessons Capture',
    definition: 'At engagement close, the knowledge agent generates a lessons-learned document from the engagement data: what worked, what was harder than expected, tools/frameworks that helped, client-specific context worth preserving. This happens automatically, not as a manual debrief that gets skipped.',
    category: 'Knowledge Management',
    failureMode: 'The firm has done 15 digital transformation engagements. Each one starts from scratch because nobody captured what worked on the previous ones. The 16th engagement makes the same mistakes as the 3rd.',
    evidence: 'OBSERVED_REPEATEDLY',
  },
  {
    term: 'Proposal Knowledge Reuse',
    definition: 'When a new proposal is created, the knowledge agent searches past proposals for similar engagements (industry, scope, client size). It surfaces relevant case studies, pricing precedents, and staffing patterns. Proposal writers start from institutional knowledge, not blank pages.',
    category: 'Knowledge Management',
    failureMode: 'A partner spends 8 hours writing a proposal for a healthcare analytics engagement. The firm did almost the same engagement 6 months ago. The proposal exists on someone\'s laptop. $1,300 in partner time wasted.',
    evidence: 'MEASURED_RESULT',
  },
  {
    term: 'Expert Finder',
    definition: 'The knowledge agent maintains a skills graph of all consultants based on engagement history, certifications, publications, and self-declared expertise. When a client asks "do you have someone who has done X?", the answer takes 30 seconds, not 3 days of emails.',
    category: 'Knowledge Management',
    failureMode: 'A prospect asks if the firm has Salesforce CPQ experience. The partner says "let me check" and emails 20 people. Four days later, they confirm they have 3 experts. The prospect already hired a boutique firm that answered in an hour.',
    evidence: 'OBSERVED_REPEATEDLY',
  },

  // ---- Proposal Pipeline ----
  {
    term: 'Pipeline Velocity Tracking',
    definition: 'The pipeline agent tracks every proposal from creation to decision: days in each stage, conversion rates by industry and service line, average deal size, and win/loss reasons. Partners see their pipeline health in real time, not in quarterly reviews.',
    category: 'Pipeline',
    failureMode: 'The firm\'s pipeline shows $3M in proposals. Average age is 90 days. Half of them are stale. The real pipeline is $800K. The firm does not hire because the pipeline looks full. Revenue drops 30% next quarter.',
    evidence: 'MEASURED_RESULT',
  },
  {
    term: 'Competitive Intelligence on Active Deals',
    definition: 'When a proposal is in flight, the pipeline agent monitors for signals that the prospect is also evaluating competitors: LinkedIn connections, event attendance, public RFP postings. The partner gets an early warning rather than a surprise loss.',
    category: 'Pipeline',
    failureMode: 'The firm submits a $200K proposal and waits 3 weeks for a response. The prospect chose a competitor 2 weeks ago but has not informed the firm. The partner is still forecasting the deal as "likely."',
    evidence: 'HUMAN_DEFINED_RULE',
  },

  // ---- Compliance ----
  {
    term: 'Regulatory Calendar',
    definition: 'For firms in regulated industries (accounting, legal, financial advisory), the compliance agent maintains a calendar of regulatory deadlines per client. Filing dates, audit windows, disclosure requirements. Alerts fire 30, 14, and 3 days before each deadline.',
    category: 'Compliance',
    failureMode: 'A tax filing deadline is missed for a client because the deadline tracker is a spreadsheet that was not updated after the IRS changed the date. The firm pays the penalty and the client relationship is damaged.',
    evidence: 'OBSERVED_REPEATEDLY',
  },
  {
    term: 'Confidentiality Wall Enforcement',
    definition: 'The compliance agent enforces information barriers between engagements that involve competing clients. Consultants on one side of the wall cannot access documents, communications, or data from the other side. The resource agent checks walls before any staffing assignment.',
    category: 'Compliance',
    failureMode: 'A consultant working on Client A\'s pricing strategy accidentally accesses Client B\'s competitive analysis. Both are in the same industry. The breach is discovered during an audit. The firm faces legal action from both clients.',
    evidence: 'HUMAN_DEFINED_RULE',
  },

  // ---- Operations ----
  {
    term: 'Weekly Practice Area Health',
    definition: 'Each practice area (strategy, technology, operations, etc.) gets a weekly health report from the operations agent: utilization, pipeline, active engagements, write-off risk, bench time, client satisfaction trends. Practice leads see their business unit in one view.',
    category: 'Operations',
    failureMode: 'The technology practice is 40% utilized while the strategy practice is at 110% and burning people out. Nobody sees the cross-practice imbalance because each practice tracks its own metrics in isolation.',
    evidence: 'MEASURED_RESULT',
  },
  {
    term: 'Partner Time Protection',
    definition: 'Partners must split time between client delivery, business development, and firm management. The operations agent tracks the ratio and flags when any partner spends more than 60% on delivery (starving the pipeline) or less than 30% (clients feel abandoned).',
    category: 'Operations',
    failureMode: 'A partner is 80% delivery because they love the work. Business development stops. Six months later, when current engagements end, their pipeline is empty. Revenue drops 50% for their practice.',
    evidence: 'OBSERVED_REPEATEDLY',
  },
  {
    term: 'Cross-Sell Coordination',
    definition: 'When an engagement surfaces an opportunity in a different practice area, the engagement agent routes it to the right practice lead with full context: what the client needs, who the relationship owner is, and what the timing looks like. No cold handoffs.',
    category: 'Operations',
    failureMode: 'A technology consultant discovers the client needs a strategy review. They mention it to a strategy partner in passing at lunch. The lead goes cold because nobody followed up with context. $150K opportunity lost.',
    evidence: 'OBSERVED_REPEATEDLY',
  },
];

export const PROFESSIONAL_SERVICES_INDUSTRY_META = {
  slug: 'professional-services',
  name: 'Professional Services',
  description: 'Coordination practices for consulting, accounting, legal, and advisory firms running AI agent teams. Covers engagement management, utilization tracking, knowledge reuse, compliance walls, and client relationship orchestration.',
  practiceCount: PROFESSIONAL_SERVICES_PRACTICES.length,
  icon: 'academic-cap',
};
