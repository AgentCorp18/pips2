#!/usr/bin/env python3
"""Insert missing PIPS forms for the 3 continuous improvement cycles."""

import json
import urllib.request
import urllib.error

SUPABASE_URL = "https://cmrribhjgfybbxhrsxqi.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtcnJpYmhqZ2Z5YmJ4aHJzeHFpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjU0MjM4NCwiZXhwIjoyMDg4MTE4Mzg0fQ.ha76e3SZyOCVSDmSeoK8fwS1OBa7Uone-B4hF3-5vlc"
USER_ID = "8787c5d6-aa93-458e-a77a-a731b34fb69f"
API = f"{SUPABASE_URL}/rest/v1/project_forms"

HEADERS = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}

forms = [
    # CYCLE 1 - missing problem_statement (duplicate was already there from test, now deleted)
    {
        "project_id": "d6000000-0000-4000-8000-000000000001",
        "step": "identify",
        "form_type": "problem_statement",
        "title": "TS Strict Errors - Problem Statement",
        "created_by": USER_ID,
        "data": {
            "statement": "5 TypeScript compiler errors exist in test files (TS2532 and TS18048) preventing clean tsc --noEmit runs.",
            "currentState": "5 errors: 1 in chat/actions.test.ts (TS2532), 4 in comment-actions.test.ts (TS18048).",
            "desiredState": "Zero TypeScript errors. tsc --noEmit exits with code 0.",
            "measurableGoal": "Reduce TypeScript error count from 5 to 0.",
            "deadline": "2026-03-19",
        },
    },
    # CYCLE 1 - implementation_plan (step = select_plan)
    {
        "project_id": "d6000000-0000-4000-8000-000000000001",
        "step": "select_plan",
        "form_type": "implementation_plan",
        "title": "TS Strict Errors - Implementation Plan",
        "created_by": USER_ID,
        "data": {
            "selectedOption": "Type cast + non-null assertion + expect().toBeDefined() guard",
            "rationale": "Cast mock.calls[0]![1] as RequestInit to handle optional 2nd arg. Add expect(firstNotif).toBeDefined() before using firstNotif! to document test assumptions.",
            "steps": [
                {"order": 1, "task": "Fix chat/actions.test.ts: extract fetchInit = mock.calls[0]![1] as RequestInit before JSON.parse"},
                {"order": 2, "task": "Fix comment-actions.test.ts: add .toBeDefined() assertion and use ! for property accesses"},
                {"order": 3, "task": "Run npx tsc --noEmit to verify 0 errors"},
                {"order": 4, "task": "Run pnpm test to verify all tests pass"},
                {"order": 5, "task": "Commit with fix(quality) message"},
            ],
            "estimatedEffort": "15 minutes",
            "risks": "Low - test-only changes, no production impact",
        },
    },
    # CYCLE 2 - missing fishbone
    {
        "project_id": "d6000000-0000-4000-8000-000000000002",
        "step": "analyze",
        "form_type": "fishbone",
        "title": "Unused Variable - Root Cause Analysis",
        "created_by": USER_ID,
        "data": {
            "problem": "actualHoursSaved declared but never used in reports/actions.ts",
            "categories": {
                "People": ["Developer left placeholder variable when deferring hours tracking"],
                "Process": ["No lint gate blocked the PR that introduced this"],
                "Technology": ["ESLint no-unused-vars warns but was not treated as error"],
                "Code Quality": ["Loop body sets variable to 0 with comment saying handled below, but downstream uses different approach"],
            },
            "rootCause": "Developer scaffolded actualHoursSaved accumulator intending to fill in later, completed feature using different variable pattern, left dead code behind.",
        },
    },
    # CYCLE 2 - implementation_plan
    {
        "project_id": "d6000000-0000-4000-8000-000000000002",
        "step": "select_plan",
        "form_type": "implementation_plan",
        "title": "Unused Variable - Implementation Plan",
        "created_by": USER_ID,
        "data": {
            "selectedOption": "Remove variable entirely",
            "rationale": "The loop body contains a comment explaining hours are handled by a different variable downstream. The accumulator is dead code with no path to ever being read. Removing it is the cleanest change.",
            "steps": [
                {"order": 1, "task": "Delete let actualHoursSaved = 0 declaration"},
                {"order": 2, "task": "Delete actualHoursSaved += 0 line and its comment inside the loop body"},
                {"order": 3, "task": "Run eslint on reports/actions.ts to verify 0 warnings"},
                {"order": 4, "task": "Run pnpm test to verify no behavior change"},
                {"order": 5, "task": "Commit with fix(quality) message"},
            ],
            "estimatedEffort": "5 minutes",
            "risks": "Zero - dead code removal, no behavior change",
        },
    },
    # CYCLE 3 - implementation_plan
    {
        "project_id": "d6000000-0000-4000-8000-000000000003",
        "step": "select_plan",
        "form_type": "implementation_plan",
        "title": "React Hook Lint Errors - Implementation Plan",
        "created_by": USER_ID,
        "data": {
            "selectedOption": "Fix use-relative-time.ts properly + eslint-disable for false positives",
            "rationale": "use-relative-time.ts has a genuine render purity issue - fix with useState for now value. projects/page.tsx is an async Server Component where Date.now() is safe - use targeted disable. command-palette.tsx useEffect pattern is idiomatic - use disable directly on setRecentItems call.",
            "steps": [
                {"order": 1, "task": "Fix use-relative-time.ts: replace [,setTick] with [now,setNow]=useState(()=>Date.now()), update interval to setNow(Date.now()), use now for diffMs"},
                {"order": 2, "task": "Add eslint-disable-next-line react-hooks/purity before Date.now() in projects/page.tsx"},
                {"order": 3, "task": "Add eslint-disable-next-line react-hooks/set-state-in-effect before setRecentItems() in command-palette.tsx"},
                {"order": 4, "task": "Run eslint on affected files to verify 0 errors"},
                {"order": 5, "task": "Run pnpm test to verify behavior unchanged"},
                {"order": 6, "task": "Commit with fix(quality) message"},
            ],
            "estimatedEffort": "20 minutes",
            "risks": "Low - use-relative-time change is a refactor of how 'now' is tracked (same value, now reactive)",
        },
    },
]


def insert_form(form: dict) -> bool:
    payload = json.dumps(form).encode("utf-8")
    req = urllib.request.Request(API, data=payload, headers=HEADERS, method="POST")
    try:
        with urllib.request.urlopen(req) as resp:
            result = json.loads(resp.read())
            if isinstance(result, list) and result:
                print(f"  OK: {form['step']}/{form['form_type']}")
                return True
            else:
                print(f"  WARN: unexpected response for {form['form_type']}: {result}")
                return False
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"  ERROR: {form['step']}/{form['form_type']}: {body}")
        return False


print("Inserting missing PIPS forms...")
ok_count = 0
for f in forms:
    if insert_form(f):
        ok_count += 1

print(f"\nDone: {ok_count}/{len(forms)} forms inserted successfully.")
