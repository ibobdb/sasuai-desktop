import { useState, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Main } from '@/components/layout/main'
import { Skeleton } from '@/components/ui/skeleton'
import { useQuery } from '@tanstack/react-query'
import { transactionOperations } from './actions/transaction-operations'
import {
  Transaction,
  TransactionFilterParams,
  TransactionFilterUIState,
  TransactionsDialogType
} from '@/types/transactions'
import { useTransactionColumns } from './components/transactions-columns'
import { TransactionsDialogs } from './components/transactions-dialogs'
import { TransactionsTable } from './components/transactions-table'
import { FilterToolbar } from './components/filter-toolbar'

const defaultTransactionFilters: TransactionFilterParams = {
  page: 1,
  pageSize: 10,
  sortField: 'createdAt',
  sortDirection: 'desc'
}

const defaultTransactionFilterUIState: TransactionFilterUIState = {
  search: '',
  startDate: undefined,
  endDate: undefined,
  minAmount: '',
  maxAmount: '',
  paymentMethods: []
}

export default function Transactions() {
  const { t } = useTranslation(['transactions'])
  const [open, setOpen] = useState<TransactionsDialogType | null>(null)
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null)
  const [filterUIState, setFilterUIState] = useState<TransactionFilterUIState>(
    defaultTransactionFilterUIState
  )
  const [filters, setFilters] = useState<TransactionFilterParams>(defaultTransactionFilters)

  const {
    data: transactionsResponse,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => transactionOperations.fetchItems(filters)
  })

  const { data: transactionDetailResponse, isLoading: isLoadingDetail } = useQuery({
    queryKey: ['transaction', currentTransaction?.id],
    queryFn: () => transactionOperations.fetchItemDetail(currentTransaction?.id || ''),
    enabled: !!currentTransaction?.id,
    select: (response) => response.data
  })

  const transactions = useMemo(
    () => transactionsResponse?.data?.transactions ?? [],
    [transactionsResponse?.data?.transactions]
  )

  const transactionDetail = transactionDetailResponse || null

  const pagination = useMemo(() => {
    const paginationResponse = transactionsResponse?.data?.pagination
    return {
      totalPages: paginationResponse?.totalPages ?? 0,
      currentPage: paginationResponse?.currentPage ?? 1,
      pageSize: filters.pageSize ?? 10,
      totalCount: paginationResponse?.totalCount ?? 0
    }
  }, [transactionsResponse?.data?.pagination, filters.pageSize])

  const updateFilters = useCallback((newFilters: Partial<TransactionFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(defaultTransactionFilters)
    setFilterUIState(defaultTransactionFilterUIState)
  }, [])

  const handleViewTransaction = useCallback((transaction: Transaction) => {
    setCurrentTransaction(transaction)
    setOpen('view')
  }, [])

  const columns = useTransactionColumns({
    onView: handleViewTransaction
  })

  const paginationConfig = useMemo(
    () => ({
      pageIndex: (pagination.currentPage || 1) - 1,
      pageSize: pagination.pageSize || 10
    }),
    [pagination.currentPage, pagination.pageSize]
  )

  const paginationHandlers = useMemo(
    () => ({
      onPageChange: (page: number) => updateFilters({ page }),
      onPageSizeChange: (size: number) => updateFilters({ pageSize: size, page: 1 })
    }),
    [updateFilters]
  )

  const headerContent = useMemo(
    () => (
      <div className="mb-6 flex flex-wrap items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('transaction.title')}</h2>
          <p className="text-muted-foreground">{t('transaction.description')}</p>
        </div>
      </div>
    ),
    [t]
  )

  return (
    <Main>
      {headerContent}

      <FilterToolbar
        filters={filters}
        filterUIState={filterUIState}
        onFiltersChange={updateFilters}
        onFilterUIStateChange={setFilterUIState}
        onResetFilters={resetFilters}
      />

      <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-[300px] w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          <TransactionsTable
            data={transactions}
            columns={columns}
            pageCount={pagination.totalPages}
            pagination={paginationConfig}
            onPaginationChange={paginationHandlers}
            totalCount={pagination.totalCount}
          />
        )}
      </div>

      <TransactionsDialogs
        open={open}
        currentTransaction={currentTransaction}
        transactionDetail={transactionDetail}
        isLoadingDetail={isLoadingDetail}
        onOpenChange={setOpen}
        onRefetch={refetch}
      />
    </Main>
  )
}
