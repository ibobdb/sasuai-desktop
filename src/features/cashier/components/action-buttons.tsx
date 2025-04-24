import { CreditCard, Printer, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog'
import { useState } from 'react'
import { ActionButtonsProps } from '@/types/cashier'

export default function ActionButtons({
  onPay,
  onClear,
  onPrint,
  isPayEnabled,
  isPrintEnabled
}: ActionButtonsProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)

  const handlePayment = async () => {
    setIsProcessing(true)
    try {
      await onPay()
      // Explicitly close the dialog on successful payment
      setPaymentDialogOpen(false)
    } catch (error) {
      // Keep dialog open on error, user can close manually
      console.error('Payment processing error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="flex gap-2">
      <Dialog
        open={paymentDialogOpen}
        onOpenChange={(open) => {
          // Prevent closing dialog while processing payment
          if (isProcessing) return
          setPaymentDialogOpen(open)
        }}
      >
        <DialogTrigger asChild>
          <Button className="flex-1" size="lg" disabled={!isPayEnabled}>
            <CreditCard className="mr-2 h-4 w-4" /> Pay
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Payment</DialogTitle>
            <DialogDescription>
              Are you sure you want to complete this transaction?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <DialogClose asChild>
              <Button variant="outline" disabled={isProcessing}>
                Cancel
              </Button>
            </DialogClose>
            <Button onClick={handlePayment} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                </>
              ) : (
                <>Confirm</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Button variant="outline" size="lg" onClick={onClear} disabled={isProcessing}>
        <X className="mr-2 h-4 w-4" /> Clear
      </Button>

      <Button
        variant="outline"
        size="lg"
        onClick={onPrint}
        disabled={!isPrintEnabled || isProcessing}
      >
        <Printer className="mr-2 h-4 w-4" /> Receipt
      </Button>
    </div>
  )
}
