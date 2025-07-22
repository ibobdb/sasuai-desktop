import { memo, useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { DateRange } from 'react-day-picker'
import { FilterToolbar as BaseFilterToolbar } from '@/components/common/filter-toolbar'
import { DataTableFacetedFilter } from '@/components/common/data-table-faceted-filter'
import { RewardClaimFilterParams } from '@/types/rewards'
import { CheckCircle, XCircle, Clock } from 'lucide-react'
import { DateRangePickerWithPresets } from '@/components/ui/date-range-picker-with-presets'
import { useDebounce } from '@/hooks/use-debounce'

interface ClaimFilterToolbarProps {
  filters: RewardClaimFilterParams
  onFiltersChange: (filters: RewardClaimFilterParams) => void
}

function ClaimFilterToolbarComponent({ filters, onFiltersChange }: ClaimFilterToolbarProps) {
  const { t } = useTranslation(['rewards'])
  const [search, setSearch] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string[]>([])
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const filtersRef = useRef(filters)

  useEffect(() => {
    filtersRef.current = filters
  }, [filters])

  const { debouncedValue } = useDebounce(search, { delay: 300 })

  useEffect(() => {
    if (debouncedValue !== filtersRef.current.search) {
      onFiltersChange({
        ...filtersRef.current,
        search: debouncedValue,
        page: 1
      })
    }
  }, [debouncedValue, onFiltersChange])

  const statusOptions = [
    {
      label: t('statusOptions.claimed'),
      value: 'claimed',
      icon: CheckCircle,
      color: '#16a34a'
    },
    {
      label: t('statusOptions.pending'),
      value: 'pending',
      icon: Clock,
      color: '#d97706'
    },
    {
      label: t('statusOptions.cancelled'),
      value: 'cancelled',
      icon: XCircle,
      color: '#ef4444'
    }
  ]

  const handleSearchChange = (value: string) => {
    setSearch(value)
  }

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range)
    onFiltersChange({
      ...filtersRef.current,
      page: 1
    })
  }

  const handleStatusChange = (values: string[]) => {
    setSelectedStatus(values)
    onFiltersChange({
      ...filtersRef.current,
      statusFilter: values.length > 0 ? values.join(',') : undefined,
      page: 1
    })
  }

  const handleResetFilters = () => {
    setSearch('')
    setSelectedStatus([])
    setDateRange(undefined)
    onFiltersChange({
      page: 1,
      pageSize: 10,
      sortBy: 'claimDate',
      sortDirection: 'desc'
    })
  }

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
            value={dateRange}
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

export const ClaimFilterToolbar = memo(ClaimFilterToolbarComponent)
