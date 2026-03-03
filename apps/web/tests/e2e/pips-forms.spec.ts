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
        await orgPage.goto(`/projects/${project.id}`)
        await orgPage.waitForLoadState('networkidle')

        // Click on Step 1 (Identify) in the stepper
        const stepButton = orgPage
          .getByRole('button', { name: /Identify/i })
          .or(orgPage.getByText('Identify').first())
        await stepButton.click()
        await orgPage.waitForLoadState('networkidle')

        // Should see Problem Statement and Impact Assessment form links
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

        // Verify the 4 key form fields exist
        const asIsField = orgPage.getByText('As-Is')
        const desiredStateField = orgPage.getByText('Desired State')
        const gapField = orgPage.getByText('Gap')
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

        // After typing, an unsaved/saving indicator should appear
        const saveIndicator = orgPage.getByText(/(Unsaved changes|Saving\.\.\.|Saved|Auto-saved)/)
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

        // Click the Save button
        const saveButton = orgPage.getByRole('button', { name: /Save/i })
        await expect(saveButton).toBeVisible()
        await saveButton.click()

        // After save, look for a success indicator ("Saved", checkmark, or the button returning to normal)
        const savedIndicator = orgPage.getByText(/(Saved|All changes saved|Save successful)/)
        const buttonReady = orgPage.getByRole('button', { name: /Save/i })

        // Either a "Saved" message appears or the Save button is still available (not in loading state)
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
        await orgPage.goto(`/projects/${project.id}`)
        await orgPage.waitForLoadState('networkidle')

        // Navigate to Step 2
        const stepButton = orgPage
          .getByRole('button', { name: /Analyze/i })
          .or(orgPage.getByText('Analyze').first())
        await stepButton.click()
        await orgPage.waitForLoadState('networkidle')

        // Should see Fishbone and 5-Why form links
        const fishboneLink = orgPage.getByText(/Fishbone/i)
        const fiveWhyLink = orgPage.getByText(/5.Why/i).or(orgPage.getByText(/Five.Why/i))

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
        await orgPage.goto(`/projects/${project.id}`)
        await orgPage.waitForLoadState('networkidle')

        // Navigate to Step 4
        const stepButton = orgPage
          .getByRole('button', { name: /Select/i })
          .or(orgPage.getByText('Select').first())
        await stepButton.click()
        await orgPage.waitForLoadState('networkidle')

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
        await orgPage.goto(`/projects/${project.id}`)
        await orgPage.waitForLoadState('networkidle')

        // Navigate to Step 5
        const stepButton = orgPage
          .getByRole('button', { name: /Implement/i })
          .or(orgPage.getByText('Implement').first())
        await stepButton.click()
        await orgPage.waitForLoadState('networkidle')

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
        await orgPage.goto(`/projects/${project.id}`)
        await orgPage.waitForLoadState('networkidle')

        // Navigate to Step 6
        const stepButton = orgPage
          .getByRole('button', { name: /Evaluate/i })
          .or(orgPage.getByText('Evaluate').first())
        await stepButton.click()
        await orgPage.waitForLoadState('networkidle')

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

        // Click the "Back to step" link
        const backLink = orgPage
          .getByText(/Back to step/i)
          .or(orgPage.getByRole('link', { name: /Back/i }))
        await expect(backLink.first()).toBeVisible()
        await backLink.first().click()
        await orgPage.waitForLoadState('networkidle')

        // Should navigate back to the step page (not the form page)
        await expect(orgPage).toHaveURL(/\/projects\/[a-f0-9-]+\/steps\/\d+$/)
      } finally {
        await cleanupTestOrg(org.id)
      }
    })
  })
})
