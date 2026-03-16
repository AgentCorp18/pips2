-- ============================================================
-- BETA SCENARIO PART 6: Comments (ticket + project comments)
-- ============================================================

BEGIN;

-- ============================================================
-- TICKET COMMENTS
-- ============================================================

-- Comments on Ticket 1: Staggered shift schedule
INSERT INTO comments (id, org_id, ticket_id, author_id, body, created_at) VALUES
(
  'cc010000-0000-4000-8000-000000000001',
  'b0010000-0000-4000-8000-000000000001',
  'aa010000-0000-4000-8000-000000000001',
  'c0010000-0000-4000-8000-000000000002', -- Marcus
  'I''ve drafted the 3-shift model. The demand curve data from James shows 65% of tickets arrive between 10am-2pm ET. The new schedule puts 10 agents online during peak vs the current 8. Early shift covers the 6-9am gap we''ve been missing entirely.',
  '2026-02-11 10:00:00+00'
),
(
  'cc010000-0000-4000-8000-000000000002',
  'b0010000-0000-4000-8000-000000000001',
  'aa010000-0000-4000-8000-000000000001',
  'c0010000-0000-4000-8000-000000000003', -- Aisha
  'The preference survey results are in: 4 agents prefer Early, 6 prefer Core, 4 prefer Late. That actually maps perfectly to our staffing needs. Only 2 people need to be reassigned from their preference.',
  '2026-02-13 14:00:00+00'
),
(
  'cc010000-0000-4000-8000-000000000003',
  'b0010000-0000-4000-8000-000000000001',
  'aa010000-0000-4000-8000-000000000001',
  'c0010000-0000-4000-8000-000000000001', -- Sarah
  'HR approval secured! The CHRO fast-tracked it after seeing the churn and revenue data. Shift differential approved at $3/hr for early and late shifts. Good to go for Feb 17 rollout.',
  '2026-02-14 16:30:00+00'
),
(
  'cc010000-0000-4000-8000-000000000004',
  'b0010000-0000-4000-8000-000000000001',
  'aa010000-0000-4000-8000-000000000001',
  'c0010000-0000-4000-8000-000000000002', -- Marcus
  'Day 1 of staggered shifts complete. No issues with transitions. The early shift team handled 23 tickets before the core shift even started — those would have been sitting in queue until 9am previously. Initial data looks very promising.',
  '2026-02-17 18:00:00+00'
);

-- Comments on Ticket 2: Zendesk priority queues
INSERT INTO comments (id, org_id, ticket_id, author_id, body, created_at) VALUES
(
  'cc020000-0000-4000-8000-000000000001',
  'b0010000-0000-4000-8000-000000000001',
  'aa010000-0000-4000-8000-000000000002',
  'c0010000-0000-4000-8000-000000000003', -- Aisha
  'Zendesk queue configuration is more complex than I estimated. The auto-routing rules require nested triggers that Zendesk''s UI makes difficult. Going to need 8 hours instead of the planned 4. Still on track for the 24th deadline though.',
  '2026-02-19 11:00:00+00'
),
(
  'cc020000-0000-4000-8000-000000000002',
  'b0010000-0000-4000-8000-000000000001',
  'aa010000-0000-4000-8000-000000000002',
  'c0010000-0000-4000-8000-000000000006', -- James
  'Slack webhook is live and tested. Alerts fire when a ticket hits 80% of its SLA timer. Tested with all 3 tiers — enterprise alert at 12min, paid at 24min, free at 96min. Looks good.',
  '2026-02-19 15:00:00+00'
),
(
  'cc020000-0000-4000-8000-000000000003',
  'b0010000-0000-4000-8000-000000000001',
  'aa010000-0000-4000-8000-000000000002',
  'c0010000-0000-4000-8000-000000000003', -- Aisha
  'Priority queues deployed to production. All 3 tiers routing correctly. Ran 50 test tickets through — 100% correct routing based on customer tier. Training the agents on the new queue interface tomorrow morning.',
  '2026-02-23 16:00:00+00'
),
(
  'cc020000-0000-4000-8000-000000000004',
  'b0010000-0000-4000-8000-000000000001',
  'aa010000-0000-4000-8000-000000000002',
  'c0010000-0000-4000-8000-000000000009', -- Rachel
  'Quick heads up — I found 3 enterprise customers whose tickets went into the Free queue. Turns out they have personal accounts linked to a different email. Created a bug ticket for this.',
  '2026-02-25 10:30:00+00'
);

