import { test, expect } from './helpers/auth-fixture'

/**
 * Training E2E Tests
 *
 * Tests the training hub landing page, learning paths listing,
 * path detail navigation, progress page, practice scenarios,
 * breadcrumb navigation, page structure, and content elements.
 *
 * Uses the auth-fixture `orgPage` (logged-in user with an org).
 */

test.describe('Training hub', () => {
  // ─── Test 1: Landing page loads with heading ────────────────

  test('training landing page loads with heading', async ({ orgPage }) => {
    await orgPage.goto('/training')
    await orgPage.waitForLoadState('networkidle')

    const landing = orgPage.getByTestId('training-landing')
    await expect(landing).toBeVisible()

    const title = orgPage.getByTestId('training-title')
    await expect(title).toBeVisible()
    await expect(title).toHaveText('Training')
  })

  // ─── Test 2: Landing page shows subtitle text ──────────────

  test('training landing shows subtitle describing learning paths', async ({ orgPage }) => {
    await orgPage.goto('/training')
    await orgPage.waitForLoadState('networkidle')

    await expect(orgPage.getByTestId('training-landing')).toBeVisible({ timeout: 15000 })

    // Subtitle text should be present under the heading
    const subtitle = orgPage.getByText('Structured learning paths to master the PIPS methodology')
    await expect(subtitle).toBeVisible()
  })

  // ─── Test 3: My Progress link is present ────────────────────

  test('training landing shows My Progress link', async ({ orgPage }) => {
    await orgPage.goto('/training')
    await orgPage.waitForLoadState('networkidle')

    const progressLink = orgPage.getByTestId('progress-link')
    await expect(progressLink).toBeVisible()
    await expect(progressLink).toHaveAttribute('href', '/training/progress')
  })

  // ─── Test 4: My Progress link shows button text ─────────────

  test('My Progress link contains button with correct label', async ({ orgPage }) => {
    await orgPage.goto('/training')
    await orgPage.waitForLoadState('networkidle')

    const progressLink = orgPage.getByTestId('progress-link')
    await expect(progressLink).toBeVisible()

    // The link wraps a button with "My Progress" text
    const buttonText = progressLink.getByText('My Progress')
    await expect(buttonText).toBeVisible()
  })

  // ─── Test 5: Training paths or empty state ──────────────────

  test('training paths are listed or empty state shown', async ({ orgPage }) => {
    await orgPage.goto('/training')
    await orgPage.waitForLoadState('networkidle')

    // Either training paths are listed or empty state is shown
    const pathCards = orgPage.locator('[data-testid^="training-path-"]')
    const emptyState = orgPage.getByText('No training paths available yet')

    const hasPathCards = await pathCards.count().then((n) => n > 0)
    const hasEmptyState = await emptyState.isVisible().catch(() => false)

    expect(hasPathCards || hasEmptyState).toBe(true)
  })

  // ─── Test 6: Learning Paths section heading ─────────────────

  test('training landing shows Learning Paths section heading', async ({ orgPage }) => {
    await orgPage.goto('/training')
    await orgPage.waitForLoadState('networkidle')

    await expect(orgPage.getByTestId('training-landing')).toBeVisible({ timeout: 15000 })

    // The "Learning Paths" heading should be visible
    const sectionHeading = orgPage.getByText('Learning Paths')
    await expect(sectionHeading).toBeVisible()
  })

  // ─── Test 7: Path card structure ────────────────────────────

  test('path cards show title, description, and metadata when paths exist', async ({ orgPage }) => {
    await orgPage.goto('/training')
    await orgPage.waitForLoadState('networkidle')

    const pathCards = orgPage.locator('[data-testid^="training-path-"]')
    const pathCount = await pathCards.count()

    if (pathCount === 0) {
      test.skip()
      return
    }

    const firstCard = pathCards.first()

    // Each path card should have a title (h3), description (p), and metadata
    const cardTitle = firstCard.locator('h3')
    await expect(cardTitle).toBeVisible()

    // Should display module count text (e.g., "3 modules")
    const moduleCount = firstCard.getByText(/\d+ modules?/)
    await expect(moduleCount).toBeVisible()

    // Should display time estimate (hours or min)
    const timeEstimate = firstCard.getByText(/\d+ (hours?|min)/)
    await expect(timeEstimate).toBeVisible()

    // Should have a Start/Continue/Review action button
    const actionButton = firstCard.getByRole('link').filter({ has: orgPage.getByRole('button') })
    await expect(actionButton).toBeVisible()
  })

  // ─── Test 8: Clicking path navigates to detail ──────────────

  test('clicking a training path navigates to detail page', async ({ orgPage }) => {
    await orgPage.goto('/training')
    await orgPage.waitForLoadState('networkidle')

    const pathCards = orgPage.locator('[data-testid^="training-path-"]')
    const pathCount = await pathCards.count()

    if (pathCount === 0) {
      test.skip()
      return
    }

    // Get the first path card's action button
    const firstPathAction = orgPage
      .locator('[data-testid^="path-"][data-testid$="-action"]')
      .first()
    await firstPathAction.click()

    // Should navigate to path detail page
    await expect(orgPage).toHaveURL(/\/training\/path\//)
  })

  // ─── Test 9: Path detail page structure ─────────────────────

  test('path detail page shows breadcrumbs, title, and modules section', async ({ orgPage }) => {
    await orgPage.goto('/training')
    await orgPage.waitForLoadState('networkidle')

    const pathCards = orgPage.locator('[data-testid^="training-path-"]')
    const pathCount = await pathCards.count()

    if (pathCount === 0) {
      test.skip()
      return
    }

    // Navigate to first path detail page
    const firstPathAction = orgPage
      .locator('[data-testid^="path-"][data-testid$="-action"]')
      .first()
    await firstPathAction.click()
    await orgPage.waitForLoadState('networkidle')

    // Breadcrumbs: "Training" link should be present
    const breadcrumbTraining = orgPage.locator('nav').getByText('Training')
    await expect(breadcrumbTraining).toBeVisible()

    // Path title (h1)
    const pathTitle = orgPage.locator('h1')
    await expect(pathTitle).toBeVisible()

    // "Modules" heading
    const modulesHeading = orgPage.getByText('Modules')
    await expect(modulesHeading).toBeVisible()
  })

  // ─── Test 10: Path detail breadcrumb links back to training ─

  test('path detail breadcrumb navigates back to training landing', async ({ orgPage }) => {
    await orgPage.goto('/training')
    await orgPage.waitForLoadState('networkidle')

    const pathCards = orgPage.locator('[data-testid^="training-path-"]')
    const pathCount = await pathCards.count()

    if (pathCount === 0) {
      test.skip()
      return
    }

    // Navigate to first path detail page
    const firstPathAction = orgPage
      .locator('[data-testid^="path-"][data-testid$="-action"]')
      .first()
    await firstPathAction.click()
    await orgPage.waitForLoadState('networkidle')

    // Click breadcrumb link back to training
    const breadcrumbTraining = orgPage.locator('nav a[href="/training"]').first()
    await expect(breadcrumbTraining).toBeVisible()
    await breadcrumbTraining.click()

    // Should navigate back to training landing
    await expect(orgPage).toHaveURL(/\/training$/)
    await expect(orgPage.getByTestId('training-landing')).toBeVisible()
  })

  // ─── Test 11: Progress page loads ───────────────────────────

  test('training progress page loads with heading and breadcrumb', async ({ orgPage }) => {
    await orgPage.goto('/training/progress')
    await orgPage.waitForLoadState('networkidle')

    // The progress page should show "My Progress" heading
    const heading = orgPage.getByText('My Progress')
    await expect(heading).toBeVisible()

    // Breadcrumb navigation should show "Training" link
    const breadcrumbTraining = orgPage.locator('nav a[href="/training"]')
    await expect(breadcrumbTraining).toBeVisible()
  })

  // ─── Test 12: Progress page shows stats or empty state ──────

  test('progress page shows stats cards or empty state', async ({ orgPage }) => {
    await orgPage.goto('/training/progress')
    await orgPage.waitForLoadState('networkidle')

    // Should show either progress stats or empty state
    const emptyState = orgPage.getByText('No training progress yet')
    const completedLabel = orgPage.getByText('Completed')

    const hasEmpty = await emptyState.isVisible().catch(() => false)
    const hasStats = await completedLabel.isVisible().catch(() => false)

    expect(hasEmpty || hasStats).toBe(true)
  })

  // ─── Test 13: Progress empty state has call-to-action ───────

  test('progress empty state shows link back to training paths', async ({ orgPage }) => {
    await orgPage.goto('/training/progress')
    await orgPage.waitForLoadState('networkidle')

    const emptyState = orgPage.getByText('No training progress yet')
    const hasEmpty = await emptyState.isVisible().catch(() => false)

    if (!hasEmpty) {
      // User already has progress — skip the empty-state test
      test.skip()
      return
    }

    // Empty state should have a CTA to browse training paths
    const ctaButton = orgPage.getByText('Browse Training Paths')
    await expect(ctaButton).toBeVisible()

    // The CTA should link back to /training
    const ctaLink = orgPage.locator('a[href="/training"]').filter({ hasText: 'Browse Training' })
    await expect(ctaLink).toBeVisible()
  })

  // ─── Test 14: Practice scenario page loads ──────────────────

  test('practice scenario page renders with context and step navigation', async ({ orgPage }) => {
    // Navigate to the parking-lot-guided scenario (hardcoded slug)
    await orgPage.goto('/training/practice/parking-lot-guided')
    await orgPage.waitForLoadState('networkidle')

    // Scenario runner should be visible
    const runner = orgPage.getByTestId('scenario-runner')
    await expect(runner).toBeVisible({ timeout: 15000 })

    // Scenario title
    await expect(orgPage.getByText('Parking Lot Problem')).toBeVisible()

    // Context section
    await expect(orgPage.getByText('Scenario Context')).toBeVisible()

    // Step navigation buttons should be visible (this scenario has 3 steps)
    await expect(orgPage.getByText('Step 1')).toBeVisible()
    await expect(orgPage.getByText('Step 2')).toBeVisible()
    await expect(orgPage.getByText('Step 3')).toBeVisible()
  })

  // ─── Test 15: Practice scenario has breadcrumbs ─────────────

  test('practice scenario shows breadcrumbs with Training and Practice links', async ({
    orgPage,
  }) => {
    await orgPage.goto('/training/practice/parking-lot-guided')
    await orgPage.waitForLoadState('networkidle')

    await expect(orgPage.getByTestId('scenario-runner')).toBeVisible({ timeout: 15000 })

    // Breadcrumb should show "Training" link
    const breadcrumbTraining = orgPage.locator('nav a[href="/training"]').first()
    await expect(breadcrumbTraining).toBeVisible()

    // Breadcrumb should show "Practice" text
    const breadcrumbPractice = orgPage.locator('nav').getByText('Practice')
    await expect(breadcrumbPractice).toBeVisible()
  })

  // ─── Test 16: Practice scenario has Back to Training link ───

  test('practice scenario has Back to Training navigation', async ({ orgPage }) => {
    await orgPage.goto('/training/practice/parking-lot-guided')
    await orgPage.waitForLoadState('networkidle')

    await expect(orgPage.getByTestId('scenario-runner')).toBeVisible({ timeout: 15000 })

    // Back to Training button at the bottom
    const backButton = orgPage.getByText('Back to Training')
    await expect(backButton).toBeVisible()
  })

  // ─── Test 17: Practice scenario shows time and step count ───

  test('practice scenario displays estimated time and step count', async ({ orgPage }) => {
    await orgPage.goto('/training/practice/parking-lot-guided')
    await orgPage.waitForLoadState('networkidle')

    await expect(orgPage.getByTestId('scenario-runner')).toBeVisible({ timeout: 15000 })

    // Time estimate (parking-lot-guided is 20 min)
    await expect(orgPage.getByText('~20 min')).toBeVisible()

    // Step count (parking-lot-guided has 3 steps)
    await expect(orgPage.getByText('3 steps')).toBeVisible()
  })

  // ─── Test 18: Practice scenario shows textarea for response ─

  test('practice scenario shows response textarea for active step', async ({ orgPage }) => {
    await orgPage.goto('/training/practice/parking-lot-guided')
    await orgPage.waitForLoadState('networkidle')

    await expect(orgPage.getByTestId('scenario-runner')).toBeVisible({ timeout: 15000 })

    // Active step should show a textarea for writing a response
    const textarea = orgPage.locator('textarea[placeholder="Write your response here..."]')
    await expect(textarea).toBeVisible()

    // The first step title should be visible
    await expect(orgPage.getByText('Write the Problem Statement')).toBeVisible()
  })

  // ─── Test 19: Empty state shows seeding message ─────────────

  test('empty state on landing shows seeding hint when no paths exist', async ({ orgPage }) => {
    await orgPage.goto('/training')
    await orgPage.waitForLoadState('networkidle')

    const pathCards = orgPage.locator('[data-testid^="training-path-"]')
    const pathCount = await pathCards.count()

    if (pathCount > 0) {
      // Paths exist — skip the empty-state test
      test.skip()
      return
    }

    // Empty state message
    const emptyMessage = orgPage.getByText('No training paths available yet')
    await expect(emptyMessage).toBeVisible()

    // Seeding hint
    const seedingHint = orgPage.getByText('Training paths will appear once content is seeded')
    await expect(seedingHint).toBeVisible()
  })

  // ─── Test 20: Invalid scenario slug shows 404 ──────────────

  test('invalid practice scenario slug shows not found', async ({ orgPage }) => {
    const response = await orgPage.goto('/training/practice/nonexistent-scenario-slug')

    // Should get a 404 response
    expect(response?.status()).toBe(404)
  })
})
