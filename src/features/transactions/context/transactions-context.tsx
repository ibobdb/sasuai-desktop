import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { Transaction, TransactionDetail } from '../data/schema'
import { API_ENDPOINTS } from '@/config/api'
import { toast } from 'sonner'
import { useDebouncedCallback } from '@/hooks/use-debounced-callback'

// Change the type to include both 'delete' and 'view'
type TransactionsDialogType = 'delete' | 'view'

// Filter parameters interface that matches the API
export interface TransactionFilterParams {
  page?: number
  pageSize?: number
  sortField?: string
  sortDirection?: 'asc' | 'desc'
  search?: string
  cashierId?: string
  memberId?: string
  paymentMethod?: string
  startDate?: Date
  endDate?: Date
  minAmount?: number
  maxAmount?: number
}

// Interface for UI filter state that should persist
export interface TransactionFilterUIState {
  startDate?: Date
  endDate?: Date
  minAmount: string
  maxAmount: string
  search: string
  paymentMethods: string[]
}

interface TransactionsContextType {
  open: TransactionsDialogType | null
  setOpen: (str: TransactionsDialogType | null) => void
  currentTransaction: Transaction | null
  setCurrentTransaction: React.Dispatch<React.SetStateAction<Transaction | null>>
  isLoading: boolean
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
  transactions: Transaction[]
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>
  filters: TransactionFilterParams
  updateFilters: (newFilters: Partial<TransactionFilterParams>) => void
  applyFilters: () => void
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  setTotalCount: React.Dispatch<React.SetStateAction<number>>
  filterUIState: TransactionFilterUIState
  setFilterUIState: React.Dispatch<React.SetStateAction<TransactionFilterUIState>>
  resetFilters: () => void
  debouncedSearch: (searchTerm: string) => void
  fetchTransactionDetail: (id: string) => Promise<TransactionDetail | null>
  transactionDetail: TransactionDetail | null
  setTransactionDetail: React.Dispatch<React.SetStateAction<TransactionDetail | null>>
  isLoadingDetail: boolean
  voidTransaction: (id: string, reason: string) => Promise<boolean>
  isVoiding: boolean
}

