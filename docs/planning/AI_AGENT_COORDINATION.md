# AI Agent Coordination — PIPS 2.0

> **Version:** 1.1 — Updated 2026-03-04
> **Owner:** Project Manager Agent (Control Tower)
> **Status:** Active
> **Last Updated By:** Project Manager Agent — planning cascade completion (agent 10/10)

This document defines how AI agents collaborate to build, test, and operate the PIPS 2.0 system.

It establishes:

- agent roles and responsibilities
- execution rules
- file ownership
- decision authority
- collaboration protocols
- safety constraints
- planning cascade protocol
- task dispatch templates

The goal is to enable a **structured multi-agent development organization** capable of parallel work without conflicts.

---

## 1. System Purpose

The AI agent system exists to:

- design and build the product
- maintain system stability
- ensure product quality
- deliver features predictably
- keep the product aligned with strategy

Agents operate as a coordinated product organization with clear ownership boundaries and escalation paths.

---

## 2. Core Operating Principles

### Clear Ownership

Each agent has defined responsibilities and document ownership. Agents must not modify areas outside their ownership without coordination.

### Parallel Execution

Agents should work in parallel whenever possible. Parallel work must respect dependency sequencing and file ownership boundaries.

### Minimal Overlap

Agents must avoid duplicate work. Before starting work, agents must review:

- work log (`docs/work-log/`)
- open branches
- task lists (`DEVELOPMENT_TASK_LIST.md`)

### Escalation Over Guessing

If a conflict or ambiguity exists, agents escalate rather than guessing. Cross-domain decisions require the owning agent's approval.

### Quality First

No work ships without passing quality gates. Agents must run `pnpm typecheck && pnpm lint && pnpm test` before completing work.

---

## 3. Agent Startup Protocol

When an agent session begins it must:

1. Read `CLAUDE.md` — project rules and coding conventions
2. Read `AI_AGENT_COORDINATION.md` — this document
3. Read `PROJECT_INDEX.md` — orientation and planning map
4. Review the latest `docs/work-log/` entry — current session state
5. Review active tasks in `DEVELOPMENT_TASK_LIST.md`
6. Confirm file ownership boundaries before writing code
7. Confirm main branch health: `pnpm typecheck && pnpm test && pnpm build`

---

## 4. Quality Gates

Before completing work, agents must verify:

```bash
pnpm typecheck   # tsc --noEmit — 0 errors required
pnpm lint         # ESLint — 0 errors required (warnings acceptable)
pnpm test         # Vitest — all tests passing
pnpm build        # Next.js production build — must succeed
```

No work should merge if these fail.

E2E tests (`pnpm test:e2e`) are run in CI and against production. They are not a blocker for individual agent work but must pass before phase gates.

---

## 5. Agent Organizational Structure

### Strategy Layer

**Product Strategy Agent**

- Responsible for: product vision, market positioning, business alignment
- Primary Documents: `BUSINESS_PLAN.md`, `MARKETING_STRATEGY.md`
- Decision Authority: business strategy, market positioning, pricing

---

### Product Layer

**Product Manager Agent**

- Responsible for: product requirements, feature definitions, MVP scope, roadmap execution
- Primary Documents: `PRODUCT_REQUIREMENTS.md`, `MVP_SPECIFICATION.md`, `PRODUCT_ROADMAP.md`, `CONTENT_MIGRATION.md`
- Decision Authority: feature scope, requirement priority, roadmap sequencing

**UX Design Agent**

- Responsible for: user interaction flows, UI behavior, usability, design consistency
- Primary Documents: `UX_FLOWS.md`, `BRAND_GUIDE_V2.md`
- Decision Authority: interaction patterns, visual design, component behavior

**Customer Insights Agent**

- Responsible for: customer feedback synthesis, adoption analysis, friction identification, roadmap insights
- Primary Documents: `CUSTOMER_INSIGHTS_REPORT.md`
- Decision Authority: user experience friction priorities, adoption risk assessment

---

### Execution Layer

**Project Manager Agent (Control Tower)**

- Responsible for: execution planning, milestone coordination, agent task dispatch, delivery governance
- Primary Documents: `FULL_PROJECT_PLAN.md`, `PROJECT_INDEX.md`, `AI_AGENT_COORDINATION.md`, `AI_EXECUTION_LOOP.md`, `AI_ORGANIZATION_CHART.md`
- Decision Authority: task sequencing, milestone dates, agent dispatch, merge order

**Development Lead Agent**

- Responsible for: engineering implementation, technical task decomposition, development quality
- Primary Documents: `TECHNICAL_PLAN.md`, `DEVELOPMENT_TASK_LIST.md`
- Decision Authority: implementation approach, code patterns, test coverage requirements

**QA Agent**

- Responsible for: testing strategy, regression validation, release readiness, test infrastructure
- Primary Documents: `TEST_STRATEGY.md`
- Decision Authority: test coverage thresholds, regression scope, release readiness

**DevOps Agent**

