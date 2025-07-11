import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { FilterToolbar as BaseFilterToolbar } from '@/components/common/filter-toolbar'
import { DataTableFacetedFilter } from '@/components/common/data-table-faceted-filter'
import { useMembers } from '../context/member-context'
import { User, Award, GemIcon, Crown } from 'lucide-react'

// Member tier options for filtering with appropriate icons
const tierOptions = [
  { label: 'Regular', value: 'regular', icon: User },
  { label: 'Bronze', value: 'bronze', icon: Award, color: '#CD7F32' },
  { label: 'Silver', value: 'silver', icon: Award, color: '#C0C0C0' },
  { label: 'Gold', value: 'gold', icon: Award, color: '#FFD700' },
  { label: 'Platinum', value: 'platinum', icon: Crown, color: '#E5E4E2' },
  { label: 'Diamond', value: 'diamond', icon: GemIcon, color: '#B9F2FF' }
]

function FilterToolbarComponent() {
  const { t } = useTranslation(['member'])
  const {
    filterUIState,
    setFilterUIState,
    updateFilters,
    resetFilters: contextResetFilters,
    debouncedSearch
  } = useMembers()

  const { search, tier: selectedTiers } = filterUIState

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setFilterUIState((prev) => ({ ...prev, search: value }))
    debouncedSearch(value)
  }

  // Handle tier filter change
  const handleTierChange = (values: string[]) => {
    setFilterUIState((prev) => ({
      ...prev,
      tier: values
    }))

    updateFilters({
      tier: values.length ? values : undefined,
      page: 1
    })
  }

  const handleResetFilters = () => {
    contextResetFilters()
    handleSearchChange('')
  }

  // Determine if any filters are applied
  const hasFilters = !!(search || selectedTiers.length > 0)

  return (
    <BaseFilterToolbar
      onSearch={handleSearchChange}
      onResetFilters={handleResetFilters}
      searchValue={search}
      searchPlaceholder={t('member.filters.searchPlaceholder')}
      hasFilters={hasFilters}
      filterComponents={
        <div className="flex flex-wrap gap-2">
          <DataTableFacetedFilter
            title={t('member.filters.tier')}
            options={tierOptions.map((option) => ({
              ...option,
              icon: option.icon
                ? (props) => <option.icon {...props} color={option.color} />
                : undefined
            }))}
            onValueChange={handleTierChange}
            selectedValues={selectedTiers}
          />
        </div>
      }
    />
  )
}

// Memoize the toolbar to prevent unnecessary re-renders
export const FilterToolbar = memo(FilterToolbarComponent)
