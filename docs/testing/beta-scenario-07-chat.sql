-- ============================================================
-- BETA SCENARIO PART 7: Chat Channels & Messages
-- ============================================================

BEGIN;

-- ============================================================
-- CHAT CHANNELS
-- ============================================================

-- Org-wide general channel
INSERT INTO chat_channels (id, org_id, type, name, created_by, created_at) VALUES
  ('dd010000-0000-4000-8000-000000000001', 'b0010000-0000-4000-8000-000000000001', 'org', 'General', 'c0010000-0000-4000-8000-000000000001', '2026-02-01 10:00:00+00');

-- Team channels
INSERT INTO chat_channels (id, org_id, type, name, entity_id, created_by, created_at) VALUES
  ('dd010000-0000-4000-8000-000000000002', 'b0010000-0000-4000-8000-000000000001', 'team', 'Support Operations', 'd0010000-0000-4000-8000-000000000001', 'c0010000-0000-4000-8000-000000000001', '2026-02-01 10:00:00+00'),
  ('dd010000-0000-4000-8000-000000000003', 'b0010000-0000-4000-8000-000000000001', 'team', 'Engineering', 'd0010000-0000-4000-8000-000000000002', 'c0010000-0000-4000-8000-000000000001', '2026-02-01 10:05:00+00'),
  ('dd010000-0000-4000-8000-000000000004', 'b0010000-0000-4000-8000-000000000001', 'team', 'Analytics & Training', 'd0010000-0000-4000-8000-000000000003', 'c0010000-0000-4000-8000-000000000001', '2026-02-01 10:10:00+00');

-- Project channels
INSERT INTO chat_channels (id, org_id, type, name, entity_id, created_by, created_at) VALUES
  ('dd020000-0000-4000-8000-000000000001', 'b0010000-0000-4000-8000-000000000001', 'project', 'Proj: Response Time', 'f0010000-0000-4000-8000-000000000001', 'c0010000-0000-4000-8000-000000000002', '2026-02-03 09:00:00+00'),
  ('dd020000-0000-4000-8000-000000000002', 'b0010000-0000-4000-8000-000000000001', 'project', 'Proj: Auto-Triage', 'f0010000-0000-4000-8000-000000000002', 'c0010000-0000-4000-8000-000000000004', '2026-02-10 09:00:00+00'),
  ('dd020000-0000-4000-8000-000000000003', 'b0010000-0000-4000-8000-000000000001', 'project', 'Proj: Dashboard', 'f0010000-0000-4000-8000-000000000003', 'c0010000-0000-4000-8000-000000000006', '2026-02-17 09:00:00+00'),
  ('dd020000-0000-4000-8000-000000000004', 'b0010000-0000-4000-8000-000000000001', 'project', 'Proj: Knowledge Base', 'f0010000-0000-4000-8000-000000000004', 'c0010000-0000-4000-8000-000000000010', '2026-02-24 09:00:00+00'),
  ('dd020000-0000-4000-8000-000000000005', 'b0010000-0000-4000-8000-000000000001', 'project', 'Proj: Training Program', 'f0010000-0000-4000-8000-000000000005', 'c0010000-0000-4000-8000-000000000007', '2026-03-03 09:00:00+00');

-- ============================================================
-- CHANNEL MEMBERS
-- ============================================================

-- General: everyone
INSERT INTO chat_channel_members (channel_id, user_id, joined_at) VALUES
  ('dd010000-0000-4000-8000-000000000001', 'c0010000-0000-4000-8000-000000000001', '2026-02-01 10:00:00+00'),
  ('dd010000-0000-4000-8000-000000000001', 'c0010000-0000-4000-8000-000000000002', '2026-02-01 10:00:00+00'),
  ('dd010000-0000-4000-8000-000000000001', 'c0010000-0000-4000-8000-000000000003', '2026-02-01 10:00:00+00'),
  ('dd010000-0000-4000-8000-000000000001', 'c0010000-0000-4000-8000-000000000004', '2026-02-01 10:00:00+00'),
  ('dd010000-0000-4000-8000-000000000001', 'c0010000-0000-4000-8000-000000000005', '2026-02-01 10:00:00+00'),
  ('dd010000-0000-4000-8000-000000000001', 'c0010000-0000-4000-8000-000000000006', '2026-02-01 10:00:00+00'),
  ('dd010000-0000-4000-8000-000000000001', 'c0010000-0000-4000-8000-000000000007', '2026-02-01 10:00:00+00'),
  ('dd010000-0000-4000-8000-000000000001', 'c0010000-0000-4000-8000-000000000008', '2026-02-01 10:00:00+00'),
  ('dd010000-0000-4000-8000-000000000001', 'c0010000-0000-4000-8000-000000000009', '2026-02-01 10:00:00+00'),
  ('dd010000-0000-4000-8000-000000000001', 'c0010000-0000-4000-8000-000000000010', '2026-02-01 10:00:00+00');

