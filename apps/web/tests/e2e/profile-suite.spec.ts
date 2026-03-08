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

    // ProfilePage renders h1 "Profile"
    const heading = orgPage.getByTestId('profile-page-heading')
    await expect(heading).toBeVisible()

    // Description below heading
    const description = orgPage.getByTestId('profile-description')
    await expect(description).toBeVisible()

    // ProfileForm renders <Label htmlFor="display_name">Display name</Label>
    const displayNameLabel = orgPage.getByText('Display name')
    await expect(displayNameLabel.first()).toBeVisible()

    // Input with id="display_name" name="display_name"
    const displayNameInput = orgPage.getByTestId('display-name-input')
    await expect(displayNameInput).toBeVisible()

    // Helper text below the display name input
    const helperText = orgPage.getByText('This is how your name appears across the app')
    await expect(helperText).toBeVisible()
  })

  test('edit display name, save, and verify in DB', async ({ orgPage, testUser }) => {
    await orgPage.goto('/profile')
    await orgPage.waitForLoadState('networkidle')

    const displayNameInput = orgPage.getByTestId('display-name-input')
    await expect(displayNameInput).toBeVisible()

    // Set a unique display name
    const newDisplayName = `E2E Display ${Date.now()}`
    await displayNameInput.clear()
    await displayNameInput.fill(newDisplayName)

    // Click save — ProfileForm button says "Save changes" or "Saving..."
    const saveButton = orgPage.getByTestId('profile-save-button')
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

    // ProfileForm has a Card with CardTitle "Profile Photo"
    const photoTitle = orgPage.getByTestId('profile-photo-title')
    await expect(photoTitle).toBeVisible()

    // The AvatarUpload component should render either a current avatar
    // or an upload area. Verify the profile photo section is rendered.
    const profilePhotoCard = orgPage.getByTestId('profile-photo-title').locator('..')
    await expect(profilePhotoCard).toBeVisible()
  })
})
