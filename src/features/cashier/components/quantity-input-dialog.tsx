import { useState, useEffect } from 'react'
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
import { Minus, Plus, Package } from 'lucide-react'

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
  const [quantity, setQuantity] = useState<number>(1)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // Reset quantity when product changes
  useEffect(() => {
    if (open && product) {
      setQuantity(1)
    }
  }, [open, product])

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
      console.error('Error confirming quantity:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && product) {
      handleConfirm()
    }
  }

  if (!product) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Package className="mr-2 h-5 w-5" />
            Add Product to Cart
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="p-3 bg-muted/20 rounded-lg">
            <h3 className="font-medium text-lg">{product.name}</h3>
            <p className="text-sm text-muted-foreground">
              {product.barcode && `Barcode: ${product.barcode}`}
              {product.barcode && product.skuCode && ' • '}
              {product.skuCode && `SKU: ${product.skuCode}`}
            </p>
            <p className="mt-1 font-medium">Price: Rp {product.price.toLocaleString()}</p>
            <p
              className={`text-sm ${product.currentStock > 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              Available Stock: {product.currentStock || 0}
            </p>
          </div>

          <div>
            <label htmlFor="quantity" className="block text-sm font-medium mb-2">
              Quantity:
            </label>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="icon"
                onClick={decreaseQuantity}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="quantity"
                className="w-20 text-center"
                value={quantity.toString()}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                type="number"
                min="1"
                autoFocus
              />
              <Button variant="outline" size="icon" onClick={increaseQuantity}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {maxQuantity && quantity > maxQuantity && (
            <p className="text-sm text-amber-600">
              Warning: Quantity exceeds available stock ({maxQuantity})
            </p>
          )}

          <div className="font-medium text-right">
            Total: Rp {(product.price * quantity).toLocaleString()}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading || quantity < 1}>
            {isLoading ? 'Adding...' : 'Add to Cart'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
