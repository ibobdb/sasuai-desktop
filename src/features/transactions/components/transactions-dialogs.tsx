import { memo } from 'react'
import { TransactionViewDialog } from './transaction-view-dialog'
import type { Transaction, TransactionDetail, TransactionsDialogType } from '@/types/transactions'

interface TransactionsDialogsProps {
  open: TransactionsDialogType | null
  currentTransaction: Transaction | null
  transactionDetail: TransactionDetail | null
  isLoadingDetail: boolean
  onOpenChange: (open: TransactionsDialogType | null) => void
  onRefetch: () => void
}

function TransactionsDialogsComponent({
  open,
  currentTransaction,
  transactionDetail,
  isLoadingDetail,
  onOpenChange
}: TransactionsDialogsProps) {
  if (!currentTransaction) return null

  const handleDialogClose = () => {
    onOpenChange(null)
  }

  return (
    <TransactionViewDialog
      open={open === 'view'}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleDialogClose()
      }}
      transactionDetail={transactionDetail}
      isLoadingDetail={isLoadingDetail}
    />
  )
}

export const TransactionsDialogs = memo(TransactionsDialogsComponent)
