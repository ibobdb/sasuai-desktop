import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface AmountRangeFilterProps {
  minAmount: string
  maxAmount: string
  onMinAmountChange: (value: string) => void
  onMaxAmountChange: (value: string) => void
  onApply: () => void
}

export function AmountRangeFilter({
  minAmount,
  maxAmount,
  onMinAmountChange,
  onMaxAmountChange,
  onApply
}: AmountRangeFilterProps) {
  const { t } = useTranslation(['transactions'])

  return (
    <div className="flex gap-2 items-center">
      <Input
        placeholder={t('transaction.filters.minAmount', { defaultValue: 'Min amount' })}
        value={minAmount}
        onChange={(e) => onMinAmountChange(e.target.value)}
        type="number"
        className="h-8 w-30"
      />
      <span>{t('transaction.filters.to', { defaultValue: 'to' })}</span>
      <Input
        placeholder={t('transaction.filters.maxAmount', { defaultValue: 'Max amount' })}
        value={maxAmount}
        onChange={(e) => onMaxAmountChange(e.target.value)}
        type="number"
        className="h-8 w-30"
      />
      <Button variant="secondary" size="sm" className="h-8" onClick={onApply}>
        {t('transaction.filters.applyAmount', { defaultValue: 'Apply Amount' })}
      </Button>
    </div>
  )
}
