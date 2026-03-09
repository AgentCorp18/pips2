-- ============================================================
-- PIPS 2.0 — Production Seed Data
-- ============================================================
-- Creates a realistic worked example for demos and development.
--
-- Contents:
--   - 3 demo users (auth.users + profiles)
--   - 1 demo organization with settings
--   - 1 team with all 3 users
--   - Project 1: "Parking Lot Improvement" — Step 5 (Implement)
--     with completed forms for steps 1-4 and 10 tickets
--   - Project 2: "Customer Onboarding Optimization" — Step 2 (Analyze)
--     with a problem_statement form only
--
-- All inserts use fixed UUIDs and ON CONFLICT DO NOTHING so
-- this script is idempotent (safe to run repeatedly).
-- ============================================================


-- ============================================================
-- FIXED UUIDs
-- ============================================================
-- Users
--   Owner:   11111111-1111-1111-1111-111111111111
--   Manager: 22222222-2222-2222-2222-222222222222
--   Member:  33333333-3333-3333-3333-333333333333
--
-- Organization:  aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
-- Team:          bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb
-- Org settings:  bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1
--
-- Project 1 (Parking Lot):         cccccccc-cccc-cccc-cccc-cccccccccccc
-- Project 1 steps:                 cccccccc-cccc-cccc-cccc-ccccccccccc1 .. ccc6
-- Project 1 forms:                 dddddddd-dddd-dddd-dddd-ddddddddddd1 .. ddd9
-- Project 1 tickets:               eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1 .. eee0
--
-- Project 2 (Customer Onboarding): ffffffff-ffff-ffff-ffff-ffffffffffff
-- Project 2 steps:                 ffffffff-ffff-ffff-ffff-fffffffffff1 .. fff6
-- Project 2 form:                  ffffffff-ffff-ffff-ffff-fffffffffff0


-- ============================================================
-- 1. AUTH USERS
-- ============================================================
-- The handle_new_user trigger auto-creates profiles rows.

-- User 1: Dana Rivera (org owner)
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, role, aud, confirmation_token
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'dana.rivera@pips-demo.com',
  crypt('DemoPassword1!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Dana Rivera"}'::jsonb,
  NOW(), NOW(), 'authenticated', 'authenticated', ''
) ON CONFLICT (id) DO NOTHING;

-- User 2: Jordan Chen (manager / facilitator)
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, role, aud, confirmation_token
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000000',
  'jordan.chen@pips-demo.com',
  crypt('DemoPassword1!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Jordan Chen"}'::jsonb,
  NOW(), NOW(), 'authenticated', 'authenticated', ''
) ON CONFLICT (id) DO NOTHING;

-- User 3: Alex Morgan (team member)
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, role, aud, confirmation_token
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  '00000000-0000-0000-0000-000000000000',
  'alex.morgan@pips-demo.com',
  crypt('DemoPassword1!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Alex Morgan"}'::jsonb,
  NOW(), NOW(), 'authenticated', 'authenticated', ''
) ON CONFLICT (id) DO NOTHING;

-- Update profiles with display names (trigger created the rows)
UPDATE profiles SET display_name = 'Dana', timezone = 'America/New_York'
  WHERE id = '11111111-1111-1111-1111-111111111111';
UPDATE profiles SET display_name = 'Jordan', timezone = 'America/Chicago'
  WHERE id = '22222222-2222-2222-2222-222222222222';
UPDATE profiles SET display_name = 'Alex', timezone = 'America/Los_Angeles'
  WHERE id = '33333333-3333-3333-3333-333333333333';


-- ============================================================
-- 2. ORGANIZATION
-- ============================================================
INSERT INTO organizations (id, name, slug, plan, created_by, max_members)
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'PIPS Demo Company',
  'pips-demo',
  'free',
  '11111111-1111-1111-1111-111111111111',
  25
) ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- 3. ORG MEMBERS
-- ============================================================
INSERT INTO org_members (org_id, user_id, role) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'owner'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'manager'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'member')
ON CONFLICT ON CONSTRAINT unique_org_member DO NOTHING;


-- ============================================================
-- 4. ORG SETTINGS
-- ============================================================
INSERT INTO org_settings (id, org_id, primary_color, secondary_color, features)
VALUES (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '#4F46E5',
  '#F59E0B',
  '{
    "ticketing": true,
    "pips_projects": true,
    "integrations": false,
    "custom_forms": false,
    "api_access": false,
    "sso": false
  }'::jsonb
) ON CONFLICT (org_id) DO NOTHING;


-- ============================================================
-- 5. TEAM
-- ============================================================
INSERT INTO teams (id, org_id, name, description, color, created_by)
VALUES (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'Facilities Improvement Team',
  'Cross-functional team focused on workplace and facilities process improvements',
  '#4F46E5',
  '11111111-1111-1111-1111-111111111111'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO team_members (team_id, user_id, role) VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'lead'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'member'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', 'member')
ON CONFLICT ON CONSTRAINT unique_team_member DO NOTHING;


-- ============================================================
-- 6. PROJECT 1: Parking Lot Improvement
--    Status: active, currently on Step 5 (implement)
-- ============================================================
INSERT INTO projects (
  id, org_id, title, description, status, current_step,
  owner_id, team_id, problem_statement,
  target_start, target_end, actual_start, priority, tags
) VALUES (
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'Parking Lot Improvement',
  'Process improvement project to optimize the company parking lot allocation system. Employees report chronic difficulty finding spaces during peak hours, leading to late arrivals, reduced productivity, and declining satisfaction scores.',
  'active',
  'implement',
  '11111111-1111-1111-1111-111111111111',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'Employees spend an average of 12 minutes searching for parking during the 8:00-9:00 AM peak window. 45% of employees report searching more than 10 minutes at least 3 times per week. This results in approximately 35 late arrivals per week and an estimated 28 lost person-hours of productivity daily. The current satisfaction score for parking is 3.2 out of 10.',
  '2026-01-15',
  '2026-05-30',
  '2026-01-15',
  'high',
  ARRAY['parking', 'facilities', 'employee-satisfaction', 'productivity']
) ON CONFLICT (id) DO NOTHING;

-- Project 1 members
INSERT INTO project_members (project_id, user_id, role) VALUES
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'lead'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'facilitator'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', 'contributor')
ON CONFLICT ON CONSTRAINT unique_project_member DO NOTHING;


-- ============================================================
-- 7. PROJECT 1 — STEPS
-- ============================================================

-- Step 1: Identify (COMPLETED)
INSERT INTO project_steps (id, project_id, step, status, data, notes, started_at, completed_at, completed_by)
VALUES (
  'cccccccc-cccc-cccc-cccc-ccccccccccc1',
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'identify',
  'completed',
  '{
    "problem_type": "process",
    "impact_areas": ["productivity", "employee_satisfaction", "safety", "retention"],
    "stakeholders": ["all employees", "facilities management", "HR", "executive leadership", "security team"],
    "measurement_baseline": {
      "avg_search_time_minutes": 12,
      "late_arrivals_per_week": 35,
      "satisfaction_score": 3.2,
      "lost_person_hours_daily": 28,
      "employees_affected_percent": 78
    },
    "goal": "Reduce average parking search time from 12 minutes to under 3 minutes and raise satisfaction from 3.2 to 7.0+ within 90 days of implementation"
  }'::jsonb,
  'Problem statement reviewed and approved unanimously by stakeholder group on Jan 20. Survey data from 187 of 240 employees (78% response rate) confirmed the severity.',
  '2026-01-15 09:00:00+00',
  '2026-01-22 16:00:00+00',
  '11111111-1111-1111-1111-111111111111'
) ON CONFLICT ON CONSTRAINT unique_project_step DO NOTHING;

-- Step 2: Analyze (COMPLETED)
INSERT INTO project_steps (id, project_id, step, status, data, notes, started_at, completed_at, completed_by)
VALUES (
  'cccccccc-cccc-cccc-cccc-ccccccccccc2',
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'analyze',
  'completed',
  '{
    "root_causes_identified": [
      "80% of employees have identical 8:30 AM start time — no flex scheduling",
      "Single entry/exit gate causes 8-second-per-car bottleneck",
      "No real-time occupancy information — drivers circle aimlessly",
      "Employees from adjacent building use our lot (no badge access)",
      "Overflow lot is unmarked and 400m from entrance — nobody uses it",
      "Outdated scheduling policy from 15 years ago never reviewed"
    ],
    "tools_used": ["fishbone", "five_why", "force_field"],
    "data_collected": {
      "peak_arrival_window": "8:00–8:30 AM",
      "lot_capacity": 180,
      "daily_demand": 220,
      "gate_throughput_per_minute": 7.5,
      "overflow_lot_usage_percent": 12
    }
  }'::jsonb,
  'Root cause analysis complete. Fishbone workshop on Jan 27 with 12 participants. Five-Why analysis confirmed scheduling policy is the deepest root cause. Force field analysis shows strong driving forces for change.',
  '2026-01-23 09:00:00+00',
  '2026-02-05 17:00:00+00',
  '22222222-2222-2222-2222-222222222222'
) ON CONFLICT ON CONSTRAINT unique_project_step DO NOTHING;

-- Step 3: Generate (COMPLETED)
INSERT INTO project_steps (id, project_id, step, status, data, notes, started_at, completed_at, completed_by)
VALUES (
  'cccccccc-cccc-cccc-cccc-ccccccccccc3',
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'generate',
  'completed',
  '{
    "solutions_generated": 14,
    "tools_used": ["brainstorming"],
    "top_ideas": [
      "Install IoT occupancy sensors with real-time dashboard and mobile app",
      "Implement flexible start times (7:30–9:30 window) with department scheduling",
      "Add badge-controlled gate to prevent unauthorized lot usage",
      "Improve overflow lot: lighting, signage, shuttle service, covered walkway",
      "Introduce carpool incentive program (reserved premium spots)",
      "Convert to assigned zones by department with dynamic reallocation",
      "Add second entry lane with faster barrier arm",
      "Introduce 2-day remote work policy to reduce daily demand by 40%"
    ],
    "participants": ["Dana Rivera", "Jordan Chen", "Alex Morgan", "Maria Santos (Facilities)", "Tom Baker (HR)", "Lisa Park (Engineering)"]
  }'::jsonb,
  'Brainstorming session generated 14 ideas. Team used dot voting to narrow to 8 top candidates for evaluation.',
  '2026-02-06 09:00:00+00',
  '2026-02-14 16:00:00+00',
  '22222222-2222-2222-2222-222222222222'
) ON CONFLICT ON CONSTRAINT unique_project_step DO NOTHING;

