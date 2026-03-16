-- ============================================================
-- BETA SCENARIO PART 3: PIPS Forms — Project 1 (Completed)
-- "Reduce First Response Time from 4hrs to 1hr"
-- ============================================================

BEGIN;

-- ============================================================
-- STEP 1: IDENTIFY — Problem Statement
-- ============================================================
INSERT INTO project_forms (id, project_id, step, form_type, title, data, created_by, created_at) VALUES
(
  'ff010100-0000-4000-8000-000000000001',
  'f0010000-0000-4000-8000-000000000001',
  'identify',
  'problem_statement',
  'problem_statement',
  '{
    "asIs": "Average first response time is 4.2 hours across all support channels (email, chat, phone). Peak hours (10am-2pm ET) see response times exceeding 6 hours. Enterprise-tier customers experience the same delays as free-tier users despite SLA commitments of 30-minute response.",
    "desired": "Average first response time under 1 hour across all channels. Enterprise-tier customers receive responses within 15 minutes. No individual ticket waits longer than 2 hours regardless of tier.",
    "gap": "3.2-hour gap between current average (4.2 hrs) and target (< 1 hr). Enterprise customers are 4.5 hours over their SLA commitment. The gap has widened 180% in the past 6 months as ticket volume grew 40% while headcount grew only 10%.",
    "problemStatement": "Customer support first response time has increased from 1.5 hours to 4.2 hours over the past 6 months, creating a 3.2-hour gap from our target of under 1 hour. This is driving a 23% higher churn rate among ticket-filing customers, a CSAT drop from 4.1 to 3.4, and puts us in breach of enterprise SLAs.",
    "teamMembers": ["Marcus Rivera", "Aisha Patel", "Rachel Foster", "James O''Brien", "Sarah Chen"],
    "problemArea": "Customer Support Operations",
    "dataSources": ["Zendesk ticket export (6 months)", "CSAT survey results Q3-Q4", "Churn analysis by CX team", "Enterprise SLA breach report"]
  }'::jsonb,
  'c0010000-0000-4000-8000-000000000002',
  '2026-02-03 14:00:00+00'
),

-- STEP 1: Impact Assessment
(
  'ff010100-0000-4000-8000-000000000002',
  'f0010000-0000-4000-8000-000000000001',
  'identify',
  'impact_assessment',
  'impact_assessment',
  '{
    "financialImpact": "Estimated $420K annual revenue at risk from support-driven churn (23% higher churn x $1,826 avg ARR x 1,000 affected accounts). Additional $85K in SLA penalty credits issued to enterprise customers in the past quarter.",
    "customerImpact": "CSAT dropped from 4.1 to 3.4 out of 5.0. NPS fell 18 points. 340 enterprise customers are in SLA breach status. Social media complaints about response time increased 200% quarter-over-quarter.",
    "employeeImpact": "Agent burnout is rising — voluntary attrition increased from 12% to 22% annualized. Agents report feeling overwhelmed by queue size. Morale survey scores for the support team dropped from 3.8 to 2.9 out of 5.",
    "processImpact": "Current process has no priority routing — all tickets enter a single FIFO queue. No coverage during 6am-9am ET or after 6pm ET. Escalation paths are unclear, leading to duplicate work and dropped tickets.",
    "severityRating": 5,
    "frequencyRating": 5,
    "detectionRating": 2,
    "riskPriorityNumber": 50
  }'::jsonb,
  'c0010000-0000-4000-8000-000000000002',
  '2026-02-03 15:00:00+00'
),

-- ============================================================
-- STEP 2: ANALYZE — Fishbone Diagram
-- ============================================================
(
  'ff010200-0000-4000-8000-000000000001',
  'f0010000-0000-4000-8000-000000000001',
  'analyze',
  'fishbone',
  'fishbone',
  '{
    "problemStatement": "Customer support first response time has increased from 1.5 hours to 4.2 hours",
    "categories": [
      {
        "name": "Man (People)",
        "causes": [
          {"text": "Understaffed during peak hours (10am-2pm)", "subCauses": ["Only 60% of agents scheduled during peak", "No staggered shift model"]},
          {"text": "New agents take 12 weeks to ramp up", "subCauses": ["No structured training program", "Ad hoc mentoring is inconsistent"]},
          {"text": "Agent burnout causing higher absenteeism", "subCauses": ["22% attrition rate", "Remaining agents overloaded"]}
        ]
      },
      {
        "name": "Machine (Equipment)",
        "causes": [
          {"text": "Zendesk configuration not optimized", "subCauses": ["No auto-assignment rules", "Round-robin ignores agent specialty"]},
          {"text": "No real-time queue visibility for managers", "subCauses": ["Reports are T+1 day", "Cannot intervene proactively"]}
        ]
      },
      {
        "name": "Method (Process)",
        "causes": [
          {"text": "Single FIFO queue for all ticket types", "subCauses": ["Enterprise and free-tier mixed", "Simple questions block complex ones"]},
          {"text": "Manual triage takes 18 min per ticket", "subCauses": ["No classification taxonomy", "Agents read full ticket to route"]},
          {"text": "No escalation SLAs defined", "subCauses": ["Tickets sit unescalated for hours", "No automatic SLA breach alerts"]}
        ]
      },
      {
        "name": "Material (Inputs)",
        "causes": [
          {"text": "Knowledge base is outdated (47% stale)", "subCauses": ["Agents cannot find quick answers", "Customers file tickets for documented issues"]},
          {"text": "Ticket form does not capture enough context", "subCauses": ["Agents spend time on back-and-forth", "Average 2.3 replies before resolution"]}
        ]
      },
      {
        "name": "Measurement (Metrics)",
        "causes": [
          {"text": "Response time metric not tracked in real-time", "subCauses": ["Only measured in weekly reports", "No SLA breach alerts"]},
          {"text": "No individual agent performance tracking", "subCauses": ["Cannot identify who needs coaching", "Top performers not recognized"]}
        ]
      },
      {
        "name": "Mother Nature (Environment)",
        "causes": [
          {"text": "Ticket volume grew 40% but headcount only 10%", "subCauses": ["Hiring freeze in Q3", "Budget approved for Q1 but not yet filled"]},
          {"text": "Product releases drive ticket spikes", "subCauses": ["No pre-release support prep", "Release notes not shared with support team"]}
        ]
      }
    ]
  }'::jsonb,
  'c0010000-0000-4000-8000-000000000002',
  '2026-02-05 14:00:00+00'
),

