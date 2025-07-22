import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { Reward } from '@/types/rewards'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/common/data-table-column-header'
import { format } from 'date-fns'

// Create a custom hook for getting columns
export function useRewardColumns(): ColumnDef<Reward>[] {
  const { t } = useTranslation(['rewards'])

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
        accessorKey: 'name',
        header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.name')} />,
        cell: ({ row }) => <div className="font-medium">{row.getValue('name') as string}</div>,
        enableHiding: false
      },
      {
        accessorKey: 'description',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('table.description')} />
        ),
        cell: ({ row }) => {
          const description = row.getValue('description') as string | null
          return (
            <div className="max-w-[400px] truncate">
              {description || (
                <span className="text-muted-foreground">{t('table.noDescription')}</span>
              )}
            </div>
          )
        }
      },
      {
        accessorKey: 'pointsCost',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('table.pointsCost')} />
        ),
        cell: ({ row }) => (
          <div className="font-medium">
            {(row.getValue('pointsCost') as number).toLocaleString()} {t('table.points')}
          </div>
        ),
        enableSorting: true
      },
      {
        accessorKey: 'stock',
        header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.stock')} />,
        cell: ({ row }) => {
          const stock = row.getValue('stock') as number
          // Apply color based on stock level
          let colorClass = ''
          if (stock <= 0) {
            colorClass = 'text-destructive font-medium'
          } else if (stock < 5) {
            colorClass = 'text-amber-500 font-medium'
          }
          return <div className={colorClass}>{stock}</div>
        }
      },
      {
        id: 'isActive',
        header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.status')} />,
        cell: ({ row }) => {
          const isActive = row.original.isActive
          const expiryDate = row.original.expiryDate ? new Date(row.original.expiryDate) : null
          const isExpired = expiryDate ? expiryDate < new Date() : false
          const stock = row.original.stock
          const outOfStock = stock <= 0

          let status: string
          let variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'warning'

          if (!isActive) {
            status = t('statusOptions.inactive')
            variant = 'outline'
          } else if (isExpired) {
            status = t('statusOptions.expired')
            variant = 'destructive'
          } else if (outOfStock) {
            status = t('statusOptions.outOfStock')
            variant = 'secondary'
          } else {
            status = t('statusOptions.active')
            variant = 'default'
          }

          return <Badge variant={variant}>{status}</Badge>
        },
        filterFn: (row, value) => {
          if (value.length === 0) return true

          const isActive = row.original.isActive
          const expiryDate = row.original.expiryDate ? new Date(row.original.expiryDate) : null
          const isExpired = expiryDate ? expiryDate < new Date() : false
          const outOfStock = row.original.stock <= 0

          if (value.includes('active') && isActive && !isExpired && !outOfStock) return true
          if (value.includes('inactive') && !isActive) return true
          if (value.includes('expired') && isExpired) return true
          if (value.includes('outOfStock') && outOfStock) return true

          return false
        }
      },
      {
        accessorKey: 'expiryDate',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('table.expiryDate')} />
        ),
        cell: ({ row }) => {
          const expiryDate = row.getValue('expiryDate') as string | null

          if (!expiryDate) {
            return <span className="text-muted-foreground">{t('table.noExpiry')}</span>
          }

          const date = new Date(expiryDate)
          const today = new Date()

          // Calculate days remaining
          const daysRemaining = Math.ceil((date.getTime() - today.getTime()) / (1000 * 3600 * 24))

          // Customize display based on days remaining
          let textClass = ''
          if (daysRemaining < 0) {
            textClass = 'text-destructive'
          } else if (daysRemaining < 7) {
            textClass = 'text-amber-500'
          }

          return (
            <div className={textClass}>
              {format(date, 'PPP')}
              {daysRemaining >= 0 && daysRemaining < 30 && (
                <div className="text-xs opacity-75">
                  {t('table.daysLeft', { count: daysRemaining })}
                </div>
              )}
            </div>
          )
        }
      },
      {
        id: 'rewardClaims',
        header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.claims')} />,
        cell: ({ row }) => {
          const claimCount = row.original._count?.rewardClaims || 0
          return (
            <div className="font-medium">
              {claimCount}
              {row.original.stock > 0 && (
                <span className="text-xs text-muted-foreground ml-1">
                  / {row.original.stock + claimCount}
                </span>
              )}
            </div>
          )
        }
      }
    ],
    [t]
  )
}