-- Step 4: Select & Plan (COMPLETED)
INSERT INTO project_steps (id, project_id, step, status, data, notes, started_at, completed_at, completed_by)
VALUES (
  'cccccccc-cccc-cccc-cccc-ccccccccccc4',
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'select_plan',
  'completed',
  '{
    "selected_solutions": [
      "Implement flexible start times (7:30–9:30 window)",
      "Install IoT occupancy sensors with real-time dashboard",
      "Improve overflow lot (lighting, signage, covered walkway)",
      "Add badge-controlled gate access"
    ],
    "tools_used": ["criteria_matrix", "implementation_plan", "raci"],
    "decision_rationale": "Criteria matrix scored flexible start times highest (4.6/5) on impact-to-effort ratio. Combined with sensors and overflow lot improvements, the package addresses root causes at reasonable cost. Badge gate prevents scope creep from unauthorized users.",
    "total_budget_estimate": 47500,
    "implementation_timeline_weeks": 10
  }'::jsonb,
  'Criteria matrix completed Feb 18. Implementation plan and RACI approved by leadership on Feb 21. Budget approved at $47,500 total.',
  '2026-02-15 09:00:00+00',
  '2026-02-25 17:00:00+00',
  '11111111-1111-1111-1111-111111111111'
) ON CONFLICT ON CONSTRAINT unique_project_step DO NOTHING;

-- Step 5: Implement (IN PROGRESS)
INSERT INTO project_steps (id, project_id, step, status, data, notes, started_at)
VALUES (
  'cccccccc-cccc-cccc-cccc-ccccccccccc5',
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'implement',
  'in_progress',
  '{
    "milestones_total": 4,
    "milestones_completed": 2,
    "milestones": [
      {"name": "Flex schedule policy approved and communicated", "status": "completed", "completed_date": "2026-03-01"},
      {"name": "IoT sensors installed and dashboard live", "status": "completed", "completed_date": "2026-03-03"},
      {"name": "Overflow lot improvements finished", "status": "in_progress", "target_date": "2026-03-15"},
      {"name": "Badge gate installed and activated", "status": "not_started", "target_date": "2026-03-28"}
    ],
    "budget_spent": 28750,
    "budget_total": 47500,
    "percent_complete": 55
  }'::jsonb,
  'Flex scheduling launched March 1 — early feedback very positive. Sensors operational. Overflow lot construction underway (lighting 80% done, walkway foundation poured). Badge gate vendor confirmed install date March 20.',
  '2026-02-26 09:00:00+00'
) ON CONFLICT ON CONSTRAINT unique_project_step DO NOTHING;

-- Step 6: Evaluate (NOT STARTED)
INSERT INTO project_steps (id, project_id, step, status, data)
VALUES (
  'cccccccc-cccc-cccc-cccc-ccccccccccc6',
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'evaluate',
  'not_started',
  '{}'::jsonb
) ON CONFLICT ON CONSTRAINT unique_project_step DO NOTHING;


-- ============================================================
-- 8. PROJECT 1 — FORMS (Steps 1-4)
-- ============================================================

-- ---- STEP 1: IDENTIFY ----

-- Form 1: Problem Statement
INSERT INTO project_forms (id, project_id, step, form_type, title, data, created_by)
VALUES (
  'dddddddd-dddd-dddd-dddd-ddddddddddd1',
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'identify',
  'problem_statement',
  'Parking Lot Problem Statement',
  '{
    "problem": "Employees spend an average of 12 minutes searching for parking during the 8:00–9:00 AM peak arrival window, resulting in chronic late arrivals and lost productivity.",
    "who_affected": "All 240 employees at the main campus, with 78% reporting significant impact. Facilities management bears the burden of daily complaints.",
    "what_happening": "The 180-space main parking lot reaches full capacity by 8:15 AM. Employees arriving after that time circle the lot or park off-site, adding 10-15 minutes to their commute. An overflow lot exists but is poorly lit, unmarked, and 400 meters from the building entrance.",
    "when_occurring": "Every weekday, concentrated between 8:00 and 9:00 AM. Problem worsens on Mondays and Fridays due to all-hands meetings.",
    "where_occurring": "Main campus parking lot (180 spaces) and adjacent roads. Overflow lot at the northeast corner of the property.",
    "impact_magnitude": "35 late arrivals per week. 28 lost person-hours of productivity per day. Parking satisfaction score of 3.2/10 (lowest of all workplace factors). Two near-miss safety incidents in Q4 from drivers rushing.",
    "desired_outcome": "Reduce average parking search time to under 3 minutes. Achieve parking satisfaction score of 7.0 or higher. Eliminate unsafe driving behavior in the lot.",
    "measurement_method": "Pre/post employee survey, IoT sensor data on search patterns, time-stamped badge-in records vs. scheduled start time, monthly satisfaction pulse survey."
  }'::jsonb,
  '11111111-1111-1111-1111-111111111111'
) ON CONFLICT (id) DO NOTHING;

-- Form 2: Impact Assessment
INSERT INTO project_forms (id, project_id, step, form_type, title, data, created_by)
VALUES (
  'dddddddd-dddd-dddd-dddd-ddddddddddd2',
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'identify',
  'impact_assessment',
  'Parking Impact Assessment',
  '{
    "financial_impact": {
      "annual_lost_productivity_hours": 7280,
      "avg_hourly_rate": 45,
      "annual_cost_estimate": 327600,
      "notes": "28 lost person-hours/day x 260 workdays = 7,280 hours. At average $45/hr fully loaded cost = $327,600/year."
    },
    "employee_impact": {
      "satisfaction_score": 3.2,
      "employees_affected": 187,
      "total_employees": 240,
      "percent_affected": 78,
      "turnover_risk": "12% of affected employees cited parking as a factor in considering other opportunities (exit survey data)",
      "morale_notes": "Parking is the #1 complaint in the last 3 quarterly engagement surveys"
    },
    "safety_impact": {
      "incidents_last_quarter": 2,
      "risk_level": "medium",
      "description": "Two near-miss incidents in Q4 2025 — one involving a pedestrian. Drivers rush to grab spots and cut through pedestrian walkways."
    },
    "operational_impact": {
      "avg_late_minutes": 12,
      "late_arrivals_per_week": 35,
      "meeting_delays_per_week": 8,
      "description": "Morning standup meetings delayed 2-3 times per week. Client calls missed once in December."
    },
    "urgency": "high",
    "complexity": "medium",
    "estimated_roi": "6:1 over 3 years based on $47.5K investment vs. $327.6K annual productivity recovery"
  }'::jsonb,
  '11111111-1111-1111-1111-111111111111'
) ON CONFLICT (id) DO NOTHING;

-- ---- STEP 2: ANALYZE ----

-- Form 3: Fishbone Diagram
INSERT INTO project_forms (id, project_id, step, form_type, title, data, created_by)
VALUES (
  'dddddddd-dddd-dddd-dddd-ddddddddddd3',
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'analyze',
  'fishbone',
  'Parking Lot Root Cause Analysis',
  '{
    "problem": "Employees spend 12+ minutes searching for parking during peak hours (8:00–9:00 AM)",
    "categories": {
      "People": [
        "80% of employees arrive within the same 30-minute window (8:00–8:30)",
        "No incentive for carpooling or alternative transportation",
        "Visitors and delivery drivers take employee-designated spots",
        "Employees from the adjacent building park in our lot"
      ],
      "Process": [
        "Rigid 8:30 AM start time policy — no flex scheduling allowed",
        "No assigned parking zones by department or arrival pattern",
        "No enforcement mechanism for parking rules",
        "No remote work policy to reduce daily lot demand"
      ],
      "Place / Environment": [
        "Single entry/exit creates bottleneck (7.5 cars/min throughput)",
        "Overflow lot is 400m away, poorly lit, no signage, no covered walkway",
        "Lot layout has 3 dead-end rows that trap circling drivers",
        "No visitor-designated area — visitors take closest spots"
      ],
      "Technology / Equipment": [
        "No occupancy sensors or real-time tracking of available spaces",
        "No digital signage at entrance showing lot status",
        "Gate arm takes 8 seconds to open — creates entry queue",
        "No mobile app or dashboard for employees to check availability"
      ],
      "Management / Policy": [
        "Scheduling policy set 15 years ago for 80-person company, never updated for 240",
        "No facilities budget allocated for parking improvements",
        "Parking complaints escalated to HR but no cross-functional ownership",
        "No data collection on parking patterns — decisions based on anecdotes"
      ]
    },
    "primary_root_causes": [
      "Rigid scheduling policy causing demand spike",
      "No real-time occupancy information",
      "Overflow lot is unusable in current state"
    ],
    "workshop_date": "2026-01-27",
    "participants": 12
  }'::jsonb,
  '22222222-2222-2222-2222-222222222222'
) ON CONFLICT (id) DO NOTHING;

