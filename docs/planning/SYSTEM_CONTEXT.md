# SYSTEM_CONTEXT.md — PIPS 2.0

This document provides the conceptual model for the PIPS platform so that AI agents understand the _intent_ behind the system.

It defines the business model, product philosophy, domain model, and system constraints.

---

# Product Philosophy

PIPS is not a traditional project management tool.

It is a **methodology‑embedded platform**.

Traditional tools answer:
"What tasks exist?"

PIPS answers:
"How should teams solve problems?"

The system embeds a structured process improvement method into everyday project work.

---

# Core Methodology

PIPS operationalizes a 6‑step improvement cycle:

1. Identify
2. Analyze
3. Generate
4. Select & Plan
5. Implement
6. Evaluate

Each step introduces structured tools that guide teams toward better decisions.

---

# Product Model

The product organizes work around several core objects.

## Organizations

A company or team workspace.

## Projects

A PIPS improvement initiative.

## Tickets

Tasks or problem-solving activities inside a project.

## Teams

Groups of users collaborating on projects.

## Knowledge Assets

Content generated from completed improvement cycles.

---

# Domain Model

Organization
contains Projects
contains Tickets
progress through PIPS Steps

Users belong to Organizations.

Teams coordinate work across projects.

Completed projects generate Knowledge Assets.

---

# Multi-Tenant Model

The system is fully multi-tenant.

Every table includes:

org_id

Row Level Security ensures tenants cannot access each other's data.

---

# Product Value Proposition

PIPS helps organizations:

- solve problems systematically
- capture institutional knowledge
- improve decision quality
- reduce wasted effort

It combines:

process improvement  
project management  
organizational learning

into one platform.

---

# System Boundaries

PIPS is **not intended to replace**:

- Jira
- Asana
- Linear

Instead it complements them by adding **structured problem-solving workflows**.

---

# Design Principles

The platform must always prioritize:

Clarity  
Structure  
Guided thinking  
Minimal cognitive overload  
Institutional learning

---

# Strategic Goal

PIPS should become the **default system for structured problem solving inside organizations**.

Every improvement cycle should create knowledge that makes the next cycle faster and better.
