// Types for Electron Store Schema

export interface StoreInfo {
  name: string
  address: string
  phone: string
  email?: string
  website?: string
}

export interface FooterInfo {
  thankYouMessage: string
  returnMessage: string
}

export interface GeneralConfig {
  language: string
  theme: 'light' | 'dark' | 'system'
  autoStart: boolean
  autoUpdate: boolean
  storeInfo: StoreInfo
  footerInfo: FooterInfo
}

export interface PrinterSettings {
  printerName: string
  paperSize: '58mm' | '80mm' | '78mm' | '76mm' | '57mm' | '44mm'
  margin: string
  copies: number
  fontSize: number
  fontFamily: string
  lineHeight: number
  enableBold: boolean
}

export interface KeyboardShortcut {
  id: string
  name: string
  description: string
  keys: string[]
  action: string
  defaultKeys: string[]
  isCustom?: boolean
}

export interface StoreSchema {
  language?: string
  'settings.general'?: GeneralConfig
  'settings.keyboard'?: KeyboardShortcut[]
  'settings.printer'?: PrinterSettings
  'printer.settings'?: PrinterSettings
  [key: string]: unknown
}
