'use client'

import { useActionState, useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { AiAssistButton } from '@/components/ui/ai-assist-button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { createTicket, type TicketActionState } from '@/app/(app)/tickets/actions'

/* ============================================================
   Types
   ============================================================ */

type OrgMember = {
  user_id: string
  display_name: string
}

type Project = {
  id: string
  name: string
}

type TicketCreateFormProps = {
  members: OrgMember[]
  projects: Project[]
  parentId?: string
}

/* ============================================================
   Component
   ============================================================ */

const initialState: TicketActionState = {}

export const TicketCreateForm = ({ members, projects, parentId }: TicketCreateFormProps) => {
  const router = useRouter()
  const hasRedirected = useRef(false)
  const descriptionRef = useRef<HTMLTextAreaElement>(null)
  const [descriptionValue, setDescriptionValue] = useState('')
  const [state, formAction, pending] = useActionState(createTicket, initialState)

  const handleDescriptionAccept = useCallback((text: string) => {
    setDescriptionValue(text)
    if (descriptionRef.current) {
      descriptionRef.current.value = text
    }
  }, [])

  useEffect(() => {
    if (state.success && state.redirectTo && !hasRedirected.current) {
      hasRedirected.current = true
      toast.success('Ticket created')
      router.push(state.redirectTo)
    }
  }, [state, router])

  return (
    <form action={formAction} className="space-y-5">
      {parentId && <input type="hidden" name="parent_id" value={parentId} />}

      {state.error && (
        <div
          role="alert"
          className="rounded-md border px-4 py-3 text-sm"
          style={{
            borderColor: 'var(--color-error)',
            backgroundColor: 'rgba(239, 68, 68, 0.05)',
            color: 'var(--color-error)',
          }}
        >
          {state.error}
        </div>
      )}

      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          name="title"
          data-testid="ticket-title-input"
          placeholder="Brief summary of the ticket"
          aria-invalid={!!state.fieldErrors?.title}
          aria-describedby={state.fieldErrors?.title ? 'title-error' : undefined}
          aria-required="true"
          required
        />
        {state.fieldErrors?.title && (
          <p id="title-error" className="text-xs" style={{ color: 'var(--color-error)' }}>
            {state.fieldErrors.title}
          </p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1">
          <Label htmlFor="description">Description</Label>
          <AiAssistButton
            fieldRef={descriptionRef}
            fieldType="ticket_description"
            onAccept={handleDescriptionAccept}
          />
        </div>
        <Textarea
          ref={descriptionRef}
          id="description"
          name="description"
          data-testid="ticket-description-input"
          placeholder="Detailed description..."
          aria-describedby={state.fieldErrors?.description ? 'description-error' : undefined}
          rows={4}
          value={descriptionValue}
          onChange={(e) => setDescriptionValue(e.target.value)}
        />
        {state.fieldErrors?.description && (
          <p id="description-error" className="text-xs" style={{ color: 'var(--color-error)' }}>
            {state.fieldErrors.description}
          </p>
        )}
      </div>

      {/* Row: Type + Priority + Status */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label>Type</Label>
          <Select name="type" defaultValue="general">
            <SelectTrigger className="w-full" aria-label="Type" data-testid="ticket-type-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="task">Task</SelectItem>
              <SelectItem value="bug">Bug</SelectItem>
              <SelectItem value="feature">Feature</SelectItem>
              <SelectItem value="pips_project">PIPS Project</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Priority</Label>
          <Select name="priority" defaultValue="medium">
            <SelectTrigger
              className="w-full"
              aria-label="Priority"
              data-testid="ticket-priority-select"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="none">None</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select name="status" defaultValue="backlog">
            <SelectTrigger
              className="w-full"
              aria-label="Status"
              data-testid="ticket-status-select"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="backlog">Backlog</SelectItem>
              <SelectItem value="todo">Todo</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Row: Assignee + Project */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Assignee</Label>
          <Select name="assignee_id">
            <SelectTrigger
              className="w-full"
              aria-label="Assignee"
              data-testid="ticket-assignee-select"
            >
              <SelectValue placeholder="Unassigned" />
            </SelectTrigger>
            <SelectContent>
              {members.map((m) => (
                <SelectItem key={m.user_id} value={m.user_id}>
                  {m.display_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Project</Label>
          <Select name="project_id">
            <SelectTrigger
              className="w-full"
              aria-label="Project"
              data-testid="ticket-project-select"
            >
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Row: Due date + Tags */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="due_date">Due Date</Label>
          <DatePicker
            id="due_date"
            name="due_date"
            aria-describedby={state.fieldErrors?.due_date ? 'due-date-error' : undefined}
          />
          {state.fieldErrors?.due_date && (
            <p id="due-date-error" className="text-xs" style={{ color: 'var(--color-error)' }}>
              {state.fieldErrors.due_date}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="tags">Tags</Label>
          <Input
            id="tags"
            name="tags"
            data-testid="ticket-tags-input"
            placeholder="Comma-separated tags"
          />
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" disabled={pending} data-testid="create-ticket-button">
          {pending ? 'Creating...' : 'Create Ticket'}
        </Button>
      </div>
    </form>
  )
}
