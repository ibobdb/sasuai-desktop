import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Loader2, X, Ticket, Package, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Product, Discount } from '@/types/cashier'
import { QuantityInputDialog } from './quantity-input-dialog'
import { useProductSearchHook } from '../hooks'
import {
  getExpiryInfo,
  getBestDiscount,
  getStockStatus,
  formatDiscount
} from '../utils/cashier-utils'

interface ProductSearchProps {
  onProductSelect: (product: Product, quantity?: number) => void
  autoFocus?: boolean
}

export default function ProductSearch({ onProductSelect, autoFocus = true }: ProductSearchProps) {
  const { t } = useTranslation(['cashier'])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [quantityDialogOpen, setQuantityDialogOpen] = useState(false)
  const [quickAddMode, setQuickAddMode] = useState<boolean>(false)

  // Use the new product search hook
  const productSearch = useProductSearchHook({
    onProductSelect: (product: Product, quantity?: number) => {
      if (quickAddMode) {
        onProductSelect(product, quantity || 1)
      } else {
        setSelectedProduct(product)
        setQuantityDialogOpen(true)
      }
    },
    quickAddMode
  })

  const {
    query,
    setQuery,
    results,
    showResults,
    setShowResults,
    isLoading,
    handleSelect,
    handleManualSearch,
    clearSearch,
    focusedIndex,
    listItemsRef,
    handleKeyDown,
    handleItemMouseEnter,
    inputRef,
    resultsRef
  } = productSearch

  // Handle adding product with quantity
  const handleAddWithQuantity = (product: Product, quantity: number) => {
    onProductSelect(product, quantity)
    setQuantityDialogOpen(false)
    setSelectedProduct(null)
    clearSearch()
    inputRef.current?.focus()
  }

  // Custom handleSelect to ensure cleanup
  const handleProductSelect = useCallback(
    (product: Product) => {
      handleSelect(product)
      // Clear search after selection to hide results
      setTimeout(() => {
        clearSearch()
        inputRef.current?.focus()
      }, 100)
    },
    [handleSelect, clearSearch, inputRef]
  )

  // Auto-focus input when component mounts
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus, inputRef])

  // Auto-select if there's an exact match when manually searching
  useEffect(() => {
    if (results.length === 1 && query.trim().length >= 3) {
      const exactMatch = results[0]
      // Auto-select for exact barcode, SKU, or name match
      if (
        exactMatch.name.toLowerCase() === query.toLowerCase() ||
        exactMatch.barcode === query ||
        exactMatch.skuCode === query
      ) {
        handleProductSelect(exactMatch)
        return
      }
    }

    // Also auto-select if barcode/SKU matches regardless of result count
    if (query.trim().length >= 3 && results.length > 0) {
      const barcodeMatch = results.find(
        (product) => product.barcode === query || product.skuCode === query
      )
      if (barcodeMatch) {
        handleProductSelect(barcodeMatch)
      }
    }
  }, [results, query, handleProductSelect])

  const handleInputFocus = () => {
    if (results.length > 0) {
      setShowResults(true)
    }
  }

  const formatDiscountLabel = (discount: Discount): string => {
    return formatDiscount(discount)
  }

  return (
    <div className="relative">
      <div className="relative">
        <div className="relative">
          <Input
            ref={inputRef}
            placeholder={t('cashier.productSearch.placeholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            className="pr-16 h-9"
            autoComplete="off"
          />

          {query && !isLoading && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-10 top-0 h-full w-8"
              onClick={clearSearch}
            >
              <X className="h-3 w-3" />
            </Button>
          )}

          <Button
            size="icon"
            className="absolute right-0 top-0 h-full rounded-l-none w-10"
            onClick={handleManualSearch}
            disabled={query.length < 3}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center space-x-2">
            <Switch id="quick-add-mode" checked={quickAddMode} onCheckedChange={setQuickAddMode} />
            <Label htmlFor="quick-add-mode" className="text-sm">
              {t('cashier.productSearch.quickAdd')}
            </Label>
          </div>
        </div>
      </div>

      {showResults && results.length > 0 && (
        <Card
          ref={resultsRef}
          className="absolute top-full mt-1 w-full z-50 max-h-96 overflow-auto border shadow-lg"
        >
          <div className="p-2">
            <div className="space-y-1">
              {results.map((product, index) => {
                const expiryInfo = getExpiryInfo(product)
                const stockStatus = getStockStatus(product.currentStock)
                const bestDiscount = getBestDiscount(product)
                const isFocused = index === focusedIndex

                return (
                  <div
                    key={product.id}
                    ref={(el) => {
                      listItemsRef.current[index] = el
                    }}
                    className={`p-3 rounded-md cursor-pointer transition-colors ${
                      isFocused ? 'bg-primary/10 ring-1 ring-primary/20' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handleProductSelect(product)}
                    onMouseEnter={() => handleItemMouseEnter(index)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Package className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <p className="font-medium text-sm truncate">{product.name}</p>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Rp {product.price.toLocaleString()}</span>
                          <span>•</span>
                          <span className={stockStatus.color}>
                            {product.currentStock} {t('cashier.productSearch.inStock')}
                          </span>
                          {product.barcode && (
                            <>
                              <span>•</span>
                              <span>{product.barcode}</span>
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                          {bestDiscount && (
                            <Badge variant="secondary" className="text-xs">
                              <Ticket className="h-3 w-3 mr-1" />
                              {formatDiscountLabel(bestDiscount)}
                            </Badge>
                          )}

                          {expiryInfo?.isWarning && (
                            <Badge
                              variant={expiryInfo.isExpired ? 'destructive' : 'outline'}
                              className="text-xs"
                            >
                              <AlertCircle className="h-3 w-3 mr-1" />
                              {expiryInfo.isExpired
                                ? t('cashier.productSearch.expired')
                                : `${expiryInfo.daysRemaining}d`}
                            </Badge>
                          )}

                          {product.currentStock <= 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {t('cashier.productSearch.outOfStock')}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </Card>
      )}

      <QuantityInputDialog
        open={quantityDialogOpen}
        onOpenChange={setQuantityDialogOpen}
        product={selectedProduct}
        onConfirm={handleAddWithQuantity}
        maxQuantity={selectedProduct?.currentStock}
      />
    </div>
  )
}
