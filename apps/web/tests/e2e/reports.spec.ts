import { test, expect } from './helpers/auth-fixture'

/**
 * Reports E2E Tests
 *
 * Tests the reports hub page, project health report, team activity
 * report, methodology insights report, and navigation between them.
 */

test.describe('Reports hub', () => {
  test('reports hub page loads with heading and report cards', async ({ orgPage }) => {
    await orgPage.goto('/reports')
    await orgPage.waitForLoadState('networkidle')

    const heading = orgPage.getByTestId('reports-heading')
    await expect(heading).toBeVisible()
    await expect(heading).toHaveText('Reports')

    // Should show the three report card links
    const projectHealthCard = orgPage.getByText('Project Health')
    const teamActivityCard = orgPage.getByText('Team Activity')
    const methodologyCard = orgPage.getByText('Methodology Insights')

    await expect(projectHealthCard).toBeVisible()
    await expect(teamActivityCard).toBeVisible()
    await expect(methodologyCard).toBeVisible()
  })

  test('reports hub shows KPI overview cards', async ({ orgPage }) => {
    await orgPage.goto('/reports')
    await orgPage.waitForLoadState('networkidle')

    // The reports hub displays 4 KPI stat cards
    const activeProjects = orgPage.getByText('Active Projects')
    const openTickets = orgPage.getByText('Open Tickets')
    const teamMembers = orgPage.getByText('Team Members')
    const formsCompleted = orgPage.getByText('Forms Completed')

    await expect(activeProjects).toBeVisible()
    await expect(openTickets).toBeVisible()
    await expect(teamMembers).toBeVisible()
    await expect(formsCompleted).toBeVisible()
  })

  test('project health report page loads', async ({ orgPage }) => {
    await orgPage.goto('/reports/projects')
    await orgPage.waitForLoadState('networkidle')

    const heading = orgPage.getByTestId('project-health-heading')
    await expect(heading).toBeVisible()
    await expect(heading).toHaveText('Project Health')

    // Should have a "Back to Reports" link
    const backLink = orgPage.getByText('Back to Reports')
    await expect(backLink).toBeVisible()
  })

  test('team activity report page loads', async ({ orgPage }) => {
    await orgPage.goto('/reports/team')
    await orgPage.waitForLoadState('networkidle')

    const heading = orgPage.getByTestId('team-activity-heading')
    await expect(heading).toBeVisible()
    await expect(heading).toHaveText('Team Activity')

    // Should have a "Back to Reports" link
    const backLink = orgPage.getByText('Back to Reports')
    await expect(backLink).toBeVisible()
  })

  test('methodology insights report page loads', async ({ orgPage }) => {
    await orgPage.goto('/reports/methodology')
    await orgPage.waitForLoadState('networkidle')

    const heading = orgPage.getByTestId('methodology-insights-heading')
    await expect(heading).toBeVisible()
    await expect(heading).toHaveText('Methodology Insights')

    // Should have a "Back to Reports" link
    const backLink = orgPage.getByText('Back to Reports')
    await expect(backLink).toBeVisible()
  })
})
