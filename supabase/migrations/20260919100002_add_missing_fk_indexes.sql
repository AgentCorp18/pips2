-- PERF: add covering indexes for the 32 foreign keys that have none.
-- Supabase advisor lint: unindexed_foreign_keys (32 findings).
--
-- An unindexed FK makes every join on that column a sequential scan, and also forces a full
-- scan of the child table on any UPDATE or DELETE of the parent row. The chat_messages and
-- chat_summaries keys matter most: message lists join on exactly these columns, so the cost
-- grows directly with chat history.
--
-- Index list derived from pg_constraint, not from the advisor text -- every FK whose leading
-- column set is not already the prefix of some existing index.
--
-- Written as plain CREATE INDEX so the whole migration stays in one transaction. Current row
-- counts are small enough that the ACCESS SHARE lock is momentary. If these tables have grown
-- by the time this is applied, run the statements individually with CREATE INDEX CONCURRENTLY
-- outside a transaction instead.
--
-- This migration only ADDS indexes. Dropping the 81 never-scanned indexes is deliberately NOT
-- included: those counters come from pg_stat_user_indexes, which was reset when the project was
-- restored from pause, so they do not yet represent a real traffic window.

BEGIN;

CREATE INDEX IF NOT EXISTS idx_chat_channels_created_by            ON public.chat_channels (created_by);
CREATE INDEX IF NOT EXISTS idx_chat_messages_author_id             ON public.chat_messages (author_id);
CREATE INDEX IF NOT EXISTS idx_chat_summaries_channel_id           ON public.chat_summaries (channel_id);
CREATE INDEX IF NOT EXISTS idx_chat_summaries_from_message_id      ON public.chat_summaries (from_message_id);
CREATE INDEX IF NOT EXISTS idx_chat_summaries_to_message_id        ON public.chat_summaries (to_message_id);
CREATE INDEX IF NOT EXISTS idx_comments_org_id                     ON public.comments (org_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id                  ON public.comments (parent_id);
CREATE INDEX IF NOT EXISTS idx_content_bookmarks_content_node_id   ON public.content_bookmarks (content_node_id);
CREATE INDEX IF NOT EXISTS idx_file_attachments_uploaded_by        ON public.file_attachments (uploaded_by);
CREATE INDEX IF NOT EXISTS idx_initiative_projects_added_by        ON public.initiative_projects (added_by);
CREATE INDEX IF NOT EXISTS idx_integration_connections_created_by  ON public.integration_connections (created_by);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_org_id     ON public.notification_preferences (org_id);
CREATE INDEX IF NOT EXISTS idx_notifications_org_id                ON public.notifications (org_id);
CREATE INDEX IF NOT EXISTS idx_org_api_keys_created_by             ON public.org_api_keys (created_by);
CREATE INDEX IF NOT EXISTS idx_org_invitations_invited_by          ON public.org_invitations (invited_by);
CREATE INDEX IF NOT EXISTS idx_org_permission_overrides_updated_by ON public.org_permission_overrides (updated_by);
CREATE INDEX IF NOT EXISTS idx_organizations_created_by            ON public.organizations (created_by);
CREATE INDEX IF NOT EXISTS idx_project_forms_created_by            ON public.project_forms (created_by);
CREATE INDEX IF NOT EXISTS idx_project_steps_completed_by          ON public.project_steps (completed_by);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_content_node_id    ON public.reading_sessions (content_node_id);
CREATE INDEX IF NOT EXISTS idx_system_admin_log_target_org_id      ON public.system_admin_log (target_org_id);
CREATE INDEX IF NOT EXISTS idx_system_admin_log_target_user_id     ON public.system_admin_log (target_user_id);
CREATE INDEX IF NOT EXISTS idx_teams_created_by                    ON public.teams (created_by);
CREATE INDEX IF NOT EXISTS idx_ticket_links_created_by             ON public.ticket_links (created_by);
CREATE INDEX IF NOT EXISTS idx_ticket_relations_created_by         ON public.ticket_relations (created_by);
CREATE INDEX IF NOT EXISTS idx_ticket_transitions_changed_by       ON public.ticket_transitions (changed_by);
CREATE INDEX IF NOT EXISTS idx_tickets_reporter_id                 ON public.tickets (reporter_id);
CREATE INDEX IF NOT EXISTS idx_tickets_team_id                     ON public.tickets (team_id);
CREATE INDEX IF NOT EXISTS idx_training_exercise_data_exercise_id  ON public.training_exercise_data (exercise_id);
CREATE INDEX IF NOT EXISTS idx_training_progress_module_id         ON public.training_progress (module_id);
CREATE INDEX IF NOT EXISTS idx_webhook_subscriptions_created_by    ON public.webhook_subscriptions (created_by);
CREATE INDEX IF NOT EXISTS idx_webhook_subscriptions_org_id        ON public.webhook_subscriptions (org_id);

COMMIT;
