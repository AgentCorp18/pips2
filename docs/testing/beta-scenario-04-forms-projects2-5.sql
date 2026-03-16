-- ============================================================
-- BETA SCENARIO PART 4: PIPS Forms — Projects 2-5
-- ============================================================

BEGIN;

-- ============================================================
-- PROJECT 2: Auto-Triage System (steps 1-4 complete, step 5 in progress)
-- ============================================================

-- Step 1: Problem Statement
INSERT INTO project_forms (id, project_id, step, form_type, title, data, created_by, created_at) VALUES
(
  'ff020100-0000-4000-8000-000000000001',
  'f0010000-0000-4000-8000-000000000002',
  'identify',
  'problem_statement',
  'problem_statement',
  '{
    "asIs": "Manual ticket triage takes an average of 18 minutes per ticket. Agents read the full ticket body, determine the category, severity, and appropriate specialist, then manually reassign. 32% of tickets are misrouted on first assignment, requiring a second triage step that adds an average of 45 minutes to resolution.",
    "desired": "Automated triage classifies, prioritizes, and routes 90%+ of tickets to the correct specialist within 30 seconds of submission. Misroute rate below 5%. Human triage reserved only for ambiguous edge cases.",
    "gap": "17.5-minute gap per ticket in triage time. 27 percentage point gap in misroute rate (32% vs 5% target). Combined, these add an estimated 45+ minutes to the average ticket lifecycle.",
    "problemStatement": "Manual ticket triage consumes 18 minutes per ticket and misroutes 32% of tickets, adding an average of 45 minutes to resolution time. This delays first response, frustrates agents, and wastes specialist time on wrong-category tickets.",
    "teamMembers": ["David Kim", "Priya Sharma", "Marcus Rivera", "Tom Bradshaw"],
    "problemArea": "Ticket Routing & Classification",
    "dataSources": ["Zendesk routing audit (500 ticket sample)", "Agent time-motion study", "Misroute tracking spreadsheet", "Customer satisfaction by routing accuracy"]
  }'::jsonb,
  'c0010000-0000-4000-8000-000000000004',
  '2026-02-10 14:00:00+00'
),

-- Step 2: Fishbone
(
  'ff020200-0000-4000-8000-000000000001',
  'f0010000-0000-4000-8000-000000000002',
  'analyze',
  'fishbone',
  'fishbone',
  '{
    "problemStatement": "Manual ticket triage takes 18 min/ticket with 32% misroute rate",
    "categories": [
      {
        "name": "Man (People)",
        "causes": [
          {"text": "No standardized triage training", "subCauses": ["Each agent triages differently", "Tribal knowledge not documented"]},
          {"text": "Junior agents cannot identify technical complexity", "subCauses": ["Route based on keywords not understanding", "Conservative routing to senior agents"]}
        ]
      },
      {
        "name": "Machine (Equipment)",
        "causes": [
          {"text": "Zendesk has no built-in intelligent routing", "subCauses": ["Only basic rule-based triggers available", "No NLP or classification capability"]},
          {"text": "No integration between ticket system and product knowledge", "subCauses": ["Agent must manually look up product area", "No link between customer account and product usage"]}
        ]
      },
      {
        "name": "Method (Process)",
        "causes": [
          {"text": "No ticket categorization taxonomy exists", "subCauses": ["Categories are informal and overlapping", "55 ad-hoc tags with no governance"]},
          {"text": "Triage is first-touch only — no automated pre-classification", "subCauses": ["Every ticket requires human reading", "No keyword or pattern matching"]},
          {"text": "No feedback loop when misroutes happen", "subCauses": ["Agents manually forward, no tracking", "Root cause of misroute never analyzed"]}
        ]
      },
      {
        "name": "Material (Inputs)",
        "causes": [
          {"text": "Ticket submission form is too free-form", "subCauses": ["No required category field", "No product area dropdown", "Customers describe issues in unpredictable ways"]},
          {"text": "No historical routing data to train on", "subCauses": ["Past routing decisions not recorded", "Cannot build pattern-based rules"]}
        ]
      },
      {
        "name": "Measurement (Metrics)",
        "causes": [
          {"text": "Misroute rate not measured until this project", "subCauses": ["No systemic tracking", "Discovered anecdotally"]},
          {"text": "Triage time not tracked separately from response time", "subCauses": ["Lumped into first response metric", "Hidden bottleneck"]}
        ]
      },
      {
        "name": "Mother Nature (Environment)",
        "causes": [
          {"text": "Product complexity growing faster than documentation", "subCauses": ["3 major feature launches in 6 months", "Support team not briefed before releases"]}
        ]
      }
    ]
  }'::jsonb,
  'c0010000-0000-4000-8000-000000000004',
  '2026-02-12 14:00:00+00'
),

