import { useEffect, useState } from 'react'
import { IconReceipt, IconPrinter } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next' // Import useTranslation hook
import { Button } from '@/components/ui/button'
import { Transaction, TransactionDetail } from '@/types/transactions'
import { formatCurrency } from '@/utils/format'
import { Separator } from '@/components/ui/separator'
import { useTransactions } from '../context/transactions-context'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { DetailDialog } from '@/components/common/detail-dialog'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentTransaction: Transaction
}

export function TransactionViewDialog({ open, onOpenChange, currentTransaction }: Props) {
  const { t } = useTranslation(['transactions', 'common']) // Use translation hook
  const { fetchTransactionDetail } = useTransactions()
  const [detail, setDetail] = useState<TransactionDetail | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    if (open && currentTransaction) {
      setLoading(true)
      fetchTransactionDetail(currentTransaction.id)
        .then((data) => {
          if (data) {
            setDetail(data)
          }
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setDetail(null)
    }
  }, [open, currentTransaction, fetchTransactionDetail])

  // If no details are available when not loading, close dialog
  if (!detail && !loading) return null

  // Generate receipt content if we have details
  const generateReceiptContent = () => {
    if (!detail) return null

    const { pricing, cashier, member, items, payment } = detail
    const paymentMethod = payment?.method || detail.paymentMethod
    const date = new Date(detail.createdAt)
    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
    const totalAmount = pricing.originalAmount

    return (
      <>
        {/* Meta Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">
                {t('transaction.details.dateAndTime')}
              </p>
              <p className="font-medium">{formattedDate}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('transaction.details.cashier')}</p>
              <p className="font-medium">{cashier.name}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">{t('transaction.details.customer')}</p>
              <p className="font-medium flex flex-wrap gap-2 items-center">
                {member ? (
                  <>
                    {member.name}
                    <Badge variant="secondary" className="text-xs">
                      {member.tier}
                    </Badge>
                  </>
                ) : (
                  t('transaction.details.guest')
                )}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t('transaction.details.paymentMethod')}
              </p>
              <p className="font-medium capitalize">
                {paymentMethod ? paymentMethod.replace(/[_-]/g, ' ') : '-'}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Items List */}
        <div>
          <h3 className="font-semibold mb-3">
            {t('transaction.details.itemsPurchased')} ({totalItems})
          </h3>

          <div className="border rounded-lg overflow-hidden">
            <div className="max-h-[300px] overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3 sticky top-0 bg-muted z-10">
                      {t('transaction.details.item')}
                    </th>
                    <th className="text-right p-3 whitespace-nowrap sticky top-0 bg-muted z-10">
                      {t('transaction.details.price')}
                    </th>
                    <th className="text-right p-3 whitespace-nowrap sticky top-0 bg-muted z-10">
                      {t('transaction.details.quantity')}
                    </th>
                    <th className="text-right p-3 whitespace-nowrap sticky top-0 bg-muted z-10">
                      {t('transaction.details.total')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-t hover:bg-muted/50 transition-colors">
                      <td className="p-3">
                        <div className="break-words max-w-[200px] sm:max-w-[300px]">
                          <p className="font-medium">{item.product.name}</p>
                          {item.discountApplied && (
                            <div className="mt-1">
                              <Badge variant="outline" className="text-xs text-rose-600">
                                {item.discountApplied.name}: -
                                {formatCurrency(item.discountApplied.amount)}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="text-right p-3 whitespace-nowrap">
                        {formatCurrency(item.product.price)}
                      </td>
                      <td className="text-right p-3 whitespace-nowrap">{item.quantity}</td>
                      <td className="text-right p-3 whitespace-nowrap font-medium">
                        {formatCurrency(item.originalAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <Separator />

        {/* Pricing Summary */}
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('transaction.details.subtotal')}</span>
            <span>{formatCurrency(totalAmount)}</span>
          </div>

          {pricing.discounts.member && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t('transaction.details.memberDiscount')}
              </span>
              <span className="text-rose-600">
                -{formatCurrency(pricing.discounts.member.amount)}
              </span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('transaction.details.totalDiscount')}</span>
            <span className="text-rose-600">-{formatCurrency(pricing.discounts.total)}</span>
          </div>

          <Separator />

          <div className="flex justify-between text-lg font-bold">
            <span>{t('transaction.details.total')}</span>
            <span>{formatCurrency(pricing.finalAmount)}</span>
          </div>

          {/* Payment amount */}
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('transaction.details.paymentAmount')}</span>
            <span>{formatCurrency(Number(payment.amount))}</span>
          </div>

          {payment.change && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('transaction.details.change')}</span>
              <span>{formatCurrency(Number(payment.change))}</span>
            </div>
          )}
        </div>

        {/* Points Earned */}
        {detail.pointsEarned > 0 && (
          <Card className="bg-primary/5 border-primary/20 p-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <path d="M12 2v4" />
                  <path d="m16.2 7.8 2.9-2.9" />
                  <path d="M18 12h4" />
                  <path d="m16.2 16.2 2.9 2.9" />
                  <path d="M12 18v4" />
                  <path d="m4.9 19.1 2.9-2.9" />
                  <path d="M2 12h4" />
                  <path d="m4.9 4.9 2.9 2.9" />
                </svg>
              </div>
              <div>
                <p className="font-medium">{t('transaction.details.pointsEarned')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('transaction.details.pointsDescription', { points: detail.pointsEarned })}
                </p>
              </div>
            </div>
          </Card>
        )}
      </>
    )
  }

  // Dialog footer content
  const footerContent = (
    <>
      <Button variant="outline" onClick={() => onOpenChange(false)}>
        {t('actions.close', { ns: 'common' })}
      </Button>
      <Button>
        <IconPrinter className="h-4 w-4 mr-2" />
        {t('actions.print', { ns: 'common' })}
      </Button>
    </>
  )

  return (
    <DetailDialog
      open={open}
      onOpenChange={onOpenChange}
      loading={loading}
      loadingTitle={t('transaction.receipt.loading')}
      loadingDescription={t('transaction.receipt.loadingDescription')}
      title={t('transaction.receipt.title')}
      description={detail ? `Transaction ID: ${detail.tranId}` : ''}
      icon={<IconReceipt className="h-5 w-5" />}
      footerContent={footerContent}
    >
      {generateReceiptContent()}
    </DetailDialog>
  )
}
