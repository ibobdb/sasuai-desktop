import { useTranslation } from 'react-i18next'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon
} from '@radix-ui/react-icons'
import { Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'

interface DataTablePaginationProps<TData> {
  table: Table<TData>
  totalCount?: number
}

export function DataTablePagination<TData>({ table, totalCount }: DataTablePaginationProps<TData>) {
  const { t } = useTranslation(['common'])

  const currentPage = table.getState().pagination.pageIndex + 1
  const pageSize = table.getState().pagination.pageSize
  const totalPages = table.getPageCount()
  const canGoPrevious = table.getCanPreviousPage()
  const canGoNext = table.getCanNextPage()

  const selectedRowsCount = table.getFilteredSelectedRowModel().rows.length
  const totalRowsDisplayed = table.getFilteredRowModel().rows.length
  const actualTotalCount = totalCount ?? totalRowsDisplayed

  return (
    <div className="flex items-center justify-between px-2">
      <div className="text-muted-foreground flex-1 text-xs">
        <span className="hidden sm:inline-block">
          {selectedRowsCount} {t('table.pagination.of')} {totalRowsDisplayed}{' '}
          {t('table.pagination.entries')}.
        </span>
        <span className="ml-2">Total {actualTotalCount} data.</span>
      </div>
      <div className="flex items-center sm:space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="hidden text-sm font-medium sm:block">{t('table.pagination.rowsPerPage')}</p>
          <select
            value={pageSize}
            onChange={(e) => {
              const newSize = Number(e.target.value)
              table.setPageSize(newSize)
            }}
            className="h-8 w-[70px] rounded border border-input bg-background px-2 text-sm transition-colors hover:border-ring focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
            aria-label={t('table.pagination.rowsPerPage')}
          >
            {[10, 20, 30, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
        </div>
        <div className="flex w-[120px] items-center justify-center text-xs font-medium">
          {t('table.pagination.page', { defaultValue: 'Page' })} {currentPage}{' '}
          {t('table.pagination.of')} {totalPages}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!canGoPrevious}
            aria-label={t('table.pagination.goToFirst', { defaultValue: 'Go to first page' })}
          >
            <DoubleArrowLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!canGoPrevious}
            aria-label={t('table.pagination.goToPrevious', { defaultValue: 'Go to previous page' })}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!canGoNext}
            aria-label={t('table.pagination.goToNext', { defaultValue: 'Go to next page' })}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(totalPages - 1)}
            disabled={!canGoNext}
            aria-label={t('table.pagination.goToLast', { defaultValue: 'Go to last page' })}
          >
            <DoubleArrowRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
