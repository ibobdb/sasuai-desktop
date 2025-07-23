import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { useTranslation } from 'react-i18next'
import { useState, memo } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { User, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Member, MemberDeleteResponse } from '@/types/members'
import { memberOperations } from '../actions/member-operations'
import { MemberBanActions } from './member-ban-actions'

interface DataTableRowActionsProps {
  member: Member
  onEdit?: (member: Member) => void
  onView?: (member: Member) => void
}

export function DataTableRowActions({ member, onEdit, onView }: DataTableRowActionsProps) {
  const { t } = useTranslation(['member', 'common'])
  const queryClient = useQueryClient()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Custom delete member mutation with proper name interpolation
  const deleteMemberMutation = useMutation<MemberDeleteResponse, Error, string>({
    mutationFn: memberOperations.deleteItem,
    onSuccess: (response) => {
      if (response.success) {
        toast.success(t('member.messages.deleteSuccess'), {
          description: t('member.messages.deleteSuccessDescription').replace('{name}', member.name)
        })
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['members'] })
      } else {
        toast.error(t('member.messages.deleteError'), {
          description: response.message || t('member.messages.deleteErrorDescription')
        })
      }
    },
    onError: (error) => {
      if (import.meta.env.DEV)
        if (import.meta.env.DEV) console.error('Error deleting member:', error)
      toast.error(t('member.messages.deleteError'), {
        description: t('member.messages.deleteErrorDescription')
      })
    }
  })

  const handleDelete = async () => {
    deleteMemberMutation.mutate(member.id)
    setShowDeleteDialog(false)
  }

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="data-[state=open]:bg-muted flex h-8 w-8 p-0">
            <DotsHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem onClick={() => onView?.(member)}>
            {t('member.actions.view')}
            <DropdownMenuShortcut>
              <User size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onEdit?.(member)}>
            {t('member.actions.edit')}
            <DropdownMenuShortcut>
              <Pencil size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />

          {/* Ban/Unban Actions */}
          <MemberBanActions member={member} />

          <DropdownMenuItem
            className="text-red-500 focus:text-red-500 hover:text-red-500"
            onClick={() => setShowDeleteDialog(true)}
          >
            {t('member.actions.delete')}
            <DropdownMenuShortcut>
              <Trash2 size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('member.delete.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('member.delete.description').replace('{name}', member.name)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMemberMutation.isPending}>
              {t('actions.cancel', { ns: 'common' })}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={deleteMemberMutation.isPending}
              className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
            >
              {deleteMemberMutation.isPending
                ? t('member.delete.deleting')
                : t('member.actions.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
