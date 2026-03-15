import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OrgSwitcher } from '../org-switcher'
import type { UserOrg } from '@/app/(app)/actions'

/* ============================================================
   Mocks
   ============================================================ */

const mockRefresh = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: mockRefresh,
  }),
}))

const mockSwitchOrg = vi.fn()
vi.mock('@/app/(app)/actions/switch-org', () => ({
  switchOrg: (...args: unknown[]) => mockSwitchOrg(...args),
}))

/* ============================================================
   Fixtures
   ============================================================ */

const singleOrg: UserOrg[] = [{ orgId: 'org-1', orgName: 'Acme Corp', role: 'owner' }]

const multipleOrgs: UserOrg[] = [
  { orgId: 'org-1', orgName: 'Acme Corp', role: 'owner' },
  { orgId: 'org-2', orgName: 'Beta Inc', role: 'admin' },
  { orgId: 'org-3', orgName: 'Gamma LLC', role: 'viewer' },
]

/* ============================================================
   Tests
   ============================================================ */

describe('OrgSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSwitchOrg.mockResolvedValue({ success: true })
  })

  /* ---- Single org ---- */

  it('renders the current org name', () => {
    render(<OrgSwitcher orgs={singleOrg} currentOrgId="org-1" />)
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
  })

  it('renders the current org role', () => {
    render(<OrgSwitcher orgs={singleOrg} currentOrgId="org-1" />)
    expect(screen.getByText('owner')).toBeInTheDocument()
  })

  it('does not show chevron when only one org', () => {
    render(<OrgSwitcher orgs={singleOrg} currentOrgId="org-1" />)
    // The chevron is only rendered when orgs.length > 1
    // We check that the SVG count is just the Building2 icon
    const trigger = screen.getByTestId('org-switcher-trigger')
    const svgs = trigger.querySelectorAll('svg')
    // Should have only the Building2 icon, not the ChevronDown
    expect(svgs.length).toBe(1)
  })

  it('trigger is disabled when only one org', () => {
    render(<OrgSwitcher orgs={singleOrg} currentOrgId="org-1" />)
    const trigger = screen.getByTestId('org-switcher-trigger')
    // Trigger is disabled so the dropdown cannot be opened
    expect(trigger).toBeDisabled()
  })

  it('does not open dropdown when single org is clicked', async () => {
    const user = userEvent.setup()
    render(<OrgSwitcher orgs={singleOrg} currentOrgId="org-1" />)

    const trigger = screen.getByTestId('org-switcher-trigger')
    await user.click(trigger)

    // Dropdown content should not appear because the trigger is disabled
    expect(screen.queryByTestId('org-switcher-content')).not.toBeInTheDocument()
  })

  it('returns null when no current org is found and orgs is empty', () => {
    const { container } = render(<OrgSwitcher orgs={[]} currentOrgId="org-1" />)
    expect(container.innerHTML).toBe('')
  })

  /* ---- Multiple orgs ---- */

  it('trigger is enabled when multiple orgs', () => {
    render(<OrgSwitcher orgs={multipleOrgs} currentOrgId="org-1" />)
    const trigger = screen.getByTestId('org-switcher-trigger')
    expect(trigger).not.toBeDisabled()
  })

  it('shows chevron when multiple orgs', () => {
    render(<OrgSwitcher orgs={multipleOrgs} currentOrgId="org-1" />)
    const trigger = screen.getByTestId('org-switcher-trigger')
    const svgs = trigger.querySelectorAll('svg')
    // Should have Building2 + ChevronDown
    expect(svgs.length).toBe(2)
  })

  it('shows all orgs in dropdown when clicked', async () => {
    const user = userEvent.setup()
    render(<OrgSwitcher orgs={multipleOrgs} currentOrgId="org-1" />)

    const trigger = screen.getByTestId('org-switcher-trigger')
    await user.click(trigger)

    await waitFor(() => {
      expect(screen.getByText('Switch organization')).toBeInTheDocument()
      // Acme Corp appears twice: in the trigger and in the dropdown
      expect(screen.getAllByText('Acme Corp')).toHaveLength(2)
      expect(screen.getByText('Beta Inc')).toBeInTheDocument()
      expect(screen.getByText('Gamma LLC')).toBeInTheDocument()
    })
  })

  it('shows role badges for each org in dropdown', async () => {
    const user = userEvent.setup()
    render(<OrgSwitcher orgs={multipleOrgs} currentOrgId="org-1" />)

    const trigger = screen.getByTestId('org-switcher-trigger')
    await user.click(trigger)

    await waitFor(() => {
      // The trigger shows "owner" and the dropdown also shows role badges
      const ownerBadges = screen.getAllByText('owner')
      expect(ownerBadges.length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText('admin')).toBeInTheDocument()
      expect(screen.getByText('viewer')).toBeInTheDocument()
    })
  })

  it('calls switchOrg server action when a different org is selected', async () => {
    const user = userEvent.setup()
    render(<OrgSwitcher orgs={multipleOrgs} currentOrgId="org-1" />)

    const trigger = screen.getByTestId('org-switcher-trigger')
    await user.click(trigger)

    await waitFor(() => {
      expect(screen.getByText('Beta Inc')).toBeInTheDocument()
    })

    const betaOption = screen.getByTestId('org-option-org-2')
    await user.click(betaOption)

    await waitFor(() => {
      expect(mockSwitchOrg).toHaveBeenCalledWith('org-2')
    })
  })

  it('calls router.refresh after successful switch', async () => {
    const user = userEvent.setup()
    render(<OrgSwitcher orgs={multipleOrgs} currentOrgId="org-1" />)

    const trigger = screen.getByTestId('org-switcher-trigger')
    await user.click(trigger)

    await waitFor(() => {
      expect(screen.getByText('Beta Inc')).toBeInTheDocument()
    })

    const betaOption = screen.getByTestId('org-option-org-2')
    await user.click(betaOption)

    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalled()
    })
  })

  it('does not call switchOrg when clicking the already-active org', async () => {
    const user = userEvent.setup()
    render(<OrgSwitcher orgs={multipleOrgs} currentOrgId="org-1" />)

    const trigger = screen.getByTestId('org-switcher-trigger')
    await user.click(trigger)

    await waitFor(() => {
      expect(screen.getByTestId('org-option-org-1')).toBeInTheDocument()
    })

    const acmeOption = screen.getByTestId('org-option-org-1')
    await user.click(acmeOption)

    // switchOrg should not be called since this is the current org
    expect(mockSwitchOrg).not.toHaveBeenCalled()
  })

  it('falls back to first org when currentOrgId does not match any org', () => {
    render(<OrgSwitcher orgs={multipleOrgs} currentOrgId="org-nonexistent" />)
    // Falls back to first org (Acme Corp)
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
  })

  it('renders the trigger with data-testid', () => {
    render(<OrgSwitcher orgs={singleOrg} currentOrgId="org-1" />)
    expect(screen.getByTestId('org-switcher-trigger')).toBeInTheDocument()
  })
})
