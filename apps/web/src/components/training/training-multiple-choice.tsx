'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

type MultipleChoiceConfig = {
  question: string
  options: string[]
  correctIndex: number
}

type TrainingMultipleChoiceProps = {
  config: MultipleChoiceConfig
  savedAnswer?: number | null
  onComplete: (selectedIndex: number, isCorrect: boolean) => void
}

export const TrainingMultipleChoice = ({
  config,
  savedAnswer,
  onComplete,
}: TrainingMultipleChoiceProps) => {
  const [selected, setSelected] = useState<number | null>(savedAnswer ?? null)
  const [submitted, setSubmitted] = useState(savedAnswer !== null && savedAnswer !== undefined)
  const isCorrect = selected === config.correctIndex

  const handleSubmit = () => {
    if (selected === null) return
    setSubmitted(true)
    onComplete(selected, selected === config.correctIndex)
  }

  return (
    <div className="space-y-4" data-testid="multiple-choice">
      <p id="mc-question" className="text-sm font-medium text-[var(--color-text-primary)]">
        {config.question}
      </p>

      <div className="space-y-2" role="radiogroup" aria-labelledby="mc-question">
        {config.options.map((option, index) => {
          const isSelected = selected === index
          const showCorrect = submitted && index === config.correctIndex
          const showIncorrect = submitted && isSelected && !isCorrect

          let borderClass = 'border-[var(--color-border)]'
          if (showCorrect) borderClass = 'border-emerald-500 bg-emerald-50'
          else if (showIncorrect) borderClass = 'border-red-500 bg-red-50'
          else if (isSelected && !submitted)
            borderClass = 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'

          return (
            <button
              key={index}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={submitted}
              onClick={() => setSelected(index)}
              className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left text-sm transition-colors ${borderClass} ${!submitted ? 'cursor-pointer hover:border-[var(--color-primary)]/50' : ''}`}
            >
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium"
                aria-hidden="true"
              >
                {String.fromCharCode(65 + index)}
              </span>
              <span className="flex-1 text-[var(--color-text-primary)]">{option}</span>
              {showCorrect && (
                <CheckCircle2 size={18} className="shrink-0 text-emerald-600" aria-hidden="true" />
              )}
              {showIncorrect && (
                <XCircle size={18} className="shrink-0 text-red-600" aria-hidden="true" />
              )}
            </button>
          )
        })}
      </div>

      {submitted && (
        <div
          role="alert"
          className={`rounded-lg p-3 text-sm ${isCorrect ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}
        >
          {isCorrect
            ? 'Correct! Well done.'
            : `Not quite. The correct answer is: ${config.options[config.correctIndex]}`}
        </div>
      )}

      {!submitted && (
        <Button onClick={handleSubmit} disabled={selected === null} size="sm">
          Submit Answer
        </Button>
      )}
    </div>
  )
}