-- Form 4: Five Why Analysis
INSERT INTO project_forms (id, project_id, step, form_type, title, data, created_by)
VALUES (
  'dddddddd-dddd-dddd-dddd-ddddddddddd4',
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'analyze',
  'five_why',
  'Why Are Employees Arriving Late?',
  '{
    "problem": "35 employees per week arrive late due to parking, losing 28 person-hours daily",
    "whys": [
      {
        "question": "Why are 35 employees arriving late each week?",
        "answer": "They cannot find available parking spaces near the building and must search or park far away, adding 10-15 minutes to their arrival."
      },
      {
        "question": "Why are all nearby spaces taken when they arrive?",
        "answer": "The 180-space main lot is full by 8:15 AM because 192 of 240 employees (80%) have an 8:30 AM start time and arrive in the same 30-minute window."
      },
      {
        "question": "Why do 80% of employees arrive in the same 30-minute window?",
        "answer": "Company policy mandates a uniform 8:30 AM start time for all departments with no flexible scheduling option."
      },
      {
        "question": "Why does the company mandate a single start time?",
        "answer": "The policy was established 15 years ago when the company had 80 employees and the lot had ample capacity. It was designed for team coordination when all teams worked on-site together."
      },
      {
        "question": "Why has the policy never been updated?",
        "answer": "No one owned parking as a process. Complaints went to HR, but HR had no authority over scheduling or facilities. The issue grew gradually and was never escalated as a formal process improvement project."
      }
    ],
    "root_cause": "Outdated rigid scheduling policy from 15 years ago, combined with lack of cross-functional ownership of workplace logistics, has never been reviewed despite 3x growth in headcount.",
    "recommended_actions": [
      "Implement flexible start time window (7:30–9:30 AM) to spread demand",
      "Introduce 2-day optional remote work to reduce daily lot demand",
      "Assign cross-functional ownership of workplace logistics to Facilities team with executive sponsor"
    ]
  }'::jsonb,
  '22222222-2222-2222-2222-222222222222'
) ON CONFLICT (id) DO NOTHING;

-- Form 5: Force Field Analysis
INSERT INTO project_forms (id, project_id, step, form_type, title, data, created_by)
VALUES (
  'dddddddd-dddd-dddd-dddd-ddddddddddd5',
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'analyze',
  'force_field',
  'Force Field Analysis — Parking Changes',
  '{
    "change_proposal": "Implement flexible scheduling, IoT sensors, overflow lot improvements, and badge-controlled access",
    "driving_forces": [
      {"force": "Strong employee demand — 78% want change", "strength": 5},
      {"force": "Quantified productivity loss ($327K/year)", "strength": 5},
      {"force": "Safety incidents creating liability risk", "strength": 4},
      {"force": "Executive sponsor (VP Operations) committed", "strength": 4},
      {"force": "Competitor companies already offer flex scheduling", "strength": 3},
      {"force": "IoT sensor costs have dropped 60% in 2 years", "strength": 3}
    ],
    "restraining_forces": [
      {"force": "Manager concern about team coordination with flex hours", "strength": 4},
      {"force": "Upfront capital cost for sensors and gate ($47.5K)", "strength": 3},
      {"force": "IT team at capacity — sensor integration needs bandwidth", "strength": 3},
      {"force": "Construction disruption during overflow lot renovation", "strength": 2},
      {"force": "Some employees prefer the current fixed schedule", "strength": 2},
      {"force": "Badge gate vendor has 4-week lead time", "strength": 1}
    ],
    "total_driving": 24,
    "total_restraining": 15,
    "net_assessment": "Strong net driving force (+9). Key restraining force to address is manager buy-in on flex scheduling — propose department-level coordination windows.",
    "mitigation_strategies": [
      "Require each department to designate 2-hour core overlap window (e.g., 10 AM–12 PM) to address coordination concerns",
      "Phase construction to minimize disruption — overflow lot improvements during weekends",
      "Negotiate vendor priority lane for badge gate to reduce lead time to 3 weeks"
    ]
  }'::jsonb,
  '22222222-2222-2222-2222-222222222222'
) ON CONFLICT (id) DO NOTHING;

-- ---- STEP 3: GENERATE ----

-- Form 6: Brainstorming
INSERT INTO project_forms (id, project_id, step, form_type, title, data, created_by)
VALUES (
  'dddddddd-dddd-dddd-dddd-ddddddddddd6',
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'generate',
  'brainstorming',
  'Parking Solutions Brainstorm',
  '{
    "session_date": "2026-02-07",
    "duration_minutes": 90,
    "facilitator": "Jordan Chen",
    "participants": ["Dana Rivera", "Jordan Chen", "Alex Morgan", "Maria Santos", "Tom Baker", "Lisa Park"],
    "rules": ["No criticism during ideation", "Build on others ideas", "Go for quantity", "Wild ideas welcome"],
    "ideas": [
      {"id": 1, "text": "Install IoT occupancy sensors with real-time dashboard and mobile app", "votes": 8, "author": "Alex Morgan"},
      {"id": 2, "text": "Implement flexible start times (7:30–9:30 window) with department scheduling", "votes": 10, "author": "Dana Rivera"},
      {"id": 3, "text": "Add badge-controlled gate to prevent unauthorized lot usage", "votes": 7, "author": "Maria Santos"},
      {"id": 4, "text": "Improve overflow lot: lighting, signage, shuttle service, covered walkway", "votes": 9, "author": "Jordan Chen"},
      {"id": 5, "text": "Introduce carpool incentive program with reserved premium spots", "votes": 5, "author": "Tom Baker"},
      {"id": 6, "text": "Convert to assigned zones by department with dynamic reallocation", "votes": 4, "author": "Lisa Park"},
      {"id": 7, "text": "Add second entry lane with faster barrier arm", "votes": 6, "author": "Alex Morgan"},
      {"id": 8, "text": "Introduce 2-day remote work policy to reduce daily demand by 40%", "votes": 7, "author": "Dana Rivera"},
      {"id": 9, "text": "Partner with nearby transit authority for subsidized bus passes", "votes": 3, "author": "Tom Baker"},
      {"id": 10, "text": "Build a parking garage (multi-level structure)", "votes": 2, "author": "Maria Santos"},
      {"id": 11, "text": "Create EV charging stations in overflow lot as an incentive to park there", "votes": 4, "author": "Lisa Park"},
      {"id": 12, "text": "Implement reservation system — book your spot the night before via app", "votes": 6, "author": "Alex Morgan"},
      {"id": 13, "text": "Redesign lot layout to eliminate dead-end rows and improve flow", "votes": 5, "author": "Jordan Chen"},
      {"id": 14, "text": "Negotiate shared parking agreement with adjacent office building", "votes": 3, "author": "Dana Rivera"}
    ],
    "total_ideas": 14,
    "shortlisted_for_evaluation": [1, 2, 3, 4, 7, 8]
  }'::jsonb,
  '22222222-2222-2222-2222-222222222222'
) ON CONFLICT (id) DO NOTHING;

-- ---- STEP 4: SELECT & PLAN ----

-- Form 7: Criteria Matrix
INSERT INTO project_forms (id, project_id, step, form_type, title, data, created_by)
VALUES (
  'dddddddd-dddd-dddd-dddd-ddddddddddd7',
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'select_plan',
  'criteria_matrix',
  'Solution Selection Matrix',
  '{
    "criteria": [
      {"name": "Impact on search time", "weight": 5, "description": "How much will this reduce average parking search time?"},
      {"name": "Cost effectiveness", "weight": 4, "description": "Ratio of benefit to implementation cost"},
      {"name": "Speed of implementation", "weight": 3, "description": "How quickly can this be deployed?"},
      {"name": "Employee acceptance", "weight": 4, "description": "Will employees embrace this change?"},
      {"name": "Sustainability", "weight": 3, "description": "Will benefits persist long-term without ongoing effort?"}
    ],
    "solutions": [
      {
        "name": "Flexible start times (7:30–9:30)",
        "scores": [5, 5, 4, 4, 5],
        "weighted_total": 87,
        "rank": 1,
        "notes": "Highest impact, lowest cost. Spreads demand across 2-hour window."
      },
      {
        "name": "IoT occupancy sensors + dashboard",
        "scores": [3, 3, 3, 5, 5],
        "weighted_total": 71,
        "rank": 3,
        "notes": "Eliminates blind searching. $18K upfront + $200/mo. 4-week install."
      },
      {
        "name": "Overflow lot improvements",
        "scores": [4, 4, 3, 4, 5],
        "weighted_total": 76,
        "rank": 2,
        "notes": "Makes overflow lot viable. $22K for lighting, walkway, signage."
      },
      {
        "name": "Badge-controlled gate",
        "scores": [2, 3, 2, 3, 5],
        "weighted_total": 55,
        "rank": 5,
        "notes": "Prevents ~20 unauthorized parkers. $5.5K. 4-week lead time."
      },
      {
        "name": "Second entry lane",
        "scores": [2, 2, 2, 3, 4],
        "weighted_total": 47,
        "rank": 6,
        "notes": "Reduces entry bottleneck but does not address root cause. $15K."
      },
      {
        "name": "2-day remote work policy",
        "scores": [5, 5, 2, 3, 4],
        "weighted_total": 72,
        "rank": 4,
        "notes": "Dramatic demand reduction but requires major policy change. Deferred to Phase 2."
      }
    ],
    "selected": ["Flexible start times (7:30–9:30)", "IoT occupancy sensors + dashboard", "Overflow lot improvements", "Badge-controlled gate"],
    "selection_rationale": "Top 3 by score plus badge gate (quick win that stops unauthorized parking). Remote work deferred to Phase 2 as it requires broader organizational change."
  }'::jsonb,
  '11111111-1111-1111-1111-111111111111'
) ON CONFLICT (id) DO NOTHING;

