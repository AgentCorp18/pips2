'use client'

import { useCallback, useState } from 'react'
import { FormShell } from '@/components/pips/form-shell'
import { useFormViewMode } from '@/components/pips/form-view-context'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Plus } from 'lucide-react'
import type { WeightedVotingData } from '@/lib/form-schemas'

const DEFAULTS: WeightedVotingData = {
  options: [],
  totalVotesPerPerson: 5,
  voters: [],
}

type Props = {
  projectId: string
  stepNumber: number
  initialData: Record<string, unknown> | null
}

export const WeightedVotingForm = ({ projectId, stepNumber, initialData }: Props) => {
  const [data, setData] = useState<WeightedVotingData>({
    ...DEFAULTS,
    ...(initialData as Partial<WeightedVotingData>),
  })
  const [newOption, setNewOption] = useState('')
  const [newVoter, setNewVoter] = useState('')

  const addOption = useCallback(() => {
    const text = newOption.trim()
    if (!text) return
    const optionId = crypto.randomUUID()
    setData((prev) => ({
      ...prev,
      options: [...prev.options, { id: optionId, text, votes: 0 }],
      // Ensure every existing voter gets a zero allocation for the new option
      voters: prev.voters.map((voter) => ({
        ...voter,
        allocations: { ...voter.allocations, [optionId]: 0 },
      })),
    }))
    setNewOption('')
  }, [newOption])

  const addVoter = useCallback(() => {
    const name = newVoter.trim()
    if (!name) return
    setData((prev) => {
      // Build initial allocations with zero for every existing option
      const allocations: Record<string, number> = {}
      for (const opt of prev.options) {
        allocations[opt.id] = 0
      }
      return {
        ...prev,
        voters: [...prev.voters, { id: crypto.randomUUID(), name, allocations }],
      }
    })
    setNewVoter('')
  }, [newVoter])

  const updateAllocation = useCallback((voterId: string, optionId: string, votes: number) => {
    setData((prev) => {
      const updatedVoters = prev.voters.map((voter) =>
        voter.id === voterId
          ? {
              ...voter,
              allocations: { ...voter.allocations, [optionId]: Math.max(0, votes) },
            }
          : voter,
      )

      // Recompute total votes per option across all voters
      const updatedOptions = prev.options.map((opt) => ({
        ...opt,
        votes: updatedVoters.reduce((sum, v) => sum + (v.allocations[opt.id] ?? 0), 0),
      }))

      return { ...prev, voters: updatedVoters, options: updatedOptions }
    })
  }, [])

  const updateTotalVotes = useCallback((value: number) => {
    setData((prev) => ({ ...prev, totalVotesPerPerson: Math.max(1, value) }))
  }, [])

  // Sort options by total votes descending for results display
  const sortedResults = [...data.options].sort((a, b) => b.votes - a.votes)

  return (
    <FormShell
      projectId={projectId}
      stepNumber={stepNumber}
      formType="weighted_voting"
      title="Weighted Voting"
      description="Allocate a fixed number of votes across options to surface group priorities. Each voter distributes their votes across the options as they see fit."
      required
      data={data as unknown as Record<string, unknown>}
    >
      <WeightedVotingFields
        data={data}
        sortedResults={sortedResults}
        newOption={newOption}
        setNewOption={setNewOption}
        newVoter={newVoter}
        setNewVoter={setNewVoter}
        addOption={addOption}
        addVoter={addVoter}
        updateAllocation={updateAllocation}
        updateTotalVotes={updateTotalVotes}
      />
    </FormShell>
  )
}

/* ---- Inner fields component (reads view mode from context) ---- */

type WeightedVotingFieldsProps = {
  data: WeightedVotingData
  sortedResults: WeightedVotingData['options']
  newOption: string
  setNewOption: (v: string) => void
  newVoter: string
  setNewVoter: (v: string) => void
  addOption: () => void
  addVoter: () => void
  updateAllocation: (voterId: string, optionId: string, votes: number) => void
  updateTotalVotes: (value: number) => void
}

