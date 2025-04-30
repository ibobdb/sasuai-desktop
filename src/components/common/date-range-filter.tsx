import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'

interface DateRangeFilterProps {
  startDate: Date | undefined
  endDate: Date | undefined
  onStartDateChange: (date: Date | undefined) => void
  onEndDateChange: (date: Date | undefined) => void
  onApply: () => void
}

export function DateRangeFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onApply
}: DateRangeFilterProps) {
  const { t } = useTranslation(['transactions'])

  return (
    <div className="flex gap-2 items-center">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn('h-8 border-dashed', startDate && 'bg-primary/20')}
          >
            <CalendarIcon className="h-3.5 w-3.5 mr-2" />
            {startDate
              ? format(startDate, 'PPP')
              : t('transaction.filters.startDate', { defaultValue: 'Start Date' })}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={startDate} onSelect={onStartDateChange} autoFocus />
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn('h-8 border-dashed', endDate && 'bg-primary/20')}
          >
            <CalendarIcon className="h-3.5 w-3.5 mr-2" />
            {endDate
              ? format(endDate, 'PPP')
              : t('transaction.filters.endDate', { defaultValue: 'End Date' })}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={endDate} onSelect={onEndDateChange} initialFocus />
        </PopoverContent>
      </Popover>

      <Button variant="secondary" size="sm" className="h-8" onClick={onApply}>
        {t('transaction.filters.applyDates', { defaultValue: 'Apply Dates' })}
      </Button>
    </div>
  )
}