-- Form 8: Implementation Plan
INSERT INTO project_forms (id, project_id, step, form_type, title, data, created_by)
VALUES (
  'dddddddd-dddd-dddd-dddd-ddddddddddd8',
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'select_plan',
  'implementation_plan',
  'Parking Lot Implementation Plan',
  '{
    "project_name": "Parking Lot Improvement",
    "total_budget": 47500,
    "timeline_start": "2026-02-26",
    "timeline_end": "2026-04-30",
    "phases": [
      {
        "name": "Phase 1: Flex Scheduling",
        "start": "2026-02-26",
        "end": "2026-03-01",
        "budget": 2000,
        "tasks": [
          "Draft flex scheduling policy with HR (7:30–9:30 window, 10–12 core hours)",
          "Get executive approval from VP Operations",
          "Communicate policy to all departments via town hall and email",
          "Update employee handbook and onboarding materials",
          "Set up department core-hours calendar"
        ],
        "success_criteria": "Policy live by March 1. 90%+ departments adopt within first week.",
        "status": "completed"
      },
      {
        "name": "Phase 2: IoT Sensors + Dashboard",
        "start": "2026-02-26",
        "end": "2026-03-03",
        "budget": 18000,
        "tasks": [
          "Select vendor (ParkSense Pro — best integration, 3-year warranty)",
          "Install 180 magnetic sensors (one per space) — weekend work",
          "Configure real-time dashboard on lobby screens",
          "Launch employee mobile app with live occupancy map",
          "Test and calibrate sensor accuracy (target: 99%+)"
        ],
        "success_criteria": "All 180 sensors live with <1% false readings. Dashboard and app accessible.",
        "status": "completed"
      },
      {
        "name": "Phase 3: Overflow Lot Renovation",
        "start": "2026-03-03",
        "end": "2026-03-15",
        "budget": 22000,
        "tasks": [
          "Install LED lighting (16 poles covering full overflow area)",
          "Build covered walkway from overflow lot to main entrance (200m)",
          "Add clear wayfinding signage at lot entrance and along walkway",
          "Repaint lines and add ADA-compliant spaces",
          "Add emergency call stations (2)"
        ],
        "success_criteria": "Overflow lot fully lit, walkway complete, all signage installed. Employee walkthrough test with positive feedback.",
        "status": "in_progress"
      },
      {
        "name": "Phase 4: Badge Gate Access",
        "start": "2026-03-15",
        "end": "2026-03-28",
        "budget": 5500,
        "tasks": [
          "Install badge reader at main lot entrance",
          "Program all employee badges for access",
          "Configure visitor temporary-access protocol with reception",
          "Install signage: Employee Parking Only — Badge Required",
          "Monitor for 1 week and adjust"
        ],
        "success_criteria": "Zero unauthorized vehicles in employee lot for 5 consecutive business days.",
        "status": "not_started"
      }
    ],
    "risks": [
      {"risk": "Sensor vendor delivery delay", "probability": "low", "impact": "medium", "mitigation": "Contract includes penalty clause; backup vendor identified"},
      {"risk": "Employee pushback on flex schedule", "probability": "medium", "impact": "high", "mitigation": "Core hours (10–12) preserve team coordination; department leads briefed"},
      {"risk": "Construction weather delays for overflow lot", "probability": "medium", "impact": "low", "mitigation": "Critical path items (lighting, walkway) can be done in covered conditions"},
      {"risk": "Badge system integration with existing HR software", "probability": "low", "impact": "medium", "mitigation": "IT pre-validated compatibility; vendor provides integration support"}
    ]
  }'::jsonb,
  '11111111-1111-1111-1111-111111111111'
) ON CONFLICT (id) DO NOTHING;

-- Form 9: RACI Chart
INSERT INTO project_forms (id, project_id, step, form_type, title, data, created_by)
VALUES (
  'dddddddd-dddd-dddd-dddd-ddddddddddd9',
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'select_plan',
  'raci',
  'Parking Lot RACI Matrix',
  '{
    "stakeholders": [
      "Dana Rivera (Project Lead / VP Ops)",
      "Jordan Chen (Facilitator / Process Analyst)",
      "Alex Morgan (Team Member / IT Liaison)",
      "Maria Santos (Facilities Manager)",
      "Tom Baker (HR Director)",
      "Lisa Park (Engineering Lead)"
    ],
    "activities": [
      {
        "activity": "Draft flex scheduling policy",
        "assignments": {
          "Dana Rivera": "A",
          "Jordan Chen": "C",
          "Alex Morgan": "I",
          "Maria Santos": "I",
          "Tom Baker": "R",
          "Lisa Park": "C"
        }
      },
      {
        "activity": "Procure and install IoT sensors",
        "assignments": {
          "Dana Rivera": "A",
          "Jordan Chen": "I",
          "Alex Morgan": "R",
          "Maria Santos": "R",
          "Tom Baker": "I",
          "Lisa Park": "C"
        }
      },
      {
        "activity": "Build sensor dashboard and mobile app",
        "assignments": {
          "Dana Rivera": "A",
          "Jordan Chen": "I",
          "Alex Morgan": "R",
          "Maria Santos": "C",
          "Tom Baker": "I",
          "Lisa Park": "R"
        }
      },
      {
        "activity": "Renovate overflow parking lot",
        "assignments": {
          "Dana Rivera": "A",
          "Jordan Chen": "I",
          "Alex Morgan": "I",
          "Maria Santos": "R",
          "Tom Baker": "I",
          "Lisa Park": "I"
        }
      },
      {
        "activity": "Install badge-controlled gate",
        "assignments": {
          "Dana Rivera": "A",
          "Jordan Chen": "I",
          "Alex Morgan": "R",
          "Maria Santos": "R",
          "Tom Baker": "C",
          "Lisa Park": "I"
        }
      },
      {
        "activity": "Communicate changes to all staff",
        "assignments": {
          "Dana Rivera": "A",
          "Jordan Chen": "R",
          "Alex Morgan": "I",
          "Maria Santos": "C",
          "Tom Baker": "R",
          "Lisa Park": "C"
        }
      },
      {
        "activity": "Measure results and report",
        "assignments": {
          "Dana Rivera": "A",
          "Jordan Chen": "R",
          "Alex Morgan": "C",
          "Maria Santos": "C",
          "Tom Baker": "I",
          "Lisa Park": "I"
        }
      }
    ],
    "legend": {
      "R": "Responsible — does the work",
      "A": "Accountable — final decision-maker",
      "C": "Consulted — provides input before action",
      "I": "Informed — notified after action"
    }
  }'::jsonb,
  '11111111-1111-1111-1111-111111111111'
) ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- 9. PROJECT 1 — TICKETS (10 tickets in various statuses)
-- ============================================================
-- Note: sequence_number is auto-generated by the trigger.
-- We do NOT set fixed IDs on tickets because sequence_number
-- is auto-incremented. Instead we use fixed IDs for reference.

-- Ticket 1: Survey employees (Step 1 — DONE)
INSERT INTO tickets (
  id, org_id, project_id, title, description, type, status, priority,
  pips_step, assignee_id, reporter_id, team_id, due_date, tags
) VALUES (
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'Distribute parking satisfaction survey to all employees',
  'Create and distribute a comprehensive survey covering current parking satisfaction, average daily search time, preferred arrival window, and openness to alternatives (flex schedule, carpool, overflow lot). Target 75%+ response rate within 5 business days.',
  'pips_project', 'done', 'high',
  'identify',
  '33333333-3333-3333-3333-333333333333',
  '11111111-1111-1111-1111-111111111111',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '2026-01-20',
  ARRAY['survey', 'data-collection']
) ON CONFLICT (id) DO NOTHING;

-- Ticket 2: Fishbone workshop (Step 2 — DONE)
INSERT INTO tickets (
  id, org_id, project_id, title, description, type, status, priority,
  pips_step, assignee_id, reporter_id, team_id, due_date, tags
) VALUES (
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee2',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'Conduct fishbone analysis workshop with stakeholders',
  'Schedule and facilitate a 2-hour fishbone analysis workshop with the 12-person stakeholder group. Pre-distribute survey results summary. Document all causes across 5 categories. Identify top 3 root causes for Five-Why deep dive.',
  'pips_project', 'done', 'high',
  'analyze',
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '2026-01-30',
  ARRAY['workshop', 'root-cause']
) ON CONFLICT (id) DO NOTHING;

-- Ticket 3: Vendor research for sensors (Step 2 — DONE)
INSERT INTO tickets (
  id, org_id, project_id, title, description, type, status, priority,
  pips_step, assignee_id, reporter_id, team_id, due_date, tags
) VALUES (
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee3',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'Research and compare parking occupancy sensor vendors',
  'Research at least 4 IoT parking sensor vendors. Compare on: per-space cost, installation time, API quality, dashboard features, mobile app, accuracy rate, warranty. Produce a 1-page comparison table for the criteria matrix evaluation.',
  'pips_project', 'done', 'medium',
  'analyze',
  '33333333-3333-3333-3333-333333333333',
  '22222222-2222-2222-2222-222222222222',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '2026-02-10',
  ARRAY['vendor-research', 'sensors']
) ON CONFLICT (id) DO NOTHING;

-- Ticket 4: Draft flex schedule policy (Step 4 — DONE)
INSERT INTO tickets (
  id, org_id, project_id, title, description, type, status, priority,
  pips_step, assignee_id, reporter_id, team_id, due_date, tags
) VALUES (
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee4',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'Draft flexible scheduling policy with HR',
  'Work with Tom Baker (HR) to draft the new flex scheduling policy. Key parameters: arrival window 7:30–9:30 AM, mandatory core hours 10 AM–12 PM, department leads assign team coordination windows. Include FAQ for employee rollout.',
  'pips_project', 'done', 'critical',
  'select_plan',
  '11111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '2026-02-25',
  ARRAY['policy', 'hr']
) ON CONFLICT (id) DO NOTHING;

-- Ticket 5: Install IoT sensors (Step 5 — DONE)
INSERT INTO tickets (
  id, org_id, project_id, title, description, type, status, priority,
  pips_step, assignee_id, reporter_id, team_id, due_date, tags
) VALUES (
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee5',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'Install 180 IoT occupancy sensors and configure dashboard',
  'Coordinate with ParkSense Pro vendor for weekend installation of 180 magnetic sensors. Configure the real-time dashboard for lobby screens. Deploy mobile app to all employees. Calibrate and verify 99%+ accuracy across all spaces.',
  'pips_project', 'done', 'high',
  'implement',
  '33333333-3333-3333-3333-333333333333',
  '11111111-1111-1111-1111-111111111111',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '2026-03-03',
  ARRAY['sensors', 'installation', 'it']
) ON CONFLICT (id) DO NOTHING;

-- Ticket 6: Overflow lot lighting (Step 5 — IN PROGRESS)
INSERT INTO tickets (
  id, org_id, project_id, title, description, type, status, priority,
  pips_step, assignee_id, reporter_id, team_id, due_date, tags
) VALUES (
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee6',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'Install LED lighting in overflow parking lot',
  'Install 16 LED light poles covering the entire overflow lot area. Must meet municipal code for parking lot illumination (minimum 1 foot-candle at ground level). Weekend work preferred to minimize disruption. 80% complete — 13 of 16 poles installed.',
  'pips_project', 'in_progress', 'high',
  'implement',
  '33333333-3333-3333-3333-333333333333',
  '22222222-2222-2222-2222-222222222222',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '2026-03-10',
  ARRAY['construction', 'lighting', 'overflow-lot']
) ON CONFLICT (id) DO NOTHING;

