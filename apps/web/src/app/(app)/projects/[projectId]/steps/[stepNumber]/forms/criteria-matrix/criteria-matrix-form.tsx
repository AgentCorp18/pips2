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
import { saveFormData } from '../actions'
import type { CriteriaMatrixData } from '@/lib/form-schemas'
import { cn } from '@/lib/utils'

type Props = {
  projectId: string
  initialData: CriteriaMatrixData | null
}

const defaultData: CriteriaMatrixData = {
  criteria: [{ name: 'Cost', weight: 5, description: 'Total implementation cost' }],
  solutions: [{ name: 'Solution A', scores: {} }],
}

export const CriteriaMatrixForm = ({ projectId, initialData }: Props) => {
  const [data, setData] = useState<CriteriaMatrixData>(initialData ?? defaultData)
  const [dirty, setDirty] = useState(false)
  const [saveVersion, setSaveVersion] = useState(0)

  const update = (next: CriteriaMatrixData) => {
    setData(next)
    setDirty(true)
    setSaveVersion((v) => v + 1)
  }

  const handleSave = useCallback(async () => {
    const result = await saveFormData(
      projectId,
      4,
      'criteria_matrix',
      data as unknown as Record<string, unknown>,
    )
    if (result.error) {
      toast.error(result.error)
      return { error: result.error }
    }
    setDirty(false)
    return { success: true }
  }, [projectId, data])

  const addCriteria = () => {
    update({
      ...data,
      criteria: [...data.criteria, { name: '', weight: 5, description: '' }],
    })
  }

  const removeCriteria = (idx: number) => {
    const name = data.criteria[idx]?.name ?? ''
    const nextSolutions = data.solutions.map((s) => {
      const scores = { ...s.scores }
      delete scores[name]
      return { ...s, scores }
    })
    update({
      ...data,
      criteria: data.criteria.filter((_, i) => i !== idx),
      solutions: nextSolutions,
    })
  }

  const updateCriteria = (
    idx: number,
    field: 'name' | 'weight' | 'description',
    value: string | number,
  ) => {
    const prev = data.criteria[idx]
    if (!prev) return
    const oldName = prev.name

    const next = data.criteria.map((c, i) => (i === idx ? { ...c, [field]: value } : c))

    let nextSolutions = data.solutions
    if (field === 'name' && typeof value === 'string' && oldName !== value) {
      nextSolutions = data.solutions.map((s) => {
        const scores = { ...s.scores }
        if (oldName in scores) {
          scores[value] = scores[oldName] ?? 0
          delete scores[oldName]
        }
        return { ...s, scores }
      })
    }

    update({ ...data, criteria: next, solutions: nextSolutions })
  }

  const addSolution = () => {
    update({
      ...data,
      solutions: [...data.solutions, { name: '', scores: {} }],
    })
  }

  const removeSolution = (idx: number) => {
    update({
      ...data,
      solutions: data.solutions.filter((_, i) => i !== idx),
    })
  }

  const updateSolutionName = (idx: number, name: string) => {
    update({
      ...data,
      solutions: data.solutions.map((s, i) => (i === idx ? { ...s, name } : s)),
    })
  }

  const updateScore = (solIdx: number, criteriaName: string, score: number) => {
    update({
      ...data,
      solutions: data.solutions.map((s, i) =>
        i === solIdx ? { ...s, scores: { ...s.scores, [criteriaName]: score } } : s,
      ),
    })
  }

  const weightedTotal = (solution: CriteriaMatrixData['solutions'][number]) =>
    data.criteria.reduce((sum, c) => {
      const score = solution.scores[c.name] ?? 0
      return sum + score * c.weight
    }, 0)

  const totals = data.solutions.map(weightedTotal)
  const maxTotal = Math.max(...totals, 0)

  return (
    <FormShell
      title="Criteria Matrix"
      description="Score and rank solutions against weighted criteria to objectively select the best option."
      stepNumber={4}
      onSave={handleSave}
      isDirty={dirty}
      key={saveVersion}
    >
      <div className="space-y-6">
        {/* Coaching prompt */}
        <p className="text-sm text-muted-foreground">
          Add your evaluation criteria with importance weights (1-10), then score each solution
          (1-5) against each criterion. The weighted totals will highlight the strongest option.
        </p>

        {/* Matrix table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[180px]">Criteria</TableHead>
                <TableHead className="w-20 text-center">Weight</TableHead>
                {data.solutions.map((sol, sIdx) => (
                  <TableHead key={sIdx} className="min-w-[140px]">
                    <div className="flex items-center gap-1">
                      <Input
                        value={sol.name}
                        onChange={(e) => updateSolutionName(sIdx, e.target.value)}
                        placeholder="Solution name"
                        className="h-7 text-xs"
                      />
                      {data.solutions.length > 1 && (
                        <Button variant="ghost" size="icon-xs" onClick={() => removeSolution(sIdx)}>
                          <Trash2 className="size-3 text-muted-foreground" />
                        </Button>
                      )}
                    </div>
                  </TableHead>
                ))}
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.criteria.map((criterion, cIdx) => (
                <TableRow key={cIdx}>
                  <TableCell>
                    <Input
                      value={criterion.name}
                      onChange={(e) => updateCriteria(cIdx, 'name', e.target.value)}
                      placeholder="Criterion name"
                      className="h-7 text-xs"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={criterion.weight}
                      onChange={(e) =>
                        updateCriteria(cIdx, 'weight', parseInt(e.target.value, 10) || 1)
                      }
                      className="h-7 w-16 text-center text-xs"
                    />
                  </TableCell>
                  {data.solutions.map((sol, sIdx) => (
                    <TableCell key={sIdx}>
                      <ScoreInput
                        value={sol.scores[criterion.name] ?? 0}
                        onChange={(v) => updateScore(sIdx, criterion.name, v)}
                      />
                    </TableCell>
                  ))}
                  <TableCell>
                    {data.criteria.length > 1 && (
                      <Button variant="ghost" size="icon-xs" onClick={() => removeCriteria(cIdx)}>
                        <Trash2 className="size-3 text-muted-foreground" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}

              {/* Weighted totals row */}
              <TableRow className="border-t-2 font-semibold">
                <TableCell colSpan={2} className="text-right">
                  Weighted Total
                </TableCell>
                {data.solutions.map((_sol, sIdx) => {
                  const total = totals[sIdx] ?? 0
                  const isWinner = total > 0 && total === maxTotal
                  return (
                    <TableCell
                      key={sIdx}
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
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Action buttons */}
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
      </div>
    </FormShell>
  )
}

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
