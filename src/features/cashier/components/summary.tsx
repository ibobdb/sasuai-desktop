import { Receipt, Minus, Award } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { TransactionSummaryProps } from '@/types/cashier'

export default function TransactionSummary({
  subtotal,
  productDiscounts,
  memberDiscount,
  tierDiscount, // Add tierDiscount parameter
  globalDiscount,
  total,
  pointsToEarn = 0
}: TransactionSummaryProps) {
  const { t } = useTranslation(['cashier'])

  // Calculate if we have any special values
  const hasProductDiscount = productDiscounts > 0
  const hasMemberDiscount = memberDiscount > 0
  const hasTierDiscount = tierDiscount > 0 // Add check for tier discount
  const hasGlobalDiscount = globalDiscount > 0
  const hasAnyDiscount =
    hasProductDiscount || hasMemberDiscount || hasTierDiscount || hasGlobalDiscount
  const hasPointsToEarn = pointsToEarn > 0

  return (
    <div className="space-y-3">
      <h2 className="font-bold flex items-center">
        <Receipt className="h-4 w-4 mr-2" />
        {t('cashier.summary.title')}
      </h2>

      <div className="space-y-2 py-1">
        {/* Always show subtotal */}
        <div className="flex justify-between text-sm">
          <span>{t('cashier.summary.subtotal')}</span>
          <span>Rp {subtotal.toLocaleString()}</span>
        </div>

        {/* Show product discounts if any */}
        {hasProductDiscount && (
          <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
            <span className="flex items-center">
              <Minus className="h-3 w-3 mr-1" />
              {t('cashier.summary.productDiscounts')}
            </span>
            <span>Rp {productDiscounts.toLocaleString()}</span>
          </div>
        )}

        {/* Show member discount if any */}
        {hasMemberDiscount && (
          <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
            <span className="flex items-center">
              <Minus className="h-3 w-3 mr-1" />
              {t('cashier.summary.memberDiscount')}
            </span>
            <span>Rp {memberDiscount.toLocaleString()}</span>
          </div>
        )}

        {/* Show tier discount if any */}
        {hasTierDiscount && (
          <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
            <span className="flex items-center">
              <Minus className="h-3 w-3 mr-1" />
              {t('cashier.summary.tierDiscount')}
            </span>
            <span>Rp {tierDiscount.toLocaleString()}</span>
          </div>
        )}

        {/* Show global discount if any */}
        {hasGlobalDiscount && (
          <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
            <span className="flex items-center">
              <Minus className="h-3 w-3 mr-1" />
              {t('cashier.summary.globalDiscount')}
            </span>
            <span>Rp {globalDiscount.toLocaleString()}</span>
          </div>
        )}

        {/* Always show total */}
        <div className="flex justify-between text-lg font-bold pt-2 border-t">
          <span>{t('cashier.summary.total')}</span>
          <span className={cn(hasAnyDiscount ? 'text-green-600 dark:text-green-400' : '')}>
            Rp {total.toLocaleString()}
          </span>
        </div>

        {/* Points to earn information */}
        {hasPointsToEarn && (
          <div className="flex justify-between items-center mt-2 pt-2 text-sm border-t border-dashed">
            <span className="flex items-center text-amber-600 dark:text-amber-400">
              <Award className="h-3.5 w-3.5 mr-1.5" />
              {t('cashier.summary.pointsToEarn')}
            </span>
            <div className="text-right">
              <span className="font-medium text-amber-600 dark:text-amber-400">
                {pointsToEarn.toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