-- Step 2: Five Why
(
  'ff020200-0000-4000-8000-000000000002',
  'f0010000-0000-4000-8000-000000000002',
  'analyze',
  'five_why',
  'five_why',
  '{
    "problemStatement": "32% of support tickets are misrouted on first assignment",
    "whys": [
      {"question": "Why are tickets misrouted?", "answer": "Triage agents select the wrong specialist category because tickets are difficult to classify from the customer description alone."},
      {"question": "Why are tickets difficult to classify?", "answer": "There is no standardized categorization taxonomy. The 55 existing tags are informal, overlapping, and inconsistently applied."},
      {"question": "Why is there no standardized taxonomy?", "answer": "The tag system grew organically as agents added ad-hoc tags over 3 years. No one has ever done a systematic review or cleanup."},
      {"question": "Why has no one done a systematic review?", "answer": "The triage process was adequate when volume was low. It became a bottleneck only in the past 6 months as ticket volume grew 40%."},
      {"question": "Why did volume growth expose the triage weakness?", "answer": "With higher volume, the time cost of manual triage compounds, and the probability of misroutes increases because agents spend less time per ticket under pressure."}
    ],
    "rootCause": "The ticket categorization system was never designed — it grew organically. Without a structured taxonomy, both human and automated triage will fail. The foundation for any routing improvement is a clean, well-defined categorization model."
  }'::jsonb,
  'c0010000-0000-4000-8000-000000000005',
  '2026-02-13 10:00:00+00'
),

-- Step 3: Brainstorming
(
  'ff020300-0000-4000-8000-000000000001',
  'f0010000-0000-4000-8000-000000000002',
  'generate',
  'brainstorming',
  'brainstorming',
  '{
    "ideas": [
      {"id": "t-01", "text": "Build rule-based classifier using keyword matching on new taxonomy", "author": "David Kim", "votes": 7, "category": "Rule-Based"},
      {"id": "t-02", "text": "Train NLP model on 2 years of historical tickets for auto-classification", "author": "Priya Sharma", "votes": 6, "category": "ML"},
      {"id": "t-03", "text": "Hybrid: rule-based primary with ML fallback for ambiguous tickets", "author": "David Kim", "votes": 8, "category": "Hybrid"},
      {"id": "t-04", "text": "Create mandatory structured ticket form with dropdowns", "author": "Marcus Rivera", "votes": 5, "category": "Form Design"},
      {"id": "t-05", "text": "Outsource triage to dedicated triage specialists", "author": "Tom Bradshaw", "votes": 3, "category": "Staffing"},
      {"id": "t-06", "text": "Use GPT API for ticket summarization and category suggestion", "author": "Priya Sharma", "votes": 6, "category": "ML"},
      {"id": "t-07", "text": "Customer self-categorization with guided wizard", "author": "Marcus Rivera", "votes": 4, "category": "Form Design"},
      {"id": "t-08", "text": "Route by customer product usage data (API calls to product DB)", "author": "Tom Bradshaw", "votes": 5, "category": "Data Integration"},
      {"id": "t-09", "text": "Confidence scoring: auto-route if >80% confident, queue for human if not", "author": "David Kim", "votes": 7, "category": "Hybrid"},
      {"id": "t-10", "text": "Build feedback loop: agents rate routing accuracy, model retrains", "author": "Priya Sharma", "votes": 6, "category": "ML"}
    ],
    "selectedIdeas": ["t-03", "t-04", "t-09", "t-10"],
    "eliminatedIdeas": ["t-05"]
  }'::jsonb,
  'c0010000-0000-4000-8000-000000000004',
  '2026-02-17 14:00:00+00'
),

