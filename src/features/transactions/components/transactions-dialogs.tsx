import { useTransactions } from '../context/transactions-context'
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
        </>
      )}
    </>
  )
}
