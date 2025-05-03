import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { Member } from '@/types/members'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/common/data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'

// Function to get tier badge color classes
export const getTierBadgeVariant = (tier: string | undefined) => {
  const tierName = tier?.toLowerCase() || ''

  if (tierName.includes('bronze')) {
    return 'bg-amber-800 text-white hover:bg-amber-900'
  } else if (tierName.includes('silver')) {
    return 'bg-gray-400 text-black hover:bg-gray-500'
  } else if (tierName.includes('gold')) {
    return 'bg-yellow-500 text-black hover:bg-yellow-600'
  } else if (tierName.includes('platinum')) {
    return 'bg-blue-300 text-blue-950 hover:bg-blue-400'
  } else if (tierName.includes('diamond')) {
    return 'bg-cyan-500 text-white hover:bg-cyan-600'
  } else {
    return 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
  }
}

// Create a custom hook for getting translated columns
export function useMemberColumns(): ColumnDef<Member>[] {
  const { t } = useTranslation(['member'])

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
        accessorKey: 'cardId',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('member.table.cardId')} />
        ),
        cell: ({ row }) => <div className="font-medium">{row.getValue('cardId') as string}</div>
      },
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('member.table.name')} />
        ),
        cell: ({ row }) => <div className="font-medium">{row.getValue('name') as string}</div>,
        enableHiding: false
      },
      {
        accessorKey: 'phone',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('member.table.phone')} />
        ),
        cell: ({ row }) => <div>{row.getValue('phone') as string}</div>
      },
      {
        accessorKey: 'email',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('member.table.email')} />
        ),
        cell: ({ row }) => {
          const email = row.getValue('email') as string | null
          return <div>{email || <span className="text-muted-foreground">-</span>}</div>
        }
      },
      {
        accessorKey: 'address',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('member.table.address')} />
        ),
        cell: ({ row }) => {
          const address = row.getValue('address') as string | null
          return <div>{address || <span className="text-muted-foreground">-</span>}</div>
        }
      },
      {
        accessorKey: 'totalPoints',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('member.table.points')} />
        ),
        cell: ({ row }) => <div>{row.getValue('totalPoints') as number} pts</div>
      },
      {
        id: 'tier',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('member.table.tier')} />
        ),
        cell: ({ row }) => {
          const tierName = row.original.tier?.name
          return (
            <Badge className={`capitalize ${getTierBadgeVariant(tierName)}`}>
              {tierName || t('member.tiers.regular')}
            </Badge>
          )
        },
        filterFn: (row, value) => {
          return value.includes(row.original.tier?.name || 'regular')
        }
      },
      {
        id: 'status',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('member.table.status')} />
        ),
        cell: ({ row }) => {
          const isBanned = row.original.isBanned
          return (
            <Badge variant={isBanned ? 'destructive' : 'default'} className="capitalize">
              {isBanned ? t('member.fields.banned') : t('member.fields.active')}
            </Badge>
          )
        },
        filterFn: (row, value) => {
          if (value === 'all') return true
          return value === 'banned' ? Boolean(row.original.isBanned) : !row.original.isBanned
        }
      },
      {
        accessorKey: 'createdAt',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('member.table.createdAt')} />
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
        cell: DataTableRowActions
      }
    ],
    [t]
  )
}