-- Support Ops team channel
INSERT INTO chat_channel_members (channel_id, user_id, joined_at) VALUES
  ('dd010000-0000-4000-8000-000000000002', 'c0010000-0000-4000-8000-000000000001', '2026-02-01 10:00:00+00'),
  ('dd010000-0000-4000-8000-000000000002', 'c0010000-0000-4000-8000-000000000002', '2026-02-01 10:00:00+00'),
  ('dd010000-0000-4000-8000-000000000002', 'c0010000-0000-4000-8000-000000000003', '2026-02-01 10:00:00+00'),
  ('dd010000-0000-4000-8000-000000000002', 'c0010000-0000-4000-8000-000000000009', '2026-02-01 10:00:00+00'),
  ('dd010000-0000-4000-8000-000000000002', 'c0010000-0000-4000-8000-000000000010', '2026-02-01 10:00:00+00');

-- Engineering team channel
INSERT INTO chat_channel_members (channel_id, user_id, joined_at) VALUES
  ('dd010000-0000-4000-8000-000000000003', 'c0010000-0000-4000-8000-000000000004', '2026-02-01 10:05:00+00'),
  ('dd010000-0000-4000-8000-000000000003', 'c0010000-0000-4000-8000-000000000005', '2026-02-01 10:05:00+00'),
  ('dd010000-0000-4000-8000-000000000003', 'c0010000-0000-4000-8000-000000000008', '2026-02-01 10:05:00+00');

-- Analytics & Training team channel
INSERT INTO chat_channel_members (channel_id, user_id, joined_at) VALUES
  ('dd010000-0000-4000-8000-000000000004', 'c0010000-0000-4000-8000-000000000006', '2026-02-01 10:10:00+00'),
  ('dd010000-0000-4000-8000-000000000004', 'c0010000-0000-4000-8000-000000000007', '2026-02-01 10:10:00+00'),
  ('dd010000-0000-4000-8000-000000000004', 'c0010000-0000-4000-8000-000000000003', '2026-02-01 10:10:00+00');

-- Project channel members (matching project_members)
-- Project 1: Response Time
INSERT INTO chat_channel_members (channel_id, user_id, joined_at) VALUES
  ('dd020000-0000-4000-8000-000000000001', 'c0010000-0000-4000-8000-000000000002', '2026-02-03 09:00:00+00'),
  ('dd020000-0000-4000-8000-000000000001', 'c0010000-0000-4000-8000-000000000001', '2026-02-03 09:00:00+00'),
  ('dd020000-0000-4000-8000-000000000001', 'c0010000-0000-4000-8000-000000000003', '2026-02-03 09:00:00+00'),
  ('dd020000-0000-4000-8000-000000000001', 'c0010000-0000-4000-8000-000000000009', '2026-02-03 09:00:00+00'),
  ('dd020000-0000-4000-8000-000000000001', 'c0010000-0000-4000-8000-000000000006', '2026-02-03 09:00:00+00');

-- Project 2: Auto-Triage
INSERT INTO chat_channel_members (channel_id, user_id, joined_at) VALUES
  ('dd020000-0000-4000-8000-000000000002', 'c0010000-0000-4000-8000-000000000004', '2026-02-10 09:00:00+00'),
  ('dd020000-0000-4000-8000-000000000002', 'c0010000-0000-4000-8000-000000000005', '2026-02-10 09:00:00+00'),
  ('dd020000-0000-4000-8000-000000000002', 'c0010000-0000-4000-8000-000000000002', '2026-02-10 09:00:00+00'),
  ('dd020000-0000-4000-8000-000000000002', 'c0010000-0000-4000-8000-000000000008', '2026-02-10 09:00:00+00');

