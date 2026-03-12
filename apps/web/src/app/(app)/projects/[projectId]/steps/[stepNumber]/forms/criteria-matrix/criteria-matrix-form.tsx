'use client'

import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { FormShell } from '@/components/pips/form-shell'
import { useFormViewMode } from '@/components/pips/form-view-context'
import { saveFormData } from '../actions'
import type { CriteriaMatrixData } from '@/lib/form-schemas'
import { cn } from '@/lib/utils'

type Props = {
  projectId: string
  initialData: CriteriaMatrixData | null
}

/* Internal types with stable IDs for React keys */

type InternalCriterion = {
  id: string
  name: string
  weight: number
  description: string
}

type InternalSolution = {
  id: string
  name: string
  /** scores keyed by criterion ID */
  scores: Record<string, number>
}

type InternalData = {
  criteria: InternalCriterion[]
  solutions: InternalSolution[]
}

/* Helpers to convert between schema format and internal format */

const toInternal = (data: CriteriaMatrixData): InternalData => {
  const criteria: InternalCriterion[] = data.criteria.map((c) => ({
    id: crypto.randomUUID(),
    name: c.name,
    weight: c.weight,
    description: c.description,
  }))

  const nameToId = new Map(criteria.map((c) => [c.name, c.id]))

  const solutions: InternalSolution[] = data.solutions.map((s) => {
    const scores: Record<string, number> = {}
    for (const [name, score] of Object.entries(s.scores)) {
      const id = nameToId.get(name)
      if (id !== undefined) {
        scores[id] = score
      }
    }
    return { id: crypto.randomUUID(), name: s.name, scores }
  })

  return { criteria, solutions }
}

const fromInternal = (internal: InternalData): CriteriaMatrixData => {
  const idToName = new Map(internal.criteria.map((c) => [c.id, c.name]))

  const criteria = internal.criteria.map(({ name, weight, description }) => ({
    name,
    weight,
    description,
  }))

  const solutions = internal.solutions.map((s) => {
    const scores: Record<string, number> = {}
    for (const [id, score] of Object.entries(s.scores)) {
      const name = idToName.get(id)
      if (name !== undefined && score > 0) {
        scores[name] = score
      }
    }
    return { name: s.name, scores }
  })

  return { criteria, solutions }
}

const makeDefaultInternal = (): InternalData => ({
  criteria: [
    {
      id: crypto.randomUUID(),
      name: 'Cost',
      weight: 5,
      description: 'Total implementation cost',
    },
  ],
  solutions: [{ id: crypto.randomUUID(), name: 'Solution A', scores: {} }],
})

export const CriteriaMatrixForm = ({ projectId, initialData }: Props) => {
  const [internal, setInternal] = useState<InternalData>(() =>
    initialData ? toInternal(initialData) : makeDefaultInternal(),
  )
  const [dirty, setDirty] = useState(false)

  const update = (next: InternalData) => {
    setInternal(next)
    setDirty(true)
  }

  const handleSave = useCallback(async () => {
    const schemaData = fromInternal(internal)
    const result = await saveFormData(
      projectId,
      4,
      'criteria_matrix',
      schemaData as unknown as Record<string, unknown>,
    )
    if (result.error) {
      toast.error(result.error)
      return { error: result.error }
    }
    setDirty(false)
    return { success: true }
  }, [projectId, internal])

  const addCriteria = () => {
    update({
      ...internal,
      criteria: [
        ...internal.criteria,
        { id: crypto.randomUUID(), name: '', weight: 5, description: '' },
      ],
    })
  }

  const removeCriteria = (id: string) => {
    update({
      ...internal,
      criteria: internal.criteria.filter((c) => c.id !== id),
      solutions: internal.solutions.map((s) => {
        const scores = { ...s.scores }
        delete scores[id]
        return { ...s, scores }
      }),
    })
  }

  const updateCriteria = (
    id: string,
    field: 'name' | 'weight' | 'description',
    value: string | number,
  ) => {
    update({
      ...internal,
      criteria: internal.criteria.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    })
  }

  const addSolution = () => {
    update({
      ...internal,
      solutions: [...internal.solutions, { id: crypto.randomUUID(), name: '', scores: {} }],
    })
  }

  const removeSolution = (id: string) => {
    update({
      ...internal,
      solutions: internal.solutions.filter((s) => s.id !== id),
    })
  }

  const updateSolutionName = (id: string, name: string) => {
    update({
      ...internal,
      solutions: internal.solutions.map((s) => (s.id === id ? { ...s, name } : s)),
    })
  }

  const updateScore = (solutionId: string, criterionId: string, score: number) => {
    update({
      ...internal,
      solutions: internal.solutions.map((s) =>
        s.id === solutionId ? { ...s, scores: { ...s.scores, [criterionId]: score } } : s,
      ),
    })
  }

  const weightedTotal = (solution: InternalSolution) =>
    internal.criteria.reduce((sum, c) => {
      const score = solution.scores[c.id] ?? 0
      return sum + score * c.weight
    }, 0)

  const totals = internal.solutions.map(weightedTotal)
  const maxTotal = Math.max(...totals, 0)

  return (
    <FormShell
      title="Criteria Matrix"
      description="Score and rank solutions against weighted criteria to objectively select the best option."
      stepNumber={4}
      onSave={handleSave}
      isDirty={dirty}
    >
      <CriteriaMatrixFields
        internal={internal}
        totals={totals}
        maxTotal={maxTotal}
        addCriteria={addCriteria}
        removeCriteria={removeCriteria}
        updateCriteria={updateCriteria}
        addSolution={addSolution}
        removeSolution={removeSolution}
        updateSolutionName={updateSolutionName}
        updateScore={updateScore}
      />
    </FormShell>
  )
}