-- STEP 2: Five Why Analysis
(
  'ff010200-0000-4000-8000-000000000002',
  'f0010000-0000-4000-8000-000000000001',
  'analyze',
  'five_why',
  'five_why',
  '{
    "problemStatement": "Customer support first response time is 4.2 hours (target: < 1 hour)",
    "whys": [
      {"question": "Why is first response time 4.2 hours?", "answer": "Tickets sit in queue too long before an agent picks them up. The queue frequently exceeds 150 tickets during peak hours, and only 8 of 14 agents are scheduled during that window."},
      {"question": "Why do tickets sit in queue so long?", "answer": "There are not enough agents available during peak demand periods (10am-2pm ET), and the single FIFO queue means simple 5-minute tickets get blocked behind complex 45-minute investigations."},
      {"question": "Why are there not enough agents during peak?", "answer": "The current schedule was designed for uniform coverage across the day. It has not been updated to match the actual demand curve, which shows 65% of daily ticket volume arrives between 10am and 2pm."},
      {"question": "Why has the schedule not been updated to match demand?", "answer": "There is no demand forecasting or real-time queue visibility. Managers only see yesterday''s data and cannot adjust in real time. Schedule changes require 2 weeks of HR process."},
      {"question": "Why is there no real-time visibility or demand forecasting?", "answer": "The analytics pipeline runs a nightly batch ETL. No one has built real-time monitoring, and the need was not acute when ticket volume was lower."}
    ],
    "rootCause": "The scheduling model is static and does not match actual demand patterns because there is no real-time visibility into queue performance. This is compounded by a single-queue design that does not differentiate by complexity or customer tier."
  }'::jsonb,
  'c0010000-0000-4000-8000-000000000003',
  '2026-02-06 10:00:00+00'
),

-- STEP 2: Force Field Analysis
(
  'ff010200-0000-4000-8000-000000000003',
  'f0010000-0000-4000-8000-000000000001',
  'analyze',
  'force_field',
  'force_field',
  '{
    "problemStatement": "Move from 4.2hr to <1hr first response time",
    "drivingForces": [
      {"text": "Executive sponsorship — VP of Customer Success is championing this", "strength": 5},
      {"text": "Clear financial impact — $420K revenue at risk motivates budget", "strength": 5},
      {"text": "Agent frustration — team wants change and is willing to try new processes", "strength": 4},
      {"text": "Customer complaints are public and damaging brand reputation", "strength": 4},
      {"text": "Enterprise SLA penalties create contractual urgency", "strength": 5},
      {"text": "Competitor benchmarks show 45-min avg — we are falling behind", "strength": 3}
    ],
    "restrainingForces": [
      {"text": "Hiring freeze limits headcount growth until Q2", "strength": 4},
      {"text": "Schedule changes require HR approval with 2-week lead time", "strength": 3},
      {"text": "Zendesk configuration changes need IT team involvement (backlogged)", "strength": 3},
      {"text": "Agent resistance to performance tracking (privacy concerns)", "strength": 2},
      {"text": "No budget allocated for new tooling this quarter", "strength": 3},
      {"text": "Product team does not coordinate releases with support", "strength": 2}
    ],
    "strategy": "Focus on process changes that do not require headcount (scheduling optimization, queue redesign, priority routing) as quick wins. Use executive sponsorship to fast-track HR schedule changes and IT Zendesk configuration. Defer tooling investments to Q2 budget cycle. Address agent privacy concerns with transparent communication about how metrics will be used (coaching, not punishment)."
  }'::jsonb,
  'c0010000-0000-4000-8000-000000000002',
  '2026-02-06 14:00:00+00'
),

-- STEP 2: Pareto Analysis
(
  'ff010200-0000-4000-8000-000000000004',
  'f0010000-0000-4000-8000-000000000001',
  'analyze',
  'pareto',
  'pareto',
  '{
    "title": "Root Causes of Slow First Response Time (by impact on delay)",
    "categories": [
      {"id": "cat-1", "name": "Insufficient peak-hour staffing", "count": 142, "percentage": 35.5, "cumulative": 35.5},
      {"id": "cat-2", "name": "Single FIFO queue (no priority routing)", "count": 98, "percentage": 24.5, "cumulative": 60.0},
      {"id": "cat-3", "name": "Manual triage overhead (18 min/ticket)", "count": 72, "percentage": 18.0, "cumulative": 78.0},
      {"id": "cat-4", "name": "Knowledge base gaps (repeat questions)", "count": 48, "percentage": 12.0, "cumulative": 90.0},
      {"id": "cat-5", "name": "New agent ramp-up slowness", "count": 24, "percentage": 6.0, "cumulative": 96.0},
      {"id": "cat-6", "name": "Product release spikes (unplanned)", "count": 16, "percentage": 4.0, "cumulative": 100.0}
    ],
    "eightyTwentyLine": "The top 3 causes (peak staffing, single queue, manual triage) account for 78% of the delay. Addressing these three will get us most of the way to our target.",
    "notes": "Data sourced from 400 ticket sample analyzed by James. Each ticket was tagged with primary delay cause. Staffing and queue design are clearly the vital few."
  }'::jsonb,
  'c0010000-0000-4000-8000-000000000006',
  '2026-02-07 10:00:00+00'
),