-- Project 3: Dashboard
INSERT INTO chat_channel_members (channel_id, user_id, joined_at) VALUES
  ('dd020000-0000-4000-8000-000000000003', 'c0010000-0000-4000-8000-000000000006', '2026-02-17 09:00:00+00'),
  ('dd020000-0000-4000-8000-000000000003', 'c0010000-0000-4000-8000-000000000008', '2026-02-17 09:00:00+00'),
  ('dd020000-0000-4000-8000-000000000003', 'c0010000-0000-4000-8000-000000000002', '2026-02-17 09:00:00+00'),
  ('dd020000-0000-4000-8000-000000000003', 'c0010000-0000-4000-8000-000000000001', '2026-02-17 09:00:00+00');

-- Project 4: Knowledge Base
INSERT INTO chat_channel_members (channel_id, user_id, joined_at) VALUES
  ('dd020000-0000-4000-8000-000000000004', 'c0010000-0000-4000-8000-000000000010', '2026-02-24 09:00:00+00'),
  ('dd020000-0000-4000-8000-000000000004', 'c0010000-0000-4000-8000-000000000003', '2026-02-24 09:00:00+00'),
  ('dd020000-0000-4000-8000-000000000004', 'c0010000-0000-4000-8000-000000000005', '2026-02-24 09:00:00+00'),
  ('dd020000-0000-4000-8000-000000000004', 'c0010000-0000-4000-8000-000000000009', '2026-02-24 09:00:00+00');

-- Project 5: Training
INSERT INTO chat_channel_members (channel_id, user_id, joined_at) VALUES
  ('dd020000-0000-4000-8000-000000000005', 'c0010000-0000-4000-8000-000000000007', '2026-03-03 09:00:00+00'),
  ('dd020000-0000-4000-8000-000000000005', 'c0010000-0000-4000-8000-000000000006', '2026-03-03 09:00:00+00'),
  ('dd020000-0000-4000-8000-000000000005', 'c0010000-0000-4000-8000-000000000003', '2026-03-03 09:00:00+00'),
  ('dd020000-0000-4000-8000-000000000005', 'c0010000-0000-4000-8000-000000000002', '2026-03-03 09:00:00+00');

