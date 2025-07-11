import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { FilterToolbar as BaseFilterToolbar } from '@/components/common/filter-toolbar'
import { DataTableFacetedFilter } from '@/components/common/data-table-faceted-filter'
import { useRewards } from '../context/reward-context'
import { CheckCircle, XCircle, ClockIcon } from 'lucide-react'

function FilterToolbarComponent() {
  const { t } = useTranslation(['rewards'])
  const {
    filterUIState,
    setFilterUIState,
    updateFilters,
    resetFilters: contextResetFilters,
    debouncedSearch
  } = useRewards()

  // Status options for filtering with appropriate icons
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

  const { search, status: selectedStatus } = filterUIState

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setFilterUIState((prev) => ({ ...prev, search: value }))
    debouncedSearch(value)
  }

  // Handle status filter change
  const handleStatusChange = (values: string[]) => {
    setFilterUIState((prev) => ({
      ...prev,
      status: values
    }))

    updateFilters({
      includeInactive: values.includes('inactive') || values.includes('expired'),
      page: 1
    })
  }

  const handleResetFilters = () => {
    contextResetFilters()
    handleSearchChange('')
  }

  // Determine if any filters are applied
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

// Memoize the toolbar to prevent unnecessary re-renders
export const FilterToolbar = memo(FilterToolbarComponent)
