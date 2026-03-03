-- ============================================================
-- PIPS 2.0 — Initial Database Schema
-- ============================================================
-- This migration creates the complete database schema for the
-- PIPS 2.0 multi-tenant SaaS application. All tables, enums,
-- functions, triggers, indexes, and RLS policies are defined
-- in this single migration.
--
-- Tables marked "Schema only" have no UI in MVP but are
-- created now to avoid future migration complexity.
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";       -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pg_trgm";          -- Fuzzy text search (trigram)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";         -- Crypto functions (gen_random_bytes)

-- ============================================================
-- ENUMS
-- ============================================================

-- Organization member roles (hierarchical: owner > admin > manager > member > viewer)
CREATE TYPE org_role AS ENUM ('owner', 'admin', 'manager', 'member', 'viewer');

-- Organization billing plan (MVP: all orgs are 'free')
CREATE TYPE org_plan AS ENUM ('free', 'starter', 'professional', 'enterprise');

-- Invitation lifecycle status
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'expired', 'revoked');

-- Ticket workflow statuses (MVP: 'blocked' and 'cancelled' exist but not prominently surfaced)
CREATE TYPE ticket_status AS ENUM (
  'backlog', 'todo', 'in_progress', 'in_review', 'blocked', 'done', 'cancelled'
);

-- Ticket priority levels
CREATE TYPE ticket_priority AS ENUM ('critical', 'high', 'medium', 'low', 'none');

-- Ticket type classification
CREATE TYPE ticket_type AS ENUM ('pips_project', 'task', 'bug', 'feature', 'general');

-- The 6 PIPS methodology steps
CREATE TYPE pips_step AS ENUM (
  'identify', 'analyze', 'generate', 'select_plan', 'implement', 'evaluate'
);

-- PIPS project lifecycle status
CREATE TYPE project_status AS ENUM (
  'draft', 'active', 'on_hold', 'completed', 'archived'
);

-- Notification event types
CREATE TYPE notification_type AS ENUM (
  'ticket_assigned', 'ticket_updated', 'ticket_commented',
  'project_updated', 'mention', 'invitation', 'system'
);

-- External integration providers (MVP: unused, defined for future)
CREATE TYPE integration_provider AS ENUM ('jira', 'azure_devops', 'aha');

-- Sync direction for external integrations (MVP: unused)
CREATE TYPE sync_direction AS ENUM ('inbound', 'outbound', 'bidirectional');


-- ============================================================
-- UTILITY FUNCTIONS
-- ============================================================

-- Trigger function to auto-update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- TABLE: profiles
-- Extends Supabase auth.users with application-specific data
-- ============================================================
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  full_name     TEXT NOT NULL DEFAULT '',
  display_name  TEXT,
  avatar_url    TEXT,
  timezone      TEXT NOT NULL DEFAULT 'America/New_York',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE profiles IS 'User profiles extending Supabase auth.users';
COMMENT ON COLUMN profiles.id IS 'References auth.users(id) — same UUID as the auth user';
COMMENT ON COLUMN profiles.display_name IS 'Optional display name override (shows instead of full_name)';
COMMENT ON COLUMN profiles.timezone IS 'IANA timezone identifier for date/time display';

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- TABLE: organizations
-- Top-level tenant entity. Every user-facing table is scoped
-- to an organization via org_id.
-- ============================================================
CREATE TABLE organizations (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                    TEXT NOT NULL,
  slug                    TEXT NOT NULL UNIQUE,
  plan                    org_plan NOT NULL DEFAULT 'free',
  logo_url                TEXT,
  created_by              UUID NOT NULL REFERENCES profiles(id),

  -- Billing (Phase 2 — unused in MVP)
  stripe_customer_id      TEXT,
  stripe_subscription_id  TEXT,

  -- Limits
  max_members             INT NOT NULL DEFAULT 5,

  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Slug must be 3-50 chars: lowercase alphanumeric and hyphens, no leading/trailing hyphens
  CONSTRAINT slug_format CHECK (slug ~ '^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$')
);

COMMENT ON TABLE organizations IS 'Multi-tenant organizations — every data table is scoped to an org';
COMMENT ON COLUMN organizations.slug IS 'URL-friendly identifier, used in routes: /[orgSlug]/dashboard';
COMMENT ON COLUMN organizations.plan IS 'Billing plan tier — all orgs are free in MVP';
COMMENT ON COLUMN organizations.stripe_customer_id IS 'Phase 2: Stripe customer ID for billing';
COMMENT ON COLUMN organizations.stripe_subscription_id IS 'Phase 2: Stripe subscription ID';

CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_stripe ON organizations(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

CREATE TRIGGER organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- TABLE: org_members
-- Join table: user <-> organization membership with role
-- ============================================================
CREATE TABLE org_members (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role          org_role NOT NULL DEFAULT 'member',
  joined_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_org_member UNIQUE (org_id, user_id)
);

COMMENT ON TABLE org_members IS 'Organization membership with role-based access control';

CREATE INDEX idx_org_members_org ON org_members(org_id);
CREATE INDEX idx_org_members_user ON org_members(user_id);

CREATE TRIGGER org_members_updated_at
  BEFORE UPDATE ON org_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- TABLE: org_invitations
-- Pending invitations to join an organization
-- ============================================================
CREATE TABLE org_invitations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  role          org_role NOT NULL DEFAULT 'member',
  invited_by    UUID NOT NULL REFERENCES profiles(id),
  status        invitation_status NOT NULL DEFAULT 'pending',
  token         TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at    TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Only one pending invitation per email per org
  CONSTRAINT unique_pending_invite UNIQUE (org_id, email, status)
);

COMMENT ON TABLE org_invitations IS 'Pending invitations to join an organization';
COMMENT ON COLUMN org_invitations.token IS 'Secure random token sent in invitation link';
COMMENT ON COLUMN org_invitations.expires_at IS 'Invitation expires 7 days after creation';

