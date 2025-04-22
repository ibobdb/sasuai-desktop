import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Percent, DollarSign, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type DiscountType = 'percentage' | 'fixed'

type DiscountSectionProps = {
  subtotal: number
  discount: number
  discountType: DiscountType
  onDiscountChange: (discount: number) => void
  onDiscountTypeChange: (type: DiscountType) => void
}

export default function DiscountSection({
  subtotal,
  discount,
  discountType,
  onDiscountChange,
  onDiscountTypeChange
}: DiscountSectionProps) {
  const [inputFocused, setInputFocused] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0

    // Validate percentage can't be more than 100%
    if (discountType === 'percentage' && value > 100) {
      onDiscountChange(100)
      return
    }

    // Validate fixed discount can't be more than subtotal
    if (discountType === 'fixed' && value > subtotal) {
      onDiscountChange(subtotal)
      return
    }

    onDiscountChange(value)
  }

  const handleClearDiscount = () => {
    onDiscountChange(0)
  }

  // Quickly apply common percentage discounts
  const applyQuickDiscount = (value: number) => {
    onDiscountTypeChange('percentage')
    onDiscountChange(value)
  }

  // Calculate discount value in currency
  const discountValue =
    discountType === 'percentage' ? Math.round(subtotal * (discount / 100)) : discount

  // Show discount badge if any discount is applied
  const hasDiscount = discount > 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold">Discount</h2>
        {hasDiscount && (
          <Button variant="ghost" size="sm" onClick={handleClearDiscount} className="h-7 px-2">
            <X className="h-3 w-3 mr-1" /> Clear
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {/* Discount Type Selector */}
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={discountType === 'percentage' ? 'default' : 'outline'}
            onClick={() => onDiscountTypeChange('percentage')}
            className="flex-1"
          >
            <Percent className="h-3 w-3 mr-2" /> Percentage
          </Button>
          <Button
            size="sm"
            variant={discountType === 'fixed' ? 'default' : 'outline'}
            onClick={() => onDiscountTypeChange('fixed')}
            className="flex-1"
          >
            <DollarSign className="h-3 w-3 mr-2" /> Fixed Amount
          </Button>
        </div>

        {/* Quick percentage selectors - show only in percentage mode */}
        {discountType === 'percentage' && (
          <div className="grid grid-cols-4 gap-2">
            {[5, 10, 15, 20].map((percent) => (
              <Button
                key={percent}
                size="sm"
                variant={discount === percent ? 'secondary' : 'outline'}
                onClick={() => applyQuickDiscount(percent)}
                className="text-xs h-8"
              >
                {percent}%
              </Button>
            ))}
          </div>
        )}

        {/* Discount Amount Input */}
        <div className="space-y-1">
          <Label htmlFor="discount" className={cn(inputFocused ? 'text-primary' : '')}>
            {discountType === 'percentage' ? 'Custom Percentage' : 'Discount Amount'}
          </Label>
          <div className="relative">
            <Input
              id="discount"
              type="number"
              min={0}
              max={discountType === 'percentage' ? 100 : subtotal}
              value={discount || ''}
              onChange={handleInputChange}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              className="pr-8"
              placeholder={discountType === 'percentage' ? '0' : '0'}
            />
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-muted-foreground">
              {discountType === 'percentage' ? '%' : 'Rp'}
            </div>
          </div>
        </div>

        {/* Simple discount value display - only for percentage */}
        {hasDiscount && discountType === 'percentage' && (
          <div className="text-sm text-muted-foreground">
            Discount value: <span className="font-medium">Rp {discountValue.toLocaleString()}</span>
          </div>
        )}
      </div>
    </div>
  )
}
