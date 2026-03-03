import { test, expect } from './helpers/auth-fixture'
import { test as baseTest } from '@playwright/test'
import { getProfileById } from './helpers/supabase-admin'

/**
 * Profile Suite E2E flow
 *
 * Tests the profile page: auth guard, display name field,
 * editing + DB verification, and avatar upload area.
 */

baseTest.describe('Profile auth guard', () => {
  baseTest('redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/profile')

    await expect(page).toHaveURL(/\/login/)
  })
})

test.describe('Profile page content', () => {
  test('shows display name field', async ({ orgPage }) => {
    await orgPage.goto('/profile')
    await orgPage.waitForLoadState('networkidle')

    // Verify profile heading
    const heading = orgPage.getByRole('heading', { name: 'Profile' })
    await expect(heading).toBeVisible()

    // Verify description text
    const description = orgPage.getByText('Manage your personal information and profile photo')
    await expect(description).toBeVisible()

    // Verify the display name input exists with its label
    const displayNameLabel = orgPage.getByText('Display name')
    await expect(displayNameLabel.first()).toBeVisible()

    const displayNameInput = orgPage.locator('input#display_name')
    await expect(displayNameInput).toBeVisible()

    // Verify the helper text
    const helperText = orgPage.getByText('This is how your name appears across the app')
    await expect(helperText).toBeVisible()
  })

  test('edit display name, save, and verify in DB', async ({ orgPage, testUser }) => {
    await orgPage.goto('/profile')
    await orgPage.waitForLoadState('networkidle')

    const displayNameInput = orgPage.locator('input#display_name')
    await expect(displayNameInput).toBeVisible()

    // Set a unique display name
    const newDisplayName = `E2E Display ${Date.now()}`
    await displayNameInput.clear()
    await displayNameInput.fill(newDisplayName)

    // Click save
    const saveButton = orgPage.getByRole('button', { name: 'Save changes' })
    await saveButton.click()

    // Wait for the action to complete
    await orgPage.waitForLoadState('networkidle')

    // Allow time for the server action to process
    await orgPage.waitForTimeout(2000)

    // Verify the display name was persisted to the database
    const profile = await getProfileById(testUser.id)
    expect(profile).toBeTruthy()
    expect(profile!.display_name).toBe(newDisplayName)
  })

  test('shows avatar upload area', async ({ orgPage }) => {
    await orgPage.goto('/profile')
    await orgPage.waitForLoadState('networkidle')

    // Verify the "Profile Photo" card section exists
    const photoTitle = orgPage.getByText('Profile Photo')
    await expect(photoTitle).toBeVisible()

    // The AvatarUpload component should render either a current avatar
    // or an upload area. Verify the profile photo section is rendered.
    const profilePhotoCard = orgPage.locator('text=Profile Photo').locator('..')
    await expect(profilePhotoCard).toBeVisible()
  })
})