CREATE INDEX idx_org_invitations_org ON org_invitations(org_id);
CREATE INDEX idx_org_invitations_token ON org_invitations(token);
CREATE INDEX idx_org_invitations_email ON org_invitations(email);


-- ============================================================
-- TABLE: org_settings
-- White-label branding and feature configuration per org
-- Schema only in MVP (no settings UI), but created for agents
-- ============================================================
CREATE TABLE org_settings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,

  -- White-label branding (Phase 5)
  brand_name      TEXT,                    -- Display name override
  primary_color   TEXT DEFAULT '#4F46E5',  -- Primary accent color (PIPS indigo)
  secondary_color TEXT DEFAULT '#F59E0B',  -- Secondary accent color (PIPS amber)
  logo_dark_url   TEXT,                    -- Logo for dark backgrounds
  logo_light_url  TEXT,                    -- Logo for light backgrounds
  favicon_url     TEXT,
  custom_css      TEXT,                    -- Additional custom CSS
  custom_domain   TEXT,                    -- e.g., "pips.acmecorp.com"

  -- Email branding
  email_from_name TEXT,
  email_reply_to  TEXT,

  -- Feature flags
  features        JSONB NOT NULL DEFAULT '{
    "ticketing": true,
    "pips_projects": true,
    "integrations": false,
    "custom_forms": false,
    "api_access": false,
    "sso": false
  }'::jsonb,

  -- PIPS methodology customization (Phase 5)
  step_labels     JSONB,  -- Override default step names
  step_colors     JSONB,  -- Override default step colors

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE org_settings IS 'Per-org white-label branding and feature flags (Phase 5 — schema only in MVP)';

CREATE TRIGGER org_settings_updated_at
  BEFORE UPDATE ON org_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- TABLE: teams
-- Groups of users within an organization
-- ============================================================
CREATE TABLE teams (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT,
  color         TEXT DEFAULT '#4F46E5',
  created_by    UUID NOT NULL REFERENCES profiles(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_team_name_per_org UNIQUE (org_id, name)
);

COMMENT ON TABLE teams IS 'Teams within an organization for grouping members';

CREATE INDEX idx_teams_org ON teams(org_id);

CREATE TRIGGER teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- TABLE: team_members
-- Join table: user <-> team membership
-- ============================================================
CREATE TABLE team_members (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id       UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role          TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('lead', 'member')),
  joined_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_team_member UNIQUE (team_id, user_id)
);

COMMENT ON TABLE team_members IS 'Team membership with lead/member roles';

CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);


-- ============================================================
-- TABLE: projects
-- A PIPS project — a complete 6-step process improvement cycle
-- ============================================================
CREATE TABLE projects (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  status          project_status NOT NULL DEFAULT 'draft',
  current_step    pips_step NOT NULL DEFAULT 'identify',
  owner_id        UUID NOT NULL REFERENCES profiles(id),
  team_id         UUID REFERENCES teams(id) ON DELETE SET NULL,

  -- Problem statement (Step 1 output, surfaced on project overview)
  problem_statement TEXT,

  -- Target dates
  target_start    DATE,
  target_end      DATE,
  actual_start    DATE,
  actual_end      DATE,

  -- Metadata
  tags            TEXT[] DEFAULT '{}',
  priority        ticket_priority NOT NULL DEFAULT 'medium',
  metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Full-text search vector (auto-populated by trigger)
  search_vector   TSVECTOR,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at    TIMESTAMPTZ
);

COMMENT ON TABLE projects IS 'PIPS projects — each represents a full 6-step process improvement cycle';
COMMENT ON COLUMN projects.current_step IS 'The step the project is currently on (advances as steps complete)';
COMMENT ON COLUMN projects.problem_statement IS 'Output from Step 1 (Identify) — the structured problem definition';
COMMENT ON COLUMN projects.search_vector IS 'Auto-populated tsvector for full-text search on title, description, problem_statement';

CREATE INDEX idx_projects_org ON projects(org_id);
CREATE INDEX idx_projects_owner ON projects(owner_id);
CREATE INDEX idx_projects_team ON projects(team_id);
CREATE INDEX idx_projects_status ON projects(org_id, status);
CREATE INDEX idx_projects_search ON projects USING GIN(search_vector);

-- Auto-update search vector on title/description/problem_statement changes
CREATE OR REPLACE FUNCTION projects_search_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.problem_statement, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_search_trigger
  BEFORE INSERT OR UPDATE OF title, description, problem_statement
  ON projects FOR EACH ROW
  EXECUTE FUNCTION projects_search_update();

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- TABLE: project_members
-- Who is assigned to a PIPS project and in what role
-- ============================================================
CREATE TABLE project_members (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role          TEXT NOT NULL DEFAULT 'contributor'
                CHECK (role IN ('lead', 'facilitator', 'contributor', 'observer')),
  joined_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_project_member UNIQUE (project_id, user_id)
);

COMMENT ON TABLE project_members IS 'Project team membership with PIPS-specific roles';

CREATE INDEX idx_project_members_project ON project_members(project_id);
CREATE INDEX idx_project_members_user ON project_members(user_id);


-- ============================================================
-- TABLE: project_steps
-- Data collected at each of the 6 PIPS steps for a project
-- ============================================================
CREATE TABLE project_steps (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  step          pips_step NOT NULL,
  status        TEXT NOT NULL DEFAULT 'not_started'
                CHECK (status IN ('not_started', 'in_progress', 'completed', 'skipped')),

  -- Each step stores its structured data as JSONB
  -- This allows different forms/tools per step without schema changes
  data          JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Facilitator notes
  notes         TEXT,

  started_at    TIMESTAMPTZ,
  completed_at  TIMESTAMPTZ,
  completed_by  UUID REFERENCES profiles(id),

  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Each project has exactly one row per step
  CONSTRAINT unique_project_step UNIQUE (project_id, step)
);

COMMENT ON TABLE project_steps IS 'One row per PIPS step per project — stores step status and structured JSONB data';
COMMENT ON COLUMN project_steps.data IS 'Flexible JSONB storage for step-specific data (form results, notes, etc.)';

