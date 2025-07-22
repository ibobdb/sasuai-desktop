import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Row } from '@tanstack/react-table'
import { IconEye, IconReceipt } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Transaction } from '@/types/transactions'
import { PrinterSettings } from '@/types/settings'
import { toast } from 'sonner'
import { generateReceiptData } from '@/utils/receipt-data'
import { generateReceiptHTML } from '@/utils/receipt-html'
import { transactionOperations } from '@/features/transactions/actions/transaction-operations'
import { useSettings } from '@/features/settings/hooks/use-settings'

interface DataTableRowActionsProps {
  row: Row<Transaction>
  onView?: (transaction: Transaction) => void
}

export function DataTableRowActions({ row, onView }: DataTableRowActionsProps) {
  const { t } = useTranslation(['transactions'])
  const { settings } = useSettings()
  const [isPrinting, setIsPrinting] = useState(false)

  const handleView = () => {
    if (onView) {
      onView(row.original)
    }
  }

  const handlePrint = async () => {
    setIsPrinting(true)
    try {
      // Get transaction detail first
      const detailResponse = await transactionOperations.fetchItemDetail(row.original.id)
      if (!detailResponse.success || !detailResponse.data?.transactionDetails) {
        throw new Error(t('transaction.receipt.failedToLoadDetails'))
      }

      const transactionDetail = detailResponse.data.transactionDetails

      // Get printer settings
      const printerSettingsResponse = await window.api.printer.getSettings()
      const printerSettings = printerSettingsResponse.success
        ? (printerSettingsResponse.data as PrinterSettings)
        : undefined

      // Generate and print receipt
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
      console.error('Print failed:', error)
      toast.error(error instanceof Error ? error.message : t('transaction.receipt.printError'))
    } finally {
      setIsPrinting(false)
    }
  }

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="data-[state=open]:bg-muted flex h-8 w-8 p-0">
            <DotsHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem onClick={handleView}>
            {t('transaction.actions.viewDetails')}
            <DropdownMenuShortcut>
              <IconEye size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handlePrint} disabled={isPrinting}>
            {isPrinting ? t('transaction.receipt.printing') : t('transaction.actions.printInvoice')}
            <DropdownMenuShortcut>
              <IconReceipt size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