-- Ticket 7: Covered walkway construction (Step 5 — IN PROGRESS)
INSERT INTO tickets (
  id, org_id, project_id, title, description, type, status, priority,
  pips_step, assignee_id, reporter_id, team_id, due_date, tags
) VALUES (
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee7',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'Build covered walkway from overflow lot to main entrance',
  'Construct a 200-meter covered walkway connecting the overflow parking lot to the main building entrance. Foundation has been poured. Steel frame delivery expected March 7. Roofing and lighting to follow. Target completion March 15.',
  'pips_project', 'in_progress', 'medium',
  'implement',
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '2026-03-15',
  ARRAY['construction', 'walkway', 'overflow-lot']
) ON CONFLICT (id) DO NOTHING;

-- Ticket 8: Badge gate installation (Step 5 — TODO)
INSERT INTO tickets (
  id, org_id, project_id, title, description, type, status, priority,
  pips_step, assignee_id, reporter_id, team_id, due_date, tags
) VALUES (
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee8',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'Install badge-controlled access gate at main lot entrance',
  'Replace the current open gate arm with badge-controlled access. Vendor (SecureGate Systems) confirmed March 20 install date. Need to program all 240 employee badges. Set up visitor temporary access protocol with reception desk. Coordinate with IT for badge system integration.',
  'pips_project', 'todo', 'medium',
  'implement',
  '33333333-3333-3333-3333-333333333333',
  '11111111-1111-1111-1111-111111111111',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '2026-03-28',
  ARRAY['badge', 'security', 'vendor']
) ON CONFLICT (id) DO NOTHING;

-- Ticket 9: Update employee handbook (NOT linked to project — BACKLOG)
INSERT INTO tickets (
  id, org_id, title, description, type, status, priority,
  assignee_id, reporter_id, due_date, tags
) VALUES (
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee9',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'Update employee handbook with new parking and flex scheduling policies',
  'Once all parking changes are fully implemented and validated, update Section 4.2 (Parking) and Section 3.1 (Working Hours) of the employee handbook. Include the new flex scheduling policy, overflow lot information, mobile app instructions, and badge access procedures. Distribute updated handbook to all departments.',
  'task', 'backlog', 'low',
  '33333333-3333-3333-3333-333333333333',
  '11111111-1111-1111-1111-111111111111',
  '2026-04-30',
  ARRAY['documentation', 'hr']
) ON CONFLICT (id) DO NOTHING;

-- Ticket 10: Wayfinding signage (Step 5 — TODO)
INSERT INTO tickets (
  id, org_id, project_id, title, description, type, status, priority,
  pips_step, assignee_id, reporter_id, team_id, due_date, tags
) VALUES (
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee0',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'Install wayfinding signage for overflow lot and walkway',
  'Design and install directional signage at: main lot entrance (overflow lot arrow), along the access road, at the overflow lot entrance, and along the covered walkway. Signs must be illuminated for night visibility. Coordinate with brand team for consistent design.',
  'pips_project', 'todo', 'low',
  'implement',
  '22222222-2222-2222-2222-222222222222',
  '22222222-2222-2222-2222-222222222222',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '2026-03-15',
  ARRAY['signage', 'overflow-lot', 'design']
) ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- 10. PROJECT 1 — COMMENTS
-- ============================================================

-- Comment on survey ticket (ticket 1)
INSERT INTO comments (org_id, ticket_id, author_id, body)
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1',
  '33333333-3333-3333-3333-333333333333',
  'Survey sent to all 240 employees on Jan 16. After 5 business days we had 187 responses (78% response rate). Key findings: avg search time 12.3 min, 45% search 10+ min at least 3x/week, satisfaction score 3.2/10. Full results shared in the Step 1 data folder.'
) ON CONFLICT DO NOTHING;

-- Comment on fishbone workshop ticket (ticket 2)
INSERT INTO comments (org_id, ticket_id, author_id, body)
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee2',
  '22222222-2222-2222-2222-222222222222',
  'Workshop held Jan 27 with 12 participants. We identified causes across 5 categories (People, Process, Place, Technology, Management). The group consensus on top 3 root causes: (1) rigid scheduling, (2) no real-time occupancy info, (3) unusable overflow lot. These feed directly into the Five-Why analysis.'
) ON CONFLICT DO NOTHING;

-- Comment on sensor installation ticket (ticket 5)
INSERT INTO comments (org_id, ticket_id, author_id, body)
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee5',
  '33333333-3333-3333-3333-333333333333',
  'All 180 sensors installed over the weekend (March 1-2). Calibration complete — accuracy at 99.4%. Dashboard live on 3 lobby screens. Mobile app pushed to all employees via MDM. Already seeing employees check the app before leaving their desks — great early adoption.'
) ON CONFLICT DO NOTHING;

-- Comment on overflow lot lighting ticket (ticket 6)
INSERT INTO comments (org_id, ticket_id, author_id, body)
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee6',
  '22222222-2222-2222-2222-222222222222',
  '13 of 16 LED poles installed and operational. Remaining 3 poles are for the far east section — materials arriving Thursday. Should be complete by end of this week. Light level testing on installed sections shows 1.8 foot-candles average, well above the 1.0 minimum.'
) ON CONFLICT DO NOTHING;


-- ============================================================
-- 11. PROJECT 2: Customer Onboarding Optimization
--     Status: active, currently on Step 2 (analyze)
-- ============================================================
INSERT INTO projects (
  id, org_id, title, description, status, current_step,
  owner_id, team_id, problem_statement,
  target_start, target_end, priority, tags
) VALUES (
  'ffffffff-ffff-ffff-ffff-ffffffffffff',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'Customer Onboarding Optimization',
  'Process improvement project to reduce customer onboarding time and improve first-90-day retention. Current onboarding takes 23 days on average vs. industry benchmark of 10 days.',
  'active',
  'analyze',
  '22222222-2222-2222-2222-222222222222',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'New customer onboarding takes an average of 23 business days from signed contract to first productive use. The industry benchmark is 10 days. 34% of customers who churn in the first year cite slow onboarding as a primary factor. The onboarding process involves 6 departments and 14 handoffs, with an average of 3.2 days idle time between handoffs.',
  '2026-03-01',
  '2026-06-30',
  'high',
  ARRAY['onboarding', 'customer-success', 'retention']
) ON CONFLICT (id) DO NOTHING;

-- Project 2 members
INSERT INTO project_members (project_id, user_id, role) VALUES
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '22222222-2222-2222-2222-222222222222', 'lead'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '11111111-1111-1111-1111-111111111111', 'contributor'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '33333333-3333-3333-3333-333333333333', 'contributor')
ON CONFLICT ON CONSTRAINT unique_project_member DO NOTHING;


-- ============================================================
-- 12. PROJECT 2 — STEPS
-- ============================================================

-- Step 1: Identify (COMPLETED)
INSERT INTO project_steps (id, project_id, step, status, data, notes, started_at, completed_at, completed_by)
VALUES (
  'ffffffff-ffff-ffff-ffff-fffffffffff1',
  'ffffffff-ffff-ffff-ffff-ffffffffffff',
  'identify',
  'completed',
  '{
    "problem_type": "process",
    "impact_areas": ["customer_satisfaction", "revenue", "retention"],
    "stakeholders": ["sales", "customer_success", "engineering", "support", "finance", "legal"],
    "measurement_baseline": {
      "avg_onboarding_days": 23,
      "industry_benchmark_days": 10,
      "first_year_churn_rate_percent": 34,
      "handoffs_per_onboarding": 14,
      "avg_idle_days_between_handoffs": 3.2
    },
    "goal": "Reduce average onboarding time from 23 days to 12 days and improve first-year retention by 15 percentage points within 6 months"
  }'::jsonb,
  'Problem validated with data from 85 recent customer onboardings. CS team confirmed bottleneck is in legal review and technical provisioning handoffs.',
  '2026-03-01 09:00:00+00',
  '2026-03-02 17:00:00+00',
  '22222222-2222-2222-2222-222222222222'
) ON CONFLICT ON CONSTRAINT unique_project_step DO NOTHING;

-- Step 2: Analyze (IN PROGRESS)
INSERT INTO project_steps (id, project_id, step, status, data, notes, started_at)
VALUES (
  'ffffffff-ffff-ffff-ffff-fffffffffff2',
  'ffffffff-ffff-ffff-ffff-ffffffffffff',
  'analyze',
  'in_progress',
  '{
    "tools_used": ["fishbone"],
    "preliminary_findings": [
      "Legal contract review takes 5 business days on average (no SLA in place)",
      "Technical provisioning requires manual steps that could be automated",
      "3 of 14 handoffs are redundant — information gets re-requested",
      "No single owner of the end-to-end onboarding experience"
    ]
  }'::jsonb,
  'Fishbone workshop scheduled for March 5. Preliminary process mapping complete — identified 14 handoffs across 6 departments.',
  '2026-03-03 09:00:00+00'
) ON CONFLICT ON CONSTRAINT unique_project_step DO NOTHING;

-- Steps 3-6: Not started
INSERT INTO project_steps (id, project_id, step, status, data)
VALUES
  ('ffffffff-ffff-ffff-ffff-fffffffffff3', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'generate', 'not_started', '{}'::jsonb),
  ('ffffffff-ffff-ffff-ffff-fffffffffff4', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'select_plan', 'not_started', '{}'::jsonb),
  ('ffffffff-ffff-ffff-ffff-fffffffffff5', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'implement', 'not_started', '{}'::jsonb),
  ('ffffffff-ffff-ffff-ffff-fffffffffff6', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'evaluate', 'not_started', '{}'::jsonb)
ON CONFLICT ON CONSTRAINT unique_project_step DO NOTHING;


