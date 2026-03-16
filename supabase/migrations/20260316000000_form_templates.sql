-- ============================================================
-- Form Template Library (F5)
-- ============================================================
-- Allows users to start from pre-filled forms rather than
-- filling every form from scratch for each project.
--
-- Design decisions:
--   - org_id IS NULL means "system/global template" (shipped with app)
--   - is_system = true guards system templates from accidental deletion
--   - usage_count is incremented by the applyTemplate server action
--   - category is free-text (not an enum) so new categories can be
--     added without migrations
-- ============================================================

CREATE TABLE form_templates (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT,
  category      TEXT NOT NULL,
  step          pips_step NOT NULL,
  form_type     TEXT NOT NULL,
  data          JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_system     BOOLEAN NOT NULL DEFAULT false,
  created_by    UUID REFERENCES auth.users(id),
  usage_count   INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE form_templates IS 'Reusable form templates — either system-global (org_id IS NULL, is_system = true) or org-specific (org_id set, is_system = false)';
COMMENT ON COLUMN form_templates.org_id IS 'NULL = global/system template visible to all orgs; set = private to that org';
COMMENT ON COLUMN form_templates.is_system IS 'true = shipped with the app; cannot be deleted by regular users';
COMMENT ON COLUMN form_templates.usage_count IS 'Incremented each time a user applies the template to a project form';
COMMENT ON COLUMN form_templates.category IS 'Industry/domain category e.g. manufacturing, customer-service, it, hr, quality';

-- ============================================================
-- INDEXES
-- ============================================================

-- Primary lookup path: filter by org + category + step + form_type
CREATE INDEX idx_form_templates_org_category_step_form
  ON form_templates(org_id, category, step, form_type);

-- Secondary lookup: all templates for a given step + form_type (for template picker)
CREATE INDEX idx_form_templates_step_form_type
  ON form_templates(step, form_type);

-- Popular templates (sort by usage)
CREATE INDEX idx_form_templates_usage_count
  ON form_templates(usage_count DESC);

-- ============================================================
-- AUTO-UPDATE TRIGGER
-- ============================================================

CREATE TRIGGER set_form_templates_updated_at
  BEFORE UPDATE ON form_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE form_templates ENABLE ROW LEVEL SECURITY;

-- READ: users can see system templates (org_id IS NULL) AND their org's templates
CREATE POLICY "Users can view system and own-org templates" ON form_templates
  FOR SELECT USING (
    org_id IS NULL
    OR org_id IN (SELECT user_org_ids())
  );

-- CREATE: any org member (member+) can create templates scoped to their org
CREATE POLICY "Org members can create templates for their org" ON form_templates
  FOR INSERT WITH CHECK (
    org_id IS NOT NULL
    AND org_id IN (SELECT user_org_ids())
    AND is_system = false
    AND created_by = auth.uid()
  );

-- UPDATE: only the template creator or a manager+ can update org-owned templates;
--         system templates cannot be updated via RLS (is_system guard)
CREATE POLICY "Creators and managers can update org templates" ON form_templates
  FOR UPDATE USING (
    org_id IS NOT NULL
    AND is_system = false
    AND org_id IN (SELECT user_org_ids())
    AND (
      created_by = auth.uid()
      OR user_has_org_role(org_id, ARRAY['owner'::org_role, 'admin'::org_role, 'manager'::org_role])
    )
  );

-- DELETE: only managers+ can delete org templates; system templates are protected
CREATE POLICY "Managers can delete org templates" ON form_templates
  FOR DELETE USING (
    org_id IS NOT NULL
    AND is_system = false
    AND user_has_org_role(org_id, ARRAY['owner'::org_role, 'admin'::org_role, 'manager'::org_role])
  );

-- ============================================================
-- RPC: increment_template_usage
-- ============================================================
-- Called by the applyTemplate server action after a successful
-- form upsert. Uses a direct UPDATE rather than a read-modify-write
-- to avoid race conditions. SECURITY DEFINER so it can bypass RLS
-- on the usage_count column (users cannot UPDATE system templates
-- but we still want to track usage for them).
-- ============================================================

CREATE OR REPLACE FUNCTION increment_template_usage(template_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE form_templates
  SET usage_count = usage_count + 1
  WHERE id = template_id;
END;
$$;

-- ============================================================
-- SEED DATA — System Templates
-- ============================================================
-- 12 templates across: manufacturing (3), customer-service (3),
-- it (2), hr (2), quality (2)
-- ============================================================

-- ------------------------------------------------------------
-- MANUFACTURING — Step 1 — Problem Statement
-- "Reduce defect rate on assembly line"
-- ------------------------------------------------------------
INSERT INTO form_templates (
  id, org_id, name, description, category, step, form_type, data, is_system, created_by
) VALUES (
  'f0000001-0000-4000-8000-000000000001',
  NULL,
  'Reduce Assembly Line Defect Rate',
  'Pre-filled template for tackling quality defects on a manufacturing assembly line. Covers current defect metrics, target state, and gap framing.',
  'manufacturing',
  'identify',
  'problem_statement',
  '{
    "asIs": "Current defect rate on Line 3 averages 4.2% over the past 90 days (measured by end-of-line QC inspection). Rework labor costs $18,500/month and 12% of defective units are customer returns.",
    "desired": "Achieve a defect rate of ≤1.0% within 6 months, eliminating customer returns caused by manufacturing defects and reducing rework costs by at least 75%.",
    "gap": "The current 4.2% defect rate is 3.2 percentage points above the 1.0% target. Rework and return costs exceed acceptable thresholds by approximately $14,000/month.",
    "problemStatement": "Line 3 defect rate of 4.2% — 4× above the 1.0% target — drives $14,000/month in excess rework cost and accounts for 12% of customer returns. We must identify and eliminate root causes within 6 months.",
    "teamMembers": ["Quality Engineer", "Line Supervisor", "Maintenance Technician", "Process Engineer"],
    "problemArea": "quality",
    "dataSources": ["End-of-line QC inspection logs", "Customer return reports (90-day)", "Rework labor time sheets", "Machine downtime records"]
  }'::jsonb,
  true,
  NULL
);

-- ------------------------------------------------------------
-- MANUFACTURING — Step 2 — Fishbone
-- Service quality issues on assembly line
-- ------------------------------------------------------------
INSERT INTO form_templates (
  id, org_id, name, description, category, step, form_type, data, is_system, created_by
) VALUES (
  'f0000001-0000-4000-8000-000000000002',
  NULL,
  'Assembly Line Defect Root Cause Analysis',
  'Pre-filled fishbone for manufacturing defect investigations. Causes span equipment calibration, operator skill gaps, material variance, and measurement error.',
  'manufacturing',
  'analyze',
  'fishbone',
  '{
    "problemStatement": "Line 3 defect rate of 4.2% — 4× above the 1.0% target",
    "categories": [
      {
        "name": "Man (People)",
        "causes": [
          {"text": "Operator training gaps on new tooling procedures", "subCauses": ["No SOP update after tooling change", "Operators self-trained without verification"]},
          {"text": "High turnover on Line 3 — 40% new hires in 90 days", "subCauses": []},
          {"text": "Fatigue on extended shifts (12-hour cycles)", "subCauses": []}
        ]
      },
      {
        "name": "Machine (Equipment)",
        "causes": [
          {"text": "Torque wrench calibration drift (Station 7)", "subCauses": ["Last calibration 9 months ago", "Calibration schedule not enforced"]},
          {"text": "Vision inspection camera lens contamination", "subCauses": []},
          {"text": "Conveyor speed variance exceeds ±5% tolerance", "subCauses": []}
        ]
      },
      {
        "name": "Method (Process)",
        "causes": [
          {"text": "No standardized work instructions posted at station", "subCauses": []},
          {"text": "Inspection checkpoint skipped during surge production", "subCauses": []},
          {"text": "Rework loop re-enters line at wrong stage", "subCauses": []}
        ]
      },
      {
        "name": "Material (Inputs)",
        "causes": [
          {"text": "Incoming part dimension variance outside spec (Supplier B)", "subCauses": ["No incoming inspection for Supplier B parts", "Supplier B dimensional tolerance wider than spec"]},
          {"text": "Lubricant substitution during shortage — wrong viscosity", "subCauses": []}
        ]
      },
      {
        "name": "Measurement (Metrics)",
        "causes": [
          {"text": "Defect categorization inconsistent across shifts", "subCauses": ["Day shift counts cosmetic defects; night shift does not"]},
          {"text": "Gauge R&R study not performed in 18 months", "subCauses": []}
        ]
      },
      {
        "name": "Mother Nature (Environment)",
        "causes": [
          {"text": "Temperature swings in Q1 affect adhesive cure time", "subCauses": []},
          {"text": "Humidity exceeds spec range in summer months", "subCauses": []}
        ]
      }
    ]
  }'::jsonb,
  true,
  NULL
);

