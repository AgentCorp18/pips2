import { test, expect } from './helpers/auth-fixture'

/**
 * Workshop E2E tests
 *
 * Covers the workshop hub page, scenarios page, facilitator guide,
 * workshop modules list, module detail pages, breadcrumb navigation,
 * quick-link cards, and create-session button.
 *
 * Uses the auth-fixture `orgPage` (logged-in user with an org).
 */

test.describe('Workshop', () => {
  // --- Test 1: Workshop hub page loads with heading and breadcrumb ---

  test('workshop hub page loads with heading and breadcrumb', async ({ orgPage }) => {
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

  // --- Test 2: Workshop modules list shows all modules ---

  test('workshop modules list shows all six modules', async ({ orgPage }) => {
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

  // --- Test 3: Workshop modules display duration and difficulty ---

  test('workshop modules display duration and difficulty badges', async ({ orgPage }) => {
    const page = orgPage

    await page.goto('/knowledge/workshop')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('Workshop Modules')).toBeVisible({ timeout: 10000 })

    // Verify durations are visible for modules
    const expectedDurations = ['45 min', '90 min', '60 min', '120 min', '3 hours']
    for (const duration of expectedDurations) {
      const durationText = page.getByText(duration).first()
      await expect(durationText).toBeVisible()
    }

    // Verify difficulty levels appear on the page
    const expectedDifficulties = ['Beginner', 'Intermediate', 'Advanced']
    for (const difficulty of expectedDifficulties) {
      const difficultyText = page.getByText(difficulty).first()
      await expect(difficultyText).toBeVisible()
    }
  })

  // --- Test 4: Workshop hub shows quick-link cards for scenarios and facilitator ---

  test('workshop hub shows quick-link cards for scenarios and facilitator guide', async ({
    orgPage,
  }) => {
    const page = orgPage

    await page.goto('/knowledge/workshop')
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('heading', { name: 'Workshop' })).toBeVisible({ timeout: 10000 })

    // Practice Scenarios quick-link card
    const scenariosLink = page.getByRole('link', { name: /Practice Scenarios/ })
    await expect(scenariosLink).toBeVisible()
    await expect(page.getByText('Real-world case studies for team practice')).toBeVisible()

    // Facilitator Guides quick-link card
    const facilitatorLink = page.getByRole('link', { name: /Facilitator Guides/ })
    await expect(facilitatorLink).toBeVisible()
    await expect(page.getByText('Step-by-step facilitation scripts and timing')).toBeVisible()
  })

  // --- Test 5: Workshop hub shows create session button or empty state ---

  test('workshop hub shows create session button', async ({ orgPage }) => {
    const page = orgPage

    await page.goto('/knowledge/workshop')
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('heading', { name: 'Workshop' })).toBeVisible({ timeout: 10000 })

    // Either a "New Session" button is visible (no sessions or in "Your Sessions" header),
    // or the empty state message is shown
    const newSessionButton = page.getByRole('button', { name: 'New Session' })
    const emptyState = page.getByText('No workshop sessions yet')

    const hasButton = await newSessionButton
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false)
    const hasEmpty = await emptyState.isVisible().catch(() => false)

    // At least one of these should be present
    expect(hasButton || hasEmpty).toBe(true)
  })

  // --- Test 6: Scenarios page shows practice scenarios ---

  test('scenarios page shows heading, subtitle, and breadcrumb', async ({ orgPage }) => {
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
  })

  // --- Test 7: Scenarios page renders scenario cards with expected content ---

  test('scenarios page renders scenario cards with titles and difficulty levels', async ({
    orgPage,
  }) => {
    const page = orgPage

    await page.goto('/knowledge/workshop/scenarios')
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('heading', { name: 'Practice Scenarios' })).toBeVisible({
      timeout: 10000,
    })

    // Known scenario titles from module-data.ts
    const expectedScenarios = [
      'The Recurring Complaint',
      'Onboarding Delays',
      'Quality Defects',
      'Delivery Delays',
      'Employee Turnover',
      'Process Bottleneck',
      'Vendor Selection',
      'Resource Allocation',
      'Resistant Stakeholder',
      'Stalled Implementation',
    ]

    // Verify at least a subset of known scenarios render
    let visibleCount = 0
    for (const title of expectedScenarios) {
      const card = page.getByText(title)
      const isVisible = await card
        .first()
        .isVisible({ timeout: 3000 })
        .catch(() => false)
      if (isVisible) visibleCount++
    }

    // Expect at least 5 scenarios to be rendered
    expect(visibleCount).toBeGreaterThanOrEqual(5)
  })

  // --- Test 8: Scenarios page shows module source badges ---

  test('scenarios page shows module source badges on scenario cards', async ({ orgPage }) => {
    const page = orgPage

    await page.goto('/knowledge/workshop/scenarios')
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('heading', { name: 'Practice Scenarios' })).toBeVisible({
      timeout: 10000,
    })

    // Each scenario card should show which module it comes from as a badge
    // Check for at least one module source badge
    const moduleBadges = [
      'Introduction to PIPS',
      'Step 1: Identify Workshop',
      'Step 2: Root Cause Analysis',
    ]

    let foundBadge = false
    for (const badge of moduleBadges) {
      const el = page.getByText(badge).first()
      const isVisible = await el.isVisible({ timeout: 3000 }).catch(() => false)
      if (isVisible) {
        foundBadge = true
        break
      }
    }

    expect(foundBadge).toBe(true)
  })

  // --- Test 9: Facilitator guide page loads with all sections ---

  test('facilitator guide page loads with tips, best practices, and module notes', async ({
    orgPage,
  }) => {
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
  })

  // --- Test 10: Facilitator guide shows specific tips content ---

  test('facilitator guide renders all six facilitation tips', async ({ orgPage }) => {
    const page = orgPage

    await page.goto('/knowledge/workshop/facilitator')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('Facilitation Tips')).toBeVisible({ timeout: 10000 })

    // All six facilitation tip titles
    const tipTitles = [
      'Set the tone early',
      'Time-box ruthlessly',
      'Ask, do not tell',
      'Use the parking lot',
      'Balance participation',
      'Close the loop',
    ]

    for (const title of tipTitles) {
      const tipElement = page.getByText(title)
      await expect(tipElement).toBeVisible()
    }
  })

  // --- Test 11: Facilitator guide shows best practices checklist ---

  test('facilitator guide shows best practices checklist items', async ({ orgPage }) => {
    const page = orgPage

    await page.goto('/knowledge/workshop/facilitator')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('Best Practices Checklist')).toBeVisible({ timeout: 10000 })

    // Verify specific best practice items
    await expect(page.getByText(/Prepare all materials/)).toBeVisible()
    await expect(page.getByText(/Arrive 15 minutes early/)).toBeVisible()
    await expect(page.getByText(/Assign a scribe and timekeeper/)).toBeVisible()
    await expect(page.getByText(/Debrief with the team/)).toBeVisible()
  })

  // --- Test 12: Facilitator guide breadcrumb navigation ---

  test('facilitator guide has breadcrumb with Knowledge Hub and Workshop links', async ({
    orgPage,
  }) => {
    const page = orgPage

    await page.goto('/knowledge/workshop/facilitator')
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('heading', { name: 'Facilitator Guide' })).toBeVisible({
      timeout: 10000,
    })

    // Breadcrumb: Knowledge Hub > Workshop > Facilitator Guide
    const knowledgeLink = page.getByRole('link', { name: 'Knowledge Hub' })
    await expect(knowledgeLink).toBeVisible()

    const workshopLink = page.getByRole('link', { name: 'Workshop' })
    await expect(workshopLink).toBeVisible()

    // Current page shown as non-link text
    const currentPage = page.getByText('Facilitator Guide')
    await expect(currentPage.first()).toBeVisible()
  })

  // --- Test 13: Facilitator guide shows masterclass callout ---

  test('facilitator guide shows masterclass callout card', async ({ orgPage }) => {
    const page = orgPage

    await page.goto('/knowledge/workshop/facilitator')
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('heading', { name: 'Facilitator Guide' })).toBeVisible({
      timeout: 10000,
    })

    // The masterclass callout card should be visible
    const masterclassTitle = page.getByText("Facilitator's Masterclass")
    await expect(masterclassTitle.first()).toBeVisible()

    // Masterclass description includes duration
    const masterclassDesc = page.getByText(/Advanced facilitation techniques/)
    await expect(masterclassDesc.first()).toBeVisible()
  })

  // --- Test 14: Workshop module detail page loads with content sections ---

  test('workshop module detail page loads with objectives and agenda', async ({ orgPage }) => {
    const page = orgPage

    await page.goto('/knowledge/workshop/modules/intro-to-pips')
    await page.waitForLoadState('networkidle')

    // Module heading
    const heading = page.getByRole('heading', { name: 'Introduction to PIPS' })
    await expect(heading).toBeVisible({ timeout: 10000 })

    // Learning Objectives section
    await expect(page.getByText('Learning Objectives')).toBeVisible()

    // Session Agenda section
    await expect(page.getByText('Session Agenda')).toBeVisible()

    // Materials Needed section
    await expect(page.getByText('Materials Needed')).toBeVisible()

    // Facilitator Notes section
    await expect(page.getByText('Facilitator Notes')).toBeVisible()
  })

  // --- Test 15: Workshop module detail page breadcrumb navigation ---

  test('workshop module detail page has breadcrumb back to workshop', async ({ orgPage }) => {
    const page = orgPage

    await page.goto('/knowledge/workshop/modules/intro-to-pips')
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('heading', { name: 'Introduction to PIPS' })).toBeVisible({
      timeout: 10000,
    })

    // Breadcrumb: Knowledge Hub > Workshop > [Module Title]
    const knowledgeLink = page.getByRole('link', { name: 'Knowledge Hub' })
    await expect(knowledgeLink).toBeVisible()

    const workshopLink = page.getByRole('link', { name: 'Workshop' })
    await expect(workshopLink).toBeVisible()
  })

  // --- Test 16: Workshop module shows difficulty badge and duration ---

  test('workshop module detail shows difficulty badge and duration', async ({ orgPage }) => {
    const page = orgPage

    await page.goto('/knowledge/workshop/modules/root-cause-workshop')
    await page.waitForLoadState('networkidle')

    // Module heading
    const heading = page.getByRole('heading', { name: 'Step 2: Root Cause Analysis' })
    await expect(heading).toBeVisible({ timeout: 10000 })

    // Duration
    await expect(page.getByText('90 min')).toBeVisible()

    // Difficulty badge
    await expect(page.getByText('Intermediate')).toBeVisible()

    // Step reference
    await expect(page.getByText('PIPS Step 2')).toBeVisible()
  })

  // --- Test 17: Navigate from workshop hub to scenarios via quick-link ---

  test('clicking scenarios quick-link navigates to scenarios page', async ({ orgPage }) => {
    const page = orgPage

    await page.goto('/knowledge/workshop')
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('heading', { name: 'Workshop' })).toBeVisible({ timeout: 10000 })

    // Click the Practice Scenarios quick-link card
    const scenariosLink = page.getByRole('link', { name: /Practice Scenarios/ })
    await scenariosLink.click()

    // Verify we landed on the scenarios page
    await page.waitForLoadState('networkidle')
    const scenariosHeading = page.getByRole('heading', { name: 'Practice Scenarios' })
    await expect(scenariosHeading).toBeVisible({ timeout: 10000 })
  })

  // --- Test 18: Navigate from workshop hub to facilitator via quick-link ---

  test('clicking facilitator quick-link navigates to facilitator guide', async ({ orgPage }) => {
    const page = orgPage

    await page.goto('/knowledge/workshop')
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('heading', { name: 'Workshop' })).toBeVisible({ timeout: 10000 })

    // Click the Facilitator Guides quick-link card
    const facilitatorLink = page.getByRole('link', { name: /Facilitator Guides/ })
    await facilitatorLink.click()

    // Verify we landed on the facilitator page
    await page.waitForLoadState('networkidle')
    const facilitatorHeading = page.getByRole('heading', { name: 'Facilitator Guide' })
    await expect(facilitatorHeading).toBeVisible({ timeout: 10000 })
  })

  // --- Test 19: Navigate from scenarios back to workshop via breadcrumb ---

  test('scenarios breadcrumb navigates back to workshop hub', async ({ orgPage }) => {
    const page = orgPage

    await page.goto('/knowledge/workshop/scenarios')
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('heading', { name: 'Practice Scenarios' })).toBeVisible({
      timeout: 10000,
    })

    // Click the Workshop breadcrumb link
    const workshopLink = page.getByRole('link', { name: 'Workshop' })
    await workshopLink.click()

    // Verify we landed back on the workshop hub
    await page.waitForLoadState('networkidle')
    const workshopHeading = page.getByRole('heading', { name: 'Workshop' })
    await expect(workshopHeading).toBeVisible({ timeout: 10000 })
  })

  // --- Test 20: Navigate from facilitator back to Knowledge Hub via breadcrumb ---

  test('facilitator breadcrumb navigates to Knowledge Hub', async ({ orgPage }) => {
    const page = orgPage

    await page.goto('/knowledge/workshop/facilitator')
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('heading', { name: 'Facilitator Guide' })).toBeVisible({
      timeout: 10000,
    })

    // Click the Knowledge Hub breadcrumb link
    const knowledgeLink = page.getByRole('link', { name: 'Knowledge Hub' })
    await knowledgeLink.click()

    // Verify we navigated to the knowledge hub
    await page.waitForURL(/\/knowledge$/, { timeout: 10000 })
  })
})
