import React from 'react'
import { RewardClaim, RewardClaimFilterParams, RewardClaimFilterUIState } from '@/types/rewards'
import { API_ENDPOINTS } from '@/config/api'

interface RewardClaimsContextType {
  isLoading: boolean
  rewardClaims: RewardClaim[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  filters: RewardClaimFilterParams
  filterUIState: RewardClaimFilterUIState
  updateFilters: (newFilters: Partial<RewardClaimFilterParams>) => void
  setFilterUIState: React.Dispatch<React.SetStateAction<RewardClaimFilterUIState>>
  fetchClaims: () => Promise<void>
  resetFilters: () => void
  debouncedSearch: (searchTerm: string) => void
  executeSearch: (searchTerm: string) => void
}

const RewardClaimsContext = React.createContext<RewardClaimsContextType | null>(null)

interface Props {
  children: React.ReactNode
}

const defaultFilters: RewardClaimFilterParams = {
  page: 1,
  pageSize: 10,
  sortBy: 'claimDate',
  sortDirection: 'desc'
}

const defaultFilterUIState: RewardClaimFilterUIState = {
  search: '',
  dateRange: {
    from: null,
    to: null
  }
}

export function RewardClaimsProvider({ children }: Props) {
  const [isLoading, setIsLoading] = React.useState(false)
  const [rewardClaims, setRewardClaims] = React.useState<RewardClaim[]>([])
  const [totalCount, setTotalCount] = React.useState(0)
  const [totalPages, setTotalPages] = React.useState(0)
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const [filters, setFilters] = React.useState<RewardClaimFilterParams>(defaultFilters)
  const [filterUIState, setFilterUIState] =
    React.useState<RewardClaimFilterUIState>(defaultFilterUIState)

  // debounce setup for search
  const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  const debouncedSearch = React.useCallback((searchTerm: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchTerm, page: 1 }))
    }, 500)
  }, [])

  const executeSearch = React.useCallback((searchTerm: string) => {
    setFilters((prev) => ({ ...prev, search: searchTerm, page: 1 }))
  }, [])

  const updateFilters = React.useCallback((newFilters: Partial<RewardClaimFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }, [])

  const resetFilters = React.useCallback(() => {
    setFilters(defaultFilters)
    setFilterUIState(defaultFilterUIState)
  }, [])

  const fetchClaims = React.useCallback(async () => {
    setIsLoading(true)

    try {
      // Build query params
      const queryParams = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value))
        }
      })

      // Add date range if provided
      if (filterUIState.dateRange?.from) {
        queryParams.append('fromDate', filterUIState.dateRange.from.toISOString())
      }
      if (filterUIState.dateRange?.to) {
        queryParams.append('toDate', filterUIState.dateRange.to.toISOString())
      }

      // Use the correct endpoint for fetching claim history
      const endpoint = `${API_ENDPOINTS.REWARDS.CLAIM}?${queryParams.toString()}`

      const response = await window.api.request(endpoint, {
        method: 'GET'
      })

      if (response.success && response.data) {
        setRewardClaims(response.data.claims || [])
        setTotalCount(response.data.totalCount || 0)
        setTotalPages(response.data.totalPages || 1)
        setCurrentPage(response.data.currentPage || 1)
        setPageSize(filters.pageSize)
      } else {
        console.error('Failed to fetch reward claims:', response)
      }
    } catch (error) {
      console.error('Error fetching reward claims:', error)
    } finally {
      setIsLoading(false)
    }
  }, [filters, filterUIState])

  // Fetch claims when filters change
  React.useEffect(() => {
    fetchClaims()
  }, [filters, fetchClaims])

  const contextValue = React.useMemo(
    () => ({
      isLoading,
      rewardClaims,
      totalCount,
      totalPages,
      currentPage,
      pageSize,
      filters,
      filterUIState,
      updateFilters,
      setFilterUIState,
      fetchClaims,
      resetFilters,
      debouncedSearch,
      executeSearch
    }),
    [
      isLoading,
      rewardClaims,
      totalCount,
      totalPages,
      currentPage,
      pageSize,
      filters,
      filterUIState,
      updateFilters,
      fetchClaims,
      resetFilters,
      debouncedSearch,
      executeSearch
    ]
  )

  return (
    <RewardClaimsContext.Provider value={contextValue}>{children}</RewardClaimsContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useRewardClaims = () => {
  const context = React.useContext(RewardClaimsContext)

  if (!context) {
    throw new Error('useRewardClaims must be used within a RewardClaimsProvider')
  }

  return context
}
