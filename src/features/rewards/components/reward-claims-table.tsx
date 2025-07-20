import { useState, useCallback, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Skeleton } from '@/components/ui/skeleton'
import { DataTable } from '@/components/common/data-table'
import { ClaimFilterToolbar } from './claim-filter-toolbar'
import { useRewardClaimColumns } from './reward-claim-columns'
import { RewardClaimFilterParams } from '@/types/rewards'
import { fetchRewardClaims } from '../actions/reward-operations'

export function RewardClaimsTable() {
  const columns = useRewardClaimColumns()
  const [filters, setFilters] = useState<RewardClaimFilterParams>({
    page: 1,
    pageSize: 10,
    sortBy: 'claimDate',
    sortDirection: 'desc'
  })

  const {
    data: claimData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['reward-claims', filters],
    queryFn: () => fetchRewardClaims(filters),
    select: (response) => response.data
  })

  const handlePageChange = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }))
  }, [])

  const handlePageSizeChange = useCallback((pageSize: number) => {
    setFilters((prev) => ({ ...prev, pageSize, page: 1 }))
  }, [])

  const handleFiltersChange = useCallback((newFilters: RewardClaimFilterParams) => {
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
      <ClaimFilterToolbar filters={filters} onFiltersChange={handleFiltersChange} />

      <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-[300px] w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <p className="text-destructive">Failed to load reward claims</p>
          </div>
        ) : (
          <DataTable
            data={claimData?.claims || []}
            columns={columns}
            pageCount={claimData?.totalPages || 0}
            pagination={{
              pageIndex: (claimData?.currentPage || 1) - 1,
              pageSize: filters.pageSize
            }}
            onPaginationChange={paginationHandlers}
            totalCount={claimData?.totalCount || 0}
          />
        )}
      </div>
    </>
  )
}
