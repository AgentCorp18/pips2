'use client'

import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

type ReflectionConfig = {
  prompt: string
  minWords?: number
}

type TrainingReflectionProps = {
  config: ReflectionConfig
  savedText?: string
  onComplete: (text: string) => void
}

const countWords = (text: string): number => text.trim().split(/\s+/).filter(Boolean).length

export const TrainingReflection = ({ config, savedText, onComplete }: TrainingReflectionProps) => {
  const [text, setText] = useState(savedText ?? '')
  const [submitted, setSubmitted] = useState(!!savedText)
  const minWords = config.minWords ?? 20
  const wordCount = countWords(text)
  const meetsMinimum = wordCount >= minWords

  const handleSubmit = () => {
    if (!meetsMinimum) return
    setSubmitted(true)
    onComplete(text)
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-[var(--color-surface-secondary)] p-4 text-sm text-[var(--color-text-primary)]">
        {config.prompt}
      </div>

      {submitted ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-emerald-700" role="status">
            <CheckCircle2 size={16} aria-hidden="true" />
            <span>Reflection submitted</span>
          </div>
          <div className="rounded-lg border border-[var(--color-border)] p-4 text-sm text-[var(--color-text-secondary)]">
            {text}
          </div>
          <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
            Edit Response
          </Button>
        </div>
      ) : (
        <>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write your reflection here..."
            aria-label="Reflection response"
            aria-describedby="reflection-word-count"
            className="min-h-[160px] text-sm"
          />
          <div className="flex items-center justify-between">
            <span
              id="reflection-word-count"
              aria-live="polite"
              className={`text-xs ${meetsMinimum ? 'text-emerald-600' : 'text-[var(--color-text-tertiary)]'}`}
            >
              {wordCount}/{minWords} words minimum
            </span>
            <Button onClick={handleSubmit} disabled={!meetsMinimum} size="sm">
              Submit Reflection
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
