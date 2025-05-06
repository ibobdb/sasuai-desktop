import { useCallback, useEffect } from 'react'
import { Main } from '@/components/layout/main'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { useRewardColumns } from './components/reward-columns'
import { RewardTable } from './components/reward-table'
import RewardProvider, { useRewards } from './context/reward-context'
import { FilterToolbar } from './components/filter-toolbar'

function RewardContent() {
  const columns = useRewardColumns()
  const {
    isLoading,
    rewards,
    filters,
    updateFilters,
    totalCount,
    totalPages,
    currentPage,
    pageSize,
    applyFilters
  } = useRewards()

  // Fetch rewards on component mount
  useEffect(() => {
    applyFilters()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handle page change
  const handlePageChange = useCallback(
    (page: number) => {
      updateFilters({ page })
    },
    [updateFilters]
  )

  // Handle page size change
  const handlePageSizeChange = useCallback(
    (pageSize: number) => {
      updateFilters({ pageSize, page: 1 })
    },
    [updateFilters]
  )

  // Handle refresh button click
  const handleRefresh = () => {
    applyFilters()
  }

  // Ensure we're working with an array
  const rewardData = Array.isArray(rewards) ? rewards : []

  return (
    <>
      <Main>
        <div className="mb-2 flex flex-wrap items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Rewards Management</h2>
            <p className="text-muted-foreground">Claim and manage customer rewards</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filter toolbar */}
        <FilterToolbar />

        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-[300px] w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <RewardTable
              data={rewardData}
              columns={columns}
              pageCount={totalPages || 0}
              pagination={{
                pageIndex: (currentPage || filters.page || 1) - 1,
                pageSize: pageSize || filters.pageSize || 10
              }}
              onPaginationChange={{
                onPageChange: handlePageChange,
                onPageSizeChange: handlePageSizeChange
              }}
              totalCount={totalCount || 0}
            />
          )}
        </div>
      </Main>
    </>
  )
}

export default function Rewards() {
  return (
    <RewardProvider>
      <RewardContent />
    </RewardProvider>
  )
}
