import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Main } from '@/components/layout/main'
import { Skeleton } from '@/components/ui/skeleton'
import { useTransactionColumns } from './components/transactions-columns'
import { TransactionsDialogs } from './components/transactions-dialogs'
import { TransactionsTable } from './components/transactions-table'
import TransactionsProvider, { useTransactions } from './context/transactions-context'
import { FilterToolbar } from './components/filter-toolbar'

function TransactionsContent() {
  const { t } = useTranslation(['transactions'])
  const columns = useTransactionColumns()
  const {
    isLoading,
    transactions,
    filters,
    updateFilters,
    totalCount,
    totalPages,
    currentPage,
    pageSize
  } = useTransactions()

  // Handle page change - now this will trigger data fetch via useEffect
  const handlePageChange = useCallback(
    (page: number) => {
      updateFilters({ page })
    },
    [updateFilters]
  )

  // Handle page size change - now this will trigger data fetch via useEffect
  const handlePageSizeChange = useCallback(
    (pageSize: number) => {
      updateFilters({ pageSize, page: 1 })
    },
    [updateFilters]
  )

  return (
    <>
      <Main>
        <div className="mb-2 flex flex-wrap items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t('transaction.title')}</h2>
            <p className="text-muted-foreground">{t('transaction.description')}</p>
          </div>
        </div>

        {/* Filter toolbar - reusable component */}
        <FilterToolbar />

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
              pageCount={totalPages}
              pagination={{
                pageIndex: (currentPage || filters.page || 1) - 1,
                pageSize: pageSize || filters.pageSize || 10
              }}
              onPaginationChange={{
                onPageChange: handlePageChange,
                onPageSizeChange: handlePageSizeChange
              }}
              totalCount={totalCount}
            />
          )}
        </div>
      </Main>

      <TransactionsDialogs />
    </>
  )
}

export default function Transactions() {
  return (
    <TransactionsProvider>
      <TransactionsContent />
    </TransactionsProvider>
  )
}
