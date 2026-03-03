-- ============================================================
-- PIPS 2.0 — Development Seed Data
-- ============================================================
-- This seed file creates sample data for local development.
--
-- NOTE: In Supabase local dev, auth.users rows are created via
-- the Supabase Auth API (e.g., supabase.auth.signUp()). The
-- on_auth_user_created trigger auto-creates the profiles row.
--
-- For seeding, we insert directly into auth.users and profiles
-- using fixed UUIDs so that all seed data references are stable.
-- ============================================================

-- ============================================================
-- SEED USERS
-- ============================================================
-- These UUIDs are stable across resets so foreign keys work.
-- In production, auth.users are created by Supabase Auth.

-- User 1: Marc (org owner)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  role,
  aud,
  confirmation_token
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'marc@example.com',
  crypt('TestPassword1', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Marc Albers"}'::jsonb,
  NOW(),
  NOW(),
  'authenticated',
  'authenticated',
  ''
);

-- User 2: Sarah (admin)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  role,
  aud,
  confirmation_token
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000000',
  'sarah@example.com',
  crypt('TestPassword1', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Sarah Chen"}'::jsonb,
  NOW(),
  NOW(),
  'authenticated',
  'authenticated',
  ''
);

-- User 3: James (member)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  role,
  aud,
  confirmation_token
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  '00000000-0000-0000-0000-000000000000',
  'james@example.com',
  crypt('TestPassword1', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"James Wilson"}'::jsonb,
  NOW(),
  NOW(),
  'authenticated',
  'authenticated',
  ''
);

-- The on_auth_user_created trigger creates profile rows automatically.
-- Update profiles with display names and timezones.
UPDATE profiles SET display_name = 'Marc', timezone = 'America/New_York'
  WHERE id = '11111111-1111-1111-1111-111111111111';
UPDATE profiles SET display_name = 'Sarah', timezone = 'America/Chicago'
  WHERE id = '22222222-2222-2222-2222-222222222222';
UPDATE profiles SET display_name = 'James', timezone = 'America/Los_Angeles'
  WHERE id = '33333333-3333-3333-3333-333333333333';


-- ============================================================
-- SEED ORGANIZATION
-- ============================================================
INSERT INTO organizations (id, name, slug, plan, created_by, max_members)
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'PIPS Demo',
  'pips-demo',
  'free',
  '11111111-1111-1111-1111-111111111111',
  25
);


-- ============================================================
-- SEED ORG MEMBERS
-- ============================================================
INSERT INTO org_members (org_id, user_id, role) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'owner'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'admin'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'member');


-- ============================================================
-- SEED ORG SETTINGS
-- ============================================================
INSERT INTO org_settings (org_id, primary_color, secondary_color, features)
VALUES (
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
);


-- ============================================================
-- SEED TEAM
-- ============================================================
INSERT INTO teams (id, org_id, name, description, color, created_by)
VALUES (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'Core Team',
  'Primary process improvement team',
  '#4F46E5',
  '11111111-1111-1111-1111-111111111111'
);

INSERT INTO team_members (team_id, user_id, role) VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'lead'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'member'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', 'member');


-- ============================================================
-- SEED PROJECT: "Parking Lot Scenario"
-- A sample PIPS project with all 6 steps populated
-- ============================================================
INSERT INTO projects (
  id, org_id, title, description, status, current_step,
  owner_id, team_id, problem_statement,
  target_start, target_end, priority, tags
) VALUES (
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'Parking Lot Scenario',
  'Process improvement project to address employee parking lot concerns including safety, accessibility, and capacity issues.',
  'active',
  'analyze',
  '11111111-1111-1111-1111-111111111111',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'Employees report frequent difficulty finding parking spaces during peak hours (8-9 AM), leading to late arrivals and decreased productivity. 45% of employees surveyed report spending more than 10 minutes searching for parking at least 3 times per week.',
  '2026-03-01',
  '2026-06-30',
  'high',
  ARRAY['parking', 'facilities', 'employee-satisfaction']
);

-- Add project members
INSERT INTO project_members (project_id, user_id, role) VALUES
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'lead'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'facilitator'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', 'contributor');


-- ============================================================
-- SEED PROJECT STEPS (all 6 steps for the Parking Lot project)
-- ============================================================

