'use client'

import { useCallback, useState } from 'react'
import { FormShell } from '@/components/pips/form-shell'
import { useFormViewMode } from '@/components/pips/form-view-context'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import type { FishboneData } from '@/lib/form-schemas'

const DEFAULT_CATEGORIES = [
  { name: 'Man (People)', causes: [] },
  { name: 'Machine (Equipment)', causes: [] },
  { name: 'Method (Process)', causes: [] },
  { name: 'Material (Inputs)', causes: [] },
  { name: 'Measurement (Metrics)', causes: [] },
  { name: 'Mother Nature (Environment)', causes: [] },
]

const DEFAULTS: FishboneData = {
  problemStatement: '',
  categories: DEFAULT_CATEGORIES,
}

/** Normalize categories from object format {"People": [...]} to array format [{name, causes}] */
const normalizeCategories = (raw: unknown): FishboneData['categories'] => {
  if (Array.isArray(raw)) return raw
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    return Object.entries(raw as Record<string, unknown[]>).map(([name, causes]) => ({
      name,
      causes: Array.isArray(causes)
        ? causes.map((c) =>
            typeof c === 'string'
              ? { text: c, subCauses: [] }
              : (c as { text: string; subCauses: string[] }),
          )
        : [],
    }))
  }
  return DEFAULT_CATEGORIES
}

type Props = {
  projectId: string
  stepNumber: number
  initialData: Record<string, unknown> | null
  problemStatementFromStep1: string
}

export const FishboneForm = ({
  projectId,
  stepNumber,
  initialData,
  problemStatementFromStep1,
}: Props) => {
  const [data, setData] = useState<FishboneData>(() => {
    const merged = { ...DEFAULTS, ...(initialData as Partial<FishboneData>) }
    if (!merged.problemStatement && problemStatementFromStep1) {
      merged.problemStatement = problemStatementFromStep1
    }
    merged.categories = normalizeCategories(merged.categories)
    if (merged.categories.length === 0) {
      merged.categories = DEFAULT_CATEGORIES
    }
    return merged
  })

  const updateCategories = useCallback((categories: FishboneData['categories']) => {
    setData((prev) => ({ ...prev, categories }))
  }, [])

  const addCause = (catIndex: number) => {
    const cats = [...data.categories]
    const cat = cats[catIndex]
    if (!cat) return
    cats[catIndex] = {
      ...cat,
      causes: [...cat.causes, { text: '', subCauses: [] }],
    }
    updateCategories(cats)
  }

  const updateCauseText = (catIndex: number, causeIndex: number, text: string) => {
    const cats = [...data.categories]
    const cat = cats[catIndex]
    if (!cat) return
    const causes = [...cat.causes]
    const cause = causes[causeIndex]
    if (!cause) return
    causes[causeIndex] = { ...cause, text }
    cats[catIndex] = { ...cat, causes }
    updateCategories(cats)
  }

  const removeCause = (catIndex: number, causeIndex: number) => {
    const cats = [...data.categories]
    const cat = cats[catIndex]
    if (!cat) return
    cats[catIndex] = {
      ...cat,
      causes: cat.causes.filter((_, i) => i !== causeIndex),
    }
    updateCategories(cats)
  }

  const addSubCause = (catIndex: number, causeIndex: number) => {
    const cats = [...data.categories]
    const cat = cats[catIndex]
    if (!cat) return
    const causes = [...cat.causes]
    const cause = causes[causeIndex]
    if (!cause) return
    causes[causeIndex] = { ...cause, subCauses: [...cause.subCauses, ''] }
    cats[catIndex] = { ...cat, causes }
    updateCategories(cats)
  }

  const updateSubCause = (catIndex: number, causeIndex: number, subIndex: number, text: string) => {
    const cats = [...data.categories]
    const cat = cats[catIndex]
    if (!cat) return
    const causes = [...cat.causes]
    const cause = causes[causeIndex]
    if (!cause) return
    const subs = [...cause.subCauses]
    subs[subIndex] = text
    causes[causeIndex] = { ...cause, subCauses: subs }
    cats[catIndex] = { ...cat, causes }
    updateCategories(cats)
  }

  const removeSubCause = (catIndex: number, causeIndex: number, subIndex: number) => {
    const cats = [...data.categories]
    const cat = cats[catIndex]
    if (!cat) return
    const causes = [...cat.causes]
    const cause = causes[causeIndex]
    if (!cause) return
    causes[causeIndex] = {
      ...cause,
      subCauses: cause.subCauses.filter((_, i) => i !== subIndex),
    }
    cats[catIndex] = { ...cat, causes }
    updateCategories(cats)
  }

  return (
    <FormShell
      projectId={projectId}
      stepNumber={stepNumber}
      formType="fishbone"
      title="Fishbone Diagram (Cause & Effect)"
      description="Identify potential causes organized by category. Each branch represents a major category of root causes."
      required
      data={data as unknown as Record<string, unknown>}
    >
      <div className="space-y-6">
        {/* Problem statement at the head */}
        {data.problemStatement && (
          <div className="rounded-[var(--radius-md)] border-l-4 border-l-[var(--color-step-2)] bg-[var(--color-step-2-subtle)] px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
              Problem Statement
            </p>
            <p className="mt-1 text-sm text-[var(--color-text-primary)]">{data.problemStatement}</p>
          </div>
        )}

        {/* Category branches */}
        <div className="grid gap-4 md:grid-cols-2">
          {data.categories.map((cat, catIndex) => (
            <CategoryBranch
              key={cat.name}
              category={cat}
              catIndex={catIndex}
              onAddCause={() => addCause(catIndex)}
              onUpdateCauseText={(ci, text) => updateCauseText(catIndex, ci, text)}
              onRemoveCause={(ci) => removeCause(catIndex, ci)}
              onAddSubCause={(ci) => addSubCause(catIndex, ci)}
              onUpdateSubCause={(ci, si, text) => updateSubCause(catIndex, ci, si, text)}
              onRemoveSubCause={(ci, si) => removeSubCause(catIndex, ci, si)}
            />
          ))}
        </div>
      </div>
    </FormShell>
  )
}

