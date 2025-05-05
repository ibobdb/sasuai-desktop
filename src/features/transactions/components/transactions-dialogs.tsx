import { useTransactions } from '../context/transactions-context'
import { TransactionViewDialog } from './transaction-view-dialog'

export function TransactionsDialogs() {
  const { open, setOpen, currentTransaction, setCurrentTransaction } = useTransactions()

  const handleDialogClose = () => {
    // Close dialog without triggering a fetch
    setOpen(null)

    // Clear current transaction after dialog animation completes
    setTimeout(() => {
      setCurrentTransaction(null)
    }, 500)
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
            currentTransaction={currentTransaction}
          />
        </>
      )}
    </>
  )
}
