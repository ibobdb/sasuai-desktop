import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { DateRange } from 'react-day-picker'
import { FilterToolbar as BaseFilterToolbar } from '@/components/common/filter-toolbar'
import { AmountRangeFilter } from '@/components/common/amount-range-filter'
import { DataTableFacetedFilter } from '@/components/common/data-table-faceted-filter'
import { paymentMethods } from '@/lib/payment-methods'
import { useTransactions } from '../context/transactions-context'
import { DateRangePickerWithPresets } from '@/components/ui/date-range-picker-with-presets'

function FilterToolbarComponent() {
  const { t } = useTranslation(['transactions'])
  const {
    filterUIState,
    setFilterUIState,
    updateFilters,
    resetFilters: contextResetFilters,
    debouncedSearch,
    executeSearch
  } = useTransactions()

  const {
    startDate,
    endDate,
    minAmount,
    maxAmount,
    search,
    paymentMethods: selectedPaymentMethods
  } = filterUIState

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setFilterUIState((prev) => ({ ...prev, search: value }))
    debouncedSearch(value)
  }

  // Handle payment method filter change
  const handlePaymentMethodChange = (values: string[]) => {
    setFilterUIState((prev) => ({
      ...prev,
      paymentMethods: values
    }))

    updateFilters({
      paymentMethod: values.length === 1 ? values[0] : undefined,
      page: 1
    })
  }

  // Handle date range change
  const handleDateRangeChange = (dateRange: DateRange | undefined) => {
    setFilterUIState((prev) => ({
      ...prev,
      startDate: dateRange?.from || undefined,
      endDate: dateRange?.to || undefined
    }))

    // Apply the filter immediately when a date range is selected
    updateFilters({
      startDate: dateRange?.from || undefined,
      endDate: dateRange?.to || undefined,
      page: 1
    })
  }

  // Update min amount in UI state
  const handleMinAmountChange = (value: string) => {
    setFilterUIState((prev) => ({
      ...prev,
      minAmount: value
    }))
  }

  // Update max amount in UI state
  const handleMaxAmountChange = (value: string) => {
    setFilterUIState((prev) => ({
      ...prev,
      maxAmount: value
    }))
  }

  // Apply amount range filter
  const applyAmountFilter = () => {
    updateFilters({
      minAmount: minAmount ? Number(minAmount) : undefined,
      maxAmount: maxAmount ? Number(maxAmount) : undefined,
      page: 1
    })
  }

  const handleResetFilters = () => {
    contextResetFilters()
    handleSearchChange('')
  }

  // Create date range object for the picker
  const dateRange: DateRange | undefined =
    startDate || endDate ? { from: startDate, to: endDate } : undefined

  // Determine if any filters are applied
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
      onSearchSubmit={() => executeSearch(search)}
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

          <AmountRangeFilter
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
