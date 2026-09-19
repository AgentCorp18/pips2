-- PERF: wrap auth.uid() in a scalar subquery so it is evaluated once per statement
-- instead of once per candidate row (Supabase advisor lint: auth_rls_initplan, 70 findings).
--
-- (select auth.uid()) is semantically identical to auth.uid() here -- auth.uid() is STABLE and
-- takes no per-row input -- but the scalar subquery lets the planner hoist it into an InitPlan
-- that is evaluated a single time for the whole statement.
--
-- ALTER POLICY is used rather than DROP + CREATE so that the roles, the command and the
-- permissive/restrictive setting of each policy are preserved exactly, and so there is no
-- window in which a table is left without its policy.
--
-- Generated from pg_policies, not written by hand; covers all 70 policies the advisor flagged.
-- Verified against the live catalog: 0 policies in this database reference current_setting(),
-- so auth.uid() is the only call that needs rewriting.

BEGIN;

ALTER POLICY "Admins or self can remove channel members" ON public.chat_channel_members
  USING (((user_id = (select auth.uid())) OR user_has_org_role(( SELECT chat_channels.org_id
   FROM chat_channels
  WHERE (chat_channels.id = chat_channel_members.channel_id)), ARRAY['owner'::org_role, 'admin'::org_role, 'manager'::org_role])));

ALTER POLICY "Members can update own membership" ON public.chat_channel_members
  USING ((user_id = (select auth.uid())));

ALTER POLICY "Admins and managers can create channels" ON public.chat_channels
  WITH CHECK (((org_id IN ( SELECT user_org_ids() AS user_org_ids)) AND user_has_org_role(org_id, ARRAY['owner'::org_role, 'admin'::org_role, 'manager'::org_role]) AND (created_by = (select auth.uid()))));

ALTER POLICY "Authors and admins can delete messages" ON public.chat_messages
  USING (((author_id = (select auth.uid())) OR user_has_org_role(org_id, ARRAY['owner'::org_role, 'admin'::org_role])));

ALTER POLICY "Authors and admins can edit messages" ON public.chat_messages
  USING (((author_id = (select auth.uid())) OR user_has_org_role(org_id, ARRAY['owner'::org_role, 'admin'::org_role])));

ALTER POLICY "Channel members can send messages" ON public.chat_messages
  WITH CHECK (((author_id = (select auth.uid())) AND (channel_id IN ( SELECT user_channel_ids() AS user_channel_ids))));

ALTER POLICY "Channel members can view summaries" ON public.chat_summaries
  USING ((channel_id IN ( SELECT chat_channel_members.channel_id
   FROM chat_channel_members
  WHERE (chat_channel_members.user_id = (select auth.uid())))));

ALTER POLICY "Authenticated users can create comments in their org" ON public.comments
  WITH CHECK (((org_id IN ( SELECT user_org_ids() AS user_org_ids)) AND (author_id = (select auth.uid()))));

ALTER POLICY "Authors and admins can delete comments" ON public.comments
  USING (((author_id = (select auth.uid())) OR user_has_org_role(org_id, ARRAY['owner'::org_role, 'admin'::org_role])));

ALTER POLICY "Authors can update their own comments" ON public.comments
  USING ((author_id = (select auth.uid())));

ALTER POLICY "Users can delete own bookmarks" ON public.content_bookmarks
  USING ((user_id = (select auth.uid())));

ALTER POLICY "Users can insert own bookmarks" ON public.content_bookmarks
  WITH CHECK ((user_id = (select auth.uid())));

ALTER POLICY "Users can update own bookmarks" ON public.content_bookmarks
  USING ((user_id = (select auth.uid())));

ALTER POLICY "Users can view own bookmarks" ON public.content_bookmarks
  USING ((user_id = (select auth.uid())));

ALTER POLICY "Users can insert own read history" ON public.content_read_history
  WITH CHECK ((user_id = (select auth.uid())));

ALTER POLICY "Users can update own read history" ON public.content_read_history
  USING ((user_id = (select auth.uid())));

ALTER POLICY "Users can view own read history" ON public.content_read_history
  USING ((user_id = (select auth.uid())));

ALTER POLICY "Admin+ can delete attachments" ON public.file_attachments
  USING (((uploaded_by = (select auth.uid())) OR user_has_org_role(org_id, ARRAY['owner'::org_role, 'admin'::org_role])));

