import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2, UserPlus, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { API_ENDPOINTS } from '@/config/api'
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
import { Member, CreateMemberDialogProps } from '@/types/cashier'

const REQUIRED_FIELDS = ['name', 'cardId', 'phone'] as const

export function CreateMemberDialog({ open, onOpenChange, onSuccess }: CreateMemberDialogProps) {
  const { t } = useTranslation(['cashier'])
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    address: '',
    cardId: '',
    phone: ''
  })

  const validateForm = () => {
    const formErrors: Record<string, string> = {}
    let isValid = true

    REQUIRED_FIELDS.forEach((field) => {
      if (!newMember[field].trim()) {
        formErrors[field] = t('cashier.fields.required', {
          field: field.charAt(0).toUpperCase() + field.slice(1)
        })
        isValid = false
      }
    })

    // Email validation if provided
    if (newMember.email && !/^\S+@\S+\.\S+$/.test(newMember.email)) {
      formErrors.email = t('cashier.fields.validEmail')
      isValid = false
    }

    // Phone validation
    if (newMember.phone && !/^[0-9+\-\s()]{6,15}$/.test(newMember.phone)) {
      formErrors.phone = t('cashier.fields.validPhone')
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

    setIsLoading(true)

    try {
      const memberData = {
        ...newMember,
        email: newMember.email.trim() === '' ? null : newMember.email,
        address: newMember.address.trim() === '' ? null : newMember.address
      }

      const response = (await window.api.request(API_ENDPOINTS.MEMBERS.BASE, {
        method: 'POST',
        data: memberData
      })) as { success: boolean; data: Member; message?: string }

      if (response.success) {
        toast.success(t('cashier.createMember.successTitle'), {
          description: t('cashier.createMember.successDescription', { name: newMember.name })
        })
        onSuccess(response.data)
        handleClose()
      } else {
        toast.error(t('cashier.createMember.errorTitle'), {
          description: response.message || t('cashier.createMember.errorDefault')
        })
      }
    } catch (error) {
      if (import.meta.env.DEV)
        if (import.meta.env.DEV) console.error('Error creating member:', error)
      toast.error(t('cashier.createMember.errorTitle'), {
        description: t('cashier.createMember.errorDefault')
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setNewMember({
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

  const handleInputChange = (field: keyof typeof newMember, value: string) => {
    setNewMember((prev) => ({ ...prev, [field]: value }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

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
            <UserPlus className="h-5 w-5 text-primary" />
            {t('cashier.createMember.title')}
          </DialogTitle>
          <DialogDescription>{t('cashier.createMember.description')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          <div className="grid gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-medium">
                {t('cashier.createMember.name')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                placeholder={`${t('cashier.createMember.name')}`}
                value={newMember.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}
                disabled={isLoading}
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cardId" className="font-medium">
                  {t('cashier.createMember.cardId')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="cardId"
                  type="text"
                  placeholder={`${t('cashier.createMember.cardId')}`}
                  value={newMember.cardId}
                  onChange={(e) => handleInputChange('cardId', e.target.value)}
                  className={errors.cardId ? 'border-red-500 focus-visible:ring-red-500' : ''}
                  disabled={isLoading}
                />
                {errors.cardId && <p className="text-red-500 text-sm">{errors.cardId}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="font-medium">
                  {t('cashier.createMember.phone')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder={`${t('cashier.createMember.phone')}`}
                  value={newMember.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={errors.phone ? 'border-red-500 focus-visible:ring-red-500' : ''}
                  disabled={isLoading}
                />
                {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="font-medium">
                {t('cashier.createMember.email')}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={`${t('cashier.createMember.email')} ${t('cashier.fields.optional')}`}
                value={newMember.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}
                disabled={isLoading}
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="font-medium">
                {t('cashier.createMember.address')}
              </Label>
              <Input
                id="address"
                type="text"
                placeholder={`${t('cashier.createMember.address')} ${t('cashier.fields.optional')}`}
                value={newMember.address}
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
              {t('cashier.createMember.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {t('cashier.createMember.creating')}
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  {t('cashier.createMember.create')}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
