import { IconReceipt, IconPrinter } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { TransactionDetail } from '@/types/transactions'
import { PrinterSettings } from '@/types/settings'
import { Separator } from '@/components/ui/separator'
import { DetailDialog } from '@/components/common/detail-dialog'
import { toast } from 'sonner'
import { generateReceiptData } from '@/utils/receipt-data'
import { generateReceiptHTML } from '@/utils/receipt-html'
import { useSettings } from '@/features/settings/hooks/use-settings'
import { TransactionHeader } from './transaction-detail/transaction-header'
import { TransactionItems } from './transaction-detail/transaction-items'
import { TransactionSummary } from './transaction-detail/transaction-summary'
import { TransactionPoints } from './transaction-detail/transaction-points'

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
  const { t } = useTranslation(['transactions', 'common', 'member'])
  const { settings } = useSettings()
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

      const receiptData = generateReceiptData(transactionDetail, settings.general.storeInfo)
      const receiptHTML = generateReceiptHTML(
        receiptData,
        printerSettings,
        settings.general.footerInfo
      )
      const response = await window.api.printer.printHTML(receiptHTML)

      if (response.success) {
        toast.success(t('transaction.receipt.printSuccess'))
      } else {
        throw new Error(response.error?.message || t('transaction.receipt.printError'))
      }
    } catch (error) {
      if (import.meta.env.DEV) if (import.meta.env.DEV) console.error('Print failed:', error)
      toast.error(error instanceof Error ? error.message : t('transaction.receipt.printError'))
    } finally {
      setIsPrinting(false)
    }
  }

  // Generate receipt content if we have details
  const generateReceiptContent = () => {
    if (!transactionDetail) return null

    return (
      <>
        <TransactionHeader transactionDetail={transactionDetail} />

        <Separator />

        <TransactionItems transactionDetail={transactionDetail} />

        <Separator />

        <TransactionSummary transactionDetail={transactionDetail} />

        <TransactionPoints transactionDetail={transactionDetail} />
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
        description={
          transactionDetail?.tranId
            ? `Transaction ID: ${transactionDetail.tranId}`
            : transactionDetail
              ? 'Transaction Details'
              : ''
        }
        icon={<IconReceipt className="h-5 w-5" />}
        footerContent={footerContent}
      >
        {generateReceiptContent()}
      </DetailDialog>
    </>
  )
}