ALTER POLICY "Members+ can upload attachments" ON public.file_attachments
  WITH CHECK (((org_id IN ( SELECT user_org_ids() AS user_org_ids)) AND (uploaded_by = (select auth.uid())) AND user_has_org_role(org_id, ARRAY['owner'::org_role, 'admin'::org_role, 'manager'::org_role, 'member'::org_role])));

ALTER POLICY "Managers+ can create initiatives" ON public.initiatives
  WITH CHECK (((org_id IN ( SELECT user_org_ids() AS user_org_ids)) AND (owner_id = (select auth.uid())) AND user_has_org_role(org_id, ARRAY['owner'::org_role, 'admin'::org_role, 'manager'::org_role])));

ALTER POLICY "Owners and managers+ can update initiatives" ON public.initiatives
  USING (((org_id IN ( SELECT user_org_ids() AS user_org_ids)) AND ((owner_id = (select auth.uid())) OR user_has_org_role(org_id, ARRAY['owner'::org_role, 'admin'::org_role, 'manager'::org_role]))));

ALTER POLICY "Admin+ can manage integrations" ON public.integration_connections
  WITH CHECK ((user_has_org_role(org_id, ARRAY['owner'::org_role, 'admin'::org_role, 'manager'::org_role]) AND (created_by = (select auth.uid()))));

ALTER POLICY "Users can insert own preferences" ON public.notification_preferences
  WITH CHECK ((user_id = (select auth.uid())));

ALTER POLICY "Users can update own preferences" ON public.notification_preferences
  USING ((user_id = (select auth.uid())));

ALTER POLICY "Users can view own preferences" ON public.notification_preferences
  USING ((user_id = (select auth.uid())));

ALTER POLICY "Users can delete their own notifications" ON public.notifications
  USING ((user_id = (select auth.uid())));

ALTER POLICY "Users can only view their own notifications" ON public.notifications
  USING ((user_id = (select auth.uid())));

ALTER POLICY "Users can update their own notifications (mark read)" ON public.notifications
  USING ((user_id = (select auth.uid())));

ALTER POLICY "Admin+ can create API keys" ON public.org_api_keys
  WITH CHECK ((user_has_org_role(org_id, ARRAY['owner'::org_role, 'admin'::org_role]) AND (created_by = (select auth.uid()))));

ALTER POLICY "Owner/admin can create invitations" ON public.org_invitations
  WITH CHECK ((user_has_org_role(org_id, ARRAY['owner'::org_role, 'admin'::org_role]) AND (invited_by = (select auth.uid()))));

ALTER POLICY "Owner/admin can add members" ON public.org_members
  WITH CHECK ((user_has_org_role(org_id, ARRAY['owner'::org_role, 'admin'::org_role]) OR ((user_id = (select auth.uid())) AND (role = 'owner'::org_role) AND org_has_no_members(org_id))));

ALTER POLICY "Owner/admin can remove members" ON public.org_members
  USING ((user_has_org_role(org_id, ARRAY['owner'::org_role, 'admin'::org_role]) OR (user_id = (select auth.uid()))));

ALTER POLICY "Members can read org permission overrides" ON public.org_permission_overrides
  USING ((EXISTS ( SELECT 1
   FROM org_members
  WHERE ((org_members.org_id = org_permission_overrides.org_id) AND (org_members.user_id = (select auth.uid()))))));

ALTER POLICY "Owners can delete permission overrides" ON public.org_permission_overrides
  USING ((EXISTS ( SELECT 1
   FROM org_members
  WHERE ((org_members.org_id = org_permission_overrides.org_id) AND (org_members.user_id = (select auth.uid())) AND (org_members.role = 'owner'::org_role)))));

ALTER POLICY "Owners can insert permission overrides" ON public.org_permission_overrides
  WITH CHECK ((EXISTS ( SELECT 1
   FROM org_members
  WHERE ((org_members.org_id = org_permission_overrides.org_id) AND (org_members.user_id = (select auth.uid())) AND (org_members.role = 'owner'::org_role)))));

ALTER POLICY "Owners can update permission overrides" ON public.org_permission_overrides
  USING ((EXISTS ( SELECT 1
   FROM org_members
  WHERE ((org_members.org_id = org_permission_overrides.org_id) AND (org_members.user_id = (select auth.uid())) AND (org_members.role = 'owner'::org_role)))));