-- Step 4: Criteria Matrix
(
  'ff020400-0000-4000-8000-000000000001',
  'f0010000-0000-4000-8000-000000000002',
  'select_plan',
  'criteria_matrix',
  'criteria_matrix',
  '{
    "criteria": [
      {"name": "Routing accuracy", "weight": 10, "description": "% of tickets correctly routed on first attempt"},
      {"name": "Time to deploy", "weight": 8, "description": "Calendar days from start to production"},
      {"name": "Ongoing maintenance effort", "weight": 7, "description": "Engineering hours/month to maintain"},
      {"name": "Scalability", "weight": 9, "description": "Handles 2x-5x ticket volume without degradation"},
      {"name": "Cost", "weight": 6, "description": "Monthly operational cost including compute and APIs"}
    ],
    "solutions": [
      {"name": "Rule-based classifier (keyword + taxonomy)", "scores": {"Routing accuracy": 3, "Time to deploy": 5, "Ongoing maintenance effort": 3, "Scalability": 4, "Cost": 5}},
      {"name": "NLP model (trained on historical tickets)", "scores": {"Routing accuracy": 4, "Time to deploy": 2, "Ongoing maintenance effort": 2, "Scalability": 5, "Cost": 3}},
      {"name": "Hybrid: rules primary + ML fallback", "scores": {"Routing accuracy": 5, "Time to deploy": 3, "Ongoing maintenance effort": 3, "Scalability": 5, "Cost": 4}},
      {"name": "GPT API for classification", "scores": {"Routing accuracy": 4, "Time to deploy": 4, "Ongoing maintenance effort": 4, "Scalability": 3, "Cost": 2}}
    ]
  }'::jsonb,
  'c0010000-0000-4000-8000-000000000004',
  '2026-02-19 14:00:00+00'
),

-- Step 4: Implementation Plan
(
  'ff020400-0000-4000-8000-000000000002',
  'f0010000-0000-4000-8000-000000000002',
  'select_plan',
  'implementation_plan',
  'implementation_plan',
  '{
    "selectedSolution": "Hybrid: rule-based classifier primary with ML model fallback for low-confidence tickets",
    "tasks": [
      {"id": "at-01", "title": "Define ticket categorization taxonomy (20 categories, 3 levels)", "assignee": "Marcus Rivera", "dueDate": "2026-02-21", "status": "completed", "notes": "Work with support team to clean up 55 tags into structured taxonomy"},
      {"id": "at-02", "title": "Build rule-based classifier using taxonomy + keyword matching", "assignee": "Priya Sharma", "dueDate": "2026-02-28", "status": "completed", "notes": "Python service, Zendesk webhook trigger"},
      {"id": "at-03", "title": "Export and label 10,000 historical tickets for ML training set", "assignee": "Tom Bradshaw", "dueDate": "2026-02-28", "status": "completed", "notes": "Label using new taxonomy. 80/20 train/test split."},
      {"id": "at-04", "title": "Train ML classification model and integrate as fallback", "assignee": "Priya Sharma", "dueDate": "2026-03-07", "status": "in_progress", "notes": "Using scikit-learn + FastAPI microservice. Targeting >85% accuracy on test set."},
      {"id": "at-05", "title": "Build confidence scoring and human-review queue", "assignee": "David Kim", "dueDate": "2026-03-07", "status": "in_progress", "notes": "Below 80% confidence routes to human triage queue"},
      {"id": "at-06", "title": "Deploy to staging and run shadow-mode testing", "assignee": "Priya Sharma", "dueDate": "2026-03-10", "status": "not_started", "notes": "Run parallel to manual triage for 3 days to compare accuracy"},
      {"id": "at-07", "title": "Build agent feedback loop (rate routing accuracy)", "assignee": "Tom Bradshaw", "dueDate": "2026-03-12", "status": "not_started", "notes": "Simple thumbs up/down on each routed ticket"},
      {"id": "at-08", "title": "Production rollout (10% traffic, then 50%, then 100%)", "assignee": "David Kim", "dueDate": "2026-03-14", "status": "not_started", "notes": "Gradual rollout with kill switch"}
    ],
    "timeline": "5 weeks total. Phase 1 (rules) weeks 1-2. Phase 2 (ML) weeks 3-4. Phase 3 (production rollout) week 5.",
    "resources": "3 engineers (David, Priya, Tom). 1 support manager (Marcus) for taxonomy. AWS Lambda for rule engine, EC2 instance for ML model.",
    "budget": "~$500/month for compute (Lambda + EC2 small instance). One-time: 40 engineering hours for labeling historical data.",
    "risks": [
      {"risk": "ML model accuracy below 85% target", "mitigation": "Rule-based classifier handles majority of tickets regardless. ML only used as fallback."},
      {"risk": "Zendesk webhook reliability issues", "mitigation": "Build retry logic and dead-letter queue. Alert on failures."},
      {"risk": "Taxonomy does not cover edge cases", "mitigation": "Include catch-all category that routes to human triage. Review and expand taxonomy monthly."}
    ]
  }'::jsonb,
  'c0010000-0000-4000-8000-000000000004',
  '2026-02-20 10:00:00+00'
),

-- Step 5: Milestone Tracker (in progress)
(
  'ff020500-0000-4000-8000-000000000001',
  'f0010000-0000-4000-8000-000000000002',
  'implement',
  'milestone_tracker',
  'milestone_tracker',
  '{
    "milestones": [
      {"id": "atm-1", "title": "Taxonomy defined and approved by support team", "targetDate": "2026-02-21", "completedDate": "2026-02-21", "status": "completed", "description": "20 categories across 3 levels. Reviewed by Marcus and Aisha.", "deliverables": ["Taxonomy document", "Tag mapping from old to new"]},
      {"id": "atm-2", "title": "Rule-based classifier deployed to staging", "targetDate": "2026-02-28", "completedDate": "2026-02-27", "status": "completed", "description": "Keyword matching + regex patterns. 78% accuracy on test set.", "deliverables": ["Classifier service", "Staging deployment", "Accuracy report"]},
      {"id": "atm-3", "title": "Historical tickets labeled for ML training", "targetDate": "2026-02-28", "completedDate": "2026-03-01", "status": "completed", "description": "10,247 tickets labeled. Slight delay due to ambiguous edge cases.", "deliverables": ["Labeled dataset", "Labeling guidelines doc"]},
      {"id": "atm-4", "title": "ML model trained and integrated as fallback", "targetDate": "2026-03-07", "completedDate": null, "status": "in_progress", "description": "Model training in progress. Initial accuracy at 83% — iterating on feature engineering.", "deliverables": ["Trained model", "FastAPI service", "Integration tests"]},
      {"id": "atm-5", "title": "Shadow-mode testing complete", "targetDate": "2026-03-10", "completedDate": null, "status": "pending", "description": "3-day parallel run comparing auto-triage vs manual triage", "deliverables": ["Comparison report", "Edge case catalog"]},
      {"id": "atm-6", "title": "Production rollout (100% traffic)", "targetDate": "2026-03-14", "completedDate": null, "status": "pending", "description": "Graduated rollout: 10% -> 50% -> 100%", "deliverables": ["Production deployment", "Monitoring dashboard", "Runbook"]}
    ],
    "overallProgress": 55
  }'::jsonb,
  'c0010000-0000-4000-8000-000000000004',
  '2026-02-24 09:00:00+00'
);

-- ============================================================
-- PROJECT 3: Real-Time Dashboard (steps 1-3 complete, step 4 in progress)
-- ============================================================

INSERT INTO project_forms (id, project_id, step, form_type, title, data, created_by, created_at) VALUES
-- Step 1: Problem Statement
(
  'ff030100-0000-4000-8000-000000000001',
  'f0010000-0000-4000-8000-000000000003',
  'identify',
  'problem_statement',
  'problem_statement',
  '{
    "asIs": "Support managers receive end-of-day reports via email with yesterday''s metrics. There is zero real-time visibility into current queue depth, agent availability, response times, or SLA breach risk. When ticket spikes occur, managers only discover them hours later.",
    "desired": "A live dashboard refreshing every 60 seconds showing: current queue depth by priority, real-time avg response time, agent status (available/busy/offline), SLA breach countdown timers, and historical trend overlays. Accessible on desktop and mobile.",
    "gap": "Complete gap — currently T+1 day reporting vs real-time target. Managers cannot intervene proactively because they lack the data to detect problems as they happen.",
    "problemStatement": "Support managers have zero real-time visibility into queue performance, relying on end-of-day reports that arrive 12-24 hours after problems occur. This prevents proactive intervention during ticket spikes and makes SLA management reactive instead of preventive.",
    "teamMembers": ["James O''Brien", "Tom Bradshaw", "Marcus Rivera", "Sarah Chen"],
    "problemArea": "Support Analytics & Monitoring",
    "dataSources": ["Current reporting workflow documentation", "Manager interviews (3 conducted)", "Zendesk API documentation", "Competitor dashboard benchmarks"]
  }'::jsonb,
  'c0010000-0000-4000-8000-000000000006',
  '2026-02-17 14:00:00+00'
),

