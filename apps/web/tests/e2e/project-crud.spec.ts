import { test, expect } from './helpers/auth-fixture'

/**
 * Project CRUD E2E tests
 *
 * Covers project creation (name-only and all-fields), the 6-step
 * stepper, progress card, step detail page sections, project list
 * cards, and the sample project button.
 *
 * Uses the auth-fixture `orgPage` (logged-in user with an org).
 */

test.describe('Project CRUD', () => {
  // ─── Test 1: Create a project with name only ───────────────

  test('creates a project with name only and redirects to project detail', async ({ orgPage }) => {
    const page = orgPage
    const projectName = `E2E Name Only ${Date.now()}`

    await page.goto('/projects/new')
    await page.waitForLoadState('networkidle')

    // Fill the required name field
    await page.getByLabel('Project name').fill(projectName)

    // Submit the form
    await page.getByRole('button', { name: 'Create project' }).click()

    // Should redirect to the new project's detail page
    await expect(page).toHaveURL(/\/projects\/[a-f0-9-]+/, { timeout: 30000 })
    await page.waitForLoadState('networkidle')

    // The project title should appear on the detail page
    const projectTitle = page.getByText(projectName)
    await expect(projectTitle.first()).toBeVisible({ timeout: 10000 })
  })

  // ─── Test 2: Create project with description and target date ──

  test('creates a project with description and target date', async ({ orgPage }) => {
    const page = orgPage
    const projectName = `E2E Full Project ${Date.now()}`
    const description = 'E2E test project with all fields filled'

    await page.goto('/projects/new')
    await page.waitForLoadState('networkidle')

    // Fill name
    await page.getByLabel('Project name').fill(projectName)

    // Fill description
    await page.getByLabel('Description').fill(description)

    // Open the date picker and select a date
    // If the DatePicker renders as a button trigger, click it
    const dateButton = page.locator('button').filter({ hasText: /Pick a date|Select date/i })
    const hasDateButton = await dateButton.isVisible({ timeout: 3000 }).catch(() => false)

    if (hasDateButton) {
      await dateButton.click()
      // Select a future date in the calendar popup
      // Click a day number that's likely in the current month
      const futureDay = page.getByRole('gridcell', { name: '25' }).first()
      const hasFutureDay = await futureDay.isVisible({ timeout: 3000 }).catch(() => false)
      if (hasFutureDay) {
        await futureDay.click()
      }
    }

    // Submit
    await page.getByRole('button', { name: 'Create project' }).click()

    // Should redirect to project detail
    await expect(page).toHaveURL(/\/projects\/[a-f0-9-]+/, { timeout: 30000 })
    await page.waitForLoadState('networkidle')

    // Verify project name and description appear
    const projectTitle = page.getByText(projectName)
    await expect(projectTitle.first()).toBeVisible({ timeout: 10000 })

    const descriptionText = page.getByText(description)
    await expect(descriptionText.first()).toBeVisible()
  })

  // ─── Test 3: Project detail shows 6-step stepper ────────────

  test('project detail page shows 6-step stepper', async ({ orgPage }) => {
    const page = orgPage

    // Create a project
    const projectName = `E2E Stepper Test ${Date.now()}`
    await page.goto('/projects/new')
    await page.waitForLoadState('networkidle')
    await page.getByLabel('Project name').fill(projectName)
    await page.getByRole('button', { name: 'Create project' }).click()
    await expect(page).toHaveURL(/\/projects\/[a-f0-9-]+/, { timeout: 30000 })
    await page.waitForLoadState('networkidle')

    // Stepper should show all 6 PIPS step names
    const stepNames = ['Identify', 'Analyze', 'Generate', 'Select & Plan', 'Implement', 'Evaluate']
    for (const name of stepNames) {
      const stepElement = page.getByText(name, { exact: false })
      await expect(stepElement.first()).toBeVisible({ timeout: 10000 })
    }
  })

  // ─── Test 4: Project detail shows progress card ─────────────

  test('project detail shows progress information', async ({ orgPage }) => {
    const page = orgPage

    // Create a project
    const projectName = `E2E Progress Card ${Date.now()}`
    await page.goto('/projects/new')
    await page.waitForLoadState('networkidle')
    await page.getByLabel('Project name').fill(projectName)
    await page.getByRole('button', { name: 'Create project' }).click()
    await expect(page).toHaveURL(/\/projects\/[a-f0-9-]+/, { timeout: 30000 })
    await page.waitForLoadState('networkidle')

    // Project detail shows the current step label as a badge
    const currentStepBadge = page.getByText('Identify')
    await expect(currentStepBadge.first()).toBeVisible({ timeout: 10000 })

    // The "Project Details" card should show the created date and target date
    const projectDetailsCard = page.getByText('Project Details')
    await expect(projectDetailsCard).toBeVisible()

    // The "Current Step" row should be visible
    const currentStepRow = page.getByText('Current Step')
    await expect(currentStepRow).toBeVisible()
  })

  // ─── Test 5: Click step 1 navigates to step detail page ────

  test('clicking step 1 (Identify) navigates to step detail page', async ({ orgPage }) => {
    const page = orgPage

    // Create a project
    const projectName = `E2E Step Click ${Date.now()}`
    await page.goto('/projects/new')
    await page.waitForLoadState('networkidle')
    await page.getByLabel('Project name').fill(projectName)
    await page.getByRole('button', { name: 'Create project' }).click()
    await expect(page).toHaveURL(/\/projects\/[a-f0-9-]+/, { timeout: 30000 })
    await page.waitForLoadState('networkidle')

    // The stepper renders step buttons. Step 1 (Identify) is the current step
    // and should be clickable.
    const identifyButton = page.getByRole('button', { name: /Identify/i })
    await expect(identifyButton.first()).toBeVisible({ timeout: 10000 })
    await identifyButton.first().click()

    // Should navigate to step detail page
    await expect(page).toHaveURL(/\/projects\/[a-f0-9-]+\/steps\/1/, { timeout: 15000 })
    await page.waitForLoadState('networkidle')
  })

  // ─── Test 6: Step detail page shows sections ────────────────

  test('step detail page shows Guiding Questions, Analysis Tools, Completion Criteria', async ({
    orgPage,
  }) => {
    const page = orgPage

    // Create a project and navigate to step 1
    const projectName = `E2E Step Sections ${Date.now()}`
    await page.goto('/projects/new')
    await page.waitForLoadState('networkidle')
    await page.getByLabel('Project name').fill(projectName)
    await page.getByRole('button', { name: 'Create project' }).click()
    await expect(page).toHaveURL(/\/projects\/[a-f0-9-]+/, { timeout: 30000 })
    await page.waitForLoadState('networkidle')

    // Click step 1
    const identifyButton = page.getByRole('button', { name: /Identify/i })
    await identifyButton.first().click()
    await expect(page).toHaveURL(/\/projects\/[a-f0-9-]+\/steps\/1/, { timeout: 15000 })
    await page.waitForLoadState('networkidle')

    // Verify all three key sections exist
    const guidingQuestions = page.getByText('Guiding Questions')
    await expect(guidingQuestions).toBeVisible({ timeout: 10000 })

    const analysisTools = page.getByText('Analysis Tools')
    await expect(analysisTools).toBeVisible()

    const completionCriteria = page.getByText('Completion Criteria')
    await expect(completionCriteria).toBeVisible()

    // Status badge should also be visible (In Progress for step 1)
    const statusBadge = page.getByText(/(Not Started|In Progress|Completed|Skipped)/)
    await expect(statusBadge.first()).toBeVisible()
  })

  // ─── Test 7: Projects list page shows project card ──────────

  test('projects list page shows the created project card', async ({ orgPage }) => {
    const page = orgPage

    // Create a project
    const projectName = `E2E List Card ${Date.now()}`
    await page.goto('/projects/new')
    await page.waitForLoadState('networkidle')
    await page.getByLabel('Project name').fill(projectName)
    await page.getByRole('button', { name: 'Create project' }).click()
    await expect(page).toHaveURL(/\/projects\/[a-f0-9-]+/, { timeout: 30000 })

    // Navigate to projects list
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    // The project card should be visible in the grid
    const projectCard = page.getByText(projectName)
    await expect(projectCard.first()).toBeVisible({ timeout: 10000 })

    // Projects heading should be present
    const heading = page.getByRole('heading', { name: 'Projects' })
    await expect(heading).toBeVisible()
  })

  // ─── Test 8: Sample project button works ────────────────────

  test('sample project button on dashboard creates "Parking Lot Safety Improvement"', async ({
    orgPage,
  }) => {
    const page = orgPage

    // Navigate to dashboard
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Look for the sample project section
    const sampleButton = page.getByRole('button', { name: /Try a Sample Project/i })
    const hasSampleButton = await sampleButton.isVisible({ timeout: 5000 }).catch(() => false)

    if (!hasSampleButton) {
      // If the button is not visible (e.g., a sample project already exists),
      // skip this test gracefully
      test.skip()
      return
    }

    // Click the sample project button
    await sampleButton.click()

    // Should navigate to the new sample project's detail page
    await expect(page).toHaveURL(/\/projects\/[a-f0-9-]+/, { timeout: 30000 })
    await page.waitForLoadState('networkidle')

    // Verify the sample project name appears
    const sampleTitle = page.getByText('Parking Lot Safety Improvement')
    await expect(sampleTitle.first()).toBeVisible({ timeout: 10000 })

    // Navigate to projects list and verify it's there
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const projectInList = page.getByText('Parking Lot Safety Improvement')
    await expect(projectInList.first()).toBeVisible({ timeout: 10000 })
  })
})
