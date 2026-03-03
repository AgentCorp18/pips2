import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UserMenu } from '../user-menu'

/* ============================================================
   Mocks
   ============================================================ */

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
}))

const mockSignOut = vi.fn()
const mockGetUser = vi.fn()
const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockSingle = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: mockGetUser,
      signOut: mockSignOut,
    },
    from: () => ({
      select: mockSelect,
    }),
  }),
}))

/* ============================================================
   Helpers
   ============================================================ */

const setupProfileMocks = (
  profile: {
    email: string
    display_name: string | null
    avatar_url: string | null
  } | null = null,
) => {
  mockGetUser.mockResolvedValue({
    data: { user: profile ? { id: 'user-1', email: profile.email } : null },
  })

  // Chain: from('profiles').select(...).eq(...).single()
  mockSingle.mockResolvedValue({ data: profile })
  mockEq.mockReturnValue({ single: mockSingle })
  mockSelect.mockReturnValue({ eq: mockEq })
}

/* ============================================================
   Tests
   ============================================================ */

describe('UserMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSignOut.mockResolvedValue({ error: null })
    setupProfileMocks({
      email: 'alice@example.com',
      display_name: 'Alice Johnson',
      avatar_url: null,
    })
  })

  /* ---- Basic rendering ---- */

  it('renders the user menu trigger button', async () => {
    await act(async () => {
      render(<UserMenu />)
    })
    expect(screen.getByRole('button', { name: 'User menu' })).toBeInTheDocument()
  })

  it('shows user initials when no avatar', async () => {
    await act(async () => {
      render(<UserMenu />)
    })
    await waitFor(() => {
      expect(screen.getByText('AJ')).toBeInTheDocument()
    })
  })

  it('shows single initial for single-word name', async () => {
    setupProfileMocks({
      email: 'alice@example.com',
      display_name: 'Alice',
      avatar_url: null,
    })
    await act(async () => {
      render(<UserMenu />)
    })
    await waitFor(() => {
      expect(screen.getByText('A')).toBeInTheDocument()
    })
  })

  it('shows avatar image when avatar URL is present', async () => {
    setupProfileMocks({
      email: 'alice@example.com',
      display_name: 'Alice Johnson',
      avatar_url: 'https://example.com/alice.jpg',
    })

    await act(async () => {
      render(<UserMenu />)
    })

    await waitFor(() => {
      const img = screen.getByAltText('Alice Johnson')
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('src', 'https://example.com/alice.jpg')
    })
  })

  it('shows fallback "?" for empty display name', async () => {
    setupProfileMocks({
      email: 'alice@example.com',
      display_name: '',
      avatar_url: null,
    })
    await act(async () => {
      render(<UserMenu />)
    })
    // display_name is '' (not null), so ?? doesn't kick in.
    // getInitials('') returns '?' because parts is empty.
    await waitFor(() => {
      expect(screen.getByText('?')).toBeInTheDocument()
    })
  })

  it('shows "User" initials when profile is not loaded', async () => {
    setupProfileMocks(null)
    await act(async () => {
      render(<UserMenu />)
    })
    // profile is null, so displayName defaults to 'User'
    // getInitials('User') = 'U'
    expect(screen.getByText('U')).toBeInTheDocument()
  })

  /* ---- Dropdown content ---- */

  it('shows user display name in dropdown', async () => {
    const user = userEvent.setup()
    await act(async () => {
      render(<UserMenu />)
    })

    await waitFor(() => {
      expect(screen.getByText('AJ')).toBeInTheDocument()
    })

    const trigger = screen.getByRole('button', { name: 'User menu' })
    await user.click(trigger)

    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
    })
  })

  it('shows user email in dropdown', async () => {
    const user = userEvent.setup()
    await act(async () => {
      render(<UserMenu />)
    })

    await waitFor(() => {
      expect(screen.getByText('AJ')).toBeInTheDocument()
    })

    const trigger = screen.getByRole('button', { name: 'User menu' })
    await user.click(trigger)

    await waitFor(() => {
      expect(screen.getByText('alice@example.com')).toBeInTheDocument()
    })
  })

  it('renders Profile menu item in dropdown', async () => {
    const user = userEvent.setup()
    await act(async () => {
      render(<UserMenu />)
    })

    await waitFor(() => {
      expect(screen.getByText('AJ')).toBeInTheDocument()
    })

    const trigger = screen.getByRole('button', { name: 'User menu' })
    await user.click(trigger)

    await waitFor(() => {
      expect(screen.getByText('Profile')).toBeInTheDocument()
    })
  })

  it('renders Settings menu item in dropdown', async () => {
    const user = userEvent.setup()
    await act(async () => {
      render(<UserMenu />)
    })

    await waitFor(() => {
      expect(screen.getByText('AJ')).toBeInTheDocument()
    })

    const trigger = screen.getByRole('button', { name: 'User menu' })
    await user.click(trigger)

    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })
  })

  it('renders Sign out menu item in dropdown', async () => {
    const user = userEvent.setup()
    await act(async () => {
      render(<UserMenu />)
    })

    await waitFor(() => {
      expect(screen.getByText('AJ')).toBeInTheDocument()
    })

    const trigger = screen.getByRole('button', { name: 'User menu' })
    await user.click(trigger)

    await waitFor(() => {
      expect(screen.getByText('Sign out')).toBeInTheDocument()
    })
  })

  /* ---- Sign out ---- */

  it('calls signOut and navigates to login when sign out is clicked', async () => {
    const user = userEvent.setup()
    await act(async () => {
      render(<UserMenu />)
    })

    await waitFor(() => {
      expect(screen.getByText('AJ')).toBeInTheDocument()
    })

    const trigger = screen.getByRole('button', { name: 'User menu' })
    await user.click(trigger)

    await waitFor(() => {
      expect(screen.getByText('Sign out')).toBeInTheDocument()
    })

    const signOutItem = screen.getByText('Sign out')
    await user.click(signOutItem)

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith('/login')
    })
  })

  /* ---- SVG icons ---- */

  it('renders SVG icons in the trigger button', async () => {
    await act(async () => {
      render(<UserMenu />)
    })
    const svgs = document.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThan(0)
  })
})
