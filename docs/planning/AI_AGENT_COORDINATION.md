# AI Agent Coordination — PIPS 2.0

This document defines how AI agents collaborate to build, test, and operate the PIPS 2.0 system.

It establishes:

• agent roles  
• execution rules  
• file ownership  
• decision authority  
• collaboration protocols  
• safety constraints

The goal is to enable a **structured multi-agent development organization** capable of parallel work without conflicts.

---

# 1. System Purpose

The AI agent system exists to:

• design and build the product  
• maintain system stability  
• ensure product quality  
• deliver features predictably  
• keep the product aligned with strategy

Agents operate as a coordinated product organization.

---

# 2. Core Operating Principles

### Clear Ownership

Each agent has defined responsibilities.

Agents must not modify areas outside their ownership without coordination.

---

### Parallel Execution

Agents should work in parallel whenever possible.

Parallel work must respect dependency sequencing.

---

### Minimal Overlap

Agents must avoid duplicate work.

Before starting work, agents must review:

• work log  
• open branches  
• task lists

---

### Escalation Over Guessing

If a conflict or ambiguity exists, agents escalate rather than guessing.

---

# 3. Agent Startup Protocol

When an agent session begins it must:

1. Read `AI_AGENT_COORDINATION.md`
2. Read `PROJECT_INDEX.md`
3. Review the `docs/work-log` directory
4. Review active tasks
5. Confirm file ownership boundaries
6. Confirm the main branch is healthy

---

# 4. Quality Gates

Before completing work, agents must verify:
pnpm tsc --noEmit
pnpm test
pnpm build

No work should merge if these fail.

---

# 5. Agent Organizational Structure

Agents are organized similarly to a modern product company.

---

## Strategy Layer

**Product Strategy Agent**

Responsible for:

• product vision  
• market positioning  
• business alignment

Primary Documents

BUSINESS_PLAN.md  
MARKETING_STRATEGY.md

---

## Product Layer

**Product Manager Agent**

Responsible for:

• product requirements  
• feature definitions  
• MVP scope

Primary Documents

PRODUCT_REQUIREMENTS.md  
MVP_SPECIFICATION.md  
PRODUCT_ROADMAP.md

---

**UX Design Agent**

Responsible for:

• user interaction flows  
• UI behavior  
• usability consistency

Primary Documents

UX_FLOWS.md  
BRAND_GUIDE.md  
BRAND_GUIDE_V2.md

---

**Customer Insights Agent**

Responsible for:

• customer feedback synthesis  
• adoption analysis  
• roadmap insights

Primary Documents

MARKETING_STRATEGY.md  
PRODUCT_ROADMAP.md

---

## Execution Layer

**Project Manager Agent**

Responsible for:

• execution planning  
• milestone coordination  
• agent task dispatch

Primary Documents

FULL_PROJECT_PLAN.md  
DEVELOPMENT_TASK_LIST.md  
AI_AGENT_COORDINATION.md

---

**Development Lead Agent**

Responsible for:

• engineering implementation  
• technical task decomposition  
• development quality

---

**QA Agent**

Responsible for:

• testing  
• regression validation  
• release readiness

---

**DevOps Agent**

Responsible for:

• infrastructure  
• CI/CD pipelines  
• deployments

Primary Documents

DEVOPS_RUNBOOK.md

---

## Architecture Layer

**Chief Architect Agent**

Responsible for:

• system architecture  
• platform scalability  
• technical standards

Primary Documents

TECHNICAL_PLAN.md

---

**System Architect Agent**

Responsible for:

• subsystem architecture  
• technical integration patterns

---

## Intelligence Layer

**Data Analytics Agent**

Responsible for:

• product metrics  
• reporting models  
• analytics instrumentation

---

# 6. Decision Authority Hierarchy

When conflicts arise, authority flows as follows:

1. Business Strategy Authority  
   Product Strategy Agent

2. Product Definition Authority  
   Product Manager Agent

3. UX Authority  
   UX Design Agent

4. Architecture Authority  
   Chief Architect / System Architect

5. Implementation Authority  
   Development Lead

6. Quality Authority  
   QA Agent

7. Operational Authority  
   DevOps Agent

Agents must defer to the appropriate authority.

---

# 7. Document Ownership

Planning documents have designated owners.

BUSINESS_PLAN.md  
Owner: Product Strategy Agent

MARKETING_STRATEGY.md  
Owner: Product Strategy Agent

PRODUCT_ROADMAP.md  
Owner: Product Manager Agent

PRODUCT_REQUIREMENTS.md  
Owner: Product Manager Agent

MVP_SPECIFICATION.md  
Owner: Product Manager Agent

UX_FLOWS.md  
Owner: UX Design Agent

BRAND_GUIDE.md  
BRAND_GUIDE_V2.md  
Owner: UX Design Agent

FULL_PROJECT_PLAN.md  
Owner: Project Manager Agent

DEVELOPMENT_TASK_LIST.md  
Owner: Project Manager Agent

TECHNICAL_PLAN.md  
Owner: Chief Architect Agent

DEVOPS_RUNBOOK.md  
Owner: DevOps Agent

AI_AGENT_COORDINATION.md  
Owner: Project Manager Agent

---

# 8. Planning Document Protection

Agents must not modify planning documents unless they are the owner.

If an agent believes a planning document is incorrect:

1. Document the issue
2. Propose a correction
3. Escalate to the document owner
4. Await approval

---

# 9. Collaboration Model

Product Strategy Agent  
 ↓  
Product Manager Agent  
 ↓  
UX Design Agent  
 ↓  
Project Manager Agent  
 ↓  
Development Lead Agent  
 ↓  
QA Agent  
 ↓  
DevOps Agent

Supporting Agents:

Chief Architect  
System Architect  
Customer Insights  
Data Analytics

---

# 10. Task Dispatch Protocol

When assigning work to an agent, include:

Objective  
Editable files  
Forbidden files  
Acceptance criteria  
Dependencies  
Quality checks

---

# 11. Safety Rules

Agents must never:

• delete critical system files  
• bypass quality gates  
• modify files outside ownership without coordination  
• introduce breaking architectural changes without approval

---

# 12. System Goal

The multi-agent system exists to enable:

parallel development  
clear ownership  
predictable delivery  
high quality releases

Agents collaborate to deliver the product efficiently and safely.
