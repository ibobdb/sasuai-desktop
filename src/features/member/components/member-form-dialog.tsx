import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { UserPlus, Pencil, Loader2, X } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Member } from '@/types/members'
import { useMembers } from '../context/member-context'

interface MemberFormDialogProps {
  open: boolean
  mode: 'create' | 'edit'
  onOpenChange: (open: boolean) => void
  currentMember: Member | null
}

const REQUIRED_FIELDS = ['name', 'cardId', 'phone'] as const

// Available tier options
const tierOptions = [
  { value: 'regular', label: 'Regular' }, // Changed from empty string to 'regular'
  { value: 'bronze', label: 'Bronze' },
  { value: 'silver', label: 'Silver' },
  { value: 'gold', label: 'Gold' },
  { value: 'platinum', label: 'Platinum' },
  { value: 'diamond', label: 'Diamond' }
]

export function MemberFormDialog({
  open,
  mode,
  onOpenChange,
  currentMember
}: MemberFormDialogProps) {
  const { t } = useTranslation(['member'])
  const { applyFilters } = useMembers()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    cardId: '',
    phone: '',
    tier: '',
    totalPoints: 0
  })

  // Load current member data when editing
  useEffect(() => {
    if (mode === 'edit' && currentMember) {
      setFormData({
        name: currentMember.name || '',
        email: currentMember.email || '',
        address: currentMember.address || '',
        cardId: currentMember.cardId || '',
        phone: currentMember.phone || '',
        tier: currentMember.tier?.name?.toLowerCase() || '',
        totalPoints: currentMember.totalPoints || 0
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
          field: field.charAt(0).toUpperCase() + field.slice(1)
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

    setIsLoading(true)

    try {
      const memberData = {
        ...formData,
        email: formData.email.trim() === '' ? null : formData.email,
        address: formData.address.trim() === '' ? null : formData.address,
        tier: formData.tier || null
      }

      const endpoint =
        mode === 'create'
          ? API_ENDPOINTS.MEMBERS.BASE
          : `${API_ENDPOINTS.MEMBERS.BASE}/${currentMember?.id}`

      const method = mode === 'create' ? 'POST' : 'PUT'

      const response = await window.api.request(endpoint, {
        method,
        data: memberData
      })

      if (response.success) {
        toast.success(
          mode === 'create' ? t('member.form.createSuccess') : t('member.form.updateSuccess'),
          {
            description: t(
              mode === 'create'
                ? 'member.form.createSuccessDescription'
                : 'member.form.updateSuccessDescription',
              { name: formData.name }
            )
          }
        )

        // Refresh the members list
        applyFilters()
        handleClose()
      } else {
        toast.error(
          mode === 'create' ? t('member.form.createError') : t('member.form.updateError'),
          {
            description: response.message || t('member.form.errorDefault')
          }
        )
      }
    } catch (error) {
      console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} member:`, error)
      toast.error(mode === 'create' ? t('member.form.createError') : t('member.form.updateError'), {
        description: t('member.form.errorDefault')
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      email: '',
      cardId: '',
      phone: '',
      tier: '',
      totalPoints: 0
    })
    setErrors({})
  }

  const handleClose = () => {
    if (!isLoading) {
      resetForm()
      onOpenChange(false)
    }
  }

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tier" className="font-medium">
                  {t('member.fields.tier')}
                </Label>
                <Select
                  value={formData.tier}
                  onValueChange={(value) => handleInputChange('tier', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('member.fields.tierPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {tierOptions.map((tier) => (
                      <SelectItem key={tier.value} value={tier.value}>
                        {tier.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalPoints" className="font-medium">
                  {t('member.fields.totalPoints')}
                </Label>
                <Input
                  id="totalPoints"
                  type="number"
                  min="0"
                  placeholder={t('member.fields.pointsPlaceholder')}
                  value={formData.totalPoints}
                  onChange={(e) => handleInputChange('totalPoints', parseInt(e.target.value) || 0)}
                  disabled={isLoading}
                />
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
              {t('actions.cancel')}
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
