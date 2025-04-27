import { Cross2Icon } from '@radix-ui/react-icons'
import { memo } from 'react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar as CalendarIcon } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { paymentMethods } from '../data/data'
import { DataTableFacetedFilter } from './data-table-faceted-filter'
import { useTransactions } from '../context/transactions-context'

function FilterToolbarComponent() {
  // Get filter state and actions from context
  const {
    filterUIState,
    setFilterUIState,
    updateFilters,
    resetFilters: contextResetFilters,
    debouncedSearch,
    executeSearch
  } = useTransactions()

  // Destructure UI filter state for easier access
  const {
    startDate,
    endDate,
    minAmount,
    maxAmount,
    search,
    paymentMethods: selectedPaymentMethods
  } = filterUIState

  // Handle search input change - use debounced search
  const handleSearchChange = (value: string) => {
    debouncedSearch(value)
  }

  // Handle search submit (explicit search button click)
  const handleSearchSubmit = () => {
    executeSearch(search)
  }

  // Apply date range filter
  const applyDateFilter = () => {
    updateFilters({
      startDate,
      endDate,
      page: 1
    })
  }

  // Apply amount range filter
  const applyAmountFilter = () => {
    updateFilters({
      minAmount: minAmount ? Number(minAmount) : undefined,
      maxAmount: maxAmount ? Number(maxAmount) : undefined,
      page: 1
    })
  }

  // Reset all filters
  const resetAllFilters = () => {
    contextResetFilters()
  }

  // Handle payment method filter change
  const handlePaymentMethodChange = (values: string[]) => {
    // Update UI state
    setFilterUIState((prev) => ({
      ...prev,
      paymentMethods: values
    }))

    // Update API filter
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
    <div className="flex flex-col gap-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2">
          <Input
            placeholder="Search transaction ..."
            value={search}
            onChange={(event) => handleSearchChange(event.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearchSubmit()
              }
            }}
            className="h-8 w-[150px] lg:w-[250px]"
          />
          <Button variant="outline" size="sm" onClick={handleSearchSubmit} className="h-8">
            Search
          </Button>

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
          </div>

          {hasFilters && (
            <Button variant="ghost" onClick={resetAllFilters} className="h-8 px-2 lg:px-3">
              Reset
              <Cross2Icon className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Advanced filters */}
      <div className="flex flex-wrap gap-2">
        {/* Date range filters */}
        <div className="flex gap-2 items-center">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn('h-8 border-dashed', startDate && 'bg-primary/20')}
              >
                <CalendarIcon className="h-3.5 w-3.5 mr-2" />
                {startDate ? format(startDate, 'PPP') : 'Start Date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={handleStartDateChange}
                autoFocus
              />
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
                {endDate ? format(endDate, 'PPP') : 'End Date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={handleEndDateChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Button variant="secondary" size="sm" className="h-8" onClick={applyDateFilter}>
            Apply Dates
          </Button>
        </div>

        {/* Amount range filters */}
        <div className="flex gap-2 items-center">
          <Input
            placeholder="Min amount"
            value={minAmount}
            onChange={(e) => handleMinAmountChange(e.target.value)}
            type="number"
            className="h-8 w-30"
          />
          <span>to</span>
          <Input
            placeholder="Max amount"
            value={maxAmount}
            onChange={(e) => handleMaxAmountChange(e.target.value)}
            type="number"
            className="h-8 w-30"
          />
          <Button variant="secondary" size="sm" className="h-8" onClick={applyAmountFilter}>
            Apply Amount
          </Button>
        </div>
      </div>
    </div>
  )
}

// Memoize the toolbar to prevent unnecessary re-renders
export const FilterToolbar = memo(FilterToolbarComponent)
