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
import { Badge } from '@/components/ui/badge'

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
        cell: ({ row }) => <div className="font-medium">{row.getValue('tranId') as string}</div>,
        enableHiding: false
      },
      {
        id: 'originalAmount',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('transaction.table.originalAmount')} />
        ),
        cell: ({ row }) => <div>{formatCurrency(row.original.pricing.originalAmount)}</div>
      },
      {
        id: 'totalDiscount',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('transaction.table.totalDiscount')} />
        ),
        cell: ({ row }) => {
          const pricing = row.original.pricing
          let totalDiscount = 0

          if (pricing.discounts) {
            totalDiscount = pricing.discounts.total
          } else if ('totalDiscount' in pricing) {
            totalDiscount = pricing.totalDiscount as number
          }

          if (totalDiscount === 0) return <span className="text-muted-foreground">-</span>

          // Show discount type indicator if available
          const hasMultipleDiscounts =
            (pricing.discounts?.member && pricing.discounts?.product) ||
            pricing.discounts?.tier ||
            pricing.discounts?.global

          return (
            <div className="text-rose-500 flex items-center gap-1">
              {formatCurrency(totalDiscount)}
              {hasMultipleDiscounts && (
                <Badge variant="outline" className="text-xs">
                  {t('transaction.table.multipleDiscounts')}
                </Badge>
              )}
            </div>
          )
        }
      },
      {
        id: 'finalAmount',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('transaction.table.finalAmount')} />
        ),
        cell: ({ row }) => (
          <div className="font-medium">{formatCurrency(row.original.pricing.finalAmount)}</div>
        )
      },
      {
        id: 'customer',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('transaction.table.customer')} />
        ),
        cell: ({ row }) => {
          const member = row.original.member
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
        cell: ({ row }) => `${row.getValue('itemCount') as number} item(s)`
      },
      {
        accessorKey: 'pointsEarned',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('transaction.table.points')} />
        ),
        cell: ({ row }) => {
          const points = row.getValue('pointsEarned') as number
          if (points === 0) return <span className="text-muted-foreground">-</span>
          return <span>{points} pts</span>
        }
      },
      {
        id: 'paymentAmount',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('transaction.table.paymentAmount')} />
        ),
        cell: ({ row }) => (
          <div className="font-medium">{formatCurrency(row.original.payment.amount)}</div>
        )
      },
      {
        accessorKey: 'paymentMethod',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('transaction.table.payment')} />
        ),
        cell: ({ row }) => {
          // Get payment method from payment.method instead of directly from paymentMethod
          const paymentMethod = row.original.payment?.method as PaymentMethod | undefined

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
          const paymentMethod = row.original.payment?.method
          return value.includes(paymentMethod || '')
        }
      },
      {
        id: 'cashier',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('transaction.table.cashier')} />
        ),
        cell: ({ row }) => row.original.cashier.name
      },
      {
        accessorKey: 'createdAt',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('transaction.table.date')} />
        ),
        cell: ({ row }) => {
          const date = new Date(row.getValue('createdAt') as string | Date)
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
