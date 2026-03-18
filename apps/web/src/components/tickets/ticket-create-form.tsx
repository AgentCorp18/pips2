'use client'

import { useActionState, useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RichTextEditorLazy as RichTextEditor } from '@/components/ui/rich-text-editor-lazy'
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
import { ChevronDown, ChevronUp, Zap } from 'lucide-react'
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
  initialExpanded?: boolean
}

/* ============================================================
   Component
   ============================================================ */

const initialState: TicketActionState = {}

export const TicketCreateForm = ({
  members,
  projects,
  parentId,
  initialExpanded = false,
}: TicketCreateFormProps) => {
  const router = useRouter()
  const hasRedirected = useRef(false)
  const descriptionRef = useRef<HTMLTextAreaElement>(null)
  const [descriptionValue, setDescriptionValue] = useState('')
  const [state, formAction, pending] = useActionState(createTicket, initialState)
  const [expanded, setExpanded] = useState(initialExpanded)

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
    if (state.error) {
      toast.error(state.error)
    }
    if (state.fieldErrors && Object.keys(state.fieldErrors).length > 0) {
      toast.error(state.fieldErrors.title ?? 'Please fix the form errors')
    }
  }, [state, router])

  return (
    <div className="space-y-6">
      {/* Quick Create */}
      <div
        className="rounded-[var(--radius-lg)] border border-[var(--color-border)] p-4"
        data-testid="quick-create-section"
      >
        <div className="mb-3 flex items-center gap-2">
          <Zap size={16} style={{ color: 'var(--color-accent)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
            Quick Create
          </span>
        </div>
        <form action={formAction} className="flex items-center gap-2">
          <input type="hidden" name="type" value="task" />
          <input type="hidden" name="priority" value="medium" />
          <input type="hidden" name="status" value="backlog" />
          {parentId && <input type="hidden" name="parent_id" value={parentId} />}
          <Input
            name="title"
            placeholder="What needs to be done?"
            className="flex-1"
            data-testid="quick-create-title-input"
            required
          />
          <Button type="submit" disabled={pending} data-testid="quick-create-submit">
            {pending ? 'Creating...' : 'Create'}
          </Button>
        </form>
      </div>

      {/* Toggle full form */}
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex items-center gap-1 text-sm font-medium"
        style={{ color: 'var(--color-primary)' }}
        data-testid="toggle-full-form"
      >
        {expanded ? (
          <>
            <ChevronUp size={16} />
            Hide full form
          </>
        ) : (
          <>
            <ChevronDown size={16} />
            Show full form
          </>
        )}
      </button>

      {/* Full form */}
      {expanded && (
        <form action={formAction} className="space-y-5" data-testid="full-create-form">
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
            <Label htmlFor="title" required>
              Title
            </Label>
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
            <input type="hidden" id="description" name="description" value={descriptionValue} />
            {/* Hidden textarea for AiAssistButton to read current value */}
            <textarea
              ref={descriptionRef}
              value={descriptionValue}
              readOnly
              className="hidden"
              aria-hidden="true"
              tabIndex={-1}
              onChange={() => {}}
            />
            <RichTextEditor
              content={descriptionValue}
              onChange={setDescriptionValue}
              placeholder="Detailed description..."
              data-testid="ticket-description-input"
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
              <Select name="type" defaultValue="task">
                <SelectTrigger
                  className="w-full"
                  aria-label="Type"
                  data-testid="ticket-type-select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="task">Task</SelectItem>
                  <SelectItem value="bug">Bug</SelectItem>
                  <SelectItem value="feature">Feature</SelectItem>
                  <SelectItem value="pips_project">PIPS Project</SelectItem>
                  <SelectItem value="ceo_request">CEO Request</SelectItem>
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

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => router.back()}
              data-testid="cancel-ticket-button"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending} data-testid="create-ticket-button">
              {pending ? 'Creating...' : 'Create Ticket'}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