-- STEP 2: Checksheet
(
  'ff010200-0000-4000-8000-000000000005',
  'f0010000-0000-4000-8000-000000000001',
  'analyze',
  'checksheet',
  'checksheet',
  '{
    "title": "Ticket Delay Cause Tally — Week of Feb 3-7",
    "categories": [
      {"id": "cs-1", "label": "No agent available (queue wait)"},
      {"id": "cs-2", "label": "Wrong agent assigned (re-route)"},
      {"id": "cs-3", "label": "Agent researching KB (no article found)"},
      {"id": "cs-4", "label": "Customer context missing (follow-up needed)"},
      {"id": "cs-5", "label": "Escalation delay (no clear path)"}
    ],
    "timePeriods": [
      {"id": "tp-1", "label": "Mon 2/3"},
      {"id": "tp-2", "label": "Tue 2/4"},
      {"id": "tp-3", "label": "Wed 2/5"},
      {"id": "tp-4", "label": "Thu 2/6"},
      {"id": "tp-5", "label": "Fri 2/7"}
    ],
    "tallies": {
      "cs-1_tp-1": 23, "cs-1_tp-2": 28, "cs-1_tp-3": 31, "cs-1_tp-4": 26, "cs-1_tp-5": 19,
      "cs-2_tp-1": 12, "cs-2_tp-2": 15, "cs-2_tp-3": 18, "cs-2_tp-4": 14, "cs-2_tp-5": 11,
      "cs-3_tp-1": 8,  "cs-3_tp-2": 11, "cs-3_tp-3": 9,  "cs-3_tp-4": 10, "cs-3_tp-5": 7,
      "cs-4_tp-1": 5,  "cs-4_tp-2": 7,  "cs-4_tp-3": 6,  "cs-4_tp-4": 8,  "cs-4_tp-5": 4,
      "cs-5_tp-1": 3,  "cs-5_tp-2": 4,  "cs-5_tp-3": 5,  "cs-5_tp-4": 3,  "cs-5_tp-5": 2
    },
    "notes": "Wednesday consistently highest volume — correlates with weekly product release cycle. Queue wait is the dominant delay cause every day."
  }'::jsonb,
  'c0010000-0000-4000-8000-000000000003',
  '2026-02-07 14:00:00+00'
),

-- ============================================================
-- STEP 3: GENERATE — Brainstorming
-- ============================================================
(
  'ff010300-0000-4000-8000-000000000001',
  'f0010000-0000-4000-8000-000000000001',
  'generate',
  'brainstorming',
  'brainstorming',
  '{
    "ideas": [
      {"id": "idea-01", "text": "Implement staggered shifts to match peak demand curve", "author": "Marcus Rivera", "votes": 8, "category": "Scheduling"},
      {"id": "idea-02", "text": "Create priority queues: Enterprise (P1), Paid (P2), Free (P3)", "author": "Aisha Patel", "votes": 7, "category": "Queue Design"},
      {"id": "idea-03", "text": "Auto-assign tickets based on agent specialty tags", "author": "Rachel Foster", "votes": 5, "category": "Routing"},
      {"id": "idea-04", "text": "Add auto-reply with KB article suggestions before agent response", "author": "James O''Brien", "votes": 6, "category": "Self-Service"},
      {"id": "idea-05", "text": "Hire 4 additional agents (2 for early shift, 2 for late)", "author": "Sarah Chen", "votes": 4, "category": "Staffing"},
      {"id": "idea-06", "text": "Outsource after-hours support to a BPO partner", "author": "Marcus Rivera", "votes": 3, "category": "Staffing"},
      {"id": "idea-07", "text": "Build AI chatbot for common questions (password reset, billing FAQ)", "author": "Aisha Patel", "votes": 5, "category": "Automation"},
      {"id": "idea-08", "text": "Create a dedicated triage role that only routes tickets", "author": "Rachel Foster", "votes": 4, "category": "Process"},
      {"id": "idea-09", "text": "Implement SLA breach alerts that ping managers in Slack", "author": "James O''Brien", "votes": 6, "category": "Monitoring"},
      {"id": "idea-10", "text": "Split complex tickets into sub-tickets for parallel work", "author": "Marcus Rivera", "votes": 2, "category": "Process"},
      {"id": "idea-11", "text": "Add canned response templates for top 20 ticket types", "author": "Aisha Patel", "votes": 5, "category": "Efficiency"},
      {"id": "idea-12", "text": "Cross-train agents so any agent can handle any ticket type", "author": "Rachel Foster", "votes": 3, "category": "Training"},
      {"id": "idea-13", "text": "Implement a callback system for phone channel during peak", "author": "Sarah Chen", "votes": 3, "category": "Channel"},
      {"id": "idea-14", "text": "Create VIP queue with dedicated enterprise support agents", "author": "Marcus Rivera", "votes": 4, "category": "Queue Design"},
      {"id": "idea-15", "text": "Gamify response time with leaderboard and bonuses", "author": "Rachel Foster", "votes": 2, "category": "Motivation"},
      {"id": "idea-16", "text": "Implement mandatory ticket form fields to reduce back-and-forth", "author": "James O''Brien", "votes": 4, "category": "Efficiency"},
      {"id": "idea-17", "text": "Set up overflow routing to engineering for technical tickets", "author": "Aisha Patel", "votes": 3, "category": "Routing"},
      {"id": "idea-18", "text": "Reduce agent admin tasks (meeting load, reports) during peak hours", "author": "Marcus Rivera", "votes": 5, "category": "Scheduling"},
      {"id": "idea-19", "text": "Deploy real-time dashboard so managers can redistribute load", "author": "James O''Brien", "votes": 6, "category": "Monitoring"},
      {"id": "idea-20", "text": "Pre-populate ticket responses with customer history and context", "author": "Aisha Patel", "votes": 4, "category": "Efficiency"},
      {"id": "idea-21", "text": "Implement agent skill-based routing with Zendesk triggers", "author": "Rachel Foster", "votes": 4, "category": "Routing"},
      {"id": "idea-22", "text": "Create a peer coaching program pairing senior and junior agents", "author": "Sarah Chen", "votes": 3, "category": "Training"},
      {"id": "idea-23", "text": "Add self-service options: password reset, plan changes, invoice download", "author": "Marcus Rivera", "votes": 5, "category": "Self-Service"},
      {"id": "idea-24", "text": "Negotiate with product team for release-day support staffing plan", "author": "Sarah Chen", "votes": 4, "category": "Process"},
      {"id": "idea-25", "text": "Implement follow-the-sun model with remote agents in EU/APAC timezones", "author": "James O''Brien", "votes": 2, "category": "Staffing"},
      {"id": "idea-26", "text": "Create ticket severity auto-detection based on keywords and customer tier", "author": "Aisha Patel", "votes": 5, "category": "Automation"},
      {"id": "idea-27", "text": "Batch non-urgent tickets and process in dedicated blocks", "author": "Marcus Rivera", "votes": 3, "category": "Process"},
      {"id": "idea-28", "text": "Implement warm handoff protocol to eliminate cold transfers", "author": "Rachel Foster", "votes": 3, "category": "Process"},
      {"id": "idea-29", "text": "Set up Slack channel for real-time agent collaboration on tough tickets", "author": "Aisha Patel", "votes": 4, "category": "Collaboration"},
      {"id": "idea-30", "text": "Create daily standup for support team to align on queue priorities", "author": "Marcus Rivera", "votes": 3, "category": "Process"},
      {"id": "idea-31", "text": "Auto-close stale tickets after 7 days of no customer response", "author": "James O''Brien", "votes": 4, "category": "Efficiency"},
      {"id": "idea-32", "text": "Implement typing indicators and read receipts to set customer expectations", "author": "Rachel Foster", "votes": 2, "category": "Channel"},
      {"id": "idea-33", "text": "Create emergency overflow protocol for queue > 100 tickets", "author": "Sarah Chen", "votes": 5, "category": "Process"},
      {"id": "idea-34", "text": "Negotiate with HR to allow flexible shift changes with 48hr notice", "author": "Marcus Rivera", "votes": 4, "category": "Scheduling"}
    ],
    "selectedIdeas": ["idea-01", "idea-02", "idea-09", "idea-18", "idea-19", "idea-04", "idea-11", "idea-33", "idea-34"],
    "eliminatedIdeas": ["idea-15", "idea-32", "idea-25"]
  }'::jsonb,
  'c0010000-0000-4000-8000-000000000002',
  '2026-02-10 14:00:00+00'
),

