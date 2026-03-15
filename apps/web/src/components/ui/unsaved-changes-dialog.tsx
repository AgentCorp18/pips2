'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

type UnsavedChangesDialogProps = {
  open: boolean
  onDiscard: () => void
  onKeepEditing: () => void
}

/**
 * Confirmation dialog shown when a user attempts to navigate away from a
 * form that has unsaved changes. Uses shadcn/ui AlertDialog.
 */
export const UnsavedChangesDialog = ({
  open,
  onDiscard,
  onKeepEditing,
}: UnsavedChangesDialogProps) => {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent size="sm" data-testid="unsaved-changes-dialog">
        <AlertDialogHeader>
          <AlertDialogTitle>You have unsaved changes</AlertDialogTitle>
          <AlertDialogDescription>
            If you leave now your changes will be lost. Do you want to discard them?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onKeepEditing} data-testid="keep-editing-button">
            Keep Editing
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={onDiscard}
            data-testid="discard-changes-button"
          >
            Discard
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
