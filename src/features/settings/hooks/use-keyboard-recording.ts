import { useState, useRef, useEffect, useCallback, useMemo } from 'react'

const MODIFIER_KEYS = new Set(['Control', 'Alt', 'Shift', 'Meta'])

const KEY_MAP = new Map([
  [' ', 'Space'],
  ['Enter', 'Enter'],
  ['Tab', 'Tab'],
  ['Escape', 'Escape'],
  ['Backspace', 'Backspace'],
  ['Delete', 'Delete']
])

export function useKeyboardRecording() {
  const [keySequence, setKeySequence] = useState<string[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const keyInputRef = useRef<HTMLInputElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const parseKeyEvent = useCallback((e: KeyboardEvent | React.KeyboardEvent): string[] | null => {
    const keys: string[] = []
    let hasNonModifierKey = false

    if (e.ctrlKey) keys.push('Ctrl')
    if (e.altKey) keys.push('Alt')
    if (e.shiftKey) keys.push('Shift')
    if (e.metaKey) keys.push('Meta')

    if (!MODIFIER_KEYS.has(e.key)) {
      hasNonModifierKey = true
      const mappedKey = KEY_MAP.get(e.key)

      if (mappedKey) {
        keys.push(mappedKey)
      } else if (e.key.length === 1) {
        keys.push(e.key.toUpperCase())
      } else {
        keys.push(e.key)
      }
    }

    return hasNonModifierKey && keys.length > 0 ? keys : null
  }, [])

  const startRecording = useCallback(() => {
    setIsRecording(true)
    setKeySequence([])

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      if (keyInputRef.current) {
        keyInputRef.current.focus()
      }
      timeoutRef.current = null
    }, 50)
  }, [])

  const stopRecording = useCallback(() => {
    setIsRecording(false)
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isRecording) return

      e.preventDefault()
      e.stopPropagation()

      const keys = parseKeyEvent(e)
      if (keys) {
        setKeySequence(keys)
        setIsRecording(false)
      }
    },
    [isRecording, parseKeyEvent]
  )

  const clearKeySequence = useCallback(() => setKeySequence([]), [])

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (!isRecording) return

      e.preventDefault()
      e.stopPropagation()

      const keys = parseKeyEvent(e)
      if (keys) {
        setKeySequence(keys)
        setIsRecording(false)
      }
    }

    if (isRecording) {
      document.addEventListener('keydown', handleGlobalKeyDown, true)
    }

    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown, true)
    }
  }, [isRecording, parseKeyEvent])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const returnValue = useMemo(
    () => ({
      keySequence,
      setKeySequence,
      isRecording,
      keyInputRef,
      startRecording,
      stopRecording,
      handleKeyDown,
      clearKeySequence
    }),
    [keySequence, isRecording, startRecording, stopRecording, handleKeyDown, clearKeySequence]
  )

  return returnValue
}
