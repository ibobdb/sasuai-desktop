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

export interface PrinterConfig {
  id: string
  name: string
  type: 'thermal' | 'inkjet' | 'laser'
  connection: 'usb' | 'network' | 'bluetooth'
  settings: {
    paperWidth: number // in mm
    paperHeight?: number // in mm, optional for continuous paper
    dpi: number
    characterSet: string
    autocut: boolean
    buzzer: boolean
    drawer: boolean
  }
  networkConfig?: {
    ipAddress: string
    port: number
  }
  isDefault: boolean
  isActive: boolean
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
  printer: PrinterConfig
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

export interface PrinterItemProps {
  printer: PrinterConfig
  onEdit: (printer: PrinterConfig) => void
  onDelete: (printerId: string) => void
  onSetDefault: (printerId: string) => void
  onToggleActive: (printerId: string) => void
  onTest: (printerId: string) => void
}

export interface EditShortcutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shortcut: KeyboardShortcut | null
  onSave: (shortcut: KeyboardShortcut) => void
}

export interface EditPrinterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  printer: PrinterConfig | null
  onSave: (printer: PrinterConfig) => void
}
