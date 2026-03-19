-- Add impact_metrics and results_metrics to the form type constraint
ALTER TABLE project_forms DROP CONSTRAINT IF EXISTS chk_form_type;
ALTER TABLE project_forms ADD CONSTRAINT chk_form_type CHECK (
  form_type = ANY (ARRAY[
    'problem_statement', 'impact_assessment', 'list_reduction', 'weighted_voting',
    'fishbone', 'five_why', 'force_field', 'checksheet', 'pareto',
    'brainstorming', 'brainwriting', 'interviewing', 'surveying',
    'criteria_matrix', 'paired_comparisons', 'raci',
    'implementation_plan', 'balance_sheet', 'cost_benefit',
    'milestone_tracker', 'implementation_checklist',
    'before_after', 'evaluation', 'lessons_learned',
    'impact_metrics', 'results_metrics'
  ])
);
