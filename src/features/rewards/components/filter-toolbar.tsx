import { memo, useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { FilterToolbar as BaseFilterToolbar } from '@/components/common/filter-toolbar'
import { DataTableFacetedFilter } from '@/components/common/data-table-faceted-filter'
import { RewardFilterParams } from '@/types/rewards'
import { CheckCircle, XCircle, ClockIcon } from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'

interface FilterToolbarProps {
  filters: RewardFilterParams
  onFiltersChange: (filters: RewardFilterParams) => void
}

function FilterToolbarComponent({ filters, onFiltersChange }: FilterToolbarProps) {
  const { t } = useTranslation(['rewards'])
  const [search, setSearch] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string[]>([])
  const filtersRef = useRef(filters)

  useEffect(() => {
    filtersRef.current = filters
  }, [filters])

  const { debouncedValue } = useDebounce(search, { delay: 300 })

  useEffect(() => {
    if (debouncedValue !== filtersRef.current.query) {
      onFiltersChange({
        ...filtersRef.current,
        query: debouncedValue,
        page: 1
      })
    }
  }, [debouncedValue, onFiltersChange])

  const statusOptions = [
    {
      label: t('statusOptions.active'),
      value: 'active',
      icon: CheckCircle,
      color: '#16a34a'
    },
    {
      label: t('statusOptions.inactive'),
      value: 'inactive',
      icon: XCircle,
      color: '#6b7280'
    },
    {
      label: t('statusOptions.expired'),
      value: 'expired',
      icon: ClockIcon,
      color: '#ef4444'
    }
  ]

  const handleSearchChange = (value: string) => {
    setSearch(value)
  }

  const handleStatusChange = (values: string[]) => {
    setSelectedStatus(values)
    onFiltersChange({
      ...filtersRef.current,
      includeInactive: values.includes('inactive') || values.includes('expired'),
      page: 1
    })
  }

  const handleResetFilters = () => {
    setSearch('')
    setSelectedStatus([])
    onFiltersChange({
      ...filtersRef.current,
      query: '',
      includeInactive: false,
      page: 1
    })
  }

  const hasFilters = !!(search || selectedStatus.length > 0)

  return (
    <BaseFilterToolbar
      onSearch={handleSearchChange}
      onResetFilters={handleResetFilters}
      searchValue={search}
      searchPlaceholder={t('filters.searchRewards')}
      hasFilters={hasFilters}
      filterComponents={
        <div className="flex flex-wrap gap-2">
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

export const FilterToolbar = memo(FilterToolbarComponent)