-- STEP 3: Brainwriting
(
  'ff010300-0000-4000-8000-000000000002',
  'f0010000-0000-4000-8000-000000000001',
  'generate',
  'brainwriting',
  'brainwriting',
  '{
    "rounds": [
      {
        "roundNumber": 1,
        "entries": [
          {"participant": "Marcus Rivera", "ideas": ["Create flex pool of 3 agents who float to busiest queue", "Implement queue-specific SLA timers visible to all agents", "Weekly demand forecast report to pre-adjust staffing"]},
          {"participant": "Aisha Patel", "ideas": ["Agent status board showing who is available/busy/on break", "Smart templates that auto-fill customer name and product version", "Pair programming model for complex tickets — 2 agents collaborate"]},
          {"participant": "Rachel Foster", "ideas": ["New hire buddy system with structured 30/60/90 day checkpoints", "Customer self-service portal for common account changes", "Separate queues for quick wins (<5 min) vs deep investigations"]},
          {"participant": "James O''Brien", "ideas": ["Predictive model for next-day ticket volume based on release calendar", "Agent utilization dashboard showing tickets/hour per person", "Auto-escalation rule: if no response in 30min, bump priority"]}
        ]
      },
      {
        "roundNumber": 2,
        "entries": [
          {"participant": "Marcus Rivera", "ideas": ["Build on Aisha: agent status board + auto-redistribute from busy to free", "Build on James: add weather/day-of-week to prediction model", "Build on Rachel: tag quick-win tickets automatically by keyword"]},
          {"participant": "Aisha Patel", "ideas": ["Build on Marcus: flex pool agents get premium pay for flexibility", "Build on Rachel: buddy system feeds into formal certification program", "Build on James: auto-escalation + manager notification in Slack"]},
          {"participant": "Rachel Foster", "ideas": ["Build on Marcus: demand forecast shared with agents so they can swap shifts", "Build on Aisha: templates + snippets library searchable by ticket type", "Build on James: utilization dashboard gamified with team goals not individual"]},
          {"participant": "James O''Brien", "ideas": ["Build on Marcus: flex pool sourced from cross-trained product team volunteers", "Build on Aisha: status board integrated into Slack sidebar", "Build on Rachel: quick-win queue handled first thing each morning to clear backlog"]}
        ]
      }
    ],
    "allIdeas": [
      "Flex pool of 3 floating agents",
      "Queue-specific SLA timers visible to agents",
      "Weekly demand forecast for staffing",
      "Agent status board (available/busy/break)",
      "Smart auto-fill response templates",
      "Pair programming for complex tickets",
      "Buddy system with 30/60/90 checkpoints",
      "Self-service portal for account changes",
      "Separate quick-win vs deep-investigation queues",
      "Predictive ticket volume model",
      "Agent utilization dashboard",
      "Auto-escalation after 30 min"
    ]
  }'::jsonb,
  'c0010000-0000-4000-8000-000000000003',
  '2026-02-10 16:00:00+00'
),

