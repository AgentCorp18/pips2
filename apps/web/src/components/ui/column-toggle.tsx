'use client'

import { Settings2, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export type ColumnDef = {
  id: string
  label: string
  /** Whether this column can be hidden (some like Title are always visible) */
  canHide: boolean
}

type ColumnToggleProps = {
  columns: ColumnDef[]
  visibleColumns: string[]
  onToggle: (columnId: string) => void
  onReset: () => void
}

export const ColumnToggle = ({ columns, visibleColumns, onToggle, onReset }: ColumnToggleProps) => {
  const hideableColumns = columns.filter((c) => c.canHide)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Settings2 size={14} />
          Columns
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {hideableColumns.map((col) => (
          <DropdownMenuCheckboxItem
            key={col.id}
            checked={visibleColumns.includes(col.id)}
            onCheckedChange={() => onToggle(col.id)}
            onSelect={(e) => e.preventDefault()}
          >
            {col.label}
          </DropdownMenuCheckboxItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={false}
          onCheckedChange={onReset}
          onSelect={(e) => e.preventDefault()}
          className="gap-1.5"
        >
          <RotateCcw size={12} />
          Reset to defaults
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
