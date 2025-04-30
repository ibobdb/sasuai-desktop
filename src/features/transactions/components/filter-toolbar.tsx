import { memo } from 'react'
import { FilterToolbar as BaseFilterToolbar } from '@/components/common/filter-toolbar'
import { DateRangeFilter } from '@/components/common/date-range-filter'
import { AmountRangeFilter } from '@/components/common/amount-range-filter'
import { DataTableFacetedFilter } from '@/components/common/data-table-faceted-filter'
import { paymentMethods } from '@/lib/payment-methods'
import { useTransactions } from '../context/transactions-context'

function FilterToolbarComponent() {
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

  // Update start date in UI state
  const handleStartDateChange = (date: Date | undefined) => {
    setFilterUIState((prev) => ({
      ...prev,
      startDate: date
    }))
  }

  // Update end date in UI state
  const handleEndDateChange = (date: Date | undefined) => {
    setFilterUIState((prev) => ({
      ...prev,
      endDate: date
    }))
  }

  // Apply date range filter
  const applyDateFilter = () => {
    updateFilters({
      startDate,
      endDate,
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
      onResetFilters={contextResetFilters}
      searchValue={search}
      searchPlaceholder="Search transaction..."
      onSearchSubmit={() => executeSearch(search)}
      hasFilters={hasFilters}
      filterComponents={
        <div className="flex flex-wrap gap-2">
          <DataTableFacetedFilter
            title="Payment Method"
            options={paymentMethods.map(({ label, value, icon }) => ({
              label,
              value,
              icon
            }))}
            onValueChange={handlePaymentMethodChange}
            selectedValues={selectedPaymentMethods}
          />

          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={handleStartDateChange}
            onEndDateChange={handleEndDateChange}
            onApply={applyDateFilter}
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
