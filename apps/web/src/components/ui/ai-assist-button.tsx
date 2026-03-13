'use client'

import { useState, useCallback, useRef, type RefObject } from 'react'
import { Sparkles, Loader2, RefreshCw, Send, ChevronDown } from 'lucide-react'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'

/* ============================================================
   Types
   ============================================================ */

type ToneOption = 'professional' | 'casual' | 'concise' | 'detailed'

const TONE_OPTIONS: { value: ToneOption; label: string; description: string }[] = [
  { value: 'professional', label: 'Professional', description: 'Formal, business-ready' },
  { value: 'casual', label: 'Casual', description: 'Friendly, conversational' },
  { value: 'concise', label: 'Concise', description: 'Brief, to the point' },
  { value: 'detailed', label: 'Detailed', description: 'Thorough, comprehensive' },
]

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
  const [editedCompletion, setEditedCompletion] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tone, setTone] = useState<ToneOption>('professional')
  const [refineInput, setRefineInput] = useState('')
  const [hasGenerated, setHasGenerated] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const handleOpen = useCallback(
    (isOpen: boolean) => {
      setOpen(isOpen)
      if (isOpen) {
        const text = fieldRef.current?.value ?? ''
        setCurrentText(text)
        setCompletion('')
        setEditedCompletion('')
        setError(null)
        setRefineInput('')
        setHasGenerated(false)
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
      setEditedCompletion('')
      setError(null)

      const controller = new AbortController()
      abortRef.current = controller

      try {
        const res = await fetch('/api/ai/assist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, context, fieldType, tone }),
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
          setEditedCompletion(result)
        }

        setHasGenerated(true)
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
    [context, fieldType, tone],
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

  const handleRegenerate = useCallback(() => {
    const prompt = currentText
      ? `Write a different version of content for a ${fieldType.replace(/_/g, ' ')} field. The user's original text was: "${currentText}". Generate a fresh alternative.`
      : `Write content for a ${fieldType.replace(/_/g, ' ')} field. Generate a fresh, different draft.`
    streamCompletion(prompt)
  }, [streamCompletion, fieldType, currentText])

  const handleRefine = useCallback(() => {
    if (!refineInput.trim() || !editedCompletion.trim()) return
    const prompt = `The user asked you to refine this text:\n\n"${editedCompletion}"\n\nTheir feedback: "${refineInput}"\n\nPlease revise the text based on their feedback.`
    setRefineInput('')
    streamCompletion(prompt)
  }, [streamCompletion, editedCompletion, refineInput])

  const handleAccept = useCallback(() => {
    const text = editedCompletion.trim() || completion.trim()
    if (text) {
      onAccept(text)
    }
    setOpen(false)
    setCompletion('')
    setEditedCompletion('')
  }, [editedCompletion, completion, onAccept])

  const activeTone = TONE_OPTIONS.find((t) => t.value === tone)

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

      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles size={18} className="text-[var(--color-primary)]" />
            AI Writing Assistant
          </DialogTitle>
          <DialogDescription>
            Generate, refine, and edit text. You can iterate until it&apos;s right.
          </DialogDescription>
        </DialogHeader>

        {/* Tone selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-[var(--color-text-tertiary)]">Tone:</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 gap-1 text-xs"
                data-testid="tone-selector"
              >
                {activeTone?.label ?? 'Professional'}
                <ChevronDown size={12} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {TONE_OPTIONS.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setTone(option.value)}
                  data-testid={`tone-${option.value}`}
                >
                  <div>
                    <span className="font-medium">{option.label}</span>
                    <span className="ml-2 text-xs text-[var(--color-text-tertiary)]">
                      {option.description}
                    </span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {tone !== 'professional' && (
            <Badge variant="secondary" className="text-[10px]">
              {activeTone?.label}
            </Badge>
          )}
        </div>

        {/* Current text preview */}
        {currentText && !hasGenerated && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Current text</p>
            <div className="max-h-24 overflow-y-auto rounded-md border bg-muted/50 p-3 text-sm">
              {currentText}
            </div>
          </div>
        )}

        {/* Action buttons — show before first generation */}
        {!hasGenerated && !isLoading && (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGenerate}
              disabled={isLoading}
              data-testid="ai-generate-btn"
            >
              <Sparkles size={14} />
              Generate
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleImprove}
              disabled={isLoading || !currentText.trim()}
              data-testid="ai-improve-btn"
            >
              <Sparkles size={14} />
              Improve existing
            </Button>
          </div>
        )}

        {/* Error */}
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

        {/* Loading state */}
        {isLoading && !completion && (
          <div className="flex items-center gap-2 py-4 text-sm text-[var(--color-text-tertiary)]">
            <Loader2 size={16} className="animate-spin" />
            Generating...
          </div>
        )}

        {/* Editable AI output */}
        {(completion || hasGenerated) && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">
                {isLoading ? 'Generating...' : 'AI suggestion — edit freely'}
              </p>
              {hasGenerated && !isLoading && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 gap-1 text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-primary)]"
                  onClick={handleRegenerate}
                  data-testid="ai-regenerate-btn"
                >
                  <RefreshCw size={12} />
                  Regenerate
                </Button>
              )}
            </div>
            <textarea
              value={isLoading ? completion : editedCompletion}
              onChange={(e) => setEditedCompletion(e.target.value)}
              readOnly={isLoading}
              rows={6}
              className="w-full rounded-md border bg-transparent p-3 text-sm leading-relaxed focus-visible:outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              data-testid="ai-output-editor"
            />
          </div>
        )}

        {/* Refine input — show after first generation */}
        {hasGenerated && !isLoading && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">
              Refine — tell the AI what to change
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={refineInput}
                onChange={(e) => setRefineInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && refineInput.trim()) {
                    e.preventDefault()
                    handleRefine()
                  }
                }}
                placeholder="e.g. Make it shorter, add metrics, more formal..."
                className="flex-1 rounded-md border bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                data-testid="ai-refine-input"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleRefine}
                disabled={!refineInput.trim() || !editedCompletion.trim()}
                data-testid="ai-refine-btn"
              >
                <Send size={14} />
              </Button>
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
            disabled={(!editedCompletion.trim() && !completion.trim()) || isLoading}
            data-testid="ai-accept-btn"
          >
            Accept
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
