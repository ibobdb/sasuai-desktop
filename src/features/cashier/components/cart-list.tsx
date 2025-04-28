import { useState } from 'react'
import {
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
  AlertCircle,
  ChevronDown,
  Barcode,
  X
} from 'lucide-react'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { Discount, CartListProps } from '@/types/cashier'

export default function CartList({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onUpdateDiscount
}: CartListProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [editingQuantity, setEditingQuantity] = useState<string | null>(null)
  const [quantityInput, setQuantityInput] = useState<string>('')

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

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

  // Format discount for display
  const formatDiscount = (discount: Discount) => {
    return discount.valueType === 'percentage'
      ? `${discount.value}%`
      : `Rp ${discount.value.toLocaleString()}`
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="font-medium flex items-center text-base">
          <ShoppingCart className="mr-1.5 h-4 w-4" />
          Shopping Cart
          {items.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {totalItems} item{totalItems !== 1 ? 's' : ''}
            </Badge>
          )}
        </h2>

        {selectedCount > 0 && (
          <Button variant="destructive" size="sm" onClick={handleRemoveSelected} className="h-7">
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Remove {selectedCount}
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
            <div className="h-[calc(100vh-340px)] flex flex-col">
              <Table className="table-fixed border-collapse">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px] px-4">
                      <Checkbox
                        checked={selectedItems.size === items.length && items.length > 0}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all items"
                      />
                    </TableHead>
                    <TableHead className="w-[30%]">Product</TableHead>
                    <TableHead className="w-[15%] text-right">Price</TableHead>
                    <TableHead className="w-[15%] text-center">Qty</TableHead>
                    <TableHead className="w-[20%] text-left">Discount</TableHead>
                    <TableHead className="w-[15%] text-right">Subtotal</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
              </Table>
              <div className="flex-1 overflow-auto">
                <Table className="table-fixed border-collapse">
                  <TableBody>
                    {items.map((item) => (
                      <TableRow
                        key={item.id}
                        className={selectedItems.has(item.id) ? 'bg-accent/50' : undefined}
                      >
                        <TableCell className="w-[40px] px-4">
                          <Checkbox
                            checked={selectedItems.has(item.id)}
                            onCheckedChange={(checked) => handleSelectItem(item.id, !!checked)}
                            aria-label={`Select ${item.name}`}
                          />
                        </TableCell>
                        <TableCell className="w-[30%] font-medium">
                          <div className="flex flex-col">
                            <span>{item.name}</span>
                            {item.barcode && (
                              <span className="text-xs text-muted-foreground flex items-center mt-1">
                                <Barcode className="h-3 w-3 mr-1" />
                                {item.barcode}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="w-[15%] text-right">
                          Rp {item.price.toLocaleString()}
                        </TableCell>
                        <TableCell className="w-[15%]">
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
                        <TableCell className="w-[20%] text-left">
                          {item.discountRelationProduct &&
                          item.discountRelationProduct.length > 0 ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className={
                                    item.selectedDiscount
                                      ? 'text-green-600 border-green-200 hover:bg-green-50'
                                      : ''
                                  }
                                >
                                  {item.selectedDiscount
                                    ? `${item.selectedDiscount.name} (${formatDiscount(item.selectedDiscount)})`
                                    : 'Select'}{' '}
                                  <ChevronDown className="h-3 w-3 ml-1" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {item.discountRelationProduct.map((relation) => (
                                  <DropdownMenuItem
                                    key={relation.discountId}
                                    onClick={() => onUpdateDiscount(item.id, relation.discount)}
                                    className={
                                      item.selectedDiscount?.id === relation.discountId
                                        ? 'bg-accent'
                                        : ''
                                    }
                                  >
                                    {relation.discount.name} ({formatDiscount(relation.discount)})
                                  </DropdownMenuItem>
                                ))}
                                {item.selectedDiscount && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => onUpdateDiscount(item.id, null)}
                                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 font-medium"
                                    >
                                      <X className="h-3.5 w-3.5 mr-1" />
                                      Remove Discount
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            <span className="text-muted-foreground">No discount</span>
                          )}
                        </TableCell>
                        <TableCell className="w-[15%] text-right">
                          <div>
                            {item.discountAmount > 0 && (
                              <div className="line-through text-muted-foreground text-xs">
                                Rp {item.subtotal.toLocaleString()}
                              </div>
                            )}
                            <div
                              className={`font-medium ${
                                item.discountAmount > 0 ? 'text-green-600' : ''
                              }`}
                            >
                              Rp {item.finalPrice.toLocaleString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="w-[50px]">
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
            </div>
          </div>
        </>
      )}
    </div>
  )
}
