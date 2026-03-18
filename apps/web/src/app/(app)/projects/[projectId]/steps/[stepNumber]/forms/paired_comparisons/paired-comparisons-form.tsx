'use client'

import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2, Trophy, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FormShell } from '@/components/pips/form-shell'
import { useFormViewMode } from '@/components/pips/form-view-context'
import { saveFormData } from '../actions'
import type { PairedComparisonsData } from '@/lib/form-schemas'
import { cn } from '@/lib/utils'

type Props = {
  projectId: string
  initialData: PairedComparisonsData | null
}

const defaultData: PairedComparisonsData = {
  options: [],
  comparisons: [],
  results: [],
}

/** Generate all unique pairs from options */
const generatePairs = (
  options: PairedComparisonsData['options'],
  existing: PairedComparisonsData['comparisons'],
): PairedComparisonsData['comparisons'] => {
  const pairs: PairedComparisonsData['comparisons'] = []
  for (let i = 0; i < options.length; i++) {
    for (let j = i + 1; j < options.length; j++) {
      const a = options[i]!
      const b = options[j]!
      const prev = existing.find(
        (c) =>
          (c.optionA === a.id && c.optionB === b.id) || (c.optionA === b.id && c.optionB === a.id),
      )
      pairs.push({
        optionA: a.id,
        optionB: b.id,
        winner: prev?.winner ?? null,
        notes: prev?.notes ?? '',
      })
    }
  }
  return pairs
}

/** Compute results from comparisons */
const computeResults = (
  options: PairedComparisonsData['options'],
  comparisons: PairedComparisonsData['comparisons'],
): PairedComparisonsData['results'] => {
  const wins: Record<string, number> = {}
  for (const opt of options) {
    wins[opt.id] = 0
  }
  for (const c of comparisons) {
    const w = c.winner
    if (w && wins[w] !== undefined) {
      wins[w] = (wins[w] ?? 0) + 1
    }
  }

  const sorted = options
    .map((opt) => ({ optionId: opt.id, wins: wins[opt.id] ?? 0 }))
    .sort((a, b) => b.wins - a.wins)

  let rank = 1
  return sorted.map((entry, idx) => {
    if (idx > 0 && entry.wins < sorted[idx - 1]!.wins) {
      rank = idx + 1
    }
    return { ...entry, rank }
  })
}

let nextId = 1
const genId = () => `opt_${Date.now()}_${nextId++}`

export const PairedComparisonsForm = ({ projectId, initialData }: Props) => {
  const [data, setData] = useState<PairedComparisonsData>(initialData ?? defaultData)
  const [dirty, setDirty] = useState(false)

  const update = useCallback((next: PairedComparisonsData) => {
    setData(next)
    setDirty(true)
  }, [])

  const handleSave = useCallback(async () => {
    const result = await saveFormData(
      projectId,
      4,
      'paired_comparisons',
      data as unknown as Record<string, unknown>,
    )
    if (result.error) {
      toast.error(result.error)
      return { error: result.error }
    }
    setDirty(false)
    return { success: true }
  }, [projectId, data])

  const labelForId = useCallback(
    (id: string) => data.options.find((o) => o.id === id)?.label ?? id,
    [data.options],
  )

  const addOption = () => {
    const newOption = { id: genId(), label: '' }
    const nextOptions = [...data.options, newOption]
    const nextComparisons = generatePairs(nextOptions, data.comparisons)
    const nextResults = computeResults(nextOptions, nextComparisons)
    update({ options: nextOptions, comparisons: nextComparisons, results: nextResults })
  }

  const removeOption = (id: string) => {
    const nextOptions = data.options.filter((o) => o.id !== id)
    const nextComparisons = generatePairs(nextOptions, data.comparisons)
    const nextResults = computeResults(nextOptions, nextComparisons)
    update({ options: nextOptions, comparisons: nextComparisons, results: nextResults })
  }

  const updateOptionLabel = (id: string, label: string) => {
    const nextOptions = data.options.map((o) => (o.id === id ? { ...o, label } : o))
    const nextResults = computeResults(nextOptions, data.comparisons)
    update({ ...data, options: nextOptions, results: nextResults })
  }

  const pickWinner = (compIdx: number, winnerId: string) => {
    const nextComparisons = data.comparisons.map((c, i) =>
      i === compIdx ? { ...c, winner: winnerId } : c,
    )
    const nextResults = computeResults(data.options, nextComparisons)
    update({ ...data, comparisons: nextComparisons, results: nextResults })
  }

  const updateNotes = (compIdx: number, notes: string) => {
    const nextComparisons = data.comparisons.map((c, i) => (i === compIdx ? { ...c, notes } : c))
    update({ ...data, comparisons: nextComparisons })
  }

  const completedCount = useMemo(
    () => data.comparisons.filter((c) => c.winner !== null).length,
    [data.comparisons],
  )
  const totalCount = data.comparisons.length
  const allDone = totalCount > 0 && completedCount === totalCount

  return (
    <FormShell
      title="Paired Comparisons"
      description="Compare options systematically in pairs. For each pair, select the better option. Results are tallied into a ranked list."
      stepNumber={4}
      projectId={projectId}
      onSave={handleSave}
      isDirty={dirty}
    >
      <PairedComparisonsFields
        data={data}
        labelForId={labelForId}
        completedCount={completedCount}
        totalCount={totalCount}
        allDone={allDone}
        addOption={addOption}
        removeOption={removeOption}
        updateOptionLabel={updateOptionLabel}
        pickWinner={pickWinner}
        updateNotes={updateNotes}
      />
    </FormShell>
  )
}

