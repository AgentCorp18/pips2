import { test, expect } from './helpers/auth-fixture'
import { getUserOrgs } from './helpers/supabase-admin'
import { createClient } from '@supabase/supabase-js'

/**
 * My Work page E2E tests
 *
 * Tests the /my-work page which shows tickets assigned to the
 * current user, grouped by urgency (overdue, due today, this week, later).
 */

// ────────────────────────────────────────────────────────────
// Admin helper to create an assigned ticket
// ────────────────────────────────────────────────────────────

const getAdminClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Test requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars')
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

type AssignedTicketOptions = {
  orgId: string
  userId: string
  projectId?: string
  title?: string
  dueDate?: string | null
  status?: string
  priority?: string
}

const createAssignedTicket = async (opts: AssignedTicketOptions) => {
  const admin = getAdminClient()

  const { data: ticket, error } = await admin
    .from('tickets')
    .insert({
      org_id: opts.orgId,
      title: opts.title ?? `E2E My Work Ticket ${Date.now()}`,
      description: 'Created by my-work E2E test',
      type: 'task',
      status: opts.status ?? 'todo',
      priority: opts.priority ?? 'medium',
      reporter_id: opts.userId,
      assignee_id: opts.userId,
      project_id: opts.projectId ?? null,
      due_date: opts.dueDate !== undefined ? opts.dueDate : null,
    })
    .select('id')
    .single()

  if (error || !ticket) {
    throw new Error(`Failed to create assigned ticket: ${error?.message}`)
  }

  return { id: ticket.id }
}

// ────────────────────────────────────────────────────────────
// Tests
// ────────────────────────────────────────────────────────────

test.describe('My Work page', () => {
  test('redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/my-work')
    await expect(page).toHaveURL(/\/login/)
  })
})

test.describe('My Work - empty state', () => {
  test('shows empty state when no tickets are assigned', async ({ orgPage }) => {
    await orgPage.goto('/my-work')
    await orgPage.waitForLoadState('networkidle')

    // Heading is visible
    const heading = orgPage.getByTestId('my-work-heading')
    await expect(heading).toBeVisible()
    await expect(heading).toHaveText('My Work')

    // Description is visible
    const description = orgPage.getByTestId('my-work-description')
    await expect(description).toBeVisible()

    // Empty state card is shown (new user has no assigned tickets)
    const emptyState = orgPage.getByTestId('my-work-empty-state')
    await expect(emptyState).toBeVisible()
  })
})

test.describe('My Work - with assigned tickets', () => {
  let orgId: string

  test('shows ticket rows when tickets are assigned to user', async ({ orgPage, testUser }) => {
    // Get the org that was created by the orgPage fixture
    const orgs = await getUserOrgs(testUser.id)
    if (!orgs.length) {
      test.skip()
      return
    }
    orgId = orgs[0]!.org_id

    // Create tickets assigned to the test user
    const ticket1 = await createAssignedTicket({
      orgId,
      userId: testUser.id,
      title: 'E2E Assigned Ticket Alpha',
      status: 'todo',
      priority: 'high',
    })

    const ticket2 = await createAssignedTicket({
      orgId,
      userId: testUser.id,
      title: 'E2E Assigned Ticket Beta',
      status: 'in_progress',
      priority: 'medium',
    })

    // Navigate to My Work
    await orgPage.goto('/my-work')
    await orgPage.waitForLoadState('networkidle')

    // Heading should be visible
    const heading = orgPage.getByTestId('my-work-heading')
    await expect(heading).toBeVisible()

    // Empty state should NOT be visible
    const emptyState = orgPage.getByTestId('my-work-empty-state')
    await expect(emptyState).not.toBeVisible()

    // Ticket rows should be visible
    const row1 = orgPage.getByTestId(`ticket-row-${ticket1.id}`)
    const row2 = orgPage.getByTestId(`ticket-row-${ticket2.id}`)
    await expect(row1).toBeVisible()
    await expect(row2).toBeVisible()

    // Ticket titles should be shown
    await expect(row1.getByTestId('ticket-title')).toHaveText('E2E Assigned Ticket Alpha')
    await expect(row2.getByTestId('ticket-title')).toHaveText('E2E Assigned Ticket Beta')
  })

  test('shows ticket sections grouped by urgency', async ({ orgPage, testUser }) => {
    const orgs = await getUserOrgs(testUser.id)
    if (!orgs.length) {
      test.skip()
      return
    }
    orgId = orgs[0]!.org_id

    // Create an overdue ticket (due yesterday)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]!

    await createAssignedTicket({
      orgId,
      userId: testUser.id,
      title: 'Overdue E2E Ticket',
      dueDate: yesterdayStr,
      status: 'in_progress',
      priority: 'critical',
    })

    // Create a ticket due today
    const todayStr = new Date().toISOString().split('T')[0]!

    await createAssignedTicket({
      orgId,
      userId: testUser.id,
      title: 'Due Today E2E Ticket',
      dueDate: todayStr,
      status: 'todo',
      priority: 'high',
    })

    // Create a ticket with no due date (goes to "Later")
    await createAssignedTicket({
      orgId,
      userId: testUser.id,
      title: 'Later E2E Ticket',
      dueDate: null,
      status: 'backlog',
      priority: 'low',
    })

    await orgPage.goto('/my-work')
    await orgPage.waitForLoadState('networkidle')

    // Overdue section should be visible
    const overdueSection = orgPage.getByTestId('my-work-section-overdue')
    await expect(overdueSection).toBeVisible()

    // Due Today section should be visible
    const dueTodaySection = orgPage.getByTestId('my-work-section-due-today')
    await expect(dueTodaySection).toBeVisible()

    // Later section should be visible
    const laterSection = orgPage.getByTestId('my-work-section-later')
    await expect(laterSection).toBeVisible()
  })

  test('clicking a ticket row navigates to ticket detail', async ({ orgPage, testUser }) => {
    const orgs = await getUserOrgs(testUser.id)
    if (!orgs.length) {
      test.skip()
      return
    }
    orgId = orgs[0]!.org_id

    const ticket = await createAssignedTicket({
      orgId,
      userId: testUser.id,
      title: 'Clickable E2E Ticket',
      status: 'todo',
      priority: 'medium',
    })

    await orgPage.goto('/my-work')
    await orgPage.waitForLoadState('networkidle')

    // Click the ticket row
    const ticketRow = orgPage.getByTestId(`ticket-row-${ticket.id}`)
    await expect(ticketRow).toBeVisible()
    await ticketRow.click()

    // Should navigate to the ticket detail page
    await expect(orgPage).toHaveURL(`/tickets/${ticket.id}`)
  })
})
