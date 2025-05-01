import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ShieldAlert, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { API_ENDPOINTS } from '@/config/api'
import { Member } from '@/types/members'
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
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

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
  onSuccess: () => void // Callback for refreshing data after action
}

export function MemberBanActions({ member, onSuccess }: MemberBanActionsProps) {
  const { t } = useTranslation(['member', 'common'])
  const [showBanDialog, setShowBanDialog] = useState(false)
  const [isBanning, setIsBanning] = useState(false)
  const [isUnbanning, setIsUnbanning] = useState(false)

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

  const handleBan = async (values: BanFormValues) => {
    setIsBanning(true)
    try {
      const apiUrl = `${API_ENDPOINTS.MEMBERS.BASE}/${member.id}/ban`
      const payload = { reason: values.reason }

      const response = await window.api.request(apiUrl, {
        method: 'POST',
        data: payload
      })

      if (response && response.success) {
        toast.success(t('member.messages.banSuccess'), {
          description: t('member.messages.banSuccessDescription').replace('{name}', member.name)
        })
        setTimeout(() => onSuccess(), 500)
      } else {
        toast.error(t('member.messages.banError'), {
          description: response?.message || t('member.messages.banErrorDescription')
        })
      }
    } catch (error) {
      console.error('Failed to ban member:', error)
      toast.error(t('member.messages.banError'), {
        description: t('member.messages.banErrorDescription')
      })
    } finally {
      setIsBanning(false)
      setShowBanDialog(false)
      form.reset()
    }
  }

  const handleUnban = async () => {
    setIsUnbanning(true)
    try {
      const apiUrl = `${API_ENDPOINTS.MEMBERS.BASE}/${member.id}/unban`

      const response = await window.api.request(apiUrl, {
        method: 'POST'
      })

      if (response && response.success) {
        toast.success(t('member.messages.unbanSuccess'), {
          description: t('member.messages.unbanSuccessDescription').replace('{name}', member.name)
        })
        setTimeout(() => onSuccess(), 500)
      } else {
        toast.error(t('member.messages.unbanError'), {
          description: response?.message || t('member.messages.unbanErrorDescription')
        })
      }
    } catch (error) {
      console.error('Failed to unban member:', error)
      toast.error(t('member.messages.unbanError'), {
        description: t('member.messages.unbanErrorDescription')
      })
    } finally {
      setIsUnbanning(false)
    }
  }

  return (
    <>
      {/* Ban/Unban Dropdown Menu Item */}
      {isMemberBanned ? (
        <DropdownMenuItem
          className="text-green-500 focus:text-green-500 hover:text-green-500"
          onClick={handleUnban}
          disabled={isUnbanning}
        >
          {isUnbanning ? t('member.actions.unbanning') : t('member.actions.unban')}
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
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <AlertDialogFooter>
                <AlertDialogCancel disabled={isBanning} type="button">
                  {t('actions.cancel', { ns: 'common' })}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault()
                    submitBan()
                  }}
                  disabled={isBanning}
                  className="bg-orange-500 hover:bg-orange-600 focus:ring-orange-500"
                >
                  {isBanning ? t('member.ban.banning') : t('member.actions.ban')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </div>
          </Form>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