-- ============================================================
-- CHAT MESSAGES — General Channel (Initiative-level)
-- ============================================================
INSERT INTO chat_messages (id, channel_id, org_id, author_id, body, created_at) VALUES
(
  'ee010000-0000-4000-8000-000000000001',
  'dd010000-0000-4000-8000-000000000001',
  'b0010000-0000-4000-8000-000000000001',
  'c0010000-0000-4000-8000-000000000001', -- Sarah
  'Welcome everyone! I''ve set up our initiative "Reduce Customer Support Response Time" in PIPS. We have 5 coordinated projects spanning Support Ops, Engineering, and Analytics. Each project follows the full PIPS 6-step cycle. Let''s use this channel for cross-team coordination and the project channels for detailed work discussion.',
  '2026-02-01 11:00:00+00'
),
(
  'ee010000-0000-4000-8000-000000000002',
  'dd010000-0000-4000-8000-000000000001',
  'b0010000-0000-4000-8000-000000000001',
  'c0010000-0000-4000-8000-000000000002', -- Marcus
  'Thanks Sarah. Project 1 (Response Time) is kicking off today. We''re starting with Step 1 — defining the problem statement. I''ll pull the team together for a session this afternoon.',
  '2026-02-03 09:30:00+00'
),
(
  'ee010000-0000-4000-8000-000000000003',
  'dd010000-0000-4000-8000-000000000001',
  'b0010000-0000-4000-8000-000000000001',
  'c0010000-0000-4000-8000-000000000006', -- James
  'I''ve pulled the Zendesk data for the past 6 months. The numbers are stark: 4.2hr avg first response, 65% of volume concentrated in a 4-hour window, and our enterprise SLA compliance is only 62%. Happy to share the raw data with any project team that needs it.',
  '2026-02-03 10:00:00+00'
),
(
  'ee010000-0000-4000-8000-000000000004',
  'dd010000-0000-4000-8000-000000000001',
  'b0010000-0000-4000-8000-000000000001',
  'c0010000-0000-4000-8000-000000000001', -- Sarah
  'Quick update for the whole team: Project 1 completed Step 1 (Identify) yesterday. Problem statement is locked. The data is clear — this is a process and scheduling problem, not primarily a headcount problem. That''s a huge insight that will save us from the obvious but expensive solution of just hiring more people.',
  '2026-02-05 09:00:00+00'
),
(
  'ee010000-0000-4000-8000-000000000005',
  'dd010000-0000-4000-8000-000000000001',
  'b0010000-0000-4000-8000-000000000001',
  'c0010000-0000-4000-8000-000000000004', -- David
  'Engineering is starting Project 2 (Auto-Triage) next week. We''ll need Marcus and the support team''s help building the ticket categorization taxonomy. The classifier can only be as good as the categories we give it.',
  '2026-02-07 10:00:00+00'
),
(
  'ee010000-0000-4000-8000-000000000006',
  'dd010000-0000-4000-8000-000000000001',
  'b0010000-0000-4000-8000-000000000001',
  'c0010000-0000-4000-8000-000000000002', -- Marcus
  'Absolutely David. Aisha and I will dedicate time next week to work on the taxonomy with you. We''ve been wanting to clean up our tagging system for months — this gives us the push.',
  '2026-02-07 10:30:00+00'
),
(
  'ee010000-0000-4000-8000-000000000007',
  'dd010000-0000-4000-8000-000000000001',
  'b0010000-0000-4000-8000-000000000001',
  'c0010000-0000-4000-8000-000000000001', -- Sarah
  'Big milestone! Project 1 staggered shifts went live today (Feb 17). Early results from the first shift are encouraging — the early team cleared 23 tickets before 9am that would have been queuing. Will share weekly numbers in this channel.',
  '2026-02-17 12:00:00+00'
),
(
  'ee010000-0000-4000-8000-000000000008',
  'dd010000-0000-4000-8000-000000000001',
  'b0010000-0000-4000-8000-000000000001',
  'c0010000-0000-4000-8000-000000000006', -- James
  'Week 1 post-deployment numbers for Project 1: avg first response time dropped from 4.2hr to 2.6hr. That''s a 38% improvement just from scheduling changes alone. Priority queues go live next Monday and should push us further.',
  '2026-02-21 16:00:00+00'
),
(
  'ee010000-0000-4000-8000-000000000009',
  'dd010000-0000-4000-8000-000000000001',
  'b0010000-0000-4000-8000-000000000001',
  'c0010000-0000-4000-8000-000000000007', -- Lisa
  'Hi all — I''m Lisa, just joined as Training & Enablement Manager. I''ll be leading Project 5 (Training Program). Looking forward to working with everyone. I''ll be talking to senior agents this week to understand the current onboarding experience.',
  '2026-03-03 09:00:00+00'
),
(
  'ee010000-0000-4000-8000-000000000010',
  'dd010000-0000-4000-8000-000000000001',
  'b0010000-0000-4000-8000-000000000001',
  'c0010000-0000-4000-8000-000000000001', -- Sarah
  'Project 1 is officially COMPLETE! Final numbers: response time 4.2hr -> 1.8hr (57% reduction), CSAT 3.4 -> 3.9, enterprise SLA compliance 62% -> 91%. Not yet at our <1hr target but the remaining gap will be addressed by Projects 2-5. Incredible work team!',
  '2026-03-05 17:00:00+00'
);

