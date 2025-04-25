import { useState } from 'react'
import { IconAlertTriangle } from '@tabler/icons-react'
import { showSubmittedData } from '@/utils/show-submitted-data'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Transaction } from '../data/schema'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentTransaction: Transaction
}

export function TransactionDeleteDialog({ open, onOpenChange, currentTransaction }: Props) {
  const [value, setValue] = useState('')
  const confirmationId = currentTransaction.id

  const handleDelete = () => {
    if (value.trim() !== confirmationId) return

    onOpenChange(false)
    showSubmittedData(currentTransaction, 'The following transaction has been voided:')
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== confirmationId}
      title={
        <span className="text-destructive">
          <IconAlertTriangle className="stroke-destructive mr-1 inline-block" size={18} />
          Void Transaction
        </span>
      }
      desc={
        <div className="space-y-4">
          <p className="mb-2">
            Are you sure you want to void transaction{' '}
            <span className="font-bold">{confirmationId}</span>?
            <br />
            This action will permanently invalidate this transaction and may trigger refunds if
            applicable. This cannot be undone.
          </p>

          <Label className="my-2">
            Confirm by typing: <span className="font-mono font-medium">{confirmationId}</span>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`Enter ${confirmationId} to confirm`}
              className="mt-1"
            />
          </Label>

          <Alert variant="destructive">
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>
              This operation cannot be reversed and may have financial implications.
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText="Void Transaction"
      destructive
    />
  )
}
