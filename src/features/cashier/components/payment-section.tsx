import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  CreditCard,
  Wallet,
  DollarSign,
  Banknote,
  ArrowRight,
  MoreHorizontal,
  Check,
  QrCode,
  ArrowRightLeft
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { PaymentMethod, PaymentSectionProps } from '@/types/cashier'

export default function PaymentSection({
  paymentMethod,
  paymentAmount,
  change,
  onPaymentMethodChange,
  onPaymentAmountChange
}: PaymentSectionProps) {
  const [inputFocused, setInputFocused] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0
    onPaymentAmountChange(value)
  }

  const isPaid = change >= 0

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
    <div className="space-y-4">
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

      {/* Payment Amount Input - left aligned now */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="paymentAmount" className={cn(inputFocused ? 'text-primary' : '')}>
            Payment Amount
          </Label>
          {paymentAmount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPaymentAmountChange(0)}
              className="h-6 px-2"
            >
              Clear
            </Button>
          )}
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
            <DollarSign className="h-4 w-4" />
          </div>
          <Input
            id="paymentAmount"
            type="number"
            min={0}
            value={paymentAmount || ''}
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
          'rounded-md px-3 py-3 flex items-center justify-between',
          change >= 0
            ? 'bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800'
            : 'bg-muted border'
        )}
      >
        <div className="flex items-center">
          {isPaid ? <Check className="h-4 w-4 mr-2" /> : <ArrowRight className="h-4 w-4 mr-2" />}
          <span className="font-medium">{isPaid ? 'Change' : 'Still needed'}:</span>
        </div>
        <span className="font-bold text-lg">
          Rp {(isPaid ? change : Math.abs(change)).toLocaleString()}
        </span>
      </div>
    </div>
  )
}