-- ============================================================
-- CHAT MESSAGES — Project 1 Channel (Response Time)
-- ============================================================
INSERT INTO chat_messages (id, channel_id, org_id, author_id, body, created_at) VALUES
(
  'ee020000-0000-4000-8000-000000000001',
  'dd020000-0000-4000-8000-000000000001',
  'b0010000-0000-4000-8000-000000000001',
  'c0010000-0000-4000-8000-000000000002', -- Marcus
  'Team, let''s use this channel for all Project 1 discussion. First up: we need to do our Step 1 (Identify) session. I''m thinking Thursday 2pm. We need James for data, Aisha and Rachel for frontline perspective, Sarah as our sponsor.',
  '2026-02-03 09:30:00+00'
),
(
  'ee020000-0000-4000-8000-000000000002',
  'dd020000-0000-4000-8000-000000000001',
  'b0010000-0000-4000-8000-000000000001',
  'c0010000-0000-4000-8000-000000000003', -- Aisha
  'Thursday 2pm works for me. I''ve been collecting notes from the team about what frustrates them most about the current process. Top complaint: "I come in to a queue of 80+ tickets every morning and feel like I''m already behind before I start."',
  '2026-02-03 10:00:00+00'
),
(
  'ee020000-0000-4000-8000-000000000003',
  'dd020000-0000-4000-8000-000000000001',
  'b0010000-0000-4000-8000-000000000001',
  'c0010000-0000-4000-8000-000000000006', -- James
  'Thursday works. I''ll bring the demand curve data and the SLA breach analysis. One thing that jumped out at me: Wednesday is consistently our highest volume day — correlates with the weekly product release. That might be something we can address with coordination.',
  '2026-02-03 10:15:00+00'
),
(
  'ee020000-0000-4000-8000-000000000004',
  'dd020000-0000-4000-8000-000000000001',
  'b0010000-0000-4000-8000-000000000001',
  'c0010000-0000-4000-8000-000000000002', -- Marcus
  'Great fishbone session today! We identified scheduling, queue design, and manual triage as the top 3 root causes. The 5-Why drill on scheduling was eye-opening — the root cause isn''t that we don''t have enough people, it''s that we have the wrong people at the wrong times.',
  '2026-02-05 17:00:00+00'
),
(
  'ee020000-0000-4000-8000-000000000005',
  'dd020000-0000-4000-8000-000000000001',
  'b0010000-0000-4000-8000-000000000001',
  'c0010000-0000-4000-8000-000000000009', -- Rachel
  'I really liked the brainstorming session. Having the "no criticism" rule helped me contribute ideas I normally wouldn''t suggest. The idea about separate queues for quick-wins vs deep investigations came from something I''d been thinking about for months but never felt comfortable saying.',
  '2026-02-10 17:00:00+00'
),
(
  'ee020000-0000-4000-8000-000000000006',
  'dd020000-0000-4000-8000-000000000001',
  'b0010000-0000-4000-8000-000000000001',
  'c0010000-0000-4000-8000-000000000002', -- Marcus
  'Priority queues are live as of this morning! Enterprise tickets are getting routed to our most experienced agents. First hour looks good — all 3 enterprise tickets that came in were responded to within 12 minutes.',
  '2026-02-24 10:00:00+00'
),
(
  'ee020000-0000-4000-8000-000000000007',
  'dd020000-0000-4000-8000-000000000001',
  'b0010000-0000-4000-8000-000000000001',
  'c0010000-0000-4000-8000-000000000009', -- Rachel
  'Heads up — I just found 3 enterprise customers whose tickets went to the Free queue. They submitted from personal email addresses. Created a bug ticket for this. Aisha is looking into the fix.',
  '2026-02-25 10:30:00+00'
);

