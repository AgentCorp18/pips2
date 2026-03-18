'use client'

import { useState, useEffect, useCallback } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { getAttachmentUrl } from '@/app/(app)/tickets/[ticketId]/attachment-actions'

/* ============================================================
   Types
   ============================================================ */

type ImagePreviewDialogProps = {
  attachmentId: string
  fileName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

/* ============================================================
   Component
   ============================================================ */

export const ImagePreviewDialog = ({
  attachmentId,
  fileName,
  open,
  onOpenChange,
}: ImagePreviewDialogProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUrl = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await getAttachmentUrl(attachmentId)
      if (result.url) {
        setImageUrl(result.url)
      } else {
        setError(result.error ?? 'Failed to load image')
      }
    } catch {
      setError('Failed to load image')
    } finally {
      setIsLoading(false)
    }
  }, [attachmentId])

  // Fetch URL when dialog opens (handles both initial mount and open transitions)
  useEffect(() => {
    if (open) {
      void fetchUrl()
    } else {
      setImageUrl(null)
      setError(null)
    }
  }, [open, fetchUrl])

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen)
  }

  const handleDownload = () => {
    if (imageUrl) {
      window.open(imageUrl, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-3xl" data-testid="image-preview-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 truncate pr-8">
            {fileName}
            {imageUrl && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={handleDownload}
                aria-label={`Download ${fileName}`}
              >
                <Download size={16} />
              </Button>
            )}
          </DialogTitle>
          <DialogDescription className="sr-only">Image preview for {fileName}</DialogDescription>
        </DialogHeader>

        <div className="flex min-h-[200px] items-center justify-center">
          {isLoading && (
            <Loader2
              size={32}
              className="animate-spin"
              style={{ color: 'var(--color-primary)' }}
              data-testid="image-preview-loading"
            />
          )}

          {error && (
            <p className="text-sm" style={{ color: 'var(--color-error)' }}>
              {error}
            </p>
          )}

          {imageUrl && !isLoading && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={imageUrl}
              alt={fileName}
              className="max-h-[70vh] max-w-full rounded-md object-contain"
              data-testid="image-preview-img"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