-- ============================================================
-- STEP 4: SELECT & PLAN — Criteria Matrix
-- ============================================================
(
  'ff010400-0000-4000-8000-000000000001',
  'f0010000-0000-4000-8000-000000000001',
  'select_plan',
  'criteria_matrix',
  'criteria_matrix',
  '{
    "criteria": [
      {"name": "Impact on response time", "weight": 10, "description": "How much will this reduce first response time?"},
      {"name": "Speed to implement", "weight": 8, "description": "How quickly can we deploy this? (days, not months)"},
      {"name": "Cost / resource requirement", "weight": 7, "description": "Budget and headcount needed (lower = better score)"},
      {"name": "Sustainability", "weight": 9, "description": "Will the improvement hold without constant management?"},
      {"name": "Agent adoption risk", "weight": 6, "description": "Will agents embrace or resist this change?"}
    ],
    "solutions": [
      {"name": "Staggered shifts + priority queue", "scores": {"Impact on response time": 5, "Speed to implement": 4, "Cost / resource requirement": 4, "Sustainability": 5, "Agent adoption risk": 4}},
      {"name": "AI chatbot for common questions", "scores": {"Impact on response time": 4, "Speed to implement": 2, "Cost / resource requirement": 2, "Sustainability": 5, "Agent adoption risk": 5}},
      {"name": "Hire 4 additional agents", "scores": {"Impact on response time": 4, "Speed to implement": 2, "Cost / resource requirement": 1, "Sustainability": 3, "Agent adoption risk": 5}},
      {"name": "Auto-triage + skill-based routing", "scores": {"Impact on response time": 4, "Speed to implement": 3, "Cost / resource requirement": 3, "Sustainability": 5, "Agent adoption risk": 3}},
      {"name": "Outsource after-hours to BPO", "scores": {"Impact on response time": 3, "Speed to implement": 3, "Cost / resource requirement": 2, "Sustainability": 3, "Agent adoption risk": 4}}
    ]
  }'::jsonb,
  'c0010000-0000-4000-8000-000000000002',
  '2026-02-12 14:00:00+00'
),

-- STEP 4: Paired Comparisons
(
  'ff010400-0000-4000-8000-000000000002',
  'f0010000-0000-4000-8000-000000000001',
  'select_plan',
  'paired_comparisons',
  'paired_comparisons',
  '{
    "options": [
      {"id": "opt-a", "label": "Staggered shifts + priority queue"},
      {"id": "opt-b", "label": "AI chatbot for common questions"},
      {"id": "opt-c", "label": "Auto-triage + skill-based routing"},
      {"id": "opt-d", "label": "Hire 4 additional agents"}
    ],
    "comparisons": [
      {"optionA": "opt-a", "optionB": "opt-b", "winner": "opt-a", "notes": "Shifts can be deployed in 2 weeks vs months for chatbot. Higher immediate impact."},
      {"optionA": "opt-a", "optionB": "opt-c", "winner": "opt-a", "notes": "Both strong, but shifts address the biggest bottleneck (staffing gap) directly."},
      {"optionA": "opt-a", "optionB": "opt-d", "winner": "opt-a", "notes": "Hiring takes 8+ weeks and is blocked by freeze. Shifts are immediate."},
      {"optionA": "opt-b", "optionB": "opt-c", "winner": "opt-c", "notes": "Auto-triage reduces misrouting (32% rate) which chatbot does not address."},
      {"optionA": "opt-b", "optionB": "opt-d", "winner": "opt-b", "notes": "Chatbot is a longer-term investment but cheaper and more scalable than hiring."},
      {"optionA": "opt-c", "optionB": "opt-d", "winner": "opt-c", "notes": "Auto-triage addresses structural issue. Hiring is a band-aid without process fix."}
    ],
    "results": [
      {"optionId": "opt-a", "wins": 3, "rank": 1},
      {"optionId": "opt-c", "wins": 2, "rank": 2},
      {"optionId": "opt-b", "wins": 1, "rank": 3},
      {"optionId": "opt-d", "wins": 0, "rank": 4}
    ]
  }'::jsonb,
  'c0010000-0000-4000-8000-000000000001',
  '2026-02-12 16:00:00+00'
),

-- STEP 4: Implementation Plan
(
  'ff010400-0000-4000-8000-000000000003',
  'f0010000-0000-4000-8000-000000000001',
  'select_plan',
  'implementation_plan',
  'implementation_plan',
  '{
    "selectedSolution": "Staggered shifts with priority queue routing",
    "tasks": [
      {"id": "task-01", "title": "Analyze ticket volume by hour (demand curve)", "assignee": "James O''Brien", "dueDate": "2026-02-14", "status": "completed", "notes": "Pull 90-day hourly data from Zendesk API"},
      {"id": "task-02", "title": "Design new shift schedule matching demand curve", "assignee": "Marcus Rivera", "dueDate": "2026-02-14", "status": "completed", "notes": "Early shift 6am-2pm, Core 9am-5pm, Late 1pm-9pm"},
      {"id": "task-03", "title": "Get HR approval for new shift structure", "assignee": "Sarah Chen", "dueDate": "2026-02-17", "status": "completed", "notes": "Sarah to escalate through VP chain for fast-track"},
      {"id": "task-04", "title": "Configure Zendesk priority queues (Enterprise/Paid/Free)", "assignee": "Aisha Patel", "dueDate": "2026-02-19", "status": "completed", "notes": "Create 3 queues with SLA timers: 15min/30min/2hr"},
      {"id": "task-05", "title": "Set up SLA breach alerts in Slack", "assignee": "James O''Brien", "dueDate": "2026-02-19", "status": "completed", "notes": "Webhook from Zendesk to #support-alerts Slack channel"},
      {"id": "task-06", "title": "Communicate schedule changes to support team", "assignee": "Marcus Rivera", "dueDate": "2026-02-14", "status": "completed", "notes": "All-hands meeting + individual schedule preference survey"},
      {"id": "task-07", "title": "Roll out staggered shifts (Phase 1)", "assignee": "Marcus Rivera", "dueDate": "2026-02-17", "status": "completed", "notes": "Start with voluntary shift moves, then assign remaining"},
      {"id": "task-08", "title": "Roll out priority queues (Phase 2)", "assignee": "Aisha Patel", "dueDate": "2026-02-24", "status": "completed", "notes": "Deploy to production, monitor for 1 week"},
      {"id": "task-09", "title": "Monitor and adjust for 2 weeks", "assignee": "Marcus Rivera", "dueDate": "2026-03-03", "status": "completed", "notes": "Daily check-in on response time metrics"},
      {"id": "task-10", "title": "Run evaluation and report results", "assignee": "James O''Brien", "dueDate": "2026-03-05", "status": "completed", "notes": "Before/after analysis + CSAT comparison"}
    ],
    "timeline": "2 weeks for deployment (Feb 17 - Mar 3), followed by 1 week of monitoring before evaluation on Mar 5",
    "resources": "No additional headcount needed. Requires 4 hours of Zendesk admin time (Aisha), 2 hours of Slack webhook setup (James), and Marcus to coordinate schedule changes with 14 agents.",
    "budget": "$0 direct cost — uses existing Zendesk features and Slack integration. Shift differential pay may add ~$2,400/month for early/late shifts.",
    "risks": [
      {"risk": "Agent resistance to new shift assignments", "mitigation": "Run preference survey first. Offer shift differential pay. Allow 2-week transition period."},
      {"risk": "Priority queue may frustrate free-tier customers with longer waits", "mitigation": "Set free-tier SLA at 2 hours (still better than current 4.2hr avg). Add auto-reply with KB suggestions."},
      {"risk": "HR may not approve fast-track schedule change", "mitigation": "Sarah has pre-aligned with CHRO. Backup plan: implement as voluntary flex first."},
      {"risk": "Zendesk queue configuration may have unexpected edge cases", "mitigation": "Deploy to staging first. Test with 10% of traffic before full rollout."}
    ]
  }'::jsonb,
  'c0010000-0000-4000-8000-000000000002',
  '2026-02-13 10:00:00+00'
),

