'use client'

import * as React from 'react'
import { format, parseISO } from 'date-fns'
import { CalendarIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

type DatePickerProps = {
  name: string
  id?: string
  value?: string // YYYY-MM-DD
  defaultValue?: string // YYYY-MM-DD
  disabled?: boolean
  'aria-describedby'?: string
}

export const DatePicker = ({
  name,
  id,
  value: controlledValue,
  defaultValue,
  disabled,
  'aria-describedby': ariaDescribedBy,
}: DatePickerProps) => {
  const [open, setOpen] = React.useState(false)
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? '')
  const value = controlledValue !== undefined ? controlledValue : internalValue

  const date = value ? parseISO(value) : undefined

  const handleSelect = (day: Date | undefined) => {
    const formatted = day ? format(day, 'yyyy-MM-dd') : ''
    if (controlledValue === undefined) {
      setInternalValue(formatted)
    }
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <input type="hidden" name={name} value={value} />
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          aria-describedby={ariaDescribedBy}
          className={cn(
            'w-full justify-start text-left font-normal',
            !date && 'text-muted-foreground',
          )}
        >
          <CalendarIcon className="mr-2 size-4" />
          {date ? format(date, 'PPP') : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={date} onSelect={handleSelect} initialFocus />
      </PopoverContent>
    </Popover>
  )
}
