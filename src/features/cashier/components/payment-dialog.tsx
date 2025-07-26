import { useRef, memo, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { CreditCard, Loader2, X as XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PaymentMethod } from '@/types/cashier'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { paymentMethods } from '@/lib/payment-methods'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import PaymentInput from './payment-input'

interface PaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  total: number
  paymentMethod: PaymentMethod
  paymentAmount: number
  onPaymentMethodChange: (method: PaymentMethod) => void
  onPaymentAmountChange: (amount: number) => void
  onPay: () => Promise<void>
  isPayEnabled: boolean
  isProcessing: boolean
}

function PaymentDialog({
  open,
  onOpenChange,
  total,
  paymentMethod,
  paymentAmount,
  onPaymentMethodChange,
  onPaymentAmountChange,
  onPay,
  isPayEnabled,
  isProcessing
}: PaymentDialogProps) {
  const { t } = useTranslation(['cashier'])
  const payButtonRef = useRef<HTMLButtonElement>(null)

  const formatNumber = useCallback((value: number): string => value.toLocaleString('id-ID'), [])

  const getPaymentMethodIcon = useCallback((method: PaymentMethod) => {
    const paymentMethod = paymentMethods.find((p) => p.value === method)
    if (paymentMethod) {
      const Icon = paymentMethod.icon
      return <Icon className="h-4 w-4 mr-2" />
    }
    return null
  }, [])

  const dialogClassName = useMemo(
    () =>
      cn('p-0 overflow-hidden', paymentMethod === 'cash' ? 'sm:max-w-[850px]' : 'sm:max-w-[500px]'),
    [paymentMethod]
  )

  // Removed auto-fill payment amount logic

  return (
    <Dialog open={open} onOpenChange={isProcessing ? () => {} : onOpenChange}>
      <DialogContent className={dialogClassName} aria-describedby="payment-dialog-description">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>{t('cashier.payment.title')}</DialogTitle>
          <DialogDescription id="payment-dialog-description">
            {t('cashier.payment.description')}
          </DialogDescription>
        </DialogHeader>

        <div
          className={cn(
            'h-full',
            paymentMethod === 'cash' ? 'grid grid-cols-1 lg:grid-cols-2' : 'block'
          )}
        >
          <div className={cn('p-6 pt-0', paymentMethod === 'cash' ? 'border-r' : '')}>
            <div className="space-y-4">
              <div className="bg-primary/10 rounded-md p-3 flex justify-between items-center">
                <span className="font-medium">{t('cashier.payment.totalToPay')}</span>
                <span className="font-bold text-lg">Rp {formatNumber(total)}</span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">{t('cashier.payment.selectMethod')}</Label>
                <Select
                  value={paymentMethod}
                  onValueChange={(value: PaymentMethod) => onPaymentMethodChange(value)}
                >
                  <SelectTrigger className="w-full h-11" autoFocus={false}>
                    <SelectValue placeholder={t('cashier.payment.selectMethod')}>
                      <div className="flex items-center">
                        {getPaymentMethodIcon(paymentMethod)}
                        <span>
                          {paymentMethods.find((p) => p.value === paymentMethod)?.label ||
                            paymentMethod}
                        </span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        <div className="flex items-center">
                          <method.icon className="h-4 w-4 mr-2" />
                          {method.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {paymentMethod === 'cash' && (
                <div className="space-y-2">
                  <Label>{t('cashier.payment.quickCash')}</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={paymentAmount === total ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onPaymentAmountChange(total)}
                      className="text-sm h-12 font-medium"
                    >
                      💰 {t('cashier.payment.exactAmount')}
                    </Button>
                    {[20000, 50000, 100000, 200000].map((amount) => (
                      <Button
                        key={amount}
                        variant={paymentAmount === amount ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => onPaymentAmountChange(amount)}
                        className="text-sm h-12"
                      >
                        Rp {formatNumber(amount)}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {paymentMethod !== 'cash' && (
                <div className="space-y-3">
                  <div className="bg-accent/20 rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center mb-3">
                      {getPaymentMethodIcon(paymentMethod)}
                      <span className="font-medium text-lg ml-2">
                        {paymentMethods.find((p) => p.value === paymentMethod)?.label}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      {t('cashier.payment.paymentAmount')}
                    </div>
                    <div className="text-3xl font-bold text-primary">Rp {formatNumber(total)}</div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground bg-muted/50 rounded-md p-3">
                      {paymentMethod === 'debit' && t('cashier.payment.instructions.debit')}
                      {paymentMethod === 'e-wallet' && t('cashier.payment.instructions.ewallet')}
                      {paymentMethod === 'qris' && t('cashier.payment.instructions.qris')}
                      {paymentMethod === 'transfer' && t('cashier.payment.instructions.transfer')}
                      {paymentMethod === 'other' && t('cashier.payment.instructions.other')}
                    </p>
                  </div>
                </div>
              )}

              {paymentMethod === 'cash' && paymentAmount > total && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-md p-3 flex justify-between items-center">
                  <span className="font-medium">{t('cashier.paymentStatus.change')}:</span>
                  <span className="font-bold text-lg text-green-600 dark:text-green-400">
                    Rp {formatNumber(paymentAmount - total)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {paymentMethod === 'cash' && (
            <PaymentInput
              onPaymentAmountChange={onPaymentAmountChange}
              isDialogOpen={open}
              onTabToPayButton={() => payButtonRef.current?.focus()}
              externalAmount={paymentAmount}
            />
          )}
        </div>

        <DialogFooter className="p-6 pt-2 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
            className="mr-auto"
            tabIndex={3}
          >
            <XIcon className="mr-2 h-4 w-4" /> {t('cashier.payment.cancel')}
          </Button>
          <Button
            ref={payButtonRef}
            onClick={onPay}
            disabled={!isPayEnabled || isProcessing}
            size="lg"
            className="min-w-[180px] relative"
            tabIndex={2}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('cashier.payment.processing')}
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" /> {t('cashier.payment.payNow')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default memo(PaymentDialog)
