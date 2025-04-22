import { Receipt, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

type TransactionSummaryProps = {
  itemCount: number
  subtotal: number
  discount: number
  tax: number
  total: number
}

export default function TransactionSummary({ subtotal, discount, total }: TransactionSummaryProps) {
  // Calculate if we have any special values
  const hasDiscount = discount > 0

  return (
    <div className="space-y-3">
      <h2 className="font-bold flex items-center">
        <Receipt className="h-4 w-4 mr-2" />
        Total Payment
      </h2>

      <div className="space-y-2 py-1">
        {/* Always show subtotal */}
        <div className="flex justify-between text-sm">
          <span>Subtotal:</span>
          <span>Rp {subtotal.toLocaleString()}</span>
        </div>

        {/* Show discount only if present */}
        {hasDiscount && (
          <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
            <span className="flex items-center">
              <Minus className="h-3 w-3 mr-1" />
              Discount:
            </span>
            <span>Rp {discount.toLocaleString()}</span>
          </div>
        )}

        {/* Always show total */}
        <div className="flex justify-between text-lg font-bold pt-2 border-t">
          <span>Total:</span>
          <span className={cn(hasDiscount ? 'text-green-600 dark:text-green-400' : '')}>
            Rp {total.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  )
}
