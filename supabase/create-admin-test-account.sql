-- ============================================================
-- PIPS 2.0 — Admin Test Account
-- ============================================================
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- to create an admin test account you can log into immediately.
--
-- Credentials:
--   Email:    admin@pips-test.com
--   Password: PipsAdmin2026!
--
-- This user will be the owner of a "PIPS Test Org" organization
-- with a sample project pre-created.
-- ============================================================

-- Fixed UUIDs for the test account
-- Admin user:    aaaa0000-0000-0000-0000-000000000001
-- Organization:  aaaa0000-0000-0000-0000-000000000002
-- Project:       aaaa0000-0000-0000-0000-000000000003

-- 1. Create auth user (with email already confirmed)
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, role, aud, confirmation_token
) VALUES (
  'aaaa0000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'admin@pips-test.com',
  crypt('PipsAdmin2026!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Marc Admin"}'::jsonb,
  NOW(), NOW(), 'authenticated', 'authenticated', ''
) ON CONFLICT (id) DO UPDATE SET
  encrypted_password = crypt('PipsAdmin2026!', gen_salt('bf')),
  email_confirmed_at = NOW(),
  updated_at = NOW();

-- 2. Ensure profile exists (trigger should create it, but just in case)
INSERT INTO profiles (id, email, full_name, display_name, timezone)
VALUES (
  'aaaa0000-0000-0000-0000-000000000001',
  'admin@pips-test.com',
  'Marc Admin',
  'Marc',
  'America/New_York'
) ON CONFLICT (id) DO UPDATE SET
  display_name = 'Marc',
  full_name = 'Marc Admin';

-- 3. Create test organization
INSERT INTO organizations (id, name, slug, plan, created_by, max_members)
VALUES (
  'aaaa0000-0000-0000-0000-000000000002',
  'PIPS Test Org',
  'pips-test-org',
  'free',
  'aaaa0000-0000-0000-0000-000000000001',
  50
) ON CONFLICT (id) DO UPDATE SET
  name = 'PIPS Test Org',
  updated_at = NOW();

-- 4. Create org membership (owner role = full admin rights)
INSERT INTO org_members (org_id, user_id, role)
VALUES (
  'aaaa0000-0000-0000-0000-000000000002',
  'aaaa0000-0000-0000-0000-000000000001',
  'owner'
) ON CONFLICT ON CONSTRAINT unique_org_member DO UPDATE SET
  role = 'owner';

-- 5. Create org settings
INSERT INTO org_settings (org_id)
VALUES ('aaaa0000-0000-0000-0000-000000000002')
ON CONFLICT (org_id) DO NOTHING;

-- 6. Create a sample project
INSERT INTO projects (id, org_id, title, description, owner_id, current_step, status)
VALUES (
  'aaaa0000-0000-0000-0000-000000000003',
  'aaaa0000-0000-0000-0000-000000000002',
  'Test Project — Full Methodology Demo',
  'A test project to verify the complete PIPS 6-step methodology workflow. Created by admin seed script.',
  'aaaa0000-0000-0000-0000-000000000001',
  'identify',
  'active'
) ON CONFLICT (id) DO UPDATE SET
  title = 'Test Project — Full Methodology Demo',
  updated_at = NOW();

-- 7. Create 6 project steps
INSERT INTO project_steps (project_id, step, status, started_at)
VALUES
  ('aaaa0000-0000-0000-0000-000000000003', 'identify',     'in_progress', NOW()),
  ('aaaa0000-0000-0000-0000-000000000003', 'analyze',      'not_started', NULL),
  ('aaaa0000-0000-0000-0000-000000000003', 'generate',     'not_started', NULL),
  ('aaaa0000-0000-0000-0000-000000000003', 'select_plan',  'not_started', NULL),
  ('aaaa0000-0000-0000-0000-000000000003', 'implement',    'not_started', NULL),
  ('aaaa0000-0000-0000-0000-000000000003', 'evaluate',     'not_started', NULL)
ON CONFLICT DO NOTHING;

-- 8. Add admin as project lead
INSERT INTO project_members (project_id, user_id, role)
VALUES (
  'aaaa0000-0000-0000-0000-000000000003',
  'aaaa0000-0000-0000-0000-000000000001',
  'lead'
) ON CONFLICT DO NOTHING;

-- Done! You can now log in at pips-app.vercel.app/login with:
--   Email:    admin@pips-test.com
--   Password: PipsAdmin2026!
SELECT 'Admin test account created successfully!' AS result,
       'admin@pips-test.com' AS email,
       'PipsAdmin2026!' AS password,
       'PIPS Test Org' AS organization,
       'owner' AS role;