-- ============================================================
-- CHAT MESSAGES — Project 2 Channel (Auto-Triage)
-- ============================================================
INSERT INTO chat_messages (id, channel_id, org_id, author_id, body, created_at) VALUES
(
  'ee030000-0000-4000-8000-000000000001',
  'dd020000-0000-4000-8000-000000000002',
  'b0010000-0000-4000-8000-000000000001',
  'c0010000-0000-4000-8000-000000000004', -- David
  'Kicking off Project 2. Our approach: build a hybrid classifier (rules + ML). But first we need a solid taxonomy. Marcus, can you and the support team help us define the canonical ticket categories?',
  '2026-02-10 09:30:00+00'
),
(
  'ee030000-0000-4000-8000-000000000002',
  'dd020000-0000-4000-8000-000000000002',
  'b0010000-0000-4000-8000-000000000001',
  'c0010000-0000-4000-8000-000000000002', -- Marcus
  'Yes! We have 55 ad-hoc tags right now that are a mess. Let me work with Aisha to cluster them into a proper 3-level hierarchy. Should be ready by end of week.',
  '2026-02-10 10:00:00+00'
),
(
  'ee030000-0000-4000-8000-000000000003',
  'dd020000-0000-4000-8000-000000000002',
  'b0010000-0000-4000-8000-000000000001',
  'c0010000-0000-4000-8000-000000000005', -- Priya
  'I''ve set up the classifier service skeleton. Using Python + FastAPI. The rule engine uses a configurable YAML file for keyword patterns, so Marcus can update categories without code changes. Ready for the taxonomy whenever it''s done.',
  '2026-02-14 14:00:00+00'
),
(
  'ee030000-0000-4000-8000-000000000004',
  'dd020000-0000-4000-8000-000000000002',
  'b0010000-0000-4000-8000-000000000001',
  'c0010000-0000-4000-8000-000000000008', -- Tom
  'I finished the initial labeling pass on 10K historical tickets. A few tricky areas: about 200 tickets could legitimately belong to 2 categories. I went with the primary category and noted the secondary. Should we use multi-label classification for the ML model?',
  '2026-03-01 15:00:00+00'
),
(
  'ee030000-0000-4000-8000-000000000005',
  'dd020000-0000-4000-8000-000000000002',
  'b0010000-0000-4000-8000-000000000001',
  'c0010000-0000-4000-8000-000000000004', -- David
  'Good question Tom. Let''s keep it single-label for v1 — multi-label adds complexity and we need to ship. The confidence scoring will naturally handle ambiguous tickets by routing them to human triage. We can explore multi-label in v2.',
  '2026-03-01 16:00:00+00'
),
(
  'ee030000-0000-4000-8000-000000000006',
  'dd020000-0000-4000-8000-000000000002',
  'b0010000-0000-4000-8000-000000000001',
  'c0010000-0000-4000-8000-000000000005', -- Priya
  'ML model update: reached 86.2% accuracy after adding customer plan tier as a feature. The biggest improvement came from separating billing-general vs billing-refund using amount-related keywords. I think we''re ready for integration.',
  '2026-03-05 11:30:00+00'
);

-- ============================================================
-- CHAT MESSAGES — Project 3 Channel (Dashboard)
-- ============================================================
INSERT INTO chat_messages (id, channel_id, org_id, author_id, body, created_at) VALUES
(
  'ee040000-0000-4000-8000-000000000001',
  'dd020000-0000-4000-8000-000000000003',
  'b0010000-0000-4000-8000-000000000001',
  'c0010000-0000-4000-8000-000000000006', -- James
  'Starting the dashboard project. I interviewed 3 support managers about what they need. Top requests: 1) Live queue depth by priority tier, 2) Response time trending (last 1hr, 4hr, 24hr), 3) Agent utilization heatmap, 4) SLA breach countdown. The "I need to see problems before they become emergencies" theme was unanimous.',
  '2026-02-17 14:00:00+00'
),
(
  'ee040000-0000-4000-8000-000000000002',
  'dd020000-0000-4000-8000-000000000003',
  'b0010000-0000-4000-8000-000000000001',
  'c0010000-0000-4000-8000-000000000008', -- Tom
  'I built quick POCs with Grafana and Metabase this week. Grafana is more powerful for real-time but Metabase is easier to set up. For a custom React dashboard we get exactly what we want but it''s 3-4 weeks of dev time. What''s the priority — speed or customization?',
  '2026-02-28 15:00:00+00'
),
(
  'ee040000-0000-4000-8000-000000000003',
  'dd020000-0000-4000-8000-000000000003',
  'b0010000-0000-4000-8000-000000000001',
  'c0010000-0000-4000-8000-000000000002', -- Marcus
  'From the support ops perspective: speed is critical. We need SOMETHING live within 2 weeks. We can iterate on customization later. The Grafana POC already shows me more than I''ve ever had. Can we start with Grafana and plan a custom build for v2?',
  '2026-02-28 16:00:00+00'
),
(
  'ee040000-0000-4000-8000-000000000004',
  'dd020000-0000-4000-8000-000000000003',
  'b0010000-0000-4000-8000-000000000001',
  'c0010000-0000-4000-8000-000000000006', -- James
  'That makes sense Marcus. I''m finishing up the criteria matrix now. Grafana scores highest overall — best balance of real-time capability, customization, and speed. The main blocker is the data pipeline: we need to replace the nightly batch ETL with streaming webhooks. That''s the real engineering work.',
  '2026-03-01 10:00:00+00'
);

