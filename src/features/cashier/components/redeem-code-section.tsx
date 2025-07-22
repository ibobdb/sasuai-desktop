import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Ticket, X, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Discount } from '@/types/cashier'
import { API_ENDPOINTS } from '@/config/api'

interface RedeemCodeSectionProps {
  onApplyDiscount: (discount: Discount | null) => void
  appliedDiscount: Discount | null
  disabled?: boolean
  disabledReason?: string
  subtotal: number
}

export function RedeemCodeSection({
  onApplyDiscount,
  appliedDiscount,
  disabled = false,
  disabledReason,
  subtotal
}: RedeemCodeSectionProps) {
  const { t } = useTranslation(['cashier'])
  const [code, setCode] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const validateCode = async () => {
    if (!code.trim()) {
      toast.error(t('cashier.redeemCode.emptyCode'))
      return
    }

    setIsLoading(true)

    try {
      const response = await window.api.request(
        `${API_ENDPOINTS.DISCOUNTS.BASE}?code=${encodeURIComponent(code.trim())}`,
        {
          method: 'GET'
        }
      )

      if (response.success && response.discount) {
        const discount = response.discount as Discount

        // Check minimum purchase requirement
        if (discount.minPurchase && subtotal < discount.minPurchase) {
          toast.error(t('cashier.redeemCode.minimumPurchaseNotMet'), {
            description: t('cashier.redeemCode.minimumPurchaseRequired', {
              amount: discount.minPurchase.toLocaleString()
            })
          })
          return
        }

        // Apply the discount
        onApplyDiscount(discount)
        toast.success(t('cashier.redeemCode.codeApplied'), {
          description: t('cashier.redeemCode.discountAdded', { name: discount.name })
        })
        setCode('')
      } else {
        toast.error(t('cashier.redeemCode.invalidCode'), {
          description: response.message || t('cashier.redeemCode.tryAnotherCode')
        })
      }
    } catch (error) {
      console.error('Error validating discount code:', error)
      toast.error(t('cashier.redeemCode.validationError'), {
        description: t('cashier.redeemCode.tryAgainLater')
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      validateCode()
    }
  }

  const removeDiscount = () => {
    onApplyDiscount(null)
    toast.info(t('cashier.redeemCode.discountRemoved'))
  }

  const formatDiscountValue = (discount: Discount) => {
    return discount.type === 'PERCENTAGE'
      ? `${discount.value}%`
      : `Rp ${discount.value.toLocaleString()}`
  }

  // If a discount is already applied, show details
  if (appliedDiscount) {
    return (
      <Card className="p-3">
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-2">
            <Ticket className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <h3 className="font-medium">{appliedDiscount.name}</h3>
              <p className="text-sm text-muted-foreground">
                {appliedDiscount.code && (
                  <span className="font-mono text-xs mr-2">{appliedDiscount.code}</span>
                )}
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {formatDiscountValue(appliedDiscount)}
                </Badge>
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={removeDiscount}
            className="h-7 px-2 text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-3">
      <div className="space-y-3">
        <div className="flex items-center">
          <Ticket className="h-4 w-4 mr-2 text-muted-foreground" />
          <h3 className="font-medium text-sm">{t('cashier.redeemCode.title')}</h3>
        </div>

        {disabled ? (
          <div className="text-sm text-muted-foreground bg-muted/30 p-2 rounded-md">
            {disabledReason || t('cashier.redeemCode.alreadyHasDiscount')}
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('cashier.redeemCode.placeholder')}
              className="h-9 uppercase"
              disabled={isLoading}
              data-redeem-input
            />
            <Button
              onClick={validateCode}
              disabled={isLoading || !code.trim()}
              className="shrink-0"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <Ticket className="h-4 w-4 mr-1" />
              )}
              {t('cashier.redeemCode.apply')}
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
