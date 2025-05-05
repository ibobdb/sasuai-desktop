import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { useDebounce } from '@/hooks/use-debounce'
import { toast } from 'sonner'

// Generic types for data context
export interface Pagination {
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
}

export interface BaseFilterParams {
  page: number
  pageSize: number
  sortField?: string
  sortDirection?: 'asc' | 'desc'
  search?: string
  [key: string]: any
}

export interface BaseFilterUIState {
  search: string
  [key: string]: any
}

export interface DataContextConfig<
  TItem,
  TDetail,
  TFilterParams extends BaseFilterParams,
  TFilterUIState extends BaseFilterUIState
> {
  apiEndpoint: string
  detailEndpoint: (id: string) => string
  defaultFilters: TFilterParams
  defaultFilterUIState: TFilterUIState
  parseResponse?: (data: any) => TItem[]
  parseDetail?: (data: any) => TDetail
  responseAdapter?: (response: any) => any
  detailAdapter?: (response: any) => any
  shouldFetchItems?: () => boolean
}

export interface DataContextType<
  TItem,
  TDetail,
  TFilterParams extends BaseFilterParams,
  TFilterUIState extends BaseFilterUIState
> {
  isLoading: boolean
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
  items: TItem[]
  setItems: React.Dispatch<React.SetStateAction<TItem[]>>
  filters: TFilterParams
  updateFilters: (newFilters: Partial<TFilterParams>) => void
  pagination: Pagination
  setPagination: React.Dispatch<React.SetStateAction<Pagination>>
  filterUIState: TFilterUIState
  setFilterUIState: React.Dispatch<React.SetStateAction<TFilterUIState>>
  resetFilters: () => void
  debouncedSearch: (searchTerm: string) => void
  executeSearch: (searchTerm: string) => void
  fetchItemDetail: (id: string) => Promise<TDetail | null>
  itemDetail: TDetail | null
  setItemDetail: React.Dispatch<React.SetStateAction<TDetail | null>>
  isLoadingDetail: boolean
  currentItem: TItem | null
  setCurrentItem: React.Dispatch<React.SetStateAction<TItem | null>>
  fetchItems: () => Promise<void>
}

// Create the context
function createDataContext<
  TItem,
  TDetail,
  TFilterParams extends BaseFilterParams,
  TFilterUIState extends BaseFilterUIState
>() {
  return React.createContext<DataContextType<TItem, TDetail, TFilterParams, TFilterUIState> | null>(
    null
  )
}

interface DataProviderProps<
  TItem,
  TDetail,
  TFilterParams extends BaseFilterParams,
  TFilterUIState extends BaseFilterUIState
> {
  children: React.ReactNode
  config: DataContextConfig<TItem, TDetail, TFilterParams, TFilterUIState>
}

export function createDataProvider<
  TItem,
  TDetail,
  TFilterParams extends BaseFilterParams,
  TFilterUIState extends BaseFilterUIState
