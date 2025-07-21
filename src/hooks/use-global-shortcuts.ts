import { useEffect, useCallback } from 'react'
import { useSettings } from '@/features/settings/hooks/use-settings'

type ShortcutHandler = () => void

interface ShortcutHandlers {
  'focus-product-search'?: ShortcutHandler
  'open-payment-dialog'?: ShortcutHandler
  'clear-cart'?: ShortcutHandler
  'add-discount'?: ShortcutHandler
  'search-member'?: ShortcutHandler
  'quick-payment'?: ShortcutHandler
  'void-transaction'?: ShortcutHandler
}

export function useGlobalShortcuts(handlers: ShortcutHandlers) {
  const { settings } = useSettings()

  const executeShortcut = useCallback(
    (action: string) => {
      const handler = handlers[action as keyof ShortcutHandlers]
      if (handler) {
        handler()
      }
    },
    [handlers]
  )

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Skip if modal is open (check for modal backdrop)
      if (document.querySelector('[data-radix-dialog-overlay]')) {
        return
      }

      const target = event.target as HTMLElement
      const isInInputField =
        target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable

      // For input fields, only allow function keys (F1-F12) and Ctrl combinations
      if (isInInputField) {
        const isFunctionKey = event.key.startsWith('F') && event.key.length <= 3
        const isCtrlCombination = event.ctrlKey || event.metaKey

        if (!isFunctionKey && !isCtrlCombination) {
          return
        }
      }

      const pressedKeys: string[] = []

      if (event.ctrlKey) pressedKeys.push('Ctrl')
      if (event.altKey) pressedKeys.push('Alt')
      if (event.shiftKey) pressedKeys.push('Shift')
      if (event.metaKey) pressedKeys.push('Meta')

      // Add main key
      if (!['Control', 'Alt', 'Shift', 'Meta'].includes(event.key)) {
        let key = event.key
        if (key === ' ') {
          key = 'Space'
        } else if (key.length === 1) {
          key = key.toUpperCase()
        }
        pressedKeys.push(key)
      }

      const pressedSequence = pressedKeys.join(' + ')

      // Find matching shortcut
      const matchingShortcut = settings.keyboard.find(
        (shortcut) => shortcut.keys.join(' + ') === pressedSequence
      )

      if (matchingShortcut) {
        event.preventDefault()
        event.stopPropagation()
        executeShortcut(matchingShortcut.action)
      }
    },
    [settings.keyboard, executeShortcut]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown, true)
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [handleKeyDown])

  return {
    shortcuts: settings.keyboard,
    getShortcutByAction: (action: string) => settings.keyboard.find((s) => s.action === action)
  }
}
