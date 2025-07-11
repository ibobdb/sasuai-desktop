import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CreditCard } from 'lucide-react'

interface AmountRangePickerProps {
  minAmount: string
  maxAmount: string
  onMinAmountChange: (value: string) => void
  onMaxAmountChange: (value: string) => void
  onApply: () => void
  className?: string
}

export function AmountRangePicker({
  minAmount,
  maxAmount,
  onMinAmountChange,
  onMaxAmountChange,
  onApply,
  className
}: AmountRangePickerProps) {
  const { t } = useTranslation(['transactions'])
  const [isOpen, setIsOpen] = React.useState(false)

  const hasFilter = !!(minAmount || maxAmount)

  const getDisplayText = () => {
    if (!minAmount && !maxAmount) {
      return t('transaction.filters.amountRange')
    }

    if (minAmount && maxAmount) {
      return `Rp ${Number(minAmount).toLocaleString('id-ID')} - Rp ${Number(maxAmount).toLocaleString('id-ID')}`
    }

    if (minAmount) {
      return `≥ Rp ${Number(minAmount).toLocaleString('id-ID')}`
    }

    return `≤ Rp ${Number(maxAmount).toLocaleString('id-ID')}`
  }

  const handleApply = () => {
    onApply()
    setIsOpen(false)
  }

  const handleClear = () => {
    onMinAmountChange('')
    onMaxAmountChange('')
    onApply()
    setIsOpen(false)
  }

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              'h-8 border-dashed justify-start text-left font-normal',
              hasFilter && 'border-primary text-primary bg-primary/5'
            )}
          >
            <CreditCard className="mr-2 h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{getDisplayText()}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="start">
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">{t('transaction.filters.amountRange')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('transaction.filters.amountRangeDescription', {
                  defaultValue:
                    'Set the minimum and maximum amount range for filtering transactions.'
                })}
              </p>
            </div>

            <div className="grid gap-3">
              <div className="grid gap-2">
                <Label htmlFor="minAmount" className="text-sm font-medium">
                  {t('transaction.filters.minAmount')}
                </Label>
                <Input
                  id="minAmount"
                  placeholder="0"
                  value={minAmount}
                  onChange={(e) => onMinAmountChange(e.target.value)}
                  type="number"
                  min="0"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="maxAmount" className="text-sm font-medium">
                  {t('transaction.filters.maxAmount')}
                </Label>
                <Input
                  id="maxAmount"
                  placeholder="0"
                  value={maxAmount}
                  onChange={(e) => onMaxAmountChange(e.target.value)}
                  type="number"
                  min="0"
                />
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="outline" size="sm" onClick={handleClear}>
                {t('transaction.filters.clear', { defaultValue: 'Clear' })}
              </Button>
              <Button size="sm" onClick={handleApply}>
                {t('transaction.filters.applyAmount')}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
