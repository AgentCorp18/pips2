'use client'

import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FormShell } from '@/components/pips/form-shell'
import { useFormViewMode } from '@/components/pips/form-view-context'
import { saveFormData } from '../actions'
import type { RaciData } from '@/lib/form-schemas'
import { cn } from '@/lib/utils'

type RaciValue = 'R' | 'A' | 'C' | 'I' | ''

type Props = {
  projectId: string
  initialData: RaciData | null
}

/* Internal types with stable IDs for React keys */

type InternalItem = {
  id: string
  value: string
}

/**
 * Internal matrix keyed by activityId -> personId -> RaciValue.
 * This avoids corruption when duplicate names exist.
 */
type InternalMatrix = Record<string, Record<string, RaciValue>>

type InternalData = {
  activities: InternalItem[]
  people: InternalItem[]
  matrix: InternalMatrix
}

/* Helpers to convert between schema format and internal format */

const toInternal = (data: RaciData): InternalData => {
  const activities: InternalItem[] = data.activities.map((v) => ({
    id: crypto.randomUUID(),
    value: v,
  }))
  const people: InternalItem[] = data.people.map((v) => ({
    id: crypto.randomUUID(),
    value: v,
  }))

  const activityNameToId = new Map(activities.map((a) => [a.value, a.id]))
  const personNameToId = new Map(people.map((p) => [p.value, p.id]))

  const matrix: InternalMatrix = {}
  for (const [activityName, assignments] of Object.entries(data.matrix)) {
    const activityId = activityNameToId.get(activityName)
    if (activityId === undefined) continue
    matrix[activityId] = {}
    for (const [personName, raciVal] of Object.entries(assignments)) {
      const personId = personNameToId.get(personName)
      if (personId !== undefined) {
        matrix[activityId][personId] = raciVal as RaciValue
      }
    }
  }

  return { activities, people, matrix }
}

const fromInternal = (internal: InternalData): RaciData => {
  const activityIdToName = new Map(internal.activities.map((a) => [a.id, a.value]))
  const personIdToName = new Map(internal.people.map((p) => [p.id, p.value]))

  const activities = internal.activities.map((a) => a.value)
  const people = internal.people.map((p) => p.value)

  const matrix: RaciData['matrix'] = {}
  for (const [activityId, assignments] of Object.entries(internal.matrix)) {
    const activityName = activityIdToName.get(activityId)
    if (activityName === undefined) continue
    matrix[activityName] = {}
    for (const [personId, raciVal] of Object.entries(assignments)) {
      const personName = personIdToName.get(personId)
      if (personName !== undefined) {
        matrix[activityName][personName] = raciVal
      }
    }
  }

  return { activities, people, matrix }
}

const makeDefaultInternal = (): InternalData => ({
  activities: [{ id: crypto.randomUUID(), value: '' }],
  people: [{ id: crypto.randomUUID(), value: '' }],
  matrix: {},
})

const raciColors: Record<string, string> = {
  R: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  A: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  C: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  I: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
}

const raciLabels: Record<string, string> = {
  R: 'Responsible',
  A: 'Accountable',
  C: 'Consulted',
  I: 'Informed',
}

export const RaciForm = ({ projectId, initialData }: Props) => {
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
      'raci',
      schemaData as unknown as Record<string, unknown>,
    )
    if (result.error) {
      toast.error(result.error)
      return { error: result.error }
    }
    setDirty(false)
    return { success: true }
  }, [projectId, internal])

  const addActivity = () => {
    update({
      ...internal,
      activities: [...internal.activities, { id: crypto.randomUUID(), value: '' }],
    })
  }

  const removeActivity = (id: string) => {
    const matrix = { ...internal.matrix }
    delete matrix[id]
    update({
      ...internal,
      activities: internal.activities.filter((a) => a.id !== id),
      matrix,
    })
  }

  const updateActivity = (id: string, value: string) => {
    update({
      ...internal,
      activities: internal.activities.map((a) => (a.id === id ? { ...a, value } : a)),
    })
  }

  const addPerson = () => {
    update({ ...internal, people: [...internal.people, { id: crypto.randomUUID(), value: '' }] })
  }

  const removePerson = (id: string) => {
    const matrix: InternalMatrix = {}
    for (const [activityId, assignments] of Object.entries(internal.matrix)) {
      const copy = { ...assignments }
      delete copy[id]
      matrix[activityId] = copy
    }
    update({
      ...internal,
      people: internal.people.filter((p) => p.id !== id),
      matrix,
    })
  }

  const updatePerson = (id: string, value: string) => {
    update({
      ...internal,
      people: internal.people.map((p) => (p.id === id ? { ...p, value } : p)),
    })
  }

  const setRaci = (activityId: string, personId: string, value: RaciValue) => {
    const activityRow = internal.matrix[activityId] ?? {}
    update({
      ...internal,
      matrix: {
        ...internal.matrix,
        [activityId]: { ...activityRow, [personId]: value },
      },
    })
  }

  const getRaci = (activityId: string, personId: string): RaciValue =>
    internal.matrix[activityId]?.[personId] ?? ''

  return (
    <FormShell
      title="RACI Chart"
      description="Assign clear roles for each activity: Responsible, Accountable, Consulted, Informed."
      stepNumber={4}
      onSave={handleSave}
      isDirty={dirty}
    >
      <RaciFields
        internal={internal}
        getRaci={getRaci}
        setRaci={setRaci}
        updateActivity={updateActivity}
        removeActivity={removeActivity}
        addActivity={addActivity}
        updatePerson={updatePerson}
        removePerson={removePerson}
        addPerson={addPerson}
      />
    </FormShell>
  )
}