-- ------------------------------------------------------------
-- MANUFACTURING — Step 4 — Criteria Matrix
-- Evaluate defect-reduction solutions
-- ------------------------------------------------------------
INSERT INTO form_templates (
  id, org_id, name, description, category, step, form_type, data, is_system, created_by
) VALUES (
  'f0000001-0000-4000-8000-000000000003',
  NULL,
  'Manufacturing Solution Evaluation Matrix',
  'Criteria matrix pre-loaded with typical evaluation dimensions for manufacturing process improvements: cost, implementation speed, defect reduction impact, and sustainability.',
  'manufacturing',
  'select_plan',
  'criteria_matrix',
  '{
    "criteria": [
      {"name": "Defect Reduction Impact", "weight": 10, "description": "Expected reduction in defect rate (higher = more impact)"},
      {"name": "Implementation Cost", "weight": 8, "description": "Total cost including equipment, training, and downtime (higher score = lower cost)"},
      {"name": "Time to Implement", "weight": 7, "description": "Speed to full deployment (higher score = faster)"},
      {"name": "Operator Buy-in", "weight": 6, "description": "Likelihood of adoption and compliance on the floor"},
      {"name": "Sustainability", "weight": 9, "description": "Likelihood the improvement holds over 12+ months without backsliding"},
      {"name": "Risk of Production Disruption", "weight": 8, "description": "Risk of line stoppage during implementation (higher score = lower risk)"}
    ],
    "solutions": [
      {"name": "Solution A", "scores": {}},
      {"name": "Solution B", "scores": {}},
      {"name": "Solution C", "scores": {}}
    ]
  }'::jsonb,
  true,
  NULL
);

