import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { Transaction } from '../data/schema'
import { API_ENDPOINTS } from '@/config/api'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/authStore'
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
  setTotalCount: React.Dispatch<React.SetStateAction<number>>
  filterUIState: TransactionFilterUIState
  setFilterUIState: React.Dispatch<React.SetStateAction<TransactionFilterUIState>>
  resetFilters: () => void
  debouncedSearch: (searchTerm: string) => void
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
  const { token } = useAuthStore()

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

      const response = await window.api.fetchApi(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.success && response.data) {
        // Handle response data
        const transactionData = response.data.transactions || response.data
        setTransactions(transactionData)

        // Update total count if available
        if (response.data.totalCount !== undefined) {
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
  }, [token, filters, buildUrl])

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

  // Debounced search function to prevent excessive API calls
  const debouncedSearch = useDebouncedCallback((searchTerm: string) => {
    setFilterUIState((prev) => ({ ...prev, search: searchTerm }))
    setFilters((prev) => ({
      ...prev,
      search: searchTerm || undefined,
      page: 1 // Reset to first page on search
    }))
  }, 500)

  // Update filters - all filter changes now immediately apply via the useEffect
  const updateFilters = useCallback((newFilters: Partial<TransactionFilterParams>) => {
    setFilters((prevFilters) => {
      return { ...prevFilters, ...newFilters }
    })
  }, [])

  // Apply current filters and fetch data (now redundant but kept for backward compatibility)
  const applyFilters = useCallback(() => {
    // This is now a no-op as filters are applied automatically via useEffect
    // but we'll leave it for backward compatibility
  }, [])

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

    // No need to call fetchTransactions() explicitly as the useEffect will handle it
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
      setTotalCount,
      filterUIState,
      setFilterUIState,
      resetFilters,
      debouncedSearch
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
      filterUIState,
      setFilterUIState,
      resetFilters,
      debouncedSearch
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