CREATE INDEX idx_project_steps_project ON project_steps(project_id);

CREATE TRIGGER project_steps_updated_at
  BEFORE UPDATE ON project_steps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- TABLE: project_forms
-- Dynamic form submissions within a PIPS step (fishbone,
-- 5-why, brainstorming, decision matrix, etc.)
-- ============================================================
CREATE TABLE project_forms (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  step          pips_step NOT NULL,
  form_type     TEXT NOT NULL,   -- e.g., 'fishbone', 'five_why', 'brainwriting', 'decision_matrix', etc.
  title         TEXT NOT NULL,
  data          JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by    UUID NOT NULL REFERENCES profiles(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE project_forms IS 'PIPS form submissions — each represents an instance of a tool (fishbone, 5-why, etc.)';
COMMENT ON COLUMN project_forms.form_type IS 'Form type identifier — see Appendix A in TECHNICAL_PLAN.md for full list';
COMMENT ON COLUMN project_forms.data IS 'Form-specific JSONB data structure — varies by form_type';

CREATE INDEX idx_project_forms_project ON project_forms(project_id);
CREATE INDEX idx_project_forms_step ON project_forms(project_id, step);
CREATE INDEX idx_project_forms_type ON project_forms(form_type);

CREATE TRIGGER project_forms_updated_at
  BEFORE UPDATE ON project_forms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- TABLE: tickets
-- General-purpose tickets and PIPS project tickets
-- ============================================================
CREATE TABLE tickets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Sequence number per org (human-readable: ORG-123)
  sequence_number BIGINT NOT NULL,

  -- Hierarchy
  project_id      UUID REFERENCES projects(id) ON DELETE SET NULL,
  parent_id       UUID REFERENCES tickets(id) ON DELETE SET NULL,

  -- Core fields
  title           TEXT NOT NULL,
  description     TEXT,
  type            ticket_type NOT NULL DEFAULT 'general',
  status          ticket_status NOT NULL DEFAULT 'backlog',
  priority        ticket_priority NOT NULL DEFAULT 'medium',

  -- PIPS-specific (only for tickets linked to a project step)
  pips_step       pips_step,

  -- Assignment
  assignee_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reporter_id     UUID NOT NULL REFERENCES profiles(id),
  team_id         UUID REFERENCES teams(id) ON DELETE SET NULL,

  -- Dates
  due_date        DATE,
  started_at      TIMESTAMPTZ,
  resolved_at     TIMESTAMPTZ,

  -- Estimation (Phase 2-3)
  estimate_hours  NUMERIC(6,2),
  actual_hours    NUMERIC(6,2),
  story_points    INT,

  -- Metadata
  tags            TEXT[] DEFAULT '{}',
  custom_fields   JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- External integration references (Phase 4)
  external_id     TEXT,           -- Jira issue key, ADO work item ID, etc.
  external_url    TEXT,
  external_source integration_provider,

  -- Full-text search vector (auto-populated by trigger)
  search_vector   TSVECTOR,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE tickets IS 'Tickets — general-purpose and PIPS project tasks, bugs, features';
COMMENT ON COLUMN tickets.sequence_number IS 'Auto-incrementing per-org number for human-readable IDs (e.g., ACME-42)';
COMMENT ON COLUMN tickets.pips_step IS 'Links ticket to a specific PIPS step when part of a project';
COMMENT ON COLUMN tickets.external_id IS 'Phase 4: External system ID (Jira key, ADO work item ID, etc.)';

-- Sequence number generation (per org, thread-safe via SELECT FOR UPDATE)
CREATE OR REPLACE FUNCTION generate_ticket_sequence()
RETURNS TRIGGER AS $$
BEGIN
  NEW.sequence_number := (
    SELECT COALESCE(MAX(sequence_number), 0) + 1
    FROM tickets
    WHERE org_id = NEW.org_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ticket_sequence_trigger
  BEFORE INSERT ON tickets
  FOR EACH ROW EXECUTE FUNCTION generate_ticket_sequence();

-- Auto-update search vector on title/description changes
CREATE OR REPLACE FUNCTION tickets_search_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tickets_search_trigger
  BEFORE INSERT OR UPDATE OF title, description
  ON tickets FOR EACH ROW
  EXECUTE FUNCTION tickets_search_update();

CREATE TRIGGER tickets_updated_at
  BEFORE UPDATE ON tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Indexes
CREATE INDEX idx_tickets_org ON tickets(org_id);
CREATE INDEX idx_tickets_project ON tickets(project_id);
CREATE INDEX idx_tickets_parent ON tickets(parent_id);
CREATE INDEX idx_tickets_assignee ON tickets(assignee_id);
CREATE INDEX idx_tickets_status ON tickets(org_id, status);
CREATE INDEX idx_tickets_type ON tickets(org_id, type);
CREATE INDEX idx_tickets_search ON tickets USING GIN(search_vector);
CREATE INDEX idx_tickets_external ON tickets(external_source, external_id)
  WHERE external_id IS NOT NULL;
CREATE UNIQUE INDEX idx_tickets_org_sequence ON tickets(org_id, sequence_number);


-- ============================================================
-- TABLE: ticket_relations
-- Relationships between tickets (parent/child, blocks, etc.)
-- Schema only in MVP — no UI
-- ============================================================
CREATE TABLE ticket_relations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id       UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  target_id       UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  relation_type   TEXT NOT NULL CHECK (
    relation_type IN ('parent', 'child', 'blocks', 'blocked_by', 'relates_to', 'duplicates')
  ),
  created_by      UUID NOT NULL REFERENCES profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT no_self_relation CHECK (source_id != target_id),
  CONSTRAINT unique_relation UNIQUE (source_id, target_id, relation_type)
);

COMMENT ON TABLE ticket_relations IS 'Ticket-to-ticket relationships (Schema only in MVP — no UI)';

CREATE INDEX idx_ticket_relations_source ON ticket_relations(source_id);
CREATE INDEX idx_ticket_relations_target ON ticket_relations(target_id);


-- ============================================================
-- TABLE: ticket_transitions
-- Workflow status change history for tickets
-- Schema only in MVP — data accumulates for Phase 3 analytics
-- ============================================================
CREATE TABLE ticket_transitions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id     UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  from_status   ticket_status,
  to_status     ticket_status NOT NULL,
  changed_by    UUID NOT NULL REFERENCES profiles(id),
  reason        TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE ticket_transitions IS 'Ticket status change history (Schema only in MVP — Phase 3 analytics)';

CREATE INDEX idx_ticket_transitions_ticket ON ticket_transitions(ticket_id);


-- ============================================================
-- TABLE: comments
-- Polymorphic comments on tickets, projects, or project steps
-- ============================================================
CREATE TABLE comments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Polymorphic target (exactly one must be set)
  ticket_id     UUID REFERENCES tickets(id) ON DELETE CASCADE,
  project_id    UUID REFERENCES projects(id) ON DELETE CASCADE,
  step_id       UUID REFERENCES project_steps(id) ON DELETE CASCADE,

  -- Content
  author_id     UUID NOT NULL REFERENCES profiles(id),
  body          TEXT NOT NULL,
  body_html     TEXT,            -- Rendered markdown (Phase 2 rich text)
  edited_at     TIMESTAMPTZ,

  -- Threading
  parent_id     UUID REFERENCES comments(id) ON DELETE CASCADE,

  -- Mentions (extracted user IDs for notification dispatch)
  mentions      UUID[] DEFAULT '{}',

  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Exactly one of ticket_id, project_id, or step_id must be set
  CONSTRAINT exactly_one_target CHECK (
    (ticket_id IS NOT NULL)::int +
    (project_id IS NOT NULL)::int +
    (step_id IS NOT NULL)::int = 1
  )
);

COMMENT ON TABLE comments IS 'Polymorphic comments — can belong to a ticket, project, or project step';
COMMENT ON COLUMN comments.mentions IS 'Array of user UUIDs mentioned in the comment body (for notifications)';
COMMENT ON COLUMN comments.body_html IS 'Phase 2: rendered HTML from markdown body for rich text editing';

CREATE INDEX idx_comments_ticket ON comments(ticket_id) WHERE ticket_id IS NOT NULL;
CREATE INDEX idx_comments_project ON comments(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX idx_comments_step ON comments(step_id) WHERE step_id IS NOT NULL;
CREATE INDEX idx_comments_author ON comments(author_id);

CREATE TRIGGER comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- TABLE: file_attachments
-- File metadata — actual files stored in Supabase Storage
-- Schema only in MVP — no upload UI
-- ============================================================
CREATE TABLE file_attachments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Polymorphic target
  ticket_id       UUID REFERENCES tickets(id) ON DELETE CASCADE,
  project_id      UUID REFERENCES projects(id) ON DELETE CASCADE,
  comment_id      UUID REFERENCES comments(id) ON DELETE CASCADE,

  -- File metadata
  file_name       TEXT NOT NULL,
  file_size       BIGINT NOT NULL,         -- bytes
  mime_type       TEXT NOT NULL,
  storage_path    TEXT NOT NULL,            -- Supabase Storage path
  storage_bucket  TEXT NOT NULL DEFAULT 'attachments',

  uploaded_by     UUID NOT NULL REFERENCES profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE file_attachments IS 'File attachment metadata — actual files in Supabase Storage (Schema only in MVP)';

CREATE INDEX idx_attachments_ticket ON file_attachments(ticket_id) WHERE ticket_id IS NOT NULL;
CREATE INDEX idx_attachments_project ON file_attachments(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX idx_attachments_org ON file_attachments(org_id);


-- ============================================================
-- TABLE: notifications
-- User notifications for tickets, projects, mentions, etc.
-- ============================================================
CREATE TABLE notifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type          notification_type NOT NULL,
  title         TEXT NOT NULL,
  body          TEXT,
  entity_type   TEXT,              -- 'ticket', 'project', etc.
  entity_id     UUID,
  read_at       TIMESTAMPTZ,
  email_sent    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE notifications IS 'Per-user notifications — read status tracked, email dispatch tracked';

-- Optimized index for notification bell badge (unread count)
CREATE INDEX idx_notifications_user_unread
  ON notifications(user_id, created_at DESC)
  WHERE read_at IS NULL;
CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);


-- ============================================================
-- TABLE: audit_log
-- Immutable audit trail — populated by triggers, not application code
-- ============================================================
CREATE TABLE audit_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL,
  user_id       UUID,                   -- NULL for system actions
  action        TEXT NOT NULL,           -- 'insert', 'update', 'delete'
  entity_type   TEXT NOT NULL,           -- 'ticket', 'project', 'org_member', etc.
  entity_id     UUID NOT NULL,
  old_data      JSONB,                  -- Previous state (for updates/deletes)
  new_data      JSONB,                  -- New state (for inserts/updates)
  ip_address    INET,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE audit_log IS 'Immutable audit trail — written by triggers, readable by org admins only';
COMMENT ON COLUMN audit_log.org_id IS 'Not a foreign key — audit records must survive org deletion';

CREATE INDEX idx_audit_log_org ON audit_log(org_id, created_at DESC);
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_user ON audit_log(user_id, created_at DESC);


-- ============================================================
-- TABLE: integration_connections
-- Per-org external system configurations (Phase 4)
-- Schema only in MVP
-- ============================================================
CREATE TABLE integration_connections (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider        integration_provider NOT NULL,
  name            TEXT NOT NULL,           -- User-friendly name

  -- Connection config (encrypted at rest by Supabase)
  config          JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Sync configuration
  sync_direction  sync_direction NOT NULL DEFAULT 'bidirectional',
  sync_enabled    BOOLEAN NOT NULL DEFAULT TRUE,
  last_synced_at  TIMESTAMPTZ,
  sync_cursor     TEXT,                    -- Pagination cursor for incremental sync

  -- Status
  status          TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'error', 'disabled')),
  error_message   TEXT,

  created_by      UUID NOT NULL REFERENCES profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_provider_per_org UNIQUE (org_id, provider, name)
);

