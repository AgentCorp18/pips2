'use client'

import { useCallback, useRef, useState } from 'react'
import { Upload, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { uploadAttachment } from '@/app/(app)/tickets/[ticketId]/attachment-actions'

/* ============================================================
   Constants
   ============================================================ */

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB
const BLOCKED_EXTENSIONS = new Set([
  'exe',
  'bat',
  'cmd',
  'com',
  'msi',
  'scr',
  'pif',
  'vbs',
  'vbe',
  'js',
  'jse',
  'wsf',
  'wsh',
  'ps1',
  'ps2',
  'psc1',
  'psc2',
  'reg',
  'inf',
  'hta',
  'cpl',
  'msp',
  'mst',
])

/* ============================================================
   Types
   ============================================================ */

type FileUploadProps = {
  ticketId: string
  onUploadComplete?: () => void
  disabled?: boolean
}

/* ============================================================
   Component
   ============================================================ */

export const FileUpload = ({ ticketId, onUploadComplete, disabled = false }: FileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateFile = useCallback((file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return 'File must be 50 MB or smaller'
    }
    const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
    if (BLOCKED_EXTENSIONS.has(ext)) {
      return 'This file type is not allowed for security reasons'
    }
    return null
  }, [])

  const handleUpload = useCallback(
    async (file: File) => {
      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        return
      }

      setError(null)
      setIsUploading(true)

      try {
        const formData = new FormData()
        formData.append('file', file)
        const result = await uploadAttachment(ticketId, formData)

        if (result.error) {
          setError(result.error)
        } else {
          onUploadComplete?.()
        }
      } catch {
        setError('Failed to upload file. Please try again.')
      } finally {
        setIsUploading(false)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    },
    [ticketId, onUploadComplete, validateFile],
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) void handleUpload(file)
    },
    [handleUpload],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const file = e.dataTransfer.files[0]
      if (file) void handleUpload(file)
    },
    [handleUpload],
  )

  return (
    <div className="space-y-2">
      <div
        role="button"
        tabIndex={0}
        onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            if (!disabled && !isUploading) fileInputRef.current?.click()
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        data-testid="file-upload-dropzone"
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 transition-colors',
          isDragging
            ? 'border-[var(--color-primary)] bg-[var(--color-primary-subtle)]'
            : 'border-[var(--color-border)] hover:border-[var(--color-primary-light)]',
          (disabled || isUploading) && 'cursor-not-allowed opacity-50',
        )}
        aria-label="Upload file"
      >
        {isUploading ? (
          <>
            <Loader2
              size={24}
              className="mb-2 animate-spin"
              style={{ color: 'var(--color-primary)' }}
            />
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Uploading...
            </p>
          </>
        ) : (
          <>
            <Upload size={24} className="mb-2" style={{ color: 'var(--color-text-tertiary)' }} />
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Drop a file here or click to browse
            </p>
            <p className="mt-1 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              Max 50 MB
            </p>
          </>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        className="hidden"
        aria-hidden="true"
        data-testid="file-upload-input"
      />

      {error && (
        <div
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm"
          style={{
            backgroundColor: 'var(--color-error-subtle, #fef2f2)',
            color: 'var(--color-error)',
          }}
        >
          <X size={14} />
          <span>{error}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setError(null)}
            className="ml-auto"
            aria-label="Dismiss error"
          >
            <X size={12} />
          </Button>
        </div>
      )}
    </div>
  )
}