-- STEP 4: RACI Chart
(
  'ff010400-0000-4000-8000-000000000004',
  'f0010000-0000-4000-8000-000000000001',
  'select_plan',
  'raci',
  'raci',
  '{
    "activities": [
      "Demand curve analysis",
      "Shift schedule design",
      "HR approval",
      "Zendesk queue configuration",
      "SLA breach alert setup",
      "Team communication",
      "Phase 1 rollout (shifts)",
      "Phase 2 rollout (queues)",
      "Monitoring & adjustment",
      "Evaluation & report"
    ],
    "people": ["Marcus Rivera", "Aisha Patel", "James O''Brien", "Sarah Chen", "Rachel Foster"],
    "matrix": {
      "Demand curve analysis": {"Marcus Rivera": "C", "Aisha Patel": "I", "James O''Brien": "R", "Sarah Chen": "I", "Rachel Foster": "I"},
      "Shift schedule design": {"Marcus Rivera": "R", "Aisha Patel": "C", "James O''Brien": "C", "Sarah Chen": "A", "Rachel Foster": "C"},
      "HR approval": {"Marcus Rivera": "C", "Aisha Patel": "", "James O''Brien": "", "Sarah Chen": "R", "Rachel Foster": ""},
      "Zendesk queue configuration": {"Marcus Rivera": "A", "Aisha Patel": "R", "James O''Brien": "C", "Sarah Chen": "I", "Rachel Foster": "C"},
      "SLA breach alert setup": {"Marcus Rivera": "A", "Aisha Patel": "C", "James O''Brien": "R", "Sarah Chen": "I", "Rachel Foster": ""},
      "Team communication": {"Marcus Rivera": "R", "Aisha Patel": "C", "James O''Brien": "I", "Sarah Chen": "A", "Rachel Foster": "C"},
      "Phase 1 rollout (shifts)": {"Marcus Rivera": "R", "Aisha Patel": "C", "James O''Brien": "I", "Sarah Chen": "A", "Rachel Foster": "C"},
      "Phase 2 rollout (queues)": {"Marcus Rivera": "A", "Aisha Patel": "R", "James O''Brien": "C", "Sarah Chen": "I", "Rachel Foster": "C"},
      "Monitoring & adjustment": {"Marcus Rivera": "R", "Aisha Patel": "C", "James O''Brien": "R", "Sarah Chen": "I", "Rachel Foster": "C"},
      "Evaluation & report": {"Marcus Rivera": "A", "Aisha Patel": "C", "James O''Brien": "R", "Sarah Chen": "I", "Rachel Foster": "C"}
    }
  }'::jsonb,
  'c0010000-0000-4000-8000-000000000002',
  '2026-02-13 14:00:00+00'
),

-- STEP 4: Cost-Benefit Analysis
(
  'ff010400-0000-4000-8000-000000000005',
  'f0010000-0000-4000-8000-000000000001',
  'select_plan',
  'cost_benefit',
  'cost_benefit',
  '{
    "solutionName": "Staggered Shifts + Priority Queue Routing",
    "costs": [
      {"id": "cost-1", "description": "Shift differential pay (early/late shift premium)", "amount": 2400, "frequency": "monthly", "category": "Labor"},
      {"id": "cost-2", "description": "Zendesk admin configuration time (Aisha, 4 hours)", "amount": 200, "frequency": "one_time", "category": "Implementation"},
      {"id": "cost-3", "description": "Slack webhook setup (James, 2 hours)", "amount": 100, "frequency": "one_time", "category": "Implementation"},
      {"id": "cost-4", "description": "Marcus coordination and change management time (20 hours)", "amount": 1000, "frequency": "one_time", "category": "Implementation"},
      {"id": "cost-5", "description": "Agent retraining on new queue system (14 agents x 1 hour)", "amount": 700, "frequency": "one_time", "category": "Training"}
    ],
    "benefits": [
      {"id": "ben-1", "description": "Reduced churn revenue recovery (23% churn reduction)", "amount": 35000, "frequency": "monthly", "category": "Revenue"},
      {"id": "ben-2", "description": "SLA penalty credit elimination", "amount": 28000, "frequency": "monthly", "category": "Cost Avoidance"},
      {"id": "ben-3", "description": "Reduced agent turnover costs (recruiting + training)", "amount": 8000, "frequency": "monthly", "category": "Cost Avoidance"},
      {"id": "ben-4", "description": "Improved CSAT leading to expansion revenue", "amount": 5000, "frequency": "monthly", "category": "Revenue"}
    ],
    "netBenefit": 73600,
    "paybackPeriod": "Immediate — net positive from month 1. One-time costs of $2,000 recovered within first week of monthly benefit.",
    "recommendation": "Strongly recommended. The financial case is overwhelming — $76K/month in benefits vs $2.4K/month in ongoing costs. Even if benefits are overstated by 50%, ROI exceeds 15x."
  }'::jsonb,
  'c0010000-0000-4000-8000-000000000006',
  '2026-02-14 10:00:00+00'
),

