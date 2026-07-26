-- Enable RLS on the four global catalog tables and revoke anon/authenticated writes.
--
-- Context: ADR-001 (docs/planning/SYSTEM_ARCHITECTURE.md) deliberately left
-- content_nodes, training_paths, training_modules and training_exercises without
-- RLS, on the grounds that they hold methodology content identical for every org
-- and that access is gated at the Server Component layer via access_level.
--
-- ADR-001 only weighed the READ risk. An audit on 2026-07-26 found these tables
-- also granted DELETE, INSERT, UPDATE and TRUNCATE to `anon` — the role backing
-- the publishable key that ships in the browser bundle. Anyone with that key
-- could have emptied the entire knowledge base and training catalog.
--
-- This migration keeps ADR-001's read model intact for logged-in users while
-- closing the write hole.
--
-- Behaviour after this migration:
--   authenticated : SELECT only (unchanged for the app — all 16 read sites in
--                   apps/web/src/app/(app)/{knowledge,training}/**  go through the
--                   cookie-based anon-key server client acting as `authenticated`)
--   anon          : no access
--   service_role  : unchanged, bypasses RLS (used by scripts/seed-training.ts and
--                   scripts/seed-content.ts, so seeding keeps working)
--
-- NOTE: RLS governs SELECT/INSERT/UPDATE/DELETE but NOT TRUNCATE. TRUNCATE is a
-- plain privilege check, so the explicit REVOKE below is required — enabling RLS
-- alone would leave the tables truncatable.

-- 1. Enable RLS -------------------------------------------------------------

ALTER TABLE public.content_nodes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_paths     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_modules   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_exercises ENABLE ROW LEVEL SECURITY;

-- 2. Permissive read policy for authenticated users -------------------------
-- USING (true) is intentional: these are global catalogs with no org_id or
-- user_id column, so there is nothing to scope on. Per-tier gating stays in the
-- application layer via content_nodes.access_level, exactly as ADR-001 specifies.

DROP POLICY IF EXISTS "Authenticated can read content catalog" ON public.content_nodes;
CREATE POLICY "Authenticated can read content catalog"
  ON public.content_nodes FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated can read training paths" ON public.training_paths;
CREATE POLICY "Authenticated can read training paths"
  ON public.training_paths FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated can read training modules" ON public.training_modules;
CREATE POLICY "Authenticated can read training modules"
  ON public.training_modules FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated can read training exercises" ON public.training_exercises;
CREATE POLICY "Authenticated can read training exercises"
  ON public.training_exercises FOR SELECT TO authenticated USING (true);

-- No INSERT/UPDATE/DELETE policies are defined. With RLS enabled that means
-- those operations are denied for anon and authenticated, while service_role
-- continues to bypass RLS for seeding.

-- 3. Revoke write privileges ------------------------------------------------
-- Required for TRUNCATE (not covered by RLS); the rest is defence in depth.

REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.content_nodes      FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.training_paths     FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.training_modules   FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.training_exercises FROM anon, authenticated;

-- 4. Revoke anon SELECT -----------------------------------------------------
-- Verified 2026-07-26: no unauthenticated/marketing route reads these tables.
-- If a public preview of `access_level = 'public'` content is ever added, grant
-- anon SELECT back and add a matching policy:
--   CREATE POLICY "Anon can read public content" ON public.content_nodes
--     FOR SELECT TO anon USING (access_level = 'public');

REVOKE SELECT ON public.content_nodes      FROM anon;
REVOKE SELECT ON public.training_paths     FROM anon;
REVOKE SELECT ON public.training_modules   FROM anon;
REVOKE SELECT ON public.training_exercises FROM anon;
