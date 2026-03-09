import { test, expect } from './helpers/auth-fixture'

/**
 * Training E2E Tests
 *
 * Tests the training hub landing page, learning paths listing,
 * path detail navigation, progress page, and practice scenarios.
 */

test.describe('Training hub', () => {
  test('training landing page loads with heading', async ({ orgPage }) => {
    await orgPage.goto('/training')
    await orgPage.waitForLoadState('networkidle')

    const landing = orgPage.getByTestId('training-landing')
    await expect(landing).toBeVisible()

    const title = orgPage.getByTestId('training-title')
    await expect(title).toBeVisible()
    await expect(title).toHaveText('Training')
  })

  test('training landing shows My Progress link', async ({ orgPage }) => {
    await orgPage.goto('/training')
    await orgPage.waitForLoadState('networkidle')

    const progressLink = orgPage.getByTestId('progress-link')
    await expect(progressLink).toBeVisible()
    await expect(progressLink).toHaveAttribute('href', '/training/progress')
  })

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

  test('training progress page loads', async ({ orgPage }) => {
    await orgPage.goto('/training/progress')
    await orgPage.waitForLoadState('networkidle')

    // The progress page should show "My Progress" heading
    const heading = orgPage.getByText('My Progress')
    await expect(heading).toBeVisible()

    // Should show either progress stats or empty state
    const emptyState = orgPage.getByText('No training progress yet')
    const completedLabel = orgPage.getByText('Completed')

    const hasEmpty = await emptyState.isVisible().catch(() => false)
    const hasStats = await completedLabel.isVisible().catch(() => false)

    expect(hasEmpty || hasStats).toBe(true)
  })
})
