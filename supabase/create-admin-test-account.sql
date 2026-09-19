-- ============================================================
-- PIPS 2.0 — Admin Test Account (LOCAL DEVELOPMENT ONLY)
-- ============================================================
-- Creates a local admin account, a "PIPS Test Org" organization and a sample
-- project so the full methodology flow can be exercised.
--
-- SECURITY: this script previously carried a plaintext password in the file and
-- printed it back out. Both are gone. The password now comes from a psql
-- variable, and the script refuses to run unless the operator explicitly
-- confirms the target is a local database.
--
-- Usage (psql, against a LOCAL Supabase stack). Both variables are required:
--
--   psql "$LOCAL_DATABASE_URL"
--        -v admin_password="$(openssl rand -base64 18)"
--        -v confirm_local_database=yes
--        -f supabase/create-admin-test-account.sql
--
-- Do NOT paste this into the hosted Supabase SQL editor: it has no psql
-- variables, so the checks below abort the run. A fixed-credential owner
-- account does not belong in a shared database in any case.
-- ============================================================

\if :{?admin_password}
\else
\warn 'ERROR: pass a password with -v admin_password=...'
\quit
\endif

\if :{?confirm_local_database}
\else
\warn 'ERROR: confirm the target with -v confirm_local_database=yes'
\quit
\endif

SET pips.confirm_local_database = :'confirm_local_database';

-- ------------------------------------------------------------
-- Guard: refuse to run anywhere that looks like a real database
-- ------------------------------------------------------------
DO $guard$
DECLARE
  foreign_orgs INT;
BEGIN
  IF current_setting('pips.confirm_local_database', true) IS DISTINCT FROM 'yes' THEN
    RAISE EXCEPTION
      'Refusing to run: pass -v confirm_local_database=yes to confirm this is a local database.';
  END IF;

  SELECT count(*) INTO foreign_orgs
  FROM organizations
  WHERE id <> 'aaaa0000-0000-0000-0000-000000000002';

  IF foreign_orgs > 0 THEN
    RAISE EXCEPTION
      'Refusing to run: this database already contains % organization(s) this script did not create.', foreign_orgs;
  END IF;
END
$guard$;

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
  crypt(:'admin_password', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Marc Admin"}'::jsonb,
  NOW(), NOW(), 'authenticated', 'authenticated', ''
) ON CONFLICT (id) DO UPDATE SET
  encrypted_password = crypt(:'admin_password', gen_salt('bf')),
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

-- Done. Log in with the email below and the password you supplied via
-- -v admin_password=... . The password is deliberately not echoed here.
SELECT 'Admin test account created successfully!' AS result,
       'admin@pips-test.com' AS email,
       'PIPS Test Org' AS organization,
       'owner' AS role;