const TransactionsContext = React.createContext<TransactionsContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function TransactionsProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<TransactionsDialogType>(null)
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [totalCount, setTotalCount] = useState<number>(0)
  const [totalPages, setTotalPages] = useState<number>(0)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)

  // Transaction detail states
  const [transactionDetail, setTransactionDetail] = useState<TransactionDetail | null>(null)
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false)

  // Flag to track if filters need to be applied
  const shouldFetchRef = useRef(false)

  // Default filters state
  const [filters, setFilters] = useState<TransactionFilterParams>({
    page: 1,
    pageSize: 10,
    sortField: 'createdAt',
    sortDirection: 'desc'
  })

  // UI filter state that persists between data refreshes
  const [filterUIState, setFilterUIState] = useState<TransactionFilterUIState>({
    startDate: undefined,
    endDate: undefined,
    minAmount: '',
    maxAmount: '',
    search: '',
    paymentMethods: []
  })

  const [isVoiding, setIsVoiding] = useState<boolean>(false)

  // Function to build URL with query parameters
  const buildUrl = useCallback((params: TransactionFilterParams): string => {
    try {
      // Start with the base endpoint
      let url = API_ENDPOINTS.TRANSACTIONS.GET_ALL
      const queryParams: string[] = []

      // Add parameters to query string
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (value instanceof Date) {
            queryParams.push(`${key}=${encodeURIComponent(value.toISOString())}`)
          } else {
            queryParams.push(`${key}=${encodeURIComponent(String(value))}`)
          }
        }
      })

      // Append query string if we have parameters
      if (queryParams.length > 0) {
        url += `?${queryParams.join('&')}`
      }

      return url
    } catch (error) {
      console.error('Error building URL:', error)
      return API_ENDPOINTS.TRANSACTIONS.GET_ALL
    }
  }, [])

  // Fetch transactions with current filters
  const fetchTransactions = useCallback(async () => {
    setIsLoading(true)

    try {
      const url = buildUrl(filters)
      console.log('Fetching transactions from:', url)

      const response = await window.api.request(url, {
        method: 'GET'
      })

      if (response.success && response.data) {
        // Handle response data with new structure
        if (response.data.transactions) {
          setTransactions(response.data.transactions)
        } else {
          setTransactions(response.data)
        }

        // Update pagination data if available
        if (response.data.pagination) {
          const { totalCount, totalPages, currentPage, pageSize } = response.data.pagination
          setTotalCount(totalCount)
          setTotalPages(totalPages)
          setCurrentPage(currentPage)
          setPageSize(pageSize)
        } else if (response.data.totalCount !== undefined) {
          // Fallback for older API response format
          setTotalCount(response.data.totalCount)
        }
      } else {
        toast.error('Failed to load transactions', {
          description: response.message || 'Please try again later'
        })
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
      toast.error('Failed to load transactions', {
        description: 'Please try again later'
      })
    } finally {
      setIsLoading(false)
    }
  }, [filters, buildUrl])

  // Effect to handle fetching data when filters change
  useEffect(() => {
    // Check if we should fetch data (skip initial render)
    if (shouldFetchRef.current) {
      fetchTransactions()
    } else {
      // Set the flag to true after first render
      shouldFetchRef.current = true
      // And fetch data initially
      fetchTransactions()
    }
  }, [fetchTransactions, filters])

  // Fetch transaction details by ID
  const fetchTransactionDetail = useCallback(async (id: string) => {
    setIsLoadingDetail(true)
    setTransactionDetail(null)

    try {
      const url = `${API_ENDPOINTS.TRANSACTIONS.GET_ALL}/${id}`
      console.log('Fetching transaction detail from:', url)

      const response = await window.api.request(url, {
        method: 'GET'
      })

      if (response.success && response.data) {
        // Handle both old and new response formats
        const detail = response.data.transactionDetails || response.data.transactionDetail
        if (detail) {
          setTransactionDetail(detail)
          return detail
        }
      }

      toast.error('Failed to load transaction details', {
        description: response.message || 'Please try again later'
      })
      return null
    } catch (error) {
      console.error('Error fetching transaction detail:', error)
      toast.error('Failed to load transaction details', {
        description: 'Please try again later'
      })
      return null
    } finally {
      setIsLoadingDetail(false)
    }
  }, [])

  // Void a transaction with a given reason
  const voidTransaction = useCallback(
    async (id: string, reason: string) => {
      setIsVoiding(true)

      try {
        const url = `${API_ENDPOINTS.TRANSACTIONS.GET_ALL}/${id}`

        // Prepare the data object
        const voidData = {
          reason: reason
        }

        // Make the API call with proper JSON data format
        const response = await window.api.request(url, {
          method: 'POST',
          data: voidData
        })

        console.log('Void response:', response)

        if (response && response.success === true) {
          toast.success('Transaction voided successfully')
          fetchTransactions()
          return true
        } else {
          const errorMsg = response?.message || 'Unknown server error'
          const errorDetails = response?.error || 'Please try again later'

          toast.error('Failed to void transaction', {
            description: `${errorMsg}. ${errorDetails}`
          })
          console.error('Void error details:', response)
          return false
        }
      } catch (error) {
        console.error('Error voiding transaction:', error)
        toast.error('Failed to void transaction', {
          description: error instanceof Error ? error.message : 'An unexpected error occurred'
        })
        return false
      } finally {
        setIsVoiding(false)
      }
    },
    [fetchTransactions]
  )

  // Debounced search function to prevent excessive API calls
  const debouncedSearch = useDebouncedCallback((searchTerm: string) => {
    setFilterUIState((prev) => ({ ...prev, search: searchTerm }))
    setFilters((prev) => ({
      ...prev,
      search: searchTerm || undefined,
      page: 1
    }))
  }, 500)

  const updateFilters = useCallback((newFilters: Partial<TransactionFilterParams>) => {
    setFilters((prevFilters) => {
      return { ...prevFilters, ...newFilters }
    })
  }, [])

  const applyFilters = useCallback(() => {}, [])

  // Reset all filters and immediately apply
  const resetFilters = useCallback(() => {
    // Reset UI state
    setFilterUIState({
      startDate: undefined,
      endDate: undefined,
      minAmount: '',
      maxAmount: '',
      search: '',
      paymentMethods: []
    })

    // Reset API filters
    setFilters({
      page: 1,
      pageSize: 10,
      sortField: 'createdAt',
      sortDirection: 'desc'
    })
  }, [])

  // Expose the context value
  const contextValue = useMemo(
    () => ({
      open,
      setOpen,
      currentTransaction,
      setCurrentTransaction,
      isLoading,
      setIsLoading,
      transactions,
      setTransactions,
      filters,
      updateFilters,
      applyFilters,
      totalCount,
      totalPages,
      currentPage,
      pageSize,
      setTotalCount,
      filterUIState,
      setFilterUIState,
      resetFilters,
      debouncedSearch,
      fetchTransactionDetail,
      transactionDetail,
      setTransactionDetail,
      isLoadingDetail,
      voidTransaction,
      isVoiding
    }),
    [
      open,
      setOpen,
      currentTransaction,
      isLoading,
      transactions,
      filters,
      updateFilters,
      applyFilters,
      totalCount,
      totalPages,
      currentPage,
      pageSize,
      filterUIState,
      setFilterUIState,
      resetFilters,
      debouncedSearch,
      fetchTransactionDetail,
      transactionDetail,
      isLoadingDetail,
      voidTransaction,
      isVoiding
    ]
  )

  return (
    <TransactionsContext.Provider value={contextValue}>{children}</TransactionsContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTransactions = () => {
  const transactionsContext = React.useContext(TransactionsContext)

  if (!transactionsContext) {
    throw new Error('useTransactions has to be used within <TransactionsContext>')
  }

  return transactionsContext
}
