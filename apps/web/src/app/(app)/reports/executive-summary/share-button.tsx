'use client'

import { useState } from 'react'
import { Share2, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { generateExecutiveSummaryShareLink } from './share-actions'

type ShareButtonProps = {
  period: string
}

export const ShareButton = ({ period }: ShareButtonProps) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'copied' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')

  const handleShare = async () => {
    setStatus('loading')
    setErrorMessage('')

    const result = await generateExecutiveSummaryShareLink(period)

    if (result.error || !result.url) {
      setErrorMessage(result.error ?? 'Failed to generate link')
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
      return
    }

    const { url } = result

    try {
      await navigator.clipboard.writeText(url)
      setStatus('copied')
      setTimeout(() => setStatus('idle'), 2500)
    } catch {
      // Fallback: open in new tab so the user can copy manually
      window.open(url, '_blank')
      setStatus('idle')
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={handleShare}
        disabled={status === 'loading'}
        className="gap-2"
        aria-label="Copy shareable link to executive summary"
        data-testid="share-report-button"
      >
        {status === 'loading' ? (
          <Loader2 size={15} className="animate-spin" />
        ) : status === 'copied' ? (
          <Check size={15} />
        ) : (
          <Share2 size={15} />
        )}
        {status === 'copied' ? 'Link copied!' : 'Share Report'}
      </Button>
      {status === 'error' && (
        <p className="text-xs" style={{ color: '#EF4444' }} role="alert">
          {errorMessage || 'Failed to generate link'}
        </p>
      )}
    </div>
  )
}
