-- ============================================================
-- BETA TEST SCENARIO: Reduce Customer Support Response Time
-- ============================================================
-- A mid-size SaaS company (TechFlow Solutions) uses PIPS 2.0
-- to reduce support response times from 4hrs avg to under 1hr.
-- Spans ~6 weeks of realistic usage across 3 teams, 5 projects.
--
-- RUN WITH: supabase admin / service role (bypasses RLS)
-- ============================================================

BEGIN;

-- ============================================================
-- 1. ORGANIZATION
-- ============================================================
INSERT INTO organizations (id, name, slug, plan, created_by, max_members, created_at)
VALUES (
  'b0010000-0000-4000-8000-000000000001',
  'TechFlow Solutions',
  'techflow-solutions',
  'professional',
  '8787c5d6-aa93-458e-a77a-a731b34fb69f', -- Marc as bootstrap creator
  25,
  '2026-02-01 09:00:00+00'
);

-- ============================================================
-- 2. USERS (profiles + org_members)
-- ============================================================
-- We create 10 demo users via auth.users + profiles.
-- In practice, the handle_new_user() trigger auto-creates profiles,
-- but for seeding we insert both directly.

-- Helper: insert into auth.users (minimal fields for seeding)
-- NOTE: passwords are bcrypt hash of 'BetaDemo2026!'
-- If your Supabase instance blocks direct auth.users inserts,
-- create these users via the Auth Admin API instead and
-- skip the auth.users INSERTs below.

-- User 1: Sarah Chen — VP of Customer Success (initiative owner)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at)
VALUES (
  'c0010000-0000-4000-8000-000000000001',
  'sarah.chen@techflow-demo.com',
  '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012',
  '2026-02-01 09:00:00+00',
  '{"full_name": "Sarah Chen"}'::jsonb,
  '2026-02-01 09:00:00+00'
);
INSERT INTO profiles (id, email, full_name, display_name, timezone)
VALUES ('c0010000-0000-4000-8000-000000000001', 'sarah.chen@techflow-demo.com', 'Sarah Chen', 'Sarah', 'America/New_York');

-- User 2: Marcus Rivera — Support Operations Manager
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at)
VALUES (
  'c0010000-0000-4000-8000-000000000002',
  'marcus.rivera@techflow-demo.com',
  '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012',
  '2026-02-01 09:05:00+00',
  '{"full_name": "Marcus Rivera"}'::jsonb,
  '2026-02-01 09:05:00+00'
);
INSERT INTO profiles (id, email, full_name, display_name, timezone)
VALUES ('c0010000-0000-4000-8000-000000000002', 'marcus.rivera@techflow-demo.com', 'Marcus Rivera', 'Marcus', 'America/Chicago');

-- User 3: Aisha Patel — Senior Support Agent
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at)
VALUES (
  'c0010000-0000-4000-8000-000000000003',
  'aisha.patel@techflow-demo.com',
  '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012',
  '2026-02-01 09:10:00+00',
  '{"full_name": "Aisha Patel"}'::jsonb,
  '2026-02-01 09:10:00+00'
);
INSERT INTO profiles (id, email, full_name, display_name, timezone)
VALUES ('c0010000-0000-4000-8000-000000000003', 'aisha.patel@techflow-demo.com', 'Aisha Patel', 'Aisha', 'America/New_York');

-- User 4: David Kim — Engineering Manager
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at)
VALUES (
  'c0010000-0000-4000-8000-000000000004',
  'david.kim@techflow-demo.com',
  '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012',
  '2026-02-01 09:15:00+00',
  '{"full_name": "David Kim"}'::jsonb,
  '2026-02-01 09:15:00+00'
);
INSERT INTO profiles (id, email, full_name, display_name, timezone)
VALUES ('c0010000-0000-4000-8000-000000000004', 'david.kim@techflow-demo.com', 'David Kim', 'David', 'America/Los_Angeles');

-- User 5: Priya Sharma — Backend Engineer
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at)
VALUES (
  'c0010000-0000-4000-8000-000000000005',
  'priya.sharma@techflow-demo.com',
  '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012',
  '2026-02-01 09:20:00+00',
  '{"full_name": "Priya Sharma"}'::jsonb,
  '2026-02-01 09:20:00+00'
);
INSERT INTO profiles (id, email, full_name, display_name, timezone)
VALUES ('c0010000-0000-4000-8000-000000000005', 'priya.sharma@techflow-demo.com', 'Priya Sharma', 'Priya', 'America/Los_Angeles');

