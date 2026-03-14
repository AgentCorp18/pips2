'use client'

import { useCallback, useState } from 'react'
import { FormShell } from '@/components/pips/form-shell'
import { FormTextarea } from '@/components/pips/form-textarea'
import { useFormViewMode } from '@/components/pips/form-view-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2 } from 'lucide-react'
import type { InterviewingData } from '@/lib/form-schemas'

const createInterview = () => ({
  id: crypto.randomUUID(),
  interviewee: '',
  role: '',
  date: '',
  questions: [] as { id: string; question: string; response: string }[],
  keyInsights: '',
})

const createQa = () => ({
  id: crypto.randomUUID(),
  question: '',
  response: '',
})

const DEFAULTS: InterviewingData = {
  interviews: [],
  summary: '',
}

type Props = {
  projectId: string
  stepNumber: number
  initialData: Record<string, unknown> | null
}

export const InterviewingForm = ({ projectId, stepNumber, initialData }: Props) => {
  const [data, setData] = useState<InterviewingData>(() => ({
    ...DEFAULTS,
    ...(initialData as Partial<InterviewingData>),
  }))

  const addInterview = useCallback(() => {
    setData((prev) => ({
      ...prev,
      interviews: [...prev.interviews, createInterview()],
    }))
  }, [])

  const removeInterview = useCallback((interviewId: string) => {
    setData((prev) => ({
      ...prev,
      interviews: prev.interviews.filter((iv) => iv.id !== interviewId),
    }))
  }, [])

  const updateInterviewField = useCallback(
    (
      interviewId: string,
      field: 'interviewee' | 'role' | 'date' | 'keyInsights',
      value: string,
    ) => {
      setData((prev) => ({
        ...prev,
        interviews: prev.interviews.map((iv) =>
          iv.id === interviewId ? { ...iv, [field]: value } : iv,
        ),
      }))
    },
    [],
  )

  const addQa = useCallback((interviewId: string) => {
    setData((prev) => ({
      ...prev,
      interviews: prev.interviews.map((iv) =>
        iv.id === interviewId ? { ...iv, questions: [...iv.questions, createQa()] } : iv,
      ),
    }))
  }, [])

  const removeQa = useCallback((interviewId: string, qaId: string) => {
    setData((prev) => ({
      ...prev,
      interviews: prev.interviews.map((iv) =>
        iv.id === interviewId
          ? {
              ...iv,
              questions: iv.questions.filter((qa) => qa.id !== qaId),
            }
          : iv,
      ),
    }))
  }, [])

  const updateQaField = useCallback(
    (interviewId: string, qaId: string, field: 'question' | 'response', value: string) => {
      setData((prev) => ({
        ...prev,
        interviews: prev.interviews.map((iv) =>
          iv.id === interviewId
            ? {
                ...iv,
                questions: iv.questions.map((qa) =>
                  qa.id === qaId ? { ...qa, [field]: value } : qa,
                ),
              }
            : iv,
        ),
      }))
    },
    [],
  )

  return (
    <FormShell
      projectId={projectId}
      stepNumber={stepNumber}
      formType="interviewing"
      title="Interviewing"
      description="Conduct structured interviews to gather qualitative insights. Record questions, responses, and key takeaways from each conversation."
      data={data as unknown as Record<string, unknown>}
    >
      <InterviewingFields
        data={data}
        setData={setData}
        addInterview={addInterview}
        removeInterview={removeInterview}
        updateInterviewField={updateInterviewField}
        addQa={addQa}
        removeQa={removeQa}
        updateQaField={updateQaField}
      />
    </FormShell>
  )
}

/* ---- Inner fields component (reads view mode from context) ---- */

type InterviewingFieldsProps = {
  data: InterviewingData
  setData: React.Dispatch<React.SetStateAction<InterviewingData>>
  addInterview: () => void
  removeInterview: (id: string) => void
  updateInterviewField: (
    interviewId: string,
    field: 'interviewee' | 'role' | 'date' | 'keyInsights',
    value: string,
  ) => void
  addQa: (interviewId: string) => void
  removeQa: (interviewId: string, qaId: string) => void
  updateQaField: (
    interviewId: string,
    qaId: string,
    field: 'question' | 'response',
    value: string,
  ) => void
}

