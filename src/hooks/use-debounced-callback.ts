import { useCallback, useEffect, useRef } from 'react'

/**
 * A hook that returns a debounced version of the callback function.
 * The debounced function will delay invoking the callback until after the specified delay.
 *
 * @param callback The function to debounce
 * @param delay The delay in milliseconds
 * @returns A debounced version of the callback
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const callbackRef = useRef<T>(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  return useCallback(
    ((...args: Parameters<T>) => {
      const timeoutId = setTimeout(() => {
        callbackRef.current(...args)
      }, delay)

      return () => clearTimeout(timeoutId)
    }) as T,
    [delay]
  )
}
