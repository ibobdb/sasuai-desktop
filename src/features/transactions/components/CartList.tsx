import { useState } from 'react'
import { Minus, Plus, Trash2, ShoppingCart, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

type CartItem = {
  id: string
  name: string
  price: number
  quantity: number
  subtotal: number
}

type CartListProps = {
  items: CartItem[]
  onUpdateQuantity: (id: string, quantity: number) => void
  onRemoveItem: (id: string) => void
}

export default function CartList({ items, onUpdateQuantity, onRemoveItem }: CartListProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [editingQuantity, setEditingQuantity] = useState<string | null>(null)
  const [quantityInput, setQuantityInput] = useState<string>('')

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0)

  const handleSelectItem = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedItems)
    if (checked) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedItems(newSelected)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = items.map((item) => item.id)
      setSelectedItems(new Set(allIds))
    } else {
      setSelectedItems(new Set())
    }
  }

  const handleRemoveSelected = () => {
    selectedItems.forEach((id) => {
      onRemoveItem(id)
    })
    setSelectedItems(new Set())
  }

  const startEditingQuantity = (id: string, currentQuantity: number) => {
    setEditingQuantity(id)
    setQuantityInput(currentQuantity.toString())
  }

  const finishEditingQuantity = (id: string) => {
    const quantity = parseInt(quantityInput)
    if (!isNaN(quantity) && quantity > 0) {
      onUpdateQuantity(id, quantity)
    }
    setEditingQuantity(null)
  }

  const selectedCount = selectedItems.size

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg flex items-center">
          <ShoppingCart className="mr-2 h-5 w-5" />
          Shopping Cart
          {items.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {totalItems} item{totalItems !== 1 ? 's' : ''}
            </Badge>
          )}
        </h2>

        {selectedCount > 0 && (
          <Button variant="destructive" size="sm" onClick={handleRemoveSelected}>
            <Trash2 className="h-4 w-4 mr-1" />
            Remove {selectedCount} selected
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-10 border rounded-md bg-muted/20">
          <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-muted-foreground">Your cart is empty</p>
          <p className="text-xs text-muted-foreground mt-1">Search and add products to begin</p>
        </div>
      ) : (
        <>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px] px-4">
                    <Checkbox
                      checked={selectedItems.size === items.length && items.length > 0}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all items"
                    />
                  </TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-center">Qty</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow
                    key={item.id}
                    className={selectedItems.has(item.id) ? 'bg-accent/50' : undefined}
                  >
                    <TableCell className="px-4">
                      <Checkbox
                        checked={selectedItems.has(item.id)}
                        onCheckedChange={(checked) => handleSelectItem(item.id, !!checked)}
                        aria-label={`Select ${item.name}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-right">Rp {item.price.toLocaleString()}</TableCell>
                    <TableCell>
                      {editingQuantity === item.id ? (
                        <div className="flex items-center justify-center">
                          <Input
                            type="number"
                            value={quantityInput}
                            onChange={(e) => setQuantityInput(e.target.value)}
                            className="w-16 h-8 text-center"
                            autoFocus
                            min="1"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') finishEditingQuantity(item.id)
                              if (e.key === 'Escape') setEditingQuantity(null)
                            }}
                            onBlur={() => finishEditingQuantity(item.id)}
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span
                            className="w-8 text-center cursor-pointer hover:underline"
                            onClick={() => startEditingQuantity(item.id, item.quantity)}
                          >
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      Rp {item.subtotal.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onRemoveItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-between items-center bg-muted/20 p-3 rounded-md">
            <div className="text-sm">
              <span className="font-medium">Total Items:</span> {totalItems}
            </div>
            <div className="text-lg font-bold">Subtotal: Rp {subtotal.toLocaleString()}</div>
          </div>
        </>
      )}
    </div>
  )
}