-- ------------------------------------------------------------
-- CUSTOMER SERVICE — Step 1 — Problem Statement
-- "Reduce average handle time and improve CSAT"
-- ------------------------------------------------------------
INSERT INTO form_templates (
  id, org_id, name, description, category, step, form_type, data, is_system, created_by
) VALUES (
  'f0000001-0000-4000-8000-000000000004',
  NULL,
  'Improve Customer Service Response Time',
  'Template for service teams targeting handle-time reduction or CSAT improvement. Includes current baseline metrics and measurable target state.',
  'customer-service',
  'identify',
  'problem_statement',
  '{
    "asIs": "Average handle time (AHT) is 8.4 minutes per call, above the 6.0-minute industry benchmark. Customer satisfaction score (CSAT) averaged 3.6/5.0 in Q4, down from 4.1 in Q3. First-call resolution rate is 62%.",
    "desired": "Reduce AHT to ≤6.0 minutes, raise CSAT to ≥4.2/5.0, and increase first-call resolution to ≥78% within the next quarter.",
    "gap": "AHT is 2.4 minutes (40%) above benchmark. CSAT has dropped 0.5 points QoQ. FCR is 16 percentage points below target. These gaps contribute to estimated $220K/year in excess staffing cost.",
    "problemStatement": "Customer service AHT of 8.4 min — 40% above benchmark — combined with a CSAT decline to 3.6/5.0 and 62% FCR signals a service quality crisis costing an estimated $220K/year in excess staffing. We must close all three gaps within one quarter.",
    "teamMembers": ["Contact Center Manager", "Quality Assurance Lead", "Training Specialist", "Systems Administrator"],
    "problemArea": "quality",
    "dataSources": ["CRM call duration reports", "CSAT survey results (Q3–Q4)", "First-call resolution tracking", "Agent utilization dashboards"]
  }'::jsonb,
  true,
  NULL
);

