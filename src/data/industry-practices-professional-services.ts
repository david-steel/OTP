/**
 * Professional Services Coordination Playbook
 * Original OTP content -- coordination practices for AI agent teams
 * managing professional services firms.
 *
 * Covers: consulting engagement management, time tracking, resource allocation,
 * client reporting, knowledge management, and proposal pipeline.
 *
 * These are real coordination practices, not scraped content.
 */

import { IndustryPractice } from './industry-practices-agency.js';

export const PROFESSIONAL_SERVICES_PRACTICES: IndustryPractice[] = [
  // ---- Resource Allocation ----
  {
    term: 'Utilization Target Coordination Between Sales and Delivery',
    definition: 'The sales agent and the resource agent must share a real-time view of team capacity before any new engagement is sold. The sales agent cannot close a project starting next Monday if the resource agent shows 0 available senior consultants until next month. Target utilization is 70-80%. Below 70% the firm is losing money. Above 85% the firm is burning people out and cannot absorb scope changes.',
    category: 'Resource Allocation',
    failureMode: 'The sales agent closes a $150K engagement starting in 2 weeks. The resource agent has no senior consultants available. The firm staffs the project with a junior team. The client expected senior expertise. Deliverable quality drops. The client escalates at week 3. The firm eats $30K in rework.',
    evidence: 'OBSERVED_REPEATEDLY',
  },
  {
    term: 'Bench Time Optimization Agent',
    definition: 'When a consultant is between engagements (on the bench), the resource agent immediately notifies: the training agent (assign skill development), the sales agent (this person is available for new work), and the knowledge agent (assign knowledge base contributions). Bench time is not idle time. It is investment time. But only if someone coordinates the investment.',
    category: 'Resource Allocation',
    failureMode: 'A senior consultant finishes an engagement on Friday. Their next project starts in 3 weeks. For 3 weeks, they sit idle, check email, and attend optional meetings. The firm pays $12K in salary for those weeks. A coordinated bench program would have them completing a certification, writing a case study, or shadowing a sales call.',
    evidence: 'MEASURED_RESULT',
  },
  {
    term: 'Skill-Based Staffing with Conflict Checks',
    definition: 'The resource agent matches consultants to engagements based on: required skills, industry experience, client relationship history, and conflict-of-interest checks (consultant recently worked for a competitor of this client). The staffing recommendation goes to the resource manager for approval. No consultant is assigned based on availability alone. A wrong-fit consultant costs more than a delayed start.',
    category: 'Resource Allocation',
    failureMode: 'A financial services client needs a data migration consultant. The only available person has healthcare experience but no financial services background. They are staffed because they are available. Week 2, the client asks a basic question about SOX compliance. The consultant has no idea. The client calls the partner and says "who did you send us?"',
    evidence: 'OBSERVED_REPEATEDLY',
  },
  {
    term: 'Multi-Project Resource Contention Resolution',
    definition: 'When two engagements need the same consultant for the same week, the resource agent escalates to the delivery lead with: revenue impact of each option, client relationship risk, contractual commitments, and a recommended split (e.g., 60/40). The delivery lead decides. No consultant should be secretly double-booked across two engagements at 100% each.',
    category: 'Resource Allocation',
    failureMode: 'A consultant is assigned to Project A and Project B simultaneously. Both project managers assume they have 100% of this person\'s time. The consultant works 70 hours a week for 3 weeks. Quality drops on both projects. The consultant quits. Replacing them costs $40K in recruiting and 3 months of ramp time.',
    evidence: 'OBSERVED_REPEATEDLY',
  },

  // ---- Time Tracking & Profitability ----
  {
    term: 'Real-Time Budget Burn Monitoring',
    definition: 'The finance agent tracks hours burned vs. budget remaining for every active engagement, updated daily. When an engagement hits 70% of budget with less than 50% of deliverables complete, it alerts the project manager and the partner. The alert includes: burn rate, projected overrun, and whether the scope has expanded since the SOW was signed. Catching budget overruns at 70% gives time to course-correct. Catching them at 100% gives time to apologize.',
    category: 'Time & Profitability',
    failureMode: 'A fixed-fee engagement is sold for $80K. At week 8 of a 12-week project, the team has burned $72K in labor. Nobody tracked it. The project delivers in week 16 at a total cost of $110K. The firm lost $30K on a project that looked profitable when it was sold.',
    evidence: 'MEASURED_RESULT',
  },
  {
    term: 'Timesheet Compliance with Escalation',
    definition: 'The time tracking agent monitors timesheet submission daily. Timesheets not submitted by end of day get a reminder at 5 PM. Missing timesheets at 48 hours trigger an escalation to the project manager. Missing timesheets at 72 hours trigger an escalation to the partner. Late timesheets are not an administrative nuisance. They are a profitability blind spot. Every missing day of time data is a day the firm cannot see its margins.',
    category: 'Time & Profitability',
    failureMode: 'Three consultants submit timesheets 2 weeks late. The project was billed based on estimates. The actual hours were 30% higher than estimated. The firm cannot rebill because the invoice already went out. $15K in unbilled work is permanently lost.',
    evidence: 'MEASURED_RESULT',
  },
  {
    term: 'Effective Rate Tracking by Engagement',
    definition: 'The finance agent calculates the effective hourly rate for every engagement: total revenue divided by total hours worked (including non-billable project hours like internal meetings, rework, and admin). The blended bill rate might be $200/hour, but the effective rate after write-offs and non-billable time might be $140/hour. The effective rate is the real profitability metric.',
    category: 'Time & Profitability',
    failureMode: 'A firm\'s average bill rate is $200/hour. The partners assume the firm is healthy. But average write-offs are 15% and non-billable project time is 20%. The effective rate is $136/hour. With a $120/hour fully-loaded cost, margins are 13%, not 40%. The firm is barely profitable and does not know it.',
    evidence: 'MEASURED_RESULT',
  },
  {
    term: 'Write-Off Prediction Before Engagement Closes',
    definition: 'The billing agent compares actual hours to budget at each phase gate. A write-off prediction above 10% triggers a conversation about scope, staffing, or client expectations before the work is done, not after. The engagement partner sees the projected write-off weekly alongside a recommendation: raise a change order, absorb the overage, or de-scope something else.',
    category: 'Time & Profitability',
    failureMode: 'The engagement closes and the billing agent calculates a 25% write-off. Leadership is surprised. The data was there at week 3 but nobody was watching the trend. A write-off that could have been a change order became a permanent margin hit.',
    evidence: 'OBSERVED_REPEATEDLY',
  },

  // ---- Client Reporting ----
  {
    term: 'Status Report Assembly from Multiple Agent Outputs',
    definition: 'The reporting agent compiles weekly client status reports from: the project agent (deliverable status, milestones), the time agent (hours spent vs. budget), the risk agent (open issues, blockers), and the quality agent (test results, review findings). The report is assembled automatically. The project manager reviews and adds commentary before sending. Report assembly should take 10 minutes, not 2 hours.',
    category: 'Client Reporting',
    failureMode: 'The project manager spends every Friday afternoon manually gathering data from 4 systems to build a status report. They miss a risk flag from the quality agent because they did not check that system this week. The client finds out about the issue from a different source. The PM looks uninformed.',
    evidence: 'OBSERVED_REPEATEDLY',
  },
  {
    term: 'Client-Facing vs. Internal Report Separation',
    definition: 'The reporting agent maintains two report templates: client-facing (deliverable progress, timeline, budget summary) and internal (margin analysis, resource utilization, risk assessment, team performance). The client never sees the internal report. The partner always sees both. An agent that accidentally sends the internal margin analysis to the client has created a negotiation disaster.',
    category: 'Client Reporting',
    failureMode: 'A junior PM sends the weekly report with the internal tab visible. The client sees that the firm\'s margin on their project is 45%. The client demands a rate reduction. The partner has to renegotiate. The firm loses $50K in annual revenue because of a report template error.',
    evidence: 'OBSERVED_REPEATEDLY',
  },
  {
    term: 'Deliverable Approval Workflow with Versioning',
    definition: 'Every client deliverable passes through a review chain: consultant creates, senior reviews, manager approves, client receives. The document agent tracks versions: v0.1 (draft), v0.2 (internal review), v1.0 (client-ready). Only v1.0 goes to the client. The review agent ensures every deliverable has at least one internal review before client submission. No draft should ever reach a client.',
    category: 'Client Reporting',
    failureMode: 'A consultant sends a draft deliverable directly to the client. It contains placeholder text ("INSERT ANALYSIS HERE"), internal notes ("need to check this number with Mike"), and unformatted tables. The client questions the firm\'s professionalism. The partner has to call and apologize.',
    evidence: 'OBSERVED_REPEATEDLY',
  },

  // ---- Proposal Pipeline ----
  {
    term: 'Proposal Pricing Coordination with Delivery',
    definition: 'The sales agent cannot finalize proposal pricing without the delivery agent\'s estimate. The delivery agent provides: estimated hours by role, required skills, known risks, and assumptions. The pricing agent applies the firm\'s rate card and margin targets. If the client\'s budget is below the delivery estimate, the sales agent must either reduce scope or walk away. No proposal is submitted with pricing that delivery cannot support.',
    category: 'Pipeline',
    failureMode: 'The sales partner prices a proposal at $100K to win the deal. Delivery estimates $140K in effort. The firm wins and immediately begins losing money. The project manager is told to "find efficiencies." They cut corners. Quality suffers. The client is unhappy. The firm lost money AND reputation.',
    evidence: 'MEASURED_RESULT',
  },
  {
    term: 'Win/Loss Analysis as Feedback Loop',
    definition: 'After every proposal decision (win or loss), the sales agent records: why the client chose or rejected the firm, competing firms, price comparison, and decision factors. The analytics agent aggregates quarterly. If the firm loses 60% of deals on price, the pricing strategy needs review. If the firm wins 80% of deals from referrals and 20% from cold outreach, marketing should invest in referral programs.',
    category: 'Pipeline',
    failureMode: 'The firm submits 20 proposals per quarter and wins 5. Nobody knows why the other 15 were lost. The partners assume "we need more proposals." They increase marketing spend. But the real issue is that they lose every deal over $200K because their proposals lack case studies. More volume does not fix a conversion problem.',
    evidence: 'MEASURED_RESULT',
  },
  {
    term: 'Pipeline Revenue Forecasting with Probability Weighting',
    definition: 'The sales agent assigns probability weights to every active proposal based on stage: Identified (10%), Proposal Submitted (25%), Shortlisted (50%), Verbal Commitment (75%), Signed (100%). The finance agent uses weighted pipeline to forecast quarterly revenue. The resource agent uses it to forecast hiring needs. One dataset drives three agent decisions. Unweighted pipeline is fantasy.',
    category: 'Pipeline',
    failureMode: 'The pipeline shows $2M in "active opportunities." The partners plan hiring accordingly. But $1.5M of it is at the "Identified" stage with 10% probability. Weighted pipeline is $500K. The firm hires 3 consultants for engagements that never materialize. Bench costs eat the quarter\'s margin.',
    evidence: 'MEASURED_RESULT',
  },
  {
    term: 'Competitive Intelligence on Active Deals',
    definition: 'When a proposal is in flight, the intelligence agent monitors for signals that the prospect is also evaluating competitors: LinkedIn activity, event attendance, public RFP postings, hiring patterns. The partner gets an early warning with recommended differentiation tactics rather than a surprise loss after 3 weeks of silence.',
    category: 'Pipeline',
    failureMode: 'The firm submits a $200K proposal and waits 3 weeks for a response. The prospect chose a competitor 2 weeks ago but has not informed the firm. The partner is still forecasting the deal as "likely." Revenue projections are fiction.',
    evidence: 'HUMAN_DEFINED_RULE',
  },

  // ---- Knowledge Management ----
  {
    term: 'Engagement Retrospective Capture',
    definition: 'When an engagement ends, the knowledge agent triggers a retrospective: what went well, what went wrong, what would we do differently, reusable assets created. The retrospective is tagged by industry, service line, and client type. Future proposal teams can search "last 5 healthcare data migration retrospectives" and learn from prior engagements. Institutional memory is a competitive advantage only if it is searchable.',
    category: 'Knowledge Management',
    failureMode: 'The firm has completed 200 engagements. Zero retrospectives were captured. Every new engagement starts from scratch. The same mistakes are repeated. A consultant spends 40 hours building a framework that already exists in a completed engagement from last year. Nobody knew because it was never documented.',
    evidence: 'OBSERVED_REPEATEDLY',
  },
  {
    term: 'Proposal Asset Library with Usage Tracking',
    definition: 'The knowledge agent maintains a library of reusable proposal components: case studies, team bios, methodology descriptions, pricing templates, and past proposals. When the sales agent starts a new proposal, the knowledge agent suggests relevant assets based on industry and service type. Assets that have not been updated in 12 months are flagged for refresh. Stale case studies lose deals.',
    category: 'Knowledge Management',
    failureMode: 'Every proposal is built from scratch. The sales team spends 20 hours per proposal. Half of that time is rewriting the same methodology section. Meanwhile, 3 great case studies from last year sit in someone\'s Google Drive, undiscoverable. The proposal goes out without the case study that would have clinched the deal.',
    evidence: 'MEASURED_RESULT',
  },
  {
    term: 'Expert Finder Across the Firm',
    definition: 'The knowledge agent indexes every consultant\'s skills, certifications, industry experience, and engagement history. When a partner needs "someone who has done Salesforce implementations for insurance companies," the agent returns ranked matches in seconds. In a 200-person firm, the partners personally know 30 people. The other 170 are invisible without a searchable skill database.',
    category: 'Knowledge Management',
    failureMode: 'A partner needs a Salesforce expert for a proposal. They ask around. Nobody in their immediate network qualifies. They tell the client "we do not have that capability." Meanwhile, a consultant in the Atlanta office has 5 years of Salesforce insurance implementations. Nobody knew because the firm has no skill inventory.',
    evidence: 'OBSERVED_REPEATEDLY',
  },

  // ---- Engagement Delivery ----
  {
    term: 'Scope Change Detection and Pricing Trigger',
    definition: 'The project agent monitors every client request against the signed SOW. When a request falls outside the defined scope, it flags the project manager with: the specific request, the SOW boundary it exceeds, estimated additional effort, and a draft change order. Scope creep does not happen in one big moment. It happens in 20 small "can you also..." requests that nobody prices.',
    category: 'Engagement Delivery',
    failureMode: 'The client asks for "a few extra slides" in the final presentation. Then "a small additional analysis." Then "one more stakeholder interview." Each request takes 4-8 hours. Over the engagement, 60 hours of unscoped work accumulate. The project overruns by 25%. Nobody issued a change order because each individual request felt too small to push back on.',
    evidence: 'MEASURED_RESULT',
  },
  {
    term: 'Risk Register with Automated Escalation',
    definition: 'The risk agent maintains a register for every engagement: identified risks, probability, impact, mitigation plan, and owner. Risks are reviewed weekly. A risk that has been "high probability, high impact" for 2 consecutive weeks without mitigation progress triggers an automatic escalation to the engagement partner. Risk registers that are never read are organizational theater.',
    category: 'Engagement Delivery',
    failureMode: 'The project manager identifies a data quality risk in week 2. They add it to the risk register. Nobody reviews the register. Week 6, the data quality issue materializes. The project is delayed 3 weeks. The partner asks "why did nobody flag this?" The PM says "it was in the risk register." The register existed but the escalation process did not.',
    evidence: 'OBSERVED_REPEATEDLY',
  },
  {
    term: 'Engagement Health Dashboard for Partners',
    definition: 'The partner dashboard agent compiles a single view across all active engagements: budget health (green/yellow/red), client satisfaction trend, resource utilization, risk count, and upcoming milestones. A partner managing 8 engagements should not need to attend 8 status meetings to know where problems are. The dashboard surfaces the 2 engagements that need attention.',
    category: 'Engagement Delivery',
    failureMode: 'A partner manages 12 active engagements. They attend 3 status meetings per week and read 4 email updates. They miss that Engagement #7 is 40% over budget because that PM sends updates biweekly. The partner finds out at the monthly financial review. By then, the overrun is unrecoverable.',
    evidence: 'MEASURED_RESULT',
  },
  {
    term: 'Engagement Phase Gates with Mandatory Sign-Off',
    definition: 'The engagement agent enforces phase transitions: Discovery to Planning, Planning to Execution, Execution to Delivery, Delivery to Close. Each gate requires sign-off data from specific agents (scope confirmed by client, resources allocated by staffing agent, deliverables reviewed by quality agent). No phase advances without the gate conditions being met. Skipping gates is how firms deliver work the client never asked for.',
    category: 'Engagement Delivery',
    failureMode: 'A consulting team starts execution before the scope document is signed by the client. Three weeks in, the client disputes the deliverables. The firm has to absorb $40K in rework because the planning gate was skipped and nobody confirmed scope alignment.',
    evidence: 'OBSERVED_REPEATEDLY',
  },

  // ---- Client Relationships ----
  {
    term: 'Client Relationship Continuity During Team Changes',
    definition: 'When a consultant rolls off an engagement and a replacement rolls on, the transition agent orchestrates: a handoff document (client preferences, relationships, known sensitivities), a 1-hour overlap meeting, and a warm introduction email from the outgoing to the incoming consultant. The client should feel continuity, not disruption. The worst phrase a client can hear is "I am new to the account. Can you catch me up?"',
    category: 'Client Relationships',
    failureMode: 'The lead consultant leaves for another firm on Friday. A replacement starts Monday with no context. They ask the client to "walk them through the project." The client spent $200K on this engagement and now has to re-explain their business to someone new. They question whether the firm takes their account seriously.',
    evidence: 'OBSERVED_REPEATEDLY',
  },
  {
    term: 'Cross-Sell Detection from Engagement Context',
    definition: 'The opportunity agent listens for expansion signals during active engagements: the client mentions a related problem ("we also need help with our data warehouse"), asks about other service lines, or has a budget cycle starting. These signals are captured and routed to the sales agent with context. The sales agent does not cold-pitch an active client. They follow up on a need the client already expressed.',
    category: 'Client Relationships',
    failureMode: 'During a strategy engagement, the client mentions "our CRM is a mess, we should probably fix that next." The consultant nods and moves on. Nobody tells the sales team. Three months later, the client hires a competitor for the CRM project. "We did not know you did that" is the most expensive sentence in professional services.',
    evidence: 'MEASURED_RESULT',
  },
  {
    term: 'Account Inactivity Alert',
    definition: 'The relationship agent monitors account activity: active engagements, proposals in progress, communication frequency. When a previously active client has zero activity for 90 days, it triggers an alert to the partner: "Last engagement ended 90 days ago. No active proposals. Last communication was 60 days ago." The partner decides whether to reach out. Relationships that go silent for 6 months are 4x harder to reactivate.',
    category: 'Client Relationships',
    failureMode: 'A client that used to spend $300K/year with the firm goes quiet. No active engagements. No proposals. The partner is busy with other accounts. 8 months later, the partner reaches out. The client says "we started working with another firm 6 months ago." The relationship was lost by neglect, not by competition.',
    evidence: 'MEASURED_RESULT',
  },
  {
    term: 'Touch Frequency Enforcement by Revenue Tier',
    definition: 'The relationship agent enforces minimum touch frequency based on client revenue tier. Tier 1 (top 20%): weekly substantive contact. Tier 2 (middle 50%): biweekly. Tier 3 (bottom 30%): monthly. A "touch" is a substantive interaction (call, meeting, personalized email), not an automated newsletter. The agent flags any client below their minimum frequency for 2+ consecutive periods.',
    category: 'Client Relationships',
    failureMode: 'A $500K annual client has not heard from anyone at the firm in 6 weeks. They feel neglected. A competitor reaches out with a proposal. The firm finds out when the client does not renew. The partner says "I thought someone was staying in touch." Nobody was.',
    evidence: 'OBSERVED_REPEATEDLY',
  },

  // ---- Compliance & Risk ----
  {
    term: 'Regulatory Calendar with Cross-Agent Alerts',
    definition: 'For firms in regulated industries (accounting, legal, financial advisory), the compliance agent maintains a calendar of regulatory deadlines per client. Filing dates, audit windows, disclosure requirements. Alerts fire at 30, 14, and 3 days before each deadline. The engagement agent checks the regulatory calendar before scheduling any work that depends on a filing.',
    category: 'Compliance',
    failureMode: 'A tax filing deadline is missed for a client because the deadline tracker is a spreadsheet that was not updated after the IRS changed the date. The firm pays the penalty and the client relationship is damaged beyond repair.',
    evidence: 'OBSERVED_REPEATEDLY',
  },
  {
    term: 'Confidentiality Wall Enforcement',
    definition: 'The compliance agent enforces information barriers between engagements that involve competing clients. Consultants on one side of the wall cannot access documents, communications, or data from the other side. The resource agent checks walls before any staffing assignment. The knowledge agent excludes walled content from search results for restricted users.',
    category: 'Compliance',
    failureMode: 'A consultant working on Client A\'s pricing strategy accidentally accesses Client B\'s competitive analysis through the shared knowledge base. Both are in the same industry. The breach is discovered during an audit. The firm faces legal action from both clients and regulatory scrutiny.',
    evidence: 'HUMAN_DEFINED_RULE',
  },

  // ---- Operations ----
  {
    term: 'Weekly Practice Area Health Report',
    definition: 'Each practice area (strategy, technology, operations, etc.) gets a weekly health report from the operations agent: utilization rate, pipeline weighted value, active engagements, write-off risk, bench time, and client satisfaction trends. Practice leads see their business unit in one view. The managing partner sees all practices side by side to identify cross-practice imbalances.',
    category: 'Operations',
    failureMode: 'The technology practice is 40% utilized while the strategy practice is at 110% and burning people out. Nobody sees the cross-practice imbalance because each practice tracks its own metrics in isolation. Resources could have been cross-deployed.',
    evidence: 'MEASURED_RESULT',
  },
  {
    term: 'Partner Time Allocation Protection',
    definition: 'Partners must split time between client delivery, business development, and firm management. The operations agent tracks the ratio weekly and flags when any partner spends more than 60% on delivery (starving the pipeline) or less than 30% on delivery (clients feel abandoned). The ideal split varies by firm stage but the agent makes the split visible rather than invisible.',
    category: 'Operations',
    failureMode: 'A partner is 80% billable because they love client work. Business development stops. Six months later, when current engagements end, their pipeline is empty. Revenue drops 50% for their practice. The firm realizes too late that the partner\'s billable hours were masking a pipeline crisis.',
    evidence: 'OBSERVED_REPEATEDLY',
  },
];

export const PROFESSIONAL_SERVICES_INDUSTRY_META = {
  slug: 'professional-services',
  name: 'Professional Services',
  description: 'Coordination practices for AI agent teams managing professional services firms -- consulting engagements, time tracking, resource allocation, proposal pipeline, client reporting, knowledge management, and client relationship continuity. Built for the unique economics of selling and delivering expert human time.',
  practiceCount: PROFESSIONAL_SERVICES_PRACTICES.length,
  icon: 'briefcase-business',
};
