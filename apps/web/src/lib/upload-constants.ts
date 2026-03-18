/**
 * Shared upload validation constants.
 *
 * Single source of truth for file upload restrictions.
 * Used by: attachment-actions.ts, file-upload.tsx, comment-file-upload.tsx
 */

export const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB

/** Dangerous executable file extensions that should be blocked */
export const BLOCKED_EXTENSIONS = new Set([
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

/** Validate a file against size and extension restrictions */
export const validateUploadFile = (file: File): string | null => {
  if (file.size > MAX_FILE_SIZE) {
    return 'File must be 50 MB or smaller'
  }
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (BLOCKED_EXTENSIONS.has(ext)) {
    return 'This file type is not allowed for security reasons'
  }
  return null
}