ALTER POLICY "Authenticated users can create organizations" ON public.organizations
  WITH CHECK ((created_by = (select auth.uid())));

ALTER POLICY "Users can view their organizations" ON public.organizations
  USING (((id IN ( SELECT user_org_ids() AS user_org_ids)) OR (created_by = (select auth.uid()))));

ALTER POLICY "Users can update their own profile" ON public.profiles
  USING ((id = (select auth.uid())));

ALTER POLICY "Form creator and manager+ can update forms" ON public.project_forms
  USING (((created_by = (select auth.uid())) OR (project_id IN ( SELECT p.id
   FROM projects p
  WHERE user_has_org_role(p.org_id, ARRAY['owner'::org_role, 'admin'::org_role, 'manager'::org_role])))));

ALTER POLICY "Members+ can create project forms" ON public.project_forms
  WITH CHECK (((created_by = (select auth.uid())) AND (project_id IN ( SELECT p.id
   FROM projects p
  WHERE ((p.org_id IN ( SELECT user_org_ids() AS user_org_ids)) AND user_has_org_role(p.org_id, ARRAY['owner'::org_role, 'admin'::org_role, 'manager'::org_role, 'member'::org_role]))))));

ALTER POLICY "Project owner and manager+ can add project members" ON public.project_members
  WITH CHECK ((project_id IN ( SELECT p.id
   FROM projects p
  WHERE ((p.org_id IN ( SELECT user_org_ids() AS user_org_ids)) AND ((p.owner_id = (select auth.uid())) OR user_has_org_role(p.org_id, ARRAY['owner'::org_role, 'admin'::org_role, 'manager'::org_role]))))));

ALTER POLICY "Project owner and manager+ can remove project members" ON public.project_members
  USING (((project_id IN ( SELECT p.id
   FROM projects p
  WHERE ((p.owner_id = (select auth.uid())) OR user_has_org_role(p.org_id, ARRAY['owner'::org_role, 'admin'::org_role, 'manager'::org_role])))) OR (user_id = (select auth.uid()))));

ALTER POLICY "Project owner and manager+ can update project members" ON public.project_members
  USING ((project_id IN ( SELECT p.id
   FROM projects p
  WHERE ((p.owner_id = (select auth.uid())) OR user_has_org_role(p.org_id, ARRAY['owner'::org_role, 'admin'::org_role, 'manager'::org_role])))));

ALTER POLICY "Members can create projects" ON public.projects
  WITH CHECK (((org_id IN ( SELECT user_org_ids() AS user_org_ids)) AND (owner_id = (select auth.uid())) AND user_has_org_role(org_id, ARRAY['owner'::org_role, 'admin'::org_role, 'manager'::org_role, 'member'::org_role])));

ALTER POLICY "Project owners and managers+ can update" ON public.projects
  USING (((org_id IN ( SELECT user_org_ids() AS user_org_ids)) AND ((owner_id = (select auth.uid())) OR user_has_org_role(org_id, ARRAY['owner'::org_role, 'admin'::org_role, 'manager'::org_role]))));

ALTER POLICY "Users can delete own reading sessions" ON public.reading_sessions
  USING ((user_id = (select auth.uid())));

ALTER POLICY "Users can insert own reading sessions" ON public.reading_sessions
  WITH CHECK ((user_id = (select auth.uid())));

ALTER POLICY "Users can update own reading sessions" ON public.reading_sessions
  USING ((user_id = (select auth.uid())));

ALTER POLICY "Users can view own reading sessions" ON public.reading_sessions
  USING ((user_id = (select auth.uid())));

ALTER POLICY "System admins can view admin log" ON public.system_admin_log
  USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = (select auth.uid())) AND (profiles.is_system_admin = true)))));

ALTER POLICY "Manager+ can remove team members" ON public.team_members
  USING (((team_id IN ( SELECT t.id
   FROM teams t
  WHERE user_has_org_role(t.org_id, ARRAY['owner'::org_role, 'admin'::org_role, 'manager'::org_role]))) OR (user_id = (select auth.uid()))));

