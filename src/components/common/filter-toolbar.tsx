import { Cross2Icon } from '@radix-ui/react-icons'
import { memo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface FilterToolbarProps {
  onSearch?: (value: string) => void
  onResetFilters?: () => void
  searchValue?: string
  searchPlaceholder?: string
  onSearchSubmit?: () => void
  hasFilters?: boolean
  filterComponents?: ReactNode
  className?: string
}

function FilterToolbarComponent({
  onSearch,
  onResetFilters,
  searchValue = '',
  searchPlaceholder = 'Search...',
  onSearchSubmit,
  hasFilters = false,
  filterComponents,
  className = ''
}: FilterToolbarProps) {
  return (
    <div className={`flex flex-col gap-4 mb-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2">
          {onSearch && (
            <>
              <Input
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(event) => onSearch(event.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && onSearchSubmit) {
                    onSearchSubmit()
                  }
                }}
                className="h-8 w-[150px] lg:w-[250px]"
              />
              {onSearchSubmit && (
                <Button variant="outline" size="sm" onClick={onSearchSubmit} className="h-8">
                  Search
                </Button>
              )}
            </>
          )}

          {filterComponents}

          {hasFilters && onResetFilters && (
            <Button variant="ghost" onClick={onResetFilters} className="h-8 px-2 lg:px-3">
              Reset
              <Cross2Icon className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// Memoize the toolbar to prevent unnecessary re-renders
export const FilterToolbar = memo(FilterToolbarComponent)
