import { useState, memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Ticket, X, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Discount } from '@/types/cashier'
import { cashierOperations } from '@/features/cashier/actions/cashier-operations'

interface RedeemCodeSectionProps {
  onApplyDiscount: (discount: Discount | null) => void
  appliedDiscount: Discount | null
  disabled?: boolean
  disabledReason?: string
  subtotal: number
}

function RedeemCodeSectionComponent({
  onApplyDiscount,
  appliedDiscount,
  disabled = false,
  disabledReason
}: RedeemCodeSectionProps) {
  const { t } = useTranslation(['cashier'])
  const [code, setCode] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const formatDiscount = useCallback((discount: Discount) => {
    return discount.type === 'PERCENTAGE'
      ? `${discount.value}%`
      : `Rp ${discount.value.toLocaleString()}`
  }, [])

  const validateCode = useCallback(async () => {
    if (!code.trim()) {
      return
    }

    setIsLoading(true)

    try {
      const response = await cashierOperations.validateDiscountCode({
        code: code.trim()
      })

      if (response.success && response.discount) {
        const discount = response.discount
        onApplyDiscount(discount)
        setCode('')
        toast.success(t('cashier.redeemCode.success'), {
          description: `${discount.name} (${formatDiscount(discount)})`
        })
      } else {
        toast.error(t('cashier.redeemCode.invalidCode'))
      }
    } catch (error) {
      console.error('Error validating discount code:', error)
      toast.error(t('cashier.redeemCode.error'))
    } finally {
      setIsLoading(false)
    }
  }, [code, onApplyDiscount, t, formatDiscount])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        validateCode()
      }
    },
    [validateCode]
  )

  const removeDiscount = useCallback(() => {
    onApplyDiscount(null)
    toast.success(t('cashier.redeemCode.removed'))
  }, [onApplyDiscount, t])

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-medium flex items-center">
            <Ticket className="h-4 w-4 mr-2" />
            {t('cashier.redeemCode.title')}
          </h3>
        </div>

        {appliedDiscount ? (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center">
                  <Badge variant="outline" className="text-green-700 dark:text-green-300 mr-2">
                    {appliedDiscount.name}
                  </Badge>
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    {formatDiscount(appliedDiscount)}
                  </span>
                </div>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  {t('cashier.redeemCode.applied')}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={removeDiscount}
                className="text-red-600 hover:text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : disabled ? (
          <div className="bg-muted/50 border border-dashed rounded-md p-3 text-center">
            <p className="text-sm text-muted-foreground">{disabledReason}</p>
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

export const RedeemCodeSection = memo(RedeemCodeSectionComponent)