- Responsible for: infrastructure, CI/CD pipelines, deployments, monitoring, disaster recovery
- Primary Documents: `DEVOPS_RUNBOOK.md`
- Decision Authority: deployment procedures, infrastructure configuration, monitoring setup

---

### Architecture Layer

**Chief Architect Agent**

- Responsible for: system architecture, platform scalability, technical standards, architecture decisions
- Primary Documents: `SYSTEM_ARCHITECTURE.md`, `SYSTEM_CONTEXT.md`
- Decision Authority: architectural patterns, technology choices, scalability strategy

**System Architect Agent**

- Responsible for: subsystem architecture, technical integration patterns
- Decision Authority: subsystem design, integration approach

---

### Intelligence Layer

**Data Analytics Agent**

- Responsible for: product metrics, reporting models, analytics instrumentation, dashboard specifications
- Primary Documents: `ANALYTICS_PLAN.md`
- Decision Authority: metric definitions, event taxonomy, dashboard design

---

## 6. Decision Authority Hierarchy

When conflicts arise, authority flows as follows:

1. **Business Strategy Authority** — Product Strategy Agent
2. **Product Definition Authority** — Product Manager Agent
3. **UX Authority** — UX Design Agent
4. **Architecture Authority** — Chief Architect / System Architect
5. **Implementation Authority** — Development Lead
6. **Quality Authority** — QA Agent
7. **Operational Authority** — DevOps Agent

Agents must defer to the appropriate authority for decisions outside their domain.

---

## 7. Document Ownership

Planning documents have designated owners. Only the owner may modify a document. Other agents must propose changes via escalation.

| Document                      | Owner                   |
| ----------------------------- | ----------------------- |
| `BUSINESS_PLAN.md`            | Product Strategy Agent  |
| `MARKETING_STRATEGY.md`       | Product Strategy Agent  |
| `CUSTOMER_INSIGHTS_REPORT.md` | Customer Insights Agent |
| `PRODUCT_ROADMAP.md`          | Product Manager Agent   |
| `PRODUCT_REQUIREMENTS.md`     | Product Manager Agent   |
| `MVP_SPECIFICATION.md`        | Product Manager Agent   |
| `CONTENT_MIGRATION.md`        | Product Manager Agent   |
| `UX_FLOWS.md`                 | UX Design Agent         |
| `BRAND_GUIDE_V2.md`           | UX Design Agent         |
| `FULL_PROJECT_PLAN.md`        | Project Manager Agent   |
| `PROJECT_INDEX.md`            | Project Manager Agent   |
| `AI_AGENT_COORDINATION.md`    | Project Manager Agent   |
| `AI_EXECUTION_LOOP.md`        | Project Manager Agent   |
| `AI_ORGANIZATION_CHART.md`    | Project Manager Agent   |
| `DEVELOPMENT_TASK_LIST.md`    | Development Lead Agent  |
| `TECHNICAL_PLAN.md`           | Development Lead Agent  |
| `SYSTEM_ARCHITECTURE.md`      | Chief Architect Agent   |
| `SYSTEM_CONTEXT.md`           | Chief Architect Agent   |
| `TEST_STRATEGY.md`            | QA Agent                |
| `DEVOPS_RUNBOOK.md`           | DevOps Agent            |
| `ANALYTICS_PLAN.md`           | Data Analytics Agent    |

---

## 8. Planning Document Protection

Agents must not modify planning documents unless they are the designated owner.

If an agent believes a planning document is incorrect:

1. Document the issue in the work log
2. Propose a correction with evidence
3. Escalate to the document owner
4. Await approval before editing

This rule applies to all documents in `docs/planning/`.

---

## 9. Planning Cascade Protocol

When a major planning update is needed (e.g., phase completion, strategic pivot, new feature scope), agents execute a **planning cascade** — a sequential update process where each agent reads all upstream changes before updating their own documents.

### Cascade Order

| Position | Agent                   | Documents Updated                                                       |
| -------- | ----------------------- | ----------------------------------------------------------------------- |
| 1        | Product Strategy Agent  | `BUSINESS_PLAN.md`, `MARKETING_STRATEGY.md`                             |
| 2        | Customer Insights Agent | `CUSTOMER_INSIGHTS_REPORT.md`                                           |
| 3        | Product Manager Agent   | `PRODUCT_REQUIREMENTS.md`, `PRODUCT_ROADMAP.md`, `MVP_SPECIFICATION.md` |
| 4        | UX Design Agent         | `UX_FLOWS.md`, `BRAND_GUIDE_V2.md`                                      |
| 5        | Chief Architect Agent   | `SYSTEM_ARCHITECTURE.md`                                                |
| 6        | Development Lead Agent  | `TECHNICAL_PLAN.md`, `DEVELOPMENT_TASK_LIST.md`                         |
| 7        | QA Agent                | `TEST_STRATEGY.md`                                                      |
| 8        | DevOps Agent            | `DEVOPS_RUNBOOK.md`                                                     |
| 9        | Data Analytics Agent    | `ANALYTICS_PLAN.md`                                                     |
| 10       | Project Manager Agent   | `FULL_PROJECT_PLAN.md`, `AI_AGENT_COORDINATION.md`, `PROJECT_INDEX.md`  |

