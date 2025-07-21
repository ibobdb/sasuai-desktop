import { IconReceipt, IconPrinter } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { TransactionDetail } from '@/types/transactions'
import { PrinterSettings } from '@/types/settings'
import { formatCurrency } from '@/utils/format'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { DetailDialog } from '@/components/common/detail-dialog'
import { getTierBadgeVariant } from '@/features/member/components/member-columns'
import { toast } from 'sonner'
import { generateReceiptData, generateReceiptHTML } from '@/utils/receipt-generator'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  transactionDetail: TransactionDetail | null
  isLoadingDetail: boolean
}

export function TransactionViewDialog({
  open,
  onOpenChange,
  transactionDetail,
  isLoadingDetail
}: Props) {
  const { t } = useTranslation(['transactions', 'common'])
  const [isPrinting, setIsPrinting] = useState(false)

  const handlePrintReceipt = async () => {
    if (!transactionDetail) return

    setIsPrinting(true)
    try {
      // Get printer settings first
      const printerSettingsResponse = await window.api.printer.getSettings()
      const printerSettings = printerSettingsResponse.success
        ? (printerSettingsResponse.data as PrinterSettings)
        : undefined

      const receiptData = generateReceiptData(transactionDetail)
      const receiptHTML = generateReceiptHTML(receiptData, printerSettings)
      const response = await window.api.printer.printHTML(receiptHTML)

      if (response.success) {
        toast.success(t('transaction.receipt.printSuccess'))
      } else {
        throw new Error(response.error?.message || t('transaction.receipt.printError'))
      }
    } catch (error) {
      console.error('Print failed:', error)
      toast.error(error instanceof Error ? error.message : t('transaction.receipt.printError'))
    } finally {
      setIsPrinting(false)
    }
  }

  // Generate receipt content if we have details
  const generateReceiptContent = () => {
    if (!transactionDetail) return null

    const { pricing, cashier, member, items = [], payment } = transactionDetail
    const paymentMethod = payment?.method || transactionDetail.paymentMethod
    const date = new Date(transactionDetail.createdAt)
    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
    const totalAmount = pricing?.originalAmount || 0

    return (
      <>
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
              <p className="font-medium">{cashier?.name || '-'}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">{t('transaction.details.customer')}</p>
              <p className="font-medium flex flex-wrap gap-2 items-center">
                {member ? (
                  <>
                    {member.name}
                    <Badge className={getTierBadgeVariant(member.tier)}>
                      {member.tier || t('member.tiers.regular')}
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
                  {items && items.length > 0 ? (
                    items.map((item) => (
                      <tr key={item.id} className="border-t hover:bg-muted/50 transition-colors">
                        <td className="p-3">
                          <div className="break-words max-w-[200px] sm:max-w-[300px]">
                            <p className="font-medium">{item.product?.name || 'Unknown Item'}</p>
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
                          {formatCurrency(item.product?.price || 0)}
                        </td>
                        <td className="text-right p-3 whitespace-nowrap">{item.quantity || 0}</td>
                        <td className="text-right p-3 whitespace-nowrap font-medium">
                          {formatCurrency(item.originalAmount || 0)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-3 text-center text-muted-foreground">
                        No items found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('transaction.details.subtotal')}</span>
            <span>{formatCurrency(totalAmount)}</span>
          </div>

          {pricing?.discounts?.products && Number(pricing.discounts.products) > 0 ? (
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t('transaction.details.productDiscounts')}
              </span>
              <span className="text-rose-600">-{formatCurrency(pricing.discounts.products)}</span>
            </div>
          ) : null}

          {pricing?.discounts?.member && Number(pricing.discounts.member.amount || 0) > 0 ? (
            <div className="flex justify-between">
              <span className="text-muted-foreground flex items-center gap-1">
                {t('transaction.details.memberDiscount')}
                {pricing.discounts.member.name && (
                  <Badge variant="outline" className="text-xs">
                    {pricing.discounts.member.name}
                  </Badge>
                )}
              </span>
              <span className="text-rose-600">
                -{formatCurrency(pricing.discounts.member.amount)}
              </span>
            </div>
          ) : null}

          {pricing?.discounts?.total && Number(pricing.discounts.total) > 0 ? (
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t('transaction.details.totalDiscount')}
              </span>
              <span className="text-rose-600">-{formatCurrency(pricing.discounts.total)}</span>
            </div>
          ) : null}

          <Separator />

          <div className="flex justify-between text-lg font-bold">
            <span>{t('transaction.details.total')}</span>
            <span>{formatCurrency(Math.abs(pricing?.finalAmount || 0))}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('transaction.details.paymentAmount')}</span>
            <span>{formatCurrency(Number(payment?.amount || 0))}</span>
          </div>

          {payment?.change && Number(payment.change) > 0 ? (
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('transaction.details.change')}</span>
              <span>{formatCurrency(Number(payment.change))}</span>
            </div>
          ) : null}
        </div>

        {transactionDetail.pointsEarned && transactionDetail.pointsEarned > 0 ? (
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
                  {t('transaction.details.pointsDescription', {
                    points: transactionDetail.pointsEarned
                  })}
                </p>
              </div>
            </div>
          </Card>
        ) : null}
      </>
    )
  }

  const footerContent = (
    <>
      <Button variant="outline" onClick={() => onOpenChange(false)}>
        {t('actions.close', { ns: 'common' })}
      </Button>
      <Button onClick={handlePrintReceipt} disabled={isPrinting}>
        <IconPrinter className="h-4 w-4 mr-2" />
        {isPrinting ? t('transaction.receipt.printing') : t('actions.print', { ns: 'common' })}
      </Button>
    </>
  )

  return (
    <>
      <DetailDialog
        open={open}
        onOpenChange={onOpenChange}
        loading={isLoadingDetail}
        loadingTitle={t('transaction.receipt.loading')}
        loadingDescription={t('transaction.receipt.loadingDescription')}
        title={t('transaction.receipt.title')}
        description={transactionDetail ? `Transaction ID: ${transactionDetail.tranId}` : ''}
        icon={<IconReceipt className="h-5 w-5" />}
        footerContent={footerContent}
      >
        {generateReceiptContent()}
      </DetailDialog>
    </>
  )
}