-- ------------------------------------------------------------
-- CUSTOMER SERVICE — Step 2 — Fishbone
-- Root causes for poor service quality
-- ------------------------------------------------------------
INSERT INTO form_templates (
  id, org_id, name, description, category, step, form_type, data, is_system, created_by
) VALUES (
  'f0000001-0000-4000-8000-000000000005',
  NULL,
  'Customer Service Quality Fishbone',
  'Fishbone pre-filled with common root causes for service quality issues: knowledge gaps, system friction, process complexity, and staffing.',
  'customer-service',
  'analyze',
  'fishbone',
  '{
    "problemStatement": "Customer service AHT 40% above benchmark and CSAT declining QoQ",
    "categories": [
      {
        "name": "Man (People)",
        "causes": [
          {"text": "Agents lack product knowledge for new features launched in Q3", "subCauses": ["Training completed only for 60% of team", "No knowledge base update after product launch"]},
          {"text": "High agent turnover (35% in 12 months) — institutional knowledge lost", "subCauses": []},
          {"text": "Supervisor-to-agent ratio too high (1:18) for real-time coaching", "subCauses": []}
        ]
      },
      {
        "name": "Machine (Equipment)",
        "causes": [
          {"text": "CRM lookup latency averages 4.2 seconds per search", "subCauses": ["Unindexed customer table growing past 2M records", "On-premise CRM server CPU at 85% sustained load"]},
          {"text": "Knowledge base search returns irrelevant results (low recall)", "subCauses": []},
          {"text": "Softphone drops calls when VPN reconnects", "subCauses": []}
        ]
      },
      {
        "name": "Method (Process)",
        "causes": [
          {"text": "Escalation process requires 3 transfers before reaching the right team", "subCauses": []},
          {"text": "No standardized call opening script — wide variation in AHT", "subCauses": []},
          {"text": "After-call work (ACW) not separated from handle time in metrics", "subCauses": []}
        ]
      },
      {
        "name": "Material (Inputs)",
        "causes": [
          {"text": "Inbound contact volume spiked 55% after product launch with no staffing change", "subCauses": []},
          {"text": "Complex billing queries require manual account research not supported by CRM", "subCauses": []}
        ]
      },
      {
        "name": "Measurement (Metrics)",
        "causes": [
          {"text": "CSAT survey sent 48 hours post-interaction — recall bias", "subCauses": []},
          {"text": "AHT goal not communicated to agents — no real-time visibility", "subCauses": []}
        ]
      },
      {
        "name": "Mother Nature (Environment)",
        "causes": [
          {"text": "Remote agents on home internet experience higher latency and call drop rate", "subCauses": []}
        ]
      }
    ]
  }'::jsonb,
  true,
  NULL
);

