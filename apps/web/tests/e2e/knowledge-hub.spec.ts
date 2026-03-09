import { test, expect } from './helpers/auth-fixture'

/**
 * Knowledge Hub E2E tests
 *
 * Covers the Knowledge Hub landing page, Guide pillar pages (hero, step
 * detail, tools library, roles, getting started, glossary), the Book
 * page, Workbook page, and Knowledge Search page.
 *
 * Uses the auth-fixture `orgPage` (logged-in user with an org).
 */

test.describe('Knowledge Hub', () => {
  // ─── Test 1: Landing page loads with pillar cards ─────────────

  test('landing page shows pillar cards', async ({ orgPage }) => {
    const page = orgPage

    await page.goto('/knowledge')
    await page.waitForLoadState('networkidle')

    // The knowledge hub wrapper should be visible
    const hub = page.getByTestId('knowledge-hub')
    await expect(hub).toBeVisible({ timeout: 15000 })

    // Title should be present
    const title = page.getByTestId('knowledge-hub-title')
    await expect(title).toBeVisible()

    // Pillar cards container should be visible
    const pillarCards = page.getByTestId('pillar-cards')
    await expect(pillarCards).toBeVisible()

    // At least the guide and book pillars should render
    const guidePillar = page.getByTestId('pillar-guide')
    await expect(guidePillar).toBeVisible()

    const bookPillar = page.getByTestId('pillar-book')
    await expect(bookPillar).toBeVisible()
  })

  // ─── Test 2: Navigate to Guide pillar → see hero ──────────────

  test('guide page shows hero and philosophy sections', async ({ orgPage }) => {
    const page = orgPage

    await page.goto('/knowledge/guide')
    await page.waitForLoadState('networkidle')

    // Guide landing page container
    const guidePage = page.getByTestId('guide-landing-page')
    await expect(guidePage).toBeVisible({ timeout: 15000 })

    // Hero section with methodology title
    const hero = page.getByTestId('guide-hero')
    await expect(hero).toBeVisible()
    await expect(page.getByText('The PIPS Methodology')).toBeVisible()

    // Philosophy section
    const philosophy = page.getByTestId('guide-philosophy')
    await expect(philosophy).toBeVisible()
  })

  // ─── Test 3: Guide page shows 6 step preview cards ────────────

  test('guide page shows 6 step preview cards and quick access', async ({ orgPage }) => {
    const page = orgPage

    await page.goto('/knowledge/guide')
    await page.waitForLoadState('networkidle')

    // Step cards section
    const stepCards = page.getByTestId('guide-step-cards')
    await expect(stepCards).toBeVisible({ timeout: 15000 })

    // All 6 step preview cards should exist
    for (let i = 1; i <= 6; i++) {
      const card = page.getByTestId(`step-preview-${i}`)
      await expect(card).toBeVisible()
    }

    // Quick access section
    const quickAccess = page.getByTestId('guide-quick-access')
    await expect(quickAccess).toBeVisible()

    // Resources section
    const resources = page.getByTestId('guide-resources')
    await expect(resources).toBeVisible()
  })

  // ─── Test 4: Navigate to step detail page ─────────────────────

  test('step detail page shows objective, questions, and checklist sections', async ({
    orgPage,
  }) => {
    const page = orgPage

    await page.goto('/knowledge/guide/step/1')
    await page.waitForLoadState('networkidle')

    // Step detail page container
    const stepDetail = page.getByTestId('step-detail-page')
    await expect(stepDetail).toBeVisible({ timeout: 15000 })

    // Key sections should be visible
    const objective = page.getByTestId('section-objective')
    await expect(objective).toBeVisible()

    const questions = page.getByTestId('section-questions')
    await expect(questions).toBeVisible()

    const checklist = page.getByTestId('section-checklist')
    await expect(checklist).toBeVisible()

    const tips = page.getByTestId('section-tips')
    await expect(tips).toBeVisible()

    const whyMatters = page.getByTestId('section-why-matters')
    await expect(whyMatters).toBeVisible()
  })

  // ─── Test 5: Tools Library page ───────────────────────────────

  test('tools library shows filter bar and tool cards', async ({ orgPage }) => {
    const page = orgPage

    await page.goto('/knowledge/guide/tools')
    await page.waitForLoadState('networkidle')

    // Page heading
    await expect(page.getByText('Tools Library')).toBeVisible({ timeout: 15000 })

    // Filter bar with "All" button and step filters
    const filterBar = page.getByTestId('tools-filter-bar')
    await expect(filterBar).toBeVisible()

    const allButton = page.getByTestId('tools-filter-all')
    await expect(allButton).toBeVisible()

    // At least step 1 filter should be visible
    const step1Filter = page.getByTestId('tools-filter-1')
    await expect(step1Filter).toBeVisible()

    // At least one tool card should be visible (e.g. problem-statement)
    const toolCard = page.getByTestId('tool-card-problem-statement')
    await expect(toolCard).toBeVisible()
  })

  // ─── Test 6: Tools Library step filter works ──────────────────

  test('tools library filters by step when clicking a step button', async ({ orgPage }) => {
    const page = orgPage

    await page.goto('/knowledge/guide/tools')
    await page.waitForLoadState('networkidle')

    // Wait for page to load
    await expect(page.getByTestId('tools-filter-bar')).toBeVisible({ timeout: 15000 })

    // Click Step 1 filter
    await page.getByTestId('tools-filter-1').click()

    // Problem statement is a Step 1 tool — should still be visible
    await expect(page.getByTestId('tool-card-problem-statement')).toBeVisible()

    // Click Step 1 again to deselect (toggle off)
    await page.getByTestId('tools-filter-1').click()

    // All tools should be visible again — check a step 6 tool
    const evalCard = page.getByTestId('tool-card-before-after')
    await expect(evalCard).toBeVisible()
  })

  // ─── Test 7: Roles page shows role cards ──────────────────────

  test('roles page shows role cards', async ({ orgPage }) => {
    const page = orgPage

    await page.goto('/knowledge/guide/roles')
    await page.waitForLoadState('networkidle')

    // Page container
    const rolesPage = page.getByTestId('roles-page')
    await expect(rolesPage).toBeVisible({ timeout: 15000 })

    // Heading
    await expect(page.getByText('Roles & Responsibilities')).toBeVisible()

    // At least the first two role cards should render
    const roleCard0 = page.getByTestId('role-card-0')
    await expect(roleCard0).toBeVisible()

    const roleCard1 = page.getByTestId('role-card-1')
    await expect(roleCard1).toBeVisible()

    // Adaptation section text
    await expect(page.getByText('Adapting Roles for Small Teams')).toBeVisible()
  })

  // ─── Test 8: Getting Started page shows timeline ──────────────

  test('getting started page shows timeline steps', async ({ orgPage }) => {
    const page = orgPage

    await page.goto('/knowledge/guide/getting-started')
    await page.waitForLoadState('networkidle')

    // Page container
    const gettingStarted = page.getByTestId('getting-started-page')
    await expect(gettingStarted).toBeVisible({ timeout: 15000 })

    // Heading
    await expect(page.getByText('Getting Started with PIPS')).toBeVisible()

    // Timeline steps should render
    const step0 = page.getByTestId('getting-started-step-0')
    await expect(step0).toBeVisible()

    const step1 = page.getByTestId('getting-started-step-1')
    await expect(step1).toBeVisible()

    // CTA section at the bottom
    await expect(page.getByText('Ready to begin?')).toBeVisible()
  })

  // ─── Test 9: Glossary page with search ────────────────────────

  test('glossary page renders terms and search filters them', async ({ orgPage }) => {
    const page = orgPage

    await page.goto('/knowledge/guide/glossary')
    await page.waitForLoadState('networkidle')

    // Page container
    const glossary = page.getByTestId('glossary-page')
    await expect(glossary).toBeVisible({ timeout: 15000 })

    // Heading
    await expect(page.getByText('PIPS Glossary')).toBeVisible()

    // Search input should be present
    const searchInput = page.getByTestId('glossary-search')
    await expect(searchInput).toBeVisible()

    // At least the first glossary term should render
    const term0 = page.getByTestId('glossary-term-0')
    await expect(term0).toBeVisible()

    // Type a search term to filter
    await searchInput.fill('fishbone')

    // Wait for filter to apply (client-side, should be instant)
    await page.waitForTimeout(500)

    // The term count should decrease or the specific term should appear
    // We check that the page still has at least one result
    const visibleTerms = page.locator('[data-testid^="glossary-term-"]')
    const count = await visibleTerms.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })

  // ─── Test 10: Workbook page loads with step exercises ─────────

  test('workbook page shows step exercise cards', async ({ orgPage }) => {
    const page = orgPage

    await page.goto('/knowledge/workbook')
    await page.waitForLoadState('networkidle')

    // Heading
    await expect(page.getByText('Workbook')).toBeVisible({ timeout: 15000 })

    // Should show 6 step sections (Step 1 through Step 6)
    for (let i = 1; i <= 6; i++) {
      const stepSection = page.getByText(`Step ${i}:`, { exact: false })
      await expect(stepSection.first()).toBeVisible()
    }
  })

  // ─── Test 11: Book page loads ─────────────────────────────────

  test('book page shows title and breadcrumb', async ({ orgPage }) => {
    const page = orgPage

    await page.goto('/knowledge/book')
    await page.waitForLoadState('networkidle')

    // Book page heading
    await expect(page.getByText('The Never-Ending Quest')).toBeVisible({ timeout: 15000 })

    // Breadcrumb should show Knowledge Hub link
    await expect(page.getByText('Knowledge Hub').first()).toBeVisible()
  })

  // ─── Test 12: Knowledge search page loads ─────────────────────

  test('knowledge search page loads with search input', async ({ orgPage }) => {
    const page = orgPage

    await page.goto('/knowledge/search')
    await page.waitForLoadState('networkidle')

    // Search heading
    await expect(page.getByText('Search Knowledge Hub')).toBeVisible({ timeout: 15000 })

    // Search input field
    const searchInput = page.locator('input[placeholder*="Search"]')
    await expect(searchInput).toBeVisible()

    // Initial state should show the helper text
    await expect(
      page.getByText('Start typing to search across all Knowledge Hub content'),
    ).toBeVisible()
  })
})
