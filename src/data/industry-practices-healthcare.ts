/**
 * Healthcare Coordination Playbook
 * Original OTP content -- coordination practices for AI agent teams
 * managing healthcare organizations.
 *
 * Covers: patient scheduling, compliance/HIPAA, provider coordination,
 * billing, intake workflows, referral management, and telehealth.
 *
 * These are real coordination practices, not scraped content.
 */

import { IndustryPractice } from './industry-practices-agency.js';

export const HEALTHCARE_PRACTICES: IndustryPractice[] = [
  // ---- Compliance & HIPAA ----
  {
    term: 'PHI Isolation in Agent Communication',
    definition: 'No agent-to-agent message may contain Protected Health Information (PHI) in plain text. The scheduling agent tells the billing agent "Patient #4821 appointment completed" -- never "John Smith\'s cardiac follow-up completed." Every shared state file uses patient IDs, not names. PHI resolution happens only at the point of human display, never in inter-agent data flows.',
    category: 'Compliance',
    failureMode: 'The scheduling agent writes "Jane Doe missed her psychiatry appointment" to a shared state file that the front desk agent reads. That file is now PHI. If it is logged, cached, or leaked, you have a HIPAA breach. The fine starts at $100 per record and scales to $1.5M per violation category.',
    evidence: 'HUMAN_DEFINED_RULE',
  },
  {
    term: 'Audit Trail on Every Patient Data Access',
    definition: 'Every time an agent reads, writes, or modifies patient data, it logs: which agent, which patient (by ID), what data, timestamp, and purpose. The compliance agent can reconstruct a full access history for any patient record on demand. This is not optional security hygiene. It is a HIPAA requirement under the Security Rule.',
    category: 'Compliance',
    failureMode: 'A patient requests their access log (their right under HIPAA). The organization cannot produce one because agent access was never logged. The compliance investigation reveals that 6 agents accessed the record with no audit trail. The organization faces a corrective action plan and potential fines.',
    evidence: 'HUMAN_DEFINED_RULE',
  },
  {
    term: 'Consent Status as Pre-Check for Every Outreach',
    definition: 'Before any agent sends a communication to a patient (appointment reminder, billing notice, telehealth link), it must check the consent registry: Has the patient consented to this communication channel? Is their consent current? Did they opt out of certain message types? The consent agent maintains the registry. Every outreach agent reads it before sending.',
    category: 'Compliance',
    failureMode: 'The reminder agent texts a patient about their upcoming appointment. The patient opted out of text messages 6 months ago. They file a complaint. The practice now has an OCR investigation and a potential TCPA violation stacked on top of the HIPAA issue.',
    evidence: 'OBSERVED_REPEATEDLY',
  },
  {
    term: 'Minimum Necessary Data Principle in Agent Queries',
    definition: 'Every agent query against the EHR must request only the data fields it needs for its specific task. The billing agent queries diagnosis codes and procedure codes. It never receives clinical notes. The scheduling agent queries appointment times and provider IDs. It never receives lab results. Data access scopes are defined per agent role and enforced at the API layer.',
    category: 'Compliance',
    failureMode: 'The scheduling agent has read access to the full patient chart because "it was easier to set up that way." A vulnerability in the scheduling agent now exposes complete medical records, not just appointment data. The breach scope is 100x larger than it needed to be.',
    evidence: 'HUMAN_DEFINED_RULE',
  },

  // ---- Patient Flow ----
  {
    term: 'Patient Intake Handoff Chain',
    definition: 'The intake process is a chain of agent handoffs: the web agent captures the form, the eligibility agent verifies insurance in real time, the scheduling agent finds the first available slot, the onboarding agent sends pre-visit paperwork. Each agent completes its step and passes a structured status to the next. A patient stuck between steps for more than 4 hours triggers an escalation.',
    category: 'Patient Flow',
    failureMode: 'A patient fills out the online intake form on Monday. The eligibility check fails silently. The scheduling agent never runs because it is waiting on eligibility. The patient calls Thursday asking why nobody called. The practice looks disorganized. The patient finds another provider.',
    evidence: 'OBSERVED_REPEATEDLY',
  },
  {
    term: 'Wait Time Visibility Across Departments',
    definition: 'The flow agent tracks real-time wait times at every stage: check-in to triage, triage to exam room, exam room to provider, provider to checkout. Each department\'s agent reports its current queue depth. The front desk agent can tell a patient "Dr. Smith is running about 20 minutes behind" instead of "it should not be long." Transparency reduces perceived wait time by 30%.',
    category: 'Patient Flow',
    failureMode: 'A patient checks in at 2:00 PM for a 2:00 PM appointment. At 2:45 PM they are still in the waiting room. Nobody has communicated anything. They walk out. The provider becomes available at 2:50 PM. A 5-minute communication would have saved the visit.',
    evidence: 'MEASURED_RESULT',
  },
  {
    term: 'Same-Day Appointment Slot Optimization',
    definition: 'The scheduling agent holds a configurable percentage of daily slots (typically 15-20%) for same-day requests. The analytics agent monitors no-show rates by time slot and day of week. When a no-show is predicted (patient with a history of no-shows, bad weather day), the scheduling agent proactively offers the slot to the waitlist. Empty chair time is the most expensive waste in healthcare.',
    category: 'Patient Flow',
    failureMode: 'The practice is "fully booked" 2 weeks out. But 15% of booked appointments no-show daily. Providers have empty 30-minute blocks throughout the day. Meanwhile, sick patients are told "the earliest we can see you is next Thursday." They go to urgent care. Revenue and continuity of care both suffer.',
    evidence: 'MEASURED_RESULT',
  },
  {
    term: 'Post-Visit Follow-Up Sequencer',
    definition: 'After every visit, the follow-up agent triggers a sequence based on visit type: routine visit gets a satisfaction survey at 24 hours. Procedure gets a post-op check-in call at 48 hours. New patient gets a "how was your first visit?" at 24 hours plus a reminder to schedule follow-up at 7 days. The sequence is templated per visit type but personalized per patient.',
    category: 'Patient Flow',
    failureMode: 'A patient has a minor procedure. Nobody calls to check on them. They develop a complication at home but assume it is normal. They call 5 days later when it is worse. The complication that would have been a phone call is now an ER visit. Clinical outcome and patient satisfaction both drop.',
    evidence: 'OBSERVED_REPEATEDLY',
  },

  // ---- Provider Coordination ----
  {
    term: 'Provider Schedule Change Cascade',
    definition: 'When a provider changes their schedule (PTO, conference, emergency), the scheduling agent immediately identifies all affected appointments, notifies affected patients with rebooking options, alerts the referral agent to hold incoming referrals for that provider, and notifies the billing agent of expected revenue impact. One schedule change triggers a coordinated multi-agent response.',
    category: 'Provider Coordination',
    failureMode: 'Dr. Johnson takes emergency leave on Monday. The front desk manually calls 15 patients to reschedule. They miss 3. Those patients show up to an empty office. Meanwhile, the referral coordinator sends 4 new patients to Dr. Johnson\'s schedule that week. Cascading failures from a single event.',
    evidence: 'OBSERVED_REPEATEDLY',
  },
  {
    term: 'Cross-Provider Care Handoff Documentation',
    definition: 'When a patient is referred from one provider to another within the practice, the coordination agent ensures: the receiving provider has the referral reason, relevant recent results, and current medications before the appointment. The sending provider gets a notification when the referred appointment is completed. No patient should ever hear "I am not sure why Dr. Smith sent you to me."',
    category: 'Provider Coordination',
    failureMode: 'A PCP refers a patient to the practice\'s cardiologist. The cardiologist\'s first question is "so what brings you in today?" The patient assumed the doctors talked. They did not. The patient retells their story, feels unheard, and questions whether the providers communicate at all. Trust in the practice erodes.',
    evidence: 'HUMAN_DEFINED_RULE',
  },
  {
    term: 'Provider Utilization Balancing',
    definition: 'The analytics agent tracks each provider\'s schedule utilization (booked vs. available slots) weekly. When one provider is at 95% and another at 60%, the scheduling agent redirects new patients to the underutilized provider (matching specialty and insurance). The goal is balanced utilization, not overworked stars and idle providers.',
    category: 'Provider Coordination',
    failureMode: 'Dr. Adams is booked 4 weeks out. Dr. Baker has same-week availability. New patients default to Dr. Adams because they are listed first in the system. Dr. Adams burns out. Dr. Baker is underproductive. The practice loses revenue from empty Baker slots while Adams patients wait a month.',
    evidence: 'MEASURED_RESULT',
  },

  // ---- Billing & Revenue Cycle ----
  {
    term: 'Real-Time Eligibility Verification Before Every Visit',
    definition: 'The eligibility agent verifies insurance coverage 48 hours before every scheduled appointment and again at check-in. If coverage has lapsed, it alerts the front desk agent and the patient before the visit, not after. A $200 visit rendered without valid insurance has a 40% collection rate. The same visit with verified insurance has a 95% collection rate.',
    category: 'Billing',
    failureMode: 'A patient\'s employer switched insurance carriers last month. The practice does not verify until after the visit. The claim is denied. The patient gets a surprise bill. They dispute it. The practice writes it off 90 days later. Multiply by 10 patients per week.',
    evidence: 'MEASURED_RESULT',
  },
  {
    term: 'Claim Denial Pattern Detection',
    definition: 'The billing analytics agent tracks denial reasons by payer, provider, and procedure code. When denials from a specific payer spike (e.g., Aetna denying code 99213 at a 30% rate), it alerts the billing team with the pattern and the most common fix. Systematic denials are not random. They indicate a payer policy change, a coding error, or a missing modifier that affects every claim.',
    category: 'Billing',
    failureMode: 'Aetna changes their policy on modifier 25. Denials for evaluation and management services triple over 2 weeks. The billing team processes each denial individually. Nobody notices the pattern until month-end when revenue is down $40K. A pattern detection agent would have caught it on day 3.',
    evidence: 'MEASURED_RESULT',
  },
  {
    term: 'Prior Authorization Tracking with Expiry Alerts',
    definition: 'The authorization agent maintains a registry of all active prior authorizations with their expiry dates and remaining approved visits. 14 days before expiry, it triggers a renewal request. When a patient books a visit requiring authorization, the scheduling agent checks the registry. No appointment is booked without confirming active authorization. Expired auth = denied claim.',
    category: 'Billing',
    failureMode: 'A patient\'s 10-visit PT authorization expired after visit 8. Visit 9 and 10 are rendered without authorization. Both claims are denied. The patient is billed $400. They are furious because "nobody told me." The practice either eats the cost or loses the patient.',
    evidence: 'OBSERVED_REPEATEDLY',
  },
  {
    term: 'Patient Balance Communication Coordination',
    definition: 'The billing agent and the patient communication agent coordinate on outstanding balances. The billing agent determines the amount and aging. The communication agent determines the channel (portal message, text, letter) based on patient preferences and balance size. No collection communication goes out without both agents agreeing on timing, amount, and tone. Aggressive collection outreach on a patient who just had a difficult diagnosis is a reputation-destroying mistake.',
    category: 'Billing',
    failureMode: 'A patient receives a cancer diagnosis on Monday. On Tuesday, the automated billing system sends a collections notice for a $75 balance from 3 months ago. The timing is devastating. The patient posts the experience on social media. The practice\'s reputation takes a hit that costs far more than $75.',
    evidence: 'OBSERVED_REPEATEDLY',
  },

  // ---- Referral Management ----
  {
    term: 'Inbound Referral Capture and Acknowledgment Loop',
    definition: 'The referral agent acknowledges every inbound referral within 4 hours: sends a confirmation to the referring provider, contacts the patient to schedule, and logs the referral source for attribution. The referring provider should never have to call and ask "did you get my referral?" Referral leakage (referrals received but never scheduled) is tracked as a revenue loss metric.',
    category: 'Referrals',
    failureMode: 'A PCP sends 5 referrals to a specialist this month. 2 are never contacted. The PCP calls to follow up on their patients. The specialist\'s office says "we never received it." The PCP stops referring. A $50K/year referral relationship dies because of a $0 acknowledgment failure.',
    evidence: 'MEASURED_RESULT',
  },
  {
    term: 'Referral-to-Appointment Conversion Tracking',
    definition: 'The analytics agent tracks conversion rate from referral received to appointment scheduled to appointment completed, segmented by referring provider. If a referring provider\'s patients have a 30% no-schedule rate, the referral agent adjusts the outreach cadence (more touchpoints). If a specific insurance type has a 50% no-schedule rate, the eligibility agent pre-verifies before outreach.',
    category: 'Referrals',
    failureMode: 'The practice receives 200 referrals per month. 120 schedule. 90 show up. Nobody knows why 80 referrals never convert. Are they calling and getting voicemail? Is insurance the barrier? Are they going to a competitor? Without segmented tracking, the practice cannot fix the leak.',
    evidence: 'MEASURED_RESULT',
  },
  {
    term: 'Closed-Loop Referral Reporting to Referring Providers',
    definition: 'After a referred patient completes their visit, the coordination agent sends a structured report back to the referring provider: visit summary, findings, recommended plan, and next steps. This closes the referral loop. Referring providers who receive timely reports refer 40% more patients than those left in the dark.',
    category: 'Referrals',
    failureMode: 'A PCP refers a patient to a specialist. The patient is seen. The PCP never receives a report. At the patient\'s next PCP visit 3 months later, the PCP has no idea what the specialist found or recommended. Care continuity is broken. The PCP tries a different specialist next time.',
    evidence: 'MEASURED_RESULT',
  },

  // ---- Telehealth ----
  {
    term: 'Telehealth Readiness Check Before Virtual Visits',
    definition: 'The telehealth agent sends a tech readiness check to the patient 24 hours before a virtual visit: verify camera works, microphone works, internet speed is sufficient, and the patient knows how to join. Patients who complete the readiness check have a 90% on-time start rate. Patients who skip it have a 55% on-time start rate. The 10 minutes lost to tech troubleshooting at visit start is provider time that cannot be recovered.',
    category: 'Telehealth',
    failureMode: 'A provider starts a telehealth visit. The patient cannot figure out how to turn on their camera. 8 minutes of the 15-minute visit are spent on tech support. The provider is now running behind for the rest of the day. A $2 automated readiness check would have prevented $200 in cascading schedule delays.',
    evidence: 'MEASURED_RESULT',
  },
  {
    term: 'Telehealth-to-In-Person Escalation Protocol',
    definition: 'During a telehealth visit, if the provider determines an in-person visit is needed, the scheduling agent must immediately find the next available in-person slot and offer it to the patient before the telehealth visit ends. The patient should leave the virtual visit with their in-person appointment already booked. The billing agent adjusts the visit type code accordingly.',
    category: 'Telehealth',
    failureMode: 'A telehealth visit determines the patient needs to come in. The provider says "call the front desk to schedule." The patient calls. They are on hold for 12 minutes. They hang up and decide they will "call back later." They never do. The clinical need goes unaddressed.',
    evidence: 'OBSERVED_REPEATEDLY',
  },
  {
    term: 'Hybrid Visit Mode Billing Compliance',
    definition: 'The billing agent must correctly code telehealth visits with the appropriate place-of-service code, telehealth modifier, and originating site. When a visit starts as telehealth and converts to in-person (or vice versa), the billing agent must split the codes appropriately. Telehealth billing errors are the fastest-growing category of claim denials because payer rules change quarterly.',
    category: 'Telehealth',
    failureMode: 'The practice bills telehealth visits with in-person place-of-service codes. The payer audits 6 months of claims. 200 visits are flagged for repayment. The practice owes $35K in clawbacks plus a corrective action plan. The billing agent was never updated when the payer changed telehealth coding rules.',
    evidence: 'OBSERVED_REPEATEDLY',
  },

  // ---- Analytics & Population Health ----
  {
    term: 'Preventive Care Gap Detection',
    definition: 'The population health agent scans the patient panel for overdue preventive services: mammograms, colonoscopies, A1C checks, annual physicals. It generates outreach lists segmented by service type and overdue duration. The communication agent sends personalized reminders. The scheduling agent reserves preventive care slots. This is how practices meet quality metrics and keep patients healthy between acute visits.',
    category: 'Analytics',
    failureMode: 'A practice has 3,000 patients. 400 are overdue for diabetic A1C checks. Nobody runs the report. The practice fails its quality measure for the year. The payer reduces reimbursement rates by 5% under the value-based contract. $120K in annual revenue lost because a report was never generated.',
    evidence: 'MEASURED_RESULT',
  },
  {
    term: 'Payer Mix Drift Monitoring',
    definition: 'The finance analytics agent tracks the practice\'s payer mix monthly: percentage of revenue by insurance type (commercial, Medicare, Medicaid, self-pay). A 5% shift in payer mix over 90 days triggers an alert because it affects average reimbursement rate, denial patterns, and prior authorization burden. The practice may need to adjust staffing or service offerings.',
    category: 'Analytics',
    failureMode: 'Over 6 months, the practice\'s Medicaid patient percentage grows from 15% to 30%. Nobody tracks it. Revenue per visit drops 20% because Medicaid reimburses less. The practice is suddenly unprofitable at the same visit volume. The problem was invisible until the quarterly P&L.',
    evidence: 'MEASURED_RESULT',
  },
  {
    term: 'Provider Productivity Dashboard with Context',
    definition: 'The analytics agent reports provider productivity (patients seen per day, RVUs generated, revenue per visit) alongside context: no-show rate for that provider\'s panel, average visit complexity, payer mix. A provider seeing 12 patients/day with complex Medicare cases may be more productive than one seeing 20 patients/day with simple commercial visits. Raw volume without context creates toxic comparisons.',
    category: 'Analytics',
    failureMode: 'Dr. Chen sees 14 patients per day. Dr. Park sees 22. Management pressures Dr. Chen to "be more productive." But Dr. Chen\'s average visit is a 45-minute complex care management visit billing $350. Dr. Park\'s average is a 15-minute follow-up billing $120. Dr. Chen generates more revenue per day. The raw number was misleading.',
    evidence: 'HUMAN_DEFINED_RULE',
  },
];

export const HEALTHCARE_INDUSTRY_META = {
  slug: 'healthcare',
  name: 'Healthcare',
  description: 'Coordination practices for AI agent teams managing healthcare organizations -- patient scheduling, HIPAA compliance, provider coordination, revenue cycle, referral management, and telehealth. Built for the unique regulatory, safety, and care continuity demands of medical practices.',
  practiceCount: HEALTHCARE_PRACTICES.length,
  icon: 'heart-pulse',
};