-- Step 1: Identify (completed)
INSERT INTO project_steps (project_id, step, status, data, notes, started_at, completed_at, completed_by)
VALUES (
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'identify',
  'completed',
  '{
    "problem_type": "process",
    "impact_areas": ["productivity", "employee_satisfaction", "safety"],
    "stakeholders": ["employees", "facilities_team", "management", "HR"],
    "measurement_baseline": {
      "avg_search_time_minutes": 12,
      "late_arrivals_per_week": 35,
      "satisfaction_score": 3.2
    },
    "goal": "Reduce average parking search time from 12 minutes to under 3 minutes within 90 days"
  }'::jsonb,
  'Problem statement reviewed and approved by stakeholder group on March 3.',
  '2026-03-01 09:00:00+00',
  '2026-03-02 16:00:00+00',
  '11111111-1111-1111-1111-111111111111'
);

-- Step 2: Analyze (in progress)
INSERT INTO project_steps (project_id, step, status, data, notes, started_at)
VALUES (
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'analyze',
  'in_progress',
  '{
    "root_causes_identified": [
      "Insufficient total parking spaces for current headcount",
      "No reserved spaces for early arrivals",
      "Poor lot layout causes bottlenecks at entrance",
      "No real-time occupancy information available",
      "Employees from nearby buildings using our lot"
    ],
    "tools_used": ["fishbone", "five_why"]
  }'::jsonb,
  'Fishbone diagram completed. Five Why analysis in progress.',
  '2026-03-03 09:00:00+00'
);

-- Step 3: Generate (not started)
INSERT INTO project_steps (project_id, step, status, data)
VALUES (
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'generate',
  'not_started',
  '{}'::jsonb
);

-- Step 4: Select & Plan (not started)
INSERT INTO project_steps (project_id, step, status, data)
VALUES (
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'select_plan',
  'not_started',
  '{}'::jsonb
);

-- Step 5: Implement (not started)
INSERT INTO project_steps (project_id, step, status, data)
VALUES (
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'implement',
  'not_started',
  '{}'::jsonb
);

-- Step 6: Evaluate (not started)
INSERT INTO project_steps (project_id, step, status, data)
VALUES (
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'evaluate',
  'not_started',
  '{}'::jsonb
);


-- ============================================================
-- SEED PROJECT FORMS (sample PIPS forms for the project)
-- ============================================================

-- Fishbone diagram for the Analyze step
INSERT INTO project_forms (project_id, step, form_type, title, data, created_by)
VALUES (
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'analyze',
  'fishbone',
  'Parking Lot Root Cause Analysis',
  '{
    "problem": "Employees spend 12+ minutes searching for parking during peak hours",
    "categories": {
      "People": [
        "Employees arrive within narrow 30-min window",
        "No incentive for carpooling or alternative transport",
        "Visitors take employee spots"
      ],
      "Process": [
        "No assigned parking zones",
        "No time-staggered arrival policy",
        "No enforcement of parking rules"
      ],
      "Place": [
        "Lot layout has single entry/exit",
        "Poor signage for available areas",
        "Distant overflow lot unmarked"
      ],
      "Equipment": [
        "No occupancy sensors or tracking",
        "No digital signage showing availability",
        "Gate system causes entry bottleneck"
      ]
    }
  }'::jsonb,
  '22222222-2222-2222-2222-222222222222'
);

-- 5-Why analysis for the Analyze step
INSERT INTO project_forms (project_id, step, form_type, title, data, created_by)
VALUES (
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'analyze',
  'five_why',
  'Why Do Employees Arrive Late?',
  '{
    "problem": "35 employees per week arrive late due to parking",
    "whys": [
      {
        "question": "Why are employees arriving late?",
        "answer": "They cannot find parking spaces near the building entrance"
      },
      {
        "question": "Why can they not find parking spaces?",
        "answer": "All nearby spaces are taken by 8:15 AM"
      },
      {
        "question": "Why are all spaces taken by 8:15 AM?",
        "answer": "80% of employees have the same 8:30 AM start time"
      },
      {
        "question": "Why do 80% of employees start at the same time?",
        "answer": "Company policy mandates a single start time with no flex hours"
      },
      {
        "question": "Why does the company mandate a single start time?",
        "answer": "Policy was set 15 years ago when the company was smaller and has never been reviewed"
      }
    ],
    "root_cause": "Outdated rigid scheduling policy not adapted to current company size",
    "recommended_actions": [
      "Implement flexible start times (7:30-9:30 window)",
      "Consider hybrid work schedule to reduce daily parking demand"
    ]
  }'::jsonb,
  '22222222-2222-2222-2222-222222222222'
);