-- ------------------------------------------------------------
-- CUSTOMER SERVICE — Step 6 — Evaluation
-- Post-implementation CSAT and AHT review
-- ------------------------------------------------------------
INSERT INTO form_templates (
  id, org_id, name, description, category, step, form_type, data, is_system, created_by
) VALUES (
  'f0000001-0000-4000-8000-000000000006',
  NULL,
  'Customer Service Improvement Evaluation',
  'Evaluation template for customer service improvement projects. Pre-seeded with relevant service metrics: AHT, CSAT, and first-call resolution.',
  'customer-service',
  'evaluate',
  'evaluation',
  '{
    "goalsAchieved": false,
    "goalDetails": "Update this field after measuring post-implementation AHT, CSAT, and FCR against the targets set in Step 1.",
    "effectivenessRating": 3,
    "sustainabilityRating": 3,
    "teamSatisfactionRating": 3,
    "unexpectedOutcomes": "Document any unexpected findings — e.g., changes in call volume, new issue categories surfaced, or agent behavior shifts.",
    "recommendations": "Based on results: (1) reinforce training quarterly, (2) schedule CRM performance review in 60 days, (3) re-run CSAT baseline in next quarter.",
    "nextSteps": "Schedule 30-day and 90-day check-ins. Assign owners for each KPI. Create tickets for any residual issues identified during implementation."
  }'::jsonb,
  true,
  NULL
);

-- ------------------------------------------------------------
-- IT / ENGINEERING — Step 1 — Problem Statement
-- "System reliability / uptime degradation"
-- ------------------------------------------------------------
INSERT INTO form_templates (
  id, org_id, name, description, category, step, form_type, data, is_system, created_by
) VALUES (
  'f0000001-0000-4000-8000-000000000007',
  NULL,
  'Improve System Reliability and Uptime',
  'Problem statement template for IT reliability projects. Pre-populated with SLA breach framing, incident metrics, and business impact quantification.',
  'it',
  'identify',
  'problem_statement',
  '{
    "asIs": "Production system availability averaged 97.8% over the past 6 months, breaching the 99.5% SLA commitment. Incidents average 3 per month with MTTR of 2.4 hours. The last major outage (4.5 hours) impacted ~8,000 users and caused an estimated $95,000 in lost revenue.",
    "desired": "Achieve ≥99.5% availability SLA compliance, reduce incident frequency to ≤1 per month, and lower MTTR to ≤45 minutes within 6 months.",
    "gap": "Availability gap: 1.7 percentage points (97.8% vs 99.5% SLA). Incident frequency is 3× target. MTTR is 3.2× target. Estimated SLA penalty risk: $120,000/year.",
    "problemStatement": "Production system availability of 97.8% — 1.7pp below our 99.5% SLA — with 3 incidents/month averaging 2.4-hour MTTR exposes the business to ~$120,000/year in SLA penalties and erodes customer trust. We must close the gap within 6 months.",
    "teamMembers": ["Platform Engineering Lead", "SRE On-call", "DevOps Engineer", "Product Owner"],
    "problemArea": "quality",
    "dataSources": ["PagerDuty incident log (6 months)", "Uptime monitoring (Datadog)", "SLA breach reports", "Post-mortem documents"]
  }'::jsonb,
  true,
  NULL
);

-- ------------------------------------------------------------
-- IT / ENGINEERING — Step 4 — Criteria Matrix
-- Tech solution evaluation (cost, security, scalability)
-- ------------------------------------------------------------
INSERT INTO form_templates (
  id, org_id, name, description, category, step, form_type, data, is_system, created_by
) VALUES (
  'f0000001-0000-4000-8000-000000000008',
  NULL,
  'IT Solution Evaluation Matrix',
  'Criteria matrix for evaluating technology solutions. Pre-loaded with engineering criteria: cost, security, scalability, maintainability, and time-to-value.',
  'it',
  'select_plan',
  'criteria_matrix',
  '{
    "criteria": [
      {"name": "Implementation Cost", "weight": 8, "description": "Total cost of ownership — licensing, infra, engineering hours (higher score = lower cost)"},
      {"name": "Security Posture", "weight": 10, "description": "Security controls, compliance alignment, and attack surface reduction"},
      {"name": "Scalability", "weight": 9, "description": "Ability to handle 3-5× current load without re-architecture"},
      {"name": "Maintainability", "weight": 8, "description": "Ease of ongoing maintenance, debugging, and onboarding new engineers"},
      {"name": "Time to Value", "weight": 7, "description": "Speed to production deployment and realized benefit (higher = faster)"},
      {"name": "Vendor / Technology Risk", "weight": 6, "description": "Maturity, community support, and lock-in risk (higher = lower risk)"},
      {"name": "Team Familiarity", "weight": 5, "description": "Existing skills within the team — reduces learning curve and ramp time"}
    ],
    "solutions": [
      {"name": "Option A", "scores": {}},
      {"name": "Option B", "scores": {}},
      {"name": "Option C", "scores": {}}
    ]
  }'::jsonb,
  true,
  NULL
);

