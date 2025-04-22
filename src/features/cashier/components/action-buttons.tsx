import { CreditCard, Printer, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'

type ActionButtonsProps = {
  onPay: () => void
  onClear: () => void
  onPrint: () => void
  isPayEnabled: boolean
  isPrintEnabled: boolean
}

export default function ActionButtons({
  onPay,
  onClear,
  onPrint,
  isPayEnabled,
  isPrintEnabled
}: ActionButtonsProps) {
  return (
    <div className="flex gap-2">
      <Dialog>
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
          <DialogFooter>
            <Button variant="outline" onClick={onPay}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Button variant="outline" size="lg" onClick={onClear}>
        <X className="mr-2 h-4 w-4" /> Clear
      </Button>

      <Button variant="outline" size="lg" onClick={onPrint} disabled={!isPrintEnabled}>
        <Printer className="mr-2 h-4 w-4" /> Receipt
      </Button>
    </div>
  )
}
