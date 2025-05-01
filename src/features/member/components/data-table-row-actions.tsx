import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Row } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { User, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useMembers } from '../context/member-context'
import { Member } from '@/types/members'
import { API_ENDPOINTS } from '@/config/api'
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
import { useState } from 'react'

interface DataTableRowActionsProps {
  row: Row<Member>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { t } = useTranslation(['member'])
  const { setOpen, setCurrentMember, applyFilters } = useMembers()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await window.api.request(
        `${API_ENDPOINTS.MEMBERS.BASE}/${row.original.id}`,
        {
          method: 'DELETE'
        }
      )

      if (response.success) {
        toast.success(t('member.messages.deleteSuccess'), {
          description: t('member.messages.deleteSuccessDescription', { name: row.original.name })
        })
        applyFilters() // Refresh the list
      } else {
        toast.error(t('member.messages.deleteError'), {
          description: response.message || t('member.messages.deleteErrorDescription')
        })
      }
    } catch (error) {
      console.error('Failed to delete member:', error)
      toast.error(t('member.messages.deleteError'), {
        description: t('member.messages.deleteErrorDescription')
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
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
          <DropdownMenuItem
            onClick={() => {
              setCurrentMember(row.original)
              setOpen('view')
            }}
          >
            {t('member.actions.view')}
            <DropdownMenuShortcut>
              <User size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setCurrentMember(row.original)
              setOpen('edit')
            }}
          >
            {t('member.actions.edit')}
            <DropdownMenuShortcut>
              <Pencil size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
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
              {t('member.delete.description', { name: row.original.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>{t('actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
            >
              {isDeleting ? t('member.delete.deleting') : t('member.actions.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
