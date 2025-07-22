import { KeyboardShortcut } from '@/types/settings'

/**
 * Base keyboard shortcuts configuration (language-agnostic)
 * Contains IDs, actions, and key mappings - names and descriptions are fetched from translations
 */
const baseKeyboardShortcuts = [
  {
    id: 'search-product',
    translationKey: 'searchProduct',
    keys: ['F1'],
    action: 'focus-product-search',
    defaultKeys: ['F1']
  },
  {
    id: 'payment',
    translationKey: 'payment',
    keys: ['F2'],
    action: 'open-payment-dialog',
    defaultKeys: ['F2']
  },
  {
    id: 'clear-cart',
    translationKey: 'clearCart',
    keys: ['F3'],
    action: 'clear-cart',
    defaultKeys: ['F3']
  },
  {
    id: 'add-discount',
    translationKey: 'addDiscount',
    keys: ['F4'],
    action: 'add-discount',
    defaultKeys: ['F4']
  },
  {
    id: 'search-member',
    translationKey: 'searchMember',
    keys: ['F5'],
    action: 'search-member',
    defaultKeys: ['F5']
  },
  {
    id: 'quick-payment',
    translationKey: 'quickPayment',
    keys: ['Ctrl', 'Enter'],
    action: 'quick-payment',
    defaultKeys: ['Ctrl', 'Enter']
  },
  {
    id: 'execute-transaction',
    translationKey: 'executeTransaction',
    keys: ['F9'],
    action: 'execute-transaction',
    defaultKeys: ['F9']
  },
  {
    id: 'void-transaction',
    translationKey: 'voidTransaction',
    keys: ['F8'],
    action: 'void-transaction',
    defaultKeys: ['F8']
  }
]

/**
 * Get keyboard shortcuts with translations
 * @param t - Translation function from react-i18next
 * @returns Array of KeyboardShortcut with translated names and descriptions
 */
export const getKeyboardShortcuts = (t: (key: string) => string): KeyboardShortcut[] => {
  return baseKeyboardShortcuts.map((shortcut) => ({
    id: shortcut.id,
    name: t(`settings:keyboard.shortcutActions.${shortcut.translationKey}.name`),
    description: t(`settings:keyboard.shortcutActions.${shortcut.translationKey}.description`),
    keys: [...shortcut.keys],
    action: shortcut.action,
    defaultKeys: [...shortcut.defaultKeys]
  }))
}

/**
 * Default keyboard shortcuts (fallback without translations)
 * Used when translation context is not available
 */
export const DEFAULT_KEYBOARD_SHORTCUTS: KeyboardShortcut[] = [
  {
    id: 'search-product',
    name: 'Search Product',
    description: 'Focus on product search input',
    keys: ['F1'],
    action: 'focus-product-search',
    defaultKeys: ['F1']
  },
  {
    id: 'payment',
    name: 'Payment',
    description: 'Open payment dialog',
    keys: ['F2'],
    action: 'open-payment-dialog',
    defaultKeys: ['F2']
  },
  {
    id: 'clear-cart',
    name: 'Clear Cart',
    description: 'Remove all items from cart',
    keys: ['F3'],
    action: 'clear-cart',
    defaultKeys: ['F3']
  },
  {
    id: 'add-discount',
    name: 'Add Discount',
    description: 'Focus on discount code input',
    keys: ['F4'],
    action: 'add-discount',
    defaultKeys: ['F4']
  },
  {
    id: 'search-member',
    name: 'Search Member',
    description: 'Focus on member search',
    keys: ['F5'],
    action: 'search-member',
    defaultKeys: ['F5']
  },
  {
    id: 'quick-payment',
    name: 'Quick Payment',
    description: 'Process payment instantly with exact amount',
    keys: ['Ctrl', 'Enter'],
    action: 'quick-payment',
    defaultKeys: ['Ctrl', 'Enter']
  },
  {
    id: 'execute-transaction',
    name: 'Execute Transaction',
    description: 'Execute transaction with current payment method',
    keys: ['F9'],
    action: 'execute-transaction',
    defaultKeys: ['F9']
  },
  {
    id: 'void-transaction',
    name: 'Void Transaction',
    description: 'Cancel transaction and clear cart',
    keys: ['F8'],
    action: 'void-transaction',
    defaultKeys: ['F8']
  }
]
