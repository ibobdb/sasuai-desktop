import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { UserPlus, Pencil, Loader2, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Member,
  CreateMemberData,
  UpdateMemberData,
  MemberCreateResponse,
  MemberUpdateResponse
} from '@/types/members'
import { memberOperations } from '../actions/member-operations'

interface MemberFormDialogProps {
  open: boolean
  mode: 'create' | 'edit'
  onOpenChange: (open: boolean) => void
  currentMember: Member | null
  onSuccess?: () => void
}

const REQUIRED_FIELDS = ['name', 'cardId', 'phone'] as const

export function MemberFormDialog({
  open,
  mode,
  onOpenChange,
  currentMember,
  onSuccess
}: MemberFormDialogProps) {
  const { t } = useTranslation(['member', 'common'])
  const queryClient = useQueryClient()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    cardId: '',
    phone: ''
  })

  // Custom create member mutation with proper name interpolation
  const createMemberMutation = useMutation<MemberCreateResponse, Error, CreateMemberData>({
    mutationFn: memberOperations.createItem,
    onSuccess: (response) => {
      if (response.success) {
        toast.success(t('member.form.createSuccess'), {
          description: t('member.form.createSuccessDescription').replace('{name}', formData.name)
        })
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['members'] })
      } else {
        toast.error(t('member.form.createError'), {
          description: response.message || t('member.form.errorDefault')
        })
      }
    },
    onError: (error) => {
      console.error('Error creating member:', error)
      toast.error(t('member.form.createError'), {
        description: t('member.form.errorDefault')
      })
    }
  })

  // Custom update member mutation with proper name interpolation
  const updateMemberMutation = useMutation<MemberUpdateResponse, Error, UpdateMemberData>({
    mutationFn: memberOperations.updateItem,
    onSuccess: (response, variables) => {
      if (response.success) {
        toast.success(t('member.form.updateSuccess'), {
          description: t('member.form.updateSuccessDescription').replace('{name}', formData.name)
        })
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['members'] })
        queryClient.invalidateQueries({ queryKey: ['member-detail', variables.id] })
      } else {
        toast.error(t('member.form.updateError'), {
          description: response.message || t('member.form.errorDefault')
        })
      }
    },
    onError: (error) => {
      console.error('Error updating member:', error)
      toast.error(t('member.form.updateError'), {
        description: t('member.form.errorDefault')
      })
    }
  })

  // Compute loading state from mutations
  const isLoading = createMemberMutation.isPending || updateMemberMutation.isPending

  // Load current member data when editing
  useEffect(() => {
    if (mode === 'edit' && currentMember) {
      setFormData({
        name: currentMember.name || '',
        email: currentMember.email || '',
        address: currentMember.address || '',
        cardId: currentMember.cardId || '',
        phone: currentMember.phone || ''
      })
    } else if (mode === 'create') {
      // Reset form for create mode
      resetForm()
    }
  }, [mode, currentMember, open])

  const validateForm = () => {
    const formErrors: Record<string, string> = {}
    let isValid = true

    REQUIRED_FIELDS.forEach((field) => {
      if (!formData[field].trim()) {
        formErrors[field] = t('member.fields.required', {
          field: t(`member.fields.${field}`)
        })
        isValid = false
      }
    })

    // Email validation if provided
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      formErrors.email = t('member.fields.validEmail')
      isValid = false
    }

    // Phone validation
    if (formData.phone && !/^[0-9+\-\s()]{6,15}$/.test(formData.phone)) {
      formErrors.phone = t('member.fields.validPhone')
      isValid = false
    }

    setErrors(formErrors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const memberData = {
      ...formData,
      email: formData.email.trim() === '' ? null : formData.email,
      address: formData.address.trim() === '' ? null : formData.address
    }

    if (mode === 'create') {
      createMemberMutation.mutate(memberData, {
        onSuccess: () => {
          handleClose()
          onSuccess?.()
        }
      })
    } else if (currentMember) {
      updateMemberMutation.mutate(
        { ...memberData, id: currentMember.id },
        {
          onSuccess: () => {
            handleClose()
            onSuccess?.()
          }
        }
      )
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      email: '',
      cardId: '',
      phone: ''
    })
    setErrors({})
  }

  const handleClose = () => {
    if (!isLoading) {
      resetForm()
      onOpenChange(false)
    }
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear error when user starts typing
    if (errors[field as string]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const dialogTitle = mode === 'create' ? t('member.form.createTitle') : t('member.form.editTitle')
  const dialogDescription =
    mode === 'create' ? t('member.form.createDescription') : t('member.form.editDescription')
  const submitButtonText =
    mode === 'create' ? t('member.actions.create') : t('member.actions.update')

  return (
    <Dialog open={open} onOpenChange={isLoading ? () => {} : onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogClose
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          onClick={handleClose}
          disabled={isLoading}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>

        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {mode === 'create' ? (
              <UserPlus className="h-5 w-5 text-primary" />
            ) : (
              <Pencil className="h-5 w-5 text-primary" />
            )}
            {dialogTitle}
          </DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          <div className="grid gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-medium">
                {t('member.fields.name')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                placeholder={t('member.fields.namePlaceholder')}
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}
                disabled={isLoading}
                autoFocus={mode === 'create'}
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cardId" className="font-medium">
                  {t('member.fields.cardId')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="cardId"
                  type="text"
                  placeholder={t('member.fields.cardIdPlaceholder')}
                  value={formData.cardId}
                  onChange={(e) => handleInputChange('cardId', e.target.value)}
                  className={errors.cardId ? 'border-red-500 focus-visible:ring-red-500' : ''}
                  disabled={isLoading || mode === 'edit'} // Card ID should not be editable
                />
                {errors.cardId && <p className="text-red-500 text-sm">{errors.cardId}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="font-medium">
                  {t('member.fields.phone')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder={t('member.fields.phonePlaceholder')}
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={errors.phone ? 'border-red-500 focus-visible:ring-red-500' : ''}
                  disabled={isLoading}
                />
                {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="font-medium">
                {t('member.fields.email')}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={`${t('member.fields.emailPlaceholder')} (${t('member.fields.optional')})`}
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}
                disabled={isLoading}
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="font-medium">
                {t('member.fields.address')}
              </Label>
              <Input
                id="address"
                type="text"
                placeholder={`${t('member.fields.addressPlaceholder')} (${t('member.fields.optional')})`}
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <DialogFooter className="pt-2 flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {t('actions.cancel', { ns: 'common' })}
            </Button>
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {mode === 'create' ? t('member.actions.creating') : t('member.actions.updating')}
                </>
              ) : (
                <>
                  {mode === 'create' ? (
                    <UserPlus className="h-4 w-4 mr-2" />
                  ) : (
                    <Pencil className="h-4 w-4 mr-2" />
                  )}
                  {submitButtonText}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
