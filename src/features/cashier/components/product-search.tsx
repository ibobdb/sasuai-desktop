import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, Loader2, X, Ticket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { API_ENDPOINTS } from '@/config/api'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Product, Discount, ProductResponse } from '@/types/cashier'
import { useDebounce } from '@/hooks/use-debounce'
import { useClickOutside } from '@/hooks/use-click-outside'
import { useKeyboardNavigation } from '@/hooks/use-keyboard-navigation'
import { QuantityInputDialog } from './quantity-input-dialog'

interface ProductSearchProps {
  onProductSelect: (product: Product, quantity?: number) => void
  autoFocus?: boolean
}

export default function ProductSearch({ onProductSelect, autoFocus = true }: ProductSearchProps) {
  const [results, setResults] = useState<Product[]>([])
  const [showResults, setShowResults] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [lastSearchedQuery, setLastSearchedQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [quantityDialogOpen, setQuantityDialogOpen] = useState(false)
  const [quickAddMode, setQuickAddMode] = useState<boolean>(false)

  const handleSelect = useCallback(
    (product: Product) => {
      if (quickAddMode) {
        onProductSelect(product, 1)
        setQuery('')
        setLastSearchedQuery('')
        inputRef.current?.focus()
      } else {
        setSelectedProduct(product)
        setQuantityDialogOpen(true)
      }
      setResults([])
      setShowResults(false)
    },
    [quickAddMode, onProductSelect]
  )

  const searchCallback = useCallback(
    (value: string) => {
      if (value.trim() && value !== lastSearchedQuery) {
        fetchProducts(value)
        setLastSearchedQuery(value)
      }
    },
    [lastSearchedQuery]
  )

  const {
    value: query,
    setValue: setQuery,
    isDebouncing,
    isTooShort
  } = useDebounce('', {
    minLength: 3,
    callback: searchCallback
  })

  const handleManualSearch = useCallback(() => {
    if (query.trim().length >= 3 && query !== lastSearchedQuery) {
      fetchProducts(query)
      setLastSearchedQuery(query)
    }
  }, [query, lastSearchedQuery])

  const { focusedIndex, listItemsRef, handleKeyDown, handleItemMouseEnter } = useKeyboardNavigation(
    {
      items: results,
      onSelectItem: handleSelect,
      isDropdownVisible: showResults,
      setDropdownVisible: setShowResults,
      onSearch: handleManualSearch,
      searchQuery: query,
      minQueryLength: 3
    }
  )

  // Use click outside hook
  useClickOutside([resultsRef, inputRef], () => {
    setShowResults(false)
  })

  // Auto-select if there's an exact match when manually searching
  useEffect(() => {
    if (results.length > 0) {
      const exactMatch = results.find((p) => p.barcode === query || p.skuCode === query)
      if (exactMatch) {
        handleSelect(exactMatch)
      }
    }
  }, [results, query])

  const fetchProducts = async (searchQuery: string) => {
    if (!searchQuery.trim()) return

    setIsLoading(true)

    try {
      const data = (await window.api.request(
        `${API_ENDPOINTS.PRODUCTS.BASE}?search=${encodeURIComponent(searchQuery)}`,
        {
          method: 'GET'
        }
      )) as ProductResponse

      if (data.success && data.data) {
        const products: Product[] = data.data.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          barcode: item.barcode || undefined,
          currentStock: item.currentStock,
          skuCode: item.skuCode || undefined,
          batches: item.batches,
          discountRelationProduct: item.discountRelationProduct,
          unitId: item.unitId || ''
        }))

        setResults(products)
        setShowResults(products.length > 0)
      } else {
        setResults([])
        setShowResults(false)
      }
    } catch (err) {
      console.error('Error fetching products:', err)
      toast.error('Failed to fetch products', {
        description: 'Please try again later'
      })
      setResults([])
      setShowResults(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddWithQuantity = (product: Product, quantity: number) => {
    onProductSelect(product, quantity)
    setQuery('')
    setLastSearchedQuery('')
    inputRef.current?.focus()
  }

  const clearSearch = () => {
    setQuery('')
    setResults([])
    setShowResults(false)
    setLastSearchedQuery('')
    inputRef.current?.focus()
  }

  const handleInputFocus = () => {
    if (results.length > 0) {
      setShowResults(true)
    }
  }

  // Helper to check if product has active discounts
  const hasActiveDiscounts = (product: Product): boolean => {
    return (
      !!product.discountRelationProduct &&
      product.discountRelationProduct.filter((d) => d.discount.isActive).length > 0
    )
  }

  // Helper to get best discount (highest percentage or value)
  const getBestDiscount = (product: Product): Discount | null => {
    if (!product.discountRelationProduct || product.discountRelationProduct.length === 0) {
      return null
    }

    const activeDiscounts = product.discountRelationProduct
      .filter((d) => d.discount.isActive)
      .map((d) => d.discount)

    if (activeDiscounts.length === 0) return null

    return activeDiscounts.sort((a, b) => b.value - a.value)[0]
  }

  const formatDiscountLabel = (discount: Discount): string => {
    return discount.valueType === 'percentage'
      ? `${discount.value}%`
      : `Rp ${discount.value.toLocaleString()}`
  }

  return (
    <div className="space-y-3">
      <h2 className="font-bold">Product Search</h2>

      <div className="space-y-2">
        <div className="relative">
          <Input
            ref={inputRef}
            placeholder="Search by name, barcode or SKU..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            className="pr-8"
            autoFocus={autoFocus}
            tabIndex={1}
          />

          {query && !isLoading && !isDebouncing && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-8 top-0 h-full w-8"
              onClick={clearSearch}
            >
              <X className="h-3 w-3" />
            </Button>
          )}

          <Button
            size="icon"
            className="absolute right-0 top-0 h-full rounded-l-none"
            onClick={handleManualSearch}
            disabled={query.trim().length < 3 || isLoading || isDebouncing}
          >
            {isLoading || isDebouncing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>

          {showResults && results.length > 0 && (
            <Card
              className="absolute z-50 w-[100%] left-0 right-0 mt-1 max-h-64 overflow-auto"
              ref={resultsRef}
            >
              <ul className="py-1 divide-y divide-border">
                {results.map((product, index) => {
                  const bestDiscount = getBestDiscount(product)
                  return (
                    <li
                      key={product.id}
                      ref={(el) => {
                        listItemsRef.current[index] = el
                      }}
                      className={`px-3 py-2 transition-colors cursor-pointer ${
                        index === focusedIndex ? 'bg-accent' : 'hover:bg-accent'
                      }`}
                      onClick={() => handleSelect(product)}
                      onMouseEnter={() => handleItemMouseEnter(index)}
                    >
                      <div className="flex justify-between">
                        <div>
                          <div className="flex items-center">
                            <p className="font-medium">{product.name}</p>
                            {hasActiveDiscounts(product) && (
                              <Badge
                                variant="outline"
                                className="ml-2 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800"
                              >
                                <Ticket className="h-3 w-3 mr-1" />
                                {bestDiscount && formatDiscountLabel(bestDiscount)}
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground flex gap-2">
                            {product.barcode && <span>Barcode: {product.barcode}</span>}
                            {product.skuCode && <span>SKU: {product.skuCode}</span>}
                          </div>
                        </div>
                        <div className="text-right">
                          <p>Rp {product.price.toLocaleString()}</p>
                          <p
                            className={`text-xs ${
                              product.currentStock > 0 ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            Stock: {product.currentStock}
                          </p>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </Card>
          )}
        </div>

        <div className="flex items-center">
          <Switch id="quick-add-mode" checked={quickAddMode} onCheckedChange={setQuickAddMode} />
          <Label
            htmlFor="quick-add-mode"
            className={`ml-2 text-sm cursor-pointer ${
              quickAddMode
                ? 'text-green-600 dark:text-green-400 font-medium'
                : 'text-muted-foreground'
            }`}
          >
            Quick Add
          </Label>
        </div>
      </div>

      {(isLoading || isDebouncing) && query.trim() !== '' && (
        <div className="text-sm text-muted-foreground flex items-center">
          <Loader2 className="h-3 w-3 mr-2 animate-spin" />
          Searching products...
        </div>
      )}

      {!isLoading && !isDebouncing && query.trim().length >= 3 && results.length === 0 && (
        <div className="text-sm text-muted-foreground flex items-center">
          <X className="h-3 w-3 mr-2" />
          No products found
        </div>
      )}

      {isTooShort && (
        <div className="text-sm text-muted-foreground flex items-center">
          Enter at least 3 characters to search
        </div>
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