-- User 6: James O'Brien — Data Analyst / Analytics Lead
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at)
VALUES (
  'c0010000-0000-4000-8000-000000000006',
  'james.obrien@techflow-demo.com',
  '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012',
  '2026-02-01 09:25:00+00',
  '{"full_name": "James O''Brien"}'::jsonb,
  '2026-02-01 09:25:00+00'
);
INSERT INTO profiles (id, email, full_name, display_name, timezone)
VALUES ('c0010000-0000-4000-8000-000000000006', 'james.obrien@techflow-demo.com', 'James O''Brien', 'James', 'America/New_York');

-- User 7: Lisa Nguyen — Training & Enablement Manager
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at)
VALUES (
  'c0010000-0000-4000-8000-000000000007',
  'lisa.nguyen@techflow-demo.com',
  '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012',
  '2026-02-01 09:30:00+00',
  '{"full_name": "Lisa Nguyen"}'::jsonb,
  '2026-02-01 09:30:00+00'
);
INSERT INTO profiles (id, email, full_name, display_name, timezone)
VALUES ('c0010000-0000-4000-8000-000000000007', 'lisa.nguyen@techflow-demo.com', 'Lisa Nguyen', 'Lisa', 'America/Chicago');

-- User 8: Tom Bradshaw — Frontend Engineer
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at)
VALUES (
  'c0010000-0000-4000-8000-000000000008',
  'tom.bradshaw@techflow-demo.com',
  '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012',
  '2026-02-01 09:35:00+00',
  '{"full_name": "Tom Bradshaw"}'::jsonb,
  '2026-02-01 09:35:00+00'
);
INSERT INTO profiles (id, email, full_name, display_name, timezone)
VALUES ('c0010000-0000-4000-8000-000000000008', 'tom.bradshaw@techflow-demo.com', 'Tom Bradshaw', 'Tom', 'America/New_York');

-- User 9: Rachel Foster — Support Agent (junior)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at)
VALUES (
  'c0010000-0000-4000-8000-000000000009',
  'rachel.foster@techflow-demo.com',
  '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012',
  '2026-02-01 09:40:00+00',
  '{"full_name": "Rachel Foster"}'::jsonb,
  '2026-02-01 09:40:00+00'
);
INSERT INTO profiles (id, email, full_name, display_name, timezone)
VALUES ('c0010000-0000-4000-8000-000000000009', 'rachel.foster@techflow-demo.com', 'Rachel Foster', 'Rachel', 'America/Denver');

-- User 10: Carlos Mendez — Knowledge Base Content Writer
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at)
VALUES (
  'c0010000-0000-4000-8000-000000000010',
  'carlos.mendez@techflow-demo.com',
  '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012',
  '2026-02-01 09:45:00+00',
  '{"full_name": "Carlos Mendez"}'::jsonb,
  '2026-02-01 09:45:00+00'
);
INSERT INTO profiles (id, email, full_name, display_name, timezone)
VALUES ('c0010000-0000-4000-8000-000000000010', 'carlos.mendez@techflow-demo.com', 'Carlos Mendez', 'Carlos', 'America/New_York');

-- Org memberships
INSERT INTO org_members (org_id, user_id, role, joined_at) VALUES
  ('b0010000-0000-4000-8000-000000000001', 'c0010000-0000-4000-8000-000000000001', 'admin',   '2026-02-01 09:00:00+00'), -- Sarah (VP)
  ('b0010000-0000-4000-8000-000000000001', 'c0010000-0000-4000-8000-000000000002', 'manager', '2026-02-01 09:05:00+00'), -- Marcus
  ('b0010000-0000-4000-8000-000000000001', 'c0010000-0000-4000-8000-000000000003', 'member',  '2026-02-01 09:10:00+00'), -- Aisha
  ('b0010000-0000-4000-8000-000000000001', 'c0010000-0000-4000-8000-000000000004', 'manager', '2026-02-01 09:15:00+00'), -- David
  ('b0010000-0000-4000-8000-000000000001', 'c0010000-0000-4000-8000-000000000005', 'member',  '2026-02-01 09:20:00+00'), -- Priya
  ('b0010000-0000-4000-8000-000000000001', 'c0010000-0000-4000-8000-000000000006', 'manager', '2026-02-01 09:25:00+00'), -- James
  ('b0010000-0000-4000-8000-000000000001', 'c0010000-0000-4000-8000-000000000007', 'manager', '2026-02-01 09:30:00+00'), -- Lisa
  ('b0010000-0000-4000-8000-000000000001', 'c0010000-0000-4000-8000-000000000008', 'member',  '2026-02-01 09:35:00+00'), -- Tom
  ('b0010000-0000-4000-8000-000000000001', 'c0010000-0000-4000-8000-000000000009', 'member',  '2026-02-01 09:40:00+00'), -- Rachel
  ('b0010000-0000-4000-8000-000000000001', 'c0010000-0000-4000-8000-000000000010', 'member',  '2026-02-01 09:45:00+00'); -- Carlos

