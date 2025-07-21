import { useState, useRef, useEffect } from 'react'

export function useKeyboardRecording() {
  const [keySequence, setKeySequence] = useState<string[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const keyInputRef = useRef<HTMLInputElement>(null)

  const startRecording = () => {
    setIsRecording(true)
    setKeySequence([])
    setTimeout(() => {
      if (keyInputRef.current) {
        keyInputRef.current.focus()
      }
    }, 50)
  }

  const stopRecording = () => {
    setIsRecording(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isRecording) return

    e.preventDefault()
    e.stopPropagation()

    const keys: string[] = []
    let hasNonModifierKey = false

    if (e.ctrlKey) keys.push('Ctrl')
    if (e.altKey) keys.push('Alt')
    if (e.shiftKey) keys.push('Shift')
    if (e.metaKey) keys.push('Meta')

    if (!['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) {
      let key = e.key
      hasNonModifierKey = true

      if (key === ' ') {
        key = 'Space'
      } else if (key === 'Enter') {
        key = 'Enter'
      } else if (key === 'Tab') {
        key = 'Tab'
      } else if (key === 'Escape') {
        key = 'Escape'
      } else if (key === 'Backspace') {
        key = 'Backspace'
      } else if (key === 'Delete') {
        key = 'Delete'
      } else if (key.length === 1) {
        key = key.toUpperCase()
      }

      keys.push(key)
    }

    if (hasNonModifierKey && keys.length > 0) {
      setKeySequence(keys)
      setIsRecording(false)
    }
  }

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (isRecording) {
        e.preventDefault()
        e.stopPropagation()

        const keys: string[] = []
        let hasNonModifierKey = false

        if (e.ctrlKey) keys.push('Ctrl')
        if (e.altKey) keys.push('Alt')
        if (e.shiftKey) keys.push('Shift')
        if (e.metaKey) keys.push('Meta')

        if (!['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) {
          let key = e.key
          hasNonModifierKey = true

          if (key === ' ') {
            key = 'Space'
          } else if (key === 'Enter') {
            key = 'Enter'
          } else if (key === 'Tab') {
            key = 'Tab'
          } else if (key === 'Escape') {
            key = 'Escape'
          } else if (key === 'Backspace') {
            key = 'Backspace'
          } else if (key === 'Delete') {
            key = 'Delete'
          } else if (key.length === 1) {
            key = key.toUpperCase()
          }

          keys.push(key)
        }

        if (hasNonModifierKey && keys.length > 0) {
          setKeySequence(keys)
          setIsRecording(false)
        }
      }
    }

    if (isRecording) {
      document.addEventListener('keydown', handleGlobalKeyDown, true)
    }

    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown, true)
    }
  }, [isRecording])

  const clearKeySequence = () => setKeySequence([])

  return {
    keySequence,
    setKeySequence,
    isRecording,
    keyInputRef,
    startRecording,
    stopRecording,
    handleKeyDown,
    clearKeySequence
  }
}