-- ============================================================
-- 13. PROJECT 2 — FORMS
-- ============================================================

-- Problem Statement for Customer Onboarding
INSERT INTO project_forms (id, project_id, step, form_type, title, data, created_by)
VALUES (
  'ffffffff-ffff-ffff-ffff-fffffffffff0',
  'ffffffff-ffff-ffff-ffff-ffffffffffff',
  'identify',
  'problem_statement',
  'Customer Onboarding Problem Statement',
  '{
    "problem": "New customer onboarding takes an average of 23 business days from signed contract to first productive use, more than double the industry benchmark of 10 days.",
    "who_affected": "All new customers (approximately 15 per month), the customer success team (8 people), and indirectly the sales team whose commission is tied to successful activation.",
    "what_happening": "After a contract is signed, the onboarding process passes through 6 departments (Sales, Legal, Finance, Engineering, Support, Customer Success) with 14 handoffs. Each handoff introduces an average of 3.2 days of idle time. Legal review alone takes 5 days with no SLA. Technical provisioning requires 12 manual steps.",
    "when_occurring": "Every new customer engagement. The problem has worsened as headcount grew — 18 months ago average onboarding was 15 days.",
    "where_occurring": "Cross-departmental — the process spans Sales, Legal, Finance, Engineering, Support, and Customer Success with no single owner.",
    "impact_magnitude": "34% of first-year churners cite slow onboarding. At $24K average annual contract value and 15 new customers/month, each percentage point of churn improvement represents approximately $43K in retained annual revenue.",
    "desired_outcome": "Reduce average onboarding time from 23 days to 12 days. Improve first-year retention from 66% to 81%. Establish a single onboarding process owner.",
    "measurement_method": "Track onboarding start-to-activation time in CRM. Monthly cohort analysis of retention rates. Automated handoff time tracking between departments."
  }'::jsonb,
  '22222222-2222-2222-2222-222222222222'
) ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- 14. NOTIFICATIONS
-- ============================================================
INSERT INTO notifications (org_id, user_id, type, title, body, entity_type, entity_id) VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    'project_updated',
    'Parking Lot Improvement advanced to Step 5',
    'The project has moved to Step 5: Implement. Flex scheduling is live, sensors are operational. Overflow lot renovation and badge gate installation remain.',
    'project',
    'cccccccc-cccc-cccc-cccc-cccccccccccc'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '33333333-3333-3333-3333-333333333333',
    'ticket_assigned',
    'You were assigned: Install badge-controlled access gate',
    'Dana Rivera assigned you to this ticket. Due date: March 28, 2026. Vendor confirmed March 20 install date — coordinate badge programming with IT.',
    'ticket',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee8'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '22222222-2222-2222-2222-222222222222',
    'project_updated',
    'Customer Onboarding Optimization started',
    'A new PIPS project has been created. You are the project lead. Step 1 (Identify) is complete — begin root cause analysis in Step 2.',
    'project',
    'ffffffff-ffff-ffff-ffff-ffffffffffff'
  )
ON CONFLICT DO NOTHING;


-- ============================================================
-- 15. CONTENT NODES — Knowledge Hub sample content
-- ============================================================
-- Content nodes are a global catalog (no org_id, no RLS).
-- IDs use a human-readable slug format: pillar-slug

-- ----- BOOK chapters (one per PIPS pillar area) -----

INSERT INTO content_nodes (id, pillar, title, slug, summary, body_md, estimated_read_minutes, sort_order, access_level, tags, related_nodes)
VALUES (
  'book-understanding-the-problem',
  'book',
  'Understanding the Problem: Why Most Improvement Efforts Fail',
  'understanding-the-problem',
  'Explores why 70% of process improvement initiatives fail and how the PIPS methodology addresses the root causes of failure through structured problem identification.',
  E'# Understanding the Problem\n\nMost process improvement efforts fail not because teams lack motivation, but because they skip the most critical step: truly understanding the problem they are trying to solve.\n\n## The 70% Failure Rate\n\nResearch consistently shows that roughly 70% of organizational change initiatives fail to achieve their stated goals. The primary reason? Teams jump to solutions before they have properly identified and scoped the problem.\n\n## The PIPS Approach\n\nThe PIPS methodology begins with **Step 1: Identify** — a structured approach to problem identification that ensures teams:\n\n- Define the problem in measurable terms\n- Identify all affected stakeholders\n- Establish a clear baseline before attempting any changes\n- Articulate the desired outcome with specific success criteria\n\n## The Problem Statement Framework\n\nA well-crafted problem statement answers six essential questions: Who is affected? What is happening? When does it occur? Where does it happen? What is the magnitude of impact? What does the desired outcome look like?\n\nWithout this foundation, even the most creative solutions will miss their mark.',
  8,
  1,
  'public',
  '{"steps": ["step-1"], "tools": ["problem-statement"]}'::jsonb,
  ARRAY['book-root-cause-analysis', 'guide-problem-statement']
) ON CONFLICT (id) DO NOTHING;

INSERT INTO content_nodes (id, pillar, title, slug, summary, body_md, estimated_read_minutes, sort_order, access_level, tags, related_nodes)
VALUES (
  'book-root-cause-analysis',
  'book',
  'Root Cause Analysis: Digging Beneath the Surface',
  'root-cause-analysis',
  'Covers the art and science of root cause analysis using fishbone diagrams, Five-Why analysis, and data-driven investigation techniques within the PIPS framework.',
  E'# Root Cause Analysis\n\nOnce a problem is clearly identified, the temptation is to brainstorm solutions immediately. The PIPS methodology resists this urge, instead dedicating **Step 2: Analyze** to understanding *why* the problem exists.\n\n## Symptoms vs. Root Causes\n\nConsider a hospital emergency department with long wait times. The symptom is obvious — patients wait too long. But the root causes could include:\n\n- Staffing patterns that do not match patient arrival patterns\n- Inefficient triage procedures\n- Downstream bottlenecks in lab results or bed availability\n- Poor communication between departments\n\n## The Fishbone Diagram\n\nThe fishbone (Ishikawa) diagram organizes potential causes into categories: People, Process, Place, Technology, Management, and Materials. This visual tool prevents tunnel vision and ensures the team considers all possible contributing factors.\n\n## Five-Why Analysis\n\nFor each major cause identified in the fishbone, the Five-Why technique drills deeper. By asking "why?" five times in succession, teams move from surface-level symptoms to actionable root causes.\n\n## Data-Driven Validation\n\nHypothesized root causes must be validated with data. The PIPS framework requires teams to gather evidence before proceeding to solution generation, preventing the common trap of solving the wrong problem brilliantly.',
  10,
  2,
  'free-registered',
  '{"steps": ["step-2"], "tools": ["fishbone", "five-why"]}'::jsonb,
  ARRAY['book-understanding-the-problem', 'guide-fishbone-diagram']
) ON CONFLICT (id) DO NOTHING;

INSERT INTO content_nodes (id, pillar, title, slug, summary, body_md, estimated_read_minutes, sort_order, access_level, tags, related_nodes)
VALUES (
  'book-from-ideas-to-action',
  'book',
  'From Ideas to Action: Selecting and Planning Solutions',
  'from-ideas-to-action',
  'Guides teams through structured brainstorming, criteria-based evaluation, and implementation planning using the PIPS Steps 3 and 4 methodology.',
  E'# From Ideas to Action\n\nWith root causes validated, teams are finally ready to generate solutions. The PIPS methodology dedicates two full steps to this transition: **Step 3: Generate** and **Step 4: Select & Plan**.\n\n## Structured Brainstorming\n\nEffective brainstorming is not a free-for-all. The PIPS approach uses structured techniques to maximize creative output:\n\n- **Round-robin ideation** ensures every voice is heard\n- **How-Might-We framing** converts root causes into opportunity statements\n- **Analogous thinking** borrows solutions from other industries\n\n## The Criteria Matrix\n\nWith a rich set of potential solutions, teams need a systematic way to evaluate them. The criteria matrix scores each option against weighted factors such as:\n\n- Impact on the root cause\n- Cost and resource requirements\n- Implementation timeline\n- Risk and reversibility\n- Stakeholder acceptance\n\n## Implementation Planning\n\nThe selected solution becomes an actionable plan through the PIPS implementation planning tools: Gantt timelines, RACI charts, risk registers, and communication plans. Each tool ensures that the brilliant solution on paper becomes a successful change in practice.',
  12,
  3,
  'paid',
  '{"steps": ["step-3", "step-4"], "tools": ["criteria-matrix", "implementation-plan", "raci"]}'::jsonb,
  ARRAY['guide-criteria-matrix', 'workbook-criteria-matrix-exercise']
) ON CONFLICT (id) DO NOTHING;

-- ----- GUIDE tool descriptions -----

INSERT INTO content_nodes (id, pillar, title, slug, summary, body_md, estimated_read_minutes, sort_order, access_level, tags, related_nodes)
VALUES (
  'guide-problem-statement',
  'guide',
  'How to Write an Effective Problem Statement',
  'problem-statement',
  'Step-by-step guide to crafting a PIPS problem statement that clearly defines the who, what, when, where, impact, and desired outcome of the issue.',
  E'# How to Write an Effective Problem Statement\n\nThe problem statement is the foundation of every PIPS project. A well-written problem statement aligns stakeholders, focuses effort, and provides the baseline against which success is measured.\n\n## The Six Elements\n\n### 1. Who is affected?\nIdentify the specific people, teams, or customers impacted by the problem. Be precise — "employees" is too vague; "the 240 employees who park in the main lot daily" is actionable.\n\n### 2. What is happening?\nDescribe the observable symptoms without jumping to causes or solutions. Use data wherever possible.\n\n### 3. When does it occur?\nIs the problem constant, periodic, or triggered by specific events? Understanding timing helps identify root causes.\n\n### 4. Where does it happen?\nLocate the problem geographically, organizationally, or within a process flow.\n\n### 5. What is the impact?\nQuantify the cost in dollars, time, customer satisfaction, safety, or other measurable terms.\n\n### 6. What is the desired outcome?\nState the target with specific, measurable success criteria.\n\n## Common Mistakes\n\n- **Embedding the solution**: "We need a new parking system" is a solution, not a problem statement\n- **Being too broad**: "Customer service needs improvement" cannot be acted upon\n- **Lacking measurement**: Without a baseline, you cannot prove the solution worked',
  6,
  1,
  'public',
  '{"steps": ["step-1"], "tools": ["problem-statement"]}'::jsonb,
  ARRAY['book-understanding-the-problem', 'workbook-problem-statement-exercise']
) ON CONFLICT (id) DO NOTHING;

