import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/utils/format'
import { TransactionDetail } from '@/types/transactions'

interface TransactionSummaryProps {
  transactionDetail: TransactionDetail
}

export function TransactionSummary({ transactionDetail }: TransactionSummaryProps) {
  const { t } = useTranslation(['transactions'])

  const { pricing, items = [], payment } = transactionDetail
  const totalAmount = pricing?.originalAmount || 0

  // Calculate and display different types of discounts
  const renderDiscounts = () => {
    // Calculate product discounts from items
    const productDiscountTotal = items.reduce((sum, item) => {
      return sum + (item.discountApplied?.amount || 0)
    }, 0)

    // Get global/voucher discount
    const globalDiscount = pricing?.discounts?.isGlobal ? pricing.discounts : null

    // Get member discount (non-global, specific members)
    const memberDiscount =
      pricing?.discounts &&
      !pricing.discounts.isGlobal &&
      pricing.discounts.applyTo === 'SPECIFIC_MEMBERS'
        ? pricing.discounts
        : null

    // Get tier discount
    const tierDiscount =
      pricing?.discounts && pricing.discounts.applyTo === 'SPECIFIC_MEMBER_TIERS'
        ? pricing.discounts
        : null

    return (
      <>
        {/* Product Discounts */}
        {productDiscountTotal > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {t('transaction.details.productDiscounts')}
            </span>
            <span className="text-rose-600">-{formatCurrency(productDiscountTotal)}</span>
          </div>
        )}

        {/* Member Discount */}
        {memberDiscount && (
          <div className="flex justify-between">
            <span className="text-muted-foreground flex items-center gap-2">
              {t('transaction.details.memberDiscount')}
              <div className="flex gap-1">
                {memberDiscount.name && (
                  <Badge variant="outline" className="text-xs">
                    {memberDiscount.name}
                  </Badge>
                )}
                {memberDiscount.code && (
                  <Badge variant="secondary" className="text-xs">
                    {memberDiscount.code}
                  </Badge>
                )}
                <Badge
                  variant={memberDiscount.type === 'PERCENTAGE' ? 'default' : 'outline'}
                  className="text-xs"
                >
                  {memberDiscount.type === 'PERCENTAGE'
                    ? `${memberDiscount.value}%`
                    : formatCurrency(memberDiscount.value)}
                </Badge>
              </div>
            </span>
            <span className="text-rose-600">-{formatCurrency(memberDiscount.amount)}</span>
          </div>
        )}

        {/* Tier Discount */}
        {tierDiscount && (
          <div className="flex justify-between">
            <span className="text-muted-foreground flex items-center gap-2">
              {t('transaction.details.tierDiscount')}
              <div className="flex gap-1">
                {tierDiscount.name && (
                  <Badge variant="outline" className="text-xs">
                    {tierDiscount.name}
                  </Badge>
                )}
                {tierDiscount.code && (
                  <Badge variant="secondary" className="text-xs">
                    {tierDiscount.code}
                  </Badge>
                )}
                <Badge
                  variant={tierDiscount.type === 'PERCENTAGE' ? 'default' : 'outline'}
                  className="text-xs"
                >
                  {tierDiscount.type === 'PERCENTAGE'
                    ? `${tierDiscount.value}%`
                    : formatCurrency(tierDiscount.value)}
                </Badge>
              </div>
            </span>
            <span className="text-rose-600">-{formatCurrency(tierDiscount.amount)}</span>
          </div>
        )}

        {/* Global/Voucher Discount */}
        {globalDiscount && (
          <div className="flex justify-between">
            <span className="text-muted-foreground flex items-center gap-2">
              {t('transaction.details.globalDiscount')}
              <div className="flex gap-1">
                {globalDiscount.name && (
                  <Badge variant="outline" className="text-xs">
                    {globalDiscount.name}
                  </Badge>
                )}
                {globalDiscount.code && (
                  <Badge variant="secondary" className="text-xs">
                    {globalDiscount.code}
                  </Badge>
                )}
                <Badge
                  variant={globalDiscount.type === 'PERCENTAGE' ? 'default' : 'outline'}
                  className="text-xs"
                >
                  {globalDiscount.type === 'PERCENTAGE'
                    ? `${globalDiscount.value}%`
                    : formatCurrency(globalDiscount.value)}
                </Badge>
              </div>
            </span>
            <span className="text-rose-600">-{formatCurrency(globalDiscount.amount)}</span>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between">
        <span className="text-muted-foreground">{t('transaction.details.subtotal')}</span>
        <span>{formatCurrency(totalAmount)}</span>
      </div>

      {renderDiscounts()}

      <Separator />

      <div className="flex justify-between text-lg font-bold">
        <span>{t('transaction.details.total')}</span>
        <span>{formatCurrency(Math.abs(pricing?.finalAmount || 0))}</span>
      </div>

      <div className="flex justify-between">
        <span className="text-muted-foreground">{t('transaction.details.paymentAmount')}</span>
        <span>{payment?.amount != null ? formatCurrency(Number(payment.amount)) : '-'}</span>
      </div>

      {payment?.change != null && Number(payment.change) > 0 ? (
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t('transaction.details.change')}</span>
          <span>{formatCurrency(Number(payment.change))}</span>
        </div>
      ) : null}
    </div>
  )
}
