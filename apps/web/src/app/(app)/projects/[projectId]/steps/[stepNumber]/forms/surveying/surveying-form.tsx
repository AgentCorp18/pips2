'use client'

import { useCallback, useState } from 'react'
import { FormShell } from '@/components/pips/form-shell'
import { FormTextarea } from '@/components/pips/form-textarea'
import { useFormViewMode } from '@/components/pips/form-view-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Trash2 } from 'lucide-react'
import type { SurveyingData } from '@/lib/form-schemas'

type QuestionType = 'open_ended' | 'rating' | 'multiple_choice'

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  open_ended: 'Open-ended',
  rating: 'Rating (1–5)',
  multiple_choice: 'Multiple Choice',
}

const createQuestion = () => ({
  id: crypto.randomUUID(),
  text: '',
  type: 'open_ended' as QuestionType,
  options: [],
})

const createRespondent = () => ({
  id: crypto.randomUUID(),
  name: '',
  answers: {} as Record<string, string>,
})

const DEFAULTS: SurveyingData = {
  title: '',
  targetAudience: '',
  questions: [],
  respondents: [],
  summary: '',
}

type Props = {
  projectId: string
  stepNumber: number
  initialData: Record<string, unknown> | null
}

export const SurveyingForm = ({ projectId, stepNumber, initialData }: Props) => {
  const [data, setData] = useState<SurveyingData>(() => ({
    ...DEFAULTS,
    ...(initialData as Partial<SurveyingData>),
  }))

  const addQuestion = useCallback(() => {
    setData((prev) => ({
      ...prev,
      questions: [...prev.questions, createQuestion()],
    }))
  }, [])

  const removeQuestion = useCallback((questionId: string) => {
    setData((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== questionId),
      // Remove answers for this question from all respondents
      respondents: prev.respondents.map((r) => {
        const answers = { ...r.answers }
        delete answers[questionId]
        return { ...r, answers }
      }),
    }))
  }, [])

  const updateQuestionField = useCallback(
    (questionId: string, field: 'text' | 'type', value: string) => {
      setData((prev) => ({
        ...prev,
        questions: prev.questions.map((q) =>
          q.id === questionId
            ? {
                ...q,
                [field]: value,
                // Reset options when switching away from multiple choice
                options: field === 'type' && value !== 'multiple_choice' ? [] : q.options,
              }
            : q,
        ),
      }))
    },
    [],
  )

  const addOption = useCallback((questionId: string) => {
    setData((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === questionId ? { ...q, options: [...q.options, ''] } : q,
      ),
    }))
  }, [])

  const updateOption = useCallback((questionId: string, optionIndex: number, value: string) => {
    setData((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => {
        if (q.id !== questionId) return q
        const options = [...q.options]
        options[optionIndex] = value
        return { ...q, options }
      }),
    }))
  }, [])

  const removeOption = useCallback((questionId: string, optionIndex: number) => {
    setData((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => {
        if (q.id !== questionId) return q
        const options = q.options.filter((_, i) => i !== optionIndex)
        return { ...q, options }
      }),
    }))
  }, [])

  const addRespondent = useCallback(() => {
    setData((prev) => ({
      ...prev,
      respondents: [...prev.respondents, createRespondent()],
    }))
  }, [])

  const removeRespondent = useCallback((respondentId: string) => {
    setData((prev) => ({
      ...prev,
      respondents: prev.respondents.filter((r) => r.id !== respondentId),
    }))
  }, [])

  const updateRespondentName = useCallback((respondentId: string, name: string) => {
    setData((prev) => ({
      ...prev,
      respondents: prev.respondents.map((r) => (r.id === respondentId ? { ...r, name } : r)),
    }))
  }, [])

  const updateRespondentAnswer = useCallback(
    (respondentId: string, questionId: string, answer: string) => {
      setData((prev) => ({
        ...prev,
        respondents: prev.respondents.map((r) =>
          r.id === respondentId ? { ...r, answers: { ...r.answers, [questionId]: answer } } : r,
        ),
      }))
    },
    [],
  )

  return (
    <FormShell
      projectId={projectId}
      stepNumber={stepNumber}
      formType="surveying"
      title="Surveying"
      description="Design and administer surveys to collect structured data from stakeholders. Define questions, capture responses, and identify patterns."
      data={data as unknown as Record<string, unknown>}
    >
      <SurveyingFields
        data={data}
        setData={setData}
        addQuestion={addQuestion}
        removeQuestion={removeQuestion}
        updateQuestionField={updateQuestionField}
        addOption={addOption}
        updateOption={updateOption}
        removeOption={removeOption}
        addRespondent={addRespondent}
        removeRespondent={removeRespondent}
        updateRespondentName={updateRespondentName}
        updateRespondentAnswer={updateRespondentAnswer}
      />
    </FormShell>
  )
}

