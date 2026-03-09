# PIPS 2.0 — Smoke Test Checklist

> **Purpose:** Quick verification that core functionality works after each deployment.
> **Time:** ~15 minutes per run
> **Updated:** March 8, 2026

---

## Pre-Requisites

- [ ] App loads at https://pips-app.vercel.app (no 500 errors)
- [ ] Login page renders
- [ ] No console errors on initial load

---

## Authentication

- [ ] Sign in with existing account works
- [ ] Redirect to dashboard after login
- [ ] Sign out works and redirects to login
- [ ] Protected routes redirect to login when not authenticated

---

## Dashboard

- [ ] Dashboard loads with project list
- [ ] Quick stats visible (projects, tickets, etc.)
- [ ] Sidebar navigation links all work
- [ ] User avatar/name visible in header

---

## Projects

- [ ] Create new project (name + description)
- [ ] Project appears in project list
- [ ] Open project detail page
- [ ] Create ticket inside project
- [ ] Ticket appears in project's ticket list

---

## Tickets

- [ ] Create ticket via Quick Create (top of page)
- [ ] Create ticket via Full Form (all fields)
- [ ] Ticket redirects to detail page after creation
- [ ] Ticket appears in ticket list
- [ ] Open Kanban board — tickets visible in columns
- [ ] Quick-create FAB visible and creates ticket

---

## PIPS Steps

- [ ] Open project detail — 6-step stepper visible
- [ ] Step 1 (Identify): fill Problem Statement form → save → verify persistence
- [ ] Step 2 (Analyze): Fishbone Diagram loads
- [ ] Form data saves without errors
- [ ] Step navigation (next/previous) works

---

## Knowledge Hub

- [ ] Knowledge Hub landing page loads with 4 pillar cards
- [ ] Book chapter list renders
- [ ] Open a chapter — content renders with markdown formatting
- [ ] Search returns results for "problem statement"
- [ ] Bookmark button toggles bookmark state
- [ ] Bookmarks page shows saved bookmarks

---

## Training

- [ ] Training landing page loads with learning paths
- [ ] Open a learning path — modules listed
- [ ] Multiple choice exercise submits and shows feedback
- [ ] Reflection exercise accepts text input
- [ ] Progress page shows completion stats

---

## Workshop

- [ ] Workshop hub page loads
- [ ] Create new session from template
- [ ] Session detail page loads with timer and modules
- [ ] Timer starts (countdown mode)
- [ ] Timer pauses and resumes
- [ ] Module navigation (next/previous) works

---

## Reports

- [ ] Reports hub loads with category cards
- [ ] Project report renders charts with data
- [ ] Team report renders charts
- [ ] Methodology report renders charts

---

## AI Assist

- [ ] AI assist button visible on ticket description field
- [ ] Click AI assist — streaming response appears
- [ ] Accept AI suggestion — text populates field

---

## Settings & Profile

- [ ] Profile page loads with current user info
- [ ] Update display name → verify persistence
- [ ] Team page loads with member list
- [ ] Notification preferences page loads
- [ ] Audit log shows recent entries

---

## Cross-Cutting

- [ ] No JavaScript errors in browser console
- [ ] No 500 responses in Network tab
- [ ] Page titles are correct in browser tab
- [ ] Back button navigates correctly

---

## Mobile (375px viewport)

- [ ] Dashboard loads, sidebar collapses
- [ ] Create ticket flow works
- [ ] Knowledge Hub content readable
- [ ] Navigation accessible via mobile menu

---

## Result

| Run Date | Tester | Pass/Fail | Notes |
| -------- | ------ | --------- | ----- |
|          |        |           |       |