-- Step 2: Fishbone
(
  'ff030200-0000-4000-8000-000000000001',
  'f0010000-0000-4000-8000-000000000003',
  'analyze',
  'fishbone',
  'fishbone',
  '{
    "problemStatement": "No real-time visibility into support queue performance",
    "categories": [
      {
        "name": "Machine (Equipment)",
        "causes": [
          {"text": "Data pipeline runs nightly batch ETL only", "subCauses": ["Built 2 years ago when volume was low", "No streaming infrastructure"]},
          {"text": "Zendesk native dashboards are limited", "subCauses": ["No cross-queue aggregation", "Cannot customize SLA visualizations"]}
        ]
      },
      {
        "name": "Method (Process)",
        "causes": [
          {"text": "Metrics reviewed daily not continuously", "subCauses": ["No one assigned to monitor in real time", "Reports emailed at EOD"]},
          {"text": "No escalation triggers based on queue thresholds", "subCauses": ["Manual escalation only", "Managers check queue sporadically"]}
        ]
      },
      {
        "name": "Measurement (Metrics)",
        "causes": [
          {"text": "SLA compliance only calculated retroactively", "subCauses": ["Cannot see approaching breaches", "No countdown timer"]},
          {"text": "Agent utilization not tracked", "subCauses": ["Cannot see who is overloaded", "Cannot redistribute work"]}
        ]
      },
      {
        "name": "Man (People)",
        "causes": [
          {"text": "No data engineering resource dedicated to support analytics", "subCauses": ["James builds reports part-time", "Analytics team serves all departments"]}
        ]
      },
      {
        "name": "Material (Inputs)",
        "causes": [
          {"text": "Zendesk data not readily available for streaming", "subCauses": ["API rate limits", "Webhook payloads limited"]}
        ]
      },
      {
        "name": "Mother Nature (Environment)",
        "causes": [
          {"text": "Company has not invested in real-time infrastructure", "subCauses": ["All analytics are batch-oriented", "No event streaming platform"]}
        ]
      }
    ]
  }'::jsonb,
  'c0010000-0000-4000-8000-000000000006',
  '2026-02-19 14:00:00+00'
),

-- Step 3: Brainstorming
(
  'ff030300-0000-4000-8000-000000000001',
  'f0010000-0000-4000-8000-000000000003',
  'generate',
  'brainstorming',
  'brainstorming',
  '{
    "ideas": [
      {"id": "d-01", "text": "Custom Grafana dashboard with Zendesk API streaming", "author": "James O''Brien", "votes": 7, "category": "Custom Build"},
      {"id": "d-02", "text": "Zendesk Explore (native) with custom reports", "author": "Marcus Rivera", "votes": 3, "category": "Native Tool"},
      {"id": "d-03", "text": "Metabase + Zendesk webhooks + Postgres", "author": "Tom Bradshaw", "votes": 6, "category": "Custom Build"},
      {"id": "d-04", "text": "Datadog with Zendesk integration", "author": "James O''Brien", "votes": 5, "category": "SaaS"},
      {"id": "d-05", "text": "Custom React dashboard with WebSocket real-time updates", "author": "Tom Bradshaw", "votes": 6, "category": "Custom Build"},
      {"id": "d-06", "text": "Google Sheets with Zendesk API auto-refresh", "author": "Marcus Rivera", "votes": 2, "category": "Low-Tech"},
      {"id": "d-07", "text": "Looker Studio with streaming connector", "author": "James O''Brien", "votes": 4, "category": "SaaS"},
      {"id": "d-08", "text": "TV screens in support area showing live queue depth", "author": "Marcus Rivera", "votes": 5, "category": "Display"},
      {"id": "d-09", "text": "Slack bot that posts queue alerts every 15 minutes", "author": "Tom Bradshaw", "votes": 5, "category": "Notification"},
      {"id": "d-10", "text": "Mobile-optimized dashboard for managers on the go", "author": "James O''Brien", "votes": 4, "category": "Mobile"}
    ],
    "selectedIdeas": ["d-01", "d-03", "d-05", "d-09"],
    "eliminatedIdeas": ["d-06"]
  }'::jsonb,
  'c0010000-0000-4000-8000-000000000006',
  '2026-02-24 14:00:00+00'
),

-- Step 4: Criteria Matrix (in progress)
(
  'ff030400-0000-4000-8000-000000000001',
  'f0010000-0000-4000-8000-000000000003',
  'select_plan',
  'criteria_matrix',
  'criteria_matrix',
  '{
    "criteria": [
      {"name": "Real-time capability (< 60s refresh)", "weight": 10, "description": "Can it show data within 60 seconds of a ticket event?"},
      {"name": "Customizability", "weight": 8, "description": "Can we build the exact views managers need?"},
      {"name": "Time to deploy", "weight": 7, "description": "How quickly can we get something useful live?"},
      {"name": "Ongoing cost", "weight": 6, "description": "Monthly operational cost"},
      {"name": "Mobile access", "weight": 5, "description": "Usable on phone/tablet for managers away from desk"}
    ],
    "solutions": [
      {"name": "Custom Grafana + Zendesk API", "scores": {"Real-time capability (< 60s refresh)": 5, "Customizability": 5, "Time to deploy": 3, "Ongoing cost": 4, "Mobile access": 3}},
      {"name": "Metabase + webhooks + Postgres", "scores": {"Real-time capability (< 60s refresh)": 4, "Customizability": 4, "Time to deploy": 4, "Ongoing cost": 5, "Mobile access": 3}},
      {"name": "Custom React + WebSocket", "scores": {"Real-time capability (< 60s refresh)": 5, "Customizability": 5, "Time to deploy": 2, "Ongoing cost": 3, "Mobile access": 5}},
      {"name": "Datadog integration", "scores": {"Real-time capability (< 60s refresh)": 5, "Customizability": 3, "Time to deploy": 4, "Ongoing cost": 2, "Mobile access": 4}}
    ]
  }'::jsonb,
  'c0010000-0000-4000-8000-000000000006',
  '2026-02-26 14:00:00+00'
);

