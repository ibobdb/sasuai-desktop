import { useState, useEffect, useRef } from 'react'

type UseDebounceOptions = {
  delay?: number
  minLength?: number
  callback?: (value: string) => void
}

export function useDebounce(initialValue: string = '', options: UseDebounceOptions = {}) {
  const { delay = 50, minLength = 2 } = options // Set minimum 2 characters for better search relevance
  const [value, setValue] = useState(initialValue)
  const [debouncedValue, setDebouncedValue] = useState(initialValue)
  const [isDebouncing, setIsDebouncing] = useState(false)
  const [meetsMinLength, setMeetsMinLength] = useState(initialValue.length >= minLength)

  // Use ref to store callback to avoid dependency issues
  const callbackRef = useRef(options.callback)
  callbackRef.current = options.callback

  useEffect(() => {
    setMeetsMinLength(value.length >= minLength)

    if (value.length >= minLength) {
      setIsDebouncing(true)
      const timer = setTimeout(() => {
        setDebouncedValue(value)
        setIsDebouncing(false)
        if (callbackRef.current) callbackRef.current(value)
      }, delay)

      return () => clearTimeout(timer)
    } else if (value.length === 0) {
      // If the value is cleared, update immediately
      setDebouncedValue('')
      setIsDebouncing(false)
      if (callbackRef.current) callbackRef.current('')
    } else {
      // If value is too short but not empty, clear the debounced value
      setDebouncedValue('')
      setIsDebouncing(false)
    }

    // Return a no-op cleanup function for all other cases
    return () => {
      /* no-op cleanup */
    }
  }, [value, delay, minLength]) // Remove callback from dependency array

  return {
    value,
    debouncedValue,
    setValue,
    isDebouncing,
    meetsMinLength,
    isTooShort: value.length > 0 && value.length < minLength
  }
}