-- ------------------------------------------------------------
-- HR — Step 1 — Problem Statement
-- "Reduce employee turnover"
-- ------------------------------------------------------------
INSERT INTO form_templates (
  id, org_id, name, description, category, step, form_type, data, is_system, created_by
) VALUES (
  'f0000001-0000-4000-8000-000000000009',
  NULL,
  'Reduce Employee Voluntary Turnover',
  'Problem statement for HR retention initiatives. Covers current turnover rate, cost per departure, and target state with measurable goals.',
  'hr',
  'identify',
  'problem_statement',
  '{
    "asIs": "Annual voluntary turnover reached 28% last fiscal year, up from 19% the prior year. Average cost per departure (recruiting, onboarding, lost productivity) is estimated at 1.2× annual salary. Time-to-fill open roles averages 62 days.",
    "desired": "Reduce voluntary turnover to ≤15% within 12 months. Lower time-to-fill to ≤35 days. Maintain or improve employee engagement score from current 3.4/5.0 to ≥4.0/5.0.",
    "gap": "Turnover is 13 percentage points above target (28% vs 15%). At an average salary of $65K, the excess turnover costs approximately $4.2M annually. Time-to-fill is 27 days over target.",
    "problemStatement": "Voluntary turnover of 28% — nearly double our 15% target — costs an estimated $4.2M annually in replacement and onboarding expense while leaving critical roles unfilled for 62 days on average. We must identify and address root causes within 12 months.",
    "teamMembers": ["HR Director", "People Analytics Lead", "Compensation & Benefits Manager", "Department Managers"],
    "problemArea": "morale",
    "dataSources": ["HRIS turnover reports (2 years)", "Exit interview summaries", "Employee engagement survey (Q4)", "Recruiting funnel metrics", "Industry compensation benchmarks"]
  }'::jsonb,
  true,
  NULL
);

-- ------------------------------------------------------------
-- HR — Step 2 — Five Why
-- Root cause of employee turnover
-- ------------------------------------------------------------
INSERT INTO form_templates (
  id, org_id, name, description, category, step, form_type, data, is_system, created_by
) VALUES (
  'f0000001-0000-4000-8000-000000000010',
  NULL,
  'Employee Turnover Five-Why Analysis',
  'Five-Why template structured around a common turnover scenario. Guides teams from surface symptoms through compensation, career growth, and manager effectiveness.',
  'hr',
  'analyze',
  'five_why',
  '{
    "problemStatement": "Voluntary turnover of 28% — nearly double our 15% target — costs ~$4.2M annually",
    "whys": [
      {
        "question": "Why are employees leaving voluntarily at 28%?",
        "answer": "Exit interviews indicate 64% of departing employees cite better compensation or career growth opportunities elsewhere."
      },
      {
        "question": "Why are employees finding better compensation or growth elsewhere?",
        "answer": "Our compensation bands were last benchmarked 3 years ago and are now 12–18% below market median for key roles. Internal promotion rate is only 8% annually."
      },
      {
        "question": "Why were compensation bands not updated and internal promotions not happening?",
        "answer": "The annual compensation review was deprioritized during two consecutive budget freezes. The promotion process requires a 24-month tenure minimum that was never revisited."
      },
      {
        "question": "Why were compensation reviews deprioritized and promotion policies not revisited?",
        "answer": "HR lacked a defined owner and process to escalate compensation competitiveness to leadership. No employee retention KPIs were tracked at the executive level."
      },
      {
        "question": "Why was there no owner, process, or executive visibility on retention KPIs?",
        "answer": "Retention was treated as a lagging outcome rather than a managed business metric — no dashboards, no quarterly reviews, and no budget allocated to retention programs."
      }
    ],
    "rootCause": "Retention was never treated as a managed business metric with executive ownership, dedicated budget, and quarterly KPI review — leading to 3 years of unaddressed compensation drift and stagnant internal mobility."
  }'::jsonb,
  true,
  NULL
);

