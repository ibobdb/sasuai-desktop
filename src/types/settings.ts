// Types for settings feature

export interface KeyboardShortcut {
  id: string
  name: string
  description: string
  keys: string[]
  action: string
  defaultKeys: string[]
  isCustom?: boolean
}

export interface PrinterSettings {
  printerName: string
  paperSize: '58mm' | '80mm' | '78mm' | '76mm' | '57mm' | '44mm'
  margin: string
  copies: number
  timeOutPerLine: number
}

export interface PrintReceipt {
  id: string
  storeName: string
  address: string
  phone: string
  items: Array<{
    name: string
    quantity: number
    price: number
    total: number
  }>
  subtotal: number
  tax: number
  total: number
  payment: {
    method: string
    amount: number
    change: number
  }
  transactionDate: Date
  cashier: string
}

export interface GeneralConfig {
  language: string
  theme: 'light' | 'dark' | 'system'
  autoStart: boolean
  minimizeToTray: boolean
  autoUpdate: boolean
}

export interface SettingsConfig {
  general: GeneralConfig
  keyboard: KeyboardShortcut[]
  printer: PrinterSettings
}

// Component Props
export interface SettingsTabProps {
  config: SettingsConfig
  onConfigChange: (config: SettingsConfig) => void
}

export interface KeyboardShortcutItemProps {
  shortcut: KeyboardShortcut
  onEdit: (shortcut: KeyboardShortcut) => void
  onReset: (shortcutId: string) => void
}

export interface PrinterSettingsProps {
  settings: PrinterSettings
  printers: string[]
  onSettingsChange: (settings: PrinterSettings) => void
  onTestPrint: () => void
}
