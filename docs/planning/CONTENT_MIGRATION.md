# PIPS 2.0 Content & Asset Migration Plan

> **Version:** 1.0
> **Date:** March 2, 2026
> **Author:** Marc Albers + Claude
> **Status:** Draft
> **Dependencies:** PRODUCT_ROADMAP.md, TECHNICAL_PLAN.md, BUSINESS_PLAN.md

---

## Table of Contents

1. [Asset Inventory](#1-asset-inventory)
2. [Content Destination Mapping](#2-content-destination-mapping)
3. [Form Template Migration Plan](#3-form-template-migration-plan)
4. [Methodology Content to In-Product Education](#4-methodology-content-to-in-product-education)
5. [Workshop Content to Product Features](#5-workshop-content-to-product-features)
6. [Marketing Content Extraction](#6-marketing-content-extraction)
7. [SEO and Content Strategy](#7-seo-and-content-strategy)
8. [White-Label Content Considerations](#8-white-label-content-considerations)
9. [Content Transformation Specifications](#9-content-transformation-specifications)
10. [Migration Priority and Phases](#10-migration-priority-and-phases)
11. [Content Gaps](#11-content-gaps)
12. [Technical Migration Notes](#12-technical-migration-notes)

---

## 1. Asset Inventory

### 1.1 Interactive Learning Guide

**Source:** `PIPS/output/html/PIPS_RxLogic_Interactive.html`
**Format:** Single-page HTML (5,032 lines, ~120KB)
**Overall Quality:** Strong -- comprehensive, well-structured, reviewed (see FINAL_Content_Quality_Review.md)

| Content Item | Location (line range) | Type | Quality | Est. Word Count |
|---|---|---|---|---|
| Hero Section (PIPS overview, cycle diagram) | 1841-1895 | Visual + intro | Ready to use | 80 |
| Philosophy: Continuous Improvement Culture | 1896-1907 | Methodology explanation | Ready to use | 150 |
| Philosophy: Closed-Loop Problem Solving | 1909-1926 | Methodology explanation + visual | Ready to use | 120 |
| Philosophy: Expand/Contract (Diverge/Converge) visual | 1913-1925 | Interactive visual | Ready to use | 40 |
| Philosophy: Alignment with RxLogic Mission | 1928-1937 | Brand-specific content | Needs rewriting (remove RxLogic branding) | 100 |
| Step Iteration Overview | 1940-1986 | Methodology explanation + visual | Ready to use | 250 |
| Consensus Philosophy (Theory Z) | 1988-2008 | Methodology explanation | Needs minor editing (add Theory Z definition) | 300 |
| Consensus Verification Questions (3 cards) | 1993-2006 | Decision framework | Ready to use | 120 |
| **Step 1: Identify & Select** | 2012-2336 | --- | --- | --- |
| Step 1 Quote (Kettering) | 2021-2024 | Motivational quote | Ready to use | 15 |
| Step 1 Objective | 2026-2029 | Step objective | Ready to use | 20 |
| Problem Statement Framework (As-Is/Desired/Gap) | 2031-2063 | Core framework + examples | Ready to use | 350 |
| Measurability Callout | 2054-2063 | Principle explanation | Ready to use | 100 |
| Full Problem Selection Flowchart (9-step) | 2066-2144 | Process flowchart | Ready to use | 500 |
| Focused Problem Selection Flowchart | 2146-2176 | Alternative process | Ready to use | 200 |
| Problem Statement Guidelines | 2178-2194 | How-to content | Ready to use | 150 |
| Bad vs. Good Problem Statements (transformation cards) | 2196-2274 | Before/after examples | Ready to use | 300 |
| As-Is / Desired State Coaching | 2276-2287 | Coaching guidance | Ready to use | 100 |
| Step 1 Tool Tags + detail panels | 2289-2336 | Tool references | Ready to use | 80 |
| Step 1 Worked Example (Parking Lot) | ~2300-2330 | Worked example | Ready to use | 200 |
| Step 1 Checklist | ~2310-2326 | Completion checklist | Ready to use | 60 |
| **Step 2: Analyze** | 2337-2519 | --- | --- | --- |
| Step 2 Quote | ~2350 | Motivational quote | Ready to use | 15 |
| Step 2 Objective | ~2355 | Step objective | Ready to use | 20 |
| Core Principle: Data Over Opinions | 2389-2400 | Methodology explanation | Ready to use | 150 |
| Step 2 How-To | 2401-2410 | Process guidance | Ready to use | 120 |
| Cause-and-Effect Analysis Framework | 2411-2476 | Framework + fishbone visual | Ready to use | 400 |
| Step 2 Tool Tags | 2477-2519 | Tool references | Ready to use | 80 |
| Step 2 Worked Example (Parking Lot) | within 2411-2476 | Worked example | Ready to use | 200 |
| Step 2 Checklist | ~2490 | Completion checklist | Ready to use | 60 |
| **Step 3: Generate Solutions** | 2520-2834 | --- | --- | --- |
| Step 3 Quote | ~2535 | Motivational quote | Ready to use | 15 |
| Step 3 Objective | ~2538 | Step objective | Ready to use | 20 |
| Step 3 How-To (diverge/converge rhythm) | 2539-2560 | Process guidance | Ready to use | 150 |
| Three Brainstorming Methods (detailed) | 2561-2691 | Methodology deep-dive | Ready to use | 600 |
| Brainwriting in Depth | 2692-2780 | Methodology deep-dive | Ready to use | 400 |
| Additional Techniques | 2781-2796 | Supplementary content | Ready to use | 100 |
| Step 3 Tool Tags | 2797-2834 | Tool references | Ready to use | 80 |
| Step 3 Worked Example (Parking Lot) | within 2700-2780 | Worked example | Ready to use | 200 |
| Step 3 Checklist | ~2820 | Completion checklist | Ready to use | 60 |
| **Step 4: Select & Plan** | 2835-3009 | --- | --- | --- |
| Step 4 Quote | ~2850 | Motivational quote | Ready to use | 15 |
| Step 4 Objective | ~2853 | Step objective | Ready to use | 20 |
| Consensus in Step 4 | 2854-2865 | Decision framework | Needs editing (deduplicate from Philosophy section) | 150 |
| Key Principles | 2866-2874 | Methodology explanation | Ready to use | 80 |
| Step 4 How-To | 2875-2904 | Process guidance | Ready to use | 200 |
| Presenting to Management | 2905-2925 | Guidance | Ready to use | 150 |
| Planning Implementation | 2926-2965 | Framework | Ready to use | 250 |
| Step 4 Tool Tags | 2966-3009 | Tool references | Ready to use | 80 |
| Step 4 Worked Example (Parking Lot) | within 2926-2965 | Worked example | Ready to use | 200 |
| Step 4 Checklist | ~2990 | Completion checklist | Ready to use | 60 |
| **Step 5: Implement** | 3010-3167 | --- | --- | --- |
| Step 5 Quote | ~3025 | Motivational quote | Ready to use | 15 |
| Step 5 Objective | ~3028 | Step objective | Ready to use | 20 |
| Implementation Monitoring Process | 3031-3067 | Process framework | Ready to use | 250 |
| Common Implementation Failures (5 cards) | 3068-3115 | Warning patterns | Ready to use | 300 |
| Step 5 How-To | 3116-3123 | Process guidance | Ready to use | 80 |
| Step 5 Tool Tags | 3124-3167 | Tool references | Ready to use | 80 |
| Step 5 Worked Example (Parking Lot) | within 3068-3115 | Worked example | Ready to use | 200 |
| Step 5 Checklist (5 items) | 3153-3160 | Completion checklist | Ready to use | 50 |
| **Step 6: Evaluate** | 3169-3335 | --- | --- | --- |
| Step 6 Quote (Karl Albrecht) | 3178-3181 | Motivational quote | Ready to use | 30 |
| Step 6 Objective | 3183-3186 | Step objective | Ready to use | 15 |
| Planning Your Evaluation (3 cards) | 3188-3204 | Framework | Ready to use | 200 |
| Closed Loop Concept | 3206-3208 | Methodology explanation | Ready to use | 150 |
| Evaluation Process Flowchart (4-step + decision) | 3210-3251 | Process flowchart | Ready to use | 350 |
| Things to Remember (3 cards) | 3253-3267 | Warning patterns | Ready to use | 200 |
| Step 6 Worked Example (Parking Lot -- before/after data) | 3269-3291 | Worked example with data | Ready to use | 200 |
| Step 6 Checklist (6 items) | 3320-3328 | Completion checklist | Ready to use | 60 |
| Modern Augmentation (Step 6) | 3310-3318 | Digital tool suggestions | Needs editing | 40 |
| **Roles & Responsibilities** | 3337-3422 | --- | --- | --- |
| Leader role card | 3346-3362 | Role definition | Ready to use | 80 |
| Process Guide role card | 3364-3373 | Role definition | Ready to use | 60 |
| Scribe role card | 3376-3386 | Role definition | Ready to use | 60 |
| Time Keeper role card | 3388-3397 | Role definition | Ready to use | 50 |
| Presenter role card | 3399-3408 | Role definition | Ready to use | 50 |
| Facilitator role card | 3410-3419 | Role definition | Ready to use | 50 |
| **Tools Library** | 3424-3836+ | --- | --- | --- |
| Generating Ideas tab (4 tools) | 3439-3518 | Tool descriptions | Ready to use | 400 |
| Reaching Consensus tab (5 tools) | 3520-3622 | Tool descriptions | Ready to use | 500 |
| Analyzing Data tab (7 tools) | 3624-3766 | Tool descriptions | Ready to use | 700 |
| Planning Actions tab (3+ tools) | 3768-3836 | Tool descriptions | Ready to use | 350 |
| Tool modals (21 tools total) | JavaScript-driven | Detailed tool info | Ready to use | 2,100 |
| **Management Presentations** | ~3840-3920 | --- | --- | --- |
| 7 Presentation Principles cards | ~3840-3900 | Presentation guidance | Ready to use | 200 |
| Presentation flow diagram | ~3900-3920 | Visual | Ready to use | 50 |
| **Getting Started at RxLogic** | ~3920-3980 | --- | --- | --- |
| 5-step timeline | ~3930-3970 | Onboarding guidance | Needs rewriting (remove RxLogic branding) | 200 |
| Available Resources | ~3970-3980 | Support content | Needs rewriting | 100 |

### 1.2 Process Workbook

**Source:** `PIPS/output/html/PIPS_RxLogic_Workbook.html`
**Format:** Single-page HTML (4,039 lines, ~95KB)
**Overall Quality:** Strong interactive forms, sophisticated save/load/export functionality

| Content Item | Type | Quality | Est. Word Count |
|---|---|---|---|
| Step 0: Setup (team info, project name, date, members, roles) | Form with UI | Ready to use | 150 |
| Step 1: Problem Statement form (As-Is, Desired, Gap, team impact) | Form with helper text | Ready to use | 200 |
| Step 2: Analysis form (data collection, fishbone, root causes) | Form with dynamic tables | Ready to use | 250 |
| Step 3: Generate form (brainstorming capture, idea grouping) | Form with idea cards | Ready to use | 200 |
| Step 4: Select & Plan form (criteria matrix, RACI, implementation plan) | Form with tables | Ready to use | 300 |
| Step 5: Implement form (milestones, Gantt chart, status tracking, notes log) | Form with progress tracker | Ready to use | 250 |
| Step 6: Evaluate form (before/after comparison, evaluation results, lessons learned) | Form with comparison blocks | Ready to use | 200 |
| Summary Dashboard | Generated summary view | Ready to use | 100 |
| Save/Load/Export JavaScript | Functional code | Needs adaptation | 800 (JS) |
| Helper text content (per-field guidance) | Contextual help | Ready to use | 600 |
| Quote blocks (one per step) | Motivational content | Ready to use | 90 |
| Section gate (step completion indicators) | UI pattern | Ready to use | 40 |

### 1.3 Workshop Facilitator Tool

**Source:** `PIPS/output/html/PIPS_RxLogic_Workshop.html`
**Format:** Single-page HTML (1,758 lines, ~45KB)
**Overall Quality:** Well-paced, good facilitator notes

| Content Item | Type | Quality | Est. Word Count |
|---|---|---|---|
| Slide 0: Hero/Welcome (PIPS overview, 90-120 min session) | Presentation slide | Ready to use | 50 |
| Slide 1: What Is PIPS (core principles, 6 steps, diverge/converge) | Teach slide | Ready to use | 200 |
| Slide 2: Team Formation & Role Assignment (6 roles grid, activity) | Practice slide | Ready to use | 250 |
| Slide 3: Module 2 Section Header (Step 1 intro) | Transition slide | Ready to use | 20 |
| Slide 4: Problem Statement Construction (As-Is/Desired/Gap framework) | Teach slide | Ready to use | 400 |
| Slide 5: Build Your Problem Statement (practice + 3 scenarios) | Practice slide with forms | Ready to use | 300 |
| Slide 6: Module 3 Section Header (Step 2 intro) | Transition slide | Ready to use | 20 |
| Slide 7: Step 2 Analyze Teach (fishbone, force-field, data-over-opinions) | Teach slide | Ready to use | 350 |
| Slide 8: Step 2 Practice (fishbone diagram exercise) | Practice slide with forms | Ready to use | 200 |
| Slide 9: Module 4 Section Header (Step 3 intro) | Transition slide | Ready to use | 20 |
| Slide 10: Step 3 Generate Teach (brainstorming, brainwriting) | Teach slide | Ready to use | 250 |
| Slide 11: Steps 4-6 Section Header | Transition slide | Ready to use | 20 |
| Slide 12: Steps 4-6 Teach (selection criteria, implementation, evaluation) | Teach slide | Ready to use | 400 |
| Slide 13: Steps 4-6 Practice (voting, implementation plan, success measures) | Practice slide with forms | Ready to use | 250 |
| Slide 14: Presentations & Wrap-up | Summary slide | Ready to use | 200 |
| 3 Practice Scenarios | Scenario templates | Ready to use | 250 |
| Facilitator Notes (6 sets) | Instructor guidance | Ready to use | 600 |
| Timer System (global + module timers) | Interactive feature | Needs adaptation | N/A |

### 1.4 Form Templates (26 files)

**Source:** `PIPS/output/forms-templates/`
**Format:** Standalone HTML files (print-optimized, 8.5x11in layout)

| Form | PIPS Step | Fields Summary | Quality |
|---|---|---|---|
| **PIPS_Problem_Submission_Form.html** | Step 1 | Team, date, problem area, As-Is, Desired, Gap, impact, data sources, priority | Ready to use |
| **PIPS_Brainstorming_Form.html** | Steps 1,2,3 | Session info, topic, rules reminder, 20 idea slots, action items | Ready to use |
| **PIPS_Brainwriting_Form.html** | Steps 1,3 | Prompt, 6 participant columns, 3 rounds of ideas | Ready to use |
| **PIPS_Interviewing_Form.html** | Steps 1,3 | Interviewee info, 8 question slots, key findings, follow-up | Ready to use |
| **PIPS_Surveying_Form.html** | Steps 1,3 | Survey purpose, target audience, 10 question slots, response tracking | Ready to use |
| **PIPS_Checksheet_Form.html** | Steps 2,5 | Category rows, time-period columns, tally cells, totals | Ready to use |
| **PIPS_Force_Field_Form.html** | Steps 2,4 | Problem statement, 5 driving forces + strength, 5 restraining forces + strength, strategy | Ready to use |
| **PIPS_List_Reduction_Form.html** | Steps 1,4 | Initial list items, 4 filter questions, pass/fail per item, reduced list | Ready to use |
| **PIPS_Weighted_Voting_Form.html** | Steps 1,4 | Options list, voter columns, votes per option, totals, ranking | Ready to use |
| **PIPS_Criteria_Rating_Form.html** | Steps 1,4 | Criteria with weights, solutions/options, rating matrix (1-5), weighted scores, totals | Ready to use |
| **PIPS_Balance_Sheet_Form.html** | Step 4 | Option name, pros list, cons list, overall assessment | Ready to use |
| **PIPS_Paired_Comparisons_Form.html** | Steps 1,4 | Options list, head-to-head comparison matrix, win counts, ranking | Ready to use |
| **PIPS_Cost_Benefit_Form.html** | Step 4 | Solution name, cost items + amounts, benefit items + amounts, net benefit, ROI | Ready to use |
| **PIPS_RACI_Matrix_Form.html** | Steps 4,5 | Tasks/activities rows, team member columns, R/A/C/I dropdown per cell | Ready to use |
| **PIPS_Implementation_Checklist.html** | Step 5 | Action items, responsible person, due date, status (not started/in progress/complete/blocked), notes | Ready to use |
| **PIPS_Evaluation_Form.html** | Step 6 | Original problem, metrics, baseline data, current data, % improvement, lessons, next steps | Ready to use |
| **PIPS_Meeting_Agenda_Template.html** | All steps | Meeting info, attendees, agenda items with time allocations, action items, next meeting | Ready to use |
| **PIPS_Tools_Quick_Guide.html** | Reference | All 21 tools: name, purpose, when to use, steps, digital alternative | Ready to use |
| **9 ParkingLot worked example forms** | Steps 1-6 | Pre-filled versions of above forms using the parking lot scenario | Ready to use |

### 1.5 Quick Reference Cards (7 files)

**Source:** `PIPS/output/quick-reference-cards/`
**Format:** Print-optimized HTML (8.5x11in single page each)

| Card | Content Summary | Quality |
|---|---|---|
| **PIPS_Overview_Card.html** | 6-step cycle diagram, purpose statement, key principles, roles summary | Ready to use |
| **Step1_Identify_Card.html** | Step 1 objective, As-Is/Desired/Gap framework, checklist, key tools | Ready to use |
| **Step2_Analyze_Card.html** | Step 2 objective, data-over-opinions principle, fishbone summary, key tools | Ready to use |
| **Step3_Generate_Card.html** | Step 3 objective, brainstorming rules, diverge/converge, key tools | Ready to use |
| **Step4_Select_Plan_Card.html** | Step 4 objective, consensus checks, criteria rating summary, key tools | Ready to use |
| **Step5_Implement_Card.html** | Step 5 objective, monitoring process, common failures, key tools | Ready to use |
| **Step6_Evaluate_Card.html** | Step 6 objective, evaluation process, closed-loop concept, key tools | Ready to use |

### 1.6 Reference Documents

| Document | Source | Format | Quality |
|---|---|---|---|
| **PIPS_RxLogic_Reference_Guide.docx** | `reference-guide/` | DOCX | Ready to use (comprehensive) |
| **PIPS_RxLogic_Presentation_v2.pptx** | `presentation/` | PPTX | Ready to use |
| **BRAND_COMPLIANCE_GUIDE.md** | `output/` | Markdown (840 lines) | Ready to use |
| **FINAL_Content_Quality_Review.md** | `review/` | Markdown | Action items for content fixes |
| **6 Step Analysis reviews** | `review/` | Markdown | Content improvement recommendations |

### 1.7 Inventory Summary

| Category | File Count | Est. Total Word Count | Ready to Use | Needs Editing | Needs Rewriting |
|---|---|---|---|---|---|
| Interactive Guide | 1 | ~8,500 | 85% | 10% | 5% |
| Process Workbook | 1 | ~2,200 | 90% | 10% | 0% |
| Workshop Tool | 1 | ~3,500 | 90% | 5% | 5% |
| Form Templates | 26 | ~4,000 | 95% | 5% | 0% |
| Quick Reference Cards | 7 | ~2,100 | 100% | 0% | 0% |
| Reference Documents | 6+ | ~15,000 | 80% | 15% | 5% |
| **TOTALS** | **42+** | **~35,300** | **88%** | **9%** | **3%** |

---

## 2. Content Destination Mapping

### 2.1 Master Content Mapping Table

| Source Content | In-Product Feature | Marketing Site | Onboarding | Help Center | Training/Cert |
|---|---|---|---|---|---|
| **PIPS Philosophy** | About panel in sidebar / project intro | "Our Methodology" page | First-run walkthrough slide 1 | "What is PIPS?" article | Module 1: Introduction |
| **Continuous Improvement Culture** | Project creation motivation text | Homepage hero section | --- | Core concepts article | Module 1 |
| **Closed-Loop Concept** | Step 6 to Step 1 transition UI + tooltip | Methodology page | First-run walkthrough slide 3 | "Understanding the Closed Loop" article | Module 1 |
| **Diverge/Converge Visual** | Animated indicator per step phase | Feature page visual | Interactive onboarding animation | Concept explainer | Module 1 |
| **Consensus Philosophy** | Decision checkpoints in Steps 1,4 | Blog post | --- | "Consensus in PIPS" article | Module 2 |
| **3 Verification Questions** | Consensus checkpoint modal in Steps 1,4,6 | --- | --- | Part of consensus article | Module 2 |
| **Step Iteration Overview** | "PIPS is iterative" banner + back-step affordance | Methodology page section | First-run walkthrough slide 2 | "Non-linear Process" article | Module 1 |
| **Step 1: Problem Statement Framework** | Step 1 guided form with As-Is/Desired/Gap fields | Feature page | Step 1 onboarding tooltip | "Building a Problem Statement" guide | Module 3 |
| **Step 1: Bad vs. Good examples** | Inline validation hints + example toggle | --- | Step 1 first-time help card | FAQ / troubleshooting | Module 3 exercises |
| **Step 1: Full Selection Flowchart** | "Guided mode" wizard for problem selection | --- | --- | "Problem Selection Process" guide | Module 3 |
| **Step 1: Focused Selection Flowchart** | "Quick mode" wizard for pre-scoped problems | --- | Quick start onboarding path | Part of problem selection guide | Module 3 |
| **Step 1: Measurability Callout** | Validation rule + warning tooltip on As-Is/Desired fields | --- | --- | Part of problem statement guide | Module 3 |
| **Step 1: Worked Example (Parking Lot)** | Sample project template "Parking Lot" | --- | "Try a sample project" onboarding CTA | Worked example walkthrough | Module 3 exercises |
| **Step 2: Data Over Opinions** | Step 2 header principle callout | Blog post | --- | "Data-Driven Analysis" article | Module 4 |
| **Step 2: Cause-Effect Framework** | Step 2 analysis workspace layout | Feature page section | --- | "Root Cause Analysis" guide | Module 4 |
| **Step 2: Fishbone visual** | Interactive fishbone diagram tool | Feature page screenshot | --- | "Using the Fishbone Tool" guide | Module 4 exercises |
| **Step 3: Brainstorming Methods** | Brainstorming workspace type selector | Feature page section | --- | "Brainstorming Techniques" guide | Module 5 |
| **Step 3: Brainwriting Deep Dive** | Brainwriting mode in brainstorm workspace | --- | --- | "Brainwriting Guide" | Module 5 |
| **Step 3: Brainstorming Rules** | Rules callout in brainstorm workspace | --- | Pre-brainstorm reminder popup | Part of brainstorming guide | Module 5 |
| **Step 4: Criteria Rating explanation** | Criteria Rating tool instructions panel | --- | --- | "Criteria Rating Matrix" guide | Module 6 |
| **Step 4: Presenting to Management** | "Generate Report" feature guidance | --- | --- | "Management Presentations" guide | Module 6 |
| **Step 4: Planning Implementation** | Implementation plan form instructions | --- | --- | "Implementation Planning" guide | Module 6 |
| **Step 5: Monitoring Process** | Progress tracking dashboard instructions | Feature page section | --- | "Monitoring Your Implementation" guide | Module 7 |
| **Step 5: Common Failures (5 cards)** | Warning cards in Step 5 sidebar | --- | --- | "Avoiding Implementation Pitfalls" article | Module 7 |
| **Step 6: Evaluation Process Flowchart** | Step 6 guided evaluation wizard | Feature page section | --- | "Evaluating Results" guide | Module 8 |
| **Step 6: Before/After comparison** | Comparison dashboard component | --- | --- | Part of evaluation guide | Module 8 |
| **Step 6: Recycle decision tree** | "What's next?" wizard after evaluation | --- | --- | "Closing the Loop" guide | Module 8 |
| **6 Role Definitions** | Role selector in project creation + role descriptions | Methodology page section | Role assignment onboarding step | "PIPS Team Roles" article | Module 2 |
| **21 Tool Descriptions** | Tool selector panels within each step | --- | --- | "Tools Library" searchable index | Modules 3-8 (tool-specific) |
| **21 Tool Digital Alternatives** | Removed (replaced by PIPS 2.0 native tools) | --- | --- | Integration guide | --- |
| **6 Step Checklists** | Step completion checklist in project sidebar | --- | --- | Per-step reference | Modules 3-8 |
| **6 Step Quotes** | Motivational banners at step start | --- | --- | --- | Module openings |
| **6 Step Objectives** | Step header objective display | --- | Step intro modals | Per-step reference | Module objectives |
| **6 Modern Augmentation boxes** | Removed (PIPS 2.0 IS the modern augmentation) | Content for blog posts | --- | --- | --- |
| **Management Presentations section** | Report generation feature | Blog post | --- | "Presenting PIPS Results" guide | Module 9 (advanced) |
| **Getting Started guide** | Removed (replaced by in-app onboarding) | --- | Primary onboarding flow | "Getting Started" article | --- |
| **Parking Lot example (all 6 steps)** | Sample project template with pre-filled data | --- | "Try it" onboarding experience | Worked example walkthrough series | Course project |
| **3 Workshop Scenarios** | 3 additional sample project templates | --- | Template gallery | --- | --- |
| **Facilitator Notes (6 sets)** | Admin/manager guidance tooltips | --- | Admin onboarding path | "Facilitator Tips" articles | Facilitator cert module |
| **Workshop Timer system** | Built-in brainstorming timer | Feature callout | --- | "Timer Feature" help | --- |
| **Workshop Presentation Mode** | Meeting/presentation view | Feature callout | --- | "Presentation Mode" help | --- |
| **26 Form Templates** | In-app digital forms (React components) | Feature list | Form walkthroughs | Per-form help | Tool mastery exercises |
| **9 ParkingLot Forms** | Pre-filled sample project form data | --- | Sample project | Walkthrough data | Exercise answers |
| **7 Quick Reference Cards** | In-app step summary cards (collapsible) | Downloads/resources page | --- | Quick reference printables | --- |
| **Reference Guide (DOCX)** | --- | Downloadable resource | --- | Comprehensive reference | Course material |
| **Presentation (PPTX)** | Report template basis | --- | --- | --- | Instructor slides |
| **Brand Guide** | Design system source of truth | Brand page (white-label docs) | --- | White-label configuration guide | --- |

### 2.2 Content Reuse Multiplier

Many content items serve 3-5 destinations. The following are the highest-leverage content pieces (used in 4+ destinations):

1. **Problem Statement Framework** -- product, marketing, onboarding, help, training
2. **Diverge/Converge concept** -- product, marketing, onboarding, help, training
3. **6 Role Definitions** -- product, marketing, onboarding, help, training
4. **Closed-Loop concept** -- product, marketing, onboarding, help, training
5. **Step Checklists** -- product, onboarding, help, training
6. **Parking Lot Worked Example** -- product, onboarding, help, training

---

## 3. Form Template Migration Plan

### 3.1 Form-by-Form Migration Specifications

#### 3.1.1 PIPS_Problem_Submission_Form

| Attribute | Detail |
|---|---|
| **PIPS Step** | Step 1: Identify & Select |
| **Standalone or Project-only** | Both (standalone for initial submission, then linked to project) |
| **Current Fields** | Team name, department, date, champion name, problem area (text), As-Is state (textarea), Desired state (textarea), Problem gap (textarea), impact description, affected parties, data sources, priority (High/Medium/Low) |
| **Target DB Table** | `project_steps` (step_number=1) + `project_forms` |
| **Target Schema** | `{ team_name: string, department: string, champion: uuid (user), problem_area: string, as_is_state: string, desired_state: string, problem_gap: string, impact_description: string, affected_parties: string[], data_sources: string[], priority: enum }` |
| **React Component** | `<ProblemSubmissionForm />` -- guided wizard with 3 panels (Problem, Impact, Data) |
| **Validation Rules** | As-Is and Desired State are required; warn if no numbers detected in either field ("Measurability check: consider adding specific metrics"); problem gap auto-generated from As-Is/Desired |
| **Auto-save** | Debounced save to Supabase every 3 seconds after field change; optimistic UI |
| **Collaboration** | Supabase Realtime broadcast on form field changes; last-writer-wins with conflict indicator |
| **Export** | PDF (branded template), JSON, CSV |

#### 3.1.2 PIPS_Brainstorming_Form

| Attribute | Detail |
|---|---|
| **PIPS Step** | Steps 1, 2, 3 (multi-step tool) |
| **Standalone or Project-only** | Both |
| **Current Fields** | Session date, facilitator, topic/prompt, step reference, rules reminder (readonly), 20 idea slots (number + idea text), consensus selections (checkboxes), action items |
| **Target DB Table** | `project_forms` with `form_template_id = 'brainstorming'` |
| **Target Schema** | `{ session_date: date, facilitator: uuid, topic: string, step: number, ideas: Array<{ id: uuid, text: string, author: uuid, votes: number, selected: boolean }>, action_items: Array<{ text: string, owner: uuid, due_date: date }> }` |
| **React Component** | `<BrainstormingWorkspace />` -- real-time card grid with add/vote/select |
| **Validation Rules** | Topic is required; at least 3 ideas before moving to voting phase; rules reminder auto-displays on workspace open |
| **Auto-save** | Real-time save per idea addition/edit; optimistic append |
| **Collaboration** | Real-time: all team members see ideas appear live; anonymous mode toggle for brainwriting; voting locks after facilitator triggers "end voting" |
| **Export** | PDF (idea cards layout), CSV (idea list), JSON |

#### 3.1.3 PIPS_Criteria_Rating_Form

| Attribute | Detail |
|---|---|
| **PIPS Step** | Steps 1, 4 |
| **Standalone or Project-only** | Project-only (needs solutions from Step 3) |
| **Current Fields** | Team info, criteria list (name + weight 1-10), solutions/options list (name), rating matrix (criteria x solutions, score 1-5 per cell), weighted score per cell (auto-calculated: weight x score), total per solution, ranking |
| **Target DB Table** | `project_forms` with `form_template_id = 'criteria_rating'` |
| **Target Schema** | `{ criteria: Array<{ id: uuid, name: string, weight: number }>, solutions: Array<{ id: uuid, name: string, description: string }>, ratings: Record<criteria_id, Record<solution_id, number>>, calculated: { weighted_scores: Record<solution_id, number>, rankings: Array<{ solution_id: uuid, rank: number }> } }` |
| **React Component** | `<CriteriaRatingMatrix />` -- interactive grid with live calculation |
| **Validation Rules** | At least 2 criteria, at least 2 solutions; weights must be 1-10; scores must be 1-5; all cells must be filled before completion |
| **Auto-save** | Per-cell change debounced; recalculate totals client-side immediately |
| **Collaboration** | Each team member fills their own rating independently; facilitator triggers "reveal and average" to show combined scores |
| **Export** | PDF (matrix with visual ranking), CSV, JSON; chart export (bar chart of final scores) |

#### 3.1.4 PIPS_Force_Field_Form

| Attribute | Detail |
|---|---|
| **PIPS Step** | Steps 2, 4 |
| **Standalone or Project-only** | Both |
| **Current Fields** | Problem statement (from Step 1), Desired state (from Step 1), 5 driving force rows (description + strength 1-5), 5 restraining force rows (description + strength 1-5), total driving score, total restraining score, strategy notes, action items |
| **Target DB Table** | `project_forms` with `form_template_id = 'force_field'` |
| **Target Schema** | `{ problem_statement: string, desired_state: string, driving_forces: Array<{ id: uuid, description: string, strength: number }>, restraining_forces: Array<{ id: uuid, description: string, strength: number }>, driving_total: number, restraining_total: number, strategy: string, action_items: Array<{ text: string, owner: uuid }> }` |
| **React Component** | `<ForceFieldAnalysis />` -- visual two-column layout with strength bars |
| **Validation Rules** | At least 1 driving and 1 restraining force; strength 1-5; problem statement auto-populated from Step 1 if within a project |
| **Auto-save** | Per-field debounced save |
| **Collaboration** | Team members can add forces; facilitator moderates strength ratings via voting |
| **Export** | PDF (visual diagram), CSV, JSON |

#### 3.1.5 PIPS_Cost_Benefit_Form

| Attribute | Detail |
|---|---|
| **PIPS Step** | Step 4 |
| **Standalone or Project-only** | Project-only (needs solution from Step 4) |
| **Current Fields** | Solution name, implementation cost items (description + one-time cost + recurring cost), benefit items (description + one-time benefit + recurring benefit), implementation timeline, total costs, total benefits, net benefit, ROI percentage, payback period, recommendation |
| **Target DB Table** | `project_forms` with `form_template_id = 'cost_benefit'` |
| **Target Schema** | `{ solution_name: string, costs: Array<{ description: string, one_time: number, recurring: number }>, benefits: Array<{ description: string, one_time: number, recurring: number }>, timeline_months: number, calculated: { total_costs: number, total_benefits: number, net_benefit: number, roi_percent: number, payback_months: number }, recommendation: string }` |
| **React Component** | `<CostBenefitAnalysis />` -- table with auto-calculation + summary card |
| **Validation Rules** | At least 1 cost and 1 benefit item; amounts must be non-negative; auto-calculate ROI and payback |
| **Auto-save** | Per-row change debounced |
| **Collaboration** | Standard multi-user editing |
| **Export** | PDF (financial summary format), CSV, JSON |

#### 3.1.6 PIPS_RACI_Matrix_Form

| Attribute | Detail |
|---|---|
| **PIPS Step** | Steps 4, 5 |
| **Standalone or Project-only** | Project-only |
| **Current Fields** | Task/activity rows, team member columns, RACI designation per cell (R=Responsible, A=Accountable, C=Consulted, I=Informed), validation (exactly 1 A per row) |
| **Target DB Table** | `project_forms` with `form_template_id = 'raci'` |
| **Target Schema** | `{ tasks: Array<{ id: uuid, name: string }>, members: Array<{ user_id: uuid, name: string }>, assignments: Record<task_id, Record<user_id, 'R' | 'A' | 'C' | 'I' | null>>, validation_warnings: string[] }` |
| **React Component** | `<RACIMatrix />` -- interactive grid with dropdown selectors + validation warnings |
| **Validation Rules** | Each row must have exactly 1 A; each row should have at least 1 R; warn if a member has no assignments; warn if a member has too many R's |
| **Auto-save** | Per-cell change |
| **Collaboration** | Real-time updates; lock cells during edit to prevent conflicts |
| **Export** | PDF (matrix format), CSV |

#### 3.1.7 PIPS_Implementation_Checklist

| Attribute | Detail |
|---|---|
| **PIPS Step** | Step 5 |
| **Standalone or Project-only** | Project-only |
| **Current Fields** | Action item description, responsible person, due date, status (Not Started / In Progress / Complete / Blocked), notes, overall progress percentage |
| **Target DB Table** | `project_forms` with `form_template_id = 'implementation_checklist'` -- also creates linked `tickets` |
| **Target Schema** | `{ items: Array<{ id: uuid, description: string, responsible: uuid, due_date: date, status: enum, notes: string, ticket_id?: uuid }>, progress_percent: number }` |
| **React Component** | `<ImplementationChecklist />` -- sortable list with status badges + progress bar |
| **Validation Rules** | Each item needs description and responsible person; due dates must be future or today; status changes logged in activity |
| **Auto-save** | Per-field change |
| **Collaboration** | Real-time status updates; owners can self-update status; facilitator can reassign |
| **Export** | PDF (checklist format), CSV, Gantt chart view |
| **Special Feature** | "Create tickets" button generates tickets in the ticketing system from checklist items |

#### 3.1.8 PIPS_Evaluation_Form

| Attribute | Detail |
|---|---|
| **PIPS Step** | Step 6 |
| **Standalone or Project-only** | Project-only (reads data from Steps 1-5) |
| **Current Fields** | Original problem statement (from Step 1), original metrics/baseline (from Step 2), current metrics, improvement percentage (auto-calculated), evaluation method, evaluation period, results summary, lessons learned, new problems identified, recommendation (close/continue/recycle), next steps |
| **Target DB Table** | `project_forms` with `form_template_id = 'evaluation'` |
| **Target Schema** | `{ original_problem: string, baseline_metrics: Record<string, number>, current_metrics: Record<string, number>, improvement_percentages: Record<string, number>, evaluation_method: string, evaluation_period: { start: date, end: date }, results_summary: string, lessons_learned: string[], new_problems: Array<{ description: string, severity: enum }>, recommendation: 'close' | 'continue' | 'recycle_step3' | 'new_project', next_steps: string[] }` |
| **React Component** | `<EvaluationReport />` -- comparison dashboard + decision wizard |
| **Validation Rules** | Baseline metrics auto-populated from Steps 1-2; at least 1 metric comparison required; recommendation required |
| **Auto-save** | Per-field change |
| **Collaboration** | Standard multi-user editing |
| **Export** | PDF (executive report format), CSV, JSON |
| **Special Feature** | "Recycle" action creates a new PIPS project seeded with lessons learned |

### 3.2 Remaining Forms (Summary)

| Form | Key Adaptation Notes |
|---|---|
| **Brainwriting** | Becomes real-time collaborative mode within BrainstormingWorkspace (anonymous round-robin) |
| **Interviewing** | Structured interview template with audio recording link + AI transcription integration (Phase 6) |
| **Surveying** | Survey builder within PIPS (or integration with external survey tools) |
| **Checksheet** | Data collection form with configurable categories and time periods; feeds into analytics (Phase 3) |
| **List Reduction** | Interactive filtering tool within Step 1/4 decision workspace |
| **Weighted Voting** | Real-time anonymous voting component; integrated into brainstorming and decision steps |
| **Balance Sheet** | Pros/cons comparison tool; simple two-column interactive form |
| **Paired Comparisons** | Head-to-head comparison tool with auto-ranking; matrix UI component |
| **Meeting Agenda** | Template for PIPS meetings; integrated with calendar (Phase 4) |
| **Tools Quick Guide** | Becomes the in-app Tools Library searchable index |

### 3.3 Form Prioritization for MVP

**Tier 1 (MVP -- must have, 10 forms):**
1. Problem Submission Form (Step 1)
2. Brainstorming Form (Steps 1,2,3)
3. Force Field Form (Step 2)
4. Criteria Rating Form (Step 4)
5. Cost-Benefit Form (Step 4)
6. RACI Matrix (Steps 4,5)
7. Implementation Checklist (Step 5)
8. Evaluation Form (Step 6)
9. Weighted Voting (Steps 1,4)
10. List Reduction (Steps 1,4)

**Tier 2 (Phase 2 fast-follow, 8 forms):**
11. Brainwriting Form
12. Balance Sheet
13. Paired Comparisons
14. Checksheet
15. Meeting Agenda
16. Interviewing Form
17. Surveying Form
18. Tools Quick Guide (as help system)

**Tier 3 (Later, 8 forms):**
19-26. ParkingLot worked example forms (become sample project data, not separate forms)

---

## 4. Methodology Content to In-Product Education

### 4.1 Step Introductions to Step Headers

**Source:** Each step's section header (quote, objective, question)

**Target:** Step header component in project workflow

```
┌──────────────────────────────────────────────────┐
│  Step 1                                    [?]   │
│  ─────                                           │
│  Identify & Select the Problem                   │
│                                                  │
│  "What do we want to change?"                    │
│                                                  │
│  Objective: Develop a clear problem statement     │
│  and desired state understood by all group        │
│  members.                                        │
│                                                  │
│  ☐ Problem Statement complete                    │
│  ☐ Impact assessed                               │
│  ☐ Team consensus reached                        │
└──────────────────────────────────────────────────┘
```

**Interaction:** The step header is always visible when working within a step. The objective serves as a north star. The checklist items come from the existing step checklists and track actual form completion.

### 4.2 How-To Content to Contextual Help Panels

**Source:** How-To sections from each step in the Interactive Guide

**Target:** Contextual help drawer (right-side panel) that can be toggled open/closed

**Trigger points:**
- User clicks the [?] icon on any step header
- User clicks "Help" on any form component
- First time a user enters a step (auto-open, dismissible)

**Content structure per step:**

```
┌── Help Panel ─────────────────────┐
│  Step 1: Identify & Select        │
│  ──────────────────────────────── │
│                                    │
│  [Overview] [How-To] [Examples]    │
│                                    │
│  HOW-TO                           │
│  1. Brainstorm potential problems  │
│  2. Clarify every item            │
│  3. Apply filter questions         │
│  4. Draft problem statement        │
│  5. Verify measurability           │
│  6. Reach consensus                │
│                                    │
│  ⚡ TIP                           │
│  Spend 40% of your total PIPS     │
│  effort on Steps 1 and 2.         │
│                                    │
│  📖 View worked example           │
│  🎥 Watch tutorial (future)       │
└────────────────────────────────────┘
```

### 4.3 Worked Examples to Sample Project Templates

**Source:** Parking Lot worked example (threaded through all 6 steps), 3 Workshop scenarios

**Target:** Sample project templates accessible from "New Project" screen

| Template | Source | Pre-filled Data |
|---|---|---|
| **Parking Lot** | Interactive Guide worked example | All 6 steps with form data, including evaluation results |
| **Claims Rejections** | Workshop scenario 1 | Step 1 problem statement; hints for Steps 2-3 |
| **Employee Onboarding Speed** | Workshop scenario 2 | Step 1 problem statement; hints for Steps 2-3 |
| **Employee Turnover** | Workshop scenario 3 | Step 1 problem statement; hints for Steps 2-3 |
| **Blank** | --- | Empty project with guided wizard |

**User experience:** When creating a new project, users see a template gallery. "Parking Lot" is labeled "Guided Walkthrough -- see PIPS in action with pre-filled data." The other scenarios are labeled "Practice Template -- problem defined, try the process yourself."

### 4.4 Transformation Cards to Inline Validation Hints

**Source:** Bad vs. Good Problem Statements section (Step 1, lines 2196-2274)

**Target:** Real-time validation hints within the Problem Statement form

| Trigger | Bad Example | Good Alternative | UI Treatment |
|---|---|---|---|
| No numbers in As-Is field | "We need better communication" | "Cross-team handoff errors occur in 23% of projects" | Orange warning banner below field |
| No numbers in Desired field | "Customer service should be good" | "Customer satisfaction score should reach 85" | Orange warning banner below field |
| Problem states a solution | "We need to hire more people" | Describe the gap, not the fix | Red validation error |
| Problem too vague | "The system is too slow" | "Average query response time is 4.2s vs. SLA of 1.5s" | Orange warning with suggestion |
| No timeframe in Desired | "Reduce rejection rate to 5%" | "Reduce rejection rate to 5% within 6 months" | Soft suggestion tooltip |

### 4.5 Tool Descriptions to Tool Selector

**Source:** 21 tool descriptions from Tools Library section

**Target:** Tool selector component within each step's workspace

**Interaction flow:**
1. Within a step, user sees "Available Tools" section
2. Tools are filtered to those relevant to the current step (using existing step-pill metadata)
3. Clicking a tool shows: description, when to use, instructions, and "Open Form" button
4. The tool description content comes directly from the existing tool card body text

### 4.6 Quotes to Motivational Prompts

**Source:** 6 step quotes + Closed-Loop Principle quote + one-breath rule

**Target:** Motivational banners that appear at key moments

| Quote | When It Appears |
|---|---|
| "A problem well stated is a problem half solved." -- Kettering | User enters Step 1 for the first time |
| Step 2 quote | User enters Step 2 for the first time |
| Step 3 quote | User enters Step 3 for the first time |
| Step 4 quote | User enters Step 4 for the first time |
| Step 5 quote | User enters Step 5 for the first time |
| "You can only close the loop..." -- Albrecht | User enters Step 6 for the first time |
| "Step 6 is not the end -- it is the bridge back to Step 1." | User completes Step 6 evaluation |

**UI treatment:** Dismissible banner at top of step workspace, styled with the step's accent color. Shown once per step per project (stored in user preferences).

### 4.7 Tips and Best Practices to Tip Cards

**Source:** Facilitator notes, "Things to Remember" cards, measurability callout, common mistakes

**Target:** Contextual tip cards within forms

| Location | Tip Content | Source |
|---|---|---|
| Step 1 Problem Statement form | "40% of PIPS effort should be in Steps 1 & 2" | Step Iteration Overview |
| Step 1 As-Is field | "Use numbers, percentages, timeframes, or dollar amounts" | Measurability Callout |
| Step 2 Analysis workspace | "Don't overlook positives -- driving forces are often easier to leverage" | Step 2 How-To |
| Step 3 Brainstorming workspace | "No criticism during brainstorming -- judgment is deferred" | Brainstorming Rules |
| Step 4 Consensus checkpoint | "The one-breath rule: keep each contribution to one breath" | Consensus Philosophy |
| Step 5 Implementation tracker | "Monitor progress weekly and adjust course as needed" | Step 5 How-To |
| Step 6 Evaluation form | "Sometimes the initial problem statement is not the actual problem" | Step 6 Things to Remember |

---

## 5. Workshop Content to Product Features

### 5.1 Practice Scenarios to Sample Project Templates

**Source:** Workshop slide 5 (line 799) -- 3 practice scenarios

| Scenario | As-Is | Desired | Product Treatment |
|---|---|---|---|
| Claims Rejections | "15% of claims are rejected on first submission" | "Reduce to 5% within 6 months" | Pre-built template for healthcare/insurance industry |
| Onboarding Speed | "Average new hire onboarding takes 12 weeks" | "Reduce to 6 weeks" | Pre-built template for HR use case |
| Employee Turnover | "Annual voluntary turnover at 28%" | "Reduce to 15% within 1 year" | Pre-built template for management use case |

### 5.2 Facilitator Notes to Admin Guidance System

**Source:** 6 sets of facilitator notes in Workshop HTML

**Target:** "Facilitator Tips" system available to users with Facilitator or Admin PIPS role

| Feature | Source Content | Product Implementation |
|---|---|---|
| Pre-workshop checklist | Slide 1 facilitator notes | Project setup wizard -- "Have you prepared?" checklist |
| Team formation guidance | Slide 2 facilitator notes | Team size recommendations in project creation |
| Scaling guide (5-12, 13-24, 25+ participants) | Slide 2 facilitator notes | Dynamic team configuration suggestions based on member count |
| Transition cues | All facilitator notes | Step transition confirmations ("Ready to move to Step 2?") |
| Common pitfalls per step | All facilitator notes | Warning cards in facilitator-only view |
| Timing recommendations | Workshop module durations | Suggested time allocations per step (configurable) |

### 5.3 Timers to Built-in Timer Feature

**Source:** Workshop global timer + module timers + activity-specific timers

**Target:** `<BrainstormTimer />` component

```
┌─────────────────────────────────────────┐
│  Brainstorming Timer          ⏱ 05:00   │
│  ──────────────────────────────────────  │
│  [Start 5 min]  [Start 3 min]  [Reset]  │
│                                          │
│  ███████████░░░░░░░░░░░░░░  2:34 left   │
└─────────────────────────────────────────┘
```

**Capabilities:**
- Preset durations (5 min brainstorming, 3 min sharing, 10 min analysis)
- Custom duration setting
- Visible to all team members in real-time via Supabase Realtime
- Audio alert at 1 minute remaining and at completion
- Timer state persisted (facilitator controls start/pause/reset)

### 5.4 Team Activities to Collaborative Features

**Source:** Workshop practice slides with team-based exercises

| Workshop Activity | Product Feature |
|---|---|
| "Form your teams and assign roles" | Project creation wizard with role assignment |
| "Build your problem statement as a team" | Collaborative form editing with live cursors |
| "Brainstorm ideas (5 min brainwriting)" | Brainwriting mode: timed anonymous input rounds |
| "Vote on top ideas" | Integrated voting component (weighted voting form) |
| "Create implementation plan" | Implementation checklist with task assignment |
| "Present your findings" | Report generation + presentation view |

### 5.5 Presentation Mode to Meeting View

**Source:** Workshop presentation mode (body.presentation-mode CSS class)

**Target:** Meeting/Presentation view for PIPS projects

**Features:**
- Full-screen view of current step with large typography
- Hide navigation chrome and editing controls
- Display step progress, key data, and decisions
- Facilitator controls (advance slides, show/hide details)
- Exportable as PDF slide deck for management presentations

---

## 6. Marketing Content Extraction

### 6.1 Key Statistics and Proof Points

Extracted from existing content for use on landing pages and marketing materials:

| Proof Point | Source | Marketing Usage |
|---|---|---|
| "67% of well-formulated strategies fail due to poor execution" | Business Plan (HBR stat) | Homepage hero stat |
| "$97 million wasted for every $1 billion invested" | Business Plan (PMI stat) | ROI calculator page |
| "Only 40% of frontline employees understand strategy connection" | Business Plan | Problem statement on methodology page |
| "The first 40% of PIPS effort should be invested in Steps 1 and 2" | Interactive Guide | Methodology differentiation content |
| 6-step cycle with named steps | Interactive Guide hero | Core visual identity for all marketing |
| Parking Lot example: 87.5% improvement achieved | Step 6 Worked Example | Case study / testimonial format |
| "A problem well stated is a problem half solved" | Kettering quote | Hero section or email subject lines |

### 6.2 Problem Statements for Buyers

Extracted messaging that resonates with target personas:

| Persona | Pain Point (from existing content) | Marketing Message |
|---|---|---|
| VP of Operations | "Organizations waste $97M per $1B invested due to poor execution" | "Stop losing millions to unstructured problem solving" |
| Process Improvement Manager | "Methodologies exist in training binders, disconnected from daily tools" | "Finally, a tool where your methodology IS the workflow" |
| Director of Quality | "No institutional memory -- improvement projects exist as PowerPoints on shared drives" | "Every improvement project searchable, measurable, repeatable" |
| COO | "Strategy execution tools cost $10K-$50K/year" | "Enterprise methodology. Startup pricing." |
| Team Lead | "Teams rush past problem definition -- #1 reason improvement projects fail" | "PIPS won't let you skip the most critical step" |

### 6.3 Before/After Transformation Stories

From the Parking Lot worked example and methodology content:

**Story 1: The Parking Lot Problem**
- Before: 12 min avg search time, 40% delayed arrivals, 115% capacity at peak
- After: 3.5 min avg search time, 8% delayed, 92% capacity
- Result: 87.5% of problem gap closed
- Lesson: A "simple" parking complaint became a data-driven, measured improvement

**Story 2: The Vague Problem (from Bad vs. Good examples)**
- Before: "We need better communication" (vague, unmeasurable, unsolvable)
- After: "Cross-team handoff errors occur in 23% of projects vs. target of 5%"
- Result: A solvable, measurable problem that the team can act on
- Marketing angle: "This is what PIPS does -- it transforms complaints into actionable improvement projects"

### 6.4 Methodology Differentiators

| Differentiator | Explanation | Marketing Copy |
|---|---|---|
| **Closed-loop process** | Step 6 feeds back to Step 1 automatically | "The only PM tool with a built-in feedback loop" |
| **Data over opinions** | Every assertion must be evidence-based | "No more gut-feel decisions" |
| **Expand then contract** | Diverge-then-converge at every step | "Generate 100 ideas, then let data pick the winner" |
| **Consensus-based decisions** | Theory Z approach, not majority voting | "Decisions everyone can support, not just outvote" |
| **Methodology-embedded** | Not documentation + software, but methodology AS software | "The process IS the product" |
| **Measurability requirement** | Problem statements must include numbers | "If you can't measure it, PIPS won't let you start" |

### 6.5 ROI Arguments

From Business Plan and methodology content:

1. **Time savings:** Structured process eliminates rework from poorly defined problems (est. 30-40% reduction in project cycles)
2. **Knowledge retention:** All improvement projects stored as searchable records (vs. PowerPoint decks on shared drives)
3. **Consistency:** Every team follows the same rigorous process (vs. ad-hoc approaches)
4. **Accountability:** RACI matrices, implementation checklists, and evaluation forms create clear ownership
5. **Measurable outcomes:** Before/after metrics comparison proves ROI of each improvement project

### 6.6 Industry-Specific Use Cases

From existing content and scenarios:

| Industry | Use Case | Source |
|---|---|---|
| Healthcare / Pharmacy | Claims rejection rate reduction | Workshop scenarios, existing PIPS origin |
| HR / People Ops | Employee onboarding speed, turnover reduction | Workshop scenarios |
| Manufacturing | Process efficiency, defect reduction | Natural PIPS fit (six sigma adjacent) |
| IT / Software | Incident resolution, deployment frequency | Fishbone + root cause analysis |
| Finance | Processing error rates, compliance gaps | Checksheet + evaluation tools |
| Consulting | Client improvement frameworks (white-label) | White-label feature |

---

## 7. SEO and Content Strategy

### 7.1 Keyword-to-Content Mapping

| Target Keyword | Search Volume (est.) | Source Content | Content Type |
|---|---|---|---|
| "process improvement methodology" | 2,400/mo | PIPS Philosophy + 6-step overview | Pillar page |
| "problem statement template" | 5,400/mo | Step 1 Problem Statement Framework | Template landing page + downloadable |
| "root cause analysis tools" | 3,600/mo | Step 2 Fishbone + 5-Why content | Guide + interactive demo |
| "fishbone diagram template" | 8,100/mo | Fishbone tool description + form | Template landing page + free tool |
| "brainstorming techniques" | 6,600/mo | Step 3 Three Methods + Brainwriting | Guide |
| "decision matrix template" | 4,400/mo | Criteria Rating Form content | Template landing page + downloadable |
| "project improvement plan template" | 1,900/mo | Implementation Checklist content | Template landing page |
| "RACI matrix template" | 12,100/mo | RACI Matrix Form content | Template landing page + free tool |
| "force field analysis template" | 2,900/mo | Force Field Form content | Template landing page |
| "cost benefit analysis template" | 9,900/mo | Cost-Benefit Form content | Template landing page |
| "process improvement software" | 1,300/mo | Product positioning | Product page |
| "continuous improvement tools" | 2,400/mo | PIPS philosophy + tools library | Pillar page |
| "problem solving framework" | 3,600/mo | 6-step methodology overview | Pillar page |
| "Kaizen software" | 480/mo | PIPS vs Kaizen comparison | Comparison page |
| "six sigma project management" | 1,000/mo | PIPS vs Six Sigma comparison | Comparison page |

### 7.2 Blog Post Opportunities

Derived from existing methodology content:

| Blog Post Title | Source Content | Target Keywords |
|---|---|---|
| "How to Write a Problem Statement That Actually Gets Solved" | Step 1 Bad vs. Good examples | problem statement, problem definition |
| "Why 67% of Strategies Fail (And How Structured Problem Solving Fixes It)" | Business Plan stats + PIPS overview | strategy execution, process improvement |
| "Fishbone Diagrams: A Step-by-Step Guide to Root Cause Analysis" | Step 2 Cause-Effect Framework | fishbone diagram, root cause analysis |
| "3 Brainstorming Techniques That Actually Work" | Step 3 Three Methods | brainstorming techniques, ideation |
| "Brainwriting: The Introvert-Friendly Alternative to Brainstorming" | Step 3 Brainwriting Deep Dive | brainwriting, brainstorming alternatives |
| "How to Make Group Decisions Without Majority Voting" | Consensus Philosophy | consensus decision making, group decisions |
| "The Decision Matrix: How to Choose the Best Solution Objectively" | Criteria Rating Form + Step 4 | decision matrix, weighted criteria |
| "Force Field Analysis: Identify What's Helping and Hurting Your Project" | Force Field tool description | force field analysis |
| "5 Common Implementation Failures and How to Avoid Them" | Step 5 Common Failures | project implementation, project management |
| "Why You Need to Close the Loop on Every Improvement Project" | Step 6 Closed Loop Concept | continuous improvement, PDCA |
| "The Expand-Then-Contract Method for Better Problem Solving" | Diverge/Converge philosophy | problem solving, divergent thinking |
| "6 Essential Roles for Any Improvement Team" | Roles & Responsibilities section | team roles, improvement team |
| "PIPS vs. Lean Six Sigma: When to Use Each Approach" | Methodology positioning | lean six sigma, process improvement |
| "How to Present Improvement Results to Leadership" | Management Presentations section | project presentation, stakeholder communication |

### 7.3 Glossary Terms for SEO-Optimized Pages

| Term | Definition Source | Target URL |
|---|---|---|
| Problem Statement | Step 1 framework | /glossary/problem-statement |
| As-Is State | Step 1 framework | /glossary/as-is-state |
| Desired State | Step 1 framework | /glossary/desired-state |
| Root Cause Analysis | Step 2 content | /glossary/root-cause-analysis |
| Fishbone Diagram | Tools Library | /glossary/fishbone-diagram |
| Force Field Analysis | Tools Library | /glossary/force-field-analysis |
| Brainwriting | Step 3 content | /glossary/brainwriting |
| Criteria Rating Matrix | Tools Library | /glossary/criteria-rating-matrix |
| RACI Matrix | Tools Library | /glossary/raci-matrix |
| Pareto Analysis | Tools Library | /glossary/pareto-analysis |
| Consensus Decision Making | Consensus Philosophy | /glossary/consensus-decision-making |
| Theory Z | Consensus Philosophy | /glossary/theory-z |
| Continuous Improvement | Philosophy section | /glossary/continuous-improvement |
| Closed-Loop Problem Solving | Step 6 content | /glossary/closed-loop |
| Diverge-Converge | Philosophy section | /glossary/diverge-converge |

---

## 8. White-Label Content Considerations

### 8.1 Brand-Neutral vs. Branded Content

| Content Category | Current State | White-Label Treatment |
|---|---|---|
| **6-step methodology names** | Brand-neutral | Keep as-is. Universal across all tenants. |
| **Step descriptions and how-to** | Brand-neutral | Keep as-is. Universal methodology content. |
| **Tool descriptions (21 tools)** | Brand-neutral | Keep as-is. Universal reference content. |
| **Role definitions** | Brand-neutral | Keep as-is. Universal team roles. |
| **Consensus philosophy** | Brand-neutral | Keep as-is. |
| **Diverge/Converge concept** | Brand-neutral | Keep as-is. |
| **Quotes (Kettering, Albrecht, etc.)** | Brand-neutral | Keep as-is. |
| **"RxLogic" references** | Branded | Replace with tenant company name (parameterized) |
| **"Smart Pharmacy Claims Solutions" tagline** | Branded | Replace with tenant tagline |
| **Pharmacy/claims examples** | Industry-specific | Offer multiple industry example sets |
| **Brand colors (Navy, Blue, Green, Orange)** | Branded | Override via CSS custom properties per tenant |
| **"Alignment with RxLogic Mission" section** | Branded | Replace with "Alignment with [Company] Mission" template |
| **Getting Started at RxLogic** | Branded | Replace with tenant-specific onboarding |

### 8.2 Parameterized Content

Content requiring `{{variable}}` substitution for white-label deployments:

```
Variables needed:
  {{company_name}}        -- "RxLogic" -> "Acme Corp"
  {{company_tagline}}     -- "Smart Pharmacy Claims Solutions" -> "..."
  {{company_mission}}     -- Full mission statement
  {{industry_context}}    -- "pharmacy claims" -> "manufacturing"
  {{example_metric}}      -- "claims rejection rate" -> "defect rate"
  {{example_as_is}}       -- "15% rejection rate" -> "8% defect rate"
  {{example_desired}}     -- "5% rejection rate" -> "2% defect rate"
  {{support_contact}}     -- email/name for facilitator requests
  {{accent_color}}        -- #00EBC7 -> per-tenant color
  {{primary_color}}       -- #192D70 -> per-tenant color
```

### 8.3 Customizable vs. Standard Content

| Content Layer | Who Controls | Customization Level |
|---|---|---|
| **Core methodology (6 steps, tools, roles)** | PIPS 2.0 platform | Not customizable (methodology integrity) |
| **Step names** | PIPS 2.0 platform | Not customizable |
| **Tool names and descriptions** | PIPS 2.0 platform | Not customizable |
| **Industry examples** | Tenant admin | Select from example library or write custom |
| **Onboarding flow text** | Tenant admin | Full customization |
| **Help center articles** | PIPS 2.0 platform + tenant overlay | Tenants can add articles, cannot delete core ones |
| **Form field labels** | Mostly locked | Tenants can add custom fields to forms |
| **Email templates** | Tenant admin | Full customization of branding and copy |
| **Report templates** | Tenant admin | Choose from templates; customize header/footer |
| **Training content** | PIPS 2.0 platform | Tenants can add modules; cannot modify core curriculum |

### 8.4 Content Extension Points

White-label clients can extend (but not replace) the following:

1. **Custom worked examples** -- Add industry-specific sample projects alongside the Parking Lot default
2. **Custom tip cards** -- Add company-specific tips to any step
3. **Custom checklist items** -- Append items to the default step checklists
4. **Custom role definitions** -- Add organization-specific roles beyond the 6 standard PIPS roles
5. **Custom form fields** -- Add company-specific fields to any form template (appended after standard fields)

---

## 9. Content Transformation Specifications

### 9.1 Problem Statement Guide (Step 1)

**Source:** Interactive Guide Step 1, lines 2031-2063 (Problem Statement Framework + Measurability Callout)

**Target:** Step 1 guided form in PIPS 2.0

**Source text excerpt:**
> "The problem statement is the single most important output of Step 1. It must be built on three pillars -- each of which must be measurable and specific."
> Three pillars: As-Is State ("What is happening right now? Describe the current reality using measurable data."), Desired State ("What should be happening? Define the target in specific, quantifiable terms."), Problem Gap ("The difference between As-Is and Desired State -- this IS the problem.")

**Target UI component:**

```
┌─ Problem Statement Builder ──────────────────────────────────────┐
│                                                                   │
│  "A problem well stated is a problem half solved." -- Kettering   │
│                                                                   │
│  ┌── Panel 1: As-Is State ─────────────────────────────────────┐ │
│  │  What is happening right now?                                │ │
│  │  Describe using measurable data.                             │ │
│  │                                                              │ │
│  │  ┌──────────────────────────────────────────────────────┐   │ │
│  │  │ [textarea: min 2 lines, placeholder: "Currently,    │   │ │
│  │  │  68% of pharmacy claims are processed without        │   │ │
│  │  │  errors on first submission."]                       │   │ │
│  │  └──────────────────────────────────────────────────────┘   │ │
│  │                                                              │ │
│  │  ⚠ Measurability check: Include numbers, percentages,       │ │
│  │    timeframes, or dollar amounts.                            │ │
│  │                                                              │ │
│  │  💡 Bad: "We need better communication"                      │ │
│  │     Good: "Cross-team handoff errors occur in 23% of        │ │
│  │           projects"                                          │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                         ↓                                         │
│  ┌── Panel 2: Desired State ───────────────────────────────────┐ │
│  │  Where do you want to be? Define the target with a          │ │
│  │  timeframe.                                                  │ │
│  │  ┌──────────────────────────────────────────────────────┐   │ │
│  │  │ [textarea]                                           │   │ │
│  │  └──────────────────────────────────────────────────────┘   │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                         ↓                                         │
│  ┌── Panel 3: Problem Gap (auto-calculated) ───────────────────┐ │
│  │  The measurable difference between As-Is and Desired.        │ │
│  │                                                              │ │
│  │  ┌──────────────────────────────────────────────────────┐   │ │
│  │  │ [textarea: pre-populated with extracted metrics if   │   │ │
│  │  │  possible, user can edit]                            │   │ │
│  │  └──────────────────────────────────────────────────────┘   │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  [Save Draft]                          [Submit for Review →]      │
└───────────────────────────────────────────────────────────────────┘
```

**Interaction design:**
- The three panels are presented in a linear flow (vertical stack, not tabs)
- Each panel has a header with the source content's label and description
- Placeholder text uses the worked example from the source
- Real-time measurability validation: regex checks for numbers/percentages in As-Is and Desired fields
- Bad-to-Good examples appear as a collapsible "See examples" toggle below each field
- The Problem Gap panel auto-generates a summary if both As-Is and Desired are filled (using AI in Phase 6, or manual entry in MVP)
- "Submit for Review" triggers the consensus checkpoint modal

**When/how it appears:**
- This is the primary form for Step 1
- Auto-opens when user enters Step 1 of a new project
- Data persists and is editable until Step 1 is marked complete
- After completion, viewable in read-only mode (with "Edit" button for reopening)

### 9.2 Fishbone Diagram Tool

**Source:** Tools Library Fishbone description + Workshop Step 2 practice slide fishbone exercise

**Current HTML form structure:** No standalone fishbone form exists (marked "coming soon" in Tools Library). The Workshop has an SVG-based fishbone with text input boxes for 6 categories.

**Target interactive component:**

```
┌─ Fishbone (Ishikawa) Diagram ────────────────────────────────────┐
│                                                                   │
│              [People]        [Process]       [Technology]          │
│                 \               |               /                 │
│                  \              |              /                   │
│   ───────────────\─────────────|─────────────/───── [PROBLEM] ──  │
│                  /              |              \                   │
│                 /               |               \                 │
│           [Environment]    [Materials]     [Measurement]          │
│                                                                   │
│  ── Category: People ─────────────────────────────────────────── │
│  [+ Add cause]                                                    │
│  • Insufficient training on new system                   [×]      │
│  • High turnover in processing team                      [×]      │
│  • No cross-training between shifts                      [×]      │
│                                                                   │
│  ── Category: Process ────────────────────────────────────────── │
│  [+ Add cause]                                                    │
│  • Manual data entry step is error-prone                 [×]      │
│                                                                   │
│  ... (4 more categories)                                          │
│                                                                   │
│  [Identify Root Causes →]  (selects top 3-5 from all categories) │
└───────────────────────────────────────────────────────────────────┘
```

**Real-time collaboration:**
- Team members can simultaneously add causes to different categories
- Each cause shows author avatar
- Supabase Realtime broadcasts additions/deletions to all connected clients
- Facilitator can "lock" the diagram after analysis is complete
- Voting mode: team members vote on which causes to investigate further

**Data storage format:**
```json
{
  "problem": "Claims rejection rate at 15%",
  "categories": {
    "people": [
      { "id": "uuid", "text": "Insufficient training", "author": "uuid", "votes": 3, "selected": true },
      { "id": "uuid", "text": "High turnover", "author": "uuid", "votes": 1, "selected": false }
    ],
    "process": [...],
    "technology": [...],
    "environment": [...],
    "materials": [...],
    "measurement": [...]
  },
  "root_causes": ["uuid-1", "uuid-2", "uuid-3"]
}
```

**MVP approach:** Build as a structured form (6 category sections with add/remove items), not a drag-and-drop canvas. The visual fishbone SVG is rendered from the structured data (read-only visualization). Interactive canvas is Phase 6.

### 9.3 Criteria Rating Matrix

**Source:** PIPS_Criteria_Rating_Form.html + Tools Library description + Step 4 worked example

**Current form fields:**
- Header: team info, date, step reference
- Criteria list: name column + weight column (1-10)
- Solutions list: name column
- Rating matrix: criteria rows x solution columns, each cell scored 1-5
- Calculated: weighted score per cell (weight x score), total per solution
- Footer: ranking, recommendation

**Target interactive grid component:**

```
┌─ Criteria Rating Matrix ─────────────────────────────────────────┐
│                                                                   │
│  Criteria Setup:                                                  │
│  ┌──────────────────────┬────────┐                               │
│  │ Criterion            │ Weight │                               │
│  ├──────────────────────┼────────┤                               │
│  │ Implementation Cost  │ [8]    │                               │
│  │ Time to Implement    │ [6]    │                               │
│  │ Expected ROI         │ [9]    │                               │
│  │ Team Control         │ [7]    │                               │
│  │ [+ Add Criterion]    │        │                               │
│  └──────────────────────┴────────┘                               │
│                                                                   │
│  Rating Matrix:          Solution A    Solution B    Solution C   │
│  ─────────────────────   ──────────    ──────────    ──────────  │
│  Cost (wt: 8)            [4] = 32      [2] = 16     [3] = 24    │
│  Time (wt: 6)            [3] = 18      [4] = 24     [5] = 30    │
│  ROI  (wt: 9)            [5] = 45      [3] = 27     [4] = 36    │
│  Control (wt: 7)         [4] = 28      [5] = 35     [3] = 21    │
│  ─────────────────────   ──────────    ──────────    ──────────  │
│  TOTAL                   123 (#1)      102 (#3)     111 (#2)     │
│                                                                   │
│  ┌── Results Visualization ──────────────────────────────────┐   │
│  │  ████████████████████████  Solution A: 123                │   │
│  │  ██████████████████        Solution C: 111                │   │
│  │  ████████████████          Solution B: 102                │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                   │
│  [Export PDF]  [Export CSV]  [Finalize Selection →]               │
└───────────────────────────────────────────────────────────────────┘
```

**Calculation logic:**
- `weighted_score[criterion][solution] = criterion.weight * rating[criterion][solution]`
- `total[solution] = sum(weighted_score[all criteria][solution])`
- `rank = sort solutions by total descending`
- All calculations run client-side in real-time as user changes any value

**Visualization:** Horizontal bar chart showing total weighted scores per solution, sorted by rank. Color-coded: #1 green, #2 blue, #3+ gray.

**Collaboration mode:** Each team member rates independently. Facilitator triggers "reveal" to show averaged group ratings. Individual ratings are stored and can be compared for discussion.

### 9.4 Implementation Checklist (Step 5 Tracker)

**Source:** PIPS_Implementation_Checklist.html + Step 5 content from Interactive Guide

**Current form fields:**
- Action item description, responsible person, due date, status (Not Started / In Progress / Complete / Blocked), notes
- Overall progress bar

**Target interactive component:**

```
┌─ Implementation Tracker ─────────────────────────────────────────┐
│                                                                   │
│  Progress: ████████████░░░░░░░░░  58% (7/12 items complete)     │
│                                                                   │
│  [+ Add Action Item]  [Create Tickets →]  [Sort ▼]              │
│                                                                   │
│  ┌────┬───────────────────────────┬──────────┬────────┬────────┐ │
│  │ #  │ Action Item               │ Owner    │ Due    │ Status │ │
│  ├────┼───────────────────────────┼──────────┼────────┼────────┤ │
│  │ 1  │ Update training materials │ @Sarah   │ Mar 15 │ ✅ Done│ │
│  │ 2  │ Configure new workflow    │ @Mike    │ Mar 18 │ 🔄 IP  │ │
│  │ 3  │ Notify affected teams     │ @Lisa    │ Mar 20 │ ⏳ TODO│ │
│  │ 4  │ Run pilot with Team A     │ @Sarah   │ Mar 25 │ 🔴 BLK│ │
│  │ 5  │ Review pilot results      │ @Marc    │ Apr 01 │ ⏳ TODO│ │
│  └────┴───────────────────────────┴──────────┴────────┴────────┘ │
│                                                                   │
│  ⚠ WARNING: Item #4 is blocked. Blocking reason: "Waiting for   │
│  IT to provision test environment." (added 2 days ago)           │
│                                                                   │
│  ── Notes Log ──────────────────────────────────────────────────│
│  Mar 12, Sarah: Training materials draft complete, pending review │
│  Mar 13, Mike: Workflow config 60% done, ETA Friday               │
│  [Add note...]                                                    │
└───────────────────────────────────────────────────────────────────┘
```

**Special features:**
- "Create Tickets" button generates tickets in PIPS 2.0 ticketing system for each action item
- Two-way sync: ticket status changes update checklist status and vice versa
- Blocked items trigger a notification to the project facilitator
- Overdue items highlighted in red with day count
- Notes log provides a chronological journal of implementation updates
- Gantt chart view option (renders action items as timeline bars by due date)

### 9.5 Evaluation Dashboard (Step 6 Comparison)

**Source:** PIPS_Evaluation_Form.html + Step 6 Evaluation Process Flowchart + Parking Lot Step 6 Worked Example

**Target interactive component:**

```
┌─ Evaluation Dashboard ───────────────────────────────────────────┐
│                                                                   │
│  ┌── Before / After ─────────────────────────────────────────┐   │
│  │                                                            │   │
│  │  Metric           Baseline    Current     Change    Target │   │
│  │  ───────────────  ────────    ───────     ──────    ────── │   │
│  │  Search Time      12 min      3.5 min    -70.8%    4 min  │   │
│  │  Delay Rate       40%         8%         -80.0%    5%     │   │
│  │  Peak Capacity    115%        92%        -20.0%    95%    │   │
│  │                                                            │   │
│  │  Overall Gap Closure: ████████████████████░ 87.5%          │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌── Trend Charts (Recharts) ────────────────────────────────┐   │
│  │  [Line chart: metric values over time with baseline and    │   │
│  │   target reference lines]                                  │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌── What's Next? ───────────────────────────────────────────┐   │
│  │                                                            │   │
│  │  Based on your results:                                    │   │
│  │                                                            │   │
│  │  (●) Problem solved -- Close and standardize               │   │
│  │  ( ) Gap reduced but not closed -- Continue to Step 3      │   │
│  │  ( ) New problems created -- Start new PIPS project        │   │
│  │  ( ) No improvement -- Return to Step 2 for re-analysis   │   │
│  │                                                            │   │
│  │  Lessons Learned:                                          │   │
│  │  ┌─────────────────────────────────────────────────────┐  │   │
│  │  │ [rich text editor]                                   │  │   │
│  │  └─────────────────────────────────────────────────────┘  │   │
│  │                                                            │   │
│  │  [Finalize Evaluation →]                                   │   │
│  └────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────────┘
```

**Key behaviors:**
- Baseline metrics auto-populated from Step 1 (As-Is state) and Step 2 (analysis data)
- Current metrics entered manually or pulled from integrations (Phase 4)
- Change percentage auto-calculated
- "Gap closure" calculated as: (baseline - current) / (baseline - target) * 100
- Trend charts built with Recharts, showing data points over the evaluation period
- "What's Next?" decision triggers appropriate workflow action (close project, return to step, create new project)
- "Start new PIPS project" pre-fills Step 1 with the new problem description and links back to this project as the source

### 9.6 Consensus Checkpoint Modal

**Source:** Consensus Philosophy section (3 verification questions) + Theory Z explanation

**Target:** Modal dialog that appears at key decision points

```
┌─ Consensus Check ────────────────────────────────────────────────┐
│                                                                   │
│  Before finalizing this decision, verify team consensus.          │
│                                                                   │
│  "Every member can say: I believe this is the best decision the   │
│  group can reach at this time, and I will support it."            │
│                                                                   │
│  ☐ 1. Can each member restate the decision in their own words?   │
│                                                                   │
│  ☐ 2. Can each member state a reason for supporting it?          │
│                                                                   │
│  ☐ 3. Can each member identify what they will do to support it?  │
│                                                                   │
│  ── Team Responses ──────────────────────────────────────────── │
│  @Sarah: ✅ Confirmed    @Mike: ✅ Confirmed                     │
│  @Lisa: ⏳ Pending       @Marc: ✅ Confirmed                     │
│                                                                   │
│  [Cancel]                      [All confirmed -- Proceed →]       │
└───────────────────────────────────────────────────────────────────┘
```

**When it appears:**
- End of Step 1 (finalizing problem statement)
- End of Step 4 (selecting the solution)
- End of Step 6 (accepting evaluation results / deciding next action)
- Facilitator can trigger it manually at any decision point

**Behavior:**
- Each team member receives an in-app notification to confirm consensus
- The modal shows real-time status of each member's confirmation
- "Proceed" is only enabled when all active project members have confirmed
- Dissenting opinions can be recorded via a "I disagree but will support" option with a notes field

---

## 10. Migration Priority and Phases

### 10.1 Phase 0: Foundation (Weeks 1-4)

**Content needed:** None. This phase is infrastructure-only.

**Content work during this phase:**
- [ ] Extract all methodology text from HTML files into structured JSON/Markdown
- [ ] Build content schema (see section 12.2)
- [ ] Identify and fix all issues from FINAL_Content_Quality_Review.md
- [ ] Remove all RxLogic-specific references from methodology content
- [ ] Create parameterized content templates for white-label

### 10.2 Phase 1: MVP (Weeks 5-12)

**Content essential for MVP:**

| Content Item | Product Feature | Priority |
|---|---|---|
| 6 step names, questions, objectives | Step header component | P0 (blocker) |
| 6 step checklists | Step completion tracking | P0 |
| Problem Statement Framework text | Step 1 form helper text | P0 |
| Bad vs. Good examples (Step 1) | Inline validation hints | P1 |
| 10 Tier 1 form templates (see 3.3) | Digital forms | P0 |
| Workbook helper text (per-field guidance) | Form field descriptions | P0 |
| 6 role definitions | Project creation role selector | P1 |
| Parking Lot worked example data | Sample project template | P1 |
| 6 step quotes | Motivational banners | P2 |
| Measurability callout content | Validation messages | P1 |

**Total content migration effort for MVP: ~40 hours**
- Extracting and structuring text: 15 hours
- Writing form field descriptions and help text: 10 hours
- Building sample project data from Parking Lot example: 5 hours
- Creating validation message copy: 5 hours
- QA and consistency review: 5 hours

### 10.3 Phase 2: Ticketing (Weeks 13-20)

**Content needed:**
| Content Item | Product Feature | Priority |
|---|---|---|
| 8 Tier 2 form templates | Additional digital forms | P1 |
| Tool descriptions (21 tools) | Tools Library in-app | P1 |
| Step how-to content (expanded) | Contextual help panels | P1 |
| Facilitator notes (adapted) | Admin guidance tooltips | P2 |
| Notification copy (assigned, mentioned, etc.) | Notification system | P0 |

### 10.4 Phase 3: Analytics (Weeks 21-26)

**Content that becomes report templates:**
| Content Item | Report Feature |
|---|---|
| Step 6 Before/After comparison format | Improvement Report template |
| Criteria Rating Matrix results | Decision Report template |
| Cost-Benefit Analysis format | Financial Impact Report template |
| Implementation progress tracking | Status Report template |
| Management Presentations section | Executive Summary template |
| Parking Lot before/after data format | Benchmark comparison template |

### 10.5 Phase 4: Integrations (Weeks 27-34)

**Content needed:**
- API documentation (NEW -- does not exist)
- Integration setup guides (NEW)
- Webhook documentation (NEW)

### 10.6 Phase 5: White-Label (Weeks 35-42)

**Content needed:**
- White-label configuration guide (NEW)
- Tenant customization documentation (NEW)
- Parameterized content system deployed
- Industry example sets (3-5 verticals)

### 10.7 Phase 6: AI & Advanced (Weeks 43-52)

**Content needed:**
- AI feature documentation (NEW)
- Training/certification content (adapted from existing methodology)
- Marketplace content templates

### 10.8 Later Phases: Training & Certification

**Content transformation for training program:**

| Training Module | Source Content | New Content Needed |
|---|---|---|
| Module 1: Introduction to PIPS | Philosophy, Closed-Loop, Diverge/Converge | Learning objectives, assessments, video scripts |
| Module 2: Team Dynamics | Roles, Consensus Philosophy | Role-play scenarios, team exercises |
| Module 3: Step 1 Mastery | Step 1 full content + worked example | Quizzes, practice exercises, grading rubric |
| Module 4: Step 2 Mastery | Step 2 full content + fishbone | Interactive fishbone exercise, data analysis tasks |
| Module 5: Step 3 Mastery | Step 3 full content + brainstorming | Timed brainstorming exercises, idea evaluation |
| Module 6: Step 4 Mastery | Step 4 full content + criteria rating | Decision matrix exercises, presentation prep |
| Module 7: Step 5 Mastery | Step 5 full content + implementation | Project plan creation, risk identification |
| Module 8: Step 6 Mastery | Step 6 full content + evaluation | Data comparison exercises, recycling decisions |
| Module 9: Advanced Topics | Management Presentations, multi-project | Portfolio management, organizational deployment |
| Certification Exam | All modules | 50-question exam, practical project review |

---

## 11. Content Gaps

### 11.1 New Onboarding Content (does not exist)

| Content Item | Description | Est. Effort |
|---|---|---|
| Welcome walkthrough (5 slides) | First-time user guided tour of PIPS 2.0 | 4 hours |
| "What is PIPS?" explainer (30 sec read) | Ultra-brief methodology overview for new users | 1 hour |
| Project creation wizard copy | Guided text for each step of creating a project | 3 hours |
| Role assignment helper | Explanations of each PIPS role in selection UI | 2 hours (adapt from existing) |
| Empty state messages (10+) | Friendly messages when dashboards/lists are empty | 2 hours |
| Quick Start guide | "Your first PIPS project in 15 minutes" | 4 hours |
| Onboarding emails (5-email sequence) | Welcome, first project, first step, team invite, tips | 6 hours |

### 11.2 Marketing Copy (does not exist)

| Content Item | Description | Est. Effort |
|---|---|---|
| Homepage copy | Hero, value props, features, CTA, social proof | 8 hours |
| Methodology page | Full methodology explainer (adapted from Philosophy + 6 steps) | 6 hours (mostly adaptation) |
| Features page | Feature-by-feature breakdown | 6 hours |
| Pricing page copy | Plan descriptions, FAQ | 4 hours |
| "Why PIPS?" comparison page | vs. Jira, vs. Asana, vs. Rhythm Systems | 6 hours |
| Landing page for each industry vertical | Healthcare, HR, Manufacturing, IT, Finance | 15 hours (3 each) |
| Case studies (3 minimum) | Detailed success stories | 12 hours |
| Social proof / testimonials | Customer quotes (need actual customers) | Blocked on customer acquisition |

### 11.3 Help Documentation (does not exist)

| Content Item | Description | Est. Effort |
|---|---|---|
| Getting Started guide | Account setup, first project, team invite | 4 hours |
| Step-by-step guides (6) | How to use each PIPS step in the product | 12 hours (2 each) |
| Form reference guides (18+) | How to use each form template | 18 hours (1 each) |
| Tool reference articles (21) | Searchable tool descriptions | 8 hours (mostly adaptation) |
| Role guide | What each PIPS role does, responsibilities | 2 hours (adaptation) |
| FAQ | Common questions and answers | 4 hours |
| Troubleshooting | Common issues and solutions | 4 hours |
| Keyboard shortcuts | Quick reference for power users | 1 hour |
| Admin guide | Organization settings, team management, billing | 6 hours |

### 11.4 API Documentation (does not exist)

| Content Item | Est. Effort |
|---|---|
| API overview and authentication | 4 hours |
| REST API reference (auto-generated from OpenAPI spec) | 8 hours (initial + maintenance) |
| Webhook documentation | 4 hours |
| Integration guides (Jira, ADO, AHA!) | 12 hours (4 each) |
| SDK documentation (if applicable) | 8 hours |
| Rate limiting and best practices | 2 hours |

### 11.5 Video Script Outlines (does not exist)

| Video | Duration | Content Source | Script Needed |
|---|---|---|---|
| "What is PIPS?" explainer | 2 min | Philosophy section | Yes |
| "Creating your first project" tutorial | 5 min | Onboarding flow | Yes |
| "Step 1: Problem Statement" walkthrough | 8 min | Step 1 content | Yes |
| "Using the Fishbone Diagram" tutorial | 5 min | Step 2 + fishbone tool | Yes |
| "Brainstorming Best Practices" | 5 min | Step 3 content | Yes |
| "Making Data-Driven Decisions" | 5 min | Criteria Rating + Step 4 | Yes |
| "Closing the Loop: Why Evaluation Matters" | 5 min | Step 6 content | Yes |
| Product demo (full walkthrough) | 15 min | All features | Yes |

### 11.6 Email Template Content (does not exist)

| Email | Trigger | Content Needed |
|---|---|---|
| Welcome email | Account creation | Welcome + quick start link |
| Team invitation | Invited to organization | What PIPS is + accept link |
| Project invitation | Added to project | Project context + role + action link |
| Step completion notification | Step marked complete | What was decided + next step preview |
| Ticket assignment | Assigned to ticket | Ticket details + action link |
| Weekly digest | Every Monday | Active projects summary, upcoming due dates |
| Evaluation reminder | 30 days after Step 5 start | Prompt to begin Step 6 evaluation |
| Inactive project nudge | 14 days of no activity | "Your PIPS project needs attention" |

---

## 12. Technical Migration Notes

### 12.1 HTML Parsing Approach

The existing HTML files are well-structured with consistent CSS classes. Content extraction strategy:

**Step 1: Automated extraction script**
```
For each section in Interactive Guide:
  1. Parse HTML with cheerio or jsdom
  2. Identify sections by class: .section, .step-1 through .step-6
  3. Extract content blocks by class: .content-block, .quote-block,
     .objective-callout, .checklist, .worked-example, .tool-tags
  4. Strip HTML tags for plain text
  5. Preserve structure as JSON: { section, subsections[], quotes[],
     examples[], checklists[], tools[] }
```

**Step 2: Manual review and editing**
- Review extracted text for HTML entity artifacts (&mdash;, &ldquo;, etc.)
- Fix any content issues flagged in FINAL_Content_Quality_Review.md
- Remove RxLogic-specific references
- Standardize terminology across all extracted content

**Step 3: Form template extraction**
```
For each form template HTML:
  1. Parse HTML with cheerio
  2. Extract field definitions: label, type (text/textarea/select/table),
     validation (required, pattern), placeholder text, helper text
  3. Map to React Hook Form + Zod schema definitions
  4. Output as TypeScript form definition files
```

### 12.2 Content Storage Format

**Decision: Markdown for long-form content, JSON for structured data**

| Content Type | Storage Format | Location |
|---|---|---|
| Methodology explanations (philosophy, how-to, concepts) | Markdown files | `/content/methodology/*.md` |
| Step definitions (name, question, objective, quote) | JSON | `/content/steps.json` |
| Tool definitions (name, description, steps, alternatives) | JSON | `/content/tools.json` |
| Role definitions | JSON | `/content/roles.json` |
| Form template definitions (fields, validation, schema) | TypeScript + Zod | `/src/forms/templates/*.ts` |
| Checklists | JSON | `/content/checklists.json` |
| Worked examples (Parking Lot, scenarios) | JSON (structured data) | `/content/examples/*.json` |
| Help center articles | Markdown files | `/content/help/*.md` |
| Validation messages and hints | JSON | `/content/messages.json` |
| Email templates | React Email components | `/src/emails/*.tsx` |

**Content loading:**
- Methodology Markdown rendered with `remark` + `rehype` at build time (ISR)
- JSON content loaded via server components (no client-side fetch)
- Form definitions imported directly as TypeScript modules
- Help articles loaded on-demand via API route with caching

### 12.3 Localization / i18n Considerations

**Current state:** All content is English-only.

**i18n architecture for future translation:**

1. **Content keys:** All user-facing strings stored with stable keys (e.g., `step.1.name`, `step.1.objective`, `tool.brainstorming.description`)
2. **Default locale:** `en-US`
3. **Translation files:** `content/locales/{locale}/*.json`
4. **Framework:** `next-intl` for Next.js (type-safe, RSC-compatible)
5. **Parameterized content:** Already needed for white-label; same system handles i18n
6. **Priority languages:** English (launch), Spanish (Phase 5), Portuguese (Phase 5)

**Content that requires translation:**
- Methodology text (~8,500 words)
- Form field labels and descriptions (~4,000 words)
- Help articles (~10,000 words estimated)
- Marketing copy (~5,000 words estimated)
- Email templates (~3,000 words estimated)
- UI strings (buttons, labels, messages) (~2,000 strings)

**Content that does NOT require translation:**
- Tool names (Fishbone Diagram, RACI Matrix -- industry-standard English terms)
- PIPS acronym
- Author attributions on quotes

### 12.4 Version Control for Methodology Content

**Decision: Content stored in the application repository, versioned with git**

Rationale:
- Methodology content changes infrequently (quarterly at most)
- Changes need review (PR-based workflow)
- Content is tightly coupled to product features (a methodology change may require UI changes)
- Git provides full history and diff capability

**Content update workflow:**
1. Content author creates a branch (`content/update-step-3-examples`)
2. Edits Markdown/JSON files in `/content/`
3. Runs `pnpm content:validate` to check schema compliance and broken links
4. Creates PR with content diff
5. Product team reviews for accuracy and consistency
6. Merge triggers Vercel deployment (ISR revalidates content pages)
7. In-app content updates automatically via ISR revalidation

**Content versioning for white-label:**
- Core methodology content has a version number (e.g., `v2.1.0`)
- White-label tenants lock to a content version
- Content updates are opt-in for white-label tenants (they can stay on an older version)
- Custom tenant content (overlays) stored in Supabase `org_settings.content_overrides`

### 12.5 Content Migration Tooling

**Scripts to build:**

| Script | Purpose | Input | Output |
|---|---|---|---|
| `extract-interactive.ts` | Extract methodology content from Interactive Guide HTML | HTML file | JSON + Markdown files |
| `extract-forms.ts` | Extract form definitions from 26 HTML form templates | HTML files | TypeScript form definition files |
| `extract-workbook.ts` | Extract helper text and form structure from Workbook HTML | HTML file | JSON content files |
| `extract-workshop.ts` | Extract scenarios, facilitator notes, timer configs | HTML file | JSON content files |
| `validate-content.ts` | Check all content files for completeness and consistency | Content files | Validation report |
| `generate-search-index.ts` | Build search index from all content for help center | Content files | Search index (Algolia/Typesense format) |
| `seed-sample-projects.ts` | Create sample project data from Parking Lot example | Example JSON | Supabase seed SQL |

**Estimated effort for migration tooling: ~20 hours**

### 12.6 Content Quality Gates

Before content ships in any phase:

1. **Spell check:** Automated (CSpell in CI)
2. **Link check:** Automated (check all internal content cross-references)
3. **Schema validation:** All JSON content validates against Zod schemas
4. **Terminology consistency:** Automated check for terminology variants (e.g., "fishbone" vs. "Fishbone" vs. "Ishikawa")
5. **RxLogic removal check:** Automated grep for "RxLogic", "MedTrak", "pharmacy claims" in non-example content
6. **White-label readiness:** All parameterized variables resolved correctly with test tenant data
7. **Manual review:** Content owner reads through final rendered output before merge

---

## Appendix A: Content File Cross-Reference

Quick lookup: where does each source file's content go?

| Source File | Primary Destination | Secondary Destinations |
|---|---|---|
| `PIPS_RxLogic_Interactive.html` | In-product methodology, help center, onboarding | Marketing, training |
| `PIPS_RxLogic_Workbook.html` | In-product forms (structure), helper text | Help center |
| `PIPS_RxLogic_Workshop.html` | Sample templates, facilitator guidance, timer feature | Training |
| `forms-templates/*.html` (17 blanks) | In-product digital forms (React components) | Help center (per-form guides) |
| `forms-templates/PIPS_ParkingLot_*.html` (9) | Sample project data | Training exercises |
| `quick-reference-cards/*.html` (7) | In-app step summary cards, downloadable PDFs | Marketing (downloads page) |
| `PIPS_RxLogic_Reference_Guide.docx` | Help center comprehensive reference | Training material |
| `PIPS_RxLogic_Presentation_v2.pptx` | Report template basis, presentation feature | Marketing (demo) |
| `BRAND_COMPLIANCE_GUIDE.md` | Design system tokens, white-label config guide | Internal reference |
| `review/*.md` (7 files) | Content fix action items | Internal QA |

## Appendix B: Effort Summary

| Category | Estimated Hours |
|---|---|
| Content extraction and structuring (from HTML) | 35 |
| Content editing (remove branding, fix issues) | 15 |
| Form definition migration (26 templates to TypeScript) | 30 |
| New onboarding content creation | 23 |
| New marketing copy creation | 45 |
| New help documentation creation | 55 |
| New email template content | 10 |
| Video script outlines | 16 |
| Migration tooling (extraction scripts) | 20 |
| White-label parameterization | 12 |
| QA and consistency review | 15 |
| **TOTAL** | **~276 hours** |

**Note:** The majority of this effort (extraction, editing, form migration) is highly parallelizable with AI agent assistance. Estimated calendar time with agent support: 6-8 weeks alongside product development.
