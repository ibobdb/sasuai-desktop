import { IconReceipt } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Transaction } from '../data/schema'
import { formatCurrency } from '@/utils/format'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentTransaction: Transaction
}

export function TransactionViewDialog({ open, onOpenChange, currentTransaction }: Props) {
  const date = new Date(currentTransaction.createdAt)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-left">
          <DialogTitle className="flex items-center gap-2">
            <IconReceipt /> Transaction Details
          </DialogTitle>
          <DialogDescription>Transaction ID: {currentTransaction.id}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2">
            <div className="font-medium">Total Amount</div>
            <div>{formatCurrency(currentTransaction.totalAmount)}</div>
          </div>

          <div className="grid grid-cols-2">
            <div className="font-medium">Discount</div>
            <div>{formatCurrency(currentTransaction.totalDiscountAmount)}</div>
          </div>

          <div className="grid grid-cols-2">
            <div className="font-medium">Final Amount</div>
            <div className="font-semibold">{formatCurrency(currentTransaction.finalAmount)}</div>
          </div>

          <div className="grid grid-cols-2">
            <div className="font-medium">Customer</div>
            <div>{currentTransaction.memberName || 'Guest'}</div>
          </div>

          <div className="grid grid-cols-2">
            <div className="font-medium">Points Earned</div>
            <div>{currentTransaction.pointsEarned} points</div>
          </div>

          <div className="grid grid-cols-2">
            <div className="font-medium">Payment Method</div>
            <div className="capitalize">{currentTransaction.paymentMethod.replace('_', ' ')}</div>
          </div>

          <div className="grid grid-cols-2">
            <div className="font-medium">Items</div>
            <div>{currentTransaction.itemCount} items</div>
          </div>

          <div className="grid grid-cols-2">
            <div className="font-medium">Date</div>
            <div>{date.toLocaleString()}</div>
          </div>

          <div className="grid grid-cols-2">
            <div className="font-medium">Cashier</div>
            <div>{currentTransaction.cashierName}</div>
          </div>
        </div>

        <DialogFooter className="gap-y-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            onClick={() => {
              console.log('Print receipt for', currentTransaction.id)
            }}
          >
            Print Receipt <IconReceipt size={16} className="ml-1" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