COMMENT ON TABLE integration_connections IS 'External integration configs — Jira, Azure DevOps, Aha! (Phase 4 — schema only)';

CREATE INDEX idx_integration_connections_org ON integration_connections(org_id);

CREATE TRIGGER integration_connections_updated_at
  BEFORE UPDATE ON integration_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- TABLE: org_api_keys
-- API keys for programmatic access (Phase 4)
-- Schema only in MVP
-- ============================================================
CREATE TABLE org_api_keys (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  -- Store only hash; return prefix (pips_xxxx...) on creation
  key_hash        TEXT NOT NULL,
  key_prefix      TEXT NOT NULL,           -- "pips_abc1" (first 8 chars for display)
  scopes          TEXT[] NOT NULL DEFAULT '{read}',
  expires_at      TIMESTAMPTZ,
  last_used_at    TIMESTAMPTZ,
  created_by      UUID NOT NULL REFERENCES profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at      TIMESTAMPTZ
);

COMMENT ON TABLE org_api_keys IS 'API keys for REST API access (Phase 4 — schema only)';

CREATE INDEX idx_api_keys_org ON org_api_keys(org_id);
CREATE INDEX idx_api_keys_prefix ON org_api_keys(key_prefix);


-- ============================================================
-- TABLE: webhook_subscriptions
-- Outbound webhook configurations per org (Phase 4)
-- Schema only in MVP
-- ============================================================
CREATE TABLE webhook_subscriptions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  url             TEXT NOT NULL,
  secret          TEXT NOT NULL,           -- HMAC signing secret
  events          TEXT[] NOT NULL,         -- ['ticket.created', 'ticket.updated', ...]
  active          BOOLEAN NOT NULL DEFAULT TRUE,
  created_by      UUID NOT NULL REFERENCES profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE webhook_subscriptions IS 'Outbound webhook subscriptions (Phase 4 — schema only)';

