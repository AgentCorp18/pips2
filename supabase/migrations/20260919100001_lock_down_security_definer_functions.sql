-- SECURITY: stop PostgREST exposing internal SECURITY DEFINER functions as callable RPCs.
-- Supabase advisor lints: anon_security_definer_function_executable (18)
--                         authenticated_security_definer_function_executable (18)
--
-- PostgREST publishes every function in the exposed schema at /rest/v1/rpc/<name>, and both
-- anon and authenticated hold EXECUTE by default. Because these functions are SECURITY DEFINER
-- they run as the owner, so a direct call bypasses RLS.
--
-- This migration is split into four sections of increasing blast radius. They can be applied
-- independently, in order. Sections 1, 2 and 4 are behaviour-preserving. Section 3 is NOT --
-- read its note before applying.

BEGIN;

-- ---------------------------------------------------------------------------
-- Section 1 -- trigger functions. No caller should ever invoke these directly.
--
-- Revoking EXECUTE does not affect trigger firing: a trigger function is executed by the
-- table's trigger machinery as the table owner, not through the caller's EXECUTE privilege.
-- ---------------------------------------------------------------------------

REVOKE EXECUTE ON FUNCTION public.audit_trigger_func()              FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.auto_join_org_channels()          FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.create_default_org_channel()      FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user()                 FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_chat_message()             FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_comment_mentions()         FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_step_advanced()            FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_ticket_assigned()          FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_ticket_assigned_on_insert() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_project_forms_org_id()        FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_ticket_updated_at()        FROM PUBLIC, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Section 2 -- scheduled job. Only the cron/service role should run this.
-- ---------------------------------------------------------------------------

REVOKE EXECUTE ON FUNCTION public.create_overdue_ticket_notifications() FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.create_overdue_ticket_notifications() TO service_role;

-- ---------------------------------------------------------------------------
-- Section 3 -- RLS policy helper functions. BEHAVIOUR CHANGE, APPLY DELIBERATELY.
--
-- user_org_ids(), user_channel_ids(), user_has_org_role() and org_has_no_members() are
-- referenced from RLS policy expressions. Those expressions are evaluated as the *querying*
-- role, so the querying role needs EXECUTE on them.
--
-- Every policy on these tables is defined TO public, which includes anon. Today an
-- unauthenticated PostgREST read evaluates the policy, the helper resolves auth.uid() to NULL,
-- and the request returns an empty result set. After this revoke that same request instead
-- fails with "permission denied for function user_org_ids".
--
-- That is the correct end state -- anon has no business reading these tables at all -- but it
-- converts a silent empty response into a hard error. Before applying, confirm no anon-key
-- read path depends on getting an empty list back. The cleaner companion change is to revoke
-- anon's SELECT on the underlying tables (Supabase lint pg_graphql_anon_table_exposed, 38
-- findings), which is tracked separately.
-- ---------------------------------------------------------------------------

REVOKE EXECUTE ON FUNCTION public.user_org_ids()      FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.user_channel_ids()  FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.user_has_org_role(uuid, public.org_role[]) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.org_has_no_members(uuid)                   FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.user_org_ids()      TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_channel_ids()  TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_has_org_role(uuid, public.org_role[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.org_has_no_members(uuid)                   TO authenticated;

-- ---------------------------------------------------------------------------
-- Section 4 -- cross-org data leak in the two form-count aggregates. REAL BUG.
--
-- Both functions are SECURITY DEFINER, take p_org_id straight from the caller, and never
-- check that the caller belongs to that org. Any caller holding the anon or authenticated key
-- can therefore enumerate project_forms aggregates for ANY organisation by passing its id:
--
--   POST /rest/v1/rpc/get_form_type_counts_by_project  {"p_org_id": "<any org uuid>"}
--
-- Because they are SECURITY DEFINER the project_forms RLS policies never apply. The fix is to
-- derive authorisation from auth.uid() rather than trusting the argument. The membership test
-- reuses user_org_ids(), which is itself SECURITY DEFINER, so it still works after Section 3.
-- Both keep their signature and return type, so no application change is needed.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_distinct_form_type_counts(p_org_id uuid)
RETURNS TABLE(project_id uuid, distinct_types bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT pf.project_id, COUNT(DISTINCT pf.form_type) AS distinct_types
  FROM project_forms pf
  WHERE pf.org_id = p_org_id
    AND p_org_id IN (SELECT user_org_ids())
  GROUP BY pf.project_id
$function$;

CREATE OR REPLACE FUNCTION public.get_form_type_counts_by_project(p_org_id uuid)
RETURNS TABLE(project_id uuid, form_type text, cnt bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT pf.project_id, pf.form_type, COUNT(*) AS cnt
  FROM project_forms pf
  WHERE pf.org_id = p_org_id
    AND p_org_id IN (SELECT user_org_ids())
  GROUP BY pf.project_id, pf.form_type
$function$;

REVOKE EXECUTE ON FUNCTION public.get_distinct_form_type_counts(uuid)   FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_form_type_counts_by_project(uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.get_distinct_form_type_counts(uuid)   TO authenticated;
GRANT  EXECUTE ON FUNCTION public.get_form_type_counts_by_project(uuid) TO authenticated;

COMMIT;
