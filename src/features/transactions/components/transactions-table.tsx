import { memo } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { Transaction } from '@/types/transactions'
import { DataTable } from '@/components/common/data-table'

interface TransactionsTableProps {
  columns: ColumnDef<Transaction>[]
  data: Transaction[]
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

function TransactionsTableComponent({
  columns,
  data,
  pageCount = 0,
  pagination,
  onPaginationChange,
  totalCount
}: TransactionsTableProps) {
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

export const TransactionsTable = memo(TransactionsTableComponent)