/* ---- Inner fields component (reads view mode from context) ---- */

type CriteriaMatrixFieldsProps = {
  internal: InternalData
  totals: number[]
  maxTotal: number
  addCriteria: () => void
  removeCriteria: (id: string) => void
  updateCriteria: (
    id: string,
    field: 'name' | 'weight' | 'description',
    value: string | number,
  ) => void
  addSolution: () => void
  removeSolution: (id: string) => void
  updateSolutionName: (id: string, name: string) => void
  updateScore: (solutionId: string, criterionId: string, score: number) => void
}

const CriteriaMatrixFields = ({
  internal,
  totals,
  maxTotal,
  addCriteria,
  removeCriteria,
  updateCriteria,
  addSolution,
  removeSolution,
  updateSolutionName,
  updateScore,
}: CriteriaMatrixFieldsProps) => {
  const mode = useFormViewMode()
  const isView = mode === 'view'

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        {isView
          ? 'Criteria-weighted scoring matrix with ranked solutions.'
          : 'Add your evaluation criteria with importance weights (1-10), then score each solution (1-5) against each criterion. The weighted totals will highlight the strongest option.'}
      </p>

      {/* Matrix table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[180px]">Criteria</TableHead>
              <TableHead className="w-20 text-center">Weight</TableHead>
              {internal.solutions.map((sol) => (
                <TableHead key={sol.id} className="min-w-[140px]">
                  {isView ? (
                    <span className="text-xs font-medium">{sol.name || 'Unnamed'}</span>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Input
                        value={sol.name}
                        onChange={(e) => updateSolutionName(sol.id, e.target.value)}
                        placeholder="Solution name"
                        className="h-7 text-xs"
                      />
                      {internal.solutions.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => removeSolution(sol.id)}
                        >
                          <Trash2 className="size-3 text-muted-foreground" />
                        </Button>
                      )}
                    </div>
                  )}
                </TableHead>
              ))}
              {!isView && <TableHead className="w-10" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {internal.criteria.map((criterion) => (
              <TableRow key={criterion.id}>
                <TableCell>
                  {isView ? (
                    <span className="text-xs font-medium text-[var(--color-text-primary)]">
                      {criterion.name || 'Unnamed'}
                    </span>
                  ) : (
                    <Input
                      value={criterion.name}
                      onChange={(e) => updateCriteria(criterion.id, 'name', e.target.value)}
                      placeholder="Criterion name"
                      className="h-7 text-xs"
                    />
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {isView ? (
                    <span className="text-xs font-medium text-[var(--color-text-secondary)]">
                      {criterion.weight}
                    </span>
                  ) : (
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={criterion.weight}
                      onChange={(e) =>
                        updateCriteria(criterion.id, 'weight', parseInt(e.target.value, 10) || 1)
                      }
                      className="h-7 w-16 text-center text-xs"
                    />
                  )}
                </TableCell>
                {internal.solutions.map((sol) => (
                  <TableCell key={sol.id}>
                    {isView ? (
                      <ScoreView value={sol.scores[criterion.id] ?? 0} />
                    ) : (
                      <ScoreInput
                        value={sol.scores[criterion.id] ?? 0}
                        onChange={(v) => updateScore(sol.id, criterion.id, v)}
                      />
                    )}
                  </TableCell>
                ))}
                {!isView && (
                  <TableCell>
                    {internal.criteria.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => removeCriteria(criterion.id)}
                      >
                        <Trash2 className="size-3 text-muted-foreground" />
                      </Button>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}

            {/* Weighted totals row */}
            <TableRow className="border-t-2 font-semibold">
              <TableCell colSpan={2} className="text-right">
                Weighted Total
              </TableCell>
              {internal.solutions.map((sol, sIdx) => {
                const total = totals[sIdx] ?? 0
                const isWinner = total > 0 && total === maxTotal
                return (
                  <TableCell
                    key={sol.id}
                    className={cn(
                      'text-center text-base',
                      isWinner && 'text-[var(--color-success)] font-bold',
                    )}
                  >
                    <div className="flex items-center justify-center gap-1">
                      {isWinner && <Trophy className="size-4" />}
                      {total}
                    </div>
                  </TableCell>
                )
              })}
              {!isView && <TableCell />}
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Action buttons */}
      {!isView && (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={addCriteria}>
            <Plus className="size-4" />
            Add Criteria
          </Button>
          <Button variant="outline" size="sm" onClick={addSolution}>
            <Plus className="size-4" />
            Add Solution
          </Button>
        </div>
      )}
    </div>
  )
}

/* ---- Score view (read-only) ---- */

const ScoreView = ({ value }: { value: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <span
        key={n}
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded text-xs font-medium',
          n === value
            ? 'bg-[var(--color-step-4)] text-white'
            : n <= value
              ? 'bg-[var(--color-step-4)]/30 text-[var(--color-step-4)]'
              : 'bg-muted text-muted-foreground/40',
        )}
      >
        {n}
      </span>
    ))}
  </div>
)

/* Score input (1-5 buttons) */
const ScoreInput = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <button
        key={n}
        type="button"
        onClick={() => onChange(n)}
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded text-xs font-medium transition-colors',
          n === value
            ? 'bg-[var(--color-step-4)] text-white'
            : 'bg-muted text-muted-foreground hover:bg-muted/80',
        )}
      >
        {n}
      </button>
    ))}
  </div>
)
