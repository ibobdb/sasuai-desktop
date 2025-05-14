import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FilterToolbar as BaseFilterToolbar } from '@/components/common/filter-toolbar'
import { DataTableFacetedFilter } from '@/components/common/data-table-faceted-filter'
import { useRewardClaims } from '../context/reward-claims-context'
import { CheckCircle, XCircle, Clock } from 'lucide-react'
import { DateRangeFilter } from '@/components/common/date-range-filter'

function ClaimFilterToolbarComponent() {
  const { t } = useTranslation(['rewards'])
  const {
    filterUIState,
    setFilterUIState,
    updateFilters,
    resetFilters,
    debouncedSearch,
    executeSearch
  } = useRewardClaims()

  // Status options for filtering with appropriate icons
  const statusOptions = [
    {
      label: t('statusOptions.claimed'),
      value: 'Claimed',
      icon: CheckCircle,
      color: '#16a34a'
    },
    {
      label: t('statusOptions.pending'),
      value: 'Pending',
      icon: Clock,
      color: '#d97706'
    },
    {
      label: t('statusOptions.cancelled'),
      value: 'Cancelled',
      icon: XCircle,
      color: '#ef4444'
    }
  ]

  const { search, dateRange } = filterUIState
  const [startDate, setStartDate] = useState<Date | undefined>(dateRange?.from || undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(dateRange?.to || undefined)

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setFilterUIState((prev) => ({ ...prev, search: value }))
    debouncedSearch(value)
  }

  // Handle date changes
  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date)
  }

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date)
  }

  // Apply date filters
  const handleApplyDateFilter = () => {
    const newDateRange = {
      from: startDate || null,
      to: endDate || null
    }

    setFilterUIState((prev) => ({
      ...prev,
      dateRange: newDateRange
    }))

    if (startDate) {
      updateFilters({ page: 1 })
    }
  }

  // Handle status filter change
  const handleStatusChange = (values: string[]) => {
    setFilterUIState((prev) => ({
      ...prev,
      status: values
    }))

    updateFilters({
      statusFilter: values.length > 0 ? values.join(',') : undefined,
      page: 1
    })
  }

  const handleResetFilters = () => {
    resetFilters()
    handleSearchChange('')
    setStartDate(undefined)
    setEndDate(undefined)
  }

  // Determine if any filters are applied
  const hasFilters = !!(search || startDate || endDate)

  return (
    <BaseFilterToolbar
      onSearch={handleSearchChange}
      onResetFilters={handleResetFilters}
      searchValue={search}
      searchPlaceholder={t('filters.searchClaims')}
      onSearchSubmit={() => executeSearch(search)}
      hasFilters={hasFilters}
      filterComponents={
        <div className="flex flex-wrap gap-4 items-center">
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={handleStartDateChange}
            onEndDateChange={handleEndDateChange}
            onApply={handleApplyDateFilter}
          />

          <DataTableFacetedFilter
            title={t('filters.status')}
            options={statusOptions.map((option) => ({
              ...option,
              icon: option.icon
                ? (props) => <option.icon {...props} color={option.color} />
                : undefined
            }))}
            onValueChange={handleStatusChange}
            selectedValues={[]}
          />
        </div>
      }
    />
  )
}

// Memoize the toolbar to prevent unnecessary re-renders
export const ClaimFilterToolbar = memo(ClaimFilterToolbarComponent)