-- ============================================================
-- STEP 5: IMPLEMENT — Milestone Tracker
-- ============================================================
(
  'ff010500-0000-4000-8000-000000000001',
  'f0010000-0000-4000-8000-000000000001',
  'implement',
  'milestone_tracker',
  'milestone_tracker',
  '{
    "milestones": [
      {"id": "ms-1", "title": "Demand curve analysis complete", "targetDate": "2026-02-14", "completedDate": "2026-02-14", "status": "completed", "description": "James delivers hourly ticket volume analysis for past 90 days", "deliverables": ["Hourly volume chart", "Peak hours identified", "Staffing gap quantified"]},
      {"id": "ms-2", "title": "New shift schedule designed and HR-approved", "targetDate": "2026-02-17", "completedDate": "2026-02-16", "status": "completed", "description": "3-shift model approved. Agents surveyed for preferences.", "deliverables": ["Shift schedule document", "HR approval email", "Agent assignment list"]},
      {"id": "ms-3", "title": "Staggered shifts go live", "targetDate": "2026-02-17", "completedDate": "2026-02-17", "status": "completed", "description": "14 agents moved to new schedules. Early shift (6-2), Core (9-5), Late (1-9).", "deliverables": ["Updated Zendesk schedules", "Team communication sent", "First day report"]},
      {"id": "ms-4", "title": "Priority queues configured and deployed", "targetDate": "2026-02-24", "completedDate": "2026-02-24", "status": "completed", "description": "Enterprise/Paid/Free queues live with SLA timers and breach alerts.", "deliverables": ["Zendesk queue configuration", "SLA timer rules", "Slack alert webhook", "Agent training complete"]},
      {"id": "ms-5", "title": "2-week monitoring period complete", "targetDate": "2026-03-03", "completedDate": "2026-03-03", "status": "completed", "description": "Daily response time tracking. Two minor adjustments made to shift assignments.", "deliverables": ["Daily metrics spreadsheet", "Adjustment log", "Agent feedback summary"]},
      {"id": "ms-6", "title": "Evaluation report delivered", "targetDate": "2026-03-05", "completedDate": "2026-03-05", "status": "completed", "description": "Before/after analysis shows 57% improvement in first response time.", "deliverables": ["Before/after comparison", "CSAT trend report", "Recommendations for next steps"]}
    ],
    "overallProgress": 100
  }'::jsonb,
  'c0010000-0000-4000-8000-000000000002',
  '2026-02-17 09:00:00+00'
),

-- ============================================================
-- STEP 6: EVALUATE — Before & After
-- ============================================================
(
  'ff010600-0000-4000-8000-000000000001',
  'f0010000-0000-4000-8000-000000000001',
  'evaluate',
  'before_after',
  'before_after',
  '{
    "metrics": [
      {"name": "Avg First Response Time", "before": "4.2 hours", "after": "1.8 hours", "unit": "hours", "improvement": "57% reduction"},
      {"name": "Enterprise SLA Compliance", "before": "62%", "after": "91%", "unit": "%", "improvement": "+29 percentage points"},
      {"name": "CSAT Score", "before": "3.4", "after": "3.9", "unit": "/5.0", "improvement": "+0.5 points"},
      {"name": "Peak Hour Wait Time", "before": "6.1 hours", "after": "2.4 hours", "unit": "hours", "improvement": "61% reduction"},
      {"name": "Tickets > 2hr Wait", "before": "68%", "after": "23%", "unit": "% of tickets", "improvement": "-45 percentage points"},
      {"name": "Agent Satisfaction", "before": "2.9", "after": "3.6", "unit": "/5.0", "improvement": "+0.7 points"}
    ],
    "summary": "Significant progress achieved. First response time dropped 57% from 4.2 to 1.8 hours. We are not yet at our <1 hour target, but the operational improvements from staggered shifts and priority queues have proven their value. The remaining gap (1.8hr to <1hr) will be addressed by the Auto-Triage System (Project 2) and Real-Time Dashboard (Project 3) which are currently in progress."
  }'::jsonb,
  'c0010000-0000-4000-8000-000000000006',
  '2026-03-03 14:00:00+00'
),

