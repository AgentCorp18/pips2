-- ============================================================
-- BETA SCENARIO PART 2: Project Steps (all 5 projects)
-- ============================================================
-- Run after part 1 (org, users, teams, projects).
-- ============================================================

BEGIN;

-- ============================================================
-- PROJECT 1: Reduce First Response Time (COMPLETED — all 6 steps done)
-- ============================================================
INSERT INTO project_steps (id, project_id, step, status, data, notes, started_at, completed_at, completed_by, created_at) VALUES
  ('a1010000-0000-4000-8000-000000000001', 'f0010000-0000-4000-8000-000000000001', 'identify',     'completed', '{}'::jsonb, 'Team aligned on problem statement in first session. Data pulled from Zendesk confirmed 4.2hr avg.', '2026-02-03 10:00:00+00', '2026-02-04 16:00:00+00', 'c0010000-0000-4000-8000-000000000002', '2026-02-03 10:00:00+00'),
  ('a1010000-0000-4000-8000-000000000002', 'f0010000-0000-4000-8000-000000000001', 'analyze',      'completed', '{}'::jsonb, 'Fishbone + 5-Why sessions revealed scheduling gaps and manual triage as top root causes.', '2026-02-05 10:00:00+00', '2026-02-07 16:00:00+00', 'c0010000-0000-4000-8000-000000000002', '2026-02-05 10:00:00+00'),
  ('a1010000-0000-4000-8000-000000000003', 'f0010000-0000-4000-8000-000000000001', 'generate',     'completed', '{}'::jsonb, 'Generated 34 ideas in brainstorming. Brainwriting added 12 more. Strong team energy.', '2026-02-10 10:00:00+00', '2026-02-11 16:00:00+00', 'c0010000-0000-4000-8000-000000000002', '2026-02-10 10:00:00+00'),
  ('a1010000-0000-4000-8000-000000000004', 'f0010000-0000-4000-8000-000000000001', 'select_plan',  'completed', '{}'::jsonb, 'Criteria matrix narrowed to 3 solutions. Staggered shifts + priority queue won. RACI and impl plan created.', '2026-02-12 10:00:00+00', '2026-02-14 16:00:00+00', 'c0010000-0000-4000-8000-000000000002', '2026-02-12 10:00:00+00'),
  ('a1010000-0000-4000-8000-000000000005', 'f0010000-0000-4000-8000-000000000001', 'implement',    'completed', '{}'::jsonb, 'Rolled out staggered shifts on 2/17, priority queue on 2/24. Hit all 4 milestones on schedule.', '2026-02-17 09:00:00+00', '2026-03-03 16:00:00+00', 'c0010000-0000-4000-8000-000000000002', '2026-02-17 09:00:00+00'),
  ('a1010000-0000-4000-8000-000000000006', 'f0010000-0000-4000-8000-000000000001', 'evaluate',     'completed', '{}'::jsonb, 'Response time dropped from 4.2hrs to 1.8hrs. CSAT improved to 3.9. Not yet at 1hr target but significant progress.', '2026-03-03 10:00:00+00', '2026-03-05 16:00:00+00', 'c0010000-0000-4000-8000-000000000002', '2026-03-03 10:00:00+00');

