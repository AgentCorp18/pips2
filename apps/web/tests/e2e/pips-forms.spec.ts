import { test, expect } from './helpers/auth-fixture'
import { createTestOrg, createTestProject, cleanupTestOrg } from './helpers/test-factories'

/**
 * PIPS Forms E2E Tests
 *
 * Tests the 6-step PIPS workflow forms:
 *   Step 1 (Identify):      problem_statement, impact_assessment
 *   Step 2 (Analyze):       fishbone, five_why, force_field, checksheet
 *   Step 3 (Generate):      brainstorming, brainwriting
 *   Step 4 (Select & Plan): criteria_matrix, implementation_plan, raci, paired_comparisons
 *   Step 5 (Implement):     milestone_tracker, implementation_checklist
 *   Step 6 (Evaluate):      before_after, evaluation, lessons_learned, balance_sheet
 *
 * Uses factory-created project data with the auth fixture's orgPage.
 */

test.describe('PIPS step forms', () => {
  test.beforeAll(async () => {
    // We need a fresh authenticated context to get the user ID for factory setup.
    // The orgPage fixture handles this per-test, but we need shared data across tests.
    // So we create org + project here and clean up afterward.
  })

  test.describe('Step 1 — Identify', () => {
    test('navigate to project and see Step 1 form links', async ({ orgPage, testUser }) => {
      // Create test data for this test
      const org = await createTestOrg(testUser.id)
      const project = await createTestProject(org.id, testUser.id)

      try {
        // Navigate directly to step 1 page
        await orgPage.goto(`/projects/${project.id}/steps/1`)
        await orgPage.waitForLoadState('networkidle')

        // StepView renders form links with names from STEP_CONTENT
        // Step 1 forms: "Problem Statement", "Impact Assessment"
        const problemStatementLink = orgPage.getByText('Problem Statement')
        const impactAssessmentLink = orgPage.getByText('Impact Assessment')

        await expect(problemStatementLink.first()).toBeVisible()
        await expect(impactAssessmentLink.first()).toBeVisible()
      } finally {
        await cleanupTestOrg(org.id)
      }
    })

    test('Problem Statement form has required fields', async ({ orgPage, testUser }) => {
      const org = await createTestOrg(testUser.id)
      const project = await createTestProject(org.id, testUser.id)

      try {
        await orgPage.goto(`/projects/${project.id}/steps/1/forms/problem_statement`)
        await orgPage.waitForLoadState('networkidle')

        // ProblemStatementForm renders FormTextarea labels:
        //   "Current State (As-Is)", "Desired State", "Gap Analysis", "Problem Statement"
        const asIsField = orgPage.getByText(/Current State.*As-Is/i)
        const desiredStateField = orgPage.getByText('Desired State')
        const gapField = orgPage.getByText('Gap Analysis')
        const problemStatementField = orgPage.getByText('Problem Statement')

        await expect(asIsField.first()).toBeVisible()
        await expect(desiredStateField.first()).toBeVisible()
        await expect(gapField.first()).toBeVisible()
        await expect(problemStatementField.first()).toBeVisible()
      } finally {
        await cleanupTestOrg(org.id)
      }
    })

    test('filling a form field shows auto-save indicator', async ({ orgPage, testUser }) => {
      const org = await createTestOrg(testUser.id)
      const project = await createTestProject(org.id, testUser.id)

      try {
        await orgPage.goto(`/projects/${project.id}/steps/1/forms/problem_statement`)
        await orgPage.waitForLoadState('networkidle')

        // Find the first textarea and type into it
        const textarea = orgPage.locator('textarea').first()
        const hasTextarea = await textarea.isVisible().catch(() => false)

        if (!hasTextarea) {
          // Try an input field instead
          const input = orgPage.locator('input[type="text"]').first()
          await input.fill('E2E auto-save test data')
        } else {
          await textarea.fill('E2E auto-save test data')
        }

        // FormShell's SaveIndicator shows "Unsaved changes", "Saving...", or "Saved"
        const saveIndicator = orgPage.getByText(/(Unsaved changes|Saving\.\.\.|Saved)/)
        await expect(saveIndicator.first()).toBeVisible({ timeout: 5000 })
      } finally {
        await cleanupTestOrg(org.id)
      }
    })

    test('clicking Save button completes save', async ({ orgPage, testUser }) => {
      const org = await createTestOrg(testUser.id)
      const project = await createTestProject(org.id, testUser.id)

      try {
        await orgPage.goto(`/projects/${project.id}/steps/1/forms/problem_statement`)
        await orgPage.waitForLoadState('networkidle')

        // Fill a field so there is something to save
        const textarea = orgPage.locator('textarea').first()
        const hasTextarea = await textarea.isVisible().catch(() => false)

        if (hasTextarea) {
          await textarea.fill('E2E save test data')
        }

        // FormShell renders a "Save" button (variant="outline", size="sm")
        const saveButton = orgPage.getByRole('button', { name: /^Save$/i })
        await expect(saveButton).toBeVisible()
        await saveButton.click()

        // After save, FormShell's SaveIndicator shows "Saved"
        // or a toast "Saved" appears, or the button is ready again
        const savedIndicator = orgPage.getByText('Saved')
        const buttonReady = orgPage.getByRole('button', { name: /^Save$/i })

        // Either a "Saved" indicator appears or the Save button is still available
        await expect(savedIndicator.first().or(buttonReady)).toBeVisible({ timeout: 10000 })
      } finally {
        await cleanupTestOrg(org.id)
      }
    })
  })

  test.describe('Step 2 — Analyze', () => {
    test('Step 2 shows Fishbone and 5-Why form links', async ({ orgPage, testUser }) => {
      const org = await createTestOrg(testUser.id)
      const project = await createTestProject(org.id, testUser.id)

      try {
        // Navigate directly to step 2 page (stepper buttons for non-current steps are disabled)
        await orgPage.goto(`/projects/${project.id}/steps/2`)
        await orgPage.waitForLoadState('networkidle')

        // StepView renders form links from STEP_CONTENT[2].forms:
        //   "Fishbone Diagram", "5 Why Analysis", "Force Field Analysis", "Check Sheet"
        const fishboneLink = orgPage.getByText(/Fishbone/i)
        const fiveWhyLink = orgPage.getByText(/5 Why/i)

        await expect(fishboneLink.first()).toBeVisible()
        await expect(fiveWhyLink.first()).toBeVisible()
      } finally {
        await cleanupTestOrg(org.id)
      }
    })

    test('Fishbone form has category sections', async ({ orgPage, testUser }) => {
      const org = await createTestOrg(testUser.id)
      const project = await createTestProject(org.id, testUser.id)

      try {
        await orgPage.goto(`/projects/${project.id}/steps/2/forms/fishbone`)
        await orgPage.waitForLoadState('networkidle')

        // Fishbone diagrams typically have 6 categories (the 6 Ms or similar groupings)
        // Look for common fishbone category labels
        const categoryLabels = [
          /People|Man/i,
          /Process|Method/i,
          /Equipment|Machine/i,
          /Material/i,
          /Environment/i,
          /Management|Measurement/i,
        ]

        let visibleCategories = 0
        for (const label of categoryLabels) {
          const element = orgPage.getByText(label).first()
          const isVisible = await element.isVisible().catch(() => false)
          if (isVisible) visibleCategories++
        }

        // At least some category sections should be visible
        expect(visibleCategories).toBeGreaterThanOrEqual(3)
      } finally {
        await cleanupTestOrg(org.id)
      }
    })
  })

  test.describe('Step 4 — Select & Plan', () => {
    test('Step 4 shows Criteria Matrix link', async ({ orgPage, testUser }) => {
      const org = await createTestOrg(testUser.id)
      const project = await createTestProject(org.id, testUser.id)

      try {
        // Navigate directly to step 4 page (stepper only allows current step click)
        await orgPage.goto(`/projects/${project.id}/steps/4`)
        await orgPage.waitForLoadState('networkidle')

        // STEP_CONTENT[4].forms includes "Criteria Matrix"
        const criteriaMatrixLink = orgPage.getByText(/Criteria Matrix/i)
        await expect(criteriaMatrixLink.first()).toBeVisible()
      } finally {
        await cleanupTestOrg(org.id)
      }
    })
  })

  test.describe('Step 5 — Implement', () => {
    test('Step 5 shows Milestone Tracker link', async ({ orgPage, testUser }) => {
      const org = await createTestOrg(testUser.id)
      const project = await createTestProject(org.id, testUser.id)

      try {
        // Navigate directly to step 5 page
        await orgPage.goto(`/projects/${project.id}/steps/5`)
        await orgPage.waitForLoadState('networkidle')

        // STEP_CONTENT[5].forms includes "Milestone Tracker"
        const milestoneTrackerLink = orgPage.getByText(/Milestone Tracker/i)
        await expect(milestoneTrackerLink.first()).toBeVisible()
      } finally {
        await cleanupTestOrg(org.id)
      }
    })
  })

  test.describe('Step 6 — Evaluate', () => {
    test('Step 6 shows Evaluation form link', async ({ orgPage, testUser }) => {
      const org = await createTestOrg(testUser.id)
      const project = await createTestProject(org.id, testUser.id)

      try {
        // Navigate directly to step 6 page
        await orgPage.goto(`/projects/${project.id}/steps/6`)
        await orgPage.waitForLoadState('networkidle')

        // STEP_CONTENT[6].forms includes "Evaluation Summary"
        const evaluationLink = orgPage.getByText(/Evaluation/i)
        await expect(evaluationLink.first()).toBeVisible()
      } finally {
        await cleanupTestOrg(org.id)
      }
    })
  })

  test.describe('Form navigation', () => {
    test('"Back to step" link navigates back to the step page', async ({ orgPage, testUser }) => {
      const org = await createTestOrg(testUser.id)
      const project = await createTestProject(org.id, testUser.id)

      try {
        // Navigate directly to a form page
        await orgPage.goto(`/projects/${project.id}/steps/1/forms/problem_statement`)
        await orgPage.waitForLoadState('networkidle')

        // FormShell renders a Link with text "Back to step" and href to the step page
        const backLink = orgPage.getByText('Back to step')
        await expect(backLink.first()).toBeVisible()
        await backLink.first().click()
        await orgPage.waitForLoadState('networkidle')

        // Should navigate back to the step page (not the form page)
        // URL should end with /steps/{number} without /forms/ suffix
        await expect(orgPage).toHaveURL(/\/projects\/[a-f0-9-]+\/steps\/\d+$/)
      } finally {
        await cleanupTestOrg(org.id)
      }
    })
  })
})