>() {
  const DataContext = createDataContext<TItem, TDetail, TFilterParams, TFilterUIState>()

  function DataProvider({
    children,
    config
  }: DataProviderProps<TItem, TDetail, TFilterParams, TFilterUIState>) {
    const {
      apiEndpoint,
      detailEndpoint,
      defaultFilters,
      defaultFilterUIState,
      responseAdapter,
      detailAdapter
    } = config

    // State variables
    const [items, setItems] = useState<TItem[]>([])
    const [currentItem, setCurrentItem] = useState<TItem | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [lastSearchedQuery, setLastSearchedQuery] = useState<string>('')

    // Pagination state
    const [pagination, setPagination] = useState<Pagination>({
      totalCount: 0,
      totalPages: 0,
      currentPage: 1,
      pageSize: 10
    })

    // Item detail states
    const [itemDetail, setItemDetail] = useState<TDetail | null>(null)
    const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false)

    // Flag to track if filters need to be applied
    const shouldFetchRef = useRef(false)

    // Default filters state
    const [filters, setFilters] = useState<TFilterParams>(defaultFilters)

    // UI filter state
    const [filterUIState, setFilterUIState] = useState<TFilterUIState>(defaultFilterUIState)

    // Create a search callback function that checks if the query has changed
    const searchCallback = useCallback(
      (value: string) => {
        if (value !== lastSearchedQuery) {
          setLastSearchedQuery(value)
          setFilterUIState((prev) => ({ ...prev, search: value }))
          setFilters((prev) => ({
            ...prev,
            search: value || undefined,
            page: 1
          }))
        }
      },
      [lastSearchedQuery]
    )

    // Setup debounced search using the useDebounce hook
    const { setValue: setSearchTerm } = useDebounce('', {
      delay: 500,
      callback: searchCallback
    })

    // Wrapper function to debounce search input
    const debouncedSearch = useCallback(
      (searchTerm: string) => {
        setSearchTerm(searchTerm)
        setFilterUIState((prev) => ({ ...prev, search: searchTerm }))
      },
      [setSearchTerm]
    )

    // Function to explicitly execute a search (for search button)
    const executeSearch = useCallback(
      (searchTerm: string) => {
        if (searchTerm !== lastSearchedQuery) {
          setLastSearchedQuery(searchTerm)
          setFilterUIState((prev) => ({ ...prev, search: searchTerm }))
          setFilters((prev) => ({
            ...prev,
            search: searchTerm || undefined,
            page: 1
          }))
        }
      },
      [lastSearchedQuery]
    )

    // Function to build URL with query parameters
    const buildUrl = useCallback(
      (params: TFilterParams): string => {
        try {
          let url = apiEndpoint
          const queryParams: string[] = []

          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
              if (value instanceof Date) {
                queryParams.push(`${key}=${encodeURIComponent(value.toISOString())}`)
              } else {
                queryParams.push(`${key}=${encodeURIComponent(String(value))}`)
              }
            }
          })

          if (queryParams.length > 0) {
            url += `?${queryParams.join('&')}`
          }

          return url
        } catch (error) {
          console.error('Error building URL:', error)
          return apiEndpoint
        }
      },
      [apiEndpoint]
    )

    // Fetch items with current filters
    const fetchItems = useCallback(async () => {
      setIsLoading(true)

      try {
        const url = buildUrl(filters)
        console.log('Fetching items from:', url)

        const response = await window.api.request(url, {
          method: 'GET'
        })

        const adaptedResponse = responseAdapter ? responseAdapter(response) : response

        if (adaptedResponse.success) {
          setItems(adaptedResponse.data || [])

          if (adaptedResponse.pagination) {
            setPagination(adaptedResponse.pagination)
          }
        } else {
          toast.error('Failed to load data', {
            description: adaptedResponse.message || 'Please try again later'
          })
        }
      } catch (error) {
        console.error('Error fetching items:', error)
        toast.error('Failed to load data', {
          description: 'Please try again later'
        })
      } finally {
        setIsLoading(false)
      }
    }, [filters, buildUrl, responseAdapter])

    // Fetch item details by ID
    const fetchItemDetail = useCallback(
      async (id: string) => {
        setIsLoadingDetail(true)
        setItemDetail(null)

        try {
          const url = detailEndpoint(id)
          console.log('Fetching item detail from:', url)

          const response = await window.api.request(url, {
            method: 'GET'
          })

          const adaptedResponse = detailAdapter ? detailAdapter(response) : response

          if (adaptedResponse.success && adaptedResponse.data) {
            setItemDetail(adaptedResponse.data)
            return adaptedResponse.data
          }

          toast.error('Failed to load details', {
            description: adaptedResponse.message || 'Please try again later'
          })
          return null
        } catch (error) {
          console.error('Error fetching item detail:', error)
          toast.error('Failed to load details', {
            description: 'Please try again later'
          })
          return null
        } finally {
          setIsLoadingDetail(false)
        }
      },
      [detailEndpoint, detailAdapter]
    )

    const updateFilters = useCallback((newFilters: Partial<TFilterParams>) => {
      setFilters((prevFilters) => {
        return { ...prevFilters, ...newFilters }
      })
    }, [])

    // Reset all filters and immediately apply
    const resetFilters = useCallback(() => {
      setFilterUIState(defaultFilterUIState)
      setFilters(defaultFilters)
      setLastSearchedQuery('')
    }, [defaultFilterUIState, defaultFilters])

    // Effect to handle fetching data when filters change
    useEffect(() => {
      if (shouldFetchRef.current) {
        const shouldProceedWithFetch = config.shouldFetchItems ? config.shouldFetchItems() : true

        if (shouldProceedWithFetch) {
          fetchItems()
        }
      } else {
        shouldFetchRef.current = true
        fetchItems()
      }
    }, [fetchItems, filters])

    const contextValue = useMemo(
      () => ({
        isLoading,
        setIsLoading,
        items,
        setItems,
        filters,
        updateFilters,
        pagination,
        setPagination,
        filterUIState,
        setFilterUIState,
        resetFilters,
        debouncedSearch,
        executeSearch,
        fetchItemDetail,
        itemDetail,
        setItemDetail,
        isLoadingDetail,
        currentItem,
        setCurrentItem,
        fetchItems
      }),
      [
        isLoading,
        items,
        filters,
        updateFilters,
        pagination,
        filterUIState,
        setFilterUIState,
        resetFilters,
        debouncedSearch,
        executeSearch,
        fetchItemDetail,
        itemDetail,
        isLoadingDetail,
        currentItem,
        fetchItems
      ]
    )

    return <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>
  }

  function useData() {
    const context = React.useContext(DataContext)

    if (!context) {
      throw new Error('useData has to be used within the DataProvider')
    }

    return context
  }

  return { DataProvider, useData }
}