const InterviewingFields = ({
  data,
  setData,
  addInterview,
  removeInterview,
  updateInterviewField,
  addQa,
  removeQa,
  updateQaField,
}: InterviewingFieldsProps) => {
  const mode = useFormViewMode()
  const isView = mode === 'view'

  return (
    <div className="space-y-6">
      {/* Interview cards */}
      {data.interviews.length === 0 && isView && (
        <p className="text-sm text-[var(--color-text-tertiary)]">No interviews recorded yet.</p>
      )}

      {data.interviews.map((interview, index) => (
        <Card key={interview.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {interview.interviewee ? interview.interviewee : `Interview #${index + 1}`}
              </CardTitle>
              {!isView && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeInterview(interview.id)}
                  aria-label="Remove interview"
                >
                  <Trash2 size={14} />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Metadata row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor={`name-${interview.id}`}>Interviewee Name</Label>
                {isView ? (
                  <p className="text-sm text-[var(--color-text-primary)]">
                    {interview.interviewee || '—'}
                  </p>
                ) : (
                  <Input
                    id={`name-${interview.id}`}
                    value={interview.interviewee}
                    onChange={(e) =>
                      updateInterviewField(interview.id, 'interviewee', e.target.value)
                    }
                    placeholder="e.g. Jane Smith"
                  />
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`role-${interview.id}`}>Role / Title</Label>
                {isView ? (
                  <p className="text-sm text-[var(--color-text-primary)]">
                    {interview.role || '—'}
                  </p>
                ) : (
                  <Input
                    id={`role-${interview.id}`}
                    value={interview.role}
                    onChange={(e) => updateInterviewField(interview.id, 'role', e.target.value)}
                    placeholder="e.g. Operations Manager"
                  />
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`date-${interview.id}`}>Date</Label>
                {isView ? (
                  <p className="text-sm text-[var(--color-text-primary)]">
                    {interview.date || '—'}
                  </p>
                ) : (
                  <Input
                    id={`date-${interview.id}`}
                    type="date"
                    value={interview.date}
                    onChange={(e) => updateInterviewField(interview.id, 'date', e.target.value)}
                  />
                )}
              </div>
            </div>

            {/* Questions & Responses */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-[var(--color-text-primary)]">
                Questions &amp; Responses
              </p>

              {(interview.questions?.length ?? 0) === 0 && isView && (
                <p className="text-sm text-[var(--color-text-tertiary)]">No questions recorded.</p>
              )}

              {(interview.questions ?? []).map(
                (qa: { id: string; question: string; response: string }, qaIndex: number) => (
                  <div
                    key={qa.id}
                    className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-3 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">
                        Q{qaIndex + 1}
                      </span>
                      {!isView && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeQa(interview.id, qa.id)}
                          aria-label="Remove question"
                        >
                          <Trash2 size={12} />
                        </Button>
                      )}
                    </div>
                    <FormTextarea
                      id={`qa-q-${qa.id}`}
                      label="Question"
                      value={qa.question}
                      onChange={(v) => updateQaField(interview.id, qa.id, 'question', v)}
                      placeholder="Enter your question..."
                      rows={2}
                      aiFieldType="generate"
                      aiContext={`Interview with ${interview.interviewee || 'interviewee'} (${interview.role || 'unknown role'}). Suggest a probing question.`}
                    />
                    <FormTextarea
                      id={`qa-r-${qa.id}`}
                      label="Response"
                      value={qa.response}
                      onChange={(v) => updateQaField(interview.id, qa.id, 'response', v)}
                      placeholder="Record the interviewee's response..."
                      rows={3}
                      aiFieldType="generate"
                      aiContext={`Interview question: "${qa.question || 'not yet set'}". Summarize a typical response.`}
                    />
                  </div>
                ),
              )}

              {!isView && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addQa(interview.id)}
                >
                  <Plus size={14} />
                  Add Question
                </Button>
              )}
            </div>

            {/* Key Insights */}
            <FormTextarea
              id={`insights-${interview.id}`}
              label="Key Insights"
              value={interview.keyInsights}
              onChange={(v) => updateInterviewField(interview.id, 'keyInsights', v)}
              placeholder="Summarize the most important takeaways from this interview..."
              rows={3}
              aiFieldType="generate"
              aiContext={`Interview with ${interview.interviewee || 'interviewee'} (${interview.role || 'unknown role'}). Q&A: ${(interview.questions ?? []).map((qa) => `Q: ${qa.question} A: ${qa.response}`).join('; ')}`}
            />
          </CardContent>
        </Card>
      ))}

      {!isView && (
        <Button type="button" variant="outline" size="sm" onClick={addInterview}>
          <Plus size={14} />
          Add Interview
        </Button>
      )}

      {/* Overall Summary */}
      <FormTextarea
        id="summary"
        label="Overall Summary"
        value={data.summary}
        onChange={(v) => setData((prev) => ({ ...prev, summary: v }))}
        placeholder="Summarize the key themes and findings across all interviews..."
        helperText="Highlight recurring themes, contradictions, and actionable insights from the interviews."
        rows={4}
        aiFieldType="generate"
        aiContext={`Interviewing summary. Interviews conducted: ${data.interviews.length}. Key insights: ${data.interviews
          .map((iv) => iv.keyInsights)
          .filter(Boolean)
          .join('; ')}`}
      />
    </div>
  )
}
