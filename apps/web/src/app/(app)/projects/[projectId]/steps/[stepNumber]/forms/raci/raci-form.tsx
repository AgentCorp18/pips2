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
import { saveFormData } from '../actions'
import type { RaciData } from '@/lib/form-schemas'
import { cn } from '@/lib/utils'

type RaciValue = 'R' | 'A' | 'C' | 'I' | ''

type Props = {
  projectId: string
  initialData: RaciData | null
}

const defaultData: RaciData = {
  activities: [''],
  people: [''],
  matrix: {},
}

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
  const [data, setData] = useState<RaciData>(initialData ?? defaultData)
  const [dirty, setDirty] = useState(false)
  const [saveVersion, setSaveVersion] = useState(0)

  const update = (next: RaciData) => {
    setData(next)
    setDirty(true)
    setSaveVersion((v) => v + 1)
  }

  const handleSave = useCallback(async () => {
    const result = await saveFormData(
      projectId,
      4,
      'raci',
      data as unknown as Record<string, unknown>,
    )
    if (result.error) {
      toast.error(result.error)
      return { error: result.error }
    }
    setDirty(false)
    return { success: true }
  }, [projectId, data])

  const addActivity = () => {
    update({ ...data, activities: [...data.activities, ''] })
  }

  const removeActivity = (idx: number) => {
    const activity = data.activities[idx] ?? ''
    const matrix = { ...data.matrix }
    delete matrix[activity]
    update({
      ...data,
      activities: data.activities.filter((_, i) => i !== idx),
      matrix,
    })
  }

  const updateActivity = (idx: number, value: string) => {
    const oldName = data.activities[idx] ?? ''
    const activities = data.activities.map((a, i) => (i === idx ? value : a))
    const matrix = { ...data.matrix }
    if (oldName !== value && oldName in matrix) {
      matrix[value] = matrix[oldName] ?? {}
      delete matrix[oldName]
    }
    update({ ...data, activities, matrix })
  }

  const addPerson = () => {
    update({ ...data, people: [...data.people, ''] })
  }

  const removePerson = (idx: number) => {
    const person = data.people[idx] ?? ''
    const matrix: RaciData['matrix'] = {}
    for (const [activity, assignments] of Object.entries(data.matrix)) {
      const copy = { ...assignments }
      delete copy[person]
      matrix[activity] = copy
    }
    update({
      ...data,
      people: data.people.filter((_, i) => i !== idx),
      matrix,
    })
  }

  const updatePerson = (idx: number, value: string) => {
    const oldName = data.people[idx] ?? ''
    const people = data.people.map((p, i) => (i === idx ? value : p))
    const matrix: RaciData['matrix'] = {}
    for (const [activity, assignments] of Object.entries(data.matrix)) {
      const copy = { ...assignments }
      if (oldName !== value && oldName in copy) {
        copy[value] = copy[oldName] ?? ''
        delete copy[oldName]
      }
      matrix[activity] = copy
    }
    update({ ...data, people, matrix })
  }

  const setRaci = (activity: string, person: string, value: RaciValue) => {
    const activityRow = data.matrix[activity] ?? {}
    update({
      ...data,
      matrix: {
        ...data.matrix,
        [activity]: { ...activityRow, [person]: value },
      },
    })
  }

  const getRaci = (activity: string, person: string): RaciValue =>
    data.matrix[activity]?.[person] ?? ''

  return (
    <FormShell
      title="RACI Chart"
      description="Assign clear roles for each activity: Responsible, Accountable, Consulted, Informed."
      stepNumber={4}
      onSave={handleSave}
      isDirty={dirty}
      key={saveVersion}
    >
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
          List your activities (tasks) as rows and team members as columns. Select the appropriate
          RACI role for each person per activity.
        </p>

        {/* RACI Matrix */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">Activity</TableHead>
                {data.people.map((person, pIdx) => (
                  <TableHead key={pIdx} className="min-w-[130px]">
                    <div className="flex items-center gap-1">
                      <Input
                        value={person}
                        onChange={(e) => updatePerson(pIdx, e.target.value)}
                        placeholder="Person"
                        className="h-7 text-xs"
                      />
                      {data.people.length > 1 && (
                        <Button variant="ghost" size="icon-xs" onClick={() => removePerson(pIdx)}>
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
              {data.activities.map((activity, aIdx) => (
                <TableRow key={aIdx}>
                  <TableCell>
                    <Input
                      value={activity}
                      onChange={(e) => updateActivity(aIdx, e.target.value)}
                      placeholder="Activity / task"
                      className="h-7 text-xs"
                    />
                  </TableCell>
                  {data.people.map((person, pIdx) => (
                    <TableCell key={pIdx}>
                      <RaciSelect
                        value={getRaci(activity, person)}
                        onChange={(v) => setRaci(activity, person, v)}
                      />
                    </TableCell>
                  ))}
                  <TableCell>
                    {data.activities.length > 1 && (
                      <Button variant="ghost" size="icon-xs" onClick={() => removeActivity(aIdx)}>
                        <Trash2 className="size-3 text-muted-foreground" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Action buttons */}
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
      </div>
    </FormShell>
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
