# PIPS 2.0 — Skills & Initiatives Layer: Architecture & Implementation Plan

**Created:** 2026-03-14
**Author:** Architecture Planning Agent (Atlas)
**Status:** DRAFT — not yet implemented
**Branch:** feature/skills-initiatives (to be created)

---

## 1. Executive Summary

This plan covers two related features:

1. **Initiatives Layer** — A grouping level above PIPS projects (analogous to epics). An Initiative is a broad organizational goal (e.g., "Reduce manufacturing defects by 30%") that contains multiple PIPS projects tackling specific aspects of that goal. The Initiative dashboard aggregates progress from all child projects.

2. **Claude Code Skills per PIPS Step** — Markdown-based Claude Code skill files (one per PIPS step, plus form-specific skills) stored in `.claude/skills/`. Each skill file gives an agent the context, tools, expected inputs/outputs, and structured prompts needed to guide a user through that step of the PIPS methodology.

These two features are additive — neither modifies existing tables or components. They integrate at well-defined seams.

---

## 2. Patterns & Conventions Found

| Pattern               | Location                                          | Notes                                                               |
| --------------------- | ------------------------------------------------- | ------------------------------------------------------------------- |
| RLS helper functions  | `initial_schema.sql:885`                          | `user_org_ids()` + `user_has_org_role()` SECURITY DEFINER           |
| Audit trigger         | `initial_schema.sql:913`                          | Generic `audit_trigger_func()` — applies to any table with `org_id` |
| Permission record     | `packages/shared/src/permissions.ts:10`           | Add new permissions to `PERMISSIONS` constant                       |
| Server action pattern | `apps/web/src/app/(app)/projects/new/actions.ts`  | `'use server'`, `requirePermission`, typed return, `revalidatePath` |
| Migration timestamps  | `supabase/migrations/`                            | `YYYYMMDDHHMMSS` — latest is `20260314120000`                       |
| Nav items             | `apps/web/src/components/layout/app-shell.tsx:29` | Hardcoded array — add Initiatives entry                             |
| Page pattern          | `apps/web/src/app/(app)/projects/page.tsx`        | Server Component, auth guard, Supabase query, render                |
| Reports aggregation   | `apps/web/src/app/(app)/reports/actions.ts`       | Multi-step data fetch with `Promise.all`, map/reduce                |
| Step content          | `packages/shared/src/step-content.ts:36`          | `STEP_CONTENT` record — authoritative source for step metadata      |
| Form schemas          | `apps/web/src/lib/form-schemas.ts`                | `FORM_SCHEMAS` map — covers all 24 form types                       |

---

## 3. Feature 1: Initiatives Layer

### 3.1 Data Model

#### Table: `initiatives`

```sql
CREATE TABLE initiatives (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  status          TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('draft', 'active', 'on_hold', 'completed', 'archived')),
  owner_id        UUID NOT NULL REFERENCES profiles(id),
  objective       TEXT,                    -- "What success looks like"
  target_metric   TEXT,                    -- e.g., "Reduce defects by 30%"
  baseline_value  TEXT,                    -- Starting measurement
  target_value    TEXT,                    -- Goal measurement
  current_value   TEXT,                    -- Latest measurement
  target_start    DATE,
  target_end      DATE,
  actual_start    DATE,
  actual_end      DATE,
  tags            TEXT[] DEFAULT '{}',
  color           TEXT DEFAULT '#4F46E5',
  metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at     TIMESTAMPTZ
);
```

#### Table: `initiative_projects`

```sql
CREATE TABLE initiative_projects (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initiative_id   UUID NOT NULL REFERENCES initiatives(id) ON DELETE CASCADE,
  project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  added_by        UUID NOT NULL REFERENCES profiles(id),
  added_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes           TEXT,
  CONSTRAINT unique_initiative_project UNIQUE (initiative_id, project_id),
  CONSTRAINT unique_project_parent UNIQUE (project_id)  -- one project, one initiative
);
```

#### RLS Policies

Follow established 4-policy pattern: SELECT for org members, INSERT for manager+, UPDATE for owner + manager+, DELETE for admin+. Join table inherits visibility from initiatives RLS.

### 3.2 Permission Additions

```typescript
'initiative.create': ['owner', 'admin', 'manager'],
'initiative.update': ['owner', 'admin', 'manager'],
'initiative.delete': ['owner', 'admin'],
```

### 3.3 Zod Schemas

New file: `apps/web/src/lib/initiative-schemas.ts`

- `createInitiativeSchema` — title (3-200 chars), description, objective, target_metric, dates, color, tags
- `updateInitiativeSchema` — partial of create + status, current_value, actual dates
- `addProjectToInitiativeSchema` — initiative_id, project_id, notes

### 3.4 Server Actions

**`apps/web/src/app/(app)/initiatives/actions.ts`:**

- `getInitiatives()` — List with project counts
- `updateInitiative(id, data)` — Update fields
- `archiveInitiative(id)` — Soft delete
- `addProjectToInitiative(initiativeId, projectId, notes?)`
- `removeProjectFromInitiative(initiativeId, projectId)`

**`apps/web/src/app/(app)/initiatives/new/actions.ts`:**

- `createInitiative(_prev, formData)` — Full create flow with Zod validation

**`apps/web/src/app/(app)/initiatives/[initiativeId]/actions.ts`:**

- `getInitiativeDetail(initiativeId)` — Initiative + child projects
- `getInitiativeProgress(initiativeId)` — Aggregated metrics

### 3.5 UI Routes & Components