-- ============================================================
-- PROJECT 4: Knowledge Base Redesign (steps 1-2 complete, step 3 in progress)
-- ============================================================

INSERT INTO project_forms (id, project_id, step, form_type, title, data, created_by, created_at) VALUES
-- Step 1: Problem Statement
(
  'ff040100-0000-4000-8000-000000000001',
  'f0010000-0000-4000-8000-000000000004',
  'identify',
  'problem_statement',
  'problem_statement',
  '{
    "asIs": "The knowledge base has 340 articles, but 47% are outdated (last updated >6 months ago). Search returns irrelevant results 60% of the time according to user testing. Only 12% of KB visitors find an answer without filing a ticket. The KB was designed for internal agent reference, not customer self-service.",
    "desired": "A customer-friendly knowledge base with 95%+ articles current, search relevance >80%, and self-service resolution rate above 40%. AI-powered article suggestions on the ticket form that deflect at least 20% of tickets before submission.",
    "gap": "28 percentage points gap in self-service rate (12% vs 40%). 33 percentage points gap in search relevance (60% irrelevant vs <20% target). 47% of articles need updating or archiving.",
    "problemStatement": "Only 12% of customers who visit the knowledge base find an answer without filing a ticket because 47% of articles are outdated, search relevance is poor (60% irrelevant results), and content is written for agents rather than customers. This drives an estimated 800 unnecessary tickets per month.",
    "teamMembers": ["Carlos Mendez", "Aisha Patel", "Priya Sharma", "Rachel Foster"],
    "problemArea": "Customer Self-Service & Knowledge Management",
    "dataSources": ["KB analytics (page views, search queries, bounce rate)", "User testing sessions (5 customers)", "Article freshness audit", "Ticket-to-article correlation analysis"]
  }'::jsonb,
  'c0010000-0000-4000-8000-000000000010',
  '2026-02-24 14:00:00+00'
),

-- Step 2: Fishbone
(
  'ff040200-0000-4000-8000-000000000001',
  'f0010000-0000-4000-8000-000000000004',
  'analyze',
  'fishbone',
  'fishbone',
  '{
    "problemStatement": "Only 12% of KB visitors resolve their issue without filing a ticket",
    "categories": [
      {
        "name": "Material (Inputs)",
        "causes": [
          {"text": "47% of articles are outdated (>6 months since update)", "subCauses": ["No content refresh cadence", "No article owners assigned"]},
          {"text": "Articles written in technical jargon for agents", "subCauses": ["No customer-facing writing guide", "Original authors were engineers"]},
          {"text": "Missing articles for top 20 ticket categories", "subCauses": ["No gap analysis done", "New features lack KB articles"]}
        ]
      },
      {
        "name": "Machine (Equipment)",
        "causes": [
          {"text": "Search engine returns irrelevant results", "subCauses": ["Basic keyword matching only", "No semantic search", "No synonym handling"]},
          {"text": "No suggested articles on ticket form", "subCauses": ["Ticket form and KB not integrated", "No deflection mechanism"]}
        ]
      },
      {
        "name": "Method (Process)",
        "causes": [
          {"text": "No content governance process", "subCauses": ["No review cycle", "No archival policy", "No quality standards"]},
          {"text": "No feedback mechanism for articles", "subCauses": ["Customers cannot rate articles", "No 'was this helpful?' widget"]}
        ]
      },
      {
        "name": "Measurement (Metrics)",
        "causes": [
          {"text": "Self-service rate never tracked until now", "subCauses": ["No analytics on KB effectiveness", "Success defined as page views not resolutions"]}
        ]
      },
      {
        "name": "Man (People)",
        "causes": [
          {"text": "No dedicated KB content owner", "subCauses": ["Carlos is first content hire", "Previously agent volunteer work"]},
          {"text": "Agents do not contribute KB articles from resolved tickets", "subCauses": ["No process to convert ticket resolutions to articles", "No incentive"]}
        ]
      },
      {
        "name": "Mother Nature (Environment)",
        "causes": [
          {"text": "Product evolves faster than documentation", "subCauses": ["3 major releases in 6 months", "No doc-update requirement in release checklist"]}
        ]
      }
    ]
  }'::jsonb,
  'c0010000-0000-4000-8000-000000000010',
  '2026-02-26 14:00:00+00'
),