/* ---- Inner fields component (reads view mode from context) ---- */

type RaciFieldsProps = {
  internal: InternalData
  getRaci: (activityId: string, personId: string) => RaciValue
  setRaci: (activityId: string, personId: string, value: RaciValue) => void
  updateActivity: (id: string, value: string) => void
  removeActivity: (id: string) => void
  addActivity: () => void
  updatePerson: (id: string, value: string) => void
  removePerson: (id: string) => void
  addPerson: () => void
}

const RaciFields = ({
  internal,
  getRaci,
  setRaci,
  updateActivity,
  removeActivity,
  addActivity,
  updatePerson,
  removePerson,
  addPerson,
}: RaciFieldsProps) => {
  const mode = useFormViewMode()
  const isView = mode === 'view'

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(raciLabels).map(([key, label]) => (
          <div
            key={key}
            className={cn('rounded-md px-2 py-1 text-xs font-medium', raciColors[key])}
          >
            <span className="font-bold">{key}</span> = {label}
          </div>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        {isView
          ? 'RACI assignments for each activity and team member.'
          : 'List your activities (tasks) as rows and team members as columns. Select the appropriate RACI role for each person per activity.'}
      </p>

      {/* RACI Matrix */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">Activity</TableHead>
              {internal.people.map((person) => (
                <TableHead key={person.id} className="min-w-[130px]">
                  {isView ? (
                    <span className="text-xs font-medium">{person.value || 'Unnamed'}</span>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Input
                        value={person.value}
                        onChange={(e) => updatePerson(person.id, e.target.value)}
                        placeholder="Person"
                        className="h-7 text-xs"
                      />
                      {internal.people.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => removePerson(person.id)}
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
            {internal.activities.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell>
                  {isView ? (
                    <span className="text-xs font-medium text-[var(--color-text-primary)]">
                      {activity.value || 'Unnamed activity'}
                    </span>
                  ) : (
                    <Input
                      value={activity.value}
                      onChange={(e) => updateActivity(activity.id, e.target.value)}
                      placeholder="Activity / task"
                      className="h-7 text-xs"
                    />
                  )}
                </TableCell>
                {internal.people.map((person) => (
                  <TableCell key={person.id}>
                    {isView ? (
                      <RaciViewCell value={getRaci(activity.id, person.id)} />
                    ) : (
                      <RaciSelect
                        value={getRaci(activity.id, person.id)}
                        onChange={(v) => setRaci(activity.id, person.id, v)}
                      />
                    )}
                  </TableCell>
                ))}
                {!isView && (
                  <TableCell>
                    {internal.activities.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => removeActivity(activity.id)}
                      >
                        <Trash2 className="size-3 text-muted-foreground" />
                      </Button>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Action buttons */}
      {!isView && (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={addActivity}>
            <Plus className="size-4" />
            Add Activity
          </Button>
          <Button variant="outline" size="sm" onClick={addPerson}>
            <Plus className="size-4" />
            Add Person
          </Button>
        </div>
      )}
    </div>
  )
}

/* ---- RACI View Cell ---- */

const RaciViewCell = ({ value }: { value: RaciValue }) => {
  if (!value) return <span className="text-xs text-muted-foreground">-</span>
  return (
    <span className={cn('rounded-md px-2 py-0.5 text-xs font-bold', raciColors[value])}>
      {value}
    </span>
  )
}

/* ---- RACI Select Sub-component ---- */

const RaciSelect = ({
  value,
  onChange,
}: {
  value: RaciValue
  onChange: (v: RaciValue) => void
}) => (
  <Select
    value={value || '_empty'}
    onValueChange={(v) => onChange(v === '_empty' ? '' : (v as RaciValue))}
  >
    <SelectTrigger
      size="sm"
      className={cn('h-7 w-full text-xs font-medium', value && raciColors[value])}
    >
      <SelectValue placeholder="-" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="_empty">
        <span className="text-muted-foreground">-</span>
      </SelectItem>
      {(['R', 'A', 'C', 'I'] as const).map((v) => (
        <SelectItem key={v} value={v}>
          <span className={cn('font-medium', raciColors[v])}>
            {v} &mdash; {raciLabels[v]}
          </span>
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
)
