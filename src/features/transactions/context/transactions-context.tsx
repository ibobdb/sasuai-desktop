import React from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import {
  Transaction,
  TransactionDetail,
  TransactionFilterParams,
  TransactionFilterUIState,
  TransactionsDialogType
} from '@/types/transactions'
import { API_ENDPOINTS } from '@/config/api'
import { createDataProvider } from '@/context/data-context'

// Create the transaction-specific data provider
const { DataProvider, useData } = createDataProvider<
  Transaction,
  TransactionDetail,
  TransactionFilterParams,
  TransactionFilterUIState
>()

interface TransactionsContextType {
  isLoading: boolean
  filters: TransactionFilterParams
  updateFilters: (newFilters: Partial<TransactionFilterParams>) => void
  filterUIState: TransactionFilterUIState
  setFilterUIState: React.Dispatch<React.SetStateAction<TransactionFilterUIState>>
  resetFilters: () => void
  debouncedSearch: (searchTerm: string) => void
  executeSearch: (searchTerm: string) => void
  isLoadingDetail: boolean
  open: TransactionsDialogType | null
  setOpen: (str: TransactionsDialogType | null) => void
  transactions: Transaction[]
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>
  currentTransaction: Transaction | null
  setCurrentTransaction: React.Dispatch<React.SetStateAction<Transaction | null>>
  transactionDetail: TransactionDetail | null
  setTransactionDetail: React.Dispatch<React.SetStateAction<TransactionDetail | null>>
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  fetchTransactionDetail: (id: string) => Promise<TransactionDetail | null>
  applyFilters: () => Promise<void>
}

const TransactionsContext = React.createContext<TransactionsContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function TransactionsProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<TransactionsDialogType>(null)

  // Add this to track if dialog state changes should trigger data refresh
  const ignoreDialogStateChanges = React.useRef(false)

  // Custom setOpen function that won't trigger data refresh
  const handleSetOpen = (state: TransactionsDialogType | null) => {
    // Set flag to true before changing state
    ignoreDialogStateChanges.current = true
    setOpen(state)
    // Reset flag after a short delay (after state updates have completed)
    setTimeout(() => {
      ignoreDialogStateChanges.current = false
    }, 100)
  }

  // Configuration for data provider with adapter functions
  const dataConfig = {
    apiEndpoint: API_ENDPOINTS.TRANSACTIONS.BASE,
    detailEndpoint: (id: string) => `${API_ENDPOINTS.TRANSACTIONS.BASE}/${id}`,
    defaultFilters: {
      page: 1,
      pageSize: 10,
      sortField: 'createdAt',
      sortDirection: 'desc' as const
    },
    defaultFilterUIState: {
      startDate: undefined,
      endDate: undefined,
      minAmount: '',
      maxAmount: '',
      search: '',
      paymentMethods: []
    },
    responseAdapter: (response: any) => {
      if (response?.success) {
        if (response?.data?.transactions) {
          return {
            success: response.success,
            data: response.data.transactions,
            pagination: {
              totalCount: response.data.pagination.totalCount,
              totalPages: response.data.pagination.totalPages,
              currentPage: response.data.pagination.currentPage
            }
          }
        }
        return response
      }
      return response
    },
    detailAdapter: (response: any) => {
      if (response?.success && response?.data) {
        if (response.data.transactionDetails) {
          return {
            success: response.success,
            data: response.data.transactionDetails
          }
        }
        return response
      }
      return response
    },
    // Add this to prevent fetching when dialog state changes
    shouldFetchItems: () => !ignoreDialogStateChanges.current
  }

  return (
    <DataProvider config={dataConfig}>
      <TransactionsWrapper open={open} setOpen={handleSetOpen}>
        {children}
      </TransactionsWrapper>
    </DataProvider>
  )
}

function TransactionsWrapper({
  children,
  open,
  setOpen
}: {
  children: React.ReactNode
  open: TransactionsDialogType | null
  setOpen: (str: TransactionsDialogType | null) => void
}) {
  const dataContext = useData()

  const contextValue = React.useMemo(
    () => ({
      ...dataContext,
      open,
      setOpen,
      transactions: dataContext.items,
      setTransactions: dataContext.setItems,
      currentTransaction: dataContext.currentItem,
      setCurrentTransaction: dataContext.setCurrentItem,
      transactionDetail: dataContext.itemDetail,
      setTransactionDetail: dataContext.setItemDetail,
      totalCount: dataContext.pagination.totalCount,
      totalPages: dataContext.pagination.totalPages,
      currentPage: dataContext.pagination.currentPage,
      pageSize: dataContext.pagination.pageSize,
      fetchTransactionDetail: dataContext.fetchItemDetail,
      applyFilters: dataContext.fetchItems
    }),
    [dataContext, open, setOpen]
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