-- Step 3: Brainstorming (in progress)
(
  'ff040300-0000-4000-8000-000000000001',
  'f0010000-0000-4000-8000-000000000004',
  'generate',
  'brainstorming',
  'brainstorming',
  '{
    "ideas": [
      {"id": "kb-01", "text": "Implement Algolia search for semantic KB search", "author": "Priya Sharma", "votes": 6, "category": "Search"},
      {"id": "kb-02", "text": "Create article templates with customer-friendly language guidelines", "author": "Carlos Mendez", "votes": 7, "category": "Content"},
      {"id": "kb-03", "text": "Build ticket-to-article pipeline: when a ticket is resolved, suggest creating a KB article", "author": "Aisha Patel", "votes": 7, "category": "Process"},
      {"id": "kb-04", "text": "Add AI-powered article suggestions on ticket submission form", "author": "Priya Sharma", "votes": 8, "category": "Deflection"},
      {"id": "kb-05", "text": "Audit and archive/update all 340 articles in a 2-week sprint", "author": "Carlos Mendez", "votes": 6, "category": "Content"},
      {"id": "kb-06", "text": "Add ''Was this helpful?'' feedback widget to every article", "author": "Rachel Foster", "votes": 5, "category": "Feedback"},
      {"id": "kb-07", "text": "Create video tutorials for top 10 common issues", "author": "Rachel Foster", "votes": 4, "category": "Content"},
      {"id": "kb-08", "text": "Build community forum where customers help each other", "author": "Carlos Mendez", "votes": 3, "category": "Community"},
      {"id": "kb-09", "text": "Implement article versioning tied to product releases", "author": "Aisha Patel", "votes": 5, "category": "Process"},
      {"id": "kb-10", "text": "Add required KB article checkbox to product release checklist", "author": "Carlos Mendez", "votes": 6, "category": "Process"},
      {"id": "kb-11", "text": "Monthly content review cadence with article owners", "author": "Rachel Foster", "votes": 5, "category": "Process"},
      {"id": "kb-12", "text": "Chatbot that surfaces KB articles in conversational format", "author": "Priya Sharma", "votes": 5, "category": "AI"},
      {"id": "kb-13", "text": "Restructure KB into problem-based categories (not product-based)", "author": "Carlos Mendez", "votes": 6, "category": "Structure"},
      {"id": "kb-14", "text": "Agent incentive: bonus for each ticket converted to KB article", "author": "Aisha Patel", "votes": 3, "category": "Motivation"},
      {"id": "kb-15", "text": "A/B test article formats (step-by-step vs FAQ vs video) to find best conversion", "author": "Rachel Foster", "votes": 4, "category": "Content"}
    ],
    "selectedIdeas": ["kb-01", "kb-02", "kb-03", "kb-04", "kb-05", "kb-06", "kb-10", "kb-13"],
    "eliminatedIdeas": ["kb-08"]
  }'::jsonb,
  'c0010000-0000-4000-8000-000000000010',
  '2026-03-03 14:00:00+00'
);

-- ============================================================
-- PROJECT 5: Training & Certification (step 1 complete, step 2 in progress)
-- ============================================================

INSERT INTO project_forms (id, project_id, step, form_type, title, data, created_by, created_at) VALUES
-- Step 1: Problem Statement
(
  'ff050100-0000-4000-8000-000000000001',
  'f0010000-0000-4000-8000-000000000005',
  'identify',
  'problem_statement',
  'problem_statement',
  '{
    "asIs": "New support agents take an average of 12 weeks to reach full productivity (handling 80% of ticket types independently). During ramp-up, their first response time is 2.3x the team average and CSAT scores are 0.8 points lower. Training consists of ad hoc mentoring by senior agents, with no curriculum, no assessments, and no defined milestones.",
    "desired": "Structured 4-week onboarding program with defined curriculum, weekly skill assessments, and certification tiers (Bronze/Silver/Gold). New agents reach 80% independence in 4 weeks (down from 12). Response quality matches team average within 6 weeks.",
    "gap": "8-week gap in ramp-up time (12 weeks vs 4 weeks target). No structured curriculum exists. No assessment mechanism. Inconsistent quality during ramp.",
    "problemStatement": "New support agents take 12 weeks to reach full productivity — 3x the industry benchmark of 4 weeks — because there is no structured training curriculum, no skill assessments, and no defined ramp milestones. This causes 2.3x longer response times and 0.8 points lower CSAT during the ramp period, directly undermining our response time improvement efforts.",
    "teamMembers": ["Lisa Nguyen", "James O''Brien", "Aisha Patel", "Marcus Rivera"],
    "problemArea": "Agent Training & Development",
    "dataSources": ["Agent ramp-up metrics (last 8 hires)", "Industry benchmarking report", "Agent satisfaction survey", "Senior agent interviews (4 conducted)"]
  }'::jsonb,
  'c0010000-0000-4000-8000-000000000007',
  '2026-03-03 14:00:00+00'
),

