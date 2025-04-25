import { useCallback } from 'react'
import { Main } from '@/components/layout/main'
import { Skeleton } from '@/components/ui/skeleton'
import { columns } from './components/transactions-columns'
import { TransactionsDialogs } from './components/transactions-dialogs'
import { TransactionsTable } from './components/transactions-table'
import TransactionsProvider, { useTransactions } from './context/transactions-context'
import { FilterToolbar } from './components/filter-toolbar'

function TransactionsContent() {
  const { isLoading, transactions, filters, updateFilters, totalCount } = useTransactions()

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
            <h2 className="text-2xl font-bold tracking-tight">Transaction History</h2>
            <p className="text-muted-foreground">View and manage all transactions here.</p>
          </div>
        </div>

        {/* Static filters area moved outside of loading section */}
        <FilterToolbar />

        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          {isLoading ? (
            <div className="space-y-4">
              {/* Removed button skeleton since View button is no longer present */}
              <Skeleton className="h-[300px] w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <TransactionsTable
              data={transactions}
              columns={columns}
              pageCount={Math.ceil(totalCount / (filters.pageSize || 10))}
              pagination={{
                pageIndex: (filters.page || 1) - 1,
                pageSize: filters.pageSize || 10
              }}
              onPaginationChange={{
                onPageChange: handlePageChange,
                onPageSizeChange: handlePageSizeChange
              }}
              totalCount={totalCount} // Pass the totalCount from context
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
