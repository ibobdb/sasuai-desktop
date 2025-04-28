import { RefObject, useEffect } from 'react'

type RefArray = Array<RefObject<HTMLElement | null>>

/**
 * Hook for detecting clicks outside a set of elements
 * @param refs Array of refs to check against
 * @param handler Callback function to execute when clicked outside
 */
export function useClickOutside(refs: RefArray, handler: () => void): void {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is outside all of the provided refs
      const isOutside = refs.every((ref) => {
        return !ref.current || !ref.current.contains(event.target as Node)
      })

      if (isOutside) {
        handler()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [refs, handler])
}
