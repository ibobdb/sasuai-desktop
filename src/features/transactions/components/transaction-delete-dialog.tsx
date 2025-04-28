import { useState } from 'react'
import { IconAlertTriangle, IconLoader2 } from '@tabler/icons-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { Transaction } from '@/types/transactions'
import { formatCurrency } from '@/utils/format'
import { useTransactions } from '../context/transactions-context'
import { Card } from '@/components/ui/card'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentTransaction: Transaction
}

export function TransactionDeleteDialog({ open, onOpenChange, currentTransaction }: Props) {
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { voidTransaction } = useTransactions()

  const handleVoid = async () => {
    if (!reason.trim()) return

    setIsSubmitting(true)
    try {
      const success = await voidTransaction(currentTransaction.id, reason.trim())
      if (success) {
        onOpenChange(false)
        setReason('')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const isConfirmDisabled = !reason.trim() || isSubmitting

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isSubmitting || !isOpen) {
          onOpenChange(isOpen)
          if (!isOpen) {
            setReason('')
          }
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <IconAlertTriangle className="h-5 w-5 stroke-destructive" />
                Void Transaction
              </DialogTitle>
              <DialogDescription className="mt-1">
                Transaction ID: <span className="font-mono">{currentTransaction.id}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="bg-muted/50 p-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="font-medium">
                  {formatCurrency(currentTransaction.pricing.finalAmount)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Customer</p>
                <p className="font-medium">{currentTransaction.member?.name || 'Guest'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">
                  {new Date(currentTransaction.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Cashier</p>
                <p className="font-medium">{currentTransaction.cashier.name}</p>
              </div>
            </div>
          </Card>

          <div className="space-y-3">
            <Label htmlFor="void-reason">
              Reason for voiding <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="void-reason"
              placeholder="Please explain why this transaction needs to be voided..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="resize-none min-h-[120px]"
              disabled={isSubmitting}
              autoFocus
            />
            {!reason.trim() && (
              <p className="text-sm text-destructive">Please provide a reason for voiding</p>
            )}
          </div>

          <Alert variant="destructive" className="border-destructive/50">
            <IconAlertTriangle className="h-4 w-4" />
            <AlertTitle>Important Notice</AlertTitle>
            <AlertDescription>
              Voiding a transaction is irreversible and will be recorded in the audit log.
            </AlertDescription>
          </Alert>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleVoid} disabled={isConfirmDisabled}>
            {isSubmitting ? (
              <>
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Confirm Void'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
