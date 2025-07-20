import { useState, useCallback, useRef } from 'react'
import { useProductSearch as useProductSearchQuery } from './use-cashier-queries'
import { useDebounce } from '@/hooks/use-debounce'
import { useKeyboardNavigation } from '@/hooks/use-keyboard-navigation'
import { useClickOutside } from '@/hooks/use-click-outside'
import { Product } from '@/types/cashier'

export interface UseProductSearchReturn {
  query: string
  setQuery: (query: string) => void
  results: Product[]
  showResults: boolean
  setShowResults: (show: boolean) => void
  isLoading: boolean
  handleSelect: (product: Product) => void
  handleManualSearch: () => void
  clearSearch: () => void
  focusedIndex: number
  listItemsRef: React.MutableRefObject<(HTMLElement | null)[]>
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  handleItemMouseEnter: (index: number) => void
  inputRef: React.RefObject<HTMLInputElement | null>
  resultsRef: React.RefObject<HTMLDivElement | null>
}

interface UseProductSearchProps {
  onProductSelect: (product: Product, quantity?: number) => void
  quickAddMode?: boolean
}

export function useProductSearch({
  onProductSelect,
  quickAddMode = false
}: UseProductSearchProps): UseProductSearchReturn {
  const [showResults, setShowResults] = useState(false)
  const [lastSearchedQuery, setLastSearchedQuery] = useState('')

  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  const searchCallback = useCallback((value: string) => {
    if (value.trim().length >= 3) {
      setLastSearchedQuery(value)
      setShowResults(true)
    } else if (value.trim().length === 0) {
      setLastSearchedQuery('')
      setShowResults(false)
    }
  }, [])

  const {
    value: query,
    setValue: setQuery,
    isDebouncing
  } = useDebounce('', {
    delay: 50,
    minLength: 3,
    callback: searchCallback
  })

  const handleSelect = useCallback(
    (product: Product) => {
      if (quickAddMode) {
        onProductSelect(product, 1)
        setQuery('')
        setShowResults(false)
      } else {
        onProductSelect(product)
      }
    },
    [quickAddMode, onProductSelect, setQuery]
  )

  // Use React Query for product search
  const { data: searchResults = [], isLoading } = useProductSearchQuery(
    { query: lastSearchedQuery },
    lastSearchedQuery.length >= 3
  )

  const handleManualSearch = useCallback(() => {
    if (query.trim().length >= 3) {
      setLastSearchedQuery(query)
      setShowResults(true)
    }
  }, [query])

  const { focusedIndex, listItemsRef, handleKeyDown, handleItemMouseEnter } = useKeyboardNavigation(
    {
      items: searchResults,
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

  const clearSearch = useCallback(() => {
    setQuery('')
    setShowResults(false)
    setLastSearchedQuery('')
    inputRef.current?.focus()
  }, [setQuery])

  return {
    query,
    setQuery,
    results: searchResults,
    showResults,
    setShowResults,
    isLoading: isLoading || isDebouncing,
    handleSelect,
    handleManualSearch,
    clearSearch,
    focusedIndex,
    listItemsRef,
    handleKeyDown,
    handleItemMouseEnter,
    inputRef,
    resultsRef
  }
}
