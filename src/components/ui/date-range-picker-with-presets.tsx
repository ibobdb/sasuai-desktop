'use client'

import * as React from 'react'
import { CalendarIcon } from '@radix-ui/react-icons'
import { format } from 'date-fns'
import { DateRange } from 'react-day-picker'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  startOfDay,
  endOfDay,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear
} from 'date-fns'

interface DateRangePickerProps {
  value?: DateRange
  onChange?: (date: DateRange | undefined) => void
  className?: string
  align?: 'center' | 'start' | 'end'
  isCompact?: boolean
}

export function DateRangePickerWithPresets({
  value,
  onChange,
  className,
  align = 'center',
  isCompact = false
}: DateRangePickerProps) {
  const { t } = useTranslation(['common'])
  const [date, setDate] = React.useState<DateRange | undefined>(value)
  const [isOpen, setIsOpen] = React.useState(false)

  // Update internal state when prop value changes
  React.useEffect(() => {
    setDate(value)
  }, [value])

  // Format date based on compact mode
  const formatDate = (date: Date) => {
    return isCompact ? format(date, 'dd/MM/yy') : format(date, 'dd MMM yyyy')
  }

  // Get display text for date range
  const getDateRangeText = () => {
    if (!date?.from) return <span>{t('datePicker.placeholder')}</span>

    if (!date.to) return formatDate(date.from)

    return (
      <>
        {formatDate(date.from)} - {formatDate(date.to)}
      </>
    )
  }

  // Apply date preset
  const applyDatePreset = (preset: string) => {
    const today = new Date()
    let range: DateRange

    switch (preset) {
      case 'today': {
        range = {
          from: startOfDay(today),
          to: endOfDay(today)
        }
        break
      }
      case 'yesterday': {
        const yesterday = subDays(today, 1)
        range = {
          from: startOfDay(yesterday),
          to: endOfDay(yesterday)
        }
        break
      }
      case 'last7days': {
        range = {
          from: startOfDay(subDays(today, 6)),
          to: endOfDay(today)
        }
        break
      }
      case 'last30days': {
        range = {
          from: startOfDay(subDays(today, 29)),
          to: endOfDay(today)
        }
        break
      }
      case 'thisWeek': {
        range = {
          from: startOfWeek(today, { weekStartsOn: 1 }),
          to: endOfWeek(today, { weekStartsOn: 1 })
        }
        break
      }
      case 'thisMonth': {
        range = {
          from: startOfMonth(today),
          to: endOfMonth(today)
        }
        break
      }
      case 'thisYear': {
        range = {
          from: startOfYear(today),
          to: endOfYear(today)
        }
        break
      }
      default: {
        range = {
          from: subDays(today, 7),
          to: today
        }
      }
    }

    setDate(range)
    if (onChange) {
      onChange(range)
    }

    // Close the popup after selecting a preset
    setIsOpen(false)
  }

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={'outline'}
            size="sm"
            className={cn(
              'h-8 w-full justify-start text-left font-normal border-dashed',
              date && 'border-primary text-primary bg-primary/5'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
            <span className="truncate">{getDateRangeText()}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 flex" align={align}>
          <div>
            <Calendar
              autoFocus={false}
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={(newDate) => {
                setDate(newDate)
                onChange?.(newDate)
              }}
              numberOfMonths={2}
            />
          </div>

          {/* Date range presets - now vertical on the right side */}
          <div className="border-l p-3 space-y-2 min-w-[130px]">
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyDatePreset('today')}
                className="justify-start text-xs"
              >
                {t('datePicker.presets.today')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyDatePreset('yesterday')}
                className="justify-start text-xs"
              >
                {t('datePicker.presets.yesterday')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyDatePreset('last7days')}
                className="justify-start text-xs"
              >
                {t('datePicker.presets.last7days')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyDatePreset('last30days')}
                className="justify-start text-xs"
              >
                {t('datePicker.presets.last30days')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyDatePreset('thisWeek')}
                className="justify-start text-xs"
              >
                {t('datePicker.presets.thisWeek')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyDatePreset('thisMonth')}
                className="justify-start text-xs"
              >
                {t('datePicker.presets.thisMonth')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyDatePreset('thisYear')}
                className="justify-start text-xs"
              >
                {t('datePicker.presets.thisYear')}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
