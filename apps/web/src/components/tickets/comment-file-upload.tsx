'use client'

import { useCallback, useRef, useState } from 'react'
import { Paperclip, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

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

type CommentFileUploadProps = {
  /** Files staged for upload (not yet sent) */
  stagedFiles: File[]
  onFilesChange: (files: File[]) => void
  disabled?: boolean
}

/* ============================================================
   Component
   ============================================================ */

export const CommentFileUpload = ({
  stagedFiles,
  onFilesChange,
  disabled = false,
}: CommentFileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
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

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? [])
      setError(null)

      for (const file of files) {
        const validationError = validateFile(file)
        if (validationError) {
          setError(validationError)
          return
        }
      }

      onFilesChange([...stagedFiles, ...files])

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
    [stagedFiles, onFilesChange, validateFile],
  )

  const removeFile = useCallback(
    (index: number) => {
      onFilesChange(stagedFiles.filter((_, i) => i !== index))
    },
    [stagedFiles, onFilesChange],
  )

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="h-7 gap-1 px-2 text-xs"
          data-testid="comment-attach-button"
        >
          <Paperclip size={14} />
          Attach
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          multiple
          className="hidden"
          aria-hidden="true"
          data-testid="comment-file-input"
        />
      </div>

      {/* Staged files list */}
      {stagedFiles.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {stagedFiles.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-secondary)',
              }}
            >
              <Paperclip size={10} />
              <span className="max-w-[120px] truncate">{file.name}</span>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="ml-0.5 rounded p-0.5 hover:bg-[var(--color-surface)]"
                aria-label={`Remove ${file.name}`}
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="text-xs" style={{ color: 'var(--color-error)' }}>
          {error}
        </p>
      )}
    </div>
  )
}