-- Step 2: Fishbone (in progress)
(
  'ff050200-0000-4000-8000-000000000001',
  'f0010000-0000-4000-8000-000000000005',
  'analyze',
  'fishbone',
  'fishbone',
  '{
    "problemStatement": "New agents take 12 weeks to reach full productivity (target: 4 weeks)",
    "categories": [
      {
        "name": "Method (Process)",
        "causes": [
          {"text": "No structured training curriculum", "subCauses": ["Ad hoc mentoring varies by mentor", "No lesson plans or modules"]},
          {"text": "No defined ramp milestones", "subCauses": ["No week-by-week goals", "No clear definition of done"]},
          {"text": "No skill assessment mechanism", "subCauses": ["Readiness judged subjectively by mentor", "No practical skill tests"]}
        ]
      },
      {
        "name": "Man (People)",
        "causes": [
          {"text": "Senior agents are inconsistent mentors", "subCauses": ["No train-the-trainer program", "Mentoring is added to existing workload"]},
          {"text": "New hires have varying baseline skills", "subCauses": ["No pre-hire assessment", "Mixed technical backgrounds"]}
        ]
      },
      {
        "name": "Material (Inputs)",
        "causes": [
          {"text": "No training materials exist", "subCauses": ["No documentation of common scenarios", "No practice exercises", "No recorded examples"]},
          {"text": "Knowledge base gaps (see Project 4)", "subCauses": ["New agents cannot self-study effectively", "Outdated articles teach wrong procedures"]}
        ]
      },
      {
        "name": "Machine (Equipment)",
        "causes": [
          {"text": "No sandbox environment for practice", "subCauses": ["New agents practice on real tickets", "Mistakes affect real customers"]},
          {"text": "No LMS or training platform", "subCauses": ["All training is verbal", "No progress tracking"]}
        ]
      },
      {
        "name": "Measurement (Metrics)",
        "causes": [
          {"text": "Ramp-up progress not tracked systematically", "subCauses": ["No weekly competency checks", "Manager relies on gut feeling"]},
          {"text": "Quality metrics not segmented by agent tenure", "subCauses": ["Cannot isolate new-agent impact", "Training ROI not measurable"]}
        ]
      },
      {
        "name": "Mother Nature (Environment)",
        "causes": [
          {"text": "Product complexity growing", "subCauses": ["More features = more to learn", "Training scope keeps expanding"]}
        ]
      }
    ]
  }'::jsonb,
  'c0010000-0000-4000-8000-000000000007',
  '2026-03-05 14:00:00+00'
),

-- Step 2: Five Why (in progress)
(
  'ff050200-0000-4000-8000-000000000002',
  'f0010000-0000-4000-8000-000000000005',
  'analyze',
  'five_why',
  'five_why',
  '{
    "problemStatement": "New agents take 12 weeks to reach full productivity",
    "whys": [
      {"question": "Why does it take 12 weeks?", "answer": "New agents do not know how to handle most ticket types independently and must escalate to senior agents, which creates a dependency bottleneck."},
      {"question": "Why can they not handle tickets independently sooner?", "answer": "They learn by trial and error on live tickets because there is no structured curriculum that teaches ticket types, tools, and procedures systematically."},
      {"question": "Why is there no structured curriculum?", "answer": "Training has always been done through ad hoc mentoring. When the team was small (5 agents), this worked. It broke down as the team grew to 14 and turnover increased."},
      {"question": "Why was mentoring not replaced with structured training as the team grew?", "answer": "No one was responsible for training design. The support manager (Marcus) focused on operations. The company did not hire a training specialist until Lisa joined last month."},
      {"question": "Why was a training specialist not hired earlier?", "answer": "The urgency was not visible because agent ramp metrics were not tracked. The 12-week ramp was discovered only when this initiative began collecting data."}
    ],
    "rootCause": "The lack of a dedicated training function and the absence of ramp-up metrics meant the 12-week problem was invisible. Now that Lisa is in place and the data is visible, we can build a structured program for the first time."
  }'::jsonb,
  'c0010000-0000-4000-8000-000000000007',
  '2026-03-06 10:00:00+00'
);

COMMIT;
