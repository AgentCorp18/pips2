'use client'

import { useCallback, useState } from 'react'
import { FormShell } from '@/components/pips/form-shell'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import type { FishboneData } from '@/lib/form-schemas'

const DEFAULT_CATEGORIES = [
  { name: 'People', causes: [] },
  { name: 'Process', causes: [] },
  { name: 'Equipment', causes: [] },
  { name: 'Materials', causes: [] },
  { name: 'Environment', causes: [] },
  { name: 'Management', causes: [] },
]

const DEFAULTS: FishboneData = {
  problemStatement: '',
  categories: DEFAULT_CATEGORIES,
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
    if (!merged.categories || merged.categories.length === 0) {
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
          <Button type="button" variant="outline" size="sm" onClick={onAddCause} className="w-full">
            <Plus size={12} />
            Add Cause
          </Button>
        </CardContent>
      )}
    </Card>
  )
}