-- ============================================================
-- 3. TEAMS
-- ============================================================
INSERT INTO teams (id, org_id, name, description, color, created_by, created_at) VALUES
  ('d0010000-0000-4000-8000-000000000001', 'b0010000-0000-4000-8000-000000000001',
   'Support Operations',
   'Handles day-to-day customer support including ticket triage, response, and escalation',
   '#2563EB', 'c0010000-0000-4000-8000-000000000001', '2026-02-01 10:00:00+00'),
  ('d0010000-0000-4000-8000-000000000002', 'b0010000-0000-4000-8000-000000000001',
   'Engineering',
   'Builds tooling, automation, and infrastructure to support the customer success organization',
   '#059669', 'c0010000-0000-4000-8000-000000000001', '2026-02-01 10:05:00+00'),
  ('d0010000-0000-4000-8000-000000000003', 'b0010000-0000-4000-8000-000000000001',
   'Analytics & Training',
   'Measures support performance, builds dashboards, and runs agent training and certification programs',
   '#D97706', 'c0010000-0000-4000-8000-000000000001', '2026-02-01 10:10:00+00');

-- Team memberships
INSERT INTO team_members (team_id, user_id, role, joined_at) VALUES
  -- Support Operations
  ('d0010000-0000-4000-8000-000000000001', 'c0010000-0000-4000-8000-000000000001', 'lead',   '2026-02-01 10:00:00+00'), -- Sarah (sponsor)
  ('d0010000-0000-4000-8000-000000000001', 'c0010000-0000-4000-8000-000000000002', 'lead',   '2026-02-01 10:00:00+00'), -- Marcus (ops mgr)
  ('d0010000-0000-4000-8000-000000000001', 'c0010000-0000-4000-8000-000000000003', 'member', '2026-02-01 10:00:00+00'), -- Aisha
  ('d0010000-0000-4000-8000-000000000001', 'c0010000-0000-4000-8000-000000000009', 'member', '2026-02-01 10:00:00+00'), -- Rachel
  ('d0010000-0000-4000-8000-000000000001', 'c0010000-0000-4000-8000-000000000010', 'member', '2026-02-01 10:00:00+00'), -- Carlos
  -- Engineering
  ('d0010000-0000-4000-8000-000000000002', 'c0010000-0000-4000-8000-000000000004', 'lead',   '2026-02-01 10:05:00+00'), -- David
  ('d0010000-0000-4000-8000-000000000002', 'c0010000-0000-4000-8000-000000000005', 'member', '2026-02-01 10:05:00+00'), -- Priya
  ('d0010000-0000-4000-8000-000000000002', 'c0010000-0000-4000-8000-000000000008', 'member', '2026-02-01 10:05:00+00'), -- Tom
  -- Analytics & Training
  ('d0010000-0000-4000-8000-000000000003', 'c0010000-0000-4000-8000-000000000006', 'lead',   '2026-02-01 10:10:00+00'), -- James
  ('d0010000-0000-4000-8000-000000000003', 'c0010000-0000-4000-8000-000000000007', 'lead',   '2026-02-01 10:10:00+00'), -- Lisa
  ('d0010000-0000-4000-8000-000000000003', 'c0010000-0000-4000-8000-000000000003', 'member', '2026-02-01 10:10:00+00'); -- Aisha (cross-team)

