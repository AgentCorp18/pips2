'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Ticket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { createTicketFromFormContext } from './create-ticket-from-form-action'

type CreateTicketFromFormProps = {
  projectId: string
  stepNumber: number
  formTitle: string
}

export const CreateTicketFromForm = ({
  projectId,
  stepNumber,
  formTitle,
}: CreateTicketFromFormProps) => {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [submitting, setSubmitting] = useState(false)

  const handleOpen = (nextOpen: boolean) => {
    if (nextOpen) {
      setTitle(`Action item from ${formTitle}`)
      setDescription(`Created from Step ${stepNumber} — ${formTitle}`)
      setPriority('medium')
    }
    setOpen(nextOpen)
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Title is required')
      return
    }
    setSubmitting(true)
    const result = await createTicketFromFormContext({
      projectId,
      stepNumber,
      title: title.trim(),
      description: description.trim(),
      priority,
    })
    setSubmitting(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Ticket created')
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="xs"
          className="gap-1 text-[var(--color-text-tertiary)]"
          data-testid="create-ticket-from-form"
        >
          <Ticket size={12} />
          Create Ticket
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Ticket</DialogTitle>
          <DialogDescription>
            Create an action item linked to this project from Step {stepNumber}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="ticket-title">Title</Label>
            <Input
              id="ticket-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ticket title"
              data-testid="ticket-title-input"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="ticket-description">Description</Label>
            <textarea
              id="ticket-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the action item..."
              rows={3}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              data-testid="ticket-description-input"
            />
          </div>

          <div className="space-y-1">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger className="w-full" data-testid="ticket-priority-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting} data-testid="ticket-submit-button">
            {submitting ? 'Creating...' : 'Create Ticket'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
