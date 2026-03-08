# PIPS 2.0 — Project Planning Index

**Created:** March 3, 2026  
**Status:** MVP Complete — Deployed to Production  
**Product Name:** PIPS (Process Improvement and Problem Solving)  
**Owner:** Marc Albers (GitHub: AgentCorp18)
**Production URL:** https://pips-app.vercel.app
**Repository:** AgentCorp18/pips2 (private)

---

## What is PIPS 2.0?

PIPS 2.0 is a multi-tenant SaaS web application that embeds a proven 6-step process improvement methodology (Identify → Analyze → Generate → Select & Plan → Implement → Evaluate) into enterprise-grade project management and ticketing software.

It is the first **methodology-embedded project management platform** where the process teaches teams _how to solve problems_, not just manage tasks.

Tech Stack: Next.js + TypeScript + Supabase + Vercel + Stripe

---

# AI Agent Organization

PIPS 2.0 is developed using a coordinated system of specialized AI agents.

Agents operate similarly to a modern product organization and collaborate through defined planning documents.

## Strategy Layer

- Product Strategy Agent

## Product Layer

- Product Manager Agent
- UX Design Agent
- Customer Insights Agent

## Execution Layer

- Project Manager Agent (Control Tower)
- Development Lead Agent
- QA Agent
- DevOps Agent

## Architecture Layer

- Chief Architect Agent
- System Architect Agent

## Intelligence Layer

- Data Analytics Agent

Agent coordination rules are defined in:

docs/planning/AI_AGENT_COORDINATION.md

---

# Agent Startup Path

When beginning a new work session, agents should read documents in the following order:

1. CLAUDE.md — Project rules and coding conventions
2. AI_AGENT_COORDINATION.md — Agent coordination protocols
3. PROJECT_INDEX.md — Orientation and planning map
4. AGENT_STATUS_BOARD.md — Current system state
5. FULL_PROJECT_PLAN.md — Current phase and milestones
6. DEVELOPMENT_TASK_LIST.md — Tactical tasks and dependencies

---

# Planning Documents

## Strategic Documents

BUSINESS_PLAN.md — market analysis, business model, positioning  
MARKETING_STRATEGY.md — campaigns, messaging, launch strategy

## Product Documents

PRODUCT_REQUIREMENTS.md — detailed feature requirements  
PRODUCT_ROADMAP.md — phase roadmap and release sequencing  
UX_FLOWS.md — interaction patterns and journeys

## Technical Documents

SYSTEM_ARCHITECTURE.md — system topology and domain model  
TECHNICAL_PLAN.md — schema, APIs, integrations  
DEVOPS_RUNBOOK.md — infrastructure and deployment

## Execution Documents

FULL_PROJECT_PLAN.md — phase execution overview  
DEVELOPMENT_TASK_LIST.md — tactical tasks with dependencies  
MVP_SPECIFICATION.md — original MVP build specification

## Coordination Documents

AI_AGENT_COORDINATION.md — multi-agent rules and coordination  
AGENT_STATUS_BOARD.md — real-time system state

---

# Document Ownership

| Document                 | Owner                  |
| ------------------------ | ---------------------- |
| BUSINESS_PLAN.md         | Product Strategy Agent |
| MARKETING_STRATEGY.md    | Product Strategy Agent |
| PRODUCT_ROADMAP.md       | Product Manager Agent  |
| PRODUCT_REQUIREMENTS.md  | Product Manager Agent  |
| MVP_SPECIFICATION.md     | Product Manager Agent  |
| UX_FLOWS.md              | UX Design Agent        |
| FULL_PROJECT_PLAN.md     | Project Manager Agent  |
| DEVELOPMENT_TASK_LIST.md | Project Manager Agent  |
| TECHNICAL_PLAN.md        | Chief Architect Agent  |
| SYSTEM_ARCHITECTURE.md   | Chief Architect Agent  |
| DEVOPS_RUNBOOK.md        | DevOps Agent           |
| AI_AGENT_COORDINATION.md | Project Manager Agent  |

---

# System Map

Strategy  
 Product Strategy Agent

Product  
 Product Manager Agent  
 UX Design Agent  
 Customer Insights Agent

Execution  
 Project Manager Agent (Control Tower)  
 Development Lead Agent  
 QA Agent  
 DevOps Agent

Architecture  
 Chief Architect Agent  
 System Architect Agent

Intelligence  
 Data Analytics Agent

---

# Build Status

MVP: Complete  
Production Deployment: Live

Post-MVP phases currently underway include:

Phase 1.5 — Stabilization  
Phase 2 — Knowledge Hub  
Phase 3 — Training Mode  
Phase 4 — Marketing Content  
Phase 5 — Workshop Facilitation  
Phase 6 — Product Polish

See FULL_PROJECT_PLAN.md for detailed status and sequencing.
