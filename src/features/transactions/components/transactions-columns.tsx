import { ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { formatCurrency } from '@/utils/format'
import { paymentMethods } from '../data/data'
import { Transaction, TransactionPaymentMethod } from '../data/schema'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'

export const columns: ColumnDef<Transaction>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
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
    accessorKey: 'id',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Transaction ID" />,
    cell: ({ row }) => <div className="font-medium">{row.getValue('id') as string}</div>,
    enableHiding: false
  },
  {
    accessorKey: 'finalAmount',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
    cell: ({ row }) => (
      <div className="font-medium">{formatCurrency(row.getValue('finalAmount') as number)}</div>
    )
  },
  {
    accessorKey: 'totalDiscountAmount',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Discount" />,
    cell: ({ row }) => formatCurrency(row.getValue('totalDiscountAmount') as number)
  },
  {
    accessorKey: 'memberName',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" />,
    cell: ({ row }) => (row.getValue('memberName') as string | null) || 'Guest'
  },
  {
    accessorKey: 'itemCount',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Items" />,
    cell: ({ row }) => `${row.getValue('itemCount') as number} item(s)`
  },
  {
    accessorKey: 'pointsEarned',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Points" />,
    cell: ({ row }) => row.getValue('pointsEarned') as number
  },
  {
    accessorKey: 'paymentMethod',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Payment Method" />,
    cell: ({ row }) => {
      const paymentMethod = row.getValue('paymentMethod') as TransactionPaymentMethod
      const method = paymentMethods.find((item) => item.value === paymentMethod)

      return (
        <div className="flex items-center gap-x-2">
          {method?.icon && <method.icon size={16} className="text-muted-foreground" />}
          <span className="text-sm capitalize">
            {method?.label || paymentMethod.replace('_', ' ')}
          </span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    }
  },
  {
    accessorKey: 'cashierName',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Cashier" />
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt') as string | Date)
      return date.toLocaleString()
    }
  },
  {
    id: 'actions',
    cell: DataTableRowActions
  }
]
