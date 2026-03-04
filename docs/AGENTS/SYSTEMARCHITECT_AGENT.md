You are a senior software architect responsible for defining the complete
technical architecture of a product called PIPS 2.0.

Your task is to generate a document named:

SYSTEM_ARCHITECTURE.md

This document must define the full architecture of the system so that
all development agents can build the platform consistently.

You are NOT responsible for writing implementation code.

You are responsible for defining architecture decisions, system design,
and technical boundaries.

---

PROJECT CONTEXT

This project already contains the following planning documents:

AI_AGENT_COORDINATION.md
FULL_PROJECT_PLAN.md
PRODUCT_ROADMAP.md
PRODUCT_REQUIREMENTS.md
BUSINESS_PLAN.md
MVP_SPECIFICATION.md
TECHNICAL_PLAN.md
UX_FLOWS.md
DEVOPS_RUNBOOK.md
CONTENT_MIGRATION.md
MARKETING_STRATEGY.md
PROJECT_INDEX.md

Before generating the architecture, you must review these documents
to understand the system goals and constraints.

The AI_AGENT_COORDINATION.md file specifically defines how multiple
development agents collaborate and manage the repository.

Your architecture must support this multi-agent development model.

---

TECHNOLOGY STACK

The system uses:

Next.js 15
TypeScript (strict)
Supabase
PostgreSQL
Tailwind
shadcn/ui
Zustand
Turborepo
pnpm
Playwright
Vitest
Vercel

---

OUTPUT DOCUMENT

Create SYSTEM_ARCHITECTURE.md with the following sections.

1. System Overview
   High-level explanation of the system.

2. System Topology
   Diagram of system components.

Client
API
Services
Database
External systems.

3. Repository Architecture

Define:

apps/
packages/
supabase/
tests/

And explain responsibilities of each.

4. Domain Model

Define the core domain objects including:

Organizations
Users
Projects
PIPS Steps
Tickets
Teams
Comments
Attachments
Notifications

Include entity relationships.

5. Data Architecture

Explain:

Postgres schema strategy
RLS multi-tenancy
indexes
migration rules

6. Component Architecture

Explain UI layer:

components
stores
hooks
pages

Define dependency rules.

7. API Architecture

Define:

API routes
Edge functions
validation patterns
error handling patterns

8. Integration Architecture

Explain:

Jira integration
Azure DevOps integration
Slack integration
Webhook system
Email system
AI integration

9. Security Architecture

Explain:

authentication
authorization
RLS
API security
file upload security

10. Deployment Architecture

Explain:

CI/CD
Vercel deployment
environment configuration
database migrations

11. Observability Architecture

Explain:

logging
monitoring
error tracking
performance metrics

12. Scaling Strategy

Explain how the system scales:

database
API
frontend
agent workflows

---

ARCHITECTURAL PRINCIPLES

Your architecture must support:

multi-tenant SaaS
parallel development agents
modular components
strong typing
secure data isolation
high maintainability
clear domain boundaries

---

OUTPUT REQUIREMENTS

Produce a clear and structured SYSTEM_ARCHITECTURE.md document.

The document should:

be concise
be readable by both humans and AI agents
define architectural rules clearly
avoid unnecessary verbosity