/* ---- Category branch sub-component ---- */

type CategoryBranchProps = {
  category: FishboneData['categories'][number]
  catIndex: number
  onAddCause: () => void
  onUpdateCauseText: (causeIndex: number, text: string) => void
  onRemoveCause: (causeIndex: number) => void
  onAddSubCause: (causeIndex: number) => void
  onUpdateSubCause: (causeIndex: number, subIndex: number, text: string) => void
  onRemoveSubCause: (causeIndex: number, subIndex: number) => void
}

const CategoryBranch = ({
  category,
  onAddCause,
  onUpdateCauseText,
  onRemoveCause,
  onAddSubCause,
  onUpdateSubCause,
  onRemoveSubCause,
}: CategoryBranchProps) => {
  const mode = useFormViewMode()
  const isView = mode === 'view'
  const [isOpen, setIsOpen] = useState(true)

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            {category.name}
            <Badge variant="secondary" className="text-[10px]">
              {category.causes.length}
            </Badge>
          </CardTitle>
        </div>
      </CardHeader>
      {isOpen && (
        <CardContent className="space-y-3">
          {isView ? (
            <>
              {category.causes.length === 0 ? (
                <p className="text-sm italic text-[var(--color-text-tertiary)]">
                  No causes identified
                </p>
              ) : (
                <ul className="space-y-2">
                  {category.causes.map((cause, ci) => (
                    <li key={ci}>
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        {cause.text || (
                          <span className="italic text-[var(--color-text-tertiary)]">
                            Empty cause
                          </span>
                        )}
                      </p>
                      {cause.subCauses.length > 0 && (
                        <ul className="ml-4 mt-1 space-y-0.5">
                          {cause.subCauses.map((sub, si) => (
                            <li
                              key={si}
                              className="flex items-start gap-1.5 text-xs text-[var(--color-text-tertiary)]"
                            >
                              <span className="mt-0.5">-</span>
                              <span>{sub || 'Empty sub-cause'}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <>
              {category.causes.map((cause, ci) => (
                <div key={ci} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      value={cause.text}
                      onChange={(e) => onUpdateCauseText(ci, e.target.value)}
                      placeholder="Describe a potential cause..."
                      className="text-sm"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => onRemoveCause(ci)}
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                  {/* Sub-causes */}
                  {cause.subCauses.map((sub, si) => (
                    <div key={si} className="ml-6 flex items-center gap-2">
                      <span className="text-[var(--color-text-tertiary)]">-</span>
                      <Input
                        value={sub}
                        onChange={(e) => onUpdateSubCause(ci, si, e.target.value)}
                        placeholder="Sub-cause..."
                        className="text-xs"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => onRemoveSubCause(ci, si)}
                      >
                        <Trash2 size={10} />
                      </Button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => onAddSubCause(ci)}
                    className="ml-6 text-xs text-[var(--color-text-link)] hover:underline"
                  >
                    + Add sub-cause
                  </button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onAddCause}
                className="w-full"
              >
                <Plus size={12} />
                Add Cause
              </Button>
            </>
          )}
        </CardContent>
      )}
    </Card>
  )
}
