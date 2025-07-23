import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Product } from '@/types/cashier'
import { Minus, Plus, Package, AlertCircle, ShoppingCart } from 'lucide-react'

interface QuantityInputDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
  onConfirm: (product: Product, quantity: number) => void
  maxQuantity?: number
}

export function QuantityInputDialog({
  open,
  onOpenChange,
  product,
  onConfirm,
  maxQuantity
}: QuantityInputDialogProps) {
  const { t } = useTranslation(['cashier'])
  const [quantity, setQuantity] = useState<number>(1)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Reset quantity when product changes
  useEffect(() => {
    if (open && product) {
      setQuantity(1)
    }
  }, [open, product])

  // Focus input when dialog opens
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.select()
    }
  }, [open])

  const increaseQuantity = () => {
    setQuantity((prev) => prev + 1)
  }

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    if (!isNaN(value) && value >= 1) {
      setQuantity(value)
    } else if (e.target.value === '') {
      setQuantity(1)
    }
  }

  const handleConfirm = async () => {
    if (!product) return

    setIsLoading(true)
    try {
      await onConfirm(product, quantity)
      onOpenChange(false)
    } catch (error) {
      if (import.meta.env.DEV)
        if (import.meta.env.DEV) console.error('Error confirming quantity:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && product) {
      handleConfirm()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      increaseQuantity()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      decreaseQuantity()
    }
  }

  // Get expiry information
  const getExpiryInfo = (product: Product | null) => {
    if (!product || !product.batches || product.batches.length === 0) {
      return null
    }

    // Find the closest expiry date
    const sortedBatches = [...product.batches].sort(
      (a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
    )

    const closestExpiry = sortedBatches[0]?.expiryDate
    if (!closestExpiry) return null

    const expiryDate = new Date(closestExpiry)
    const today = new Date()
    const daysUntilExpiry = Math.ceil(
      (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    )

    return {
      date: expiryDate,
      daysRemaining: daysUntilExpiry,
      isExpired: daysUntilExpiry < 0,
      isWarning: daysUntilExpiry >= 0 && daysUntilExpiry <= 30,
      formattedDate: expiryDate.toLocaleDateString()
    }
  }

  if (!product) return null

  const expiryInfo = getExpiryInfo(product)
  const totalPrice = product.price * quantity

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Package className="mr-2 h-5 w-5" />
            {t('cashier.quantityDialog.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Product info card */}
          <div className="p-3 bg-muted/20 rounded-lg border">
            <h3 className="font-medium text-lg">{product.name}</h3>

            <p className="text-sm text-muted-foreground">
              {product.barcode && (
                <span className="font-mono">{`${t('cashier.productSearch.barcode')}: ${product.barcode}`}</span>
              )}
              {product.barcode && product.skuCode && ' • '}
              {product.skuCode && (
                <span className="font-mono">{`${t('cashier.productSearch.sku')}: ${product.skuCode}`}</span>
              )}
            </p>

            <p className="mt-2 font-medium">
              {t('cashier.quantityDialog.price')}: Rp {product.price.toLocaleString()}
            </p>

            <div className="mt-1">
              <p
                className={`text-sm ${product.currentStock > 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {t('cashier.quantityDialog.availableStock')}: {product.currentStock || 0}
              </p>

              {/* Stock indicator - simple bar */}
              {product.currentStock > 0 && (
                <div className="mt-1 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      product.currentStock < 5
                        ? 'bg-red-500'
                        : product.currentStock < 15
                          ? 'bg-amber-500'
                          : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(product.currentStock * 5, 100)}%` }}
                    aria-hidden="true"
                  />
                </div>
              )}
            </div>

            {/* Expiry date information with improved styling */}
            {expiryInfo && (
              <div
                className={`mt-2 text-sm p-1.5 rounded-md flex items-center ${
                  expiryInfo.isExpired
                    ? 'bg-red-50 text-red-600 font-medium'
                    : expiryInfo.isWarning
                      ? 'bg-amber-50 text-amber-600'
                      : 'text-muted-foreground'
                }`}
              >
                {(expiryInfo.isExpired || expiryInfo.isWarning) && (
                  <AlertCircle className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                )}
                <span>
                  {expiryInfo.isExpired
                    ? t('cashier.productSearch.expired') + `: ${expiryInfo.formattedDate}`
                    : expiryInfo.isWarning
                      ? t('cashier.productSearch.expiringFormat', {
                          date: expiryInfo.formattedDate,
                          days: expiryInfo.daysRemaining
                        })
                      : t('cashier.productSearch.expiresOn', { date: expiryInfo.formattedDate })}
                </span>
              </div>
            )}
          </div>

          {/* Quantity selector with improved accessibility */}
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium mb-2">
              {t('cashier.quantityDialog.quantity')}
            </label>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="icon"
                onClick={decreaseQuantity}
                disabled={quantity <= 1}
                aria-label={t('cashier.quantityDialog.decreaseQuantity')}
                className="h-9 w-9"
              >
                <Minus className="h-4 w-4" />
              </Button>

              <Input
                id="quantity"
                ref={inputRef}
                className="w-20 text-center font-medium"
                value={quantity.toString()}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                type="number"
                min="1"
                max={maxQuantity}
                aria-label={t('cashier.quantityDialog.productQuantity')}
              />

              <Button
                variant="outline"
                size="icon"
                onClick={increaseQuantity}
                aria-label={t('cashier.quantityDialog.increaseQuantity')}
                className="h-9 w-9"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Warning when quantity exceeds stock */}
            {maxQuantity && quantity > maxQuantity && (
              <p className="mt-2 text-sm text-amber-600 flex items-center">
                <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
                {t('cashier.quantityDialog.stockWarning', { max: maxQuantity })}
              </p>
            )}
          </div>

          {/* Total price with more prominence */}
          <div className="p-2 bg-muted/20 rounded-md">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {t('cashier.quantityDialog.total')}
              </span>
              <span className="font-medium text-lg">Rp {totalPrice.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('cashier.quantityDialog.cancel')}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || quantity < 1}
            className="flex items-center space-x-1"
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            <span>
              {isLoading ? t('cashier.quantityDialog.adding') : t('cashier.quantityDialog.add')}
            </span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
