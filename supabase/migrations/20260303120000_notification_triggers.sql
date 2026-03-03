-- ============================================================
-- PIPS 2.0 — Notification Trigger Functions
-- ============================================================
-- Creates database triggers that auto-insert notification rows
-- when certain events occur:
--   1. ticket_assigned — when a ticket is assigned to someone
--   2. mention — when a user is @mentioned in a comment
--   3. project_updated (step advanced) — when a project moves to the next step
--   4. ticket_overdue — when a ticket passes its due date (optional cron)
-- ============================================================

-- ============================================================
-- 1. TICKET ASSIGNED TRIGGER
-- Fires when tickets.assignee_id changes to a non-null value
-- that is different from the user performing the update.
-- ============================================================

CREATE OR REPLACE FUNCTION notify_ticket_assigned()
RETURNS TRIGGER AS $$
BEGIN
  -- Only fire when assignee_id changes to a new non-null value
  IF NEW.assignee_id IS NOT NULL
     AND (OLD.assignee_id IS DISTINCT FROM NEW.assignee_id)
  THEN
    INSERT INTO notifications (org_id, user_id, type, title, body, entity_type, entity_id)
    VALUES (
      NEW.org_id,
      NEW.assignee_id,
      'ticket_assigned',
      'Ticket assigned to you',
      'You have been assigned to ticket "' || NEW.title || '"',
      'ticket',
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_notify_ticket_assigned
  AFTER UPDATE OF assignee_id ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION notify_ticket_assigned();

-- Also fire on INSERT if assignee_id is set at creation time
CREATE OR REPLACE FUNCTION notify_ticket_assigned_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.assignee_id IS NOT NULL THEN
    INSERT INTO notifications (org_id, user_id, type, title, body, entity_type, entity_id)
    VALUES (
      NEW.org_id,
      NEW.assignee_id,
      'ticket_assigned',
      'Ticket assigned to you',
      'You have been assigned to ticket "' || NEW.title || '"',
      'ticket',
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_notify_ticket_assigned_insert
  AFTER INSERT ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION notify_ticket_assigned_on_insert();


-- ============================================================
-- 2. MENTION TRIGGER
-- Fires when a comment is inserted with non-empty mentions array.
-- Creates one notification per mentioned user.
-- ============================================================

CREATE OR REPLACE FUNCTION notify_comment_mentions()
RETURNS TRIGGER AS $$
DECLARE
  mentioned_user_id UUID;
  ticket_title TEXT;
  entity TEXT;
  entity_uuid UUID;
BEGIN
  -- Only fire if there are mentions
  IF NEW.mentions IS NOT NULL AND array_length(NEW.mentions, 1) > 0 THEN
    -- Determine the entity for the notification link
    IF NEW.ticket_id IS NOT NULL THEN
      entity := 'ticket';
      entity_uuid := NEW.ticket_id;
      SELECT title INTO ticket_title FROM tickets WHERE id = NEW.ticket_id;
    ELSIF NEW.project_id IS NOT NULL THEN
      entity := 'project';
      entity_uuid := NEW.project_id;
      SELECT title INTO ticket_title FROM projects WHERE id = NEW.project_id;
    ELSE
      entity := NULL;
      entity_uuid := NULL;
      ticket_title := 'a comment';
    END IF;

    -- Insert a notification for each mentioned user
    FOREACH mentioned_user_id IN ARRAY NEW.mentions
    LOOP
      -- Don't notify the comment author about their own mention
      IF mentioned_user_id != NEW.author_id THEN
        INSERT INTO notifications (org_id, user_id, type, title, body, entity_type, entity_id)
        VALUES (
          NEW.org_id,
          mentioned_user_id,
          'mention',
          'You were mentioned in a comment',
          'You were mentioned in a comment on "' || COALESCE(ticket_title, 'an item') || '"',
          entity,
          entity_uuid
        );
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_notify_comment_mentions
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_comment_mentions();


-- ============================================================
-- 3. STEP ADVANCED TRIGGER
-- Fires when projects.current_step changes, notifying the
-- project owner and all org members with tickets on that project.
-- ============================================================

CREATE OR REPLACE FUNCTION notify_step_advanced()
RETURNS TRIGGER AS $$
DECLARE
  step_label TEXT;
  member_id UUID;
BEGIN
  -- Only fire when current_step actually changes
  IF OLD.current_step IS DISTINCT FROM NEW.current_step THEN
    -- Human-readable step label
    step_label := REPLACE(INITCAP(REPLACE(NEW.current_step::TEXT, '_', ' ')), 'Select Plan', 'Select & Plan');

    -- Notify the project owner
    INSERT INTO notifications (org_id, user_id, type, title, body, entity_type, entity_id)
    VALUES (
      NEW.org_id,
      NEW.owner_id,
      'project_updated',
      'Project advanced to ' || step_label,
      'Project "' || NEW.title || '" has advanced to step: ' || step_label,
      'project',
      NEW.id
    );

    -- Notify all distinct assignees of tickets on this project (except the owner)
    FOR member_id IN
      SELECT DISTINCT assignee_id
      FROM tickets
      WHERE project_id = NEW.id
        AND assignee_id IS NOT NULL
        AND assignee_id != NEW.owner_id
    LOOP
      INSERT INTO notifications (org_id, user_id, type, title, body, entity_type, entity_id)
      VALUES (
        NEW.org_id,
        member_id,
        'project_updated',
        'Project advanced to ' || step_label,
        'Project "' || NEW.title || '" has advanced to step: ' || step_label,
        'project',
        NEW.id
      );
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_notify_step_advanced
  AFTER UPDATE OF current_step ON projects
  FOR EACH ROW
  EXECUTE FUNCTION notify_step_advanced();


-- ============================================================
-- 4. TICKET OVERDUE FUNCTION (optional — called by cron or edge function)
-- Finds tickets past their due_date that are still open and
-- creates a notification for the assignee (if not already notified today).
-- ============================================================

CREATE OR REPLACE FUNCTION create_overdue_ticket_notifications()
RETURNS INTEGER AS $$
DECLARE
  overdue_count INTEGER := 0;
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT t.id, t.org_id, t.assignee_id, t.title
    FROM tickets t
    WHERE t.due_date < CURRENT_DATE
      AND t.status IN ('backlog', 'todo', 'in_progress', 'in_review', 'blocked')
      AND t.assignee_id IS NOT NULL
      -- Only notify once per day per ticket
      AND NOT EXISTS (
        SELECT 1 FROM notifications n
        WHERE n.entity_id = t.id
          AND n.type = 'ticket_assigned'  -- Reuse closest type since 'ticket_overdue' not in enum
          AND n.title = 'Ticket overdue'
          AND n.created_at >= CURRENT_DATE
      )
  LOOP
    INSERT INTO notifications (org_id, user_id, type, title, body, entity_type, entity_id)
    VALUES (
      rec.org_id,
      rec.assignee_id,
      'system',
      'Ticket overdue',
      'Ticket "' || rec.title || '" is past its due date',
      'ticket',
      rec.id
    );
    overdue_count := overdue_count + 1;
  END LOOP;

  RETURN overdue_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION create_overdue_ticket_notifications() IS
  'Creates notifications for overdue tickets. Call from a cron job or edge function. Returns count of notifications created.';
