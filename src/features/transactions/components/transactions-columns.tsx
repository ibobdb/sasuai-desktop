import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { formatCurrency } from '@/utils/format'
import { paymentMethods, PaymentMethod } from '@/lib/payment-methods'
import { Transaction } from '@/types/transactions'
import { DataTableColumnHeader } from '@/components/common/data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'

interface UseTransactionColumnsProps {
  onView?: (transaction: Transaction) => void
}

export function useTransactionColumns({
  onView
}: UseTransactionColumnsProps = {}): ColumnDef<Transaction>[] {
  const { t } = useTranslation(['transactions'])

  // Use useMemo to prevent unnecessary recreations of the columns array
  return useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
            className="translate-y-[2px]"
          />
        ),
        meta: {
          className: cn(
            'sticky md:table-cell left-0 z-10 rounded-tl',
            'bg-background transition-colors duration-200 group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted'
          )
        },
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="translate-y-[2px]"
          />
        ),
        enableSorting: false,
        enableHiding: false
      },
      {
        accessorKey: 'tranId',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('transaction.table.id')} />
        ),
        cell: ({ row }) => {
          const tranId = row.getValue('tranId') as string | null
          if (!tranId) return <span className="text-muted-foreground">-</span>
          return <div className="font-medium">{tranId}</div>
        },
        enableHiding: false
      },
      {
        id: 'originalAmount',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('transaction.table.originalAmount')} />
        ),
        cell: ({ row }) => {
          const originalAmount = row.original?.pricing?.originalAmount
          if (originalAmount == null) return <span className="text-muted-foreground">-</span>
          return <div>{formatCurrency(originalAmount)}</div>
        }
      },
      {
        id: 'totalDiscount',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('transaction.table.totalDiscount')} />
        ),
        cell: ({ row }) => {
          const pricing = row.original?.pricing
          if (!pricing) return <span className="text-muted-foreground">-</span>

          let totalDiscount = 0

          // Handle actual API structure for discounts
          if (pricing.totalDiscount != null) {
            totalDiscount = pricing.totalDiscount
          } else if (pricing.discounts?.total != null) {
            totalDiscount = pricing.discounts.total
          }

          if (totalDiscount === 0) return <span className="text-muted-foreground">-</span>

          return <div className="text-rose-500">{formatCurrency(totalDiscount)}</div>
        }
      },
      {
        id: 'finalAmount',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('transaction.table.finalAmount')} />
        ),
        cell: ({ row }) => {
          const finalAmount = row.original?.pricing?.finalAmount
          if (finalAmount == null) return <span className="text-muted-foreground">-</span>
          return <div className="font-medium">{formatCurrency(finalAmount)}</div>
        }
      },
      {
        id: 'customer',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('transaction.table.customer')} />
        ),
        cell: ({ row }) => {
          const member = row.original?.member
          if (!member)
            return <span className="text-muted-foreground">{t('transaction.details.guest')}</span>
          return <div>{member.name}</div>
        }
      },
      {
        accessorKey: 'itemCount',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('transaction.table.items')} />
        ),
        cell: ({ row }) => {
          const itemCount = row.getValue('itemCount') as number | undefined
          if (!itemCount) return <span className="text-muted-foreground">-</span>
          return `${itemCount} item(s)`
        }
      },
      {
        accessorKey: 'pointsEarned',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('transaction.table.points')} />
        ),
        cell: ({ row }) => {
          const points = row.getValue('pointsEarned') as number | undefined
          if (!points || points === 0) return <span className="text-muted-foreground">-</span>
          return <span>{points} pts</span>
        }
      },
      {
        id: 'paymentAmount',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('transaction.table.paymentAmount')} />
        ),
        cell: ({ row }) => {
          const paymentAmount = row.original?.payment?.amount
          if (paymentAmount == null) return <span className="text-muted-foreground">-</span>
          return <div className="font-medium">{formatCurrency(paymentAmount)}</div>
        }
      },
      {
        accessorKey: 'paymentMethod',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('transaction.table.payment')} />
        ),
        cell: ({ row }) => {
          // Get payment method from payment.method instead of directly from paymentMethod
          const paymentMethod = row.original?.payment?.method as PaymentMethod | undefined

          // Handle null/undefined paymentMethod
          if (!paymentMethod) {
            return <span className="text-muted-foreground">-</span>
          }

          const method = paymentMethods.find((item) => item.value === paymentMethod)

          return (
            <div className="flex items-center gap-x-2">
              {method?.icon && <method.icon size={16} className="text-muted-foreground" />}
              <span className="text-sm capitalize">
                {method?.label || paymentMethod.replace(/[_-]/g, ' ')}
              </span>
            </div>
          )
        },
        filterFn: (row, value) => {
          // Adjust to get payment method from payment.method
          const paymentMethod = row.original?.payment?.method
          return value.includes(paymentMethod || '')
        }
      },
      {
        id: 'cashier',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('transaction.table.cashier')} />
        ),
        cell: ({ row }) => {
          const cashierName = row.original?.cashier?.name
          if (!cashierName) return <span className="text-muted-foreground">-</span>
          return cashierName
        }
      },
      {
        accessorKey: 'createdAt',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('transaction.table.date')} />
        ),
        cell: ({ row }) => {
          const dateValue = row.getValue('createdAt') as string | Date | undefined
          if (!dateValue) return <span className="text-muted-foreground">-</span>

          const date = new Date(dateValue)
          return (
            <div className="flex flex-col">
              <span>{date.toLocaleDateString()}</span>
              <span className="text-xs text-muted-foreground">{date.toLocaleTimeString()}</span>
            </div>
          )
        }
      },
      {
        id: 'actions',
        cell: ({ row }) => <DataTableRowActions row={row} onView={onView} />
      }
    ],
    [t, onView]
  )
}
