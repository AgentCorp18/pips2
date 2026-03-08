import { test, expect } from './helpers/auth-fixture'

/**
 * Team Management E2E flow
 *
 * Tests the teams page listing, team creation dialog,
 * team detail page with members, and empty states.
 */

test.describe('Teams page structure', () => {
  test('shows heading and description', async ({ orgPage }) => {
    await orgPage.goto('/teams')
    await orgPage.waitForLoadState('networkidle')

    // h1 rendered by TeamsPage
    const heading = orgPage.getByTestId('teams-page-heading')
    await expect(heading).toBeVisible()

    const description = orgPage.getByTestId('teams-description')
    await expect(description).toBeVisible()
  })

  test('shows empty state when no teams exist', async ({ orgPage }) => {
    await orgPage.goto('/teams')
    await orgPage.waitForLoadState('networkidle')

    // EmptyState component renders the title
    const emptyTitle = orgPage.getByTestId('teams-empty-title')
    await expect(emptyTitle).toBeVisible()
  })
})

test.describe('Team creation', () => {
  test('"Create Team" button opens dialog', async ({ orgPage }) => {
    await orgPage.goto('/teams')
    await orgPage.waitForLoadState('networkidle')

    // Click the Create Team button
    const createButton = orgPage.getByTestId('create-team-trigger')
    await expect(createButton).toBeVisible()
    await createButton.click()

    // Verify dialog opened with expected content
    // DialogTitle renders "Create a new team"
    const dialogTitle = orgPage.getByTestId('create-team-dialog-title')
    await expect(dialogTitle).toBeVisible()

    const nameInput = orgPage.getByTestId('team-name-input')
    await expect(nameInput).toBeVisible()

    const descriptionInput = orgPage.getByTestId('team-description-input')
    await expect(descriptionInput).toBeVisible()

    // Verify Cancel and Create Team buttons in dialog footer
    const cancelButton = orgPage.getByRole('button', { name: 'Cancel' })
    await expect(cancelButton).toBeVisible()

    const submitButton = orgPage.getByTestId('create-team-submit')
    await expect(submitButton).toBeVisible()
  })

  test('creates a team via dialog and it appears in the list', async ({ orgPage }) => {
    await orgPage.goto('/teams')
    await orgPage.waitForLoadState('networkidle')

    const teamName = `E2E Team ${Date.now()}`

    // Open the create dialog
    const createButton = orgPage.getByTestId('create-team-trigger')
    await createButton.click()

    // Fill in the form
    const nameInput = orgPage.getByTestId('team-name-input')
    await nameInput.fill(teamName)

    const descriptionInput = orgPage.getByTestId('team-description-input')
    await descriptionInput.fill('Created by E2E test')

    // Submit
    const submitButton = orgPage.getByTestId('create-team-submit')
    await submitButton.click()

    // Wait for dialog to close and page to refresh
    await expect(orgPage.getByTestId('create-team-dialog-title')).not.toBeVisible({
      timeout: 10000,
    })

    // Verify the team appears in the list
    const teamCard = orgPage.getByText(teamName)
    await expect(teamCard).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Team detail page', () => {
  test('shows team name on detail page', async ({ orgPage }) => {
    // Pre-create a team via factory to ensure data exists
    // First, get the user's org_id from the current URL context
    await orgPage.goto('/teams')
    await orgPage.waitForLoadState('networkidle')

    // Create a team through the UI to get a known team
    const teamName = `E2E Detail Team ${Date.now()}`

    const createButton = orgPage.getByTestId('create-team-trigger')
    await createButton.click()

    const nameInput = orgPage.getByTestId('team-name-input')
    await nameInput.fill(teamName)

    const submitButton = orgPage.getByTestId('create-team-submit')
    await submitButton.click()

    // Wait for dialog to close
    await expect(orgPage.getByTestId('create-team-dialog-title')).not.toBeVisible({
      timeout: 10000,
    })

    // Click the team card to navigate to detail
    const teamLink = orgPage.getByText(teamName)
    await expect(teamLink).toBeVisible({ timeout: 10000 })
    await teamLink.click()

    // Verify team detail page content
    await orgPage.waitForLoadState('networkidle')

    // Team detail page renders h1 with team name
    const heading = orgPage.getByTestId('team-detail-heading')
    await expect(heading).toBeVisible()
  })

  test('team detail page shows members section', async ({ orgPage }) => {
    await orgPage.goto('/teams')
    await orgPage.waitForLoadState('networkidle')

    // Create a team to navigate to its detail
    const teamName = `E2E Members Team ${Date.now()}`

    const createButton = orgPage.getByTestId('create-team-trigger')
    await createButton.click()

    await orgPage.getByTestId('team-name-input').fill(teamName)
    await orgPage.getByTestId('create-team-submit').click()

    await expect(orgPage.getByTestId('create-team-dialog-title')).not.toBeVisible({
      timeout: 10000,
    })

    // Navigate to team detail
    const teamLink = orgPage.getByText(teamName)
    await expect(teamLink).toBeVisible({ timeout: 10000 })
    await teamLink.click()
    await orgPage.waitForLoadState('networkidle')

    // TeamMembersList renders h2 "Members ({count})"
    const membersHeading = orgPage.getByTestId('team-members-heading')
    await expect(membersHeading).toBeVisible()

    // The creator should be listed as a lead member
    // Verify the table headers exist (Name, Email, Role, Joined)
    const nameHeader = orgPage.getByRole('columnheader', { name: 'Name' })
    await expect(nameHeader).toBeVisible()

    const roleHeader = orgPage.getByRole('columnheader', { name: 'Role' })
    await expect(roleHeader).toBeVisible()
  })
})