/* ---- Inner fields component (reads view mode from context) ---- */

type PairedComparisonsFieldsProps = {
  data: PairedComparisonsData
  labelForId: (id: string) => string
  completedCount: number
  totalCount: number
  allDone: boolean
  addOption: () => void
  removeOption: (id: string) => void
  updateOptionLabel: (id: string, label: string) => void
  pickWinner: (compIdx: number, winnerId: string) => void
  updateNotes: (compIdx: number, notes: string) => void
}

const PairedComparisonsFields = ({
  data,
  labelForId,
  completedCount,
  totalCount,
  allDone,
  addOption,
  removeOption,
  updateOptionLabel,
  pickWinner,
  updateNotes,
}: PairedComparisonsFieldsProps) => {
  const mode = useFormViewMode()
  const isView = mode === 'view'

  if (isView) {
    return (
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground">Paired comparison results.</p>

        {/* Options */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Options</h3>
          {data.options.length === 0 ? (
            <p className="text-sm italic text-[var(--color-text-tertiary)]">No options defined.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {data.options.map((opt) => (
                <Badge key={opt.id} variant="secondary" className="text-xs">
                  {opt.label || 'Unnamed'}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Matchups */}
        {data.comparisons.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                Pairwise Matchups
              </h3>
              <Badge variant="secondary" className="text-xs">
                {completedCount}/{totalCount} decided
              </Badge>
            </div>
            <div className="space-y-2">
              {data.comparisons.map((comp) => {
                const winnerLabel = comp.winner ? labelForId(comp.winner) : null
                return (
                  <div
                    key={`${comp.optionA}-${comp.optionB}`}
                    className={cn(
                      'rounded-[var(--radius-md)] border p-3',
                      comp.winner
                        ? 'border-[var(--color-success)]'
                        : 'border-[var(--color-border)]',
                    )}
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <span
                        className={cn(
                          comp.winner === comp.optionA
                            ? 'font-semibold text-[var(--color-step-4)]'
                            : 'text-[var(--color-text-secondary)]',
                        )}
                      >
                        {labelForId(comp.optionA) || 'Option A'}
                      </span>
                      <span className="text-xs text-[var(--color-text-tertiary)]">vs</span>
                      <span
                        className={cn(
                          comp.winner === comp.optionB
                            ? 'font-semibold text-[var(--color-step-4)]'
                            : 'text-[var(--color-text-secondary)]',
                        )}
                      >
                        {labelForId(comp.optionB) || 'Option B'}
                      </span>
                      {winnerLabel && (
                        <span className="ml-auto flex items-center gap-1 text-xs text-[var(--color-success)]">
                          <ArrowRight className="size-3" />
                          {winnerLabel}
                        </span>
                      )}
                    </div>
                    {comp.notes && (
                      <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">{comp.notes}</p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Results */}
        {data.results.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Rankings</h3>
            <div className="overflow-x-auto rounded-[var(--radius-md)] border border-[var(--color-border)]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-[var(--color-surface-secondary)]">
                    <th className="px-4 py-2 text-left font-medium text-[var(--color-text-secondary)]">
                      Rank
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--color-text-secondary)]">
                      Option
                    </th>
                    <th className="px-4 py-2 text-right font-medium text-[var(--color-text-secondary)]">
                      Wins
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.results.map((r) => {
                    const isTop = r.rank === 1
                    return (
                      <tr
                        key={r.optionId}
                        className={cn(
                          'border-b last:border-b-0',
                          isTop && 'bg-[var(--color-success-subtle)]',
                        )}
                      >
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-1.5">
                            {isTop && <Trophy className="size-4 text-[var(--color-success)]" />}
                            <span
                              className={cn(
                                'font-medium',
                                isTop
                                  ? 'text-[var(--color-success)]'
                                  : 'text-[var(--color-text-primary)]',
                              )}
                            >
                              #{r.rank}
                            </span>
                          </div>
                        </td>
                        <td
                          className={cn(
                            'px-4 py-2',
                            isTop
                              ? 'font-semibold text-[var(--color-text-primary)]'
                              : 'text-[var(--color-text-secondary)]',
                          )}
                        >
                          {labelForId(r.optionId)}
                        </td>
                        <td className="px-4 py-2 text-right font-mono text-[var(--color-text-secondary)]">
                          {r.wins}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Add the options you want to compare, then evaluate each pair. Select the better option in
        each matchup. The results table will automatically rank them by win count.
      </p>

      {/* Options list */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
          Options to Compare
        </h3>
        {data.options.map((opt) => (
          <div key={opt.id} className="flex items-center gap-2">
            <Input
              value={opt.label}
              onChange={(e) => updateOptionLabel(opt.id, e.target.value)}
              placeholder="Option name"
              className="h-9 text-sm"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeOption(opt.id)}
              className="shrink-0"
            >
              <Trash2 className="size-4 text-muted-foreground" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={addOption}>
          <Plus className="size-4" />
          Add Option
        </Button>
      </div>

      {/* Comparisons */}
      {data.comparisons.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
              Pairwise Matchups
            </h3>
            <Badge variant="secondary" className="text-xs">
              {completedCount}/{totalCount} decided
            </Badge>
          </div>
          <div className="space-y-3">
            {data.comparisons.map((comp, idx) => (
              <ComparisonCard
                key={`${comp.optionA}-${comp.optionB}`}
                labelA={labelForId(comp.optionA)}
                labelB={labelForId(comp.optionB)}
                idA={comp.optionA}
                idB={comp.optionB}
                winner={comp.winner}
                notes={comp.notes}
                onPick={(id) => pickWinner(idx, id)}
                onNotesChange={(notes) => updateNotes(idx, notes)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {allDone && data.results.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Rankings</h3>
          <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-[var(--color-surface-secondary)]">
                  <th className="px-4 py-2 text-left font-medium text-[var(--color-text-secondary)]">
                    Rank
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-[var(--color-text-secondary)]">
                    Option
                  </th>
                  <th className="px-4 py-2 text-right font-medium text-[var(--color-text-secondary)]">
                    Wins
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.results.map((r) => {
                  const isTop = r.rank === 1
                  return (
                    <tr
                      key={r.optionId}
                      className={cn(
                        'border-b last:border-b-0',
                        isTop && 'bg-[var(--color-success-subtle)]',
                      )}
                    >
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-1.5">
                          {isTop && <Trophy className="size-4 text-[var(--color-success)]" />}
                          <span
                            className={cn(
                              'font-medium',
                              isTop
                                ? 'text-[var(--color-success)]'
                                : 'text-[var(--color-text-primary)]',
                            )}
                          >
                            #{r.rank}
                          </span>
                        </div>
                      </td>
                      <td
                        className={cn(
                          'px-4 py-2',
                          isTop
                            ? 'font-semibold text-[var(--color-text-primary)]'
                            : 'text-[var(--color-text-secondary)]',
                        )}
                      >
                        {labelForId(r.optionId)}
                      </td>
                      <td className="px-4 py-2 text-right font-mono text-[var(--color-text-secondary)]">
                        {r.wins}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

/* ---- Comparison card sub-component ---- */

type ComparisonCardProps = {
  labelA: string
  labelB: string
  idA: string
  idB: string
  winner: string | null
  notes: string
  onPick: (id: string) => void
  onNotesChange: (notes: string) => void
}

const ComparisonCard = ({
  labelA,
  labelB,
  idA,
  idB,
  winner,
  notes,
  onPick,
  onNotesChange,
}: ComparisonCardProps) => (
  <Card
    className={cn(
      'transition-all',
      winner ? 'border-[var(--color-success)]' : 'border-[var(--color-border)]',
    )}
  >
    <CardContent className="flex flex-col gap-3 p-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onPick(idA)}
          className={cn(
            'flex-1 rounded-[var(--radius-md)] border-2 px-4 py-3 text-sm font-medium transition-all',
            winner === idA
              ? 'border-[var(--color-step-4)] bg-[var(--color-step-4)]/10 text-[var(--color-step-4)]'
              : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-step-4)] hover:text-[var(--color-text-primary)]',
          )}
        >
          {labelA || 'Option A'}
        </button>

        <span className="shrink-0 text-xs font-medium text-[var(--color-text-tertiary)]">vs</span>

        <button
          type="button"
          onClick={() => onPick(idB)}
          className={cn(
            'flex-1 rounded-[var(--radius-md)] border-2 px-4 py-3 text-sm font-medium transition-all',
            winner === idB
              ? 'border-[var(--color-step-4)] bg-[var(--color-step-4)]/10 text-[var(--color-step-4)]'
              : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-step-4)] hover:text-[var(--color-text-primary)]',
          )}
        >
          {labelB || 'Option B'}
        </button>
      </div>

      {winner && (
        <div className="flex items-center gap-1.5 text-xs text-[var(--color-success)]">
          <ArrowRight className="size-3" />
          <span className="font-medium">
            {winner === idA ? labelA || 'Option A' : labelB || 'Option B'} selected
          </span>
        </div>
      )}

      <Textarea
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        placeholder="Notes (optional)"
        className="min-h-[2rem] resize-none text-xs"
        rows={1}
      />
    </CardContent>
  </Card>
)
