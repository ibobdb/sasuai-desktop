import { ColumnDef } from '@tanstack/react-table'
import { Member } from '@/types/members'
import { DataTable } from '@/components/common/data-table'

interface MemberTableProps {
  columns: ColumnDef<Member>[]
  data: Member[]
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

export function MemberTable({
  columns,
  data,
  pageCount = 0,
  pagination,
  onPaginationChange,
  totalCount
}: MemberTableProps) {
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
