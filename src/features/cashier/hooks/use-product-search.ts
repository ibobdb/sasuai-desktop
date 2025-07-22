import { useState, useCallback, useRef } from 'react'
import { useProductSearch as useProductSearchQuery } from './use-cashier-queries'
import { useDebounce } from '@/hooks/use-debounce'
import { useKeyboardNavigation } from '@/hooks/use-keyboard-navigation'
import { useClickOutside } from '@/hooks/use-click-outside'
import { Product, UseProductSearchReturn, UseProductSearchProps } from '@/types/cashier'

export function useProductSearch({
  onProductSelect,
  quickAddMode = false
}: UseProductSearchProps): UseProductSearchReturn {
  const [showResults, setShowResults] = useState(false)
  const [lastSearchedQuery, setLastSearchedQuery] = useState('')
  const [previousQueryLength, setPreviousQueryLength] = useState(0)

  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  const searchCallback = useCallback(
    (value: string) => {
      const currentLength = value.trim().length
      const isDeleting = currentLength < previousQueryLength

      setPreviousQueryLength(currentLength)

      if (currentLength >= 3) {
        // Only search if not deleting or if the query is different from last searched
        if (!isDeleting || value.trim() !== lastSearchedQuery) {
          setLastSearchedQuery(value)
          setShowResults(true)
        } else if (isDeleting) {
          // If deleting and have existing results, just show them without new search
          setShowResults(true)
        }
      } else if (currentLength === 0) {
        setLastSearchedQuery('')
        setShowResults(false)
        setPreviousQueryLength(0)
      } else {
        // Less than 3 characters but not empty - hide results
        setShowResults(false)
      }
    },
    [lastSearchedQuery, previousQueryLength]
  )

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
    setPreviousQueryLength(0)
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