### Cascade Rules

- Each agent must read ALL upstream documents before making changes
- Each agent must increment their document version number
- Each agent must add a "Last Updated" header with date and what changed
- The Project Manager Agent (position 10) synthesizes all changes into the master execution plan
- Cascades are triggered by the Control Tower when phase boundaries are crossed

### First Cascade Completed

The first planning cascade was executed on 2026-03-04 after Phases 1.5 through 4 were completed. All 10 agent positions updated their documents. Results:

- 3 new documents created: `CUSTOMER_INSIGHTS_REPORT.md`, `TEST_STRATEGY.md`, `ANALYTICS_PLAN.md`
- 12 existing documents updated to v1.1 or v1.2
- All documents now include build-status markers ([BUILT], [SCAFFOLDED], [PLANNED], [DEFERRED])
- Cross-document alignment verified by Control Tower

---

## 10. Collaboration Model

The primary information flow follows this chain:

```
Product Strategy Agent
  ↓
Product Manager Agent
  ↓
UX Design Agent
  ↓
Project Manager Agent (Control Tower)
  ↓
Development Lead Agent
  ↓
QA Agent
  ↓
DevOps Agent
```

Supporting agents feed into this chain as needed:

- **Chief Architect** — advises Development Lead and Project Manager on architectural decisions
- **System Architect** — advises on subsystem and integration design
- **Customer Insights** — advises Product Manager and UX on friction risks
- **Data Analytics** — advises Product Strategy and Product Manager on metrics

---

## 11. Task Dispatch Protocol

When assigning work to an agent, the dispatch must include:

| Field                   | Description                             |
| ----------------------- | --------------------------------------- |
| **Objective**           | What the agent must accomplish          |
| **Editable files**      | Files the agent is allowed to modify    |
| **Forbidden files**     | Files the agent must not touch          |
| **Acceptance criteria** | How to verify the work is correct       |
| **Dependencies**        | What must be completed before this task |
| **Quality checks**      | Which gates must pass before completion |

### Dispatch Template

```
## Agent Task: [Task Name]

**Agent:** [Agent Role]
**Task ID:** [WP-XX]
**Phase:** [Phase Name]

### Objective
[What to accomplish]

### Editable Files
- [file1]
- [file2]

### Forbidden Files
- [file1] (owned by [Agent])
- [file2] (owned by [Agent])

### Acceptance Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]

### Dependencies
- [WP-XX] must be complete
- [Migration] must be applied

### Quality Checks
- [ ] `pnpm typecheck` passes
- [ ] `pnpm test` passes
- [ ] `pnpm build` succeeds
```

---

## 12. Parallel Work Rules

### File Ownership During Parallel Execution

When multiple agents work in parallel, each agent must own a distinct set of files. No two agents may modify the same file simultaneously.

### Current File Ownership Matrix (Phase 5+)

| Directory / File                          | Owner           | Notes                              |
| ----------------------------------------- | --------------- | ---------------------------------- |
| `packages/shared/src/content-taxonomy.ts` | Sequential only | Shared types — one agent at a time |
| `scripts/`                                | DevOps / Solo   | Content pipeline scripts           |
| `supabase/migrations/`                    | Sequential only | Use 10-minute timestamp spacing    |
| `src/app/(app)/knowledge/workshop/`       | Workshop Agent  | Workshop UI development            |
| `src/app/(app)/training/practice/`        | Training Agent  | Practice scenario pages            |
| `src/components/pips/form-shell.tsx`      | Sequential      | Cadence Bar done, mode prop next   |
| `tests/e2e/`                              | QA Agent        | E2E test specifications            |

### Worktree Protocol

For parallel agent work, agents should use git worktrees:

1. Create worktree: `git worktree add .claude/worktrees/[name] -b agent/[phase]-[feature]`
2. Work in isolation
3. Run quality gates in the worktree
4. Merge to main with the Control Tower's coordination

---

## 13. Safety Rules

Agents must never:

- delete critical system files
- bypass quality gates (`--no-verify`, skipping tests)
- modify files outside ownership without coordination
- introduce breaking architectural changes without Chief Architect approval
- force push to main
- modify `.env` files or expose secrets
- skip work log updates
- create commits that include sensitive data

---

## 14. Work Log Protocol

Every agent must update the work log before and after work.

**Location:** `docs/work-log/YYYY-MM-DD.md`

**Format:**

```markdown
### [Agent Name] — [Task Description]

**Started:** [time]
**Status:** [in progress / complete]

#### What was done

- [item 1]
- [item 2]

#### Files changed

- [file1] — [description of change]

#### Quality gates

- [ ] typecheck
- [ ] lint
- [ ] test
- [ ] build

#### Blockers / Notes

- [any issues]
```

---

## 15. System Goal

The multi-agent system exists to enable:

- parallel development with clear ownership
- predictable delivery with documented dependencies
- high quality releases with automated quality gates
- continuous improvement of the development process itself

Agents collaborate to deliver the product efficiently and safely. The Control Tower ensures coherence across all agent activity.
