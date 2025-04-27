import { useState, useEffect } from 'react'

type UseDebounceOptions = {
  delay?: number
  minLength?: number
  callback?: (value: string) => void
}

export function useDebounce(initialValue: string = '', options: UseDebounceOptions = {}) {
  const { delay = 300, minLength = 3, callback } = options
  const [value, setValue] = useState(initialValue)
  const [debouncedValue, setDebouncedValue] = useState(initialValue)
  const [isDebouncing, setIsDebouncing] = useState(false)
  const [meetsMinLength, setMeetsMinLength] = useState(initialValue.length >= minLength)

  useEffect(() => {
    setMeetsMinLength(value.length >= minLength)

    if (value.length >= minLength) {
      setIsDebouncing(true)
      const timer = setTimeout(() => {
        setDebouncedValue(value)
        setIsDebouncing(false)
        if (callback) callback(value)
      }, delay)

      return () => clearTimeout(timer)
    } else if (value.length === 0) {
      // If the value is cleared, update immediately
      setDebouncedValue('')
      setIsDebouncing(false)
    }
  }, [value, delay, minLength, callback])

  return {
    value,
    debouncedValue,
    setValue,
    isDebouncing,
    meetsMinLength,
    isTooShort: value.length > 0 && value.length < minLength
  }
}