-- ============================================================
-- PROJECT 2: Auto-Triage System (at step 5 — implementing)
-- ============================================================
INSERT INTO project_steps (id, project_id, step, status, data, notes, started_at, completed_at, completed_by, created_at) VALUES
  ('a1020000-0000-4000-8000-000000000001', 'f0010000-0000-4000-8000-000000000002', 'identify',     'completed', '{}'::jsonb, 'Problem scoped to manual triage overhead. 18 min avg per ticket, 32% misroute rate documented.', '2026-02-10 10:00:00+00', '2026-02-11 15:00:00+00', 'c0010000-0000-4000-8000-000000000004', '2026-02-10 10:00:00+00'),
  ('a1020000-0000-4000-8000-000000000002', 'f0010000-0000-4000-8000-000000000002', 'analyze',      'completed', '{}'::jsonb, 'Root causes: no ticket categorization taxonomy, agents guess routing, no historical pattern matching.', '2026-02-12 10:00:00+00', '2026-02-14 15:00:00+00', 'c0010000-0000-4000-8000-000000000004', '2026-02-12 10:00:00+00'),
  ('a1020000-0000-4000-8000-000000000003', 'f0010000-0000-4000-8000-000000000002', 'generate',     'completed', '{}'::jsonb, 'Ideas ranged from simple keyword routing to full NLP. Also considered outsourcing triage to a dedicated team.', '2026-02-17 10:00:00+00', '2026-02-18 15:00:00+00', 'c0010000-0000-4000-8000-000000000004', '2026-02-17 10:00:00+00'),
  ('a1020000-0000-4000-8000-000000000004', 'f0010000-0000-4000-8000-000000000002', 'select_plan',  'completed', '{}'::jsonb, 'Selected: rule-based classifier with ML fallback. Lower risk than pure ML, faster to ship. 3-phase rollout.', '2026-02-19 10:00:00+00', '2026-02-21 15:00:00+00', 'c0010000-0000-4000-8000-000000000004', '2026-02-19 10:00:00+00'),
  ('a1020000-0000-4000-8000-000000000005', 'f0010000-0000-4000-8000-000000000002', 'implement',    'in_progress', '{}'::jsonb, 'Phase 1 (rule-based) deployed to staging. Phase 2 (ML model) training in progress. Targeting 3/10 for production.', '2026-02-24 09:00:00+00', NULL, NULL, '2026-02-24 09:00:00+00'),
  ('a1020000-0000-4000-8000-000000000006', 'f0010000-0000-4000-8000-000000000002', 'evaluate',     'not_started', '{}'::jsonb, NULL, NULL, NULL, NULL, '2026-02-10 10:00:00+00');

-- ============================================================
-- PROJECT 3: Real-Time Dashboard (at step 4 — selecting/planning)
-- ============================================================
INSERT INTO project_steps (id, project_id, step, status, data, notes, started_at, completed_at, completed_by, created_at) VALUES
  ('a1030000-0000-4000-8000-000000000001', 'f0010000-0000-4000-8000-000000000003', 'identify',     'completed', '{}'::jsonb, 'Validated with support managers: zero real-time visibility. All metrics are T+1 at best.', '2026-02-17 10:00:00+00', '2026-02-18 14:00:00+00', 'c0010000-0000-4000-8000-000000000006', '2026-02-17 10:00:00+00'),
  ('a1030000-0000-4000-8000-000000000002', 'f0010000-0000-4000-8000-000000000003', 'analyze',      'completed', '{}'::jsonb, 'Key issue: data pipeline runs nightly batch ETL. No streaming. Managers manually count queue in Zendesk.', '2026-02-19 10:00:00+00', '2026-02-21 14:00:00+00', 'c0010000-0000-4000-8000-000000000006', '2026-02-19 10:00:00+00'),
  ('a1030000-0000-4000-8000-000000000003', 'f0010000-0000-4000-8000-000000000003', 'generate',     'completed', '{}'::jsonb, 'Options include: Zendesk native dashboard, custom Grafana + streaming, Metabase + webhooks, Datadog.', '2026-02-24 10:00:00+00', '2026-02-25 14:00:00+00', 'c0010000-0000-4000-8000-000000000006', '2026-02-24 10:00:00+00'),
  ('a1030000-0000-4000-8000-000000000004', 'f0010000-0000-4000-8000-000000000003', 'select_plan',  'in_progress', '{}'::jsonb, 'Criteria matrix in progress. Leaning toward custom Grafana solution. Cost-benefit analysis pending.', '2026-02-26 10:00:00+00', NULL, NULL, '2026-02-26 10:00:00+00'),
  ('a1030000-0000-4000-8000-000000000005', 'f0010000-0000-4000-8000-000000000003', 'implement',    'not_started', '{}'::jsonb, NULL, NULL, NULL, NULL, '2026-02-17 10:00:00+00'),
  ('a1030000-0000-4000-8000-000000000006', 'f0010000-0000-4000-8000-000000000003', 'evaluate',     'not_started', '{}'::jsonb, NULL, NULL, NULL, NULL, '2026-02-17 10:00:00+00');

