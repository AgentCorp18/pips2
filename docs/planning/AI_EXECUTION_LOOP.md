# AI Execution Loop — PIPS 2.0

This document defines how AI agents continuously execute work within the system.

The execution loop ensures the project progresses even without manual orchestration.

---

# 1. Execution Model

Agents operate in an iterative loop consisting of:

Observe  
Plan  
Execute  
Validate  
Record

This loop repeats continuously throughout the lifecycle of the project.

---

# 2. Execution Cycle

Each cycle follows these stages.

---

## Stage 1 — Observe

The active agent reviews the current system state.

Sources include:

PROJECT_INDEX.md  
work logs  
active branches  
task lists  
planning documents

The agent determines:

• current milestone  
• active tasks  
• blockers  
• completed work

---

## Stage 2 — Plan

The agent selects the next logical work item based on:

FULL_PROJECT_PLAN.md  
PRODUCT_ROADMAP.md  
DEVELOPMENT_TASK_LIST.md

Dependencies must be respected.

---

## Stage 3 — Execute

The responsible agent performs the task.

Examples:

Development Lead implements feature  
UX Agent refines flow  
QA Agent writes tests  
DevOps Agent configures deployment

Agents must remain within file ownership boundaries.

---

## Stage 4 — Validate

Before work is considered complete:
