import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ColumnDef,
  ColumnFiltersState,
  RowData,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { DataTablePagination } from './data-table-pagination'

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    className: string
  }
}

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[]
  data: TData[]
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

export function DataTable<TData>({
  columns,
  data,
  pageCount = 0,
  pagination,
  onPaginationChange,
  totalCount
}: DataTableProps<TData>) {
  const { t } = useTranslation(['common'])
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination: pagination
        ? {
            pageIndex: pagination.pageIndex,
            pageSize: pagination.pageSize
          }
        : undefined
    },
    pageCount,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange:
      pagination && onPaginationChange
        ? (updater) => {
            // Handle both function updater and direct value
            if (typeof updater === 'function') {
              const newState = updater({
                pageIndex: pagination.pageIndex,
                pageSize: pagination.pageSize
              })

              // Call the appropriate callbacks based on what changed
              // Convert 0-based pageIndex to 1-based page number for API
              if (newState.pageIndex !== pagination.pageIndex) {
                onPaginationChange.onPageChange(newState.pageIndex + 1)
              }
              if (newState.pageSize !== pagination.pageSize) {
                onPaginationChange.onPageSizeChange(newState.pageSize)
              }
            } else {
              // Direct value update
              // Convert 0-based pageIndex to 1-based page number for API
              if (updater.pageIndex !== pagination.pageIndex) {
                onPaginationChange.onPageChange(updater.pageIndex + 1)
              }
              if (updater.pageSize !== pagination.pageSize) {
                onPaginationChange.onPageSizeChange(updater.pageSize)
              }
            }
          }
        : undefined,
    manualPagination: !!pagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues()
  })

  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="group/row">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={header.column.columnDef.meta?.className ?? ''}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="group/row"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cell.column.columnDef.meta?.className ?? ''}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {t('table.noData')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="relative z-10">
        <DataTablePagination table={table} totalCount={totalCount} />
      </div>
    </div>
  )
}
