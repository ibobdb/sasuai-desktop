import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { FilterToolbar as BaseFilterToolbar } from '@/components/common/filter-toolbar'
import { DataTableFacetedFilter } from '@/components/common/data-table-faceted-filter'
import { User, Award, GemIcon, Crown } from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'
import type { MemberFilterParams, MemberFilterUIState } from '@/types/members'

// Member tier options for filtering with appropriate icons
const tierOptions = [
  { label: 'Regular', value: 'regular', icon: User },
  { label: 'Bronze', value: 'bronze', icon: Award, color: '#CD7F32' },
  { label: 'Silver', value: 'silver', icon: Award, color: '#C0C0C0' },
  { label: 'Gold', value: 'gold', icon: Award, color: '#FFD700' },
  { label: 'Platinum', value: 'platinum', icon: Crown, color: '#E5E4E2' },
  { label: 'Diamond', value: 'diamond', icon: GemIcon, color: '#B9F2FF' }
]

interface FilterToolbarProps {
  filters: MemberFilterParams
  filterUIState: MemberFilterUIState
  onFiltersChange: (newFilters: Partial<MemberFilterParams>) => void
  onFilterUIStateChange: React.Dispatch<React.SetStateAction<MemberFilterUIState>>
  onResetFilters: () => void
}

function FilterToolbarComponent({
  filterUIState,
  onFiltersChange,
  onFilterUIStateChange,
  onResetFilters
}: FilterToolbarProps) {
  const { t } = useTranslation(['member'])

  const { search, tier: selectedTiers } = filterUIState

  // Use debounce hook for search
  const { setValue: setDebouncedSearchValue } = useDebounce(search, {
    delay: 300,
    minLength: 2,
    callback: (searchValue) => {
      onFiltersChange({ search: searchValue, page: 1 })
    }
  })

  // Handle search input change
  const handleSearchChange = (value: string) => {
    onFilterUIStateChange((prev) => ({ ...prev, search: value }))
    setDebouncedSearchValue(value)
  }

  // Handle tier filter change
  const handleTierChange = (values: string[]) => {
    onFilterUIStateChange((prev) => ({
      ...prev,
      tier: values
    }))

    onFiltersChange({
      tier: values.length ? values : undefined,
      page: 1
    })
  }

  const handleResetFilters = () => {
    onResetFilters()
    onFilterUIStateChange((prev) => ({
      ...prev,
      search: '',
      tier: []
    }))
    setDebouncedSearchValue('')
  }

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

export const FilterToolbar = memo(FilterToolbarComponent)