-- ============================================================
-- PROJECT 4: Knowledge Base Redesign (at step 3 — generating)
-- ============================================================
INSERT INTO project_steps (id, project_id, step, status, data, notes, started_at, completed_at, completed_by, created_at) VALUES
  ('a1040000-0000-4000-8000-000000000001', 'f0010000-0000-4000-8000-000000000004', 'identify',     'completed', '{}'::jsonb, 'Analyzed KB analytics: 12% self-service rate, 47% stale articles, 60% irrelevant search results.', '2026-02-24 10:00:00+00', '2026-02-25 15:00:00+00', 'c0010000-0000-4000-8000-000000000010', '2026-02-24 10:00:00+00'),
  ('a1040000-0000-4000-8000-000000000002', 'f0010000-0000-4000-8000-000000000004', 'analyze',      'completed', '{}'::jsonb, 'Root causes: poor taxonomy, no search relevance tuning, articles written for agents not customers, no feedback loop.', '2026-02-26 10:00:00+00', '2026-02-28 15:00:00+00', 'c0010000-0000-4000-8000-000000000010', '2026-02-26 10:00:00+00'),
  ('a1040000-0000-4000-8000-000000000003', 'f0010000-0000-4000-8000-000000000004', 'generate',     'in_progress', '{}'::jsonb, 'Brainstorming session produced 28 ideas. Exploring AI-powered search, article templates, community forums.', '2026-03-03 10:00:00+00', NULL, NULL, '2026-03-03 10:00:00+00'),
  ('a1040000-0000-4000-8000-000000000004', 'f0010000-0000-4000-8000-000000000004', 'select_plan',  'not_started', '{}'::jsonb, NULL, NULL, NULL, NULL, '2026-02-24 10:00:00+00'),
  ('a1040000-0000-4000-8000-000000000005', 'f0010000-0000-4000-8000-000000000004', 'implement',    'not_started', '{}'::jsonb, NULL, NULL, NULL, NULL, '2026-02-24 10:00:00+00'),
  ('a1040000-0000-4000-8000-000000000006', 'f0010000-0000-4000-8000-000000000004', 'evaluate',     'not_started', '{}'::jsonb, NULL, NULL, NULL, NULL, '2026-02-24 10:00:00+00');

-- ============================================================
-- PROJECT 5: Training & Certification (at step 2 — analyzing)
-- ============================================================
INSERT INTO project_steps (id, project_id, step, status, data, notes, started_at, completed_at, completed_by, created_at) VALUES
  ('a1050000-0000-4000-8000-000000000001', 'f0010000-0000-4000-8000-000000000005', 'identify',     'completed', '{}'::jsonb, 'Benchmarked: 12-week ramp is 3x industry avg. Agents report feeling "thrown in the deep end."', '2026-03-03 10:00:00+00', '2026-03-04 15:00:00+00', 'c0010000-0000-4000-8000-000000000007', '2026-03-03 10:00:00+00'),
  ('a1050000-0000-4000-8000-000000000002', 'f0010000-0000-4000-8000-000000000005', 'analyze',      'in_progress', '{}'::jsonb, 'Fishbone in progress. Initial findings point to no structured curriculum, no skill assessments, inconsistent mentoring.', '2026-03-05 10:00:00+00', NULL, NULL, '2026-03-05 10:00:00+00'),
  ('a1050000-0000-4000-8000-000000000003', 'f0010000-0000-4000-8000-000000000005', 'generate',     'not_started', '{}'::jsonb, NULL, NULL, NULL, NULL, '2026-03-03 10:00:00+00'),
  ('a1050000-0000-4000-8000-000000000004', 'f0010000-0000-4000-8000-000000000005', 'select_plan',  'not_started', '{}'::jsonb, NULL, NULL, NULL, NULL, '2026-03-03 10:00:00+00'),
  ('a1050000-0000-4000-8000-000000000005', 'f0010000-0000-4000-8000-000000000005', 'implement',    'not_started', '{}'::jsonb, NULL, NULL, NULL, NULL, '2026-03-03 10:00:00+00'),
  ('a1050000-0000-4000-8000-000000000006', 'f0010000-0000-4000-8000-000000000005', 'evaluate',     'not_started', '{}'::jsonb, NULL, NULL, NULL, NULL, '2026-03-03 10:00:00+00');

COMMIT;
