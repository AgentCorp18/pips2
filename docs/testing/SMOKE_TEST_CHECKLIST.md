# PIPS 2.0 — Smoke Test Checklist

> **Purpose:** Quick verification that core functionality works after each deployment.
> **Time:** ~15 minutes per run
> **Updated:** March 4, 2026

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

## Tickets & PIPS Steps

- [ ] Open ticket detail page
- [ ] Step 1 form loads and can be filled
- [ ] Step 2 form loads (Fishbone Diagram)
- [ ] Form data saves without errors
- [ ] Step navigation (next/previous) works
- [ ] Ticket status updates when advancing steps

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

## Settings

- [ ] Profile page loads with current user info
- [ ] Name update saves successfully
- [ ] Team page loads with member list
- [ ] Notification preferences page loads

---

## Cross-Cutting

- [ ] No JavaScript errors in browser console
- [ ] No 500 responses in Network tab
- [ ] Dark mode toggle works (if available)
- [ ] Page titles are correct in browser tab
- [ ] Back button navigates correctly

---

## Result

| Run Date | Tester | Pass/Fail | Notes |
| -------- | ------ | --------- | ----- |
|          |        |           |       |