CREATE TRIGGER webhook_subscriptions_updated_at
  BEFORE UPDATE ON webhook_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- TABLE: webhook_deliveries
-- Outbound webhook delivery log (Phase 4)
-- Schema only in MVP
-- ============================================================
CREATE TABLE webhook_deliveries (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id   UUID NOT NULL REFERENCES webhook_subscriptions(id) ON DELETE CASCADE,
  event_type        TEXT NOT NULL,
  payload           JSONB NOT NULL,
  response_status   INT,
  response_body     TEXT,
  delivered_at      TIMESTAMPTZ,
  attempts          INT NOT NULL DEFAULT 0,
  next_retry_at     TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE webhook_deliveries IS 'Webhook delivery attempts and responses (Phase 4 — schema only)';

CREATE INDEX idx_webhook_deliveries_sub ON webhook_deliveries(subscription_id, created_at DESC);
CREATE INDEX idx_webhook_deliveries_retry
  ON webhook_deliveries(next_retry_at)
  WHERE response_status IS NULL OR response_status >= 400;


-- ============================================================
-- HELPER FUNCTIONS FOR RLS
-- ============================================================

-- Returns all org_ids the current authenticated user belongs to
CREATE OR REPLACE FUNCTION user_org_ids()
RETURNS SETOF UUID AS $$
  SELECT org_id FROM org_members WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION user_org_ids IS 'Returns org IDs for the authenticated user — foundation for all RLS policies';

-- Checks if the current user has one of the specified roles in an org
CREATE OR REPLACE FUNCTION user_has_org_role(
  _org_id UUID,
  _roles org_role[]
)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM org_members
    WHERE user_id = auth.uid()
      AND org_id = _org_id
      AND role = ANY(_roles)
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION user_has_org_role IS 'Checks if authenticated user has specified role(s) in an org';


-- ============================================================
-- AUDIT TRIGGER FUNCTION
-- Generic audit trigger that works on any table with org_id
-- ============================================================
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
  _org_id UUID;
  _user_id UUID;
  _action TEXT;
  _old_data JSONB;
  _new_data JSONB;
BEGIN
  -- Determine action
  _action := LOWER(TG_OP);

  -- Get org_id and build data based on operation type
  IF TG_OP = 'DELETE' THEN
    _org_id := OLD.org_id;
    _old_data := to_jsonb(OLD);
    _new_data := NULL;
    _user_id := auth.uid();
  ELSIF TG_OP = 'INSERT' THEN
    _org_id := NEW.org_id;
    _old_data := NULL;
    _new_data := to_jsonb(NEW);
    _user_id := auth.uid();
  ELSE -- UPDATE
    _org_id := NEW.org_id;
    _old_data := to_jsonb(OLD);
    _new_data := to_jsonb(NEW);
    _user_id := auth.uid();
  END IF;

  INSERT INTO audit_log (org_id, user_id, action, entity_type, entity_id, old_data, new_data)
  VALUES (_org_id, _user_id, _action, TG_TABLE_NAME, COALESCE(NEW.id, OLD.id), _old_data, _new_data);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION audit_trigger_func IS 'Generic audit trigger — logs all INSERT/UPDATE/DELETE to audit_log';


-- ============================================================
-- AUDIT TRIGGERS — Applied to key MVP tables
-- ============================================================
CREATE TRIGGER audit_organizations
  AFTER INSERT OR UPDATE OR DELETE ON organizations
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_org_members
  AFTER INSERT OR UPDATE OR DELETE ON org_members
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_tickets
  AFTER INSERT OR UPDATE OR DELETE ON tickets
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_projects
  AFTER INSERT OR UPDATE OR DELETE ON projects
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_comments
  AFTER INSERT OR UPDATE OR DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_teams
  AFTER INSERT OR UPDATE OR DELETE ON teams
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_project_steps
  AFTER INSERT OR UPDATE OR DELETE ON project_steps
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_project_forms
  AFTER INSERT OR UPDATE OR DELETE ON project_forms
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();


-- ============================================================
-- ROW-LEVEL SECURITY — ENABLE ON ALL TABLES
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_transitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- RLS POLICIES: profiles
-- ============================================================

CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  USING (true);
  -- All authenticated users can see profiles (needed for @mentions, team display, etc.)

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());


