import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Loader2, X, Ticket, Package, AlertCircle } from 'lucide-react'
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
  const { t } = useTranslation(['cashier'])
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
  }, [results, query, handleSelect])

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
      toast.error(t('cashier.productSearch.fetchError'), {
        description: t('cashier.productSearch.fetchErrorDescription')
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

  // Helper to format expiry date
  const getExpiryInfo = (product: Product) => {
    if (!product.batches || product.batches.length === 0) {
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

  // Get stock status for visual indicators
  const getStockStatus = (stock: number) => {
    if (stock <= 0)
      return { color: 'text-red-600 bg-red-50', label: t('cashier.productSearch.outOfStock') }
    if (stock < 5)
      return { color: 'text-red-600 bg-red-50', label: t('cashier.productSearch.lowStock') }
    if (stock < 15)
      return { color: 'text-amber-600 bg-amber-50', label: t('cashier.productSearch.limitedStock') }
    return { color: 'text-green-600 bg-green-50', label: t('cashier.productSearch.inStock') }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium flex items-center">
          <Package className="h-4 w-4 mr-2 text-muted-foreground" />
          {t('cashier.productSearch.title')}
        </h3>
      </div>

      <div className="space-y-1.5">
        <div className="relative">
          <Input
            ref={inputRef}
            placeholder={t('cashier.productSearch.placeholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            className="pr-16 h-9"
            autoFocus={autoFocus}
            tabIndex={1}
          />

          {query && !isLoading && !isDebouncing && (
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
              className="absolute z-50 w-full mt-1 max-h-[calc(100vh-200px)] overflow-auto shadow-lg border-muted"
              ref={resultsRef}
            >
              <ul className="divide-y divide-border">
                {results.map((product, index) => {
                  const bestDiscount = getBestDiscount(product)
                  const expiryInfo = getExpiryInfo(product)
                  const stockStatus = getStockStatus(product.currentStock)

                  return (
                    <li
                      key={product.id}
                      ref={(el) => {
                        listItemsRef.current[index] = el
                      }}
                      className={`px-3 py-2.5 transition-colors cursor-pointer ${
                        index === focusedIndex ? 'bg-accent' : 'hover:bg-accent'
                      }`}
                      onClick={() => handleSelect(product)}
                      onMouseEnter={() => handleItemMouseEnter(index)}
                      tabIndex={-1}
                      role="option"
                      aria-selected={index === focusedIndex}
                    >
                      <div className="flex justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2">
                            <p className="font-medium text-sm truncate flex-1">{product.name}</p>

                            {hasActiveDiscounts(product) && bestDiscount && (
                              <Badge
                                variant="outline"
                                className="ml-auto bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800 whitespace-nowrap"
                              >
                                <Ticket className="h-3 w-3 mr-1" />
                                {formatDiscountLabel(bestDiscount)}
                              </Badge>
                            )}
                          </div>

                          {/* Product codes */}
                          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mt-1">
                            {product.barcode && (
                              <span className="flex items-center text-sm">
                                <span className="font-medium mr-1">
                                  {t('cashier.productSearch.barcode')}:
                                </span>
                                <span className="font-mono">{product.barcode}</span>
                              </span>
                            )}
                            {product.skuCode && (
                              <span className="flex items-center text-sm">
                                <span className="font-medium mr-1">
                                  {t('cashier.productSearch.sku')}:
                                </span>
                                <span className="font-mono">{product.skuCode}</span>
                              </span>
                            )}
                          </div>

                          {/* Expiry information */}
                          {expiryInfo && (
                            <div
                              className={`text-sm mt-2 flex items-center ${
                                expiryInfo.isExpired
                                  ? 'text-red-600'
                                  : expiryInfo.isWarning
                                    ? 'text-amber-600'
                                    : 'text-muted-foreground'
                              }`}
                            >
                              {(expiryInfo.isExpired || expiryInfo.isWarning) && (
                                <AlertCircle className="h-3 w-3 mr-1.5" />
                              )}
                              {expiryInfo.isExpired
                                ? t('cashier.productSearch.expired') +
                                  `: ${expiryInfo.formattedDate}`
                                : expiryInfo.isWarning
                                  ? t('cashier.productSearch.expiringFormat', {
                                      date: expiryInfo.formattedDate,
                                      days: expiryInfo.daysRemaining
                                    })
                                  : t('cashier.productSearch.expiresOn', {
                                      date: expiryInfo.formattedDate
                                    })}
                            </div>
                          )}
                        </div>

                        {/* Price and stock information */}
                        <div className="text-right flex flex-col items-end">
                          <p className="font-medium whitespace-nowrap">
                            Rp {product.price.toLocaleString()}
                          </p>

                          <Badge
                            variant="outline"
                            className={`mt-1 ${stockStatus.color} text-xs border-none`}
                          >
                            <span className="font-medium">{stockStatus.label}</span>
                            {product.currentStock}
                          </Badge>
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
          <Switch
            id="quick-add-mode"
            checked={quickAddMode}
            onCheckedChange={setQuickAddMode}
            className={quickAddMode ? 'bg-green-500' : ''}
          />
          <Label
            htmlFor="quick-add-mode"
            className={`ml-2 text-sm cursor-pointer ${
              quickAddMode
                ? 'text-green-600 dark:text-green-400 font-medium'
                : 'text-muted-foreground'
            }`}
            onClick={() => setQuickAddMode(!quickAddMode)}
          >
            {t('cashier.productSearch.quickAdd')}
          </Label>
        </div>
      </div>

      {/* Status messages */}
      {!isLoading && !isDebouncing && query.trim().length >= 3 && results.length === 0 && (
        <div className="text-xs text-muted-foreground flex items-center pt-0.5">
          <X className="h-3 w-3 mr-1" />
          {t('cashier.productSearch.noResults', { query })}
        </div>
      )}

      {isTooShort && query.length > 0 && (
        <div className="text-xs text-muted-foreground flex items-center pt-0.5">
          <AlertCircle className="h-3 w-3 mr-1" />
          {t('cashier.productSearch.minCharacters')}
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
