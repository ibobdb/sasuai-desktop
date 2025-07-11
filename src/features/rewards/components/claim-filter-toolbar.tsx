import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { DateRange } from 'react-day-picker'
import { FilterToolbar as BaseFilterToolbar } from '@/components/common/filter-toolbar'
import { DataTableFacetedFilter } from '@/components/common/data-table-faceted-filter'
import { useRewardClaims } from '../context/reward-claims-context'
import { CheckCircle, XCircle, Clock } from 'lucide-react'
import { DateRangePickerWithPresets } from '@/components/ui/date-range-picker-with-presets'

function ClaimFilterToolbarComponent() {
  const { t } = useTranslation(['rewards'])
  const { filterUIState, setFilterUIState, updateFilters, resetFilters, debouncedSearch } =
    useRewardClaims()

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

  const { search, dateRange, status: selectedStatus } = filterUIState

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setFilterUIState((prev) => ({ ...prev, search: value }))
    debouncedSearch(value)
  }

  // Handle date range change
  const handleDateRangeChange = (dateRange: DateRange | undefined) => {
    setFilterUIState((prev) => ({
      ...prev,
      dateRange: dateRange ? { from: dateRange.from || null, to: dateRange.to || null } : undefined
    }))

    // Reset to page 1 when date range changes
    updateFilters({
      page: 1
    })
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
  }

  // Create date range object for the picker
  const dateRangeValue: DateRange | undefined =
    dateRange?.from || dateRange?.to
      ? { from: dateRange.from || undefined, to: dateRange.to || undefined }
      : undefined

  // Determine if any filters are applied
  const hasFilters = !!(search || dateRange?.from || dateRange?.to || selectedStatus.length > 0)

  return (
    <BaseFilterToolbar
      onSearch={handleSearchChange}
      onResetFilters={handleResetFilters}
      searchValue={search}
      searchPlaceholder={t('filters.searchClaims')}
      hasFilters={hasFilters}
      filterComponents={
        <div className="flex flex-wrap gap-2">
          <DateRangePickerWithPresets
            value={dateRangeValue}
            onChange={handleDateRangeChange}
            isCompact={true}
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
            selectedValues={selectedStatus}
          />
        </div>
      }
    />
  )
}

// Memoize the toolbar to prevent unnecessary re-renders
export const ClaimFilterToolbar = memo(ClaimFilterToolbarComponent)