-- ============================================================
-- SEED TICKETS (5 sample tickets linked to the project)
-- ============================================================

-- Ticket 1: PIPS project ticket
INSERT INTO tickets (
  org_id, project_id, title, description, type, status, priority,
  pips_step, assignee_id, reporter_id, team_id, due_date
) VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'Survey employees on parking satisfaction',
  'Create and distribute a survey to all employees to measure current parking satisfaction levels, average search time, and preferences for improvement options.',
  'pips_project',
  'done',
  'high',
  'identify',
  '33333333-3333-3333-3333-333333333333',
  '11111111-1111-1111-1111-111111111111',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '2026-03-10'
);

-- Ticket 2: PIPS project ticket
INSERT INTO tickets (
  org_id, project_id, title, description, type, status, priority,
  pips_step, assignee_id, reporter_id, team_id, due_date
) VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'Conduct fishbone analysis workshop',
  'Schedule and facilitate a 2-hour fishbone analysis workshop with the core team and key stakeholders to identify root causes of parking issues.',
  'pips_project',
  'in_progress',
  'high',
  'analyze',
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '2026-03-15'
);

-- Ticket 3: PIPS project ticket
INSERT INTO tickets (
  org_id, project_id, title, description, type, status, priority,
  pips_step, assignee_id, reporter_id, team_id, due_date
) VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'Research parking occupancy sensor solutions',
  'Research and compare at least 3 parking occupancy sensor vendors. Evaluate cost, installation complexity, and integration capabilities.',
  'pips_project',
  'todo',
  'medium',
  'analyze',
  '33333333-3333-3333-3333-333333333333',
  '22222222-2222-2222-2222-222222222222',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '2026-03-20'
);

-- Ticket 4: General task (not linked to PIPS project)
INSERT INTO tickets (
  org_id, title, description, type, status, priority,
  assignee_id, reporter_id, due_date
) VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'Update employee handbook with new parking policy',
  'Once the new parking policy is approved, update Section 4.2 of the employee handbook and distribute to all departments.',
  'task',
  'backlog',
  'low',
  '33333333-3333-3333-3333-333333333333',
  '11111111-1111-1111-1111-111111111111',
  '2026-04-30'
);

-- Ticket 5: Bug report (general)
INSERT INTO tickets (
  org_id, title, description, type, status, priority,
  assignee_id, reporter_id, tags
) VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'Parking gate opens too slowly during peak hours',
  'The main entrance gate takes 8 seconds to fully open, causing a queue of 15+ cars during the 8:00-8:30 AM rush. Should open in under 3 seconds.',
  'bug',
  'todo',
  'high',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  ARRAY['facilities', 'urgent']
);


-- ============================================================
-- SEED COMMENTS (sample comments on tickets)
-- ============================================================

-- Comment on ticket 1 (survey ticket)
INSERT INTO comments (org_id, ticket_id, author_id, body)
SELECT
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  t.id,
  '22222222-2222-2222-2222-222222222222',
  'Survey has been sent to all 200 employees. Response rate so far is 67% after 3 days. Closing the survey on Friday.'
FROM tickets t
WHERE t.org_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
  AND t.sequence_number = 1;

-- Comment on ticket 2 (fishbone workshop)
INSERT INTO comments (org_id, ticket_id, author_id, body)
SELECT
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  t.id,
  '11111111-1111-1111-1111-111111111111',
  'Workshop scheduled for next Tuesday at 2 PM in Conference Room B. Please review the preliminary data before attending.'
FROM tickets t
WHERE t.org_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
  AND t.sequence_number = 2;


-- ============================================================
-- SEED NOTIFICATIONS (sample notifications)
-- ============================================================
INSERT INTO notifications (org_id, user_id, type, title, body, entity_type) VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    'project_updated',
    'Parking Lot Scenario moved to Analyze',
    'The project has advanced to Step 2: Analyze. Root cause analysis tools are now available.',
    'project'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '33333333-3333-3333-3333-333333333333',
    'ticket_assigned',
    'You were assigned: Survey employees on parking satisfaction',
    'Marc assigned you to this ticket. Due date: March 10, 2026.',
    'ticket'
  );
