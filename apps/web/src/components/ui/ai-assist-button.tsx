'use client'

import { useState, useCallback, useRef, type RefObject } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

/* ============================================================
   Types
   ============================================================ */

type AiAssistButtonProps = {
  fieldRef: RefObject<HTMLTextAreaElement | null>
  fieldType: string
  context?: string
  onAccept: (text: string) => void
}

/* ============================================================
   Component
   ============================================================ */

export const AiAssistButton = ({
  fieldRef,
  fieldType,
  context = '',
  onAccept,
}: AiAssistButtonProps) => {
  const [open, setOpen] = useState(false)
  const [currentText, setCurrentText] = useState('')
  const [completion, setCompletion] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const handleOpen = useCallback(
    (isOpen: boolean) => {
      setOpen(isOpen)
      if (isOpen) {
        const text = fieldRef.current?.value ?? ''
        setCurrentText(text)
        setCompletion('')
        setError(null)
      } else {
        abortRef.current?.abort()
      }
    },
    [fieldRef],
  )

  const streamCompletion = useCallback(
    async (prompt: string) => {
      setIsLoading(true)
      setCompletion('')
      setError(null)

      const controller = new AbortController()
      abortRef.current = controller

      try {
        const res = await fetch('/api/ai/assist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, context, fieldType }),
          signal: controller.signal,
        })

        if (!res.ok) {
          const body = await res.json().catch(() => ({ error: 'Request failed' }))
          setError((body as { error?: string }).error ?? 'Something went wrong')
          setIsLoading(false)
          return
        }

        const reader = res.body?.getReader()
        if (!reader) {
          setError('No response stream')
          setIsLoading(false)
          return
        }

        const decoder = new TextDecoder()
        let result = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          result += chunk
          setCompletion(result)
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          // User cancelled
        } else {
          setError('Something went wrong. Please try again.')
        }
      } finally {
        setIsLoading(false)
        abortRef.current = null
      }
    },
    [context, fieldType],
  )

  const handleGenerate = useCallback(() => {
    const prompt = currentText
      ? `Write content for a ${fieldType.replace(/_/g, ' ')} field. The user has started with: "${currentText}". Expand and improve on this.`
      : `Write content for a ${fieldType.replace(/_/g, ' ')} field. Generate a helpful starting draft.`
    streamCompletion(prompt)
  }, [streamCompletion, fieldType, currentText])

  const handleImprove = useCallback(() => {
    if (!currentText.trim()) return
    const prompt = `Improve the following text while keeping the same intent and meaning:\n\n"${currentText}"`
    streamCompletion(prompt)
  }, [streamCompletion, currentText])

  const handleAccept = useCallback(() => {
    if (completion) {
      onAccept(completion)
    }
    setOpen(false)
    setCompletion('')
  }, [completion, onAccept])

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="text-[var(--color-text-tertiary)] hover:text-[var(--color-primary)]"
                data-testid="ai-assist-button"
              >
                <Sparkles size={14} />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>AI Assist</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles size={18} className="text-[var(--color-primary)]" />
            AI Writing Assistant
          </DialogTitle>
          <DialogDescription>Generate or improve text for this field using AI.</DialogDescription>
        </DialogHeader>

        {currentText && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Current text</p>
            <div className="max-h-24 overflow-y-auto rounded-md border bg-muted/50 p-3 text-sm">
              {currentText}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGenerate}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            Generate
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleImprove}
            disabled={isLoading || !currentText.trim()}
          >
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            Improve existing
          </Button>
        </div>

        {error && (
          <div
            className="rounded-md border px-3 py-2 text-sm"
            style={{
              borderColor: 'var(--color-error)',
              backgroundColor: 'rgba(239, 68, 68, 0.05)',
              color: 'var(--color-error)',
            }}
          >
            {error}
          </div>
        )}

        {(completion || isLoading) && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">AI suggestion</p>
            <div className="max-h-48 overflow-y-auto rounded-md border bg-muted/30 p-3 text-sm whitespace-pre-wrap">
              {completion || <span className="text-muted-foreground">Generating...</span>}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleAccept}
            disabled={!completion || isLoading}
          >
            Accept
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