```
apps/web/src/app/(app)/initiatives/
├── page.tsx                          -- List view
├── new/page.tsx                      -- Create form
├── [initiativeId]/
│   ├── page.tsx                      -- Detail / dashboard
│   ├── edit/page.tsx                 -- Edit form
│   └── error.tsx                     -- Error boundary

apps/web/src/components/initiatives/
├── initiative-card.tsx
├── initiative-list-table.tsx
├── initiative-progress-bar.tsx
├── initiative-step-distribution.tsx
├── initiative-project-list.tsx
├── add-project-to-initiative.tsx
├── create-initiative-form.tsx
├── edit-initiative-form.tsx
└── __tests__/
```

**Navigation:** Add `{ label: 'Initiatives', href: '/initiatives', icon: Target }` to `NAV_ITEMS` after Projects.

---

## 4. Feature 2: Claude Code Skills per PIPS Step

### 4.1 Skill File Structure

```
.claude/skills/
├── pips-identify.md          -- Step 1
├── pips-analyze.md           -- Step 2
├── pips-generate.md          -- Step 3
├── pips-select.md            -- Step 4
├── pips-implement.md         -- Step 5
├── pips-evaluate.md          -- Step 6
├── forms/
│   ├── problem-statement.md
│   ├── fishbone.md
│   ├── five-why.md
│   ├── force-field.md
│   ├── brainstorming.md
│   ├── brainwriting.md
│   ├── criteria-matrix.md
│   ├── raci.md
│   ├── implementation-plan.md
│   ├── milestone-tracker.md
│   └── before-after.md
└── README.md
```

### 4.2 Skill Output → App Data Flow

```
User runs /pips-identify
  → Claude loads .claude/skills/pips-identify.md
  → Agent conducts guided interview
  → Agent synthesizes JSON matching problemStatementSchema
  → Agent calls saveFormData(projectId, 1, 'problem_statement', json)
  → Data stored in project_forms
  → UI auto-refreshes via revalidatePath
  → Agent suggests: "Ready for /pips-analyze"
```

### 4.3 Step Skill Specifications

**`/pips-identify`** — Guide through problem identification. Produces `problemStatementSchema` + `impactAssessmentSchema` JSON. Asks for As-Is, Desired, Gap, impacts, team members, data sources.

**`/pips-analyze`** — Root cause analysis. Consumes problem statement from Step 1. Guides through 6M fishbone categories, then 5-Why drill-down. Produces `fishboneSchema` + `fiveWhySchema` JSON.

**`/pips-generate`** — Solution brainstorming. Consumes root causes from Step 2. Facilitates brainwriting rounds, clustering, dot voting. Produces `brainstormingSchema` JSON.

**`/pips-select`** — Solution evaluation. Consumes solutions from Step 3. Guides through weighted criteria matrix, RACI chart, implementation plan. Produces `criteriaMatrixSchema` + `raciSchema` + `implementationPlanSchema` JSON.

**`/pips-implement`** — Implementation tracking. Consumes plan from Step 4. Weekly check-ins on milestones, status updates, blocker surfacing. Produces `milestoneTrackerSchema` + `implementationChecklistSchema` JSON.

**`/pips-evaluate`** — Results measurement. Consumes Step 1 targets + Step 5 results. Before/after comparison, retrospective, lessons learned, next-path decision. Produces `beforeAfterSchema` + `evaluationSchema` + `lessonsLearnedSchema` JSON.

---

## 5. Phased Implementation

### Phase 1 — Database & Permissions (1 day)

- Write migration `20260315000000_initiatives.sql`
- Add 3 permissions to `packages/shared/src/permissions.ts`
- Write `apps/web/src/lib/initiative-schemas.ts`
- Apply migration to Supabase

### Phase 2 — Server Actions (1 day)

- Write all initiative CRUD server actions
- Test permission paths

### Phase 3 — UI Components (2 days)

- Build all initiative components + unit tests
- Follow existing card/list/form patterns

### Phase 4 — Pages & Navigation (1 day)

- Wire up routes
- Add nav item to sidebar
- Full build verification

### Phase 5 — Claude Code Skills (1-2 days)

- Create `.claude/skills/` directory
- Write 6 step skills + 11 form skills
- Manual testing of skill invocation

### Phase 6 — E2E Tests & Polish (1 day)

- Playwright E2E test for initiative CRUD
- Full test suite pass
- Create PR to main

---

## 6. Architecture Decisions

**Initiatives as separate table (not a flag on projects):** Initiatives have distinct fields (target_metric, baseline_value, etc.) that don't belong on projects. The join table preserves flexibility.

**One project, one initiative (one-to-many):** Hierarchy is Organization > Initiative > Project > Ticket > Sub-Ticket. A UNIQUE constraint on `project_id` in `initiative_projects` enforces that each project belongs to at most one initiative, while an initiative can have many projects.

**Skills as Markdown in `.claude/skills/`:** Claude Code convention. No code changes needed — skills are documentation that Claude reads at invocation time. Output schemas map directly to existing Zod schemas.

**Soft delete via `archived_at`:** Consistent with established codebase pattern.

**Migration additive only:** No modifications to existing tables. Safe to run in production without downtime.

---

## 7. Decisions (Answered by Marc, 2026-03-14)

1. **Ownership:** Decide project-by-project. Single owner for now, team ownership can be added later.
2. **Weighted progress:** Yes — weight initiative progress by project priority.
3. **One project, one initiative:** A project can only belong to one initiative. UNIQUE constraint on `project_id`. Hierarchy: Org > Initiative > Project > Ticket > Sub-Ticket.
4. **Skills require app access:** Skills always target the PIPS app directly. No standalone mode needed.
5. **No dedicated API route for MVP:** Skills use `saveFormData()` server action. External API route is future work if needed.
