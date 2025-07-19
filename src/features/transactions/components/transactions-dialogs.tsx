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

export function TransactionsDialogs({
  open,
  currentTransaction,
  transactionDetail,
  isLoadingDetail,
  onOpenChange
}: TransactionsDialogsProps) {
  const handleDialogClose = () => {
    onOpenChange(null)
  }

  return (
    <>
      {currentTransaction && (
        <>
          <TransactionViewDialog
            key={`transaction-view-${currentTransaction.id}`}
            open={open === 'view'}
            onOpenChange={(isOpen) => {
              if (!isOpen) handleDialogClose()
            }}
            transactionDetail={transactionDetail}
            isLoadingDetail={isLoadingDetail}
          />
        </>
      )}
    </>
  )
}
