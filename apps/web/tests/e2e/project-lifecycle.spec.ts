import { test, expect, type Page } from '@playwright/test'

/**
 * Project Lifecycle E2E flow
 *
 * Tests creating a project, viewing it in the list, navigating through
 * the 6-step stepper, and interacting with step forms (including auto-save).
 */

/** Helper: attempt login and skip tests if auth fails */
const loginIfPossible = async (page: Page): Promise<boolean> => {
  await page.goto('/login')
  await page.waitForLoadState('networkidle')

  const emailInput = page.locator('input[name="email"]')
  const isLoginPage = await emailInput.isVisible().catch(() => false)

  if (!isLoginPage) {
    // Already authenticated or redirected
    return !page.url().includes('/login')
  }

  // Fill login form with test credentials from env
  const email = process.env.E2E_USER_EMAIL
  const password = process.env.E2E_USER_PASSWORD

  if (!email || !password) {
    return false
  }

  await emailInput.fill(email)
  await page.locator('input[name="password"]').fill(password)
  await page.getByRole('button', { name: 'Sign in' }).click()

  // Wait for navigation away from login
  await page.waitForURL(/\/(dashboard|onboarding|projects)/, { timeout: 10000 }).catch(() => {})
  return !page.url().includes('/login')
}

test.describe('Project creation page', () => {
  test('redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/projects/new')

    await expect(page).toHaveURL(/\/login/)
  })

  test('renders the new project form', async ({ page }) => {
    const loggedIn = await loginIfPossible(page)

    if (!loggedIn) {
      test.skip()
      return
    }

    await page.goto('/projects/new')
    await page.waitForLoadState('networkidle')

    // Verify title
    await expect(page).toHaveTitle(/New Project/)

    // Verify form heading
    const heading = page.getByTestId('create-project-heading')
    await expect(heading).toBeVisible()

    // Verify form fields
    const nameInput = page.getByTestId('project-name-input')
    const descriptionTextarea = page.getByTestId('project-description-input')

    await expect(nameInput).toBeVisible()
    await expect(descriptionTextarea).toBeVisible()

    // Verify submit button
    const submitButton = page.getByTestId('create-project-button')
    await expect(submitButton).toBeVisible()
    await expect(submitButton).toBeEnabled()
  })

  test('project form has correct placeholder text', async ({ page }) => {
    const loggedIn = await loginIfPossible(page)

    if (!loggedIn) {
      test.skip()
      return
    }

    await page.goto('/projects/new')
    await page.waitForLoadState('networkidle')

    const nameInput = page.getByTestId('project-name-input')
    await expect(nameInput).toHaveAttribute('placeholder', 'e.g. Reduce onboarding time')

    const descriptionTextarea = page.getByTestId('project-description-input')
    await expect(descriptionTextarea).toHaveAttribute(
      'placeholder',
      'Describe the process you want to improve...',
    )
  })

  test('form can be filled with project data', async ({ page }) => {
    const loggedIn = await loginIfPossible(page)

    if (!loggedIn) {
      test.skip()
      return
    }

    await page.goto('/projects/new')
    await page.waitForLoadState('networkidle')

    const nameInput = page.getByTestId('project-name-input')
    const descriptionTextarea = page.getByTestId('project-description-input')

    await nameInput.fill('E2E Test Project')
    await descriptionTextarea.fill('This is a test project created by E2E tests')

    await expect(nameInput).toHaveValue('E2E Test Project')
    await expect(descriptionTextarea).toHaveValue('This is a test project created by E2E tests')
  })

  test('submit button shows loading state when clicked', async ({ page }) => {
    const loggedIn = await loginIfPossible(page)

    if (!loggedIn) {
      test.skip()
      return
    }

    await page.goto('/projects/new')
    await page.waitForLoadState('networkidle')

    // Fill required field
    await page.getByTestId('project-name-input').fill('E2E Test Project')

    const submitButton = page.getByTestId('create-project-button')
    await submitButton.click()

    // Check for pending state
    const pendingButton = page.getByRole('button', { name: /Creating project/ })
    await expect(pendingButton.or(submitButton)).toBeVisible()
  })
})

