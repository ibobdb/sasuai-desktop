import { ColumnDef } from '@tanstack/react-table'
import { RewardClaim } from '@/types/rewards'
import { DataTable } from '@/components/common/data-table'

interface RewardClaimsTableProps {
  columns: ColumnDef<RewardClaim>[]
  data: RewardClaim[]
  pageCount?: number
  pagination?: {
    pageIndex: number
    pageSize: number
  }
  onPaginationChange?: {
    onPageChange: (page: number) => void
    onPageSizeChange: (pageSize: number) => void
  }
  totalCount?: number
}

export function RewardClaimsTable({
  columns,
  data,
  pageCount = 0,
  pagination,
  onPaginationChange,
  totalCount
}: RewardClaimsTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      pageCount={pageCount}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      totalCount={totalCount}
    />
  )
}
