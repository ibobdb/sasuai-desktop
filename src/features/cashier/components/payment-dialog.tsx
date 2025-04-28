import { useState, useRef, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  CreditCard,
  Loader2,
  Wallet,
  Banknote,
  ArrowRight,
  MoreHorizontal,
  Check,
  QrCode,
  ArrowRightLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PaymentMethod } from '@/types/cashier'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
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
  const [inputFocused, setInputFocused] = useState(false)
  const [formattedAmount, setFormattedAmount] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const change = paymentAmount - total
  const isPaid = change >= 0

  // Format number with thousands separator
  const formatNumber = (value: number): string => {
    return value.toLocaleString('id-ID')
  }

  // Parse formatted string to number
  const parseFormattedNumber = (value: string): number => {
    // Remove non-numeric characters except for decimal point
    const numericValue = value.replace(/[^0-9.]/g, '')
    return parseFloat(numericValue) || 0
  }

  // Update formatted amount when paymentAmount changes
  useEffect(() => {
    setFormattedAmount(formatNumber(paymentAmount))
  }, [paymentAmount])

  // Auto-focus payment input when dialog opens, but don't auto-select
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [open])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value
    // Remove any non-numeric characters
    const numericValue = parseFormattedNumber(rawValue)

    // Update both the formatted display and the actual numeric value
    setFormattedAmount(formatNumber(numericValue))
    onPaymentAmountChange(numericValue)
  }

  // Static quick cash options
  const cashOptions = [20000, 50000, 100000, 200000]

  // Get icon for payment method
  const getPaymentIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'cash':
        return <Banknote className="h-4 w-4 mr-2" />
      case 'card':
        return <CreditCard className="h-4 w-4 mr-2" />
      case 'e-wallet':
        return <Wallet className="h-4 w-4 mr-2" />
      case 'qris':
        return <QrCode className="h-4 w-4 mr-2" />
      case 'transfer':
        return <ArrowRightLeft className="h-4 w-4 mr-2" />
      default:
        return <MoreHorizontal className="h-4 w-4 mr-2" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={isProcessing ? () => {} : onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Payment</DialogTitle>
          <DialogDescription>
            Complete the transaction with your preferred payment method.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Total to be paid */}
          <div className="bg-primary/10 rounded-md p-3 flex justify-between items-center">
            <span className="font-medium">Total to be paid:</span>
            <span className="font-bold text-lg">Rp {formatNumber(total)}</span>
          </div>

          <h2 className="font-bold">Payment Method</h2>

          {/* Payment Method Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Select payment method</Label>
            <Select
              value={paymentMethod}
              onValueChange={(value: PaymentMethod) => onPaymentMethodChange(value)}
            >
              <SelectTrigger className="w-full h-11">
                <SelectValue placeholder="Select payment method">
                  <div className="flex items-center">
                    {getPaymentIcon(paymentMethod)}
                    <span>{paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">
                  <div className="flex items-center">
                    <Banknote className="h-4 w-4 mr-2" />
                    Cash
                  </div>
                </SelectItem>
                <SelectItem value="card">
                  <div className="flex items-center">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Card
                  </div>
                </SelectItem>
                <SelectItem value="e-wallet">
                  <div className="flex items-center">
                    <Wallet className="h-4 w-4 mr-2" />
                    E-Wallet
                  </div>
                </SelectItem>
                <SelectItem value="qris">
                  <div className="flex items-center">
                    <QrCode className="h-4 w-4 mr-2" />
                    QRIS
                  </div>
                </SelectItem>
                <SelectItem value="transfer">
                  <div className="flex items-center">
                    <ArrowRightLeft className="h-4 w-4 mr-2" />
                    Transfer
                  </div>
                </SelectItem>
                <SelectItem value="other">
                  <div className="flex items-center">
                    <MoreHorizontal className="h-4 w-4 mr-2" />
                    Other
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quick cash selection buttons - only show for cash payment */}
          {paymentMethod === 'cash' && (
            <div className="space-y-2">
              <Label>Quick cash selection</Label>
              <div className="grid grid-cols-4 gap-2">
                {cashOptions.map((amount) => (
                  <Button
                    key={amount}
                    variant={paymentAmount === amount ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onPaymentAmountChange(amount)}
                    className="text-sm"
                  >
                    Rp {formatNumber(amount)}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Payment Amount Input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="paymentAmount" className={cn(inputFocused ? 'text-primary' : '')}>
                Payment Amount
              </Label>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
                Rp
              </div>
              <Input
                ref={inputRef}
                id="paymentAmount"
                value={formattedAmount}
                onChange={handleInputChange}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                className="pl-9 text-left font-medium text-lg"
                placeholder="0"
              />
            </div>
          </div>

          {/* Change calculation display */}
          <div
            className={cn(
              'rounded-md px-2 py-2 flex items-center justify-between',
              change >= 0
                ? 'bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800'
                : 'bg-muted border'
            )}
          >
            <div className="flex items-center">
              {isPaid ? (
                <Check className="h-4 w-4 mr-2" />
              ) : (
                <ArrowRight className="h-4 w-4 mr-2" />
              )}
              <span className="font-normal">{isPaid ? 'Change' : 'Still needed'}:</span>
            </div>
            <span className="font-normal">
              Rp {formatNumber(isPaid ? change : Math.abs(change))}
            </span>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
            Cancel
          </Button>
          <Button onClick={onPay} disabled={!isPayEnabled || isProcessing} className="flex-1">
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" /> Pay now
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
