'use client'

import { useCallback, useState } from 'react'
import { FormShell } from '@/components/pips/form-shell'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2 } from 'lucide-react'
import type { BrainwritingData } from '@/lib/form-schemas'

const DEFAULTS: BrainwritingData = {
  rounds: [],
  allIdeas: [],
}

type Props = {
  projectId: string
  stepNumber: number
  initialData: Record<string, unknown> | null
}

export const BrainwritingForm = ({ projectId, stepNumber, initialData }: Props) => {
  const [data, setData] = useState<BrainwritingData>({
    ...DEFAULTS,
    ...(initialData as Partial<BrainwritingData>),
  })

  /** Flatten all ideas from all rounds */
  const rebuildAllIdeas = useCallback(
    (rounds: BrainwritingData['rounds']): string[] =>
      rounds.flatMap((r) => r.entries.flatMap((e) => e.ideas.filter((i) => i.trim() !== ''))),
    [],
  )

  const addRound = useCallback(() => {
    setData((prev) => {
      const nextRound = {
        roundNumber: prev.rounds.length + 1,
        entries: [],
      }
      return { ...prev, rounds: [...prev.rounds, nextRound] }
    })
  }, [])

  const removeRound = useCallback(
    (roundIndex: number) => {
      setData((prev) => {
        const rounds = prev.rounds
          .filter((_, i) => i !== roundIndex)
          .map((r, i) => ({
            ...r,
            roundNumber: i + 1,
          }))
        return { ...prev, rounds, allIdeas: rebuildAllIdeas(rounds) }
      })
    },
    [rebuildAllIdeas],
  )

  const addParticipant = useCallback((roundIndex: number) => {
    setData((prev) => {
      const rounds = [...prev.rounds]
      const round = rounds[roundIndex]
      if (!round) return prev
      rounds[roundIndex] = {
        ...round,
        entries: [...round.entries, { participant: '', ideas: ['', '', ''] }],
      }
      return { ...prev, rounds }
    })
  }, [])

  const removeParticipant = useCallback(
    (roundIndex: number, entryIndex: number) => {
      setData((prev) => {
        const rounds = [...prev.rounds]
        const round = rounds[roundIndex]
        if (!round) return prev
        rounds[roundIndex] = {
          ...round,
          entries: round.entries.filter((_, i) => i !== entryIndex),
        }
        return { ...prev, rounds, allIdeas: rebuildAllIdeas(rounds) }
      })
    },
    [rebuildAllIdeas],
  )

  const updateParticipantName = useCallback(
    (roundIndex: number, entryIndex: number, name: string) => {
      setData((prev) => {
        const rounds = [...prev.rounds]
        const round = rounds[roundIndex]
        if (!round) return prev
        const entries = [...round.entries]
        const entry = entries[entryIndex]
        if (!entry) return prev
        entries[entryIndex] = { ...entry, participant: name }
        rounds[roundIndex] = { ...round, entries }
        return { ...prev, rounds }
      })
    },
    [],
  )

  const updateIdea = useCallback(
    (roundIndex: number, entryIndex: number, ideaIndex: number, value: string) => {
      setData((prev) => {
        const rounds = [...prev.rounds]
        const round = rounds[roundIndex]
        if (!round) return prev
        const entries = [...round.entries]
        const entry = entries[entryIndex]
        if (!entry) return prev
        const ideas = [...entry.ideas]
        ideas[ideaIndex] = value
        entries[entryIndex] = { ...entry, ideas }
        rounds[roundIndex] = { ...round, entries }
        return { ...prev, rounds, allIdeas: rebuildAllIdeas(rounds) }
      })
    },
    [rebuildAllIdeas],
  )

  return (
    <FormShell
      projectId={projectId}
      stepNumber={stepNumber}
      formType="brainwriting"
      title="Brainwriting (6-3-5)"
      description="Silent written idea generation. Each participant writes 3 ideas per round, then passes to the next person to build upon."
      data={data as unknown as Record<string, unknown>}
    >
      <div className="space-y-6">
        <p className="text-xs text-[var(--color-text-tertiary)]">
          In classic 6-3-5 brainwriting, 6 participants each write 3 ideas in 5 minutes per round.
          Adapt as needed for your team size.
        </p>

        {/* Rounds */}
        {data.rounds.map((round, ri) => (
          <Card key={ri}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm">
                  Round {round.roundNumber}
                  <Badge variant="secondary" className="text-[10px]">
                    {round.entries.length} participant{round.entries.length !== 1 ? 's' : ''}
                  </Badge>
                </CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => removeRound(ri)}
                >
                  <Trash2 size={12} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {round.entries.map((entry, ei) => (
                <div
                  key={ei}
                  className="space-y-2 rounded-[var(--radius-md)] border border-[var(--color-border)] p-3"
                >
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">Participant:</Label>
                    <Input
                      value={entry.participant}
                      onChange={(e) => updateParticipantName(ri, ei, e.target.value)}
                      placeholder="Name"
                      className="h-7 text-xs"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => removeParticipant(ri, ei)}
                    >
                      <Trash2 size={10} />
                    </Button>
                  </div>
                  <div className="space-y-1.5">
                    {entry.ideas.map((idea, ii) => (
                      <div key={ii} className="flex items-center gap-2">
                        <span className="text-[10px] text-[var(--color-text-tertiary)] w-4">
                          {ii + 1}.
                        </span>
                        <Input
                          value={idea}
                          onChange={(e) => updateIdea(ri, ei, ii, e.target.value)}
                          placeholder={`Idea ${ii + 1}`}
                          className="h-7 text-xs"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addParticipant(ri)}
                className="w-full"
              >
                <Plus size={12} />
                Add Participant
              </Button>
            </CardContent>
          </Card>
        ))}

        <Button type="button" variant="outline" onClick={addRound}>
          <Plus size={14} />
          Add Round
        </Button>

        {/* All Ideas summary */}
        {data.allIdeas.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">All Ideas ({data.allIdeas.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {data.allIdeas.map((idea, i) => (
                  <li key={i} className="text-sm text-[var(--color-text-secondary)]">
                    {i + 1}. {idea}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </FormShell>
  )
}
