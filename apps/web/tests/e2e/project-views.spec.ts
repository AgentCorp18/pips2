import { test, expect } from './helpers/auth-fixture'
import { createTestProject, createTestOrg, cleanupTestOrg } from './helpers/test-factories'

/**
 * Project Views E2E tests
 *
 * Covers the projects page with cards/table/board views,
 * ViewToggle switching, step summaries on project detail,
 * and the Export One-Pager button.
 *
 * Uses the auth-fixture `orgPage` + factories for deterministic data.
 */

test.describe('Projects page views', () => {
  let orgId: string

  // --- Test 1: Projects page default cards view ---

  test('projects page loads with heading and cards view by default', async ({
    orgPage,
    testUser,
  }) => {
    const page = orgPage

    // Create an org and project via factory for deterministic data
    const org = await createTestOrg(testUser.id)
    orgId = org.id
    await createTestProject(org.id, testUser.id)

    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    // Page heading
    const heading = page.getByTestId('projects-page-heading')
    await expect(heading).toBeVisible({ timeout: 10000 })
    await expect(heading).toHaveText('Projects')

    // Description
    const description = page.getByTestId('projects-description')
    await expect(description).toBeVisible()

    // New Project button
    const newProjectButton = page.getByTestId('new-project-link')
    await expect(newProjectButton).toBeVisible()
    await expect(newProjectButton).toHaveAttribute('href', '/projects/new')

    // Cleanup
    await cleanupTestOrg(orgId)
  })

  // --- Test 2: Switch to table view ---

  test('switch to table view via ViewToggle', async ({ orgPage }) => {
    const page = orgPage

    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    // Click Table view button
    const tableButton = page.getByRole('button', { name: 'Table view' })
    await expect(tableButton).toBeVisible({ timeout: 10000 })
    await tableButton.click()

    // URL should include view=table
    await expect(page).toHaveURL(/view=table/)
  })

  // --- Test 3: Switch to board view ---

  test('switch to board view via ViewToggle', async ({ orgPage }) => {
    const page = orgPage

    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    // Click Board view button
    const boardButton = page.getByTestId('view-toggle-board')
    await expect(boardButton).toBeVisible({ timeout: 10000 })
    await boardButton.click()

    // URL should include view=board
    await expect(page).toHaveURL(/view=board/)
  })

  // --- Test 4: Board view shows status columns ---

  test('board view shows status columns', async ({ orgPage, testUser }) => {
    const page = orgPage

    // Create org + project so board has data
    const org = await createTestOrg(testUser.id)
    orgId = org.id
    await createTestProject(org.id, testUser.id)

    await page.goto('/projects?view=board')
    await page.waitForLoadState('networkidle')

    // Project board container
    const board = page.getByTestId('project-board')
    await expect(board).toBeVisible({ timeout: 10000 })

    // Status columns (active and completed at minimum)
    const activeColumn = page.getByTestId('project-board-column-active')
    await expect(activeColumn).toBeVisible()

    // Cleanup
    await cleanupTestOrg(orgId)
  })
})

test.describe('Project detail page', () => {
  let orgId: string

  // --- Test 5: Step summaries section visible ---

  test('step summaries grid is visible on project detail', async ({ orgPage, testUser }) => {
    const page = orgPage

    // Create org + project
    const org = await createTestOrg(testUser.id)
    orgId = org.id
    const project = await createTestProject(org.id, testUser.id)

    await page.goto(`/projects/${project.id}`)
    await page.waitForLoadState('networkidle')

    // Step summaries grid
    const summariesGrid = page.getByTestId('step-summaries-grid')
    await expect(summariesGrid).toBeVisible({ timeout: 10000 })

    // Cleanup
    await cleanupTestOrg(orgId)
  })

  // --- Test 6: Export One-Pager button present ---

  test('Export One-Pager button is present on project detail', async ({ orgPage, testUser }) => {
    const page = orgPage

    // Create org + project
    const org = await createTestOrg(testUser.id)
    orgId = org.id
    const project = await createTestProject(org.id, testUser.id)

    await page.goto(`/projects/${project.id}`)
    await page.waitForLoadState('networkidle')

    // Export One-Pager button
    const exportButton = page.getByTestId('export-one-pager-button')
    await expect(exportButton).toBeVisible({ timeout: 10000 })

    // Cleanup
    await cleanupTestOrg(orgId)
  })
})