-- Comments on Ticket 6: ML model (in progress)
INSERT INTO comments (id, org_id, ticket_id, author_id, body, created_at) VALUES
(
  'cc060000-0000-4000-8000-000000000001',
  'b0010000-0000-4000-8000-000000000001',
  'aa020000-0000-4000-8000-000000000003',
  'c0010000-0000-4000-8000-000000000005', -- Priya
  'Initial model training results: 83% accuracy on test set. Main confusion is between "billing-general" and "billing-refund" categories — they have very similar language. Trying feature engineering with amount keywords ($, refund, charge, credit) to differentiate.',
  '2026-03-03 14:00:00+00'
),
(
  'cc060000-0000-4000-8000-000000000002',
  'b0010000-0000-4000-8000-000000000001',
  'aa020000-0000-4000-8000-000000000003',
  'c0010000-0000-4000-8000-000000000004', -- David
  'Good progress, Priya. 83% is close to our 85% target. Consider also adding the customer''s product plan as a feature — enterprise customers tend to have different issue patterns than free-tier. That context might help the model.',
  '2026-03-03 16:00:00+00'
),
(
  'cc060000-0000-4000-8000-000000000003',
  'b0010000-0000-4000-8000-000000000001',
  'aa020000-0000-4000-8000-000000000003',
  'c0010000-0000-4000-8000-000000000005', -- Priya
  'Update: added plan tier as a feature + the amount keywords. Now at 86.2% accuracy! The billing confusion dropped significantly. Going to run one more iteration with TF-IDF instead of bag-of-words and then lock the model for integration.',
  '2026-03-05 11:00:00+00'
),
(
  'cc060000-0000-4000-8000-000000000004',
  'b0010000-0000-4000-8000-000000000001',
  'aa020000-0000-4000-8000-000000000003',
  'c0010000-0000-4000-8000-000000000008', -- Tom
  'I finished labeling all 10,247 tickets. Found about 200 that were genuinely ambiguous — they could fit 2 categories equally. I labeled them with the primary category and flagged the secondary in a notes column so the model can learn from them later.',
  '2026-03-01 15:00:00+00'
);

-- Comments on Bug Ticket: Enterprise miscategorization
INSERT INTO comments (id, org_id, ticket_id, author_id, body, created_at) VALUES
(
  'cc070000-0000-4000-8000-000000000001',
  'b0010000-0000-4000-8000-000000000001',
  'aa060000-0000-4000-8000-000000000001',
  'c0010000-0000-4000-8000-000000000003', -- Aisha
  'Root cause identified: Zendesk looks up the customer tier using the email address on the ticket. When a customer submits from their personal email (which is on a free account) instead of their work email (which is on the enterprise account), it routes to the wrong queue. Fix: add a Zendesk trigger that checks the organization domain, not just the email.',
  '2026-02-25 14:00:00+00'
),
(
  'cc070000-0000-4000-8000-000000000002',
  'b0010000-0000-4000-8000-000000000001',
  'aa060000-0000-4000-8000-000000000001',
  'c0010000-0000-4000-8000-000000000003', -- Aisha
  'Fix deployed. Added organization-level tier lookup as the primary check, with email-level as fallback. Also added an agent-facing "Override Tier" button for edge cases. Tested with all 3 affected customers — correctly routes now.',
  '2026-02-26 14:00:00+00'
),
(
  'cc070000-0000-4000-8000-000000000003',
  'b0010000-0000-4000-8000-000000000001',
  'aa060000-0000-4000-8000-000000000001',
  'c0010000-0000-4000-8000-000000000002', -- Marcus
  'Great catch Rachel, and fast fix Aisha. This is exactly the kind of edge case we needed to find in the first week. Adding the override button was smart — there will always be exceptions we can''t automate.',
  '2026-02-26 16:00:00+00'
);