const WeightedVotingFields = ({
  data,
  sortedResults,
  newOption,
  setNewOption,
  newVoter,
  setNewVoter,
  addOption,
  addVoter,
  updateAllocation,
  updateTotalVotes,
}: WeightedVotingFieldsProps) => {
  const mode = useFormViewMode()
  const isView = mode === 'view'

  if (isView) {
    return (
      <div className="space-y-6">
        {/* Config summary */}
        <div className="flex gap-3 text-xs text-[var(--color-text-secondary)]">
          <span>Votes per person: {data.totalVotesPerPerson}</span>
          <span>Options: {data.options.length}</span>
          <span>Voters: {data.voters.length}</span>
        </div>

        {/* Results table */}
        {data.options.length > 0 && data.voters.length > 0 ? (
          <div className="space-y-2">
            <span className="text-sm font-medium text-[var(--color-text-primary)]">Results</span>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    <th className="pb-2 text-left text-xs font-medium text-[var(--color-text-tertiary)]">
                      Option
                    </th>
                    {data.voters.map((voter) => (
                      <th
                        key={voter.id}
                        className="pb-2 text-center text-xs font-medium text-[var(--color-text-tertiary)]"
                      >
                        {voter.name}
                      </th>
                    ))}
                    <th className="pb-2 text-center text-xs font-medium text-[var(--color-text-primary)]">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedResults.map((option, idx) => (
                    <tr
                      key={option.id}
                      className={`border-b border-[var(--color-border)] ${idx === 0 ? 'bg-[var(--color-success-subtle)]' : ''}`}
                    >
                      <td className="py-2 pr-4 text-[var(--color-text-primary)]">{option.text}</td>
                      {data.voters.map((voter) => (
                        <td
                          key={voter.id}
                          className="py-2 text-center text-[var(--color-text-secondary)]"
                        >
                          {voter.allocations[option.id] ?? 0}
                        </td>
                      ))}
                      <td className="py-2 text-center font-semibold text-[var(--color-text-primary)]">
                        {option.votes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="text-sm italic text-[var(--color-text-tertiary)]">
            No voting data recorded yet.
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Total votes config */}
      <Card>
        <CardContent className="space-y-3 pt-6">
          <Label htmlFor="total-votes">Total votes per person</Label>
          <Input
            id="total-votes"
            type="number"
            min={1}
            value={data.totalVotesPerPerson}
            onChange={(e) => updateTotalVotes(parseInt(e.target.value, 10) || 1)}
            className="w-32"
          />
        </CardContent>
      </Card>

      {/* Add options */}
      <Card>
        <CardContent className="space-y-3 pt-6">
          <Label>Add an option</Label>
          <div className="flex gap-2">
            <Input
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              placeholder="Option text..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addOption()
                }
              }}
              className="flex-1"
            />
            <Button type="button" onClick={addOption}>
              <Plus size={14} />
              Add
            </Button>
          </div>
          {data.options.length > 0 && (
            <ol className="space-y-1">
              {data.options.map((opt, idx) => (
                <li key={opt.id} className="flex items-center gap-2 text-sm">
                  <span className="text-xs text-[var(--color-text-tertiary)]">{idx + 1}.</span>
                  <span className="text-[var(--color-text-primary)]">{opt.text}</span>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>

      {/* Add voters */}
      <Card>
        <CardContent className="space-y-3 pt-6">
          <Label>Add a voter</Label>
          <div className="flex gap-2">
            <Input
              value={newVoter}
              onChange={(e) => setNewVoter(e.target.value)}
              placeholder="Voter name..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addVoter()
                }
              }}
              className="flex-1"
            />
            <Button type="button" onClick={addVoter}>
              <Plus size={14} />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Vote allocation grid */}
      {data.options.length > 0 && data.voters.length > 0 && (
        <div className="space-y-4">
          <span className="text-sm font-medium text-[var(--color-text-primary)]">
            Vote Allocations
          </span>
          {data.voters.map((voter) => {
            const voterTotal = Object.values(voter.allocations).reduce((sum, v) => sum + v, 0)
            const isOverBudget = voterTotal > data.totalVotesPerPerson
            return (
              <div
                key={voter.id}
                className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">
                    {voter.name}
                  </span>
                  <span
                    className={`text-xs ${isOverBudget ? 'text-[var(--color-error)]' : 'text-[var(--color-text-tertiary)]'}`}
                  >
                    {voterTotal} / {data.totalVotesPerPerson} votes used
                    {isOverBudget && ' (over budget)'}
                  </span>
                </div>
                <div className="space-y-2">
                  {data.options.map((opt) => (
                    <div key={opt.id} className="flex items-center gap-3">
                      <span className="flex-1 text-sm text-[var(--color-text-secondary)]">
                        {opt.text}
                      </span>
                      <Input
                        type="number"
                        min={0}
                        max={data.totalVotesPerPerson}
                        value={voter.allocations[opt.id] ?? 0}
                        onChange={(e) =>
                          updateAllocation(voter.id, opt.id, parseInt(e.target.value, 10) || 0)
                        }
                        className="w-20 text-center"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Results summary */}
      {sortedResults.length > 0 && (
        <div className="space-y-2 rounded-[var(--radius-md)] border border-[var(--color-border)] p-4">
          <span className="text-sm font-medium text-[var(--color-text-primary)]">
            Results Summary
          </span>
          <ol className="space-y-1">
            {sortedResults.map((option, idx) => (
              <li key={option.id} className="flex items-center gap-3 text-sm">
                <span className="w-5 text-right text-xs font-semibold text-[var(--color-text-tertiary)]">
                  {idx + 1}.
                </span>
                <span className="flex-1 text-[var(--color-text-primary)]">{option.text}</span>
                <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
                  {option.votes} votes
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}
