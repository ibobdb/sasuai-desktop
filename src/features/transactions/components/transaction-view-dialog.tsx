import { useEffect, useState } from 'react'
import { IconReceipt, IconLoader2, IconPrinter, IconInfoCircle } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Transaction, TransactionDetail } from '@/types/transactions'
import { formatCurrency } from '@/utils/format'
import { Separator } from '@/components/ui/separator'
import { useTransactions } from '../context/transactions-context'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentTransaction: Transaction
}

export function TransactionViewDialog({ open, onOpenChange, currentTransaction }: Props) {
  const { fetchTransactionDetail } = useTransactions()
  const [detail, setDetail] = useState<TransactionDetail | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    if (open && currentTransaction) {
      setLoading(true)
      fetchTransactionDetail(currentTransaction.id)
        .then((data) => {
          if (data) {
            setDetail(data)
          }
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setDetail(null)
    }
  }, [open, currentTransaction, fetchTransactionDetail])

  // Loading state dialog
  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IconLoader2 className="h-5 w-5 animate-spin" />
              Loading Transaction
            </DialogTitle>
            <DialogDescription>Fetching detailed transaction information</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-8">
            <p className="mt-2 text-sm text-muted-foreground">Loading transaction details...</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Fallback if detail couldn't be loaded
  if (!detail) {
    const date = new Date(currentTransaction.createdAt)
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-left">
            <DialogTitle className="flex items-center gap-2">
              <IconReceipt className="h-5 w-5" /> Transaction Details
            </DialogTitle>
            <DialogDescription>Transaction ID: {currentTransaction.id}</DialogDescription>
          </DialogHeader>

          <Card className="p-4 mb-4 bg-muted/50">
            <div className="flex items-start gap-2">
              <IconInfoCircle className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Detailed information could not be loaded. Showing basic transaction information.
              </p>
            </div>
          </Card>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{date.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cashier</p>
                  <p className="font-medium">{currentTransaction.cashier.name}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium">{currentTransaction.member?.name || 'Guest'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Final Amount</p>
                  <p className="font-semibold">
                    {formatCurrency(currentTransaction.pricing.finalAmount)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const { pricing, cashier, member, items, paymentMethod } = detail
  const date = new Date(detail.createdAt)
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalAmount = pricing.originalAmount

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl h-[90vh] flex flex-col p-0 overflow-hidden">
        {/* Fixed header */}
        <DialogHeader className="px-6 py-4 border-b sticky top-0 bg-background z-10">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <IconReceipt className="h-5 w-5" /> Transaction Receipt
              </DialogTitle>
              <DialogDescription className="mt-1 break-all">
                <span className="font-semibold">ID:</span> {detail.id}
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="ml-4"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </Button>
          </div>
        </DialogHeader>

        {/* Scrollable content area */}
        <ScrollArea className="flex-1 px-6">
          <div className="space-y-6 pb-4">
            {/* Meta Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Date & Time</p>
                  <p className="font-medium">{formattedDate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cashier</p>
                  <p className="font-medium">{cashier.name}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium flex flex-wrap gap-2 items-center">
                    {member ? (
                      <>
                        {member.name}
                        <Badge variant="secondary" className="text-xs">
                          {member.tier}
                        </Badge>
                      </>
                    ) : (
                      'Guest'
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <p className="font-medium capitalize">{paymentMethod.replace('_', ' ')}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Items List */}
            <div>
              <h3 className="font-semibold mb-3">Items Purchased ({totalItems})</h3>

              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-[300px] overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3 sticky top-0 bg-muted z-10">Item</th>
                        <th className="text-right p-3 whitespace-nowrap sticky top-0 bg-muted z-10">
                          Price
                        </th>
                        <th className="text-right p-3 whitespace-nowrap sticky top-0 bg-muted z-10">
                          Qty
                        </th>
                        <th className="text-right p-3 whitespace-nowrap sticky top-0 bg-muted z-10">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item.id} className="border-t hover:bg-muted/50 transition-colors">
                          <td className="p-3">
                            <div className="break-words max-w-[200px] sm:max-w-[300px]">
                              <p className="font-medium">{item.product.name}</p>
                              {item.discountApplied && (
                                <div className="mt-1">
                                  <Badge variant="outline" className="text-xs text-rose-600">
                                    {item.discountApplied.name}: -
                                    {formatCurrency(item.discountApplied.amount)}
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="text-right p-3 whitespace-nowrap">
                            {formatCurrency(item.product.price)}
                          </td>
                          <td className="text-right p-3 whitespace-nowrap">{item.quantity}</td>
                          <td className="text-right p-3 whitespace-nowrap font-medium">
                            {formatCurrency(item.originalAmount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <Separator />

            {/* Pricing Summary */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>

              {pricing.discounts.member && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Member Discount</span>
                  <span className="text-rose-600">
                    -{formatCurrency(pricing.discounts.member.amount)}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Discount</span>
                <span className="text-rose-600">-{formatCurrency(pricing.discounts.total)}</span>
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatCurrency(pricing.finalAmount)}</span>
              </div>
            </div>

            {/* Points Earned */}
            {detail.pointsEarned > 0 && (
              <Card className="bg-primary/5 border-primary/20 p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary"
                    >
                      <path d="M12 2v4" />
                      <path d="m16.2 7.8 2.9-2.9" />
                      <path d="M18 12h4" />
                      <path d="m16.2 16.2 2.9 2.9" />
                      <path d="M12 18v4" />
                      <path d="m4.9 19.1 2.9-2.9" />
                      <path d="M2 12h4" />
                      <path d="m4.9 4.9 2.9 2.9" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Points Earned</p>
                    <p className="text-sm text-muted-foreground">
                      Customer earned <span className="font-semibold">{detail.pointsEarned}</span>{' '}
                      loyalty points
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </ScrollArea>

        {/* Fixed footer */}
        <div className="p-4 border-t bg-background sticky bottom-0 flex flex-wrap justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button>
            <IconPrinter className="h-4 w-4 mr-2" />
            Print Receipt
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