/* ---- Inner fields component (reads view mode from context) ---- */

type SurveyingFieldsProps = {
  data: SurveyingData
  setData: React.Dispatch<React.SetStateAction<SurveyingData>>
  addQuestion: () => void
  removeQuestion: (id: string) => void
  updateQuestionField: (questionId: string, field: 'text' | 'type', value: string) => void
  addOption: (questionId: string) => void
  updateOption: (questionId: string, optionIndex: number, value: string) => void
  removeOption: (questionId: string, optionIndex: number) => void
  addRespondent: () => void
  removeRespondent: (id: string) => void
  updateRespondentName: (respondentId: string, name: string) => void
  updateRespondentAnswer: (respondentId: string, questionId: string, answer: string) => void
}

const SurveyingFields = ({
  data,
  setData,
  addQuestion,
  removeQuestion,
  updateQuestionField,
  addOption,
  updateOption,
  removeOption,
  addRespondent,
  removeRespondent,
  updateRespondentName,
  updateRespondentAnswer,
}: SurveyingFieldsProps) => {
  const mode = useFormViewMode()
  const isView = mode === 'view'

  return (
    <div className="space-y-6">
      {/* Survey metadata */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="survey-title">Survey Title</Label>
          {isView ? (
            <p className="text-sm text-[var(--color-text-primary)]">{data.title || '—'}</p>
          ) : (
            <Input
              id="survey-title"
              value={data.title}
              onChange={(e) => setData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="e.g. Customer Satisfaction Survey"
            />
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="target-audience">Target Audience</Label>
          {isView ? (
            <p className="text-sm text-[var(--color-text-primary)]">{data.targetAudience || '—'}</p>
          ) : (
            <Input
              id="target-audience"
              value={data.targetAudience}
              onChange={(e) => setData((prev) => ({ ...prev, targetAudience: e.target.value }))}
              placeholder="e.g. Front-line employees"
            />
          )}
        </div>
      </div>

      {/* Questions section */}
      <div className="space-y-4">
        <p className="text-sm font-semibold text-[var(--color-text-primary)]">Questions</p>

        {data.questions.length === 0 && isView && (
          <p className="text-sm text-[var(--color-text-tertiary)]">No questions defined.</p>
        )}

        {data.questions.map((question, qIndex) => (
          <Card key={question.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Question {qIndex + 1}</CardTitle>
                {!isView && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeQuestion(question.id)}
                    aria-label="Remove question"
                  >
                    <Trash2 size={14} />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Question text */}
              <div className="space-y-1.5">
                <Label htmlFor={`q-text-${question.id}`}>Question Text</Label>
                {isView ? (
                  <p className="text-sm text-[var(--color-text-primary)]">{question.text || '—'}</p>
                ) : (
                  <Input
                    id={`q-text-${question.id}`}
                    value={question.text}
                    onChange={(e) => updateQuestionField(question.id, 'text', e.target.value)}
                    placeholder="Enter your survey question..."
                  />
                )}
              </div>

              {/* Question type */}
              <div className="space-y-1.5">
                <Label htmlFor={`q-type-${question.id}`}>Question Type</Label>
                {isView ? (
                  <p className="text-sm text-[var(--color-text-primary)]">
                    {QUESTION_TYPE_LABELS[question.type]}
                  </p>
                ) : (
                  <Select
                    value={question.type}
                    onValueChange={(v) => updateQuestionField(question.id, 'type', v)}
                  >
                    <SelectTrigger id={`q-type-${question.id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open_ended">Open-ended</SelectItem>
                      <SelectItem value="rating">Rating (1–5)</SelectItem>
                      <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Multiple choice options */}
              {question.type === 'multiple_choice' && (
                <div className="space-y-2">
                  <Label>Options</Label>
                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex items-center gap-2">
                      {isView ? (
                        <p className="text-sm text-[var(--color-text-primary)]">{option || '—'}</p>
                      ) : (
                        <>
                          <Input
                            value={option}
                            onChange={(e) => updateOption(question.id, oIndex, e.target.value)}
                            placeholder={`Option ${oIndex + 1}`}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeOption(question.id, oIndex)}
                            aria-label="Remove option"
                          >
                            <Trash2 size={12} />
                          </Button>
                        </>
                      )}
                    </div>
                  ))}
                  {!isView && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addOption(question.id)}
                    >
                      <Plus size={12} />
                      Add Option
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {!isView && (
          <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
            <Plus size={14} />
            Add Question
          </Button>
        )}
      </div>

      {/* Responses section */}
      <div className="space-y-4">
        <p className="text-sm font-semibold text-[var(--color-text-primary)]">Responses</p>

        {data.respondents.length === 0 && isView && (
          <p className="text-sm text-[var(--color-text-tertiary)]">No responses recorded.</p>
        )}

        {data.respondents.map((respondent, rIndex) => (
          <Card key={respondent.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  {respondent.name ? respondent.name : `Respondent #${rIndex + 1}`}
                </CardTitle>
                {!isView && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRespondent(respondent.id)}
                    aria-label="Remove respondent"
                  >
                    <Trash2 size={14} />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Respondent name */}
              <div className="space-y-1.5">
                <Label htmlFor={`r-name-${respondent.id}`}>Name / Identifier</Label>
                {isView ? (
                  <p className="text-sm text-[var(--color-text-primary)]">
                    {respondent.name || '—'}
                  </p>
                ) : (
                  <Input
                    id={`r-name-${respondent.id}`}
                    value={respondent.name}
                    onChange={(e) => updateRespondentName(respondent.id, e.target.value)}
                    placeholder="e.g. Respondent A or Jane Smith"
                  />
                )}
              </div>

              {/* Answers per question */}
              {data.questions.length === 0 ? (
                <p className="text-xs text-[var(--color-text-tertiary)]">
                  Add questions above to capture answers here.
                </p>
              ) : (
                <div className="space-y-3">
                  {data.questions.map((question, qIndex) => (
                    <div key={question.id} className="space-y-1.5">
                      <Label htmlFor={`a-${respondent.id}-${question.id}`}>
                        Q{qIndex + 1}: {question.text || '(untitled question)'}
                      </Label>
                      {isView ? (
                        <p className="text-sm text-[var(--color-text-primary)]">
                          {respondent.answers[question.id] || '—'}
                        </p>
                      ) : question.type === 'rating' ? (
                        <Select
                          value={respondent.answers[question.id] ?? ''}
                          onValueChange={(v) =>
                            updateRespondentAnswer(respondent.id, question.id, v)
                          }
                        >
                          <SelectTrigger id={`a-${respondent.id}-${question.id}`}>
                            <SelectValue placeholder="Select rating" />
                          </SelectTrigger>
                          <SelectContent>
                            {['1', '2', '3', '4', '5'].map((r) => (
                              <SelectItem key={r} value={r}>
                                {r}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : question.type === 'multiple_choice' ? (
                        <Select
                          value={respondent.answers[question.id] ?? ''}
                          onValueChange={(v) =>
                            updateRespondentAnswer(respondent.id, question.id, v)
                          }
                        >
                          <SelectTrigger id={`a-${respondent.id}-${question.id}`}>
                            <SelectValue placeholder="Select answer" />
                          </SelectTrigger>
                          <SelectContent>
                            {question.options.map((opt, i) => (
                              <SelectItem key={i} value={opt || `option-${i}`}>
                                {opt || `Option ${i + 1}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          id={`a-${respondent.id}-${question.id}`}
                          value={respondent.answers[question.id] ?? ''}
                          onChange={(e) =>
                            updateRespondentAnswer(respondent.id, question.id, e.target.value)
                          }
                          placeholder="Enter response..."
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {!isView && (
          <Button type="button" variant="outline" size="sm" onClick={addRespondent}>
            <Plus size={14} />
            Add Respondent
          </Button>
        )}
      </div>

      {/* Summary */}
      <FormTextarea
        id="survey-summary"
        label="Summary"
        value={data.summary}
        onChange={(v) => setData((prev) => ({ ...prev, summary: v }))}
        placeholder="Summarize key findings, trends, and actionable insights from the survey data..."
        helperText="Highlight patterns, outliers, and recommendations based on the aggregated responses."
        rows={4}
        aiFieldType="generate"
        aiContext={`Survey: "${data.title || 'untitled'}". Target audience: ${data.targetAudience || 'not set'}. Questions: ${data.questions.length}. Respondents: ${data.respondents.length}. Summarize key findings.`}
      />
    </div>
  )
}