-- ============================================================
-- CHAT MESSAGES — Project 4 Channel (Knowledge Base)
-- ============================================================
INSERT INTO chat_messages (id, channel_id, org_id, author_id, body, created_at) VALUES
(
  'ee050000-0000-4000-8000-000000000001',
  'dd020000-0000-4000-8000-000000000004',
  'b0010000-0000-4000-8000-000000000001',
  'c0010000-0000-4000-8000-000000000010', -- Carlos
  'Hi team! I''m Carlos, the new KB content lead. I just finished the article audit and the numbers are rough: only 53% of articles are current. But I see a huge opportunity — if we fix the top 20 articles by traffic and add articles for the top 5 missing topics, we could deflect hundreds of tickets.',
  '2026-03-03 17:30:00+00'
),
(
  'ee050000-0000-4000-8000-000000000002',
  'dd020000-0000-4000-8000-000000000004',
  'b0010000-0000-4000-8000-000000000001',
  'c0010000-0000-4000-8000-000000000003', -- Aisha
  'Carlos, from the agent side — the top 5 topics we see every day with no KB article are: API rate limits, SSO configuration, data export, team permissions, and billing plan changes. If those 5 articles existed, I estimate we''d save 15-20 tickets per day.',
  '2026-03-04 10:00:00+00'
),
(
  'ee050000-0000-4000-8000-000000000003',
  'dd020000-0000-4000-8000-000000000004',
  'b0010000-0000-4000-8000-000000000001',
  'c0010000-0000-4000-8000-000000000005', -- Priya
  'For the AI-powered search, I can build a prototype using our existing Supabase setup with pg_trgm for fuzzy matching. It won''t be as sophisticated as Algolia but it''s free and we can ship it in a week. Worth doing as a v1 while we evaluate paid options?',
  '2026-03-05 14:00:00+00'
),
(
  'ee050000-0000-4000-8000-000000000004',
  'dd020000-0000-4000-8000-000000000004',
  'b0010000-0000-4000-8000-000000000001',
  'c0010000-0000-4000-8000-000000000010', -- Carlos
  'That sounds perfect Priya! Quick win first, then upgrade. I''m also creating a new article template that''s customer-friendly: active voice, numbered steps, screenshot per step, troubleshooting section. Will share in the brainstorming session tomorrow.',
  '2026-03-05 15:00:00+00'
);

-- ============================================================
-- CHAT MESSAGES — Project 5 Channel (Training)
-- ============================================================
INSERT INTO chat_messages (id, channel_id, org_id, author_id, body, created_at) VALUES
(
  'ee060000-0000-4000-8000-000000000001',
  'dd020000-0000-4000-8000-000000000005',
  'b0010000-0000-4000-8000-000000000001',
  'c0010000-0000-4000-8000-000000000007', -- Lisa
  'Starting Project 5! My first step is understanding the current state. I''m scheduling interviews with Aisha, Rachel, and 2 other senior agents this week. Also pulling ramp-up data for the last 8 hires from James. If anyone has thoughts on what makes a good support agent training program, I''m all ears.',
  '2026-03-03 09:30:00+00'
),
(
  'ee060000-0000-4000-8000-000000000002',
  'dd020000-0000-4000-8000-000000000005',
  'b0010000-0000-4000-8000-000000000001',
  'c0010000-0000-4000-8000-000000000003', -- Aisha
  'Lisa, welcome! One thing I''d flag: when I started 2 years ago, I was basically given a Zendesk login and told "watch the queue." It took me 3 months to feel confident. The biggest gaps were: not knowing which tickets to escalate, not understanding our product architecture, and not having anyone to ask questions without feeling like a burden.',
  '2026-03-03 10:00:00+00'
),
(
  'ee060000-0000-4000-8000-000000000003',
  'dd020000-0000-4000-8000-000000000005',
  'b0010000-0000-4000-8000-000000000001',
  'c0010000-0000-4000-8000-000000000006', -- James
  'I pulled the ramp-up data. Average across last 8 hires: 12.3 weeks to 80% independence. But there''s huge variance — fastest was 6 weeks (someone with prior SaaS support experience) and slowest was 18 weeks (career changer). That variance suggests a structured program could help the most with the slower rampers.',
  '2026-03-04 11:00:00+00'
),
(
  'ee060000-0000-4000-8000-000000000004',
  'dd020000-0000-4000-8000-000000000005',
  'b0010000-0000-4000-8000-000000000001',
  'c0010000-0000-4000-8000-000000000007', -- Lisa
  'Excellent data James. The variance is really telling. I''m also seeing from the fishbone analysis that the lack of a sandbox environment is a big issue — new agents practicing on real customers is scary for everyone. I''m going to look into setting up a training Zendesk instance.',
  '2026-03-06 09:00:00+00'
);