-- STEP 6: Evaluation Summary
(
  'ff010600-0000-4000-8000-000000000002',
  'f0010000-0000-4000-8000-000000000001',
  'evaluate',
  'evaluation',
  'evaluation',
  '{
    "goalsAchieved": false,
    "goalDetails": "Primary target was <1 hour avg first response time. We achieved 1.8 hours — a 57% improvement but not yet at target. Secondary targets (CSAT >4.0, SLA compliance >95%) are also not fully met but trending strongly in the right direction. The operational changes alone got us more than halfway to the goal.",
    "effectivenessRating": 4,
    "sustainabilityRating": 4,
    "teamSatisfactionRating": 4,
    "unexpectedOutcomes": "1) Free-tier customers actually reported higher satisfaction despite longer SLA — the auto-reply with KB suggestions resolved 15% of their tickets before agent response. 2) Agent morale improved more than expected — the staggered shifts reduced daily queue anxiety significantly. 3) Early-shift agents discovered they prefer the quieter morning hours and are more productive.",
    "recommendations": "1) Continue staggered shifts as permanent policy. 2) Proceed with Auto-Triage project to further reduce response time. 3) Expand KB auto-suggestion feature based on early success. 4) Review shift differential pay at 90-day mark. 5) Share results company-wide to build momentum for remaining initiative projects.",
    "nextSteps": "This project achieved Step 1 of the improvement. Projects 2-5 in the initiative address the remaining root causes (automation, visibility, self-service, training). Recommend iterating with a follow-up PIPS cycle in Q2 if the combined effect of all 5 projects does not achieve the <1 hour target."
  }'::jsonb,
  'c0010000-0000-4000-8000-000000000002',
  '2026-03-04 10:00:00+00'
),

-- STEP 6: Lessons Learned
(
  'ff010600-0000-4000-8000-000000000003',
  'f0010000-0000-4000-8000-000000000001',
  'evaluate',
  'lessons_learned',
  'lessons_learned',
  '{
    "wentWell": [
      "Data-driven approach — the demand curve analysis made the case for staggered shifts irrefutable",
      "Executive sponsorship — Sarah fast-tracked HR approval in 3 days instead of the usual 2 weeks",
      "Team buy-in — running the preference survey before assigning shifts built goodwill and reduced resistance",
      "Incremental rollout — deploying shifts first, then queues, allowed us to isolate the impact of each change",
      "Transparent communication — daily metrics sharing kept the team motivated as they saw numbers improve"
    ],
    "improvements": [
      "Should have involved agents in the fishbone session from the start — they had insights we missed initially",
      "The priority queue SLA for free-tier was set too aggressively at first (30 min) and had to be relaxed to 2 hours",
      "We did not plan for the scenario where an enterprise ticket gets miscategorized as free-tier — need an override process",
      "Documentation of the new processes was done after the fact — should be created before rollout",
      "We underestimated the Zendesk configuration complexity — Aisha needed 8 hours, not the planned 4"
    ],
    "actionItems": [
      {"description": "Create a queue override process for miscategorized enterprise tickets", "owner": "Aisha Patel", "dueDate": "2026-03-10"},
      {"description": "Document the staggered shift policy and onboard new hires to it", "owner": "Marcus Rivera", "dueDate": "2026-03-14"},
      {"description": "Review shift differential pay rate at 90-day mark", "owner": "Sarah Chen", "dueDate": "2026-05-17"},
      {"description": "Share lessons learned with Project 2-5 leads to avoid repeating mistakes", "owner": "Marcus Rivera", "dueDate": "2026-03-07"}
    ],
    "keyTakeaways": "Process changes alone — without any new tooling or headcount — can deliver substantial improvements when the root cause analysis is thorough and data-driven. The PIPS methodology forced us to resist jumping to the obvious solution (hire more agents) and instead identify the structural issue (scheduling mismatch + single queue design). The biggest lesson: involve frontline agents early and often — they see things management cannot."
  }'::jsonb,
  'c0010000-0000-4000-8000-000000000002',
  '2026-03-05 10:00:00+00'
),

-- STEP 6: Balance Sheet
(
  'ff010600-0000-4000-8000-000000000004',
  'f0010000-0000-4000-8000-000000000001',
  'evaluate',
  'balance_sheet',
  'balance_sheet',
  '{
    "gains": [
      {"id": "g-1", "description": "57% reduction in avg first response time (4.2hr to 1.8hr)", "impact": "high", "evidence": "Zendesk metrics dashboard, 2-week post-deployment average"},
      {"id": "g-2", "description": "Enterprise SLA compliance up from 62% to 91%", "impact": "high", "evidence": "SLA tracking report, zero penalty credits issued in past 2 weeks"},
      {"id": "g-3", "description": "CSAT improved from 3.4 to 3.9", "impact": "high", "evidence": "Post-interaction survey results, 500+ responses"},
      {"id": "g-4", "description": "Agent morale up from 2.9 to 3.6", "impact": "medium", "evidence": "Internal pulse survey conducted 3/3"},
      {"id": "g-5", "description": "15% of free-tier tickets resolved by auto-reply KB suggestions", "impact": "medium", "evidence": "Zendesk auto-resolution tracking"}
    ],
    "losses": [
      {"id": "l-1", "description": "Free-tier response time increased from 4.2hr to 3.1hr (slower relative to paid)", "impact": "low", "mitigation": "Still better than before. KB auto-suggestion compensates. Will address further with KB redesign project."},
      {"id": "l-2", "description": "Shift differential adds $2,400/month ongoing cost", "impact": "low", "mitigation": "Covered by reduced SLA penalty credits ($28K/mo savings). Net positive."},
      {"id": "l-3", "description": "Agents on early/late shifts report social isolation from core team", "impact": "medium", "mitigation": "Implementing weekly all-hands and rotating shift assignments monthly."}
    ],
    "observations": [
      {"id": "o-1", "description": "The improvement curve flattened after week 1 — suggesting we have extracted most of the value from scheduling changes alone", "category": "Performance"},
      {"id": "o-2", "description": "Queue configuration is more complex than expected — Zendesk has limitations on rule chaining", "category": "Technical"},
      {"id": "o-3", "description": "Agents spontaneously started a Slack channel for real-time collaboration — high adoption", "category": "Culture"}
    ],
    "summary": "Net strongly positive. The gains far outweigh the losses both financially and operationally. The solution is sustainable with minor ongoing management. The remaining gap to <1hr will require the automation and tooling projects.",
    "recommendation": "sustain"
  }'::jsonb,
  'c0010000-0000-4000-8000-000000000002',
  '2026-03-05 14:00:00+00'
);

COMMIT;
