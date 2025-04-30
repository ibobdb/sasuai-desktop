import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle
} from '@/components/ui/dialog'
import { CheckCircle2, XCircle, Receipt, CreditCard, ArrowRight, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Member, PaymentMethod } from '@/types/cashier'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { paymentMethods } from '@/lib/payment-methods'

interface PaymentStatusDialogProps {
  open: boolean
  onClose: () => void
  success: boolean
  transactionId?: string
  paymentMethod: PaymentMethod
  change?: number
  paymentAmount: number
  memberInfo?: {
    member: Member
    pointsInfo?: string
  }
  errorMessage?: string
}

export function PaymentStatusDialog({
  open,
  onClose,
  success,
  transactionId,
  paymentMethod,
  change = 0,
  paymentAmount,
  errorMessage
}: PaymentStatusDialogProps) {
  const { t } = useTranslation(['cashier'])
  const [copied, setCopied] = useState(false)

  // Format number with thousands separator
  const formatNumber = (value: number): string => {
    return value.toLocaleString('id-ID')
  }

  // Get payment method display name and icon
  const getPaymentMethodInfo = (method: PaymentMethod) => {
    const paymentMethod = paymentMethods.find((p) => p.value === method)
    if (paymentMethod) {
      const Icon = paymentMethod.icon
      return {
        name: paymentMethod.label,
        icon: <Icon className="h-4 w-4" />
      }
    }
    // Fallback
    return { name: 'Other', icon: <CreditCard className="h-4 w-4" /> }
  }

  const copyTransactionId = () => {
    if (transactionId) {
      navigator.clipboard.writeText(transactionId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const paymentInfo = getPaymentMethodInfo(paymentMethod)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] p-6">
        <DialogHeader className="pb-4">
          <div className="flex flex-col items-center text-center">
            {success ? (
              <>
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle2 className="h-10 w-10 text-green-500" />
                </div>
                <DialogTitle className="text-2xl font-semibold">
                  {t('cashier.paymentStatus.success')}
                </DialogTitle>
                <p className="text-muted-foreground mt-1">
                  {t('cashier.paymentStatus.successDescription')}
                </p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-3">
                  <XCircle className="h-10 w-10 text-red-500" />
                </div>
                <DialogTitle className="text-2xl font-semibold">
                  {t('cashier.paymentStatus.failed')}
                </DialogTitle>
                <p className="text-muted-foreground mt-1">
                  {t('cashier.paymentStatus.failedDescription')}
                </p>
              </>
            )}
          </div>
        </DialogHeader>

        {success ? (
          <div className="space-y-5 py-2">
            {/* Transaction ID */}
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Receipt className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {t('cashier.paymentStatus.transactionId')}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 text-xs flex items-center gap-1 hover:bg-muted-foreground/10"
                  onClick={copyTransactionId}
                >
                  <span className="font-mono truncate max-w-40">{transactionId}</span>
                  {copied ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </div>

            {/* Payment details */}
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-muted/50 p-3 rounded-lg">
                <span className="text-sm font-medium">
                  {t('cashier.paymentStatus.paymentMethod')}
                </span>
                <div className="flex items-center gap-2 bg-background px-3 py-1.5 rounded-md">
                  {paymentInfo.icon}
                  <span>{paymentInfo.name}</span>
                </div>
              </div>

              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    {t('cashier.paymentStatus.amountPaid')}
                  </span>
                  <span className="text-lg font-semibold">Rp {formatNumber(paymentAmount)}</span>
                </div>

                {/* Show change for cash payments */}
                {paymentMethod === 'cash' && change > 0 && (
                  <div className="flex justify-between items-center text-sm pt-3 mt-3 border-t border-border">
                    <div className="flex items-center text-green-600 dark:text-green-400">
                      <ArrowRight className="h-3.5 w-3.5 mr-1.5" />
                      <span className="font-medium">{t('cashier.paymentStatus.change')}</span>
                    </div>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      Rp {formatNumber(change)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-4 space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-red-600 dark:text-red-400">
                {errorMessage || t('cashier.paymentStatus.errorDefault')}
              </p>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  {t('cashier.paymentStatus.paymentMethod')}
                </span>
                <div className="flex items-center gap-2 bg-background px-3 py-1.5 rounded-md">
                  {paymentInfo.icon}
                  <span>{paymentInfo.name}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="pt-4">
          <Button
            onClick={onClose}
            className={cn(
              'w-full',
              success
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            )}
          >
            {success ? t('cashier.paymentStatus.close') : t('cashier.paymentStatus.tryAgain')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
