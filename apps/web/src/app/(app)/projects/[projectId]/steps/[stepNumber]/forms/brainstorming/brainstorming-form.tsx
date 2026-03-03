'use client'

import { useCallback, useState } from 'react'
import { FormShell } from '@/components/pips/form-shell'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Plus, ThumbsUp, Eye, EyeOff, Check, X } from 'lucide-react'
import type { BrainstormingData } from '@/lib/form-schemas'

const DEFAULTS: BrainstormingData = {
  ideas: [],
  selectedIdeas: [],
  eliminatedIdeas: [],
}

type Props = {
  projectId: string
  stepNumber: number
  initialData: Record<string, unknown> | null
}

export const BrainstormingForm = ({ projectId, stepNumber, initialData }: Props) => {
  const [data, setData] = useState<BrainstormingData>({
    ...DEFAULTS,
    ...(initialData as Partial<BrainstormingData>),
  })
  const [newIdea, setNewIdea] = useState('')
  const [newAuthor, setNewAuthor] = useState('')
  const [showEliminated, setShowEliminated] = useState(false)

  const addIdea = useCallback(() => {
    const text = newIdea.trim()
    if (!text) return
    const idea = {
      id: crypto.randomUUID(),
      text,
      author: newAuthor.trim(),
      votes: 0,
      category: '',
    }
    setData((prev) => ({ ...prev, ideas: [...prev.ideas, idea] }))
    setNewIdea('')
  }, [newIdea, newAuthor])

  const vote = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      ideas: prev.ideas.map((i) => (i.id === id ? { ...i, votes: i.votes + 1 } : i)),
    }))
  }, [])

  const toggleSelected = useCallback((id: string) => {
    setData((prev) => {
      const isSelected = prev.selectedIdeas.includes(id)
      return {
        ...prev,
        selectedIdeas: isSelected
          ? prev.selectedIdeas.filter((sid) => sid !== id)
          : [...prev.selectedIdeas, id],
        // Remove from eliminated if selecting
        eliminatedIdeas: isSelected
          ? prev.eliminatedIdeas
          : prev.eliminatedIdeas.filter((eid) => eid !== id),
      }
    })
  }, [])

  const toggleEliminated = useCallback((id: string) => {
    setData((prev) => {
      const isEliminated = prev.eliminatedIdeas.includes(id)
      return {
        ...prev,
        eliminatedIdeas: isEliminated
          ? prev.eliminatedIdeas.filter((eid) => eid !== id)
          : [...prev.eliminatedIdeas, id],
        // Remove from selected if eliminating
        selectedIdeas: isEliminated
          ? prev.selectedIdeas
          : prev.selectedIdeas.filter((sid) => sid !== id),
      }
    })
  }, [])

  const updateCategory = useCallback((id: string, category: string) => {
    setData((prev) => ({
      ...prev,
      ideas: prev.ideas.map((i) => (i.id === id ? { ...i, category } : i)),
    }))
  }, [])

  const activeIdeas = data.ideas.filter((i) => !data.eliminatedIdeas.includes(i.id))
  const eliminatedIdeas = data.ideas.filter((i) => data.eliminatedIdeas.includes(i.id))
  const sortedActive = [...activeIdeas].sort((a, b) => b.votes - a.votes)

  return (
    <FormShell
      projectId={projectId}
      stepNumber={stepNumber}
      formType="brainstorming"
      title="Brainstorming"
      description="Generate as many ideas as possible. No judgment at this stage — quantity over quality. Vote and group after."
      required
      data={data as unknown as Record<string, unknown>}
    >
      <div className="space-y-6">
        {/* Add Idea */}
        <Card>
          <CardContent className="space-y-3 pt-6">
            <Label>Add a new idea</Label>
            <div className="flex gap-2">
              <Input
                value={newIdea}
                onChange={(e) => setNewIdea(e.target.value)}
                placeholder="Type your idea here..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addIdea()
                  }
                }}
                className="flex-1"
              />
              <Input
                value={newAuthor}
                onChange={(e) => setNewAuthor(e.target.value)}
                placeholder="Author (optional)"
                className="w-40"
              />
              <Button type="button" onClick={addIdea}>
                <Plus size={14} />
                Add
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="flex gap-3 text-xs text-[var(--color-text-secondary)]">
          <span>Total: {data.ideas.length}</span>
          <span>Active: {activeIdeas.length}</span>
          <span>Selected: {data.selectedIdeas.length}</span>
          <span>Eliminated: {data.eliminatedIdeas.length}</span>
        </div>

        {/* Idea cards */}
        <div className="space-y-2">
          {sortedActive.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              isSelected={data.selectedIdeas.includes(idea.id)}
              onVote={() => vote(idea.id)}
              onToggleSelected={() => toggleSelected(idea.id)}
              onToggleEliminated={() => toggleEliminated(idea.id)}
              onUpdateCategory={(cat) => updateCategory(idea.id, cat)}
            />
          ))}
        </div>

        {/* Show/hide eliminated */}
        {eliminatedIdeas.length > 0 && (
          <div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowEliminated(!showEliminated)}
            >
              {showEliminated ? <EyeOff size={14} /> : <Eye size={14} />}
              {showEliminated ? 'Hide' : 'Show'} eliminated ({eliminatedIdeas.length})
            </Button>
            {showEliminated && (
              <div className="mt-2 space-y-2 opacity-60">
                {eliminatedIdeas.map((idea) => (
                  <IdeaCard
                    key={idea.id}
                    idea={idea}
                    isSelected={false}
                    onVote={() => vote(idea.id)}
                    onToggleSelected={() => toggleSelected(idea.id)}
                    onToggleEliminated={() => toggleEliminated(idea.id)}
                    onUpdateCategory={(cat) => updateCategory(idea.id, cat)}
                    eliminated
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </FormShell>
  )
}

/* ---- Idea card sub-component ---- */

type IdeaCardProps = {
  idea: BrainstormingData['ideas'][number]
  isSelected: boolean
  onVote: () => void
  onToggleSelected: () => void
  onToggleEliminated: () => void
  onUpdateCategory: (cat: string) => void
  eliminated?: boolean
}

const IdeaCard = ({
  idea,
  isSelected,
  onVote,
  onToggleSelected,
  onToggleEliminated,
  onUpdateCategory,
  eliminated = false,
}: IdeaCardProps) => (
  <div
    className={`flex items-start gap-3 rounded-[var(--radius-md)] border p-3 ${
      isSelected
        ? 'border-[var(--color-success)] bg-[var(--color-success-subtle)]'
        : eliminated
          ? 'border-[var(--color-border)] bg-[var(--color-surface-secondary)] line-through'
          : 'border-[var(--color-border)]'
    }`}
  >
    {/* Vote button */}
    <button
      type="button"
      onClick={onVote}
      className="flex flex-col items-center gap-0.5 rounded p-1 hover:bg-[var(--color-surface-secondary)]"
    >
      <ThumbsUp size={14} className="text-[var(--color-text-tertiary)]" />
      <span className="text-xs font-semibold">{idea.votes}</span>
    </button>

    {/* Content */}
    <div className="flex-1 space-y-1">
      <p className="text-sm">{idea.text}</p>
      <div className="flex items-center gap-2">
        {idea.author && (
          <span className="text-[10px] text-[var(--color-text-tertiary)]">by {idea.author}</span>
        )}
        <Input
          value={idea.category}
          onChange={(e) => onUpdateCategory(e.target.value)}
          placeholder="Category"
          className="h-5 w-24 border-none bg-transparent px-1 text-[10px] shadow-none focus-visible:ring-0"
        />
      </div>
    </div>

    {/* Actions */}
    <div className="flex gap-1">
      <Button type="button" variant="ghost" size="icon-xs" onClick={onToggleSelected} title="Keep">
        <Check size={12} className={isSelected ? 'text-[var(--color-success)]' : ''} />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={onToggleEliminated}
        title="Eliminate"
      >
        <X size={12} className={eliminated ? 'text-[var(--color-error)]' : ''} />
      </Button>
    </div>
  </div>
)
