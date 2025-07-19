import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { useDebounce } from '@/hooks/use-debounce'
import { BaseFilterParams, BaseFilterUIState, BaseDataContextType } from '@/types/data-provider'

export interface DataProviderProps {
  children: ReactNode
}

interface CreateDataProviderOptions<
  T,
  TDetail,
  TFilterParams extends BaseFilterParams,
  TFilterUIState extends BaseFilterUIState
> {
  entityName: string
  defaultFilters: TFilterParams
  defaultFilterUIState: TFilterUIState
  useItemsHook: (filters: TFilterParams) => {
    data:
      | {
          data?: {
            items: T[]
            totalCount: number
            totalPages: number
            currentPage: number
          }
        }
      | undefined
    isLoading: boolean
    refetch: () => void
  }
  useItemDetailHook: (
    id: string,
    enabled: boolean
  ) => {
    data:
      | {
          data?: TDetail
        }
      | undefined
    isLoading: boolean
  }
}

export function createDataProvider<
  T,
  TDetail,
  TFilterParams extends BaseFilterParams,
  TFilterUIState extends BaseFilterUIState
>(options: CreateDataProviderOptions<T, TDetail, TFilterParams, TFilterUIState>) {
  const { entityName, defaultFilters, defaultFilterUIState, useItemsHook, useItemDetailHook } =
    options

  const DataContext = createContext<BaseDataContextType<
    T,
    TDetail,
    TFilterParams,
    TFilterUIState
  > | null>(null)

  function DataProvider({ children }: DataProviderProps) {
    // Dialog state
    const [open, setOpen] = useDialogState<string>(null)

    // Current selected item
    const [currentItem, setCurrentItem] = useState<T | null>(null)

    // Filters state
    const [filters, setFilters] = useState<TFilterParams>(defaultFilters)
    const [filterUIState, setFilterUIState] = useState<TFilterUIState>(defaultFilterUIState)
    const [lastSearchedQuery, setLastSearchedQuery] = useState<string>('')

    // Fetch items using React Query
    const { data: itemsData, isLoading, refetch } = useItemsHook(filters)

    // Fetch item detail when currentItem is selected and dialog is open
    const currentItemId =
      currentItem && typeof currentItem === 'object' && 'id' in currentItem
        ? (currentItem as { id: string }).id
        : ''
    const { data: itemDetailData, isLoading: isLoadingDetail } = useItemDetailHook(
      currentItemId,
      !!(currentItemId && open === 'view')
    )

    // Update filters function
    const updateFilters = useCallback((newFilters: Partial<TFilterParams>) => {
      setFilters((prev) => ({ ...prev, ...newFilters }))
    }, [])

    // Search callback function
    const searchCallback = useCallback(
      (value: string) => {
        if (value !== lastSearchedQuery) {
          setLastSearchedQuery(value)
          updateFilters({
            search: value || undefined,
            page: 1
          } as Partial<TFilterParams>)
        }
      },
      [lastSearchedQuery, updateFilters]
    )

    // Setup debounced search
    const { setValue: setSearchTerm } = useDebounce('', {
      delay: 500,
      callback: searchCallback
    })

    // Wrapper function to debounce search input
    const debouncedSearch = useCallback(
      (searchTerm: string) => {
        setSearchTerm(searchTerm)
      },
      [setSearchTerm]
    )

    // Function to explicitly execute a search (for search button)
    const executeSearch = useCallback(
      (searchTerm: string) => {
        if (searchTerm !== lastSearchedQuery) {
          setLastSearchedQuery(searchTerm)
          updateFilters({
            search: searchTerm || undefined,
            page: 1
          } as Partial<TFilterParams>)
        }
      },
      [lastSearchedQuery, updateFilters]
    )

    // Reset filters function
    const resetFilters = useCallback(() => {
      setFilters(defaultFilters)
      setFilterUIState(defaultFilterUIState)
      setLastSearchedQuery('')
    }, [])

    // Extract data from API responses with type-safe approach
    const items = itemsData?.data?.items || []
    const totalCount = itemsData?.data?.totalCount || 0
    const totalPages = itemsData?.data?.totalPages || 0
    const currentPage = itemsData?.data?.currentPage || 1
    const pageSize = filters.pageSize || 10
    const itemDetail = itemDetailData?.data || null

    const contextValue: BaseDataContextType<T, TDetail, TFilterParams, TFilterUIState> = {
      // Data
      items,
      itemDetail,
      currentItem,

      // Loading states
      isLoading,
      isLoadingDetail,

      // Filters and pagination
      filters,
      filterUIState,
      totalCount,
      totalPages,
      currentPage,
      pageSize,

      // Dialog state
      open,

      // Actions
      setCurrentItem,
      setOpen,
      updateFilters,
      setFilterUIState,
      resetFilters,
      debouncedSearch,
      executeSearch,
      refetch
    }

    return <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>
  }

  function useDataContext() {
    const context = useContext(DataContext)
    if (!context) {
      throw new Error(`useDataContext must be used within a ${entityName}Provider`)
    }
    return context
  }

  return {
    DataProvider,
    useDataContext,
    DataContext
  }
}
