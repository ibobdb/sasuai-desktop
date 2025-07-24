import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ShieldAlert, ShieldCheck } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Member, BanMemberData, MemberBanResponse } from '@/types/members'
import { banMember, unbanMember } from '../actions/member-operations'
import { DropdownMenuItem, DropdownMenuShortcut } from '@/components/ui/dropdown-menu'
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
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

// Form schema for ban reason
const banFormSchema = z.object({
  reason: z
    .string()
    .min(3, {
      message: 'Ban reason must be at least 3 characters.'
    })
    .max(500, {
      message: 'Ban reason must not exceed 500 characters.'
    })
})

type BanFormValues = z.infer<typeof banFormSchema>

interface MemberBanActionsProps {
  member: Member
}

export function MemberBanActions({ member }: MemberBanActionsProps) {
  const { t } = useTranslation(['member', 'common'])
  const [showBanDialog, setShowBanDialog] = useState(false)
  const queryClient = useQueryClient()

  // Ban member mutation with member name in closure
  const banMemberMutation = useMutation<
    MemberBanResponse,
    Error,
    { id: string; data: BanMemberData }
  >({
    mutationFn: ({ id, data }: { id: string; data: BanMemberData }) => banMember(id, data),
    onSuccess: (response, variables) => {
      if (response.success) {
        toast.success(t('member.messages.banSuccess'), {
          description: t('member.messages.banSuccessDescription').replace('{name}', member.name)
        })
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['members'] })
        queryClient.invalidateQueries({ queryKey: ['member-detail', variables.id] })
      } else {
        toast.error(t('member.messages.banError'), {
          description: response.message || t('member.messages.banErrorDescription')
        })
      }
    },
    onError: (error) => {
      if (import.meta.env.DEV)
        if (import.meta.env.DEV) console.error('Error banning member:', error)
      toast.error(t('member.messages.banError'), {
        description: t('member.messages.banErrorDescription')
      })
    }
  })

  // Unban member mutation with member name in closure
  const unbanMemberMutation = useMutation<MemberBanResponse, Error, string>({
    mutationFn: unbanMember,
    onSuccess: (response, memberId) => {
      if (response.success) {
        toast.success(t('member.messages.unbanSuccess'), {
          description: t('member.messages.unbanSuccessDescription').replace('{name}', member.name)
        })
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['members'] })
        queryClient.invalidateQueries({ queryKey: ['member-detail', memberId] })
      } else {
        toast.error(t('member.messages.unbanError'), {
          description: response.message || t('member.messages.unbanErrorDescription')
        })
      }
    },
    onError: (error) => {
      if (import.meta.env.DEV)
        if (import.meta.env.DEV) console.error('Error unbanning member:', error)
      toast.error(t('member.messages.unbanError'), {
        description: t('member.messages.unbanErrorDescription')
      })
    }
  })

  const isMemberBanned = Boolean(member.isBanned)

  // Setup form for ban reason
  const form = useForm<BanFormValues>({
    resolver: zodResolver(banFormSchema),
    defaultValues: {
      reason: ''
    }
  })

  // Function to manually submit the form
  const submitBan = () => {
    const values = form.getValues()
    if (!form.formState.isValid) {
      form.trigger()
      return
    }
    handleBan(values)
  }

  const handleBan = (values: BanFormValues) => {
    banMemberMutation.mutate(
      { id: member.id, data: { reason: values.reason } },
      {
        onSuccess: () => {
          setShowBanDialog(false)
          form.reset()
        }
      }
    )
  }

  const handleUnban = () => {
    unbanMemberMutation.mutate(member.id)
  }

  return (
    <>
      {/* Ban/Unban Dropdown Menu Item */}
      {isMemberBanned ? (
        <DropdownMenuItem
          className="text-green-500 focus:text-green-500 hover:text-green-500"
          onClick={handleUnban}
          disabled={unbanMemberMutation.isPending}
        >
          {unbanMemberMutation.isPending
            ? t('member.actions.unbanning')
            : t('member.actions.unban')}
          <DropdownMenuShortcut>
            <ShieldCheck size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      ) : (
        <DropdownMenuItem
          className="text-orange-500 focus:text-orange-500 hover:text-orange-500"
          onSelect={(e) => {
            e.preventDefault()
            setShowBanDialog(true)
          }}
        >
          {t('member.actions.ban')}
          <DropdownMenuShortcut>
            <ShieldAlert size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      )}

      {/* Ban Dialog */}
      <AlertDialog
        open={showBanDialog}
        onOpenChange={(open) => {
          if (open === false) {
            form.reset()
          }
          setShowBanDialog(open)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('member.ban.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('member.ban.description').replace('{name}', member.name)}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <Form {...form}>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="reason">{t('member.ban.reasonLabel')}</Label>
                    <FormControl>
                      <Textarea
                        id="reason"
                        placeholder={t('member.ban.reasonPlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Form>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={banMemberMutation.isPending}>
              {t('actions.cancel', { ns: 'common' })}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                submitBan()
              }}
              disabled={banMemberMutation.isPending}
              className="bg-orange-500 hover:bg-orange-600 focus:ring-orange-500"
            >
              {banMemberMutation.isPending ? t('member.ban.banning') : t('member.actions.ban')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
