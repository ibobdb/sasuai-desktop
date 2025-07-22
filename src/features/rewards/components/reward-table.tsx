import { useState, useCallback, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Skeleton } from '@/components/ui/skeleton'
import { DataTable } from '@/components/common/data-table'
import { FilterToolbar } from './filter-toolbar'
import { useRewardColumns } from './reward-columns'
import { RewardFilterParams } from '@/types/rewards'
import { fetchRewards } from '../actions/reward-operations'

export function RewardTable() {
  const columns = useRewardColumns()
  const [filters, setFilters] = useState<RewardFilterParams>({
    page: 1,
    pageSize: 10,
    sortBy: 'pointsCost',
    sortDirection: 'asc',
    includeInactive: false
  })

  const {
    data: rewardData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['rewards', filters],
    queryFn: () => fetchRewards(filters),
    select: (response) => response.data
  })

  const handlePageChange = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }))
  }, [])

  const handlePageSizeChange = useCallback((pageSize: number) => {
    setFilters((prev) => ({ ...prev, pageSize, page: 1 }))
  }, [])

  const handleFiltersChange = useCallback((newFilters: RewardFilterParams) => {
    setFilters(newFilters)
  }, [])

  const paginationHandlers = useMemo(
    () => ({
      onPageChange: handlePageChange,
      onPageSizeChange: handlePageSizeChange
    }),
    [handlePageChange, handlePageSizeChange]
  )

  return (
    <>
      <FilterToolbar filters={filters} onFiltersChange={handleFiltersChange} />

      <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-[300px] w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <p className="text-destructive">Failed to load rewards</p>
          </div>
        ) : (
          <DataTable
            data={rewardData?.rewards || []}
            columns={columns}
            pageCount={rewardData?.totalPages || 0}
            pagination={{
              pageIndex: (rewardData?.currentPage || 1) - 1,
              pageSize: filters.pageSize
            }}
            onPaginationChange={paginationHandlers}
            totalCount={rewardData?.totalCount || 0}
          />
        )}
      </div>
    </>
  )
}