-- ============================================================
-- 4. INITIATIVE
-- ============================================================
INSERT INTO initiatives (
  id, org_id, title, description, status, owner_id,
  objective, target_metric, baseline_value, target_value, current_value,
  target_start, target_end, actual_start, actual_end,
  tags, color, created_at
) VALUES (
  'e0010000-0000-4000-8000-000000000001',
  'b0010000-0000-4000-8000-000000000001',
  'Reduce Customer Support Response Time',
  'Our average first response time has climbed to 4.2 hours, well above the industry benchmark of 1 hour. Customer satisfaction (CSAT) has dropped from 4.1 to 3.4/5.0 over the past two quarters, and churn among customers who filed support tickets is 23% higher than non-ticket customers. This initiative applies the PIPS methodology across 5 coordinated projects to systematically diagnose root causes, implement targeted solutions, and measure impact.',
  'active',
  'c0010000-0000-4000-8000-000000000001', -- Sarah Chen
  'Reduce average first response time from 4.2 hours to under 1 hour while improving CSAT from 3.4 to 4.2+',
  'Avg First Response Time (hours)',
  '4.2 hours',
  '< 1.0 hour',
  '1.8 hours',
  '2026-02-03',
  '2026-03-20',
  '2026-02-03',
  NULL,
  ARRAY['customer-success', 'response-time', 'churn-reduction', 'Q1-2026'],
  '#2563EB',
  '2026-02-01 11:00:00+00'
);

-- ============================================================
-- 5. PROJECTS (5 PIPS projects)
-- ============================================================

-- Project 1: Reduce First Response Time (Support Ops lead, COMPLETED through step 6)
INSERT INTO projects (
  id, org_id, title, description, status, current_step, owner_id, team_id,
  problem_statement, target_start, target_end, actual_start, actual_end,
  tags, priority, created_at, completed_at
) VALUES (
  'f0010000-0000-4000-8000-000000000001',
  'b0010000-0000-4000-8000-000000000001',
  'Reduce First Response Time from 4hrs to 1hr',
  'The core operational project focused on process changes, scheduling optimization, and queue management to dramatically cut first response time.',
  'completed',
  'evaluate',
  'c0010000-0000-4000-8000-000000000002', -- Marcus Rivera
  'd0010000-0000-4000-8000-000000000001', -- Support Operations
  'Customer support first response time has increased from 1.5 hours to 4.2 hours over the past 6 months. Customers expect a response within 1 hour. The 3.2-hour gap is driving a 23% higher churn rate among ticket-filing customers and CSAT has dropped from 4.1 to 3.4.',
  '2026-02-03', '2026-03-07', '2026-02-03', '2026-03-05',
  ARRAY['response-time', 'process', 'scheduling'],
  'critical',
  '2026-02-01 11:30:00+00',
  '2026-03-05 16:00:00+00'
);

-- Project 2: Auto-Triage System (Engineering lead, at step 5 — implementing)
INSERT INTO projects (
  id, org_id, title, description, status, current_step, owner_id, team_id,
  problem_statement, target_start, target_end, actual_start,
  tags, priority, created_at
) VALUES (
  'f0010000-0000-4000-8000-000000000002',
  'b0010000-0000-4000-8000-000000000001',
  'Implement Auto-Triage System for Support Tickets',
  'Build an ML-powered ticket classification and routing system that automatically assigns tickets to the right agent/team based on content, customer tier, and urgency signals.',
  'active',
  'implement',
  'c0010000-0000-4000-8000-000000000004', -- David Kim
  'd0010000-0000-4000-8000-000000000002', -- Engineering
  'Manual ticket triage takes an average of 18 minutes per ticket and frequently routes tickets to the wrong specialist (32% misroute rate). This adds an average of 45 minutes to resolution time and frustrates both agents and customers.',
  '2026-02-10', '2026-03-14', '2026-02-10',
  ARRAY['automation', 'ml', 'triage', 'engineering'],
  'high',
  '2026-02-08 10:00:00+00'
);