-- ============================================================
-- RLS POLICIES: organizations
-- ============================================================

CREATE POLICY "Users can view their organizations"
  ON organizations FOR SELECT
  USING (id IN (SELECT user_org_ids()));

CREATE POLICY "Authenticated users can create organizations"
  ON organizations FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Only owners/admins can update org"
  ON organizations FOR UPDATE
  USING (user_has_org_role(id, ARRAY['owner', 'admin']::org_role[]));


-- ============================================================
-- RLS POLICIES: org_members
-- ============================================================

CREATE POLICY "Org members can view other members"
  ON org_members FOR SELECT
  USING (org_id IN (SELECT user_org_ids()));

CREATE POLICY "Owner/admin can add members"
  ON org_members FOR INSERT
  WITH CHECK (
    user_has_org_role(org_id, ARRAY['owner', 'admin']::org_role[])
    OR (
      -- Allow users to add themselves as owner when creating a new org
      user_id = auth.uid()
      AND role = 'owner'
    )
  );

CREATE POLICY "Owner/admin can update member roles"
  ON org_members FOR UPDATE
  USING (user_has_org_role(org_id, ARRAY['owner', 'admin']::org_role[]));

CREATE POLICY "Owner/admin can remove members"
  ON org_members FOR DELETE
  USING (
    user_has_org_role(org_id, ARRAY['owner', 'admin']::org_role[])
    OR user_id = auth.uid()  -- Members can leave an org
  );


-- ============================================================
-- RLS POLICIES: org_invitations
-- ============================================================

CREATE POLICY "Org members can view invitations"
  ON org_invitations FOR SELECT
  USING (org_id IN (SELECT user_org_ids()));

CREATE POLICY "Owner/admin can create invitations"
  ON org_invitations FOR INSERT
  WITH CHECK (
    user_has_org_role(org_id, ARRAY['owner', 'admin']::org_role[])
    AND invited_by = auth.uid()
  );

CREATE POLICY "Owner/admin can update invitations"
  ON org_invitations FOR UPDATE
  USING (user_has_org_role(org_id, ARRAY['owner', 'admin']::org_role[]));

CREATE POLICY "Owner/admin can delete invitations"
  ON org_invitations FOR DELETE
  USING (user_has_org_role(org_id, ARRAY['owner', 'admin']::org_role[]));


-- ============================================================
-- RLS POLICIES: org_settings
-- ============================================================

CREATE POLICY "Org members can view settings"
  ON org_settings FOR SELECT
  USING (org_id IN (SELECT user_org_ids()));

CREATE POLICY "Owner/admin can update settings"
  ON org_settings FOR UPDATE
  USING (user_has_org_role(org_id, ARRAY['owner', 'admin']::org_role[]));

CREATE POLICY "Owner/admin can create settings"
  ON org_settings FOR INSERT
  WITH CHECK (user_has_org_role(org_id, ARRAY['owner', 'admin']::org_role[]));


-- ============================================================
-- RLS POLICIES: teams
-- ============================================================

CREATE POLICY "Org members can view teams"
  ON teams FOR SELECT
  USING (org_id IN (SELECT user_org_ids()));

CREATE POLICY "Manager+ can create teams"
  ON teams FOR INSERT
  WITH CHECK (
    org_id IN (SELECT user_org_ids())
    AND user_has_org_role(org_id, ARRAY['owner', 'admin', 'manager']::org_role[])
    AND created_by = auth.uid()
  );

CREATE POLICY "Manager+ can update teams"
  ON teams FOR UPDATE
  USING (user_has_org_role(org_id, ARRAY['owner', 'admin', 'manager']::org_role[]));

CREATE POLICY "Admin+ can delete teams"
  ON teams FOR DELETE
  USING (user_has_org_role(org_id, ARRAY['owner', 'admin']::org_role[]));


-- ============================================================
-- RLS POLICIES: team_members
-- ============================================================

CREATE POLICY "Org members can view team members"
  ON team_members FOR SELECT
  USING (
    team_id IN (
      SELECT t.id FROM teams t WHERE t.org_id IN (SELECT user_org_ids())
    )
  );

CREATE POLICY "Manager+ can add team members"
  ON team_members FOR INSERT
  WITH CHECK (
    team_id IN (
      SELECT t.id FROM teams t
      WHERE user_has_org_role(t.org_id, ARRAY['owner', 'admin', 'manager']::org_role[])
    )
  );

CREATE POLICY "Manager+ can update team members"
  ON team_members FOR UPDATE
  USING (
    team_id IN (
      SELECT t.id FROM teams t
      WHERE user_has_org_role(t.org_id, ARRAY['owner', 'admin', 'manager']::org_role[])
    )
  );

CREATE POLICY "Manager+ can remove team members"
  ON team_members FOR DELETE
  USING (
    team_id IN (
      SELECT t.id FROM teams t
      WHERE user_has_org_role(t.org_id, ARRAY['owner', 'admin', 'manager']::org_role[])
    )
    OR user_id = auth.uid()  -- Members can leave a team
  );


-- ============================================================
-- RLS POLICIES: projects
-- ============================================================

CREATE POLICY "Org members can view projects"
  ON projects FOR SELECT
  USING (org_id IN (SELECT user_org_ids()));

CREATE POLICY "Members can create projects"
  ON projects FOR INSERT
  WITH CHECK (
    org_id IN (SELECT user_org_ids())
    AND owner_id = auth.uid()
    AND user_has_org_role(org_id, ARRAY['owner', 'admin', 'manager', 'member']::org_role[])
  );

CREATE POLICY "Project owners and managers+ can update"
  ON projects FOR UPDATE
  USING (
    org_id IN (SELECT user_org_ids())
    AND (
      owner_id = auth.uid()
      OR user_has_org_role(org_id, ARRAY['owner', 'admin', 'manager']::org_role[])
    )
  );

