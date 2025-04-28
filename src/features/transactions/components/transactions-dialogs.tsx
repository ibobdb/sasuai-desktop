import { useTransactions } from '../context/transactions-context'
import { TransactionDeleteDialog } from './transaction-delete-dialog'
import { TransactionViewDialog } from './transaction-view-dialog'

export function TransactionsDialogs() {
  const { open, setOpen, currentTransaction, setCurrentTransaction } = useTransactions()

  return (
    <>
      {currentTransaction && (
        <>
          <TransactionViewDialog
            key={`transaction-view-${currentTransaction.id}`}
            open={open === 'view'}
            onOpenChange={() => {
              setOpen(null)
              setTimeout(() => {
                setCurrentTransaction(null)
              }, 500)
            }}
            currentTransaction={currentTransaction}
          />

          <TransactionDeleteDialog
            key={`transaction-delete-${currentTransaction.id}`}
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen(null)
              setTimeout(() => {
                setCurrentTransaction(null)
              }, 500)
            }}
            currentTransaction={currentTransaction}
          />
        </>
      )}
    </>
  )
}