ALTER POLICY "Manager+ can create teams" ON public.teams
  WITH CHECK (((org_id IN ( SELECT user_org_ids() AS user_org_ids)) AND user_has_org_role(org_id, ARRAY['owner'::org_role, 'admin'::org_role, 'manager'::org_role]) AND (created_by = (select auth.uid()))));

ALTER POLICY "Users can create links in their org" ON public.ticket_links
  WITH CHECK ((org_id IN ( SELECT org_members.org_id
   FROM org_members
  WHERE (org_members.user_id = (select auth.uid())))));

ALTER POLICY "Users can delete links in their org" ON public.ticket_links
  USING ((org_id IN ( SELECT org_members.org_id
   FROM org_members
  WHERE (org_members.user_id = (select auth.uid())))));

ALTER POLICY "Users can view links in their org" ON public.ticket_links
  USING ((org_id IN ( SELECT org_members.org_id
   FROM org_members
  WHERE (org_members.user_id = (select auth.uid())))));

ALTER POLICY "Members+ can create ticket relations" ON public.ticket_relations
  WITH CHECK (((created_by = (select auth.uid())) AND (source_id IN ( SELECT t.id
   FROM tickets t
  WHERE ((t.org_id IN ( SELECT user_org_ids() AS user_org_ids)) AND user_has_org_role(t.org_id, ARRAY['owner'::org_role, 'admin'::org_role, 'manager'::org_role, 'member'::org_role]))))));

ALTER POLICY "Members+ can create ticket transitions" ON public.ticket_transitions
  WITH CHECK (((changed_by = (select auth.uid())) AND (ticket_id IN ( SELECT t.id
   FROM tickets t
  WHERE ((t.org_id IN ( SELECT user_org_ids() AS user_org_ids)) AND user_has_org_role(t.org_id, ARRAY['owner'::org_role, 'admin'::org_role, 'manager'::org_role, 'member'::org_role]))))));

ALTER POLICY "Members can create tickets" ON public.tickets
  WITH CHECK (((org_id IN ( SELECT user_org_ids() AS user_org_ids)) AND (reporter_id = (select auth.uid()))));

ALTER POLICY "Users can insert own exercise data" ON public.training_exercise_data
  WITH CHECK ((user_id = (select auth.uid())));

ALTER POLICY "Users can update own exercise data" ON public.training_exercise_data
  USING ((user_id = (select auth.uid())));

ALTER POLICY "Users can view own exercise data" ON public.training_exercise_data
  USING ((user_id = (select auth.uid())));

ALTER POLICY "Users can insert own training progress" ON public.training_progress
  WITH CHECK ((user_id = (select auth.uid())));

ALTER POLICY "Users can update own training progress" ON public.training_progress
  USING ((user_id = (select auth.uid())));

ALTER POLICY "Users can view own training progress" ON public.training_progress
  USING ((user_id = (select auth.uid())));

ALTER POLICY "Admin+ can create webhooks" ON public.webhook_subscriptions
  WITH CHECK ((user_has_org_role(org_id, ARRAY['owner'::org_role, 'admin'::org_role]) AND (created_by = (select auth.uid()))));

ALTER POLICY "Facilitators can update own workshop sessions" ON public.workshop_sessions
  USING ((facilitator_id = (select auth.uid())));

ALTER POLICY "Org admins can delete workshop sessions" ON public.workshop_sessions
  USING ((EXISTS ( SELECT 1
   FROM org_members
  WHERE ((org_members.org_id = workshop_sessions.org_id) AND (org_members.user_id = (select auth.uid())) AND (org_members.role = ANY (ARRAY['owner'::org_role, 'admin'::org_role]))))));

ALTER POLICY "Org admins can insert workshop sessions" ON public.workshop_sessions
  WITH CHECK ((EXISTS ( SELECT 1
   FROM org_members
  WHERE ((org_members.org_id = workshop_sessions.org_id) AND (org_members.user_id = (select auth.uid())) AND (org_members.role = ANY (ARRAY['owner'::org_role, 'admin'::org_role, 'manager'::org_role]))))));

ALTER POLICY "Org members can view workshop sessions" ON public.workshop_sessions
  USING ((EXISTS ( SELECT 1
   FROM org_members
  WHERE ((org_members.org_id = workshop_sessions.org_id) AND (org_members.user_id = (select auth.uid()))))));

COMMIT;
