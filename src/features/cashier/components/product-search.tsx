import { useState, useEffect, useRef } from 'react'
import { Search, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/authStore'
import { API_ENDPOINTS } from '@/config/api'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

type Product = {
  id: string
  name: string
  price: number
  barcode?: string
  currentStock: number
  skuCode?: string | null
}

type ProductResponse = {
  data: Array<{
    id: string
    name: string
    price: number
    barcode: string | null
    currentStock: number
    skuCode: string | null
    [key: string]: any
  }>
  success: boolean
}

type ProductSearchProps = {
  onProductSelect: (product: Product) => void
  autoFocus?: boolean
}

export default function ProductSearch({ onProductSelect, autoFocus = true }: ProductSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [showResults, setShowResults] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const { token } = useAuthStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Debounced search function
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim().length >= 2) {
        fetchProducts(query)
      } else if (query.trim() === '') {
        setResults([])
        setSelectedProduct(null)
        setShowResults(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query])

  const fetchProducts = async (searchQuery: string) => {
    if (!searchQuery.trim()) return

    setIsLoading(true)

    try {
      const data = (await window.api.fetchApi(
        `${API_ENDPOINTS.PRODUCTS.BASE}?search=${encodeURIComponent(searchQuery)}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )) as ProductResponse

      if (data.success && data.data) {
        const products: Product[] = data.data.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          barcode: item.barcode || undefined,
          currentStock: item.currentStock,
          skuCode: item.skuCode
        }))

        setResults(products)
        setShowResults(products.length > 0)

        // Auto-select if there's an exact match
        const exactMatch = products.find(
          (p) => p.barcode === searchQuery || p.skuCode === searchQuery
        )
        if (exactMatch) {
          handleSelect(exactMatch)
        }
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

  const handleSelect = (product: Product) => {
    onProductSelect(product)
    setSelectedProduct(product)
    setQuery('')
    setShowResults(false)
  }

  const clearSearch = () => {
    setQuery('')
    setResults([])
    setSelectedProduct(null)
    setShowResults(false)
    inputRef.current?.focus()
  }

  const handleInputFocus = () => {
    if (results.length > 0) {
      setShowResults(true)
    }
  }

  return (
    <div className="space-y-3">
      <h2 className="font-bold">Product Search</h2>

      <div className="relative">
        <Input
          ref={inputRef}
          placeholder="Search by name, barcode or SKU..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleInputFocus}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && query.trim() !== '') {
              const exactMatch = results.find((p) => p.barcode === query || p.skuCode === query)
              if (exactMatch) {
                handleSelect(exactMatch)
              } else {
                fetchProducts(query)
              }
              e.preventDefault()
            }
          }}
          className="pr-8"
          autoFocus={autoFocus}
        />

        {query && !isLoading && (
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
          onClick={() => fetchProducts(query)}
          disabled={query.trim() === '' || isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>

        {/* Search results dropdown */}
        {showResults && results.length > 0 && (
          <Card
            className="absolute z-50 w-[100%] left-0 right-0 mt-1 max-h-64 overflow-auto"
            ref={resultsRef}
          >
            <ul className="py-1 divide-y divide-border">
              {results.map((product) => (
                <li
                  key={product.id}
                  className="px-3 py-2 hover:bg-accent transition-colors cursor-pointer"
                  onClick={() => handleSelect(product)}
                >
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">{product.name}</p>
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
              ))}
            </ul>
          </Card>
        )}
      </div>

      {/* Loading state */}
      {isLoading && query.trim() !== '' && (
        <div className="text-sm text-muted-foreground">Searching products...</div>
      )}

      {/* No results message */}
      {!isLoading && query.trim().length >= 2 && results.length === 0 && (
        <div className="text-sm text-muted-foreground">No products found</div>
      )}

      {/* Selected product display */}
      {selectedProduct && (
        <div className="rounded-md border p-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">{selectedProduct.name}</h4>
              <p className="text-sm text-muted-foreground">
                Rp {selectedProduct.price.toLocaleString()} • Stock: {selectedProduct.currentStock}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedProduct(null)
                setQuery('')
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