CREATE POLICY "Admin+ can delete projects"
  ON projects FOR DELETE
  USING (user_has_org_role(org_id, ARRAY['owner', 'admin']::org_role[]));


-- ============================================================
-- RLS POLICIES: project_members
-- ============================================================

CREATE POLICY "Org members can view project members"
  ON project_members FOR SELECT
  USING (
    project_id IN (
      SELECT p.id FROM projects p WHERE p.org_id IN (SELECT user_org_ids())
    )
  );

CREATE POLICY "Project owner and manager+ can add project members"
  ON project_members FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT p.id FROM projects p
      WHERE p.org_id IN (SELECT user_org_ids())
        AND (
          p.owner_id = auth.uid()
          OR user_has_org_role(p.org_id, ARRAY['owner', 'admin', 'manager']::org_role[])
        )
    )
  );

CREATE POLICY "Project owner and manager+ can update project members"
  ON project_members FOR UPDATE
  USING (
    project_id IN (
      SELECT p.id FROM projects p
      WHERE p.owner_id = auth.uid()
        OR user_has_org_role(p.org_id, ARRAY['owner', 'admin', 'manager']::org_role[])
    )
  );

CREATE POLICY "Project owner and manager+ can remove project members"
  ON project_members FOR DELETE
  USING (
    project_id IN (
      SELECT p.id FROM projects p
      WHERE p.owner_id = auth.uid()
        OR user_has_org_role(p.org_id, ARRAY['owner', 'admin', 'manager']::org_role[])
    )
    OR user_id = auth.uid()  -- Members can leave a project
  );


-- ============================================================
-- RLS POLICIES: project_steps
-- ============================================================

CREATE POLICY "Org members can view project steps"
  ON project_steps FOR SELECT
  USING (
    project_id IN (
      SELECT p.id FROM projects p WHERE p.org_id IN (SELECT user_org_ids())
    )
  );

CREATE POLICY "Members+ can create project steps"
  ON project_steps FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT p.id FROM projects p
      WHERE p.org_id IN (SELECT user_org_ids())
        AND user_has_org_role(p.org_id, ARRAY['owner', 'admin', 'manager', 'member']::org_role[])
    )
  );

CREATE POLICY "Members+ can update project steps"
  ON project_steps FOR UPDATE
  USING (
    project_id IN (
      SELECT p.id FROM projects p
      WHERE p.org_id IN (SELECT user_org_ids())
        AND user_has_org_role(p.org_id, ARRAY['owner', 'admin', 'manager', 'member']::org_role[])
    )
  );


-- ============================================================
-- RLS POLICIES: project_forms
-- ============================================================

CREATE POLICY "Org members can view project forms"
  ON project_forms FOR SELECT
  USING (
    project_id IN (
      SELECT p.id FROM projects p WHERE p.org_id IN (SELECT user_org_ids())
    )
  );

CREATE POLICY "Members+ can create project forms"
  ON project_forms FOR INSERT
  WITH CHECK (
    created_by = auth.uid()
    AND project_id IN (
      SELECT p.id FROM projects p
      WHERE p.org_id IN (SELECT user_org_ids())
        AND user_has_org_role(p.org_id, ARRAY['owner', 'admin', 'manager', 'member']::org_role[])
    )
  );

CREATE POLICY "Form creator and manager+ can update forms"
  ON project_forms FOR UPDATE
  USING (
    created_by = auth.uid()
    OR project_id IN (
      SELECT p.id FROM projects p
      WHERE user_has_org_role(p.org_id, ARRAY['owner', 'admin', 'manager']::org_role[])
    )
  );

CREATE POLICY "Admin+ can delete project forms"
  ON project_forms FOR DELETE
  USING (
    project_id IN (
      SELECT p.id FROM projects p
      WHERE user_has_org_role(p.org_id, ARRAY['owner', 'admin']::org_role[])
    )
  );


-- ============================================================
-- RLS POLICIES: tickets
-- ============================================================

CREATE POLICY "Org members can view tickets"
  ON tickets FOR SELECT
  USING (org_id IN (SELECT user_org_ids()));

CREATE POLICY "Members can create tickets"
  ON tickets FOR INSERT
  WITH CHECK (
    org_id IN (SELECT user_org_ids())
    AND reporter_id = auth.uid()
  );

CREATE POLICY "Members can update tickets (not viewers)"
  ON tickets FOR UPDATE
  USING (
    org_id IN (SELECT user_org_ids())
    AND user_has_org_role(org_id, ARRAY['owner', 'admin', 'manager', 'member']::org_role[])
  );

CREATE POLICY "Only admins+ can delete tickets"
  ON tickets FOR DELETE
  USING (
    user_has_org_role(org_id, ARRAY['owner', 'admin']::org_role[])
  );


-- ============================================================
-- RLS POLICIES: ticket_relations
-- ============================================================

CREATE POLICY "Org members can view ticket relations"
  ON ticket_relations FOR SELECT
  USING (
    source_id IN (
      SELECT t.id FROM tickets t WHERE t.org_id IN (SELECT user_org_ids())
    )
  );

CREATE POLICY "Members+ can create ticket relations"
  ON ticket_relations FOR INSERT
  WITH CHECK (
    created_by = auth.uid()
    AND source_id IN (
      SELECT t.id FROM tickets t
      WHERE t.org_id IN (SELECT user_org_ids())
        AND user_has_org_role(t.org_id, ARRAY['owner', 'admin', 'manager', 'member']::org_role[])
    )
  );

CREATE POLICY "Admin+ can delete ticket relations"
  ON ticket_relations FOR DELETE
  USING (
    source_id IN (
      SELECT t.id FROM tickets t
      WHERE user_has_org_role(t.org_id, ARRAY['owner', 'admin']::org_role[])
    )
  );


-- ============================================================
-- RLS POLICIES: ticket_transitions
-- ============================================================

