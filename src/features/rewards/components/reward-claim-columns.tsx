import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ColumnDef } from '@tanstack/react-table'
import { RewardClaim } from '@/types/rewards'
import { DataTableColumnHeader } from '@/components/common/data-table-column-header'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'

export function useRewardClaimColumns(): ColumnDef<RewardClaim>[] {
  const { t } = useTranslation(['rewards'])

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
        accessorKey: 'claimDate',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('table.dateClaimed')} />
        ),
        cell: ({ row }) => {
          const date = new Date(row.getValue('claimDate') as string)
          return (
            <div>
              <div className="font-medium">{format(date, 'MMM d, yyyy')}</div>
              <div className="text-xs text-muted-foreground">{format(date, 'h:mm a')}</div>
            </div>
          )
        },
        enableSorting: true
      },
      {
        accessorKey: 'reward.name',
        header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.reward')} />,
        cell: ({ row }) => {
          const reward = row.original.reward
          return (
            <div>
              <div className="font-medium">{reward.name}</div>
              <div className="text-xs text-amber-600">
                {reward.pointsCost.toLocaleString()} {t('table.points')}
              </div>
            </div>
          )
        }
      },
      {
        accessorKey: 'member.name',
        header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.member')} />,
        cell: ({ row }) => {
          const member = row.original.member
          return (
            <div>
              <div className="font-medium">{member.name}</div>
              <div className="text-xs text-muted-foreground">{member.phone}</div>
            </div>
          )
        }
      },
      {
        accessorKey: 'member.totalPoints',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('table.currentPoints')} />
        ),
        cell: ({ row }) => {
          const member = row.original.member
          return (
            <div className="font-medium text-amber-600">
              {member.totalPoints.toLocaleString()} {t('table.points')}
            </div>
          )
        }
      },
      {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.status')} />,
        cell: ({ row }) => {
          const status = row.getValue('status') as string

          let variant: 'default' | 'outline' | 'secondary' | 'destructive' = 'default'

          switch (status) {
            case 'Claimed':
              variant = 'default'
              break
            case 'Cancelled':
              variant = 'destructive'
              break
            case 'Pending':
              variant = 'outline'
              break
            default:
              variant = 'secondary'
          }

          return <Badge variant={variant}>{status}</Badge>
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id))
        }
      }
    ],
    [t]
  )
}