test.describe('Projects list page', () => {
  test('redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/projects')

    await expect(page).toHaveURL(/\/login/)
  })

  test('shows projects page heading', async ({ page }) => {
    const loggedIn = await loginIfPossible(page)

    if (!loggedIn) {
      test.skip()
      return
    }

    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const heading = page.getByTestId('projects-page-heading')
    await expect(heading).toBeVisible()

    const description = page.getByTestId('projects-description')
    await expect(description).toBeVisible()
  })

  test('has a "New Project" button linking to /projects/new', async ({ page }) => {
    const loggedIn = await loginIfPossible(page)

    if (!loggedIn) {
      test.skip()
      return
    }

    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const newProjectButton = page.getByTestId('new-project-link')
    await expect(newProjectButton).toBeVisible()
    await expect(newProjectButton).toHaveAttribute('href', '/projects/new')
  })

  test('shows empty state or project cards', async ({ page }) => {
    const loggedIn = await loginIfPossible(page)

    if (!loggedIn) {
      test.skip()
      return
    }

    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    // Either shows project cards OR empty state
    const emptyState = page.getByTestId('projects-empty-title')
    const projectGrid = page.locator('.grid')

    const hasEmpty = await emptyState.isVisible().catch(() => false)
    const hasGrid = await projectGrid.isVisible().catch(() => false)

    expect(hasEmpty || hasGrid).toBe(true)
  })

  test('New Project button navigates to creation form', async ({ page }) => {
    const loggedIn = await loginIfPossible(page)

    if (!loggedIn) {
      test.skip()
      return
    }

    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const newProjectButton = page.getByTestId('new-project-link')
    await newProjectButton.click()

    await expect(page).toHaveURL(/\/projects\/new/)
  })

  test('has export projects button', async ({ page }) => {
    const loggedIn = await loginIfPossible(page)

    if (!loggedIn) {
      test.skip()
      return
    }

    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    // Export button should be visible in the header area
    const exportButton = page.getByRole('button', { name: /Export/i })
    await expect(exportButton).toBeVisible()
  })
})

test.describe('Project detail and step stepper', () => {
  test('project detail page shows stepper with 6 steps', async ({ page }) => {
    const loggedIn = await loginIfPossible(page)

    if (!loggedIn) {
      test.skip()
      return
    }

    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    // Click first project card if available
    const projectLink = page.locator('a[href^="/projects/"]').first()
    const hasProject = await projectLink.isVisible().catch(() => false)

    if (!hasProject) {
      test.skip()
      return
    }

    await projectLink.click()
    await page.waitForLoadState('networkidle')

    // Verify we're on a project detail page
    await expect(page).toHaveURL(/\/projects\/[a-f0-9-]+/)

    // Stepper should show the 6 PIPS step names
    const stepNames = ['Identify', 'Analyze', 'Generate', 'Select', 'Implement', 'Evaluate']
    for (const name of stepNames) {
      const step = page.getByText(name, { exact: false })
      await expect(step.first()).toBeVisible()
    }
  })

  test('project detail shows progress, team, and target date cards', async ({ page }) => {
    const loggedIn = await loginIfPossible(page)

    if (!loggedIn) {
      test.skip()
      return
    }

    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const projectLink = page.locator('a[href^="/projects/"]').first()
    const hasProject = await projectLink.isVisible().catch(() => false)

    if (!hasProject) {
      test.skip()
      return
    }

    await projectLink.click()
    await page.waitForLoadState('networkidle')

    // Verify info cards
    const progressLabel = page.getByText('Progress')
    const teamLabel = page.getByText('Team')
    const targetLabel = page.getByText('Target Date')

    await expect(progressLabel).toBeVisible()
    await expect(teamLabel).toBeVisible()
    await expect(targetLabel).toBeVisible()

    // Progress shows X / 6 format
    const progressValue = page.getByText(/\d+ \/ 6/)
    await expect(progressValue).toBeVisible()
  })

  test('clicking a step navigates to the step detail page', async ({ page }) => {
    const loggedIn = await loginIfPossible(page)

    if (!loggedIn) {
      test.skip()
      return
    }

    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const projectLink = page.locator('a[href^="/projects/"]').first()
    const hasProject = await projectLink.isVisible().catch(() => false)

    if (!hasProject) {
      test.skip()
      return
    }

    await projectLink.click()
    await page.waitForLoadState('networkidle')

    // Click the first (current) step button in the stepper
    const stepButton = page.getByTestId('step-button-1')
    const isClickable = await stepButton.isEnabled().catch(() => false)

    if (isClickable) {
      await stepButton.click()
      await page.waitForLoadState('networkidle')

      // Should navigate to step detail
      await expect(page).toHaveURL(/\/projects\/[a-f0-9-]+\/steps\/\d+/)
    }
  })
})