INSERT INTO content_nodes (id, pillar, title, slug, summary, body_md, estimated_read_minutes, sort_order, access_level, tags, related_nodes)
VALUES (
  'guide-fishbone-diagram',
  'guide',
  'Facilitating a Fishbone Diagram Workshop',
  'fishbone-diagram',
  'Practical guide for facilitators running a fishbone (Ishikawa) root cause analysis session, including preparation, facilitation tips, and follow-up actions.',
  E'# Facilitating a Fishbone Diagram Workshop\n\nThe fishbone diagram is a visual tool that helps teams systematically identify and categorize potential causes of a problem. When facilitated well, a fishbone workshop surfaces causes that no individual would discover alone.\n\n## Before the Workshop\n\n- **Select participants**: Include people closest to the problem (front-line workers) plus those with broader perspective (managers, cross-functional partners)\n- **Share the problem statement**: All participants should receive the validated problem statement at least 2 days before the session\n- **Prepare materials**: Whiteboard or large paper, sticky notes, markers, timer\n\n## The Six Categories\n\nPIPS uses six standard categories for organizing causes:\n\n1. **People** — Skills, training, staffing, workload\n2. **Process** — Procedures, workflows, handoffs, documentation\n3. **Place** — Physical environment, layout, equipment location\n4. **Technology** — Systems, software, hardware, data quality\n5. **Management** — Policies, priorities, communication, culture\n6. **Materials** — Supplies, raw materials, information inputs\n\n## Facilitation Flow\n\n1. Draw the fish skeleton with the problem at the head (5 min)\n2. Label the six category bones (2 min)\n3. Silent brainstorming — each person writes causes on sticky notes (10 min)\n4. Round-robin placement — each person places and explains one note per round (20 min)\n5. Group discussion and clustering (15 min)\n6. Dot voting on most likely root causes — each person gets 3 votes (5 min)\n7. Select top 3 causes for Five-Why deep dive (3 min)',
  7,
  2,
  'free-registered',
  '{"steps": ["step-2"], "tools": ["fishbone"]}'::jsonb,
  ARRAY['book-root-cause-analysis', 'guide-five-why']
) ON CONFLICT (id) DO NOTHING;

INSERT INTO content_nodes (id, pillar, title, slug, summary, body_md, estimated_read_minutes, sort_order, access_level, tags, related_nodes)
VALUES (
  'guide-five-why',
  'guide',
  'The Five-Why Technique: From Symptoms to Root Causes',
  'five-why',
  'Learn to apply the Five-Why analysis method to drill past surface symptoms and uncover the true root causes driving process problems.',
  E'# The Five-Why Technique\n\nThe Five-Why method is deceptively simple: keep asking "Why?" until you reach a root cause that, if addressed, would prevent the problem from recurring.\n\n## How It Works\n\nStart with a cause identified in your fishbone diagram and ask "Why does this happen?" For each answer, ask "Why?" again. Typically, five iterations are sufficient to reach an actionable root cause.\n\n## Example: Employee Parking Problem\n\n- **Problem**: Employees spend 12+ minutes searching for parking\n- **Why?** The main lot is full when most employees arrive\n- **Why?** 85% of employees arrive between 8:00 and 8:30 AM\n- **Why?** The company has a rigid 8:30 AM start time for all departments\n- **Why?** The policy was set when the company had 120 employees; it has never been revisited\n- **Why?** There is no regular process to review operational policies as the company grows\n\nThe root cause is not a parking shortage — it is a failure to update policies as the organization scales. The solution shifts from "build more parking" to "implement flexible scheduling and regular policy reviews."\n\n## Tips for Effective Five-Why Sessions\n\n- Stay focused on process and system causes, not people\n- Verify each "because" with data when possible\n- If you reach a dead end, try a different branch\n- Document the chain — it tells a compelling story for stakeholders',
  5,
  3,
  'public',
  '{"steps": ["step-2"], "tools": ["five-why"]}'::jsonb,
  ARRAY['guide-fishbone-diagram', 'book-root-cause-analysis']
) ON CONFLICT (id) DO NOTHING;

INSERT INTO content_nodes (id, pillar, title, slug, summary, body_md, estimated_read_minutes, sort_order, access_level, tags, related_nodes)
VALUES (
  'guide-criteria-matrix',
  'guide',
  'Using the Criteria Matrix to Evaluate Solutions',
  'criteria-matrix',
  'A detailed guide to building and scoring a weighted criteria matrix for objective solution evaluation in PIPS Step 4.',
  E'# Using the Criteria Matrix\n\nAfter brainstorming multiple potential solutions in Step 3, teams need an objective method to compare them. The criteria matrix provides this structure.\n\n## Building the Matrix\n\n### 1. Define Evaluation Criteria\nCommon criteria for PIPS projects include:\n- **Impact**: How directly does this address the root cause?\n- **Cost**: What is the total cost of implementation?\n- **Timeline**: How quickly can this be implemented?\n- **Risk**: What could go wrong, and how reversible is the solution?\n- **Acceptance**: How likely are stakeholders to support this change?\n\n### 2. Weight the Criteria\nNot all criteria are equally important. Assign percentage weights that sum to 100%. Typically, impact carries the highest weight (30-40%).\n\n### 3. Score Each Solution\nRate each solution 1-5 against each criterion. Multiply by the weight to get weighted scores.\n\n### 4. Compare and Discuss\nThe matrix provides a starting point for discussion, not a final verdict. If the numbers surprise the team, explore why — it often reveals unstated assumptions.\n\n## Common Pitfalls\n\n- **Anchoring**: Presenting a favorite solution first biases scoring. Randomize order.\n- **Groupthink**: Have individuals score independently before group discussion.\n- **Ignoring qualitative factors**: The matrix is one input. Leadership judgment, organizational readiness, and strategic alignment also matter.',
  7,
  4,
  'paid',
  '{"steps": ["step-4"], "tools": ["criteria-matrix"]}'::jsonb,
  ARRAY['book-from-ideas-to-action', 'workbook-criteria-matrix-exercise']
) ON CONFLICT (id) DO NOTHING;

-- ----- WORKBOOK exercises -----

INSERT INTO content_nodes (id, pillar, title, slug, summary, body_md, estimated_read_minutes, sort_order, access_level, tags, related_nodes)
VALUES (
  'workbook-problem-statement-exercise',
  'workbook',
  'Exercise: Draft Your Problem Statement',
  'problem-statement-exercise',
  'A guided workbook exercise that walks you through drafting a problem statement for a real issue in your organization, with reflection prompts and self-assessment.',
  E'# Exercise: Draft Your Problem Statement\n\nThis exercise guides you through creating a problem statement for a real process issue in your organization.\n\n## Instructions\n\nThink of a process that frustrates you or your team. It could be as large as customer onboarding or as small as how meeting rooms are booked. Answer each question below.\n\n### Part 1: The Six Elements\n\n1. **Who is affected?**\n   Write down every person or group impacted. Be specific about numbers.\n\n2. **What is happening?**\n   Describe the observable symptoms using facts and data. Avoid opinions or causes.\n\n3. **When does it occur?**\n   Note frequency, timing, and any patterns.\n\n4. **Where does it happen?**\n   Identify the location — physical, organizational, or within a process.\n\n5. **What is the impact?**\n   Quantify in at least two dimensions (time, money, satisfaction, safety).\n\n6. **What is the desired outcome?**\n   State your SMART goal.\n\n### Part 2: Self-Assessment\n\nReview your draft against these criteria:\n- [ ] Does it describe a problem, not a solution?\n- [ ] Is it specific enough to act on?\n- [ ] Does it include measurable baseline data?\n- [ ] Would a stranger understand the scope and urgency?\n\n### Part 3: Peer Review\n\nShare your problem statement with a colleague who is unfamiliar with the issue. If they can explain the problem back to you accurately, your statement is effective.',
  15,
  1,
  'free-registered',
  '{"steps": ["step-1"], "tools": ["problem-statement"]}'::jsonb,
  ARRAY['guide-problem-statement', 'book-understanding-the-problem']
) ON CONFLICT (id) DO NOTHING;

INSERT INTO content_nodes (id, pillar, title, slug, summary, body_md, estimated_read_minutes, sort_order, access_level, tags, related_nodes)
VALUES (
  'workbook-criteria-matrix-exercise',
  'workbook',
  'Exercise: Build a Criteria Matrix for Your Project',
  'criteria-matrix-exercise',
  'Hands-on exercise to create a weighted criteria matrix, score at least three candidate solutions, and interpret the results for decision-making.',
  E'# Exercise: Build a Criteria Matrix\n\nIn this exercise, you will create a criteria matrix to evaluate solutions for a process improvement challenge.\n\n## Prerequisites\n\nBefore starting, you should have:\n- A validated problem statement (Step 1)\n- Completed root cause analysis (Step 2)\n- At least 3 candidate solutions from brainstorming (Step 3)\n\n## Step-by-Step Instructions\n\n### 1. List Your Solutions (5 min)\nWrite down 3-5 candidate solutions generated during brainstorming.\n\n### 2. Define Criteria (10 min)\nSelect 4-6 evaluation criteria. Suggested starting set:\n- Impact on root cause (how directly does it solve the problem?)\n- Implementation cost (total budget required)\n- Time to implement (weeks or months to full deployment)\n- Risk level (what could go wrong?)\n- Stakeholder acceptance (will people embrace this change?)\n\n### 3. Assign Weights (10 min)\nDistribute 100 percentage points across your criteria. The most important criterion gets the highest weight.\n\n### 4. Score Each Solution (15 min)\nRate each solution 1 (poor) to 5 (excellent) on each criterion. Score independently before discussing with your team.\n\n### 5. Calculate Weighted Scores (5 min)\nMultiply each score by the criterion weight. Sum the weighted scores for each solution.\n\n### 6. Interpret Results (10 min)\n- Which solution scored highest overall?\n- Were there any surprises?\n- Does the top-scoring solution feel right intuitively? If not, what criteria might be missing?\n\n## Reflection\n\nThe matrix is a decision-support tool, not a decision-making machine. Use it to structure discussion and surface disagreements productively.',
  20,
  2,
  'paid',
  '{"steps": ["step-3", "step-4"], "tools": ["criteria-matrix"]}'::jsonb,
  ARRAY['guide-criteria-matrix', 'book-from-ideas-to-action']
) ON CONFLICT (id) DO NOTHING;

