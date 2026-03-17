'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Copy, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  listProjectsWithForm,
  copyFormFromProject,
} from '@/app/(app)/projects/[projectId]/steps/[stepNumber]/forms/actions'

type CopyFromProjectDialogProps = {
  projectId: string
  stepNumber: number
  formType: string
  onCopied: () => void
}

export const CopyFromProjectDialog = ({
  projectId,
  stepNumber,
  formType,
  onCopied,
}: CopyFromProjectDialogProps) => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [copying, setCopying] = useState(false)
  const [projects, setProjects] = useState<Array<{ id: string; title: string }>>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)

  const handleOpenChange = async (next: boolean) => {
    setOpen(next)
    if (!next) return

    setLoading(true)
    setSelectedProjectId(null)
    try {
      const results = await listProjectsWithForm(stepNumber, formType, projectId)
      setProjects(results)
    } catch {
      toast.error('Failed to load projects')
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!selectedProjectId) return

    setCopying(true)
    try {
      const result = await copyFormFromProject(selectedProjectId, projectId, stepNumber, formType)
      if (result.success) {
        toast.success('Form data copied successfully')
        setOpen(false)
        onCopied()
      } else {
        toast.error(result.error ?? 'Failed to copy form data')
      }
    } catch {
      toast.error('Failed to copy form data')
    } finally {
      setCopying(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="xs"
          className="gap-1 text-[var(--color-text-tertiary)]"
          data-testid="copy-from-project-trigger"
        >
          <Copy size={12} />
          Copy from Project
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Copy from Project</DialogTitle>
          <DialogDescription>
            Copy this form&apos;s data from another project in your organization. This will
            overwrite any existing data in the current form.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-[120px]">
          {loading ? (
            <div
              className="flex items-center justify-center py-8 text-[var(--color-text-tertiary)]"
              data-testid="copy-from-project-loading"
            >
              <Loader2 size={16} className="animate-spin" />
              <span className="ml-2 text-sm">Loading projects...</span>
            </div>
          ) : projects.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-8 text-center"
              data-testid="copy-from-project-empty"
            >
              <p className="text-sm text-[var(--color-text-secondary)]">
                No other projects have this form filled out yet.
              </p>
              <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                Complete this form in another project first, then you can copy it here.
              </p>
            </div>
          ) : (
            <ul
              className="space-y-1"
              role="listbox"
              aria-label="Select a project to copy from"
              data-testid="copy-from-project-list"
            >
              {projects.map((project) => (
                <li key={project.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selectedProjectId === project.id}
                    onClick={() => setSelectedProjectId(project.id)}
                    className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                      selectedProjectId === project.id
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'text-[var(--color-text-primary)] hover:bg-[var(--color-surface)]'
                    }`}
                    data-testid={`copy-source-project-${project.id}`}
                  >
                    {project.title}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={copying}
            data-testid="copy-from-project-cancel"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCopy}
            disabled={!selectedProjectId || copying}
            data-testid="copy-from-project-confirm"
          >
            {copying ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                Copying...
              </>
            ) : (
              'Copy'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