-- ============================================================
-- CHAT MESSAGES — Support Ops Team Channel
-- ============================================================
INSERT INTO chat_messages (id, channel_id, org_id, author_id, body, created_at) VALUES
(
  'ee070000-0000-4000-8000-000000000001',
  'dd010000-0000-4000-8000-000000000002',
  'b0010000-0000-4000-8000-000000000001',
  'c0010000-0000-4000-8000-000000000002', -- Marcus
  'Team reminder: new staggered shifts start Monday Feb 17. Please review your assigned schedule that I sent via email. If you have any conflicts, let me know by Friday.',
  '2026-02-12 09:00:00+00'
),
(
  'ee070000-0000-4000-8000-000000000002',
  'dd010000-0000-4000-8000-000000000002',
  'b0010000-0000-4000-8000-000000000001',
  'c0010000-0000-4000-8000-000000000009', -- Rachel
  'Got it Marcus. I''m on the early shift (6am-2pm) — actually excited about it. I''m a morning person and the idea of clearing tickets before the rush hits sounds great.',
  '2026-02-12 09:30:00+00'
),
(
  'ee070000-0000-4000-8000-000000000003',
  'dd010000-0000-4000-8000-000000000002',
  'b0010000-0000-4000-8000-000000000001',
  'c0010000-0000-4000-8000-000000000003', -- Aisha
  'I''ll be on core shift. Quick question about the priority queues: when an enterprise ticket comes in during the early shift and the enterprise specialist isn''t on yet, what''s the protocol? Hold for the specialist or have the early team handle it?',
  '2026-02-15 10:00:00+00'
),
(
  'ee070000-0000-4000-8000-000000000004',
  'dd010000-0000-4000-8000-000000000002',
  'b0010000-0000-4000-8000-000000000001',
  'c0010000-0000-4000-8000-000000000002', -- Marcus
  'Great question Aisha. Early shift handles enterprise tickets — the SLA starts when the ticket is created, not when the specialist arrives. Every agent should be able to handle the initial response. If it needs specialist follow-up, they tag it and the specialist picks it up when they start.',
  '2026-02-15 10:30:00+00'
);

-- ============================================================
-- CHAT MESSAGES — Engineering Team Channel
-- ============================================================
INSERT INTO chat_messages (id, channel_id, org_id, author_id, body, created_at) VALUES
(
  'ee080000-0000-4000-8000-000000000001',
  'dd010000-0000-4000-8000-000000000003',
  'b0010000-0000-4000-8000-000000000001',
  'c0010000-0000-4000-8000-000000000004', -- David
  'Eng team standup: Priya is on the ML classifier, Tom is finishing data labeling, and I''m building the confidence scoring service. We''re targeting March 10 for shadow-mode testing. Any blockers?',
  '2026-03-03 09:00:00+00'
),
(
  'ee080000-0000-4000-8000-000000000002',
  'dd010000-0000-4000-8000-000000000003',
  'b0010000-0000-4000-8000-000000000001',
  'c0010000-0000-4000-8000-000000000005', -- Priya
  'No blockers on my end. The model is at 86% and I want to try one more iteration. Question: should we deploy the FastAPI service to the same EC2 instance as the rule engine or keep them separate? Separate is cleaner but doubles the infra.',
  '2026-03-03 09:15:00+00'
),
(
  'ee080000-0000-4000-8000-000000000003',
  'dd010000-0000-4000-8000-000000000003',
  'b0010000-0000-4000-8000-000000000001',
  'c0010000-0000-4000-8000-000000000004', -- David
  'Keep them separate for now. The rule engine should be rock-solid and independent. If the ML service goes down, we fail over to rules-only without affecting anything. The extra $20/month for a second instance is worth the reliability.',
  '2026-03-03 09:30:00+00'
);

COMMIT;