-- Comments on Ticket 9: KB article audit
INSERT INTO comments (id, org_id, ticket_id, author_id, body, created_at) VALUES
(
  'cc090000-0000-4000-8000-000000000001',
  'b0010000-0000-4000-8000-000000000001',
  'aa040000-0000-4000-8000-000000000001',
  'c0010000-0000-4000-8000-000000000010', -- Carlos
  'Audit progress after day 1: reviewed 85 of 340 articles. Results so far: 38 current (keep), 27 outdated (need update), 14 stale (archive), 6 duplicate. The outdated ones are mostly from features that were redesigned in the v3.0 release last September.',
  '2026-03-03 17:00:00+00'
),
(
  'cc090000-0000-4000-8000-000000000002',
  'b0010000-0000-4000-8000-000000000001',
  'aa040000-0000-4000-8000-000000000001',
  'c0010000-0000-4000-8000-000000000003', -- Aisha
  'Carlos — from the support side, the top 5 topics customers ask about that have NO KB articles are: 1) API rate limits, 2) SSO configuration, 3) data export, 4) team permissions, 5) billing plan changes. If you can prioritize creating articles for these, it would have immediate ticket deflection impact.',
  '2026-03-04 10:00:00+00'
),
(
  'cc090000-0000-4000-8000-000000000003',
  'b0010000-0000-4000-8000-000000000001',
  'aa040000-0000-4000-8000-000000000001',
  'c0010000-0000-4000-8000-000000000010', -- Carlos
  'Great input Aisha, adding those to my priority list. I''m also creating a new article template that follows our customer-facing writing guidelines — active voice, step-by-step format, screenshot per step, troubleshooting section at the bottom. Will share for team review tomorrow.',
  '2026-03-04 14:00:00+00'
);

-- ============================================================
-- PROJECT-LEVEL COMMENTS (on project overview)
-- ============================================================

-- Comments on Project 1 (overview discussion)
INSERT INTO comments (id, org_id, project_id, author_id, body, created_at) VALUES
(
  'cc100000-0000-4000-8000-000000000001',
  'b0010000-0000-4000-8000-000000000001',
  'f0010000-0000-4000-8000-000000000001',
  'c0010000-0000-4000-8000-000000000001', -- Sarah
  'Congratulations team on completing this project ahead of schedule! The 57% reduction in response time is a strong result. I''m presenting these findings to the exec team on Friday. Marcus, can you prepare a one-page summary I can share?',
  '2026-03-05 17:00:00+00'
),
(
  'cc100000-0000-4000-8000-000000000002',
  'b0010000-0000-4000-8000-000000000001',
  'f0010000-0000-4000-8000-000000000001',
  'c0010000-0000-4000-8000-000000000002', -- Marcus
  'Absolutely, I''ll have the one-pager ready by Thursday EOD. Key highlights: 4.2hr -> 1.8hr, CSAT 3.4 -> 3.9, zero additional headcount. The PIPS process really helped us avoid the obvious (and expensive) solution of just hiring more people.',
  '2026-03-05 17:30:00+00'
);

-- Comments on Project 2
INSERT INTO comments (id, org_id, project_id, author_id, body, created_at) VALUES
(
  'cc110000-0000-4000-8000-000000000001',
  'b0010000-0000-4000-8000-000000000001',
  'f0010000-0000-4000-8000-000000000002',
  'c0010000-0000-4000-8000-000000000004', -- David
  'Status update: rule-based classifier is in staging and performing well (78% accuracy). ML model is at 86% and will be ready for integration by end of week. We''re slightly behind on the shadow-mode testing timeline but should catch up next week.',
  '2026-03-05 10:00:00+00'
),
(
  'cc110000-0000-4000-8000-000000000002',
  'b0010000-0000-4000-8000-000000000001',
  'f0010000-0000-4000-8000-000000000002',
  'c0010000-0000-4000-8000-000000000002', -- Marcus
  'From the support side, the taxonomy work has already been valuable. Even before the auto-classifier launches, agents are using the new categories for manual routing and it''s reduced confusion. Misroute rate has dropped from 32% to about 20% just from clearer categories.',
  '2026-03-06 09:00:00+00'
);

COMMIT;
