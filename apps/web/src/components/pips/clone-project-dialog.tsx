'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Copy, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cloneProject } from '@/app/(app)/projects/actions'

type CloneProjectDialogProps = {
  projectId: string
  projectName: string
}

export const CloneProjectDialog = ({ projectId, projectName }: CloneProjectDialogProps) => {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [cloning, setCloning] = useState(false)
  const [copyForms, setCopyForms] = useState(true)
  const [customTitle, setCustomTitle] = useState('')

  const defaultTitle = `${projectName} — Copy`

  const handleOpenChange = (next: boolean) => {
    if (!cloning) {
      setOpen(next)
      if (!next) {
        // Reset form state on close
        setCopyForms(true)
        setCustomTitle('')
      }
    }
  }

  const handleClone = async () => {
    setCloning(true)
    try {
      const result = await cloneProject(projectId, {
        copyForms,
        title: customTitle.trim() || undefined,
      })

      if (result.error) {
        toast.error(result.error)
        return
      }

      if (result.data?.projectId) {
        toast.success('Project cloned successfully')
        setOpen(false)
        router.push(`/projects/${result.data.projectId}`)
      }
    } catch {
      toast.error('Failed to clone project')
    } finally {
      setCloning(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" data-testid="clone-project-trigger">
          <Copy size={14} />
          Clone
        </Button>
      </DialogTrigger>
      <DialogContent data-testid="clone-project-dialog">
        <DialogHeader>
          <DialogTitle>Clone &ldquo;{projectName}&rdquo;?</DialogTitle>
          <DialogDescription>
            Creates a new project with the same structure. Optionally copies all form data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Custom title */}
          <div className="space-y-1.5">
            <Label htmlFor="clone-title">Project title</Label>
            <Input
              id="clone-title"
              placeholder={defaultTitle}
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              disabled={cloning}
              data-testid="clone-project-title-input"
            />
            <p className="text-xs text-[var(--color-text-tertiary)]">
              Leave blank to use &ldquo;{defaultTitle}&rdquo;
            </p>
          </div>

          {/* Copy forms checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="copy-forms"
              checked={copyForms}
              onChange={(e) => setCopyForms(e.target.checked)}
              disabled={cloning}
              className="h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-primary)]"
              data-testid="clone-project-copy-forms-checkbox"
            />
            <Label htmlFor="copy-forms" className="cursor-pointer font-normal">
              Copy form data from this project
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={cloning}
            data-testid="clone-project-cancel"
          >
            Cancel
          </Button>
          <Button onClick={handleClone} disabled={cloning} data-testid="clone-project-confirm">
            {cloning ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Cloning...
              </>
            ) : (
              <>
                <Copy size={14} />
                Clone
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