-- Project 3: Real-Time Support Dashboard (Analytics lead, at step 4 — selecting)
INSERT INTO projects (
  id, org_id, title, description, status, current_step, owner_id, team_id,
  problem_statement, target_start, target_end, actual_start,
  tags, priority, created_at
) VALUES (
  'f0010000-0000-4000-8000-000000000003',
  'b0010000-0000-4000-8000-000000000001',
  'Build Real-Time Support Dashboard',
  'Create a live dashboard showing queue depth, response times, agent utilization, and SLA breach warnings so managers can intervene before problems escalate.',
  'active',
  'select_plan',
  'c0010000-0000-4000-8000-000000000006', -- James O''Brien
  'd0010000-0000-4000-8000-000000000003', -- Analytics & Training
  'Support managers currently rely on end-of-day reports to understand queue performance. By the time they see a spike, SLA breaches have already occurred. There is no real-time visibility into queue depth, agent availability, or trending response times.',
  '2026-02-17', '2026-03-14', '2026-02-17',
  ARRAY['dashboard', 'analytics', 'real-time', 'visibility'],
  'high',
  '2026-02-15 09:00:00+00'
);

-- Project 4: Knowledge Base Redesign (Cross-team, at step 3 — generating)
INSERT INTO projects (
  id, org_id, title, description, status, current_step, owner_id, team_id,
  problem_statement, target_start, target_end, actual_start,
  tags, priority, created_at
) VALUES (
  'f0010000-0000-4000-8000-000000000004',
  'b0010000-0000-4000-8000-000000000001',
  'Redesign Knowledge Base for Customer Self-Service',
  'Overhaul the customer-facing knowledge base to reduce ticket volume by enabling customers to find answers themselves. Includes improved search, content restructuring, and AI-powered suggestions.',
  'active',
  'generate',
  'c0010000-0000-4000-8000-000000000010', -- Carlos Mendez
  'd0010000-0000-4000-8000-000000000001', -- Support Ops (cross-team w/ Engineering)
  'Only 12% of customers who visit the knowledge base find an answer without filing a ticket. The current KB has 340 articles but 47% are outdated, search returns irrelevant results 60% of the time, and there is no suggested-articles feature. This drives an estimated 800 unnecessary tickets per month.',
  '2026-02-24', '2026-03-20', '2026-02-24',
  ARRAY['knowledge-base', 'self-service', 'content', 'search'],
  'medium',
  '2026-02-22 14:00:00+00'
);

-- Project 5: Training & Certification Program (Analytics & Training lead, at step 2 — analyzing)
INSERT INTO projects (
  id, org_id, title, description, status, current_step, owner_id, team_id,
  problem_statement, target_start, target_end, actual_start,
  tags, priority, created_at
) VALUES (
  'f0010000-0000-4000-8000-000000000005',
  'b0010000-0000-4000-8000-000000000001',
  'Establish Support Agent Training & Certification Program',
  'Design and implement a structured training curriculum with skill assessments and certification tiers to ensure consistent, high-quality support across all agents.',
  'active',
  'analyze',
  'c0010000-0000-4000-8000-000000000007', -- Lisa Nguyen
  'd0010000-0000-4000-8000-000000000003', -- Analytics & Training
  'New support agents take an average of 12 weeks to reach full productivity (defined as handling 80% of ticket types independently). During ramp-up, their first response time is 2.3x the team average, and their CSAT scores are 0.8 points lower. There is no structured curriculum — training is ad hoc mentorship with inconsistent outcomes.',
  '2026-03-03', '2026-03-20', '2026-03-03',
  ARRAY['training', 'certification', 'onboarding', 'quality'],
  'medium',
  '2026-03-01 10:00:00+00'
);

-- Link projects to initiative
INSERT INTO initiative_projects (initiative_id, project_id, added_by, added_at, notes) VALUES
  ('e0010000-0000-4000-8000-000000000001', 'f0010000-0000-4000-8000-000000000001', 'c0010000-0000-4000-8000-000000000001', '2026-02-01 12:00:00+00', 'Core ops project — highest priority, must complete first'),
  ('e0010000-0000-4000-8000-000000000001', 'f0010000-0000-4000-8000-000000000002', 'c0010000-0000-4000-8000-000000000001', '2026-02-08 10:30:00+00', 'Engineering automation to eliminate manual triage bottleneck'),
  ('e0010000-0000-4000-8000-000000000001', 'f0010000-0000-4000-8000-000000000003', 'c0010000-0000-4000-8000-000000000001', '2026-02-15 09:30:00+00', 'Visibility project — managers need real-time data to act on'),
  ('e0010000-0000-4000-8000-000000000001', 'f0010000-0000-4000-8000-000000000004', 'c0010000-0000-4000-8000-000000000001', '2026-02-22 14:30:00+00', 'Demand reduction — fewer tickets = faster response on remaining ones'),
  ('e0010000-0000-4000-8000-000000000001', 'f0010000-0000-4000-8000-000000000005', 'c0010000-0000-4000-8000-000000000001', '2026-03-01 10:30:00+00', 'People investment — ensure quality while improving speed');