-- ------------------------------------------------------------
-- QUALITY — Step 1 — Impact Assessment
-- Quality system baseline assessment
-- ------------------------------------------------------------
INSERT INTO form_templates (
  id, org_id, name, description, category, step, form_type, data, is_system, created_by
) VALUES (
  'f0000001-0000-4000-8000-000000000011',
  NULL,
  'Quality System Impact Assessment',
  'Impact assessment pre-filled for quality-related problems. Covers financial cost of poor quality, customer impact, and risk priority scoring guidance.',
  'quality',
  'identify',
  'impact_assessment',
  '{
    "financialImpact": "Cost of poor quality (COPQ) estimated at $380,000/year: scrap ($145K), rework ($120K), warranty returns ($85K), and customer concessions ($30K). These figures represent 4.8% of revenue.",
    "customerImpact": "12% of defects result in customer-visible issues. NPS dropped 8 points in the past two quarters. Three key accounts flagged quality concerns in their quarterly business reviews.",
    "employeeImpact": "Quality team spending 60% of time on reactive firefighting vs. proactive improvement. Morale survey shows quality staff at 3.1/5.0 satisfaction vs. company average of 3.8.",
    "processImpact": "Production line yields average 91.8% first-pass, requiring rework on 1 in 12 units. Process capability Cpk for critical dimensions averages 1.02 — below the 1.33 minimum target.",
    "severityRating": 4,
    "frequencyRating": 4,
    "detectionRating": 3,
    "riskPriorityNumber": 48
  }'::jsonb,
  true,
  NULL
);

-- ------------------------------------------------------------
-- QUALITY — Step 6 — Before/After
-- Compare quality metrics pre- and post-improvement
-- ------------------------------------------------------------
INSERT INTO form_templates (
  id, org_id, name, description, category, step, form_type, data, is_system, created_by
) VALUES (
  'f0000001-0000-4000-8000-000000000012',
  NULL,
  'Quality Improvement Before/After Comparison',
  'Before-after template for quality improvement projects. Pre-loaded with standard quality metrics: defect rate, first-pass yield, COPQ, and customer returns.',
  'quality',
  'evaluate',
  'before_after',
  '{
    "metrics": [
      {
        "name": "Defect Rate",
        "before": "4.2%",
        "after": "",
        "unit": "%",
        "improvement": "Fill in after-state measurement"
      },
      {
        "name": "First-Pass Yield",
        "before": "91.8%",
        "after": "",
        "unit": "%",
        "improvement": "Fill in after-state measurement"
      },
      {
        "name": "Cost of Poor Quality (COPQ)",
        "before": "$380,000/year",
        "after": "",
        "unit": "$/year",
        "improvement": "Fill in after-state measurement"
      },
      {
        "name": "Customer Returns (Quality-Related)",
        "before": "12% of defects",
        "after": "",
        "unit": "% of defects",
        "improvement": "Fill in after-state measurement"
      },
      {
        "name": "Process Capability (Cpk)",
        "before": "1.02",
        "after": "",
        "unit": "Cpk index",
        "improvement": "Fill in after-state measurement"
      }
    ],
    "summary": "Update this summary once after-state data is collected. Compare actual results against targets set in Step 1 and assess whether the improvement is statistically significant and sustained."
  }'::jsonb,
  true,
  NULL
);
