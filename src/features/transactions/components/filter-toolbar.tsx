import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { DateRange } from 'react-day-picker'
import { FilterToolbar as BaseFilterToolbar } from '@/components/common/filter-toolbar'
import { DataTableFacetedFilter } from '@/components/common/data-table-faceted-filter'
import { paymentMethods } from '@/lib/payment-methods'
import { useDebounce } from '@/hooks/use-debounce'
import { DateRangePickerWithPresets } from '@/components/ui/date-range-picker-with-presets'
import { AmountRangePicker } from '@/components/ui/amount-range-picker'
import type { TransactionFilterParams, TransactionFilterUIState } from '@/types/transactions'

interface FilterToolbarProps {
  filters: TransactionFilterParams
  filterUIState: TransactionFilterUIState
  onFiltersChange: (newFilters: Partial<TransactionFilterParams>) => void
  onFilterUIStateChange: React.Dispatch<React.SetStateAction<TransactionFilterUIState>>
  onResetFilters: () => void
}

function FilterToolbarComponent({
  filterUIState,
  onFiltersChange,
  onFilterUIStateChange,
  onResetFilters
}: FilterToolbarProps) {
  const { t } = useTranslation(['transactions'])

  const {
    startDate,
    endDate,
    minAmount,
    maxAmount,
    search,
    paymentMethods: selectedPaymentMethods
  } = filterUIState

  const { setValue: setDebouncedSearchValue } = useDebounce(search, {
    delay: 300,
    minLength: 2,
    callback: (searchValue) => {
      onFiltersChange({ search: searchValue, page: 1 })
    }
  })

  const handleSearchChange = (value: string) => {
    onFilterUIStateChange((prev) => ({ ...prev, search: value }))
    setDebouncedSearchValue(value)
  }

  const handlePaymentMethodChange = (values: string[]) => {
    onFilterUIStateChange((prev) => ({
      ...prev,
      paymentMethods: values
    }))

    onFiltersChange({
      paymentMethod: values.length === 1 ? values[0] : undefined,
      page: 1
    })
  }

  const handleDateRangeChange = (dateRange: DateRange | undefined) => {
    onFilterUIStateChange((prev) => ({
      ...prev,
      startDate: dateRange?.from || undefined,
      endDate: dateRange?.to || undefined
    }))

    onFiltersChange({
      startDate: dateRange?.from || undefined,
      endDate: dateRange?.to || undefined,
      page: 1
    })
  }

  const handleMinAmountChange = (value: string) => {
    onFilterUIStateChange((prev) => ({
      ...prev,
      minAmount: value
    }))
  }

  const handleMaxAmountChange = (value: string) => {
    onFilterUIStateChange((prev) => ({
      ...prev,
      maxAmount: value
    }))
  }

  const applyAmountFilter = () => {
    onFiltersChange({
      minAmount: minAmount ? Number(minAmount) : undefined,
      maxAmount: maxAmount ? Number(maxAmount) : undefined,
      page: 1
    })
  }

  const handleResetFilters = () => {
    onResetFilters()
    onFilterUIStateChange((prev) => ({
      ...prev,
      search: '',
      startDate: undefined,
      endDate: undefined,
      minAmount: '',
      maxAmount: '',
      paymentMethods: []
    }))
    setDebouncedSearchValue('')
  }

  const dateRange: DateRange | undefined =
    startDate || endDate ? { from: startDate || undefined, to: endDate || undefined } : undefined

  const hasFilters = !!(
    search ||
    startDate ||
    endDate ||
    minAmount ||
    maxAmount ||
    selectedPaymentMethods.length > 0
  )

  return (
    <BaseFilterToolbar
      onSearch={handleSearchChange}
      onResetFilters={handleResetFilters}
      searchValue={search}
      searchPlaceholder={t('transaction.filters.searchPlaceholder')}
      hasFilters={hasFilters}
      filterComponents={
        <div className="flex flex-wrap gap-2">
          <DataTableFacetedFilter
            title={t('transaction.filters.paymentMethod')}
            options={paymentMethods.map(({ label, value, icon }) => ({
              label,
              value,
              icon
            }))}
            onValueChange={handlePaymentMethodChange}
            selectedValues={selectedPaymentMethods}
          />

          <DateRangePickerWithPresets
            value={dateRange}
            onChange={handleDateRangeChange}
            isCompact={true}
          />

          <AmountRangePicker
            minAmount={minAmount}
            maxAmount={maxAmount}
            onMinAmountChange={handleMinAmountChange}
            onMaxAmountChange={handleMaxAmountChange}
            onApply={applyAmountFilter}
          />
        </div>
      }
    />
  )
}

// Memoize the toolbar to prevent unnecessary re-renders
export const FilterToolbar = memo(FilterToolbarComponent)
