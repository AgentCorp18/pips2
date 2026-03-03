import { test, expect } from './helpers/auth-fixture'
import {
  createTestOrg,
  createTestProject,
  createTestTicket,
  cleanupTestOrg,
} from './helpers/test-factories'

/**
 * CSV / PDF Export E2E Tests
 *
 * Tests the export functionality on the projects and tickets list pages.
 * Verifies that the Export button exists and that clicking it triggers a
 * file download with an appropriate filename (CSV or PDF).
 *
 * Setup: Creates org, project, and tickets via factories so there is data to export.
 */

test.describe('Projects page export', () => {
  test('projects page has an Export button', async ({ orgPage, testUser }) => {
    const org = await createTestOrg(testUser.id)
    await createTestProject(org.id, testUser.id)

    try {
      await orgPage.goto('/projects')
      await orgPage.waitForLoadState('networkidle')

      const exportButton = orgPage.getByRole('button', { name: /Export/i })
      await expect(exportButton).toBeVisible()
    } finally {
      await cleanupTestOrg(org.id)
    }
  })

  test('clicking Export on projects page starts a CSV download', async ({ orgPage, testUser }) => {
    const org = await createTestOrg(testUser.id)
    await createTestProject(org.id, testUser.id)

    try {
      await orgPage.goto('/projects')
      await orgPage.waitForLoadState('networkidle')

      // Set up download listener before clicking
      const downloadPromise = orgPage.waitForEvent('download')
      await orgPage.getByRole('button', { name: /Export/i }).click()
      const download = await downloadPromise

      // Verify the downloaded file has a CSV or PDF extension
      expect(download.suggestedFilename()).toMatch(/\.(csv|pdf)$/i)
    } finally {
      await cleanupTestOrg(org.id)
    }
  })
})

test.describe('Tickets page export', () => {
  test('tickets page has an Export button', async ({ orgPage, testUser }) => {
    const org = await createTestOrg(testUser.id)
    const project = await createTestProject(org.id, testUser.id)
    await createTestTicket(org.id, testUser.id, project.id)

    try {
      await orgPage.goto('/tickets')
      await orgPage.waitForLoadState('networkidle')

      const exportButton = orgPage.getByRole('button', { name: /Export/i })
      await expect(exportButton).toBeVisible()
    } finally {
      await cleanupTestOrg(org.id)
    }
  })

  test('clicking Export on tickets page starts a CSV download', async ({ orgPage, testUser }) => {
    const org = await createTestOrg(testUser.id)
    const project = await createTestProject(org.id, testUser.id)
    await createTestTicket(org.id, testUser.id, project.id)
    await createTestTicket(org.id, testUser.id, project.id)

    try {
      await orgPage.goto('/tickets')
      await orgPage.waitForLoadState('networkidle')

      // Set up download listener before clicking
      const downloadPromise = orgPage.waitForEvent('download')
      await orgPage.getByRole('button', { name: /Export/i }).click()
      const download = await downloadPromise

      // Verify the downloaded file has a CSV or PDF extension
      expect(download.suggestedFilename()).toMatch(/\.(csv|pdf)$/i)
    } finally {
      await cleanupTestOrg(org.id)
    }
  })
})
