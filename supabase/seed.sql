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
-- SEED COMPLETE
-- ============================================================
-- Login credentials for demo:
--   dana.rivera@pips-demo.com  / DemoPassword1!  (Owner)
--   jordan.chen@pips-demo.com  / DemoPassword1!  (Manager)
--   alex.morgan@pips-demo.com  / DemoPassword1!  (Member)
-- ============================================================