-- Project members
INSERT INTO project_members (project_id, user_id, role, joined_at) VALUES
  -- Project 1: Response Time
  ('f0010000-0000-4000-8000-000000000001', 'c0010000-0000-4000-8000-000000000002', 'lead',        '2026-02-03 09:00:00+00'),
  ('f0010000-0000-4000-8000-000000000001', 'c0010000-0000-4000-8000-000000000001', 'facilitator', '2026-02-03 09:00:00+00'),
  ('f0010000-0000-4000-8000-000000000001', 'c0010000-0000-4000-8000-000000000003', 'contributor', '2026-02-03 09:00:00+00'),
  ('f0010000-0000-4000-8000-000000000001', 'c0010000-0000-4000-8000-000000000009', 'contributor', '2026-02-03 09:00:00+00'),
  ('f0010000-0000-4000-8000-000000000001', 'c0010000-0000-4000-8000-000000000006', 'contributor', '2026-02-03 09:00:00+00'),
  -- Project 2: Auto-Triage
  ('f0010000-0000-4000-8000-000000000002', 'c0010000-0000-4000-8000-000000000004', 'lead',        '2026-02-10 09:00:00+00'),
  ('f0010000-0000-4000-8000-000000000002', 'c0010000-0000-4000-8000-000000000005', 'contributor', '2026-02-10 09:00:00+00'),
  ('f0010000-0000-4000-8000-000000000002', 'c0010000-0000-4000-8000-000000000002', 'contributor', '2026-02-10 09:00:00+00'),
  ('f0010000-0000-4000-8000-000000000002', 'c0010000-0000-4000-8000-000000000008', 'contributor', '2026-02-10 09:00:00+00'),
  -- Project 3: Dashboard
  ('f0010000-0000-4000-8000-000000000003', 'c0010000-0000-4000-8000-000000000006', 'lead',        '2026-02-17 09:00:00+00'),
  ('f0010000-0000-4000-8000-000000000003', 'c0010000-0000-4000-8000-000000000008', 'contributor', '2026-02-17 09:00:00+00'),
  ('f0010000-0000-4000-8000-000000000003', 'c0010000-0000-4000-8000-000000000002', 'contributor', '2026-02-17 09:00:00+00'),
  ('f0010000-0000-4000-8000-000000000003', 'c0010000-0000-4000-8000-000000000001', 'observer',    '2026-02-17 09:00:00+00'),
  -- Project 4: Knowledge Base
  ('f0010000-0000-4000-8000-000000000004', 'c0010000-0000-4000-8000-000000000010', 'lead',        '2026-02-24 09:00:00+00'),
  ('f0010000-0000-4000-8000-000000000004', 'c0010000-0000-4000-8000-000000000003', 'contributor', '2026-02-24 09:00:00+00'),
  ('f0010000-0000-4000-8000-000000000004', 'c0010000-0000-4000-8000-000000000005', 'contributor', '2026-02-24 09:00:00+00'),
  ('f0010000-0000-4000-8000-000000000004', 'c0010000-0000-4000-8000-000000000009', 'contributor', '2026-02-24 09:00:00+00'),
  -- Project 5: Training
  ('f0010000-0000-4000-8000-000000000005', 'c0010000-0000-4000-8000-000000000007', 'lead',        '2026-03-03 09:00:00+00'),
  ('f0010000-0000-4000-8000-000000000005', 'c0010000-0000-4000-8000-000000000006', 'contributor', '2026-03-03 09:00:00+00'),
  ('f0010000-0000-4000-8000-000000000005', 'c0010000-0000-4000-8000-000000000003', 'contributor', '2026-03-03 09:00:00+00'),
  ('f0010000-0000-4000-8000-000000000005', 'c0010000-0000-4000-8000-000000000002', 'observer',    '2026-03-03 09:00:00+00');

COMMIT;
