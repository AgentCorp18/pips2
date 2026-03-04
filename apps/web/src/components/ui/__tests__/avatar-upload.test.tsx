import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AvatarUpload } from '../avatar-upload'

describe('AvatarUpload', () => {
  let onUpload: (file: File) => Promise<void>
  let onRemove: () => Promise<void>

  beforeEach(() => {
    onUpload = vi.fn().mockResolvedValue(undefined)
    onRemove = vi.fn().mockResolvedValue(undefined)
  })

  it('renders change photo button', () => {
    render(
      <AvatarUpload
        currentAvatarUrl={null}
        initials="MA"
        onUpload={onUpload}
        onRemove={onRemove}
      />,
    )
    expect(screen.getByLabelText('Change profile photo')).toBeTruthy()
  })

  it('renders Upload Photo button', () => {
    render(
      <AvatarUpload
        currentAvatarUrl={null}
        initials="MA"
        onUpload={onUpload}
        onRemove={onRemove}
      />,
    )
    expect(screen.getByText('Upload Photo')).toBeTruthy()
  })

  it('renders initials when no avatar URL', () => {
    render(
      <AvatarUpload
        currentAvatarUrl={null}
        initials="MA"
        onUpload={onUpload}
        onRemove={onRemove}
      />,
    )
    expect(screen.getByText('MA')).toBeTruthy()
  })

  it('renders avatar image when URL is provided', () => {
    render(
      <AvatarUpload
        currentAvatarUrl="https://example.com/avatar.jpg"
        initials="MA"
        onUpload={onUpload}
        onRemove={onRemove}
      />,
    )
    const img = screen.getByAltText('Profile avatar')
    expect(img.getAttribute('src')).toBe('https://example.com/avatar.jpg')
  })

  it('shows Remove button when avatar URL exists', () => {
    render(
      <AvatarUpload
        currentAvatarUrl="https://example.com/avatar.jpg"
        initials="MA"
        onUpload={onUpload}
        onRemove={onRemove}
      />,
    )
    expect(screen.getByText('Remove')).toBeTruthy()
  })

  it('hides Remove button when no avatar URL', () => {
    render(
      <AvatarUpload
        currentAvatarUrl={null}
        initials="MA"
        onUpload={onUpload}
        onRemove={onRemove}
      />,
    )
    expect(screen.queryByText('Remove')).toBeNull()
  })

  it('disables buttons when disabled prop is true', () => {
    render(
      <AvatarUpload
        currentAvatarUrl={null}
        initials="MA"
        onUpload={onUpload}
        onRemove={onRemove}
        disabled
      />,
    )
    const uploadBtn = screen.getByText('Upload Photo').closest('button')
    expect(uploadBtn?.disabled).toBe(true)
  })

  it('renders hidden file input', () => {
    const { container } = render(
      <AvatarUpload
        currentAvatarUrl={null}
        initials="MA"
        onUpload={onUpload}
        onRemove={onRemove}
      />,
    )
    const fileInput = container.querySelector('input[type="file"]')
    expect(fileInput).toBeTruthy()
    expect(fileInput?.getAttribute('accept')).toContain('image/jpeg')
  })
})
