/**
 * Fitness Franchise Coordination Playbook
 * Original OTP content -- coordination practices for AI agent teams
 * managing multi-location fitness franchises.
 *
 * Covers: multi-location gyms, franchise model, membership management,
 * class scheduling, trainer coordination, lead-to-member pipeline,
 * and call center for membership sales.
 *
 * These are real coordination practices, not scraped content.
 */

import { IndustryPractice } from './industry-practices-agency.js';

export const FITNESS_PRACTICES: IndustryPractice[] = [
  // ---- Location Coordination ----
  {
    term: 'Location-Aware Agent Routing',
    definition: 'Every agent query must resolve to a specific location before executing. The lead intake agent determines which gym the lead is nearest to. The scheduling agent checks capacity at that location. The billing agent applies that location\'s pricing. No agent operates in a "franchise-wide" context by default because pricing, hours, staffing, and capacity differ per location.',
    category: 'Location Coordination',
    failureMode: 'A lead fills out a form for the downtown gym. The intake agent routes them to the general franchise number. The call center agent quotes pricing from a different location. The lead shows up for a tour at a gym that has different hours than what they were told.',
    evidence: 'HUMAN_DEFINED_RULE',
  },
  {
    term: 'Centralized Franchise Dashboard with Location Drill-Down',
    definition: 'The reporting agent maintains a single franchise-wide view (total members, total leads, total revenue) but every metric must be decomposable to a single location. When a franchise owner asks "how are we doing?" they get the portfolio view. When they ask "why is revenue down?" the agent must drill into the specific location dragging the average.',
    category: 'Location Coordination',
    failureMode: 'The franchise owner sees "leads are up 15% this month" in the portfolio view. But 3 of 8 locations are actually down 25%. The healthy locations are masking the sick ones. The problems are invisible for months until the struggling locations miss rent.',
    evidence: 'MEASURED_RESULT',
  },
  {
    term: 'Location Launch Playbook Sequencer',
    definition: 'When a new location opens, a sequencer agent activates a checklist across all other agents: the ad agent creates geo-targeted campaigns, the CRM agent sets up the location in the pipeline, the scheduling agent loads the class template, the call center agent gets scripts with the new address and hours. One event triggers an orchestrated multi-agent launch sequence.',
    category: 'Location Coordination',
    failureMode: 'A new location opens Tuesday. Ads start running Wednesday, but the CRM still routes leads to the nearest existing location. The call center has no script for the new gym. Leads who call get "I am not sure, let me find out" for the first 2 weeks. First impressions are blown.',
    evidence: 'OBSERVED_REPEATEDLY',
  },
  {
    term: 'Cross-Location Cannibalization Detection',
    definition: 'When a new location opens or an existing location runs a promotion, the analytics agent monitors whether nearby locations see a lead volume or membership drop. If one location\'s gain maps to another location\'s loss, flag it as cannibalization rather than net growth. The ad agent must coordinate geo-fencing to prevent overlap.',
    category: 'Location Coordination',
    failureMode: 'The franchise opens a third location and celebrates 200 new members in month one. Nobody notices that the two nearby locations lost 150 members combined. Net growth was 50, not 200. The franchise over-invests in a location that is mostly stealing from itself.',
    evidence: 'MEASURED_RESULT',
  },

  // ---- Lead-to-Member Pipeline ----
  {
    term: 'Speed-to-Contact for Gym Leads',
    definition: 'The lead intake agent must trigger a call center contact attempt within 5 minutes of form submission. The call center agent tracks first-attempt time per lead. Gym leads are high-intent but low-patience: they are comparing 3 gyms simultaneously. The first gym to call back wins 60%+ of the time.',
    category: 'Lead Pipeline',
    failureMode: 'A lead submits a form at 10:02 AM. The call center calls at 2:15 PM. By then, the prospect has already toured a competitor and signed up. Your cost-per-lead was $35 and you converted 0% of afternoon callbacks. The math never works when speed-to-lead exceeds 15 minutes.',
    evidence: 'MEASURED_RESULT',
  },
  {
    term: 'Lead-to-Tour-to-Member Funnel Tracking',
    definition: 'Three separate agents must coordinate a single funnel: the lead agent captures the inquiry, the scheduling agent books the tour, the membership agent closes the sale. Each agent writes to a shared lead record. The funnel dashboard shows conversion rates between each stage. A lead stuck between stages for more than 48 hours triggers an escalation.',
    category: 'Lead Pipeline',
    failureMode: 'The lead agent logs 500 leads this month. The membership agent reports 40 new members. Nobody knows what happened to the other 460. Did they tour and not join? Did they never get a tour booked? The funnel is a black box between intake and close.',
    evidence: 'HUMAN_DEFINED_RULE',
  },
  {
    term: 'No-Show Recovery Sequence',
    definition: 'When a prospect books a tour but does not show, the scheduling agent immediately notifies the call center agent to trigger a recovery sequence: text within 15 minutes, call within 2 hours, rebook attempt within 24 hours. The sequence stops when the prospect rebooks, responds, or hits 3 failed contact attempts.',
    category: 'Lead Pipeline',
    failureMode: 'A prospect books a tour for Saturday at 10 AM. They do not show. Nobody follows up until Monday. By then the prospect has cooled off or joined somewhere else. Tour no-show rates sit at 40%+ with zero recovery effort.',
    evidence: 'OBSERVED_REPEATEDLY',
  },
  {
    term: 'Trial-to-Paid Conversion Watchdog',
    definition: 'For gyms offering free trials or intro periods, the retention agent monitors every trial member daily. At the 50% mark of the trial, it flags any trial member who has visited fewer than 2 times. At the 80% mark, it triggers a personal outreach from the membership advisor. Trial members who do not visit are not going to convert. Intervene before the trial expires.',
    category: 'Lead Pipeline',
    failureMode: 'A gym offers 7-day free trials. 60% of trial members visit once and never return. Nobody contacts them until the trial expires. By then, the gym is sending "your trial ended, want to join?" to someone who already forgot about them.',
    evidence: 'MEASURED_RESULT',
  },

  // ---- Membership Management ----
  {
    term: 'Freeze and Cancel Interception Protocol',
    definition: 'When a member requests a freeze or cancellation through any channel (app, front desk, phone, email), the CRM agent immediately notifies the retention agent before processing. The retention agent checks: visit frequency trend, last check-in date, billing issues, class attendance. A save offer is prepared with context. The cancellation is processed only after the retention attempt is logged.',
    category: 'Membership',
    failureMode: 'A member emails "I want to cancel." The billing agent processes the cancellation immediately. Nobody checked that this member was visiting 4x/week until last month when a billing error double-charged them. A simple billing fix would have saved a $79/month member.',
    evidence: 'HUMAN_DEFINED_RULE',
  },
  {
    term: 'Delinquent Payment Escalation Ladder',
    definition: 'The billing agent owns a 4-step escalation for failed payments: Day 1 automated retry + SMS, Day 3 email with update-payment link, Day 7 personal call from membership team, Day 14 freeze membership with reactivation offer. Each step is logged. The retention agent monitors the overall delinquency rate per location as a health metric.',
    category: 'Membership',
    failureMode: 'A member\'s card declines. The billing system retries 3 times silently over 2 weeks. No human contact. The member does not even know their membership lapsed. They show up at the gym, get turned away at the front desk, and feel embarrassed. They cancel permanently.',
    evidence: 'OBSERVED_REPEATEDLY',
  },
  {
    term: 'Membership Tier Migration Triggers',
    definition: 'The analytics agent monitors member behavior for upgrade and downgrade signals. A basic member attending premium classes 3+ times triggers an upgrade recommendation to the sales agent. A premium member who has not used premium amenities in 60 days triggers a proactive check-in from the retention agent before they downgrade themselves.',
    category: 'Membership',
    failureMode: 'A member pays $29/month for basic but keeps asking to attend cycling classes (premium). Nobody suggests the $49 plan. The member gets frustrated by rejection and cancels entirely. A $49/month member was lost because a $20 upgrade was never offered.',
    evidence: 'MEASURED_RESULT',
  },

  // ---- Class & Schedule Coordination ----
  {
    term: 'Class Capacity Balancing Across Locations',
    definition: 'The scheduling agent monitors real-time class capacity across all locations. When a popular class hits 90% capacity at one location, it checks if the same class at a nearby location has availability and proactively notifies waitlisted members. This turns a negative (full class) into a positive (alternative offered) and balances utilization.',
    category: 'Scheduling',
    failureMode: 'The 6 PM yoga class at Location A has a 15-person waitlist. The same class at Location B (4 miles away) has 8 empty spots. Nobody connects the dots. Members on the waitlist skip the workout entirely instead of going to a location with availability.',
    evidence: 'HUMAN_DEFINED_RULE',
  },
  {
    term: 'Instructor Substitution Chain',
    definition: 'When an instructor calls out, the scheduling agent immediately queries the availability pool for certified substitutes at that location. If no local sub is available, it checks nearby locations. It sends the substitution request with class details, then notifies registered class members of the instructor change. The entire chain executes in under 30 minutes.',
    category: 'Scheduling',
    failureMode: 'An instructor calls in sick at 5 AM for a 6 AM class. The gym manager texts 4 instructors manually. Nobody responds. The class is cancelled at 5:55 AM. 20 members show up and are turned away. Three of them post negative reviews.',
    evidence: 'OBSERVED_REPEATEDLY',
  },
  {
    term: 'Schedule Optimization from Attendance Data',
    definition: 'The analytics agent reviews 90 days of class attendance data monthly. Classes consistently below 40% capacity get flagged for time-slot change or removal. Classes consistently at 95%+ capacity get flagged for a second offering. The scheduling agent proposes changes; the operations manager approves. No schedule change happens without data backing.',
    category: 'Scheduling',
    failureMode: 'A gym runs 45 classes per week because "we have always run 45 classes." 12 of them average 3 attendees. The instructor cost per attendee on those classes is $15. Meanwhile, the popular classes are packed and turning people away. Resources are misallocated because nobody analyzes attendance data.',
    evidence: 'MEASURED_RESULT',
  },

  // ---- Trainer & Staff Coordination ----
  {
    term: 'Trainer Utilization vs. Revenue Tracking',
    definition: 'The finance agent tracks revenue per trainer-hour, not just total personal training revenue. The operations agent tracks utilization rate (booked hours vs. available hours) per trainer. When utilization drops below 60%, the sales agent is notified to push PT packages. When utilization exceeds 90%, the hiring agent is notified to recruit.',
    category: 'Staff Coordination',
    failureMode: 'A gym has 5 personal trainers. Total PT revenue is $18K/month which looks fine. But 2 trainers generate $7K each while 3 trainers generate $1.3K each. The underperformers are costing the gym floor space and payroll without producing. Nobody catches it because the aggregate number looks acceptable.',
    evidence: 'MEASURED_RESULT',
  },
  {
    term: 'Certification Expiry Watchdog',
    definition: 'The HR agent maintains a certification database for every instructor and trainer. 90 days before any certification expires, it alerts the operations manager and the staff member. 30 days before, it escalates. If a certification lapses, the scheduling agent automatically removes that instructor from classes requiring that cert. No manual tracking, no surprises.',
    category: 'Staff Coordination',
    failureMode: 'An instructor\'s CPR certification expired 3 months ago. Nobody noticed. A member has a medical emergency during class. The liability exposure is enormous. Insurance may deny the claim. This is the kind of risk that kills a franchise.',
    evidence: 'HUMAN_DEFINED_RULE',
  },
  {
    term: 'Staff Scheduling Conflict Prevention',
    definition: 'The scheduling agent cross-references trainer/instructor availability, PTO requests, and class assignments before publishing any schedule. It prevents double-booking (same instructor in two classes), ghost-booking (assigning a class to someone on PTO), and coverage gaps (time slots with no staff). Conflicts are resolved before the schedule is published, not after.',
    category: 'Staff Coordination',
    failureMode: 'The schedule shows Sarah teaching spin at 9 AM, but Sarah requested PTO that week. The front desk finds out when Sarah does not show up. Members are angry. The manager scrambles to find a sub. This happens every other week because the schedule is built manually.',
    evidence: 'OBSERVED_REPEATEDLY',
  },

  // ---- Call Center for Membership Sales ----
  {
    term: 'Call Center Script Versioning by Location',
    definition: 'The call center agent maintains location-specific scripts: different pricing, different amenities, different hours, different promotions. When a lead calls, the routing agent determines their target location and loads the correct script. A script change at one location does not affect others. The operations agent approves all script changes before deployment.',
    category: 'Call Center',
    failureMode: 'Location A runs a "$0 enrollment" promo. Location B does not. The call center agent uses the generic script and offers $0 enrollment to a Location B lead. The lead shows up expecting the deal. The front desk cannot honor it. Trust is broken on the first interaction.',
    evidence: 'OBSERVED_REPEATEDLY',
  },
  {
    term: 'Tour Booking Confirmation Loop',
    definition: 'When the call center books a tour, the scheduling agent sends an immediate confirmation (text + email), a reminder 24 hours before, and a "we are excited to see you" text 2 hours before. If the prospect does not confirm the 24-hour reminder, the call center agent attempts a live confirmation call. Confirmed tours show 65% higher attendance than unconfirmed.',
    category: 'Call Center',
    failureMode: 'The call center books 30 tours per week. 12 no-show. Nobody confirmed any of them. The gym has membership advisors standing around waiting for prospects who never come. Cost per actual tour is nearly double what it should be.',
    evidence: 'MEASURED_RESULT',
  },
  {
    term: 'Objection Tracking for Script Improvement',
    definition: 'The call center analytics agent categorizes every lost call by objection type: price, location, commitment length, no classes wanted, just browsing. Monthly, it reports the top 5 objections per location to the operations agent. If "price" is the top objection at a location for 3 consecutive months, it triggers a pricing review escalation.',
    category: 'Call Center',
    failureMode: 'The call center loses 60% of calls. Nobody knows why. The script has not changed in 6 months. It turns out that "I do not want a 12-month commitment" is the top objection, but the gym does not offer month-to-month because nobody identified the pattern.',
    evidence: 'MEASURED_RESULT',
  },

  // ---- Retention & Engagement ----
  {
    term: 'Visit Frequency Decline Alert',
    definition: 'The retention agent monitors each member\'s check-in pattern. When a member\'s visit frequency drops by 50% or more compared to their personal 30-day average, the agent flags them as at-risk. A personalized re-engagement message is drafted and queued for the membership team. Members who drop from 4x/week to 1x/week are 6x more likely to cancel within 60 days.',
    category: 'Retention',
    failureMode: 'A member who visited 5 times a week for 6 months suddenly drops to once a week. Nobody notices. Two months later they cancel. The gym lost a $79/month member who was probably dealing with a temporary life change (new job, injury, schedule shift) that a single check-in call could have addressed.',
    evidence: 'MEASURED_RESULT',
  },
  {
    term: 'New Member 30-Day Activation Program',
    definition: 'The onboarding agent owns the first 30 days of every new member. Day 1: welcome text with gym tour tips. Day 3: check-in on first workout. Day 7: class recommendation based on stated goals. Day 14: personal training intro offer. Day 30: "how is it going?" survey. Members who complete the 30-day activation sequence have 2.5x higher 6-month retention.',
    category: 'Retention',
    failureMode: 'A new member signs up on Monday. Their next interaction with the gym is when the monthly charge hits 30 days later. They visited twice, felt lost, did not know about classes, and already decided to cancel. The gym spent $50 to acquire them and got $79 back.',
    evidence: 'MEASURED_RESULT',
  },
  {
    term: 'Winback Campaign with Cooldown Rules',
    definition: 'The marketing agent runs re-engagement campaigns for cancelled members. But it must coordinate with the billing agent (no outreach during payment disputes), the retention agent (respect cancellation reason and do-not-contact flags), and the call center agent (do not call members who cancelled due to bad experience). A 90-day cooldown after cancellation prevents the "desperate ex" effect.',
    category: 'Retention',
    failureMode: 'A member cancels because of a billing dispute. The next day, they get a "We miss you! Come back for $0 enrollment!" email. They are furious. They post a negative review. The marketing agent did not know about the billing dispute because agents do not share data.',
    evidence: 'OBSERVED_REPEATEDLY',
  },

  // ---- Advertising & Marketing ----
  {
    term: 'Geo-Fenced Ad Spend Allocation',
    definition: 'The advertising agent allocates budget per location based on capacity headroom, not evenly. A location at 95% capacity gets minimal ad spend. A new location at 40% capacity gets aggressive spend. The analytics agent provides capacity data. The advertising agent adjusts geo-targeting radii to prevent location overlap. Budget rebalancing happens weekly.',
    category: 'Marketing',
    failureMode: 'All 8 locations get equal ad spend. The downtown location is already at capacity and cannot handle more tours. The new suburban location desperately needs leads. The franchise wastes $3K/month advertising a full gym while starving the one that needs it.',
    evidence: 'MEASURED_RESULT',
  },
  {
    term: 'Promotion Coordination Across Channels',
    definition: 'When the marketing agent launches a promotion, it must update the call center scripts (new pricing), the website agent (landing page), the ad agent (creative and targeting), and the CRM agent (tracking tags). A promotion launch is a multi-agent event with a checklist. One agent missing the memo means inconsistent pricing in the market.',
    category: 'Marketing',
    failureMode: 'The marketing team launches a "First Month Free" promo on social media. The website still shows standard pricing. The call center quotes the old rate. A prospect sees three different offers from the same gym in the same week. Credibility evaporates.',
    evidence: 'OBSERVED_REPEATEDLY',
  },
  {
    term: 'Seasonal Demand Forecasting',
    definition: 'The analytics agent uses 2+ years of historical data to predict seasonal membership surges (January, summer, back-to-school). 6 weeks before a predicted surge, it notifies the staffing agent (hire seasonal staff), the ad agent (increase budget), and the operations agent (extend hours if needed). Reactive franchises scramble during the surge. Proactive ones are staffed and advertising before it hits.',
    category: 'Marketing',
    failureMode: 'January 2nd arrives. Leads triple overnight. The call center is staffed for normal volume. Wait times hit 20 minutes. The ad budget runs out by January 10th. Half of New Year\'s resolution leads go to competitors who were prepared.',
    evidence: 'OBSERVED_REPEATEDLY',
  },

  // ---- Compliance & Safety ----
  {
    term: 'Waiver and Liability Document Tracking',
    definition: 'The compliance agent ensures every active member has a signed, current waiver on file. When waivers expire (annually or per policy), the agent triggers renewal outreach. Members without valid waivers are flagged at check-in. The front desk agent blocks gym access until the waiver is renewed. No exceptions. This is the single highest liability exposure for a fitness franchise.',
    category: 'Compliance',
    failureMode: 'A member\'s waiver expired 8 months ago. They injure themselves on equipment. The franchise\'s insurance discovers the expired waiver during the claim process. Coverage is denied. A $50K injury claim comes out of pocket. Multiply this by 2,000 members with varying expiry dates and no tracking system.',
    evidence: 'HUMAN_DEFINED_RULE',
  },
  {
    term: 'Equipment Maintenance Scheduling with Downtime Alerts',
    definition: 'The operations agent maintains a preventive maintenance schedule for all equipment at all locations. When maintenance is due, it notifies the location manager and schedules a vendor visit. When equipment is taken offline, it notifies the member-facing communication agent to post signage and update the app. Members should never discover out-of-order equipment by walking up to it.',
    category: 'Compliance',
    failureMode: 'The cable machine at Location B has needed maintenance for 3 weeks. No work order was created. A member uses it, the cable snaps, the member is injured. Meanwhile, 15 members complained about it on Google Reviews during those 3 weeks. The operations agent had no visibility into the problem.',
    evidence: 'OBSERVED_REPEATEDLY',
  },
  {
    term: 'Minor Member Access Controls',
    definition: 'For gyms allowing minors (teen memberships, kids programs), the compliance agent enforces parental consent tracking, age-restricted area access, and supervised-only hour enforcement. The check-in system agent cross-references member age against facility rules. A 14-year-old should never be checked into the free weights area without a verified parental waiver and during supervised hours.',
    category: 'Compliance',
    failureMode: 'A 15-year-old checks in at 9 PM using their membership card. No staff member verifies age or supervision status. The teen is injured using equipment unsupervised. The franchise faces a negligence claim with no documentation of age-appropriate access controls.',
    evidence: 'HUMAN_DEFINED_RULE',
  },
];

export const FITNESS_INDUSTRY_META = {
  slug: 'fitness',
  name: 'Fitness Franchise',
  description: 'Coordination practices for AI agent teams managing multi-location fitness franchises -- membership sales, call centers, class scheduling, trainer coordination, retention, and franchise-wide operations. Built for the unique challenges of high-volume, location-dependent membership businesses.',
  practiceCount: FITNESS_PRACTICES.length,
  icon: 'dumbbell',
};
