import { test, expect } from './helpers/auth-fixture'

/**
 * Workshop E2E tests
 *
 * Covers the workshop hub page, scenarios page, facilitator guide,
 * and workshop modules list.
 *
 * Uses the auth-fixture `orgPage` (logged-in user with an org).
 */

test.describe('Workshop', () => {
  // --- Test 1: Workshop hub page loads ---

  test('workshop hub page loads with heading and modules', async ({ orgPage }) => {
    const page = orgPage

    await page.goto('/knowledge/workshop')
    await page.waitForLoadState('networkidle')

    // Page heading
    const heading = page.getByRole('heading', { name: 'Workshop' })
    await expect(heading).toBeVisible({ timeout: 10000 })

    // Subtitle text
    const subtitle = page.getByText(/Facilitation in action/)
    await expect(subtitle).toBeVisible()

    // Breadcrumb nav links back to Knowledge Hub
    const breadcrumb = page.getByRole('link', { name: 'Knowledge Hub' })
    await expect(breadcrumb).toBeVisible()
  })

  // --- Test 2: Workshop modules list loads ---

  test('workshop modules list shows all modules', async ({ orgPage }) => {
    const page = orgPage

    await page.goto('/knowledge/workshop')
    await page.waitForLoadState('networkidle')

    // "Workshop Modules" section heading
    const modulesHeading = page.getByText('Workshop Modules')
    await expect(modulesHeading).toBeVisible({ timeout: 10000 })

    // Verify key module titles are listed
    const expectedModules = [
      'Introduction to PIPS',
      'Step 1: Identify Workshop',
      'Step 2: Root Cause Analysis',
      'Step 3: Ideation Workshop',
      'Step 4: Selection & Planning',
      "Facilitator's Masterclass",
    ]

    for (const title of expectedModules) {
      const moduleCard = page.getByText(title)
      await expect(moduleCard).toBeVisible()
    }
  })

  // --- Test 3: Scenarios page shows practice scenarios ---

  test('scenarios page shows practice scenarios', async ({ orgPage }) => {
    const page = orgPage

    await page.goto('/knowledge/workshop/scenarios')
    await page.waitForLoadState('networkidle')

    // Page heading
    const heading = page.getByRole('heading', { name: 'Practice Scenarios' })
    await expect(heading).toBeVisible({ timeout: 10000 })

    // Subtitle
    const subtitle = page.getByText(/Real-world case studies/)
    await expect(subtitle).toBeVisible()

    // Breadcrumb has links to Knowledge Hub and Workshop
    const knowledgeLink = page.getByRole('link', { name: 'Knowledge Hub' })
    await expect(knowledgeLink).toBeVisible()

    const workshopLink = page.getByRole('link', { name: 'Workshop' })
    await expect(workshopLink).toBeVisible()

    // Scenarios should be displayed as cards (or show empty state)
    const scenarioCards = page.locator('[class*="grid"] a')
    const emptyState = page.getByText(/No practice scenarios/)
    const hasScenarios = await scenarioCards
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false)
    const hasEmpty = await emptyState.isVisible().catch(() => false)

    expect(hasScenarios || hasEmpty).toBe(true)
  })

  // --- Test 4: Facilitator guide page loads with tips ---

  test('facilitator guide page loads with tips and best practices', async ({ orgPage }) => {
    const page = orgPage

    await page.goto('/knowledge/workshop/facilitator')
    await page.waitForLoadState('networkidle')

    // Page heading
    const heading = page.getByRole('heading', { name: 'Facilitator Guide' })
    await expect(heading).toBeVisible({ timeout: 10000 })

    // Facilitation Tips section
    const tipsHeading = page.getByText('Facilitation Tips')
    await expect(tipsHeading).toBeVisible()

    // Best Practices Checklist section
    const bestPracticesHeading = page.getByText('Best Practices Checklist')
    await expect(bestPracticesHeading).toBeVisible()

    // Module Facilitator Notes section
    const notesHeading = page.getByText('Module Facilitator Notes')
    await expect(notesHeading).toBeVisible()

    // Verify a specific tip is rendered
    const tipTitle = page.getByText('Set the tone early')
    await expect(tipTitle).toBeVisible()

    // Verify a specific best practice is rendered
    const practice = page.getByText(/Prepare all materials/)
    await expect(practice).toBeVisible()
  })
})
