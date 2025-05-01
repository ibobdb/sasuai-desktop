import { useState, useRef, useEffect, KeyboardEvent } from 'react'

interface UseKeyboardNavigationOptions<T> {
  items: T[]
  onSelectItem: (item: T) => void
  isDropdownVisible: boolean
  setDropdownVisible?: (visible: boolean) => void
  onSearch?: () => void
  searchQuery?: string
  minQueryLength?: number
}

export function useKeyboardNavigation<T>({
  items,
  onSelectItem,
  isDropdownVisible,
  setDropdownVisible,
  onSearch,
  searchQuery = '',
  minQueryLength = 3
}: UseKeyboardNavigationOptions<T>) {
  const [focusedIndex, setFocusedIndex] = useState<number>(-1)
  const listItemsRef = useRef<(HTMLElement | null)[]>([])

  // Reset refs array when items change
  useEffect(() => {
    listItemsRef.current = items.map(() => null)
  }, [items])

  // Reset focused index when results change
  useEffect(() => {
    if (items.length > 0 && isDropdownVisible) {
      setFocusedIndex(0)
    } else {
      setFocusedIndex(-1)
    }
  }, [items, isDropdownVisible])

  const scrollItemIntoView = (index: number) => {
    if (index >= 0 && listItemsRef.current[index]) {
      listItemsRef.current[index]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      })
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // If no results or dropdown isn't visible, potentially trigger search
    if (!isDropdownVisible || items.length === 0) {
      if (
        e.key === 'Enter' &&
        searchQuery.trim() !== '' &&
        searchQuery.trim().length >= minQueryLength
      ) {
        onSearch?.()
        e.preventDefault()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setFocusedIndex((prev) => {
          const newIndex = prev < items.length - 1 ? prev + 1 : 0
          // Scroll the item into view after state update
          setTimeout(() => scrollItemIntoView(newIndex), 0)
          return newIndex
        })
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusedIndex((prev) => {
          const newIndex = prev > 0 ? prev - 1 : items.length - 1
          // Scroll the item into view after state update
          setTimeout(() => scrollItemIntoView(newIndex), 0)
          return newIndex
        })
        break
      case 'Enter':
        e.preventDefault()
        if (focusedIndex >= 0 && focusedIndex < items.length) {
          onSelectItem(items[focusedIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        if (setDropdownVisible) {
          setDropdownVisible(false)
        }
        setFocusedIndex(-1)
        break
    }
  }

  const handleItemMouseEnter = (index: number) => {
    setFocusedIndex(index)
  }

  return {
    focusedIndex,
    listItemsRef,
    handleKeyDown,
    handleItemMouseEnter
  }
}