CREATE POLICY "Org members can view ticket transitions"
  ON ticket_transitions FOR SELECT
  USING (
    ticket_id IN (
      SELECT t.id FROM tickets t WHERE t.org_id IN (SELECT user_org_ids())
    )
  );

CREATE POLICY "Members+ can create ticket transitions"
  ON ticket_transitions FOR INSERT
  WITH CHECK (
    changed_by = auth.uid()
    AND ticket_id IN (
      SELECT t.id FROM tickets t
      WHERE t.org_id IN (SELECT user_org_ids())
        AND user_has_org_role(t.org_id, ARRAY['owner', 'admin', 'manager', 'member']::org_role[])
    )
  );


-- ============================================================
-- RLS POLICIES: comments
-- ============================================================

CREATE POLICY "Org members can view comments"
  ON comments FOR SELECT
  USING (org_id IN (SELECT user_org_ids()));

CREATE POLICY "Authenticated users can create comments in their org"
  ON comments FOR INSERT
  WITH CHECK (
    org_id IN (SELECT user_org_ids())
    AND author_id = auth.uid()
  );

CREATE POLICY "Authors can update their own comments"
  ON comments FOR UPDATE
  USING (author_id = auth.uid());

CREATE POLICY "Authors and admins can delete comments"
  ON comments FOR DELETE
  USING (
    author_id = auth.uid()
    OR user_has_org_role(org_id, ARRAY['owner', 'admin']::org_role[])
  );


-- ============================================================
-- RLS POLICIES: file_attachments
-- ============================================================

CREATE POLICY "Org members can view attachments"
  ON file_attachments FOR SELECT
  USING (org_id IN (SELECT user_org_ids()));

CREATE POLICY "Members+ can upload attachments"
  ON file_attachments FOR INSERT
  WITH CHECK (
    org_id IN (SELECT user_org_ids())
    AND uploaded_by = auth.uid()
    AND user_has_org_role(org_id, ARRAY['owner', 'admin', 'manager', 'member']::org_role[])
  );

CREATE POLICY "Admin+ can delete attachments"
  ON file_attachments FOR DELETE
  USING (
    uploaded_by = auth.uid()
    OR user_has_org_role(org_id, ARRAY['owner', 'admin']::org_role[])
  );


-- ============================================================
-- RLS POLICIES: notifications
-- ============================================================

CREATE POLICY "Users can only view their own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);
  -- Notifications are created by triggers and server-side logic

CREATE POLICY "Users can update their own notifications (mark read)"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own notifications"
  ON notifications FOR DELETE
  USING (user_id = auth.uid());


-- ============================================================
-- RLS POLICIES: audit_log
-- ============================================================

CREATE POLICY "Only admins can read audit log"
  ON audit_log FOR SELECT
  USING (user_has_org_role(org_id, ARRAY['owner', 'admin']::org_role[]));

-- No INSERT/UPDATE/DELETE policies — only triggers write to audit_log


-- ============================================================
-- RLS POLICIES: integration_connections (Phase 4)
-- ============================================================

CREATE POLICY "Org members can view integrations"
  ON integration_connections FOR SELECT
  USING (org_id IN (SELECT user_org_ids()));

CREATE POLICY "Admin+ can manage integrations"
  ON integration_connections FOR INSERT
  WITH CHECK (
    user_has_org_role(org_id, ARRAY['owner', 'admin', 'manager']::org_role[])
    AND created_by = auth.uid()
  );

CREATE POLICY "Admin+ can update integrations"
  ON integration_connections FOR UPDATE
  USING (user_has_org_role(org_id, ARRAY['owner', 'admin', 'manager']::org_role[]));

CREATE POLICY "Admin+ can delete integrations"
  ON integration_connections FOR DELETE
  USING (user_has_org_role(org_id, ARRAY['owner', 'admin']::org_role[]));


-- ============================================================
-- RLS POLICIES: org_api_keys (Phase 4)
-- ============================================================

CREATE POLICY "Admin+ can view API keys"
  ON org_api_keys FOR SELECT
  USING (user_has_org_role(org_id, ARRAY['owner', 'admin']::org_role[]));

CREATE POLICY "Admin+ can create API keys"
  ON org_api_keys FOR INSERT
  WITH CHECK (
    user_has_org_role(org_id, ARRAY['owner', 'admin']::org_role[])
    AND created_by = auth.uid()
  );

CREATE POLICY "Admin+ can revoke API keys"
  ON org_api_keys FOR UPDATE
  USING (user_has_org_role(org_id, ARRAY['owner', 'admin']::org_role[]));

CREATE POLICY "Admin+ can delete API keys"
  ON org_api_keys FOR DELETE
  USING (user_has_org_role(org_id, ARRAY['owner', 'admin']::org_role[]));


-- ============================================================
-- RLS POLICIES: webhook_subscriptions (Phase 4)
-- ============================================================

CREATE POLICY "Admin+ can view webhooks"
  ON webhook_subscriptions FOR SELECT
  USING (org_id IN (SELECT user_org_ids()));

CREATE POLICY "Admin+ can create webhooks"
  ON webhook_subscriptions FOR INSERT
  WITH CHECK (
    user_has_org_role(org_id, ARRAY['owner', 'admin']::org_role[])
    AND created_by = auth.uid()
  );

CREATE POLICY "Admin+ can update webhooks"
  ON webhook_subscriptions FOR UPDATE
  USING (user_has_org_role(org_id, ARRAY['owner', 'admin']::org_role[]));

CREATE POLICY "Admin+ can delete webhooks"
  ON webhook_subscriptions FOR DELETE
  USING (user_has_org_role(org_id, ARRAY['owner', 'admin']::org_role[]));


-- ============================================================
-- RLS POLICIES: webhook_deliveries (Phase 4)
-- ============================================================

CREATE POLICY "Admin+ can view webhook deliveries"
  ON webhook_deliveries FOR SELECT
  USING (
    subscription_id IN (
      SELECT ws.id FROM webhook_subscriptions ws
      WHERE ws.org_id IN (SELECT user_org_ids())
    )
  );
