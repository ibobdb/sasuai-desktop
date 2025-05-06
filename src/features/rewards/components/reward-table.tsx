import { ColumnDef } from '@tanstack/react-table'
import { Reward } from '@/types/rewards'
import { DataTable } from '@/components/common/data-table'

interface RewardTableProps {
  columns: ColumnDef<Reward>[]
  data: Reward[]
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

export function RewardTable({
  columns,
  data,
  pageCount = 0,
  pagination,
  onPaginationChange,
  totalCount
}: RewardTableProps) {
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