INSERT INTO content_nodes (id, pillar, title, slug, summary, body_md, estimated_read_minutes, sort_order, access_level, tags, related_nodes)
VALUES (
  'workbook-five-why-practice',
  'workbook',
  'Exercise: Five-Why Deep Dive on a Real Problem',
  'five-why-practice',
  'Practice the Five-Why technique on three common workplace scenarios, then apply it to a real issue from your own experience.',
  E'# Exercise: Five-Why Deep Dive\n\nPractice the Five-Why technique with guided scenarios before applying it to your own organizational challenges.\n\n## Warm-Up Scenario\n\n**Problem**: The monthly financial report is consistently delivered 3 days late.\n\nTry completing the Five-Why chain:\n1. Why is the report late? → (Your answer)\n2. Why? → (Your answer)\n3. Why? → (Your answer)\n4. Why? → (Your answer)\n5. Why? → (Your answer)\n\n**Sample chain** (reveal after attempting):\n1. The data is not ready when the analyst starts → 2. Three departments submit their figures late → 3. Department heads wait for month-end reconciliation → 4. Reconciliation requires manual data entry from two legacy systems → 5. The legacy systems have never been integrated because no one owns the data pipeline.\n\n## Your Turn\n\nSelect a real problem from your organization and complete a Five-Why analysis:\n\n1. State the problem clearly: ___\n2. Why does this happen? ___\n3. Why? ___\n4. Why? ___\n5. Why? ___\n6. Root cause identified: ___\n\n## Validation Checklist\n\n- [ ] Does your root cause point to a system or process issue (not a person)?\n- [ ] If you fixed this root cause, would the original problem be prevented?\n- [ ] Can you gather data to confirm this root cause is real?\n- [ ] Is the root cause within your influence to change?',
  12,
  3,
  'free-registered',
  '{"steps": ["step-2"], "tools": ["five-why"]}'::jsonb,
  ARRAY['guide-five-why', 'book-root-cause-analysis']
) ON CONFLICT (id) DO NOTHING;

-- ----- WORKSHOP module descriptions -----

INSERT INTO content_nodes (id, pillar, title, slug, summary, body_md, estimated_read_minutes, sort_order, access_level, tags, related_nodes)
VALUES (
  'workshop-intro-to-pips',
  'workshop',
  'Workshop Module: Introduction to the PIPS Methodology',
  'intro-to-pips',
  'A 90-minute facilitator-led workshop module introducing the PIPS 6-step methodology with an interactive team exercise using a realistic scenario.',
  E'# Workshop: Introduction to the PIPS Methodology\n\n**Duration**: 90 minutes | **Group size**: 6-20 participants | **Level**: Beginner\n\n## Learning Objectives\n\nBy the end of this module, participants will be able to:\n- Explain the six steps of the PIPS methodology and their purpose\n- Identify which step applies to common process improvement situations\n- Recognize the difference between symptoms and root causes\n- Articulate why structured methodology outperforms ad-hoc problem solving\n\n## Agenda\n\n| Time | Activity | Format |\n|------|----------|--------|\n| 0-10 min | Welcome and icebreaker: "Name a process that frustrates you" | Group discussion |\n| 10-30 min | Overview of the 6 PIPS steps with real-world examples | Presentation |\n| 30-50 min | Team exercise: Sort 12 activity cards into the correct PIPS step | Small groups |\n| 50-65 min | Debrief: Common misconceptions and "aha" moments | Group discussion |\n| 65-85 min | Mini-scenario: Apply Step 1 (Identify) to a sample problem | Pairs |\n| 85-90 min | Wrap-up and preview of next module | Facilitator |\n\n## Materials Needed\n\n- Activity card deck (12 cards, printable from the PIPS resource library)\n- Problem scenario handout\n- Flip chart paper and markers for each table\n- Timer for exercises',
  5,
  1,
  'public',
  '{"steps": ["step-1", "step-2", "step-3", "step-4", "step-5", "step-6"], "tools": ["problem-statement"]}'::jsonb,
  ARRAY['book-understanding-the-problem', 'workshop-fishbone-in-action']
) ON CONFLICT (id) DO NOTHING;

INSERT INTO content_nodes (id, pillar, title, slug, summary, body_md, estimated_read_minutes, sort_order, access_level, tags, related_nodes)
VALUES (
  'workshop-fishbone-in-action',
  'workshop',
  'Workshop Module: Fishbone Analysis in Action',
  'fishbone-in-action',
  'A hands-on 2-hour workshop module where teams conduct a complete fishbone analysis on a realistic business scenario, practicing facilitation and root cause identification.',
  E'# Workshop: Fishbone Analysis in Action\n\n**Duration**: 120 minutes | **Group size**: 8-24 participants | **Level**: Intermediate\n\n## Learning Objectives\n\nBy the end of this module, participants will be able to:\n- Facilitate a fishbone diagram session for their own team\n- Categorize causes across the six PIPS categories (People, Process, Place, Technology, Management, Materials)\n- Use dot-voting to prioritize root causes for further investigation\n- Transition from fishbone findings to Five-Why deep dives\n\n## Scenario: Regional Hospital Emergency Department\n\nParticipants work with a pre-built scenario where a regional hospital''s ED has seen average wait times increase from 45 minutes to 2.5 hours over 18 months. Patient satisfaction scores have dropped from 78% to 52%.\n\n## Agenda\n\n| Time | Activity | Format |\n|------|----------|--------|\n| 0-15 min | Review scenario data pack and problem statement | Individual reading |\n| 15-25 min | Demonstrate fishbone technique with a simple example | Facilitator demo |\n| 25-35 min | Silent brainstorming: Write potential causes on sticky notes | Individual |\n| 35-60 min | Build the fishbone: Round-robin placement and discussion | Table groups |\n| 60-70 min | Dot voting: Each person places 3 votes on most likely root causes | Individual |\n| 70-90 min | Five-Why drill-down on the top-voted cause per table | Table groups |\n| 90-110 min | Gallery walk: Tables visit each other''s fishbones | Cross-group |\n| 110-120 min | Debrief: Compare findings, discuss facilitation challenges | Full group |\n\n## Facilitator Notes\n\n- Resist the urge to correct "wrong" causes during brainstorming. Let the group self-correct during discussion.\n- If a group gets stuck in one category, prompt them: "What about the Technology angle?" or "Have you considered how Management policies contribute?"\n- The gallery walk is essential for cross-pollination of ideas between tables.',
  6,
  2,
  'free-registered',
  '{"steps": ["step-2"], "tools": ["fishbone", "five-why"]}'::jsonb,
  ARRAY['guide-fishbone-diagram', 'guide-five-why', 'workshop-intro-to-pips']
) ON CONFLICT (id) DO NOTHING;

INSERT INTO content_nodes (id, pillar, title, slug, summary, body_md, estimated_read_minutes, sort_order, access_level, tags, related_nodes)
VALUES (
  'workshop-solution-selection',
  'workshop',
  'Workshop Module: Solution Selection and Planning',
  'solution-selection',
  'A 2-hour workshop module guiding teams through structured brainstorming, criteria matrix evaluation, and RACI chart development for their top solution.',
  E'# Workshop: Solution Selection and Planning\n\n**Duration**: 120 minutes | **Group size**: 6-20 participants | **Level**: Intermediate\n\n## Prerequisites\n\nParticipants should have completed root cause analysis (fishbone + Five-Why) on a real or scenario-based problem.\n\n## Learning Objectives\n\nBy the end of this module, participants will be able to:\n- Generate diverse solutions using structured brainstorming techniques\n- Build and score a weighted criteria matrix\n- Develop a RACI chart for their selected solution\n- Create a high-level implementation timeline\n\n## Agenda\n\n| Time | Activity | Format |\n|------|----------|--------|\n| 0-10 min | Review root causes from previous module | Group recap |\n| 10-30 min | Structured brainstorming: How-Might-We statements | Pairs, then groups |\n| 30-45 min | Solution clustering and initial shortlist (top 3-4) | Group discussion |\n| 45-65 min | Build criteria matrix: define criteria, assign weights | Group exercise |\n| 65-80 min | Independent scoring, then group calibration | Individual, then group |\n| 80-95 min | Develop RACI chart for the winning solution | Group exercise |\n| 95-110 min | Draft 30-day implementation sprint plan | Group exercise |\n| 110-120 min | Present plans to the room and peer feedback | Presentations |\n\n## Key Facilitation Tips\n\n- During brainstorming, enforce "yes, and" thinking. No evaluation until the brainstorming phase closes.\n- When scoring the criteria matrix, have individuals score silently first. Discuss only where scores diverge by 2+ points.\n- For the RACI chart, remind teams: only one person can be Accountable per activity. Multiple Responsibles are fine.',
  6,
  3,
  'paid',
  '{"steps": ["step-3", "step-4"], "tools": ["criteria-matrix", "raci", "implementation-plan"]}'::jsonb,
  ARRAY['guide-criteria-matrix', 'book-from-ideas-to-action', 'workshop-fishbone-in-action']
) ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- SEED COMPLETE
-- ============================================================
-- Login credentials for demo:
--   dana.rivera@pips-demo.com  / DemoPassword1!  (Owner)
--   jordan.chen@pips-demo.com  / DemoPassword1!  (Manager)
--   alex.morgan@pips-demo.com  / DemoPassword1!  (Member)
-- ============================================================
