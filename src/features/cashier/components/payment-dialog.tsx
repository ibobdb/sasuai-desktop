import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { CreditCard, Loader2, X as XIcon, Delete, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PaymentMethod } from '@/types/cashier'
import { Input } from '@/components/ui/input'
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

export default function PaymentDialog({
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
  const [inputFocused, setInputFocused] = useState(false)
  const [amountString, setAmountString] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const payButtonRef = useRef<HTMLButtonElement>(null)

  // Format number with thousands separator (for display only)
  const formatNumber = (value: number): string => {
    return value.toLocaleString('id-ID')
  }

  // Format the input display with thousand separators
  const getFormattedInputValue = (): string => {
    if (!amountString) return ''
    const numericValue = parseInt(amountString, 10)
    return numericValue.toLocaleString('id-ID')
  }

  // Reset amount string and focus input when dialog opens or payment method changes
  useEffect(() => {
    if (open) {
      // For non-cash payments, automatically set to total amount
      if (paymentMethod !== 'cash') {
        setAmountString(total.toString())
        onPaymentAmountChange(total)
      } else {
        const valueString = paymentAmount > 0 ? paymentAmount.toString() : ''
        setAmountString(valueString)
      }
    }
  }, [open, paymentMethod, total, paymentAmount, onPaymentAmountChange])

  // Focus input after dialog is fully rendered (cash only)
  useEffect(() => {
    if (open && paymentMethod === 'cash' && inputRef.current) {
      inputRef.current.focus()
      setInputFocused(true)
    }
  }, [open, paymentMethod])

  // Handle numeric keypad input
  const handleKeypadInput = (value: string) => {
    if (value === 'backspace') {
      const newValue = amountString.slice(0, -1)
      setAmountString(newValue)
      onPaymentAmountChange(parseInt(newValue || '0', 10))
    } else if (value === 'clear') {
      setAmountString('')
      onPaymentAmountChange(0)
    } else {
      // Prevent leading zeros
      let newValue = amountString
      if (newValue === '0' && value !== '0') {
        newValue = value
      } else if (newValue === '') {
        // Don't allow leading zeros but allow other digits
        newValue = value === '0' ? '' : value
      } else {
        newValue = newValue + value
      }
      setAmountString(newValue)
      onPaymentAmountChange(parseInt(newValue || '0', 10))
    }

    // Set focus back to input and move cursor to the end
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
        const len = inputRef.current.value.length
        inputRef.current.setSelectionRange(len, len)
      }
    }, 0)
  }

  // Handle quick amount buttons
  const handleQuickAmount = (amount: number) => {
    setAmountString(amount.toString())
    onPaymentAmountChange(amount)
  }

  // Handle manual input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Get only digits from input
    const inputValue = e.target.value.replace(/[^\d]/g, '')

    // Prevent leading zeros
    let newValue = inputValue
    if (newValue.length > 0 && newValue[0] === '0') {
      newValue = newValue.substring(1)
    }

    setAmountString(newValue)
    onPaymentAmountChange(parseInt(newValue || '0', 10))
  }

  // Handle Tab key to move focus to the pay button
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault()
      payButtonRef.current?.focus()
    }
  }

  // Get payment method icon
  const getPaymentMethodIcon = (method: PaymentMethod) => {
    const paymentMethod = paymentMethods.find((p) => p.value === method)
    if (paymentMethod) {
      const Icon = paymentMethod.icon
      return <Icon className="h-4 w-4 mr-2" />
    }
    return null
  }

  return (
    <Dialog open={open} onOpenChange={isProcessing ? () => {} : onOpenChange}>
      <DialogContent
        className={cn(
          'p-0 overflow-hidden',
          paymentMethod === 'cash' ? 'sm:max-w-[850px]' : 'sm:max-w-[500px]'
        )}
      >
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>{t('cashier.payment.title')}</DialogTitle>
          <DialogDescription>{t('cashier.payment.description')}</DialogDescription>
        </DialogHeader>

        <div
          className={cn(
            'h-full',
            paymentMethod === 'cash' ? 'grid grid-cols-1 lg:grid-cols-2' : 'block'
          )}
        >
          {/* Left column - Payment info */}
          <div className={cn('p-6 pt-0', paymentMethod === 'cash' ? 'border-r' : '')}>
            <div className="space-y-4">
              {/* Total to be paid */}
              <div className="bg-primary/10 rounded-md p-3 flex justify-between items-center">
                <span className="font-medium">{t('cashier.payment.totalToPay')}</span>
                <span className="font-bold text-lg">Rp {formatNumber(total)}</span>
              </div>

              {/* Payment Method Dropdown */}
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">{t('cashier.payment.selectMethod')}</Label>
                <Select
                  value={paymentMethod}
                  onValueChange={(value: PaymentMethod) => onPaymentMethodChange(value)}
                >
                  <SelectTrigger className="w-full h-11">
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

              {/* Non-cash payment amount display */}
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

              {/* Quick cash selection buttons - only show for cash payment */}
              {paymentMethod === 'cash' && (
                <div className="space-y-2">
                  <Label>{t('cashier.payment.quickCash')}</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={paymentAmount === total ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleQuickAmount(total)}
                      className="text-sm h-12 font-medium"
                    >
                      💰 {t('cashier.payment.exactAmount')}
                    </Button>
                    {[20000, 50000, 100000, 200000].map((amount) => (
                      <Button
                        key={amount}
                        variant={paymentAmount === amount ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleQuickAmount(amount)}
                        className="text-sm h-12"
                      >
                        Rp {formatNumber(amount)}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Change calculation - only show for cash if amount > total */}
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

          {/* Right column - Numeric keypad (only show for cash) */}
          {paymentMethod === 'cash' && (
            <div className="p-6 pt-0 flex flex-col">
              <div className="space-y-2 mb-4">
                <Label htmlFor="paymentAmount" className={cn(inputFocused ? 'text-primary' : '')}>
                  {t('cashier.payment.paymentAmount')}
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground text-2xl">
                    Rp
                  </div>
                  <Input
                    ref={inputRef}
                    id="paymentAmount"
                    value={getFormattedInputValue()}
                    onChange={handleInputChange}
                    onFocus={() => {
                      setInputFocused(true)
                      setTimeout(() => {
                        if (inputRef.current) {
                          const len = inputRef.current.value.length
                          inputRef.current.setSelectionRange(len, len)
                        }
                      }, 0)
                    }}
                    onBlur={() => setInputFocused(false)}
                    onKeyDown={handleKeyDown}
                    className="pl-12 text-right font-bold h-16 [&:not(:focus)]:text-2xl [&:focus]:text-2xl"
                    style={{ fontSize: '1.5rem' }}
                    tabIndex={1}
                  />
                </div>
              </div>

              {/* Numeric keypad */}
              <div className="flex-1 flex flex-col min-h-[400px]">
                <div className="grid grid-cols-3 gap-2 flex-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <Button
                      key={num}
                      variant="outline"
                      className="h-16 text-2xl font-semibold hover:bg-primary/10"
                      onClick={() => handleKeypadInput(num.toString())}
                    >
                      {num}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    className="h-16 text-2xl font-semibold hover:bg-primary/10"
                    onClick={() => handleKeypadInput('0')}
                  >
                    0
                  </Button>
                  <Button
                    variant="outline"
                    className="h-16 text-2xl font-semibold hover:bg-primary/10"
                    onClick={() => handleKeypadInput('000')}
                  >
                    000
                  </Button>
                  <Button
                    variant="outline"
                    className="h-16 hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => handleKeypadInput('backspace')}
                  >
                    <ArrowLeft className="h-6 w-6" />
                  </Button>
                </div>

                <div className="mt-2 grid grid-cols-1 gap-2">
                  <Button
                    variant="ghost"
                    className="h-12 hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => handleKeypadInput('clear')}
                  >
                    <Delete className="mr-2 h-4 w-4" /> {t('cashier.actions.clear')}
                  </Button>
                </div>
              </div>
            </div>
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
            className="min-w-[180px]"
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