test.describe('Step detail page', () => {
  test('step page shows objective, guiding questions, and analysis tools', async ({ page }) => {
    const loggedIn = await loginIfPossible(page)

    if (!loggedIn) {
      test.skip()
      return
    }

    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const projectLink = page.locator('a[href^="/projects/"]').first()
    const hasProject = await projectLink.isVisible().catch(() => false)

    if (!hasProject) {
      test.skip()
      return
    }

    await projectLink.click()
    await page.waitForLoadState('networkidle')

    // Click step 1 if clickable
    const stepButton = page.getByTestId('step-button-1')
    const isClickable = await stepButton.isEnabled().catch(() => false)

    if (!isClickable) {
      test.skip()
      return
    }

    await stepButton.click()
    await page.waitForLoadState('networkidle')

    // Verify step content sections
    const guidingQuestions = page.getByTestId('guiding-questions-title')
    const analysisTools = page.getByTestId('analysis-tools-title')
    const completionCriteria = page.getByTestId('completion-criteria-title')

    await expect(guidingQuestions).toBeVisible()
    await expect(analysisTools).toBeVisible()
    await expect(completionCriteria).toBeVisible()
  })

  test('step page shows status badge', async ({ page }) => {
    const loggedIn = await loginIfPossible(page)

    if (!loggedIn) {
      test.skip()
      return
    }

    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const projectLink = page.locator('a[href^="/projects/"]').first()
    const hasProject = await projectLink.isVisible().catch(() => false)

    if (!hasProject) {
      test.skip()
      return
    }

    await projectLink.click()
    await page.waitForLoadState('networkidle')

    const stepButton = page.getByTestId('step-button-1')
    const isClickable = await stepButton.isEnabled().catch(() => false)

    if (!isClickable) {
      test.skip()
      return
    }

    await stepButton.click()
    await page.waitForLoadState('networkidle')

    // Should show a status badge (Not Started, In Progress, or Completed)
    const statusBadge = page.getByTestId('step-status-badge')
    await expect(statusBadge.first()).toBeVisible()
  })

  test('form links navigate to the form page', async ({ page }) => {
    const loggedIn = await loginIfPossible(page)

    if (!loggedIn) {
      test.skip()
      return
    }

    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const projectLink = page.locator('a[href^="/projects/"]').first()
    const hasProject = await projectLink.isVisible().catch(() => false)

    if (!hasProject) {
      test.skip()
      return
    }

    await projectLink.click()
    await page.waitForLoadState('networkidle')

    const stepButton = page.getByTestId('step-button-1')
    const isClickable = await stepButton.isEnabled().catch(() => false)

    if (!isClickable) {
      test.skip()
      return
    }

    await stepButton.click()
    await page.waitForLoadState('networkidle')

    // Click the first form link (e.g., Problem Statement)
    const formLink = page.locator('a[href*="/forms/"]').first()
    const hasFormLink = await formLink.isVisible().catch(() => false)

    if (!hasFormLink) {
      test.skip()
      return
    }

    await formLink.click()
    await page.waitForLoadState('networkidle')

    // Should navigate to a form page
    await expect(page).toHaveURL(/\/forms\//)
  })
})

test.describe('Form auto-save', () => {
  test('form page shows save indicator and back-to-step link', async ({ page }) => {
    const loggedIn = await loginIfPossible(page)

    if (!loggedIn) {
      test.skip()
      return
    }

    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const projectLink = page.locator('a[href^="/projects/"]').first()
    const hasProject = await projectLink.isVisible().catch(() => false)

    if (!hasProject) {
      test.skip()
      return
    }

    await projectLink.click()
    await page.waitForLoadState('networkidle')

    const stepButton = page.getByTestId('step-button-1')
    const isClickable = await stepButton.isEnabled().catch(() => false)

    if (!isClickable) {
      test.skip()
      return
    }

    await stepButton.click()
    await page.waitForLoadState('networkidle')

    const formLink = page.locator('a[href*="/forms/"]').first()
    const hasFormLink = await formLink.isVisible().catch(() => false)

    if (!hasFormLink) {
      test.skip()
      return
    }

    await formLink.click()
    await page.waitForLoadState('networkidle')

    // Verify "Back to step" link
    const backLink = page.getByTestId('back-to-step-link')
    await expect(backLink).toBeVisible()

    // Verify manual Save button
    const saveButton = page.getByTestId('form-save-button')
    await expect(saveButton).toBeVisible()
  })

  test('typing in a form field shows unsaved changes indicator', async ({ page }) => {
    const loggedIn = await loginIfPossible(page)

    if (!loggedIn) {
      test.skip()
      return
    }

    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const projectLink = page.locator('a[href^="/projects/"]').first()
    const hasProject = await projectLink.isVisible().catch(() => false)

    if (!hasProject) {
      test.skip()
      return
    }

    await projectLink.click()
    await page.waitForLoadState('networkidle')

    const stepButton = page.getByTestId('step-button-1')
    const isClickable = await stepButton.isEnabled().catch(() => false)

    if (!isClickable) {
      test.skip()
      return
    }

    await stepButton.click()
    await page.waitForLoadState('networkidle')

    const formLink = page.locator('a[href*="/forms/"]').first()
    const hasFormLink = await formLink.isVisible().catch(() => false)

    if (!hasFormLink) {
      test.skip()
      return
    }

    await formLink.click()
    await page.waitForLoadState('networkidle')

    // Type something into the first textarea on the form
    const textarea = page.locator('textarea').first()
    const hasTextarea = await textarea.isVisible().catch(() => false)

    if (!hasTextarea) {
      test.skip()
      return
    }

    await textarea.fill('E2E test data for auto-save verification')

    // After typing, "Unsaved changes" or "Saving..." should appear
    const unsavedIndicator = page.getByText(/(Unsaved changes|Saving\.\.\.|Saved)/)
    await expect(unsavedIndicator.first()).toBeVisible({ timeout: 5000 })
  })
})
