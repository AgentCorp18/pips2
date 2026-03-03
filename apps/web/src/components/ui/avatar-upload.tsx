'use client'

import { useCallback, useRef, useState } from 'react'
import { Camera, Loader2, Trash2, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

type AvatarUploadProps = {
  currentAvatarUrl: string | null
  initials: string
  onUpload: (file: File) => Promise<void>
  onRemove: () => Promise<void>
  disabled?: boolean
}

export const AvatarUpload = ({
  currentAvatarUrl,
  initials,
  onUpload,
  onRemove,
  disabled = false,
}: AvatarUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      setError(null)

      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError('Please select a JPEG, PNG, or WebP image')
        return
      }

      if (file.size > MAX_FILE_SIZE) {
        setError('Image must be 2MB or smaller')
        return
      }

      // Show preview
      const objectUrl = URL.createObjectURL(file)
      setPreview(objectUrl)

      // Upload
      setIsUploading(true)
      try {
        await onUpload(file)
        setPreview(null)
      } catch {
        setError('Failed to upload image. Please try again.')
        setPreview(null)
      } finally {
        setIsUploading(false)
        // Reset input so the same file can be re-selected
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }

      return () => URL.revokeObjectURL(objectUrl)
    },
    [onUpload],
  )

  const handleRemove = useCallback(async () => {
    setIsUploading(true)
    setError(null)
    try {
      await onRemove()
    } catch {
      setError('Failed to remove avatar. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }, [onRemove])

  const displayUrl = preview ?? currentAvatarUrl

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Avatar circle */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || isUploading}
        className={cn(
          'group relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 transition-all',
          'border-[var(--color-border)] hover:border-[var(--color-primary)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2',
          (disabled || isUploading) && 'cursor-not-allowed opacity-50',
        )}
        aria-label="Change profile photo"
      >
        {displayUrl ? (
          <img src={displayUrl} alt="Profile avatar" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[var(--color-primary)] text-2xl font-semibold text-white">
            {initials || <User size={32} />}
          </div>
        )}

        {/* Hover overlay */}
        {!disabled && !isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <Camera size={20} className="text-white" />
          </div>
        )}

        {/* Upload spinner overlay */}
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <Loader2 size={24} className="animate-spin text-white" />
          </div>
        )}
      </button>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        aria-hidden="true"
      />

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
        >
          <Camera size={14} />
          Upload Photo
        </Button>

        {currentAvatarUrl && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={disabled || isUploading}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 size={14} />
            Remove
          </Button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm" style={{ color: 'var(--color-error)' }}>
          {error}
        </p>
      )}
    </div>
  )
}
