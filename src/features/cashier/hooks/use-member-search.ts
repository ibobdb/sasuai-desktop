import { useState, useRef, useCallback, useEffect } from 'react'
import { Member } from '@/types/cashier'
import { useDebounce } from '@/hooks/use-debounce'
import { useClickOutside } from '@/hooks/use-click-outside'
import { useKeyboardNavigation } from '@/hooks/use-keyboard-navigation'
import { useMemberSearch as useMemberSearchQuery } from './use-cashier-queries'

interface MemberSearchConfig {
  onMemberSelect: (member: Member) => void
}

export function useMemberSearch(config: MemberSearchConfig) {
  const { onMemberSelect } = config

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
        if (!isDeleting || value.trim() !== lastSearchedQuery) {
          setLastSearchedQuery(value)
          setShowResults(true)
        } else if (isDeleting) {
          setShowResults(true)
        }
      } else if (currentLength === 0) {
        setLastSearchedQuery('')
        setShowResults(false)
        setPreviousQueryLength(0)
      } else {
        setShowResults(false)
      }
    },
    [lastSearchedQuery, previousQueryLength]
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

  const { data: searchResults = [], isLoading } = useMemberSearchQuery(
    { query: lastSearchedQuery },
    lastSearchedQuery.length >= 3
  )

  const handleSelect = useCallback(
    (member: Member) => {
      setQuery('')
      setShowResults(false)
      setLastSearchedQuery('')

      onMemberSelect(member)

      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    },
    [onMemberSelect, setQuery]
  )

  const handleManualSearch = useCallback(() => {
    if (query.trim().length >= 3 && query !== lastSearchedQuery) {
      setLastSearchedQuery(query)
      setShowResults(true)
    }
  }, [query, lastSearchedQuery])

  const handleAutoSelect = useCallback(() => {
    if (searchResults.length > 0 && query.trim().length >= 3) {
      const exactMatch = searchResults.find(
        (m) =>
          m.phone === query || m.cardId === query || m.name.toLowerCase() === query.toLowerCase()
      )
      if (exactMatch) {
        handleSelect(exactMatch)
      }
    }
  }, [searchResults, query, handleSelect])

  useEffect(() => {
    handleAutoSelect()
  }, [handleAutoSelect])

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

  useClickOutside([resultsRef, inputRef], () => {
    setShowResults(false)
  })

  const handleInputFocus = () => {
    if (searchResults.length > 0) {
      setShowResults(true)
    }
  }

  const clearSearch = () => {
    setQuery('')
    setShowResults(false)
    setLastSearchedQuery('')
    inputRef.current?.focus()
  }

  return {
    query,
    setQuery,
    results: searchResults,
    showResults,
    setShowResults,
    isLoading,
    isDebouncing,
    isTooShort,

    handleSelect,
    handleManualSearch,
    clearSearch,
    handleInputFocus,

    focusedIndex,
    listItemsRef,
    handleKeyDown,
    handleItemMouseEnter,

    inputRef,
    resultsRef
  }
}
